import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create new session
export const createSession = mutation({
  args: {
    userId: v.id("users"),
    sessionId: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      userId: args.userId,
      sessionId: args.sessionId,
      phoneNumber: args.phoneNumber,
      status: "created",
      createdAt: Date.now(),
      lastActive: Date.now(),
    });
  },
});

// Update session status
export const updateSessionStatus = mutation({
  args: {
    sessionId: v.string(),
    status: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, {
      status: args.status,
      phoneNumber: args.phoneNumber,
      lastActive: Date.now(),
    });
  },
});

// Get user sessions
export const getUserSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get active sessions
export const getActiveSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return sessions.filter((s) => s.status === "open" || s.status === "authenticated");
  },
});

// Delete session
export const deleteSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
