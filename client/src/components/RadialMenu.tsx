import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Video,
  Camera,
  FileText,
  Leaf,
  Fish,
  Bug,
  Sparkles,
  Plus,
} from "lucide-react";

/**
 * RadialMenu – Zentraler Plus-Button mit radialem Menü
 * Regelwerk:
 *   - 7 Optionen im Kreis: Video, Foto, Beitrag, Pflanze, Fisch, Terrarium, KI fragen
 *   - Glassmorphism-Kreise für jede Option
 *   - Smooth open/close Animation (framer-motion)
 *   - Backdrop-Overlay beim Öffnen
 */

const MENU_ITEMS = [
  { label: "Video",     icon: Video,     href: "/feed",     angle: -90 },
  { label: "Foto",      icon: Camera,    href: "/feed",     angle: -30 },
  { label: "Beitrag",   icon: FileText,  href: "/feed",     angle: 30  },
  { label: "Pflanze",   icon: Leaf,      href: "/plants/new", angle: 90 },
  { label: "Fisch",     icon: Fish,      href: "/aquariums/new", angle: 150 },
  { label: "Terrarium", icon: Bug,       href: "/aquariums/new", angle: -150 },
  { label: "KI fragen", icon: Sparkles,  href: "/ai",       angle: -90 },
];

// Nur 6 um den Kreis + 1 oben (KI fragen)
const RADIAL_ITEMS = [
  { label: "Video",     icon: Video,     href: "/feed",         angle: -120 },
  { label: "Foto",      icon: Camera,    href: "/feed",         angle: -60  },
  { label: "Beitrag",   icon: FileText,  href: "/feed",         angle: 0    },
  { label: "Pflanze",   icon: Leaf,      href: "/plants/new",   angle: 60   },
  { label: "Fisch",     icon: Fish,      href: "/aquariums/new",angle: 120  },
  { label: "Terrarium", icon: Bug,       href: "/aquariums/new",angle: 180  },
  { label: "KI fragen", icon: Sparkles,  href: "/ai",           angle: -180 },
];

const RADIUS = 80; // px Abstand vom Zentrum

function angleToXY(angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: Math.cos(rad) * RADIUS,
    y: Math.sin(rad) * RADIUS,
  };
}

export default function RadialMenu() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleItemClick = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      {/* Backdrop-Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.55)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Radiale Optionen */}
      <div className="relative flex items-center justify-center" style={{ width: 64, height: 64, zIndex: 50 }}>
        <AnimatePresence>
          {open &&
            RADIAL_ITEMS.map((item, i) => {
              const { x, y } = angleToXY(item.angle);
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  className="absolute flex flex-col items-center justify-center gap-0.5"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    color: "#2D9B6E",
                    zIndex: 51,
                  }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, x, y: y - 32, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  transition={{
                    duration: 0.25,
                    delay: i * 0.04,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  onClick={() => handleItemClick(item.href)}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                  <span
                    className="text-[8px] font-medium leading-none"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
        </AnimatePresence>

        {/* Plus-Button */}
        <motion.button
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 52,
            height: 52,
            background: open
              ? "rgba(45,155,110,0.9)"
              : "linear-gradient(135deg, #2D9B6E, #1a6b4a)",
            border: "2px solid rgba(45,155,110,0.6)",
            boxShadow: open
              ? "0 0 24px rgba(45,155,110,0.6)"
              : "0 4px 16px rgba(45,155,110,0.3)",
            zIndex: 52,
          }}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.92 }}
        >
          {/* Wasser-Wellen-Effekt */}
          {open && (
            <>
              <motion.span
                className="absolute rounded-full"
                style={{ border: "1px solid rgba(45,155,110,0.5)" }}
                initial={{ width: 52, height: 52, opacity: 0.8 }}
                animate={{ width: 90, height: 90, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <motion.span
                className="absolute rounded-full"
                style={{ border: "1px solid rgba(45,155,110,0.3)" }}
                initial={{ width: 52, height: 52, opacity: 0.6 }}
                animate={{ width: 110, height: 110, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              />
            </>
          )}
          <Plus className="w-6 h-6" style={{ color: "#fff" }} strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
}
