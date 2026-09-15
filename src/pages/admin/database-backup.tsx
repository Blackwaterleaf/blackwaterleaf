"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, AlertCircle, CheckCircle2, Loader2, Database } from "lucide-react";

export default function AdminDatabaseBackup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [status, setStatus] = useState<any>(null);

  const handleCheckStatus = async () => {
    try {
      const response = await fetch("/api/admin/backup/status");
      const data = await response.json();
      setStatus(data);
      setMessage({ type: "success", text: "✅ Status abgerufen" });
    } catch (error) {
      setMessage({ type: "error", text: `❌ Fehler: ${error}` });
    }
  };

  const handleDownloadDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/backup/database");
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers
        .get("content-disposition")
        ?.split("filename=")[1]
        ?.replace(/"/g, "") || "backup.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: "success", text: "✅ Datenbank-Backup heruntergeladen!" });
    } catch (error) {
      setMessage({ type: "error", text: `❌ Download fehlgeschlagen: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/backup/users-data");
      if (!response.ok) throw new Error("Download failed");

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({
        type: "success",
        text: `✅ ${data.totalUsers} Benutzer exportiert!`,
      });
    } catch (error) {
      setMessage({ type: "error", text: `❌ Download fehlgeschlagen: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreUsers = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      const response = await fetch("/api/admin/backup/restore-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupData.users),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Restore failed");

      setMessage({
        type: "success",
        text: `✅ ${result.results.restored} Benutzer wiederhergestellt!`,
      });
      await handleCheckStatus();
    } catch (error) {
      setMessage({ type: "error", text: `❌ Restore fehlgeschlagen: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Database className="w-8 h-8" />
          🗄️ Datenbank-Verwaltung
        </h1>
        <p className="text-gray-600 mt-2">Sichere die komplette Benutzerdatenbank und stelle sie wieder her</p>
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

      {/* Status Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            📊 Datenbank Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCheckStatus} disabled={loading} className="mb-4" variant="outline">
            Status aktualisieren
          </Button>
          {status && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-blue-600">{status.database.totalUsers}</p>
                <p className="text-sm text-gray-600">Gesamt Benutzer</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{status.database.activeUsers}</p>
                <p className="text-sm text-gray-600">Aktive Benutzer</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{status.database.admins}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{status.database.moderators}</p>
                <p className="text-sm text-gray-600">Moderatoren</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            📥 Datenbank Exportieren
          </CardTitle>
          <CardDescription>Lade die komplette Datenbank oder nur die Benutzerliste herunter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              onClick={handleDownloadDatabase}
              disabled={loading}
              className="w-full"
              size="lg"
              variant="default"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {loading ? "Wird vorbereitet..." : "📦 Komplette Datenbank (ZIP)"}
            </Button>

            <Button
              onClick={handleDownloadUsers}
              disabled={loading}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {loading ? "Wird vorbereitet..." : "👥 Nur Benutzer (JSON)"}
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p>
              <strong>Export beinhaltet:</strong>
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>✅ Alle Benutzerprofile</li>
              <li>✅ openId (für Re-Authentifizierung)</li>
              <li>✅ Login-Methoden</li>
              <li>✅ Rollen & Status</li>
              <li>✅ Registrierungsdatum</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Restore Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            📤 Datenbank Wiederherstellen
          </CardTitle>
          <CardDescription>Stelle Benutzer aus einem Backup wieder her</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <div className="text-center">
              <p className="font-semibold">Klick zum Auswählen oder Datei hier ablegen</p>
              <p className="text-sm text-gray-500">Nur users_backup_*.json Dateien akzeptiert</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleRestoreUsers(e.target.files[0]);
                }
              }}
              disabled={loading}
              className="hidden"
            />
          </label>

          <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 mt-4">
            <p>
              <strong>⚠️ Wichtig:</strong>
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Nur Admin-Benutzer können Backups hochladen</li>
              <li>Existierende Benutzer werden aktualisiert</li>
              <li>openId muss übereinstimmen mit Manus-System</li>
              <li>Benutzer können sich sofort wieder anmelden</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">🔐 Sicherheit & Rechtliche Hinweise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-red-800 text-sm">
          <p>
            <strong>ADMIN ONLY:</strong> Dieser Bereich ist nur für Administratoren zugänglich. Missbrauch wird protokolliert.
          </p>
          <p>
            <strong>Datenschutz:</strong> Backups enthalten sensible Benutzerdaten. Lagere Backups sicher und verschlüsselt.
          </p>
          <p>
            <strong>DSGVO:</strong> Bei Datenlecks muss die Aufsichtsbehörde informiert werden. Lösche alte Backups nach
            Aufbewahrungsfrist.
          </p>
          <p>
            <strong>Integrität:</strong> Vor dem Upload verifiziere, dass die Backup-Datei nicht manipuliert wurde.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}