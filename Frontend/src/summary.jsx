import { useEffect, useState } from 'react';
import { api, inr } from './api';

const pad = n => String(n).padStart(2, '0');
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function Summary() {
  const [date, setDate] = useState(todayStr());
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/invoices/summary?date=' + date)
      .then(d => { setData(d); setMsg(''); })
      .catch(e => setMsg(e.message));
  }, [date]);

  return (
    <div>
      <h2>Sales summary</h2>
      <label>
        Date:{' '}
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </label>
      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

      {data && (
        <>
          <table style={{ marginTop: 16, borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '4px 24px 4px 0' }}>Bills</td><td>{data.bills}</td></tr>
              <tr><td>Sales (excl. GST)</td><td>{inr(data.taxable)}</td></tr>
              <tr><td>CGST collected</td><td>{inr(data.cgst)}</td></tr>
              <tr><td>SGST collected</td><td>{inr(data.sgst)}</td></tr>
              <tr><td>IGST collected</td><td>{inr(data.igst)}</td></tr>
              <tr style={{ fontWeight: 'bold', fontSize: 18 }}>
                <td>Total</td><td>{inr(data.total)}</td>
              </tr>
            </tbody>
          </table>

          <h3>Items sold</h3>
          {data.items.length === 0 ? <p>No sales on this date.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Item</th><th>Qty sold</th><th style={{ textAlign: 'right' }}>Sales (excl. GST)</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(i => (
                  <tr key={i.name} style={{ borderTop: '1px solid #ccc' }}>
                    <td>{i.name}</td>
                    <td>{i.qty}</td>
                    <td style={{ textAlign: 'right' }}>{inr(i.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}