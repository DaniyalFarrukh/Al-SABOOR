import Link from 'next/link';
import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: '404 - Page Not Found',
    description: 'Sorry, the page you are looking for could not be found.',
  };
};

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-5xl font-extrabold text-gray-800">404 – Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-600">
        Sorry, the page you are looking for could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
}
