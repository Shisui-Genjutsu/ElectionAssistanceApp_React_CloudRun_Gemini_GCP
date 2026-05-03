import { useNavigate } from "react-router";
import type { AppContext, RouteId } from "../types";

// Route: /onboarding
// Full-screen onboarding — no shell layout
import { Onboarding } from "../components/Onboarding";

export default function OnboardingRoute() {
  const navigate = useNavigate();

  const handleDone = (res: AppContext & { startAt: RouteId }) => {
    const { startAt, ...ctx } = res;
    localStorage.setItem("saksham_ctx", JSON.stringify(ctx));
    const pathMap: Record<RouteId, string> = {
      home: "/",
      timeline: "/timeline",
      chat: "/chat",
      rescue: "/rescue",
      booth: "/booth",
      dates: "/dates",
    };
    navigate(pathMap[startAt] || "/");
  };

  return <Onboarding onDone={handleDone} />;
}
