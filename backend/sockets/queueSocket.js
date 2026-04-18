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
    // Real-time chat
  socket.on('chat:join', (userId) => {
    socket.join('user:' + userId);
    console.log('User joined chat room:', userId);
  });

  socket.on('chat:message', (data) => {
    // Emit to receiver
    io.to('user:' + data.receiver_id).emit('chat:newMessage', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('chat:typing', (data) => {
    io.to('user:' + data.receiver_id).emit('chat:typing', {
      sender_id: data.sender_id,
      sender_name: data.sender_name
    });
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });
};