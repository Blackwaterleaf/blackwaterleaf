import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
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
  Alert,
  FlatList,
  Image,
  ImageBackground,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
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
import {
  assistantAquariumAnalyze,
  assistantChat,
  assistantPlantIdentify,
  addCommunityComment,
  careAddJournal,
  careCreatePlan,
  careCreateTask,
  careMine,
  careToday,
  careUpdateTask,
  clearToken,
  communityComments,
  communityFeed,
  createCommunityDraft,
  currentAccount,
  deleteCommunityPost,
  knowledge,
  marketplace,
  markNotificationsRead,
  myCommunityPosts,
  notificationFeed,
  outdoorWeather,
  platformAvailability,
  privateHabitats,
  profileConsents,
  publishCommunityDraft,
  readToken,
  setProfileConsent,
  updateProfile,
  uploadProfileAvatar,
  submitPlantCorrection,
  updateCommunityPost,
  unifiedSearch,
  publicPlantTaxon,
  publicProfile,
  socialRelationship,
  followProfile,
  unfollowProfile,
  savedItems,
  saveItem,
  unsaveItem,
  publishedChallenges,
  myChallenges,
  joinChallenge,
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
  type OwnCommunityPost,
  type NativeNotification,
  type OutdoorWeather,
  type PlatformAvailability,
  type ProfileConsent,
  type UnifiedSearchResult,
  type PublicPlantTaxon,
  type PublicProfile,
  type SocialRelationship,
  type SavedItem,
  type Challenge,
  type ChallengeProgress,
  type ExperienceSummary,
  type LeaderboardRow,
} from "./src/api";
import { HabitatManager } from "./src/HabitatManager";
import { MomentCapture } from "./src/MomentCapture";
import { signInWithBlackWaterLeaf } from "./src/nativeAuth";
import { getBlackWaterLeafSeason } from "./src/season";

const ASSETS = {
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
  gold: "#E1D661",
  ai: "#C36BFF",
  market: "#D9AD69",
  champagne: "#F3D59C",
  text: "#F3FFF5",
  muted: "#9BB39F",
  danger: "#FF9EA8",
  botanySurface: "#061b0d",
  aquariumSurface: "#04303e",
  terrariumSurface: "#3e3812",
  aiSurface: "#301648",
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
  | "profile"
  | "botany"
  | "aquarium"
  | "terrarium"
  | "assistant"
  | "knowledge"
  | "live"
  | "photo"
  | "post"
  | "collection"
  | "builder"
  | "search"
  | "publicProfile"
  | "taxon"
  | "saved"
  | "ranking"
  | "notifications"
  | "care";
type BottomTab =
  | "home"
  | "explore"
  | "marketplace"
  | "community"
  | "profile"
  | "builder";
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
type ProfileMenuTarget = "open" | "edit" | "avatar" | "display" | "tools";

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
    image: ASSETS.botany,
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
    active: "marketplace",
  },
  community: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "COMMUNITY",
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
    panel: "#1e1134",
    image: ASSETS.ai,
    label: "BLACKWATERLEAF KI",
    active: "home",
  },
  knowledge: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "WISSEN & EVIDENZ",
    active: "explore",
  },
  live: {
    accent: c.aqua,
    surface: c.aquariumSurface,
    panel: "#032231",
    image: ASSETS.aquarium,
    label: "LIVE-BEREICH",
    active: "home",
  },
  photo: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "MOMENT FESTHALTEN",
    active: "home",
  },
  post: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "BEITRAG",
    active: "community",
  },
  collection: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "MEINE ANLAGEN",
    active: "profile",
  },
  builder: {
    accent: c.aqua,
    surface: c.aquariumSurface,
    panel: "#032231",
    image: ASSETS.aquarium,
    label: "HABITAT BUILDER",
    active: "builder",
  },
  search: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "SUCHE",
    active: "explore",
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
    active: "explore",
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
  care: {
    accent: c.botany,
    surface: c.botanySurface,
    panel: c.surface,
    image: ASSETS.botany,
    label: "HEUTE · PFLEGE",
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
  const [platform, setPlatform] = useState<PlatformAvailability | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<NativeNotification[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [careJournal, setCareJournal] = useState<CareJournalEntry[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [consents, setConsents] = useState<ProfileConsent[]>([]);
  const [weather, setWeather] = useState<OutdoorWeather | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);
  const [collectionRealm, setCollectionRealm] = useState<Realm>("botany");
  const [visibleKinds, setVisibleKinds] = useState<Array<"plant" | "aquarium" | "terrarium">>(["plant", "aquarium", "terrarium"]);
  const [profileMenuTarget, setProfileMenuTarget] = useState<ProfileMenuTarget>("open");
  const [selectedPublicProfileId, setSelectedPublicProfileId] = useState<number | null>(null);
  const [selectedTaxonId, setSelectedTaxonId] = useState<number | null>(null);

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
        setConsents([]);
        return;
      }
      try {
        const [me, mine, permissions] = await Promise.all([
          currentAccount(sessionToken),
          privateHabitats(sessionToken),
          profileConsents(sessionToken),
        ]);
        setAccount(me);
        setHabitats(mine);
        setConsents(permissions);
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
      if (screen === "community") setPosts(await communityFeed());
      if (screen === "notifications" && token) setNotifications(await notificationFeed(token));
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
    setConsents([]);
    setCareTasks([]);
    setCarePlans([]);
    setCareJournal([]);
    navigate("home");
  }, [navigate]);

  const openCollection = useCallback(
    (realm: Realm) => {
      setCollectionRealm(realm);
      navigate("collection");
    },
    [navigate]
  );

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

  const requestWeather = useCallback(async () => {
    setWeatherError(null);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      setWeatherError(
        "Standortfreigabe nicht erteilt. Es werden keine Wetterwerte gezeigt."
      );
      return;
    }
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setWeather(
        await outdoorWeather(
          position.coords.latitude,
          position.coords.longitude
        )
      );
    } catch {
      setWeatherError("Außenwetter derzeit nicht verfügbar.");
    }
  }, []);

  const notificationInfo = useCallback(() => {
    if (token) navigate("notifications");
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
        onNotifications={notificationInfo}
        onCare={() => { if (token) navigate("care"); else void signIn(); }}
        onProfileTarget={target => {
          setProfileMenuTarget(target);
          navigate("profile");
        }}
      />
      <View style={[styles.body, { backgroundColor: seasonSurface }]}>
        {screen === "home" && (
          <Home
            platform={platform}
            habitats={habitats}
            weather={weather}
            weatherError={weatherError}
            state={state}
            error={error}
            refresh={loadScreen}
            requestWeather={requestWeather}
            navigate={navigate}
          />
        )}
        {screen === "explore" && <Explore navigate={navigate} />}
        {screen === "botany" && (
          <WorldScreen
            tone={TONES.botany}
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
            habitats={habitats}
            token={token}
            onPrivate={() =>
              guarded(
                () => openCollection("aquarium"),
                "Wasserwerte werden ausschließlich aus deinem privaten Aquarium geladen."
              )
            }
            navigate={navigate}
          />
        )}
        {screen === "photo" && (
          <PhotoScreen
            token={token}
            tone={TONES.photo}
            onSignIn={signIn}
            onComplete={refreshPrivate}
            navigate={navigate}
          />
        )}
        {screen === "post" && (
          <PostScreen
            token={token}
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
          />
        )}
        {screen === "notifications" && (
          <NotificationsScreen
            tone={TONES.notifications}
            token={token}
            notifications={notifications}
            state={state}
            error={error}
            refresh={loadScreen}
            navigate={navigate}
          />
        )}
        {screen === "care" && (
          <CareScreen
            tone={TONES.care}
            token={token}
            tasks={careTasks}
            plans={carePlans}
            journal={careJournal}
            state={state}
            error={error}
            refresh={loadScreen}
            onSignIn={signIn}
          />
        )}
        {screen === "profile" && (
          <ProfileScreen
            tone={TONES.profile}
            token={token}
            account={account}
            habitats={habitats}
            visibleKinds={visibleKinds}
            menuTarget={profileMenuTarget}
            onToggleVisibleKind={kind => setVisibleKinds(current => current.includes(kind) ? current.length > 1 ? current.filter(value => value !== kind) : current : [...current, kind])}
            state={state}
            error={error}
            onSignIn={signIn}
            onSignOut={signOut}
            onUpdateProfile={async input => { if (!token) return; await updateProfile(token, input); await refreshPrivate(token); }}
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
            onSignIn={signIn}
            onSaved={refreshPrivate}
          />
        )}
        {screen === "builder" && (
          <BuilderScreen
            tone={TONES.builder}
            token={token}
            account={account}
            habitats={habitats}
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
          />
        )}
        {screen === "publicProfile" && selectedPublicProfileId ? <PublicProfileScreen tone={TONES.publicProfile} token={token} profileId={selectedPublicProfileId} onBack={() => navigate("search")} onSignIn={signIn} /> : null}
        {screen === "taxon" && selectedTaxonId ? <TaxonScreen tone={TONES.taxon} token={token} taxonId={selectedTaxonId} onBack={() => navigate("search")} /> : null}
        {screen === "saved" ? <SavedScreen tone={TONES.saved} token={token} onBack={() => navigate("profile")} onSignIn={signIn} navigate={navigate} onOpenProfile={id => { setSelectedPublicProfileId(id); navigate("publicProfile"); }} onOpenTaxon={id => { setSelectedTaxonId(id); navigate("taxon"); }} /> : null}
        {screen === "ranking" ? <RankingScreen tone={TONES.ranking} token={token} onBack={() => navigate("profile")} onSignIn={signIn} /> : null}
      </View>
      <BottomNavigation
        active={tone.active}
        inset={insets.bottom}
        showBuilder={account?.role === "admin"}
        onSelect={next => navigate(next)}
      />
    </SafeAreaView>
  );
}

