import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppShell } from "./components/AppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import Assistant from "./pages/Assistant";
import Community from "./pages/Community";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Knowledge from "./pages/Knowledge";
import Profile from "./pages/Profile";
import Realm from "./pages/Realm";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <AppShell>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/explore"} component={Explore} />
        <Route path={"/community"} component={Community} />
        <Route path={"/assistant"} component={Assistant} />
        <Route path={"/profile"} component={Profile} />
        <Route path={"/knowledge"} component={Knowledge} />
        <Route path={"/world/:realm"} component={Realm} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
