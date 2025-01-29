"use client";
import { useEffect, useState } from "react";
import type { Task } from "@/lib/db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    assignee: "Atrias",
  });

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then(setTasks);
  }, []);

  const statuses = [
    {
      id: "todo",
      title: "To Do",
      count: tasks.filter((t) => t.status === "todo").length,
    },
    {
      id: "doing",
      title: "Doing",
      count: tasks.filter((t) => t.status === "doing").length,
    },
    {
      id: "done",
      title: "Done",
      count: tasks.filter((t) => t.status === "done").length,
    },
  ];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, status: "todo" }),
    });

    const result = await response.json();
    setTasks([...tasks, result]);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      assignee: "Atrias",
    });
  };

  const updateTaskStatus = async (
    taskId: number,
    newStatus: Task["status"]
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: newStatus }),
    });

    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const priorityVariants: Record<
    Task["priority"],
    "destructive" | "warning" | "success"
  > = {
    high: "destructive",
    medium: "warning",
    low: "success",
  };

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="flex gap-4 mb-8">
        {statuses.map((status) => (
          <Card key={status.id} className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {status.title} <Badge variant="outline">{status.count}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks
                .filter((t) => t.status === status.id)
                .map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge
                        variant={
                          priorityVariants[
                            task.priority as keyof typeof priorityVariants
                          ]
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary">{task.assignee}</span>
                      <div className="space-x-2">
                        {status.id !== "done" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                status.id === "todo" ? "doing" : "done"
                              )
                            }
                          >
                            {status.id === "todo" ? "Start" : "Complete"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <form onSubmit={handleAddTask} className="space-y-4">
          <h3 className="font-semibold text-lg">Add New Task</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              required
            />
            <Select
              value={newTask.priority as string}
              onValueChange={(value) =>
                setNewTask({ ...newTask, priority: value as Task["priority"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Description"
              value={newTask.description as string}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <Select
              value={newTask.assignee as string}
              onValueChange={(value) =>
                setNewTask({ ...newTask, assignee: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Atrias">Atrias</SelectItem>
                <SelectItem value="Correct">Correct</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Add Task
          </Button>
        </form>
      </Card>
    </div>
  );
}
