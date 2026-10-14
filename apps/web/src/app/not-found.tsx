import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <h2 className="text-3xl font-bold font-mono text-white">404 - Page Not Found</h2>
      <p className="text-xs font-mono text-gray-400">The requested treasury view could not be located.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-colors"
      >
        Return to Overview
      </Link>
    </div>
  );
}
