import { FC } from 'react';
import { Task } from '../../types/database';
import { ListTodo, CheckCircle2, Clock } from 'lucide-react';

interface DashboardStatsProps {
  tasks: Task[];
}

export const DashboardStats: FC<DashboardStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Tasks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <ListTodo className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</p>
          <p className="text-2xl font-bold text-white mt-0.5">{total}</p>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Tasks</p>
          <p className="text-2xl font-bold text-white mt-0.5">{active}</p>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</p>
          <p className="text-2xl font-bold text-white mt-0.5">{completed}</p>
        </div>
      </div>
    </div>
  );
};
