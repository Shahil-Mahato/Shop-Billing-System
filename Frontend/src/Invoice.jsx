import { inr } from './api';
import { SHOP } from './shop';

export default function Invoice({ invoice: i, onClose }) {
  return (
    <div style={{ maxWidth: 640, margin: '24px auto', border: '1px solid #ccc', padding: 20 }}>
      <style>{`@media print { .noprint { display: none !important } }`}</style>

      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{SHOP.name}</h2>
        <div>{SHOP.address}</div>
        <div>Phone: {SHOP.phone}</div>
        <div>GSTIN: {SHOP.gstin}</div>
      </div>

      <h3 style={{ margin: 0 }}>Tax invoice {i.number}</h3>
      <p>
        {new Date(i.createdAt).toLocaleString('en-IN')}<br />
        Customer: {i.customer}
        {i.gstin && <><br />Customer GSTIN: {i.gstin}</>}
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>Item</th><th>Qty</th><th>Rate</th><th>GST</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {i.items.map((x, n) => (
            <tr key={n} style={{ borderTop: '1px solid #ddd' }}>
              <td>{x.name}</td><td>{x.qty}</td><td>{inr(x.price)}</td><td>{x.gstRate}%</td>
              <td style={{ textAlign: 'right' }}>{inr(x.taxable)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <div>Subtotal: {inr(i.taxable)}</div>
        {i.interState
          ? <div>IGST: {inr(i.igst)}</div>
          : <><div>CGST: {inr(i.cgst)}</div><div>SGST: {inr(i.sgst)}</div></>}
        <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 6 }}>Total: {inr(i.total)}</div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20 }}>Thank you. Visit again!</p>

      <div className="noprint" style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => window.print()}>Print bill</button>
        {onClose && <button onClick={onClose}>Close</button>}
      </div>
    </div>
  );
}