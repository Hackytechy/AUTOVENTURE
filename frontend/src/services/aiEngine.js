// Real AI Backend Integration
// Optimized for macOS and different browser environments

// Dynamically match the backend URL to the current host (localhost or 127.0.0.1)
const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://autoventure.onrender.com"
    : "http://localhost:5001";


export const simulateAnalysis = async (inputs) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error');
    }

    const data = await response.json();
    return data;

  } catch (err) {
    console.error('Frontend AI Service Error:', err);

    // If the error was thrown manually (e.g., from response.ok check above), re-throw it
    // Otherwise, it's a network/connectivity error
    if (err.message && !err.message.toLocaleLowerCase().includes('failed to fetch')) {
      throw err;
    }

    throw new Error(`Failed to connect to the backend AI server at ${BACKEND_URL}. Please make sure the server is running on port 5001.`);
  }
};
