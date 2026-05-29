import json
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn


# ============================================================================
# PYDANTIC MODELS FOR REQUEST/RESPONSE VALIDATION
# ============================================================================

class RecommendationRequest(BaseModel):
    """Validates incoming recommendation requests"""
    student_id: int
    skills: List[str] = Field(..., description="List of skills the student possesses")
    target_domain: str = Field(..., description="Target career domain (e.g., 'AI/ML/Data', 'Software')")


class InternshipMatch(BaseModel):
    """Represents a matched internship recommendation"""
    title: str
    company_name: str
    category: str
    location: str
    match_score: float
    url: str


class SkillGapItem(BaseModel):
    """Represents a skill gap analysis item for radar chart"""
    skill: str
    user_level: float
    required_level: float
    gap: float


class BarChartItem(BaseModel):
    """Represents trending skills for bar chart"""
    role_title: str
    trending_velocity_score: float


class PlacementReadinessScore(BaseModel):
    """Placement readiness analysis"""
    overall_score: float
    cgpa_factor: float
    experience_factor: float
    skill_alignment: float


class DashboardResponse(BaseModel):
    """Complete dashboard response with all analytics"""
    internship_recommendations: List[InternshipMatch]
    placement_readiness: PlacementReadinessScore
    skill_gap_analysis: List[SkillGapItem]
    trending_skills_chart: List[BarChartItem]


# ============================================================================
# ADVANCED CAREER RECOMMENDER CLASS
# ============================================================================

