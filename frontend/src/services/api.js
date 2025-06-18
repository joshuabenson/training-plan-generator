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
    const fetchPromise = fetch(`${API_BASE_URL}/preferences/${userId}`);
    const timeoutPromise = createTimeoutPromise(3000); // 3 second timeout
    
    try {
      // Race between the fetch and the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      
      return response.json();
    } catch (error) {
      if (error.message === 'COLD_START_TIMEOUT') {
        // Notify that cold start was detected
        if (onColdStartDetected) {
          onColdStartDetected();
        }
        
        // Continue waiting for the actual response
        const response = await fetchPromise;
        
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        
        return response.json();
      }
      
      throw error;
    }
  }
}; 