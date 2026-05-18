import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { GateTerminal } from "./pages/GateTerminal";
import { ActiveSessions } from "./pages/ActiveSessions";
import { Exceptions } from "./pages/Exceptions";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "terminal", Component: GateTerminal },
      { path: "sessions", Component: ActiveSessions },
      { path: "exceptions", Component: Exceptions },
    ],
  },
]);