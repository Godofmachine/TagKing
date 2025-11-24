import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add activity log
export const addLog = mutation({
  args: {
    userId: v.id("users"),
    sessionId: v.optional(v.string()),
    action: v.string(),
    level: v.string(),
    details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLogs", {
      userId: args.userId,
      sessionId: args.sessionId,
      action: args.action,
      level: args.level,
      details: args.details,
      timestamp: Date.now(),
    });
  },
});

// Get recent logs for user
export const getRecentLogs = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get logs for specific session
export const getSessionLogs = query({
  args: {
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);
  },
});

// Clear all logs for a user
export const clearLogs = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("activityLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    await Promise.all(logs.map((log) => ctx.db.delete(log._id)));
  },
});
