import { useEffect, useState } from 'react';
import { api, inr } from './api';
import Invoice from './Invoice';

export default function PastBills() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (date) params.set('date', date);
    api('/invoices?' + params.toString())
      .then(d => { setList(d); setMsg(''); })
      .catch(e => setMsg(e.message));
  }, [q, date]);

  if (open) return <Invoice invoice={open} onClose={() => setOpen(null)} />;

  return (
    <div>
      <h2>Past bills</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Search customer or bill no." value={q}
               onChange={e => setQ(e.target.value)} style={{ minWidth: 220 }} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        {(q || date) && (
          <button onClick={() => { setQ(''); setDate(''); }}>Clear</button>
        )}
      </div>
      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>Bill no.</th><th>Date</th><th>Customer</th>
            <th style={{ textAlign: 'right' }}>Total</th><th></th>
          </tr>
        </thead>
        <tbody>
          {list.map(i => (
            <tr key={i._id} style={{ borderTop: '1px solid #ccc' }}>
              <td>{i.number}</td>
              <td>{new Date(i.createdAt).toLocaleString('en-IN')}</td>
              <td>{i.customer}</td>
              <td style={{ textAlign: 'right' }}>{inr(i.total)}</td>
              <td style={{ textAlign: 'right' }}>
                <button onClick={() => setOpen(i)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && !msg && <p>No bills found.</p>}
    </div>
  );
}