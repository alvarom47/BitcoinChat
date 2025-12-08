module.exports = function sanitize(input) {
  if (!input) return '';
  return String(input).replace(/</g,'&lt;').replace(/>/g,'&gt;').trim();
}
