import { CaseProvider } from "./caseContext";

export default function NepalQRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="nepal-qr-layout">
        <CaseProvider>
          {children}
        </CaseProvider>
    </div>
  );
}
