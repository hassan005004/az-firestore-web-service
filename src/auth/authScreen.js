// components/AuthScreen.js
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import authService from "../services/authService";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoadingRole(true);
        try {
          const role = await authService.fetchUserRole(firebaseUser.uid);
          setUserRole(role);
        } catch (e) {
          console.error("Error fetching role:", e);
          setUserRole("user");
        }
        setLoadingRole(false);
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignup = async () => {
    setError(null);
    setMessage(null);
    try {
      await authService.signup(email, password, role);
      setMessage("Account created!");
      setEmail("");
      setPassword("");
      setRole("user");
      setIsSignup(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    setError(null);
    try {
      await authService.login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await authService.googleLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: 10, width: 300 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: 10, width: 300 }}
        />
        {isSignup && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ display: "block", marginBottom: 20, width: 310 }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}
        {isSignup ? (
          <>
            <button onClick={handleSignup} style={{ marginRight: 10 }}>Sign Up</button>
            <button onClick={() => setIsSignup(false)}>Go to Login</button>
          </>
        ) : (
          <>
            <button onClick={handleLogin} style={{ marginRight: 10 }}>Login</button>
            <button onClick={() => setIsSignup(true)}>Go to Sign Up</button>
          </>
        )}
        <div style={{ marginTop: 20 }}>
          <button onClick={handleGoogleLogin}>Login with Google</button>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
      </div>
    );
  }

  if (loadingRole) return <p>Loading role...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user.email}</h2>
      <p>Your role: <b>{userRole}</b></p>
      {userRole === "admin" ? (
        <div style={{ color: "green" }}>
          <h3>Admin Dashboard</h3>
          <p>You have admin access.</p>
        </div>
      ) : (
        <div style={{ color: "blue" }}>
          <h3>User Dashboard</h3>
          <p>You have user access.</p>
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
