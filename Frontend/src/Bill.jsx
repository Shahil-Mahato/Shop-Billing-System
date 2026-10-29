import { useEffect, useState } from "react";
import { api, inr } from "./api";
import Invoice from "./Invoice";

export default function Bill() {
  const [products, setProducts] = useState([]);
  const [pick, setPick] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("");
  const [gstin, setGstin] = useState("");
  const [interState, setInterState] = useState(false);
  const [msg, setMsg] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [find, setFind] = useState("");

  const load = () =>
    api("/products")
      .then((list) => {
        setProducts(list);
        setPick((p) => p || list[0]?._id || "");
      })
      .catch((e) => setMsg(e.message));

  useEffect(() => {
    load();
  }, []);

  function addItem() {
    const p = products.find((x) => x._id === pick);
    const n = parseInt(qty) || 1;
    if (!p) return;
    const existing = cart.find((l) => l.productId === p._id);
    const want = (existing ? existing.qty : 0) + n;
    if (want > p.stock) return setMsg(`Only ${p.stock} left of ${p.name}.`);
    setMsg("");
    if (existing) {
      setCart(
        cart.map((l) => (l.productId === p._id ? { ...l, qty: want } : l)),
      );
    } else {
      setCart([
        ...cart,
        {
          productId: p._id,
          name: p.name,
          price: p.price,
          gstRate: p.gstRate,
          stock: p.stock,
          qty: n,
        },
      ]);
    }
    setQty(1);
  }

  function changeQty(id, value) {
    setCart(
      cart.map((l) =>
        l.productId === id
          ? { ...l, qty: Math.min(Math.max(1, parseInt(value) || 1), l.stock) }
          : l,
      ),
    );
  }

  const remove = (id) => setCart(cart.filter((l) => l.productId !== id));

  let taxable = 0,
    cgst = 0,
    sgst = 0,
    igst = 0;

  cart.forEach((l) => {
    const t = l.price * l.qty;
    const tax = Math.round((t * l.gstRate) / 100);
    taxable += t;
    if (interState) igst += tax;
    else {
      const h = Math.floor(tax / 2);
      cgst += h;
      sgst += tax - h;
    }
  });

  const total = taxable + cgst + sgst + igst;

  async function save() {
    try {
      const inv = await api("/invoices", "POST", {
        customer,
        gstin,
        interState,
        items: cart.map((l) => ({ productId: l.productId, qty: l.qty })),
      });
      setInvoice(inv);
      setCart([]);
      setCustomer("");
      setGstin("");
      setMsg("");
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  if (invoice)
    return <Invoice invoice={invoice} onClose={() => setInvoice(null)} />;

  const matches = (p) =>
    (p.name + " " + (p.sku || "")).toLowerCase().includes(find.toLowerCase());

  const shown = products.filter(matches);

  function onSearch(e) {
    const v = e.target.value;
    setFind(v);
    const first = products.find((p) =>
      (p.name + " " + (p.sku || "")).toLowerCase().includes(v.toLowerCase()),
    );
    setPick(first ? first._id : "");
  }

  return (
    <div>
      <h2>Items</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Search product"
          value={find}
          onChange={onSearch}
          style={{ width: 160 }}
        />
        <select
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          style={{ flex: 1 }}
        >
          {shown.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} — {inr(p.price)} ({p.stock} in stock)
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: 70 }}
        />
        <button onClick={addItem}>Add</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Item</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>GST</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((l) => (
            <tr key={l.productId} style={{ borderTop: "1px solid #ccc" }}>
              <td>{l.name}</td>
              <td>{inr(l.price)}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={l.stock}
                  value={l.qty}
                  onChange={(e) => changeQty(l.productId, e.target.value)}
                  style={{ width: 60 }}
                />
              </td>
              <td>{l.gstRate}%</td>
              <td>{inr(l.price * l.qty)}</td>
              <td>
                <td><button className="danger" onClick={() => remove(l.productId)}>Remove</button></td>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {cart.length === 0 && <p>No items yet. Pick a product and press Add.</p>}

      <h2>Customer</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Name (optional)"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />
        <input
          placeholder="GSTIN (optional)"
          maxLength={15}
          value={gstin}
          onChange={(e) => setGstin(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={interState}
            onChange={(e) => setInterState(e.target.checked)}
          />{" "}
          Customer is in another state (IGST)
        </label>
      </div>

      <div className="totals">
        <div>Subtotal: {inr(taxable)}</div>
        {interState ? (
          <div>IGST: {inr(igst)}</div>
        ) : (
          <>
            <div>CGST: {inr(cgst)}</div>
            <div>SGST: {inr(sgst)}</div>
          </>
        )}
        <div style={{ fontSize: 22, fontWeight: "bold", margin: "6px 0" }}>
          Total: {inr(total)}
        </div>
        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
        <button onClick={save} disabled={cart.length === 0}>
          Save bill
        </button>
      </div>
    </div>
  );
}