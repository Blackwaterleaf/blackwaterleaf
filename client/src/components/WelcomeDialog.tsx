import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n";
import { ArrowRight, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

const WELCOME_SEEN_KEY = "blackwaterleaf.welcome-dialog.v1";

export function WelcomeDialog() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(WELCOME_SEEN_KEY) === "1") return;
    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const close = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="welcome-dialog" aria-describedby="welcome-dialog-description">
        <div className="welcome-dialog__mark" aria-hidden="true"><Leaf size={22} /></div>
        <DialogHeader className="welcome-dialog__header">
          <span className="eyebrow">{t("welcome.eyebrow")}</span>
          <DialogTitle>{t("welcome.title")}</DialogTitle>
        </DialogHeader>
        <DialogDescription id="welcome-dialog-description" className="welcome-dialog__body">
          <span>{t("welcome.greeting")}</span>
          <span>{t("welcome.intro")}</span>
          <span>{t("welcome.project")}</span>
          <span>{t("welcome.closing")}</span>
        </DialogDescription>
        <DialogFooter className="welcome-dialog__footer">
          <DialogClose asChild>
            <button type="button" className="welcome-dialog__later">{locale === "de" ? "Später umsehen" : "Look around later"}</button>
          </DialogClose>
          <DialogClose asChild>
            <Link href="/explore" className="primary-action" onClick={() => close(false)}>{t("welcome.action")}<ArrowRight size={15} /></Link>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
