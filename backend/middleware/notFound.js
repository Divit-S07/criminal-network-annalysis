// middleware/notFound.js
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: 'The requested resource was not found.',
  });
}
