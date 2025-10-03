import LayoutContainer from "@/components/custom/layout-container";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{<LayoutContainer>{children}</LayoutContainer>}</>;
}
