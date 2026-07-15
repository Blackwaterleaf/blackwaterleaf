/**
 * InfoTooltip – Mobile-kompatible Tooltip-Komponente.
 *
 * Auf Desktop: Hover öffnet den Tooltip (Radix UI).
 * Auf Mobile: Antippen öffnet/schließt den Tooltip (click-toggle).
 * Positionierung: "bottom" als Default verhindert Abschneidung am rechten Rand.
 * Breite: max-w-[240px] mit Zeilenumbruch (text-balance).
 */
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function InfoTooltip({ content, children, side = "bottom", className }: InfoTooltipProps) {
  const [open, setOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // On touch devices, toggle on tap
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  // Close when clicking outside
  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close, { once: true });
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger
          asChild
          onClick={handleClick}
          // Also open on focus (keyboard accessibility)
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          <span className={cn("cursor-help inline-flex", className)}>
            {children}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            avoidCollisions
            collisionPadding={12}
            className={cn(
              "z-[9999] max-w-[240px] rounded-lg px-3 py-2 text-xs leading-relaxed text-balance",
              "bg-[#1a2420] border border-[rgba(45,155,110,0.30)] text-white/90 shadow-lg",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2"
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[#1a2420]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
