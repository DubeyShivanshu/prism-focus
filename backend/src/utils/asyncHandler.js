/**
 * Wraps an async route handler and passes any rejected promises to Express's
 * next() error handler — eliminating repetitive try/catch in every controller.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => {
 *     const data = await someService()
 *     res.json(data)
 *   }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
