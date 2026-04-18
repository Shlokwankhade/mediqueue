
import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { toast } from './ToastStack';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

export default function VideoCall({ roomId, userName, onClose, isDoctor }) {
  const [status, setStatus] = useState('connecting');
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [peerAudio, setPeerAudio] = useState(true);
  const [peerVideo, setPeerVideo] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    const socket = getSocket();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('video:ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setStatus('connected');
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setStatus('disconnected');
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [roomId]);

  useEffect(() => {
    const socket = getSocket();
    let stream;

    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        socket.emit('video:join', roomId);
      } catch(e) {
        toast('Camera/microphone access denied', 'error');
        setStatus('error');
      }
    };

    socket.on('video:created', () => {
      setStatus('waiting');
    });

    socket.on('video:joined', () => {
      setStatus('connecting');
    });

    socket.on('video:ready', async () => {
      const pc = createPeerConnection();
      localStreamRef.current?.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('video:offer', { roomId, offer });
    });

    socket.on('video:offer', async ({ offer }) => {
      const pc = createPeerConnection();
      localStreamRef.current?.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('video:answer', { roomId, answer });
    });

    socket.on('video:answer', async ({ answer }) => {
      await peerConnectionRef.current?.setRemoteDescription(answer);
    });

    socket.on('video:ice-candidate', async ({ candidate }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(candidate);
      } catch(e) {}
    });

    socket.on('video:peer-left', () => {
      setStatus('ended');
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      clearInterval(timerRef.current);
      toast('The other person has left the call', 'info');
    });

    socket.on('video:peer-toggle-audio', ({ enabled }) => setPeerAudio(enabled));
    socket.on('video:peer-toggle-video', ({ enabled }) => setPeerVideo(enabled));

    init();

    return () => {
      socket.off('video:created');
      socket.off('video:joined');
      socket.off('video:ready');
      socket.off('video:offer');
      socket.off('video:answer');
      socket.off('video:ice-candidate');
      socket.off('video:peer-left');
      socket.off('video:peer-toggle-audio');
      socket.off('video:peer-toggle-video');
    };
  }, [roomId, createPeerConnection]);

  const toggleAudio = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (tracks) {
      const enabled = !audioOn;
      tracks.forEach(t => t.enabled = enabled);
      setAudioOn(enabled);
      getSocket().emit('video:toggle-audio', { roomId, enabled });
    }
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (tracks) {
      const enabled = !videoOn;
      tracks.forEach(t => t.enabled = enabled);
      setVideoOn(enabled);
      getSocket().emit('video:toggle-video', { roomId, enabled });
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
    getSocket().emit('video:leave', roomId);
    clearInterval(timerRef.current);
    onClose();
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return m + ':' + s;
  };

  const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:10000,
      background:'#060E1A',
      display:'flex', flexDirection:'column'
    }}>
      {/* Header */}
      <div style={{
        padding:'16px 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(0,0,0,0.4)', backdropFilter:'blur(10px)',
        borderBottom:'1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:tg,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i className='fas fa-video' style={{color:'white',fontSize:15}}/>
          </div>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15,color:'white'}}>
              {isDoctor ? 'Patient Consultation' : 'Doctor Consultation'}
            </div>
            <div style={{fontSize:12,color:'#94A3B8',display:'flex',alignItems:'center',gap:6}}>
              {status === 'connected' && (
                <>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#10B981',display:'inline-block'}}/>
                  Connected - {formatDuration(duration)}
                </>
              )}
              {status === 'waiting' && (
                <>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#F59E0B',display:'inline-block'}}/>
                  Waiting for other person...
                </>
              )}
              {status === 'connecting' && 'Connecting...'}
              {status === 'ended' && 'Call ended'}
              {status === 'error' && 'Camera access denied'}
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{padding:'5px 12px',background:'rgba(13,155,130,0.15)',border:'1px solid rgba(13,155,130,0.3)',borderRadius:99,fontSize:12,color:'#0D9B82',fontWeight:600}}>
            Room: {roomId}
          </div>
        </div>
      </div>

      {/* Video area */}
      <div style={{flex:1,position:'relative',overflow:'hidden',background:'#060E1A'}}>
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          style={{
            width:'100%', height:'100%',
            objectFit:'cover',
            background:'#0D1526',
            display: status === 'connected' ? 'block' : 'none'
          }}
        />

        {/* Waiting screen */}
        {status !== 'connected' && (
          <div style={{
            position:'absolute', inset:0,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            background:'radial-gradient(ellipse at center, #0D1526 0%, #060E1A 100%)'
          }}>
            <div style={{
              width:100,height:100,borderRadius:28,
              background:'linear-gradient(135deg,rgba(13,155,130,0.2),rgba(13,155,130,0.1))',
              border:'2px solid rgba(13,155,130,0.3)',
              display:'flex',alignItems:'center',justifyContent:'center',
              marginBottom:24,
              animation:'pulse 2s infinite'
            }}>
              <i className='fas fa-user-md' style={{color:'#0D9B82',fontSize:44}}/>
            </div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'white',marginBottom:8}}>
              {status === 'waiting' ? 'Waiting for patient...' :
               status === 'connecting' ? 'Connecting...' :
               status === 'ended' ? 'Call Ended' :
               status === 'error' ? 'Camera Error' : 'Connecting...'}
            </div>
            <div style={{fontSize:14,color:'#64748B',marginBottom:24}}>
              {status === 'waiting' ? 'Share the room ID with your patient' :
               status === 'connecting' ? 'Setting up secure connection...' :
               status === 'ended' ? 'The consultation has ended' :
               status === 'error' ? 'Please allow camera and microphone access' : ''}
            </div>
            {status === 'waiting' && (
              <div style={{
                background:'rgba(13,155,130,0.1)',
                border:'1px solid rgba(13,155,130,0.3)',
                borderRadius:12,padding:'12px 20px',
                display:'flex',alignItems:'center',gap:10
              }}>
                <i className='fas fa-link' style={{color:'#0D9B82'}}/>
                <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#0D9B82',fontSize:16}}>{roomId}</span>
                <button onClick={()=>{navigator.clipboard.writeText(roomId);toast('Room ID copied!','success');}} style={{background:'#0D9B82',color:'white',border:'none',borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:700}}>
                  Copy
                </button>
              </div>
            )}
          </div>
        )}

        {/* Peer no video overlay */}
        {status === 'connected' && !peerVideo && (
          <div style={{position:'absolute',inset:0,background:'#0D1526',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
            <div style={{width:80,height:80,borderRadius:20,background:'rgba(13,155,130,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className='fas fa-video-slash' style={{color:'#0D9B82',fontSize:32}}/>
            </div>
            <div style={{color:'#94A3B8',fontSize:14}}>Camera is off</div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        <div style={{
          position:'absolute',bottom:24,right:24,
          width:180,height:120,borderRadius:16,
          overflow:'hidden',
          border:'2px solid rgba(255,255,255,0.1)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          background:'#0D1526'
        }}>
          <video
            ref={localVideoRef}
            autoPlay playsInline muted
            style={{width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}}
          />
          {!videoOn && (
            <div style={{position:'absolute',inset:0,background:'#0D1526',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className='fas fa-video-slash' style={{color:'#94A3B8',fontSize:24}}/>
            </div>
          )}
          <div style={{position:'absolute',bottom:6,left:8,fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:600}}>You</div>
        </div>

        {/* Call duration */}
        {status === 'connected' && (
          <div style={{
            position:'absolute',top:16,left:'50%',transform:'translateX(-50%)',
            background:'rgba(0,0,0,0.6)',backdropFilter:'blur(10px)',
            borderRadius:99,padding:'6px 16px',
            fontSize:13,fontWeight:700,color:'white',
            border:'1px solid rgba(255,255,255,0.1)'
          }}>
            <i className='fas fa-circle' style={{color:'#F43F5E',fontSize:8,marginRight:6}}/>
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        padding:'20px 24px',
        background:'rgba(0,0,0,0.6)',
        backdropFilter:'blur(20px)',
        borderTop:'1px solid rgba(255,255,255,0.05)',
        display:'flex',alignItems:'center',justifyContent:'center',gap:16
      }}>
        {/* Mute */}
        <button onClick={toggleAudio} style={{
          width:56,height:56,borderRadius:18,cursor:'pointer',
          border:'none',display:'flex',alignItems:'center',justifyContent:'center',
          background:audioOn?'rgba(255,255,255,0.1)':'#F43F5E',
          transition:'all 0.2s',fontSize:20,color:'white'
        }}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          title={audioOn?'Mute':'Unmute'}>
          <i className={'fas fa-microphone'+(audioOn?'':'-slash')}/>
        </button>

        {/* End call */}
        <button onClick={endCall} style={{
          width:68,height:68,borderRadius:22,cursor:'pointer',
          border:'none',display:'flex',alignItems:'center',justifyContent:'center',
          background:'linear-gradient(135deg,#F43F5E,#E11D48)',
          boxShadow:'0 8px 24px rgba(244,63,94,0.5)',
          transition:'all 0.2s',fontSize:24,color:'white'
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1)';e.currentTarget.style.boxShadow='0 12px 32px rgba(244,63,94,0.7)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 8px 24px rgba(244,63,94,0.5)'}}
          title='End Call'>
          <i className='fas fa-phone-slash'/>
        </button>

        {/* Camera */}
        <button onClick={toggleVideo} style={{
          width:56,height:56,borderRadius:18,cursor:'pointer',
          border:'none',display:'flex',alignItems:'center',justifyContent:'center',
          background:videoOn?'rgba(255,255,255,0.1)':'#F43F5E',
          transition:'all 0.2s',fontSize:20,color:'white'
        }}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          title={videoOn?'Turn off camera':'Turn on camera'}>
          <i className={'fas fa-video'+(videoOn?'':'-slash')}/>
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { transform:scale(1); box-shadow: 0 0 0 0 rgba(13,155,130,0.4); }
          50% { transform:scale(1.02); box-shadow: 0 0 0 20px rgba(13,155,130,0); }
        }
      `}</style>
    </div>
  );
}
