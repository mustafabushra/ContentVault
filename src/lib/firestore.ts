import {
  collection, addDoc, getDocs, getDoc, doc,
  updateDoc, deleteDoc, query, where, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface SavedItem {
  id?: string
  userId: string
  url: string
  title: string
  description: string
  thumbnail?: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'web' | 'linkedin' | 'facebook'
  tags: string[]
  isFavorite: boolean
  collectionId?: string
  analysis?: { topic: string; hook: string; format: string; mood: string }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserCollection {
  id?: string
  userId: string
  name: string
  emoji: string
  color: string
  createdAt: Timestamp
}

const ITEMS = 'items'
const COLS  = 'collections'

export async function saveContent(item: Omit<SavedItem, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, ITEMS), item)
  return ref.id
}

export async function getUserItems(userId: string): Promise<SavedItem[]> {
  const q = query(collection(db, ITEMS), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as SavedItem))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
}

export async function getItemById(id: string): Promise<SavedItem | null> {
  const snap = await getDoc(doc(db, ITEMS, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as SavedItem
}

export async function toggleFavorite(id: string, current: boolean): Promise<void> {
  await updateDoc(doc(db, ITEMS, id), { isFavorite: !current, updatedAt: Timestamp.now() })
}

export async function deleteItem(id: string): Promise<void> {
  await deleteDoc(doc(db, ITEMS, id))
}

export async function updateItem(id: string, data: Partial<SavedItem>): Promise<void> {
  await updateDoc(doc(db, ITEMS, id), { ...data, updatedAt: Timestamp.now() })
}

// Collections
export async function getUserCollections(userId: string): Promise<UserCollection[]> {
  const q = query(collection(db, COLS), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserCollection))
}

export async function createCollection(col: Omit<UserCollection, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COLS), col)
  return ref.id
}

export async function deleteCollection(id: string): Promise<void> {
  await deleteDoc(doc(db, COLS, id))
}
