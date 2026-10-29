const router = require('express').Router();
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');

router.post('/', async (req, res) => {
  const { items, customer, gstin, interState } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Add at least one item.' });
  }

  const lines = [];
  const reduced = []; 

  try {
    let taxable = 0, cgst = 0, sgst = 0, igst = 0;

    for (const it of items) {
      const qty = parseInt(it.qty);
      if (!qty || qty < 1) throw new Error('Invalid quantity.');

      const p = await Product.findOneAndUpdate(
        { _id: it.productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { returnDocument: 'after' } 
      );
      if (!p) {
        const exists = await Product.findById(it.productId);
        throw new Error(exists
          ? `Only ${exists.stock} left of ${exists.name}.`
          : 'Product not found.');
      }
      reduced.push({ id: p._id, qty });

      const lineTaxable = p.price * qty;
      const tax = Math.round(lineTaxable * p.gstRate / 100);
      if (interState) {
        igst += tax;
      } else {
        const half = Math.floor(tax / 2);
        cgst += half;
        sgst += tax - half;
      }
      taxable += lineTaxable;
      lines.push({ productId: p._id, name: p.name, qty, price: p.price,
                   gstRate: p.gstRate, taxable: lineTaxable, tax });
    }

    const count = await Invoice.countDocuments();
    const d = new Date();
    const number = `INV-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;

    const invoice = await Invoice.create({
      number, customer: customer || undefined, gstin, interState: !!interState,
      items: lines, taxable, cgst, sgst, igst,
      total: taxable + cgst + sgst + igst,
    });
    res.status(201).json(invoice);

  } catch (e) {
    for (const r of reduced) {
      await Product.findByIdAndUpdate(r.id, { $inc: { stock: r.qty } });
    }
    res.status(400).json({ error: e.message });
  }
});

router.get('/summary', async (req, res) => {
  const { date } = req.query;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Provide a valid date in YYYY-MM-DD format.' });
  }

  const [year, month, day] = date.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day) {
    return res.status(400).json({ error: 'Provide a valid date in YYYY-MM-DD format.' });
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const invoices = await Invoice.find(
    { createdAt: { $gte: start, $lt: end } },
    'items taxable cgst sgst igst total'
  );
  const summary = {
    bills: invoices.length,
    taxable: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total: 0,
    items: [],
  };
  const itemsByName = new Map();

  for (const invoice of invoices) {
    summary.taxable += invoice.taxable || 0;
    summary.cgst += invoice.cgst || 0;
    summary.sgst += invoice.sgst || 0;
    summary.igst += invoice.igst || 0;
    summary.total += invoice.total || 0;

    for (const item of invoice.items) {
      const current = itemsByName.get(item.name) || { name: item.name, qty: 0, amount: 0 };
      current.qty += item.qty || 0;
      current.amount += item.taxable || 0;
      itemsByName.set(item.name, current);
    }
  }
  summary.items = [...itemsByName.values()].sort((a, b) => a.name.localeCompare(b.name));

  res.json(summary);
});

router.get('/', async (req, res) => {
  const { q, date } = req.query;
  const filter = {};

  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(safe, 'i');
    filter.$or = [{ customer: rx }, { number: rx }];
  }

  if (date) {
    const start = new Date(`${date}T00:00:00`);
    if (!isNaN(start)) {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
  }

  res.json(await Invoice.find(filter).sort('-createdAt').limit(100));
});

router.get('/:id', async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Not found' });
  res.json(inv);
});




module.exports = router;