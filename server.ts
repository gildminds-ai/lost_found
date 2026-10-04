import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SAMPLE_ITEMS } from './src/data/sampleItems.ts';
import { Item, RentalRequest, CreateItemPayload, CreateRentalPayload } from './src/types.ts';
import {
  getDb,
  getFirestoreInfo,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
} from './src/server/firebase.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to seed sample items into Firestore if empty
async function ensureFirestoreSeeded() {
  try {
    const db = getDb();
    const itemsCol = collection(db, 'items');
    const snapshot = await getDocs(itemsCol);

    if (snapshot.empty) {
      console.log('Firestore items collection is empty. Seeding initial sample items...');
      for (const item of INITIAL_SAMPLE_ITEMS) {
        await setDoc(doc(db, 'items', item.id), item);
      }
      console.log(`Seeded ${INITIAL_SAMPLE_ITEMS.length} sample items to Firestore.`);

      // Also seed an initial sample rental request
      const initialRental: RentalRequest = {
        id: 'REQ-2026-8041',
        itemId: 'item-9',
        itemName: 'Eye-Care LED Study Desk Lamp (USB Rechargeable)',
        itemImageUrl:
          'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80',
        borrowerName: 'Emma Watson',
        borrowerEmail: 'e.watson@college.edu',
        rentalDuration: '2 weeks',
        startDate: '2026-09-18',
        notes: 'Needed for final semester design project in Dorm Quad.',
        status: 'Approved',
        totalCostEstimate: '$6.00',
        createdAt: '2026-09-18T14:20:00.000Z',
      };
      await setDoc(doc(db, 'rentals', initialRental.id), initialRental);
      console.log('Seeded initial sample rental request to Firestore.');
    }
  } catch (error) {
    console.error('Error checking/seeding Firestore:', error);
  }
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health & Database Info
app.get('/api/health', async (req, res) => {
  try {
    const db = getDb();
    const info = getFirestoreInfo();

    const itemsSnap = await getDocs(collection(db, 'items'));
    const rentalsSnap = await getDocs(collection(db, 'rentals'));

    const items: Item[] = [];
    itemsSnap.forEach((d) => items.push(d.data() as Item));

    res.json({
      status: 'ok',
      database: 'connected (Firebase Cloud Firestore)',
      projectId: info.projectId,
      databaseId: info.databaseId,
      timestamp: new Date().toISOString(),
      stats: {
        totalItems: items.length,
        availableItems: items.filter((i) => i.availability === 'available').length,
        rentedItems: items.filter((i) => i.availability === 'rented').length,
        totalRequests: rentalsSnap.size,
      },
    });
  } catch (err: unknown) {
    console.error('Database health check error:', err);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err instanceof Error ? err.message : 'Unknown Firestore error',
    });
  }
});

// GET /api/items - Retrieve all items from Firestore
app.get('/api/items', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await getDocs(collection(db, 'items'));
    const items: Item[] = [];
    snapshot.forEach((d) => {
      items.push(d.data() as Item);
    });

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(items);
  } catch (error: unknown) {
    console.error('Error fetching items from Firestore:', error);
    res.status(500).json({
      error: 'Failed to retrieve items from Firestore',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET /api/items/:id - Retrieve single item from Firestore
app.get('/api/items/:id', async (req, res) => {
  try {
    const db = getDb();
    const itemDoc = await getDoc(doc(db, 'items', req.params.id));
    if (!itemDoc.exists()) {
      res.status(404).json({ error: 'Item not found in Firestore' });
      return;
    }
    res.json(itemDoc.data() as Item);
  } catch (error: unknown) {
    console.error('Error fetching item from Firestore:', error);
    res.status(500).json({ error: 'Failed to retrieve item from Firestore' });
  }
});

// POST /api/items - Add a new item to Firestore
app.post('/api/items', async (req, res) => {
  const body = req.body as CreateItemPayload;

  // Validation
  const errors: Record<string, string> = {};

  if (!body.name || body.name.trim().length < 2) {
    errors.name = 'Item name must be at least 2 characters.';
  }
  if (!body.description || body.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }
  if (typeof body.rentalPrice !== 'number' || body.rentalPrice <= 0 || isNaN(body.rentalPrice)) {
    errors.rentalPrice = 'Rental price must be a positive number.';
  }
  if (!body.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.ownerEmail.trim())) {
    errors.ownerEmail = 'Please provide a valid email address (e.g. name@college.edu).';
  }
  if (!body.ownerName || body.ownerName.trim().length < 2) {
    errors.ownerName = 'Please enter your name or student handle.';
  }
  if (!body.campusLocation || body.campusLocation.trim().length < 2) {
    errors.campusLocation = 'Please specify a convenient campus pickup location.';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  const defaultImage =
    body.imageUrl && body.imageUrl.startsWith('http')
      ? body.imageUrl.trim()
      : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

  const newItem: Item = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: body.name.trim(),
    category: body.category || 'Engineering & Drafting',
    description: body.description.trim(),
    rentalPrice: Number(body.rentalPrice),
    priceUnit: body.priceUnit || 'week',
    currency: body.currency || '$',
    availability: 'available',
    imageUrl: defaultImage,
    ownerName: body.ownerName.trim(),
    ownerEmail: body.ownerEmail.trim(),
    campusLocation: body.campusLocation.trim(),
    condition: body.condition || 'Good',
    createdAt: new Date().toISOString(),
  };

  try {
    const db = getDb();
    await setDoc(doc(db, 'items', newItem.id), newItem);
    res.status(201).json(newItem);
  } catch (error: unknown) {
    console.error('Error saving item to Firestore:', error);
    res.status(500).json({ error: 'Failed to save item to Firestore database' });
  }
});

// PATCH /api/items/:id/status - Update item availability in Firestore
app.patch('/api/items/:id/status', async (req, res) => {
  const { availability } = req.body;
  if (!['available', 'rented', 'reserved'].includes(availability)) {
    res.status(400).json({ error: 'Invalid availability status' });
    return;
  }

  try {
    const db = getDb();
    const itemRef = doc(db, 'items', req.params.id);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      res.status(404).json({ error: 'Item not found in Firestore' });
      return;
    }

    await updateDoc(itemRef, { availability });
    const updatedData = { ...(itemDoc.data() as Item), availability };
    res.json(updatedData);
  } catch (error: unknown) {
    console.error('Error updating item status in Firestore:', error);
    res.status(500).json({ error: 'Failed to update item status in Firestore' });
  }
});

// GET /api/rentals - Get all rental requests from Firestore
app.get('/api/rentals', async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await getDocs(collection(db, 'rentals'));
    const rentals: RentalRequest[] = [];
    snapshot.forEach((d) => {
      rentals.push(d.data() as RentalRequest);
    });

    rentals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(rentals);
  } catch (error: unknown) {
    console.error('Error fetching rentals from Firestore:', error);
    res.status(500).json({ error: 'Failed to retrieve rental requests from Firestore' });
  }
});

