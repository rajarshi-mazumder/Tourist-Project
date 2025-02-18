// server/utils/location.js
function formatLocation(location) {
  return `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
}

module.exports = { formatLocation };
