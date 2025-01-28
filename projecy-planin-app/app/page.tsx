"use client";
import { useEffect, useState } from "react";
import type { Task } from "@/lib/db/schema";

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex gap-4 mb-8">
        {statuses.map((status) => (
          <div
            key={status.id}
            className="bg-white p-4 rounded-lg shadow-md flex-1"
          >
            <h2 className="text-lg font-semibold mb-4">
              {status.title} ({status.count})
            </h2>

            {tasks
              .filter((t) => t.status === status.id)
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 p-3 mb-2 rounded border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        task.priority === "high"
                          ? "bg-red-100"
                          : task.priority === "medium"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {task.description}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600">{task.assignee}</span>
                    <div className="space-x-2">
                      {status.id !== "done" && (
                        <button
                          onClick={() =>
                            updateTaskStatus(
                              task.id,
                              status.id === "todo" ? "doing" : "done"
                            )
                          }
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {status.id === "todo" ? "Start" : "Complete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAddTask}
        className="bg-white p-4 rounded-lg shadow-md"
      >
        <h3 className="font-semibold mb-4">Add New Task</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Task title"
            className="p-2 border rounded"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <select
            className="p-2 border rounded"
            value={newTask.priority as string}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                priority: e.target.value as Task["priority"],
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            className="p-2 border rounded"
            value={newTask.description as string}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <select
            className="p-2 border rounded"
            value={newTask.assignee as string}
            onChange={(e) =>
              setNewTask({ ...newTask, assignee: e.target.value })
            }
          >
            <option value="Atrias">Atrias</option>
            <option value="Correct">Correct</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}
