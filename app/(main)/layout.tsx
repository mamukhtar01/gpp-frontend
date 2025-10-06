
import LayoutContainer from "@/components/custom/layout-container";
import { UserDataProvider } from "../context/UserContext";
import { getUserData } from "@/lib/dal";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

 const res = await getUserData();

  return (
    <>
      {
        <LayoutContainer>
          <UserDataProvider user={res?.user ?? null}>{children}</UserDataProvider>
        </LayoutContainer>
      }
    </>
  );
}
