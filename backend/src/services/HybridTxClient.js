const axios = require('axios');

let seen = new Set();
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || '5000', 10);

module.exports.start = function start(onTx) {
  console.log('[HYBRID] Hybrid client starting (Blockstream + Blockchair + mempool.space fallback)');

  async function poll() {
    try {
      // 1) try Blockstream mempool recent endpoint for fast tx list
      const { data: recent } = await axios.get('https://blockstream.info/api/mempool/recent', { timeout: 8000 });
      for (const t of recent.slice(0, 30)) {
        const txid = t.txid;
        if (seen.has(txid)) continue;
        seen.add(txid);

        const full = await fetchTxDetails(txid);
        if (!full) continue;

        try { onTx(full); } catch(e){ /* ignore */ }
      }
    } catch(err) {
      console.log('[HYBRID] blockstream recent failed:', err.message);
    } finally {
      // schedule next poll
      if (seen.size > 10000) seen = new Set([...seen].slice(-4000));
      setTimeout(poll, POLL_INTERVAL);
    }
  }

  poll();
};

async function fetchTxDetails(txid) {
  // Try Blockstream transaction endpoint first (fast)
  try {
    const { data: tx } = await axios.get(`https://blockstream.info/api/tx/${txid}`, { timeout: 8000 });
    const inputs = (tx.vin || []).map(v => v.prevout?.scriptpubkey_address).filter(Boolean);
    const outputs = (tx.vout || []).map(v => ({ address: v.scriptpubkey_address || null, value: (v.value||0)/1e8, scriptType: v.scriptpubkey_type })).filter(o => o.address);
    const totalBTC = outputs.reduce((s,o)=>s+(o.value||0),0);
    const feeBTC = (tx.fee||0)/1e8;
    const vsize = tx.vsize || tx.size || 0;
    const feePerVbyte = vsize ? tx.fee / vsize : null;
    let type = 'unknown';
    if (inputs.some(a => a?.startsWith && a.startsWith('bc1p'))) type = 'taproot';
    else if (inputs.some(a => a?.startsWith && a.startsWith('bc1'))) type = 'segwit';
    else type = 'legacy';
    let changeAddress = null;
    if (outputs.length >= 2) changeAddress = outputs.reduce((a,b)=>a.value<b.value?a:b).address;
    return { txid, timestamp: tx.status?.block_time || Date.now(), from: inputs, to: outputs, totalBTC, feeBTC, feePerVbyte, vsize, size: tx.size, weight: tx.weight, type, changeAddress };
  } catch(err) {
    console.log('[HYBRID] blockstream tx fetch failed for', txid, err.message);
  }

  // Try Blockchair for richer information
  try {
    const url = `https://api.blockchair.com/bitcoin/dashboards/transaction/${txid}`;
    const res = await axios.get(url, { timeout: 9000 });
    const d = res.data.data[txid];
    if (d && d.transaction) {
      const inputs = (d.inputs || []).map(i => i.recipient).filter(Boolean);
      const outputs = (d.outputs || []).map(o => ({ address: o.recipient, value: o.value/1e8, scriptType: null })).filter(o=>o.address);
      const totalBTC = outputs.reduce((s,o)=>s+(o.value||0),0);
      const feeBTC = d.transaction.fee/1e8;
      return { txid, timestamp: d.transaction.time?new Date(d.transaction.time).getTime():Date.now(), from: inputs, to: outputs, totalBTC, feeBTC, feePerVbyte: null, vsize: null, size: null, weight: null, type: 'unknown', changeAddress: outputs.length>=2?outputs.reduce((a,b)=>a.value<b.value?a:b).address:null };
    }
  } catch(err) {
    console.log('[HYBRID] blockchair failed for', txid, err.message);
  }

  // Fallback to mempool.space
  try {
    const { data: mp } = await axios.get(`https://mempool.space/api/tx/${txid}`, { timeout: 8000 });
    const inputs = (mp.vin || []).map(v => v.prevout?.scriptpubkey_address).filter(Boolean);
    const outputs = (mp.vout || []).map(v => ({ address: v.scriptpubkey_address || null, value: (v.value||0)/1e8, scriptType: v.scriptpubkey_type })).filter(o => o.address);
    const totalBTC = outputs.reduce((s,o)=>s+(o.value||0),0);
    const feeBTC = (mp.fee||0)/1e8;
    const vsize = mp.vsize || mp.size || 0;
    const feePerVbyte = vsize ? mp.fee / vsize : null;
    return { txid, timestamp: mp.status?.block_time || Date.now(), from: inputs, to: outputs, totalBTC, feeBTC, feePerVbyte, vsize, size: mp.size, weight: mp.weight, type: 'unknown', changeAddress: outputs.length>=2?outputs.reduce((a,b)=>a.value<b.value?a:b).address:null };
  } catch(err) {
    console.log('[HYBRID] mempool.space fallback failed for', txid, err.message);
  }

  return null;
}
