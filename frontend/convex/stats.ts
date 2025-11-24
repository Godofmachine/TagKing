import { v } from "convex/values";
import { query } from "./_generated/server";

export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get active sessions count
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const activeSessions = sessions.filter(
      (s) => s.status === "open" || s.status === "authenticated"
    ).length;

    // Get tagging stats from logs
    // Note: In a high-volume app, we should use the usageStats table and increment counters.
    // For now, aggregating from logs is fine.
    const logs = await ctx.db
      .query("activityLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let groupsTagged = 0;
    let membersReached = 0;

    for (const log of logs) {
      if (log.action === "Tagged all members" && log.details) {
        groupsTagged++;
        if (typeof log.details.memberCount === "number") {
          membersReached += log.details.memberCount;
        }
      }
    }

    return {
      activeSessions,
      groupsTagged,
      membersReached,
    };
  },
});
