"use client";

import { useState } from "react";

export default function ReportIncidentModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState("retraso");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Intentar obtener ubicación del usuario (simplificado)
      let lat = 19.4326; // Zócalo por defecto
      let lon = -99.1332;

      // Simulate a random location nearby the center
      lat += (Math.random() - 0.5) * 0.05;
      lon += (Math.random() - 0.5) * 0.05;

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description, lat, lon }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setDescription("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Reportar Incidente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo de Incidente</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="retraso">Retraso</option>
              <option value="accidente">Accidente</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe lo que sucede..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="bg-[#e8734a] hover:bg-[#d4623a] text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Reportar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
