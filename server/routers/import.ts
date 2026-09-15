import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "../_core/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users, plants, aquariums, posts, comments } from "../../drizzle/schema";

export const importRouter = createTRPCRouter({
  importUserData: protectedProcedure
    .input(z.object({ backupData: z.any() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const userId = ctx.user.id;
      const backup = input.backupData;

      if (!backup || !backup.data) throw new Error("Invalid backup format");

      const importResults = {
        plants: 0,
        aquariums: 0,
        posts: 0,
        comments: 0,
        errors: [] as string[],
      };

      try {
        if (backup.data.plants && Array.isArray(backup.data.plants)) {
          for (const plant of backup.data.plants) {
            try {
              await db.insert(plants).values({ ...plant, userId, id: undefined });
              importResults.plants++;
            } catch (err) {
              importResults.errors.push(`Plant: ${err}`);
            }
          }
        }

        if (backup.data.aquariums && Array.isArray(backup.data.aquariums)) {
          for (const aq of backup.data.aquariums) {
            try {
              await db.insert(aquariums).values({ ...aq, userId, id: undefined });
              importResults.aquariums++;
            } catch (err) {
              importResults.errors.push(`Aquarium: ${err}`);
            }
          }
        }

        if (backup.data.posts && Array.isArray(backup.data.posts)) {
          for (const post of backup.data.posts) {
            try {
              await db.insert(posts).values({ ...post, userId, id: undefined });
              importResults.posts++;
            } catch (err) {
              importResults.errors.push(`Post: ${err}`);
            }
          }
        }

        if (backup.data.comments && Array.isArray(backup.data.comments)) {
          for (const comment of backup.data.comments) {
            try {
              await db.insert(comments).values({ ...comment, userId, id: undefined });
              importResults.comments++;
            } catch (err) {
              importResults.errors.push(`Comment: ${err}`);
            }
          }
        }

        return { success: true, message: "Import successful", importResults };
      } catch (error) {
        throw new Error(`Import failed: ${error}`);
      }
    }),

  restoreUserProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        interests: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const userId = ctx.user.id;
      await db
        .update(users)
        .set({
          name: input.name,
          bio: input.bio,
          location: input.location,
          interests: input.interests,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return { success: true, message: "Profile restored" };
    }),
});