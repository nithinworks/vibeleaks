import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Security Hygiene", value: 28, color: "hsl(0, 84%, 60%)" },
  { name: "Burnout / Consistency", value: 25, color: "hsl(12, 78%, 55%)" },
  { name: "No Validation", value: 20, color: "hsl(45, 100%, 51%)" },
  { name: "Poor Structure", value: 15, color: "hsl(145, 63%, 49%)" },
  { name: "Over-engineering", value: 12, color: "hsl(182, 53%, 51%)" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-primary-hover font-bold">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-col gap-2 mt-6">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">
            {entry.value} → {data[index].value}%
          </span>
        </div>
      ))}
    </div>
  );
};

export const ProjectFailuresSection = () => {
  return (
    <div className="relative py-16" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              Why Most Vibe-Coded Projects Fade Too Soon
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Even the best indie projects lose their spark too soon — not because the code was bad, but because small blind spots grew big.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Security lapses, burnout, and lack of validation quietly kill more vibe-coded projects than bugs ever do.
            </p>
          </div>

          {/* Right side - Pie chart */}
          <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
