import { useState } from "react";
import { Award, ChevronRight, Globe2, Leaf, LockKeyhole, MoreHorizontal, Settings, ShieldCheck, Trophy, UserRound, Waves } from "lucide-react";

const menuItems = [
  ["Profil bearbeiten", "Name, Bio und Profilbild", UserRound],
  ["Meine Beiträge", "Eigene öffentliche und private Posts", Globe2],
  ["Meine Anlagen", "Aquarium, Botanik und Terraristik", Leaf],
  ["Ranking & Erfolge", "XP, Level, Streak und Abzeichen", Trophy],
  ["Privatsphäre", "Sichtbarkeit und Freigaben", LockKeyhole],
  ["Einstellungen", "Sprache, Einheiten und Benachrichtigungen", Settings],
] as const;

export default function ProfileMockup() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState("Beiträge");
  return <div className="profile-mockup reference-page reference-page--botany">
    <div className="profile-mockup__notice"><span>MOCKUP · NOCH NICHT IMPLEMENTIERT</span><b>Profil-Redesign zur Abstimmung</b></div>
    <main className="profile-mockup__content">
      <section className="profile-mockup__identity glass-panel"><div className="profile-mockup__avatar"><UserRound size={42} /></div><div className="profile-mockup__person"><span className="eyebrow">BLACKWATERLEAF · PROFIL</span><h1>Dein Anzeigename</h1><p>@deinname · deine Bio steht hier</p></div><button className="profile-mockup__more" aria-label="Weitere Profilaktionen"><MoreHorizontal /></button></section>
      <nav className="profile-mockup__tabs" aria-label="Profilbereiche">{["Beiträge", "Anlagen", "Ranking"].map(item => <button key={item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>{item}</button>)}</nav>
      {tab === "Beiträge" && <section className="profile-mockup__panel glass-panel"><div className="profile-mockup__section-heading"><div><span className="eyebrow">MEIN BEREICH</span><h2>EIGENE BEITRÄGE</h2></div><button className="secondary-action">+ POST</button></div><div className="profile-mockup__post-grid"><article><div className="profile-mockup__post-image"><Leaf /></div><strong>Botanik · Öffentlich</strong><small>Dein Naturmoment</small><button className="profile-mockup__post-menu">•••</button></article><article><div className="profile-mockup__post-image profile-mockup__post-image--aqua"><Waves /></div><strong>Aquaristik · Privat</strong><small>Deine Anlage</small><button className="profile-mockup__post-menu">•••</button></article></div></section>}
      {tab === "Anlagen" && <section className="profile-mockup__panel glass-panel"><div className="profile-mockup__section-heading"><div><span className="eyebrow">PRIVATE SAMMLUNG</span><h2>MEINE ANLAGEN & WERTE</h2><p className="profile-mockup__subline">Privat · Wähle direkt deinen Bereich</p></div><button className="secondary-action">+ ANLEGEN</button></div><div className="profile-mockup__habitat-grid"><button><Leaf /><b>Botanik</b><small>Pflanzen-Anlagen</small><ChevronRight /></button><button><Waves /><b>Aquaristik</b><small>Aquarien & Wasserwerte</small><ChevronRight /></button><button><Globe2 /><b>Terraristik</b><small>Terrarien & Pflege</small><ChevronRight /></button></div></section>}
      {tab === "Ranking" && <section className="profile-mockup__panel glass-panel"><div className="profile-mockup__level"><Award /><div><span>LEVEL 3 · SAMMLER</span><strong>340 XP</strong><small>Dein persönlicher Score · Ranking öffnen</small></div><ChevronRight /></div><div className="profile-mockup__stats"><div><b>2</b><small>Streak</small></div><div><b>6</b><small>Abzeichen</small></div><div><b>340</b><small>Punkte</small></div></div></section>}
      <div className="profile-mockup__privacy"><ShieldCheck size={15} /><span>Privat zuerst · Du entscheidest, welche Bereiche öffentlich erscheinen.</span></div>
    </main>
    {menuOpen && <aside className="profile-mockup__drawer"><div className="profile-mockup__drawer-head"><div><span className="eyebrow">PROFILMENÜ</span><h2>MEIN BEREICH</h2></div><button onClick={() => setMenuOpen(false)}>×</button></div>{menuItems.map(([label, note, Icon]) => <button key={label} className="profile-mockup__menu-item"><Icon size={18} /><span><b>{label}</b><small>{note}</small></span><ChevronRight size={15} /></button>)}<button className="profile-mockup__menu-item profile-mockup__menu-item--secondary"><Settings size={18} /><span><b>Hilfe & Sicherheit</b><small>Kontosicherheit und Unterstützung</small></span><ChevronRight size={15} /></button></aside>}
  </div>;
}

export function ProfileSettingsMockup() {
  return <div className="profile-mockup reference-page reference-page--botany"><main className="profile-mockup__content profile-settings-mockup"><div className="profile-mockup__settings-back">‹ Profil</div><section className="profile-mockup__settings-title"><span className="eyebrow">PROFIL · EINSTELLUNGEN</span><h1>EINSTELLUNGEN</h1><p>Verwalte dein Konto, deine Privatsphäre und deine BlackWaterLeaf-Bereiche.</p></section><section className="profile-mockup__drawer profile-mockup__drawer--static"><div className="profile-mockup__drawer-head"><div><span className="eyebrow">MEIN BEREICH</span><h2>PROFIL VERWALTEN</h2></div><Settings size={22} /></div>{menuItems.map(([label, note, Icon]) => <button key={label} className="profile-mockup__menu-item"><Icon size={18} /><span><b>{label}</b><small>{note}</small></span><ChevronRight size={15} /></button>)}<button className="profile-mockup__menu-item profile-mockup__menu-item--secondary"><ShieldCheck size={18} /><span><b>Hilfe & Sicherheit</b><small>Kontosicherheit und Unterstützung</small></span><ChevronRight size={15} /></button></section></main></div>;
}
