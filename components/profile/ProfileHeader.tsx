export function ProfileHeader() {
  return (
    <div className="mb-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold tracking-tight text-brand-700" style={{ color: "var(--color-brand-700)" }}>
        Profile
      </h1>
      <p className="mt-2 text-lg" style={{ color: "var(--color-brand-400)" }}>
        Your account information and details
      </p>
    </div>
  );
}