import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserRole } from "../../context/UserContext";

const LoginPage: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("contributor");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ name, role });
    navigate("/board", { replace: true });
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        padding: 20,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            style={{ width: "100%", marginBottom: 10 }}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Role:
          <select
            style={{ width: "100%", marginBottom: 15 }}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="admin">Admin</option>
            <option value="contributor">Contributor</option>
          </select>
        </label>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#007bff",
            color: "#fff",
            padding: 10,
            border: "none",
            borderRadius: 4,
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
