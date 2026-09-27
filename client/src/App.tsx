import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppShell } from "./components/AppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import Assistant from "./pages/Assistant";
import Community from "./pages/Community";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import LiveHub from "./pages/LiveHub";
import LiveSession from "./pages/LiveSession";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Knowledge from "./pages/Knowledge";
import Profile from "./pages/Profile";
import ProfileHome from "./pages/ProfileHome";
import ManagementHub from "./pages/ManagementHub";
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
import Messages from "./pages/Messages";
import CareToday from "./pages/CareToday";
import Search from "./pages/Search";
import PlantTaxon from "./pages/PlantTaxon";
import AquariumTaxon from "./pages/AquariumTaxon";
import TerrariumTaxon from "./pages/TerrariumTaxon";
import PublicProfile from "./pages/PublicProfile";
import SavedItems from "./pages/SavedItems";
import NotFound from "./pages/NotFound";
import Feedback from "./pages/Feedback";
import Legal from "./pages/Legal";

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
        <Route path={"/catalog"} component={Search} />
        <Route path={"/community"} component={Community} />
        <Route path={"/community/post/:id"} component={CommunityPostDetail} />
        <Route path={"/live"} component={LiveHub} />
        <Route path={"/live/:id"} component={LiveSession} />
        <Route path={"/notifications"} component={Notifications} />
        <Route path={"/messages"} component={Messages} />
        <Route path={"/feedback"} component={Feedback} />
        <Route path={"/datenschutz"} component={Legal} />
        <Route path={"/privacy"} component={Legal} />
        <Route path={"/impressum"} component={Legal} />
        <Route path={"/today"} component={CareToday} />
        <Route path={"/assistant"} component={Assistant} />
        <Route path={"/profile"} component={ProfileHome} />
        <Route path={"/profile/manage"} component={ManagementHub} />
        <Route path={"/member/:id"} component={PublicProfile} />
        <Route path={"/plant/:id"} component={PlantTaxon} />
        <Route path={"/aquarium-fish/:id"} component={AquariumTaxon} />
        <Route path={"/terrarium/:id"} component={TerrariumTaxon} />
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
