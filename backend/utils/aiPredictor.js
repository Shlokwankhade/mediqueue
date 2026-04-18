
// AI Wait Time Predictor
// Uses weighted factors to predict wait time accurately

const FACTORS = {
  // Average consultation times by type (minutes)
  consultationTimes: {
    in_person: 12,
    telehealth: 8,
    follow_up: 7,
    emergency: 20,
    default: 10
  },
  // Time of day multipliers (busier = longer wait)
  timeOfDay: {
    morning: 1.3,   // 9-11 AM - busiest
    midday: 1.0,    // 11-2 PM - normal
    afternoon: 0.8, // 2-5 PM - lighter
    evening: 0.7    // 5+ PM - quietest
  },
  // Day of week multipliers
  dayOfWeek: {
    0: 0.6,  // Sunday
    1: 1.3,  // Monday - busiest
    2: 1.1,  // Tuesday
    3: 1.0,  // Wednesday
    4: 1.1,  // Thursday
    5: 1.2,  // Friday
    6: 0.7   // Saturday
  }
};

function getTimeMultiplier() {
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 11) return FACTORS.timeOfDay.morning;
  if (hour >= 11 && hour < 14) return FACTORS.timeOfDay.midday;
  if (hour >= 14 && hour < 17) return FACTORS.timeOfDay.afternoon;
  return FACTORS.timeOfDay.evening;
}

function getDayMultiplier() {
  return FACTORS.dayOfWeek[new Date().getDay()] || 1.0;
}

function getConsultationTime(type) {
  return FACTORS.consultationTimes[type] || FACTORS.consultationTimes.default;
}

// Calculate doctor speed from historical data
function calculateDoctorSpeed(completedPatients) {
  if (!completedPatients || completedPatients.length === 0) return 1.0;
  // If doctor is fast (< 8 min avg), speed up estimates
  // If slow (> 15 min avg), slow down estimates
  const avgTime = completedPatients.reduce((a,b) => a + b, 0) / completedPatients.length;
  if (avgTime < 8) return 0.7;
  if (avgTime > 15) return 1.4;
  return 1.0;
}

// Main prediction function
function predictWaitTime(params) {
  const {
    position,           // Patient position in queue (1-based)
    appointmentType,    // Type of appointment
    completedToday,     // Number completed so far today
    doctorSpeedFactor   // Historical speed factor
  } = params;

  // Base time per patient
  const baseTime = getConsultationTime(appointmentType);
  
  // Apply multipliers
  const timeMultiplier = getTimeMultiplier();
  const dayMultiplier = getDayMultiplier();
  const speedFactor = doctorSpeedFactor || 1.0;
  
  // Calculate raw wait time
  let waitTime = position * baseTime * timeMultiplier * dayMultiplier * speedFactor;
  
  // Add buffer for variability (10%)
  waitTime = waitTime * 1.1;
  
  // Round to nearest minute
  waitTime = Math.round(waitTime);
  
  // Minimum 2 minutes, maximum 120 minutes
  waitTime = Math.max(2, Math.min(120, waitTime));

  // Confidence score based on data quality
  const confidence = completedToday > 5 ? 'high' : completedToday > 2 ? 'medium' : 'low';
  
  return {
    estimatedMinutes: waitTime,
    confidence,
    factors: {
      baseConsultationTime: baseTime,
      timeOfDayMultiplier: timeMultiplier,
      dayOfWeekMultiplier: dayMultiplier,
      doctorSpeedFactor: speedFactor,
      position
    }
  };
}

// Predict for all waiting patients at once
function predictQueueWaitTimes(queue, appointmentType = 'in_person') {
  const completed = queue.filter(q => q.status === 'completed');
  const waiting = queue.filter(q => q.status === 'waiting');
  
  // Estimate doctor speed from completed patients
  const speedFactor = calculateDoctorSpeed(
    completed.map(() => getConsultationTime(appointmentType))
  );

  return waiting.map((patient, index) => ({
    ...patient,
    predicted_wait: predictWaitTime({
      position: index + 1,
      appointmentType: patient.appointment_type || appointmentType,
      completedToday: completed.length,
      doctorSpeedFactor: speedFactor
    })
  }));
}

module.exports = { predictWaitTime, predictQueueWaitTimes };
