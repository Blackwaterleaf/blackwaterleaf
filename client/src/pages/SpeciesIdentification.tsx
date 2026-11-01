import { useAuth } from "@/_core/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SpeciesIdentificationView,
  type SelectedImage,
} from "@/components/SpeciesIdentificationView";
import { startLogin } from "@/const";
import { readImageAsBase64 } from "@/lib/files";
import { trpc } from "@/lib/trpc";
import type {
  SpeciesIdentificationCandidate,
  SpeciesIdentificationResult,
} from "@shared/species-identification";
import { Camera, Images, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

const MAX_TOTAL_BYTES = 8 * 1024 * 1024;
const mimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const newId = () => crypto.randomUUID();
function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unbekannter Fehler";
  const known: Record<string, string> = {
    assistant_daily_limit_reached:
      "Dein Tageskontingent ist aufgebraucht. Morgen kannst du weitere Analysen starten.",
    ai_processing_consent_required:
      "Bitte erteile zuerst im Profil die Freigabe für KI-Verarbeitung.",
    database_unavailable:
      "Die Datenbank ist derzeit nicht erreichbar. Bitte versuche es später erneut.",
    assistant_request_replayed:
      "Diese Anfrage wurde schon verarbeitet. Starte bei Bedarf eine neue Analyse.",
  };
  return (
    known[message] ?? `Die Aktion konnte nicht abgeschlossen werden: ${message}`
  );
}

