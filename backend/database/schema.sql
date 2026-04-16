-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient','doctor','admin')),
  profile_image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  speciality VARCHAR(100) NOT NULL,
  experience_years INT DEFAULT 0,
  consultation_fee NUMERIC(10,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  bio TEXT,
  available_from TIME DEFAULT '09:00',
  available_to TIME DEFAULT '17:00',
  working_days TEXT[] DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri'],
  is_available BOOLEAN DEFAULT TRUE,
  room_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_time TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 15,
  type VARCHAR(20) DEFAULT 'in_person' CHECK (type IN ('in_person','telehealth')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  chief_complaint TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- QUEUE TABLE
CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_number VARCHAR(20) NOT NULL,
  position INT NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting','called','in_progress','completed','skipped')),
  estimated_wait_minutes INT DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  called_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  doctor_id UUID REFERENCES doctors(id),
  patient_id UUID REFERENCES users(id),
  medicines JSONB NOT NULL DEFAULT '[]',
  diagnosis TEXT,
  notes TEXT,
  follow_up_date DATE,
  issued_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(appointment_time);
CREATE INDEX IF NOT EXISTS idx_queue_doctor ON queue_entries(doctor_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue_entries(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments(appointment_id);

-- SUCCESS MESSAGE
SELECT 'MEDIQUEUE schema created successfully! 🎉' AS status;