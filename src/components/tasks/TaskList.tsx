import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Plus,
  Calendar,
  ArrowUpDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  X,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { format, isToday, isPast, addDays, isTomorrow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskForm from "./TaskForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();

  // Mock API calls with localStorage
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    setLoading(true);
    try {
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        // Initialize with sample tasks if none exist
        const sampleTasks: Task[] = [
          {
            id: "1",
            title: "Complete project documentation",
            description:
              "Finish writing the technical documentation for the project",
            priority: "high",
            status: "todo",
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Review pull requests",
            description: "Review and merge pending pull requests",
            priority: "medium",
            status: "in-progress",
            dueDate: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            title: "Update dependencies",
            description: "Update project dependencies to latest versions",
            priority: "low",
            status: "completed",
            dueDate: new Date().toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          },
        ];
        localStorage.setItem("tasks", JSON.stringify(sampleTasks));
        setTasks(sampleTasks);
      }
    } catch (err) {
      setError("Failed to fetch tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    setLoading(true);
    try {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedTasks = [...tasks, newTask];
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      setIsFormOpen(false);
      toast({
        title: "Task created",
        description: "Your task has been successfully created.",
      });
    } catch (err) {
      setError("Failed to add task");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = (updatedTask: Task) => {
    setLoading(true);
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      );
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      setIsFormOpen(false);
      setSelectedTask(null);
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      });
    } catch (err) {
      setError("Failed to update task");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = (id: string) => {
    setLoading(true);
    try {
      const updatedTasks = tasks.filter((task) => task.id !== id);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      toast({
        title: "Task deleted",
        description: "Your task has been successfully deleted.",
        variant: "destructive",
      });
    } catch (err) {
      setError("Failed to delete task");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  const handleQuickStatusChange = (task: Task, newStatus: Task["status"]) => {
    const updatedTask = { ...task, status: newStatus };
    updateTask(updatedTask);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "secondary";
      case "in-progress":
        return "warning";
      case "completed":
        return "success";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <AlertCircle size={14} className="mr-1" />;
      case "in-progress":
        return <Clock size={14} className="mr-1" />;
      case "completed":
        return <CheckCircle size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const getDueDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return "Overdue";
    return format(date, "MMM d, yyyy");
  };

  const getDueDateColor = (dateString: string) => {
    const date = new Date(dateString);
    if (isPast(date) && !isToday(date)) return "text-destructive";
    if (isToday(date)) return "text-warning-500";
    return "text-muted-foreground";
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterPriority("all");
    setSortBy("dueDate");
    setSortDirection("asc");
    setSearchQuery("");
  };

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress",
  ).length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      // Search filter
      const searchMatch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const statusMatch =
        filterStatus === "all" || task.status === filterStatus;

      // Priority filter
      const priorityMatch =
        filterPriority === "all" || task.priority === filterPriority;

      return searchMatch && statusMatch && priorityMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "dueDate") {
        comparison =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "status") {
        const statusOrder = { todo: 1, "in-progress": 2, completed: 3 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  return (
    <div className="container mx-auto p-4 bg-background">
      <div className="flex flex-col space-y-6">
        {/* Header with stats */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Task Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your tasks efficiently
              </p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleAddClick}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <TaskForm
                  onSubmit={selectedTask ? updateTask : addTask}
                  onCancel={handleFormClose}
                  initialData={selectedTask}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-secondary/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Tasks
                    </p>
                    <p className="text-2xl font-bold">{totalTasks}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar size={20} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      To Do
                    </p>
                    <p className="text-2xl font-bold">{todoTasks}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center">
                    <AlertCircle
                      size={20}
                      className="text-secondary-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold">{inProgressTasks}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Clock size={20} className="text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                    <p className="text-2xl font-bold">{completedTasks}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Completion Rate</p>
              <p className="text-sm font-medium">{completionRate}%</p>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
            {error}
            <Button
              variant="link"
              onClick={() => setError(null)}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Search and filters */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    Filters
                    {(filterStatus !== "all" ||
                      filterPriority !== "all" ||
                      sortBy !== "dueDate" ||
                      sortDirection !== "asc") && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                      >
                        !
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filters & Sorting</h4>
                    <Separator />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        value={filterPriority}
                        onValueChange={setFilterPriority}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort By</label>
                      <div className="flex gap-2">
                        <Select
                          value={sortBy}
                          onValueChange={setSortBy}
                          className="flex-1"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleSortDirection}
                        >
                          {sortDirection === "asc" ? (
                            <SortAsc size={16} />
                          ) : (
                            <SortDesc size={16} />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        Clear All
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList size={16} />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Task tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* All tasks tab */}
          <TabsContent value="all">
            {loading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {!loading && filteredAndSortedTasks.length === 0 && (
              <div className="text-center py-12 bg-muted/40 rounded-lg">
                <p className="text-muted-foreground">
                  No tasks found. Add a new task to get started.
                </p>
              </div>
            )}

            {viewMode === "list" ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredAndSortedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`overflow-hidden transition-all hover:shadow-md ${task.status === "completed" ? "bg-muted/30" : ""}`}
                  >
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {task.status === "completed" ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-full bg-green-500/20 text-green-500"
                                  onClick={() =>
                                    handleQuickStatusChange(task, "todo")
                                  }
                                >
                                  <CheckCircle size={14} />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-full bg-muted"
                                  onClick={() =>
                                    handleQuickStatusChange(task, "completed")
                                  }
                                >
                                  <div className="h-3 w-3 rounded-full" />
                                </Button>
                              )}
                            </div>
                            <div>
                              <h3
                                className={`text-xl font-semibold ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                              >
                                {task.title}
                              </h3>
                              <p className="text-muted-foreground mt-1 text-sm">
                                {task.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(task)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2
                                    size={16}
                                    className="text-destructive"
                                  />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Task
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this task?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTask(task.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center mt-4">
                          <Badge
                            variant={getStatusColor(task.status) as any}
                            className="flex items-center"
                          >
                            {getStatusIcon(task.status)}
                            {getStatusLabel(task.status)}
                          </Badge>
                          <Badge
                            variant={getPriorityColor(task.priority) as any}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}{" "}
                            Priority
                          </Badge>
                          <div
                            className={`flex items-center text-sm ${getDueDateColor(task.dueDate)}`}
                          >
                            <Calendar size={14} className="mr-1" />
                            {getDueDateLabel(task.dueDate)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`overflow-hidden transition-all hover:shadow-md ${task.status === "completed" ? "bg-muted/30" : ""}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle
                          className={`${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.title}
                        </CardTitle>
                        <Badge variant={getPriorityColor(task.priority) as any}>
                          {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        {task.description.length > 100
                          ? `${task.description.substring(0, 100)}...`
                          : task.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={getStatusColor(task.status) as any}
                          className="flex items-center"
                        >
                          {getStatusIcon(task.status)}
                          {getStatusLabel(task.status)}
                        </Badge>
                        <div
                          className={`flex items-center text-sm ${getDueDateColor(task.dueDate)}`}
                        >
                          <Calendar size={14} className="mr-1" />
                          {getDueDateLabel(task.dueDate)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-2">
                      {task.status !== "completed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() =>
                            handleQuickStatusChange(task, "completed")
                          }
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Complete
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => handleQuickStatusChange(task, "todo")}
                        >
                          <AlertCircle size={14} className="mr-1" />
                          Reopen
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditClick(task)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this task? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTask(task.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Filtered tabs */}
          <TabsContent value="todo">{renderFilteredTasks("todo")}</TabsContent>
          <TabsContent value="in-progress">
            {renderFilteredTasks("in-progress")}
          </TabsContent>
          <TabsContent value="completed">
            {renderFilteredTasks("completed")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Helper function to render filtered tasks by status
  function renderFilteredTasks(status: Task["status"]) {
    const filteredTasks = filteredAndSortedTasks.filter(
      (task) => task.status === status,
    );

    if (loading) {
      return (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <p className="text-muted-foreground">
            No {getStatusLabel(status).toLowerCase()} tasks found.
          </p>
        </div>
      );
    }

    return viewMode === "list" ? (
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className={`overflow-hidden transition-all hover:shadow-md ${task.status === "completed" ? "bg-muted/30" : ""}`}
          >
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {task.status === "completed" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-green-500/20 text-green-500"
                          onClick={() => handleQuickStatusChange(task, "todo")}
                        >
                          <CheckCircle size={14} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-muted"
                          onClick={() =>
                            handleQuickStatusChange(task, "completed")
                          }
                        >
                          <div className="h-3 w-3 rounded-full" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-semibold ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(task)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Task</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this task? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTask(task.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center mt-4">
                  <Badge variant={getPriorityColor(task.priority) as any}>
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}{" "}
                    Priority
                  </Badge>
                  <div
                    className={`flex items-center text-sm ${getDueDateColor(task.dueDate)}`}
                  >
                    <Calendar size={14} className="mr-1" />
                    {getDueDateLabel(task.dueDate)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className={`overflow-hidden transition-all hover:shadow-md ${task.status === "completed" ? "bg-muted/30" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle
                  className={`${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </CardTitle>
                <Badge variant={getPriorityColor(task.priority) as any}>
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </Badge>
              </div>
              <CardDescription className="mt-2">
                {task.description.length > 100
                  ? `${task.description.substring(0, 100)}...`
                  : task.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center text-sm ${getDueDateColor(task.dueDate)}`}
                >
                  <Calendar size={14} className="mr-1" />
                  {getDueDateLabel(task.dueDate)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              {task.status !== "completed" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => handleQuickStatusChange(task, "completed")}
                >
                  <CheckCircle size={14} className="mr-1" />
                  Complete
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => handleQuickStatusChange(task, "todo")}
                >
                  <AlertCircle size={14} className="mr-1" />
                  Reopen
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEditClick(task)}
              >
                <Pencil size={14} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteTask(task.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
};

export default TaskList;
