import React from 'react';
import { Item } from '../types';
import { MapPin, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onSelect: (item: Item) => void;
  onRequestRent: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect, onRequestRent }) => {
  const isAvailable = item.availability === 'available';

  return (
    <div
      id={`item-card-${item.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelect(item)}>
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback placeholder if remote image network issue
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-600/90 text-white backdrop-blur-md shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              Currently Rented
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-stone-900/80 text-stone-100 backdrop-blur-md">
            {item.category}
          </span>
        </div>

        {/* Condition Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-stone-800 backdrop-blur-md border border-white/40 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            {item.condition}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Title */}
          <h3
            onClick={() => onSelect(item)}
            className="font-semibold text-stone-900 text-base sm:text-lg leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
          >
            {item.name}
          </h3>

          {/* Description snippet */}
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Location & Owner */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{item.campusLocation}</span>
          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="pt-3 border-t border-stone-100 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-stone-500 font-medium">Rental Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-stone-900">
                  {item.currency}{item.rentalPrice}
                </span>
                <span className="text-xs text-stone-600 font-medium">/{item.priceUnit}</span>
              </div>
            </div>

            <button
              id={`view-details-${item.id}`}
              type="button"
              onClick={() => onSelect(item)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Button */}
          {isAvailable ? (
            <button
              id={`rent-button-${item.id}`}
              type="button"
              onClick={() => onRequestRent(item)}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Request to Rent
            </button>
          ) : (
            <button
              id={`rent-button-disabled-${item.id}`}
              type="button"
              disabled
              title="This item is currently out on rental"
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium bg-stone-100 text-stone-400 cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
