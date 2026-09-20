import express from 'express'
import { getGenres, getProducts } from '../controllers/productsController.js'

// Initialize Express Router instance for product-related operations
export const productsRouter = express.Router()

/**
 * Product & Genre Routes Definition
 * Handles public data retrieval for catalog filtering, searching, and product listing.
 */

// 1. Fetch unique product genres (Must be declared before '/' to avoid routing conflicts)
productsRouter.get('/genres', getGenres)

// 2. Fetch all products or filter them via query parameters (?genre=... or ?search=...)
productsRouter.get('/', getProducts)