import { ExternalLink, ImageOff, Loader2, Maximize2, X, ZoomIn } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type TaxonImageModalProps = {
  scientificName: string;
  imageUrl: string;
  imageSourceUrl?: string | null;
  imageLicense?: string | null;
  imageAttribution?: string | null;
  category: "Pflanze" | "Fisch";
};

/**
 * Displays the verified original catalogue image in a keyboard-accessible
 * detail view. The local storage image remains primary; the source observation
 * and its attribution stay visibly attached to meet the catalogue provenance
 * policy.
 */
export function TaxonImageModal({
  scientificName,
  imageUrl,
  imageSourceUrl,
  imageLicense,
  imageAttribution,
  category,
}: TaxonImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  const close = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return <>
    {imageFailed ? <div className="plant-taxon-placeholder plant-taxon-placeholder--failed" role="img" aria-label={`Bild von ${scientificName} konnte nicht geladen werden`}><ImageOff size={38} /><span>Bild konnte nicht geladen werden</span><small>Der Bildnachweis bleibt erhalten; bitte später erneut versuchen.</small></div> : <button
      ref={triggerRef}
      type="button"
      className="taxon-image-trigger"
      aria-haspopup="dialog"
      aria-label={`Detailansicht des Bildes von ${scientificName} öffnen`}
      onClick={() => { setImageFailed(false); setImageLoaded(false); setIsOpen(true); }}
    >
      <img src={imageUrl} alt={scientificName} onError={() => setImageFailed(true)} />
      <span className="taxon-image-trigger__veil" aria-hidden="true"><ZoomIn size={18} /><span>DETAILANSICHT</span></span>
    </button>}

    {isOpen ? <div className="taxon-image-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <section ref={modalRef} className="taxon-image-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <header className="taxon-image-modal__header">
          <div><span className="eyebrow">{category.toUpperCase()} · HOCHAUFLÖSENDES KATALOGBILD</span><h2 id={titleId}>{scientificName}</h2></div>
          <button ref={closeRef} type="button" className="taxon-image-modal__close" onClick={close} aria-label="Bilddetailansicht schließen"><X size={21} /><span>SCHLIESSEN</span></button>
        </header>
        <figure className="taxon-image-modal__figure">
          <div className={`taxon-image-modal__stage${imageLoaded ? " is-loaded" : ""}`}>
            {!imageLoaded && !imageFailed ? <div className="taxon-image-modal__loading" role="status"><Loader2 size={24} className="spin" /><span>HOCHAUFLÖSENDES BILD WIRD GELADEN …</span></div> : null}
            {imageFailed ? <div className="taxon-image-modal__failed" role="img" aria-label={`Bild von ${scientificName} konnte nicht geladen werden`}><ImageOff size={34} /><strong>BILD NICHT VERFÜGBAR</strong><span>Der Bildnachweis bleibt erhalten.</span></div> : <img src={imageUrl} alt={`${scientificName} – verifiziertes Katalogbild in voller Ansicht`} onLoad={() => setImageLoaded(true)} onError={() => { setImageFailed(true); setImageLoaded(false); }} />}
          </div>
          <figcaption id={descriptionId}>
            <div><span>BILDNACHWEIS</span><strong>{imageAttribution ?? "Attribution hinterlegt"}</strong></div>
            {imageSourceUrl ? <a href={imageSourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} />Quellbeobachtung öffnen · {imageLicense ?? "Lizenzangabe"}</a> : <span className="taxon-image-modal__source-pending">Quellbeobachtung wird noch dokumentiert.</span>}
          </figcaption>
        </figure>
        <p className="taxon-image-modal__hint"><Maximize2 size={14} /> Originalbild lokal gespeichert · Vollansicht mit Escape oder außerhalb des Bildfensters schließen</p>
      </section>
    </div> : null}
  </>;
}
