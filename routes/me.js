import express from 'express'
import { getCurrentUser } from '../controllers/meController.js'

// Initialize Express Router instance for user profile / session operations
export const meRouter = express.Router()

/**
 * Current User Profile Route
 * Returns active session state and basic info for the logged-in user.
 */

// Fetch details for the currently authenticated user
meRouter.get('/', getCurrentUser)