"use client";

import { useState } from "react";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DataBackupPage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const exportAllData = trpc.export.exportAllUserData.useQuery();
  const exportCSV = trpc.export.exportUserDataAsCSV.useQuery();
  const userInfo = trpc.export.getAllUserInfo.useQuery();
  const importData = trpc.import.importUserData.useMutation();

  const handleExportJSON = async () => {
    setExportLoading(true);
    try {
      const data = await exportAllData.refetch();
      if (data.data) {
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        element.href = URL.createObjectURL(file);
        element.download = `blackwaterleaf_backup_${userInfo.data?.username || "backup"}_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setMessage({ type: "success", text: "✅ Backup erfolgreich heruntergeladen!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: `❌ Export fehlgeschlagen: ${error}` });
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportJSON = async (file: File) => {
    setImportLoading(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      await importData.mutateAsync({ backupData });
      setMessage({ type: "success", text: "✅ Daten erfolgreich wiederhergestellt!" });
    } catch (error) {
      setMessage({ type: "error", text: `❌ Import fehlgeschlagen: ${error}` });
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📊 Datensicherung & Wiederherstellung</h1>
        <p className="text-gray-500 mt-2">Sichere alle deine BlackwaterLeaf-Daten und stelle sie später wieder her</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* User Info Card */}
      {userInfo.data && (
        <Card>
          <CardHeader>
            <CardTitle>👤 Dein Konto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Benutzername:</strong> {userInfo.data.username || "Nicht gesetzt"}
            </p>
            <p>
              <strong>E-Mail:</strong> {userInfo.data.email || "Nicht gesetzt"}
            </p>
            <p>
              <strong>Name:</strong> {userInfo.data.name || "Nicht gesetzt"}
            </p>
            <p>
              <strong>Beigetreten:</strong> {new Date(userInfo.data.joinDate).toLocaleDateString("de-DE")}
            </p>
            <p>
              <strong>Status:</strong> {userInfo.data.accountStatus}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            📥 Daten Exportieren
          </CardTitle>
          <CardDescription>Lade alle deine Daten als Backup herunter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleExportJSON}
            disabled={exportLoading}
            className="w-full"
            size="lg"
          >
            {exportLoading ? "Wird exportiert..." : "📄 Als JSON Exportieren (Vollständig)"}
          </Button>

          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p>
              <strong>JSON-Export beinhaltet:</strong>
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Komplettes Profil & Einstellungen</li>
              <li>Alle Pflanzen & Aquarien</li>
              <li>Alle Beiträge, Kommentare & Likes</li>
              <li>Nachrichten & Unterhaltungen</li>
              <li>KI-Chat-Verlauf</li>
              <li>Statistiken & Erfolge</li>
              <li>Alle Metadaten und Zeitstempel</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Import Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            📤 Daten Importieren
          </CardTitle>
          <CardDescription>Stelle deine Daten aus einem vorherigen Backup wieder her</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <div className="text-center">
              <p className="font-semibold">Klick zum Auswählen oder Datei hier ablegen</p>
              <p className="text-sm text-gray-500">Nur .json Dateien akzeptiert</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImportJSON(e.target.files[0]);
                }
              }}
              disabled={importLoading}
              className="hidden"
            />
          </label>

          <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 mt-4">
            <p>
              <strong>⚠️ Wichtig:</strong> Der Import erstellt neue Einträge. Bereits vorhandene Daten werden
              nicht gelöscht oder überschrieben.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {exportAllData.data && (
        <Card>
          <CardHeader>
            <CardTitle>📈 Deine Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{exportAllData.data.stats.totalPlants}</p>
                <p className="text-sm text-gray-500">Pflanzen</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{exportAllData.data.stats.totalAquariums}</p>
                <p className="text-sm text-gray-500">Aquarien</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{exportAllData.data.stats.totalPosts}</p>
                <p className="text-sm text-gray-500">Beiträge</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{exportAllData.data.stats.followers}</p>
                <p className="text-sm text-gray-500">Follower</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Privacy Info */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">🔒 Datenschutz & DSGVO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-purple-800 text-sm">
          <p>
            Dein Backup ist für <strong>dich selbst</strong> bestimmt. Du kannst es jederzeit herunterladen
            und speichern.
          </p>
          <p>
            ✅ <strong>Sichere deine Daten regelmäßig</strong>, um im Falle eines Kontoausfalls nicht alles
            zu verlieren.
          </p>
          <p>
            ✅ Du hast das Recht auf <strong>Datenportabilität</strong> gemäß DSGVO Art. 20.
          </p>
          <p>
            ⚠️ <strong>Gib dein Backup nicht an Dritte weiter</strong> – es enthält sensible Informationen
            über dich!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
