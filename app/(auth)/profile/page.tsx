import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const data = {
  first_name: "Mukhtar",
  last_name: "Mohamed",
  title: "Software Engineer",
  avatar: null, // or provide a URL to an image
};

export default async function ProfilePage() {
  return (
    <div className="min-h-screen min-w-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader className="flex flex-col items-center space-y-2">
          <Avatar className="w-28 h-28">
            {data.avatar ? (
              <AvatarImage
                src={data.avatar}
                alt={`${data.first_name} ${data.last_name}`}
              />
            ) : (
              <AvatarFallback>
                {data.first_name[0]}
                {data.last_name[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <CardTitle className="text-2xl font-bold">
            {data.first_name} {data.last_name}
          </CardTitle>
          {data.title && <p className="text-gray-500">{data.title}</p>}
        </CardHeader>

        <CardContent className="mt-4">
          <h1 className="text-lg font-semibold">Profile Information</h1>

          <Separator className="my-4" />
        </CardContent>
      </Card>
    </div>
  );
}
