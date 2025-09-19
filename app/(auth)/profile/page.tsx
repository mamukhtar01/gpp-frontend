import { TUser } from "@/app/types";
import { ProfileAvatarSection } from "@/components/profile/ProfileActionBar";
import { ProfileActionsBar } from "@/components/profile/ProfileActionsBar";
import { InfoRow } from "@/components/profile/ProfileInfoRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserData } from "@/lib/dal";
import { MailIcon, PhoneIcon, UserIcon, ShieldIcon } from "lucide-react";

export default async function ProfilePage() {
  const { user, success } = await getUserData();

  if (!success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-brand-500 text-center">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <ProfileActionsBar />
      <div className="mb-10 flex flex-col items-center">
        <h1
          className="text-4xl font-bold tracking-tight text-brand-700"
          style={{ color: "var(--color-brand-700)" }}
        >
          Profile
        </h1>
        <p className="mt-2 text-lg" style={{ color: "var(--color-brand-400)" }}>
          Manage your personal information and account details
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <ProfileAvatarSection user={user as TUser} />
        <Card
          className="col-span-2 shadow-lg border-0"
          style={{ backgroundColor: "var(--color-brand-50)" }}
        >
          <CardHeader>
            <CardTitle
              className="text-xl flex items-center gap-2 text-brand-600"
              style={{ color: "var(--color-brand-600)" }}
            >
              <UserIcon className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InfoRow
              icon={
                <UserIcon
                  className="w-4 h-4"
                  style={{ color: "var(--color-brand-500)" }}
                />
              }
              label="Full Name"
              value={`${user.first_name} ${user.last_name}`}
            />
            <Separator />
            <InfoRow
              icon={
                <MailIcon
                  className="w-4 h-4"
                  style={{ color: "var(--color-brand-500)" }}
                />
              }
              label="Email"
              value={user.email ?? "—"}
            />
            <Separator />
            <InfoRow
              icon={
                <PhoneIcon
                  className="w-4 h-4"
                  style={{ color: "var(--color-brand-500)" }}
                />
              }
              label="Phone"
              value={"456677773"}
              editableField="phone"
             
            />
            <Separator />
            <InfoRow
              icon={
                <ShieldIcon
                  className="w-4 h-4"
                  style={{ color: "var(--color-brand-500)" }}
                />
              }
              label="Role"
              value={user.role?.toString() ?? "Standard User"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
