import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Task, FilterStatus, PriorityFilter, CreateTaskInput } from '../types/database';
import { Navbar } from '../components/layout/Navbar';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { FilterBar } from '../components/dashboard/FilterBar';
import { TaskList } from '../components/tasks/TaskList';
import { TaskModal } from '../components/tasks/TaskModal';
import { DeleteConfirmModal } from '../components/tasks/DeleteConfirmModal';
import { AlertCircle } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Fetch Tasks from Supabase Database
  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Create or Update Task
  const handleSaveTask = async (input: CreateTaskInput) => {
    if (!user) return;

    if (editingTask) {
      // UPDATE Operation
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({
          title: input.title,
          description: input.description ?? null,
          priority: input.priority,
          due_date: input.due_date ?? null,
        })
        .eq('id', editingTask.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    } else {
      // INSERT Operation
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: input.title,
            description: input.description ?? null,
            priority: input.priority,
            due_date: input.due_date ?? null,
            completed: false,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setTasks((prev) => [data, ...prev]);
    }
  };

  // Toggle Completion
  const handleToggleComplete = async (task: Task) => {
    const updatedStatus = !task.completed;

    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t))
    );

    const { error: toggleError } = await supabase
      .from('tasks')
      .update({ completed: updatedStatus })
      .eq('id', task.id);

    if (toggleError) {
      // Rollback on error
      fetchTasks();
      setError(toggleError.message);
    }
  };

  // Confirm Delete Task
  const handleConfirmDelete = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Filter Tasks Memoization
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status Filter
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? !task.completed
          : task.completed;

      // Priority Filter
      const matchesPriority =
        priorityFilter === 'all' ? true : task.priority === priorityFilter;

      // Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === ''
          ? true
          : task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query));

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Counters Header */}
        <DashboardStats tasks={tasks} />

        {/* Filter Controls & Search */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onOpenCreateModal={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        />

        {/* Tasks List */}
        <TaskList
          tasks={filteredTasks}
          loading={loading}
          onToggleComplete={handleToggleComplete}
          onEdit={(task) => {
            setEditingTask(task);
            setIsModalOpen(true);
          }}
          onDeleteRequest={(task) => setDeletingTask(task)}
          onOpenCreateModal={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        />
      </main>

      {/* Task Add / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
