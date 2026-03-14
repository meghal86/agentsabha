export function SeverityBar({ items }: { items: Array<{ label: string; value: number; tone: string }> }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm text-neela">
            <span>{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
          <div className="h-2 bg-neela/10">
            <div className="h-2" style={{ width: `${item.value}%`, backgroundColor: item.tone }} />
          </div>
        </div>
      ))}
    </div>
  );
}

