module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join_queue_room', (doctorId) => socket.join('queue_' + doctorId));
    socket.on('call_next_patient', (data) => {
      io.to('queue_' + data.doctorId).emit('queue_updated', { action: 'next_called', currentToken: data.tokenNumber, patientName: data.patientName, timestamp: new Date().toISOString() });
    });
    socket.on('patient_joined', (data) => {
      io.to('queue_' + data.doctorId).emit('queue_updated', { action: 'patient_joined', tokenNumber: data.tokenNumber, position: data.position, timestamp: new Date().toISOString() });
    });
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });
};