function Header({
  tone,
  account,
  onSearch,
  onNotifications,
  onCare,
  onProfileTarget,
}: {
  tone: Tone;
  account: Account | null;
  onSearch: () => void;
  onNotifications: () => void;
  onCare: () => void;
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
          onPress={onNotifications}
        />
        <HeaderAction
          icon={account ? "person" : "person-outline"}
          color={account ? tone.accent : c.muted}
          label="Profil"
          onPress={() => setMenuOpen(current => !current)}
        />
      </View>
      {menuOpen ? <View style={[styles.nativeProfileMenu, { borderColor: `${tone.accent}88`, backgroundColor: tone.panel }]}>
        <Text style={[styles.chip, { color: tone.accent }]}>PROFIL · MENÜ</Text>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onProfileTarget("open"); }}><Text style={styles.realmText}>Profil öffnen</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onProfileTarget("edit"); }}><Text style={styles.realmText}>Name & Profil bearbeiten</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onProfileTarget("avatar"); }}><Text style={styles.realmText}>Profilbild bearbeiten</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onProfileTarget("tools"); }}><Text style={styles.realmText}>PROFIL & EINSTELLUNGEN</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onProfileTarget("tools"); }}><Text style={styles.realmText}>Weitere Werkzeuge</Text></Pressable>
        <Pressable style={styles.nativeProfileMenuItem} onPress={() => { setMenuOpen(false); onCare(); }}><Text style={styles.realmText}>Heute · Pflegeaufgaben</Text></Pressable>
      </View> : null}
    </View>
  );
}

function HeaderAction({
  icon,
  color,
  label,
  onPress,
}: {
  icon: IconName;
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={19} color={color} />
    </Pressable>
  );
}

