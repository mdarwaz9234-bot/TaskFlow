import { FC } from 'react';
import { Task, PriorityLevel } from '../../types/database';
import { Check, Edit2, Trash2, Calendar } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
}

export const TaskItem: FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDeleteRequest,
}) => {
  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div
      className={`group bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md ${
        task.completed
          ? 'border-slate-800/60 bg-slate-900/40 opacity-75'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox Button */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            task.completed
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-slate-700 bg-slate-950 hover:border-indigo-500 text-transparent'
          }`}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-base font-semibold tracking-tight transition-all ${
                task.completed ? 'line-through text-slate-500' : 'text-white'
              }`}
            >
              {task.title}
            </h3>

            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p
              className={`text-sm leading-relaxed ${
                task.completed ? 'line-through text-slate-600' : 'text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {task.due_date && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Due {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Actions (Edit & Delete) */}
        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Edit Task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteRequest(task)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
