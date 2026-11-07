import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: location.state?.registeredEmail || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(
    new URLSearchParams(location.search).get("session") === "expired"
      ? "Your session expired. Please sign in again."
      : ""
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      const { token, user } = response.data;

      if (!token) {
        throw new Error("The server did not return an authentication token.");
      }

      login(token, user);
      navigate("/profile", { replace: true });
    } catch (requestError) {
      const data = requestError.response?.data;
      const validationMessage = data?.errors?.map((item) => item.message).join(". ");

      setError(
        validationMessage ||
          data?.message ||
          requestError.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your secure profile."
    >
      {location.state?.registeredEmail && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 size={18} />
          Account created. You can sign in now.
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>

        <div className="form-field">
          <div className="label-row">
            <label htmlFor="password">Password</label>
          </div>

          <div className="password-input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              maxLength={72}
              required
            />

            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        <button
          className="button button-primary button-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="auth-switch">
        Don't have an account? <Link to="/register">Create one</Link>
      </div>
    </AuthLayout>
  );
}