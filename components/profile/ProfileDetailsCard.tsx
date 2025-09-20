import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MailIcon, UserIcon, ShieldIcon, GlobeIcon, MapPinIcon, Building2Icon } from "lucide-react";
import { InfoRow } from "./ProfileInfoRow";
import { TUser } from "@/lib/schema";

export function ProfileDetailsCard({ user }: { user: TUser }) {
  return (
    <Card className="col-span-2 shadow-lg border-0" style={{ backgroundColor: "var(--color-brand-50)" }}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-brand-600" style={{ color: "var(--color-brand-600)" }}>
          <UserIcon className="w-5 h-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <InfoRow
          icon={<UserIcon className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />}
          label="Full Name"
          value={`${user.first_name} ${user.last_name}`}
        />
        <Separator />
        <InfoRow
          icon={<MailIcon className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />}
          label="Email"
          value={user.email}
        />
        <Separator />
        <InfoRow
          icon={<ShieldIcon className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />}
          label="Role"
          value={user.role?.name}
        />
        <Separator />
        <InfoRow
          icon={<Building2Icon className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />}
          label="Clinic"
          value={user.Clinic?.Name}
        />
        <Separator />
        <InfoRow
          icon={<MapPinIcon className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />}
          label="Clinic City"
          value={user.Clinic?.City}
        />
        <Separator />
        <InfoRow
          icon={<GlobeIcon className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />}
          label="Country"
          value={user.Country?.country}
        />
      </CardContent>
    </Card>
  );
}