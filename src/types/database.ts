export type PriorityLevel = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';
export type PriorityFilter = 'all' | PriorityLevel;

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: PriorityLevel;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: PriorityLevel;
  due_date?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: PriorityLevel;
  due_date?: string | null;
  completed?: boolean;
}

export interface Profile {
  id: string;
  avatar_url: string | null;
  display_name: string | null;
  updated_at?: string;
}
