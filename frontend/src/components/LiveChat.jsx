import React, {useEffect, useState, useRef} from 'react'
import socket from '../lib/socket'
import ChatMessage from './ChatMessage'

export default function LiveChat(){
  const [username, setUsername] = useState(localStorage.getItem('username')||'')
  const [tempName, setTempName] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesRef = useRef()

  useEffect(()=>{
    if (!username) return
    socket.emit('join_live_chat', { username })
    socket.on('chat_history', (h)=> setMessages(h))
    socket.on('new_chat_message', (m)=> setMessages(prev=>[...prev,m]))
    return ()=> {
      socket.off('chat_history'); socket.off('new_chat_message')
    }
  },[username])

  useEffect(()=> {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  },[messages])

  const handleJoin = ()=>{
    if (tempName.trim().length<2) return alert('Name must be at least 2 chars')
    localStorage.setItem('username', tempName)
    setUsername(tempName)
  }

  const send = ()=>{
    if (!input.trim()) return
    socket.emit('live_chat_message', { message: input })
    setInput('')
  }

  return (
    <div className="chat card">
      {!username && (
        <div style={{padding:12}}>
          <h3>Enter your display name</h3>
          <input value={tempName} onChange={e=>setTempName(e.target.value)} placeholder="Your name" />
          <div style={{marginTop:8}}>
            <button onClick={handleJoin}>Join Chat</button>
          </div>
        </div>
      )}

      {username && (
        <>
          <div style={{fontSize:13,color:'#9fb0c8',marginBottom:8}}>Connected as <strong style={{color:'#ffcc99'}}>{username}</strong></div>
          <div ref={messagesRef} className="chat-messages" style={{padding:8}}>
            {messages.map((m,i)=><ChatMessage key={m._id||i} msg={m} />)}
          </div>
          <div className="chat-input">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && send()} placeholder="Write a message..." />
            <button onClick={send}>Send</button>
          </div>
        </>
      )}
    </div>
  )
}