function Home({
  platform,
  habitats,
  weather,
  weatherError,
  state,
  error,
  refresh,
  requestWeather,
  navigate,
}: {
  platform: PlatformAvailability | null;
  habitats: Habitat[];
  weather: OutdoorWeather | null;
  weatherError: string | null;
  state: State;
  error: string | null;
  refresh: () => Promise<void>;
  requestWeather: () => Promise<void>;
  navigate: (screen: Screen) => void;
}) {
  const aquarium = habitats.find(item => item.kind === "aquarium");
  const waterTemp = numberValue(aquarium?.details.temperatureC, "°C");
  const ph = numberValue(aquarium?.details.ph, "");
  return (
    <Page refresh={refresh} refreshing={state === "loading"}>
      <View style={styles.sensorRail}>
        <Sensor
          color={c.aqua}
          icon="thermometer-outline"
          label="Wassertemperatur"
          value={waterTemp}
          note={
            aquarium
              ? waterTemp === "—"
                ? "nicht eingetragen"
                : "privates Aquarium"
              : "Aquarium eintragen"
          }
        />
        <Sensor
          color={c.aqua}
          icon="flask-outline"
          label="pH-Wert"
          value={ph}
          note={
            aquarium
              ? ph === "—"
                ? "nicht eingetragen"
                : "privates Aquarium"
              : "pH privat eintragen"
          }
        />
        <Sensor
          color={c.botany}
          icon="water-outline"
          label="Außenluftfeuchte"
          value={weather ? `${weather.humidityPercent} %` : "—"}
          note={weather ? "Open-Meteo" : "Standort nötig"}
        />
        <Sensor
          color={c.botany}
          icon="partly-sunny-outline"
          label="Außentemperatur"
          value={weather ? `${weather.temperatureC} °C` : "—"}
          note={weather?.condition ?? "Wetter nicht geladen"}
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.weatherButton,
          pressed && styles.pressed,
        ]}
        onPress={() => void requestWeather()}
      >
        <Ionicons name="location-outline" size={17} color={c.botany} />
        <Text style={styles.weatherButtonText}>
          {weather
            ? `${weather.condition} · Wetter aktualisieren`
            : "AUSSENWETTER AKTIVIEREN"}
        </Text>
      </Pressable>
      {weatherError ? (
        <Text style={styles.sensorError}>{weatherError}</Text>
      ) : null}
      <HomeHero tone={TONES.home} navigate={navigate} />
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
      style={[styles.hero, styles.homeHero, { borderColor: `${tone.accent}99` }]}
      imageStyle={styles.heroImage}
    >
      <View style={styles.heroShade} />
      <View style={styles.heroCopy}>
        <View style={[styles.heroIcon, { borderColor: `${tone.accent}99`, backgroundColor: `${tone.accent}18` }]}>
          <Ionicons name="leaf-outline" size={24} color={tone.accent} />
        </View>
        <Text style={[styles.eyebrow, { color: tone.accent }]}>DEIN RAUM FÜR LEBENDIGE WELTEN</Text>
        <Text style={styles.heroTitle}>NATUR IST KUNST.</Text>
        <Text style={styles.heroText}>Beobachte, verbinde und gestalte deine BlackWaterLeaf-Welt in deinem Tempo.</Text>
        <View style={styles.homeHeroActions}>
          <PrimaryButton tone={tone} label="WELT ENTDECKEN" icon="arrow-forward" onPress={() => navigate("explore")} />
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
          <ReferenceCard key={world.title} tone={tone} action={world} active={selected === world.title} />
        ))}
      </View>
      {selected ? (
        <View style={[styles.inlineChoice, { borderColor: `${selectedTone.accent}77`, backgroundColor: selectedTone.panel }]}>
          <View style={styles.inlineChoiceHeader}>
            <Text style={[styles.chip, { color: selectedTone.accent }]}>AUSWAHL · {selected.toUpperCase()}</Text>
            <Pressable accessibilityLabel="Auswahl schließen" onPress={() => setSelected(null)}><Ionicons name="close" size={18} color={selectedTone.accent} /></Pressable>
          </View>
          <View style={[styles.grid, styles.gridCompact]}>
            {(choices[selected] ?? []).map(choice => <ReferenceCard key={choice.title} tone={selectedTone} action={choice} compact />)}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Explore({ navigate }: { navigate: (screen: Screen) => void }) {
  const tone = TONES.explore;
  return (
    <Page>
      <ReferenceHero
        tone={tone}
        eyebrow="WORLD INDEX"
        title="ENTDECKE DAS LEBEN."
        subtitle="Wähle eine Welt und dokumentiere, was du wirklich beobachtest."
        icon="compass-outline"
      />
      <SectionLabel tone={tone} overline="BEREICHE" title="DEINE AUSWAHL" />
      <ActionGrid
        tone={tone}
        actions={[
          {
            title: "Botanik",
            note: "Pflanzenwelt öffnen",
            icon: "leaf-outline",
            image: ASSETS.botany,
            area: "botany",
            onPress: () => navigate("botany"),
          },
          {
            title: "Aquaristik",
            note: "Unterwasserwelt öffnen",
            icon: "fish-outline",
            image: ASSETS.aquarium,
            area: "aquarium",
            onPress: () => navigate("aquarium"),
          },
          {
            title: "Terraristik",
            note: "Regenwald öffnen",
            icon: "leaf-outline",
            image: ASSETS.terrarium,
            area: "terrarium",
            onPress: () => navigate("terrarium"),
          },
          {
            title: "KI-Assistent",
            note: "Transparente Hilfe",
            icon: "hardware-chip-outline",
            image: ASSETS.ai,
            area: "assistant",
            onPress: () => navigate("assistant"),
          },
        ]}
      />
      <View style={[styles.divider, { borderColor: `${tone.accent}55` }]}>
        <Text style={[styles.dividerText, { color: tone.accent }]}>
          WISSEN & EVIDENZ
        </Text>
      </View>
      <ReferenceCard
        tone={tone}
        action={{
          title: "Wissen & Quellen",
          note: "Veröffentlichte Quellen prüfen",
          icon: "book-outline",
          image: ASSETS.botany,
          onPress: () => navigate("knowledge"),
        }}
      />
    </Page>
  );
}

function WorldScreen({
  tone,
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  tone: Tone;
  eyebrow: string;
  title: string;
  subtitle: string;
  actions: Action[];
}) {
  return (
    <Page>
      <ReferenceHero
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
      <ActionGrid tone={tone} actions={actions} />
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
        <ReferenceHero
          tone={tone}
          eyebrow="BLACKWATERLEAF KI"
          title="KI-ASSISTENT"
          subtitle="Echte KI-Hilfe. Keine Scheinantwort. Unsicherheit bleibt sichtbar."
          icon="hardware-chip-outline"
        />
      )}
      <ActionGrid
        tone={tone}
        compact={selectionCollapsed}
        activeTitle={activeToolLabel}
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

function LiveScreen({
  tone,
  habitats,
  token,
  onPrivate,
  navigate,
}: {
  tone: Tone;
  habitats: Habitat[];
  token: string | null;
  onPrivate: () => void;
  navigate: (screen: Screen) => void;
}) {
  const aquarium = habitats.find(item => item.kind === "aquarium");
  return (
    <Page>
      <ReferenceHero
        tone={tone}
        eyebrow="LIVE-BEREICH"
        title="DEINE WELT LIVE"
        subtitle="Verbindung, Wasserwerte und Hinweise bleiben nur dort sichtbar, wo echte Daten vorliegen."
        icon="videocam-outline"
      />
      <StatusPanel
        tone={tone}
        icon="link-outline"
        code="LIVE-VERBINDUNG"
        title="NOCH NICHT VERBUNDEN"
        text="Es ist kein Smartgerät oder keine Kamera verbunden. BlackWaterLeaf zeigt keinen simulierten Live-Status."
      />
      <ActionGrid
        tone={tone}
        actions={[
          {
            title: "Kamera",
            note: "Herstellerverbindung abwarten",
            icon: "videocam-outline",
            image: ASSETS.aquarium,
            unavailable: true,
            onPress: () =>
              Alert.alert(
                "Noch nicht verbunden",
                "Eine Live-Kamera wird erst nach einer echten Geräteverbindung verfügbar."
              ),
          },
          {
            title: "Wasserwerte",
            note: aquarium ? "Privates Aquarium öffnen" : "Aquarium eintragen",
            icon: "flask-outline",
            image: ASSETS.aquarium,
            onPress: onPrivate,
          },
          {
            title: "Benachrichtigungen",
            note: "Kommentare und Kontohinweise öffnen",
            icon: "notifications-outline",
            image: ASSETS.aquarium,
            onPress: () => (token ? navigate("notifications") : onPrivate()),
          },
          {
            title: "Entdecken",
            note: "Weitere Welten öffnen",
            icon: "compass-outline",
            image: ASSETS.terrarium,
            onPress: () => navigate("explore"),
          },
        ]}
      />
      {!token ? (
        <StatusPanel
          tone={tone}
          icon="lock-closed-outline"
          code="PRIVAT / GESCHÜTZT"
          title="ANMELDUNG ERFORDERLICH"
          text="Private Wasserwerte werden erst nach sicherer Anmeldung geladen."
        />
      ) : null}
    </Page>
  );
}

function PhotoScreen({
  token,
  tone,
  onSignIn,
  onComplete,
  navigate,
}: {
  token: string | null;
  tone: Tone;
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
        onComplete={onComplete}
      />
    );
  return (
    <Page>
      <ReferenceHero
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
      <ActionGrid
        tone={tone}
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
    </Page>
  );
}

function PostScreen({
  token,
  tone,
  onSignIn,
  navigate,
}: {
  token: string | null;
  tone: Tone;
  onSignIn: () => Promise<void>;
  navigate: (screen: Screen) => void;
}) {
  const [content, setContent] = useState("");
  const [realm, setRealm] = useState<Realm>("botany");
  const [publishNow, setPublishNow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [ownPosts, setOwnPosts] = useState<OwnCommunityPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editVisibility, setEditVisibility] = useState<"private" | "public">("private");
  useEffect(() => {
    if (!token) return;
    void myCommunityPosts(token).then(setOwnPosts).catch(() => setOwnPosts([]));
  }, [token]);
  const save = async () => {
    if (!token || !content.trim() || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      if (publishNow)
        await setProfileConsent(token, {
          purpose: "community_publishing",
          policyVersion: "native-1.0.8",
          granted: true,
        });
      const draft = await createCommunityDraft(token, {
        content: content.trim(),
        realm,
      });
      if (publishNow)
        await publishCommunityDraft(token, { postId: Number(draft.id) });
      setContent("");
      setPublishNow(false);
      setOwnPosts(await myCommunityPosts(token));
      setStatus(
        publishNow
          ? "Beitrag öffentlich veröffentlicht."
          : "Privater Entwurf gespeichert."
      );
    } catch (cause) {
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
    setRealm(post.realm ?? "botany");
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
      setOwnPosts(await myCommunityPosts(token));
      setStatus("Beitrag aktualisiert.");
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Der Beitrag konnte nicht aktualisiert werden.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Page>
      <ReferenceHero
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
          {ownPosts.length ? <View style={styles.ownPosts}><Text style={[styles.chip, { color: tone.accent }]}>MEINE BEITRÄGE</Text>{ownPosts.slice(0, 8).map(post => <Pressable key={post.id} style={[styles.ownPost, { borderColor: `${tone.accent}55` }]} onPress={() => startPostEdit(post)}><View style={styles.flex}><Text style={[styles.ownPostStatus, { color: tone.accent }]}>{post.visibility === "public" ? "ÖFFENTLICH" : "PRIVAT"} · {post.realm ?? "ohne Bereich"}</Text><Text style={styles.ownPostText} numberOfLines={2}>{post.content}</Text></View><Ionicons name="create-outline" size={18} color={tone.accent} /></Pressable>)}</View> : null}
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
            {(["botany", "aquarium", "terrarium"] as Realm[]).map(item => (
              <Pressable
                key={item}
                onPress={() => setRealm(item)}
                style={({ pressed }) => [
                  styles.realmButton,
                  {
                    borderColor:
                      realm === item ? tone.accent : `${tone.accent}44`,
                    backgroundColor:
                      realm === item ? `${tone.accent}24` : "rgba(0,0,0,.18)",
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.realmText,
                    { color: realm === item ? c.text : c.muted },
                  ]}
                >
                  {item === "botany"
                    ? "BOTANIK"
                    : item === "aquarium"
                      ? "AQUARISTIK"
                      : "TERRARISTIK"}
                </Text>
              </Pressable>
            ))}
          </View>
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
            label={saving ? "WIRD GESPEICHERT …" : editingPostId !== null ? "ÄNDERUNG SPEICHERN" : publishNow ? "BEITRAG VERÖFFENTLICHEN" : "PRIVATEN ENTWURF SPEICHERN"}
            icon="send-outline"
            disabled={saving || !content.trim()}
            onPress={() => void (editingPostId !== null ? savePostEdit() : save())}
          />
          {status ? (
            <Text style={[styles.formMessage, { color: tone.accent }]}>
              {status}
            </Text>
          ) : null}
        </View>
      )}
      <ActionGrid
        tone={tone}
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
      <ReferenceHero
        tone={tone}
        eyebrow="WISSEN & EVIDENZ"
        title="WISSEN BRAUCHT QUELLEN."
        subtitle="Es erscheinen ausschließlich serverseitig veröffentlichte Inhalte mit Quellen."
        icon="book-outline"
      />
      <ActionGrid
        tone={tone}
        actions={[
          {
            title: "Quellen",
            note: "Quellenbelegte Inhalte",
            icon: "link-outline",
            image: ASSETS.botany,
            unavailable: true,
            onPress: () =>
              Alert.alert(
                "Quellen werden geladen",
                "Die veröffentlichten Quellen werden direkt unter den Referenzkarten angezeigt."
              ),
          },
          {
            title: "Naturwissen",
            note: "Veröffentlichte Artikel",
            icon: "book-outline",
            image: ASSETS.terrarium,
            unavailable: true,
            onPress: () =>
              Alert.alert(
                "Naturwissen wird geladen",
                "Die veröffentlichten Wissenseinträge werden direkt unter den Referenzkarten angezeigt."
              ),
          },
        ]}
      />
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
}: {
  tone: Tone;
  products: MarketplaceProduct[];
  state: State;
  error: string | null;
  refresh: () => Promise<void>;
}) {
  return (
    <Page refresh={refresh} refreshing={state === "loading"}>
      <ReferenceHero
        tone={tone}
        eyebrow="MARKTPLATZ"
        title="PARTNERANGEBOTE"
        subtitle="Externe Angebote autorisierter Partner. BlackWaterLeaf verarbeitet keine Zahlung, Bestellung oder Lieferung."
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
          Du wechselst bei einem Angebot direkt zur Seite des Partners. Preise
          und Verfügbarkeit stammen aus dessen veröffentlichtem Angebot.
        </Text>
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
          {products.map(product => (
            <ProductCard key={product.id} tone={tone} product={product} />
          ))}
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
}) {
  return (
    <Page refresh={refresh} refreshing={state === "loading"}>
      <ReferenceHero
        tone={tone}
        eyebrow="GEMEINSAM WACHSEN"
        title="COMMUNITY IN BEWEGUNG."
        subtitle="Echte Naturmomente von echten, aktiven Konten."
        icon="people-outline"
      />
      <ActionGrid
        tone={tone}
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
      {state === "loading" ? (
        <Loading tone={tone} />
      ) : state === "error" ? (
        <ErrorNotice text={error ?? "Feed konnte nicht geladen werden."} />
      ) : !posts.length ? (
        <StatusPanel
          tone={tone}
          icon="people-outline"
          code="FEED / LEER"
          title="NOCH KEINE ÖFFENTLICHEN BEITRÄGE"
          text="Es werden keine Community-Daten erfunden. Neue veröffentlichte Beiträge erscheinen automatisch."
          actionLabel={token ? "BEITRAG ERSTELLEN" : "SICHER ANMELDEN"}
          onAction={() => (token ? navigate("post") : void onSignIn())}
        />
      ) : (
        <View style={styles.stack}>
          {posts.map(post => (
            <PostCard
              key={post.id}
              tone={tone}
              post={post}
              isOwner={Boolean(account?.id && String(account.id) === String(post.author.id))}
              onEdit={() => navigate("post")}
              onDelete={async () => {
                if (!token) return;
                await deleteCommunityPost(token, Number(post.id));
                await refresh();
              }}
              token={token}
            />
          ))}
        </View>
      )}
    </Page>
  );
}

function CareScreen({ tone, token, tasks, plans, journal, state, error, refresh, onSignIn }: { tone: Tone; token: string | null; tasks: CareTask[]; plans: CarePlan[]; journal: CareJournalEntry[]; state: State; error: string | null; refresh: () => Promise<void>; onSignIn: () => Promise<void> }) {
  const [planTitle, setPlanTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [journalText, setJournalText] = useState("");
  const [realm, setRealm] = useState<CarePlan["realm"]>("botany");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>) => { setBusy(true); try { await action(); await refresh(); } catch (cause) { Alert.alert("Pflege konnte nicht gespeichert werden", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } finally { setBusy(false); } };
  const addPlan = () => { if (!token || !planTitle.trim()) return; void run(async () => { const plan = await careCreatePlan(token, { realm, title: planTitle.trim() }); setPlanTitle(""); setSelectedPlan(plan.id); }); };
  const addTask = () => { if (!token || !selectedPlan || !taskTitle.trim()) return; void run(async () => { await careCreateTask(token, { planId: selectedPlan, title: taskTitle.trim(), dueAt: new Date().toISOString() }); setTaskTitle(""); }); };
  const addEntry = () => { if (!token || !journalText.trim()) return; void run(async () => { await careAddJournal(token, { note: journalText.trim() }); setJournalText(""); }); };
  return <Page refresh={refresh} refreshing={state === "loading"}>
    <ReferenceHero tone={tone} eyebrow="PRIVATE CARE" title="HEUTE." subtitle="Eine klare Handlung nach der anderen. Pflege bleibt privat und nachvollziehbar." icon="leaf-outline" />
    {!token ? <PrivateFeature tone={tone} title="ANMELDUNG ERFORDERLICH" text="Deine Pflegepläne und Notizen werden nur im eigenen Konto gespeichert." onSignIn={onSignIn} /> : null}
    {error ? <ErrorNotice text={error} /> : null}
    <View style={styles.careSectionHeader}><Text style={[styles.eyebrow, { color: tone.accent }]}>JETZT</Text><Text style={styles.sectionTitle}>OFFENE AUFGABEN</Text><Text style={styles.careCount}>{tasks.filter(task => task.status === "open" || task.status === "snoozed").length}</Text></View>
    {tasks.filter(task => task.status === "open" || task.status === "snoozed").map(task => <View key={task.id} style={[styles.careTask, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Ionicons name="time-outline" size={19} color={tone.accent} /><View style={styles.careTaskCopy}><Text style={styles.cardTitle}>{task.title}</Text><Text style={styles.miniCopy}>{task.status === "snoozed" ? "verschoben" : "offen"}</Text></View><Pressable disabled={busy} onPress={() => token && void run(() => careUpdateTask(token, { taskId: Number(task.id), status: "done" }))} style={styles.careIconButton}><Ionicons name="checkmark" size={17} color={tone.accent} /></Pressable><Pressable disabled={busy} onPress={() => token && void run(() => careUpdateTask(token, { taskId: Number(task.id), status: "snoozed", reason: "Später" }))} style={styles.careIconButton}><Ionicons name="play-forward-outline" size={16} color={tone.accent} /></Pressable></View>)}
    {tasks.filter(task => task.status === "open" || task.status === "snoozed").length === 0 ? <Text style={styles.miniCopy}>Für heute ist nichts offen.</Text> : null}
    <View style={[styles.carePanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>PLAN</Text><Text style={styles.cardTitle}>PFLEGE ANLEGEN</Text><View style={styles.careRealmRow}>{(["botany", "aquarium", "terrarium"] as const).map(item => <Pressable key={item} onPress={() => setRealm(item)} style={[styles.careRealmChip, { borderColor: `${tone.accent}55`, backgroundColor: realm === item ? `${tone.accent}22` : "transparent" }]}><Text style={[styles.miniCopy, realm === item && { color: tone.accent }]}>{item === "botany" ? "Botanik" : item === "aquarium" ? "Aquaristik" : "Terraristik"}</Text></Pressable>)}</View><TextInput value={planTitle} onChangeText={setPlanTitle} placeholder="Planname, z. B. Morgenpflege" placeholderTextColor={c.muted} style={styles.careInput} /><PrimaryButton tone={tone} label={busy ? "SPEICHERN …" : "PLAN SPEICHERN"} icon="add" onPress={addPlan} />{plans.length ? <><Text style={[styles.eyebrow, { color: tone.accent }]}>AUFGABE FÜR PLAN</Text><View style={styles.careRealmRow}>{plans.map(plan => <Pressable key={plan.id} onPress={() => setSelectedPlan(plan.id)} style={[styles.careRealmChip, { borderColor: `${tone.accent}55`, backgroundColor: selectedPlan === plan.id ? `${tone.accent}22` : "transparent" }]}><Text style={styles.miniCopy}>{plan.title}</Text></Pressable>)}</View><TextInput value={taskTitle} onChangeText={setTaskTitle} placeholder="z. B. Feuchtigkeit prüfen" placeholderTextColor={c.muted} style={styles.careInput} /><SecondaryButton tone={tone} label={busy ? "SPEICHERN …" : "AUFGABE SPEICHERN"} icon="add" onPress={addTask} /></> : null}</View>
    <View style={[styles.carePanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.eyebrow, { color: tone.accent }]}>JOURNAL · PRIVAT</Text><Text style={styles.cardTitle}>PFLEGEMOMENT FESTHALTEN</Text><TextInput value={journalText} onChangeText={setJournalText} placeholder="Was hast du beobachtet oder verändert?" placeholderTextColor={c.muted} multiline style={[styles.careInput, styles.careInputLarge]} /><PrimaryButton tone={tone} label={busy ? "SPEICHERN …" : "JOURNAL SPEICHERN"} icon="book-outline" onPress={addEntry} />{journal.slice(0, 3).map(entry => <View key={entry.id} style={styles.careJournal}><Text style={[styles.date, { color: tone.accent }]}>{new Date(entry.observedAt).toLocaleDateString("de-DE")}</Text><Text style={styles.miniCopy}>{entry.note}</Text></View>)}</View>
  </Page>;
}

function NotificationsScreen({ tone, token, notifications, state, error, refresh, navigate }: { tone: Tone; token: string | null; notifications: NativeNotification[]; state: State; error: string | null; refresh: () => Promise<void>; navigate: (screen: Screen) => void }) {
  const markAllRead = async () => {
    if (!token) return;
    await markNotificationsRead(token);
    await refresh();
  };
  return <Page refresh={refresh} refreshing={state === "loading"}>
    <ReferenceHero tone={tone} eyebrow="PRIVAT · FEED" title="DEINE BENACHRICHTIGUNGEN." subtitle="Kommentare und wichtige Hinweise aus deinem BlackWaterLeaf-Konto." icon="notifications-outline" />
    <View style={styles.notificationActions}><SecondaryButton tone={tone} label="ALLE ALS GELESEN" icon="checkmark-done-outline" onPress={() => void markAllRead()} /></View>
    {state === "error" ? <ErrorNotice text={error ?? "Benachrichtigungen konnten nicht geladen werden."} /> : notifications.length ? <View style={styles.stack}>{notifications.map(item => <Pressable key={item.id} accessibilityLabel="Benachrichtigung öffnen" onPress={async () => { if (token && !item.isRead) await markNotificationsRead(token, item.id); if (item.postId) navigate("community"); await refresh(); }} style={[styles.notificationRow, { borderColor: `${tone.accent}55`, backgroundColor: item.isRead ? tone.panel : `${tone.accent}14` }]}><Ionicons name={item.type === "comment" ? "chatbubble-ellipses-outline" : "notifications-outline"} size={20} color={tone.accent} /><View style={styles.notificationCopy}><Text style={styles.cardTitle}>{item.actorName}</Text><Text style={styles.miniCopy}>{item.message}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleString("de-DE")}</Text></View>{!item.isRead ? <View style={[styles.unreadDot, { backgroundColor: tone.accent }]} /> : null}<Ionicons name="chevron-forward" size={17} color={c.muted} /></Pressable>)}</View> : <StatusPanel tone={tone} icon="notifications-outline" code="FEED / LEER" title="NOCH KEINE BENACHRICHTIGUNGEN" text="Neue Kommentare und Kontohinweise erscheinen hier." />}
  </Page>;
}

function ProfileScreen({
  tone,
  token,
  account,
  habitats,
  visibleKinds,
  menuTarget,
  onToggleVisibleKind,
  state,
  error,
  onSignIn,
  onSignOut,
  onUpdateProfile,
  onUploadAvatar,
  onCollection,
  navigate,
}: {
  tone: Tone;
  token: string | null;
  account: Account | null;
  habitats: Habitat[];
  visibleKinds: Array<"plant" | "aquarium" | "terrarium">;
  menuTarget: ProfileMenuTarget;
  onToggleVisibleKind: (kind: "plant" | "aquarium" | "terrarium") => void;
  state: State;
  error: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onUpdateProfile: (input: { name?: string | null; bio?: string | null }) => Promise<void>;
  onUploadAvatar: (base64: string, mimeType: string) => Promise<void>;
  onCollection: (realm: Realm) => void;
  navigate: (screen: Screen) => void;
}) {
  const [draftName, setDraftName] = useState(account?.name ?? "");
  const [draftBio, setDraftBio] = useState(account?.bio ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [ownPosts, setOwnPosts] = useState<OwnCommunityPost[]>([]);
  const [ownPostsRefreshing, setOwnPostsRefreshing] = useState(false);
  useEffect(() => { setDraftName(account?.name ?? ""); setDraftBio(account?.bio ?? ""); }, [account?.name, account?.bio]);
  useEffect(() => { if (token) void myCommunityPosts(token).then(setOwnPosts).catch(() => setOwnPosts([])); }, [token]);
  const refreshOwnPosts = async () => {
    if (!token) return;
    setOwnPostsRefreshing(true);
    try { setOwnPosts(await myCommunityPosts(token)); }
    finally { setOwnPostsRefreshing(false); }
  };
  const saveNativeProfile = async () => {
    setProfileSaving(true); setProfileMessage(null);
    try { await onUpdateProfile({ name: draftName.trim() || null, bio: draftBio.trim() || null }); setProfileMessage("Profil sicher gespeichert."); }
    catch (cause) { setProfileMessage(cause instanceof Error ? cause.message : "Profil konnte nicht gespeichert werden."); }
    finally { setProfileSaving(false); }
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
    <Page refresh={refreshOwnPosts} refreshing={ownPostsRefreshing}>
      {menuTarget !== "open" ? <View style={[styles.profileTargetPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}>
        <Text style={[styles.chip, { color: tone.accent }]}>PROFIL · ZIEL</Text>
        <Text style={styles.cardTitle}>{menuTarget === "edit" ? "NAME & PROFIL BEARBEITEN" : menuTarget === "avatar" ? "PROFILBILD BEARBEITEN" : menuTarget === "display" ? "ANLAGEN ANZEIGEN" : "WEITERE WERKZEUGE"}</Text>
        <Text style={styles.miniCopy}>{menuTarget === "display" ? "Die drei Anlagearten kannst du direkt darunter separat ein- oder ausblenden." : menuTarget === "tools" ? "Builder und Smart-Geräte bleiben aus dem Kernprofil heraus erreichbar." : "Dieses Ziel wurde über das Drei-Punkte-Menü geöffnet."}</Text>
        {menuTarget === "tools" ? <View style={styles.inlineButtons}><SecondaryButton tone={tone} label="HABITAT BUILDER" icon="construct-outline" onPress={() => navigate("builder")} /><SecondaryButton tone={tone} label="SMART-WERTE" icon="link-outline" onPress={() => Alert.alert("Smart-Werte verbinden", "Die Smart-Geräteauswahl wird in einem nächsten Native-Schritt ergänzt.")} /></View> : null}
        {menuTarget === "edit" || menuTarget === "avatar" ? <View style={styles.profileEditPanel}>
          {menuTarget === "avatar" ? <SecondaryButton tone={tone} label="PROFILBILD AUS GALERIE WÄHLEN" icon="image-outline" onPress={() => void chooseNativeAvatar()} disabled={profileSaving} /> : null}
          {menuTarget === "edit" ? <><TextInput value={draftName} onChangeText={setDraftName} placeholder="Anzeigename" placeholderTextColor={c.muted} style={styles.profileInput} maxLength={160} /><TextInput value={draftBio} onChangeText={setDraftBio} placeholder="Bio" placeholderTextColor={c.muted} style={[styles.profileInput, styles.profileBioInput]} multiline maxLength={2000} /><PrimaryButton tone={tone} label={profileSaving ? "SPEICHERN…" : "PROFIL SPEICHERN"} icon="save-outline" onPress={() => void saveNativeProfile()} disabled={profileSaving} /><SecondaryButton tone={tone} label="PROFILBILD WÄHLEN" icon="image-outline" onPress={() => void chooseNativeAvatar()} disabled={profileSaving} /></> : null}
          {profileMessage ? <Text style={styles.miniCopy}>{profileMessage}</Text> : null}
        </View> : null}
      </View> : null}
      <View
        style={[
          styles.profileFocus,
          { borderColor: `${tone.accent}66`, backgroundColor: tone.panel },
        ]}
      >
        <Text style={[styles.chip, { color: tone.accent }]}>DEIN KONTO</Text>
        <Text style={styles.heroTitle}>IDENTITÄT BLEIBT VERIFIZIERT.</Text>
        <Text style={styles.copy}>
          {account?.name ?? account?.username ?? "Konto wird geladen"}
        </Text>
        <Text style={styles.copy}>
          {account?.email ?? "E-Mail nicht verfügbar"} ·{" "}
          {account?.role ?? "Rolle wird geprüft"}
        </Text>
        <SecondaryButton
          tone={tone}
          label="ABMELDEN"
          icon="log-out-outline"
          onPress={() => void onSignOut()}
        />
      </View>
      {state === "error" ? (
        <ErrorNotice
          text={error ?? "Private Daten konnten nicht geladen werden."}
        />
      ) : null}
      <SectionLabel
        tone={tone}
        overline="PRIVAT / DEIN KONTO"
        title="EIGENE BEITRÄGE"
      />
      <View style={[styles.profilePostsPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}>
        {ownPosts.length ? ownPosts.slice(0, 12).map(post => <View key={post.id} style={styles.profilePostRow}><Text style={[styles.chip, { color: tone.accent }]}>{post.visibility === "public" ? "ÖFFENTLICH" : "PRIVAT"} · {post.realm ?? "OHNE BEREICH"}</Text><Text style={styles.realmText}>{post.content}</Text><Text style={styles.miniCopy}>{new Date(post.updatedAt).toLocaleDateString("de-DE")}</Text></View>) : <Text style={styles.miniCopy}>Noch keine eigenen Beiträge. Öffne Community, um deinen ersten Naturmoment zu erstellen.</Text>}
        <SecondaryButton tone={tone} label="BEITRAG ERSTELLEN" icon="create-outline" onPress={() => navigate("post")} />
      </View>
      <SectionLabel
        tone={tone}
        overline="PRIVAT / DEIN KONTO"
        title="DEINE ANLAGEN"
      />
      <View style={[styles.profileDisplayPanel, { borderColor: `${tone.accent}55`, backgroundColor: tone.panel }]}> 
        <Text style={[styles.chip, { color: tone.accent }]}>ANZEIGEN</Text>
        <Text style={styles.miniCopy}>Wähle, welche Anlagearten in deinem Profil erscheinen.</Text>
        <View style={styles.profileDisplayRow}>
          {([['plant', 'Pflanzen', 'leaf-outline'], ['aquarium', 'Aquarium', 'water-outline'], ['terrarium', 'Terraristik', 'bug-outline']] as const).map(([kind, label, icon]) => {
            const selected = visibleKinds.includes(kind);
            return <Pressable key={kind} onPress={() => onToggleVisibleKind(kind)} style={[styles.profileDisplayChoice, { borderColor: selected ? tone.accent : `${tone.accent}33`, backgroundColor: selected ? `${tone.accent}1c` : 'rgba(0,0,0,.14)' }]}><Ionicons name={icon} size={16} color={tone.accent} /><Text style={[styles.realmText, selected && { color: c.text }]}>{label}</Text><Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={tone.accent} /></Pressable>;
          })}
        </View>
      </View>
      <View style={styles.inlineButtons}>
        <SecondaryButton tone={tone} label="RANKING & CHALLENGES" icon="trophy-outline" onPress={() => navigate("ranking")} />
        <SecondaryButton tone={tone} label="GESPEICHERT" icon="bookmark-outline" onPress={() => navigate("saved")} />
      </View>
      <ActionGrid
        tone={tone}
        actions={([
          {
            title: "Pflanzen",
            note: `${habitats.filter(item => item.kind === "plant").length} private Anlagen`,
            icon: "leaf-outline",
            image: ASSETS.botany,
            onPress: () => onCollection("botany"),
          },
          {
            title: "Aquarien",
            note: `${habitats.filter(item => item.kind === "aquarium").length} private Anlagen`,
            icon: "fish-outline",
            image: ASSETS.aquarium,
            onPress: () => onCollection("aquarium"),
          },
          {
            title: "Terrarien",
            note: `${habitats.filter(item => item.kind === "terrarium").length} private Anlagen`,
            icon: "leaf-outline",
            image: ASSETS.terrarium,
            onPress: () => onCollection("terrarium"),
          },
          {
            title: "Freigaben",
            note: "KI und Medien kontrollieren",
            icon: "shield-checkmark-outline",
            image: ASSETS.ai,
            onPress: () => navigate("assistant"),
          },
        ] as Action[]).filter(action => action.title === "Pflanzen" ? visibleKinds.includes("plant") : action.title === "Aquarien" ? visibleKinds.includes("aquarium") : action.title === "Terrarien" ? visibleKinds.includes("terrarium") : false)}
      />
    </Page>
  );
}

function CollectionScreen({
  tone,
  token,
  habitats,
  initialRealm,
  onSignIn,
  onSaved,
}: {
  tone: Tone;
  token: string | null;
  habitats: Habitat[];
  initialRealm: Realm;
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
        onSaved={onSaved}
      />
    </View>
  );
}

function BuilderScreen({
  tone,
  token,
  account,
  habitats,
  onSignIn,
  onSaved,
}: {
  tone: Tone;
  token: string | null;
  account: Account | null;
  habitats: Habitat[];
  onSignIn: () => Promise<void>;
  onSaved: () => Promise<void>;
}) {
  if (!token)
    return (
      <Page>
        <PrivateFeature
          tone={tone}
          title="HABITAT BUILDER GESCHÜTZT."
          text="Der Builder ist ausschließlich für das serverseitig bestätigte Administratorkonto zugänglich."
          onSignIn={onSignIn}
        />
      </Page>
    );
  if (account?.role !== "admin")
    return (
      <Page>
        <StatusPanel
          tone={tone}
          icon="lock-closed-outline"
          code="BUILDER / GESCHÜTZT"
          title="KEINE ADMIN-FREIGABE"
          text="Dieser Bereich ist nur für die serverseitig bestätigte Rolle Admin verfügbar."
        />
      </Page>
    );
  return (
    <Page>
      <ReferenceHero
        tone={tone}
        eyebrow="ADMIN / HABITAT BUILDER"
        title="HABITAT PLANEN"
        subtitle="Abstrakte lokale Planungsmarker — keine Arten-, Produkt-, Statik- oder Elektrofreigabe."
        icon="construct-outline"
      />
      <NativePlanner tone={tone} />
      <View
        style={[
          styles.builderData,
          { borderColor: `${tone.accent}66`, backgroundColor: tone.panel },
        ]}
      >
        <Text style={[styles.chip, { color: tone.accent }]}>
          PRIVATE GRUNDLAGE
        </Text>
        <Text style={styles.cardTitle}>EIGENE ANLAGEN VERWALTEN</Text>
        <Text style={styles.copy}>
          Der Builder verwendet dieselben geschützten Anlagen wie die Web-App.
          Änderungen am Datenbestand erfolgen nur über die unten stehende
          private Anlagenverwaltung.
        </Text>
      </View>
      <HabitatManager token={token} habitats={habitats} onSaved={onSaved} />
    </Page>
  );
}

function SearchScreen({ tone, state, error, refresh, navigate, onOpenProfile, onOpenTaxon }: { tone: Tone; products: MarketplaceProduct[]; articles: KnowledgeArticle[]; state: State; error: string | null; refresh: () => Promise<void>; navigate: (screen: Screen) => void; onOpenProfile: (id: number) => void; onOpenTaxon: (id: number) => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<UnifiedSearchResult | null>(null);
  const [remoteState, setRemoteState] = useState<State>("ready");
  const normalized = term.trim();
  useEffect(() => {
    if (normalized.length < 2) { setResults(null); setRemoteState("ready"); return; }
    let active = true;
    setRemoteState("loading");
    const timer = setTimeout(() => { void unifiedSearch(normalized).then(value => { if (active) { setResults(value); setRemoteState("ready"); } }).catch(() => { if (active) setRemoteState("error"); }); }, 220);
    return () => { active = false; clearTimeout(timer); };
  }, [normalized]);
  const total = results ? results.taxa.length + results.knowledge.length + results.profiles.length + results.community.length + results.products.length : 0;
  const openTarget = (kind: string, id: string, destinationUrl?: string) => { if (kind === "profile") onOpenProfile(Number(id)); else if (kind === "plant") onOpenTaxon(Number(id)); else if (kind === "community") navigate("community"); else if (kind === "knowledge") navigate("knowledge"); else if (destinationUrl) void Linking.openURL(destinationUrl); };
  const card = (kind: string, id: string, title: string, note: string, meta: string, destinationUrl?: string) => <Pressable key={`${kind}-${id}`} onPress={() => openTarget(kind, id, destinationUrl)} style={({ pressed }) => [styles.searchResultCard, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }, pressed && styles.pressed]}><View style={[styles.searchResultIcon, { backgroundColor: `${tone.accent}18`, borderColor: `${tone.accent}44` }]}><Ionicons name={kind === "plant" ? "leaf-outline" : kind === "profile" ? "person-outline" : kind === "community" ? "chatbubble-ellipses-outline" : kind === "product" ? "bag-handle-outline" : "book-outline"} size={19} color={tone.accent} /></View><View style={styles.searchResultCopy}><Text style={styles.cardTitle} numberOfLines={1}>{title}</Text><Text style={styles.miniCopy} numberOfLines={2}>{note}</Text><Text style={[styles.chip, { color: tone.accent }]}>{meta}</Text></View><Ionicons name="chevron-forward" size={17} color={tone.accent} /></Pressable>;
  return <Page refresh={refresh} refreshing={state === "loading" || remoteState === "loading"}><ReferenceHero tone={tone} eyebrow="BLACKWATERLEAF · KATALOG" title="SUCHEN & ENTDECKEN" subtitle="Validierte Pflanzen, Wissen, Profile, Community und freigegebene Händler in einer Suche." icon="search-outline" /><TextInput style={[styles.searchInput, { borderColor: `${tone.accent}66` }]} value={term} onChangeText={setTerm} placeholder="Pflanze, Profil, Wissen oder Produkt suchen …" placeholderTextColor={c.muted} autoCapitalize="none" returnKeyType="search" />{remoteState === "loading" ? <Loading tone={tone} /> : remoteState === "error" ? <ErrorNotice text="Die Einheitssuche konnte nicht geladen werden." /> : normalized.length < 2 ? <StatusPanel tone={tone} icon="search-outline" code="SUCHE / BEREIT" title="WONACH SUCHST DU?" text="Gib mindestens zwei Zeichen ein. Es werden nur veröffentlichte und freigegebene Daten durchsucht." /> : !total || !results ? <StatusPanel tone={tone} icon="search-outline" code="SUCHE / LEER" title="KEINE PASSENDEN TREFFER" text="Für diesen Begriff gibt es aktuell keinen veröffentlichten Datensatz." /> : <View style={styles.stack}><Text style={[styles.chip, { color: tone.accent }]}>{total} TREFFER · ECHTE DATEN</Text>{results.taxa.map(item => card("plant", item.id, item.scientificName, item.acceptedScientificName ?? item.family ?? "Validierter Taxon-Datensatz", item.evidenceState))}{results.knowledge.map(item => card("knowledge", item.id, item.title, item.excerpt, item.realm ?? "Wissen"))}{results.profiles.map(item => card("profile", item.id, item.name ?? item.username ?? "BlackWaterLeaf-Nutzer", item.username ? `@${item.username}` : "Öffentliches Profil", "Profil"))}{results.community.map(item => card("community", item.id, item.realm ?? "Community", item.content, "Öffentlicher Beitrag"))}{results.products.map(item => card("product", item.id, item.title, item.partnerName ?? "Freigegebener Händler", item.priceLabel ?? "Marktplatz", item.destinationUrl))}</View>}</Page>;
}

function PublicProfileScreen({ tone, token, profileId, onBack, onSignIn }: { tone: Tone; token: string | null; profileId: number; onBack: () => void; onSignIn: () => Promise<void> }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [relationship, setRelationship] = useState<SocialRelationship | null>(null);
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; setState("loading"); void Promise.all([publicProfile(profileId), socialRelationship(token, profileId)]).then(([nextProfile, nextRelationship]) => { if (active) { setProfile(nextProfile); setRelationship(nextRelationship); setState(nextProfile ? "ready" : "error"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [profileId, token]);
  const toggleFollow = async () => { if (!token) { await onSignIn(); return; } setBusy(true); try { if (relationship?.isFollowing) await unfollowProfile(token, profileId); else await followProfile(token, profileId); setRelationship(await socialRelationship(token, profileId)); } catch (cause) { Alert.alert("Profilaktion nicht möglich", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } finally { setBusy(false); } };
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{state === "loading" ? <Loading tone={tone} /> : state === "error" || !profile ? <StatusPanel tone={tone} icon="person-outline" code="PROFIL / NICHT ÖFFENTLICH" title="PROFIL NICHT VERFÜGBAR" text="Dieses Profil ist nicht öffentlich oder wurde entfernt." /> : <><View style={[styles.publicProfileCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>{profile.avatarUrl ? <Image source={{ uri: profile.avatarUrl }} style={styles.publicAvatar} /> : <View style={[styles.publicAvatar, { backgroundColor: `${tone.accent}18`, borderColor: `${tone.accent}66` }]}><Ionicons name="person-outline" size={35} color={tone.accent} /></View>}<View style={styles.publicProfileCopy}><Text style={[styles.chip, { color: tone.accent }]}>ÖFFENTLICHES PROFIL</Text><Text style={styles.heroTitle} numberOfLines={2}>{profile.name ?? profile.username ?? "BlackWaterLeaf-Nutzer"}</Text><Text style={styles.miniCopy}>{profile.username ? `@${profile.username}` : ""}</Text>{profile.bio ? <Text style={styles.copy}>{profile.bio}</Text> : null}</View>{token ? <PrimaryButton tone={tone} label={relationship?.isFollowing ? "NICHT MEHR FOLGEN" : "FOLGEN"} icon={relationship?.isFollowing ? "person-remove-outline" : "person-add-outline"} onPress={() => void toggleFollow()} disabled={busy} /> : <SecondaryButton tone={tone} label="ANMELDEN" icon="log-in-outline" onPress={() => void onSignIn()} />}</View><View style={[styles.publicStats, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Stat label="FOLLOWER" value={String(relationship?.followers ?? "—")} tone={tone} /><Stat label="FOLGT" value={String(relationship?.following ?? "—")} tone={tone} /><Stat label="STATUS" value="ÖFFENTLICH" tone={tone} /></View><StatusPanel tone={tone} icon="shield-checkmark-outline" code="PRIVATSPHÄRE" title="ÖFFENTLICH, ABER KONTROLLIERT" text="Private Anlagen, Care-Daten und unveröffentlichte Beiträge bleiben geschützt." /></>}</Page>;
}

function TaxonScreen({ tone, token, taxonId, onBack }: { tone: Tone; token: string | null; taxonId: number; onBack: () => void }) {
  const [taxon, setTaxon] = useState<PublicPlantTaxon | null>(null);
  const [saved, setSaved] = useState(false);
  const [state, setState] = useState<State>("loading");
  useEffect(() => { let active = true; void publicPlantTaxon(taxonId).then(next => { if (active) { setTaxon(next); setState(next ? "ready" : "error"); } }).catch(() => { if (active) setState("error"); }); return () => { active = false; }; }, [taxonId]);
  useEffect(() => { if (!token) return; void savedItems(token).then(rows => setSaved(rows.some(item => item.targetType === "plant_taxon" && item.targetId === taxonId))).catch(() => undefined); }, [token, taxonId]);
  const toggleSave = async () => { if (!token || !taxon) return; try { if (saved) await unsaveItem(token, { targetType: "plant_taxon", targetId: taxonId }); else await saveItem(token, { targetType: "plant_taxon", targetId: taxonId }); setSaved(current => !current); } catch (cause) { Alert.alert("Speichern nicht möglich", cause instanceof Error ? cause.message : "Bitte später erneut versuchen."); } };
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{state === "loading" ? <Loading tone={tone} /> : state === "error" || !taxon ? <StatusPanel tone={tone} icon="leaf-outline" code="TAXON / NICHT VERÖFFENTLICHT" title="PFLANZE NICHT GEFUNDEN" text="Dieser Datensatz ist nicht veröffentlicht oder nicht vorhanden." /> : <><View style={[styles.taxonCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}>{taxon.imageUrl ? <Image source={{ uri: taxon.imageUrl }} style={styles.taxonImage} /> : <View style={[styles.taxonImage, { backgroundColor: `${tone.accent}18`, alignItems: "center", justifyContent: "center" }]}><Ionicons name="leaf-outline" size={35} color={tone.accent} /></View>}<Text style={[styles.chip, { color: tone.accent }]}>VALIDIERTER PFLANZENKATALOG</Text><Text style={styles.heroTitle}>{taxon.scientificName}</Text><Text style={styles.copy}>{taxon.acceptedScientificName && taxon.acceptedScientificName !== taxon.scientificName ? `Akzeptierter Name: ${taxon.acceptedScientificName}` : taxon.family ?? "Taxon-Datensatz"}</Text><Text style={styles.miniCopy}>{taxon.evidenceState} · {taxon.rank ?? "ohne Rang"}</Text>{token ? <SecondaryButton tone={tone} label={saved ? "GESPEICHERT" : "SPEICHERN"} icon="bookmark-outline" onPress={() => void toggleSave()} /> : null}</View><View style={[styles.profilePostsPanel, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.sectionTitle, { color: tone.accent }]}>KURZPROFIL</Text><Text style={styles.copy}>{taxon.summary ?? "Für diesen validierten Datensatz liegt noch keine Kurzbeschreibung vor."}</Text>{taxon.commonNames.length ? <Text style={styles.miniCopy}>GEBRÄUCHLICH: {taxon.commonNames.join(" · ")}</Text> : null}</View></>}</Page>;
}

function SavedScreen({ tone, token, onBack, onSignIn, navigate, onOpenProfile, onOpenTaxon }: { tone: Tone; token: string | null; onBack: () => void; onSignIn: () => Promise<void>; navigate: (screen: Screen) => void; onOpenProfile: (id: number) => void; onOpenTaxon: (id: number) => void }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [state, setState] = useState<State>(token ? "loading" : "ready");
  useEffect(() => { if (!token) return; setState("loading"); void savedItems(token).then(next => { setItems(next); setState("ready"); }).catch(() => setState("error")); }, [token]);
  const open = (item: SavedItem) => { if (item.targetType === "profile") onOpenProfile(item.targetId); else if (item.targetType === "plant_taxon") onOpenTaxon(item.targetId); else if (item.targetType === "knowledge") navigate("knowledge"); else if (item.targetType === "post") navigate("community"); else navigate("marketplace"); };
  const label: Record<SavedItem["targetType"], string> = { post: "COMMUNITY-BEITRAG", knowledge: "WISSENSARTIKEL", plant_taxon: "PFLANZENTAXON", product: "MARKTPLATZ-PRODUKT", profile: "PROFIL" };
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
  return <Page><SecondaryButton tone={tone} label="ZURÜCK" icon="arrow-back-outline" onPress={onBack} />{!token ? <PrivateFeature tone={tone} title="RANKING BLEIBT PRIVAT." text="Melde dich an, um deinen serverseitig berechneten Score und freigegebene Challenges zu sehen." onSignIn={onSignIn} /> : state === "loading" ? <Loading tone={tone} /> : state === "error" ? <ErrorNotice text="Rankingdaten konnten nicht geladen werden." /> : <><View style={[styles.rankingScoreCard, { borderColor: `${tone.accent}66`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>COMMUNITY · XP · FORTSCHRITT</Text><Text style={styles.heroTitle}>LEVEL {summary?.level ?? "—"}</Text><Text style={styles.copy}>{summary?.totalXp ?? "—"} XP GESAMT · SERVER-VERIFIZIERT</Text></View><SectionLabel tone={tone} overline="QUALITÄTSGEPRÜFTE EVENTS" title="CHALLENGES" />{!challenges.length ? <StatusPanel tone={tone} icon="trophy-outline" code="CHALLENGES / LEER" title="AKTUELL KEINE VERÖFFENTLICHT" text="Neue Challenges erscheinen erst nach Admin-Freigabe." /> : <View style={styles.stack}>{challenges.map(challenge => { const joined = progress.find(item => item.challengeId === challenge.id); return <View key={challenge.id} style={[styles.challengeCard, { borderColor: `${tone.accent}44`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>{challenge.realm ?? "ALLE BEREICHE"}</Text><Text style={styles.cardTitle}>{challenge.title}</Text><Text style={styles.miniCopy}>{challenge.description}</Text>{joined ? <Text style={[styles.chip, { color: tone.accent }]}>{joined.progress}% · {joined.status === "completed" ? "ABGESCHLOSSEN" : "TEILGENOMMEN"}</Text> : <SecondaryButton tone={tone} label="TEILNEHMEN" icon="add-circle-outline" onPress={() => void join(challenge.id)} />}</View>; })}</View>}<SectionLabel tone={tone} overline="ÖFFENTLICH · XP" title="BESTENLISTE" />{leaderboard.length ? <View style={styles.stack}>{leaderboard.slice(0, 10).map(row => <View key={row.userId} style={[styles.leaderboardRow, { borderColor: `${tone.accent}33`, backgroundColor: tone.panel }]}><Text style={[styles.chip, { color: tone.accent }]}>#{row.rank}</Text><Text style={styles.cardTitle}>{row.name}</Text><Text style={styles.miniCopy}>{row.totalXp} XP</Text></View>)}</View> : <Text style={styles.miniCopy}>Noch keine öffentliche XP-Bestenliste vorhanden.</Text>}</>}</Page>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return <View style={styles.stat}><Text style={[styles.statValue, { color: tone.accent }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function ReferenceHero({
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
      style={[styles.hero, { borderColor: `${tone.accent}99` }]}
      imageStyle={styles.heroImage}
    >
      <View style={styles.heroShade} />
      <View style={styles.heroCopy}>
        <View
          style={[
            styles.heroIcon,
            {
              borderColor: `${tone.accent}99`,
              backgroundColor: `${tone.accent}18`,
            },
          ]}
        >
          <Ionicons name={icon} size={24} color={tone.accent} />
        </View>
        <Text style={[styles.eyebrow, { color: tone.accent }]}>{eyebrow}</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroText}>{subtitle}</Text>
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

function ActionGrid({
  tone,
  actions,
  compact = false,
  activeTitle,
}: {
  tone: Tone;
  actions: Action[];
  compact?: boolean;
  activeTitle?: string;
}) {
  return (
    <View style={[styles.grid, compact && styles.gridCompact]}>
      {actions.map(action => (
        <ReferenceCard
          key={action.title}
          tone={tone}
          action={action}
          compact={compact}
          active={activeTitle === action.title.toUpperCase()}
        />
      ))}
    </View>
  );
}

function ReferenceCard({
  tone,
  action,
  compact = false,
  active = false,
}: {
  tone: Tone;
  action: Action;
  compact?: boolean;
  active?: boolean;
}) {
  const cardTone = action.area ? TONES[action.area] : tone;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${action.title}: ${action.note}`}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.referenceCard,
        compact && styles.referenceCardCompact,
        { borderColor: `${cardTone.accent}77`, backgroundColor: cardTone.panel },
        active && { borderColor: cardTone.accent },
        pressed && styles.pressed,
      ]}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        action.onPress();
      }}
    >
      <ImageBackground
        source={action.image}
        style={[styles.referenceImage, compact && styles.referenceImageCompact]}
        imageStyle={styles.referenceImageInner}
      >
        <View style={styles.cardShade} />
        <View
          style={[
            styles.referenceContent,
            compact && styles.referenceContentCompact,
          ]}
        >
          <View
            style={[
              styles.cardIcon,
              compact && styles.cardIconCompact,
              {
                borderColor: `${cardTone.accent}99`,
                backgroundColor: `${cardTone.accent}16`,
              },
            ]}
          >
            <Ionicons name={action.icon} size={20} color={cardTone.accent} />
          </View>
          <View style={styles.flex}>
            <Text
              style={[
                styles.referenceTitle,
                compact && styles.referenceTitleCompact,
              ]}
              numberOfLines={2}
            >
              {action.title}
            </Text>
            <Text
              style={[
                styles.referenceNote,
                compact && styles.referenceNoteCompact,
              ]}
              numberOfLines={2}
            >
              {action.note}
            </Text>
            {action.unavailable ? (
              <Text style={[styles.unavailableLabel, { color: cardTone.accent }]}>
                NOCH NICHT VERFÜGBAR
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={21} color={cardTone.accent} />
        </View>
      </ImageBackground>
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
}: {
  tone: Tone;
  product: MarketplaceProduct;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.productCard,
        { borderColor: `${tone.accent}77`, backgroundColor: tone.panel },
        pressed && styles.pressed,
      ]}
      onPress={() => void Linking.openURL(product.destinationUrl)}
    >
      <View style={styles.productImageFrame}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
          />
        ) : (
          <Ionicons name="cube-outline" color={tone.accent} size={26} />
        )}
      </View>
      <View style={styles.productBody}>
        <Text style={[styles.chip, { color: tone.accent }]}>
          {product.disclosureLabel} · {product.partnerName}
        </Text>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.productBottom}>
          <Text style={[styles.price, { color: c.champagne }]}>
            {product.priceLabel ?? "Preis beim Partner"}
          </Text>
          <Ionicons name="open-outline" color={tone.accent} size={18} />
        </View>
      </View>
    </Pressable>
  );
}

function PostCard({ tone, post, isOwner, onEdit, onDelete, token }: { tone: Tone; post: CommunityPost; isOwner: boolean; onEdit: () => void; onDelete: () => Promise<void>; token: string | null }) {
  const [actionPending, setActionPending] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [commentPending, setCommentPending] = useState(false);
  const loadComments = async () => setComments(await communityComments(Number(post.id)));
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
  return (
    <View
      style={[
        styles.infoCard,
        { borderColor: `${tone.accent}55`, backgroundColor: tone.panel },
      ]}
    >
      <View style={styles.postHead}>
        <View style={styles.postHeadCopy}>
          <Text style={styles.cardTitle}>
            {post.author.name ?? post.author.username ?? "Verifiziertes Konto"}
          </Text>
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
      {post.media[0] ? (
        <Image
          source={{ uri: post.media[0].accessUrl }}
          style={styles.postImage}
        />
      ) : null}
      <Text style={styles.date}>
        {post.likesCount} Likes · {post.commentsCount} Kommentare
      </Text>
      <Pressable style={styles.commentToggle} onPress={() => { setCommentsOpen(value => !value); if (!commentsOpen) void loadComments(); }}>
        <Ionicons name="chatbubble-outline" size={16} color={tone.accent} />
        <Text style={[styles.miniCopy, { color: tone.accent }]}>{post.commentsCount} KOMMENTARE</Text>
      </Pressable>
      {commentsOpen ? <View style={styles.commentPanel}>
        {comments.map(comment => <View key={comment.id} style={[styles.commentRow, comment.parentId ? styles.commentReplyRow : null]}><Text style={styles.commentAuthor}>{comment.authorName ?? comment.authorUsername ?? "Nutzer"}</Text><Text style={styles.miniCopy}>{comment.content}</Text>{!comment.parentId ? <Pressable onPress={() => setReplyTo(comment.id)}><Text style={[styles.commentReplyAction, { color: tone.accent }]}>ANTWORTEN</Text></Pressable> : null}</View>)}
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

function NativePlanner({ tone }: { tone: Tone }) {
  const tools: Array<{ id: string; title: string; icon: IconName }> = [
    { id: "plant", title: "Pflanze", icon: "leaf-outline" },
    { id: "stone", title: "Struktur", icon: "layers-outline" },
    { id: "water", title: "Wasser", icon: "water-outline" },
    { id: "light", title: "Licht", icon: "bulb-outline" },
  ];
  const [selected, setSelected] = useState(tools[0].id);
  const [markers, setMarkers] = useState<Array<{ id: string; tool: string }>>(
    []
  );
  const insert = () =>
    setMarkers(current => [
      ...current,
      { id: Crypto.randomUUID(), tool: selected },
    ]);
  return (
    <View
      style={[
        styles.planner,
        { borderColor: `${tone.accent}66`, backgroundColor: tone.panel },
      ]}
    >
      <Text style={[styles.chip, { color: tone.accent }]}>LOKALE PLANUNG</Text>
      <Text style={styles.cardTitle}>OBJEKTWERKZEUG WÄHLEN</Text>
      <View style={styles.plannerTools}>
        {tools.map(tool => (
          <Pressable
            key={tool.id}
            onPress={() => setSelected(tool.id)}
            style={({ pressed }) => [
              styles.plannerTool,
              {
                borderColor:
                  selected === tool.id ? tone.accent : `${tone.accent}44`,
                backgroundColor:
                  selected === tool.id ? `${tone.accent}23` : "rgba(0,0,0,.18)",
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name={tool.icon} size={18} color={tone.accent} />
            <Text style={styles.realmText}>{tool.title}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.planCanvas, { borderColor: `${tone.accent}66` }]}>
        <Text style={[styles.planCaption, { color: tone.accent }]}>
          BODENFLÄCHE · LOKALE PLANUNG
        </Text>
        <View style={styles.markerLine}>
          {markers.length ? (
            markers.map(marker => (
              <Pressable
                key={marker.id}
                onPress={() =>
                  setMarkers(current =>
                    current.filter(item => item.id !== marker.id)
                  )
                }
                style={[styles.marker, { borderColor: tone.accent }]}
              >
                <Ionicons name="close" size={14} color={tone.accent} />
              </Pressable>
            ))
          ) : (
            <Text style={styles.copy}>Noch keine Marker platziert.</Text>
          )}
        </View>
      </View>
      <View style={styles.inlineButtons}>
        <PrimaryButton
          tone={tone}
          label="ZENTRIERT EINFÜGEN"
          icon="add-outline"
          onPress={insert}
        />
        <SecondaryButton
          tone={tone}
          label="ALLES LÖSCHEN"
          icon="trash-outline"
          onPress={() => setMarkers([])}
        />
      </View>
      <Text style={styles.miniCopy}>
        Marker werden nur lokal für diesen Plan verwaltet. Antippen löscht einen
        Marker. Es handelt sich nicht um Arten-, Kauf- oder Bauvorgaben.
      </Text>
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
  );
}

function BottomNavigation({
  active,
  inset,
  showBuilder,
  onSelect,
}: {
  active: BottomTab;
  inset: number;
  showBuilder: boolean;
  onSelect: (screen: Screen) => void;
}) {
  const tabs: Array<{
    id: BottomTab;
    screen: Screen;
    label: string;
    icon: IconName;
    color: string;
  }> = [
    {
      id: "home",
      screen: "home",
      label: "Home",
      icon: "home-outline",
      color: c.botany,
    },
    {
      id: "explore",
      screen: "explore",
      label: "Entdecken",
      icon: "compass-outline",
      color: c.botany,
    },
    {
      id: "marketplace",
      screen: "marketplace",
      label: "Marktplatz",
      icon: "storefront-outline",
      color: c.market,
    },
    {
      id: "community",
      screen: "community",
      label: "Community",
      icon: "people-outline",
      color: c.botany,
    },
    {
      id: "profile",
      screen: "profile",
      label: "Profil",
      icon: "person-outline",
      color: c.botany,
    },
    ...(showBuilder
      ? [
          {
            id: "builder" as const,
            screen: "builder" as Screen,
            label: "Builder",
            icon: "construct-outline" as IconName,
            color: c.aqua,
          },
        ]
      : []),
  ];
  return (
    <View style={[styles.tabs, { bottom: Math.max(inset + 10, 16) }]}>
      {tabs.map(tab => (
        <Pressable
          key={tab.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === tab.id }}
          style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          onPress={() => onSelect(tab.screen)}
        >
          <Ionicons
            name={tab.icon}
            size={21}
            color={active === tab.id ? tab.color : c.muted}
          />
          <Text
            style={[styles.tabText, active === tab.id && { color: tab.color }]}
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
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    backgroundColor: "#020A05",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9, flex: 1 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#050807",
  },
  brandImage: { width: "100%", height: "100%" },
  brand: { color: c.text, fontSize: 14, fontWeight: "900", letterSpacing: 1.2 },
  technical: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.35,
    marginTop: 2,
  },
  headerActions: { flexDirection: "row", gap: 7 },
  nativeProfileMenu: { position: "absolute", top: 58, right: 12, zIndex: 30, width: 205, padding: 10, borderRadius: 12, borderWidth: 1, gap: 6 },
  nativeProfileMenuItem: { minHeight: 34, paddingHorizontal: 9, justifyContent: "center", borderRadius: 8, backgroundColor: "rgba(0,0,0,.18)" },
  headerAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(199,243,91,.25)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,.18)",
  },
  page: { padding: 16, paddingBottom: 118 },
  stack: { gap: 13 },
  flex: { flex: 1 },
  hero: {
    minHeight: 282,
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  homeHero: { minHeight: 300 },
  heroImage: { borderRadius: 21 },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 10, 5, .52)",
  },
  heroCopy: { padding: 19, gap: 7 },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  eyebrow: { fontSize: 9, letterSpacing: 1.45, fontWeight: "900" },
  heroTitle: {
    color: c.text,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  heroText: { color: c.text, fontSize: 14, lineHeight: 20, maxWidth: 330 },
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
  homeHeroActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  liveWorlds: { gap: 10 },
  inlineChoice: { padding: 11, borderRadius: 16, borderWidth: 1, gap: 9 },
  inlineChoiceHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  analysisLoading: {
    minHeight: 66,
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
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
  referenceCard: {
    width: "48.5%",
    minHeight: 176,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: c.surface,
  },
  referenceCardCompact: {
    minHeight: 84,
    borderRadius: 13,
  },
  referenceImage: { flex: 1, minHeight: 174, justifyContent: "flex-end" },
  referenceImageCompact: { minHeight: 82 },
  referenceImageInner: { borderRadius: 17 },
  cardShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, .48)",
  },
  referenceContent: {
    minHeight: 174,
    padding: 13,
    justifyContent: "flex-end",
    gap: 7,
  },
  referenceContentCompact: {
    minHeight: 82,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 7,
  },
  cardIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  cardIconCompact: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 0,
  },
  referenceTitle: {
    color: c.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
    paddingRight: 8,
  },
  referenceTitleCompact: { fontSize: 11, lineHeight: 13, paddingRight: 2 },
  referenceNote: {
    color: "#D4E1D6",
    fontSize: 10,
    lineHeight: 14,
    paddingRight: 4,
  },
  referenceNoteCompact: { fontSize: 8, lineHeight: 10, paddingRight: 0 },
  unavailableLabel: {
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
  workflow: { padding: 15, gap: 12, borderRadius: 18, borderWidth: 1 },
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
  postHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  postHeadCopy: { flex: 1, gap: 3 },
  postOwnerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  postOwnerButton: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: "rgba(199,243,91,.42)", backgroundColor: "rgba(8,37,20,.78)", alignItems: "center", justifyContent: "center" },
  postOwnerDelete: { borderColor: "rgba(255,171,176,.42)" },
  commentToggle: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 10, paddingVertical: 7 },
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
  date: { color: c.muted, fontSize: 9 },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: c.raised,
  },
  profileFocus: { padding: 18, borderRadius: 18, borderWidth: 1, gap: 7 },
  profilePostsPanel: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 8 },
  profilePostRow: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(199,243,91,.16)", backgroundColor: "rgba(0,0,0,.14)", gap: 4 },
  profileTargetPanel: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 7 },
  profileEditPanel: { gap: 8 },
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
  },
  realmText: { fontSize: 8, fontWeight: "900", textAlign: "center" },
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
  builderData: { padding: 14, gap: 7, borderRadius: 15, borderWidth: 1 },
  planner: { padding: 14, gap: 10, borderRadius: 16, borderWidth: 1 },
  plannerTools: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  planCaption: { fontSize: 8, fontWeight: "900", letterSpacing: 0.75 },
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
    backgroundColor: "rgba(0,0,0,.2)",
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
  },
  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabText: { color: c.muted, fontSize: 7, fontWeight: "800" },
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
  publicProfileCard: { padding: 16, borderRadius: 18, borderWidth: 1, gap: 8 },
  publicProfileCopy: { gap: 4 },
  publicAvatar: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  publicStats: { flexDirection: "row", justifyContent: "space-around", padding: 14, borderRadius: 14, borderWidth: 1 },
  stat: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 16, fontWeight: "900" },
  statLabel: { color: c.muted, fontSize: 8, fontWeight: "800" },
  taxonCard: { padding: 16, borderRadius: 18, borderWidth: 1, gap: 8 },
  taxonImage: { width: "100%", height: 180, borderRadius: 13, borderWidth: 1, borderColor: "rgba(199,243,91,.3)" },
  rankingScoreCard: { padding: 16, borderRadius: 18, borderWidth: 1, gap: 6 },
  challengeCard: { padding: 14, borderRadius: 15, borderWidth: 1, gap: 7 },
  leaderboardRow: { flexDirection: "row", alignItems: "center", gap: 9, padding: 11, borderRadius: 12, borderWidth: 1 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
