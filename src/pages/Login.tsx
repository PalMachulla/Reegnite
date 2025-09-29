import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();
  const { setCurrentView } = useGameStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login({ username, password });

      if (success) {
        setCurrentView("map");
        navigate("/map");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-primary-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-accent-500/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-game font-bold text-primary-400 mb-2">
            Welcome Back
          </h1>
          <p className="text-dark-300 font-display">
            Enter your credentials to start hunting
          </p>
        </div>

        {/* Login Form */}
        <div className="game-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="game-input w-full"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="game-input w-full"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-danger-500/20 border border-danger-500/30">
                <p className="text-danger-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="game-button w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner w-4 h-4"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Start Adventure"
              )}
            </button>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-6 p-3 rounded-lg bg-accent-500/20 border border-accent-500/30">
            <p className="text-accent-300 text-sm">
              <strong>Demo:</strong> Use credentials from your .env file
            </p>
            <p className="text-accent-400 text-xs mt-1">
              Default: admin / password
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-dark-400 text-sm">
            Secure authentication powered by environment variables
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
