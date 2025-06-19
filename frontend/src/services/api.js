const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create a promise that rejects after a specified timeout
const createTimeoutPromise = (timeout) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('COLD_START_TIMEOUT')), timeout);
  });
};

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

  // Get user preferences with cold start detection
  getPreferences: async (userId, onColdStartDetected) => {
    // Show cold start loading immediately
    if (onColdStartDetected) {
      onColdStartDetected();
    }
    
    const response = await fetch(`${API_BASE_URL}/preferences/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }
    
    return response.json();
  }
}; 