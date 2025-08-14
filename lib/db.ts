import { Pool } from "pg"

// Neon database configuration
const dbHost = "ep-tiny-snow-a2dpd0fn-pooler.eu-central-1.aws.neon.tech";
const useSSL = dbHost?.includes("render.com") || dbHost?.includes("neon.tech");

const pool = new Pool({
  user: "neondb_owner",
  host: dbHost,
  database: "neondb",
  password: "npg_43VHrdvtDTbK",
  port: 5432,

  // Connection settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
  query_timeout: 30000,
  application_name: 'vibeflow-banking',

  // SSL configuration
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

// Create a query cache for frequently used queries
const queryCache = new Map()

// Export the query function with caching and better error handling
export async function query(text: string, params?: any[], useCache = false) {
  const client = await pool.connect()
  try {
    const start = performance.now()

    // Check cache for identical queries
    const cacheKey = useCache ? `${text}:${JSON.stringify(params || [])}` : null

    if (cacheKey && queryCache.has(cacheKey)) {
      const cachedResult = queryCache.get(cacheKey)
      const duration = performance.now() - start

      if (duration > 100) {
        console.log("Cache hit for query:", { text, duration, rows: cachedResult.rowCount })
      }

      return cachedResult
    }

    // Execute the query with retry logic
    let retries = 3
    while (retries > 0) {
      try {
        const res = await client.query(text, params)
        const duration = performance.now() - start

        // Log slow queries for optimization
        if (duration > 100) {
          console.log("Slow query:", { text, duration, rows: res.rowCount })
        }

        // Cache the result if caching is enabled
        if (cacheKey) {
          queryCache.set(cacheKey, res)

          // Set expiry for cache items (30 seconds)
          setTimeout(() => {
            queryCache.delete(cacheKey)
          }, 30000)
        }

        return res
      } catch (error) {
        retries--
        if (retries === 0) throw error
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  } finally {
    client.release()
  }
}

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err)
  } else {
    console.log("Connected to PostgreSQL database")
  }
})

// Export the pool for direct use when needed
export { pool }
