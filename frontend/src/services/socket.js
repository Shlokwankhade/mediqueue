import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
  transports: ['websocket']
});

export const connectSocket = () => socket.connect();
export const disconnectSocket = () => socket.disconnect();
export const joinQueueRoom = (doctorId) => socket.emit('join_queue_room', doctorId);
export const onQueueUpdated = (cb) => socket.on('queue_updated', cb);
export const offQueueUpdated = () => socket.off('queue_updated');
export const emitCallNext = (data) => socket.emit('call_next_patient', data);

export default socket;