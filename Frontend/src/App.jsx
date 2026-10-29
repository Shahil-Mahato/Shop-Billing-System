import { useEffect, useState } from 'react';
import { getToken, setToken } from './api';
import Login from './login';
import Bill from './Bill';
import Products from './Products';
import PastBills from './PastBills';
import Summary from './summary';

const TABS = [
  ['bill', 'New bill'],
  ['products', 'Products'],
  ['invoices', 'Past bills'],
  ['summary', 'Summary'],
];

export default function App() {
  const [tab, setTab] = useState('bill');
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  useEffect(() => {
    const out = () => setLoggedIn(false);
    window.addEventListener('logout', out);
    return () => window.removeEventListener('logout', out);
  }, []);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <>
      <header className="topbar noprint">
        <div className="topbar-inner">
          <div className="brand">Shop Billing</div>
          <nav className="tabs">
            {TABS.map(([key, label]) => (
              <button key={key} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
            <button className="ghost push"
                    onClick={() => { setToken(null); setLoggedIn(false); }}>
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="page">
        <div className="card">
          {tab === 'bill' && <Bill />}
          {tab === 'products' && <Products />}
          {tab === 'invoices' && <PastBills />}
          {tab === 'summary' && <Summary />}
        </div>
      </main>
    </>
  );
}