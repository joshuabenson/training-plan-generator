const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const preferencesAPI = {
  // Save user preferences
  savePreferences: async (userId, preferences) => {
    const response = await fetch(`${API_BASE_URL}/save-preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...preferences
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save preferences');
    }
    
    return response.json();
  },

  // Get user preferences
  getPreferences: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/preferences/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }
    
    return response.json();
  }
}; 