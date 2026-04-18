
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function MessagesPanel() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadContacts();
    loadConversations();
    
    // Join socket room
    const socket = getSocket();
    if (socket && user?.id) {
      socket.emit('chat:join', user.id);
      
      socket.on('chat:newMessage', (msg) => {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        loadConversations();
      });
      
      socket.on('chat:typing', (data) => {
        setTypingUser(data.sender_name);
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      });
    }
    
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('chat:newMessage');
        socket.off('chat:typing');
      }
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadContacts = async () => {
    try {
      const r = await api.get('/messages/contacts');
      setContacts(r.data.contacts || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadConversations = async () => {
    try {
      const r = await api.get('/messages/conversations');
      setConversations(r.data.conversations || []);
    } catch(e) { console.error(e); }
  };

  const selectUser = async (contact) => {
    setSelectedUser(contact);
    try {
      const r = await api.get('/messages/' + contact.id);
      setMessages(r.data.messages || []);
      loadConversations();
    } catch(e) { console.error(e); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser) return;
    setSending(true);
    try {
      const r = await api.post('/messages', {
        receiver_id: selectedUser.id,
        content: newMsg.trim()
      });
      const msg = r.data.message;
      setMessages(prev => [...prev, { ...msg, sender_name: user?.name }]);
      
      // Emit via socket
      const socket = getSocket();
      if (socket) {
        socket.emit('chat:message', {
          ...msg,
          receiver_id: selectedUser.id,
          sender_name: user?.name
        });
      }
      setNewMsg('');
      loadConversations();
    } catch(e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket && selectedUser) {
      socket.emit('chat:typing', {
        sender_id: user?.id,
        sender_name: user?.name,
        receiver_id: selectedUser.id
      });
    }
  };

  const getUnread = (contactId) => {
    const conv = conversations.find(c => c.other_user === contactId);
    return conv?.unread_count || 0;
  };

  const getLastMessage = (contactId) => {
    const conv = conversations.find(c => c.other_user === contactId);
    return conv ? conv.content?.substring(0, 40) + (conv.content?.length > 40 ? '...' : '') : '';
  };

  const getInitials = (name) => name?.slice(0,2).toUpperCase() || '??';
  const getRoleColor = (role) => role === 'doctor' ? '#7C3AED' : '#0D9B82';

  if (loading) return (
    <div style={{padding:60,textAlign:'center',color:'var(--text-3)'}}>
      <i className='fas fa-spinner fa-spin' style={{fontSize:32,display:'block',marginBottom:12,color:'#0D9B82'}}/>
      Loading messages...
    </div>
  );

  return (
    <div className='fu' style={{height:'calc(100vh - 120px)',display:'flex',gap:16}}>
      
      {/* Contacts Sidebar */}
      <div style={{width:300,flexShrink:0,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'18px 16px',borderBottom:'1px solid #E2E8F0'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:12}}>Messages</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:10,padding:'8px 12px'}}>
            <i className='fas fa-search' style={{color:'var(--text-3)',fontSize:13}}/>
            <input placeholder='Search contacts...' style={{background:'none',border:'none',outline:'none',fontSize:13,color:'var(--text)',width:'100%',fontFamily:'DM Sans,sans-serif'}}/>
          </div>
        </div>
        
        <div style={{flex:1,overflowY:'auto'}}>
          {contacts.length === 0 ? (
            <div style={{textAlign:'center',padding:'40px 20px',color:'var(--text-3)'}}>
              <i className='fas fa-comments' style={{fontSize:36,display:'block',marginBottom:12}}/>
              <div style={{fontSize:14,fontWeight:600,marginBottom:6,color:'var(--text)'}}>No contacts yet</div>
              <div style={{fontSize:12}}>You can message doctors after booking appointments</div>
            </div>
          ) : contacts.map(c => {
            const unread = getUnread(c.id);
            const isSelected = selectedUser?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => selectUser(c)}
                style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'14px 16px',cursor:'pointer',
                  background:isSelected?'#E6F7F4':'transparent',
                  borderBottom:'1px solid #F1F5F9',
                  transition:'all .2s'
                }}
                onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background='#F8FAFC'}}
                onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background='transparent'}}
              >
                <div style={{position:'relative',flexShrink:0}}>
                  <div style={{width:44,height:44,borderRadius:12,background:getRoleColor(c.role),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:15}}>
                    {getInitials(c.name)}
                  </div>
                  <div style={{position:'absolute',bottom:2,right:2,width:10,height:10,background:'#10B981',borderRadius:'50%',border:'2px solid white'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:2}}>{c.name}</div>
                  <div style={{fontSize:12,color:'var(--text-3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {getLastMessage(c.id) || (c.speciality ? c.speciality : c.role)}
                  </div>
                </div>
                {unread > 0 && (
                  <div style={{width:20,height:20,background:'#0D9B82',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'white',flexShrink:0}}>
                    {unread}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{flex:1,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {!selectedUser ? (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',color:'var(--text-3)'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'#E6F7F4',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
              <i className='fas fa-comments' style={{fontSize:36,color:'#0D9B82'}}/>
            </div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:8}}>Select a conversation</div>
            <div style={{fontSize:14}}>Choose a contact to start chatting</div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{padding:'16px 20px',borderBottom:'1px solid #E2E8F0',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:getRoleColor(selectedUser.role),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:15,flexShrink:0}}>
                {getInitials(selectedUser.name)}
              </div>
              <div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700}}>{selectedUser.name}</div>
                <div style={{fontSize:12,color:'var(--text-3)',display:'flex',alignItems:'center',gap:5}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#10B981',display:'inline-block'}}/>
                  {selectedUser.speciality || selectedUser.role} - Online
                </div>
              </div>
              <div style={{marginLeft:'auto',display:'flex',gap:8}}>
                <button style={{width:36,height:36,borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)'}}>
                  <i className='fas fa-phone'/>
                </button>
                <button style={{width:36,height:36,borderRadius:10,background:'#E6F7F4',border:'1px solid #0D9B82',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#0D9B82'}}>
                  <i className='fas fa-video'/>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:12,background:'var(--surface-2)'}}>
              {messages.length === 0 ? (
                <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',color:'var(--text-3)'}}>
                  <i className='fas fa-comment-medical' style={{fontSize:32,marginBottom:10,color:'#0D9B82'}}/>
                  <div style={{fontSize:14}}>Start the conversation!</div>
                </div>
              ) : messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const showName = i === 0 || messages[i-1]?.sender_id !== msg.sender_id;
                return (
                  <div key={msg.id || i} style={{display:'flex',flexDirection:'column',alignItems:isMe?'flex-end':'flex-start'}}>
                    {showName && !isMe && (
                      <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4,marginLeft:8}}>{msg.sender_name}</div>
                    )}
                    <div style={{
                      maxWidth:'70%',
                      padding:'10px 14px',
                      borderRadius:isMe?'18px 18px 4px 18px':'18px 18px 18px 4px',
                      background:isMe?tg:'white',
                      color:isMe?'white':'#0A1628',
                      fontSize:14,
                      lineHeight:1.5,
                      boxShadow:'0 1px 4px rgba(0,0,0,.08)',
                      border:isMe?'none':'1px solid #E2E8F0'
                    }}>
                      {msg.content}
                    </div>
                    <div style={{fontSize:10,color:'var(--text-3)',marginTop:3,marginLeft:isMe?0:8,marginRight:isMe?8:0}}>
                      {new Date(msg.created_at).toLocaleTimeString('en-IN',{timeStyle:'short'})}
                      {isMe && <i className={'fas fa-check'+(msg.is_read?'-double':'')} style={{marginLeft:4,color:msg.is_read?'#0D9B82':'#94A3B8'}}/>}
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--text-3)',fontSize:12}}>
                  <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'8px 14px'}}>
                    <span>{typingUser} is typing</span>
                    <span style={{marginLeft:4}}>...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input */}
            <div style={{padding:'12px 16px',borderTop:'1px solid #E2E8F0',background:'var(--surface)'}}>
              <form onSubmit={sendMessage} style={{display:'flex',gap:10,alignItems:'center'}}>
                <button type='button' style={{width:36,height:36,borderRadius:10,background:'var(--surface-2)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)',flexShrink:0}}>
                  <i className='fas fa-paperclip'/>
                </button>
                <input
                  value={newMsg}
                  onChange={e => { setNewMsg(e.target.value); handleTyping(); }}
                  placeholder={'Message ' + selectedUser.name + '...'}
                  style={{flex:1,padding:'10px 14px',background:'var(--surface-2)',border:'1.5px solid #E2E8F0',borderRadius:12,fontSize:14,color:'var(--text)',outline:'none',fontFamily:'DM Sans,sans-serif'}}
                  onFocus={e=>e.target.style.borderColor='#0D9B82'}
                  onBlur={e=>e.target.style.borderColor='#E2E8F0'}
                />
                <button
                  type='submit'
                  disabled={sending || !newMsg.trim()}
                  style={{width:42,height:42,borderRadius:12,background:newMsg.trim()?tg:'#F1F5F9',border:'none',cursor:newMsg.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',color:newMsg.trim()?'white':'#94A3B8',flexShrink:0,transition:'all .2s'}}
                >
                  <i className='fas fa-paper-plane'/>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
