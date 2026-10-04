import React, { useState, useEffect, useMemo } from 'react';
import { Item, RentalRequest, Category } from './types';
import { CATEGORIES } from './data/sampleItems';
import { Navbar } from './components/Navbar';
import { ItemCard } from './components/ItemCard';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { ListItemModal } from './components/ListItemModal';
import { RentItemModal } from './components/RentItemModal';
import { RequestsModal } from './components/RequestsModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import {
  Search,
  Filter,
  PackagePlus,
  RefreshCw,
  Sparkles,
  BookOpen,
  Calculator,
  Compass,
  FlaskConical,
  Home,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'rented'>('all');

  // Modals
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Item | null>(null);
  const [selectedItemForRent, setSelectedItemForRent] = useState<Item | null>(null);
  const [isListItemOpen, setIsListItemOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isDbStatusOpen, setIsDbStatusOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial data from server database
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemsRes, requestsRes, healthRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/rentals'),
        fetch('/api/health'),
      ]);

      if (!itemsRes.ok) throw new Error('Failed to fetch items from database');
      if (!requestsRes.ok) throw new Error('Failed to fetch rental requests');

      const itemsData = await itemsRes.json();
      const requestsData = await requestsRes.json();

      setItems(itemsData);
      setRequests(requestsData);
      setDbConnected(healthRes.ok);
    } catch (err: unknown) {
      console.error('Data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to database');
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered items logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search term
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.campusLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      // Availability filter
      const matchesAvailability =
        availabilityFilter === 'all' || item.availability === availabilityFilter;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [items, searchQuery, selectedCategory, availabilityFilter]);

  // Counts
  const availableCount = useMemo(() => items.filter((i) => i.availability === 'available').length, [items]);
  const rentedCount = useMemo(() => items.filter((i) => i.availability === 'rented').length, [items]);

  // Handle new item created
  const handleItemCreated = (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    showToast(`"${newItem.name}" was successfully listed and saved to the database!`);
  };

  // Handle rental requested
  const handleRentalSuccess = (rental: RentalRequest, updatedItem: Item) => {
    setRequests((prev) => [rental, ...prev]);
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    showToast(`Rental request submitted! Reference #${rental.id}`);
  };

  // Handle item returned
  const handleMarkItemReturned = async (itemId: string, requestId: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: 'available' }),
      });

      if (!res.ok) throw new Error('Failed to update item status');

      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'Returned' } : r))
      );
      showToast('Item marked as returned and is now available to borrow again!');
    } catch (err) {
      console.error(err);
      alert('Could not update status. Please check network.');
    }
  };

  // Handle database reset
  const handleResetDatabase = async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      await fetchData();
      showToast('Database reset to original sample items.');
    }
  };

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case 'Engineering & Drafting':
        return <Compass className="w-3.5 h-3.5" />;
      case 'Electronics & Calc':
        return <Calculator className="w-3.5 h-3.5" />;
      case 'Lab & Science':
        return <FlaskConical className="w-3.5 h-3.5" />;
      case 'Textbooks & Study':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Dorm & Campus':
        return <Home className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Navbar */}
      <Navbar
        onOpenListItem={() => setIsListItemOpen(true)}
        onOpenRequests={() => setIsRequestsOpen(true)}
        onOpenDbStatus={() => setIsDbStatusOpen(true)}
        requestsCount={requests.length}
        dbConnected={dbConnected}
        totalItemsCount={items.length}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900 text-white text-xs sm:text-sm font-medium shadow-xl border border-stone-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-stone-900 to-emerald-950 text-white p-6 sm:p-10 overflow-hidden shadow-xl shadow-stone-900/10">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Essential Rentals for Students</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Borrow What You Need. <br />
              <span className="text-emerald-400">Lend What You Don't.</span>
            </h1>

            <p className="text-stone-300 text-xs sm:text-base leading-relaxed max-w-xl">
              Don't buy a $60 mini-drafter or $40 lab coat just for a 3-week course. Rent calculators, drafter kits, textbooks, and campus essentials from fellow students at pocket-friendly rates.
            </p>

            {/* Quick Action bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="hero-list-item-btn"
                type="button"
                onClick={() => setIsListItemOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 transition-colors shadow-sm flex items-center gap-2"
              >
                <PackagePlus className="w-4 h-4" />
                <span>List an Unused Item</span>
              </button>

              <button
                id="hero-view-db-btn"
                type="button"
                onClick={() => setIsDbStatusOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-stone-200 border border-white/15 backdrop-blur-md transition-colors flex items-center gap-2"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Database Info ({items.length} Items)</span>
              </button>
            </div>
          </div>

          {/* Decorative background shapes */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none hidden md:flex items-center justify-end pr-10">
            <RefreshCw className="w-80 h-80 text-emerald-400" />
          </div>
        </section>

        {/* Search & Category Filter Bar */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="search-items-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name, description, or campus location (e.g. drafter, casio, lab coat)..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Availability Filter Toggle */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-2xl shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setAvailabilityFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  availabilityFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  availabilityFilter === 'available'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('rented')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  availabilityFilter === 'rented'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Rented ({rentedCount})
              </button>
            </div>
          </div>

          {/* Category Tabs / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const count =
                cat === 'All'
                  ? items.length
                  : items.filter((i) => i.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  id={`filter-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                  <span
                    className={`ml-1 text-2xs px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Items Listing Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {selectedCategory === 'All' ? 'All College Essentials' : selectedCategory}
              </h2>
              <p className="text-xs text-stone-500">
                Showing {filteredItems.length} of {items.length} items in the database
              </p>
            </div>

            {(searchQuery || selectedCategory !== 'All' || availabilityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setAvailabilityFilter('all');
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Loading / Error States */}
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-600">
                Loading college items from database...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-sm font-bold">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-4 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-white space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 text-base">
                No items match your criteria
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try searching for something else, or be the first to list an unused item in this category for other students!
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setAvailabilityFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setIsListItemOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  List an Item
                </button>
              </div>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onSelect={(selected) => setSelectedItemForDetails(selected)}
                  onRequestRent={(selected) => setSelectedItemForRent(selected)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Campus Sharing Guide / Hackathon Feature Showcase */}
        <section className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                How Rent &amp; Reuse Works for College Students
              </h3>
              <p className="text-xs text-stone-500">
                A sustainable, cost-saving campus exchange network
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Persistent Database Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-stone-900">Browse &amp; Request</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Find drafter kits, Casio calculators, lab coats, and textbooks by category. Submit a request with your college email and dates.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-stone-900">List Your Unused Items</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Finished with a class? Post your drafter kit or textbook. Items are saved permanently in the server database and appear immediately on the home page.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-stone-900">Campus Meet-Up &amp; Return</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Meet safely at designated campus spots (Library, Student Center, Lab Halls). Inspect gear, use it for exams/labs, and return it on time.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-stone-200 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">Rent &amp; Reuse</span>
            <span>• College Item Rental Prototype</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDbStatusOpen(true)}
              className="text-stone-600 hover:text-emerald-700 underline flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" /> Database Architecture
            </button>
            <span>•</span>
            <button
              onClick={() => setIsRequestsOpen(true)}
              className="text-stone-600 hover:text-emerald-700 underline"
            >
              Requests Log ({requests.length})
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ItemDetailsModal
        item={selectedItemForDetails}
        onClose={() => setSelectedItemForDetails(null)}
        onRequestRent={(item) => setSelectedItemForRent(item)}
      />

      <ListItemModal
        isOpen={isListItemOpen}
        onClose={() => setIsListItemOpen(false)}
        onItemCreated={handleItemCreated}
      />

      <RentItemModal
        item={selectedItemForRent}
        isOpen={selectedItemForRent !== null}
        onClose={() => setSelectedItemForRent(null)}
        onRentalSuccess={handleRentalSuccess}
        onViewRequests={() => setIsRequestsOpen(true)}
      />

      <RequestsModal
        isOpen={isRequestsOpen}
        onClose={() => setIsRequestsOpen(false)}
        requests={requests}
        onMarkItemReturned={handleMarkItemReturned}
        items={items}
      />

      <DatabaseStatusModal
        isOpen={isDbStatusOpen}
        onClose={() => setIsDbStatusOpen(false)}
        totalItems={items.length}
        availableItems={availableCount}
        rentedItems={rentedCount}
        totalRequests={requests.length}
        onResetDatabase={handleResetDatabase}
      />
    </div>
  );
}
