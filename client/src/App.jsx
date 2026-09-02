import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import CompanySetup from "./components/company/CompanySetup";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import Dashboard from "./components/dashboard/Dashboard";
import "./App.css";

function AppContent() {
  const { user, loading, login } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [companyId, setCompanyId] = useState(localStorage.getItem("companyId"));
  const [onboardingComplete, setOnboardingComplete] = useState(
    localStorage.getItem("onboardingComplete") === "true"
  );
  const [dashboardInitialTab, setDashboardInitialTab] = useState(null);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading...
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register onRegisterSuccess={login} onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLoginSuccess={login} onSwitchToRegister={() => setShowRegister(true)} />
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

  if (!onboardingComplete) {
    return (
      <OnboardingFlow
        onFinish={() => setOnboardingComplete(true)}
        onGoToTab={(tab) => {
          setDashboardInitialTab(tab);
          setOnboardingComplete(true);
        }}
      />
    );
  }

  return <Dashboard initialTab={dashboardInitialTab} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
