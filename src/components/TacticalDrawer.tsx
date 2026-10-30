'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface TacticalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function TacticalDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: TacticalDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#02050B]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gradient-to-b from-[#071525] to-[#030B14] border-l border-[#00F5D4]/20 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#0E1B2E] flex items-center justify-between bg-[#040D18]/80">
            <div>
              <h3 className="font-display text-base text-[#FFFFFF] tracking-wide flex items-center gap-2">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[#8AA4C4] mt-0.5 font-mono">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#8AA4C4] hover:text-[#FFFFFF] bg-[#03080F] hover:bg-[#0E1B2E] border border-[#0E1B2E] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

