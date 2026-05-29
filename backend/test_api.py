import requests
import json


def test_recommendation_api():
    """
    Test the career recommendation API with a mock student request.
    Sends a POST request and displays the formatted response.
    """
    
    # API endpoint
    url = "http://127.0.0.1:8000/api/v1/recommend/dashboard"
    
    # Mock student request payload
    payload = {
        "student_id": 101,
        "skills": ["react", "javascript", "html", "css"],
        "target_domain": "Frontend Developer"
    }
    
    # Headers
    headers = {
        "Content-Type": "application/json"
    }
    
    print("=" * 80)
    print("CAREER RECOMMENDATION API TEST")
    print("=" * 80)
    print(f"\n📤 Sending POST request to: {url}")
    print(f"\n📋 Request Payload:")
    print(json.dumps(payload, indent=2))
    print("\n" + "-" * 80)
    
    try:
        # Send POST request
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        # Check if request was successful
        if response.status_code == 200:
            print("\n✅ SUCCESS - Status Code: 200\n")
            
            # Parse response
            data = response.json()
            
            print("=" * 80)
            print("📊 PLACEMENT READINESS SCORE")
            print("=" * 80)
            readiness = data.get("placement_readiness", {})
            print(f"Overall Score: {readiness.get('overall_score', 'N/A')}%")
            print(f"CGPA Factor: {readiness.get('cgpa_factor', 'N/A')}%")
            print(f"Experience Factor: {readiness.get('experience_factor', 'N/A')}%")
            print(f"Skill Alignment: {readiness.get('skill_alignment', 'N/A')}%")
            
            print("\n" + "=" * 80)
            print("💼 INTERNSHIP RECOMMENDATIONS (Top 2 Matches)")
            print("=" * 80)
            internships = data.get("internship_recommendations", [])
            for idx, internship in enumerate(internships, 1):
                print(f"\n{idx}. {internship.get('title', 'N/A')}")
                print(f"   Company: {internship.get('company_name', 'N/A')}")
                print(f"   Category: {internship.get('category', 'N/A')}")
                print(f"   Location: {internship.get('location', 'N/A')}")
                print(f"   Match Score: {internship.get('match_score', 'N/A'):.4f}")
                print(f"   URL: {internship.get('url', 'N/A')[:60]}...")
            
            print("\n" + "=" * 80)
            print("📈 SKILL GAP ANALYSIS (Radar Chart Data)")
            print("=" * 80)
            skill_gaps = data.get("skill_gap_analysis", [])
            print(f"\n{'Skill':<20} {'Your Level':<15} {'Required':<15} {'Gap':<10}")
            print("-" * 60)
            for gap in skill_gaps:
                skill = gap.get('skill', 'N/A')
                user_level = gap.get('user_level', 0)
                required = gap.get('required_level', 0)
                gap_val = gap.get('gap', 0)
                print(f"{skill:<20} {user_level:<15.2f} {required:<15.2f} {gap_val:<10.2f}")
            
            print("\n" + "=" * 80)
            print("🎯 TRENDING SKILLS (Bar Chart Data - Top 10)")
            print("=" * 80)
            trending = data.get("trending_skills_chart", [])
            for idx, trend in enumerate(trending[:10], 1):
                role = trend.get('role_title', 'N/A')
                velocity = trend.get('trending_velocity_score', 0)
                print(f"{idx:2d}. {role:<50} Velocity: {velocity:>6.2f}")
            
            print("\n" + "=" * 80)
            print("📥 FULL JSON RESPONSE")
            print("=" * 80)
            print(json.dumps(data, indent=2))
            
        else:
            print(f"\n❌ ERROR - Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the API server.")
        print("   Make sure the FastAPI server is running on http://127.0.0.1:8000")
        
    except requests.exceptions.Timeout:
        print("\n❌ ERROR: Request timeout. The API server took too long to respond.")
        
    except json.JSONDecodeError:
        print("\n❌ ERROR: Could not parse JSON response from the server.")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    test_recommendation_api()
