// server/utils/location.js
function formatLocation(location) {
  return `${location.latitude},${location.longitude}`;
}

module.exports = { formatLocation };
