import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CompanySetup from "./components/company/CompanySetup";
import "./App.css";

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [companyId, setCompanyId] = useState(localStorage.getItem("companyId"));

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return showRegister ? (
      <Register onRegisterSuccess={() => setShowRegister(false)} />
    ) : (
      <Login onLoginSuccess={() => {}} />
    );
  }

  if (!companyId) {
    return (
      <CompanySetup
        onCompanyCreated={(data) => {
          setCompanyId(data.companyId);
        }}
      />
    );
  }

  return (
    <div className="dashboard">
      <h1>Welcome to AI-DMOS</h1>
      <p>Company ID: {companyId}</p>
      <p>Dashboard coming soon...</p>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("companyId");
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
