import { useState } from 'react';
import { api, setToken } from './api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      const { token } = await api('/auth/login', 'POST', { username, password });
      setToken(token);
      onLogin();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="login card">
      <form onSubmit={submit}>
        <h2>Shop Billing: log in</h2>
        <input placeholder="Username" value={username} autoFocus
               onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password}
               onChange={e => setPassword(e.target.value)} />
        {msg && <p style={{ color: 'crimson', margin: 0 }}>{msg}</p>}
        <button type="submit">Log in</button>
      </form>
    </div>
  );
}