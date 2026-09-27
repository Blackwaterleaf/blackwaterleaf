import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppShell } from "./components/AppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
const Assistant = lazy(() => import("./pages/Assistant"));
const Community = lazy(() => import("./pages/Community"));
const CommunityPostDetail = lazy(() => import("./pages/CommunityPostDetail"));
const LiveHub = lazy(() => import("./pages/LiveHub"));
const LiveSession = lazy(() => import("./pages/LiveSession"));
const Explore = lazy(() => import("./pages/Explore"));
const Home = lazy(() => import("./pages/Home"));
const Knowledge = lazy(() => import("./pages/Knowledge"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileHome = lazy(() => import("./pages/ProfileHome"));
const ManagementHub = lazy(() => import("./pages/ManagementHub"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Realm = lazy(() => import("./pages/Realm"));
const FlowDestination = lazy(() => import("./pages/FlowDestination"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AccountAccess = lazy(() => import("./pages/AccountAccess"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceShop = lazy(() => import("./pages/MarketplaceShop"));
const MarketplaceProduct = lazy(() => import("./pages/MarketplaceProduct"));
const MerchantMarketplace = lazy(() => import("./pages/MerchantMarketplace"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Messages = lazy(() => import("./pages/Messages"));
const CareToday = lazy(() => import("./pages/CareToday"));
const Search = lazy(() => import("./pages/Search"));
const PlantTaxon = lazy(() => import("./pages/PlantTaxon"));
const AquariumTaxon = lazy(() => import("./pages/AquariumTaxon"));
const TerrariumTaxon = lazy(() => import("./pages/TerrariumTaxon"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const SavedItems = lazy(() => import("./pages/SavedItems"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Legal = lazy(() => import("./pages/Legal"));
const Pro = lazy(() => import("./pages/Pro"));
const Support = lazy(() => import("./pages/Support"));

function PageLoader() {
  return <div className="observatory-route observatory-route--botany page-loader" role="status" aria-live="polite">BEREICH WIRD GELADEN …</div>;
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
        <Route path={"/catalog"} component={Search} />
        <Route path={"/community"} component={Community} />
        <Route path={"/community/post/:id"} component={CommunityPostDetail} />
        <Route path={"/live"} component={LiveHub} />
        <Route path={"/live/:id"} component={LiveSession} />
        <Route path={"/notifications"} component={Notifications} />
        <Route path={"/messages"} component={Messages} />
        <Route path={"/feedback"} component={Feedback} />
        <Route path={"/pro"} component={Pro} />
        <Route path={"/support"} component={Support} />
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
          <Suspense fallback={<PageLoader />}><Router /></Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
