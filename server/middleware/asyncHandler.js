// Express 4 does not forward rejected promises from async route handlers to error
// middleware on its own — an unhandled rejection (e.g. a malformed :id triggering a
// Mongoose CastError) crashes the whole process instead of returning a clean error
// response. Wrapping handlers with this forwards the error to next() correctly.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
