import React from 'react'
export default function ChatMessage({ msg }){
  if (!msg) return null
  const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''
  return (
    <div style={{padding:8,marginBottom:6,background:'rgba(255,255,255,0.01)',borderRadius:8}}>
      <div style={{fontWeight:700,color:'#ffcc99'}}>{msg.username} <span style={{fontSize:11,color:'#9fb0c8',marginLeft:8}}>{time}</span></div>
      <div style={{color:'#e6eef8'}}>{msg.message}</div>
    </div>
  )
}
