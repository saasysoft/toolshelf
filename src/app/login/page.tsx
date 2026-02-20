import type { Metadata } from 'next';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to bookmark tools and manage your profile.
          </p>
        </div>

        <AuthForm mode="login" />

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
