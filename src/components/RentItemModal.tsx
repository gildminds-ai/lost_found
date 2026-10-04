import React, { useState } from 'react';
import { Item, RentalRequest } from '../types';
import {
  X,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  User,
  ShieldCheck,
  Send,
  FileText,
  DollarSign,
} from 'lucide-react';

interface RentItemModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onRentalSuccess: (rental: RentalRequest, updatedItem: Item) => void;
  onViewRequests: () => void;
}

export const RentItemModal: React.FC<RentItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onRentalSuccess,
  onViewRequests,
}) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [rentalDuration, setRentalDuration] = useState('1 week');
  const [customDuration, setCustomDuration] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmedRental, setConfirmedRental] = useState<RentalRequest | null>(null);

  if (!isOpen || !item) return null;

  const isAvailable = item.availability === 'available';

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!borrowerName.trim()) {
      errs.borrowerName = 'Please enter your full name.';
    } else if (borrowerName.trim().length < 2) {
      errs.borrowerName = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!borrowerEmail.trim()) {
      errs.borrowerEmail = 'Please provide your email address.';
    } else if (!emailRegex.test(borrowerEmail.trim())) {
      errs.borrowerEmail = 'Please enter a valid college or personal email address.';
    }

    const duration = rentalDuration === 'custom' ? customDuration.trim() : rentalDuration;
    if (!duration) {
      errs.rentalDuration = 'Please specify how long you need the item.';
    }

    if (!startDate) {
      errs.startDate = 'Please select your requested start date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!isAvailable) {
      setServerError('This item is currently unavailable and cannot be rented.');
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    const finalDuration =
      rentalDuration === 'custom' ? customDuration.trim() : rentalDuration;

    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          borrowerName: borrowerName.trim(),
          borrowerEmail: borrowerEmail.trim(),
          rentalDuration: finalDuration,
          startDate,
          notes: notes.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit rental request.');
      }

      const result = await response.json();
      setConfirmedRental(result.request);
      onRentalSuccess(result.request, result.updatedItem);
    } catch (err: unknown) {
      console.error('Error requesting item rental:', err);
      setServerError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedRental(null);
    setBorrowerName('');
    setBorrowerEmail('');
    setNotes('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs">
      <div
        id="rent-item-modal"
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {confirmedRental ? 'Rental Request Confirmed!' : 'Request to Rent'}
            </h2>
            <p className="text-xs text-stone-500">
              {confirmedRental
                ? 'Your request has been stored in the database'
                : 'Direct peer-to-peer campus equipment lending'}
            </p>
          </div>

          <button
            id="close-rent-modal-btn"
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {confirmedRental ? (
          /* Confirmation View */
          <div className="p-6 sm:p-8 text-center overflow-y-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200 mb-2">
                Reference: {confirmedRental.id}
              </span>
              <h3 className="text-xl font-bold text-stone-900">
                Request Successfully Submitted!
              </h3>
              <p className="text-sm text-stone-600 mt-1 max-w-md mx-auto">
                Your rental request has been permanently recorded in the database. The item has been marked as reserved.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                <img
                  src={confirmedRental.itemImageUrl}
                  alt={confirmedRental.itemName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-stone-900 truncate">
                    {confirmedRental.itemName}
                  </p>
                  <p className="text-xs text-emerald-700 font-medium">
                    Rate: {confirmedRental.totalCostEstimate}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500 block">Borrower:</span>
                  <span className="font-semibold text-stone-800">{confirmedRental.borrowerName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Confirmation Email:</span>
                  <span className="font-semibold text-stone-800 truncate block">
                    {confirmedRental.borrowerEmail}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Start Date:</span>
                  <span className="font-semibold text-stone-800">{confirmedRental.startDate}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Rental Duration:</span>
                  <span className="font-semibold text-stone-800">{confirmedRental.rentalDuration}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/80 text-xs text-stone-500 flex items-center justify-between">
                <span>Pickup Point: {item.campusLocation}</span>
                <span className="text-emerald-700 font-medium">Lender: {item.ownerName}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  onViewRequests();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>View in Rental Requests Database</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Back to Home Page
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Item summary banner */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-2xs font-bold uppercase tracking-wider text-stone-400">
                  Requested Item
                </span>
                <h4 className="font-semibold text-sm text-stone-900 truncate">
                  {item.name}
                </h4>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  {item.currency}{item.rentalPrice} /{item.priceUnit} • Pickup at {item.campusLocation}
                </p>
              </div>
            </div>

            {/* Unavailability Guard */}
            {!isAvailable && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Item Currently Unavailable</p>
                  <p className="mt-0.5 text-amber-800">
                    This item has already been rented or is pending return. To ensure fair sharing, new rental requests cannot be submitted until the current borrower returns it.
                  </p>
                </div>
              </div>
            )}

            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Borrower Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="borrower-name-input"
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="e.g. Liam Anderson"
                  disabled={!isAvailable}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.borrowerName
                      ? 'border-rose-300 focus:ring-rose-400/30'
                      : 'border-stone-200 focus:border-emerald-600 focus:ring-emerald-600/20'
                  }`}
                />
              </div>
              {errors.borrowerName && (
                <p className="mt-1 text-xs text-rose-600">{errors.borrowerName}</p>
              )}
            </div>

            {/* Borrower Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                College / Personal Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="borrower-email-input"
                  type="email"
                  value={borrowerEmail}
                  onChange={(e) => setBorrowerEmail(e.target.value)}
                  placeholder="e.g. liam.anderson@college.edu"
                  disabled={!isAvailable}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.borrowerEmail
                      ? 'border-rose-300 focus:ring-rose-400/30'
                      : 'border-stone-200 focus:border-emerald-600 focus:ring-emerald-600/20'
                  }`}
                />
              </div>
              {errors.borrowerEmail && (
                <p className="mt-1 text-xs text-rose-600">{errors.borrowerEmail}</p>
              )}
              <p className="text-2xs text-stone-400 mt-1">
                Used for pickup coordination with {item.ownerName} ({item.ownerEmail})
              </p>
            </div>

            {/* Duration and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Rental Duration <span className="text-rose-500">*</span>
                </label>
                <select
                  id="rental-duration-select"
                  value={rentalDuration}
                  onChange={(e) => setRentalDuration(e.target.value)}
                  disabled={!isAvailable}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                >
                  <option value="3 days">3 Days (Quick Lab/Exam)</option>
                  <option value="1 week">1 Week (Standard)</option>
                  <option value="2 weeks">2 Weeks (Midterm Prep)</option>
                  <option value="1 month">1 Month</option>
                  <option value="Full Semester">Full Semester</option>
                  <option value="custom">Custom duration...</option>
                </select>
                {rentalDuration === 'custom' && (
                  <input
                    type="text"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="e.g. 5 days, until Friday"
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-stone-200 text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Needed From (Date) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="rental-start-date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={!isAvailable}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>
            </div>

            {/* Note to Lender */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Note for Item Owner (Optional)
              </label>
              <textarea
                id="rental-notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Taking Eng Graphics lab exam on Thursday; can meet at the Library front entrance at 2 PM."
                disabled={!isAvailable}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>

              <button
                id="submit-rental-request-btn"
                type="submit"
                disabled={isSubmitting || !isAvailable}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Recording in Database...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Rental Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
