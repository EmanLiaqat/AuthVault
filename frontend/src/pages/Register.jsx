import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      setSuccess(response.data.message || "Account created successfully.");

      setTimeout(() => {
        navigate("/login", {
          state: { registeredEmail: form.email },
          replace: true
        });
      }, 900);
    } catch (requestError) {
      const data = requestError.response?.data;
      const validationMessage = data?.errors?.map((item) => item.message).join(". ");

      setError(
        validationMessage ||
          data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError("");
    setLoading(true);

    try {
      // 1. Trigger Firebase Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Extract the Firebase ID Token
      const idToken = await result.user.getIdToken();
      
      // 3. Send it to our backend for verification
      const response = await api.post("/auth/google", { idToken });
      const { token, user } = response.data;

      // 4. Log the user in and redirect
      login(token, user);
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Google sign-up error:", err);
      setError(
        err.response?.data?.message || err.message || "Google sign-up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your digital identity with AuthVault."
    >
      <div style={{ marginBottom: "20px" }}>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="button button-secondary button-full"
          style={{ backgroundColor: "#fff" }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0", color: "#9ca3af", fontSize: "13px" }}>
        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        or sign up with email
        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="status">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            minLength={2}
            maxLength={80}
            autoComplete="name"
            required
          />
        </div>

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
          <label htmlFor="password">Password</label>

          <div className="password-input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
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

          <span className="field-hint">
            Use at least 8 characters.
          </span>
        </div>

        <button
          className="button button-primary button-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  );
}