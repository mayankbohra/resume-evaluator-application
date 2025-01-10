const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const analyzeResume = async (formData) => {
  try {
    // console.log('API URL:', API_URL);
    // console.log('Request sent to:', `${API_URL}/analyze`);

    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    // console.log('Response status:', response.status);

    const data = await response.json();
    // console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.detail || 'Network response was not ok');
    }

    // Validate the response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
