import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Info,
  Loader2,
  Mail,
  Plus,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import type { SpeciesIdentificationCandidate } from "@shared/species-identification";

export type IdentificationCandidate = SpeciesIdentificationCandidate;
export type SelectedImage = { id: string; file: File; url: string };
export type IdentificationViewProps = {
  images: SelectedImage[];
  selected: number;
  onSelect: (index: number) => void;
  note: string;
  onNote: (note: string) => void;
  onChoose: () => void;
  onDelete: (index: number) => void;
  remaining: number | null;
  limit: number;
  quotaError: boolean;
  ready: boolean;
  busy: boolean;
  status: string | null;
  statusAction?: React.ReactNode;
  error: string | null;
  result: { candidates: IdentificationCandidate[]; disclaimer: string } | null;
  onAnalyze: () => void;
  onBack: () => void;
  onNext: () => void;
  onAdd: (candidate: IdentificationCandidate) => void;
  addedNames: Set<string>;
  satisfied: boolean | null;
  onRate: (satisfied: boolean) => void;
  feedbackNote: string;
  onFeedbackNote: (note: string) => void;
  onSendFeedback: () => void;
  feedbackSent: boolean;
  feedbackBusy: boolean;
};

function Quota({
  remaining,
  limit,
  quotaError,
}: Pick<IdentificationViewProps, "remaining" | "limit" | "quotaError">) {
  return (
    <span
      className="identification-quota"
      aria-label={
        remaining === null
          ? "Bestimmungskontingent nicht verfügbar"
          : `${remaining} von ${limit} Bestimmungen noch frei`
      }
      title={
        quotaError
          ? "Kontingent konnte nicht geladen werden"
          : "Heute noch freie Bestimmungen"
      }
    >
      <strong>{remaining ?? "—"}</strong>
      <span>/{limit}</span>
    </span>
  );
}
function ScanFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`identification-scan ${className}`}>
      <i />
      <i />
      <i />
      <i />
      {children}
    </div>
  );
}
function Information({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <motion.div
      className="identification-info__body"
      id="identification-information"
      initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={
        shouldReduceMotion
          ? { height: "auto", opacity: 1 }
          : { height: 0, opacity: 0 }
      }
      transition={{
        duration: shouldReduceMotion ? 0 : 0.24,
        ease: "easeOut",
      }}
      style={{ overflow: "hidden" }}
    >
      <h3>Bilder</h3>
      <p>
        Maximal drei Bilder bilden die Grundlage der Artenbestimmung. Achte
        darauf, dass die Bilder möglichst scharf und nicht verwackelt sind und
        die zu bestimmende Art in der Bildmitte liegt.
      </p>
      <p>
        Bei Pflanzen helfen Fotos von Blattoberseite, Blattunterseite und Stiel.
        Bei Tieren helfen Aufnahmen von der Seite und von vorne. Verschiedene
        Ansichten sind kein Muss, unterstützen aber die KI. Maximal 8 MB
        insgesamt · JPG, PNG oder WebP.
      </p>
      <h3>Bestimmungslimit</h3>
      <p>
        Pro Tag sind maximal zehn erfolgreiche KI-Anfragen kostenlos möglich.
        Die Zahl im Kreis zeigt dir, wie viele noch frei sind. Dein Konto und
        deine Freigaben verwaltest du im <Link href="/profile">Profil</Link>.
      </p>
      <h3>KI</h3>
      <p>
        Auch die KI kann Fehler machen. Ergebnisse sind Vorschläge und sollten
        überprüft werden. Die Übereinstimmung ist eine vorsichtige
        Modellschätzung, kein wissenschaftlich bestätigter Messwert. Deine
        Bilder werden nur für die Analyse verarbeitet und nicht automatisch
        gespeichert.
      </p>
      <h3>Fragen / Feedback</h3>
      <p>
        Mit deiner Bewertung und Anmerkung im Ergebnis hilfst du, die Bestimmung
        zu verbessern.{" "}
        <Link href="/profile/settings#profile-tools">
          Freigaben und Einstellungen
        </Link>{" "}
        · <Link href="/knowledge">Datenbank und Quellen</Link>
      </p>
    </motion.div>
  );
}