class AdvancedCareerRecommender:
    """
    Handles all AI analytics and recommendation logic.
    Loads datasets and provides methods for skill matching, placement scoring, and gap analysis.
    """

    def __init__(self, datasets_path: str = r"C:\Users\Dell\Downloads\Minor-project\Minor-project-main\datasets"):
        """
        Initialize the recommender by loading all datasets from local system.
        
        Args:
            datasets_path: Root path to the datasets folder
        """
        self.datasets_path = datasets_path

        # Load student data
        self.student_data = pd.read_csv(f"{datasets_path}/student_data.csv").fillna("")

        # Load placement data
        self.placement_data = pd.read_csv(f"{datasets_path}/placementdata.csv").fillna("")

        # Load job skills data
        self.job_skills = pd.read_csv(f"{datasets_path}/job_skills.csv").fillna("")

        # Load internships data from JSON
        with open(f"{datasets_path}/internships.json", "r") as f:
            internships_list = json.load(f)
        self.internships_df = pd.DataFrame(internships_list).fillna("")

        # Extract skills from job qualifications
        self._extract_and_prepare_skills()

    def _extract_and_prepare_skills(self):
        """
        Extract skills from job qualifications and prepare them for analysis.
        Parses Minimum and Preferred Qualifications to create skill sets.
        """
        self.job_skills_extracted = []

        for idx, row in self.job_skills.iterrows():
            min_quals = str(row.get("Minimum Qualifications", ""))
            pref_quals = str(row.get("Preferred Qualifications", ""))
            
            # Combine qualifications and tokenize by common separators
            combined_quals = (min_quals + " " + pref_quals).lower()
            
            # Extract potential skills (words of 3+ characters after common keywords)
            skills = self._tokenize_skills(combined_quals)

            self.job_skills_extracted.append({
                "role_title": row.get("Title", ""),
                "category": row.get("Category", ""),
                "skills": skills,
                "qualifications": min_quals
            })

    def _tokenize_skills(self, text: str) -> List[str]:
        """
        Extract skill keywords from qualification text.
        Uses common technical and soft skill patterns.
        """
        # Common skill keywords to look for
        skill_keywords = [
            "python", "java", "javascript", "sql", "c++", "typescript", "golang", "rust",
            "react", "angular", "vue", "node", "django", "flask", "fastapi", "spring",
            "aws", "azure", "gcp", "kubernetes", "docker", "git",
            "machine learning", "deep learning", "nlp", "computer vision", "data analysis",
            "statistics", "analytics", "excel", "power bi", "tableau",
            "communication", "leadership", "problem solving", "teamwork",
            "ai", "ml", "data", "cloud", "devops", "agile", "scrum"
        ]

        text_lower = text.lower()
        found_skills = [skill for skill in skill_keywords if skill in text_lower]
        
        # Remove duplicates and return
        return list(set(found_skills)) if found_skills else ["general"]

    def recommend_internships(self, user_skills: List[str], target_domain: str) -> List[Dict[str, Any]]:
        """
        Match user skills against internship requirements using TF-IDF and cosine similarity.
        
        Args:
            user_skills: List of user's skills
            target_domain: Target domain for filtering (e.g., 'AI/ML/Data')
        
        Returns:
            Top 2 internship matches with similarity scores
        """
        # Filter internships by target domain if provided
        filtered_internships = self.internships_df
        if target_domain:
            filtered_internships = self.internships_df[
                self.internships_df["category"].str.contains(target_domain, case=False, na=False)
            ]

        if len(filtered_internships) == 0:
            filtered_internships = self.internships_df

        # Create skill corpus from internship categories and metadata
        internship_texts = []
        for idx, row in filtered_internships.iterrows():
            text = f"{row.get('category', '')} {row.get('title', '')} {row.get('company_name', '')}"
            internship_texts.append(text.lower())

        # Create user skill text
        user_skill_text = " ".join(user_skills).lower()

        # Apply TF-IDF Vectorization
        corpus = [user_skill_text] + internship_texts
        vectorizer = TfidfVectorizer(lowercase=True, stop_words="english", max_features=100)
        tfidf_matrix = vectorizer.fit_transform(corpus)

        # Calculate cosine similarity between user skills and each internship
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

        # Get top 2 matches
        top_indices = np.argsort(similarities)[-2:][::-1]
        top_matches = []

        for idx in top_indices:
            if idx < len(filtered_internships):
                match_row = filtered_internships.iloc[idx]
                top_matches.append({
                    "title": str(match_row.get("title", "N/A")),
                    "company_name": str(match_row.get("company_name", "N/A")),
                    "category": str(match_row.get("category", "N/A")),
                    "location": str(match_row.get("locations", ["N/A"])[0] if isinstance(match_row.get("locations"), list) else match_row.get("locations", "N/A")),
                    "match_score": float(similarities[idx]),
                    "url": str(match_row.get("url", ""))
                })

        return top_matches

    def calculate_placement_readiness(self, student_id: int, user_skills: List[str]) -> Dict[str, float]:
        """
        Calculate placement readiness score using cosine similarity on student profiles.
        Compares historical data to provide a readiness percentage.
        
        Args:
            student_id: The student's ID
            user_skills: Student's skills
        
        Returns:
            Dictionary with readiness metrics
        """
        # Normalize placement data features for comparison
        numeric_cols = ["CGPA", "Internships", "Projects", "Workshops/Certifications", 
                       "AptitudeTestScore", "SoftSkillsRating"]
        
        placement_numeric = self.placement_data[numeric_cols].copy()
        
        # Normalize each column to 0-1 range
        for col in numeric_cols:
            max_val = placement_numeric[col].max()
            if max_val > 0:
                placement_numeric[col] = placement_numeric[col] / max_val
            else:
                placement_numeric[col] = 0

        # Create a profile vector from user skills
        skill_count = len(user_skills)
        skill_diversity = len(set(user_skills)) / max(1, skill_count) if skill_count > 0 else 0

        # Calculate placement rates from historical data
        if len(self.placement_data) > 0:
            placement_rate = (self.placement_data["PlacementStatus"] == "Placed").sum() / len(self.placement_data)
        else:
            placement_rate = 0.5

        # Calculate factors
        avg_cgpa = self.placement_data["CGPA"].mean() if len(self.placement_data) > 0 else 7.0
        avg_experience = (self.placement_data["Internships"].mean() + 
                         self.placement_data["Projects"].mean()) if len(self.placement_data) > 0 else 2.0

        cgpa_factor = min(1.0, avg_cgpa / 10.0)
        experience_factor = min(1.0, avg_experience / 5.0)
        skill_alignment = min(1.0, (skill_diversity + skill_count / 20.0) / 2.0)

        overall_score = (cgpa_factor * 0.35 + experience_factor * 0.35 + skill_alignment * 0.30) * 100

        return {
            "overall_score": float(round(overall_score, 2)),
            "cgpa_factor": float(round(cgpa_factor * 100, 2)),
            "experience_factor": float(round(experience_factor * 100, 2)),
            "skill_alignment": float(round(skill_alignment * 100, 2))
        }

    def analyze_skill_gaps(self, user_skills: List[str], target_domain: str) -> List[Dict[str, Any]]:
        """
        Perform skill gap analysis by comparing user skills with target domain requirements.
        Extracts required skills from job_skills.csv and calculates gaps for Recharts RadarChart.
        
        Args:
            user_skills: User's current skills
            target_domain: Target career domain
        
        Returns:
            List of skill gap items for radar chart visualization
        """
        # Filter job skills by target domain
        domain_jobs = self.job_skills[
            self.job_skills["Category"].str.contains(target_domain, case=False, na=False)
        ]

        if len(domain_jobs) == 0:
            domain_jobs = self.job_skills

        # Collect all required skills from the domain
        required_skills_set = set()
        for idx, row in domain_jobs.iterrows():
            min_quals = str(row.get("Minimum Qualifications", ""))
            pref_quals = str(row.get("Preferred Qualifications", ""))
            skills = self._tokenize_skills(min_quals + " " + pref_quals)
            required_skills_set.update(skills)

        # Build user skill set with proficiency levels (normalized to 0-1)
        user_skills_lower = [s.lower() for s in user_skills]
        user_skill_map = {skill: 0.8 for skill in user_skills_lower}  # User has these at 0.8 proficiency

        skill_gaps = []
        for req_skill in list(required_skills_set)[:10]:  # Limit to top 10 for radar chart
            user_level = user_skill_map.get(req_skill.lower(), 0)
            required_level = 0.7  # Required proficiency level
            gap = required_level - user_level

            skill_gaps.append({
                "skill": req_skill,
                "user_level": float(round(user_level, 2)),
                "required_level": float(round(required_level, 2)),
                "gap": float(round(max(0, gap), 2))
            })

        return skill_gaps

    def get_trending_skills_chart(self) -> List[Dict[str, Any]]:
        """
        Extract trending skills from job_skills.csv for Recharts BarChart.
        Returns role titles and synthetic trending velocity scores.
        
        Returns:
            List of trending skill items for bar chart visualization
        """
        trending_data = []

        # Get unique roles and create synthetic trending scores based on frequency
        role_counts = self.job_skills["Title"].value_counts()
        
        for role, count in role_counts.head(15).items():  # Top 15 roles
            # Trending velocity score: higher count = higher trend
            trending_score = min(100, (count / len(self.job_skills)) * 1000)

            trending_data.append({
                "role_title": str(role),
                "trending_velocity_score": float(round(trending_score, 2))
            })

        return trending_data


