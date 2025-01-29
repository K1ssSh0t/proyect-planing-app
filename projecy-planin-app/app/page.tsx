"use client";
import { useEffect, useState } from "react";
import type { Task } from "@/lib/db/schema";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function SortableTask({ task, priorityVariants }: { task: Task; priorityVariants: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{task.title}</h3>
        <Badge variant={priorityVariants[task.priority as keyof typeof priorityVariants]}>
          {task.priority}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-primary">{task.assignee}</span>
      </div>
    </Card>
  );
}

function StatusColumn({ id, title, count, tasks, priorityVariants }: {
  id: string;
  title: string;
  count: number;
  tasks: Task[];
  priorityVariants: any;
}) {
  const { setNodeRef } = useDroppable({ id, data: { status: id } });

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {title} <Badge variant="outline">{count}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="space-y-2 min-h-[500px]">
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} priorityVariants={priorityVariants} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    assignee: "Atrias",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then(setTasks);
  }, []);

  const statuses = ["todo", "doing", "done"].map((status) => ({
    id: status,
    title: status === "todo" ? "To Do" : status === "doing" ? "Doing" : "Done",
    count: tasks.filter((t) => t.status === status).length,
    tasks: tasks.filter((t) => t.status === status),
  }));

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.data.current?.status;
    const taskId = active.id;

    if (newStatus && typeof taskId === "number") {
      const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, status: newStatus };
        }
        return task;
      });

      setTasks(updatedTasks);

      // Update in the backend
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    }
  };

  const priorityVariants = {
    high: "destructive",
    medium: "warning",
    low: "success",
  } as const;

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={({ active }) => {
          setActiveTask(tasks.find((t) => t.id === active.id) || null);
        }}
      >
        <div className="flex gap-4 mb-8">
          {statuses.map((status) => (
            <StatusColumn
              key={status.id}
              id={status.id}
              title={status.title}
              count={status.count}
              tasks={status.tasks}
              priorityVariants={priorityVariants}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <Card className="p-4 cursor-grabbing shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{activeTask.title}</h3>
                <Badge variant={priorityVariants[activeTask.priority]}>
                  {activeTask.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {activeTask.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary">{activeTask.assignee}</span>
              </div>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Card className="p-6">
        <form onSubmit={handleAddTask} className="space-y-4">
          <h3 className="font-semibold text-lg">Add New Task</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Mantenemos el mismo formulario */}
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
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
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <Select
              value={newTask.assignee as string}
              onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
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