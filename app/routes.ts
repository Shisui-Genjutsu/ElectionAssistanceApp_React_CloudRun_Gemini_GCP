import {
  type RouteConfig,
  index,
  layout,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  // Onboarding — full screen, no shell
  route("onboarding", "routes/onboarding.tsx"),

  // App shell layout (sidebar + topbar)
  layout("routes/_shell.tsx", [
    index("routes/home.tsx"),
    route("timeline", "routes/timeline.tsx"),
    route("chat", "routes/chat.tsx"),
    route("rescue", "routes/rescue.tsx"),
    route("booth", "routes/booth.tsx"),
    route("dates", "routes/dates.tsx"),
  ]),

  // Server-side API routes (Gemini proxy)
  ...prefix("api", [
    route("chat", "routes/api.chat.tsx"),
  ]),
] satisfies RouteConfig;
