import { useState, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const DB_NAME = 'acses-glb-cache'
const DB_VERSION = 1
const STORE_NAME = 'models'
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

/**
 * Initialize IndexedDB for GLB caching
 */
function initDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB not supported'))
            return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'url' })
            }
        }
    })
}

/**
 * Get cached GLB from IndexedDB
 */
async function getCachedGLB(url) {
    try {
        const db = await initDB()
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)

        return new Promise((resolve, reject) => {
            const request = store.get(url)
            request.onsuccess = () => {
                const cached = request.result
                if (!cached) {
                    resolve(null)
                    return
                }

                // Check if cache is expired
                const now = Date.now()
                if (now > cached.expiresAt) {
                    // Cache expired, delete it
                    deleteCachedGLB(url)
                    resolve(null)
                    return
                }

                resolve(cached)
            }
            request.onerror = () => reject(request.error)
        })
    } catch (error) {
        console.warn('Failed to get cached GLB:', error)
        return null
    }
}

/**
 * Store GLB in IndexedDB cache
 */
async function setCachedGLB(url, arrayBuffer, version = '1.0.0') {
    try {
        const db = await initDB()
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        const cacheEntry = {
            url,
            data: arrayBuffer,
            timestamp: Date.now(),
            version,
            expiresAt: Date.now() + CACHE_DURATION
        }

        return new Promise((resolve, reject) => {
            const request = store.put(cacheEntry)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    } catch (error) {
        console.warn('Failed to cache GLB:', error)
    }
}

/**
 * Delete cached GLB from IndexedDB
 */
async function deleteCachedGLB(url) {
    try {
        const db = await initDB()
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        return new Promise((resolve, reject) => {
            const request = store.delete(url)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    } catch (error) {
        console.warn('Failed to delete cached GLB:', error)
    }
}

/**
 * Clear all cached GLB models
 */
export async function clearGLBCache() {
    try {
        const db = await initDB()
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        return new Promise((resolve, reject) => {
            const request = store.clear()
            request.onsuccess = () => {
                console.log('GLB cache cleared successfully')
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    } catch (error) {
        console.error('Failed to clear GLB cache:', error)
    }
}

/**
 * Custom hook to load GLB models with IndexedDB caching
 * @param {string} url - URL of the GLB model
 * @param {string} version - Version string for cache busting
 * @returns {Object} GLTF scene object
 */
export function useGLBCache(url, version = '1.0.0') {
    const [cachedData, setCachedData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function loadModel() {
            try {
                setLoading(true)
                setError(null)

                // Try to get from cache first
                const cached = await getCachedGLB(url)

                if (cached && cached.version === version) {
                    // Cache hit! Load from cached ArrayBuffer
                    console.log(`✅ Loading ${url} from cache`)
                    const loader = new GLTFLoader()

                    loader.parse(
                        cached.data,
                        '',
                        (gltf) => {
                            if (isMounted) {
                                setCachedData(gltf)
                                setLoading(false)
                            }
                        },
                        (err) => {
                            console.error('Failed to parse cached GLB:', err)
                            // If parsing fails, fetch fresh
                            fetchAndCache()
                        }
                    )
                } else {
                    // Cache miss or version mismatch
                    if (cached && cached.version !== version) {
                        console.log(`🔄 Version mismatch for ${url}, fetching new version`)
                        await deleteCachedGLB(url)
                    } else {
                        console.log(`📥 Fetching ${url} from network`)
                    }
                    await fetchAndCache()
                }
            } catch (err) {
                console.error('Error loading GLB:', err)
                if (isMounted) {
                    setError(err)
                    setLoading(false)
                }
            }
        }

        async function fetchAndCache() {
            try {
                // Fetch from network
                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
                }

                const arrayBuffer = await response.arrayBuffer()

                // Cache the ArrayBuffer
                await setCachedGLB(url, arrayBuffer, version)

                // Parse and return
                const loader = new GLTFLoader()
                loader.parse(
                    arrayBuffer,
                    '',
                    (gltf) => {
                        if (isMounted) {
                            setCachedData(gltf)
                            setLoading(false)
                        }
                    },
                    (err) => {
                        if (isMounted) {
                            setError(err)
                            setLoading(false)
                        }
                    }
                )
            } catch (err) {
                if (isMounted) {
                    setError(err)
                    setLoading(false)
                }
            }
        }

        loadModel()

        return () => {
            isMounted = false
        }
    }, [url, version])

    return { scene: cachedData?.scene, loading, error }
}

/**
 * Preload a GLB model into cache
 * @param {string} url - URL of the GLB model
 * @param {string} version - Version string
 */
export async function preloadGLB(url, version = '1.0.0') {
    try {
        const cached = await getCachedGLB(url)

        if (cached && cached.version === version) {
            console.log(`✅ ${url} already cached`)
            return
        }

        console.log(`📥 Preloading ${url}`)
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        await setCachedGLB(url, arrayBuffer, version)
        console.log(`✅ ${url} cached successfully`)
    } catch (error) {
        console.error(`Failed to preload ${url}:`, error)
    }
}
