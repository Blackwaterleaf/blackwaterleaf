import fs from "node:fs";

const file = "mobile-natur/App.tsx";
const source = fs.readFileSync(file, "utf8");
const startMarker = `      <View\n        style={[\n          styles.profileFocus,`;
const endMarker = `    </Page>\n  );\n}\n\nfunction CollectionScreen`;
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error("Native profile render markers not found");
const replacement = `      <View style={[styles.profileReferenceIdentity, { borderColor: \`\${tone.accent}66\`, backgroundColor: tone.panel }]}> 
        <View style={[styles.profileReferenceAvatar, { borderColor: \`\${tone.accent}88\`, backgroundColor: \`\${tone.accent}16\` }]}>
          {account?.avatarUrl ? <Image source={{ uri: account.avatarUrl }} style={styles.profileReferenceAvatarImage} /> : <Ionicons name="person-outline" size={27} color={tone.accent} />}
        </View>
        <View style={styles.profileReferenceIdentityCopy}>
          <Text style={[styles.eyebrow, { color: tone.accent }]}>BLACKWATERLEAF · PROFIL</Text>
          <Text style={styles.profileReferenceName}>{account?.name ?? account?.username ?? "BlackWaterLeaf"}</Text>
          <Text style={styles.miniCopy}>{account?.email ?? "@" + (account?.username ?? "blackwaterleaf")}</Text>
        </View>
        <Pressable accessibilityLabel="Profil bearbeiten" onPress={() => navigate("profile")} style={[styles.profileReferenceMore, { borderColor: \`\${tone.accent}55\` }]}>
          <Text style={[styles.profileReferenceMoreText, { color: tone.accent }]}>•••</Text>
        </Pressable>
        <View style={styles.profileReferenceStats}>
          <View style={styles.profileReferenceStat}><Ionicons name="trophy-outline" size={15} color={tone.accent} /><Text style={styles.profileReferenceStatValue}>{experience?.status === "ready" ? experience.totalXp : "—"}</Text><Text style={styles.profileReferenceStatLabel}>XP</Text></View>
          <View style={styles.profileReferenceStat}><Text style={styles.profileReferenceStatValue}>{experience?.status === "ready" ? experience.level : "—"}</Text><Text style={styles.profileReferenceStatLabel}>LEVEL</Text></View>
          <View style={styles.profileReferenceStat}><Text style={styles.profileReferenceStatValue}>{habitats.length}</Text><Text style={styles.profileReferenceStatLabel}>ANLAGEN</Text></View>
        </View>
      </View>
      <SectionLabel tone={tone} overline="PRIVATE SAMMLUNG" title="MEINE ANLAGEN & WERTE" />
      <Text style={styles.profileReferenceSubline}>Privat · Wähle direkt deinen Bereich</Text>
      <View style={styles.profileHabitatChoiceGridNative}>
        {([['plant', 'Botanik', 'Pflanzen-Anlagen', 'leaf-outline', 'botany'], ['aquarium', 'Aquaristik', 'Aquarien & Wasserwerte', 'fish-outline', 'aquarium'], ['terrarium', 'Terraristik', 'Terrarien & Pflege', 'bug-outline', 'terrarium']] as const).filter(([kind]) => visibleKinds.includes(kind)).map(([kind, label, note, icon, realm]) => (
          <Pressable key={kind} onPress={() => onCollection(realm)} style={({ pressed }) => [styles.profileHabitatChoiceNative, { borderColor: \`\${tone.accent}55\`, backgroundColor: tone.panel }, pressed && styles.pressed]}>
            <View style={[styles.profileHabitatChoiceIcon, { backgroundColor: \`\${tone.accent}16\`, borderColor: \`\${tone.accent}44\` }]}><Ionicons name={icon} size={19} color={tone.accent} /></View>
            <View style={styles.profileHabitatChoiceCopy}><Text style={styles.cardTitle}>{label}</Text><Text style={styles.miniCopy}>{note}</Text></View>
            <Ionicons name="chevron-forward" size={17} color={tone.accent} />
          </Pressable>
        ))}
      </View>
      <View style={[styles.profileReferencePostsPanel, { borderColor: \`\${tone.accent}55\`, backgroundColor: tone.panel }]}>
        <View style={styles.profileReferencePostsHeader}><View><Text style={[styles.eyebrow, { color: tone.accent }]}>MEIN BEREICH</Text><Text style={styles.sectionTitle}>EIGENE BEITRÄGE</Text></View><View style={styles.inlineButtons}><SecondaryButton tone={tone} label={ownPostsRefreshing ? "AKTUALISIERE …" : "AKTUALISIEREN"} icon="refresh-outline" onPress={() => void refreshOwnPosts()} disabled={ownPostsRefreshing} /><SecondaryButton tone={tone} label="POST" icon="camera-outline" onPress={() => navigate("post")} /></View></View>
        {ownPosts.length ? <View style={styles.stack}>{ownPosts.slice(0, 6).map(post => <Pressable key={post.id} onPress={() => navigate("community")} style={[styles.profilePostRow, { borderColor: \`\${tone.accent}33\`, backgroundColor: \`\${tone.accent}08\` }]}><Text style={[styles.chip, { color: tone.accent }]}>{post.visibility === "public" ? "ÖFFENTLICH" : "PRIVAT"} · {post.realm ?? "OHNE BEREICH"}</Text><Text style={styles.realmText} numberOfLines={3}>{post.content}</Text><Text style={styles.miniCopy}>{new Date(post.updatedAt).toLocaleDateString("de-DE")}</Text></Pressable>)}</View> : <Text style={styles.miniCopy}>Noch keine eigenen Beiträge.</Text>}
      </View>
      <SecondaryButton tone={tone} label="ABMELDEN" icon="log-out-outline" onPress={() => void onSignOut()} />
`;
fs.writeFileSync(file, source.slice(0, start) + replacement + source.slice(end));
console.log("Native profile block replaced");
