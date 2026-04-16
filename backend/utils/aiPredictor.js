const predictWaitTime = (position, avgMinutes = 8) => position * avgMinutes;
module.exports = { predictWaitTime };