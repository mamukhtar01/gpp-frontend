import { getUKTBCaseMemberById } from "@/app/server_actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GoBackBtn from "@/components/custom/gobackbtn";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface PageProps {
  params: Promise<{ memberId: string }>;
  searchParams?: Promise<{ [key: string]: string }>;
}

export default async function UKTBCaseMemberPage({ params }: PageProps) {
  const { memberId } = await params;
  if (!memberId || memberId.trim() === "") {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <h2 className="text-lg text-red-600">Invalid member ID.</h2>
      </div>
    );
  }

  // Fetch case member details from server action
  const member = await getUKTBCaseMemberById(memberId);

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center">
        <div className="ml-auto flex">
          <GoBackBtn />
        </div>
        <h2 className="text-lg text-red-600">Case member not found.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-4xl">
        <GoBackBtn />
        <Card className="w-full max-w-4xl shadow-lg border border-gray-200 rounded-2xl mt-4">
          <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-blue-700">
              UKTB Case Member Details
            </CardTitle>
          </CardHeader>
          <Separator className="mb-4" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Detail label="First Name" value={member.First_Name} />
              <Detail label="Last Name" value={member.Last_Name} />
              <Detail label="Native Name" value={member.native_name} />
              <Detail label="Sex" value={member.Sex} />
              <Detail label="Date of Birth" value={member.date_of_birth} />
              <Detail label="Passport" value={member.passport} />
              <Detail label="Exam Date" value={member.exam_date} />
              <Detail label="Appointment Date" value={member.appointment_date} />
              <Detail label="Appointment Time" value={member.appointment_time} />
              <Detail label="Location" value={member.location} />
              <Detail label="Telephone" value={member.telephone} />
              <Detail label="Amount" value={member.amount} />
            </div>
            <div className="flex justify-end mt-8">
              <Link href={`/uktb-case/register?memberId=${member.id}`}>
                <Button variant="outline" className="text-blue-700 border-blue-700 hover:bg-blue-50 font-semibold">Update</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-1 bg-gray-100 rounded-lg p-4">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-lg text-gray-900 font-semibold break-words">
        {value ?? "-"}
      </span>
    </div>
  );
}
