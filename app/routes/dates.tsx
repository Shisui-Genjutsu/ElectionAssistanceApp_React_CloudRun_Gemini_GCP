import { useOutletContext } from "react-router";
import type { AppContext } from "../types";
import { DatesPage } from "../components/OtherPages";

export default function DatesRoute() {
  const { ctx, navigate } = useOutletContext<{
    ctx: AppContext;
    navigate: (path: string, opts?: { state?: Record<string, unknown> }) => void;
  }>();

  const setRoute = (r: string, options?: { prompt?: string }) => {
    const pathMap: Record<string, string> = {
      home: "/", timeline: "/timeline", chat: "/chat",
      rescue: "/rescue", booth: "/booth", dates: "/dates",
    };
    navigate(pathMap[r] || "/" + r, options?.prompt ? { state: { prompt: options.prompt } } : undefined);
  };

  return <DatesPage ctx={ctx} setRoute={setRoute as any} />;
}
