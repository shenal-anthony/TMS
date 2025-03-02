import axios from "axios";


export const loginUser = async (email, password) => {
  try {
      const response = await axios.post("http://localhost:8000/api/auth/login", { email, password });
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data.message : "Login failed";
  }
};

export const registerUser = async (userData) => {
  const response = await axios.post(
    "http://localhost:8000/api/auth/register",
    userData
  );
  return response.data;
};

export const getUserData = async () => {
  try {
    const token = localStorage.getItem("token"); // Get token from local storage
    const response = await axios.get("http://localhost:8000/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` }, // Send token for authentication
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data.message : "Failed to fetch user data";
  }
};