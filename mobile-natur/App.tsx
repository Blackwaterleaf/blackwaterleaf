import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { useVideoPlayer, VideoView } from "expo-video";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  AppState,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  UIManager,
  View,
  type ImageSourcePropType,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FeedbackScreen } from "./src/FeedbackScreen";

const USE_BACKGROUND_BLUR = Platform.OS !== "android";
const NATIVE_GLOW = Platform.OS === "android"
  ? { shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }
  : { shadowOpacity: 0.34, shadowRadius: 14, elevation: 7 };
const NATIVE_SOFT_SHADOW = Platform.OS === "android"
  ? { shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 }
  : { shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 };
import {
  assistantAquariumAnalyze,
  assistantChat,
  assistantPlantIdentify,
  adminFeedbackQueue,
  adminUpdateFeedback,
  adminPartnerInquiryQueue,
  adminUpdatePartnerInquiry,
  addCommunityComment,
  updateCommunityComment,
  deleteCommunityComment,
  reportCommunityComment,
  blockCommunityUser,
  API_ORIGIN,
  billingCheckout,
  billingMe,
  billingPlans,
  careAddJournal,
  careCreatePlan,
  careCreateTask,
  careMine,
  careToday,
  careUpdateTask,
  catalogByRealm,
  clearToken,
  communityComments,
  communityFeed,
  createCommunityDraft,
  currentAccount,
  deleteCommunityPost,
  knowledge,
  marketplace,
  marketplaceEvent,
  submitPartnerInquiry,
  likeCommunityPost,
  markNotificationsRead,
  myCommunityPosts,
  notificationFeed,
  notificationUnreadCount,
  analyticsOverview,
  platformAvailability,
  privateHabitats,
  privateObservations,
  publicObservations,
  observationResponses,
  respondToObservation,
  profileConsents,
  publishCommunityDraft,
  readToken,
  reportCommunityPost,
  setProfileConsent,
  updateProfile,
  uploadCommunityDraftImage,
  uploadCommunityDraftVideo,
  uploadProfileAvatar,
  submitPlantCorrection,
  updateCommunityPost,
  unifiedSearch,
  publicPlantTaxon,
  publicAquariumTaxon,
  publicTerrariumTaxon,
  publicProfile,
  publicProfilePosts,
  unblockCommunityUser,
  profileExportData,
  socialRelationship,
  socialAdminProfile,
  socialFollowers,
  socialFollowing,
  followProfile,
  unfollowProfile,
  savedItems,
  saveItem,
  unsaveItem,
  publishedChallenges,
  myChallenges,
  joinChallenge,
  liveById,
  liveCapabilities,
  liveList,
  liveMessages,
  directConversations,
  directMessages,
  directUnreadCount,
  startDirectConversation,
  sendDirectMessage,
  markDirectConversationRead,
  liveRotateSelfHostedKey,
  liveSendMessage,
  liveUpdate,
  liveViewerPresence,
  liveViewerTicket,
  gamificationSummary,
  gamificationLeaderboard,
  type Account,
  type AssistantReply,
  type CommunityPost,
  type CommunityComment,
  type CareJournalEntry,
  type CarePlan,
  type CareTask,
  type Habitat,
  type KnowledgeArticle,
  type MarketplaceProduct,
  type Observation,
  type OwnCommunityPost,
  type NativeNotification,
  type NativeAdminFeedback,
  type NativeAdminPartnerInquiry,
  type NativeAnalyticsOverview,
  type PlatformAvailability,
  type ProfileConsent,
  type UnifiedSearchResult,
  type PublicPlantTaxon,
  type PublicAquariumTaxon,
  type PublicTerrariumTaxon,
  type PublicCatalogTaxon,
  type PublicProfile,
  type PublicProfilePost,
  type SocialRelationship,
  type SocialProfileListEntry,
  type SavedItem,
  type Challenge,
  type ChallengeProgress,
  type ExperienceSummary,
  type LeaderboardRow,
  type LiveCapabilities,
  type LiveMessage,
  type LiveSession,
  type LiveTrack,
  type DirectConversation,
  type DirectMessage,
  type NativeBillingStatus,
  type NativeCreditPack,
} from "./src/api";
import { HabitatManager } from "./src/HabitatManager";
import { MomentCapture } from "./src/MomentCapture";
import { signInWithBlackWaterLeaf } from "./src/nativeAuth";
import {
  cachePrivateObservations,
  observationOutboxSummary,
  readCachedPrivateObservations,
  syncObservationOutbox,
  type ObservationOutboxSummary,
} from "./src/observationOutbox";
import { getBlackWaterLeafSeason } from "./src/season";

const ASSETS = {
  home: require("./assets/home-observatory-hero-mobile.jpg"),
  botany: require("./assets/botany-reference.jpg"),
  aquarium: require("./assets/aquarium-reference.jpg"),
  terrarium: require("./assets/terrarium-reference.jpg"),
  ai: require("./assets/assistant-reference.jpg"),
} as const;

const c = {
  bg: "#031108",
  surface: "#07180d",
  raised: "#0b2415",
  botany: "#C7F35B",
  aqua: "#28D8FF",
  terrarium: "#E1D661",
  gold: "#E1D661",
  market: "#D9AD69",
  champagne: "#F3D59C",
  text: "#F3FFF5",
  muted: "#9BB39F",
  danger: "#FF9EA8",
  ai: "#B96CFF",
  botanySurface: "#061b0d",
  aquariumSurface: "#04303e",
  terrariumSurface: "#3e3812",
  aiSurface: "#170C2A",
  marketSurface: "#432f14",
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Screen =
  | "home"
  | "explore"
  | "marketplace"
  | "community"
  | "communityDetail"
  | "profile"
  | "management"
  | "dashboard"
  | "botany"
  | "aquarium"
  | "terrarium"
  | "assistant"
  | "knowledge"
  | "live"
  | "photo"
  | "post"
  | "collection"
  | "search"
  | "catalogOverview"
  | "publicProfile"
  | "taxon"
  | "aquariumTaxon"
  | "terrariumTaxon"
  | "saved"
  | "ranking"
  | "notifications"
  | "messages"
  | "care"
  | "feedback"
  | "pro";
type BottomTab =
  | "discover"
  | "map"
  | "capture"
  | "catalog"
  | "profile"
  | "home"
  | "explore"
  | "marketplace"
  | "community"
;
type State = "loading" | "ready" | "error";
type Tone = {
  accent: string;
  surface: string;
  panel: string;
  image: ImageSourcePropType;
  label: string;
  active: BottomTab;
};
type IconName = keyof typeof Ionicons.glyphMap;
type Realm = "botany" | "aquarium" | "terrarium";
type ProfileMenuTarget = "open" | "manage" | "edit" | "avatar" | "display" | "private" | "habitats" | "progress" | "privacy" | "preferences" | "tools";

type Action = {
  title: string;
  note: string;
  icon: IconName;
  image: ImageSourcePropType;
  area?: "botany" | "aquarium" | "terrarium" | "assistant";
  onPress: () => void;
  unavailable?: boolean;
};

type PlantPhoto = {
  uri: string;
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

const TONES: Record<Screen, Tone> = {
  home: {
    accent: c.botany,
    surface: c.bg,
    panel: c.surface,
    image: ASSETS.home,
    label: "NATUR APP",
    active: "home",
  },
  explore: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: "#0b2415",
    image: ASSETS.terrarium,
    label: "WORLD INDEX",
    active: "explore",
  },
  marketplace: {
    accent: c.market,
    surface: c.marketSurface,
    panel: "#271c0f",
    image: ASSETS.aquarium,
    label: "MARKTPLATZ",
    active: "discover",
  },
  community: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "COMMUNITY",
    active: "community",
  },
  communityDetail: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "COMMUNITY · DISKUSSION",
    active: "community",
  },
  profile: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "PRIVATER BEREICH",
    active: "profile",
  },
  management: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "KONTOZENTRUM · VERWALTEN",
    active: "profile",
  },
  pro: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "BLACKWATERLEAF PRO",
    active: "profile",
  },
  dashboard: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "HOST-DASHBOARD",
    active: "profile",
  },
  botany: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: "#0b2415",
    image: ASSETS.botany,
    label: "PFLANZEN WORLD",
    active: "home",
  },
  aquarium: {
    accent: c.aqua,
    surface: c.aquariumSurface,
    panel: "#032231",
    image: ASSETS.aquarium,
    label: "AQUARISTIK",
    active: "home",
  },
  terrarium: {
    accent: c.gold,
    surface: c.terrariumSurface,
    panel: "#302c0f",
    image: ASSETS.terrarium,
    label: "TERRARISTIK",
    active: "home",
  },
  assistant: {
    accent: c.ai,
    surface: c.aiSurface,
    panel: "#24113D",
    image: ASSETS.ai,
    label: "BLACKWATERLEAF KI",
    active: "capture",
  },
  knowledge: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "WISSEN & EVIDENZ",
    active: "catalog",
  },
  live: {
    accent: c.aqua,
    surface: c.aquariumSurface,
    panel: "#032231",
    image: ASSETS.aquarium,
    label: "LIVE-BEREICH",
    active: "capture",
  },
  photo: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "MOMENT FESTHALTEN",
    active: "capture",
  },
  post: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "BEITRAG",
    active: "capture",
  },
  collection: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "MEINE ANLAGEN",
    active: "profile",
  },
  search: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "SUCHE",
    active: "catalog",
  },
  catalogOverview: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "ALPHABETISCHER KATALOG",
    active: "catalog",
  },
  publicProfile: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "ÖFFENTLICHES PROFIL",
    active: "explore",
  },
  taxon: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "PFLANZENKATALOG",
    active: "catalog",
  },
  aquariumTaxon: {
    accent: c.aqua,
    surface: c.aquariumSurface,
    panel: "#032231",
    image: ASSETS.aquarium,
    label: "AQUARISTIK-KATALOG",
    active: "catalog",
  },
  terrariumTaxon: {
    accent: c.terrarium,
    surface: c.terrariumSurface,
    panel: "#18150c",
    image: ASSETS.terrarium,
    label: "TERRARISTIK-KATALOG",
    active: "catalog",
  },
  saved: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "GESPEICHERT",
    active: "profile",
  },
  ranking: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "RANKING & CHALLENGES",
    active: "profile",
  },
  notifications: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "BENACHRICHTIGUNGEN",
    active: "community",
  },
  messages: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "PRIVAT · POSTFACH",
    active: "profile",
  },
  care: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "HEUTE · PFLEGE",
    active: "profile",
  },
  feedback: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "DIREKTER DRAHT",
    active: "profile",
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NaturApp />
    </SafeAreaProvider>
  );
}

function NaturApp() {
  const insets = useSafeAreaInsets();
  const season = getBlackWaterLeafSeason();
  const [screen, setScreen] = useState<Screen>("home");
  const [token, setToken] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [privateObservationRows, setPrivateObservationRows] = useState<Observation[]>([]);
  const [observationSync, setObservationSync] = useState<ObservationOutboxSummary>({ pending: 0, imagePending: 0, conflicts: 0 });
  const [publicObservationRows, setPublicObservationRows] = useState<Observation[]>([]);
  const [platform, setPlatform] = useState<PlatformAvailability | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<NativeNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageTargetProfile, setMessageTargetProfile] = useState<PublicProfile | null>(null);
  const [directThread, setDirectThread] = useState<DirectMessage[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [careJournal, setCareJournal] = useState<CareJournalEntry[]>([]);
  const [analytics, setAnalytics] = useState<NativeAnalyticsOverview | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<NativeAdminFeedback[]>([]);
  const [adminPartnerInquiries, setAdminPartnerInquiries] = useState<NativeAdminPartnerInquiry[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [consents, setConsents] = useState<ProfileConsent[]>([]);
  const [experience, setExperience] = useState<ExperienceSummary | null>(null);
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);
  const [collectionRealm, setCollectionRealm] = useState<Realm>("botany");
  const [collectionPrefill, setCollectionPrefill] = useState<{ kind: "plant" | "aquarium" | "terrarium"; name: string; scientificName?: string }>();
  const [visibleKinds, setVisibleKinds] = useState<Array<"plant" | "aquarium" | "terrarium">>(["plant", "aquarium", "terrarium"]);
  const [profileMenuTarget, setProfileMenuTarget] = useState<ProfileMenuTarget>("open");
  const [selectedPublicProfileId, setSelectedPublicProfileId] = useState<number | null>(null);
  const [selectedTaxonId, setSelectedTaxonId] = useState<number | null>(null);
  const [selectedAquariumTaxonId, setSelectedAquariumTaxonId] = useState<number | null>(null);
  const [selectedTerrariumTaxonId, setSelectedTerrariumTaxonId] = useState<number | null>(null);
  const [catalogRealm, setCatalogRealm] = useState<Realm>("botany");
  const [selectedCommunityPostId, setSelectedCommunityPostId] = useState<string | null>(null);

  const tone =
    screen === "collection"
      ? collectionRealm === "aquarium"
        ? TONES.aquarium
        : collectionRealm === "terrarium"
          ? TONES.terrarium
          : TONES.botany
      : TONES[screen];
  const navigate = useCallback((next: Screen) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError(null);
    setScreen(next);
  }, []);

  const refreshPrivate = useCallback(
    async (sessionToken = token) => {
      if (!sessionToken) {
        setAccount(null);
        setHabitats([]);
        setPrivateObservationRows([]);
        setObservationSync({ pending: 0, imagePending: 0, conflicts: 0 });
        setConsents([]);
        setExperience(null);
        return;
      }
      try {
        setPrivateObservationRows(await readCachedPrivateObservations());
        const synced = await syncObservationOutbox(sessionToken).catch(() => null);
        if (synced) setObservationSync(synced);
        const [me, mine, observations, permissions, summary] = await Promise.all([
          currentAccount(sessionToken),
          privateHabitats(sessionToken),
          privateObservations(sessionToken),
          profileConsents(sessionToken),
          gamificationSummary(sessionToken),
        ]);
        const [notificationSummary, messageSummary] = await Promise.all([notificationUnreadCount(sessionToken), directUnreadCount(sessionToken)]);
        setAccount(me);
        setHabitats(mine);
        setPrivateObservationRows(observations);
        await cachePrivateObservations(observations);
        setObservationSync(await observationOutboxSummary());
        setConsents(permissions);
        setExperience(summary);
        setUnreadNotifications(notificationSummary.count);
        setUnreadMessages(messageSummary.count);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Private Daten konnten nicht geladen werden."
        );
      }
    },
    [token]
  );

  const loadScreen = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      if (screen === "home" || screen === "assistant")
        setPlatform(await platformAvailability());
      if (screen === "marketplace" || screen === "search")
        setProducts(await marketplace());
      if (screen === "explore") setPublicObservationRows(await publicObservations());
      if (screen === "community" && token) setPosts(await communityFeed(token));
      if (screen === "community" && !token) setPosts([]);
      if (screen === "notifications" && token) setNotifications(await notificationFeed(token));
      if (screen === "messages" && token) {
        const rows = await directConversations(token);
        setConversations(rows);
        const selected = selectedConversationId ? rows.find(item => item.id === selectedConversationId) ?? rows[0] : rows[0];
        setSelectedConversationId(selected?.id ?? null);
        if (selected) {
          const thread = await directMessages(token, Number(selected.id));
          setDirectThread(thread.items);
          await markDirectConversationRead(token, Number(selected.id));
        } else setDirectThread([]);
      }
      if (screen === "dashboard" && token) {
        const [dashboardAnalytics, feedbackQueue, partnerQueue] = await Promise.all([analyticsOverview(token, 7), adminFeedbackQueue(token), adminPartnerInquiryQueue(token)]);
        setAnalytics(dashboardAnalytics);
        setAdminFeedback(feedbackQueue);
        setAdminPartnerInquiries(partnerQueue);
      }
      if (screen === "care" && token) {
        const [today, mine] = await Promise.all([careToday(token), careMine(token)]);
        setCareTasks(today.tasks);
        setCarePlans(mine.plans);
        setCareJournal(mine.journal);
      }
      if (screen === "knowledge" || screen === "search")
        setArticles(await knowledge());
      setState("ready");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Daten konnten nicht geladen werden."
      );
      setState("error");
    }
  }, [screen, token]);

  useEffect(() => {
    void readToken().then(value => {
      setToken(value);
      void refreshPrivate(value);
    });
  }, [refreshPrivate]);
  useEffect(() => {
    void loadScreen();
  }, [loadScreen]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextState => {
      if (nextState === "active" && token) void refreshPrivate(token);
    });
    return () => subscription.remove();
  }, [refreshPrivate, token]);

  const signIn = useCallback(async () => {
    try {
      const result = await signInWithBlackWaterLeaf();
      if (result.status === "authenticated") {
        const nextToken = await readToken();
        setToken(nextToken);
        await refreshPrivate(nextToken);
        navigate("profile");
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Die Anmeldung ist fehlgeschlagen."
      );
    }
  }, [navigate, refreshPrivate]);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setAccount(null);
    setHabitats([]);
    setPrivateObservationRows([]);
    setObservationSync({ pending: 0, imagePending: 0, conflicts: 0 });
    setConsents([]);
    setCareTasks([]);
    setCarePlans([]);
    setCareJournal([]);
    setUnreadNotifications(0);
    setUnreadMessages(0);
    setConversations([]);
    setSelectedConversationId(null);
    setMessageTargetProfile(null);
    setDirectThread([]);
    navigate("home");
  }, [navigate]);

  const exportAccount = useCallback(async () => {
    if (!token) throw new Error("auth_required");
    const data = await profileExportData(token);
    const uri = `${FileSystem.cacheDirectory ?? ""}blackwaterleaf-account-export-${new Date().toISOString().slice(0, 10)}.json`;
    if (!uri.startsWith("file:")) throw new Error("export_storage_unavailable");
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "BlackWaterLeaf-Datenexport" });
    const historyCount = Array.isArray(data.exportHistory) ? data.exportHistory.length : 0;
    Alert.alert("Datenexport protokolliert", `Dieser Export ist im geschützten Audit-Verlauf erfasst. Bisherige Exporte: ${historyCount}.`);
  }, [token]);

  const openCollection = useCallback(
    (realm: Realm) => {
      setCollectionRealm(realm);
      setCollectionPrefill(undefined);
      navigate("collection");
    },
    [navigate]
  );

  const openCollectionFromTaxon = useCallback((realm: Realm, name: string, scientificName?: string) => {
    setCollectionRealm(realm);
    setCollectionPrefill({ kind: realm === "botany" ? "plant" : realm, name, scientificName });
    navigate("collection");
  }, [navigate]);

  const guarded = useCallback(
    (action: () => void, description: string) => {
      if (token) {
        action();
        return;
      }
      Alert.alert("Sichere Anmeldung erforderlich", description, [
        { text: "Abbrechen", style: "cancel" },
        { text: "Anmelden", onPress: () => void signIn() },
      ]);
    },
    [signIn, token]
  );

  const notificationInfo = useCallback(() => {
    if (token) navigate("notifications");
    else void signIn();
  }, [navigate, signIn, token]);
  const messageInfo = useCallback(() => {
    if (token) navigate("messages");
    else void signIn();
  }, [navigate, signIn, token]);

  const seasonSurface =
    screen === "home"
      ? season === "winter"
        ? "#06131a"
        : season === "autumn"
          ? "#151108"
          : season === "spring"
            ? "#07160d"
            : c.bg
      : tone.surface;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: seasonSurface }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="light" />
      <Header
        tone={tone}
        account={account}
        onSearch={() => navigate("search")}
        onMarketplace={() => navigate("marketplace")}
        onNotifications={notificationInfo}
        onMessages={messageInfo}
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
        onCare={() => { if (token) navigate("care"); else void signIn(); }}
        onFeedback={() => { if (token) navigate("feedback"); else void signIn(); }}
        onProfileTarget={target => {
          if (target === "progress") {
            navigate("ranking");
            return;
          }
          if (target === "manage") {
            navigate("management");
            return;
          }
          setProfileMenuTarget(target);
          navigate("profile");
        }}
      />
      <View style={[styles.body, { backgroundColor: seasonSurface }]}>
        {screen === "home" && (
          <Home
            platform={platform}
            habitats={habitats}
            state={state}
            error={error}
            refresh={loadScreen}
            navigate={navigate}
          />
        )}
        {screen === "explore" && <Explore token={token} navigate={navigate} observations={publicObservationRows} loading={state === "loading"} error={error} refresh={loadScreen} />}
        {screen === "botany" && (
          <WorldScreen
            tone={TONES.botany}
            realm="botany"
            observations={publicObservationRows}
            eyebrow="BOTANIK"
            title="PFLANZEN WORLD"
            subtitle="Deine Pflanzensammlung."
            actions={[
              {
                title: "Meine Pflanzen",
                note: "Private Sammlung öffnen",
                icon: "leaf-outline",
                image: ASSETS.botany,
                onPress: () =>
                  guarded(
                    () => openCollection("botany"),
                    "Deine Pflanzensammlung ist nur nach sicherer Anmeldung sichtbar."
                  ),
              },
              {
                title: "Pflanze hinzufügen",
                note: "Neue Pflanze anlegen",
                icon: "add-circle-outline",
                image: ASSETS.botany,
                onPress: () =>
                  guarded(
                    () => openCollection("botany"),
                    "Pflanzen werden nur in deinem geschützten Konto angelegt."
                  ),
              },
              {
                title: "Pflanze bestimmen",
                note: "Eigenes Foto sicher prüfen",
                icon: "scan-outline",
                image: ASSETS.botany,
                onPress: () => navigate("assistant"),
              },
              {
                title: "Pflegewissen",
                note: "Quellenwissen öffnen",
                icon: "book-outline",
                image: ASSETS.terrarium,
                onPress: () => navigate("knowledge"),
              },
            ]}
          />
        )}
        {screen === "aquarium" && (
          <WorldScreen
            tone={TONES.aquarium}
            realm="aquarium"
            observations={publicObservationRows}
            eyebrow="AQUARISTIK"
            title="AQUARISTIK"
            subtitle="Becken, Wasserwerte, Unterwasserwelt."
            actions={[
              {
                title: "Meine Aquarien",
                note: "Becken privat verwalten",
                icon: "fish-outline",
                image: ASSETS.aquarium,
                onPress: () =>
                  guarded(
                    () => openCollection("aquarium"),
                    "Deine Aquarien sind nur nach sicherer Anmeldung sichtbar."
                  ),
              },
              {
                title: "Aquarium hinzufügen",
                note: "Neues Becken anlegen",
                icon: "add-circle-outline",
                image: ASSETS.aquarium,
                onPress: () =>
                  guarded(
                    () => openCollection("aquarium"),
                    "Ein Aquarium wird nur in deinem geschützten Konto angelegt."
                  ),
              },
              {
                title: "Wasserwerte",
                note: "Live-Bereich und Messwerte öffnen",
                icon: "flask-outline",
                image: ASSETS.aquarium,
                onPress: () => navigate("live"),
              },
              {
                title: "KI zur Aquaristik",
                note: "Dein Becken gezielt analysieren",
                icon: "hardware-chip-outline",
                image: ASSETS.ai,
                onPress: () => navigate("assistant"),
              },
            ]}
          />
        )}
        {screen === "terrarium" && (
          <WorldScreen
            tone={TONES.terrarium}
            realm="terrarium"
            observations={publicObservationRows}
            eyebrow="TERRARISTIK"
            title="TERRARISTIK"
            subtitle="Regenwald im Kleinen."
            actions={[
              {
                title: "Terrarium fotografieren",
                note: "Privaten Moment erfassen",
                icon: "camera-outline",
                image: ASSETS.terrarium,
                onPress: () =>
                  guarded(
                    () => navigate("photo"),
                    "Fotos werden erst nach Anmeldung und sichtbarer Medienfreigabe privat verarbeitet."
                  ),
              },
              {
                title: "Terrarium entdecken",
                note: "Anlage privat verwalten",
                icon: "leaf-outline",
                image: ASSETS.terrarium,
                onPress: () =>
                  guarded(
                    () => openCollection("terrarium"),
                    "Dein Terrarium ist nur nach sicherer Anmeldung sichtbar."
                  ),
              },
              {
                title: "Wissen",
                note: "Quellenwissen öffnen",
                icon: "book-outline",
                image: ASSETS.botany,
                onPress: () => navigate("knowledge"),
              },
              {
                title: "KI fragen",
                note: "Allgemeine Frage stellen",
                icon: "chatbubbles-outline",
                image: ASSETS.ai,
                onPress: () => navigate("assistant"),
              },
            ]}
          />
        )}
        {screen === "assistant" && (
          <AssistantScreen
            token={token}
            habitats={habitats}
            platform={platform}
            consents={consents}
            onRefreshPrivate={refreshPrivate}
            onSignIn={signIn}
            tone={TONES.assistant}
            navigate={navigate}
          />
        )}
        {screen === "live" && (
          <LiveScreen
            tone={TONES.live}
            token={token}
            account={account}
            onSignIn={signIn}
            navigate={navigate}
          />
        )}
        {screen === "photo" && (
          <PhotoScreen
            token={token}
            tone={TONES.photo}
            observations={privateObservationRows}
            observationSync={observationSync}
            onSignIn={signIn}
            onComplete={async () => { await refreshPrivate(); }}
            navigate={navigate}
          />
        )}
        {screen === "post" && (
          <PostScreen
            token={token}
            isAdmin={account?.role === "admin"}
            tone={TONES.post}
            onSignIn={signIn}
            navigate={navigate}
          />
        )}
        {screen === "knowledge" && (
          <KnowledgeScreen
            tone={TONES.knowledge}
            articles={articles}
            state={state}
            error={error}
            refresh={loadScreen}
          />
        )}
        {screen === "marketplace" && (
          <MarketplaceScreen
            tone={TONES.marketplace}
            products={products}
            state={state}
            error={error}
            refresh={loadScreen}
            token={token}
            onSignIn={signIn}
          />
        )}
        {screen === "community" && (
          <CommunityScreen
            tone={TONES.community}
            account={account}
            posts={posts}
            state={state}
            error={error}
            refresh={loadScreen}
            token={token}
            onSignIn={signIn}
            navigate={navigate}
            onOpenDetail={id => { setSelectedCommunityPostId(id); navigate("communityDetail"); }}
            onOpenProfile={id => { setSelectedPublicProfileId(id); navigate("publicProfile"); }}
          />
        )}
        {screen === "communityDetail" && selectedCommunityPostId ? (
          <CommunityPostDetailScreen
            tone={TONES.communityDetail}
            token={token}
            post={posts.find(item => item.id === selectedCommunityPostId) ?? null}
            onBack={() => navigate("community")}
            onSignIn={signIn}
            onRefresh={loadScreen}
            onOpenProfile={id => { setSelectedPublicProfileId(id); navigate("publicProfile"); }}
            onLike={async post => { if (!token) return void signIn(); await likeCommunityPost(token, Number(post.id)); await loadScreen(); }}
            onReport={async post => { if (!token) return void signIn(); await reportCommunityPost(token, { postId: Number(post.id), reason: "other" }); Alert.alert("Meldung gespeichert", "Die Meldung wurde zur Prüfung weitergeleitet."); }}
            onBlock={async post => { if (!token) return void signIn(); await blockCommunityUser(token, Number(post.author.id)); await loadScreen(); navigate("community"); }}
          />
        ) : null}
        {screen === "notifications" && (
          <NotificationsScreen
            tone={TONES.notifications}
            token={token}
            notifications={notifications}
            state={state}
            error={error}
            refresh={loadScreen}
            navigate={navigate}
            onUnreadChange={async () => { if (token) setUnreadNotifications((await notificationUnreadCount(token)).count); }}
          />
        )}
        {screen === "messages" && (
          <MessagesScreen
            tone={TONES.messages}
            token={token}
            account={account}
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            thread={directThread}
            targetProfile={messageTargetProfile}
            state={state}
            error={error}
            refresh={loadScreen}
            onSelect={async conversation => {
              if (!token) return;
              setSelectedConversationId(conversation.id);
              setDirectThread((await directMessages(token, Number(conversation.id))).items);
              await markDirectConversationRead(token, Number(conversation.id));
              setUnreadMessages((await directUnreadCount(token)).count);
              setConversations(current => current.map(item => item.id === conversation.id ? { ...item, unreadCount: 0 } : item));
            }}
            onStart={async content => {
              if (!token || !messageTargetProfile) return;
              const result = await startDirectConversation(token, { recipientId: messageTargetProfile.id, content });
              setMessageTargetProfile(null);
              setSelectedConversationId(result.conversationId);
              const rows = await directConversations(token);
              setConversations(rows);
              setDirectThread((await directMessages(token, Number(result.conversationId))).items);
            }}
            onSend={async content => {
              if (!token || !selectedConversationId) return;
              await sendDirectMessage(token, { conversationId: Number(selectedConversationId), content });
              setDirectThread((await directMessages(token, Number(selectedConversationId))).items);
              setConversations(await directConversations(token));
            }}
            onSignIn={signIn}
          />
        )}
        {screen === "care" && (
          <CareScreen
            tone={TONES.care}
            token={token}
            tasks={careTasks}
            plans={carePlans}
            journal={careJournal}
            habitats={habitats}
            state={state}
            error={error}
            refresh={loadScreen}
            onSignIn={signIn}
          />
        )}
        {screen === "feedback" && <FeedbackScreen tone={TONES.feedback} token={token} onSignIn={signIn} />}
        {screen === "pro" && <NativeProScreen tone={TONES.pro} token={token} onBack={() => navigate("management")} />}
        {screen === "management" && (
          <ManagementScreen
            tone={TONES.management}
            token={token}
            account={account}
            navigate={navigate}
            onSignIn={signIn}
          />
        )}
        {screen === "dashboard" && (
          <NativeDashboardScreen
            tone={TONES.dashboard}
            token={token}
            account={account}
            analytics={analytics}
            adminFeedback={adminFeedback}
            adminPartnerInquiries={adminPartnerInquiries}
            state={state}
            error={error}
            refresh={loadScreen}
            onBack={() => navigate("management")}
            onSignIn={signIn}
          />
        )}
        {screen === "profile" && (
          <ProfileScreen
            tone={TONES.profile}
            token={token}
            account={account}
            habitats={habitats}
            consents={consents}
            experience={experience}
            visibleKinds={visibleKinds}
            menuTarget={profileMenuTarget}
            onToggleVisibleKind={kind => setVisibleKinds(current => current.includes(kind) ? current.length > 1 ? current.filter(value => value !== kind) : current : [...current, kind])}
            state={state}
            error={error}
            onSignIn={signIn}
            onSignOut={signOut}
            onExportData={exportAccount}
            onUpdateProfile={async input => { if (!token) return; await updateProfile(token, input); await refreshPrivate(token); }}
            onSetConsent={async (purpose, granted) => { if (!token) return; await setProfileConsent(token, { purpose, granted, policyVersion: "privacy-2026-09-16-v1" }); await refreshPrivate(token); }}
            onUploadAvatar={async (base64, mimeType) => { if (!token) return; await uploadProfileAvatar(token, { base64, mimeType }); await refreshPrivate(token); }}
            onCollection={openCollection}
            navigate={navigate}
          />
        )}
        {screen === "collection" && (
          <CollectionScreen
            tone={tone}
            token={token}
            habitats={habitats}
            initialRealm={collectionRealm}
            prefill={collectionPrefill}
            onSignIn={signIn}
            onSaved={refreshPrivate}
          />
        )}
        {screen === "search" && (
          <SearchScreen
            tone={TONES.search}
            products={products}
            articles={articles}
            state={state}
            error={error}
            refresh={loadScreen}
            navigate={navigate}
            onOpenProfile={id => { setSelectedPublicProfileId(id); navigate("publicProfile"); }}
            onOpenTaxon={id => { setSelectedTaxonId(id); navigate("taxon"); }}
            onOpenAquariumTaxon={id => { setSelectedAquariumTaxonId(id); navigate("aquariumTaxon"); }}
            onOpenTerrariumTaxon={id => { setSelectedTerrariumTaxonId(id); navigate("terrariumTaxon"); }}
            onOpenCatalog={realm => { setCatalogRealm(realm); navigate("catalogOverview"); }}
          />
        )}
        {screen === "catalogOverview" && (
          <CatalogOverviewScreen
            tone={TONES[catalogRealm]}
            realm={catalogRealm}
            onBack={() => navigate("search")}
            onOpenTaxon={id => { setSelectedTaxonId(id); navigate("taxon"); }}
            onOpenAquariumTaxon={id => { setSelectedAquariumTaxonId(id); navigate("aquariumTaxon"); }}
            onOpenTerrariumTaxon={id => { setSelectedTerrariumTaxonId(id); navigate("terrariumTaxon"); }}
          />
        )}
        {screen === "publicProfile" && selectedPublicProfileId ? <PublicProfileScreen tone={TONES.publicProfile} token={token} profileId={selectedPublicProfileId} onBack={() => navigate("search")} onSignIn={signIn} onOpenProfile={id => { setSelectedPublicProfileId(id); navigate("publicProfile"); }} onMessage={profile => { setMessageTargetProfile(profile); navigate("messages"); }} /> : null}
        {screen === "taxon" && selectedTaxonId ? <TaxonScreen tone={TONES.taxon} token={token} taxonId={selectedTaxonId} onBack={() => navigate("search")} onOpenCollection={openCollectionFromTaxon} /> : null}
        {screen === "aquariumTaxon" && selectedAquariumTaxonId ? <AquariumTaxonScreen tone={TONES.aquariumTaxon} token={token} taxonId={selectedAquariumTaxonId} onBack={() => navigate("search")} onOpenCollection={openCollectionFromTaxon} /> : null}
        {screen === "terrariumTaxon" && selectedTerrariumTaxonId ? <TerrariumTaxonScreen tone={TONES.terrariumTaxon} token={token} taxonId={selectedTerrariumTaxonId} onBack={() => navigate("search")} onOpenCollection={openCollectionFromTaxon} /> : null}
        {screen === "saved" ? <SavedScreen tone={TONES.saved} token={token} onBack={() => navigate("profile")} onSignIn={signIn} navigate={navigate} onOpenProfile={id => { setSelectedPublicProfileId(id); navigate("publicProfile"); }} onOpenTaxon={id => { setSelectedTaxonId(id); navigate("taxon"); }} onOpenAquariumTaxon={id => { setSelectedAquariumTaxonId(id); navigate("aquariumTaxon"); }} /> : null}
        {screen === "ranking" ? <RankingScreen tone={TONES.ranking} token={token} onBack={() => navigate("profile")} onSignIn={signIn} /> : null}
      </View>
      <BottomNavigation
        active={tone.active}
        inset={insets.bottom}
        onSelect={next => navigate(next)}
      />
    </SafeAreaView>
  );
}

function Header({
  tone,
  account,
  onSearch,
  onMarketplace,
  onNotifications,
  onMessages,
  unreadNotifications,
  unreadMessages,
  onCare,
  onFeedback,
  onProfileTarget,
}: {
  tone: Tone;
  account: Account | null;
  onSearch: () => void;
  onMarketplace: () => void;
  onNotifications: () => void;
  onMessages: () => void;
  unreadNotifications: number;
  unreadMessages: number;
  onCare: () => void;
  onFeedback: () => void;
  onProfileTarget: (target: ProfileMenuTarget) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <View style={[styles.header, { borderBottomColor: `${tone.accent}55` }]}>
      <View style={styles.brandRow}>
        <View style={[styles.brandMark, { borderColor: `${tone.accent}66` }]}>
          <Image
            source={require("./assets/icon.png")}
            style={styles.brandImage}
            accessibilityLabel="BlackWaterLeaf Originalmarke"
          />
        </View>
        <View>
          <Text style={styles.brand}>BLACKWATERLEAF</Text>
          <Text style={[styles.technical, { color: tone.accent }]}>
            {tone.label}
          </Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <HeaderAction
          icon="search-outline"
          color={tone.accent}
          label="Suche"
          onPress={onSearch}
        />
        <HeaderAction
          icon="notifications-outline"
          color={tone.accent}
          label="Benachrichtigungen"
          badge={unreadNotifications}
          onPress={onNotifications}
        />
        <HeaderAction icon="chatbubble-ellipses-outline" color={c.botany} label="Feedback, Probleme und Wünsche" onPress={onFeedback} />
        <HeaderAction
          icon={account ? "person" : "person-outline"}
          color={account ? tone.accent : c.muted}
          label="Profil"
          onPress={() => setMenuOpen(current => !current)}
        />
      </View>
      {menuOpen ? <View style={[styles.nativeProfileMenu, { borderColor: `${tone.accent}88`, backgroundColor: "#07170d" }]}>
        <Text style={[styles.chip, { color: tone.accent }]}>PROFIL · MENÜ</Text>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onProfileTarget("open"); }}><Ionicons name="person-outline" size={21} color={tone.accent} /><Text style={styles.nativeProfileMenuText}>Profil öffnen</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onProfileTarget("manage"); }}><Ionicons name="settings-outline" size={21} color={tone.accent} /><Text style={styles.nativeProfileMenuText}>Verwalten · alle Einstellungen</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onMessages(); }}><Ionicons name="mail-outline" size={21} color={tone.accent} /><Text style={styles.nativeProfileMenuText}>Postfach</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onMarketplace(); }}><Ionicons name="storefront-outline" size={21} color={c.aqua} /><Text style={styles.nativeProfileMenuText}>Marketplace</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onCare(); }}><Ionicons name="leaf-outline" size={21} color={tone.accent} /><Text style={styles.nativeProfileMenuText}>Heute · Pflegeaufgaben</Text></Pressable>
      </View> : null}
    </View>
  );
}

function HeaderAction({
  icon,
  color,
  label,
  badge = 0,
  onPress,
}: {
  icon: IconName;
  color: string;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
    >
      <View style={styles.headerActionIconWrap}><Ionicons name={icon} size={19} color={color} />{badge > 0 ? <Text style={[styles.headerUnreadBadge, { backgroundColor: color }]}>{badge > 9 ? "9+" : badge}</Text> : null}</View>
    </Pressable>
  );
}

