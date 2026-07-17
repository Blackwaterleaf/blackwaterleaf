import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
  hoverable?: boolean;
  active?: boolean;
  reflex?: boolean;
  onClick?: () => void;
}

/**
 * GlassCard – Wiederverwendbare Glassmorphism-Card
 *
 * Regelwerk:
 *   background: rgba(0,0,0,0.4)
 *   backdrop-filter: blur(20px)
 *   border: 1px solid rgba(255,255,255,0.1)
 *   border-radius: 16px
 *
 * Hover: translateY(-2px) + weicher Schatten
 * Aktiv: Smaragd-Glow-Border
 */
export default function GlassCard({
  className,
  children,
  hoverable = false,
  active = false,
  reflex = false,
  onClick,
}: GlassCardProps) {
  const base = cn(
    "bwl-glass",
    reflex && "bwl-glass-reflex",
    active && "bwl-card-active",
    className
  );

  if (hoverable) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={base} onClick={onClick}>
      {children}
    </div>
  );
}
