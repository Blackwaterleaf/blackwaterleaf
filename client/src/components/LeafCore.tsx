import { Bot, Box, Camera, Fish, Leaf, MessageCircle, Plus, ScanLine, Sprout, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useI18n } from "@/i18n";

export function LeafCore() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const actions = [
    { label: t("leaf.photo"), href: "/flow/foto", icon: Camera },
    { label: t("leaf.observe"), href: "/flow/live", icon: ScanLine },
    { label: t("leaf.post"), href: "/flow/beitrag", icon: MessageCircle },
    { label: t("leaf.plant"), href: "/world/botany", icon: Sprout },
    { label: t("leaf.aquarium"), href: "/world/aquarium", icon: Fish },
    { label: "Terrarium", href: "/world/terrarium", icon: Box },
    { label: t("leaf.ask"), href: "/assistant", icon: Bot },
  ];

  return (
    <div className={`leaf-core ${open ? "is-open" : ""}`}>
      <div className="leaf-ripples" aria-hidden="true"><i /><i /><i /></div>
      <div className="radial-actions" aria-hidden={!open}>
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href} className="radial-action" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
              <span className="radial-action-icon"><Icon size={18} /></span>
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>
      <button type="button" className="leaf-trigger" aria-label={open ? t("leaf.close") : t("leaf.open")} aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <span className="leaf-trigger-glow" aria-hidden="true" />
        {open ? <X size={27} /> : <Leaf size={31} fill="currentColor" />}
        <span className="leaf-plus"><Plus size={11} /></span>
      </button>
    </div>
  );
}
