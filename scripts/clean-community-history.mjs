import fs from "node:fs";

const file = "client/src/pages/Community.tsx";
let source = fs.readFileSync(file, "utf8");
source = source.replace(/\n  const myPosts = trpc\.community\.myPosts\.useQuery\([^\n]+\);/, "");
source = source.replace(/, utils\.community\.myPosts\.invalidate\(\)/g, "");
const start = source.indexOf("      {auth.isAuthenticated && myPosts.data?.length ? <section className=\"community-own-posts");
const end = source.indexOf("      {auth.isAuthenticated && composeOpen ?", start);
if (start < 0 || end < 0) throw new Error("Community own-post history block not found");
const replacement = `      {editingPostId ? <form className="community-edit community-edit--focused" onSubmit={saveEdit}><div className="form-heading"><div><span className="eyebrow">BEITRAG BEARBEITEN</span><h2>ÄNDERUNG SPEICHERN</h2></div><button type="button" className="secondary-action" onClick={() => setEditingPostId(null)}>ABBRECHEN</button></div><textarea required minLength={1} maxLength={10000} rows={4} value={editContent} onChange={event => setEditContent(event.target.value)} /><div className="form-grid"><label className="field"><span>Bereich</span><select value={editRealm} onChange={event => setEditRealm(event.target.value as typeof editRealm)}><option value="none">—</option><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label className="field"><span>Sichtbarkeit</span><select value={editVisibility} onChange={event => setEditVisibility(event.target.value as typeof editVisibility)}><option value="private">Privat</option><option value="public">Öffentlich</option></select></label></div><button type="submit" className="primary-action" disabled={updatePost.isPending}><SaveIcon />{updatePost.isPending ? t("common.loading") : "ÄNDERUNG SPEICHERN"}</button></form> : null}
`;
source = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(file, source);
console.log("Removed duplicate community post history and retained focused editing");
