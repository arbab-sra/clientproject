'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiActivity, FiGift, FiStar, FiUser } from 'react-icons/fi';

const navItems = [
  { href: '/', icon: FiHome, label: 'Home' },
  { href: '/activity', icon: FiActivity, label: 'Activity' },
  { href: '/promotion', icon: FiGift, label: 'Get ₹500', isSpecial: true },
  { href: '/spinner', icon: FiStar, label: 'Promotion' },
  { href: '/account', icon: FiUser, label: 'Account' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide nav on auth pages
  if (['/login', '/signup'].includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] mt-0.5 font-bold text-primary">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
