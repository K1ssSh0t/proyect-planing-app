import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const allTasks = await db.select().from(tasks).all();
  return NextResponse.json(allTasks);
}

export async function POST(request: Request) {
  const data = await request.json();

  const newTask = await db
    .insert(tasks)
    .values({
      title: data.title,
      description: data.description,
      status: data.status || "todo",
      priority: data.priority || "medium",
      assignee: data.assignee,
      start_date: data.start_date,
      end_date: data.end_date,
    })
    .returning();

  return NextResponse.json(newTask[0]);
}

export async function PUT(request: Request) {
  const { id, ...data } = await request.json();

  const updatedTask = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, id))
    .returning();

  return NextResponse.json(updatedTask[0]);
}
