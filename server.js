import express from 'express'
import { productsRouter } from './routes/products.js'
import { authRouter } from './routes/auth.js'
import { meRouter } from './routes/me.js'
import { cartRouter } from './routes/cart.js' 
import session from 'express-session'

// 1. Server Initialization & Environment Configuration
const app = express() 
const PORT = 8000

// Fallback session secret for development if environment variable is not provided
const secret = process.env.SPIRAL_SESSION_SECRET || 'jellyfish-baskingshark'

// 2. Global Middlewares

// Parse incoming requests with JSON payloads (req.body)
app.use(express.json()) 

// Configure session middleware for user authentication tracking
app.use(session({
  secret: secret,
  resave: false,             // Do not save session if unmodified
  saveUninitialized: false,  // Do not create session until something is stored
  cookie: {
    httpOnly: true,          // Mitigate XSS: Prevent client-side JS from reading cookie
    secure: false,           // Set to true in production with HTTPS
    sameSite: 'lax'          // Mitigate CSRF while allowing standard navigation
  }
}))

// Serve static assets from the 'public' folder (HTML, CSS, Client JS, Images)
app.use(express.static('public'))

// 3. API Route Mounts

// Product catalog endpoints
app.use('/api/products', productsRouter)

// Current authenticated user session endpoint (Must be declared before general /api/auth)
app.use('/api/auth/me', meRouter)

// Authentication endpoints (Register, Login, Logout)
app.use('/api/auth', authRouter)

// Shopping cart management endpoints
app.use('/api/cart', cartRouter)

// 4. Server Execution & Error Handling
app.listen(PORT, () => { 
  console.log(`Server running at http://localhost:${PORT}`)
}).on('error', (err) => {
  console.error('Failed to start server:', err)
})