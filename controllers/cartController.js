import { getDBConnection } from '../db/db.js'

/**
 * Adds an item to the user's shopping cart or increments its quantity if it already exists.
 */
export async function addToCart(req, res) {
  try {
    const db = await getDBConnection()

    // 1. Input Sanitization: Parse and validate the incoming product ID
    const productId = parseInt(req.body.productId, 10)

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    const userId = req.session.userId

    // 2. Existence Check: Check if this specific item is already in the user's cart
    const existing = await db.get(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )

    // 3. Upsert Logic: Increment quantity if exists, otherwise create new cart item row
    if (existing) {
      await db.run(
        'UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?',
        [existing.id]
      )
    } else {
      await db.run(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)',
        [userId, productId]
      )
    }

    return res.json({ message: 'Added to cart' })

  } catch (err) {
    console.error('addToCart error:', err.message)
    return res.status(500).json({ error: 'Failed to add item to cart.' })
  }
}

/**
 * Fetches the total number of items currently in the user's cart (sum of quantities).
 */
export async function getCartCount(req, res) {
  try {
    const db = await getDBConnection()

    // Aggregate query to compute the total quantity of all cart items for the session user
    const result = await db.get(
      'SELECT SUM(quantity) AS totalItems FROM cart_items WHERE user_id = ?',
      [req.session.userId]
    )

    // Fallback to 0 if the cart is completely empty (SUM returns null)
    return res.json({ totalItems: result?.totalItems || 0 })

  } catch (err) {
    console.error('getCartCount error:', err.message)
    return res.status(500).json({ error: 'Failed to retrieve cart count.' })
  }
}  

/**
 * Retrieves all items in the user's cart, joining with products table for metadata (title, price, etc.).
 */
export async function getAll(req, res) {
  try {
    const db = await getDBConnection()

    // Join cart_items with products table to retrieve display details along with quantity
    const items = await db.all(
      `SELECT ci.id AS cartItemId, ci.quantity, p.title, p.artist, p.price 
       FROM cart_items ci 
       JOIN products p ON p.id = ci.product_id 
       WHERE ci.user_id = ?`,
      [req.session.userId]
    ) 

    return res.json({ items: items })

  } catch (err) {
    console.error('getAll cart error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch cart items.' })
  }
}  

/**
 * Deletes a single specific item from the user's cart by its cart item ID.
 */
export async function deleteItem(req, res) {
  try {
    const db = await getDBConnection()

    // 1. Parameter Validation: Ensure itemId parameter is a valid integer
    const itemId = parseInt(req.params.itemId, 10)

    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' })
    }

    // 2. Ownership Check: Verify that the item exists and belongs to the active user
    const item = await db.get(
      'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, req.session.userId]
    )

    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    // 3. Deletion: Remove item safely scoped to the active user ID
    await db.run(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, req.session.userId]
    )

    // 204 No Content for successful deletion without response payload
    return res.status(204).send()

  } catch (err) {
    console.error('deleteItem error:', err.message)
    return res.status(500).json({ error: 'Failed to delete cart item.' })
  }
}

/**
 * Clears all items from the current user's cart (e.g., after checkout or clear cart action).
 */
export async function deleteAll(req, res) {
  try {
    const db = await getDBConnection()

    // Bulk delete all cart items assigned to the current user session
    await db.run('DELETE FROM cart_items WHERE user_id = ?', [req.session.userId])

    return res.status(204).send()

  } catch (err) {
    console.error('deleteAll cart error:', err.message)
    return res.status(500).json({ error: 'Failed to clear cart.' })
  }
}
