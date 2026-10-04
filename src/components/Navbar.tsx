import React from 'react';
import { PackagePlus, RefreshCw, Layers, Database, Sparkles, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenListItem: () => void;
  onOpenRequests: () => void;
  onOpenDbStatus: () => void;
  requestsCount: number;
  dbConnected: boolean;
  totalItemsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenListItem,
  onOpenRequests,
  onOpenDbStatus,
  requestsCount,
  dbConnected,
  totalItemsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-stone-900 tracking-tight">
                  Rent &amp; Reuse
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" /> Campus Sharing
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Borrow, rent &amp; lend college essentials without buying new
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Database Pill */}
            <button
              id="db-status-pill-button"
              type="button"
              onClick={onOpenDbStatus}
              title="Click to view database connection details and API info"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Database className="w-3.5 h-3.5 text-stone-600 hidden md:inline" />
              <span className="hidden md:inline">Database:</span>
              <span className="font-semibold text-stone-900">{totalItemsCount} Items</span>
            </button>

            {/* Requests / Activity */}
            <button
              id="view-requests-button"
              type="button"
              onClick={onOpenRequests}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            >
              <Layers className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Rental Requests</span>
              <span className="sm:hidden">Requests</span>
              {requestsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                  {requestsCount}
                </span>
              )}
            </button>

            {/* List an Item CTA */}
            <button
              id="list-item-header-button"
              type="button"
              onClick={onOpenListItem}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 transition-all hover:shadow-md"
            >
              <PackagePlus className="w-4 h-4" />
              <span>List an Item</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
