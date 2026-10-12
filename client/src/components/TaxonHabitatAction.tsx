import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

type HabitatKind = "plant" | "aquarium" | "terrarium";

export function TaxonHabitatAction({ kind, name, scientificName }: { kind: HabitatKind; name: string; scientificName?: string | null }) {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const openPrefilledHabitat = () => {
    if (!auth.isAuthenticated) {
      setLocation("/login");
      return;
    }
    const params = new URLSearchParams({ kind, prefillName: name });
    if (scientificName) params.set("scientificName", scientificName);
    setLocation(`/profile/habitats?${params.toString()}`);
  };
  return <button type="button" className="secondary-action taxon-habitat-action" onClick={openPrefilledHabitat}><Plus size={14} />IN ANLAGE ÜBERNEHMEN</button>;
}
