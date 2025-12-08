import React from 'react'
import Header from './components/Header'
import TxTracker from './components/TxTracker'
import LiveChat from './components/LiveChat'
import TradingViewWidget from './components/TradingViewWidget'

export default function App(){
  return (
    <div className="app">
      <Header />
      <div className="container">
        <main className="left">
          <TradingViewWidget />
          <TxTracker />
        </main>
        <aside className="right">
          <LiveChat />
        </aside>
      </div>
    </div>
  )
}