function Home({
  platform,
  habitats,
  state,
  error,
  refresh,
  navigate,
}: {
  platform: PlatformAvailability | null;
  habitats: Habitat[];
  state: State;
  error: string | null;
  refresh: () => Promise<void>;
  navigate: (screen: Screen) => void;
}) {
  return (
    <Page refresh={refresh} refreshing={state === "loading"}>
      <HomeHero tone={TONES.home} navigate={navigate} />
      <HomeStatusStrip tone={TONES.home} />
      {state === "error" ? (
        <ErrorNotice text={error ?? "Daten konnten nicht geladen werden."} />
      ) : null}
      <SectionLabel
        tone={TONES.home}
        overline="DEIN ÜBERBLICK"
        title="DEINE BEREICHE"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Alle Bereiche öffnen"
        onPress={() => navigate("explore")}
        style={({ pressed }) => [styles.homeAllAreas, pressed && styles.pressed]}
      >
        <Text style={[styles.homeAllAreasText, { color: TONES.home.accent }]}>ALLE BEREICHE</Text>
        <Ionicons name="arrow-forward" size={15} color={TONES.home.accent} />
      </Pressable>
      <LiveHomeWorlds
        tone={TONES.home}
        aiAvailable={platform?.aiAssistant === "available"}
        navigate={navigate}
      />
      <Truth tone={TONES.home} />
    </Page>
  );
}

