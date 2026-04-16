-- Demo admin user (password: admin123)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin User', 'admin@mediqueue.com', '9000000001',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Demo doctor user (password: password)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Dr. Sarah Smith', 'doctor@mediqueue.com', '9000000002',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Dr. Anil Kapoor', 'anil@mediqueue.com', '9000000003',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor');

-- Demo patient user (password: password)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Rajesh Kumar', 'patient@mediqueue.com', '9876543210',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient');

-- Doctor profiles
INSERT INTO doctors (user_id, speciality, experience_years, consultation_fee, rating, bio, room_number)
SELECT id, 'Cardiology', 12, 800, 4.9, 'Expert cardiologist with 12 years experience.', '204'
FROM users WHERE email = 'doctor@mediqueue.com';

INSERT INTO doctors (user_id, speciality, experience_years, consultation_fee, rating, bio, room_number)
SELECT id, 'Orthopaedics', 15, 900, 4.7, 'Specialist in joint and bone disorders.', '305'
FROM users WHERE email = 'anil@mediqueue.com';

SELECT 'Seed data inserted! Demo logins ready 🚀' AS status;