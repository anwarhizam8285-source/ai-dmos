import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CompanySetup from "./components/company/CompanySetup";
import Dashboard from "./components/dashboard/Dashboard";
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

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