function HomeStatusStrip({ tone }: { tone: Tone }) {
  const items = [
    { icon: "water-outline" as IconName, label: "WASSER", value: "KEINE QUELLE" },
    { icon: "leaf-outline" as IconName, label: "LUFT", value: "KEINE QUELLE" },
    { icon: "flask-outline" as IconName, label: "pH-WERT", value: "NICHT VERFÜGBAR" },
    { icon: "rainy-outline" as IconName, label: "WETTER", value: "NICHT VERFÜGBAR" },
  ];
  return (
    <View style={[styles.homeStatusStrip, { borderColor: `${tone.accent}55`, backgroundColor: "rgba(4,20,11,.9)" }]}>
      {items.map(item => (
        <View key={item.label} style={styles.homeStatusItem}>
          <Ionicons name={item.icon} size={18} color={tone.accent} />
          <Text style={[styles.homeStatusLabel, { color: tone.accent }]}>{item.label}</Text>
          <Text style={styles.homeStatusValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

function HomeHero({
  tone,
  navigate,
}: {
  tone: Tone;
  navigate: (screen: Screen) => void;
}) {
  return (
    <ImageBackground
      source={tone.image}
      style={[styles.observatoryContextHeader, styles.homeContextHeader, { borderColor: `${tone.accent}99` }]}
      imageStyle={styles.observatoryContextImage}
    >
      <View style={styles.observatoryContextShade} />
      <View style={styles.observatoryContextCopy}>
        <View style={[styles.observatoryContextIcon, { borderColor: `${tone.accent}99`, backgroundColor: `${tone.accent}18` }]}>
          <Ionicons name="leaf-outline" size={24} color={tone.accent} />
        </View>
        <Text style={[styles.eyebrow, { color: tone.accent }]}>BLACKWATERLEAF · OBSERVATORY</Text>
        <Text style={styles.observatoryContextTitle}>WASSER. WISSEN. LEBEN.</Text>
        <Text style={styles.observatoryContextText}>Dein bildstarker Einstieg in Wasserwelten, Artenwissen und echte Beobachtungen.</Text>
        <View style={styles.homeContextActions}>
          <PrimaryButton tone={tone} label="ENTDECKEN" icon="arrow-forward" onPress={() => navigate("explore")} />
          <SecondaryButton tone={tone} label="MEIN BEREICH" icon="person-outline" onPress={() => navigate("profile")} />
        </View>
      </View>
    </ImageBackground>
  );
}

function LiveHomeWorlds({
  tone,
  aiAvailable,
  navigate,
}: {
  tone: Tone;
  aiAvailable: boolean;
  navigate: (screen: Screen) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const chooseWorld = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(current => current === title ? null : title);
  };
  const worlds: Action[] = [
    { title: "Botanik", note: "Pflanzen & Wissen", icon: "leaf-outline", image: ASSETS.botany, area: "botany", onPress: () => chooseWorld("Botanik") },
    { title: "Aquaristik", note: "Becken & Wasserwerte", icon: "fish-outline", image: ASSETS.aquarium, area: "aquarium", onPress: () => chooseWorld("Aquaristik") },
    { title: "Terraristik", note: "Regenwald im Kleinen", icon: "leaf-outline", image: ASSETS.terrarium, area: "terrarium", onPress: () => chooseWorld("Terraristik") },
    { title: "KI-Assistent", note: aiAvailable ? "Sichere KI-Hilfe" : "Status transparent prüfen", icon: "hardware-chip-outline", image: ASSETS.ai, area: "assistant", onPress: () => chooseWorld("KI-Assistent") },
  ];
  const choices: Record<string, Action[]> = {
    Botanik: [
      { title: "Pflanzen öffnen", note: "Private Sammlung verwalten", icon: "leaf-outline", image: ASSETS.botany, area: "botany", onPress: () => navigate("botany") },
      { title: "Pflanze bestimmen", note: "Einzelbild mit KI prüfen", icon: "scan-outline", image: ASSETS.botany, area: "assistant", onPress: () => navigate("assistant") },
      { title: "Pflegewissen", note: "Quellen und Wissen öffnen", icon: "book-outline", image: ASSETS.terrarium, area: "botany", onPress: () => navigate("knowledge") },
    ],
    Aquaristik: [
      { title: "Aquarien öffnen", note: "Private Becken verwalten", icon: "fish-outline", image: ASSETS.aquarium, area: "aquarium", onPress: () => navigate("aquarium") },
      { title: "Wasserwerte", note: "Echte Werte und Live-Bereich", icon: "flask-outline", image: ASSETS.aquarium, area: "aquarium", onPress: () => navigate("live") },
      { title: "KI zur Aquaristik", note: "Eigenes Becken analysieren", icon: "hardware-chip-outline", image: ASSETS.ai, area: "assistant", onPress: () => navigate("assistant") },
    ],
    Terraristik: [
      { title: "Terrarien öffnen", note: "Private Anlagen verwalten", icon: "leaf-outline", image: ASSETS.terrarium, area: "terrarium", onPress: () => navigate("terrarium") },
      { title: "Moment erfassen", note: "Private Aufnahme anlegen", icon: "camera-outline", image: ASSETS.terrarium, area: "terrarium", onPress: () => navigate("photo") },
      { title: "Terraristik fragen", note: "KI-Unterstützung öffnen", icon: "chatbubbles-outline", image: ASSETS.ai, area: "assistant", onPress: () => navigate("assistant") },
    ],
    "KI-Assistent": [
      { title: "Frage stellen", note: "Gespräch beginnen", icon: "send-outline", image: ASSETS.ai, area: "assistant", onPress: () => navigate("assistant") },
      { title: "Pflanze bestimmen", note: "Foto sicher prüfen", icon: "scan-outline", image: ASSETS.botany, area: "assistant", onPress: () => navigate("assistant") },
      { title: "Aquarium verstehen", note: "Eigene Werte analysieren", icon: "fish-outline", image: ASSETS.aquarium, area: "assistant", onPress: () => navigate("assistant") },
    ],
  };
  const selectedTone = selected === "Aquaristik"
    ? TONES.aquarium
    : selected === "Terraristik"
      ? TONES.terrarium
      : selected === "KI-Assistent"
        ? TONES.assistant
        : TONES.botany;
  return (
    <View style={styles.liveWorlds}>
      <View style={styles.grid}>
        {worlds.map(world => (
          <ObservatoryActionRow key={world.title} tone={tone} action={world} active={selected === world.title} imageMode visual />
        ))}
      </View>
      {selected ? (
        <View style={[styles.inlineChoice, { borderColor: `${selectedTone.accent}77`, backgroundColor: `${selectedTone.panel}E6`, shadowColor: selectedTone.accent, ...NATIVE_GLOW }]}>
          <View style={styles.inlineChoiceHeader}>
            <Text style={[styles.chip, { color: selectedTone.accent }]}>AUSWAHL · {selected.toUpperCase()}</Text>
            <Pressable accessibilityLabel="Auswahl schließen" onPress={() => setSelected(null)}><Ionicons name="close" size={18} color={selectedTone.accent} /></Pressable>
          </View>
          <View style={[styles.grid, styles.gridCompact]}>
            {(choices[selected] ?? []).map(choice => <ObservatoryActionRow key={choice.title} tone={selectedTone} action={choice} compact imageMode visual />)}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Explore({
  token,
  navigate,
  observations,
  loading,
  error,
  refresh,
}: {
  token: string | null;
  navigate: (screen: Screen) => void;
  observations: Observation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}) {
  const tone = TONES.explore;
  const [realm, setRealm] = useState<"all" | "botany" | "aquarium" | "terrarium">("all");
  const [view, setView] = useState<"map" | "list">("map");
  const realmLabels = { all: "Alle", botany: "Botanik", aquarium: "Aquaristik", terrarium: "Terraristik" } as const;
  const filtered = realm === "all" ? observations : observations.filter(item => item.realm === realm);
  const iconFor = (value: Observation["realm"]): IconName => value === "aquarium" ? "fish-outline" : value === "terrarium" ? "leaf-outline" : "leaf-outline";
  return (
    <Page refresh={refresh} refreshing={loading}>
      <ObservatoryContextHeader tone={tone} eyebrow="KARTE & LISTE · SYNCHRONISIERT" title="BEOBACHTEN. EINORDNEN. TEILEN." subtitle="Freigegebene Beobachtungen werden für alle drei Fachbereiche gleich behandelt. Private Orte bleiben privat." icon="map-outline" />
      <View style={styles.explorePortalRow}>
        {[
          { label: "Botanik", screen: "botany" as Screen, icon: "leaf-outline" as IconName, image: ASSETS.botany, color: TONES.botany.accent },
          { label: "Aquaristik", screen: "aquarium" as Screen, icon: "fish-outline" as IconName, image: ASSETS.aquarium, color: TONES.aquarium.accent },
          { label: "Terraristik", screen: "terrarium" as Screen, icon: "leaf-outline" as IconName, image: ASSETS.terrarium, color: TONES.terrarium.accent },
        ].map(item => <Pressable key={item.label} onPress={() => navigate(item.screen)} style={({ pressed }) => [styles.explorePortalCard, { borderColor: `${item.color}66` }, pressed && styles.pressed]}><ImageBackground source={item.image} style={styles.explorePortalImage} imageStyle={styles.explorePortalImageStyle}><View style={styles.explorePortalShade} /><Ionicons name={item.icon} size={21} color={item.color} /><Text style={styles.explorePortalLabel}>{item.label}</Text></ImageBackground></Pressable>)}
      </View>
      <View style={[styles.explorePanel, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>
        <View style={styles.explorePanelHeader}><View style={styles.flex}><Text style={[styles.chip, { color: tone.accent }]}>KARTE & LISTE · {realmLabels[realm].toUpperCase()}</Text><Text style={styles.cardTitle}>Freigegebene Beobachtungen</Text></View><View style={[styles.exploreStatus, { borderColor: `${tone.accent}66` }]}><View style={[styles.exploreStatusDot, { backgroundColor: error ? c.danger : loading ? c.gold : tone.accent }]} /><Text style={[styles.miniCopy, { color: error ? c.danger : tone.accent }]}>{error ? "FEHLER" : loading ? "SYNC …" : "BEREIT"}</Text></View></View>
        <View style={styles.exploreFilterRow}>{(Object.keys(realmLabels) as Array<keyof typeof realmLabels>).map(key => <Pressable key={key} onPress={() => setRealm(key)} accessibilityRole="button" accessibilityState={{ selected: realm === key }} style={[styles.exploreFilter, { borderColor: realm === key ? tone.accent : `${tone.accent}33`, backgroundColor: realm === key ? `${tone.accent}20` : "rgba(0,0,0,.18)" }]}><Text style={[styles.exploreFilterText, { color: realm === key ? tone.accent : c.muted }]}>{realmLabels[key]}</Text></Pressable>)}</View>
        <View style={styles.exploreViewRow}><Pressable onPress={() => setView("map")} style={[styles.exploreViewButton, { borderColor: view === "map" ? tone.accent : `${tone.accent}33`, backgroundColor: view === "map" ? `${tone.accent}20` : "transparent" }]}><Ionicons name="map-outline" size={16} color={view === "map" ? tone.accent : c.muted} /><Text style={[styles.exploreFilterText, { color: view === "map" ? tone.accent : c.muted }]}>Karte</Text></Pressable><Pressable onPress={() => setView("list")} style={[styles.exploreViewButton, { borderColor: view === "list" ? tone.accent : `${tone.accent}33`, backgroundColor: view === "list" ? `${tone.accent}20` : "transparent" }]}><Ionicons name="list-outline" size={16} color={view === "list" ? tone.accent : c.muted} /><Text style={[styles.exploreFilterText, { color: view === "list" ? tone.accent : c.muted }]}>Liste</Text></Pressable></View>
        {view === "map" ? <View style={[styles.exploreMap, { borderColor: `${tone.accent}66` }]}><ImageBackground source={ASSETS.aquarium} style={styles.exploreMapImage} imageStyle={styles.exploreMapImageStyle}><View style={styles.exploreMapShade} /><View style={styles.exploreEmpty}><Ionicons name="location-outline" size={27} color={tone.accent} /><Text style={styles.cardTitle}>Keine Kartenpunkte freigegeben</Text><Text style={styles.copy}>Dieser Datenstand enthält keine ausdrücklich zulässigen generalisierten Ortsdaten. Die Beobachtungsliste bleibt nutzbar.</Text></View><Text style={styles.exploreMapCaption}>Geschützte Orte · genaue Positionen privat</Text></ImageBackground></View> : null}
        {view === "list" || !filtered.length ? <View style={styles.exploreObservationList}>{loading ? <Text style={styles.copy}>Beobachtungen werden synchronisiert …</Text> : error ? <Text style={[styles.copy, { color: c.danger }]}>Beobachtungen derzeit nicht erreichbar. Katalog und private Daten bleiben getrennt.</Text> : filtered.length ? filtered.map(item => <View key={item.id} style={[styles.exploreObservationRow, { borderColor: `${tone.accent}33` }]}><View style={[styles.exploreObservationIcon, { borderColor: `${tone.accent}66` }]}><Ionicons name={iconFor(item.realm)} size={18} color={tone.accent} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{item.scientificName ?? item.subject ?? "Unbestimmte Beobachtung"}</Text><Text style={styles.copy}>{realmLabels[item.realm]} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString("de-DE") : "Datum nicht verfügbar"}</Text></View><Text style={[styles.miniCopy, { color: tone.accent }]}>ÖFFENTLICH</Text><NativeObservationResponsePanel token={token} observationId={Number(item.id)} accent={tone.accent} /></View>) : <Text style={styles.copy}>Noch keine öffentlichen Beobachtungen in diesem Bereich. Private Daten bleiben geschützt.</Text>}</View> : null}
      </View>
      <View style={[styles.divider, { borderColor: `${tone.accent}55` }]}><Text style={[styles.dividerText, { color: tone.accent }]}>WISSEN & EVIDENZ</Text></View>
      <ObservatoryActionRow tone={tone} action={{ title: "Wissen & Quellen", note: "Veröffentlichte Quellen prüfen", icon: "book-outline", image: ASSETS.botany, onPress: () => navigate("knowledge") }} />
    </Page>
  );
}

function NativeObservationResponsePanel({ token, observationId, accent }: { token: string | null; observationId: number; accent: string }) {
  const [items, setItems] = useState<Array<{ id: number; kind: string; proposedScientificName: string | null; content: string | null }>>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { if (!token) return; setItems(await observationResponses(token, observationId)); }, [token, observationId]);
  useEffect(() => { void load(); }, [load]);
  if (!token) return <Text style={styles.miniCopy}>ANMELDEN FÜR ANTWORTEN</Text>;
  const send = async (kind: "confirm" | "taxon_suggestion" | "question") => { if (kind !== "confirm" && !draft.trim()) return; setBusy(true); try { await respondToObservation(token, { observationId, kind, proposedScientificName: kind === "taxon_suggestion" ? draft.trim() : null, content: kind === "question" ? draft.trim() : null }); setDraft(""); await load(); } finally { setBusy(false); } };
  return <View style={styles.nativeResponsePanel}><Text style={[styles.miniCopy, { color: accent }]}>{items.length} ANTWORTEN · NICHT VERIFIZIERT</Text><View style={styles.nativeResponseActions}><Pressable onPress={() => void send("confirm")} disabled={busy} style={[styles.nativeResponseButton, { borderColor: `${accent}66` }]}><Ionicons name="checkmark-outline" size={14} color={accent} /></Pressable><TextInput value={draft} onChangeText={setDraft} placeholder="Taxon-Vorschlag oder Frage …" placeholderTextColor={c.muted} style={styles.nativeResponseInput} /><Pressable onPress={() => void send(draft.includes("?") ? "question" : "taxon_suggestion")} disabled={busy || !draft.trim()} style={[styles.nativeResponseButton, { borderColor: `${accent}66` }]}><Ionicons name="send-outline" size={14} color={accent} /></Pressable></View></View>;
}

function WorldScreen({
  tone,
  realm,
  observations,
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  tone: Tone;
  realm: Realm;
  observations: Observation[];
  eyebrow: string;
  title: string;
  subtitle: string;
  actions: Action[];
}) {
  const [view, setView] = useState<"map" | "list">("map");
  const visibleObservations = observations.filter(item => item.realm === realm);
  return (
    <Page>
      <ObservatoryContextHeader
        tone={tone}
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        icon={
          tone === TONES.aquarium
            ? "fish-outline"
            : tone === TONES.terrarium
              ? "leaf-outline"
              : "leaf-outline"
        }
      />
      <SectionLabel
        tone={tone}
        overline="DEINE AUSWAHL"
        title="WÄHLE EINEN BEREICH"
      />
      <ObservatoryActionCluster tone={tone} actions={actions} visual />
      <View style={[styles.explorePanel, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>
        <View style={styles.explorePanelHeader}><View style={styles.flex}><Text style={[styles.chip, { color: tone.accent }]}>KARTE & LISTE · SYNCHRONISIERT</Text><Text style={styles.cardTitle}>BEOBACHTEN. EINORDNEN. TEILEN.</Text></View><View style={[styles.exploreStatus, { borderColor: `${tone.accent}66` }]}><View style={[styles.exploreStatusDot, { backgroundColor: tone.accent }]} /><Text style={[styles.miniCopy, { color: tone.accent }]}>BEREIT</Text></View></View>
        <View style={styles.exploreViewRow}><Pressable onPress={() => setView("map")} style={[styles.exploreViewButton, { borderColor: view === "map" ? tone.accent : `${tone.accent}33`, backgroundColor: view === "map" ? `${tone.accent}20` : "transparent" }]}><Ionicons name="map-outline" size={16} color={view === "map" ? tone.accent : c.muted} /><Text style={[styles.exploreFilterText, { color: view === "map" ? tone.accent : c.muted }]}>Karte</Text></Pressable><Pressable onPress={() => setView("list")} style={[styles.exploreViewButton, { borderColor: view === "list" ? tone.accent : `${tone.accent}33`, backgroundColor: view === "list" ? `${tone.accent}20` : "transparent" }]}><Ionicons name="list-outline" size={16} color={view === "list" ? tone.accent : c.muted} /><Text style={[styles.exploreFilterText, { color: view === "list" ? tone.accent : c.muted }]}>Liste</Text></Pressable></View>
        {view === "map" ? <View style={[styles.exploreMap, { borderColor: `${tone.accent}66` }]}><ImageBackground source={realm === "aquarium" ? ASSETS.aquarium : realm === "terrarium" ? ASSETS.terrarium : ASSETS.botany} style={styles.exploreMapImage} imageStyle={styles.exploreMapImageStyle}><View style={styles.exploreMapShade} /><View style={styles.exploreEmpty}><Ionicons name="location-outline" size={27} color={tone.accent} /><Text style={styles.cardTitle}>Keine Kartenpunkte freigegeben</Text><Text style={styles.copy}>Dieser Datenstand enthält keine ausdrücklich zulässigen generalisierten Ortsdaten.</Text></View><Text style={styles.exploreMapCaption}>Geschützte Orte · genaue Positionen privat</Text></ImageBackground></View> : null}
        {view === "list" || !visibleObservations.length ? <View style={styles.exploreObservationList}>{visibleObservations.length ? visibleObservations.slice(0, 5).map(item => <View key={item.id} style={[styles.exploreObservationRow, { borderColor: `${tone.accent}33` }]}><View style={[styles.exploreObservationIcon, { borderColor: `${tone.accent}66` }]}><Ionicons name={realm === "aquarium" ? "fish-outline" : "leaf-outline"} size={18} color={tone.accent} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{item.scientificName ?? item.subject ?? "Unbestimmte Beobachtung"}</Text><Text style={styles.copy}>Öffentlich · Ortsangabe geschützt</Text></View><Text style={[styles.miniCopy, { color: tone.accent }]}>BEREIT</Text></View>) : <Text style={styles.copy}>Noch keine öffentlichen Beobachtungen in diesem Bereich. Private Daten bleiben geschützt.</Text>}</View> : null}
      </View>
    </Page>
  );
}

function AssistantScreen({
  token,
  habitats,
  platform,
  consents,
  onRefreshPrivate,
  onSignIn,
  tone,
  navigate,
}: {
  token: string | null;
  habitats: Habitat[];
  platform: PlatformAvailability | null;
  consents: ProfileConsent[];
  onRefreshPrivate: () => Promise<void>;
  onSignIn: () => Promise<void>;
  tone: Tone;
  navigate: (screen: Screen) => void;
}) {
  const [tool, setTool] = useState<"chat" | "plant" | "aquarium">("chat");
  const [selectionCollapsed, setSelectionCollapsed] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [question, setQuestion] = useState("");
  const [photos, setPhotos] = useState<PlantPhoto[]>([]);
  const [plantNote, setPlantNote] = useState("");
  const [plantAnswer, setPlantAnswer] = useState<string | null>(null);
  const [plantUsageId, setPlantUsageId] = useState<number | null>(null);
  const [needsMorePhotos, setNeedsMorePhotos] = useState(false);
  const [requestedPhotos, setRequestedPhotos] = useState(0);
  const [correctionName, setCorrectionName] = useState("");
  const [correctionNote, setCorrectionNote] = useState("");
  const [selectedAquarium, setSelectedAquarium] = useState<number | null>(null);
  const [aquariumQuestion, setAquariumQuestion] = useState("");
  const [aquariumAnswer, setAquariumAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const aiConsent = consents.some(
    item => item.purpose === "ai_processing" && item.granted
  );
  const aiReady = platform?.aiAssistant === "available";
  const aquariums = habitats.filter(item => item.kind === "aquarium");
  const activeToolLabel =
    tool === "plant"
      ? "PFLANZE BESTIMMEN"
      : tool === "aquarium"
        ? "AQUARIUM VERSTEHEN"
        : "FRAGE STELLEN";

  const chooseTool = (nextTool: "chat" | "plant" | "aquarium") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTool(nextTool);
    setSelectionCollapsed(true);
  };

  const showAllTools = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionCollapsed(false);
  };

  useEffect(() => {
    if (!selectedAquarium && aquariums[0]) setSelectedAquarium(aquariums[0].id);
  }, [aquariums, selectedAquarium]);

  const ensureReady = async () => {
    if (!token) {
      await onSignIn();
      return false;
    }
    if (!aiReady) {
      setMessage(
        platform?.aiReason ??
          "Der KI-Dienst ist derzeit nicht verfügbar. Es werden keine Scheinantworten angezeigt."
      );
      return false;
    }
    if (!aiConsent) {
      setMessage(
        "Bitte bestätige zuerst die KI-Verarbeitung. Du kannst diese Freigabe später im Profil widerrufen."
      );
      return false;
    }
    return true;
  };

  const grantAiConsent = async () => {
    if (!token) {
      await onSignIn();
      return;
    }
    setBusy(true);
    try {
      await setProfileConsent(token, {
        purpose: "ai_processing",
        policyVersion: "native-1.0.8",
        granted: true,
      });
      await onRefreshPrivate();
      setMessage("KI-Verarbeitung wurde für dein Konto freigegeben.");
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Freigabe konnte nicht gespeichert werden."
      );
    } finally {
      setBusy(false);
    }
  };

  const choosePlantPhoto = async (camera: boolean) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage(
        camera
          ? "Kamerafreigabe wurde nicht erteilt."
          : "Medienfreigabe wurde nicht erteilt."
      );
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.7,
          allowsEditing: false,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.7,
          allowsEditing: false,
        });
    if (result.canceled || !result.assets[0]) return;
    if (photos.length >= 3) {
      setMessage("Es sind maximal drei Einzelbilder möglich.");
      return;
    }
    try {
      const asset = result.assets[0];
      const mime =
        asset.mimeType === "image/png" || asset.mimeType === "image/webp"
          ? asset.mimeType
          : "image/jpeg";
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setPhotos(current => [
        ...current,
        { uri: asset.uri, base64, mimeType: mime },
      ]);
      setPlantAnswer(null);
      setPlantUsageId(null);
      setNeedsMorePhotos(false);
      setRequestedPhotos(0);
      setMessage(null);
    } catch {
      setMessage(
        "Das Pflanzenfoto konnte nicht vorbereitet werden. Bitte wähle ein kleineres JPG, PNG oder WebP."
      );
    }
  };

  const sendChat = async () => {
    if (!question.trim() || busy || !(await ensureReady()) || !token) return;
    const text = question.trim();
    setBusy(true);
    setMessage(null);
    setQuestion("");
    try {
      const response = await assistantChat(token, {
        clientRequestId: Crypto.randomUUID(),
        message: text,
        history: messages.slice(-6),
      });
      setMessages(current => [
        ...current,
        { role: "user", content: text },
        {
          role: "assistant",
          content: `${response.answer}\n\n${response.disclaimer}`,
        },
      ]);
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Die KI-Antwort konnte nicht geladen werden."
      );
    } finally {
      setBusy(false);
    }
  };

  const identifyPlant = async () => {
    if (!photos[0] || busy || !(await ensureReady()) || !token) return;
    setBusy(true);
    setMessage(null);
    try {
      const [first, ...additional] = photos;
      const response = await assistantPlantIdentify(token, {
        clientRequestId: Crypto.randomUUID(),
        imageBase64: first.base64,
        mimeType: first.mimeType,
        additionalImages: additional.map(image => ({
          imageBase64: image.base64,
          mimeType: image.mimeType,
        })),
        note: plantNote.trim() || undefined,
      });
      setPlantAnswer(`${response.answer}\n\n${response.disclaimer}`);
      setPlantUsageId(response.assistantUsageId);
      setNeedsMorePhotos(response.needsMoreImages);
      setRequestedPhotos(response.requestedAdditionalImages);
    } catch (cause) {
      const errorMessage = cause instanceof Error ? cause.message : "";
      setMessage(
        errorMessage === "assistant_response_truncated"
          ? "Die KI-Antwort wurde wegen des internen Denkbudgets abgeschnitten. Bitte erneut versuchen."
          : errorMessage === "assistant_empty_response"
            ? "Die KI hat keine auswertbare Antwort geliefert. Bitte ein schärferes Foto oder ein weiteres Einzelbild verwenden."
            : errorMessage || "Die Pflanzenbestimmung konnte nicht durchgeführt werden."
      );
    } finally {
      setBusy(false);
    }
  };

  const analyzeAquarium = async () => {
    if (!selectedAquarium || busy || !(await ensureReady()) || !token) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await assistantAquariumAnalyze(token, {
        clientRequestId: Crypto.randomUUID(),
        habitatId: selectedAquarium,
        question: aquariumQuestion.trim() || undefined,
      });
      setAquariumAnswer(`${response.answer}\n\n${response.disclaimer}`);
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Die Aquarienanalyse konnte nicht durchgeführt werden."
      );
    } finally {
      setBusy(false);
    }
  };

  const sendCorrection = async () => {
    if (!token || !plantAnswer || !correctionName.trim() || busy) return;
    setBusy(true);
    try {
      await submitPlantCorrection(token, {
        assistantUsageId: plantUsageId ?? undefined,
        originalAnswer: plantAnswer,
        correctedName: correctionName.trim(),
        correctionNote: correctionNote.trim() || undefined,
      });
      setCorrectionName("");
      setCorrectionNote("");
      setMessage(
        "Korrektur gespeichert und zur Prüfung an Admins und Moderatoren übergeben. Sie verändert die KI nicht automatisch."
      );
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Die Korrektur konnte nicht gespeichert werden."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page
      key={`assistant-${tool}-${selectionCollapsed ? "compact" : "expanded"}`}
    >
      {selectionCollapsed ? (
        <View
          style={[
            styles.assistantCompactHeader,
            { borderColor: `${tone.accent}66`, backgroundColor: tone.panel },
          ]}
        >
          <View style={styles.assistantCompactHeading}>
            <View
              style={[
                styles.assistantCompactIcon,
                {
                  borderColor: `${tone.accent}88`,
                  backgroundColor: `${tone.accent}16`,
                },
              ]}
            >
              <Ionicons
                name={
                  tool === "plant"
                    ? "scan-outline"
                    : tool === "aquarium"
                      ? "fish-outline"
                      : "send-outline"
                }
                size={20}
                color={tone.accent}
              />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.chip, { color: tone.accent }]}>
                KI-WERKZEUG
              </Text>
              <Text style={styles.assistantCompactTitle}>
                {activeToolLabel}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alle KI-Werkzeuge anzeigen"
            onPress={showAllTools}
            style={({ pressed }) => [
              styles.assistantToolsButton,
              { borderColor: `${tone.accent}66` },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.assistantToolsButtonText, { color: tone.accent }]}
            >
              ALLE WERKZEUGE
            </Text>
            <Ionicons name="grid-outline" size={15} color={tone.accent} />
          </Pressable>
        </View>
      ) : (
        <ObservatoryContextHeader
          tone={tone}
          eyebrow="BLACKWATERLEAF KI"
          title="KI-ASSISTENT"
          subtitle="Echte KI-Hilfe. Keine Scheinantwort. Unsicherheit bleibt sichtbar."
          icon="hardware-chip-outline"
        />
      )}
      <ObservatoryActionCluster
        tone={tone}
        compact={selectionCollapsed}
        activeTitle={activeToolLabel}
        visual
        actions={[
          {
            title: "Frage stellen",
            note: "Gespräch beginnen",
            icon: "send-outline",
            image: ASSETS.ai,
            onPress: () => chooseTool("chat"),
          },
          {
            title: "Pflanze bestimmen",
            note: "Foto sicher prüfen",
            icon: "scan-outline",
            image: ASSETS.botany,
            onPress: () => chooseTool("plant"),
          },
          {
            title: "Aquarium verstehen",
            note: "Eigenes Becken analysieren",
            icon: "fish-outline",
            image: ASSETS.aquarium,
            onPress: () => chooseTool("aquarium"),
          },
          {
            title: "Wissen & Quellen",
            note: "Quellenwissen öffnen",
            icon: "book-outline",
            image: ASSETS.terrarium,
            onPress: () => navigate("knowledge"),
          },
        ]}
      />
      {!token ? (
        <PrivateFeature
          tone={tone}
          title="KI BLEIBT GESCHÜTZT."
          text="Melde dich an, damit Fragen, Pflanzenbilder und private Aquariumdaten deinem Konto zugeordnet bleiben."
          onSignIn={onSignIn}
        />
      ) : !aiReady ? (
        <StatusPanel
          tone={tone}
          icon="shield-checkmark-outline"
          code="KI / TRANSPARENT"
          title="KEINE SCHEINANTWORT"
          text={
            platform?.aiReason ??
            "Der KI-Dienst ist aktuell nicht verfügbar. Es werden keine Antworten erfunden."
          }
        />
      ) : !aiConsent ? (
        <StatusPanel
          tone={tone}
          icon="lock-closed-outline"
          code="KI / FREIGABE"
          title="FREIGABE ERFORDERLICH"
          text="KI-Anfragen und Bilder werden erst nach deiner ausdrücklichen Freigabe verarbeitet."
          actionLabel={busy ? "WIRD GESPEICHERT …" : "KI-VERARBEITUNG ERLAUBEN"}
          onAction={() => void grantAiConsent()}
        />
      ) : (
        <View
          style={[
            styles.workflow,
            { backgroundColor: tone.panel, borderColor: `${tone.accent}66` },
          ]}
        >
          <View style={styles.toolTabs}>
            <ToolTab
              active={tool === "chat"}
              tone={tone}
              icon="send-outline"
              label="Frage"
              onPress={() => setTool("chat")}
            />
            <ToolTab
              active={tool === "plant"}
              tone={tone}
              icon="leaf-outline"
              label="Pflanze"
              onPress={() => setTool("plant")}
            />
            <ToolTab
              active={tool === "aquarium"}
              tone={tone}
              icon="fish-outline"
              label="Aquarium"
              onPress={() => setTool("aquarium")}
            />
          </View>
          {tool === "chat" ? (
            <>
              <SectionLabel
                tone={tone}
                overline="KI / BEREIT"
                title="FRAGE DEINE WELT"
                compact
              />
              {messages.length ? (
                <View style={styles.messageList}>
                  {messages.map((item, index) => (
                    <View
                      key={`${item.role}-${index}`}
                      style={[
                        styles.message,
                        {
                          backgroundColor:
                            item.role === "user"
                              ? `${tone.accent}25`
                              : "rgba(0,0,0,.22)",
                          borderColor: `${tone.accent}44`,
                        },
                      ]}
                    >
                      <Text style={styles.messageRole}>
                        {item.role === "user" ? "DU" : "BLACKWATERLEAF KI"}
                      </Text>
                      <Text style={styles.copy}>{item.content}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <StatusPanel
                  tone={tone}
                  icon="sparkles-outline"
                  code="KI / BEREIT"
                  title="FRAGE DEINE WELT"
                  text="Beschreibe eine Beobachtung oder stelle eine konkrete Frage."
                />
              )}
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: `${tone.accent}66`,
                    backgroundColor: "rgba(0,0,0,.22)",
                  },
                ]}
                value={question}
                onChangeText={setQuestion}
                placeholder="Naturbezogene Frage schreiben …"
                placeholderTextColor={c.muted}
                multiline
                maxLength={1200}
              />
              <PrimaryButton
                tone={tone}
                label={busy ? "ANTWORT WIRD ERSTELLT …" : "FRAGE SICHER SENDEN"}
                icon="send-outline"
                onPress={() => void sendChat()}
                disabled={busy || !question.trim()}
              />
            </>
          ) : tool === "plant" ? (
            <>
              <SectionLabel
                tone={tone}
                overline="BILDPRÜFUNG / 1–3 EINZELBILDER"
                title="PFLANZE BESTIMMEN"
                compact
              />
              <Text style={styles.intro}>
                Beginne mit einem Foto. Wenn entscheidende Merkmale fehlen,
                fragt die KI gezielt nach einem oder zwei weiteren Einzelbildern
                — niemals nach einem 4er-Raster.
              </Text>
              {photos[0] ? (
                <View
                  style={[
                    styles.plantPrimary,
                    { borderColor: `${tone.accent}66` },
                  ]}
                >
                  <Image
                    source={{ uri: photos[0].uri }}
                    style={styles.plantPrimaryImage}
                  />
                  <View style={styles.plantMeta}>
                    <Text style={[styles.chip, { color: tone.accent }]}>
                      FOTO 1 · GESAMTANSICHT
                    </Text>
                    <Text style={styles.copy}>
                      {photos.length} von maximal 3 Einzelbildern
                    </Text>
                  </View>
                  <Pressable
                    style={styles.closePhoto}
                    onPress={() => {
                      setPhotos([]);
                      setPlantAnswer(null);
                      setPlantUsageId(null);
                      setNeedsMorePhotos(false);
                    }}
                  >
                    <Ionicons name="close" color={c.text} size={18} />
                  </Pressable>
                </View>
              ) : (
                <View
                  style={[
                    styles.photoPrompt,
                    {
                      borderColor: `${tone.accent}66`,
                      backgroundColor: "rgba(0,0,0,.18)",
                    },
                  ]}
                >
                  <Ionicons name="leaf-outline" color={tone.accent} size={31} />
                  <Text style={styles.cardTitle}>FOTO 1 AUSWÄHLEN</Text>
                  <Text style={styles.copy}>
                    Zeige möglichst Blatt, Stängel und die gesamte Pflanze.
                  </Text>
                  <View style={styles.inlineButtons}>
                    <SecondaryButton
                      tone={tone}
                      label="KAMERA"
                      icon="camera-outline"
                      onPress={() => void choosePlantPhoto(true)}
                    />
                    <SecondaryButton
                      tone={tone}
                      label="FOTO WÄHLEN"
                      icon="images-outline"
                      onPress={() => void choosePlantPhoto(false)}
                    />
                  </View>
                </View>
              )}
              {photos.length > 1 ? (
                <View style={styles.photoSequence}>
                  {photos.slice(1).map((photo, index) => (
                    <Image
                      key={photo.uri}
                      source={{ uri: photo.uri }}
                      style={styles.photoThumbnail}
                      accessibilityLabel={`Zusatzfoto ${index + 2}`}
                    />
                  ))}
                </View>
              ) : null}
              {photos.length > 0 && needsMorePhotos && photos.length < 3 ? (
                <View style={styles.inlineButtons}>
                  <SecondaryButton
                    tone={tone}
                    label={
                      requestedPhotos === 2
                        ? "ZWEI FOTOS ERGÄNZEN"
                        : "EIN FOTO ERGÄNZEN"
                    }
                    icon="camera-outline"
                    onPress={() => void choosePlantPhoto(false)}
                  />
                </View>
              ) : null}
              <LabeledInput
                tone={tone}
                label="OPTIONALE BEOBACHTUNG"
                value={plantNote}
                onChange={setPlantNote}
                placeholder="Standort, Blattunterseite oder Wuchsform …"
                multiline
              />
              <PrimaryButton
                tone={tone}
                label={
                  busy
                    ? "BILD WIRD GEPRÜFT …"
                    : photos.length > 1
                      ? "PFLANZE MIT BILDERN PRÜFEN"
                      : "PFLANZE MIT KI ANALYSIEREN"
                }
                icon="scan-outline"
                disabled={busy || !photos.length}
                onPress={() => void identifyPlant()}
              />
              {busy ? (
                <View
                  accessibilityRole="progressbar"
                  accessibilityLabel="Pflanzenbild wird von der KI analysiert"
                  style={[styles.analysisLoading, { borderColor: `${tone.accent}66`, backgroundColor: `${tone.accent}12` }]}
                >
                  <ActivityIndicator color={tone.accent} size="small" />
                  <View style={styles.analysisLoadingCopy}>
                    <Text style={[styles.chip, { color: tone.accent }]}>KI / ANALYSE LÄUFT</Text>
                    <Text style={styles.copy}>Bildmerkmale werden geprüft. Bitte die App geöffnet lassen.</Text>
                  </View>
                </View>
              ) : null}
              {plantAnswer ? (
                <>
                  <Result
                    tone={tone}
                    title="VORLÄUFIGE EINORDNUNG"
                    answer={plantAnswer}
                  />
                  <View
                    style={[
                      styles.correction,
                      {
                        borderColor: `${tone.accent}66`,
                        backgroundColor: "rgba(0,0,0,.18)",
                      },
                    ]}
                  >
                    <Text style={[styles.chip, { color: tone.accent }]}>
                      KI-KORREKTUR / PRÜFUNG
                    </Text>
                    <Text style={styles.cardTitle}>
                      LIEGT DIE KI HIER FALSCH?
                    </Text>
                    <Text style={styles.copy}>
                      Deine Korrektur bleibt nachvollziehbar und wird an Admins
                      sowie Moderatoren zur Prüfung übergeben.
                    </Text>
                    <LabeledInput
                      tone={tone}
                      label="RICHTIGE BEZEICHNUNG"
                      value={correctionName}
                      onChange={setCorrectionName}
                      placeholder="Zum Beispiel: Monstera deliciosa"
                    />
                    <LabeledInput
                      tone={tone}
                      label="KURZE BEGRÜNDUNG · OPTIONAL"
                      value={correctionNote}
                      onChange={setCorrectionNote}
                      placeholder="Woran hast du die Pflanze erkannt?"
                      multiline
                    />
                    <SecondaryButton
                      tone={tone}
                      label={
                        busy
                          ? "WIRD GESPEICHERT …"
                          : "KORREKTUR ZUR PRÜFUNG SPEICHERN"
                      }
                      icon="shield-checkmark-outline"
                      disabled={busy || !correctionName.trim()}
                      onPress={() => void sendCorrection()}
                    />
                  </View>
                </>
              ) : null}
            </>
          ) : (
            <>
              <SectionLabel
                tone={tone}
                overline="PRIVAT / EIGENE WERTE"
                title="AQUARIUM VERSTEHEN"
                compact
              />
              <Text style={styles.intro}>
                Die Analyse verwendet ausschließlich das von dir ausgewählte
                private Aquarium. Fehlende Werte bleiben sichtbar und werden
                nicht ergänzt.
              </Text>
              {!aquariums.length ? (
                <StatusPanel
                  tone={tone}
                  icon="fish-outline"
                  code="AQUARIUM / FEHLT"
                  title="NOCH KEIN AQUARIUM ANGELEGT"
                  text="Lege zuerst im Aquaristik-Bereich ein privates Aquarium und seine Daten an."
                  actionLabel="AQUARISTIK ÖFFNEN"
                  onAction={() => navigate("aquarium")}
                />
              ) : (
                <>
                  <View style={styles.aquariumSelect}>
                    {aquariums.map(aquarium => (
                      <Pressable
                        key={aquarium.id}
                        onPress={() => setSelectedAquarium(aquarium.id)}
                        style={({ pressed }) => [
                          styles.aquariumOption,
                          {
                            borderColor:
                              selectedAquarium === aquarium.id
                                ? tone.accent
                                : `${tone.accent}44`,
                            backgroundColor:
                              selectedAquarium === aquarium.id
                                ? `${tone.accent}24`
                                : "rgba(0,0,0,.18)",
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name="fish-outline"
                          size={18}
                          color={tone.accent}
                        />
                        <Text style={styles.cardTitle}>{aquarium.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <LabeledInput
                    tone={tone}
                    label="DEINE FRAGE · OPTIONAL"
                    value={aquariumQuestion}
                    onChange={setAquariumQuestion}
                    placeholder="Welche Angaben sollte ich als Nächstes prüfen?"
                    multiline
                  />
                  <PrimaryButton
                    tone={tone}
                    label={
                      busy
                        ? "AQUARIUM WIRD ANALYSIERT …"
                        : "AQUARIUM MIT KI ANALYSIEREN"
                    }
                    icon="fish-outline"
                    disabled={busy || !selectedAquarium}
                    onPress={() => void analyzeAquarium()}
                  />
                  {aquariumAnswer ? (
                    <Result
                      tone={tone}
                      title="EINORDNUNG DEINES AQUARIUMS"
                      answer={aquariumAnswer}
                    />
                  ) : null}
                </>
              )}
            </>
          )}
          {message ? (
            <Text style={[styles.formMessage, { color: tone.accent }]}>
              {message}
            </Text>
          ) : null}
        </View>
      )}
    </Page>
  );
}

function NativeSelfHostedPlayer({ ticketUrl, token, title }: { ticketUrl: string; token: string; title: string }) {
  const player = useVideoPlayer(
    {
      uri: `${API_ORIGIN}${ticketUrl}`,
      headers: { Authorization: `Bearer ${token}` },
      contentType: "hls",
      metadata: { title, artist: "BlackWaterLeaf Live" },
    },
    instance => {
      instance.play();
    },
  );
  return <VideoView player={player} nativeControls contentFit="contain" style={styles.nativeLiveVideo} accessibilityLabel={`${title} – BlackWaterLeaf Live`} />;
}

function NativeCommunityVideo({ uri, title }: { uri: string; title: string }) {
  const player = useVideoPlayer({ uri, metadata: { title, artist: "BlackWaterLeaf Community" } });
  return <VideoView player={player} nativeControls contentFit="contain" style={styles.postImage} accessibilityLabel={title} />;
}

function LiveScreen({ tone, token, account, onSignIn, navigate }: { tone: Tone; token: string | null; account: Account | null; onSignIn: () => Promise<void>; navigate: (screen: Screen) => void }) {
  const [track, setTrack] = useState<LiveTrack>("community");
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [capabilities, setCapabilities] = useState<LiveCapabilities | null>(null);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadState, setLoadState] = useState<State>("loading");
  const [status, setStatus] = useState<string | null>(null);
  const canManage = account?.role === "admin" || account?.role === "moderator";

  const loadHub = useCallback(async () => {
    if (!token) return;
    setLoadState("loading");
    try {
      const [rows, media] = await Promise.all([liveList(token, track), liveCapabilities(token)]);
      setSessions(rows);
      setCapabilities(media);
      setLoadState("ready");
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Live-Sitzungen konnten nicht geladen werden.");
      setLoadState("error");
    }
  }, [token, track]);

  const loadSession = useCallback(async (id: number) => {
    if (!token) return;
    setBusy(true);
    setStatus(null);
    setTicketUrl(null);
    try {
      const next = await liveById(token, id);
      setSession(next);
      setMessages(await liveMessages(token, id));
      if (next.status === "live" && next.stream?.provider === "self_hosted") {
        const ticket = await liveViewerTicket(token, id);
        setTicketUrl(ticket.url);
      }
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Live-Sitzung konnte nicht geladen werden.");
      setSession(null);
    } finally {
      setBusy(false);
    }
  }, [token]);

  useEffect(() => { if (token) void loadHub(); }, [loadHub, token]);
  useEffect(() => { if (token && selectedId) void loadSession(selectedId); }, [loadSession, selectedId, token]);
  useEffect(() => {
    if (!token || !session || session.status !== "live") return;
    let cancelled = false;
    const heartbeat = async () => {
      const result = await liveViewerPresence(token, Number(session.id)).catch(() => null);
      if (!cancelled && result) setSession(current => current ? { ...current, viewerCount: result.viewerCount } : current);
    };
    const refresh = async () => {
      const [nextMessages, nextSession] = await Promise.all([liveMessages(token, Number(session.id)).catch(() => messages), liveById(token, Number(session.id)).catch(() => session)]);
      if (!cancelled) { setMessages(nextMessages); setSession(nextSession); }
    };
    void heartbeat();
    const heartbeatTimer = setInterval(() => void heartbeat(), 20_000);
    const refreshTimer = setInterval(() => void refresh(), 6_000);
    return () => { cancelled = true; clearInterval(heartbeatTimer); clearInterval(refreshTimer); };
  }, [messages, session?.id, session?.status, token]);

  const send = async () => {
    if (!token || !session || session.status !== "live" || !messageText.trim() || busy) return;
    setBusy(true);
    try {
      await liveSendMessage(token, { sessionId: Number(session.id), content: messageText.trim() });
      setMessageText("");
      setMessages(await liveMessages(token, Number(session.id)));
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Nachricht konnte nicht gesendet werden.");
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (nextStatus: "live" | "ended") => {
    if (!token || !session || !canManage || busy) return;
    setBusy(true);
    try {
      if (nextStatus === "live" && !session.stream) throw new Error("Für den Start wird eine echte Videoquelle benötigt.");
      await liveUpdate(token, { id: Number(session.id), status: nextStatus, ...(nextStatus === "ended" ? { endsAt: new Date().toISOString() } : {}) });
      await Promise.all([loadSession(Number(session.id)), loadHub()]);
      setStatus(nextStatus === "live" ? "Stream gestartet." : "Stream beendet.");
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Live-Status konnte nicht aktualisiert werden.");
    } finally {
      setBusy(false);
    }
  };

  const rotateKey = async () => {
    if (!token || !session || !canManage || session.stream?.provider !== "self_hosted" || busy) return;
    setBusy(true);
    try {
      const receipt = await liveRotateSelfHostedKey(token, Number(session.id));
      setStatus(`Neuer Einspielschlüssel · ${receipt.path} · ${receipt.key}`);
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Schlüssel konnte nicht rotiert werden.");
    } finally {
      setBusy(false);
    }
  };

  if (!token) return <Page><ObservatoryContextHeader tone={tone} eyebrow="LIVE · NUR FÜR MITGLIEDER" title="ECHTE LIVE-SESSIONS." subtitle="Live-Sitzungen, Fachvorträge und der Member-Chat sind nur nach sicherer Anmeldung sichtbar." icon="radio-outline" /><PrivateFeature tone={tone} title="LIVE BLEIBT GESCHÜTZT." text="Melde dich an, damit Streamquellen, Chat und Zuschauerzahlen nur für aktive Konten geladen werden." onSignIn={onSignIn} /></Page>;
  if (selectedId && session) {
    const selfHosted = session.stream?.provider === "self_hosted";
    const external = session.stream && !selfHosted ? session.stream.canonicalUrl : null;
    return <Page refresh={() => loadSession(selectedId)} refreshing={busy}>
      <SecondaryButton tone={tone} label="ZURÜCK ZUM LIVE-HUB" icon="arrow-back-outline" onPress={() => { setSelectedId(null); setSession(null); setMessages([]); }} />
      <ObservatoryContextHeader tone={tone} eyebrow={`${session.track === "expert" ? "FACHVORTRAG · STAFF-ANGELEGT" : "COMMUNITY LIVE · MODERIERT"} · ${session.status.toUpperCase()}`} title={session.title} subtitle={session.description} icon="radio-outline" />
      {canManage ? <View style={[styles.liveControlPanel, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>CONTROL DECK · ECHTZEIT</Text><Text style={styles.cardTitle}>{session.status === "live" ? "STREAM ONLINE" : session.status === "scheduled" ? "BEREIT ZUR SENDUNG" : "STREAM OFFLINE"}</Text><View style={styles.liveMetricRow}><Sensor color={tone.accent} icon="radio-outline" label="STATUS" value={session.status === "live" ? "ONLINE" : session.status.toUpperCase()} note={selfHosted ? "IONOS" : session.stream ? session.stream.provider.toUpperCase() : "QUELLE FEHLT"} /><Sensor color={tone.accent} icon="eye-outline" label="ZUSCHAUENDE" value={String(session.viewerCount)} note="aktive Mitglieder" /><Sensor color={tone.accent} icon="chatbubble-ellipses-outline" label="CHAT" value={session.status === "live" ? "OFFEN" : "ZU"} note="moderiert" /></View><View style={styles.inlineButtons}><PrimaryButton tone={tone} label="STREAM STARTEN" icon="play" disabled={busy || session.status === "live" || session.status === "ended" || !session.stream} onPress={() => void updateStatus("live")} /><SecondaryButton tone={tone} label="STREAM BEENDEN" icon="stop" disabled={busy || session.status !== "live"} onPress={() => void updateStatus("ended")} />{selfHosted ? <SecondaryButton tone={tone} label="SCHLÜSSEL ROTIEREN" icon="refresh-outline" disabled={busy || session.status === "ended"} onPress={() => void rotateKey()} /> : null}</View></View> : null}
      <View style={[styles.liveStage, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}><View style={styles.liveStageMeta}><Text style={[styles.chip, { color: tone.accent }]}>{session.status === "live" ? "LIVE-ÜBERTRAGUNG" : session.status === "scheduled" ? "BEGINN GEPLANT" : "ÜBERTRAGUNG BEENDET"}</Text><Text style={styles.miniCopy}>{session.viewerCount} ZUSCHAUENDE · {new Date(session.startsAt).toLocaleString("de-DE")}</Text></View>{session.status === "live" && selfHosted && ticketUrl ? <NativeSelfHostedPlayer ticketUrl={ticketUrl} token={token} title={session.title} /> : session.status === "live" && external ? <View style={styles.liveExternalPlayer}><Ionicons name="open-outline" size={28} color={tone.accent} /><Text style={styles.cardTitle}>{session.stream?.provider === "youtube" ? "YOUTUBE LIVE" : "TWITCH"}</Text><Text style={styles.copy}>Die geprüfte Anbieterquelle wird in der nativen App sicher außerhalb des eingebetteten Webplayers geöffnet.</Text><PrimaryButton tone={tone} label="BEIM ANBIETER ÖFFNEN" icon="open-outline" onPress={() => void Linking.openURL(external).catch(() => setStatus("Anbieterquelle konnte nicht geöffnet werden."))} /></View> : <StatusPanel tone={tone} icon="radio-outline" code="LIVE / QUELLE" title={session.status === "scheduled" ? "ÜBERTRAGUNG BEGINNT ZUM TERMIN" : "KEINE AKTIVE ÜBERTRAGUNG"} text="Es wird kein Videobild simuliert. Eine echte Quelle wird erst nach serverseitiger Freigabe wiedergegeben." />}<View style={styles.livePresenter}><Text style={styles.cardTitle}>{session.presenterName}</Text><Text style={styles.miniCopy}>{session.presenterCredential ?? "Community-Host"}</Text></View></View>
      <View style={[styles.liveChatPanel, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}><View style={styles.liveChatHeading}><Text style={[styles.chip, { color: tone.accent }]}>MEMBER-CHAT</Text><Text style={styles.cardTitle}>DISKUSSION · {session.status === "live" ? "AKTIV" : "GESCHLOSSEN"}</Text></View><Text style={styles.miniCopy}>Nur angemeldete Konten · maximal sechs Nachrichten pro Minute · blockierte Konten bleiben ausgeblendet.</Text>{messages.length ? messages.map(message => <View key={message.id} style={styles.liveMessage}><View style={styles.liveMessageMeta}><Text style={styles.commentAuthor}>{message.authorName ?? message.authorUsername ?? "Konto"}</Text><Text style={styles.date}>{new Date(message.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</Text></View><Text style={styles.copy}>{message.content}</Text></View>) : <Text style={styles.miniCopy}>Noch keine Nachricht in dieser Sitzung.</Text>}<View style={styles.commentComposer}><TextInput value={messageText} onChangeText={setMessageText} placeholder={session.status === "live" ? "Sachliche Nachricht schreiben …" : "Der Chat ist nur während einer Live-Sitzung offen."} placeholderTextColor={c.muted} style={styles.commentInput} multiline maxLength={2000} editable={session.status === "live" && !busy} /><Pressable style={[styles.commentSend, (busy || session.status !== "live") && { opacity: 0.45 }]} disabled={busy || session.status !== "live"} onPress={() => void send()}><Ionicons name="send" size={16} color={c.bg} /></Pressable></View></View>{status ? <Text style={[styles.formMessage, { color: tone.accent }]}>{status}</Text> : null}
    </Page>;
  }
  const visible = sessions.filter(item => item.track === track);
  const live = visible.filter(item => item.status === "live");
  const scheduled = visible.filter(item => item.status === "scheduled");
  const ended = visible.filter(item => item.status === "ended");
  const group = (label: string, rows: LiveSession[], empty: string) => <View style={styles.liveGroup}><View style={styles.liveGroupHeading}><Text style={[styles.eyebrow, { color: tone.accent }]}>{label}</Text><Text style={[styles.chip, { color: tone.accent }]}>{rows.length}</Text></View>{rows.length ? rows.map(item => <Pressable key={item.id} onPress={() => setSelectedId(Number(item.id))} style={[styles.liveSessionCard, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><View style={styles.liveSessionBadge}><Ionicons name={item.status === "live" ? "radio" : "calendar-outline"} size={14} color={tone.accent} /><Text style={[styles.miniCopy, { color: tone.accent }]}>{item.status === "live" ? "LIVE" : item.status === "scheduled" ? "GEPLANT" : "BEENDET"}</Text></View><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.copy}>{item.description}</Text><Text style={styles.miniCopy}>{item.presenterName}{item.presenterCredential ? ` · ${item.presenterCredential}` : " · Community-Host"}</Text><Text style={styles.miniCopy}>{item.status === "live" ? `${item.viewerCount} ZUSCHAUENDE · ` : ""}{new Date(item.startsAt).toLocaleString("de-DE")}</Text><Ionicons name="arrow-forward-outline" size={17} color={tone.accent} style={styles.liveSessionArrow} /></Pressable>) : <View style={[styles.liveEmpty, { borderColor: `${tone.accent}44` }]}><Ionicons name="radio-outline" size={18} color={tone.accent} /><Text style={styles.miniCopy}>{empty}</Text></View>}</View>;
  return <Page refresh={loadHub} refreshing={loadState === "loading"}><ObservatoryContextHeader tone={tone} eyebrow="LIVE · NUR FÜR MITGLIEDER · ANGEMELDET" title="ECHTE LIVE-SESSIONS." subtitle="Eigene IONOS-Übertragungen, YouTube Live und Twitch werden nur mit echter Quelle angezeigt." icon="radio-outline" /><View style={[styles.liveTrackPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>ZWEI GETRENNTE FORMATE</Text><Text style={styles.cardTitle}>{track === "community" ? "COMMUNITY LIVE" : "FACHVORTRÄGE"}</Text><Text style={styles.copy}>{track === "community" ? "Offener, moderierter Austausch für angemeldete Mitglieder." : "Von aktivem Staff angelegte Vorträge mit serverseitig dokumentierter Qualifikation."}</Text><View style={styles.liveTrackButtons}><Pressable onPress={() => setTrack("community")} style={[styles.liveTrackButton, { borderColor: track === "community" ? tone.accent : `${tone.accent}55`, backgroundColor: track === "community" ? `${tone.accent}22` : "transparent" }]}><Ionicons name="people-outline" size={17} color={tone.accent} /><Text style={styles.miniCopy}>COMMUNITY</Text></Pressable><Pressable onPress={() => setTrack("expert")} style={[styles.liveTrackButton, { borderColor: track === "expert" ? tone.accent : `${tone.accent}55`, backgroundColor: track === "expert" ? `${tone.accent}22` : "transparent" }]}><Ionicons name="person-outline" size={17} color={tone.accent} /><Text style={styles.miniCopy}>FACHVORTRÄGE</Text></Pressable></View><Text style={styles.miniCopy}>{capabilities?.enabled ? "IONOS-Medienserver verbunden." : "IONOS-Medienserver noch nicht verbunden. Externe Quellen bleiben separat gekennzeichnet."}</Text></View>{loadState === "loading" ? <Loading tone={tone} /> : loadState === "error" ? <ErrorNotice text={status ?? "Live-Hub konnte nicht geladen werden."} /> : <>{group("JETZT LIVE", live, "Aktuell ist keine echte Übertragung gestartet.")}{group("GEPLANT", scheduled, "Derzeit sind keine weiteren Sitzungen terminiert.")}{group("ABGESCHLOSSEN", ended, "Noch keine abgeschlossenen Sitzungen in diesem Bereich.")}</>}{status ? <Text style={[styles.formMessage, { color: tone.accent }]}>{status}</Text> : null}</Page>;
}

function PhotoScreen({
  token,
  tone,
  observations,
  observationSync,
  onSignIn,
  onComplete,
  navigate,
}: {
  token: string | null;
  tone: Tone;
  observations: Observation[];
  observationSync: ObservationOutboxSummary;
  onSignIn: () => Promise<void>;
  onComplete: () => Promise<void>;
  navigate: (screen: Screen) => void;
}) {
  const [capture, setCapture] = useState<Realm | null>(null);
  if (capture && token)
    return (
      <MomentCapture
        token={token}
        initialRealm={capture}
        onComplete={async () => { await onComplete(); setCapture(null); }}
      />
    );
  return (
    <Page>
      <ObservatoryContextHeader
        tone={tone}
        eyebrow="MOMENT FESTHALTEN"
        title="FOTO"
        subtitle="Wähle zuerst bewusst einen privaten Moment. Bildverarbeitung benötigt später deine sichtbare Freigabe."
        icon="camera-outline"
      />
      {!token ? (
        <PrivateFeature
          tone={tone}
          title="FOTO BLEIBT PRIVAT."
          text="Melde dich an, bevor du ein Foto aufnimmst oder aus deiner Mediathek auswählst."
          onSignIn={onSignIn}
        />
      ) : (
        <StatusPanel
          tone={tone}
          icon="camera-outline"
          code="FOTO / BEREIT"
          title="PRIVATEN MOMENT STARTEN"
          text="Kamera oder Mediathek werden erst im nächsten Schritt und nur nach deiner Auswahl geöffnet."
        />
      )}
      <ObservatoryActionCluster
        tone={tone}
        visual
        actions={[
          {
            title: "Pflanzenfoto",
            note: "Privaten Moment erfassen",
            icon: "leaf-outline",
            image: ASSETS.botany,
            onPress: () => (token ? setCapture("botany") : void onSignIn()),
          },
          {
            title: "Aquariumfoto",
            note: "Privaten Moment erfassen",
            icon: "fish-outline",
            image: ASSETS.aquarium,
            onPress: () => (token ? setCapture("aquarium") : void onSignIn()),
          },
          {
            title: "KI bestimmen",
            note: "Foto später gezielt prüfen",
            icon: "scan-outline",
            image: ASSETS.ai,
            onPress: () => navigate("assistant"),
          },
          {
            title: "Feed",
            note: "Community ansehen",
            icon: "people-outline",
            image: ASSETS.terrarium,
            onPress: () => navigate("community"),
          },
        ]}
      />
      {token ? <View style={[styles.photoObservationPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><View style={styles.explorePanelHeader}><View style={styles.flex}><Text style={[styles.chip, { color: tone.accent }]}>PRIVATE BEOBACHTUNGEN</Text><Text style={styles.cardTitle}>{observations.length} gespeicherte Momente</Text></View><Ionicons name="lock-closed-outline" size={18} color={tone.accent} /></View>{observationSync.pending || observationSync.imagePending || observationSync.conflicts ? <Text style={[styles.copy, { color: observationSync.conflicts ? c.danger : tone.accent }]}>{observationSync.conflicts ? `${observationSync.conflicts} Konflikt(e) prüfen` : `${observationSync.pending + observationSync.imagePending} Eintrag/Einträge warten auf Synchronisierung`}</Text> : <Text style={styles.copy}>Synchronisiert · nur für dich sichtbar</Text>}{observations.slice(0, 3).map(item => <View key={item.id} style={[styles.photoObservationRow, { borderColor: `${tone.accent}33` }]}><Ionicons name="eye-outline" size={16} color={tone.accent} /><View style={styles.flex}><Text style={styles.cardTitle}>{item.subject || item.scientificName || "Privater Moment"}</Text><Text style={styles.miniCopy}>{item.realm.toUpperCase()} · {new Date(item.createdAt).toLocaleDateString("de-DE")}</Text>{item.aiCandidates.length ? <View style={[styles.nativeCandidateBox, { borderColor: `${tone.accent}55` }]}><Text style={[styles.miniCopy, { color: tone.accent }]}>KI-KANDIDATEN · NICHT VERIFIZIERT</Text>{item.aiCandidates.slice(0, 3).map(candidate => <Text key={candidate.scientificName} style={styles.miniCopy}>{candidate.scientificName}{candidate.confidenceBand ? ` · ${candidate.confidenceBand}` : ""}</Text>)}</View> : null}</View></View>)}</View> : null}
    </Page>
  );
}

function PostScreen({
  token,
  isAdmin,
  tone,
  onSignIn,
  navigate,
}: {
  token: string | null;
  isAdmin: boolean;
  tone: Tone;
  onSignIn: () => Promise<void>;
  navigate: (screen: Screen) => void;
}) {
  const [content, setContent] = useState("");
  const [realm, setRealm] = useState<Realm | null>("botany");
  const [adminAllFeeds, setAdminAllFeeds] = useState(false);
  const [postImage, setPostImage] = useState<{ uri: string; mimeType: "image/jpeg" | "image/png" | "image/webp"; fileSize: number | null; width: number; height: number } | null>(null);
  const [postAspect, setPostAspect] = useState<"original" | "9:16" | "4:5" | "1:1" | "16:9">("original");
  const [postQuality, setPostQuality] = useState(92);
  const [estimatedPostBytes, setEstimatedPostBytes] = useState<number | null>(null);
  const [postVideo, setPostVideo] = useState<{ uri: string; mimeType: "video/mp4" | "video/webm"; fileSize: number | null } | null>(null);
  const [mediaConsent, setMediaConsent] = useState(false);
  const [publishNow, setPublishNow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ percent: number; etaSeconds: number; label: string } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [ownPosts, setOwnPosts] = useState<OwnCommunityPost[]>([]);
  const [showOwnPosts, setShowOwnPosts] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editVisibility, setEditVisibility] = useState<"private" | "public">("private");
  useEffect(() => {
    if (!postImage) { setEstimatedPostBytes(null); return; }
    let active = true;
    const maxDimension = 4096;
    const scale = Math.min(1, maxDimension / Math.max(postImage.width, postImage.height));
    const actions = scale < 1 ? [{ resize: { width: Math.round(postImage.width * scale), height: Math.round(postImage.height * scale) } }] : [];
    void ImageManipulator.manipulateAsync(postImage.uri, actions, { compress: Math.min(postQuality / 100, 0.86), format: ImageManipulator.SaveFormat.JPEG, base64: true }).then(result => { if (active) setEstimatedPostBytes(result.base64 ? Math.floor(result.base64.length * 0.75) : null); }).catch(() => { if (active) setEstimatedPostBytes(null); });
    return () => { active = false; };
  }, [postImage, postQuality]);
  useEffect(() => {
    if (!token || !showOwnPosts) return;
    void myCommunityPosts(token).then(setOwnPosts).catch(() => setOwnPosts([]));
  }, [token, showOwnPosts]);

  const choosePostImage = async (requestedAspect = postAspect) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Fotozugriff erforderlich", "Ohne Freigabe kann kein Bild an deinen Community-Beitrag angehängt werden.");
      return;
    }
    const aspect = requestedAspect === "9:16" ? [9, 16] as [number, number] : requestedAspect === "4:5" ? [4, 5] as [number, number] : requestedAspect === "1:1" ? [1, 1] as [number, number] : requestedAspect === "16:9" ? [16, 9] as [number, number] : undefined;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: requestedAspect === postAspect ? postQuality / 100 : 0.92, allowsEditing: true, aspect });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const rawMimeType = asset.mimeType?.toLowerCase();
    const mimeType = rawMimeType === "image/png" || rawMimeType === "image/webp" ? rawMimeType : "image/jpeg";
    const fileSize = typeof asset.fileSize === "number" ? asset.fileSize : null;
    if (fileSize !== null && fileSize > 24 * 1024 * 1024) {
      Alert.alert("Bild zu groß", "Bitte wähle ein Bild mit maximal 24 MB. Du kannst das Bild vor dem Upload zuschneiden.");
      return;
    }
    setPostAspect(requestedAspect);
    setPostQuality(requestedAspect === postAspect ? postQuality : 92);
    setPostImage({ uri: asset.uri, mimeType, fileSize, width: asset.width, height: asset.height });
    setMediaConsent(false);
  };

  const choosePostVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Videorechte erforderlich", "Ohne Freigabe kann kein Video an deinen Community-Beitrag angehängt werden."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], allowsEditing: false, videoMaxDuration: 120 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const rawMimeType = asset.mimeType?.toLowerCase();
    const mimeType = rawMimeType === "video/webm" || asset.uri.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";
    const fileSize = typeof asset.fileSize === "number" ? asset.fileSize : null;
    if (fileSize !== null && fileSize > 16 * 1024 * 1024) { Alert.alert("Video zu groß", "Bitte wähle ein MP4- oder WebM-Video mit maximal 16 MB."); return; }
    setPostVideo({ uri: asset.uri, mimeType, fileSize });
    setPostImage(null);
    setMediaConsent(false);
  };

  const save = async () => {
    if (!token || !content.trim() || saving) return;
    if ((postImage || postVideo) && !mediaConsent) {
      Alert.alert("Medienfreigabe erforderlich", "Bitte bestätige zuerst die sichere Verarbeitung dieses Mediums.");
      return;
    }
    setSaving(true);
    setUploadProgress({ percent: 8, etaSeconds: 5, label: "ENTWURF WIRD VORBEREITET" });
    setStatus(null);
    try {
      let imageXpAwarded = 0;
      if (publishNow)
        await setProfileConsent(token, {
          purpose: "community_publishing",
          policyVersion: "native-1.0.8",
          granted: true,
        });
      if (postImage || postVideo)
        await setProfileConsent(token, {
          purpose: "media_processing",
          policyVersion: "native-1.0.4",
          granted: true,
        });
      const draft = await createCommunityDraft(token, {
        content: content.trim(),
        realm: adminAllFeeds ? null : realm,
      });
      if (postImage) {
        setUploadProgress({ percent: 32, etaSeconds: 4, label: "BILD WIRD VERARBEITET" });
        const maxDimension = 4096;
        const scale = Math.min(1, maxDimension / Math.max(postImage.width, postImage.height));
        const actions = scale < 1 ? [{ resize: { width: Math.round(postImage.width * scale), height: Math.round(postImage.height * scale) } }] : [];
        const prepared = await ImageManipulator.manipulateAsync(postImage.uri, actions, { compress: Math.min(postQuality / 100, 0.86), format: ImageManipulator.SaveFormat.JPEG, base64: true });
        if (!prepared.base64) throw new Error("image_read_failed");
        setUploadProgress({ percent: 65, etaSeconds: 2, label: "BILD WIRD HOCHGELADEN" });
        const uploadedImage = await uploadCommunityDraftImage(token, { postId: Number(draft.id), base64: prepared.base64, mimeType: "image/jpeg" });
        imageXpAwarded = uploadedImage.xpAwarded;
      }
      if (postVideo) {
        setUploadProgress({ percent: 65, etaSeconds: 2, label: "VIDEO WIRD HOCHGELADEN" });
        const base64 = await FileSystem.readAsStringAsync(postVideo.uri, { encoding: FileSystem.EncodingType.Base64 });
        await uploadCommunityDraftVideo(token, { postId: Number(draft.id), base64, mimeType: postVideo.mimeType });
      }
      if (publishNow) {
        setUploadProgress({ percent: 88, etaSeconds: 1, label: "BEITRAG WIRD VERÖFFENTLICHT" });
        await publishCommunityDraft(token, { postId: Number(draft.id) });
      }
      setUploadProgress({ percent: 100, etaSeconds: 0, label: "UPLOAD ABGESCHLOSSEN" });
      setContent("");
      setRealm("botany");
      setAdminAllFeeds(false);
      setPostImage(null);
      setUploadProgress(null);
      setPostAspect("original");
      setPostQuality(92);
      setEstimatedPostBytes(null);
      setPostVideo(null);
      setMediaConsent(false);
      setPublishNow(false);
      if (showOwnPosts) setOwnPosts(await myCommunityPosts(token));
      setStatus(
        publishNow
          ? `Beitrag öffentlich veröffentlicht${imageXpAwarded ? ` · +${imageXpAwarded} XP für dein Naturbild` : ""}.`
          : `Privater Entwurf sicher hochgeladen${imageXpAwarded ? ` · +${imageXpAwarded} XP für dein Naturbild` : ""}.`
      );
    } catch (cause) {
      setUploadProgress(null);
      setStatus(
        cause instanceof Error
          ? cause.message
          : "Der Beitrag konnte nicht gespeichert werden."
      );
    } finally {
      setSaving(false);
    }
  };
  const startPostEdit = (post: OwnCommunityPost) => {
    setEditingPostId(post.id);
    setContent(post.content);
    setRealm(post.realm ?? null);
    setPostImage(null);
    setMediaConsent(false);
    setEditVisibility(post.visibility);
    setPublishNow(false);
  };
  const savePostEdit = async () => {
    if (!token || editingPostId === null || !content.trim() || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      await updateCommunityPost(token, { postId: editingPostId, content: content.trim(), realm, visibility: editVisibility });
      setEditingPostId(null);
      setContent("");
      if (showOwnPosts) setOwnPosts(await myCommunityPosts(token));
      setStatus("Beitrag aktualisiert.");
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Der Beitrag konnte nicht aktualisiert werden.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Page>
      <ObservatoryContextHeader
        tone={tone}
        eyebrow="COMMUNITY / BEITRAG"
        title="TEILE DEINEN MOMENT."
        subtitle="Du entscheidest ausdrücklich, ob ein Entwurf privat bleibt oder veröffentlicht wird."
        icon="create-outline"
      />
      {!token ? (
        <PrivateFeature
          tone={tone}
          title="BEITRAG GESCHÜTZT ERSTELLEN."
          text="Melde dich an, um einen privaten Entwurf oder einen ausdrücklich öffentlichen Beitrag zu erstellen."
          onSignIn={onSignIn}
        />
      ) : (
        <View
          style={[
            styles.workflow,
            { backgroundColor: tone.panel, borderColor: `${tone.accent}66` },
          ]}
        >
          <Text style={[styles.chip, { color: tone.accent }]}>
            PRIVATE_DRAFT
          </Text>
          <Text style={styles.cardTitle}>NATURMOMENT ERFASSEN</Text>
          <Text style={styles.copy}>
            Es werden keine Beispielbeiträge erstellt. Dein Entwurf bleibt
            privat, bis du die Veröffentlichung ausdrücklich aktivierst.
          </Text>
          {token ? <SecondaryButton tone={tone} label={showOwnPosts ? "EIGENE BEITRÄGE AUSBLENDEN" : "EIGENE BEITRÄGE VERWALTEN"} icon={showOwnPosts ? "chevron-up-outline" : "create-outline"} onPress={() => setShowOwnPosts(value => !value)} /> : null}
          {showOwnPosts && ownPosts.length ? <View style={styles.ownPosts}><Text style={[styles.chip, { color: tone.accent }]}>MEINE BEITRÄGE</Text>{ownPosts.slice(0, 8).map(post => <Pressable key={post.id} style={[styles.ownPost, { borderColor: `${tone.accent}55` }]} onPress={() => startPostEdit(post)}><View style={styles.flex}><Text style={[styles.ownPostStatus, { color: tone.accent }]}>{post.visibility === "public" ? "ÖFFENTLICH" : "PRIVAT"} · {post.realm ?? "alle Bereiche"}</Text><Text style={styles.ownPostText} numberOfLines={2}>{post.content}</Text></View><Ionicons name="create-outline" size={18} color={tone.accent} /></Pressable>)}</View> : null}
          {editingPostId !== null ? <Text style={[styles.chip, { color: tone.accent }]}>BEITRAG BEARBEITEN · {editVisibility === "public" ? "ÖFFENTLICH" : "PRIVAT"}</Text> : null}
          <LabeledInput
            tone={tone}
            label="DEIN ECHTER NATURMOMENT"
            value={content}
            onChange={setContent}
            placeholder="Was hast du beobachtet?"
            multiline
          />
          <View style={styles.realmPicker}>
            {(isAdmin ? (["botany", "aquarium", "terrarium", "all"] as const) : (["botany", "aquarium", "terrarium"] as const)).map(item => (
              <Pressable
                key={item ?? "all"}
                onPress={() => { if (item === "all") { setAdminAllFeeds(true); setRealm(null); } else { setAdminAllFeeds(false); setRealm(item); } }}
                style={({ pressed }) => [
                  styles.realmButton,
                  {
                    borderColor:
                      ((item === "all" && adminAllFeeds) || (item !== "all" && realm === item)) ? tone.accent : `${tone.accent}44`,
                    backgroundColor:
                      ((item === "all" && adminAllFeeds) || (item !== "all" && realm === item)) ? `${tone.accent}24` : "rgba(0,0,0,.18)",
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.realmText,
                    { color: ((item === "all" && adminAllFeeds) || (item !== "all" && realm === item)) ? c.text : c.muted },
                  ]}
                >
                  {item === "all"
                    ? "ALLE FEEDS · ADMIN"
                    : item === "botany"
                    ? "BOTANIK"
                    : item === "aquarium"
                      ? "AQUARISTIK"
                      : "TERRARISTIK"}
                </Text>
              </Pressable>
            ))}
          </View>
          {editingPostId === null ? <View style={[styles.communityMediaPanel, { borderColor: `${tone.accent}55`, backgroundColor: "rgba(0,0,0,.16)" }]}>
            {postImage ? <>
              <Image source={{ uri: postImage.uri }} style={[styles.communityMediaPreview, postAspect === "9:16" ? { aspectRatio: 9 / 16 } : postAspect === "4:5" ? { aspectRatio: 4 / 5 } : postAspect === "1:1" ? { aspectRatio: 1 } : postAspect === "16:9" ? { aspectRatio: 16 / 9 } : null]} />
              <View style={styles.communityMediaMeta}><View style={styles.flex}><Text style={[styles.chip, { color: tone.accent }]}>BILD BEREIT</Text><Text style={styles.miniCopy}>{postImage.fileSize ? `${Math.ceil(postImage.fileSize / 1024)} KB · wird privat verarbeitet` : "wird privat verarbeitet"}</Text></View><Pressable accessibilityLabel="Ausgewähltes Bild entfernen" onPress={() => { setPostImage(null); setMediaConsent(false); }} style={[styles.communityMediaRemove, { borderColor: `${tone.accent}88` }]}><Ionicons name="close-outline" size={18} color={tone.accent} /></Pressable></View>
              <View style={[styles.switchRow, { borderColor: `${tone.accent}55` }]}><View style={styles.flex}><View style={styles.mediaAspectEditorNative}><Text style={[styles.chip, { color: tone.accent }]}>FORMAT VOR DEM UPLOAD</Text>{(["original", "9:16", "4:5", "1:1", "16:9"] as const).map(aspect => <Pressable key={aspect} onPress={() => { setPostAspect(aspect); void choosePostImage(aspect); }} style={[styles.mediaAspectOptionNative, { borderColor: postAspect === aspect ? tone.accent : `${tone.accent}55`, backgroundColor: postAspect === aspect ? `${tone.accent}22` : "transparent" }]}><Text style={[styles.miniCopy, { color: postAspect === aspect ? tone.accent : c.muted }]}>{aspect === "original" ? "Original" : aspect}</Text></Pressable>)}</View><View style={styles.mediaQualityNative}><View style={styles.careSectionHeader}><Text style={[styles.chip, { color: tone.accent }]}>BILDQUALITÄT {postQuality}%</Text><Text style={styles.miniCopy}>{estimatedPostBytes === null ? "Berechne …" : `ca. ${(estimatedPostBytes / 1024 / 1024).toFixed(2)} MB · Original ${postImage?.fileSize ? (postImage.fileSize / 1024 / 1024).toFixed(2) : "—"} MB`}</Text></View><Slider minimumValue={50} maximumValue={100} step={1} value={postQuality} onValueChange={value => setPostQuality(Math.round(value))} minimumTrackTintColor={tone.accent} maximumTrackTintColor={`${tone.accent}44`} thumbTintColor={tone.accent} accessibilityLabel="Bildqualität" /></View><Text style={styles.cardTitle}>MEDIUM SICHER VERARBEITEN</Text><Text style={styles.copy}>Das Medium bleibt privat, bis du den Beitrag ausdrücklich veröffentlichst.</Text></View><Switch value={mediaConsent} onValueChange={setMediaConsent} trackColor={{ false: "#345440", true: tone.accent }} thumbColor={mediaConsent ? c.bg : c.muted} /></View>
            </> : postVideo ? <><View style={[styles.communityMediaMeta, { borderColor: `${tone.accent}55` }]}><View style={styles.flex}><Text style={[styles.chip, { color: tone.accent }]}>VIDEO BEREIT</Text><Text style={styles.miniCopy}>{postVideo.fileSize ? `${Math.ceil(postVideo.fileSize / 1024)} KB · wird privat verarbeitet` : "wird privat verarbeitet"}</Text></View><Pressable accessibilityLabel="Ausgewähltes Video entfernen" onPress={() => { setPostVideo(null); setMediaConsent(false); }} style={[styles.communityMediaRemove, { borderColor: `${tone.accent}88` }]}><Ionicons name="close-outline" size={18} color={tone.accent} /></Pressable></View><View style={[styles.switchRow, { borderColor: `${tone.accent}55` }]}><View style={styles.flex}><Text style={styles.cardTitle}>MEDIUM SICHER VERARBEITEN</Text><Text style={styles.copy}>MP4 oder WebM bis 16 MB. Das Video bleibt privat, bis du veröffentlichst.</Text></View><Switch value={mediaConsent} onValueChange={setMediaConsent} trackColor={{ false: "#345440", true: tone.accent }} thumbColor={mediaConsent ? c.bg : c.muted} /></View></> : <View style={styles.communityMediaPickerRow}><Pressable accessibilityLabel="Bild für Community-Beitrag auswählen" onPress={() => void choosePostImage()} style={[styles.communityMediaPicker, { borderColor: `${tone.accent}66` }]}><Ionicons name="images-outline" size={20} color={tone.accent} /><View style={styles.flex}><Text style={[styles.cardTitle, { color: tone.accent }]}>FOTO</Text><Text style={styles.copy}>JPG, PNG oder WebP bis 24 MB · hohe Qualität · 9:16 möglich</Text></View></Pressable><Pressable accessibilityLabel="Video für Community-Beitrag auswählen" onPress={() => void choosePostVideo()} style={[styles.communityMediaPicker, { borderColor: `${tone.accent}66` }]}><Ionicons name="videocam-outline" size={20} color={tone.accent} /><View style={styles.flex}><Text style={[styles.cardTitle, { color: tone.accent }]}>VIDEO</Text><Text style={styles.copy}>MP4/WebM bis 16 MB</Text></View></Pressable></View>}
          </View> : null}
          <View style={[styles.switchRow, { borderColor: `${tone.accent}55` }]}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{editingPostId !== null ? "ÖFFENTLICH SPEICHERN" : "ÖFFENTLICH VERÖFFENTLICHEN"}</Text>
              <Text style={styles.copy}>
                Nur mit deiner ausdrücklichen Freigabe.
              </Text>
            </View>
            <Switch
              value={editingPostId !== null ? editVisibility === "public" : publishNow}
              onValueChange={value => editingPostId !== null ? setEditVisibility(value ? "public" : "private") : setPublishNow(value)}
              trackColor={{ false: "#345440", true: tone.accent }}
              thumbColor={publishNow ? c.bg : c.muted}
            />
          </View>
          <PrimaryButton
            tone={tone}
            label={saving ? "WIRD HOCHGELADEN …" : editingPostId !== null ? "ÄNDERUNG SPEICHERN" : publishNow ? "BEITRAG VERÖFFENTLICHEN" : "SICHER HOCHLADEN"}
            icon="send-outline"
            disabled={saving || !content.trim()}
            onPress={() => void (editingPostId !== null ? savePostEdit() : save())}
          />
          {uploadProgress ? <View style={styles.nativeUploadProgress}><View style={styles.uploadProgressHeading}><Text style={[styles.chip, { color: tone.accent }]}>{uploadProgress.label}</Text><Text style={[styles.miniCopy, { color: tone.accent }]}>{uploadProgress.percent}%</Text></View><View style={styles.nativeUploadTrack}><View style={[styles.nativeUploadFill, { width: `${uploadProgress.percent}%`, backgroundColor: tone.accent }]} /></View><Text style={styles.miniCopy}>{uploadProgress.etaSeconds > 0 ? `Noch etwa ${uploadProgress.etaSeconds} Sek.` : "Fertig"}</Text></View> : null}
          {status ? (
            <Text style={[styles.formMessage, { color: tone.accent }]}>
              {status}
            </Text>
          ) : null}
        </View>
      )}
      <ObservatoryActionCluster
        tone={tone}
        visual
        actions={[
          {
            title: "Beitrag",
            note: "Editor verwenden",
            icon: "create-outline",
            image: ASSETS.botany,
            onPress: () =>
              token
                ? Alert.alert(
                    "Editor ist geöffnet",
                    "Nutze die Eingabefläche oben, um deinen privaten Entwurf oder öffentlichen Beitrag zu speichern."
                  )
                : void onSignIn(),
          },
          {
            title: "Foto",
            note: "Privaten Moment erfassen",
            icon: "camera-outline",
            image: ASSETS.botany,
            onPress: () => navigate("photo"),
          },
          {
            title: "Video",
            note: "Demnächst verfügbar",
            icon: "videocam-outline",
            image: ASSETS.terrarium,
            unavailable: true,
            onPress: () =>
              Alert.alert(
                "Demnächst verfügbar",
                "Video ist noch nicht als sicherer Community-Flow implementiert."
              ),
          },
          {
            title: "Community",
            note: "Feed ansehen",
            icon: "people-outline",
            image: ASSETS.terrarium,
            onPress: () => navigate("community"),
          },
        ]}
      />
    </Page>
  );
}

function KnowledgeScreen({
  tone,
  articles,
  state,
  error,
  refresh,
}: {
  tone: Tone;
  articles: KnowledgeArticle[];
  state: State;
  error: string | null;
  refresh: () => Promise<void>;
}) {
  return (
    <Page refresh={refresh} refreshing={state === "loading"}>
      <ObservatoryContextHeader
        tone={tone}
        eyebrow="WISSEN & EVIDENZ"
        title="WISSEN BRAUCHT QUELLEN."
        subtitle="Es erscheinen ausschließlich serverseitig veröffentlichte Inhalte mit Quellen."
        icon="book-outline"
      />
      <Text style={[styles.chip, { color: tone.accent }]}>VERÖFFENTLICHTE QUELLEN</Text>
      {state === "loading" ? (
        <Loading tone={tone} />
      ) : state === "error" ? (
        <ErrorNotice text={error ?? "Wissen konnte nicht geladen werden."} />
      ) : !articles.length ? (
        <StatusPanel
          tone={tone}
          icon="book-outline"
          code="WISSEN / LEER"
          title="NOCH KEINE VERÖFFENTLICHTEN EINTRÄGE"
          text="Sobald Quellenbeiträge veröffentlicht werden, erscheinen sie automatisch hier."
        />
      ) : (
        <View style={styles.stack}>
          {articles.map(article => (
            <KnowledgeCard key={article.id} tone={tone} article={article} />
          ))}
        </View>
      )}
    </Page>
  );
}

function MarketplaceScreen({
  tone,
  products,
  state,
  error,
  refresh,
  token,
  onSignIn,
}: {
  tone: Tone;
  products: MarketplaceProduct[];
  state: State;
  error: string | null;
  refresh: () => Promise<void>;
  token: string | null;
  onSignIn: () => Promise<void>;
}) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [category, setCategory] = useState("Alle");
  const [sort, setSort] = useState<"updated" | "name" | "price-low" | "price-high">("updated");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [partnerNotice, setPartnerNotice] = useState<string | null>(null);
  const [partnerSending, setPartnerSending] = useState(false);
  const shops = Array.from(new Map(products.map(product => [product.partnerId, { partnerId: product.partnerId, partnerName: product.partnerName, products: products.filter(item => item.partnerId === product.partnerId) }])).values());
  const recordProductEvent = async (product: MarketplaceProduct, eventType: "outbound_click" | "purchase_intent") => {
    try {
      await marketplaceEvent({ eventId: `native-${Date.now()}-${Math.random().toString(36).slice(2)}`, productId: product.id, eventType });
    } catch {
      // Attribution must never block the partner handoff or the native UI.
    }
  };
  const selectedShop = shops.find(shop => shop.partnerId === selectedPartnerId) ?? null;
  const sendPartnerInquiry = async () => {
    if (!token) return void onSignIn();
    if (partnerMessage.trim().length < 3) { setPartnerNotice("Bitte beschreibe kurz dein Vorhaben."); return; }
    setPartnerSending(true); setPartnerNotice(null);
    try {
      const result = await submitPartnerInquiry(token, partnerMessage.trim());
      setPartnerMessage(""); setPartnerNotice(result.message);
    } catch {
      setPartnerNotice("Die Partneranfrage konnte nicht gespeichert werden. Bitte versuche es erneut.");
    } finally { setPartnerSending(false); }
  };
  const categories = selectedShop ? ["Alle", ...Array.from(new Set(selectedShop.products.map(product => product.marketplaceCategory).filter((value): value is string => Boolean(value))))] : [];
  const visibleProducts = selectedShop ? selectedShop.products.filter(product => category === "Alle" || product.marketplaceCategory === category).slice().sort((a, b) => {
    if (sort === "name") return a.title.localeCompare(b.title, "de");
    if (sort === "price-low" || sort === "price-high") {
      const price = (item: MarketplaceProduct) => Number((item.priceLabel ?? "").replace(/[^0-9,.-]/g, "").replace(",", ".")) || 0;
      return sort === "price-low" ? price(a) - price(b) : price(b) - price(a);
    }
    return String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""));
  }) : [];
  return (
    <Page refresh={refresh} refreshing={state === "loading"}>
      <ObservatoryContextHeader
        tone={tone}
        eyebrow="MARKTPLATZ"
        title={selectedShop ? selectedShop.partnerName.toUpperCase() : "DEIN WEG. DEIN SHOP."}
        subtitle={selectedShop ? "Eigener Händlerbereich mit klarer Kategorie, Auswahl und transparenter Vermittlung." : "Wähle zuerst einen freigegebenen Händler. BlackWaterLeaf verarbeitet keine Zahlung, Bestellung oder Lieferung."}
        icon="storefront-outline"
      />
      <View
        style={[
          styles.partnerNotice,
          { borderColor: `${tone.accent}66`, backgroundColor: tone.panel },
        ]}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color={tone.accent}
        />
        <Text style={styles.copy}>
          {selectedShop ? "Dieser Bereich gehört ausschließlich zu diesem Händler. Preise, Verfügbarkeit und Versand stammen aus dessen veröffentlichtem Angebot." : "Keine vermischte Produktwand: Jeder Händler erhält seinen eigenen Shopbereich."}
        </Text>
      </View>
      <View style={[styles.infoCard, { borderColor: `${tone.accent}77`, backgroundColor: tone.panel }]}>
        <Text style={[styles.chip, { color: tone.accent }]}>PARTNER WERDEN</Text>
        <Text style={styles.cardTitle}>MIT BLACKWATERLEAF ZUSAMMENARBEITEN</Text>
        <Text style={styles.copy}>Sende deine Anfrage direkt aus deinem Konto. Die Eingangsbestätigung erscheint anschließend in deinem Benachrichtigungscenter.</Text>
        {token ? <TextInput value={partnerMessage} onChangeText={setPartnerMessage} placeholder="Womit möchtest du BlackWaterLeaf unterstützen?" placeholderTextColor={c.muted} multiline style={[styles.searchInput, { borderColor: `${tone.accent}66`, minHeight: 84, textAlignVertical: "top" }]} /> : null}
        <Pressable style={[styles.secondaryButton, { borderColor: `${tone.accent}88` }]} onPress={() => void sendPartnerInquiry()} disabled={partnerSending}>
          <Ionicons name={token ? "send-outline" : "log-in-outline"} size={16} color={tone.accent} />
          <Text style={[styles.secondaryButtonText, { color: tone.accent }]}>{partnerSending ? "WIRD GESENDET …" : token ? "PARTNERANFRAGE SENDEN" : "ANMELDEN UND ANFRAGEN"}</Text>
        </Pressable>
        {partnerNotice ? <Text style={[styles.miniCopy, { color: tone.accent }]} accessibilityRole="text">{partnerNotice}</Text> : null}
      </View>
      {state === "loading" ? (
        <Loading tone={tone} />
      ) : state === "error" ? (
        <ErrorNotice
          text={error ?? "Marktplatz konnte nicht geladen werden."}
        />
      ) : !products.length ? (
        <StatusPanel
          tone={tone}
          icon="storefront-outline"
          code="MARKT / LEER"
          title="KEINE AKTIVEN ANGEBOTE"
          text="Aktuell ist kein freigegebenes Partnerangebot verfügbar."
        />
      ) : (
        <View style={styles.stack}>
          {selectedShop ? <>
            <Pressable style={[styles.secondaryButton, { borderColor: `${tone.accent}88` }]} onPress={() => { setSelectedPartnerId(null); setCategory("Alle"); }}><Ionicons name="arrow-back-outline" size={16} color={tone.accent} /><Text style={[styles.secondaryButtonText, { color: tone.accent }]}>ALLE HÄNDLER</Text></Pressable>
            <View style={[styles.infoCard, { borderColor: `${tone.accent}77`, backgroundColor: tone.panel }]}>
              <Text style={[styles.chip, { color: tone.accent }]}>SHOP · {selectedShop.products.length} ANGEBOTE</Text>
              <Text style={styles.cardTitle}>{selectedShop.partnerName}</Text>
              <Text style={styles.copy}>Freigegebene Kategorien und Angebote dieses Partners.</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{categories.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filterChip, { borderColor: category === item ? tone.accent : `${tone.accent}55`, backgroundColor: category === item ? `${tone.accent}22` : "transparent" }]}><Text style={[styles.miniCopy, { color: category === item ? tone.accent : c.muted }]}>{item}</Text></Pressable>)}</ScrollView>
            <View style={styles.sortRow}>{([['updated', 'Neueste'], ['name', 'Name'], ['price-low', 'Preis aufsteigend'], ['price-high', 'Preis absteigend']] as const).map(([value, label]) => <Pressable key={value} onPress={() => setSort(value)} style={[styles.sortChip, { borderColor: sort === value ? tone.accent : `${tone.accent}55` }]}><Text style={[styles.miniCopy, { color: sort === value ? tone.accent : c.muted }]}>{label}</Text></Pressable>)}</View>
            {visibleProducts.length ? <View style={styles.stack}>{visibleProducts.map(product => <ProductCard key={product.id} tone={tone} product={product} onInterest={item => void recordProductEvent(item, "purchase_intent")} />)}</View> : <StatusPanel tone={tone} icon="search-outline" code="SHOP / LEER" title="KEIN PASSENDES ANGEBOT" text="Wähle eine andere Kategorie oder Sortierung." />}
          </> : <>
          <View style={[styles.infoCard, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}>
            <Text style={[styles.chip, { color: tone.accent }]}>JEDER HÄNDLER · EIN EIGENER SHOP</Text>
            <Text style={styles.cardTitle}>PARTNER-SHOPS</Text>
            <Text style={styles.copy}>Wähle direkt, bei welchem Händler du das Angebot ansehen möchtest.</Text>
          </View>
          {shops.map(shop => (
            <View key={shop.partnerId} style={[styles.infoCard, { borderColor: `${tone.accent}77`, backgroundColor: tone.panel }]}>
              <Ionicons name="storefront-outline" size={26} color={tone.accent} />
              <Text style={[styles.chip, { color: tone.accent }]}>{shop.products[0]?.partnerType === "company" ? "FACHHANDEL" : "PARTNER-SHOP"} · {shop.products.length} ANGEBOTE</Text>
              <Text style={styles.cardTitle}>{shop.partnerName}</Text>
              <Text style={styles.copy}>{Array.from(new Set(shop.products.map(product => product.marketplaceCategory).filter(Boolean))).slice(0, 3).join(" · ") || "Eigener Händlerbereich"}</Text>
              <Pressable style={[styles.secondaryButton, { borderColor: `${tone.accent}88` }]} onPress={() => setSelectedPartnerId(shop.partnerId)}>
                <Text style={[styles.secondaryButtonText, { color: tone.accent }]}>SHOP ÖFFNEN</Text>
                <Ionicons name="arrow-forward-outline" size={16} color={tone.accent} />
              </Pressable>
            </View>
          ))}
          </>}
        </View>
      )}
    </Page>
  );
}

function CommunityScreen({
  tone,
  account,
  posts,
  state,
  error,
  refresh,
  token,
  onSignIn,
  navigate,
  onOpenDetail,
  onOpenProfile,
}: {
  tone: Tone;
  account: Account | null;
  posts: CommunityPost[];
  state: State;
  error: string | null;
  refresh: () => Promise<void>;
  token: string | null;
  onSignIn: () => Promise<void>;
  navigate: (screen: Screen) => void;
  onOpenDetail: (id: string) => void;
  onOpenProfile: (id: number) => void;
}) {
  const [realmFilter, setRealmFilter] = useState<"all" | Realm>("all");
  const [adminProfile, setAdminProfile] = useState<Awaited<ReturnType<typeof socialAdminProfile>> | null>(null);
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void socialAdminProfile(token).then(profile => { if (active) setAdminProfile(profile); }).catch(() => { if (active) setAdminProfile(null); });
    return () => { active = false; };
  }, [token]);
  const toggleAdminSubscription = async () => {
    if (!token || !adminProfile || subscriptionBusy) { if (!token) await onSignIn(); return; }
    setSubscriptionBusy(true);
    try {
      if (adminProfile.isFollowing) await unfollowProfile(token, Number(adminProfile.id));
      else await followProfile(token, Number(adminProfile.id));
      setAdminProfile(await socialAdminProfile(token));
    } catch (cause) {
      Alert.alert("Abo nicht möglich", cause instanceof Error ? cause.message : "Bitte später erneut versuchen.");
    } finally { setSubscriptionBusy(false); }
  };
  const visiblePosts = posts.filter(post => realmFilter === "all" || post.realm === realmFilter);
  if (!token) return <Page>
    <ObservatoryContextHeader tone={tone} eyebrow="COMMUNITY · GESCHÜTZT" title="MITGLIEDERBEREICH." subtitle="Beiträge, Diskussionen und Live-Austausch werden erst nach einer sicheren Anmeldung geladen." icon="people-outline" />
    <PrivateFeature tone={tone} title="ANMELDUNG ERFORDERLICH" text="Der Community-Feed, einzelne Beiträge und Kommentare sind nur für angemeldete, aktive Konten sichtbar." onSignIn={onSignIn} />
  </Page>;
  return (
    <Page refresh={refresh} refreshing={state === "loading"}>
      <ObservatoryContextHeader
        tone={tone}
        eyebrow="GEMEINSAM WACHSEN"
        title="COMMUNITY IN BEWEGUNG."
        subtitle="Echte Naturmomente von echten, aktiven Konten."
        icon="people-outline"
      />
      {adminProfile ? <View style={[styles.communitySubscribeNative, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}><View style={styles.flex}><Text style={[styles.eyebrow, { color: tone.accent }]}>OFFIZIELLES PROFIL</Text><Text style={styles.cardTitle}>BLACKWATERLEAF ABONNIEREN</Text><Text style={styles.miniCopy}>{adminProfile.followers} Follower · neue Naturbeiträge zuerst sehen</Text></View><PrimaryButton tone={tone} label={adminProfile.isFollowing ? "ABONNIERT" : "ABONNIEREN"} icon={adminProfile.isFollowing ? "checkmark-circle-outline" : "person-add-outline"} onPress={() => void toggleAdminSubscription()} disabled={subscriptionBusy} /></View> : null}
      <ObservatoryActionCluster
        tone={tone}
        visual
        actions={[
          {
            title: "Beobachten",
            note: "Moment sicher festhalten",
            icon: "eye-outline",
            image: ASSETS.botany,
            onPress: () => navigate("photo"),
          },
          {
            title: "Teilen",
            note: token ? "Editor öffnen" : "Anmeldung erforderlich",
            icon: "share-social-outline",
            image: ASSETS.terrarium,
            onPress: () => (token ? navigate("post") : void onSignIn()),
          },
        ]}
      />
      <View style={[styles.communityFeedSelector, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}>
        <View style={styles.communityFeedSelectorHeading}><View><Text style={[styles.eyebrow, { color: tone.accent }]}>ÖFFENTLICHER FEED</Text><Text style={styles.cardTitle}>{realmFilter === "all" ? "ALLE BEREICHE" : realmFilter === "botany" ? "BOTANIK" : realmFilter === "aquarium" ? "AQUARISTIK" : "TERRARISTIK"}</Text></View><View style={[styles.communityFeedVerified, { borderColor: `${tone.accent}55` }]}><Ionicons name="shield-checkmark-outline" size={15} color={tone.accent} /><Text style={[styles.chip, { color: tone.accent }]}>MODERIERT</Text></View></View>
        <Text style={styles.miniCopy}>Nur veröffentlichte Beiträge aktiver Konten. Private Entwürfe und blockierte Konten bleiben ausgeschlossen.</Text>
        <View style={styles.communityFeedFilterRow}>{(["all", "botany", "aquarium", "terrarium"] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: realmFilter === item }} onPress={() => setRealmFilter(item)} style={[styles.communityFeedFilter, { borderColor: realmFilter === item ? tone.accent : `${tone.accent}55`, backgroundColor: realmFilter === item ? `${tone.accent}22` : "transparent" }]}><Text style={[styles.miniCopy, { color: realmFilter === item ? tone.accent : c.muted }]}>{item === "all" ? "Feed" : item === "botany" ? "Botanik" : item === "aquarium" ? "Aquaristik" : "Terraristik"}</Text></Pressable>)}</View>
      </View>
      {state === "loading" ? (
        <Loading tone={tone} />
      ) : state === "error" ? (
        <ErrorNotice text={error ?? "Feed konnte nicht geladen werden."} />
      ) : !visiblePosts.length ? (
        <StatusPanel
          tone={tone}
          icon="people-outline"
          code={posts.length ? "FEED / BEREICH_LEER" : "FEED / LEER"}
          title={posts.length ? "KEINE BEITRÄGE IN DIESEM BEREICH" : "NOCH KEINE ÖFFENTLICHEN BEITRÄGE"}
          text={posts.length ? "Wähle einen anderen Bereich oder veröffentliche einen passenden Beitrag." : "Es werden keine Community-Daten erfunden. Neue veröffentlichte Beiträge erscheinen automatisch."}
          actionLabel={token ? "BEITRAG ERSTELLEN" : "SICHER ANMELDEN"}
          onAction={() => (token ? navigate("post") : void onSignIn())}
        />
      ) : (
        <View style={styles.stack}>
          {visiblePosts.map(post => (
            <PostCard
              key={post.id}
              tone={tone}
              post={post}
              isOwner={Boolean(account?.id && String(account.id) === String(post.author.id))}
              accountId={account?.id ? Number(account.id) : null}
              onEdit={() => navigate("post")}
              onDelete={async () => {
                if (!token) return;
                await deleteCommunityPost(token, Number(post.id));
                await refresh();
              }}
              onLike={async () => {
                if (!token) return void onSignIn();
                await likeCommunityPost(token, Number(post.id));
                await refresh();
              }}
              onReport={async () => {
                if (!token) return void onSignIn();
                await reportCommunityPost(token, { postId: Number(post.id), reason: "other" });
                Alert.alert("Meldung gespeichert", "Die Meldung wurde zur Prüfung weitergeleitet.");
              }}
              onBlock={async () => {
                if (!token) return void onSignIn();
                await blockCommunityUser(token, Number(post.author.id));
                await refresh();
              }}
              onOpenDetail={() => onOpenDetail(post.id)}
              onOpenProfile={() => onOpenProfile(Number(post.author.id))}
              token={token}
            />
          ))}
        </View>
      )}
    </Page>
  );
}

function CommunityPostDetailScreen({ tone, token, post, onBack, onSignIn, onRefresh, onOpenProfile, onLike, onReport, onBlock }: { tone: Tone; token: string | null; post: CommunityPost | null; onBack: () => void; onSignIn: () => Promise<void>; onRefresh: () => Promise<void>; onOpenProfile: (id: number) => void; onLike: (post: CommunityPost) => Promise<void>; onReport: (post: CommunityPost) => Promise<void>; onBlock: (post: CommunityPost) => Promise<void> }) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const loadComments = useCallback(async () => { if (token && post) setComments(await communityComments(token, Number(post.id))); }, [post, token]);
  useEffect(() => { void loadComments(); }, [loadComments]);
  const submit = async () => {
    if (!token || !post || !commentText.trim() || busy) return;
    setBusy(true);
    try { await addCommunityComment(token, { postId: Number(post.id), parentId: replyTo, content: commentText.trim() }); setCommentText(""); setReplyTo(null); await loadComments(); await onRefresh(); }
    catch (cause) { Alert.alert("Kommentar konnte nicht gespeichert werden", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); }
    finally { setBusy(false); }
  };
  if (!post) return <Page><SecondaryButton tone={tone} label="ZURÜCK ZUR COMMUNITY" icon="arrow-back-outline" onPress={onBack} /><StatusPanel tone={tone} icon="people-outline" code="BEITRAG / NICHT_GEFUNDEN" title="BEITRAG NICHT VERFÜGBAR" text="Der Beitrag wurde entfernt oder ist für dieses Konto nicht sichtbar." /></Page>;
  return <Page refresh={loadComments} refreshing={busy}><SecondaryButton tone={tone} label="ZURÜCK ZUR COMMUNITY" icon="arrow-back-outline" onPress={onBack} /><ObservatoryContextHeader tone={tone} eyebrow="COMMUNITY · DETAILANSICHT" title="DISKUSSION." subtitle="Der vollständige Beitrag, Antworten und Moderationshinweise bleiben in einem geschützten Thread zusammen." icon="chatbubbles-outline" /><View style={[styles.infoCard, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><View style={styles.postHead}><View style={styles.postHeadCopy}><Pressable onPress={() => onOpenProfile(Number(post.author.id))} accessibilityRole="link"><Text style={styles.cardTitle}>{post.author.name ?? post.author.username ?? "Verifiziertes Konto"}</Text></Pressable><Text style={styles.date}>{new Date(post.createdAt).toLocaleString("de-DE")}</Text></View><Text style={[styles.chip, { color: tone.accent }]}>{post.realm?.toUpperCase() ?? "COMMUNITY"}</Text></View><Text style={styles.copy}>{post.content}</Text>{post.media[0] ? post.media[0].mimeType.startsWith("video/") ? <NativeCommunityVideo uri={post.media[0].accessUrl} title="Community-Video" /> : <Image source={{ uri: post.media[0].accessUrl }} style={styles.postImage} /> : null}<View style={styles.postInteractionRow}><Pressable onPress={() => void onLike(post)} style={styles.commentToggle}><Ionicons name="heart-outline" size={16} color={tone.accent} /><Text style={[styles.miniCopy, { color: tone.accent }]}>GEFÄLLT MIR</Text></Pressable><Pressable onPress={() => Alert.alert("Beitrag melden", "Warum möchtest du diesen Beitrag melden?", [{ text: "Abbrechen", style: "cancel" }, { text: "Melden", onPress: () => void onReport(post) }])} style={styles.commentToggle}><Ionicons name="flag-outline" size={16} color={c.muted} /><Text style={styles.miniCopy}>MELDEN</Text></Pressable></View></View><View style={[styles.commentPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>DISKUSSION · {comments.length}</Text>{comments.length ? comments.map(comment => <View key={comment.id} style={[styles.commentRow, comment.parentId ? styles.commentReplyRow : null]}><View style={styles.liveMessageMeta}><Text style={styles.commentAuthor}>{comment.authorName ?? comment.authorUsername ?? "Nutzer"}</Text><Text style={styles.date}>{new Date(comment.createdAt).toLocaleString("de-DE")}</Text></View><Text style={styles.copy}>{comment.content}</Text>{!comment.parentId ? <Pressable onPress={() => setReplyTo(comment.id)}><Text style={[styles.commentReplyAction, { color: tone.accent }]}>ANTWORTEN</Text></Pressable> : null}</View>) : <Text style={styles.miniCopy}>Noch keine Kommentare. Starte die sachliche Diskussion.</Text>}{replyTo ? <Pressable onPress={() => setReplyTo(null)}><Text style={[styles.commentReplyAction, { color: tone.accent }]}>ANTWORT AUFHEBEN</Text></Pressable> : null}{token ? <View style={styles.commentComposer}><TextInput value={commentText} onChangeText={setCommentText} placeholder={replyTo ? "Antwort schreiben …" : "Kommentar schreiben …"} placeholderTextColor={c.muted} style={styles.commentInput} multiline maxLength={2000} editable={!busy} /><Pressable style={[styles.commentSend, busy && { opacity: 0.45 }]} disabled={busy} onPress={() => void submit()}><Ionicons name="send" size={16} color={c.bg} /></Pressable></View> : <Pressable style={styles.secondaryButton} onPress={() => void onSignIn()}><Text style={styles.secondaryButtonText}>SICHER ANMELDEN, UM ZU ANTWORTEN</Text></Pressable>}</View></Page>;
}

function CareScreen({ tone, token, tasks, plans, journal, habitats, state, error, refresh, onSignIn }: { tone: Tone; token: string | null; tasks: CareTask[]; plans: CarePlan[]; journal: CareJournalEntry[]; habitats: Habitat[]; state: State; error: string | null; refresh: () => Promise<void>; onSignIn: () => Promise<void> }) {
  const [planTitle, setPlanTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [journalText, setJournalText] = useState("");
  const [realm, setRealm] = useState<CarePlan["realm"]>("botany");
  const [planHabitat, setPlanHabitat] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [repeatEveryDays, setRepeatEveryDays] = useState(0);
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>) => { setBusy(true); try { await action(); await refresh(); } catch (cause) { Alert.alert("Pflege konnte nicht gespeichert werden", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } finally { setBusy(false); } };
  const addPlan = () => { if (!token || !planTitle.trim()) return; void run(async () => { const plan = await careCreatePlan(token, { realm, title: planTitle.trim(), habitatId: planHabitat }); setPlanTitle(""); setPlanHabitat(null); setSelectedPlan(plan.id); }); };
  const addTask = () => { if (!token || !selectedPlan || !taskTitle.trim()) return; void run(async () => { await careCreateTask(token, { planId: selectedPlan, title: taskTitle.trim(), dueAt: new Date().toISOString(), repeatEveryDays: repeatEveryDays > 0 ? repeatEveryDays : null }); setTaskTitle(""); setRepeatEveryDays(0); }); };
  const addEntry = () => { if (!token || !journalText.trim()) return; void run(async () => { await careAddJournal(token, { note: journalText.trim() }); setJournalText(""); }); };
  return <Page refresh={refresh} refreshing={state === "loading"}>
    <ObservatoryContextHeader tone={tone} eyebrow="PRIVATE CARE" title="HEUTE." subtitle="Eine klare Handlung nach der anderen. Pflege bleibt privat und nachvollziehbar." icon="leaf-outline" />
    {!token ? <PrivateFeature tone={tone} title="ANMELDUNG ERFORDERLICH" text="Deine Pflegepläne und Notizen werden nur im eigenen Konto gespeichert." onSignIn={onSignIn} /> : null}
    {error ? <ErrorNotice text={error} /> : null}
    <View style={styles.careSectionHeader}><Text style={[styles.eyebrow, { color: tone.accent }]}>JETZT</Text><Text style={styles.sectionTitle}>OFFENE AUFGABEN</Text><Text style={styles.careCount}>{tasks.filter(task => task.status === "open" || task.status === "snoozed").length}</Text></View>
    {tasks.filter(task => task.status === "open" || task.status === "snoozed").map(task => <View key={task.id} style={[styles.careTask, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Ionicons name="time-outline" size={19} color={tone.accent} /><View style={styles.careTaskCopy}><Text style={styles.cardTitle}>{task.title}</Text><Text style={styles.miniCopy}>{task.status === "snoozed" ? "verschoben" : "offen"}{task.repeatEveryDays ? ` · alle ${task.repeatEveryDays} Tage` : ""}</Text></View><Pressable disabled={busy} onPress={() => token && void run(() => careUpdateTask(token, { taskId: Number(task.id), status: "done" }))} style={styles.careIconButton}><Ionicons name="checkmark" size={17} color={tone.accent} /></Pressable><Pressable disabled={busy} onPress={() => token && void run(() => careUpdateTask(token, { taskId: Number(task.id), status: "snoozed", reason: "Später" }))} style={styles.careIconButton}><Ionicons name="play-forward-outline" size={16} color={tone.accent} /></Pressable></View>)}
    {tasks.filter(task => task.status === "open" || task.status === "snoozed").length === 0 ? <Text style={styles.miniCopy}>Für heute ist nichts offen.</Text> : null}
    <View style={[styles.carePanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>PLAN</Text><Text style={styles.cardTitle}>PFLEGE ANLEGEN</Text><View style={styles.careRealmRow}>{(["botany", "aquarium", "terrarium"] as const).map(item => <Pressable key={item} onPress={() => setRealm(item)} style={[styles.careRealmChip, { borderColor: `${tone.accent}55`, backgroundColor: realm === item ? `${tone.accent}22` : "transparent" }]}><Text style={[styles.miniCopy, realm === item && { color: tone.accent }]}>{item === "botany" ? "Botanik" : item === "aquarium" ? "Aquaristik" : "Terraristik"}</Text></Pressable>)}</View><TextInput value={planTitle} onChangeText={setPlanTitle} placeholder="Planname, z. B. Morgenpflege" placeholderTextColor={c.muted} style={styles.careInput} /><View style={styles.careRealmRow}>{habitats.map(habitat => <Pressable key={habitat.id} onPress={() => setPlanHabitat(Number(habitat.id))} style={[styles.careRealmChip, { borderColor: `${tone.accent}55`, backgroundColor: planHabitat === Number(habitat.id) ? `${tone.accent}22` : "transparent" }]}><Text style={styles.miniCopy}>{habitat.name}</Text></Pressable>)}</View><PrimaryButton tone={tone} label={busy ? "SPEICHERN …" : "PLAN SPEICHERN"} icon="add" onPress={addPlan} />{plans.length ? <><Text style={[styles.eyebrow, { color: tone.accent }]}>AUFGABE FÜR PLAN</Text><View style={styles.careRealmRow}>{plans.map(plan => <Pressable key={plan.id} onPress={() => setSelectedPlan(plan.id)} style={[styles.careRealmChip, { borderColor: `${tone.accent}55`, backgroundColor: selectedPlan === plan.id ? `${tone.accent}22` : "transparent" }]}><Text style={styles.miniCopy}>{plan.title}</Text></Pressable>)}</View><TextInput value={taskTitle} onChangeText={setTaskTitle} placeholder="z. B. Feuchtigkeit prüfen" placeholderTextColor={c.muted} style={styles.careInput} /><View style={styles.careRealmRow}>{[0, 1, 7, 14, 30].map(days => <Pressable key={days} onPress={() => setRepeatEveryDays(days)} style={[styles.careRealmChip, { borderColor: `${tone.accent}55`, backgroundColor: repeatEveryDays === days ? `${tone.accent}22` : "transparent" }]}><Text style={[styles.miniCopy, repeatEveryDays === days && { color: tone.accent }]}>{days === 0 ? "Einmalig" : days === 1 ? "Täglich" : days === 7 ? "Wöchentlich" : days === 14 ? "14 Tage" : "Monatlich"}</Text></Pressable>)}</View><SecondaryButton tone={tone} label={busy ? "SPEICHERN …" : "AUFGABE SPEICHERN"} icon="add" onPress={addTask} /></> : null}</View>
    <View style={[styles.carePanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>JOURNAL · PRIVAT</Text><Text style={styles.cardTitle}>PFLEGEMOMENT FESTHALTEN</Text><TextInput value={journalText} onChangeText={setJournalText} placeholder="Was hast du beobachtet oder verändert?" placeholderTextColor={c.muted} multiline style={[styles.careInput, styles.careInputLarge]} /><PrimaryButton tone={tone} label={busy ? "SPEICHERN …" : "JOURNAL SPEICHERN"} icon="book-outline" onPress={addEntry} />{journal.slice(0, 3).map(entry => <View key={entry.id} style={styles.careJournal}><Text style={[styles.date, { color: tone.accent }]}>{new Date(entry.observedAt).toLocaleDateString("de-DE")}</Text><Text style={styles.miniCopy}>{entry.note}</Text></View>)}</View>
  </Page>;
}

function NotificationsScreen({ tone, token, notifications, state, error, refresh, navigate, onUnreadChange }: { tone: Tone; token: string | null; notifications: NativeNotification[]; state: State; error: string | null; refresh: () => Promise<void>; navigate: (screen: Screen) => void; onUnreadChange: () => Promise<void> }) {
  const markAllRead = async () => {
    if (!token) return;
    await markNotificationsRead(token);
    await refresh();
    await onUnreadChange();
  };
  return <Page refresh={refresh} refreshing={state === "loading"}>
    <ObservatoryContextHeader tone={tone} eyebrow="PRIVAT · FEED" title="DEINE BENACHRICHTIGUNGEN." subtitle="Kommentare und wichtige Hinweise aus deinem BlackWaterLeaf-Konto." icon="notifications-outline" />
    <View style={styles.notificationActions}><SecondaryButton tone={tone} label="ALLE ALS GELESEN" icon="checkmark-done-outline" onPress={() => void markAllRead()} /></View>
    {state === "error" ? <ErrorNotice text={error ?? "Benachrichtigungen konnten nicht geladen werden."} /> : notifications.length ? <View style={styles.stack}>{notifications.map(item => <Pressable key={item.id} accessibilityLabel="Benachrichtigung öffnen" onPress={async () => { if (token && !item.isRead) await markNotificationsRead(token, item.id); if (item.type === "message") navigate("messages"); else if (item.type === "feedback" || item.type === "partner_inquiry") navigate("dashboard"); else if (item.postId) navigate("community"); await refresh(); await onUnreadChange(); }} style={[styles.notificationRow, { borderColor: `${tone.accent}55`, backgroundColor: item.isRead ? tone.panel : `${tone.accent}14` }]}><Ionicons name={item.type === "message" ? "mail-outline" : item.type === "comment" ? "chatbubble-ellipses-outline" : item.type === "feedback" || item.type === "partner_inquiry" ? "bulb-outline" : "notifications-outline"} size={20} color={tone.accent} /><View style={styles.notificationCopy}><Text style={styles.cardTitle}>{item.actorName}</Text><Text style={styles.miniCopy}>{item.message}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleString("de-DE")}</Text></View>{!item.isRead ? <View style={[styles.unreadDot, { backgroundColor: tone.accent }]} /> : null}<Ionicons name="chevron-forward" size={17} color={c.muted} /></Pressable>)}</View> : <StatusPanel tone={tone} icon="notifications-outline" code="FEED / LEER" title="NOCH KEINE BENACHRICHTIGUNGEN" text="Neue Kommentare und Kontohinweise erscheinen hier." />}
  </Page>;
}

function NativeDashboardScreen({ tone, token, account, analytics, adminFeedback, adminPartnerInquiries, state, error, refresh, onBack, onSignIn }: { tone: Tone; token: string | null; account: Account | null; analytics: NativeAnalyticsOverview | null; adminFeedback: NativeAdminFeedback[]; adminPartnerInquiries: NativeAdminPartnerInquiry[]; state: State; error: string | null; refresh: () => Promise<void>; onBack: () => void; onSignIn: () => Promise<void> }) {
  const isOwner = account?.email?.trim().toLowerCase() === "blackwaterleaf@gmail.com";
  if (!token) return <Page><PrivateFeature tone={tone} title="DASHBOARD GESCHÜTZT" text="Melde dich mit dem Eigentümerkonto an, um aggregierte Reichweitenzahlen zu sehen." onSignIn={onSignIn} /></Page>;
  if (!isOwner) return <Page><StatusPanel tone={tone} icon="shield-checkmark-outline" code="OWNER_ONLY" title="KEIN ZUGRIFF" text="Dieses Dashboard ist ausschließlich für das serverseitig geprüfte BlackWaterLeaf-Eigentümerkonto freigegeben." /></Page>;
  const metrics: Array<{ label: string; value: number; icon: IconName }> = analytics ? [
    { label: "KONTEN", value: analytics.registeredAccounts, icon: "people-outline" },
    { label: "SEITENAUFRUFE", value: analytics.pageViews, icon: "pulse-outline" },
    { label: "BESUCHE", value: analytics.visitors, icon: "eye-outline" },
    { label: "LOGINS", value: analytics.logins, icon: "log-in-outline" },
  ] : [];
  const maxPage = Math.max(1, ...(analytics?.popularPages ?? []).map(row => row.value));
  return <Page refresh={refresh} refreshing={state === "loading"}>
    <SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />
    <ObservatoryContextHeader tone={tone} eyebrow="SERVER_VERIFIED · ADMIN" title="KONTROLLZENTRUM" subtitle="Echte, serverseitig aggregierte Nutzung. Keine IP-Adressen, Namen oder Kontoinhalte." icon="analytics-outline" />
    {state === "loading" ? <Loading tone={tone} /> : state === "error" || !analytics ? <ErrorNotice text={error ?? "Analytics sind derzeit nicht verfügbar."} /> : <>
      <View style={styles.dashboardGrid}>{metrics.map(metric => <View key={metric.label} style={[styles.dashboardMetric, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Ionicons name={metric.icon} size={22} color={tone.accent} /><Text style={[styles.eyebrow, { color: tone.accent }]}>{metric.label}</Text><Text style={styles.dashboardMetricValue}>{metric.value}</Text></View>)}</View>
      <View style={[styles.dashboardSummary, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>NUTZUNG · LETZTE 7 TAGE</Text><View style={styles.dashboardSummaryRow}><Text style={styles.cardTitle}>Ø Aufenthaltsdauer</Text><Text style={[styles.cardTitle, { color: tone.accent }]}>{Math.floor(analytics.averageDurationSec / 60)}m {analytics.averageDurationSec % 60}s</Text></View><View style={styles.dashboardSummaryRow}><Text style={styles.cardTitle}>Absprungrate</Text><Text style={[styles.cardTitle, { color: tone.accent }]}>{analytics.bounceRate}%</Text></View></View>
      <View style={[styles.dashboardChart, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>TOP-SEITEN</Text>{analytics.popularPages.length ? analytics.popularPages.slice(0, 6).map(row => <View key={row.label} style={styles.dashboardChartRow}><View style={styles.dashboardChartLabel}><Text style={styles.miniCopy} numberOfLines={1}>{row.label}</Text><Text style={[styles.miniCopy, { color: tone.accent }]}>{row.value}</Text></View><View style={styles.dashboardBarTrack}><View style={[styles.dashboardBar, { width: `${Math.max(4, Math.round((row.value / maxPage) * 100))}%`, backgroundColor: tone.accent }]} /></View></View>) : <Text style={styles.copy}>Noch keine Seitenwerte vorhanden.</Text>}</View>
      <View style={[styles.dashboardPrivacy, { borderColor: `${tone.accent}55` }]}><Ionicons name="lock-closed-outline" size={18} color={tone.accent} /><Text style={styles.miniCopy}>Automatisch anonym und aggregiert. Live-Zuschauerzahlen bleiben getrennt und werden erst bei Freischaltung aktiviert.</Text></View>
      <NativeAdminInbox tone={tone} token={token} feedback={adminFeedback} inquiries={adminPartnerInquiries} onRefresh={refresh} />
    </>}
  </Page>;
}

function statusLabel(status: string) { return ({ received: "EINGEGANGEN", reviewing: "IN PRÜFUNG", resolved: "ERLEDIGT", accepted: "ANGENOMMEN", declined: "ABGELEHNT" } as Record<string, string>)[status] ?? status.toUpperCase(); }
function nextFeedbackStatus(status: NativeAdminFeedback["status"]): NativeAdminFeedback["status"] { return ({ received: "reviewing", reviewing: "resolved", resolved: "received" } as const)[status]; }
function nextPartnerStatus(status: NativeAdminPartnerInquiry["status"]): NativeAdminPartnerInquiry["status"] { return ({ received: "reviewing", reviewing: "accepted", accepted: "declined", declined: "received" } as const)[status]; }

function NativeAdminInbox({ tone, token, feedback, inquiries, onRefresh }: { tone: Tone; token: string; feedback: NativeAdminFeedback[]; inquiries: NativeAdminPartnerInquiry[]; onRefresh: () => Promise<void> }) {
  return <View style={{ gap: 12, marginTop: 8 }}>
    <SectionLabel tone={tone} overline="HOST · EINGANG" title="FEEDBACK VERWALTEN" />
    {feedback.length ? feedback.map(item => <NativeFeedbackAdminRow key={item.id} tone={tone} token={token} item={item} onRefresh={onRefresh} />) : <Text style={styles.miniCopy}>Keine offenen Feedback-Eingänge.</Text>}
    <SectionLabel tone={tone} overline="HOST · PARTNER" title="PARTNERANFRAGEN" />
    {inquiries.length ? inquiries.map(item => <NativePartnerAdminRow key={item.id} tone={tone} token={token} item={item} onRefresh={onRefresh} />) : <Text style={styles.miniCopy}>Keine Partneranfragen.</Text>}
  </View>;
}

function NativeFeedbackAdminRow({ tone, token, item, onRefresh }: { tone: Tone; token: string; item: NativeAdminFeedback; onRefresh: () => Promise<void> }) {
  const [status, setStatus] = useState(item.status); const [note, setNote] = useState(item.adminNote ?? ""); const [response, setResponse] = useState(item.responseMessage ?? ""); const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await adminUpdateFeedback(token, { id: item.id, status, adminNote: note.trim() || null, responseMessage: response.trim() || null }); await onRefresh(); } catch { Alert.alert("Nicht gespeichert", "Die Feedbackantwort konnte nicht gespeichert werden."); } finally { setSaving(false); } };
  return <View style={[styles.dashboardInboxCard, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>#{item.id} · {item.kind === "problem" ? "PROBLEM" : item.kind === "wish" ? "WUNSCH" : "FEEDBACK"}</Text><Text style={styles.cardTitle}>{item.message}</Text><Text style={styles.miniCopy}>{item.userName ?? item.userEmail ?? `Konto #${item.userId}`} · {new Date(item.createdAt).toLocaleString("de-DE")}</Text><TextInput value={note} onChangeText={setNote} placeholder="Interne Notiz …" placeholderTextColor={c.muted} multiline style={styles.dashboardInboxInput} /><TextInput value={response} onChangeText={setResponse} placeholder="Antwort an Absender …" placeholderTextColor={c.muted} multiline style={styles.dashboardInboxInput} /><View style={styles.dashboardInboxActions}><View style={{ flex: 1 }}><Text style={styles.miniCopy}>STATUS</Text><Pressable accessibilityRole="button" accessibilityLabel="Feedbackstatus ändern" onPress={() => setStatus(nextFeedbackStatus(status))} style={styles.dashboardStatusPicker}><Text style={styles.dashboardStatusValue}>{statusLabel(status)}</Text><Ionicons name="chevron-down" size={15} color={tone.accent} /></Pressable></View><SecondaryButton tone={tone} label={saving ? "SPEICHERT" : "SPEICHERN"} icon="send-outline" onPress={() => void save()} /></View></View>;
}

function NativePartnerAdminRow({ tone, token, item, onRefresh }: { tone: Tone; token: string; item: NativeAdminPartnerInquiry; onRefresh: () => Promise<void> }) {
  const [status, setStatus] = useState(item.status); const [note, setNote] = useState(item.adminNote ?? ""); const [response, setResponse] = useState(item.responseMessage ?? ""); const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await adminUpdatePartnerInquiry(token, { id: item.id, status, adminNote: note.trim() || null, responseMessage: response.trim() || null }); await onRefresh(); } catch { Alert.alert("Nicht gespeichert", "Die Partnerantwort konnte nicht gespeichert werden."); } finally { setSaving(false); } };
  return <View style={[styles.dashboardInboxCard, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>PARTNERANFRAGE #{item.id}</Text><Text style={styles.cardTitle}>{item.message}</Text><Text style={styles.miniCopy}>{item.userName ?? "Partnerinteressent"} · {item.contactEmail}</Text><TextInput value={note} onChangeText={setNote} placeholder="Interne Notiz …" placeholderTextColor={c.muted} multiline style={styles.dashboardInboxInput} /><TextInput value={response} onChangeText={setResponse} placeholder="Antwort an Absender …" placeholderTextColor={c.muted} multiline style={styles.dashboardInboxInput} /><View style={styles.dashboardInboxActions}><View style={{ flex: 1 }}><Text style={styles.miniCopy}>STATUS</Text><Pressable accessibilityRole="button" accessibilityLabel="Partnerstatus ändern" onPress={() => setStatus(nextPartnerStatus(status))} style={styles.dashboardStatusPicker}><Text style={styles.dashboardStatusValue}>{statusLabel(status)}</Text><Ionicons name="chevron-down" size={15} color={tone.accent} /></Pressable></View><SecondaryButton tone={tone} label={saving ? "SPEICHERT" : "SPEICHERN"} icon="send-outline" onPress={() => void save()} /></View></View>;
}

function NativeProScreen({ tone, token, onBack }: { tone: Tone; token: string | null; onBack: () => void }) {
  const [status, setStatus] = useState<NativeBillingStatus | null>(null);
  const [packs, setPacks] = useState<NativeCreditPack[]>([]);
  const [busy, setBusy] = useState(false);
  const [customDonation, setCustomDonation] = useState("");
  const features = [
    ["UNBEGRENZTE PRIVATE ANLAGEN", "Pflanzen, Aquarien und Terrarien ohne Kontingent verwalten."],
    ["VOLLSTÄNDIGE PFLEGEHISTORIE", "Verläufe, Messwerte, Bilder und Pflegezustände vergleichen."],
    ["ERWEITERTE AUSWERTUNGEN", "Trends und exportierbare Pflegeübersichten."],
    ["MEHR KI-BESTIMMUNGEN", "Erhöhtes monatliches Kontingent für Bestimmung und Diagnose."],
    ["EXPORT & BACKUP", "Eigene Daten strukturiert sichern und geräteübergreifend nutzen."],
    ["WERBEFREIE NUTZUNG", "Das Observatory ohne Werbeunterbrechungen erleben."],
  ] as const;
  useEffect(() => {
    if (!token) return;
    void Promise.all([billingMe(token), billingPlans(token)]).then(([nextStatus, nextPlans]) => { setStatus(nextStatus); setPacks(nextPlans.creditPacks); }).catch(() => Alert.alert("Pro-Status nicht verfügbar", "Bitte prüfe deine Verbindung und versuche es erneut."));
  }, [token]);
  const buy = async (kind: "credits" | "pro_monthly" | "pro_yearly" | "donation", packKey?: string, donationAmountEur?: number) => {
    if (!token) return;
    setBusy(true);
    try { const session = await billingCheckout(token, { kind, packKey, donationAmountEur }); await Linking.openURL(session.url); } catch (error) { Alert.alert("Checkout nicht gestartet", error instanceof Error && error.message.includes("payments_not_configured") ? "Der Zahlungsanbieter wird noch eingerichtet." : "Bitte später erneut versuchen."); } finally { setBusy(false); }
  };
  if (!token) return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} /><PrivateFeature tone={tone} title="ANMELDUNG ERFORDERLICH" text="Abo-Status und Credits sind nur für angemeldete Konten verfügbar." onSignIn={async () => {}} /></Page>;
  const customDonationValue = Number(customDonation.replace(",", "."));
  const customDonationValid = Number.isFinite(customDonationValue) && customDonationValue >= 1 && customDonationValue <= 500;
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} /><ObservatoryContextHeader tone={tone} eyebrow="BLACKWATERLEAF · PRO" title="MEHR PFLEGE. MEHR ÜBERBLICK." subtitle="Die Kern-Community bleibt frei. KI-Bestimmungen sind transparent begrenzt und können bei Bedarf ergänzt werden." icon="sparkles-outline" /><View style={[styles.managementPrinciples, { borderColor: `${tone.accent}88`, backgroundColor: tone.panel }]}><Ionicons name="sparkles-outline" size={20} color={tone.accent} /><View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: tone.accent }]}>{status?.active ? "PRO AKTIV" : "FREE · TRANSPARENT BEGRENZT"}</Text><Text style={styles.copy}>{status ? `${status.freeIdentificationsRemaining} kostenlose Bestimmungen heute · ${status.aiCredits} Credits verfügbar` : "Kontingent wird geladen …"}</Text><Text style={styles.miniCopy}>{status?.paymentReady ? "Sichere Zahlung verfügbar." : "Zahlung wird nach dem Anbieteranschluss aktiviert."}</Text></View></View><View style={[styles.stack, { marginBottom: 14 }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>KI-CREDITS NACH BEDARF</Text>{packs.map(pack => <View key={pack.key} style={[styles.managementTile, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Ionicons name="sparkles-outline" size={19} color={tone.accent} /><View style={styles.managementTileCopy}><Text style={styles.cardTitle}>{pack.credits} BESTIMMUNGEN · €{pack.priceEur.toFixed(2).replace(".", ",")}</Text><Text style={styles.miniCopy}>Credits verfallen nicht.</Text></View><Pressable accessibilityRole="button" disabled={busy || status?.paymentReady === false} onPress={() => void buy("credits", pack.key)} style={[styles.secondaryButton, (busy || status?.paymentReady === false) && { opacity: 0.45 }]}><Text style={styles.secondaryButtonText}>KAUFEN</Text></Pressable></View>)}</View><View style={styles.stack}>{features.map(([title, text]) => <View key={title} style={[styles.managementTile, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Ionicons name="checkmark-circle-outline" size={19} color={tone.accent} /><View style={styles.managementTileCopy}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.miniCopy}>{text}</Text></View></View>)}</View><View style={styles.dashboardInboxActions}><SecondaryButton tone={tone} label="PRO MONATLICH" icon="sparkles-outline" disabled={busy || status?.paymentReady === false || status?.active} onPress={() => void buy("pro_monthly")} /><SecondaryButton tone={tone} label="PRO JÄHRLICH" icon="calendar-outline" disabled={busy || status?.paymentReady === false || status?.active} onPress={() => void buy("pro_yearly")} /></View><View style={[styles.managementPrinciples, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}><Ionicons name="heart-outline" size={20} color={tone.accent} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>NATURPROJEKT UNTERSTÜTZEN</Text><Text style={styles.miniCopy}>Freier Betrag von 1 € bis 500 € möglich.</Text><TextInput value={customDonation} onChangeText={value => setCustomDonation(value.replace(/[^0-9,.]/g, ""))} placeholder="Eigener Betrag, z. B. 12,50 €" placeholderTextColor={c.muted} keyboardType="decimal-pad" style={styles.searchInput} /></View><SecondaryButton tone={tone} label={customDonationValid ? `${customDonationValue.toFixed(2).replace(".", ",")} € SPENDEN` : "EIGENEN BETRAG EINGEBEN"} icon="heart-outline" disabled={busy || status?.paymentReady === false || !customDonationValid} onPress={() => void buy("donation", undefined, Math.round(customDonationValue * 100) / 100)} /></View><StatusPanel tone={tone} icon="lock-closed-outline" code="FREE / OFFEN" title="COMMUNITY BLEIBT KOSTENLOS" text="Katalog, Basis-Karte, Community und wissenschaftliche Beiträge bleiben frei zugänglich." /></Page>;
}

function ManagementScreen({ tone, token, account, navigate, onSignIn }: { tone: Tone; token: string | null; account: Account | null; navigate: (screen: Screen) => void; onSignIn: () => Promise<void> }) {
  const isOwner = account?.email?.trim().toLowerCase() === "blackwaterleaf@gmail.com";
  const groups = [
    { label: "KONTO & ALLTAG", items: [
      ["Konto & Profil", "Name, Bio, Bild und verknüpfte Profile", "person-outline", () => navigate("profile")],
      ["Anlagen & Pflege", "Botanik, Aquaristik, Terraristik", "leaf-outline", () => navigate("collection")],
      ["Kommunikation", "Postfach und Benachrichtigungen", "chatbubbles-outline", () => navigate("messages")],
      ["Datenschutz & Sicherheit", "Freigaben und Kontoschutz", "shield-checkmark-outline", () => navigate("profile")],
    ] as const },
    { label: "WEITERE EINSTELLUNGEN", items: [
      ["Sprache & Barrierefreiheit", "Sprache, Einheiten und Darstellung", "language-outline", () => navigate("profile")],
      ["Fortschritt & Merkliste", "XP, Level und gespeicherte Inhalte", "trophy-outline", () => navigate("ranking")],
      ...(isOwner ? [["Host-Dashboard", "Echte Reichweite und Konten · nur Eigentümer", "analytics-outline", () => navigate("dashboard")] as const] : []),
      ["Hilfe, Daten & Werkzeuge", "Quellen und Smart-Werte", "link-outline", () => navigate("management")],
      ["BlackWaterLeaf Pro", "Mehr Anlagen, Auswertungen und KI-Kontingent", "sparkles-outline", () => navigate("pro")],
    ] as const },
  ];
  if (!token) return <Page><PrivateFeature tone={tone} title="ANMELDUNG ERFORDERLICH" text="Das Kontozentrum ist nur für angemeldete Konten verfügbar." onSignIn={onSignIn} /></Page>;
  return <Page>
    <ObservatoryContextHeader tone={tone} eyebrow="BLACKWATERLEAF · VERWALTEN" title="EINSTELLUNGEN & WERKZEUGE." subtitle="Ein zentraler Ort für Profil, Anlagen, Kommunikation und Datenschutz." icon="settings-outline" />
    {groups.map(group => <View key={group.label} style={styles.managementGroup}><View style={styles.managementHeading}><Text style={[styles.eyebrow, { color: tone.accent }]}>{group.label}</Text><Text style={styles.miniCopy}>ALLES AN EINEM ORT</Text></View><View style={styles.managementGrid}>{group.items.map(([title, note, icon, onPress]) => <Pressable key={title} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.managementTile, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }, pressed && styles.pressed]}><View style={[styles.managementTileIcon, { borderColor: `${tone.accent}55`, backgroundColor: `${tone.accent}14` }]}><Ionicons name={icon} size={20} color={tone.accent} /></View><View style={styles.managementTileCopy}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.miniCopy}>{note}</Text></View><Ionicons name="chevron-forward" size={18} color={tone.accent} /></Pressable>)}</View></View>)}
    <View style={[styles.managementPrinciples, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Ionicons name="lock-closed-outline" size={19} color={tone.accent} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>PRIVAT BLEIBT PRIVAT.</Text><Text style={styles.miniCopy}>Private Anlagen, Nachrichten, genaue Standorte und nicht freigegebene Medien bleiben geschützt.</Text></View></View>
  </Page>;
}

function ProfileScreen({
  tone,
  token,
  account,
  habitats,
  consents,
  experience,
  visibleKinds,
  menuTarget,
  onToggleVisibleKind,
  state,
  error,
  onSignIn,
  onSignOut,
  onExportData,
  onUpdateProfile,
  onSetConsent,
  onUploadAvatar,
  onCollection,
  navigate,
}: {
  tone: Tone;
  token: string | null;
  account: Account | null;
  habitats: Habitat[];
  consents: ProfileConsent[];
  experience: ExperienceSummary | null;
  visibleKinds: Array<"plant" | "aquarium" | "terrarium">;
  menuTarget: ProfileMenuTarget;
  onToggleVisibleKind: (kind: "plant" | "aquarium" | "terrarium") => void;
  state: State;
  error: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onExportData: () => Promise<void>;
  onUpdateProfile: (input: { name?: string | null; bio?: string | null; locale?: "de" | "en" | "zh-CN" | "es" | "fr"; unitSystem?: "metric" | "imperial"; profileVisibility?: "private" | "unlisted" | "public" }) => Promise<void>;
  onSetConsent: (purpose: ProfileConsent["purpose"], granted: boolean) => Promise<void>;
  onUploadAvatar: (base64: string, mimeType: string) => Promise<void>;
  onCollection: (realm: Realm) => void;
  navigate: (screen: Screen) => void;
}) {
  const [draftName, setDraftName] = useState(account?.name ?? "");
  const [draftBio, setDraftBio] = useState(account?.bio ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [publicPosts, setPublicPosts] = useState<PublicProfilePost[]>([]);
  const [publicPostsRefreshing, setPublicPostsRefreshing] = useState(false);
  useEffect(() => { setDraftName(account?.name ?? ""); setDraftBio(account?.bio ?? ""); }, [account?.name, account?.bio]);
  useEffect(() => { if (token && account?.id) void publicProfilePosts(account.id).then(setPublicPosts).catch(() => setPublicPosts([])); }, [token, account?.id]);
  const refreshPublicPosts = async () => {
    if (!token || !account?.id) return;
    setPublicPostsRefreshing(true);
    try { setPublicPosts(await publicProfilePosts(account.id)); }
    finally { setPublicPostsRefreshing(false); }
  };
  const saveNativeProfile = async () => {
    setProfileSaving(true); setProfileMessage(null);
    try { await onUpdateProfile({ name: draftName.trim() || null, bio: draftBio.trim() || null }); setProfileMessage("Profil sicher gespeichert."); }
    catch (cause) { setProfileMessage(cause instanceof Error ? cause.message : "Profil konnte nicht gespeichert werden."); }
    finally { setProfileSaving(false); }
  };
  const consentGranted = (purpose: ProfileConsent["purpose"]) => Boolean(consents.find(item => item.purpose === purpose)?.granted);
  const toggleConsent = (purpose: ProfileConsent["purpose"]) => { void onSetConsent(purpose, !consentGranted(purpose)); };
  const setProfileVisibility = async (profileVisibility: "private" | "unlisted" | "public") => {
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      if (profileVisibility === "public" && !consentGranted("profile_publication")) {
        await onSetConsent("profile_publication", true);
      }
      await onUpdateProfile({ profileVisibility });
      setProfileMessage(profileVisibility === "public" ? "Profil ist öffentlich sichtbar." : profileVisibility === "unlisted" ? "Profil ist nur über direkte Links sichtbar." : "Profil ist privat.");
    } catch (cause) {
      setProfileMessage(cause instanceof Error ? cause.message : "Profil-Sichtbarkeit konnte nicht gespeichert werden.");
    } finally {
      setProfileSaving(false);
    }
  };
  const chooseNativeAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setProfileMessage("Zugriff auf die Galerie wurde nicht freigegeben."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.86, allowsEditing: true, aspect: [1, 1], base64: false });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    setProfileSaving(true); setProfileMessage(null);
    try { const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 }); await onUploadAvatar(base64, asset.mimeType ?? "image/jpeg"); setProfileMessage("Profilbild sicher gespeichert."); }
    catch (cause) { setProfileMessage(cause instanceof Error ? cause.message : "Profilbild konnte nicht gespeichert werden."); }
    finally { setProfileSaving(false); }
  };
  if (!token)
    return (
      <Page>
        <PrivateFeature
          tone={tone}
          title="DEIN BEREICH BLEIBT PRIVAT."
          text="Nach der sicheren Anmeldung kannst du dein Profil, deine Anlagen und deine Freigaben in der nativen App verwalten."
          onSignIn={onSignIn}
        />
      </Page>
    );
  return (
    <Page refresh={refreshPublicPosts} refreshing={publicPostsRefreshing}>
      {menuTarget !== "open" ? <View style={[styles.profileTargetPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}>
        <Text style={[styles.chip, { color: tone.accent }]}>PROFIL · ZIEL</Text>
        <Text style={styles.cardTitle}>{menuTarget === "edit" || menuTarget === "private" ? "NAME & PROFIL BEARBEITEN" : menuTarget === "avatar" ? "PROFILBILD BEARBEITEN" : menuTarget === "display" || menuTarget === "habitats" ? "ANLAGEN ANZEIGEN" : menuTarget === "privacy" ? "DATENSCHUTZ & FREIGABEN" : menuTarget === "preferences" ? "SPRACHE & EINHEITEN" : "WEITERE WERKZEUGE"}</Text>
        <Text style={styles.miniCopy}>{menuTarget === "display" || menuTarget === "habitats" ? "Die drei Anlagearten kannst du direkt darunter separat ein- oder ausblenden." : menuTarget === "privacy" ? "Jede Freigabe wird serverseitig im Konto gespeichert." : menuTarget === "preferences" ? "Diese Einstellungen gelten auf Web und Native für dein Konto." : menuTarget === "tools" ? "Builder und Smart-Geräte bleiben aus dem Kernprofil heraus erreichbar." : "Dieses Ziel wurde über das Drei-Punkte-Menü geöffnet."}</Text>
        {menuTarget === "tools" ? <View style={styles.inlineButtons}><SecondaryButton tone={tone} label="SMART-WERTE" icon="link-outline" onPress={() => Alert.alert("Smart-Werte verbinden", "Die Smart-Geräteauswahl wird in einem nächsten Native-Schritt ergänzt.")} /></View> : null}
        {menuTarget === "privacy" ? <View style={styles.profileVisibilityNative}><Text style={[styles.eyebrow, { color: tone.accent }]}>PROFIL-SICHTBARKEIT</Text><Text style={styles.miniCopy}>{account?.profileVisibility === "public" ? "Öffentlich: Profil und freigegebene Beiträge sind sichtbar." : account?.profileVisibility === "unlisted" ? "Unlisted: nur direkte Links zeigen das Profil." : "Privat: andere sehen dein Profil nicht."}</Text><View style={styles.inlineButtons}><SecondaryButton tone={tone} label="PRIVAT" icon="lock-closed-outline" disabled={profileSaving} onPress={() => void setProfileVisibility("private")} /><SecondaryButton tone={tone} label="UNLISTED" icon="link-outline" disabled={profileSaving} onPress={() => void setProfileVisibility("unlisted")} /><PrimaryButton tone={tone} label="ÖFFENTLICH" icon="globe-outline" disabled={profileSaving} onPress={() => void setProfileVisibility("public")} /></View></View> : null}
        {menuTarget === "privacy" ? <View style={styles.profileConsentPanel}>{([['profile_publication', 'Profil veröffentlichen'], ['observation_publishing', 'Beobachtungen veröffentlichen'], ['media_processing', 'Bilder sicher verarbeiten'], ['community_publishing', 'Community-Beiträge veröffentlichen'], ['ai_processing', 'KI-Anfragen verarbeiten'], ['location_processing', 'Grobe Region für aktuelles Wetter verwenden']] as const).map(([purpose, label]) => <View key={purpose} style={styles.profileConsentRow}><Text style={styles.miniCopy}>{label}</Text><Switch value={consentGranted(purpose)} onValueChange={() => toggleConsent(purpose)} thumbColor={consentGranted(purpose) ? tone.accent : c.muted} trackColor={{ false: `${c.muted}55`, true: `${tone.accent}55` }} /></View>)}</View> : null}
        {menuTarget === "privacy" ? <SecondaryButton tone={tone} label="DATENEXPORT TEILEN" icon="download-outline" onPress={() => void onExportData().then(() => setProfileMessage("Datenexport erstellt.")).catch(cause => setProfileMessage(cause instanceof Error ? cause.message : "Export fehlgeschlagen."))} /> : null}
        {menuTarget === "preferences" ? <View style={styles.profilePreferencesPanel}><Text style={[styles.eyebrow, { color: tone.accent }]}>SPRACHE</Text><View style={styles.inlineButtons}><SecondaryButton tone={tone} label="DEUTSCH" icon="language-outline" onPress={() => void onUpdateProfile({ locale: "de" })} /><SecondaryButton tone={tone} label="ENGLISH" icon="language-outline" onPress={() => void onUpdateProfile({ locale: "en" })} /><SecondaryButton tone={tone} label="简体中文" icon="language-outline" onPress={() => void onUpdateProfile({ locale: "zh-CN" })} /><SecondaryButton tone={tone} label="ESPAÑOL" icon="language-outline" onPress={() => void onUpdateProfile({ locale: "es" })} /><SecondaryButton tone={tone} label="FRANÇAIS" icon="language-outline" onPress={() => void onUpdateProfile({ locale: "fr" })} /></View><Text style={[styles.eyebrow, { color: tone.accent }]}>EINHEITEN</Text><View style={styles.inlineButtons}><SecondaryButton tone={tone} label="METRISCH" icon="speedometer-outline" onPress={() => void onUpdateProfile({ unitSystem: "metric" })} /><SecondaryButton tone={tone} label="IMPERIAL" icon="speedometer-outline" onPress={() => void onUpdateProfile({ unitSystem: "imperial" })} /></View></View> : null}
        {menuTarget === "edit" || menuTarget === "private" || menuTarget === "avatar" ? <View style={styles.profileEditPanel}>
          {menuTarget === "avatar" ? <SecondaryButton tone={tone} label="PROFILBILD AUS GALERIE WÄHLEN" icon="image-outline" onPress={() => void chooseNativeAvatar()} disabled={profileSaving} /> : null}
          {menuTarget === "edit" ? <><TextInput value={draftName} onChangeText={setDraftName} placeholder="Anzeigename" placeholderTextColor={c.muted} style={styles.profileInput} maxLength={160} /><TextInput value={draftBio} onChangeText={setDraftBio} placeholder="Bio" placeholderTextColor={c.muted} style={[styles.profileInput, styles.profileBioInput]} multiline maxLength={2000} /><PrimaryButton tone={tone} label={profileSaving ? "SPEICHERN…" : "PROFIL SPEICHERN"} icon="save-outline" onPress={() => void saveNativeProfile()} disabled={profileSaving} /><SecondaryButton tone={tone} label="PROFILBILD WÄHLEN" icon="image-outline" onPress={() => void chooseNativeAvatar()} disabled={profileSaving} /></> : null}
          {profileMessage ? <Text style={styles.miniCopy}>{profileMessage}</Text> : null}
        </View> : null}
      </View> : null}
      <View style={[styles.profileCreatorCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>
        <View style={styles.profileCreatorTop}>
          <View style={[styles.profileCreatorAvatar, { borderColor: `${tone.accent}88`, backgroundColor: `${tone.accent}16` }]}>{account?.avatarUrl ? <Image source={{ uri: account.avatarUrl }} style={styles.profileCreatorAvatarImage} accessibilityLabel={`${account.name ?? account.username ?? "Profil"} Profilbild`} /> : <Ionicons name="person-outline" size={42} color={tone.accent} />}</View>
          <View style={styles.profileCreatorIdentity}><Text style={[styles.eyebrow, { color: tone.accent }]}>BLACKWATERLEAF · PROFIL</Text><Text style={styles.profileCreatorName}>{account?.name ?? "Name nicht hinterlegt"}</Text><Text style={styles.profileCreatorHandle}>{account?.username ? `@${account.username}` : "Persönliches Fachprofil"}</Text></View>
        </View>
        <Text style={styles.profileCreatorBio}>{account?.bio ?? "Dein Fachprofil für Pflanzen, Aquaristik und verantwortungsvolle Beobachtungen."}</Text>
        <View style={styles.profileCreatorLinks}>{account?.email ? <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(`mailto:${account.email}`)} style={styles.profileCreatorLink}><Ionicons name="mail-outline" size={15} color={tone.accent} /><Text style={[styles.miniCopy, { color: tone.accent }]} numberOfLines={1}>{account.email}</Text></Pressable> : null}{Object.entries(account?.socialLinks ?? {}).filter(([, value]) => Boolean(value)).map(([label, value]) => <Pressable key={label} accessibilityRole="link" onPress={() => void Linking.openURL(String(value))} style={styles.profileCreatorLink}><Ionicons name="link-outline" size={15} color={tone.accent} /><Text style={[styles.miniCopy, { color: tone.accent }]}>{label}</Text></Pressable>)}</View>
        <View style={styles.profileCreatorStats}><View style={styles.profileReferenceStat}><Ionicons name="trophy-outline" size={15} color={tone.accent} /><Text style={styles.profileReferenceStatValue}>{experience?.status === "ready" ? experience.totalXp : "—"}</Text><Text style={styles.profileReferenceStatLabel}>XP</Text></View><View style={styles.profileReferenceStat}><Text style={styles.profileReferenceStatValue}>{experience?.status === "ready" ? experience.level : "—"}</Text><Text style={styles.profileReferenceStatLabel}>LEVEL</Text></View><View style={styles.profileReferenceStat}><Text style={styles.profileReferenceStatValue}>{habitats.length}</Text><Text style={styles.profileReferenceStatLabel}>ANLAGEN</Text></View></View>
        <SecondaryButton tone={tone} label="VERWALTEN · PROFIL & EINSTELLUNGEN" icon="settings-outline" onPress={() => navigate("management")} />
      </View>
      <View style={[styles.profileSubscriptionCard, { borderColor: `${c.botany}88`, backgroundColor: tone.panel }]} accessibilityLabel="Abo-Status">
        <View style={styles.profileSubscriptionHeading}><View><Text style={[styles.eyebrow, { color: c.botany }]}>BLACKWATERLEAF · ABO</Text><Text style={styles.sectionTitle}><Ionicons name="sparkles-outline" size={16} color={c.botany} /> FREE · AKTUELL</Text></View><Text style={[styles.chip, { color: c.botany }]}>ZAHLUNG VORBEREITET</Text></View>
        <Text style={styles.miniCopy}>Dein aktueller Status und die Upgrade-Möglichkeiten bleiben auf Web und Native transparent.</Text>
        <View style={styles.profileSubscriptionPlans}><View style={styles.profileSubscriptionPlan}><Text style={styles.cardTitle}>FREE</Text><Text style={styles.miniCopy}>Katalog, Community, Basis-Karte und eine private Anlage</Text></View><View style={[styles.profileSubscriptionPlan, { borderColor: `${c.botany}88` }]}><Text style={[styles.cardTitle, { color: c.botany }]}>PRO · €39,99 / JAHR</Text><Text style={styles.miniCopy}>Unbegrenzte Anlagen, Pflegehistorie, Auswertungen, mehr KI, Export und Backup</Text></View></View>
        <PrimaryButton tone={tone} label="UPGRADE-OPTIONEN ANSEHEN" icon="sparkles-outline" onPress={() => navigate("pro")} />
      </View>
      <SectionLabel tone={tone} overline="PRIVATE SAMMLUNG" title="MEINE ANLAGEN & WERTE" />
      <Text style={styles.profileReferenceSubline}>Privat · Wähle direkt deinen Bereich</Text>
      <View style={styles.profileHabitatChoiceGridNative}>
        {([['plant', 'Botanik', 'Pflanzen-Anlagen', 'leaf-outline', 'botany'], ['aquarium', 'Aquaristik', 'Aquarien & Wasserwerte', 'fish-outline', 'aquarium'], ['terrarium', 'Terraristik', 'Terrarien & Pflege', 'bug-outline', 'terrarium']] as const).filter(([kind]) => visibleKinds.includes(kind)).map(([kind, label, note, icon, realm]) => (
          <Pressable key={kind} onPress={() => onCollection(realm)} style={({ pressed }) => [styles.profileHabitatChoiceNative, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }, pressed && styles.pressed]}>
            <View style={[styles.profileHabitatChoiceIcon, { backgroundColor: `${tone.accent}16`, borderColor: `${tone.accent}44` }]}><Ionicons name={icon} size={19} color={tone.accent} /></View>
            <View style={styles.profileHabitatChoiceCopy}><Text style={styles.cardTitle}>{label}</Text><Text style={styles.miniCopy}>{note}</Text></View>
            <Ionicons name="chevron-forward" size={17} color={tone.accent} />
          </Pressable>
        ))}
      </View>
      {publicPosts.length ? <View style={[styles.profileReferencePostsPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}>
        <View style={styles.profileReferencePostsHeader}><View><Text style={[styles.eyebrow, { color: tone.accent }]}>BEITRÄGE & BILDER</Text><Text style={styles.sectionTitle}>FREIGEGEBENE BEITRÄGE</Text></View><SecondaryButton tone={tone} label="POST" icon="camera-outline" onPress={() => navigate("post")} /></View>
        <View style={styles.profilePublicPostGrid}>{publicPosts.slice(0, 9).map(post => { const media = post.media?.find(item => item.url); return <Pressable key={post.id} onPress={() => navigate("community")} style={({ pressed }) => [styles.profilePublicPostTile, { borderColor: `${tone.accent}33`, backgroundColor: `${tone.accent}08` }, pressed && styles.pressed]}>{media?.url && media.mimeType.startsWith("image/") ? <Image source={{ uri: media.url }} style={styles.profilePublicPostImage} accessibilityLabel={post.content.slice(0, 90)} /> : <View style={styles.profilePublicPostFallback}><Ionicons name={media?.mimeType.startsWith("video/") ? "play-circle-outline" : "camera-outline"} size={24} color={tone.accent} /><Text style={styles.profilePublicPostFallbackText} numberOfLines={3}>{post.content}</Text></View>}<Text style={[styles.chip, { color: tone.accent }]}>{post.realm?.toUpperCase() ?? "COMMUNITY"}</Text></Pressable>; })}</View>
      </View> : null}
      <SecondaryButton tone={tone} label="ABMELDEN" icon="log-out-outline" onPress={() => void onSignOut()} />
    </Page>
  );
}

function CollectionScreen({
  tone,
  token,
  habitats,
  initialRealm,
  prefill,
  onSignIn,
  onSaved,
}: {
  tone: Tone;
  token: string | null;
  habitats: Habitat[];
  initialRealm: Realm;
  prefill?: { kind: "plant" | "aquarium" | "terrarium"; name: string; scientificName?: string };
  onSignIn: () => Promise<void>;
  onSaved: () => Promise<void>;
}) {
  if (!token)
    return (
      <Page>
        <PrivateFeature
          tone={tone}
          title="ANLAGEN BLEIBEN PRIVAT."
          text="Melde dich an, um deine Pflanzen, Aquarien oder Terrarien zu verwalten."
          onSignIn={onSignIn}
        />
      </Page>
    );
  return (
    <View style={[styles.collectionShell, { backgroundColor: tone.surface }]}>
      <View style={styles.collectionIntro}>
        <Text style={[styles.chip, { color: realmAccent(initialRealm) }]}>
          PRIVATE ANLAGEN
        </Text>
        <Text style={styles.headingTitle}>
          {initialRealm === "botany"
            ? "PFLANZEN"
            : initialRealm === "aquarium"
              ? "AQUARIEN"
              : "TERRARIEN"}{" "}
          VERWALTEN
        </Text>
        <Text style={styles.copy}>
          Die Inhalte werden aus deinem geschützten BlackWaterLeaf-Konto
          geladen. Es gibt keine Beispielanlagen.
        </Text>
      </View>
      <HabitatManager
        token={token}
        habitats={habitats}
        initialKind={initialRealm === "botany" ? "plant" : initialRealm}
        prefill={prefill}
        onSaved={onSaved}
      />
    </View>
  );
}

function SearchScreen({ tone, state, error, refresh, navigate, onOpenProfile, onOpenTaxon, onOpenAquariumTaxon, onOpenTerrariumTaxon, onOpenCatalog }: { tone: Tone; products: MarketplaceProduct[]; articles: KnowledgeArticle[]; state: State; error: string | null; refresh: () => Promise<void>; navigate: (screen: Screen) => void; onOpenProfile: (id: number) => void; onOpenTaxon: (id: number) => void; onOpenAquariumTaxon: (id: number) => void; onOpenTerrariumTaxon: (id: number) => void; onOpenCatalog: (realm: Realm) => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<UnifiedSearchResult | null>(null);
  const [remoteState, setRemoteState] = useState<State>("ready");
  const [cursor, setCursor] = useState<string | undefined>();
  const normalized = term.trim();
  useEffect(() => {
    if (normalized.length < 2) { setResults(null); setCursor(undefined); setRemoteState("ready"); return; }
    let active = true;
    setRemoteState("loading");
    const timer = setTimeout(() => { void unifiedSearch(normalized, "all", cursor).then(value => { if (active) { setResults(value); setRemoteState("ready"); } }).catch(() => { if (active) setRemoteState("error"); }); }, 220);
    return () => { active = false; clearTimeout(timer); };
  }, [normalized, cursor]);
  const total = results ? results.taxa.length + results.aquarium.length + results.knowledge.length + results.profiles.length + results.community.length + results.products.length : 0;
  const openTarget = (kind: string, id: string, destinationUrl?: string) => { if (kind === "profile") onOpenProfile(Number(id)); else if (kind === "plant") onOpenTaxon(Number(id)); else if (kind === "aquarium") onOpenAquariumTaxon(Number(id)); else if (kind === "terrarium") onOpenTerrariumTaxon(Number(id)); else if (kind === "community") navigate("community"); else if (kind === "knowledge") navigate("knowledge"); else if (destinationUrl) void Linking.openURL(destinationUrl); };
  const card = (kind: string, id: string, title: string, note: string, meta: string, destinationUrl?: string) => <Pressable key={`${kind}-${id}`} onPress={() => openTarget(kind, id, destinationUrl)} style={({ pressed }) => [styles.searchResultCard, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }, pressed && styles.pressed]}><View style={[styles.searchResultIcon, { backgroundColor: `${tone.accent}18`, borderColor: `${tone.accent}44` }]}><Ionicons name={kind === "plant" ? "leaf-outline" : kind === "aquarium" ? "fish-outline" : kind === "profile" ? "person-outline" : kind === "community" ? "chatbubble-ellipses-outline" : kind === "product" ? "bag-handle-outline" : "book-outline"} size={19} color={tone.accent} /></View><View style={styles.searchResultCopy}><Text style={styles.cardTitle} numberOfLines={1}>{title}</Text><Text style={styles.miniCopy} numberOfLines={2}>{note}</Text><Text style={[styles.chip, { color: tone.accent }]}>{meta}</Text></View><Ionicons name="chevron-forward" size={17} color={tone.accent} /></Pressable>;
  return <Page refresh={refresh} refreshing={state === "loading" || remoteState === "loading"}><ObservatoryContextHeader tone={tone} eyebrow="BLACKWATERLEAF · KATALOG" title="SUCHEN & ENTDECKEN" subtitle="Validierte Pflanzen, Channa-Fische, Wissen, Profile, Community und freigegebene Händler in einer Suche." icon="search-outline" /><View style={styles.catalogRealmButtons}>{([ ["botany", "Botanik", "leaf-outline"], ["aquarium", "Aquaristik", "fish-outline"], ["terrarium", "Terraristik", "bug-outline"] ] as const).map(([realm, label, icon]) => <Pressable key={realm} onPress={() => onOpenCatalog(realm)} style={({ pressed }) => [styles.catalogRealmButton, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }, pressed && styles.pressed]}><Ionicons name={icon} size={17} color={tone.accent} /><Text style={styles.cardTitle}>{label}</Text><Ionicons name="chevron-forward" size={16} color={tone.accent} /></Pressable>)}</View><TextInput style={[styles.searchInput, { borderColor: `${tone.accent}66` }]} value={term} onChangeText={value => { setTerm(value); setCursor(undefined); }} placeholder="Pflanze, Fisch, Profil, Wissen oder Produkt suchen …" placeholderTextColor={c.muted} autoCapitalize="none" returnKeyType="search" />{remoteState === "loading" ? <Loading tone={tone} /> : remoteState === "error" ? <ErrorNotice text="Die Einheitssuche konnte nicht geladen werden." /> : normalized.length < 2 ? <StatusPanel tone={tone} icon="search-outline" code="SUCHE / BEREIT" title="WONACH SUCHST DU?" text="Gib mindestens zwei Zeichen ein. Es werden nur veröffentlichte und freigegebene Daten durchsucht." /> : !total || !results ? <StatusPanel tone={tone} icon="search-outline" code="SUCHE / LEER" title="KEINE PASSENDEN TREFFER" text="Für diesen Begriff gibt es aktuell keinen veröffentlichten Datensatz." /> : <View style={styles.stack}><Text style={[styles.chip, { color: tone.accent }]}>{total} TREFFER · ECHTE DATEN</Text>{results.aquarium.map(item => card("aquarium", item.id, item.scientificName, item.commonNames?.[0] ?? item.family ?? "Validierter Aquaristik-Datensatz", item.evidenceState))}{results.taxa.map(item => card("plant", item.id, item.scientificName, item.acceptedScientificName ?? item.family ?? "Validierter Taxon-Datensatz", item.evidenceState))}{results.knowledge.map(item => card("knowledge", item.id, item.title, item.excerpt, item.realm ?? "Wissen"))}{results.profiles.map(item => card("profile", item.id, item.name ?? item.username ?? "BlackWaterLeaf-Nutzer", item.username ? `@${item.username}` : "Öffentliches Profil", "Profil"))}{results.community.map(item => card("community", item.id, item.realm ?? "Community", item.content, "Öffentlicher Beitrag"))}{results.products.map(item => card("product", item.id, item.title, item.partnerName ?? "Freigegebener Händler", item.priceLabel ?? "Marktplatz", item.destinationUrl))}{results.nextCursor ? <SecondaryButton tone={tone} label="WEITERE TREFFER" icon="add-outline" onPress={() => setCursor(results.nextCursor ?? undefined)} /> : null}</View>}</Page>;
}
function CatalogOverviewScreen({ tone, realm, onBack, onOpenTaxon, onOpenAquariumTaxon, onOpenTerrariumTaxon }: { tone: Tone; realm: Realm; onBack: () => void; onOpenTaxon: (id: number) => void; onOpenAquariumTaxon: (id: number) => void; onOpenTerrariumTaxon: (id: number) => void }) {
  const [items, setItems] = useState<PublicCatalogTaxon[]>([]);
  const [state, setState] = useState<State>("loading");
  const [term, setTerm] = useState("");
  const [catalogLetter, setCatalogLetter] = useState("Alle");
  const [familyFilter, setFamilyFilter] = useState("Alle");
  const [genusFilter, setGenusFilter] = useState("Alle");
  const [imageFilter, setImageFilter] = useState("Alle");
  useEffect(() => { let active = true; setState("loading"); void catalogByRealm(realm, 200).then(value => { if (active) { setItems(value); setState("ready"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [realm]);
  const filtered = items.filter(item => { const name = item.commonNames[0] ?? item.acceptedScientificName ?? item.scientificName; const extended = item as PublicCatalogTaxon & { genus?: string | null }; const verified = Boolean(item.imageUrl && item.imageSourceUrl && item.imageLicense && item.imageAttribution && item.imageVerifiedAt); return `${item.commonNames.join(" ")} ${item.scientificName} ${item.acceptedScientificName ?? ""}`.toLocaleLowerCase().includes(term.trim().toLocaleLowerCase()) && (catalogLetter === "Alle" || name.toLocaleUpperCase().startsWith(catalogLetter)) && (familyFilter === "Alle" || item.family === familyFilter) && (genusFilter === "Alle" || extended.genus === genusFilter) && (imageFilter === "Alle" || (imageFilter === "Verifiziert" ? verified : !verified)); });
  const families = Array.from(new Set(items.map(item => item.family).filter(Boolean))).sort();
  const genera = Array.from(new Set(items.map(item => (item as PublicCatalogTaxon & { genus?: string | null }).genus).filter(Boolean))).sort();
  const realmTitle = realm === "botany" ? "BOTANIK" : realm === "aquarium" ? "AQUARISTIK" : "TERRARISTIK";
  return <Page><SecondaryButton tone={tone} label="ZURÜCK ZUM KATALOG" icon="arrow-back-outline" onPress={onBack} /><ObservatoryContextHeader tone={tone} eyebrow={`ALPHABETISCH · ${realmTitle}`} title={realmTitle} subtitle="Große Bilder, gebräuchlicher Name und wissenschaftlicher Name in einer klaren Fachbereichsliste." icon={realm === "aquarium" ? "fish-outline" : realm === "terrarium" ? "bug-outline" : "leaf-outline"} /><TextInput style={[styles.searchInput, { borderColor: `${tone.accent}66` }]} value={term} onChangeText={setTerm} placeholder="Im Katalog filtern …" placeholderTextColor={c.muted} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogNativeFilterRow}>{["Alle", ...Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))].map(letter => <Pressable key={letter} onPress={() => setCatalogLetter(letter)} style={[styles.catalogNativeFilterChip, { borderColor: catalogLetter === letter ? tone.accent : `${tone.accent}44`, backgroundColor: catalogLetter === letter ? `${tone.accent}22` : tone.panel }]}><Text style={[styles.miniCopy, { color: tone.accent }]}>{letter}</Text></Pressable>)}</ScrollView><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogNativeFilterRow}>{["Alle", ...families].map(value => <Pressable key={`f-${value}`} onPress={() => setFamilyFilter(String(value))} style={[styles.catalogNativeFilterChip, { borderColor: familyFilter === value ? tone.accent : `${tone.accent}44` }]}><Text style={styles.miniCopy}>{value}</Text></Pressable>)}{["Alle", ...genera].map(value => <Pressable key={`g-${value}`} onPress={() => setGenusFilter(String(value))} style={[styles.catalogNativeFilterChip, { borderColor: genusFilter === value ? tone.accent : `${tone.accent}44` }]}><Text style={styles.miniCopy}>{value}</Text></Pressable>)}{["Alle", "Verifiziert", "Ohne Bild"].map(value => <Pressable key={`i-${value}`} onPress={() => setImageFilter(value)} style={[styles.catalogNativeFilterChip, { borderColor: imageFilter === value ? tone.accent : `${tone.accent}44` }]}><Text style={styles.miniCopy}>{value}</Text></Pressable>)}</ScrollView><Text style={[styles.chip, { color: tone.accent }]}>{state === "ready" ? `${filtered.length} EINTRÄGE · ALPHABETISCH` : "ECHTE KATALOGDATEN"}</Text>{state === "loading" ? <Loading tone={tone} /> : state === "error" ? <ErrorNotice text="Der Katalog konnte nicht geladen werden." /> : !filtered.length ? <StatusPanel tone={tone} icon="leaf-outline" code="KATALOG / LEER" title="KEINE VERÖFFENTLICHTEN TAXA" text="Es werden keine Beispiel-Datensätze angezeigt." /> : <View style={styles.catalogNativeGrid}>{filtered.map(item => { const verified = Boolean(item.imageUrl && item.imageSourceUrl && item.imageLicense && item.imageAttribution && item.imageVerifiedAt); const common = item.commonNames[0] ?? item.acceptedScientificName ?? item.scientificName; return <Pressable key={`${item.type}-${item.id}`} onPress={() => item.type === "aquarium" ? onOpenAquariumTaxon(item.id) : item.type === "terrarium" ? onOpenTerrariumTaxon(item.id) : onOpenTaxon(item.id)} style={({ pressed }) => [styles.catalogNativeCard, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }, pressed && styles.pressed]}><View style={[styles.catalogNativeImage, { backgroundColor: `${tone.accent}13` }]}>{verified ? <Image source={{ uri: item.imageUrl! }} style={styles.catalogNativeImageAsset} accessibilityLabel={`${common} – ${item.scientificName}`} /> : <Ionicons name={item.type === "aquarium" ? "fish-outline" : item.type === "terrarium" ? "bug-outline" : "leaf-outline"} size={30} color={tone.accent} />}</View><Text style={styles.catalogNativeName} numberOfLines={2}>{common}</Text><Text style={[styles.catalogNativeScientific, { color: tone.accent }]} numberOfLines={2}>{item.scientificName}</Text></Pressable>; })}</View>}</Page>;
}
function PublicProfileScreen({ tone, token, profileId, onBack, onSignIn, onOpenProfile, onMessage }: { tone: Tone; token: string | null; profileId: number; onBack: () => void; onSignIn: () => Promise<void>; onOpenProfile: (id: number) => void; onMessage: (profile: PublicProfile) => void }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [relationship, setRelationship] = useState<SocialRelationship | null>(null);
  const [posts, setPosts] = useState<PublicProfilePost[]>([]);
  const [followers, setFollowers] = useState<SocialProfileListEntry[]>([]);
  const [following, setFollowing] = useState<SocialProfileListEntry[]>([]);
  const [activeList, setActiveList] = useState<"followers" | "following">("followers");
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  useEffect(() => { let active = true; setState("loading"); void Promise.all([publicProfile(profileId), socialRelationship(token, profileId), publicProfilePosts(profileId), socialFollowers(token, profileId), socialFollowing(token, profileId)]).then(([nextProfile, nextRelationship, nextPosts, nextFollowers, nextFollowing]) => { if (active) { setProfile(nextProfile); setRelationship(nextRelationship); setPosts(nextPosts); setFollowers(nextFollowers); setFollowing(nextFollowing); setState(nextProfile ? "ready" : "error"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [profileId, token]);
  const toggleFollow = async () => { if (!token) { await onSignIn(); return; } setBusy(true); try { if (relationship?.isFollowing) await unfollowProfile(token, profileId); else await followProfile(token, profileId); setRelationship(await socialRelationship(token, profileId)); } catch (cause) { Alert.alert("Profilaktion nicht möglich", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } finally { setBusy(false); } };
  const toggleBlock = async () => { if (!token) { await onSignIn(); return; } setBlockBusy(true); try { if (relationship?.isBlockedByMe) await unblockCommunityUser(token, profileId); else await blockCommunityUser(token, profileId); setRelationship(await socialRelationship(token, profileId)); } catch (cause) { Alert.alert("Profilaktion nicht möglich", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } finally { setBlockBusy(false); } };
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{state === "loading" ? <Loading tone={tone} /> : state === "error" || !profile ? <StatusPanel tone={tone} icon="person-outline" code="PROFIL / NICHT ÖFFENTLICH" title="PROFIL NICHT VERFÜGBAR" text="Dieses Profil ist nicht öffentlich oder wurde entfernt." /> : <><View style={[styles.publicProfileCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>{profile.avatarUrl ? <Image source={{ uri: profile.avatarUrl }} style={styles.publicAvatar} /> : <View style={[styles.publicAvatar, { backgroundColor: `${tone.accent}18`, borderColor: `${tone.accent}66` }]}><Ionicons name="person-outline" size={35} color={tone.accent} /></View>}<View style={styles.publicProfileCopy}><Text style={[styles.chip, { color: tone.accent }]}>ÖFFENTLICHES PROFIL</Text><Text style={styles.observatoryContextTitle} numberOfLines={2}>{profile.name ?? profile.username ?? "BlackWaterLeaf-Nutzer"}</Text><Text style={styles.miniCopy}>{profile.username ? `@${profile.username}` : ""}</Text>{profile.bio ? <Text style={styles.copy}>{profile.bio}</Text> : null}</View>{token ? <View style={styles.inlineButtons}><SecondaryButton tone={tone} label="NACHRICHT" icon="mail-outline" onPress={() => onMessage(profile)} /><PrimaryButton tone={tone} label={relationship?.isFollowing ? "NICHT MEHR FOLGEN" : "FOLGEN"} icon={relationship?.isFollowing ? "person-remove-outline" : "person-add-outline"} onPress={() => void toggleFollow()} disabled={busy} /><SecondaryButton tone={tone} label={relationship?.isBlockedByMe ? "ENTBLOCKEN" : "BLOCKIEREN"} icon={relationship?.isBlockedByMe ? "checkmark-circle-outline" : "ban-outline"} onPress={() => void toggleBlock()} disabled={busy || blockBusy} /></View> : <SecondaryButton tone={tone} label="ANMELDEN" icon="log-in-outline" onPress={() => void onSignIn()} />}</View><View style={[styles.publicStats, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Stat label="FOLLOWER" value={String(relationship?.followers ?? "—")} tone={tone} /><Stat label="FOLGT" value={String(relationship?.following ?? "—")} tone={tone} /><Stat label="STATUS" value="ÖFFENTLICH" tone={tone} /></View><View style={[styles.publicSocialLists, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><View style={styles.liveGroupHeading}><View><Text style={[styles.eyebrow, { color: tone.accent }]}>COMMUNITY · BEZIEHUNGEN</Text><Text style={styles.cardTitle}>FOLLOWER &amp; FOLGT</Text></View><Text style={[styles.chip, { color: tone.accent }]}>{activeList === "followers" ? followers.length : following.length}</Text></View><View style={styles.publicSocialTabs}><Pressable accessibilityRole="tab" accessibilityState={{ selected: activeList === "followers" }} onPress={() => setActiveList("followers")} style={[styles.publicSocialTab, { borderColor: activeList === "followers" ? tone.accent : `${tone.accent}44`, backgroundColor: activeList === "followers" ? `${tone.accent}18` : "transparent" }]}><Text style={[styles.miniCopy, { color: activeList === "followers" ? tone.accent : c.muted }]}>FOLLOWER · {relationship?.followers ?? "—"}</Text></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: activeList === "following" }} onPress={() => setActiveList("following")} style={[styles.publicSocialTab, { borderColor: activeList === "following" ? tone.accent : `${tone.accent}44`, backgroundColor: activeList === "following" ? `${tone.accent}18` : "transparent" }]}><Text style={[styles.miniCopy, { color: activeList === "following" ? tone.accent : c.muted }]}>FOLGT · {relationship?.following ?? "—"}</Text></Pressable></View>{(activeList === "followers" ? followers : following).length ? <View style={styles.publicSocialList}>{(activeList === "followers" ? followers : following).map(person => <Pressable key={person.id} onPress={() => onOpenProfile(Number(person.id))} style={({ pressed }) => [styles.publicSocialPerson, { borderColor: `${tone.accent}33`, backgroundColor: `${tone.accent}08` }, pressed && styles.pressed]}>{person.avatarUrl ? <Image source={{ uri: person.avatarUrl }} style={styles.publicSocialAvatar} /> : <View style={[styles.publicSocialAvatar, { borderColor: `${tone.accent}44`, backgroundColor: `${tone.accent}12` }]}><Ionicons name="person-outline" size={16} color={tone.accent} /></View>}<View style={styles.flex}><Text style={styles.cardTitle} numberOfLines={1}>{person.name ?? person.username ?? "BlackWaterLeaf-Nutzer"}</Text><Text style={styles.miniCopy} numberOfLines={1}>{person.username ? `@${person.username}` : "Öffentliches Profil"}</Text></View><Ionicons name="chevron-forward" size={16} color={tone.accent} /></Pressable>)}</View> : <Text style={styles.miniCopy}>NOCH KEINE ÖFFENTLICHEN KONTEN IN DIESER LISTE.</Text>}</View><SectionLabel tone={tone} overline="FREIGEGEBEN" title="ÖFFENTLICHE BEITRÄGE" />{posts.length ? <View style={styles.stack}>{posts.map(post => <View key={post.id} style={[styles.publicPostCard, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>{post.realm ?? "COMMUNITY"}</Text><Text style={styles.copy}>{post.content}</Text><Text style={styles.miniCopy}>{new Date(post.createdAt).toLocaleDateString("de-DE")}</Text></View>)}</View> : <StatusPanel tone={tone} icon="chatbubble-ellipses-outline" code="POSTS / LEER" title="NOCH KEINE FREIGEGEBENEN BEITRÄGE" text="Dieser Nutzer hat noch keinen öffentlichen Beitrag veröffentlicht." />}<StatusPanel tone={tone} icon="shield-checkmark-outline" code="PRIVATSPHÄRE" title="ÖFFENTLICH, ABER KONTROLLIERT" text="Private Anlagen, Care-Daten und unveröffentlichte Beiträge bleiben geschützt." /></>}</Page>;
}

function TaxonMediaAttribution({ taxon, tone }: { taxon: PublicPlantTaxon | PublicAquariumTaxon | PublicTerrariumTaxon; tone: Tone }) {
  if (!taxon.imageSourceUrl) return <Text style={styles.miniCopy}>BILDNACHWEIS OFFEN · Für dieses Taxon ist noch kein verifiziertes Katalogbild hinterlegt.</Text>;
  return <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={() => void Linking.openURL(taxon.imageSourceUrl!)}><Text style={[styles.chip, { color: tone.accent }]}>BILDQUELLE · {taxon.imageLicense ?? "LIZENZANGABE"}</Text><Text style={styles.miniCopy}>{taxon.imageAttribution ?? "Attribution hinterlegt"}</Text></Pressable>;
}

function NativeTaxonFactSheet({ tone, realm, profile }: { tone: Tone; realm: "botany" | "aquarium" | "terrarium"; profile: Record<string, unknown> | null }) {
  const labels: Record<string, string> = { careLevel: "PFLEGEAUFWAND", light: "LICHT", water: "WASSER", temperature: "TEMPERATUR", humidity: "LUFTFEUCHTE", substrate: "SUBSTRAT", size: "GRÖSSE", feeding: "ERNÄHRUNG", behavior: "VERHALTEN", habitat: "LEBENSRAUM", nativeHabitat: "NATÜRLICHES HABITAT", nativeRange: "NATÜRLICHE VERBREITUNG", origin: "HERKUNFT", distribution: "VERBREITUNG" };
  const entries = Object.entries(profile ?? {}).filter(([key, value]) => Boolean(labels[key]) && ((typeof value === "string" && value.trim()) || typeof value === "number"));
  const title = realm === "botany" ? "BOTANIK" : realm === "aquarium" ? "AQUARISTIK" : "TERRARISTIK";
  return <View style={[styles.nativeTaxonFacts, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><View style={styles.careSectionHeader}><View><Text style={[styles.eyebrow, { color: tone.accent }]}>{title} · DATENBLATT</Text><Text style={styles.sectionTitle}>STECKBRIEF</Text></View><Ionicons name="leaf-outline" size={20} color={tone.accent} /></View>{entries.length ? <View style={styles.nativeTaxonFactsGrid}>{entries.map(([key, value]) => <View key={key} style={[styles.nativeTaxonFact, { borderColor: `${tone.accent}33` }]}><Ionicons name={key === "water" ? "water-outline" : key === "temperature" ? "thermometer-outline" : key === "light" ? "sunny-outline" : key === "humidity" ? "cloud-outline" : "leaf-outline"} size={16} color={tone.accent} /><View style={styles.flex}><Text style={[styles.chip, { color: tone.accent }]}>{labels[key]}</Text><Text style={styles.copy}>{String(value)}</Text></View></View>)}</View> : <Text style={styles.copy}>Für diesen Datensatz sind noch keine geprüften Pflege- und Haltungsfelder veröffentlicht.</Text>}<Text style={styles.miniCopy}>Quellengebundener Katalogauszug. Pflege, Haltung und Tierwohl bitte mit den vollständigen Fachquellen abgleichen.</Text></View>;
}

function TaxonImageDetail({ taxon, tone, category }: { taxon: PublicPlantTaxon | PublicAquariumTaxon | PublicTerrariumTaxon; tone: Tone; category: "PFLANZE" | "FISCH" | "TERRARIUM" }) {
  const [open, setOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  if (!taxon.imageUrl) return null;
  const close = () => { setOpen(false); setImageLoaded(false); setImageFailed(false); };
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Detailansicht des Bildes von ${taxon.scientificName} öffnen`} onPress={() => { setImageFailed(false); setImageLoaded(false); setOpen(true); }} style={({ pressed }) => [styles.taxonImageButton, { borderColor: `${tone.accent}88` }, pressed && styles.pressed]}>
      <Image source={{ uri: taxon.imageUrl }} style={styles.taxonImage} onError={() => setImageFailed(true)} />
      <View pointerEvents="none" style={styles.taxonImageDetailLabel}><Ionicons name="expand-outline" size={14} color="#effff0" /><Text style={styles.taxonImageDetailText}>DETAILANSICHT</Text></View>
    </Pressable>
    <Modal visible={open} animationType="fade" transparent statusBarTranslucent onRequestClose={close}>
      <View style={styles.taxonImageModalScreen}>
        <Pressable accessibilityRole="button" accessibilityLabel="Bilddetailansicht schließen" style={StyleSheet.absoluteFill} onPress={close} />
        <View style={[styles.taxonImageModalCard, { borderColor: `${tone.accent}88`, backgroundColor: tone.panel }]} accessibilityViewIsModal>
          <View style={styles.taxonImageModalHeader}><View style={styles.flex}><Text style={[styles.chip, { color: tone.accent }]}>{category} · HOCHAUFLÖSENDES KATALOGBILD</Text><Text style={styles.taxonImageModalTitle}>{taxon.scientificName}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Bilddetailansicht schließen" onPress={close} style={[styles.taxonImageModalClose, { borderColor: `${tone.accent}66` }]}><Ionicons name="close-outline" size={23} color={tone.accent} /></Pressable></View>
          <View style={styles.taxonImageModalStage}>
            {!imageLoaded && !imageFailed ? <View style={styles.taxonImageModalLoading}><ActivityIndicator size="small" color={tone.accent} /><Text style={[styles.miniCopy, { color: tone.accent }]}>HOCHAUFLÖSENDES BILD WIRD GELADEN …</Text></View> : null}
            {imageFailed ? <View style={styles.taxonImageModalLoading}><Ionicons name="image-outline" size={34} color={tone.accent} /><Text style={styles.cardTitle}>BILD NICHT VERFÜGBAR</Text><Text style={styles.miniCopy}>Der Bildnachweis bleibt erhalten.</Text></View> : <Image source={{ uri: taxon.imageUrl }} style={[styles.taxonImageModalImage, !imageLoaded && { opacity: 0 }]} onLoad={() => setImageLoaded(true)} onError={() => { setImageFailed(true); setImageLoaded(false); }} resizeMode="contain" accessibilityLabel={`${taxon.scientificName} – verifiziertes Katalogbild in voller Ansicht`} />}
          </View>
          <View style={[styles.taxonImageModalEvidence, { borderColor: `${tone.accent}33` }]}><Text style={[styles.chip, { color: tone.accent }]}>BILDNACHWEIS</Text><Text style={styles.miniCopy}>{taxon.imageAttribution ?? "Attribution hinterlegt"}</Text>{taxon.imageSourceUrl ? <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(taxon.imageSourceUrl!)}><Text style={[styles.taxonImageSourceLink, { color: tone.accent }]}>QUELLBEOBACHTUNG ÖFFNEN · {taxon.imageLicense ?? "LIZENZANGABE"}</Text></Pressable> : null}</View>
          <Text style={styles.taxonImageModalHint}>Originalbild lokal gespeichert · Zum Schließen außerhalb antippen oder X wählen.</Text>
        </View>
      </View>
    </Modal>
  </>;
}

function TaxonScreen({ tone, token, taxonId, onBack, onOpenCollection }: { tone: Tone; token: string | null; taxonId: number; onBack: () => void; onOpenCollection: (realm: Realm, name: string, scientificName?: string) => void }) {
  const [taxon, setTaxon] = useState<PublicPlantTaxon | null>(null);
  const [saved, setSaved] = useState(false);
  const [state, setState] = useState<State>("loading");
  useEffect(() => { let active = true; void publicPlantTaxon(taxonId).then(next => { if (active) { setTaxon(next); setState(next ? "ready" : "error"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [taxonId]);
  useEffect(() => { if (!token) return; void savedItems(token).then(rows => setSaved(rows.some(item => item.targetType === "plant_taxon" && item.targetId === taxonId))).catch(() => undefined); }, [token, taxonId]);
  const toggleSave = async () => { if (!token || !taxon) return; try { if (saved) await unsaveItem(token, { targetType: "plant_taxon", targetId: taxonId }); else await saveItem(token, { targetType: "plant_taxon", targetId: taxonId }); setSaved(current => !current); } catch (cause) { Alert.alert("Speichern nicht möglich", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } };
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{state === "loading" ? <Loading tone={tone} /> : state === "error" || !taxon ? <StatusPanel tone={tone} icon="leaf-outline" code="TAXON / NICHT VERÖFFENTLICHT" title="PFLANZE NICHT GEFUNDEN" text="Dieser Datensatz ist nicht veröffentlicht oder nicht vorhanden." /> : <><View style={[styles.taxonCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>{taxon.imageUrl ? <TaxonImageDetail taxon={taxon} tone={tone} category="PFLANZE" /> : <View style={[styles.taxonImage, { backgroundColor: `${tone.accent}18`, alignItems: "center", justifyContent: "center" }]}><Ionicons name="leaf-outline" size={35} color={tone.accent} /></View>}<Text style={[styles.chip, { color: tone.accent }]}>VALIDIERTER PFLANZENKATALOG</Text><Text style={styles.observatoryContextTitle}>{taxon.scientificName}</Text><Text style={styles.copy}>{taxon.acceptedScientificName && taxon.acceptedScientificName !== taxon.scientificName ? `Akzeptierter Name: ${taxon.acceptedScientificName}` : taxon.family ?? "Taxon-Datensatz"}</Text><Text style={styles.miniCopy}>{taxon.evidenceState} · {taxon.rank ?? "ohne Rang"}</Text><TaxonMediaAttribution taxon={taxon} tone={tone} /><SecondaryButton tone={tone} label="IN ANLAGE ÜBERNEHMEN" icon="add-outline" onPress={() => token ? onOpenCollection("botany", taxon.scientificName, taxon.scientificName) : Alert.alert("Sichere Anmeldung erforderlich", "Melde dich an, um eine private Anlage zu übernehmen.")} />{token ? <SecondaryButton tone={tone} label={saved ? "GESPEICHERT" : "SPEICHERN"} icon="bookmark-outline" onPress={() => void toggleSave()} /> : null}</View><NativeTaxonFactSheet tone={tone} realm="botany" profile={taxon.careProfile && typeof taxon.careProfile === "object" ? taxon.careProfile : null} /><View style={[styles.profilePostsPanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.sectionTitle, { color: tone.accent }]}>KURZPROFIL</Text><Text style={styles.copy}>{taxon.summary ?? "Für diesen validierten Datensatz liegt noch keine Kurzbeschreibung vor."}</Text>{taxon.commonNames.length ? <Text style={styles.miniCopy}>GEBRÄUCHLICH: {taxon.commonNames.join(" · ")}</Text> : null}</View></>}</Page>;
}

function AquariumTaxonScreen({ tone, token, taxonId, onBack, onOpenCollection }: { tone: Tone; token: string | null; taxonId: number; onBack: () => void; onOpenCollection: (realm: Realm, name: string, scientificName?: string) => void }) {
  const [taxon, setTaxon] = useState<PublicAquariumTaxon | null>(null);
  const [saved, setSaved] = useState(false);
  const [state, setState] = useState<State>("loading");
  useEffect(() => { let active = true; void publicAquariumTaxon(taxonId).then(next => { if (active) { setTaxon(next); setState(next ? "ready" : "error"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [taxonId]);
  useEffect(() => { if (!token) return; void savedItems(token).then(rows => setSaved(rows.some(item => item.targetType === "aquarium_taxon" && item.targetId === taxonId))).catch(() => undefined); }, [token, taxonId]);
  const toggleSave = async () => { if (!token || !taxon) return; try { if (saved) await unsaveItem(token, { targetType: "aquarium_taxon", targetId: taxonId }); else await saveItem(token, { targetType: "aquarium_taxon", targetId: taxonId }); setSaved(current => !current); } catch (cause) { Alert.alert("Speichern nicht möglich", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } };
  const profile = taxon?.careProfile && typeof taxon.careProfile === "object" ? taxon.careProfile : {};
  const careLevel = typeof profile.careLevel === "string" ? profile.careLevel : null;
  const water = typeof profile.water === "string" ? profile.water : null;
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{state === "loading" ? <Loading tone={tone} /> : state === "error" || !taxon ? <StatusPanel tone={tone} icon="fish-outline" code="AQUARIUM / NICHT VERÖFFENTLICHT" title="FISCH NICHT GEFUNDEN" text="Dieser Datensatz ist nicht veröffentlicht oder nicht vorhanden." /> : <><View style={[styles.taxonCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>{taxon.imageUrl ? <TaxonImageDetail taxon={taxon} tone={tone} category="FISCH" /> : <View style={[styles.taxonImage, { backgroundColor: `${tone.accent}18`, alignItems: "center", justifyContent: "center" }]}><Ionicons name="fish-outline" size={35} color={tone.accent} /></View>}<Text style={[styles.chip, { color: tone.accent }]}>VALIDIERTER AQUARISTIK-KATALOG · CHANNA</Text><Text style={styles.observatoryContextTitle}>{taxon.scientificName}</Text><Text style={styles.copy}>{taxon.acceptedScientificName && taxon.acceptedScientificName !== taxon.scientificName ? `Akzeptierter Name: ${taxon.acceptedScientificName}` : taxon.family ?? "Aquaristik-Datensatz"}</Text><Text style={styles.miniCopy}>{taxon.evidenceState} · {taxon.rank ?? "ohne Rang"}</Text><TaxonMediaAttribution taxon={taxon} tone={tone} /><SecondaryButton tone={tone} label="IN ANLAGE ÜBERNEHMEN" icon="add-outline" onPress={() => token ? onOpenCollection("aquarium", taxon.scientificName, taxon.scientificName) : Alert.alert("Sichere Anmeldung erforderlich", "Melde dich an, um eine private Anlage zu übernehmen.")} />{token ? <SecondaryButton tone={tone} label={saved ? "GESPEICHERT" : "SPEICHERN"} icon="bookmark-outline" onPress={() => void toggleSave()} /> : null}</View><NativeTaxonFactSheet tone={tone} realm="aquarium" profile={profile} /><View style={[styles.profilePostsPanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.sectionTitle, { color: tone.accent }]}>KURZPROFIL</Text><Text style={styles.copy}>{taxon.summary ?? "Für diesen validierten Datensatz liegt noch keine Kurzbeschreibung vor."}</Text>{taxon.commonNames.length ? <Text style={styles.miniCopy}>GEBRÄUCHLICH: {taxon.commonNames.join(" · ")}</Text> : null}</View>{careLevel || water ? <View style={[styles.profilePostsPanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.sectionTitle, { color: tone.accent }]}>HALTUNGSHINWEISE</Text>{careLevel ? <Text style={styles.copy}>ANSPRUCH · {careLevel}</Text> : null}{water ? <Text style={styles.copy}>WASSER · {water}</Text> : null}<Text style={styles.miniCopy}>Katalogauszug – Haltung bitte individuell anhand von Größe, Herkunft und Verhalten prüfen.</Text></View> : null}</>}</Page>;
}

function TerrariumTaxonScreen({ tone, token, taxonId, onBack, onOpenCollection }: { tone: Tone; token: string | null; taxonId: number; onBack: () => void; onOpenCollection: (realm: Realm, name: string, scientificName?: string) => void }) {
  const [taxon, setTaxon] = useState<PublicTerrariumTaxon | null>(null);
  const [state, setState] = useState<State>("loading");
  useEffect(() => { let active = true; void publicTerrariumTaxon(taxonId).then(next => { if (active) { setTaxon(next); setState(next ? "ready" : "error"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [taxonId]);
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{state === "loading" ? <Loading tone={tone} /> : state === "error" || !taxon ? <StatusPanel tone={tone} icon="bug-outline" code="TERRARISTIK / NICHT VERÖFFENTLICHT" title="ART NICHT GEFUNDEN" text="Dieser Terrarium-Datensatz ist nicht veröffentlicht oder nicht vorhanden." /> : <><View style={[styles.taxonCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>{taxon.imageUrl ? <TaxonImageDetail taxon={taxon} tone={tone} category="TERRARIUM" /> : <View style={[styles.taxonImage, { backgroundColor: `${tone.accent}18`, alignItems: "center", justifyContent: "center" }]}><Ionicons name="bug-outline" size={35} color={tone.accent} /></View>}<Text style={[styles.chip, { color: tone.accent }]}>VALIDIERTER TERRARISTIK-KATALOG</Text><Text style={styles.observatoryContextTitle}>{taxon.scientificName}</Text><Text style={styles.copy}>{taxon.acceptedScientificName && taxon.acceptedScientificName !== taxon.scientificName ? `Akzeptierter Name: ${taxon.acceptedScientificName}` : taxon.family ?? "Terraristik-Datensatz"}</Text><Text style={styles.miniCopy}>{taxon.evidenceState} · {taxon.rank ?? "ohne Rang"}</Text><TaxonMediaAttribution taxon={taxon} tone={tone} /><SecondaryButton tone={tone} label="IN ANLAGE ÜBERNEHMEN" icon="add-outline" onPress={() => token ? onOpenCollection("terrarium", taxon.scientificName, taxon.scientificName) : Alert.alert("Sichere Anmeldung erforderlich", "Melde dich an, um eine private Anlage zu übernehmen.")} /></View><NativeTaxonFactSheet tone={tone} realm="terrarium" profile={taxon.careProfile && typeof taxon.careProfile === "object" ? taxon.careProfile : null} /><View style={[styles.profilePostsPanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.sectionTitle, { color: tone.accent }]}>KURZPROFIL</Text><Text style={styles.copy}>{taxon.summary ?? "Für diesen validierten Datensatz liegt noch keine Kurzbeschreibung vor."}</Text>{taxon.commonNames.length ? <Text style={styles.miniCopy}>GEBRÄUCHLICH: {taxon.commonNames.join(" · ")}</Text> : null}<Text style={styles.miniCopy}>HERKUNFT · Quellengebundene Verbreitungsangabe in der Fachquelle</Text></View></>}</Page>;
}

function SavedScreen({ tone, token, onBack, onSignIn, navigate, onOpenProfile, onOpenTaxon, onOpenAquariumTaxon }: { tone: Tone; token: string | null; onBack: () => void; onSignIn: () => Promise<void>; navigate: (screen: Screen) => void; onOpenProfile: (id: number) => void; onOpenTaxon: (id: number) => void; onOpenAquariumTaxon: (id: number) => void }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [state, setState] = useState<State>(token ? "loading" : "ready");
  useEffect(() => { if (!token) return; setState("loading"); void savedItems(token).then(next => { setItems(next); setState("ready"); }).catch(() => setState("error")); }, [token]);
  const open = (item: SavedItem) => { if (item.targetType === "profile") onOpenProfile(item.targetId); else if (item.targetType === "plant_taxon") onOpenTaxon(item.targetId); else if (item.targetType === "aquarium_taxon") onOpenAquariumTaxon(item.targetId); else if (item.targetType === "knowledge") navigate("knowledge"); else if (item.targetType === "post") navigate("community"); else navigate("marketplace"); };
  const label: Record<SavedItem["targetType"], string> = { post: "COMMUNITY-BEITRAG", knowledge: "WISSENSARTIKEL", plant_taxon: "PFLANZENTAXON", aquarium_taxon: "AQUARISTIK-TAXON", product: "MARKTPLATZ-PRODUKT", profile: "PROFIL" };
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{!token ? <PrivateFeature tone={tone} title="DEIN MERKRAUM BLEIBT PRIVAT." text="Melde dich an, um gespeicherte öffentliche Inhalte geräteübergreifend wiederzufinden." onSignIn={onSignIn} /> : state === "loading" ? <Loading tone={tone} /> : state === "error" ? <ErrorNotice text="Gespeicherte Inhalte konnten nicht geladen werden." /> : !items.length ? <StatusPanel tone={tone} icon="bookmark-outline" code="MERKLISTE / LEER" title="NOCH NICHTS GESPEICHERT" text="Markiere Pflanzen, Profile, Beiträge oder Wissen, um sie hier wiederzufinden." /> : <View style={styles.stack}>{items.map(item => <Pressable key={item.id} onPress={() => open(item)} style={({ pressed }) => [styles.searchResultCard, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }, pressed && styles.pressed]}><View style={[styles.searchResultIcon, { backgroundColor: `${tone.accent}18`, borderColor: `${tone.accent}44` }]}><Ionicons name="bookmark-outline" size={19} color={tone.accent} /></View><View style={styles.searchResultCopy}><Text style={styles.cardTitle}>{label[item.targetType]}</Text><Text style={styles.miniCopy}>Öffentlicher Datensatz · #{item.targetId}</Text><Text style={[styles.chip, { color: tone.accent }]}>{new Date(item.createdAt).toLocaleDateString("de-DE")}</Text></View><Ionicons name="chevron-forward" size={17} color={tone.accent} /></Pressable>)}</View>}</Page>;
}

function RankingScreen({ tone, token, onBack, onSignIn }: { tone: Tone; token: string | null; onBack: () => void; onSignIn: () => Promise<void> }) {
  const [summary, setSummary] = useState<ExperienceSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<ChallengeProgress[]>([]);
  const [state, setState] = useState<State>(token ? "loading" : "ready");
  useEffect(() => { let active = true; if (!token) return; void Promise.all([gamificationSummary(token), gamificationLeaderboard(token), publishedChallenges(), myChallenges(token)]).then(([nextSummary, nextLeaderboard, nextChallenges, nextProgress]) => { if (active) { setSummary(nextSummary); setLeaderboard(nextLeaderboard); setChallenges(nextChallenges); setProgress(nextProgress); setState("ready"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [token]);
  const join = async (id: number) => { if (!token) return; try { await joinChallenge(token, id); setProgress(await myChallenges(token)); } catch (cause) { Alert.alert("Challenge nicht verfügbar", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } };
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{!token ? <PrivateFeature tone={tone} title="RANKING BLEIBT PRIVAT." text="Melde dich an, um deinen serverseitig berechneten Score und freigegebene Challenges zu sehen." onSignIn={onSignIn} /> : state === "loading" ? <Loading tone={tone} /> : state === "error" ? <ErrorNotice text="Rankingdaten konnten nicht geladen werden." /> : <><View style={[styles.rankingScoreCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>COMMUNITY · XP · FORTSCHRITT</Text><Text style={styles.observatoryContextTitle}>LEVEL {summary?.level ?? "—"}</Text><Text style={styles.copy}>{summary?.totalXp ?? "—"} XP GESAMT · SERVER-VERIFIZIERT</Text></View><SectionLabel tone={tone} overline="QUALITÄTSGEPRÜFTE EVENTS" title="CHALLENGES" />{!challenges.length ? <StatusPanel tone={tone} icon="trophy-outline" code="CHALLENGES / LEER" title="AKTUELL KEINE VERÖFFENTLICHT" text="Neue Challenges erscheinen erst nach Admin-Freigabe." /> : <View style={styles.stack}>{challenges.map(challenge => { const joined = progress.find(item => item.challengeId === challenge.id); return <View key={challenge.id} style={[styles.challengeCard, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>{challenge.realm ?? "ALLE BEREICHE"}</Text><Text style={styles.cardTitle}>{challenge.title}</Text><Text style={styles.miniCopy}>{challenge.description}</Text>{joined ? <Text style={[styles.chip, { color: tone.accent }]}>{joined.progress}% · {joined.status === "completed" ? "ABGESCHLOSSEN" : "TEILGENOMMEN"}</Text> : <SecondaryButton tone={tone} label="TEILNEHMEN" icon="add-circle-outline" onPress={() => void join(challenge.id)} />}</View>; })}</View>}<SectionLabel tone={tone} overline="ÖFFENTLICH · XP" title="BESTENLISTE" />{leaderboard.length ? <View style={styles.stack}>{leaderboard.slice(0, 10).map(row => <View key={row.userId} style={[styles.leaderboardRow, { borderColor: `${tone.accent}33`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>#{row.rank}</Text><Text style={styles.cardTitle}>{row.name}</Text><Text style={styles.miniCopy}>{row.totalXp} XP</Text></View>)}</View> : <Text style={styles.miniCopy}>Noch keine öffentliche XP-Bestenliste vorhanden.</Text>}</>}</Page>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return <View style={styles.stat}><Text style={[styles.statValue, { color: tone.accent }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function ObservatoryContextHeader({
  tone,
  eyebrow,
  title,
  subtitle,
  icon,
}: {
  tone: Tone;
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: IconName;
}) {
  return (
    <ImageBackground
      source={tone.image}
      style={[styles.observatoryContextHeader, { borderColor: `${tone.accent}99`, shadowColor: tone.accent, ...NATIVE_GLOW }]}
      imageStyle={styles.observatoryContextImage}
    >
      <View style={styles.observatoryContextShade} />
      <View style={styles.observatoryContextCopy}>
        <View
          style={[
            styles.observatoryContextIcon,
            {
              borderColor: `${tone.accent}99`,
              backgroundColor: `${tone.accent}18`,
            },
          ]}
        >
          <Ionicons name={icon} size={24} color={tone.accent} />
        </View>
        <Text style={[styles.eyebrow, { color: tone.accent }]}>{eyebrow}</Text>
        <Text style={styles.observatoryContextTitle}>{title}</Text>
        <Text style={styles.observatoryContextText}>{subtitle}</Text>
      </View>
    </ImageBackground>
  );
}

function SectionLabel({
  tone,
  overline,
  title,
  compact = false,
}: {
  tone: Tone;
  overline: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.sectionLabel, compact && styles.sectionLabelCompact]}>
      <Text style={[styles.eyebrow, { color: tone.accent }]}>{overline}</Text>
      <Text style={styles.headingTitle}>{title}</Text>
    </View>
  );
}

function ObservatoryActionCluster({
  tone,
  actions,
  compact = false,
  activeTitle,
  visual = false,
}: {
  tone: Tone;
  actions: Action[];
  compact?: boolean;
  activeTitle?: string;
  visual?: boolean;
}) {
  return (
    <View style={[styles.grid, compact && styles.gridCompact]}>
      {actions.map(action => (
        <ObservatoryActionRow
          key={action.title}
          tone={tone}
          action={action}
          compact={compact}
          visual={visual}
          active={activeTitle === action.title.toUpperCase()}
        />
      ))}
    </View>
  );
}

function ObservatoryActionRow({
  tone,
  action,
  compact = false,
  active = false,
  imageMode = false,
  visual = false,
}: {
  tone: Tone;
  action: Action;
  compact?: boolean;
  active?: boolean;
  imageMode?: boolean;
  visual?: boolean;
}) {
  const cardTone = action.area ? TONES[action.area] : tone;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${action.title}: ${action.note}`}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.observatoryActionRow,
        compact && styles.observatoryActionRowCompact,
        visual && styles.observatoryActionRowVisual,
        { borderColor: `${cardTone.accent}77`, backgroundColor: `${cardTone.panel}D9`, shadowColor: cardTone.accent, ...NATIVE_GLOW },
        active && { borderColor: cardTone.accent },
        pressed && styles.pressed,
      ]}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        action.onPress();
      }}
    >
      <View style={[styles.observatoryActionContent, compact && styles.observatoryActionContentCompact, visual && styles.observatoryActionContentVisual]}>
          {imageMode || visual ? <Image source={action.image} style={[styles.observatoryActionMedia, compact && styles.observatoryActionMediaCompact, visual && styles.observatoryActionMediaVisual]} /> : null}
          {visual ? <View pointerEvents="none" style={styles.observatoryActionMediaShade} /> : null}
          <View
            style={[
              styles.observatoryActionIcon,
              compact && styles.observatoryActionIconCompact,
              {
                borderColor: `${cardTone.accent}99`,
                backgroundColor: `${cardTone.accent}16`,
              },
            ]}
          >
            <Ionicons name={action.icon} size={20} color={cardTone.accent} />
          </View>
          <View style={[styles.flex, visual && styles.observatoryActionCopyVisual]}>
            <Text
              style={[
                styles.observatoryActionTitle,
                compact && styles.observatoryActionTitleCompact,
                visual && styles.observatoryActionTitleVisual,
              ]}
              numberOfLines={2}
            >
              {action.title}
            </Text>
            <Text
              style={[
                styles.observatoryActionNote,
                compact && styles.observatoryActionNoteCompact,
                visual && styles.observatoryActionNoteVisual,
              ]}
              numberOfLines={2}
            >
              {action.note}
            </Text>
            {action.unavailable ? (
              <Text style={[styles.observatoryUnavailableLabel, { color: cardTone.accent }]}>
                NOCH NICHT VERFÜGBAR
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={21} color={cardTone.accent} style={visual ? styles.observatoryActionChevronVisual : undefined} />
      </View>
    </Pressable>
  );
}

function KnowledgeCard({
  tone,
  article,
}: {
  tone: Tone;
  article: KnowledgeArticle;
}) {
  return (
    <View
      style={[
        styles.infoCard,
        { borderColor: `${tone.accent}55`, backgroundColor: tone.panel },
      ]}
    >
      <Text style={[styles.chip, { color: tone.accent }]}>
        {article.evidenceState}
      </Text>
      <Text style={styles.cardTitle}>{article.title}</Text>
      <Text style={styles.copy}>{article.excerpt}</Text>
      {article.sources.map(source => (
        <Pressable
          key={source.url}
          style={styles.source}
          onPress={() => void Linking.openURL(source.url)}
        >
          <Text style={[styles.sourceText, { color: tone.accent }]}>
            {source.label}
          </Text>
          <Ionicons name="open-outline" size={15} color={tone.accent} />
        </Pressable>
      ))}
    </View>
  );
}

function ProductCard({
  tone,
  product,
  onInterest,
}: {
  tone: Tone;
  product: MarketplaceProduct;
  onInterest?: (product: MarketplaceProduct) => void;
}) {
  return (
    <View style={[styles.productCard, { borderColor: `${tone.accent}77`, backgroundColor: tone.panel }]}>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={() => void Linking.openURL(product.destinationUrl)}>
        <View style={styles.productImageFrame}>
          {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.productImage} /> : <Ionicons name="cube-outline" color={tone.accent} size={26} />}
        </View>
        <View style={styles.productBody}>
          <Text style={[styles.chip, { color: tone.accent }]}>{product.disclosureLabel} · {product.partnerName}</Text>
          <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
          <View style={styles.productBottom}><Text style={[styles.price, { color: c.champagne }]}>{product.priceLabel ?? "Preis beim Partner"}</Text><Ionicons name="open-outline" color={tone.accent} size={18} /></View>
        </View>
      </Pressable>
      {onInterest ? <Pressable style={[styles.secondaryButton, { borderColor: `${tone.accent}66`, marginTop: 8 }]} onPress={() => onInterest(product)}><Text style={[styles.secondaryButtonText, { color: tone.accent }]}>KAUFINTERESSE MERKEN</Text><Ionicons name="locate-outline" size={15} color={tone.accent} /></Pressable> : null}
    </View>
  );
}

function PostCard({ tone, post, isOwner, accountId, onEdit, onDelete, onLike, onReport, onBlock, onOpenDetail, onOpenProfile, token }: { tone: Tone; post: CommunityPost; isOwner: boolean; accountId: number | null; onEdit: () => void; onDelete: () => Promise<void>; onLike: () => Promise<void>; onReport: () => Promise<void>; onBlock: () => Promise<void>; onOpenDetail: () => void; onOpenProfile: () => void; token: string | null }) {
  const [actionPending, setActionPending] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [commentPending, setCommentPending] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [postMediaRatio, setPostMediaRatio] = useState<number | null>(null);
  const loadComments = async () => { if (token) setComments(await communityComments(token, Number(post.id))); };
  useEffect(() => {
    const media = post.media[0];
    if (!media || media.mimeType.startsWith("video/")) { setPostMediaRatio(null); return; }
    Image.getSize(media.accessUrl, (width, height) => setPostMediaRatio(width && height ? width / height : null), () => setPostMediaRatio(null));
  }, [post.media]);
  const submitComment = async () => {
    if (!token || !commentText.trim()) return;
    setCommentPending(true);
    try {
      await addCommunityComment(token, { postId: Number(post.id), parentId: replyTo, content: commentText.trim() });
      setCommentText("");
      setReplyTo(null);
      await loadComments();
    } finally { setCommentPending(false); }
  };
  const saveComment = async () => {
    if (!token || !editingCommentId || !editingCommentText.trim()) return;
    setCommentPending(true);
    try { await updateCommunityComment(token, { commentId: editingCommentId, content: editingCommentText.trim() }); setEditingCommentId(null); setEditingCommentText(""); await loadComments(); }
    catch (cause) { Alert.alert("Kommentar konnte nicht gespeichert werden", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); }
    finally { setCommentPending(false); }
  };
  const removeComment = async (commentId: number) => {
    if (!token) return;
    setCommentPending(true);
    try { await deleteCommunityComment(token, commentId); await loadComments(); }
    catch (cause) { Alert.alert("Kommentar konnte nicht gelöscht werden", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); }
    finally { setCommentPending(false); }
  };
  return (
    <View
      style={[
        styles.infoCard,
        { borderColor: `${tone.accent}55`, backgroundColor: tone.panel },
      ]}
    >
      <View style={styles.postHead}>
        <View style={styles.postHeadCopy}>
          <Pressable onPress={onOpenProfile} accessibilityRole="link"><Text style={styles.cardTitle}>
            {post.author.name ?? post.author.username ?? "Verifiziertes Konto"}
          </Text></Pressable>
          <Text style={styles.date}>
            {new Date(post.createdAt).toLocaleDateString("de-DE")}
          </Text>
        </View>
        {isOwner ? <View style={styles.postOwnerActions}>
          <Pressable accessibilityLabel="Beitrag bearbeiten" style={styles.postOwnerButton} onPress={onEdit}><Ionicons name="pencil-outline" size={18} color={c.botany} /></Pressable>
          <Pressable accessibilityLabel="Beitrag löschen" style={[styles.postOwnerButton, styles.postOwnerDelete]} disabled={actionPending} onPress={() => { Alert.alert("Beitrag löschen", "Diesen eigenen Beitrag wirklich löschen?", [{ text: "Abbrechen", style: "cancel" }, { text: "Löschen", style: "destructive", onPress: () => { setActionPending(true); void onDelete().finally(() => setActionPending(false)); } }]); }}><Ionicons name="trash-outline" size={18} color="#ffabb0" /></Pressable>
        </View> : null}
      </View>
      <Text style={styles.copy}>{post.content}</Text>
      {post.media[0] ? post.media[0].mimeType.startsWith("video/") ? <NativeCommunityVideo uri={post.media[0].accessUrl} title="Community-Video" /> : <Pressable accessibilityRole="button" accessibilityLabel="Bild vergrößern" onPress={() => setZoomedImage(post.media[0].accessUrl)}><Image source={{ uri: post.media[0].accessUrl }} style={[styles.postImage, postMediaRatio ? { aspectRatio: postMediaRatio, height: undefined } : null]} resizeMode="contain" /></Pressable> : null}
      {post.media.length > 1 ? <View style={styles.mediaScrollHintNative}><View style={styles.mediaScrollLineNative} /><Text style={styles.miniCopy}>WEITERE MEDIEN · WISCHEN / SCROLLEN</Text><View style={styles.mediaScrollLineNative} /></View> : null}
      <Modal visible={Boolean(zoomedImage)} transparent animationType="fade" onRequestClose={() => setZoomedImage(null)}><Pressable style={styles.mediaLightboxNative} onPress={() => setZoomedImage(null)}><Pressable onPress={() => undefined}><Image source={zoomedImage ? { uri: zoomedImage } : undefined} style={styles.mediaLightboxImageNative} resizeMode="contain" /></Pressable><Pressable accessibilityLabel="Zoom schließen" style={styles.mediaLightboxCloseNative} onPress={() => setZoomedImage(null)}><Ionicons name="close" size={20} color={c.text} /></Pressable></Pressable></Modal>
      <View style={styles.postInteractionRow}><Pressable onPress={() => void onLike()} style={styles.commentToggle}><Ionicons name="heart-outline" size={16} color={tone.accent} /><Text style={[styles.miniCopy, { color: tone.accent }]}>GEFÄLLT MIR</Text></Pressable><Pressable onPress={() => Alert.alert("Beitrag melden", "Warum möchtest du diesen Beitrag melden?", [{ text: "Abbrechen", style: "cancel" }, { text: "Melden", onPress: () => void onReport() }])} style={styles.commentToggle}><Ionicons name="flag-outline" size={16} color={c.muted} /><Text style={styles.miniCopy}>MELDEN</Text></Pressable></View>
      <Text style={styles.date}>
        {post.likesCount} Likes · {post.commentsCount} Kommentare
      </Text>
      <View style={styles.commentActionRow}><Pressable style={styles.commentToggle} onPress={onOpenDetail}><Ionicons name="open-outline" size={16} color={tone.accent} /><Text style={[styles.miniCopy, { color: tone.accent }]}>DETAILANSICHT</Text></Pressable><Pressable style={styles.commentToggle} onPress={() => { setCommentsOpen(value => !value); if (!commentsOpen) void loadComments(); }}>
        <Ionicons name="chatbubble-outline" size={16} color={tone.accent} />
        <Text style={[styles.miniCopy, { color: tone.accent }]}>{post.commentsCount} KOMMENTARE</Text>
      </Pressable></View>
      {commentsOpen ? <View style={styles.commentPanel}>
        {comments.map(comment => <View key={comment.id} style={[styles.commentRow, comment.parentId ? styles.commentReplyRow : null]}><Text style={styles.commentAuthor}>{comment.authorName ?? comment.authorUsername ?? "Nutzer"}</Text>{editingCommentId === comment.id ? <><TextInput value={editingCommentText} onChangeText={setEditingCommentText} style={styles.commentInput} multiline maxLength={2000} /><View style={styles.commentActionRow}><Pressable disabled={commentPending || !editingCommentText.trim()} onPress={() => void saveComment()}><Text style={[styles.commentReplyAction, { color: tone.accent }]}>SPEICHERN</Text></Pressable><Pressable onPress={() => { setEditingCommentId(null); setEditingCommentText(""); }}><Text style={styles.commentReplyAction}>ABBRECHEN</Text></Pressable></View></> : <Text style={styles.miniCopy}>{comment.content}</Text>}{comment.authorId === accountId ? <View style={styles.commentActionRow}><Pressable accessibilityRole="button" accessibilityLabel="Kommentar bearbeiten" onPress={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }}><Ionicons name="create-outline" size={18} color={tone.accent} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Kommentar löschen" disabled={commentPending} onPress={() => Alert.alert("Kommentar löschen", "Diesen eigenen Kommentar wirklich löschen?", [{ text: "Abbrechen", style: "cancel" }, { text: "Löschen", style: "destructive", onPress: () => void removeComment(comment.id) }])}><Ionicons name="trash-outline" size={18} color={c.danger} /></Pressable></View> : <Pressable onPress={() => Alert.alert("Kommentar melden", "Warum möchtest du diesen Kommentar melden?", [{ text: "Abbrechen", style: "cancel" }, { text: "Melden", onPress: () => token ? void reportCommunityComment(token, { commentId: comment.id, reason: "other" }).then(() => Alert.alert("Meldung gespeichert", "Der Kommentar wurde zur Prüfung weitergeleitet.")) : undefined }])}><Text style={styles.commentReplyAction}>MELDEN</Text></Pressable>}{!comment.parentId ? <Pressable onPress={() => setReplyTo(comment.id)}><Text style={[styles.commentReplyAction, { color: tone.accent }]}>ANTWORTEN</Text></Pressable> : null}</View>)}
        {replyTo ? <Pressable onPress={() => setReplyTo(null)}><Text style={[styles.commentReplyAction, { color: tone.accent }]}>ANTWORT AUFHEBEN</Text></Pressable> : null}
        {token ? <View style={styles.commentComposer}><TextInput value={commentText} onChangeText={setCommentText} placeholder="Kommentar schreiben…" placeholderTextColor={c.muted} style={styles.commentInput} multiline maxLength={2000} /><Pressable style={[styles.commentSend, commentPending && { opacity: 0.55 }]} disabled={commentPending} onPress={() => void submitComment()}><Ionicons name="send" size={16} color={c.bg} /></Pressable></View> : <Text style={styles.miniCopy}>Zum Kommentieren bitte sicher anmelden.</Text>}
      </View> : null}
    </View>
  );
}

function StatusPanel({
  tone,
  icon,
  code,
  title,
  text,
  actionLabel,
  onAction,
}: {
  tone: Tone;
  icon: IconName;
  code: string;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={[
        styles.statusPanel,
        { borderColor: `${tone.accent}66`, backgroundColor: tone.panel },
      ]}
    >
      <Ionicons name={icon} size={28} color={tone.accent} />
      <Text style={[styles.chip, { color: tone.accent }]}>{code}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton
          tone={tone}
          label={actionLabel}
          icon="arrow-forward"
          onPress={onAction}
        />
      ) : null}
    </View>
  );
}

function PrivateFeature({
  tone,
  title,
  text,
  onSignIn,
}: {
  tone: Tone;
  title: string;
  text: string;
  onSignIn: () => Promise<void>;
}) {
  return (
    <View
      style={[
        styles.privateFeature,
        { borderColor: `${tone.accent}66`, backgroundColor: tone.panel },
      ]}
    >
      <Ionicons name="shield-checkmark-outline" size={32} color={tone.accent} />
      <Text style={styles.headingTitle}>{title}</Text>
      <Text style={styles.copy}>{text}</Text>
      <PrimaryButton
        tone={tone}
        label="SICHER ANMELDEN"
        icon="log-in-outline"
        onPress={() => void onSignIn()}
      />
      <Truth tone={tone} />
    </View>
  );
}

function Truth({ tone }: { tone: Tone }) {
  return (
    <View
      style={[
        styles.truth,
        {
          borderColor: `${tone.accent}66`,
          backgroundColor: `${tone.accent}13`,
        },
      ]}
    >
      <Ionicons name="shield-checkmark-outline" size={21} color={tone.accent} />
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>ECHTE DATEN. KEINE SCHEINSTATUS.</Text>
        <Text style={styles.copy}>
          Private Anlagen, Messwerte und Freigaben werden erst nach
          authentifizierter Serverantwort gezeigt.
        </Text>
      </View>
    </View>
  );
}

function Page({
  children,
  refresh,
  refreshing = false,
}: {
  children: ReactNode;
  refresh?: () => Promise<void>;
  refreshing?: boolean;
}) {
  return (
    <ImageBackground source={ASSETS.home} style={styles.pageBackdrop} imageStyle={[styles.pageBackdropImage, Platform.OS === "android" && styles.pageBackdropImageAndroid]}>
      <View style={[styles.pageBackdropShade, Platform.OS === "android" && styles.pageBackdropShadeAndroid]} />
      {USE_BACKGROUND_BLUR ? <BlurView intensity={16} tint="dark" style={styles.pageBackdropBlur} /> : null}
      <FlatList
        data={["content"]}
        keyExtractor={item => item}
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          refresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={c.botany}
            />
          ) : undefined
        }
        renderItem={() => <View style={styles.stack}>{children}</View>}
      />
    </ImageBackground>
  );
}

function BottomNavigation({
  active,
  inset,
  onSelect,
}: {
  active: BottomTab;
  inset: number;
  onSelect: (screen: Screen) => void;
}) {
  const tabs: Array<{ id: BottomTab; screen: Screen; label: string; icon: IconName; color: string }> = [
    { id: "home", screen: "home", label: "Home", icon: "home-outline", color: c.botany },
    { id: "discover", screen: "explore", label: "Entdecken", icon: "compass-outline", color: c.botany },
    { id: "community", screen: "community", label: "Community", icon: "people-outline", color: c.botany },
    { id: "profile", screen: "profile", label: "Profil", icon: "person-outline", color: c.botany },
  ];
  const activeId: BottomTab = active === "home" ? "home" : active === "community" ? "community" : active === "profile" || active === "marketplace" ? "profile" : "discover";
  return (
    <View style={[styles.tabs, { bottom: Math.max(inset + 10, 16) }]}>
      {tabs.map(tab => (
        <Pressable
          key={tab.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeId === tab.id }}
          style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          onPress={() => onSelect(tab.screen)}
        >
          <Ionicons
            name={tab.icon}
            size={21}
            color={activeId === tab.id ? tab.color : c.muted}
          />
          <Text
            style={[styles.tabText, activeId === tab.id && { color: tab.color }]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Sensor({
  color,
  icon,
  label,
  value,
  note,
}: {
  color: string;
  icon: IconName;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <View style={[styles.sensor, { borderColor: `${color}55` }]}>
      <Ionicons name={icon} size={17} color={color} />
      <Text style={styles.sensorValue}>{value}</Text>
      <Text style={styles.sensorLabel}>{label}</Text>
      <Text style={[styles.sensorNote, { color }]}>{note}</Text>
    </View>
  );
}

function ToolTab({
  active,
  tone,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  tone: Tone;
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolTab,
        {
          borderColor: active ? tone.accent : `${tone.accent}44`,
          backgroundColor: active ? `${tone.accent}25` : "rgba(0,0,0,.16)",
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={16} color={active ? tone.accent : c.muted} />
      <Text style={[styles.toolTabText, active && { color: tone.accent }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function PrimaryButton({
  tone,
  label,
  icon,
  onPress,
  disabled = false,
}: {
  tone: Tone;
  label: string;
  icon: IconName;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: tone.accent },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Ionicons name={icon} size={16} color={c.bg} />
    </Pressable>
  );
}

function SecondaryButton({
  tone,
  label,
  icon,
  onPress,
  disabled = false,
}: {
  tone: Tone;
  label: string;
  icon: IconName;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryButton,
        { borderColor: `${tone.accent}77` },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.secondaryButtonText, { color: tone.accent }]}>
        {label}
      </Text>
      <Ionicons name={icon} size={15} color={tone.accent} />
    </Pressable>
  );
}

function LabeledInput({
  tone,
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  tone: Tone;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: tone.accent }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textarea,
          {
            borderColor: `${tone.accent}66`,
            backgroundColor: "rgba(0,0,0,.22)",
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        multiline={multiline}
        maxLength={multiline ? 1200 : 255}
      />
    </View>
  );
}

function Result({
  tone,
  title,
  answer,
}: {
  tone: Tone;
  title: string;
  answer: string;
}) {
  return (
    <View
      style={[
        styles.result,
        { borderColor: `${tone.accent}66`, backgroundColor: "rgba(0,0,0,.2)" },
      ]}
    >
      <Text style={[styles.chip, { color: tone.accent }]}>KI / VORLÄUFIG</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );
}

function Loading({ tone }: { tone: Tone }) {
  return (
    <View
      style={[
        styles.loading,
        { borderColor: `${tone.accent}55`, backgroundColor: tone.panel },
      ]}
    >
      <Text style={[styles.chip, { color: tone.accent }]}>VERBINDUNG</Text>
      <Text style={styles.copy}>Echte Daten werden geladen …</Text>
    </View>
  );
}

function ErrorNotice({ text }: { text: string }) {
  return (
    <View style={styles.error}>
      <Ionicons name="alert-circle-outline" size={21} color={c.danger} />
      <Text style={styles.copy}>{text}</Text>
    </View>
  );
}

function numberValue(value: unknown, unit: string) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value}${unit ? ` ${unit}` : ""}`
    : "—";
}

function realmAccent(realm: Realm) {
  return realm === "aquarium"
    ? c.aqua
    : realm === "terrarium"
      ? c.gold
      : c.botany;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1, position: "relative" },
  header: {
    minHeight: 70,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    backgroundColor: "#020A05",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1, marginLeft: 2, minWidth: 0 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#050807",
  },
  brandImage: { width: "100%", height: "100%" },
  brand: { color: c.text, fontSize: 12.5, fontWeight: "900", letterSpacing: 1.05, paddingLeft: 1 },
  technical: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.35,
    marginTop: 2,
    paddingLeft: 1,
  },
  headerActions: { flexDirection: "row", gap: 2 },
  nativeProfileMenu: { position: "absolute", top: 58, right: 12, zIndex: 30, width: 260, padding: 10, borderRadius: 14, borderWidth: 1, gap: 6, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  nativeProfileMenuItem: { minHeight: 56, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 11, borderRadius: 11, backgroundColor: "#0d2617", borderWidth: 1, borderColor: "rgba(199,243,91,.16)" },
  nativeProfileMenuText: { color: c.text, fontSize: 14, lineHeight: 18, fontWeight: "800" },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(199,243,91,.25)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,.18)",
  },
  headerActionIconWrap: { position: "relative" },
  headerUnreadBadge: { position: "absolute", top: -8, right: -11, minWidth: 15, height: 15, paddingHorizontal: 3, borderRadius: 8, color: c.bg, fontSize: 8, lineHeight: 15, textAlign: "center", fontWeight: "900" },
  pageBackdrop: { flex: 1, backgroundColor: c.bg },
  pageBackdropImage: { opacity: 0.42 },
  pageBackdropImageAndroid: { opacity: 0.26 },
  pageBackdropShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(1,10,5,.58)" },
  pageBackdropShadeAndroid: { backgroundColor: "rgba(1,10,5,.72)" },
  pageBackdropBlur: { ...StyleSheet.absoluteFill, opacity: 0.5 },
  page: { padding: 16, paddingBottom: 196 },
  stack: { gap: 13 },
  flex: { flex: 1 },
  observatoryContextHeader: {
    minHeight: 148,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    shadowColor: c.botany,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  homeContextHeader: { minHeight: 326 },
  observatoryContextImage: { borderRadius: 15 },
  observatoryContextShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(2, 12, 6, .68)",
  },
  observatoryContextCopy: { padding: 16, gap: 6 },
  observatoryContextIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  eyebrow: { fontSize: 9, letterSpacing: 1.45, fontWeight: "900" },
  observatoryContextTitle: {
    color: c.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.45,
  },
  observatoryContextText: { color: "#C3D5C5", fontSize: 12, lineHeight: 17, maxWidth: 330 },
  sectionLabel: { marginTop: 7, gap: 5 },
  sectionLabelCompact: { marginTop: 0 },
  homeAllAreas: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: -28,
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  homeAllAreasText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  homeContextActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  homeStatusStrip: { minHeight: 72, borderRadius: 16, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 6, flexDirection: "row", justifyContent: "space-around", gap: 2 },
  homeStatusItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2, borderRightWidth: 1, borderRightColor: "rgba(199,243,91,.12)" },
  homeStatusLabel: { fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  homeStatusValue: { color: c.muted, fontSize: 8, fontWeight: "800" },
  liveWorlds: { gap: 10 },
  liveTrackPanel: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 8 },
  liveTrackButtons: { flexDirection: "row", gap: 8, marginTop: 4 },
  liveTrackButton: { flex: 1, minHeight: 42, paddingHorizontal: 8, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  liveGroup: { gap: 8 },
  liveGroupHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  liveSessionCard: { position: "relative", padding: 13, borderRadius: 14, borderWidth: 1, gap: 6, paddingRight: 34 },
  liveSessionBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveSessionArrow: { position: "absolute", top: 15, right: 13 },
  liveEmpty: { minHeight: 54, padding: 13, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", flexDirection: "row", alignItems: "center", gap: 8 },
  liveControlPanel: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 9 },
  liveMetricRow: { flexDirection: "row", gap: 7 },
  liveStage: { padding: 13, borderRadius: 16, borderWidth: 1, gap: 10 },
  liveStageMeta: { gap: 5 },
  nativeLiveVideo: { width: "100%", height: 220, borderRadius: 12, backgroundColor: "#000" },
  liveExternalPlayer: { minHeight: 200, padding: 18, borderRadius: 12, borderWidth: 1, borderColor: "rgba(199,243,91,.24)", backgroundColor: "rgba(0,0,0,.18)", alignItems: "center", justifyContent: "center", gap: 9 },
  livePresenter: { paddingTop: 4, borderTopWidth: 1, borderTopColor: "rgba(199,243,91,.16)", gap: 3 },
  liveChatPanel: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 9 },
  liveChatHeading: { gap: 4 },
  liveMessage: { padding: 10, borderRadius: 10, backgroundColor: "rgba(0,0,0,.16)", gap: 5 },
  liveMessageMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commentActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" },
  inlineChoice: { padding: 11, borderRadius: 16, borderWidth: 1, gap: 9, backgroundColor: "rgba(8,20,14,.78)", shadowColor: c.aqua, shadowOpacity: 0.28, shadowRadius: 18, elevation: 8 },
  inlineChoiceHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  analysisLoading: {
    minHeight: 66,
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "rgba(23,12,42,.72)",
    shadowColor: c.ai,
    ...NATIVE_SOFT_SHADOW,
  },
  analysisLoadingCopy: { flex: 1, gap: 4 },
  headingTitle: {
    color: c.text,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.45,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCompact: { gap: 7 },
  observatoryActionRow: {
    width: "100%",
    minHeight: 66,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: c.surface,
    shadowColor: c.botany,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  observatoryActionRowCompact: {
    minHeight: 58,
    borderRadius: 9,
  },
  observatoryActionRowVisual: {
    width: "47.8%",
    minHeight: 188,
    borderRadius: 16,
  },
  observatoryActionContent: {
    minHeight: 64,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  observatoryActionContentCompact: {
    minHeight: 56,
    padding: 8,
    gap: 7,
  },
  observatoryActionContentVisual: {
    minHeight: 186,
    padding: 11,
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    position: "relative",
  },
  observatoryActionMedia: { width: 72, height: 72, borderRadius: 9, backgroundColor: "rgba(0,0,0,.28)" },
  observatoryActionMediaCompact: { width: 54, height: 54, borderRadius: 7 },
  observatoryActionMediaVisual: { ...StyleSheet.absoluteFill, borderRadius: 0, opacity: 0.92 },
  observatoryActionMediaShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(1,10,5,.42)" },
  observatoryActionCopyVisual: { width: "100%", justifyContent: "flex-end" },
  observatoryActionChevronVisual: { position: "absolute", right: 11, bottom: 11 },
  observatoryActionIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  observatoryActionIconCompact: {
    width: 26,
    height: 26,
    borderRadius: 6,
    marginBottom: 0,
  },
  observatoryActionTitle: {
    color: c.text,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    paddingRight: 2,
  },
  observatoryActionTitleCompact: { fontSize: 11, lineHeight: 13, paddingRight: 2 },
  observatoryActionTitleVisual: { fontSize: 15, lineHeight: 19, textShadowColor: "rgba(0,0,0,.8)", textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  observatoryActionNote: {
    color: "#D4E1D6",
    fontSize: 9,
    lineHeight: 12,
    paddingRight: 2,
  },
  observatoryActionNoteCompact: { fontSize: 8, lineHeight: 10, paddingRight: 0 },
  observatoryActionNoteVisual: { fontSize: 10, lineHeight: 13, color: "#E7F5EA", textShadowColor: "rgba(0,0,0,.8)", textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  observatoryUnavailableLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.65,
    marginTop: 2,
  },
  sensorRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(199,243,91,.42)",
    backgroundColor: "rgba(3,18,9,.82)",
  },
  sensor: {
    width: "48%",
    minHeight: 78,
    padding: 10,
    borderRadius: 13,
    borderWidth: 1,
    backgroundColor: "rgba(5,29,13,.74)",
  },
  sensorValue: {
    color: c.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  sensorLabel: { color: c.muted, fontSize: 9, fontWeight: "700", marginTop: 2 },
  sensorNote: { fontSize: 7, fontWeight: "800", marginTop: 4 },
  weatherButton: {
    minHeight: 45,
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(199,243,91,.55)",
    backgroundColor: "rgba(35,59,20,.62)",
  },
  weatherButtonText: {
    color: c.text,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.45,
  },
  sensorError: {
    color: c.danger,
    fontSize: 10,
    textAlign: "center",
    marginTop: -5,
  },
  truth: {
    flexDirection: "row",
    gap: 11,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTitle: { color: c.text, fontSize: 14, lineHeight: 19, fontWeight: "900" },
  copy: { color: c.muted, fontSize: 12, lineHeight: 18 },
  intro: { color: c.muted, fontSize: 12, lineHeight: 18 },
  divider: { borderTopWidth: 1, marginTop: 4, paddingTop: 13 },
  dividerText: { fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  statusPanel: {
    minHeight: 184,
    padding: 20,
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    textAlign: "center",
    backgroundColor: "rgba(8,22,14,.72)",
    shadowColor: c.botany,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  emptyTitle: {
    color: c.text,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.25,
  },
  emptyText: {
    color: c.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 310,
  },
  chip: { fontSize: 8, fontWeight: "900", letterSpacing: 1.05 },
  privateFeature: { padding: 20, borderRadius: 18, borderWidth: 1, gap: 11 },
  primaryButton: {
    minHeight: 45,
    paddingHorizontal: 14,
    borderRadius: 11,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: c.bg,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  secondaryButton: {
    minHeight: 39,
    paddingHorizontal: 11,
    borderRadius: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  secondaryButtonText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.4 },
  inlineButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  assistantCompactHeader: {
    minHeight: 78,
    padding: 11,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  assistantCompactHeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  assistantCompactIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantCompactTitle: {
    color: c.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  assistantToolsButton: {
    minHeight: 38,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  assistantToolsButtonText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  workflow: { padding: 15, gap: 12, borderRadius: 18, borderWidth: 1, backgroundColor: "rgba(23,12,42,.66)", shadowColor: c.ai, ...NATIVE_SOFT_SHADOW },
  toolTabs: { flexDirection: "row", gap: 7 },
  toolTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  toolTabText: { color: c.muted, fontSize: 8, fontWeight: "900" },
  messageList: { gap: 8 },
  message: { padding: 11, borderRadius: 12, borderWidth: 1, gap: 4 },
  messageRole: {
    color: c.text,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    color: c.text,
    fontSize: 13,
    textAlignVertical: "top",
  },
  textarea: { minHeight: 88 },
  photoPrompt: {
    minHeight: 190,
    padding: 18,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  plantPrimary: {
    height: 258,
    borderWidth: 1,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,.2)",
  },
  plantPrimaryImage: { width: "100%", height: "100%" },
  plantMeta: {
    position: "absolute",
    left: 10,
    right: 48,
    bottom: 10,
    padding: 9,
    gap: 3,
    borderRadius: 9,
    backgroundColor: "rgba(0,8,4,.76)",
  },
  closePhoto: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,8,4,.78)",
  },
  photoSequence: { flexDirection: "row", gap: 9 },
  photoThumbnail: {
    width: 78,
    height: 78,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(195,107,255,.5)",
  },
  field: { gap: 5 },
  fieldLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  result: { padding: 14, gap: 8, borderRadius: 14, borderWidth: 1 },
  answer: { color: c.text, fontSize: 12, lineHeight: 19 },
  correction: { padding: 14, gap: 9, borderRadius: 14, borderWidth: 1 },
  formMessage: { fontSize: 11, fontWeight: "700", lineHeight: 16 },
  ownPosts: { gap: 8, marginTop: 4 },
  ownPost: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderWidth: 1, borderRadius: 10, backgroundColor: "rgba(0,0,0,.16)" },
  ownPostStatus: { fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  ownPostText: { marginTop: 3, color: c.text, fontSize: 12, lineHeight: 17 },
  aquariumSelect: { gap: 8 },
  aquariumOption: {
    minHeight: 51,
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  partnerNotice: {
    padding: 14,
    flexDirection: "row",
    gap: 10,
    borderRadius: 15,
    borderWidth: 1,
  },
  chipRow: { gap: 8, paddingVertical: 2 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  sortRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  infoCard: { padding: 14, gap: 8, borderRadius: 15, borderWidth: 1 },
  source: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sourceText: { fontSize: 11, fontWeight: "800", flex: 1 },
  loading: {
    minHeight: 100,
    padding: 20,
    gap: 8,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    minHeight: 72,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,158,168,.48)",
    backgroundColor: "rgba(88,21,29,.36)",
  },
  productCard: {
    minHeight: 128,
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  productImageFrame: {
    width: 118,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,.94)",
  },
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  productBody: {
    flex: 1,
    padding: 13,
    justifyContent: "space-between",
    gap: 5,
  },
  productTitle: {
    color: c.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  productBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  price: { fontSize: 13, fontWeight: "900", flex: 1 },
  postHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 6 },
  postHeadCopy: { flex: 1, gap: 3 },
  postOwnerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  postOwnerButton: { width: 27, height: 27, borderRadius: 6, borderWidth: 1, borderColor: "rgba(199,243,91,.42)", backgroundColor: "rgba(8,37,20,.78)", alignItems: "center", justifyContent: "center" },
  postOwnerDelete: { borderColor: "rgba(255,171,176,.42)" },
  postInteractionRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 6, borderTopWidth: 1, borderTopColor: `${c.muted}22` },
  commentToggle: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7, paddingVertical: 5 },
  commentPanel: { gap: 8, paddingTop: 7, borderTopWidth: 1, borderTopColor: "rgba(199,243,91,.16)" },
  commentRow: { padding: 8, borderRadius: 9, backgroundColor: "rgba(0,0,0,.16)", gap: 3 },
  commentReplyRow: { marginLeft: 14, borderLeftWidth: 2, borderLeftColor: "rgba(94,213,255,.42)" },
  commentAuthor: { color: c.text, fontSize: 11, fontWeight: "900" },
  commentReplyAction: { fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  commentComposer: { flexDirection: "row", alignItems: "flex-end", gap: 7 },
  commentInput: { flex: 1, minHeight: 42, maxHeight: 110, borderWidth: 1, borderColor: "rgba(199,243,91,.32)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, color: c.text, backgroundColor: "rgba(0,0,0,.18)" },
  commentSend: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.botany, alignItems: "center", justifyContent: "center" },
  notificationActions: { alignItems: "flex-end", marginBottom: 10 },
  notificationRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  notificationCopy: { flex: 1, gap: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  messageTargetPanel: { gap: 7, padding: 13, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  messageConversationPanel: { gap: 9, padding: 13, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  messageConversationRow: { flexDirection: "row", alignItems: "center", gap: 9, padding: 10, borderRadius: 11, borderWidth: 1 },
  messageAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  messageConversationCopy: { flex: 1, gap: 2 },
  messageUnread: { minWidth: 21, paddingHorizontal: 6, paddingVertical: 4, textAlign: "center", borderRadius: 10, fontSize: 10, fontWeight: "900" },
  messageThreadPanel: { gap: 8, padding: 13, borderRadius: 14, borderWidth: 1 },
  messageThreadBody: { gap: 8, minHeight: 150, maxHeight: 330 },
  messageBubble: { alignSelf: "flex-start", maxWidth: "82%", padding: 10, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(12,45,23,.62)", gap: 4 },
  messageBubbleOwn: { alignSelf: "flex-end", backgroundColor: "rgba(199,243,91,.12)" },
  catalogRealmButtons: { flexDirection: "row", gap: 7, marginBottom: 10 },
  catalogRealmButton: { flex: 1, minHeight: 48, paddingHorizontal: 8, borderWidth: 1, borderRadius: 11, flexDirection: "row", alignItems: "center", gap: 6 },
  catalogNativeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catalogNativeFilterRow: { gap: 6, paddingVertical: 6 },
  catalogNativeFilterChip: { minHeight: 30, paddingHorizontal: 9, borderWidth: 1, borderRadius: 7, justifyContent: "center" },
  catalogNativeCard: { width: "48%", borderWidth: 1, borderRadius: 13, overflow: "hidden", paddingBottom: 10 },
  catalogNativeImage: { width: "100%", aspectRatio: 1.05, alignItems: "center", justifyContent: "center" },
  catalogNativeImageAsset: { width: "100%", height: "100%" },
  catalogNativeName: { color: c.text, fontSize: 15, fontWeight: "700", lineHeight: 19, marginHorizontal: 10, marginTop: 9 },
  catalogNativeScientific: { fontSize: 12, fontStyle: "italic", lineHeight: 16, marginHorizontal: 10, marginTop: 4 },
  mediaAspectEditorNative: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 7, paddingVertical: 8 },
  mediaAspectOptionNative: { minHeight: 34, paddingHorizontal: 10, borderWidth: 1, borderRadius: 8, justifyContent: "center" },
  mediaQualityNative: { gap: 4, paddingVertical: 7 },
  nativeUploadProgress: { gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(185,251,127,.28)", backgroundColor: "rgba(2,16,8,.62)" },
  uploadProgressHeading: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  nativeUploadTrack: { height: 5, overflow: "hidden", borderRadius: 99, backgroundColor: "rgba(185,251,127,.16)" },
  nativeUploadFill: { height: "100%", borderRadius: 99 },
  messageComposer: { flexDirection: "row", alignItems: "flex-end", gap: 7, borderTopWidth: 1, borderTopColor: `${c.muted}22`, paddingTop: 9 },
  messageInput: { flex: 1, minHeight: 42, maxHeight: 110, borderWidth: 1, borderColor: "rgba(199,243,91,.32)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, color: c.text, backgroundColor: "rgba(0,0,0,.18)" },
  date: { color: c.muted, fontSize: 9 },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: c.raised,
  },
  mediaScrollHintNative: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 4 },
  mediaScrollLineNative: { height: 1, flex: 1, backgroundColor: "rgba(185,251,127,.42)" },
  mediaLightboxNative: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(0,8,4,.96)" },
  mediaLightboxImageNative: { width: "100%", height: "82%" },
  mediaLightboxCloseNative: { position: "absolute", top: 48, right: 18, width: 36, height: 36, borderRadius: 9, borderWidth: 1, borderColor: "rgba(185,251,127,.45)", backgroundColor: "rgba(7,28,13,.92)", alignItems: "center", justifyContent: "center" },
  profileFocus: { padding: 18, borderRadius: 18, borderWidth: 1, gap: 7 },
  profilePostsPanel: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 8 },
  profilePostRow: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(199,243,91,.16)", backgroundColor: "rgba(0,0,0,.14)", gap: 4 },
  profileTargetPanel: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 7 },
  profileEditPanel: { gap: 8 },
  profileVisibilityNative: { gap: 8, marginTop: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: `${c.botany}33`, backgroundColor: `${c.botany}08` },
  profileConsentPanel: { gap: 4, marginTop: 4 },
  profileConsentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingVertical: 6 },
  profilePreferencesPanel: { gap: 8, marginTop: 4 },
  profileInput: { minHeight: 42, borderWidth: 1, borderColor: "rgba(199,243,91,.35)", borderRadius: 9, paddingHorizontal: 11, color: c.text, backgroundColor: "rgba(0,0,0,.18)" },
  profileBioInput: { minHeight: 86, paddingTop: 10, textAlignVertical: "top" },
  profileDisplayPanel: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 6 },
  profileDisplayRow: { gap: 6 },
  profileDisplayChoice: { minHeight: 38, paddingHorizontal: 9, borderRadius: 9, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 7 },
  realmPicker: { flexDirection: "row", gap: 7 },
  realmButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: "rgba(8,20,14,.62)",
    shadowColor: c.botany,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5,
  },
  realmText: { color: c.text, fontSize: 8, fontWeight: "900", textAlign: "center" },
  switchRow: {
    padding: 12,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(0,0,0,.18)",
  },
  collectionShell: { flex: 1 },
  collectionIntro: { paddingHorizontal: 16, paddingTop: 16, gap: 6 },
  plannerTool: {
    width: "48.5%",
    minHeight: 56,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  planCanvas: {
    minHeight: 160,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,.2)",
  },
  markerLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,.32)",
  },
  miniCopy: { color: c.muted, fontSize: 10, lineHeight: 15 },
  searchInput: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    color: c.text,
    backgroundColor: "rgba(12,25,17,.58)",
    shadowColor: c.botany,
    ...NATIVE_SOFT_SHADOW,
    fontSize: 13,
  },
  tabs: {
    position: "absolute",
    left: 12,
    right: 12,
    minHeight: 70,
    paddingVertical: 9,
    paddingHorizontal: 4,
    flexDirection: "row",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(199,243,91,.24)",
    backgroundColor: "rgba(2,12,6,.96)",
    shadowColor: c.botany,
    ...NATIVE_SOFT_SHADOW,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabText: { color: c.muted, fontSize: 7, fontWeight: "800" },
  communitySubscribeNative: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 14, borderWidth: 1, marginBottom: 9 },
  communityFeedSelector: { gap: 8, padding: 11, borderRadius: 14, borderWidth: 1 },
  communityFeedSelectorHeading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  communityFeedVerified: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  communityFeedFilterRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  communityFeedFilter: { minWidth: "46%", flexGrow: 1, minHeight: 39, paddingHorizontal: 9, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  careSectionHeader: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 16, marginBottom: 8 },
  sectionTitle: { flex: 1, color: c.text, fontSize: 20, fontWeight: "900", letterSpacing: 0.6 },
  careCount: { color: c.botany, fontSize: 18, fontWeight: "900" },
  careTask: { flexDirection: "row", alignItems: "center", gap: 9, padding: 11, borderRadius: 15, borderWidth: 1, marginBottom: 8 },
  careTaskCopy: { flex: 1, gap: 2 },
  careIconButton: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, borderColor: "rgba(199,243,91,.24)", alignItems: "center", justifyContent: "center" },
  carePanel: { padding: 14, gap: 9, borderRadius: 17, borderWidth: 1, marginTop: 14 },
  careRealmRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  careRealmChip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  careInput: { minHeight: 45, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(199,243,91,.24)", color: c.text, backgroundColor: "rgba(0,0,0,.2)", fontSize: 12 },
  careInputLarge: { minHeight: 88, paddingTop: 11, textAlignVertical: "top" },
  careJournal: { paddingTop: 9, borderTopWidth: 1, borderTopColor: "rgba(199,243,91,.14)", gap: 3 },
  disabled: { opacity: 0.48 },
  searchResultCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  searchResultIcon: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  searchResultCopy: { flex: 1, gap: 3 },
  publicProfileCard: { padding: 13, borderRadius: 15, borderWidth: 1, gap: 7 },
  publicProfileCopy: { gap: 4 },
  publicAvatar: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  publicStats: { flexDirection: "row", justifyContent: "space-around", padding: 14, borderRadius: 14, borderWidth: 1 },
  publicSocialLists: { padding: 13, borderRadius: 14, borderWidth: 1, gap: 10 },
  publicSocialTabs: { flexDirection: "row", gap: 8 },
  publicSocialTab: { flex: 1, minHeight: 40, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  publicSocialList: { gap: 7 },
  publicSocialPerson: { flexDirection: "row", alignItems: "center", gap: 9, padding: 9, borderRadius: 11, borderWidth: 1 },
  publicSocialAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  publicPostCard: { padding: 13, borderRadius: 14, borderWidth: 1, gap: 6 },
  stat: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 16, fontWeight: "900" },
  statLabel: { color: c.muted, fontSize: 8, fontWeight: "800" },
  dashboardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dashboardMetric: { width: "48%", minHeight: 112, padding: 13, borderRadius: 16, borderWidth: 1, gap: 7 },
  dashboardMetricValue: { color: c.text, fontSize: 28, lineHeight: 32, fontWeight: "900" },
  dashboardSummary: { padding: 15, borderRadius: 16, borderWidth: 1, gap: 12 },
  dashboardSummaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  dashboardChart: { padding: 15, borderRadius: 16, borderWidth: 1, gap: 12 },
  dashboardChartRow: { gap: 5 },
  dashboardChartLabel: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  dashboardBarTrack: { height: 8, borderRadius: 99, overflow: "hidden", backgroundColor: "rgba(199,243,91,.12)" },
  dashboardBar: { height: "100%", borderRadius: 99 },
  dashboardPrivacy: { flexDirection: "row", gap: 9, padding: 13, borderRadius: 14, borderWidth: 1, backgroundColor: "rgba(2,12,6,.55)" },
  taxonCard: { padding: 16, borderRadius: 18, borderWidth: 1, gap: 8 },
  nativeTaxonFacts: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 12 },
  nativeTaxonFactsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nativeTaxonFact: { width: "48%", minHeight: 62, padding: 10, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 8 },
  taxonImageButton: { position: "relative", overflow: "hidden", borderRadius: 13, borderWidth: 1 },
  taxonImage: { width: "100%", height: 180, borderRadius: 13, borderWidth: 1, borderColor: "rgba(199,243,91,.3)" },
  taxonImageDetailLabel: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 31, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(1,18,8,.82)" },
  taxonImageDetailText: { color: "#effff0", fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  taxonImageModalScreen: { flex: 1, padding: 14, justifyContent: "center", backgroundColor: "rgba(0,9,4,.9)" },
  taxonImageModalCard: { maxHeight: "94%", padding: 14, borderRadius: 18, borderWidth: 1, gap: 11 },
  taxonImageModalHeader: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  taxonImageModalTitle: { color: c.text, fontSize: 25, lineHeight: 29, fontWeight: "900", letterSpacing: 0.3 },
  taxonImageModalClose: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1 },
  taxonImageModalStage: { minHeight: 300, width: "100%", borderRadius: 13, overflow: "hidden", backgroundColor: "#021008", alignItems: "center", justifyContent: "center" },
  taxonImageModalLoading: { minHeight: 220, width: "100%", alignItems: "center", justifyContent: "center", gap: 9, padding: 20 },
  taxonImageModalImage: { width: "100%", height: 390, borderRadius: 13, backgroundColor: "#021008" },
  taxonImageModalEvidence: { gap: 6, padding: 10, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(0,0,0,.16)" },
  taxonImageSourceLink: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  taxonImageModalHint: { color: c.muted, fontSize: 9, lineHeight: 13, textAlign: "center" },
  rankingScoreCard: { padding: 16, borderRadius: 18, borderWidth: 1, gap: 6 },
  challengeCard: { padding: 14, borderRadius: 15, borderWidth: 1, gap: 7 },
  leaderboardRow: { flexDirection: "row", alignItems: "center", gap: 9, padding: 11, borderRadius: 12, borderWidth: 1 },
  profileSubscriptionCard: { gap: 11, padding: 14, borderWidth: 1, borderRadius: 16, backgroundColor: c.surface },
  profileSubscriptionHeading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  profileSubscriptionPlans: { flexDirection: "row", gap: 8 },
  profileSubscriptionPlan: { flex: 1, gap: 5, padding: 10, borderWidth: 1, borderColor: c.raised, borderRadius: 11, backgroundColor: c.bg },
  profileCreatorCard: { padding: 15, borderRadius: 18, borderWidth: 1, gap: 13 },
  profileCreatorTop: { flexDirection: "row", alignItems: "center", gap: 13 },
  profileCreatorAvatar: { width: 86, height: 86, borderRadius: 43, borderWidth: 2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  profileCreatorAvatarImage: { width: "100%", height: "100%" },
  profileCreatorIdentity: { flex: 1, gap: 4 },
  profileCreatorName: { color: c.text, fontSize: 23, lineHeight: 28, fontWeight: "900" },
  profileCreatorHandle: { color: c.muted, fontSize: 12, lineHeight: 17 },
  profileCreatorBio: { color: c.text, fontSize: 13, lineHeight: 19 },
  profileCreatorLinks: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  profileCreatorLink: { maxWidth: "100%", minHeight: 31, paddingHorizontal: 9, borderRadius: 9, borderWidth: 1, borderColor: "rgba(199,243,91,.35)", flexDirection: "row", alignItems: "center", gap: 6 },
  profileCreatorStats: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(199,243,91,.2)", paddingVertical: 10, justifyContent: "space-around" },
  profilePublicPostImage: { width: "100%", height: "100%", position: "absolute" },
  profilePublicPostFallback: { flex: 1, padding: 10, alignItems: "center", justifyContent: "center", gap: 6 },
  profilePublicPostFallbackText: { color: c.text, fontSize: 10, lineHeight: 14, textAlign: "center" },
  managementGroup: { gap: 8, marginBottom: 14 },
  managementHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 2 },
  managementGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  managementTile: { width: "48.5%", minHeight: 128, padding: 12, borderRadius: 15, borderWidth: 1, gap: 9 },
  managementTileIcon: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  managementTileCopy: { flex: 1, gap: 4 },
  managementPrinciples: { padding: 14, borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 2 },
  profileReferenceIdentity: { position: "relative", minHeight: 132, padding: 14, borderRadius: 18, borderWidth: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  profileReferenceAvatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  profileReferenceAvatarImage: { width: "100%", height: "100%" },
  profileReferenceIdentityCopy: { flex: 1, gap: 3, paddingTop: 1 },
  profileReferenceName: { color: c.text, fontSize: 22, lineHeight: 25, fontWeight: "900", letterSpacing: 0.2 },
  profileReferenceMore: { width: 34, height: 30, borderRadius: 9, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  profileReferenceMoreText: { fontSize: 18, fontWeight: "900", lineHeight: 19 },
  profileReferenceStats: { position: "absolute", left: 14, right: 14, bottom: 10, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(199,243,91,.14)", paddingTop: 8 },
  profileReferenceStat: { minWidth: 70, alignItems: "center", gap: 1 },
  profileReferenceStatValue: { color: c.text, fontSize: 14, fontWeight: "900" },
  profileReferenceStatLabel: { color: c.muted, fontSize: 7, fontWeight: "900", letterSpacing: 0.8 },
  profileReferenceSubline: { color: c.muted, fontSize: 10, marginTop: -4, marginBottom: 8 },
  profileHabitatChoiceGridNative: { gap: 8 },
  profileHabitatChoiceNative: { minHeight: 62, padding: 10, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  profileHabitatChoiceIcon: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  profileHabitatChoiceCopy: { flex: 1, gap: 2 },
  profileReferencePostsPanel: { padding: 12, borderRadius: 16, borderWidth: 1, gap: 9, marginTop: 14 },
  profileReferencePostsHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  profilePublicPostGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  profilePublicPostTile: { width: "48.5%", minHeight: 132, padding: 10, borderRadius: 12, borderWidth: 1, justifyContent: "space-between", gap: 5 },
  photoObservationPanel: { padding: 13, borderRadius: 17, borderWidth: 1, gap: 9, marginTop: 2 },
  nativeResponsePanel: { marginTop: 6, gap: 5 },
  nativeCandidateBox: { marginTop: 5, padding: 6, gap: 2, borderLeftWidth: 2, backgroundColor: "rgba(157,235,198,.06)" },
  nativeResponseActions: { flexDirection: "row", alignItems: "center", gap: 5 },
  nativeResponseButton: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  nativeResponseInput: { flex: 1, minHeight: 30, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: "rgba(199,243,91,.25)", color: c.text, fontSize: 11 },
  photoObservationRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderTopWidth: 1 },
  explorePortalRow: { flexDirection: "row", gap: 8 },
  explorePortalCard: { flex: 1, minWidth: 0, height: 92, overflow: "hidden", borderRadius: 15, borderWidth: 1 },
  explorePortalImage: { flex: 1, justifyContent: "flex-end", gap: 3, padding: 9 },
  explorePortalImageStyle: { borderRadius: 14 },
  explorePortalShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(1,16,8,.52)" },
  explorePortalLabel: { color: c.text, fontSize: 10, fontWeight: "900" },
  explorePanel: { padding: 13, borderRadius: 17, borderWidth: 1, gap: 10 },
  explorePanelHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  exploreStatus: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 9, borderWidth: 1 },
  exploreStatusDot: { width: 8, height: 8, borderRadius: 4, shadowColor: c.gold, ...NATIVE_SOFT_SHADOW },
  exploreFilterRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  exploreFilter: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, borderWidth: 1 },
  exploreFilterText: { fontSize: 9, fontWeight: "900" },
  exploreViewRow: { flexDirection: "row", gap: 6 },
  exploreViewButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11, borderWidth: 1, backgroundColor: "rgba(8,20,14,.62)" },
  exploreMap: { height: 248, overflow: "hidden", borderRadius: 14, borderWidth: 1 },
  exploreMapImage: { flex: 1 },
  exploreMapImageStyle: { borderRadius: 13 },
  exploreMapShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(1,16,12,.38)" },
  exploreMapPin: { position: "absolute", width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, borderWidth: 2, backgroundColor: "rgba(2,20,18,.88)" },
  exploreMapCaption: { position: "absolute", left: 12, right: 12, bottom: 10, color: c.text, fontSize: 9, fontWeight: "800", textShadowColor: "#000", textShadowRadius: 4 },
  exploreEmpty: { position: "absolute", left: 20, right: 20, top: 58, alignItems: "center", gap: 6, padding: 14, borderRadius: 13, backgroundColor: "rgba(1,17,11,.84)" },
  exploreObservationList: { gap: 7 },
  exploreObservationRow: { flexDirection: "row", alignItems: "center", gap: 9, padding: 10, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(0,0,0,.14)" },
  exploreObservationIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 11, borderWidth: 1 },
  communityMediaPanel: { gap: 9, padding: 10, borderRadius: 14, borderWidth: 1 },
  communityMediaPickerRow: { gap: 8 },
  communityMediaPicker: { minHeight: 62, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  communityMediaPreview: { width: "100%", height: 170, borderRadius: 11, borderWidth: 1, borderColor: "rgba(199,243,91,.28)", resizeMode: "cover" },
  communityMediaMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  communityMediaRemove: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  dashboardInboxCard: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 8 },
  dashboardInboxInput: { minHeight: 48, borderWidth: 1, borderColor: "rgba(199,243,91,.22)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, color: c.text, backgroundColor: "rgba(2,12,6,.66)", textAlignVertical: "top" },
  dashboardInboxInputCompact: { minHeight: 38, borderWidth: 1, borderColor: "rgba(199,243,91,.22)", borderRadius: 10, paddingHorizontal: 8, color: c.text, backgroundColor: "rgba(2,12,6,.66)" },
  dashboardInboxActions: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  dashboardStatusPicker: { minHeight: 38, borderWidth: 1, borderColor: "rgba(199,243,91,.22)", borderRadius: 10, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(2,12,6,.66)" },
  dashboardStatusValue: { color: c.text, fontSize: 10, fontWeight: "900" },

});

function MessagesScreen({ tone, token, account, conversations, selectedConversationId, thread, targetProfile, state, error, refresh, onSelect, onStart, onSend, onSignIn }: { tone: Tone; token: string | null; account: Account | null; conversations: DirectConversation[]; selectedConversationId: string | null; thread: DirectMessage[]; targetProfile: PublicProfile | null; state: State; error: string | null; refresh: () => Promise<void>; onSelect: (conversation: DirectConversation) => Promise<void>; onStart: (content: string) => Promise<void>; onSend: (content: string) => Promise<void>; onSignIn: () => Promise<void> }) {
  const [draft, setDraft] = useState("");
  const selected = conversations.find(item => item.id === selectedConversationId) ?? null;
  const recipientName = targetProfile?.name ?? targetProfile?.username ?? "BlackWaterLeaf-Nutzer";
  const submit = async () => {
    const content = draft.trim();
    if (!content) return;
    try {
      if (selected) await onSend(content);
      else if (targetProfile) await onStart(content);
      setDraft("");
    } catch (cause) {
      Alert.alert("Nachricht konnte nicht gesendet werden", cause instanceof Error ? cause.message : "Bitte später erneut versuchen.");
    }
  };
  return <Page refresh={refresh} refreshing={state === "loading"}>
    <ObservatoryContextHeader tone={tone} eyebrow="PRIVAT · POSTFACH" title="DEINE NACHRICHTEN." subtitle={account ? "Geschützte 1:1-Unterhaltungen. Nur aktive Mitglieder können dir schreiben." : "Private Nachrichten bleiben nach der sicheren Anmeldung geschützt."} icon="mail-outline" />
    {!token ? <PrivateFeature tone={tone} title="POSTFACH FÜR MITGLIEDER" text="Private Nachrichten und Gesprächsverläufe werden nur nach einer sicheren Anmeldung geladen." onSignIn={onSignIn} /> : <>
      {error ? <ErrorNotice text={error} /> : null}
      {targetProfile && !selected ? <View style={[styles.messageTargetPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>NEUE UNTERHALTUNG</Text><Text style={styles.cardTitle}>{recipientName}</Text><Text style={styles.miniCopy}>Keine privaten Daten oder exakten Standorte automatisch teilen.</Text></View> : null}
      <View style={[styles.messageConversationPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><View style={styles.careSectionHeader}><Text style={[styles.eyebrow, { color: tone.accent }]}>UNTERHALTUNGEN</Text><Text style={styles.careCount}>{conversations.length}</Text></View>{conversations.length ? conversations.map(item => <Pressable key={item.id} onPress={() => void onSelect(item)} style={[styles.messageConversationRow, { borderColor: `${tone.accent}44`, backgroundColor: item.id === selectedConversationId ? `${tone.accent}18` : "transparent" }]}><View style={[styles.messageAvatar, { borderColor: `${tone.accent}88`, backgroundColor: `${tone.accent}16` }]}><Ionicons name="person-outline" size={17} color={tone.accent} /></View><View style={styles.messageConversationCopy}><Text style={styles.cardTitle}>{item.member.name}</Text><Text style={styles.miniCopy} numberOfLines={1}>{item.lastMessage?.content ?? "Noch keine Nachricht"}</Text></View>{item.unreadCount > 0 ? <Text style={[styles.messageUnread, { backgroundColor: tone.accent, color: c.bg }]}>{item.unreadCount > 9 ? "9+" : item.unreadCount}</Text> : null}</Pressable>) : <StatusPanel tone={tone} icon="mail-outline" code="POSTFACH / LEER" title="NOCH KEINE UNTERHALTUNG" text="Öffne ein öffentliches Profil, um eine private Nachricht zu starten." />}</View>
      {selected || (targetProfile && !selected) ? <View style={[styles.messageThreadPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>{selected ? `GESPRÄCH · ${selected.member.name}` : `AN ${recipientName.toUpperCase()}`}</Text><Text style={styles.miniCopy}>Privat · serverseitig geprüft · blockierte Konten bleiben ausgeschlossen</Text><View style={styles.messageThreadBody}>{thread.length ? thread.map(item => <View key={item.id} style={[styles.messageBubble, item.senderId === String(account?.id) ? styles.messageBubbleOwn : null, { borderColor: `${tone.accent}55` }]}><Text style={styles.copy}>{item.content}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleString("de-DE")}</Text></View>) : <StatusPanel tone={tone} icon="chatbubble-ellipses-outline" code="POSTFACH / NEU" title="NOCH KEINE NACHRICHT" text="Schreibe eine respektvolle erste Nachricht." />}</View><View style={styles.messageComposer}><TextInput value={draft} onChangeText={setDraft} placeholder="Nachricht schreiben …" placeholderTextColor={c.muted} multiline maxLength={2000} style={styles.messageInput} /><PrimaryButton tone={tone} label="SENDEN" icon="send-outline" onPress={() => void submit()} disabled={!draft.trim()} /></View></View> : <StatusPanel tone={tone} icon="mail-outline" code="POSTFACH / AUSWAHL" title="UNTERHALTUNG AUSWÄHLEN" text="Wähle links eine Unterhaltung oder öffne ein öffentliches Profil." />}
    </>}
  </Page>;
}
