import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Leaf,
  BookOpen,
  Users,
  Bot,
  Store,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import BottomNav from "./BottomNav";

const IMG_LOGO = "/manus-storage/logo-circle_c176197b.png";

const NAV_ITEMS = [
  { href: "/discover", label: "Entdecken", icon: Leaf },
  { href: "/knowledge", label: "Wissen", icon: BookOpen },
  { href: "/marketplace", label: "Markt", icon: Store },
  { href: "/ai", label: "KI", icon: Sparkles },
  { href: "/feed", label: "Community", icon: Users },
  { href: "/profile", label: "Profil", icon: User },
];

function TopNav() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(7,10,8,0.92)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderBottom: "1px solid rgba(45,107,63,0.25)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <img
            src={IMG_LOGO}
            alt="BlackwaterLeaf"
            className="w-9 h-9 rounded-full transition-transform duration-200 group-hover:scale-105"
            style={{ filter: "drop-shadow(0 0 8px rgba(45,155,110,0.40))" }}
          />
          <div className="hidden sm:block">
            <span
              className="font-brand text-base tracking-widest leading-none block"
              style={{ color: "#FFFFFF" }}
            >
              BLACKWATER<span style={{ color: "#2D9B6E" }}>LEAF</span>
            </span>
            <span
              className="text-[9px] tracking-[0.2em] uppercase block leading-none mt-0.5"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Community
            </span>
          </div>
        </Link>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <Link href="/discover">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg"
              style={{ color: "rgba(255,255,255,0.60)" }}
            >
              <Search className="w-4 h-4" />
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-lg"
                  style={{ color: "rgba(255,255,255,0.60)" }}
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </Link>

              {/* Avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none">
                    <Avatar className="w-8 h-8 ring-2 ring-primary/30">
                      <AvatarImage src={user?.avatarUrl ?? undefined} />
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{ background: "rgba(45,155,110,0.20)", color: "#34D399" }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium max-w-[100px] truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                      {user?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl"
                  style={{
                    background: "#111614",
                    border: "1px solid rgba(45,107,63,0.30)",
                  }}
                >
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Mein Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Einstellungen
                    </Link>
                  </DropdownMenuItem>
                  {(user?.role === "moderator" || user?.role === "admin") && (
                    <>
                      <DropdownMenuSeparator style={{ background: "rgba(45,107,63,0.30)" }} />
                      <DropdownMenuItem asChild>
                        <Link href="/moderator" className="flex items-center gap-2 cursor-pointer">
                          <Users className="w-4 h-4" />
                          Moderatoren-Dashboard
                        </Link>
                      </DropdownMenuItem>
                      {user?.role === "admin" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                              <Settings className="w-4 h-4" />
                              Admin-Panel
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/ai-review" className="flex items-center gap-2 cursor-pointer">
                              <Bot className="w-4 h-4" />
                              KI-Review
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator style={{ background: "rgba(45,107,63,0.30)" }} />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href={getLoginUrl()}>
              <Button size="sm" style={{ background: "#2D9B6E" }}>
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "#070A08" }}>
      <TopNav />
      <main className="pt-16 pb-24 px-4 max-w-[1400px] mx-auto">
        {children}
      </main>
      {isAuthenticated && <BottomNav />}
    </div>
  );
}
