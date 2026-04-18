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

  // -- VIDEO TELEMEDICINE --
  socket.on('video:join', (roomId) => {
    socket.join('video:' + roomId);
    const room = io.sockets.adapter.rooms.get('video:' + roomId);
    const numClients = room ? room.size : 0;
    console.log('Video join:', roomId, 'clients:', numClients);
    if (numClients === 1) {
      socket.emit('video:created', roomId);
    } else if (numClients === 2) {
      socket.emit('video:joined', roomId);
      socket.to('video:' + roomId).emit('video:ready');
    } else {
      socket.emit('video:full', roomId);
    }
  });

  socket.on('video:offer', (data) => {
    socket.to('video:' + data.roomId).emit('video:offer', data);
  });

  socket.on('video:answer', (data) => {
    socket.to('video:' + data.roomId).emit('video:answer', data);
  });

  socket.on('video:ice-candidate', (data) => {
    socket.to('video:' + data.roomId).emit('video:ice-candidate', data);
  });

  socket.on('video:leave', (roomId) => {
    socket.leave('video:' + roomId);
    socket.to('video:' + roomId).emit('video:peer-left');
  });

  socket.on('video:toggle-audio', (data) => {
    socket.to('video:' + data.roomId).emit('video:peer-toggle-audio', data);
  });

  socket.on('video:toggle-video', (data) => {
    socket.to('video:' + data.roomId).emit('video:peer-toggle-video', data);
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });
};