import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

// ============================================================================
// MOCK DATA FALLBACK
// ============================================================================

const getMockDashboardData = () => ({
  success: true,
  student_profile: {
    studentId: "S101",
    skills: ["React", "JavaScript", "HTML", "CSS", "Node.js"],
    targetDomain: "Frontend Developer",
    totalApplications: 2,
  },
  placement_readiness_score: {
    overall_score: 82.4,
    cgpa_factor: 88.5,
    experience_factor: 78.3,
    skill_alignment: 81.2,
  },
  explainable_ai_reason: [
    "Excellent placement readiness score indicates strong career preparedness.",
    "Your skill set demonstrates solid technical foundation with modern frontend technologies.",
    "Priority skills to develop: TypeScript, Advanced React Patterns, and Testing Frameworks. These are highly valued in your target domain.",
    "Your skill set has an average alignment score of 0.750 with available opportunities.",
    "Next steps: Apply to recommended internships and focus on closing identified skill gaps through targeted learning.",
  ],
  skill_gaps: [
    {
      skill: "TypeScript",
      userLevel: 0.4,
      requiredLevel: 0.8,
      gap: 0.4,
    },
    {
      skill: "Testing",
      userLevel: 0.3,
      requiredLevel: 0.75,
      gap: 0.45,
    },
    {
      skill: "Performance",
      userLevel: 0.5,
      requiredLevel: 0.8,
      gap: 0.3,
    },
    {
      skill: "GraphQL",
      userLevel: 0.2,
      requiredLevel: 0.7,
      gap: 0.5,
    },
    {
      skill: "DevOps",
      userLevel: 0.1,
      requiredLevel: 0.6,
      gap: 0.5,
    },
    {
      skill: "React",
      userLevel: 0.9,
      requiredLevel: 0.85,
      gap: 0.0,
    },
    {
      skill: "JavaScript",
      userLevel: 0.85,
      requiredLevel: 0.8,
      gap: 0.0,
    },
    {
      skill: "CSS",
      userLevel: 0.8,
      requiredLevel: 0.75,
      gap: 0.0,
    },
  ],
  internship_recommendations: [
    {
      title: "Frontend Engineer Intern",
      company_name: "Google",
      category: "Software",
      location: "Mountain View, CA",
      match_score: 0.92,
      url: "https://careers.google.com",
      internship_id: "google_frontend_001",
      application_status: "Applied",
    },
    {
      title: "React Developer Intern",
      company_name: "Meta",
      category: "Software",
      location: "Menlo Park, CA",
      match_score: 0.88,
      url: "https://careers.meta.com",
      internship_id: "meta_react_001",
      application_status: "Open Opportunity",
    },
  ],
  analytics: {
    radar_data: [
      {
        skill: "TypeScript",
        userLevel: 0.4,
        requiredLevel: 0.8,
        gap: 0.4,
      },
      {
        skill: "Testing",
        userLevel: 0.3,
        requiredLevel: 0.75,
        gap: 0.45,
      },
      {
        skill: "Performance",
        userLevel: 0.5,
        requiredLevel: 0.8,
        gap: 0.3,
      },
      {
        skill: "GraphQL",
        userLevel: 0.2,
        requiredLevel: 0.7,
        gap: 0.5,
      },
      {
        skill: "React",
        userLevel: 0.9,
        requiredLevel: 0.85,
        gap: 0.0,
      },
    ],
    bar_data: [
      {
        role: "Frontend Engineer",
        velocity: 95.2,
      },
      {
        role: "Full Stack Developer",
        velocity: 87.6,
      },
      {
        role: "React Developer",
        velocity: 92.3,
      },
      {
        role: "UI/UX Engineer",
        velocity: 78.9,
      },
      {
        role: "Senior Frontend Engineer",
        velocity: 85.4,
      },
      {
        role: "Product Engineer",
        velocity: 81.2,
      },
      {
        role: "Web Developer",
        velocity: 88.7,
      },
    ],
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    requestDuration: 125,
  },
});

// ============================================================================
// ANALYTICS DASHBOARD COMPONENT
// ============================================================================

