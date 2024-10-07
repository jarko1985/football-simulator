import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://football-simulator-backend.onrender.com/api/auth/login",
        formData,
        {
          withCredentials: true,
        }
      );
      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response.data);
      alert(err.response.data.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-10 bg-white rounded-lg shadow-md"
      >
        <h2 className="mb-5 text-center text-2xl font-bold">Log In</h2>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-3 p-3 border border-gray-300 rounded"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-3 p-3 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
