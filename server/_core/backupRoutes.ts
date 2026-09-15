import express, { Request, Response } from "express";
import { db } from "../_core/db";
import { eq } from "drizzle-orm";
import { users, plants, aquariums, posts, comments, aiChats } from "../../drizzle/schema";
import * as archiver from "archiver";

/**
 * Backup Download Routes
 * Allows authenticated users to download complete backups as ZIP files
 */

export function registerBackupRoutes(app: express.Express) {
  /**
   * GET /api/backup/download-all
   * Downloads complete user data as ZIP file
   * Includes: profile, plants, aquariums, posts, AI chats, etc.
   */
  app.get("/api/backup/download-all", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userName = (req as any).user?.username || `user_${userId}`;

      // Fetch all user data
      const [userProfile, userPlants, userAquariums, userPosts, userComments, userAiChats] = await Promise.all([
        db.query.users.findFirst({ where: eq(users.id, userId) }),
        db.query.plants.findMany({ where: eq(plants.userId, userId) }),
        db.query.aquariums.findMany({ where: eq(aquariums.userId, userId) }),
        db.query.posts.findMany({ where: eq(posts.userId, userId) }),
        db.query.comments.findMany({ where: eq(comments.userId, userId) }),
        db.query.aiChats.findMany({ where: eq(aiChats.userId, userId) }),
      ]);

      // Create backup object
      const backupData = {
        exportDate: new Date().toISOString(),
        userName,
        userId,
        profile: userProfile
          ? {
              id: userProfile.id,
              username: userProfile.username,
              email: userProfile.email,
              name: userProfile.name,
              bio: userProfile.bio,
              location: userProfile.location,
              interests: userProfile.interests,
              createdAt: userProfile.createdAt,
              status: userProfile.status,
            }
          : null,
        data: {
          plants: userPlants,
          aquariums: userAquariums,
          posts: userPosts,
          comments: userComments,
          aiChats: userAiChats,
        },
        stats: {
          totalPlants: userPlants.length,
          totalAquariums: userAquariums.length,
          totalPosts: userPosts.length,
          totalComments: userComments.length,
          totalAiChats: userAiChats.length,
        },
      };

      // Create ZIP archive
      const archive = archiver("zip", { zlib: { level: 9 } });

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `blackwaterleaf_backup_${userName}_${timestamp}.zip`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      archive.on("error", (err) => {
        console.error("Archive error:", err);
        res.status(500).json({ error: "Failed to create backup" });
      });

      archive.pipe(res);

      // Add JSON file to archive
      archive.append(JSON.stringify(backupData, null, 2), {
        name: `backup_${timestamp}.json`,
      });

      // Add README
      archive.append(
        `# BlackwaterLeaf Backup für ${userName}\n\nZurückdatum: ${new Date().toLocaleDateString("de-DE")}\n\nDieser Backup enthält alle deine Daten und kann später wiederhergestellt werden.`,
        { name: "README.md" }
      );

      await archive.finalize();
    } catch (error) {
      console.error("Backup download error:", error);
      res.status(500).json({ error: "Failed to generate backup" });
    }
  });

  /**
   * GET /api/backup/download-json
   * Downloads backup as plain JSON (no ZIP)
   */
  app.get("/api/backup/download-json", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userName = (req as any).user?.username || `user_${userId}`;

      const [userProfile, userPlants, userAquariums, userPosts, userComments, userAiChats] = await Promise.all([
        db.query.users.findFirst({ where: eq(users.id, userId) }),
        db.query.plants.findMany({ where: eq(plants.userId, userId) }),
        db.query.aquariums.findMany({ where: eq(aquariums.userId, userId) }),
        db.query.posts.findMany({ where: eq(posts.userId, userId) }),
        db.query.comments.findMany({ where: eq(comments.userId, userId) }),
        db.query.aiChats.findMany({ where: eq(aiChats.userId, userId) }),
      ]);

      const backupData = {
        exportDate: new Date().toISOString(),
        userName,
        userId,
        profile: userProfile
          ? {
              id: userProfile.id,
              username: userProfile.username,
              email: userProfile.email,
              name: userProfile.name,
              bio: userProfile.bio,
              location: userProfile.location,
              interests: userProfile.interests,
              createdAt: userProfile.createdAt,
            }
          : null,
        data: {
          plants: userPlants,
          aquariums: userAquariums,
          posts: userPosts,
          comments: userComments,
          aiChats: userAiChats,
        },
        stats: {
          totalPlants: userPlants.length,
          totalAquariums: userAquariums.length,
          totalPosts: userPosts.length,
          totalComments: userComments.length,
        },
      };

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `blackwaterleaf_backup_${userName}_${timestamp}.json`;

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.json(backupData);
    } catch (error) {
      console.error("JSON backup error:", error);
      res.status(500).json({ error: "Failed to generate backup" });
    }
  });

  /**
   * POST /api/backup/upload
   * Upload and restore backup file
   */
  app.post("/api/backup/upload", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const backupData = req.body;
      if (!backupData || !backupData.data) {
        return res.status(400).json({ error: "Invalid backup format" });
      }

      const importResults = {
        plants: 0,
        aquariums: 0,
        posts: 0,
        comments: 0,
        errors: [] as string[],
      };

      try {
        // Import Plants
        if (backupData.data.plants && Array.isArray(backupData.data.plants)) {
          for (const plant of backupData.data.plants) {
            try {
              await db.insert(plants).values({
                ...plant,
                userId,
                id: undefined,
              });
              importResults.plants++;
            } catch (err) {
              importResults.errors.push(`Plant: ${err}`);
            }
          }
        }

        // Import Aquariums
        if (backupData.data.aquariums && Array.isArray(backupData.data.aquariums)) {
          for (const aq of backupData.data.aquariums) {
            try {
              await db.insert(aquariums).values({
                ...aq,
                userId,
                id: undefined,
              });
              importResults.aquariums++;
            } catch (err) {
              importResults.errors.push(`Aquarium: ${err}`);
            }
          }
        }

        // Import Posts
        if (backupData.data.posts && Array.isArray(backupData.data.posts)) {
          for (const post of backupData.data.posts) {
            try {
              await db.insert(posts).values({
                ...post,
                userId,
                id: undefined,
              });
              importResults.posts++;
            } catch (err) {
              importResults.errors.push(`Post: ${err}`);
            }
          }
        }

        // Import Comments
        if (backupData.data.comments && Array.isArray(backupData.data.comments)) {
          for (const comment of backupData.data.comments) {
            try {
              await db.insert(comments).values({
                ...comment,
                userId,
                id: undefined,
              });
              importResults.comments++;
            } catch (err) {
              importResults.errors.push(`Comment: ${err}`);
            }
          }
        }

        res.json({
          success: true,
          message: "Data restored successfully",
          importResults,
        });
      } catch (error) {
        res.status(500).json({ error: `Import failed: ${error}` });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process backup" });
    }
  });

  console.log("✅ Backup routes registered:");
  console.log("  GET  /api/backup/download-all   - Download backup as ZIP");
  console.log("  GET  /api/backup/download-json  - Download backup as JSON");
  console.log("  POST /api/backup/upload         - Upload and restore backup");
}