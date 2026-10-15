export type StudioProjectTemplate = {
  id: "web-starter" | "web-native-starter";
  name: string;
  description: string;
  target: "web" | "web_native";
  defaultPlatforms: string;
  files: Array<{ path: string; content: string }>;
};

export const PROJECT_TEMPLATES: StudioProjectTemplate[] = [
  {
    id: "web-starter",
    name: "Web Starter",
    description: "Responsive Web-App mit kontrolliertem Code-Workspace und Preview-Gate.",
    target: "web",
    defaultPlatforms: "Web",
    files: [
      { path: "README.md", content: "# Web Starter\n\nDieses Projekt wird versioniert und erst nach Preview-Freigabe veröffentlicht.\n" },
      { path: "src/App.tsx", content: "export default function App() {\n  return <main>Deine Studio-Web-App</main>;\n}\n" },
      { path: "docs/SECURITY.md", content: "# Sicherheitsnotizen\n\n- Keine Secrets im Workspace committen.\n- Preview und Staging bleiben approval-gated.\n- Externe Netzwerkzugriffe sind standardmäßig deaktiviert.\n" },
    ],
  },
  {
    id: "web-native-starter",
    name: "Web + Native Starter",
    description: "Gemeinsames Projektprofil für Web und Expo/React-Native-Lieferumfang.",
    target: "web_native",
    defaultPlatforms: "Web, Android, iOS",
    files: [
      { path: "README.md", content: "# Web + Native Starter\n\nWeb- und Mobile-Ziel werden über getrennte Clients und gemeinsame Verträge entwickelt.\n" },
      { path: "src/App.tsx", content: "export default function App() {\n  return <main>Deine Web-App</main>;\n}\n" },
      { path: "mobile/App.tsx", content: "export default function MobileApp() {\n  return null;\n}\n" },
      { path: "docs/SECURITY.md", content: "# Sicherheitsnotizen\n\n- Mobile Push-Tokens widerrufbar halten.\n- Preview und Staging bleiben approval-gated.\n- Keine Secrets im Client bündeln.\n" },
    ],
  },
];

export function getProjectTemplate(id: string | undefined, target: "web" | "web_native") {
  return PROJECT_TEMPLATES.find(template => template.id === id && template.target === target)
    ?? PROJECT_TEMPLATES.find(template => template.target === target)
    ?? PROJECT_TEMPLATES[0];
}
