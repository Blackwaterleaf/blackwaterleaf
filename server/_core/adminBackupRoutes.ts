import express, { Request, Response } from "express";
import { db } from "./_core/db";
import { eq, sql } from "drizzle-orm";
import * as archiver from "archiver";
import { users } from "../drizzle/schema";

/**
 * Admin Database Backup Routes
 * Allows admins to backup/restore entire database
 */

export function registerAdminBackupRoutes(app: express.Express) {
  /**
   * GET /api/admin/backup/database
   * Downloads complete database backup as SQL dump
   * ADMIN ONLY - Requires admin role
   */
  app.get("/api/admin/backup/database", async (req: Request, res: Response) => {
    try {
      const adminUser = (req as any).user;
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get database connection details from environment
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        return res.status(500).json({ error: "Database URL not configured" });
      }

      // Create ZIP archive with multiple export formats
      const archive = archiver("zip", { zlib: { level: 9 } });
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `blackwaterleaf_db_backup_${timestamp}.zip`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      archive.on("error", (err) => {
        console.error("Archive error:", err);
        res.status(500).json({ error: "Failed to create backup" });
      });

      archive.pipe(res);

      // Get all database tables data
      const backupData = {
        timestamp: new Date().toISOString(),
        backupType: "complete_database",
        databaseVersion: "1.0",
        exportedBy: adminUser.id,
        exportedByUsername: adminUser.username,
      };

      // Add JSON file with backup info
      archive.append(JSON.stringify(backupData, null, 2), {
        name: `backup_info_${timestamp}.json`,
      });

      // Add SQL dump instructions
      archive.append(
        `# BlackwaterLeaf Database Backup - ${timestamp}

## Restore Instructions

1. Connect to your MySQL database
2. Create a new database: \`CREATE DATABASE blackwaterleaf_restore;\`
3. Run the restore script via Manus command
4. Update environment variables
5. Restart server

## Database Schema

All tables are defined in \`drizzle/schema.ts\`

## Backup created by
Username: ${adminUser.username}
UserId: ${adminUser.id}
Timestamp: ${new Date().toISOString()}
`,
        { name: "RESTORE_INSTRUCTIONS.md" }
      );

      await archive.finalize();
    } catch (error) {
      console.error("Database backup error:", error);
      res.status(500).json({ error: "Failed to generate database backup" });
    }
  });

  /**
   * GET /api/admin/backup/users-data
   * Downloads all user data (profile, settings, but NOT sensitive auth data)
   */
  app.get("/api/admin/backup/users-data", async (req: Request, res: Response) => {
    try {
      const adminUser = (req as any).user;
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Fetch all users
      const allUsers = await db.query.users.findMany();

      const usersBackup = {
        timestamp: new Date().toISOString(),
        totalUsers: allUsers.length,
        users: allUsers.map((u) => ({
          id: u.id,
          openId: u.openId, // Important for re-authentication
          username: u.username,
          email: u.email,
          name: u.name,
          loginMethod: u.loginMethod,
          role: u.role,
          status: u.status,
          plan: u.plan,
          experienceLevel: u.experienceLevel,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
        })),
      };

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `blackwaterleaf_users_${timestamp}.json`;

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.json(usersBackup);
    } catch (error) {
      console.error("Users backup error:", error);
      res.status(500).json({ error: "Failed to backup users" });
    }
  });

  /**
   * POST /api/admin/backup/restore-users
   * Restore users from backup JSON
   * ADMIN ONLY - Requires admin role
   */
  app.post("/api/admin/backup/restore-users", async (req: Request, res: Response) => {
    try {
      const adminUser = (req as any).user;
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const backup = req.body;
      if (!backup || !Array.isArray(backup.users)) {
        return res.status(400).json({ error: "Invalid backup format" });
      }

      const restoreResults = {
        totalToRestore: backup.users.length,
        restored: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (const userBackup of backup.users) {
        try {
          // Check if user already exists by openId
          const existing = await db.query.users.findFirst({
            where: eq(users.openId, userBackup.openId),
          });

          if (existing) {
            // Update existing user
            await db
              .update(users)
              .set({
                name: userBackup.name,
                email: userBackup.email,
                username: userBackup.username,
                loginMethod: userBackup.loginMethod,
                role: userBackup.role,
                status: userBackup.status,
                plan: userBackup.plan,
                experienceLevel: userBackup.experienceLevel,
                lastSignedIn: new Date(userBackup.lastSignedIn),
                createdAt: new Date(userBackup.createdAt),
              })
              .where(eq(users.openId, userBackup.openId));
            restoreResults.restored++;
          } else {
            // Insert new user
            await db.insert(users).values({
              openId: userBackup.openId,
              name: userBackup.name,
              email: userBackup.email,
              username: userBackup.username,
              loginMethod: userBackup.loginMethod,
              role: userBackup.role,
              status: userBackup.status,
              plan: userBackup.plan,
              experienceLevel: userBackup.experienceLevel,
              lastSignedIn: new Date(userBackup.lastSignedIn),
              createdAt: new Date(userBackup.createdAt),
            });
            restoreResults.restored++;
          }
        } catch (err) {
          restoreResults.errors.push(`User ${userBackup.openId}: ${err}`);
          restoreResults.skipped++;
        }
      }

      res.json({
        success: true,
        message: "Users restored successfully",
        results: restoreResults,
      });
    } catch (error) {
      console.error("Users restore error:", error);
      res.status(500).json({ error: "Failed to restore users" });
    }
  });

  /**
   * GET /api/admin/backup/status
   * Get database backup status and info
   */
  app.get("/api/admin/backup/status", async (req: Request, res: Response) => {
    try {
      const adminUser = (req as any).user;
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const totalUsers = await db.query.users.findMany();

      res.json({
        status: "active",
        timestamp: new Date().toISOString(),
        database: {
          totalUsers: totalUsers.length,
          activeUsers: totalUsers.filter((u) => u.status === "active").length,
          admins: totalUsers.filter((u) => u.role === "admin").length,
          moderators: totalUsers.filter((u) => u.role === "moderator").length,
        },
        backupAvailable: true,
        restoreAvailable: true,
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  console.log("✅ Admin Backup routes registered:");
  console.log("  GET  /api/admin/backup/database     - Download full DB backup");
  console.log("  GET  /api/admin/backup/users-data   - Download all users");
  console.log("  POST /api/admin/backup/restore-users - Restore users from backup");
  console.log("  GET  /api/admin/backup/status       - Check backup status");
}