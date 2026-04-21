import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
    db: {},
    auth: {
        currentUser: null,
        onAuthStateChanged: vi.fn(),
        signInWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
    },
    storage: {},
}))

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    onSnapshot: vi.fn(),
    Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })), fromDate: vi.fn() },
}))

// Mock IntersectionObserver
class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(callback: IntersectionObserverCallback) {
        (this as unknown as { callback: IntersectionObserverCallback }).callback = callback
    }
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock window.scrollTo
window.scrollTo = vi.fn() as unknown as typeof scrollTo
