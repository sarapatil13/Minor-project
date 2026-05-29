// Frontend API utility for achievements
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const achievementAPI = {
  // Create achievement
  async createAchievement(data) {
    const response = await fetch(`${API_URL}/achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create achievement');
    return response.json();
  },

  // Get all achievements
  async getAllAchievements(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.department) queryParams.append('department', params.department);

    const response = await fetch(`${API_URL}/achievements?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return response.json();
  },

  // Get achievement by ID
  async getAchievementById(id) {
    const response = await fetch(`${API_URL}/achievements/${id}`);
    if (!response.ok) throw new Error('Failed to fetch achievement');
    return response.json();
  },

  // Get achievements by USN
  async getAchievementsByUSN(usn) {
    const response = await fetch(`${API_URL}/achievements/usn/${usn}`);
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return response.json();
  },

  // Update achievement
  async updateAchievement(id, data) {
    const response = await fetch(`${API_URL}/achievements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update achievement');
    return response.json();
  },

  // Delete achievement
  async deleteAchievement(id) {
    const response = await fetch(`${API_URL}/achievements/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete achievement');
    return response.json();
  },

  // Approve achievement
  async approveAchievement(id, adminId) {
    const response = await fetch(`${API_URL}/achievements/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adminId }),
    });
    if (!response.ok) throw new Error('Failed to approve achievement');
    return response.json();
  },

  // Reject achievement
  async rejectAchievement(id, rejectionReason) {
    const response = await fetch(`${API_URL}/achievements/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rejectionReason }),
    });
    if (!response.ok) throw new Error('Failed to reject achievement');
    return response.json();
  },

  // Get dashboard statistics
  async getDashboardStats() {
    const response = await fetch(`${API_URL}/achievements/stats/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  },
};
