import React, { useState } from 'react';
import { RentalRequest, Item } from '../types';
import {
  X,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  Mail,
  User,
  RotateCcw,
  ArrowRight,
  Database,
  Search,
} from 'lucide-react';

interface RequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: RentalRequest[];
  onMarkItemReturned: (itemId: string, requestId: string) => Promise<void>;
  items: Item[];
}

export const RequestsModal: React.FC<RequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onMarkItemReturned,
  items,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRequests = requests.filter(
    (req) =>
      req.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReturn = async (itemId: string, requestId: string) => {
    try {
      setUpdatingId(requestId);
      await onMarkItemReturned(itemId, requestId);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs">
      <div
        id="requests-database-modal"
        className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 sm:px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                Submitted Rental Requests
              </h2>
              <p className="text-xs text-stone-500">
                Stored persistently in database • Total {requests.length} requests logged
              </p>
            </div>
          </div>

          <button
            id="close-requests-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Filter */}
        <div className="px-5 sm:px-6 py-3 bg-stone-50/70 border-b border-stone-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="search-requests-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search requests by borrower name, item, or ID..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-stone-200 rounded-2xl">
              <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="font-semibold text-stone-700 text-sm">
                No rental requests found
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? 'No results match your search term.'
                  : 'Select any available item on the home page and click "Request to Rent" to create one.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const matchedItem = items.find((i) => i.id === req.itemId);
              const isCurrentlyRented = matchedItem?.availability === 'rented';

              return (
                <div
                  key={req.id}
                  id={`request-card-${req.id}`}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                        {req.id}
                      </span>
                      <span className="text-2xs text-stone-500">
                        Submitted {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <img
                      src={req.itemImageUrl}
                      alt={req.itemName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-100"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-stone-900 truncate">
                        {req.itemName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600 mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-medium text-stone-800">{req.borrowerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span className="truncate">{req.borrowerEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Duration: <strong>{req.rentalDuration}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>From: <strong>{req.startDate}</strong></span>
                        </div>
                      </div>

                      {req.notes && (
                        <p className="mt-2 text-xs text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-100 italic">
                          "{req.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Return Action for Hackathon Demo */}
                  {isCurrentlyRented && (
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-amber-700 font-medium">
                        Item status: Currently checked out
                      </span>
                      <button
                        type="button"
                        onClick={() => handleReturn(req.itemId, req.id)}
                        disabled={updatingId === req.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>
                          {updatingId === req.id ? 'Updating DB...' : 'Simulate Return & Mark Available'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 px-5 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Synced with REST API: <code className="text-stone-700 font-mono">/api/rentals</code></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
