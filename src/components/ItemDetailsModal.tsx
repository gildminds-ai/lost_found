import React from 'react';
import { Item } from '../types';
import {
  X,
  MapPin,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  Share2,
  User,
  Info,
} from 'lucide-react';

interface ItemDetailsModalProps {
  item: Item | null;
  onClose: () => void;
  onRequestRent: (item: Item) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  onClose,
  onRequestRent,
}) => {
  if (!item) return null;

  const isAvailable = item.availability === 'available';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs">
      <div
        id="item-details-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header with Close */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
              {item.category}
            </span>
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <Clock className="w-3.5 h-3.5" /> Currently Rented
              </span>
            )}
          </div>

          <button
            id="close-item-details-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Image */}
          <div className="relative aspect-16/9 w-full rounded-2xl bg-stone-100 overflow-hidden border border-stone-200/80">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/90 text-stone-800 backdrop-blur-md shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Condition: {item.condition}
              </span>
            </div>
          </div>

          {/* Title and Pricing Bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                {item.name}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Listed on {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="sm:text-right bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <span className="text-xs text-stone-500 font-medium block">Rental Price</span>
              <div className="flex items-baseline sm:justify-end gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {item.currency}{item.rentalPrice}
                </span>
                <span className="text-sm text-stone-600 font-medium">/{item.priceUnit}</span>
              </div>
              <span className="text-2xs text-emerald-700 font-medium">Affordable student rate</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Item Details &amp; Specifications
            </h4>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50/70 p-4 rounded-xl border border-stone-100">
              {item.description}
            </p>
          </div>

          {/* Location & Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> Campus Pickup Point
              </div>
              <p className="text-sm font-medium text-stone-900">{item.campusLocation}</p>
              <p className="text-xs text-stone-500 mt-1">Convenient on-campus meet-up point</p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                <User className="w-4 h-4 text-emerald-600" /> Listed By Student
              </div>
              <p className="text-sm font-medium text-stone-900">{item.ownerName}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-600">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <a
                  href={`mailto:${item.ownerEmail}`}
                  className="hover:text-emerald-700 hover:underline truncate"
                >
                  {item.ownerEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Campus Sharing Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Student Guarantee:</span> When borrowing on campus, always inspect the item together at pickup. Return items promptly at the agreed date so other students can prepare for labs &amp; exams.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 px-5 sm:px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-colors"
          >
            Back to Browse
          </button>

          {isAvailable ? (
            <button
              id="details-request-rent-btn"
              type="button"
              onClick={() => {
                onClose();
                onRequestRent(item);
              }}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 transition-all flex items-center gap-2"
            >
              Request to Rent Item
            </button>
          ) : (
            <div className="text-right">
              <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                Currently checked out
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
