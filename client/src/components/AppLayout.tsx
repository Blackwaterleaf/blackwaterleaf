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
import { startLogin } from "@/const";
import {
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Users,
  Bot,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import BottomNav from "./BottomNav";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const IMG_LOGO = "/manus-storage/logo-circle_c176197b.png";

/**
 * Top-Header
 * Regelwerk:
 *   - Logo "Blackwater Leaf" links
 *   - Suche, Benachrichtigungen, Profilbild rechts
 *   - Glassmorphism-Hintergrund
 *   - Sticky, blur-Effekt beim Scrollen (stärker bei scroll > 10px)
 */
function TopNav() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(0,0,0,0.75)"
          : "rgba(7,10,8,0.85)",
        backdropFilter: scrolled ? "blur(28px) saturate(1.8)" : "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: scrolled ? "blur(28px) saturate(1.8)" : "blur(20px) saturate(1.4)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: scrolled
          ? "0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(212,175,55,0.06)"
          : "0 1px 0 rgba(212,175,55,0.04)",
      }}
    >
      <div
        className="flex items-center justify-between gap-4"
        style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", height: 60 }}
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative">
            <img
              src={IMG_LOGO}
              alt="BlackwaterLeaf"
              className="w-8 h-8 rounded-full transition-transform duration-200 group-hover:scale-105"
              style={{ filter: "drop-shadow(0 0 8px rgba(45,155,110,0.45))" }}
            />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span
              className="font-brand text-sm tracking-widest"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              BLACKWATER<span style={{ color: "#2D9B6E" }}>LEAF</span>
            </span>
            <span
              className="text-[9px] tracking-[0.2em] uppercase mt-0.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Community
            </span>
          </div>
        </Link>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Suche */}
          <Link href="/discover">
            <motion.button
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 36,
                height: 36,
                color: "rgba(255,255,255,0.6)",
                background: "transparent",
              }}
              whileHover={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.9)",
              }}
              whileTap={{ scale: 0.92 }}
            >
              <Search className="w-4 h-4" />
            </motion.button>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Benachrichtigungen */}
              <Link href="/notifications">
                <motion.button
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: 36,
                    height: 36,
                    color: "rgba(255,255,255,0.6)",
                    background: "transparent",
                  }}
                  whileHover={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Bell className="w-4 h-4" />
                </motion.button>
              </Link>

              {/* Avatar-Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5"
                    style={{ background: "transparent" }}
                    whileHover={{ background: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar
                      className="w-7 h-7"
                      style={{
                        ring: "2px solid rgba(45,155,110,0.4)",
                        boxShadow: "0 0 0 2px rgba(45,155,110,0.35)",
                      }}
                    >
                      <AvatarImage src={user?.avatarUrl ?? undefined} />
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{
                          background: "rgba(45,155,110,0.20)",
                          color: "#2D9B6E",
                        }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="hidden md:block text-sm font-medium max-w-[100px] truncate"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      {user?.name}
                    </span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl"
                  style={{
                    background: "rgba(0,0,0,0.85)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
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
                      <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.08)" }} />
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
                  <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.08)" }} />
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
            <button onClick={() => startLogin()}>
              <motion.button
                className="px-4 py-1.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "#2D9B6E",
                  color: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(45,155,110,0.5)",
                }}
                whileHover={{
                  background: "#35b880",
                  boxShadow: "0 0 16px rgba(45,155,110,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </button>
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
      <main className="pt-16 bl-main-pad px-4" style={{ maxWidth: 1400, margin: "0 auto" }}>
        {children}
      </main>
      {isAuthenticated && <BottomNav />}
    </div>
  );
}
