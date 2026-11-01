import { useState, type PropsWithChildren } from "react";
import {
  Bell,
  BookOpen,
  Camera,
  Compass,
  Cpu,
  Leaf,
  Map,
  Search,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "@/styles/identification.css";
import "@/styles/identification-motion.css";

export function IdentificationShell({ children }: PropsWithChildren) {
  const [location] = useLocation();
  const [mapNotice, setMapNotice] = useState(false);
  const database = location.startsWith("/knowledge/");
  return (
    <div className="identification-shell">
      <header className="identification-header">
        <Link
          href="/"
          className="identification-brand"
          aria-label="Blackwaterleaf Startseite"
        >
          <span className="identification-brand__mark">
            <Leaf size={25} strokeWidth={1.4} />
          </span>
          <span>
            <strong>Blackwaterleaf</strong>
            <small>
              KI-Assistent / Artenbestimmung{database ? " · Datenbank" : ""}
            </small>
          </span>
        </Link>
        <nav
          className="identification-header__actions"
          aria-label="Schnellzugriff"
        >
          <Link href="/explore" aria-label="Suche">
            <Search />
          </Link>
          <Link href="/marketplace" aria-label="Marktplatz">
            <Store />
          </Link>
          <Link href="/community" aria-label="Community öffnen">
            <Bell />
          </Link>
          <Link href="/profile" aria-label="Profil">
            <UserRound />
          </Link>
        </nav>
      </header>
      <main className="identification-content">{children}</main>
      <nav className="identification-navigation" aria-label="Hauptnavigation">
        <Link href="/explore">
          <Compass />
          <span>Entdecke</span>
        </Link>
        <button type="button" onClick={() => setMapNotice(true)}>
          <Map />
          <span>Karte</span>
        </button>
        <Link href="/flow/foto">
          <Camera />
          <span>Erfasse</span>
        </Link>
        <Link
          href="/assistant"
          className={`identification-navigation__core ${!database ? "active" : ""}`}
          aria-current={!database ? "page" : undefined}
        >
          <span className="identification-navigation__orb">
            <Cpu />
          </span>
          <span>KI</span>
        </Link>
        <Link
          href="/knowledge"
          className={database ? "active" : ""}
          aria-current={database ? "page" : undefined}
        >
          <BookOpen />
          <span>Datenbank</span>
        </Link>
        <Link href="/community">
          <UsersRound />
          <span>Feed</span>
        </Link>
        <Link href="/profile">
          <UserRound />
          <span>Profil</span>
        </Link>
      </nav>
      <Dialog open={mapNotice} onOpenChange={setMapNotice}>
        <DialogContent className="identification-dialog">
          <DialogHeader>
            <DialogTitle>Karte</DialogTitle>
            <DialogDescription>
              Die Kartenansicht gehört nicht zum jetzt umgesetzten
              Artenbestimmungsbereich und ist in der bestehenden App noch nicht
              verfügbar. Es werden keine Fundorte erfunden.
            </DialogDescription>
          </DialogHeader>
          <Link className="identification-button" href="/explore">
            Entdecken öffnen
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  );
}