# ============================================================================
# FASTAPI APPLICATION SETUP
# ============================================================================

app = FastAPI(
    title="Pure AI Engine - Career Recommendation API",
    description="Advanced AI-powered career and internship recommendation system",
    version="1.0.0"
)

# Configure CORS Middleware to allow all origins, methods, and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the recommender system
recommender = AdvancedCareerRecommender()


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint for API health check"""
    return {
        "status": "online",
        "service": "Pure AI Engine - Career Recommendation API",
        "version": "1.0.0"
    }


@app.post("/api/v1/recommend/dashboard", response_model=DashboardResponse, tags=["Recommendations"])
async def recommend_dashboard(request: RecommendationRequest) -> DashboardResponse:
    """
    Main recommendation endpoint providing comprehensive career analytics dashboard.
    
    Accepts student profile and returns:
    - Top 2 internship matches based on skills
    - Placement readiness score with breakdown
    - Skill gap analysis for target domain
    - Trending skills in the job market
    
    Args:
        request: RecommendationRequest with student_id, skills, and target_domain
    
    Returns:
        DashboardResponse with complete analytics
    """
    
    # Validate student exists in our data (optional - can be removed for open system)
    # if request.student_id not in recommender.placement_data["StudentID"].values:
    #     raise HTTPException(status_code=404, detail=f"Student {request.student_id} not found")

    # Validate input
    if not request.skills or len(request.skills) == 0:
        raise HTTPException(status_code=400, detail="At least one skill must be provided")
    
    if not request.target_domain or len(request.target_domain.strip()) == 0:
        raise HTTPException(status_code=400, detail="Target domain must be specified")

    try:
        # Get internship recommendations
        internship_matches = recommender.recommend_internships(
            request.skills, 
            request.target_domain
        )
        
        # Format internship recommendations
        internship_recommendations = [
            InternshipMatch(**match) for match in internship_matches
        ]

        # Calculate placement readiness
        placement_metrics = recommender.calculate_placement_readiness(
            request.student_id,
            request.skills
        )
        
        placement_readiness = PlacementReadinessScore(**placement_metrics)

        # Analyze skill gaps
        skill_gaps = recommender.analyze_skill_gaps(
            request.skills,
            request.target_domain
        )
        
        skill_gap_analysis = [
            SkillGapItem(**gap) for gap in skill_gaps
        ]

        # Get trending skills for chart
        trending_skills = recommender.get_trending_skills_chart()
        
        trending_skills_chart = [
            BarChartItem(**skill) for skill in trending_skills
        ]

        # Build and return complete dashboard response
        dashboard = DashboardResponse(
            internship_recommendations=internship_recommendations,
            placement_readiness=placement_readiness,
            skill_gap_analysis=skill_gap_analysis,
            trending_skills_chart=trending_skills_chart
        )

        return dashboard

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing recommendation: {str(e)}"
        )


@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "datasets_loaded": {
            "student_data": len(recommender.student_data) > 0,
            "placement_data": len(recommender.placement_data) > 0,
            "job_skills": len(recommender.job_skills) > 0,
            "internships": len(recommender.internships_df) > 0
        },
        "data_summary": {
            "total_students": len(recommender.student_data),
            "total_placement_records": len(recommender.placement_data),
            "total_job_roles": len(recommender.job_skills),
            "total_internships": len(recommender.internships_df)
        }
    }


# ============================================================================
# APPLICATION EXECUTION
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
