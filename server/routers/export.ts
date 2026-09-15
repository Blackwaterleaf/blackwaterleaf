import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "../_core/db";
import { eq } from "drizzle-orm";
import {
  users,
  plants,
  aquariums,
  posts,
  comments,
  likes,
  messages,
  follows,
  userBadges,
  userStats,
  aiChats,
  groupMembers,
  notifications,
  aiCorrections,
} from "../../drizzle/schema";

export const exportRouter = createTRPCRouter({
  exportAllUserData: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    const userId = ctx.user.id;
    const userName = ctx.user.username || ctx.user.name || `User_${userId}`;

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
      db.query.users.findFirst({ where: eq(users.id, userId) }),
      db.query.plants.findMany({ where: eq(plants.userId, userId) }),
      db.query.aquariums.findMany({ where: eq(aquariums.userId, userId) }),
      db.query.posts.findMany({ where: eq(posts.userId, userId) }),
      db.query.comments.findMany({ where: eq(comments.userId, userId) }),
      db.query.likes.findMany({ where: eq(likes.userId, userId) }),
      db.query.messages.findMany({ where: eq(messages.senderId, userId) }),
      db.query.follows.findMany({ where: eq(follows.followerId, userId) }),
      db.query.follows.findMany({ where: eq(follows.followingId, userId) }),
      db.query.userBadges.findMany({ where: eq(userBadges.userId, userId) }),
      db.query.userStats.findFirst({ where: eq(userStats.userId, userId) }),
      db.query.aiChats.findMany({ where: eq(aiChats.userId, userId) }),
      db.query.groupMembers.findMany({ where: eq(groupMembers.userId, userId) }),
      db.query.notifications.findMany({ where: eq(notifications.userId, userId) }),
      db.query.aiCorrections.findMany({ where: eq(aiCorrections.userId, userId) }),
    ]);

    return {
      exportDate: new Date().toISOString(),
      userName,
      userId,
      profile: userProfile ? { ...userProfile, openId: "[REDACTED]" } : null,
      stats: {
        totalPlants: userPlants.length,
        totalAquariums: userAquariums.length,
        totalPosts: userPosts.length,
        totalComments: userComments.length,
        totalLikes: userLikes.length,
        followers: userFollowers.length,
        following: userFollows.length,
      },
      data: {
        plants: userPlants,
        aquariums: userAquariums,
        posts: userPosts,
        comments: userComments,
        likes: userLikes,
        messages: userMessages,
        follows: { following: userFollows, followers: userFollowers },
        badges: userBadgeData,
        stats: userStatsData,
        aiChats: userAiChats,
        groupMemberships: userGroups,
        notifications: userNotifications,
        aiCorrections: userCorrections,
      },
    };
  }),

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