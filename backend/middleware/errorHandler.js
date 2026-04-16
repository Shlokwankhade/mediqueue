const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === '23505')
    return res.status(400).json({ success: false, message: 'Email already registered' });
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
};
module.exports = errorHandler;