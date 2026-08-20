import { FC, useState } from 'react';
import { Task } from '../../types/database';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  task: Task | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  task,
  onClose,
  onConfirmDelete,
}) => {
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirmDelete(task.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-150 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Delete Task?</h3>
          <p className="text-sm text-slate-400">
            Are you sure you want to permanently delete <strong className="text-slate-200">"{task.title}"</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-1/2 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete Task</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
