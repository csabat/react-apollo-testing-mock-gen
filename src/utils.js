const capitalize = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  return input.charAt(0).toUpperCase() + input.slice(1);
};

module.exports = {
  capitalize
}