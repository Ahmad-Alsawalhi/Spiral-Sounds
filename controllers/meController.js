import { getDBConnection } from '../db/db.js'

/**
 * Retrieves the currently authenticated user's session status and basic profile info.
 * Used by the frontend to check login state on page load/refresh.
 */
export async function getCurrentUser(req, res) {
  try {
    // 1. Session Verification: Check if a user ID exists in the active session
    if (!req.session || !req.session.userId) {
      return res.json({ isLoggedIn: false })
    }

    const db = await getDBConnection()

    // 2. User Lookup: Retrieve the user's name using the session ID
    const user = await db.get('SELECT name FROM users WHERE id = ?', [req.session.userId])

    // 3. Edge Case Handling: Handle cases where session exists but user record was deleted
    if (!user) {
      return res.json({ isLoggedIn: false })
    }

    // 4. Success Response: Return authenticated status along with user display name
    return res.json({ isLoggedIn: true, name: user.name })

  } catch (err) {
    // Internal server error handling
    console.error('getCurrentUser error:', err.message)
    return res.status(500).json({ error: 'Internal server error' })
  }
}