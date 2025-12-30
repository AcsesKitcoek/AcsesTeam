import { useState, useEffect } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const DB_NAME = 'acses-draco-cache'
const DB_VERSION = 1
const STORE_NAME = 'models'
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

/**
 * Initialize IndexedDB for Draco GLB caching
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
 * Get cached Draco GLB from IndexedDB
 */
async function getCachedDracoGLB(url) {
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
                    deleteCachedDracoGLB(url)
                    resolve(null)
                    return
                }

                resolve(cached)
            }
            request.onerror = () => reject(request.error)
        })
    } catch (error) {
        console.warn('Failed to get cached Draco GLB:', error)
        return null
    }
}

/**
 * Store Draco GLB in IndexedDB cache
 */
async function setCachedDracoGLB(url, arrayBuffer, version = '1.0.0') {
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
        console.warn('Failed to cache Draco GLB:', error)
    }
}

/**
 * Delete cached Draco GLB from IndexedDB
 */
async function deleteCachedDracoGLB(url) {
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
        console.warn('Failed to delete cached Draco GLB:', error)
    }
}

/**
 * Clear all cached Draco GLB models
 */
export async function clearDracoCache() {
    try {
        const db = await initDB()
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        return new Promise((resolve, reject) => {
            const request = store.clear()
            request.onsuccess = () => {
                console.log('Draco cache cleared successfully')
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    } catch (error) {
        console.error('Failed to clear Draco cache:', error)
    }
}

/**
 * Custom hook to load Draco-compressed GLB models with IndexedDB caching
 * @param {string} url - URL of the Draco-compressed GLB model
 * @param {string} version - Version string for cache busting (default: '1.0.0')
 * @param {boolean} useCache - Whether to use caching (default: true)
 * @param {string} dracoDecoderPath - Path to Draco decoder files (default: '/draco/gltf/')
 * @returns {Object} { scene, loading, error, progress }
 */
export function useDracoLoader(url, version = '1.0.0', useCache = false, dracoDecoderPath = '/draco/gltf/') {
    const [scene, setScene] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        let isMounted = true
        let dracoLoader = null

        async function loadModel() {
            try {
                setLoading(true)
                setError(null)
                setProgress(0)

                // Initialize DRACO loader
                dracoLoader = new DRACOLoader()
                dracoLoader.setDecoderPath(dracoDecoderPath)
                dracoLoader.setDecoderConfig({ type: 'js' })

                // Try to get from cache first if caching is enabled
                if (useCache) {
                    const cached = await getCachedDracoGLB(url)

                    if (cached && cached.version === version) {
                        // Cache hit! Load from cached ArrayBuffer
                        console.log(`✅ Loading Draco model from cache: ${url}`)
                        const gltfLoader = new GLTFLoader()
                        gltfLoader.setDRACOLoader(dracoLoader)

                        gltfLoader.parse(
                            cached.data,
                            '',
                            (gltf) => {
                                if (isMounted) {
                                    setScene(gltf.scene)
                                    setLoading(false)
                                    setProgress(100)
                                }
                                dracoLoader.dispose()
                            },
                            (err) => {
                                console.error('Failed to parse cached Draco GLB:', err)
                                // If parsing fails, fetch fresh
                                fetchAndCache()
                            }
                        )
                        return
                    } else if (cached && cached.version !== version) {
                        console.log(`🔄 Version mismatch for ${url}, fetching new version`)
                        await deleteCachedDracoGLB(url)
                    }
                }

                // Cache miss or caching disabled - fetch from network
                if (!useCache) {
                    console.log(`⚠️ Cache disabled - Fetching Draco model directly: ${url}`)
                } else {
                    console.log(`📥 Fetching Draco model from network: ${url}`)
                }

                await fetchAndCache()
            } catch (err) {
                console.error('Error loading Draco model:', err)
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

                // Cache the ArrayBuffer if caching is enabled
                if (useCache) {
                    await setCachedDracoGLB(url, arrayBuffer, version)
                }

                // Parse with Draco loader
                const gltfLoader = new GLTFLoader()
                gltfLoader.setDRACOLoader(dracoLoader)

                gltfLoader.parse(
                    arrayBuffer,
                    '',
                    (gltf) => {
                        if (isMounted) {
                            console.log(`✅ Draco model loaded successfully: ${url}`)
                            setScene(gltf.scene)
                            setLoading(false)
                            setProgress(100)
                        }
                        if (dracoLoader) {
                            dracoLoader.dispose()
                        }
                    },
                    (err) => {
                        if (isMounted) {
                            console.error(`❌ Failed to parse Draco model: ${url}`, err)
                            setError(err)
                            setLoading(false)
                        }
                        if (dracoLoader) {
                            dracoLoader.dispose()
                        }
                    }
                )
            } catch (err) {
                if (isMounted) {
                    setError(err)
                    setLoading(false)
                }
                if (dracoLoader) {
                    dracoLoader.dispose()
                }
            }
        }

        loadModel()

        return () => {
            isMounted = false
            if (dracoLoader) {
                dracoLoader.dispose()
            }
        }
    }, [url, version, useCache, dracoDecoderPath])

    return { scene, loading, error, progress }
}

/**
 * Preload a Draco-compressed GLB model into cache
 * @param {string} url - URL of the Draco-compressed GLB model
 * @param {string} version - Version string
 * @param {string} dracoDecoderPath - Path to Draco decoder files
 * @returns {Promise<Object>} Promise that resolves with the loaded scene
 */
export async function preloadDracoGLB(url, version = '1.0.0', dracoDecoderPath = '/draco/gltf/') {
    try {
        const cached = await getCachedDracoGLB(url)

        if (cached && cached.version === version) {
            console.log(`✅ ${url} already cached`)
            return
        }

        console.log(`📥 Preloading Draco model: ${url}`)
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        await setCachedDracoGLB(url, arrayBuffer, version)
        console.log(`✅ ${url} cached successfully`)
    } catch (error) {
        console.error(`Failed to preload ${url}:`, error)
    }
}
