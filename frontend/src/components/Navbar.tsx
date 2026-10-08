'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-white font-bold text-lg">Health Triage AI</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/') ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>

            <Link
              href="/login"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/login') ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Login
            </Link>

            <Link
              href="/consent"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/consent') ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Consent
            </Link>

            <Link
              href="/intake"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/intake') ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Intake
            </Link>

            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/dashboard') ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/ai-chat"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/ai-chat') ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              AI Chat
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
