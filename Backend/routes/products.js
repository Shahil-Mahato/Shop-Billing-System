const router = require('express').Router();
const Product = require('../models/Product');

const clean = b => ({
  name: b.name,
  sku: b.sku || undefined,
  price: Math.round(Number(b.price) * 100),
  gstRate: Number(b.gstRate ?? 18),
  stock: Number(b.stock ?? 0),
});

router.get('/', async (req, res) => {
  res.json(await Product.find().sort('name'));
});

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await Product.create(clean(req.body)));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, clean(req.body),
      { returnDocument: 'after', runValidators: true }); 
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;