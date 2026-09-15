"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function DataBackupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDownloadAll = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/backup/download-all");
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("content-disposition")?.split("filename=")[1] || "backup.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: "success", text: "✅ Backup erfolgreich heruntergeladen!" });
    } catch (error) {
      setMessage({ type: "error", text: `❌ Download fehlgeschlagen: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/backup/download-json");
      if (!response.ok) throw new Error("Download failed");

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: "success", text: "✅ JSON-Backup erfolgreich heruntergeladen!" });
    } catch (error) {
      setMessage({ type: "error", text: `❌ Download fehlgeschlagen: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      const response = await fetch("/api/backup/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");

      setMessage({
        type: "success",
        text: `✅ Daten wiederhergestellt! Pflanzen: ${result.importResults.plants}, Aquarien: ${result.importResults.aquariums}, Beiträge: ${result.importResults.posts}`,
      });
    } catch (error) {
      setMessage({ type: "error", text: `❌ Import fehlgeschlagen: ${error}` });
    } finally {
      setLoading(false);
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
          <div className="space-y-3">
            <Button
              onClick={handleDownloadAll}
              disabled={loading}
              className="w-full"
              size="lg"
              variant="default"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {loading ? "Wird vorbereitet..." : "📦 Als ZIP Herunterladen (mit allen Dateien)"}
            </Button>

            <Button
              onClick={handleDownloadJSON}
              disabled={loading}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {loading ? "Wird vorbereitet..." : "📄 Als JSON Herunterladen"}
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p>
              <strong>Export beinhaltet:</strong>
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>✅ Komplettes Profil & Einstellungen</li>
              <li>✅ Alle Pflanzen & Aquarien</li>
              <li>✅ Alle Beiträge & Kommentare</li>
              <li>✅ Nachrichten & Unterhaltungen</li>
              <li>✅ KI-Chat-Verlauf</li>
              <li>✅ Statistiken & Erfolge</li>
              <li>✅ Alle Metadaten</li>
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
                  handleUpload(e.target.files[0]);
                }
              }}
              disabled={loading}
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

      {/* Data Privacy Info */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">🔒 Datenschutz & DSGVO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-purple-800 text-sm">
          <p>
            Dein Backup ist für <strong>dich selbst</strong> bestimmt. Du kannst es jederzeit herunterladen und speichern.
          </p>
          <p>
            ✅ <strong>Sichere deine Daten regelmäßig</strong>, um im Falle eines Kontoausfalls nicht alles zu verlieren.
          </p>
          <p>
            ✅ Du hast das Recht auf <strong>Datenportabilität</strong> gemäß DSGVO Art. 20.
          </p>
          <p>
            ⚠️ <strong>Gib dein Backup nicht an Dritte weiter</strong> – es enthält sensible Informationen über dich!
          </p>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card className="bg-gray-50 border-gray-300">
        <CardHeader>
          <CardTitle className="text-gray-900">🔧 API für Entwickler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm font-mono text-gray-700">
          <div>
            <p className="font-bold mb-1">Download Backup als ZIP:</p>
            <code className="bg-white p-2 rounded border block">GET /api/backup/download-all</code>
          </div>
          <div>
            <p className="font-bold mb-1">Download Backup als JSON:</p>
            <code className="bg-white p-2 rounded border block">GET /api/backup/download-json</code>
          </div>
          <div>
            <p className="font-bold mb-1">Upload und Restore:</p>
            <code className="bg-white p-2 rounded border block">POST /api/backup/upload</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
