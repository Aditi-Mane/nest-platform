import { Card, CardContent } from "./ui/card";

export function StatCard({ title, value, icon: Icon, trend, gradient }) {
  return (
    <Card
      className={`rounded-2xl border-border ${
        gradient
          ? "bg-linear-to-br from-[#2563EB] to-[#10B981] text-white border-0"
          : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm ${
              gradient ? "text-white/80" : "text-muted-foreground"
            }`}
          >
            {title}
          </span>

          <Icon
            className={`h-5 w-5 ${
              gradient ? "text-white/80" : "text-muted-foreground"
            }`}
          />
        </div>

        <div className="space-y-1">
          <div className="text-3xl">{value}</div>

          {trend && (
            <div
              className={`text-sm ${
                gradient
                  ? "text-white/80"
                  : trend.positive
                  ? "text-[#10B981]"
                  : "text-red-500"
              }`}
            >
              {trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}