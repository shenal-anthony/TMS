import axios from "axios";

export const loginUser = async (userData) => {
  const response = await axios.post(
    "http://localhost:8000/api/auth/login",
    userData
  );
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(
    "http://localhost:8000/api/auth/register",
    userData
  );
  return response.data;
};
