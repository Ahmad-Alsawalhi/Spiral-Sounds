import { getDBConnection } from './db/db.js'

/**
 * Utility function to log the contents of a specified database table to the console.
 * Useful for debugging and inspecting SQLite database records during development.
 */
async function logTable() {
  // 1. Establish database connection
  const db = await getDBConnection()

  // Select target table name (uncomment desired table for inspection)
  const tableName = 'cart_items'
  // const tableName = 'products'
  // const tableName = 'users'

  try {
    // 2. Fetch all records from the selected table
    // Note: Table name is injected via template literal since SQL placeholders cannot be used for table names
    const table = await db.all(`SELECT * FROM ${tableName}`)
    
    // 3. Display data in a structured tabular format in the terminal
    console.table(table)

  } catch (err) {
    // Catch and print database query errors
    console.error('Error fetching table:', err.message)

  } finally {
    // 4. Cleanup: Ensure database connection is safely closed regardless of success or failure
    await db.close()

  }
}

// Execute the logging utility function
logTable()