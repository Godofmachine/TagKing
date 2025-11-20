import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    clerkId: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerk", ["clerkId"]),

  sessions: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    phoneNumber: v.optional(v.string()),
    status: v.string(), // "created", "qr", "authenticated", "open", "closed"
    renderSessionId: v.optional(v.string()),
    createdAt: v.number(),
    lastActive: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"]),

  activityLogs: defineTable({
    userId: v.id("users"),
    sessionId: v.optional(v.string()),
    action: v.string(),
    level: v.string(), // "info", "success", "warning", "error"
    details: v.optional(v.object({
      groupName: v.optional(v.string()),
      memberCount: v.optional(v.number()),
      messagesSent: v.optional(v.number()),
      error: v.optional(v.string()),
    })),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_timestamp", ["timestamp"]),

  usageStats: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    groupsTagged: v.number(),
    membersTagged: v.number(),
    messagesSent: v.number(),
  })
    .index("by_user_date", ["userId", "date"]),
});
