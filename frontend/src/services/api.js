const API_URL = import.meta.env.BACKEND_API_URL;

export const analyzeResume = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Network response was not ok');
    }

    // Validate the response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    if (!data["Evaluating Score"] || !data["Evaluating Statement"] || !Array.isArray(data.Suggestions)) {
      throw new Error('Missing required fields in response');
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
