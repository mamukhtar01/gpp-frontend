"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { createUKTBCaseMember } from "@/app/server_actions";

const initialForm = {
  First_Name: "",
  Last_Name: "",
  Sex: "",
  date_of_birth: "",
  telephone: "",
  passport: "",
  email: "",
  appointment_date: "",
  location: "",
  Country: 2,     // todo. fetch from api 
  Currency: 4,    // todo. fetch from api
  native_name: "",
  exam_date: "",
};

const sexOptions = [
  { value: "", label: "Select Sex" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" }
];

export default function UKTBMemberRegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createUKTBCaseMember(form);
      if (!res?.id) throw new Error("Failed to register member.");
      router.push(`/uktb-case/${res.id}`);
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Card className="w-full max-w-3xl shadow-2xl rounded-2xl border-0">
        <CardHeader className="py-8 px-12 bg-blue-100 rounded-t-2xl">
          <CardTitle className="text-3xl font-bold tracking-tight text-blue-900">
            Register UKTB Case Member
          </CardTitle>
        </CardHeader>
        <Separator className="my-0" />
        <CardContent className="py-10 px-12">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name<span className="text-red-500">*</span>
                </label>
                <Input
                  name="First_Name"
                  value={form.First_Name}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <Input
                  name="Last_Name"
                  value={form.Last_Name}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="h-12 text-lg"
                />
              </div>
              {/* Sex dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sex<span className="text-red-500">*</span>
                </label>
                <select
                  name="Sex"
                  value={form.Sex}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg rounded-md border-gray-300 w-full focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  {sexOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth<span className="text-red-500">*</span>
                </label>
                <Input
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone<span className="text-red-500">*</span>
                </label>
                <Input
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="Telephone"
                  required
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport No.<span className="text-red-500">*</span>
                </label>
                <Input
                  name="passport"
                  value={form.passport}
                  onChange={handleChange}
                  placeholder="Passport No."
                  required
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email<span className="text-red-500">*</span>
                </label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="h-12 text-lg"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date<span className="text-red-500">*</span>
                </label>
                <Input
                  name="appointment_date"
                  type="date"
                  value={form.appointment_date}
                  onChange={handleChange}
                  required
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location<span className="text-red-500">*</span>
                </label>
                <Input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Location"
                  required
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Native Name
                </label>
                <Input
                  name="native_name"
                  value={form.native_name}
                  onChange={handleChange}
                  placeholder="Native Name"
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Date
                </label>
                <Input
                  name="exam_date"
                  type="date"
                  value={form.exam_date}
                  onChange={handleChange}
                  className="h-12 text-lg"
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-base font-semibold text-center">{error}</div>
            )}
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                className="w-full md:w-1/2 h-14 text-lg font-bold bg-blue-800 hover:bg-blue-900 transition"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}