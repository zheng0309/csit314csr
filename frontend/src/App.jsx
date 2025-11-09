import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import "./App.css";
import CSRDashboard from "/src/CSRDashboard.jsx";
import PINDashboard from "/src/PINDashboard.jsx";
import PMDashboard from "/src/PMDashboard.jsx";
import ViewDetails from "/src/viewDetails.jsx";
import AdminDashboardV2 from "/src/AdminDashboardV2.jsx";

function ProtectedRoute({ children, allowed }) {
  // Check role-specific keys first, then fallback to generic 'user' key
  // This prevents cross-tab interference when multiple dashboards are open
  let raw = null;
  if (typeof window !== "undefined") {
    if (allowed?.includes("pin")) {
      raw = localStorage.getItem("pin_user") || localStorage.getItem("user");
    } else if (allowed?.includes("csr_rep")) {
      raw = localStorage.getItem("csr_user") || localStorage.getItem("user");
    } else if (allowed?.includes("platform_manager")) {
      raw = localStorage.getItem("pm_user") || localStorage.getItem("user");
    } else {
      raw = localStorage.getItem("user");
    }
  }
  const user = raw ? JSON.parse(raw) : null;

  if (!user) {
    return <LoginPage />;
  }

  if (allowed && !allowed.includes(user.role)) {
    return <LoginPage />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/pindashboard"
          element={
            <ProtectedRoute allowed={["pin"]}>
              <PINDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pmdashboard"
          element={
            <ProtectedRoute allowed={["platform_manager"]}>
              <PMDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminDashboardV2 />
            </ProtectedRoute>
          }
        />
        <Route path="/csrdashboard" element={<CSRDashboard />} />
        <Route path="/requests/:id" element={<ViewDetails />} />
      </Routes>
    </Router>
  );
}

function LoginPage() {
  return (
    <div className="app-root">
      <div className="orb orb-left" />
      <div className="orb orb-right" />
      <div className="app-center">
        <LoginCard />
      </div>
    </div>
  );
}

function LoginCard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validate = () => {
    let ok = true;
    const next = { email: "", password: "" };
    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) {
      next.email = "Enter a valid email.";
      ok = false;
    }
    if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
      ok = false;
    }
    setErrors(next);
    return ok;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({ email: "", password: "" });

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Login successful! Welcome ${data.user.name}`);

        // Save user info in role-specific localStorage keys to prevent cross-tab interference
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "pin") {
          localStorage.setItem("pin_user", JSON.stringify(data.user));
        } else if (data.user.role === "csr_rep") {
          localStorage.setItem("csr_user", JSON.stringify(data.user));
        } else if (data.user.role === "platform_manager") {
          localStorage.setItem("pm_user", JSON.stringify(data.user));
        } else if (data.user.role === "admin") {
          localStorage.setItem("admin_user", JSON.stringify(data.user));
        }

        // ✅ Redirect based on role
        if (data.user.role === "pin") {
          navigate("/pindashboard");
        } else if (data.user.role === "platform_manager") {
          navigate("/pmdashboard");
        } else if (data.user.role === "admin") {
          navigate("/admindashboard");
        } else if (data.user.role === "csr_rep") {
          navigate("/csrdashboard");
        } else {
          alert("⚠️ Unknown role, staying on login page.");
        }
      } else {
        setErrors({ ...errors, password: data.error || "Login failed" });
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Could not connect to the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = Math.min(100, password.length * 12.5);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="card"
      aria-label="Login"
    >
      <div className="card-header">
        <div className="logo">
          <ShieldCheck className="icon" />
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to continue to your dashboard</p>
      </div>

      <div className="card-body">
        <form onSubmit={onSubmit} className="form" noValidate>
          {/* Email */}
          <label className="field" htmlFor="email">
            <span className="label">Email</span>
            <div className={`control ${errors.email ? "is-error" : ""}`}>
              <Mail className="field-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            {errors.email && <p className="error">{errors.email}</p>}
          </label>

          {/* Password */}
          <label className="field" htmlFor="password">
            <span className="label">Password</span>
            <div className={`control ${errors.password ? "is-error" : ""}`}>
              <Lock className="field-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="ghost-btn"
              >
                {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
              </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}

            {/* Strength meter */}
            <div className="strength">
              <div
                className={`bar ${
                  strength < 40 ? "weak" : strength < 70 ? "okay" : "strong"
                }`}
                style={{ width: `${Math.max(8, strength)}%` }}
              />
            </div>
          </label>

          <div className="row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="link">
              Forgot password?
            </a>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="primary-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spin icon" />
                Signing in…
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="icon" />
              </>
            )}
          </motion.button>

          <div className="divider">or</div>

          <button
            type="button"
            onClick={() => alert("OAuth demo: connect your provider")}
            className="secondary-btn"
          >
            <Github className="icon" />
            Continue with GitHub
          </button>
        </form>

        <p className="footnote">
          Don’t have an account?{" "}
          <a href="#create" className="link">
            Create one
          </a>
        </p>
      </div>
    </motion.section>
  );
}
