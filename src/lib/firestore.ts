import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface SavedItem {
  id?: string
  userId: string
  url: string
  title: string
  description: string
  thumbnail?: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'web'
  tags: string[]
  isFavorite: boolean
  analysis?: {
    topic: string
    hook: string
    format: string
    mood: string
  }
  collectionId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

const COLLECTION = 'items'

export async function saveContent(item: Omit<SavedItem, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), item)
  return ref.id
}

export async function getUserItems(userId: string): Promise<SavedItem[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedItem))
}

export async function getItemById(id: string): Promise<SavedItem | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as SavedItem
}

export async function toggleFavorite(id: string, current: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    isFavorite: !current,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function updateItem(id: string, data: Partial<SavedItem>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: Timestamp.now() })
}
