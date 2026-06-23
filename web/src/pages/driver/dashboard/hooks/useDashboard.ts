import { useState, useEffect } from 'react';
import { sessionService, ParkingSession, SessionStatus } from '../../../../services/session.service';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../../../store/useAuthStore';

export function useDashboard() {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const token = useAuthStore(state => state.token);

  const fetchSessions = async () => {
    try {
      const res = await sessionService.getMySessions();
      setSessions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return;
    const socketUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
    const socket: Socket = io(socketUrl, {
      auth: { token }
    });

    socket.on('connect', () => console.log('Socket connected for Dashboard'));
    
    socket.on('session:created', () => fetchSessions());
    socket.on('session:updated', () => fetchSessions());
    socket.on('session:completed', () => fetchSessions());

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const activeSession = sessions.find(s => s.status === SessionStatus.ACTIVE || s.status === SessionStatus.PENDING_PAYMENT);

  let diffHrs = 0;
  let diffMins = 0;
  let checkInDate = null;

  if (activeSession) {
    checkInDate = new Date(activeSession.checkInTime);
    const diffMs = currentTime.getTime() - checkInDate.getTime();
    diffHrs = Math.floor(diffMs / 3600000);
    diffMins = Math.floor((diffMs % 3600000) / 60000);
  }

  const qrUrl = activeSession 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${activeSession.code}&bgcolor=ffffff&color=000000&margin=10`
    : '';

  return {
    loading,
    activeSession,
    checkInDate,
    diffHrs,
    diffMins,
    qrUrl
  };
}
