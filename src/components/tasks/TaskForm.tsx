import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskFormProps {
  onSubmit: (data: Task | Omit<Task, "id" | "createdAt">) => void;
  onCancel: () => void;
  initialData?: Task | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(500),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in-progress", "completed"]),
  dueDate: z.date(),
  createdAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TaskForm = ({ onSubmit, onCancel, initialData }: TaskFormProps) => {
  const [loading, setLoading] = useState(false);

  const defaultValues: Partial<FormValues> = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "medium",
    status: initialData?.status || "todo",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(),
    id: initialData?.id,
    createdAt: initialData?.createdAt,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Convert the form data to match the Task interface
      const taskData: Task | Omit<Task, "id" | "createdAt"> = {
        ...values,
        dueDate: values.dueDate.toISOString(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      onSubmit(taskData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <AlertCircle size={16} className="mr-2" />;
      case "in-progress":
        return <Clock size={16} className="mr-2" />;
      case "completed":
        return <CheckCircle size={16} className="mr-2" />;
      default:
        return null;
    }
  };

  const setDueDatePreset = (days: number) => {
    form.setValue("dueDate", addDays(new Date(), days));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? "Edit Task" : "Add New Task"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Task description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {["low", "medium", "high"].map((priority) => (
                        <Button
                          key={priority}
                          type="button"
                          variant={
                            field.value === priority ? "default" : "outline"
                          }
                          className={`flex items-center justify-center gap-2 ${field.value === priority ? "border-2 border-primary" : ""}`}
                          onClick={() => field.onChange(priority)}
                        >
                          <Badge
                            variant={getPriorityColor(priority) as any}
                            className="h-2 w-2 rounded-full p-0"
                          />
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "todo", label: "To Do" },
                        { value: "in-progress", label: "In Progress" },
                        { value: "completed", label: "Completed" },
                      ].map((status) => (
                        <Button
                          key={status.value}
                          type="button"
                          variant={
                            field.value === status.value ? "default" : "outline"
                          }
                          className={`flex items-center justify-center ${field.value === status.value ? "border-2 border-primary" : ""}`}
                          onClick={() => field.onChange(status.value)}
                        >
                          {getStatusIcon(status.value)}
                          {status.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDueDatePreset(0)}
                      >
                        Today
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDueDatePreset(1)}
                      >
                        Tomorrow
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDueDatePreset(7)}
                      >
                        Next Week
                      </Button>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={"w-full pl-3 text-left font-normal"}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TaskForm;
