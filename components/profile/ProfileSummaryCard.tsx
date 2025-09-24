import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TUser } from "@/lib/schema";

export function ProfileSummaryCard({ user }: { user: TUser }) {
  return (
    <Card
      className="col-span-1 shadow-lg border-0"
      style={{
        background: "linear-gradient(180deg, var(--color-brand-50) 0%, #fff 100%)",
      }}
    >
      <CardHeader className="flex flex-col items-center text-center gap-2">
        <div className="relative">
          <div
            className="h-28 w-28 flex items-center justify-center rounded-full shadow-lg border-4 border-white bg-brand-200 text-brand-700 text-5xl font-bold select-none"
            style={{
              backgroundColor: "var(--color-brand-200)",
              color: "var(--color-brand-700)",
            }}
          >
            {user.first_name[0]}
            {user.last_name[0]}
          </div>
        </div>
        <CardTitle className="mt-4 text-2xl font-bold text-brand-700" style={{ color: "var(--color-brand-700)" }}>
          {user.first_name} {user.last_name}
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 text-xs rounded bg-brand-100 text-brand-900" style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand-900)" }}>
            {user.role?.name}
          </span>
        </div>
        <p className="text-sm mt-2" style={{ color: "var(--color-brand-400)" }}>
          {user.email}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-xs mt-4" style={{ color: "var(--color-brand-700)" }}>
        <span className="mt-1 text-[10px] text-brand-300">
          User ID: {user.id}
        </span>
      </CardContent>
    </Card>
  );
}