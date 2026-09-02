import { useState } from "react";
import "./Onboarding.css";

const STEPS = [
  {
    id: 1,
    title: "Welcome to AI-DMOS! 👋",
    description:
      "You've got four AI agents ready to go: Content, CEO, Meta Ads campaign creation, and AI optimization. This quick walkthrough shows you where to find each one - it takes about a minute.",
    tab: null,
  },
  {
    id: 2,
    title: "Upload Knowledge 📚",
    description:
      "Head to the Knowledge tab and add a document about your product, brand voice, or FAQ. Every AI agent (Content, CEO, campaign generation) reads from this to stay on-brand instead of generating generic copy.",
    tab: "knowledge",
  },
  {
    id: 3,
    title: "Connect Meta Ads 🎯",
    description:
      "The Meta Ads tab lets you connect your Meta Ads account. Once connected, you can generate a full campaign - ad copy, audience targeting, and a budget plan - and launch it as a real (paused) campaign on Meta.",
    tab: "meta-ads",
  },
  {
    id: 4,
    title: "Let AI Optimize While You Sleep 📊",
    description:
      "Once a campaign is live, click \"Optimize\" on it any time to have Claude review its performance and suggest budget, targeting, or bidding changes - one click to apply, one click to undo within 24 hours.",
    tab: "meta-ads",
  },
  {
    id: 5,
    title: "You're all set! 🎉",
    description: "Jump into the dashboard - you can always find these features again from the tabs above.",
    tab: null,
  },
];

export default function OnboardingFlow({ onFinish, onGoToTab }) {
  const [step, setStep] = useState(1);
  const current = STEPS.find((s) => s.id === step);
  const isLast = step === STEPS.length;

  function finish() {
    localStorage.setItem("onboardingComplete", "true");
    onFinish();
  }

  function visitTab() {
    if (current.tab) {
      localStorage.setItem("onboardingComplete", "true");
      onGoToTab(current.tab);
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {STEPS.map((s) => (
            <span key={s.id} className={`progress-dot ${s.id <= step ? "active" : ""}`} />
          ))}
        </div>

        <h2>{current.title}</h2>
        <p className="onboarding-description">{current.description}</p>

        <div className="onboarding-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          <button className="btn-skip" onClick={finish}>
            Skip walkthrough
          </button>
          {current.tab && (
            <button className="btn-secondary" onClick={visitTab}>
              Take me there →
            </button>
          )}
          <button className="btn-primary" onClick={() => (isLast ? finish() : setStep(step + 1))}>
            {isLast ? "Go to Dashboard" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
