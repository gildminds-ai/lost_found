import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Server,
  Code2,
  FileCode,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalItems: number;
  availableItems: number;
  rentedItems: number;
  totalRequests: number;
  onResetDatabase: () => Promise<void>;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  totalItems,
  availableItems,
  rentedItems,
  totalRequests,
  onResetDatabase,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reset the database to default sample college items? This is useful for restarting a clean hackathon demo.'
      )
    ) {
      return;
    }

    try {
      setIsResetting(true);
      await onResetDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs">
      <div
        id="db-status-modal"
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 sm:px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                Database &amp; Persistence Architecture
              </h2>
              <p className="text-xs text-stone-500">
                Verified full-stack server persistence for hackathon judges
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status highlight */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Firebase Cloud Firestore Active</p>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                This app is connected to <strong>Google Cloud Firestore</strong> (<code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded">items</code> &amp; <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded">rentals</code> collections) mediated through the Express backend with atomic transaction checks. All listings, rental requests, and availability states persist permanently across server restarts, browser refreshes, and multi-user devices.
              </p>
            </div>
          </div>

          {/* Metrics summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Current Live Data Metrics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-2xs text-stone-500 uppercase font-semibold">Total Items</span>
                <p className="text-xl font-bold text-stone-900 mt-0.5">{totalItems}</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-2xs text-emerald-600 uppercase font-semibold">Available</span>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">{availableItems}</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-2xs text-amber-600 uppercase font-semibold">Rented Out</span>
                <p className="text-xl font-bold text-amber-700 mt-0.5">{rentedItems}</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-2xs text-sky-600 uppercase font-semibold">Requests</span>
                <p className="text-xl font-bold text-sky-700 mt-0.5">{totalRequests}</p>
              </div>
            </div>
          </div>

          {/* Endpoints */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Active REST API Endpoints
            </h4>
            <div className="rounded-xl border border-stone-200 overflow-hidden divide-y divide-stone-100 text-xs font-mono">
              <div className="px-3.5 py-2 bg-stone-50 flex items-center justify-between">
                <span className="text-emerald-700 font-semibold">GET /api/items</span>
                <span className="text-stone-500 font-sans text-2xs">Fetches all items</span>
              </div>
              <div className="px-3.5 py-2 bg-white flex items-center justify-between">
                <span className="text-sky-700 font-semibold">POST /api/items</span>
                <span className="text-stone-500 font-sans text-2xs">Validates &amp; inserts item</span>
              </div>
              <div className="px-3.5 py-2 bg-stone-50 flex items-center justify-between">
                <span className="text-emerald-700 font-semibold">GET /api/rentals</span>
                <span className="text-stone-500 font-sans text-2xs">Fetches rental requests</span>
              </div>
              <div className="px-3.5 py-2 bg-white flex items-center justify-between">
                <span className="text-sky-700 font-semibold">POST /api/rentals</span>
                <span className="text-stone-500 font-sans text-2xs">Records request &amp; reserves item</span>
              </div>
              <div className="px-3.5 py-2 bg-stone-50 flex items-center justify-between">
                <span className="text-amber-700 font-semibold">PATCH /api/items/:id/status</span>
                <span className="text-stone-500 font-sans text-2xs">Updates available / rented</span>
              </div>
            </div>
          </div>

          {/* Reset Demo Option */}
          <div className="pt-3 border-t border-stone-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div>
                <p className="font-semibold text-xs text-stone-800">
                  Demo Reset Utility
                </p>
                <p className="text-2xs text-stone-500 mt-0.5">
                  Re-seeds default college items &amp; resets test requests for judging
                </p>
              </div>

              <button
                id="reset-db-btn"
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetting...' : 'Reset to Default Items'}</span>
              </button>
            </div>

            {resetSuccess && (
              <p className="mt-2 text-xs text-emerald-700 font-medium text-center">
                ✓ Database reset to original sample items successfully!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 px-5 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
