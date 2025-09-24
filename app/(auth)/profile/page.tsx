import { ProfileActionsBar } from "@/components/profile/ProfileActionBar";
import { ProfileDetailsCard } from "@/components/profile/ProfileDetailsCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSummaryCard } from "@/components/profile/ProfileSummaryCard";
import { getUserData } from "@/lib/dal";
import { TUser } from "@/lib/schema";




export default async function ProfilePage() {

  const { user , success} = await getUserData();
  if (!user || !success) {
    // Handle the case where user data could not be fetched
    return <div className="container mx-auto max-w-4xl py-10">Failed to load user data.</div>;
  }
  return (
    <div className="container mx-auto max-w-4xl py-10">
      <ProfileActionsBar />
      <ProfileHeader />
      <div className="grid md:grid-cols-3 gap-8">
        <ProfileSummaryCard user={user as TUser} />
        <ProfileDetailsCard user={user as TUser} />
      </div>
    </div>
  );
}