export default function SpeciesIdentification() {
  const auth = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const platform = trpc.platform.availability.useQuery(undefined, {
    retry: false,
  });
  const consents = trpc.profile.consents.useQuery(undefined, {
    enabled: auth.isAuthenticated,
    retry: false,
  });
  const quota = trpc.assistant.quota.useQuery(undefined, {
    enabled: auth.isAuthenticated,
    retry: false,
  });
  const identify = trpc.assistant.speciesIdentify.useMutation();
  const feedback = trpc.assistant.identificationFeedback.useMutation();
  const collection = trpc.observations.create.useMutation();
  const [images, setImages] = useState<SelectedImage[]>([]);
  const imageRef = useRef<SelectedImage[]>([]);
  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<SpeciesIdentificationResult | null>(
    null
  );
  const resultRef = useRef<SpeciesIdentificationResult | null>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [addCandidate, setAddCandidate] =
    useState<SpeciesIdentificationCandidate | null>(null);
  const addCandidateRef = useRef<SpeciesIdentificationCandidate | null>(null);
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());
  const [satisfied, setSatisfied] = useState<boolean | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const feedbackNoteRef = useRef("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const ownerRef = useRef(auth.user?.id);
  const identityEpochRef = useRef(0);
  const analysisEpochRef = useRef(0);
  const setActiveResult = (next: SpeciesIdentificationResult | null) => {
    resultRef.current = next;
    setResult(next);
  };
  const setActiveCandidate = (next: SpeciesIdentificationCandidate | null) => {
    addCandidateRef.current = next;
    setAddCandidate(next);
  };
  const setActiveFeedbackNote = (next: string) => {
    feedbackNoteRef.current = next;
    setFeedbackNote(next);
  };
  const hasCurrentIdentity = (ownerId: number, identityEpoch: number) =>
    ownerRef.current === ownerId && identityEpochRef.current === identityEpoch;
  const hasCurrentAnalysis = (
    ownerId: number,
    identityEpoch: number,
    analysisEpoch: number,
    usageId?: number
  ) =>
    hasCurrentIdentity(ownerId, identityEpoch) &&
    analysisEpochRef.current === analysisEpoch &&
    (usageId === undefined || resultRef.current?.usageId === usageId);
  const busy = reading || identify.isPending;
  const consent = Boolean(
    consents.data?.some(
      item => item.purpose === "ai_processing" && item.granted
    )
  );
  const remaining = auth.isAuthenticated
    ? (quota.data?.remaining ?? null)
    : null;
  const available =
    auth.isAuthenticated &&
    consent &&
    platform.data?.aiAssistant === "available";
  const ready =
    available &&
    images.length > 0 &&
    remaining !== null &&
    remaining > 0 &&
    !busy;

  useEffect(() => {
    imageRef.current = images;
  }, [images]);
  useEffect(
    () => () =>
      imageRef.current.forEach(image => URL.revokeObjectURL(image.url)),
    []
  );
  useEffect(() => {
    document.title = "Artenbestimmung · Blackwaterleaf KI";
  }, []);
  useEffect(
    () => () => {
      identityEpochRef.current += 1;
      analysisEpochRef.current += 1;
    },
    []
  );
  // Preserve a pre-login local draft, but clear any state that could belong to
  // an authenticated account as soon as the identity changes.
  useEffect(() => {
    const previousOwner = ownerRef.current;
    const nextOwner = auth.user?.id;
    if (previousOwner !== nextOwner) {
      identityEpochRef.current += 1;
      analysisEpochRef.current += 1;
      ownerRef.current = nextOwner;
      identify.reset();
      feedback.reset();
      collection.reset();
      setReading(false);
      resultRef.current = null;
      setResult(null);
      addCandidateRef.current = null;
      setAddCandidate(null);
      feedbackNoteRef.current = "";
      setFeedbackNote("");
      setSatisfied(null);
      setFeedbackSent(false);
      setAddedNames(new Set());
      setSourceOpen(false);
      setError(null);
      if (previousOwner === undefined) return;
      imageRef.current.forEach(image => URL.revokeObjectURL(image.url));
      imageRef.current = [];
      setImages([]);
      setSelected(0);
      setNote("");
    }
  }, [auth.user?.id]);

  const chooseImages = (files: FileList | null) => {
    if (!files?.length || busy) return;
    const incoming = Array.from(files);
    if (images.length + incoming.length > 3) {
      setError(
        "Du kannst maximal drei Bilder auswählen. Entferne zuerst ein Bild."
      );
      return;
    }
    if (incoming.some(file => !mimeTypes.has(file.type) || file.size <= 0)) {
      setError("Bitte wähle ein gültiges JPG-, PNG- oder WebP-Bild.");
      return;
    }
    if (
      [...images.map(image => image.file), ...incoming].reduce(
        (sum, file) => sum + file.size,
        0
      ) > MAX_TOTAL_BYTES
    ) {
      setError("Die drei Bilder dürfen zusammen maximal 8 MB groß sein.");
      return;
    }
    setError(null);
    setActiveResult(null);
    const added = incoming.map(file => ({
      id: newId(),
      file,
      url: URL.createObjectURL(file),
    }));
    setSelected(images.length);
    setImages(current => [...current, ...added]);
    setSourceOpen(false);
  };
  const removeImage = (index: number) => {
    if (busy || !images[index]) return;
    URL.revokeObjectURL(images[index].url);
    setImages(current =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
    setSelected(Math.max(0, Math.min(index, images.length - 2)));
    setError(null);
  };
  const analyze = async () => {
    if (!ready) return;
    const ownerId = auth.user?.id;
    if (!ownerId) return;
    const identityEpoch = identityEpochRef.current;
    const analysisEpoch = ++analysisEpochRef.current;
    setError(null);
    setReading(true);
    try {
      const encoded = await Promise.all(
        images.map(async image => {
          const read = await readImageAsBase64(image.file);
          return {
            imageBase64: read.base64,
            mimeType: read.mimeType as
              | "image/jpeg"
              | "image/png"
              | "image/webp",
          };
        })
      );
      if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch)) return;
      const response = await identify.mutateAsync({
        clientRequestId: newId(),
        images: encoded,
        note: note.trim() || undefined,
      });
      if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch)) return;
      setActiveResult(response);
      setSatisfied(null);
      setActiveFeedbackNote("");
      setFeedbackSent(false);
      setAddedNames(new Set());
      void utils.assistant.quota.invalidate();
      void utils.gamification.summary.invalidate();
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (reason) {
      if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch)) return;
      setError(readableError(reason));
      void utils.assistant.quota.invalidate();
    } finally {
      if (hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch)) {
        setReading(false);
      }
    }
  };
  const saveFeedback = async (rating?: boolean, sendNote = false) => {
    const activeResult = resultRef.current;
    if (!activeResult || feedback.isPending) return;
    const ownerId = auth.user?.id;
    if (!ownerId) return;
    const identityEpoch = identityEpochRef.current;
    const analysisEpoch = analysisEpochRef.current;
    const usageId = activeResult.usageId;
    const submittedRating = rating ?? satisfied ?? undefined;
    const submittedNote = feedbackNote;
    if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch, usageId)) {
      return;
    }
    setError(null);
    try {
      await feedback.mutateAsync({
        usageId,
        satisfied: submittedRating,
        ...(sendNote ? { note: submittedNote.trim() } : {}),
      });
      if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch, usageId)) {
        return;
      }
      if (rating !== undefined) setSatisfied(rating);
      if (sendNote && feedbackNoteRef.current === submittedNote) {
        setFeedbackSent(true);
      }
    } catch (reason) {
      if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch, usageId)) {
        return;
      }
      setError(readableError(reason));
    }
  };
  const saveCollection = async () => {
    const candidateAtSubmit = addCandidateRef.current;
    const activeResult = resultRef.current;
    if (!candidateAtSubmit || !activeResult || collection.isPending) return;
    const ownerId = auth.user?.id;
    if (!ownerId) return;
    const identityEpoch = identityEpochRef.current;
    const analysisEpoch = analysisEpochRef.current;
    const usageId = activeResult.usageId;
    const candidate = {
      realm: candidateAtSubmit.realm,
      commonNames: [...candidateAtSubmit.commonNames],
      scientificName: candidateAtSubmit.scientificName,
    };
    const collectionNote = note;
    if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch, usageId)) {
      return;
    }
    setError(null);
    try {
      await collection.mutateAsync({
        clientId: `identification:${usageId}:${candidate.scientificName}`.slice(
          0,
          128
        ),
        realm: candidate.realm,
        subject: (candidate.commonNames[0] || candidate.scientificName).slice(
          0,
          128
        ),
        scientificName: candidate.scientificName,
        note: `Unbestätigter KI-Vorschlag. ${collectionNote}`.slice(0, 2000),
        metrics: [],
        evidenceState: "unverified",
        visibility: "private",
      });
      if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch, usageId)) {
        return;
      }
      setAddedNames(
        current => new Set([...Array.from(current), candidate.scientificName])
      );
      if (addCandidateRef.current === candidateAtSubmit) {
        setActiveCandidate(null);
      }
      void utils.observations.mine.invalidate();
    } catch (reason) {
      if (!hasCurrentAnalysis(ownerId, identityEpoch, analysisEpoch, usageId)) {
        return;
      }
      setError(readableError(reason));
    }
  };
  const next = () => {
    analysisEpochRef.current += 1;
    feedback.reset();
    collection.reset();
    images.forEach(image => URL.revokeObjectURL(image.url));
    imageRef.current = [];
    setImages([]);
    setSelected(0);
    setNote("");
    setActiveResult(null);
    setError(null);
    setSourceOpen(false);
    setActiveCandidate(null);
    setSatisfied(null);
    setActiveFeedbackNote("");
    setFeedbackSent(false);
    setAddedNames(new Set());
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const status =
    auth.loading || platform.isLoading
      ? "KI-Verfügbarkeit wird geprüft …"
      : !auth.isAuthenticated
        ? "Melde dich an, um eine Analyse zu starten. Deine Bildauswahl bleibt bis dahin nur auf diesem Gerät."
        : platform.isError
          ? "Der KI-Status konnte nicht geladen werden. Es wird keine Scheinanalyse gestartet."
          : consents.isError
            ? "Deine KI-Freigabe konnte nicht geladen werden."
            : !consent
              ? "Für die Analyse ist deine Freigabe zur KI-Verarbeitung im Profil erforderlich."
              : platform.data?.aiAssistant !== "available"
                ? "Die KI ist momentan nicht verfügbar. Es werden keine Scheinantworten angezeigt."
                : quota.isError
                  ? "Dein Kontingent konnte nicht geladen werden."
                  : remaining === 0
                    ? "Dein Tageskontingent ist aufgebraucht."
                    : images.length === 0
                      ? "Wähle mindestens ein Bild aus, um die Analyse vorzubereiten."
                      : null;
  const statusAction =
    !auth.isAuthenticated && !auth.loading ? (
      <button type="button" onClick={startLogin}>
        Anmelden
      </button>
    ) : auth.isAuthenticated && !consent ? (
      <Link href="/profile">Freigabe im Profil verwalten</Link>
    ) : quota.isError ? (
      <button type="button" onClick={() => void quota.refetch()}>
        Kontingent erneut laden
      </button>
    ) : undefined;

  return (
    <>
      <SpeciesIdentificationView
        images={images}
        selected={selected}
        onSelect={setSelected}
        note={note}
        onNote={setNote}
        onChoose={() => setSourceOpen(true)}
        onDelete={removeImage}
        remaining={remaining}
        limit={quota.data?.limit ?? 10}
        quotaError={quota.isError}
        ready={ready}
        busy={busy}
        status={status}
        statusAction={statusAction}
        error={error}
        result={result}
        onAnalyze={() => void analyze()}
        onBack={() => {
          if (result) {
            analysisEpochRef.current += 1;
            feedback.reset();
            collection.reset();
            setActiveResult(null);
            setActiveCandidate(null);
            setError(null);
          } else navigate("/");
        }}
        onNext={next}
        onAdd={setActiveCandidate}
        addedNames={addedNames}
        satisfied={satisfied}
        onRate={rating => void saveFeedback(rating)}
        feedbackNote={feedbackNote}
        onFeedbackNote={value => {
          setActiveFeedbackNote(value);
          setFeedbackSent(false);
        }}
        onSendFeedback={() => void saveFeedback(undefined, true)}
        feedbackSent={feedbackSent}
        feedbackBusy={feedback.isPending}
      />
      <input
        ref={fileInput}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={event => {
          chooseImages(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={cameraInput}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={event => {
          chooseImages(event.target.files);
          event.target.value = "";
        }}
      />
      <Dialog open={sourceOpen} onOpenChange={setSourceOpen}>
        <DialogContent className="identification-dialog">
          <DialogHeader>
            <DialogTitle>Bild hinzufügen</DialogTitle>
            <DialogDescription>
              Wähle eigene Fotos aus oder nimm ein neues Bild auf. Maximal drei
              Bilder und insgesamt 8 MB. Die Bilder werden nicht automatisch
              gespeichert.
            </DialogDescription>
          </DialogHeader>
          <button
            type="button"
            className="identification-button"
            onClick={() => {
              setSourceOpen(false);
              fileInput.current?.click();
            }}
          >
            <Images size={20} />
            Aus Dateien auswählen
          </button>
          <button
            type="button"
            className="identification-button"
            onClick={() => {
              setSourceOpen(false);
              cameraInput.current?.click();
            }}
          >
            <Camera size={20} />
            Kamera verwenden
          </button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(addCandidate)}
        onOpenChange={open => {
          if (!open && !collection.isPending) setActiveCandidate(null);
        }}
      >
        <DialogContent className="identification-dialog">
          <DialogHeader>
            <DialogTitle>Zur Sammlung hinzufügen?</DialogTitle>
            <DialogDescription>
              Möchtest du {addCandidate?.scientificName} als private,
              unbestätigte Beobachtung zu deiner Sammlung hinzufügen? Die
              KI-Bestimmung bestätigt die Art nicht. Die ausgewählten Fotos
              werden dabei nicht gespeichert.
            </DialogDescription>
          </DialogHeader>
          <div className="identification-dialog-actions">
            <button
              type="button"
              className="identification-button"
              disabled={collection.isPending}
              onClick={() => setActiveCandidate(null)}
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="identification-button"
              disabled={collection.isPending}
              onClick={() => void saveCollection()}
            >
              {collection.isPending && <Loader2 className="spin" size={16} />}
              Hinzufügen
            </button>
          </div>
          {collection.isError && (
            <p className="identification-error" role="alert">
              {readableError(collection.error)}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
