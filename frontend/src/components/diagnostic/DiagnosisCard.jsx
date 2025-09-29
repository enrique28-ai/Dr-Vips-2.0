import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import Button from "../forms/Button.jsx";

export default function DiagnosisCard({ diagnosis, patientId, onDeleted, isDeleting }) {
  const title =
    (diagnosis?.title && String(diagnosis.title)) ||
    (diagnosis?.Diagnostic && String(diagnosis.Diagnostic)) ||
    "Untitled";

  const updated = diagnosis?.updatedAt
    ? new Date(diagnosis.updatedAt).toLocaleString()
    : "—";

  const handleDelete = useCallback((e) => {
    e.preventDefault();
    if (isDeleting) return;
    if (!window.confirm("Delete this diagnosis? This cannot be undone.")) return;
    onDeleted?.(diagnosis._id);
  }, [isDeleting, onDeleted, diagnosis?._id]);

  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold mb-1">
        <Link
          to={`/diagnosis/patient/${patientId}/${diagnosis._id}`}
          className="hover:underline"
        >
          {title}
        </Link>
      </h3>
      <p className="mb-4 text-sm text-gray-600">Updated: {updated}</p>

      <div className="mt-auto grid grid-cols-2 gap-2">
        <Link to={`/diagnosis/patient/${patientId}/${diagnosis._id}/edit`}>
          <Button
            variant="secondary"
            className="w-full inline-flex items-center justify-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full inline-flex items-center justify-center gap-2 hover:text-red-600 disabled:opacity-50"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </article>
  );
}
