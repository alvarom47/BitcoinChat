import React, {useEffect, useState} from 'react'
import socket from '../lib/socket'

export default function TxTracker(){
  const [txs, setTxs] = useState([])

  useEffect(()=>{
    socket.on('tx', (tx)=> {
      setTxs(prev => [tx, ...prev].slice(0,200))
    })
    return ()=> { socket.off('tx') }
  },[])

  return (
    <div className="card">
      <h3>Live Transactions</h3>
      <div className="tx-list">
        {txs.map((t,i)=>(
          <div key={t.txid||i} style={{padding:8,borderBottom:'1px solid rgba(255,255,255,0.02)'}}>
            <div style={{fontWeight:700}}>{t.txid}</div>
            <div style={{fontSize:13,color:'#9fb0c8'}}>Total: {t.totalBTC || 0} BTC — Fee: {t.feeBTC || 0} BTC</div>
            <div style={{fontSize:13,marginTop:6}}>
              To: {t.to && t.to.length ? t.to.slice(0,3).map(o=>o.address+' ('+o.value+')').join(', ') : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