// POST /api/rentals - Submit a rental request with Firestore Transaction to prevent double-renting
app.post('/api/rentals', async (req, res) => {
  const body = req.body as CreateRentalPayload;

  const errors: Record<string, string> = {};

  if (!body.borrowerName || body.borrowerName.trim().length < 2) {
    errors.borrowerName = 'Please provide your full name.';
  }
  if (!body.borrowerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.borrowerEmail.trim())) {
    errors.borrowerEmail = 'Please provide a valid college or personal email address.';
  }
  if (!body.rentalDuration || body.rentalDuration.trim().length === 0) {
    errors.rentalDuration = 'Please specify rental duration (e.g., 3 days, 1 week).';
  }
  if (!body.startDate || body.startDate.trim().length === 0) {
    errors.startDate = 'Please specify your requested start date.';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  try {
    const db = getDb();
    const itemRef = doc(db, 'items', body.itemId);

    const rentalId = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let createdRental: RentalRequest | null = null;
    let updatedItem: Item | null = null;

    // Use Firestore Transaction to atomically ensure item is available before renting
    await runTransaction(db, async (transaction) => {
      const itemDoc = await transaction.get(itemRef);

      if (!itemDoc.exists()) {
        throw new Error('Selected item could not be found.');
      }

      const itemData = itemDoc.data() as Item;
      if (itemData.availability !== 'available') {
        throw new Error(`Item "${itemData.name}" is currently ${itemData.availability}. Only available items can be requested.`);
      }

      const rentalRecord: RentalRequest = {
        id: rentalId,
        itemId: itemData.id,
        itemName: itemData.name,
        itemImageUrl: itemData.imageUrl,
        borrowerName: body.borrowerName.trim(),
        borrowerEmail: body.borrowerEmail.trim(),
        rentalDuration: body.rentalDuration.trim(),
        startDate: body.startDate.trim(),
        notes: body.notes?.trim() || '',
        status: 'Pending Owner Review',
        totalCostEstimate: `${itemData.currency}${itemData.rentalPrice} / ${itemData.priceUnit}`,
        createdAt: new Date().toISOString(),
      };

      createdRental = rentalRecord;
      updatedItem = {
        ...itemData,
        availability: 'rented',
      };

      const rentalRef = doc(db, 'rentals', rentalId);
      transaction.set(rentalRef, rentalRecord);
      transaction.update(itemRef, { availability: 'rented' });
    });

    res.status(201).json({
      success: true,
      request: createdRental,
      updatedItem: updatedItem,
      message: `Rental request #${rentalId} successfully created!`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database transaction failed';
    console.error('Error during rental transaction in Firestore:', error);
    res.status(400).json({
      error: 'Validation failed',
      details: { itemId: message },
    });
  }
});

// POST /api/reset - Restore sample items in Firestore (helpful for live demos)
app.post('/api/reset', async (req, res) => {
  try {
    const db = getDb();

    // Re-seed sample items
    for (const item of INITIAL_SAMPLE_ITEMS) {
      await setDoc(doc(db, 'items', item.id), item);
    }

    res.json({ message: 'Firestore database reset to default sample college items successfully.' });
  } catch (error: unknown) {
    console.error('Error resetting Firestore:', error);
    res.status(500).json({ error: 'Failed to reset Firestore items' });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Production Static Handling
// -------------------------------------------------------------
async function startServer() {
  await ensureFirestoreSeeded();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rent & Reuse backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
