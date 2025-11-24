import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create new session
export const createSession = mutation({
  args: {
    userId: v.id("users"),
    sessionId: v.string(),
    renderSessionId: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      userId: args.userId,
      sessionId: args.sessionId,
      renderSessionId: args.renderSessionId,
      phoneNumber: args.phoneNumber,
      status: args.status || "created",
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
    renderSessionId: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      // This might happen if the session is created on the backend but not yet in Convex.
      // We can't patch it if it doesn't exist.
      console.warn(`Session with sessionId ${args.sessionId} not found in Convex.`);
      return;
    }

    await ctx.db.patch(session._id, {
      status: args.status,
      // Ensure renderSessionId is updated if provided
      renderSessionId: args.renderSessionId ?? session.renderSessionId,
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
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
  },
});

// Delete all sessions for a user
export const deleteAllSessions = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    await Promise.all(sessions.map((s) => ctx.db.delete(s._id)));
  },
});
