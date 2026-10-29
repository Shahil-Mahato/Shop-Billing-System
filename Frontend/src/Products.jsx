import { useEffect, useState } from "react";
import { api, inr } from "./api";

const empty = { name: "", sku: "", price: "", gstRate: 18, stock: 0 };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const load = () =>
    api("/products")
      .then(setProducts)
      .catch((e) => setMsg(e.message));

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function save(e) {
    e.preventDefault();

    try {
      if (!form.name.trim() || form.price === "") {
        throw new Error("Enter a name and a price.");
      }

      if (Number(form.price) < 0 || !Number.isFinite(Number(form.price))) {
        throw new Error("Enter a valid price.");
      }

      if (Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) {
        throw new Error("Enter a valid stock quantity.");
      }

      const data = {
        ...form,
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        gstRate: Number(form.gstRate),
        stock: Number(form.stock),
      };

      if (editId) {
        await api("/products/" + editId, "PUT", data);
      } else {
        await api("/products", "POST", data);
      }

      setForm(empty);
      setEditId(null);
      setMsg("");
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  function edit(p) {
    setEditId(p._id);
    setForm({
      name: p.name,
      sku: p.sku || "",
      price: p.price / 100,
      gstRate: p.gstRate,
      stock: p.stock,
    });

    window.scrollTo(0, 0);
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;

    try {
      await api("/products/" + id, "DELETE");

      if (editId === id) {
        setEditId(null);
        setForm(empty);
      }

      setMsg("");
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  const shown = products.filter((p) =>
    (p.name + " " + (p.sku || "")).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <h2>{editId ? "Edit product" : "Add product"}</h2>

      <form
        onSubmit={save}
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={set("name")}
          required
        />

        <input placeholder="SKU" value={form.sku} onChange={set("sku")} />

        <input
          placeholder="Price (₹, excl. GST)"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={set("price")}
          required
        />

        <select value={form.gstRate} onChange={set("gstRate")}>
          {[0, 5, 12, 18, 28].map((r) => (
            <option key={r} value={r}>
              {r}% GST
            </option>
          ))}
        </select>

        <input
          placeholder="Stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={set("stock")}
          required
        />

        <button type="submit">{editId ? "Update" : "Add"}</button>

        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm(empty);
              setMsg("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {msg && <p style={{ color: "crimson" }}>{msg}</p>}

      <input
        placeholder="Search products by name or SKU"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 320,
          margin: "12px 0",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>GST</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {shown.map((p) => (
            <tr key={p._id} style={{ borderTop: "1px solid #ccc" }}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{inr(p.price)}</td>
              <td>{p.gstRate}%</td>
              <td>{p.stock}</td>
              <td>
                <button type="button" onClick={() => edit(p)}>
                  Edit
                </button>{" "}
                <button className="danger" onClick={() => remove(p._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {shown.length === 0 && (
        <p>
          {products.length === 0
            ? "No products yet. Add your first one above."
            : "No products match your search."}
        </p>
      )}
    </div>
  );
}
