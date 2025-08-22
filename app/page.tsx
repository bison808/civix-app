export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          CITZN - Directing Democracy
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Citizen engagement platform for government transparency
        </p>
        <div className="text-center">
          <p className="text-green-600 font-semibold">
            ✅ Minimal deployment successful!
          </p>
        </div>
      </div>
    </div>
  );
}