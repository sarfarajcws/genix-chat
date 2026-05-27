import { useState } from "react";

import Input from "../components/Input";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import { toast } from "sonner";

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";

      const response = await api.post(endpoint, {
        username,
        password,
      });

      // LOGIN

      if (isLogin) {
        localStorage.setItem("token", response.data.token);

        localStorage.setItem("username", response.data.user.username);

        toast.success(`Welcome back, ${response.data.user.username}`);

        navigate("/dashboard");
      }

      // SIGNUP
      else {
        toast.success("Account created successfully");

        toast.info("Now login with your credentials");

        setIsLogin(true);

        setPassword("");
      }
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-white text-4xl font-bold text-center mb-2">
          WeChat
        </h1>

        <p className="text-zinc-400 text-center mb-8">Private realtime rooms</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="
              w-full
              bg-white
              text-black
              font-semibold
              py-3
              rounded-xl
              hover:opacity-90
              transition
            "
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-zinc-400 text-sm text-center mt-6">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white ml-2"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