export function SpeciesIdentificationView(props: IdentificationViewProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [showResult, setShowResult] = useState(Boolean(props.result));
  const hasResult = Boolean(props.result);
  const transitioningToResult = hasResult && !showResult;
  const visibleResult = hasResult && showResult;
  useEffect(() => {
    if (!hasResult) {
      setShowResult(false);
      return;
    }
    if (shouldReduceMotion) {
      setShowResult(true);
      return;
    }
    const timer = window.setTimeout(() => setShowResult(true), 180);
    return () => window.clearTimeout(timer);
  }, [hasResult, shouldReduceMotion]);
  const selected = props.images[props.selected];
  const gallery = props.images.map((image, index) => ({ image, index }));
  if (gallery.length === 3) {
    const active = gallery.splice(props.selected, 1)[0];
    gallery.splice(1, 0, active);
  }
  const toggle = (name: string) =>
    setExpanded(current => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  const backButton = (
    <button
      type="button"
      className="identification-back"
      onClick={props.onBack}
      aria-label={
        props.result ? "Zurück zur Artenbestimmung" : "Zurück zur KI-Übersicht"
      }
    >
      <ArrowLeft />
    </button>
  );
  return (
    <section
      className={`identification-page ${visibleResult ? "identification-page--results" : ""}`}
      aria-label="KI-Artenbestimmung"
    >
      {!visibleResult && (
        <motion.div
          className="identification-banner"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
          animate={
            transitioningToResult
              ? { opacity: 0, y: -10, scale: 0.99 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 0.32,
            ease: "easeOut",
          }}
        >
          {backButton}
          <span className="identification-banner__label">
            <Camera size={14} />
            KI-Artenbestimmung
          </span>
          <img
            src="/identification/species-editorial-hero.webp"
            alt="Künstlerisches Naturmotiv mit Blatt, Farn und Fisch"
          />
          <div className="identification-banner__copy">
            <h1>Natur erkennen.</h1>
            <p>Pflanzen und Tiere. Mit einem neuen Blick.</p>
          </div>
        </motion.div>
      )}
      <motion.div
        className="identification-upload-panel"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={
          transitioningToResult
            ? { opacity: 0, y: -8, scale: 0.99 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{
          duration: shouldReduceMotion ? 0 : 0.22,
          ease: "easeOut",
        }}
      >
        <div
          className={`identification-photo ${visibleResult ? "identification-photo--gallery" : ""}`}
        >
          {visibleResult && backButton}
          <Quota {...props} />
          <span className="identification-photo__eyebrow">
            {visibleResult ? "ANALYSIERTE BILDER" : "DEINE BILDER"}
          </span>
          {visibleResult ? (
            <motion.div
              className="identification-gallery"
              initial={shouldReduceMotion ? false : { opacity: 0.72, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.28,
                ease: "easeOut",
              }}
            >
              {gallery.map(({ image, index }) => (
                <ScanFrame
                  key={image.id}
                  className={index === props.selected ? "is-selected" : ""}
                >
                  <button
                    type="button"
                    onClick={() => props.onSelect(index)}
                    aria-label={`Bild ${index + 1} anzeigen`}
                  >
                    <img
                      src={image.url}
                      alt={`Analysiertes Bild ${index + 1}`}
                    />
                  </button>
                </ScanFrame>
              ))}
            </motion.div>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {selected ? (
                <motion.div
                  key={selected.id}
                  className="identification-scan"
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 1.015 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.18,
                    ease: "easeOut",
                  }}
                >
                  <i />
                  <i />
                  <i />
                  <i />
                  <img
                    src={selected.url}
                    alt={`Ausgewähltes Bild ${props.selected + 1}`}
                  />
                </motion.div>
              ) : (
                <motion.button
                  key="choose-photo"
                  type="button"
                  className="identification-photo__choose"
                  onClick={props.onChoose}
                  aria-label="Bild aus Dateien oder Kamera hinzufügen"
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 1.015 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.18,
                    ease: "easeOut",
                  }}
                >
                  <ScanFrame>
                    <Camera size={76} strokeWidth={1} />
                    <Plus className="identification-photo__plus" size={24} />
                  </ScanFrame>
                </motion.button>
              )}
            </AnimatePresence>
          )}
          {!selected && !visibleResult && (
            <span className="identification-photo__hint">
              Bild auswählen oder aufnehmen
            </span>
          )}
        </div>
        {!visibleResult && (
          <>
            <div className="identification-thumbnails">
              <button
                type="button"
                className={`identification-thumbnail identification-trash ${dragOver ? "is-dragover" : ""}`}
                disabled={!props.images.length || props.busy}
                onClick={() => props.onDelete(props.selected)}
                aria-label="Ausgewähltes Bild löschen"
                onDragOver={event => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={event => {
                  event.preventDefault();
                  setDragOver(false);
                  const index = Number(
                    event.dataTransfer.getData(
                      "application/x-blackwaterleaf-image"
                    )
                  );
                  if (
                    Number.isInteger(index) &&
                    event.dataTransfer.types.includes(
                      "application/x-blackwaterleaf-image"
                    )
                  )
                    props.onDelete(index);
                }}
              >
                <Trash2 />
              </button>
              {[0, 1, 2].map(index => (
                <button
                  key={index}
                  type="button"
                  className={`identification-thumbnail ${index === props.selected && props.images[index] ? "is-selected" : ""}`}
                  disabled={!props.images[index] || props.busy}
                  onClick={() => props.onSelect(index)}
                  aria-label={`Bild ${index + 1}${props.images[index] ? " auswählen" : " nicht belegt"}`}
                  aria-pressed={Boolean(
                    props.images[index] && index === props.selected
                  )}
                  draggable={Boolean(props.images[index] && !props.busy)}
                  onDragStart={event =>
                    event.dataTransfer.setData(
                      "application/x-blackwaterleaf-image",
                      String(index)
                    )
                  }
                >
                  {props.images[index] ? (
                    <img
                      src={props.images[index].url}
                      alt={`Vorschau ${index + 1}`}
                    />
                  ) : (
                    <Camera strokeWidth={1.2} />
                  )}
                  <span>{index + 1}</span>
                </button>
              ))}
              <button
                type="button"
                className="identification-thumbnail"
                disabled={props.images.length >= 3 || props.busy}
                onClick={props.onChoose}
                aria-label="Weiteres Bild hinzufügen"
              >
                <Plus />
              </button>
              <small>{props.images.length}/3 Bilder</small>
            </div>
            <label className="identification-note">
              <span>Notizen für die KI:</span>
              <textarea
                rows={1}
                maxLength={500}
                value={props.note}
                onChange={event => props.onNote(event.target.value)}
                placeholder="Standort, Größe oder besondere Merkmale …"
                disabled={props.busy}
              />
            </label>
            <section className="identification-info">
              <button
                type="button"
                className="identification-info__toggle"
                onClick={() => setInfoOpen(!infoOpen)}
                aria-expanded={infoOpen}
                aria-controls="identification-information"
              >
                <span>
                  <Info />
                  Infos
                </span>
                {infoOpen ? <ChevronUp /> : <ChevronDown />}
              </button>
              <AnimatePresence initial={false}>
                {infoOpen && (
                  <Information shouldReduceMotion={shouldReduceMotion} />
                )}
              </AnimatePresence>
            </section>
          </>
        )}
      </motion.div>
      {visibleResult && props.result ? (
        <>
          <motion.h1
            className="identification-section-title"
            initial={shouldReduceMotion ? false : { opacity: 0.72, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.28,
              delay: shouldReduceMotion ? 0 : 0.05,
              ease: "easeOut",
            }}
          >
            Analyse-Ergebnis
          </motion.h1>
          <motion.div
            className="identification-results"
            initial={shouldReduceMotion ? false : { opacity: 0.72, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.28,
              delay: shouldReduceMotion ? 0 : 0.1,
              ease: "easeOut",
            }}
          >
            {props.result.candidates.length === 0 ? (
              <p className="identification-empty">
                Auf diesen Bildern konnte die KI keine ausreichend erkennbare
                Art vorschlagen. Versuche es mit schärferen Bildern aus anderen
                Blickwinkeln.
              </p>
            ) : (
              props.result.candidates.map((candidate, index) => (
                <motion.article
                  key={candidate.scientificName}
                  className={`identification-result ${expanded.has(candidate.scientificName) ? "is-expanded" : ""}`}
                  initial={shouldReduceMotion ? false : { opacity: 0.58, y: 9 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.28,
                    delay: shouldReduceMotion
                      ? 0
                      : 0.14 + Math.min(index, 2) * 0.055,
                    ease: "easeOut",
                  }}
                >
                  <div className="identification-result__summary">
                    <ScanFrame className="identification-result__image">
                      {props.images[0] ? (
                        <img
                          src={props.images[0].url}
                          alt="Dein analysiertes Foto – keine bestätigte Referenzaufnahme"
                        />
                      ) : (
                        <Camera />
                      )}
                    </ScanFrame>
                    <div className="identification-result__copy">
                      <Link
                        className="identification-scientific-name"
                        href={`/knowledge/species/${encodeURIComponent(candidate.scientificName)}`}
                      >
                        {candidate.scientificName}
                      </Link>
                      <p>
                        {candidate.commonNames.length
                          ? `(${candidate.commonNames.join(", ")})`
                          : "Keine Verkaufsnamen angegeben"}
                      </p>
                      <span className="identification-confidence">
                        {candidate.confidence === null
                          ? "Übereinstimmung nicht bestimmbar"
                          : `${candidate.confidence} % Übereinstimmung`}
                        {candidate.confidence !== null && (
                          <span
                            className="identification-confidence__meter"
                            aria-hidden="true"
                          >
                            <span
                              style={{ width: `${candidate.confidence}%` }}
                            />
                          </span>
                        )}
                        <small>Modellschätzung</small>
                      </span>
                    </div>
                    <div className="identification-result__controls">
                      <button
                        className="identification-add"
                        type="button"
                        onClick={() => props.onAdd(candidate)}
                        disabled={props.addedNames.has(
                          candidate.scientificName
                        )}
                        aria-label={`${candidate.scientificName} zur Sammlung hinzufügen`}
                      >
                        {props.addedNames.has(candidate.scientificName) ? (
                          <Check />
                        ) : (
                          <Plus />
                        )}
                      </button>
                      <button
                        type="button"
                        className="identification-result__expand"
                        onClick={() => toggle(candidate.scientificName)}
                        aria-expanded={expanded.has(candidate.scientificName)}
                        aria-controls={`candidate-features-${index}`}
                        aria-label={`Erkennungsmerkmale für ${candidate.scientificName} ${expanded.has(candidate.scientificName) ? "einklappen" : "ausklappen"}`}
                      >
                        {expanded.has(candidate.scientificName) ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded.has(candidate.scientificName) && (
                      <motion.div
                        className="identification-result__details"
                        id={`candidate-features-${index}`}
                        initial={
                          shouldReduceMotion ? false : { height: 0, opacity: 0 }
                        }
                        animate={{ height: "auto", opacity: 1 }}
                        exit={
                          shouldReduceMotion
                            ? { height: "auto", opacity: 1 }
                            : { height: 0, opacity: 0 }
                        }
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.24,
                          ease: "easeOut",
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        <h2>Erkennungsmerkmale:</h2>
                        {candidate.features.length ? (
                          <ul>
                            {candidate.features.map((feature, featureIndex) => (
                              <li key={featureIndex}>{feature}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>
                            Keine zusätzlichen Merkmale in dieser Analyse
                            angegeben.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              ))
            )}
          </motion.div>
          <motion.section
            className="identification-feedback"
            aria-label="Analyse-Zufriedenheit"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.28,
              delay: shouldReduceMotion ? 0 : 0.31,
              ease: "easeOut",
            }}
          >
            <div className="identification-feedback__rating">
              <h2>Analyse-Zufriedenheit:</h2>
              <div>
                <button
                  type="button"
                  aria-label="Mit der Analyse zufrieden"
                  aria-pressed={props.satisfied === true}
                  disabled={props.feedbackBusy}
                  onClick={() => props.onRate(true)}
                >
                  <ThumbsUp />
                </button>
                <button
                  type="button"
                  aria-label="Mit der Analyse unzufrieden"
                  aria-pressed={props.satisfied === false}
                  disabled={props.feedbackBusy}
                  onClick={() => props.onRate(false)}
                >
                  <ThumbsDown />
                </button>
              </div>
            </div>
            <label className="identification-feedback__note">
              <span className="sr-only">Anmerkung zur Analyse</span>
              <input
                value={props.feedbackNote}
                maxLength={1000}
                onChange={event => props.onFeedbackNote(event.target.value)}
                placeholder="Anmerkung …"
                disabled={props.feedbackBusy}
              />
              <button
                type="button"
                aria-label={
                  props.feedbackSent
                    ? "Anmerkung gespeichert"
                    : "Anmerkung senden"
                }
                disabled={
                  props.feedbackBusy ||
                  (!props.feedbackNote.trim() && props.satisfied === null)
                }
                onClick={props.onSendFeedback}
              >
                {props.feedbackBusy ? (
                  <Loader2 className="spin" />
                ) : props.feedbackSent ? (
                  <Mail />
                ) : (
                  <Send />
                )}
              </button>
            </label>
            {props.feedbackSent && (
              <p role="status">Feedback gespeichert. Danke!</p>
            )}
          </motion.section>
          <motion.button
            type="button"
            className="identification-button identification-next"
            onClick={props.onNext}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.28,
              delay: shouldReduceMotion ? 0 : 0.36,
              ease: "easeOut",
            }}
          >
            Nächste Analyse
          </motion.button>
          <p className="identification-disclaimer">{props.result.disclaimer}</p>
        </>
      ) : (
        <>
          <button
            type="button"
            className={`identification-button identification-start ${props.ready ? "is-ready" : ""}`}
            disabled={!props.ready || props.busy || transitioningToResult}
            onClick={props.onAnalyze}
          >
            {props.busy ? (
              <>
                <Loader2 className="spin" />
                Analyse läuft …
              </>
            ) : (
              "Analyse starten"
            )}
          </button>
          {props.status && (
            <div className="identification-status">
              <p role="status">{props.status}</p>
              {props.statusAction}
            </div>
          )}
        </>
      )}
      {props.error && (
        <p className="identification-error" role="alert">
          {props.error}
        </p>
      )}
    </section>
  );
}
