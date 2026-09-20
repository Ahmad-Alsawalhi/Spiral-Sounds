import express from 'express'
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js'

// Initialize Express Router instance for authentication operations
export const authRouter = express.Router()

/**
 * Authentication Routes Definition
 * Maps endpoint requests to corresponding user authentication controller actions.
 */

// 1. User Registration: Create a new account
authRouter.post('/register', registerUser)

// 2. User Login: Authenticate credentials and initiate session
authRouter.post('/login', loginUser) 

// 3. User Logout: Destroy active user session
authRouter.get('/logout', logoutUser)

