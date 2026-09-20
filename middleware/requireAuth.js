/**
 * Authentication Middleware: Protects private routes from unauthorized access.
 * Verifies if an active user session exists before proceeding to the next route handler.
 */
export function requireAuth(req, res, next) {
  // 1. Session Check: Verify if the user is logged in via session
  if (!req.session || !req.session.userId) {
    // Log unauthorized access attempt internally for server logs
    console.log('Access to protected route blocked')
    
    // Return 401 Unauthorized status and halt request execution
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 2. Pass Control: Session is valid, proceed to the target route controller
  next()
}