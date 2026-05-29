const axios = require("axios");
const mongoose = require("mongoose");

// ============================================================================
// MONGOOSE SCHEMA & MODEL (INLINE DEFINITION)
// ============================================================================

/**
 * Student Schema Definition
 * Stores student profile information including skills and internship applications
 */
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      description: "Array of student's technical and soft skills",
    },
    targetDomain: {
      type: String,
      required: true,
      description: "Career domain the student is targeting",
    },
    appliedInternships: {
      type: [String],
      default: [],
      description: "Array of internship IDs the student has applied to",
    },
  },
  {
    timestamps: true,
    collection: "students",
  }
);

// Create and export the Student model
const Student = mongoose.model("Student", studentSchema);

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const FASTAPI_BASE_URL = "http://127.0.0.1:8000";
const RECOMMEND_ENDPOINT = `${FASTAPI_BASE_URL}/api/v1/recommend/dashboard`;

// Default mock student for fallback when not found in database
const createMockStudent = (studentId) => ({
  studentId,
  skills: ["javascript", "react", "html", "css", "node.js"],
  targetDomain: "Frontend Developer",
  appliedInternships: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ============================================================================
// CONTROLLER: getStudentDashboard
// ============================================================================

/**
 * Main dashboard handler that retrieves student profile and AI recommendations.
 *
 * Flow:
 * 1. Extract studentId from request parameters
 * 2. Query MongoDB for student record (with fallback mock if not found)
 * 3. Call FastAPI engine with student's skills and target domain
 * 4. Map internship recommendations with application status
 * 5. Build explainable AI insights
 * 6. Format and return complete dashboard response
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStudentDashboard = async (req, res) => {
  try {
    // ========================================================================
    // STEP 1: Extract and validate student ID from request parameters
    // ========================================================================
    const { studentId } = req.params;

    if (!studentId || studentId.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Student ID is required in the request parameters",
        errorCode: "MISSING_STUDENT_ID",
      });
    }

    console.log(`[getStudentDashboard] Processing request for Student ID: ${studentId}`);

    // ========================================================================
    // STEP 2: Query MongoDB for student record
    // ========================================================================
    let studentProfile = await Student.findOne({ studentId });

    if (!studentProfile) {
      console.log(
        `[getStudentDashboard] Student ${studentId} not found in database. Using mock fallback.`
      );
      // Create and use mock student document
      studentProfile = createMockStudent(studentId);
    } else {
      console.log(`[getStudentDashboard] Successfully retrieved student ${studentId} from database`);
    }

    // ========================================================================
    // STEP 3: Call FastAPI AI Engine with student profile
    // ========================================================================
    console.log(`[getStudentDashboard] Calling FastAPI engine at ${RECOMMEND_ENDPOINT}`);

    const fastApiPayload = {
      student_id: parseInt(studentId, 10),
      skills: studentProfile.skills,
      target_domain: studentProfile.targetDomain,
    };

    console.log(
      `[getStudentDashboard] FastAPI Payload: ${JSON.stringify(fastApiPayload)}`
    );

    const aiResponse = await axios.post(RECOMMEND_ENDPOINT, fastApiPayload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000, // 15 second timeout
    });

    console.log("[getStudentDashboard] Successfully received AI recommendations from FastAPI");

    const aiData = aiResponse.data;

    // ========================================================================
    // STEP 4: Map internship recommendations with application status
    // ========================================================================
    const enrichedInternships = aiData.internship_recommendations.map(
      (internship) => {
        // Create a unique identifier for the internship
        const internshipId = `${internship.company_name}_${internship.title}`.replace(
          /\s+/g,
          "_"
        );

        // Check if student has already applied
        const hasApplied = studentProfile.appliedInternships.includes(internshipId);

        return {
          ...internship,
          internship_id: internshipId,
          application_status: hasApplied ? "Applied" : "Open Opportunity",
        };
      }
    );

    console.log(
      `[getStudentDashboard] Enriched ${enrichedInternships.length} internship recommendations with application status`
    );

    // ========================================================================
    // STEP 5: Build explainable AI insights
    // ========================================================================
    const buildExplainableAIReason = (placement, skillGaps, internships) => {
      const reasons = [];

      // Analyze placement readiness
      if (placement.overall_score >= 80) {
        reasons.push(
          "Excellent placement readiness score indicates strong career preparedness."
        );
      } else if (placement.overall_score >= 60) {
        reasons.push(
          "Solid placement potential with room for skill enhancement in targeted areas."
        );
      } else {
        reasons.push("Building career foundation - focus on skill gaps to improve placement chances.");
      }

      // Analyze skill gaps
      const criticalGaps = skillGaps.filter((gap) => gap.gap >= 0.5);
      if (criticalGaps.length > 0) {
        const topGapSkills = criticalGaps
          .slice(0, 3)
          .map((gap) => gap.skill)
          .join(", ");
        reasons.push(
          `Priority skills to develop: ${topGapSkills}. These are highly valued in your target domain.`
        );
      }

      // Analyze internship matches
      if (internships.length > 0) {
        const avgScore = (
          internships.reduce((sum, int) => sum + int.match_score, 0) / internships.length
        ).toFixed(3);
        reasons.push(
          `Your skill set has an average alignment score of ${avgScore} with available opportunities.`
        );
      }

      // Add recommendation
      reasons.push(
        "Next steps: Apply to recommended internships and focus on closing identified skill gaps."
      );

      return reasons;
    };

    const explainableAIReason = buildExplainableAIReason(
      aiData.placement_readiness,
      aiData.skill_gap_analysis,
      enrichedInternships
    );

    console.log("[getStudentDashboard] Generated explainable AI insights");

    // ========================================================================
    // STEP 6: Build analytics block for React UI (Recharts compatible)
    // ========================================================================
    const analyticsBlock = {
      radar_data: aiData.skill_gap_analysis.map((gap) => ({
        skill: gap.skill,
        userLevel: gap.user_level,
        requiredLevel: gap.required_level,
        gap: gap.gap,
      })),
      bar_data: aiData.trending_skills_chart.map((trend) => ({
        role: trend.role_title,
        velocity: trend.trending_velocity_score,
      })),
    };

    console.log("[getStudentDashboard] Generated analytics data for React UI");

    // ========================================================================
    // STEP 7: Build complete dashboard response
    // ========================================================================
    const dashboardResponse = {
      success: true,
      student_profile: {
        studentId: studentProfile.studentId,
        skills: studentProfile.skills,
        targetDomain: studentProfile.targetDomain,
        totalApplications: studentProfile.appliedInternships.length,
      },
      placement_readiness_score: aiData.placement_readiness,
      explainable_ai_reason: explainableAIReason,
      skill_gaps: aiData.skill_gap_analysis,
      internship_recommendations: enrichedInternships,
      analytics: analyticsBlock,
      metadata: {
        generatedAt: new Date().toISOString(),
        requestDuration: Date.now(),
      },
    };

    console.log("[getStudentDashboard] Dashboard response built successfully");

    // ========================================================================
    // Return successful response
    // ========================================================================
    return res.status(200).json(dashboardResponse);

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING: Comprehensive error handling with descriptive messages
    // ========================================================================

    console.error("[getStudentDashboard] Error occurred:", {
      errorMessage: error.message,
      errorCode: error.code,
      errorStatus: error.response?.status,
      errorData: error.response?.data,
      stack: error.stack,
    });

    let errorResponse = {
      success: false,
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred while processing your dashboard request.",
    };

    // Handle specific error types
    if (error.code === "ECONNREFUSED") {
      errorResponse = {
        success: false,
        errorCode: "FASTAPI_CONNECTION_FAILED",
        message:
          "Could not connect to the AI Engine. Please ensure the FastAPI server is running on port 8000.",
        details: "Connection refused at http://127.0.0.1:8000",
      };
      console.error("[getStudentDashboard] FastAPI connection failed");

    } else if (error.code === "ENOTFOUND") {
      errorResponse = {
        success: false,
        errorCode: "FASTAPI_HOST_NOT_FOUND",
        message:
          "Could not resolve the AI Engine hostname. Check your network configuration.",
        details: error.message,
      };
      console.error("[getStudentDashboard] FastAPI host not found");

    } else if (error.code === "ETIMEDOUT") {
      errorResponse = {
        success: false,
        errorCode: "FASTAPI_TIMEOUT",
        message:
          "The AI Engine request timed out. The server is taking too long to respond.",
        details: "Request exceeded 15 second timeout",
      };
      console.error("[getStudentDashboard] FastAPI request timeout");

    } else if (error.response?.status === 400) {
      errorResponse = {
        success: false,
        errorCode: "INVALID_REQUEST_TO_FASTAPI",
        message: "Invalid request sent to the AI Engine.",
        details: error.response.data?.detail || error.message,
      };
      console.error("[getStudentDashboard] Invalid FastAPI request");

    } else if (error.response?.status === 500) {
      errorResponse = {
        success: false,
        errorCode: "FASTAPI_SERVER_ERROR",
        message: "The AI Engine encountered an internal error.",
        details: error.response.data?.detail || "Server error occurred",
      };
      console.error("[getStudentDashboard] FastAPI server error");

    } else if (error.name === "MongooseError" || error.name === "MongoServerError") {
      errorResponse = {
        success: false,
        errorCode: "DATABASE_ERROR",
        message: "Could not access the student database.",
        details: error.message,
      };
      console.error("[getStudentDashboard] MongoDB error");

    } else if (error.message.includes("JSON")) {
      errorResponse = {
        success: false,
        errorCode: "JSON_PARSE_ERROR",
        message: "Could not parse response from the AI Engine.",
        details: error.message,
      };
      console.error("[getStudentDashboard] JSON parsing error");
    }

    // Return error response with appropriate status code
    const statusCode = error.response?.status || 500;
    return res.status(statusCode).json(errorResponse);
  }
};

// ============================================================================
// EXPORT CONTROLLER & MODEL
// ============================================================================

module.exports = {
  getStudentDashboard,
  Student,
};
