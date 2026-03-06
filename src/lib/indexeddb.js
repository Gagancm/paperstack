import { openDB } from 'idb'

const DB_NAME = 'paperstack-db'
const DB_VERSION = 1

// Initialize IndexedDB
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Notes store
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' })
        notesStore.createIndex('updatedAt', 'updatedAt')
        notesStore.createIndex('inTrash', 'inTrash')
      }

      // Labels store
      if (!db.objectStoreNames.contains('labels')) {
        db.createObjectStore('labels', { keyPath: 'id' })
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }

      // Sync queue store (for offline changes)
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true,
        })
        syncStore.createIndex('timestamp', 'timestamp')
      }
    },
  })
}

// Notes operations
export async function getAllNotes() {
  const db = await initDB()
  return db.getAll('notes')
}

export async function getNote(id) {
  const db = await initDB()
  return db.get('notes', id)
}

export async function saveNote(note) {
  const db = await initDB()
  return db.put('notes', note)
}

export async function deleteNote(id) {
  const db = await initDB()
  return db.delete('notes', id)
}

// Labels operations
export async function getAllLabels() {
  const db = await initDB()
  return db.getAll('labels')
}

export async function saveLabel(label) {
  const db = await initDB()
  return db.put('labels', label)
}

export async function deleteLabel(id) {
  const db = await initDB()
  return db.delete('labels', id)
}

// Settings operations
export async function getSetting(key) {
  const db = await initDB()
  const setting = await db.get('settings', key)
  return setting?.value
}

export async function saveSetting(key, value) {
  const db = await initDB()
  return db.put('settings', { key, value })
}

// Sync queue operations
export async function addToSyncQueue(action) {
  const db = await initDB()
  return db.add('syncQueue', {
    ...action,
    timestamp: new Date().toISOString(),
  })
}

export async function getSyncQueue() {
  const db = await initDB()
  return db.getAll('syncQueue')
}

export async function clearSyncQueue() {
  const db = await initDB()
  const tx = db.transaction('syncQueue', 'readwrite')
  await tx.store.clear()
  return tx.done
}

export async function removeFromSyncQueue(id) {
  const db = await initDB()
  return db.delete('syncQueue', id)
}

// Bulk operations
export async function saveAllNotes(notes) {
  const db = await initDB()
  const tx = db.transaction('notes', 'readwrite')
  await Promise.all([
    ...notes.map((note) => tx.store.put(note)),
    tx.done,
  ])
}

export async function saveAllLabels(labels) {
  const db = await initDB()
  const tx = db.transaction('labels', 'readwrite')
  await Promise.all([
    ...labels.map((label) => tx.store.put(label)),
    tx.done,
  ])
}
