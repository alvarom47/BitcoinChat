const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/recent', async (req,res) => {
  const list = await Transaction.find().sort({ createdAt: -1 }).limit(200);
  res.json(list);
});

module.exports = router;
