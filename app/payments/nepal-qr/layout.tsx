import { CaseProvider } from "./caseContext";

export default function NepalQRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="nepal-qr-layout flex w-full justify-center">
        <CaseProvider>
          {children}
        </CaseProvider>
    </div>
  );
}
