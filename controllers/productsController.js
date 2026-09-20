import { getDBConnection } from '../db/db.js'

/**
 * Fetches all unique product genres/categories available in the database.
 * Formats the SQL result from an array of objects into a flat array of strings.
 */
export async function getGenres(req, res) {
  try {
    const db = await getDBConnection()

    // 1. Database Query: Retrieve distinct genre names to avoid duplicate categories
    const genreRows = await db.all('SELECT DISTINCT genre FROM products')

    // 2. Data Transformation: Convert array of objects [{genre: 'Rock'}] to flat array ['Rock']
    const genres = genreRows.map(row => row.genre)

    return res.json(genres)

  } catch (err) {
    console.error('Error fetching genres:', err.message)
    return res.status(500).json({ 
      error: 'Failed to fetch genres', 
      details: err.message 
    })
  }
}

/**
 * Retrieves products with optional filtering by genre and search keyword.
 * Dynamically builds SQL query parameters based on incoming request queries.
 */
export async function getProducts(req, res) {
  try {
    const db = await getDBConnection()

    let query = 'SELECT * FROM products'
    const conditions = []
    const params = []

    const { genre, search } = req.query

    // 1. Dynamic Filtering: Check for 'genre' filter parameter
    if (genre) {
      conditions.push('genre = ?')
      params.push(genre)
    }

    // 2. Dynamic Search: Check for 'search' filter parameter (matches title, artist, or genre)
    if (search) {
      conditions.push('(title LIKE ? OR artist LIKE ? OR genre LIKE ?)')
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    // 3. Query Construction: Append WHERE clauses if filters are active
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    // 4. Execution: Fetch filtered or full product records
    const products = await db.all(query, params)

    return res.json(products)

  } catch (err) {
    console.error('Error fetching products:', err.message)
    return res.status(500).json({ 
      error: 'Failed to fetch products', 
      details: err.message 
    })
  }
}