import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getUserData } from "@/lib/dal";




export default async function ProfilePage() {
  const {user: data} = await getUserData();

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader className="flex flex-col items-center space-y-2">
          <Avatar className="w-28 h-28">
            {data.avatar ? (
              <AvatarImage src={data.avatar} alt={`${data.first_name} ${data.last_name}`} />
            ) : (
              <AvatarFallback>{data.first_name[0]}{data.last_name[0]}</AvatarFallback>
            )}
          </Avatar>
          <CardTitle className="text-2xl font-bold">
            {data.first_name} {data.last_name}
          </CardTitle>
          {data.title && <p className="text-gray-500">{data.title}</p>}
        </CardHeader>

        <CardContent className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-gray-800">{data.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Location</p>
              <p className="text-gray-800">{data.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-gray-800">{data.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Provider</p>
              <p className="text-gray-800">{data.provider}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Access</p>
              <p className="text-gray-800">{new Date(data.last_access).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email Notifications</p>
              <p className="text-gray-800">{data.email_notifications ? "Enabled" : "Disabled"}</p>
            </div>
          </div>

          <Separator className="my-4" />

      
        </CardContent>
      </Card>
    </div>
  );
}
