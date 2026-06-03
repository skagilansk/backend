const axios = require('axios');

const BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'https://t4e-testserver.onrender.com/api';

/**
 * Fetch dataset from the external private API.
 * If no real API is configured, returns mock data for development.
 */
const fetchExternalData = async (token) => {
  try {
    // If no token provided, try to obtain one using student credentials
    let authToken = token;

    if (!authToken) {
      const studentId = process.env.STUDENT_ID;
      const password = process.env.STUDENT_PASSWORD;

      if (studentId && password) {
        const tokenResponse = await axios.post(`${BASE_URL}/public/token`, {
          studentId,
          password,
        });
        authToken = tokenResponse.data.token;
      }
    }

    if (!authToken) {
      // Return mock data for development when no token is available
      console.log('No token available - returning mock issue data for development');
      return getMockData();
    }

    // Fetch private data using token
    const response = await axios.get(`${BASE_URL}/private/data`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('External API error:', error.response?.data?.message || error.message);
    // Fall back to mock data if external API fails
    console.log('Falling back to mock issue data');
    return getMockData();
  }
};

/**
 * Mock data for development/testing when external API is unavailable
 */
const getMockData = () => {
  return [
    { id: 'ISS001', title: 'Login page crashes on mobile', description: 'The login page throws a white screen error on iOS Safari', status: 'open', priority: 'critical', assignee: 'John Doe', reporter: 'Jane Smith', tags: ['frontend', 'mobile'] },
    { id: 'ISS002', title: 'Database connection timeout', description: 'MongoDB connection drops after 30 minutes of inactivity', status: 'in-progress', priority: 'high', assignee: 'Alice Johnson', reporter: 'Bob Wilson', tags: ['backend', 'database'] },
    { id: 'ISS003', title: 'Update user profile API', description: 'Add endpoint to allow users to update their profile information', status: 'open', priority: 'medium', assignee: 'Charlie Brown', reporter: 'Diana Prince', tags: ['backend', 'api'] },
    { id: 'ISS004', title: 'Fix CSS alignment on dashboard', description: 'Stats cards are misaligned on screens smaller than 768px', status: 'closed', priority: 'low', assignee: 'Eve Adams', reporter: 'Frank Castle', tags: ['frontend', 'css'] },
    { id: 'ISS005', title: 'Add search functionality', description: 'Implement full-text search across issue titles and descriptions', status: 'open', priority: 'high', assignee: 'Grace Hopper', reporter: 'Henry Ford', tags: ['frontend', 'backend'] },
    { id: 'ISS006', title: 'Implement rate limiting', description: 'Add rate limiting middleware to prevent API abuse', status: 'open', priority: 'medium', assignee: 'Ivan Petrov', reporter: 'Julia Roberts', tags: ['backend', 'security'] },
    { id: 'ISS007', title: 'Memory leak in notification service', description: 'The notification WebSocket handler leaks memory over time', status: 'in-progress', priority: 'critical', assignee: 'Kevin Hart', reporter: 'Lisa Simpson', tags: ['backend', 'performance'] },
    { id: 'ISS008', title: '', description: 'Invalid issue with no title', status: 'open', priority: 'low', assignee: '', reporter: '', tags: [] }, // Should be rejected by validation
    { id: 'ISS001', title: 'Login page crashes on mobile', description: 'Duplicate entry', status: 'open', priority: 'critical', assignee: 'John Doe', reporter: 'Jane Smith', tags: ['frontend'] }, // Duplicate
    { id: 'ISS009', title: 'Optimize image loading', description: 'Implement lazy loading for images in the gallery view', status: 'closed', priority: 'medium', assignee: 'Mike Johnson', reporter: 'Nancy Drew', tags: ['frontend', 'performance'] },
  ];
};

module.exports = {
  fetchExternalData,
};
