import { WHEELCHAIR_LABELS, WHEELCHAIR_COLORS } from "@/lib/constants";
import type { StopFeatureProperties } from "@/lib/types";

interface StopPopupProps {
  properties: StopFeatureProperties;
}

export default function StopPopup({ properties: p }: StopPopupProps) {
  const accessColor = WHEELCHAIR_COLORS[p.wheelchair_boarding] || "#6b7280";
  const accessLabel = WHEELCHAIR_LABELS[p.wheelchair_boarding] || "Desconocido";

  return (
    <div className="min-w-[200px]">
      <h3 className="font-bold text-base">{p.stop_name}</h3>
      <div
        className="text-xs mt-1 px-2 py-0.5 rounded inline-block"
        style={{ backgroundColor: accessColor + "33", color: accessColor }}
      >
        {accessLabel}
      </div>
      {p.routes.length > 0 && (
        <div className="mt-2 text-xs text-gray-300">
          <strong>Rutas:</strong> {p.routes.slice(0, 8).join(", ")}
          {p.routes.length > 8 && ` +${p.routes.length - 8} mas`}
        </div>
      )}
      {p.agencies.length > 0 && (
        <div className="mt-1 text-xs text-gray-400">
          {p.agencies.join(", ")}
        </div>
      )}
    </div>
  );
}
