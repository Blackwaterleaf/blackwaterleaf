import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "../_core/db";
import { eq } from "drizzle-orm";
import {
  users,
  plants,
  plantPhotos,
  aquariums,
  aquariumPhotos,
  aquariumEvents,
  posts,
  comments,
  likes,
  commentLikes,
  messages,
  conversations,
  conversationParticipants,
  follows,
  userBadges,
  userStats,
  aiChats,
  groups,
  groupMembers,
  notifications,
  aiCorrections,
} from "../../drizzle/schema";

export const exportRouter = createTRPCRouter({
  /**
   * Export all user data as JSON
   * Includes: profile, plants, aquariums, posts, messages, AI chats, stats, etc.
   */
  exportAllUserData: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    const userId = ctx.user.id;
    const userName = ctx.user.username || ctx.user.name || `User_${userId}`;

    // Fetch all user-related data in parallel
    const [
      userProfile,
      userPlants,
      userAquariums,
      userPosts,
      userComments,
      userLikes,
      userMessages,
      userFollows,
      userFollowers,
      userBadgeData,
      userStatsData,
      userAiChats,
      userGroups,
      userNotifications,
      userCorrections,
    ] = await Promise.all([
      // User Profile
      db.query.users.findFirst({ where: eq(users.id, userId) }),

      // Plants & Photos
      db.query.plants.findMany({
        where: eq(plants.userId, userId),
      }),

      // Aquariums & Photos & Events
      db.query.aquariums.findMany({
        where: eq(aquariums.userId, userId),
      }),

      // Posts
      db.query.posts.findMany({
        where: eq(posts.userId, userId),
      }),

      // Comments
      db.query.comments.findMany({
        where: eq(comments.userId, userId),
      }),

      // Likes on Posts
      db.query.likes.findMany({
        where: eq(likes.userId, userId),
      }),

      // Messages
      db.query.messages.findMany({
        where: eq(messages.senderId, userId),
      }),

      // Follows (following others)
      db.query.follows.findMany({
        where: eq(follows.followerId, userId),
      }),

      // Followers (others following this user)
      db.query.follows.findMany({
        where: eq(follows.followingId, userId),
      }),

      // Badges
      db.query.userBadges.findMany({
        where: eq(userBadges.userId, userId),
      }),

      // Stats
      db.query.userStats.findFirst({
        where: eq(userStats.userId, userId),
      }),

      // AI Chat History
      db.query.aiChats.findMany({
        where: eq(aiChats.userId, userId),
      }),

      // Groups (member of)
      db.query.groupMembers.findMany({
        where: eq(groupMembers.userId, userId),
      }),

      // Notifications
      db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
      }),

      // AI Corrections
      db.query.aiCorrections.findMany({
        where: eq(aiCorrections.userId, userId),
      }),
    ]);

    // Compile complete export
    const exportData = {
      exportDate: new Date().toISOString(),
      userName,
      userId,
      
      // User Profile
      profile: userProfile ? {
        ...userProfile,
        // Redact sensitive data
        openId: "[REDACTED]",
      } : null,

      // Statistics
      stats: {
        totalPlants: userPlants.length,
        totalAquariums: userAquariums.length,
        totalPosts: userPosts.length,
        totalComments: userComments.length,
        totalLikes: userLikes.length,
        followers: userFollowers.length,
        following: userFollows.length,
      },

      // Detailed Data
      data: {
        plants: userPlants,
        aquariums: userAquariums,
        posts: userPosts,
        comments: userComments,
        likes: userLikes,
        messages: userMessages,
        follows: {
          following: userFollows,
          followers: userFollowers,
        },
        badges: userBadgeData,
        stats: userStatsData,
        aiChats: userAiChats,
        groupMemberships: userGroups,
        notifications: userNotifications,
        aiCorrections: userCorrections,
      },
    };

    return exportData;
  }),

  /**
   * Get all user info for account deletion / GDPR compliance
   */
  getAllUserInfo: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return {
      userID: ctx.user.id,
      username: ctx.user.username,
      email: ctx.user.email,
      name: ctx.user.name,
      joinDate: ctx.user.createdAt,
      lastLogin: ctx.user.lastSignedIn,
      accountStatus: ctx.user.status,
      role: ctx.user.role,
    };
  }),
});