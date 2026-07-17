import { Toaster } from "@/components/ui/sonner";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Plants from "./pages/Plants";
import PlantCreate from "./pages/PlantCreate";
import PlantDetail from "./pages/PlantDetail";
import Aquariums from "./pages/Aquariums";
import AquariumCreate from "./pages/AquariumCreate";
import AquariumDetail from "./pages/AquariumDetail";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import AiAssistant from "./pages/AiAssistant";
import Notifications from "./pages/Notifications";
import Knowledge from "./pages/Knowledge";
import KnowledgeArticle from "./pages/KnowledgeArticle";
import Ranking from "./pages/Ranking";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import Impressum from "./pages/legal/Impressum";
import Datenschutz from "./pages/legal/Datenschutz";
import Nutzungsbedingungen from "./pages/legal/Nutzungsbedingungen";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import AdminPanel from "./pages/AdminPanel";
import AiIdentificationReview from "./pages/AiIdentificationReview";
import Marketplace from "./pages/Marketplace";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/feed">
        <AppLayout><Feed /></AppLayout>
      </Route>
      <Route path="/plants">
        <AppLayout><Plants /></AppLayout>
      </Route>
      <Route path="/plants/new">
        <AppLayout><PlantCreate /></AppLayout>
      </Route>
      <Route path="/plants/:id">
        {(params) => <AppLayout><PlantDetail id={Number(params.id)} /></AppLayout>}
      </Route>
      <Route path="/aquariums">
        <AppLayout><Aquariums /></AppLayout>
      </Route>
      <Route path="/aquariums/new">
        <AppLayout><AquariumCreate /></AppLayout>
      </Route>
      <Route path="/aquariums/:id">
        {(params) => <AppLayout><AquariumDetail id={Number(params.id)} /></AppLayout>}
      </Route>
      <Route path="/profile">
        <AppLayout><Profile /></AppLayout>
      </Route>
      <Route path="/profile/:id">
        {(params) => <AppLayout><Profile userId={Number(params.id)} /></AppLayout>}
      </Route>
      <Route path="/discover">
        <AppLayout><Discover /></AppLayout>
      </Route>
      <Route path="/knowledge">
        <AppLayout><Knowledge /></AppLayout>
      </Route>
      <Route path="/knowledge/:slug">
        {(params) => <AppLayout><KnowledgeArticle slug={String(params.slug)} /></AppLayout>}
      </Route>
      <Route path="/ranking">
        <AppLayout><Ranking /></AppLayout>
      </Route>
      <Route path="/marketplace">
        <AppLayout><Marketplace /></AppLayout>
      </Route>
      <Route path="/ai">
        <AppLayout><AiAssistant /></AppLayout>
      </Route>
      <Route path="/notifications">
        <AppLayout><Notifications /></AppLayout>
      </Route>
      <Route path="/moderator">
        <AppLayout><ModeratorDashboard /></AppLayout>
      </Route>
      <Route path="/admin">
        <AppLayout><AdminPanel /></AppLayout>
      </Route>
      <Route path="/ai-review">
        <AppLayout><AiIdentificationReview /></AppLayout>
      </Route>
      <Route path="/impressum" component={Impressum} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/agb" component={Nutzungsbedingungen} />
      <Route path="/nutzungsbedingungen" component={Nutzungsbedingungen} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useTimeOfDay(); // Tageszeit-Klasse auf body setzen
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <PwaInstallPrompt />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
