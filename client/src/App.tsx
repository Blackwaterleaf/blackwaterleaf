import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import ProfileHome from "./pages/ProfileHome";
import Ranking from "./pages/Ranking";
import Realm from "./pages/Realm";
import FlowDestination from "./pages/FlowDestination";
import AdminDashboard from "./pages/AdminDashboard";
import AccountAccess from "./pages/AccountAccess";
import Marketplace from "./pages/Marketplace";
import MarketplaceShop from "./pages/MarketplaceShop";
import MarketplaceProduct from "./pages/MarketplaceProduct";
import MerchantMarketplace from "./pages/MerchantMarketplace";
import Notifications from "./pages/Notifications";
import CareToday from "./pages/CareToday";
import Search from "./pages/Search";
import PlantTaxon from "./pages/PlantTaxon";
import AquariumTaxon from "./pages/AquariumTaxon";
import PublicProfile from "./pages/PublicProfile";
import SavedItems from "./pages/SavedItems";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const HabitatBuilder = lazy(() => import("./pages/HabitatBuilder"));

function HabitatBuilderRoute() {
  return <Suspense fallback={<section className="habitat-builder-loading" aria-live="polite"><Loader2 size={22} className="spin" />Planungsansicht wird geladen …</section>}><HabitatBuilder /></Suspense>;
}

function Router() {
  return (
    <Switch>
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/:section"} component={AdminDashboard} />
      <Route path={"/login"} component={AccountAccess} />
      <Route path={"/register"} component={AccountAccess} />
      <Route path={"/forgot-password"} component={AccountAccess} />
      <Route path={"/verify-email"} component={AccountAccess} />
      <Route path={"/reset-password"} component={AccountAccess} />
      <Route>
        <AppShell>
          <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/explore"} component={Explore} />
        <Route path={"/search"} component={Search} />
        <Route path={"/community"} component={Community} />
        <Route path={"/notifications"} component={Notifications} />
        <Route path={"/today"} component={CareToday} />
        <Route path={"/assistant"} component={Assistant} />
        <Route path={"/profile"} component={ProfileHome} />
        <Route path={"/member/:id"} component={PublicProfile} />
        <Route path={"/plant/:id"} component={PlantTaxon} />
        <Route path={"/aquarium-fish/:id"} component={AquariumTaxon} />
        <Route path={"/saved"} component={SavedItems} />
        <Route path={"/ranking"} component={Ranking} />
        <Route path={"/profile/settings"} component={Profile} />
        <Route path={"/profile/private"} component={Profile} />
        <Route path={"/profile/habitats"} component={Profile} />
        <Route path={"/profile/progress"} component={Profile} />
        <Route path={"/profile/privacy"} component={Profile} />
        <Route path={"/profile/preferences"} component={Profile} />
        <Route path={"/profile/tools"} component={Profile} />
        <Route path={"/knowledge"} component={Knowledge} />
        <Route path={"/wissen"} component={Knowledge} />
        <Route path={"/feed"} component={Community} />
        <Route path={"/community/feed"} component={Community} />
        <Route path={"/botanik"}><Realm /></Route>
        <Route path={"/aquaristik"}><Realm /></Route>
        <Route path={"/terraristik"}><Realm /></Route>
        <Route path={"/shop"} component={Marketplace} />
        <Route path={"/marketplace/shop/:id"} component={MarketplaceShop} />
        <Route path={"/marketplace/product/:id"} component={MarketplaceProduct} />
        <Route path={"/marketplace/manage"} component={MerchantMarketplace} />
        <Route path={"/marketplace"} component={Marketplace} />
        <Route path={"/habitat-builder"} component={HabitatBuilderRoute} />
        <Route path={"/flow/:flow"} component={FlowDestination} />
        <Route path={"/world/:realm"} component={Realm} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
          </Switch>
        </AppShell>
      </Route>
    </Switch>
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
