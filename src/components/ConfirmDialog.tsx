import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDark: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  isDark,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  const overlay = isDark ? "bg-black/50" : "bg-black/30";
  const card = isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const text = isDark ? "text-gray-200" : "text-gray-800";
  const sub = isDark ? "text-gray-400" : "text-gray-500";
  const cancelBtn = isDark
    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";
  const confirmBtn = "bg-red-600 text-white hover:bg-red-500";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlay} backdrop-blur-sm`}
      onClick={onCancel}
    >
      <div
        className={`w-80 rounded-xl border shadow-2xl p-6 ${card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-sm font-semibold mb-2 ${text}`}>{title}</h3>
        <p className={`text-xs leading-relaxed mb-5 ${sub}`}>{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className={`px-4 py-1.5 text-xs rounded-lg border transition-colors ${cancelBtn}`}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs rounded-lg transition-colors ${confirmBtn}`}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}
