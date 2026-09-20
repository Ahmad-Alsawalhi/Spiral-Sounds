import validator from 'validator'
import { getDBConnection } from '../db/db.js'
import bcrypt from 'bcryptjs'

/**
 * Handles new user registration.
 * Validates input, checks for existing users, hashes password, and creates session.
 */
export async function registerUser(req, res) {
  let { name, email, username, password } = req.body

  // 1. Mandatory Fields Check: Ensure no required parameter is missing
  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  // 2. Data Sanitization: Strip leading and trailing whitespace from string inputs
  name = name.trim()
  email = email.trim()
  username = username.trim()

  // 3. Username Format Validation: Allow 1-20 alphanumeric characters, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]{1,20}$/.test(username)) {
    return res.status(400).json({
      error: 'Username must be 1–20 characters, using letters, numbers, _ or -.'
    })
  }

  // 4. Email Format Validation: Verify syntax using the validator library
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  try {
    const db = await getDBConnection()

    // 5. Uniqueness Check: Prevent duplicate registration for email or username
    const existing = await db.get(
      'SELECT id FROM users WHERE email = ? OR username = ?', 
      [email, username]
    )

    if (existing) {
      return res.status(400).json({ error: 'Email or username already in use.' })
    }

    // 6. Password Hashing: Secure password using bcrypt with a salt factor of 10
    const hashed = await bcrypt.hash(password, 10)

    // 7. Database Insertion: Store user info securely in the SQLite database
    const result = await db.run(
      'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)', 
      [name, email, username, hashed]
    )

    // 8. Auto-Login / Session Initialization: Save new user's ID to session
    req.session.userId = result.lastID

    return res.status(201).json({ message: 'User registered' })

  } catch (err) {
    // Log detailed server error internally and send generic error to client
    console.error('Registration error:', err.message)
    return res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
}

/**
 * Handles user authentication/login.
 * Verifies credentials, compares password hash, and starts a session.
 */
export async function loginUser(req, res) {
  let { username, password } = req.body

  // 1. Input Check: Ensure both credentials are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  username = username.trim()

  try {
    const db = await getDBConnection()

    // 2. User Lookup: Retrieve user record by username
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username])

    // Prevent user enumeration by keeping error messages generic
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // 3. Password Verification: Compare plaintext password against stored hash
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // 4. Session Setup: Store authenticated user ID in current session
    req.session.userId = user.id
    return res.json({ message: 'Logged in' })

  } catch (err) {
    console.error('Login error:', err.message)
    return res.status(500).json({ error: 'Login failed. Please try again.' })
  }
}

/**
 * Handles user logout.
 * Destroys the active session and clears user session data.
 */
export async function logoutUser(req, res) {
  // Clear user session store data on the server
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err)
      return res.status(500).json({ error: 'Could not log out. Please try again.' })
    }
    
    // Express-session automatically handles response after destruction callback
    return res.json({ message: 'Logged out' })
  })
}