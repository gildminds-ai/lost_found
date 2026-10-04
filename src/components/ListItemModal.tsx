import React, { useState } from 'react';
import { Category, PriceUnit, ItemCondition, Item } from '../types';
import { CATEGORIES, PRESET_IMAGE_OPTIONS } from '../data/sampleItems';
import { X, Upload, AlertCircle, CheckCircle2, Image as ImageIcon, Sparkles, DollarSign } from 'lucide-react';

interface ListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (newItem: Item) => void;
}

export const ListItemModal: React.FC<ListItemModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Engineering & Drafting');
  const [description, setDescription] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('week');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('Like New');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGE_OPTIONS[0].url);
  const [customImageMode, setCustomImageMode] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Item name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Item name must be at least 2 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Please provide an item description.';
    } else if (description.trim().length < 10) {
      errs.description = 'Description should be at least 10 characters so students know what is included.';
    }

    const priceNum = parseFloat(rentalPrice);
    if (!rentalPrice || isNaN(priceNum) || priceNum <= 0) {
      errs.rentalPrice = 'Please enter a valid rental price greater than 0.';
    }

    if (!ownerName.trim()) {
      errs.ownerName = 'Your name or college handle is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!ownerEmail.trim()) {
      errs.ownerEmail = 'Contact email is required.';
    } else if (!emailRegex.test(ownerEmail.trim())) {
      errs.ownerEmail = 'Please enter a valid email address (e.g. yourname@college.edu).';
    }

    if (!campusLocation.trim()) {
      errs.campusLocation = 'Campus pickup location is required (e.g. Library, Science Hall).';
    }

    if (customImageMode && customImageUrl.trim() && !customImageUrl.startsWith('http')) {
      errs.imageUrl = 'Image URL must start with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const finalImage = customImageMode && customImageUrl.trim()
      ? customImageUrl.trim()
      : imageUrl;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          rentalPrice: parseFloat(rentalPrice),
          priceUnit,
          currency: '$',
          imageUrl: finalImage,
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim(),
          campusLocation: campusLocation.trim(),
          condition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to list item. Please try again.');
      }

      const createdItem: Item = await response.json();
      onItemCreated(createdItem);
      onClose();
    } catch (err: unknown) {
      console.error('Error creating item:', err);
      setServerError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs">
      <div
        id="list-item-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              List an Item for Rent
            </h2>
            <p className="text-xs text-stone-500">
              Lend your unused calculators, drafter kits, or lab coats to fellow students
            </p>
          </div>

          <button
            id="close-list-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="item-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mini Drafter Kit with Protractor Head"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-400/30'
                  : 'border-stone-200 focus:border-emerald-600 focus:ring-emerald-600/20'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          {/* Category & Condition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="item-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<Category, 'All'>)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Condition <span className="text-rose-500">*</span>
              </label>
              <select
                id="item-condition-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New (Mint)</option>
                <option value="Good">Good (Minor wear)</option>
                <option value="Fair">Fair (Fully functional)</option>
              </select>
            </div>
          </div>

          {/* Rental Price & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Rental Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-sm">
                  $
                </span>
                <input
                  id="item-price-input"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={rentalPrice}
                  onChange={(e) => setRentalPrice(e.target.value)}
                  placeholder="4.00"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.rentalPrice
                      ? 'border-rose-300 focus:ring-rose-400/30'
                      : 'border-stone-200 focus:border-emerald-600 focus:ring-emerald-600/20'
                  }`}
                />
              </div>
              {errors.rentalPrice && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.rentalPrice}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Rental Period Unit
              </label>
              <select
                id="item-price-unit-select"
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                <option value="day">per day</option>
                <option value="week">per week (most popular)</option>
                <option value="month">per month</option>
                <option value="semester">per semester</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Description &amp; Included Accessories <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="item-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State what is included (e.g. with case, battery, clips), any usage instructions or prerequisites."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                errors.description
                  ? 'border-rose-300 focus:ring-rose-400/30'
                  : 'border-stone-200 focus:border-emerald-600 focus:ring-emerald-600/20'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
              </p>
            )}
          </div>

          {/* Owner Details */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Lender Contact &amp; Campus Location
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="owner-name-input"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Jessica Chen"
                  className={`w-full px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                    errors.ownerName
                      ? 'border-rose-300 focus:ring-rose-400/30'
                      : 'border-stone-200 focus:border-emerald-600 focus:ring-emerald-600/20'
                  }`}
                />
                {errors.ownerName && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.ownerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="owner-email-input"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="e.g. jessica.chen@college.edu"
                  className={`w-full px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                    errors.ownerEmail
                      ? 'border-rose-300 focus:ring-rose-400/30'
                      : 'border-stone-200 focus:border-emerald-600 focus:ring-emerald-600/20'
                  }`}
                />
                {errors.ownerEmail && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.ownerEmail}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Campus Pickup Location <span className="text-rose-500">*</span>
              </label>
              <input
                id="campus-location-input"
                type="text"
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                placeholder="e.g. University Library Ground Floor or Engineering Block A"
                className={`w-full px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                  errors.campusLocation
                    ? 'border-rose-300 focus:ring-rose-400/30'
                    : 'border-stone-200 focus:border-emerald-600 focus:ring-emerald-600/20'
                }`}
              />
              {errors.campusLocation && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.campusLocation}
                </p>
              )}
            </div>
          </div>

          {/* Item Image Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Item Photo
              </label>
              <button
                type="button"
                onClick={() => setCustomImageMode(!customImageMode)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
              >
                {customImageMode ? 'Pick from standard photo presets' : 'Enter custom photo URL'}
              </button>
            </div>

            {customImageMode ? (
              <div>
                <input
                  id="custom-image-url-input"
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
                {errors.imageUrl && (
                  <p className="mt-1 text-xs text-rose-600">{errors.imageUrl}</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_IMAGE_OPTIONS.map((preset, idx) => {
                  const isSelected = imageUrl === preset.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setImageUrl(preset.url)}
                      className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                          : 'border-stone-200 hover:border-stone-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-4/3 w-full bg-stone-100">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-1.5 bg-white text-center">
                        <p className="text-2xs font-medium text-stone-700 truncate">
                          {preset.label}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white rounded-full p-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>

            <button
              id="submit-new-item-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving to Database...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publish Item to Home Page</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
