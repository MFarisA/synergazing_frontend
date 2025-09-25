export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ✅ Auth Route Working!
        </h1>
        <p className="text-gray-700 mb-4">
          If you can see this page, the auth routing is working correctly in production.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm text-blue-800">
            <strong>Test URL:</strong> /auth/test
          </p>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Created: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
}
