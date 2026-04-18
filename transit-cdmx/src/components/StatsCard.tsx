interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export default function StatsCard({
  label,
  value,
  sublabel,
  color = "#e8734a",
}: StatsCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-3xl font-bold mt-1" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}