const AnalyticsDashboard = () => {
  // State Management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // ========================================================================
  // useEffect: Fetch dashboard data from gateway on component mount
  // ========================================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("[AnalyticsDashboard] Fetching dashboard data from gateway...");

        const response = await fetch(
          "http://127.0.0.1:5000/api/student/S101/dashboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Gateway responded with status ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Dashboard request failed");
        }

        console.log("[AnalyticsDashboard] Successfully fetched dashboard data");
        setDashboardData(data);
        setUsingMockData(false);

      } catch (err) {
        console.error("[AnalyticsDashboard] Error fetching dashboard:", {
          error: err.message,
          errorType: err.name,
        });

        // Fallback to mock data with user notification
        console.warn(
          "[AnalyticsDashboard] Gateway unavailable. Using mock data for demonstration."
        );
        setError(
          `Unable to reach gateway (${err.message}). Displaying demo data. Make sure the Express server is running on port 5000.`
        );
        setDashboardData(getMockDashboardData());
        setUsingMockData(true);

      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ========================================================================
  // Loading State UI
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 animate-spin">
            <div className="w-12 h-12 bg-slate-950 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">
            Loading Your Dashboard
          </h2>
          <p className="text-slate-400">Analyzing your profile and fetching AI recommendations...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-rose-400 mb-4">Error Loading Dashboard</h2>
          <p className="text-slate-300 mb-6">
            {error || "Unable to load dashboard data. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    student_profile,
    placement_readiness_score,
    explainable_ai_reason,
    skill_gaps,
    internship_recommendations,
    analytics,
  } = dashboardData;

  // ========================================================================
  // RENDER: Main Dashboard Layout
  // ========================================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-500 bg-clip-text text-transparent mb-2">
              Career Analytics Dashboard
            </h1>
            <p className="text-slate-400">
              Student ID: <span className="text-emerald-400 font-semibold">{student_profile.studentId}</span> | 
              Target Domain: <span className="text-indigo-400 font-semibold">{student_profile.targetDomain}</span>
            </p>
          </div>
          {usingMockData && (
            <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg px-4 py-2">
              <p className="text-amber-300 text-sm font-semibold">Demo Mode</p>
              <p className="text-amber-200 text-xs">Using mock data</p>
            </div>
          )}
        </div>
        {error && (
          <div className="bg-rose-900/20 border border-rose-500/50 rounded-lg p-3">
            <p className="text-rose-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Placement Readiness Score */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-emerald-500/30 rounded-lg p-6 hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-emerald-400">Placement Readiness</h2>
            <div className="text-4xl font-bold text-emerald-400">
              {placement_readiness_score.overall_score.toFixed(1)}%
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 text-sm">CGPA Factor</span>
                <span className="text-emerald-300 font-semibold">
                  {placement_readiness_score.cgpa_factor.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${placement_readiness_score.cgpa_factor}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 text-sm">Experience Factor</span>
                <span className="text-indigo-300 font-semibold">
                  {placement_readiness_score.experience_factor.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${placement_readiness_score.experience_factor}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 text-sm">Skill Alignment</span>
                <span className="text-cyan-300 font-semibold">
                  {placement_readiness_score.skill_alignment.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${placement_readiness_score.skill_alignment}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Explainable AI Insights */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-lg p-6 hover:border-indigo-500/60 transition-all">
          <h2 className="text-lg font-bold text-indigo-400 mb-4">AI Decision Path</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {explainable_ai_reason.map((reason, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 mt-1 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grid Row 1: Radar Chart - Skill Gap Analysis */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-emerald-500/30 rounded-lg p-6 hover:border-emerald-500/60 transition-all">
          <h2 className="text-lg font-bold text-emerald-400 mb-4">Skill Gap Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analytics.radar_data}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: "#cbd5e1" }} />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Radar
                name="Your Level"
                dataKey="userLevel"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Radar
                name="Required Level"
                dataKey="requiredLevel"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #10b981",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#10b981" }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Grid Row 2: Bar Chart - Trending Skills */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-lg p-6 hover:border-indigo-500/60 transition-all">
          <h2 className="text-lg font-bold text-indigo-400 mb-4">Market Trending Skills</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.bar_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="role"
                tick={{ fontSize: 10, fill: "#cbd5e1" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 10, fill: "#cbd5e1" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #6366f1",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#6366f1" }}
              />
              <Bar dataKey="velocity" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Grid: Skill Gaps and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gaps Badges */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-rose-500/30 rounded-lg p-6">
          <h2 className="text-lg font-bold text-rose-400 mb-4">Priority Skill Gaps</h2>
          <div className="flex flex-wrap gap-3">
            {skill_gaps.map((gap, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  gap.gap > 0.3
                    ? "bg-rose-900/40 border border-rose-500/60 text-rose-300"
                    : "bg-emerald-900/40 border border-emerald-500/60 text-emerald-300"
                }`}
              >
                <span>{gap.skill}</span>
                <span className="ml-2 text-xs opacity-75">
                  Gap: {(gap.gap * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Internship Recommendations */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-lg p-6">
          <h2 className="text-lg font-bold text-indigo-400 mb-4">Recommended Internships</h2>
          <div className="space-y-3">
            {internship_recommendations.map((internship, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 border border-indigo-500/20 rounded-lg p-4 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-indigo-300">{internship.title}</h3>
                    <p className="text-sm text-slate-400">{internship.company_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">
                      {(internship.match_score * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-slate-500">Match</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{internship.location}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        internship.application_status === "Applied"
                          ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/50"
                          : "bg-indigo-900/40 text-indigo-300 border border-indigo-500/50"
                      }`}
                    >
                      {internship.application_status}
                    </span>
                  </div>
                  <a
                    href={internship.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-slate-500 text-xs">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
