'use client';
import { FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function Header({ title, rightContent, showBack = true, className = '' }) {
  const router = useRouter();

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-40 ${className}`}>
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <FiChevronLeft className="w-5 h-5 text-dark" />
          </button>
        )}
        <h1 className="text-lg font-bold text-dark">{title}</h1>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}
