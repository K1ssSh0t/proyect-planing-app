import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status", { enum: ["todo", "doing", "done"] }).default("todo"),
    priority: text('priority', { 
      enum: ['low', 'medium', 'high'] 
    }).notNull().default('medium'),
    assignee: text("assignee"),
    start_date: text("start_date"),
    end_date: text("end_date"),
    created_at: text("created_at").default(new Date().toISOString()),
  },
  (table) => ({
    statusIdx: index("status_idx").on(table.status),
    priorityIdx: index("priority_idx").on(table.priority),
  })
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
