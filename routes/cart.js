import express from 'express'
import { 
  addToCart, 
  getCartCount, 
  getAll, 
  deleteItem, 
  deleteAll 
} from '../controllers/cartController.js'
import { requireAuth } from '../middleware/requireAuth.js'

// Initialize Express Router instance for cart management
export const cartRouter = express.Router()

/**
 * Cart Routes Definition
 * Note: All endpoints are protected by the `requireAuth` middleware 
 * to ensure only logged-in users can access or modify cart data.
 */

// 1. Add item to cart
cartRouter.post('/add', requireAuth, addToCart) 

// 2. Fetch total count of items in user's cart
cartRouter.get('/cart-count', requireAuth, getCartCount)

// 3. Fetch all cart items along with product details
cartRouter.get('/', requireAuth, getAll) 

// 4. Clear all items from user's cart (Must be declared before `/:itemId` to avoid route conflicts)
cartRouter.delete('/all', requireAuth, deleteAll) 

// 5. Remove a specific item from cart by ID
cartRouter.delete('/:itemId', requireAuth, deleteItem) 