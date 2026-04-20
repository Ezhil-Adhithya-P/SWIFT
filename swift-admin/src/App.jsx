import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, WALLET_HUB, SETTLEMENT
  
  const [dashboardData, setDashboardData] = useState({
    collegeFiatBalance: 0,
    totalPendingPayout: 0,
    vendorBalances: [],
    topupHistory: []
  });

  const [isSettlementRunning, setIsSettlementRunning] = useState(false);
  const [settlementStep, setSettlementStep] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 3000); // Polling for real-time
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') setIsAuthenticated(true);
    else alert("Invalid credentials.");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const runBatchSettlement = async () => {
    setIsSettlementRunning(true);
    setSettlementStep(1);

    setTimeout(() => {
      setSettlementStep(2);
      setTimeout(() => {
        setSettlementStep(3);
        setTimeout(async () => {
            // Trigger actual settlement
            try {
                await fetch(`${API_URL}/admin/settle`, { method: 'POST' });
                await fetchDashboardData();
                setSettlementStep(4);
            } catch(e) { console.error(e); }

            setIsSettlementRunning(false);
        }, 2000);
      }, 2000);
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <form className="auth-box" onSubmit={handleLogin}>
          <h2>REC System Administrator</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Log in to access central banking and wallet oversight.</p>
          <input className="input-field" type="text" placeholder="Admin Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="btn-primary btn-large">Authorize Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header"><h2>REC ADMIN</h2><p>CENTRAL OVERSIGHT</p></div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'DASHBOARD' ? 'active' : ''}`} onClick={() => setActiveTab('DASHBOARD')}>Central Dashboard</div>
          <div className={`nav-item ${activeTab === 'WALLET_HUB' ? 'active' : ''}`} onClick={() => setActiveTab('WALLET_HUB')}>Top-Ups & Reg.</div>
          <div className={`nav-item ${activeTab === 'SETTLEMENT' ? 'active' : ''}`} onClick={() => setActiveTab('SETTLEMENT')}>Midnight Settlement</div>
        </nav>
      </aside>

      <main className="main-area">
        <header className="top-nav">
          <div className="nav-title">College Core Banking Oversight</div>
          <div className="nav-user"><span>Welcome, Admin</span><button className="logout-btn" onClick={handleLogout}>Logout</button></div>
        </header>

        <section className="page-content">
          
          {activeTab === 'DASHBOARD' && (
            <>
              <div className="page-header"><div className="page-title"><h1>Centralized Hub Overiew</h1><p>Real-time tracking of capital held in college bank.</p></div></div>
              <div className="card-grid">
                <div className="dashboard-card border-green">
                  <h3>Total College Fiat Holdings</h3>
                  <div className="card-value">₹{dashboardData.collegeFiatBalance}</div>
                </div>
                <div className="dashboard-card border-orange">
                  <h3>Pending Vendor Liabilities</h3>
                  <div className="card-value">₹{dashboardData.totalPendingPayout}</div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'WALLET_HUB' && (
            <>
              <div className="page-header"><div className="page-title"><h1>Student Wallet Registry</h1></div></div>
              <div className="content-box">
                <table>
                  <thead><tr><th>Transaction Ref</th><th>Date / Time</th><th>Student Roll No</th><th>Bank Deposit</th></tr></thead>
                  <tbody>
                    {dashboardData.topupHistory.length === 0 && <tr><td colSpan="4">No deposits yet.</td></tr>}
                    {dashboardData.topupHistory.map(tup => (
                      <tr key={tup.id}>
                        <td style={{ color: '#5B21B6', fontWeight: '600' }}>{tup.id}</td>
                        <td>{tup.date}</td>
                        <td><strong>{tup.rollNo}</strong></td>
                        <td style={{ fontWeight: 'bold' }}>+ ₹{tup.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'SETTLEMENT' && (
            <>
              <div className="page-header">
                <div className="page-title"><h1>Automated Batch Processing Protocol</h1></div>
                {settlementStep === 0 && dashboardData.totalPendingPayout > 0 && (
                  <button className="btn-primary" onClick={runBatchSettlement} disabled={isSettlementRunning}>Force Trigger Midnight Routine Now</button>
                )}
              </div>
              <div className="content-box">
                 <table>
                  <thead><tr><th>Vendor Hub</th><th>Accumulated Token Transfer</th></tr></thead>
                  <tbody>
                    {dashboardData.vendorBalances.map(v => (
                      <tr key={v.id}>
                        <td><strong>{v.name}</strong> </td>
                        <td style={{ fontSize: '18px', fontWeight: 'bold', color: v.accumulatedBalance > 0 ? '#f59e0b' : '#10b981' }}>₹{v.accumulatedBalance}</td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
              </div>
              {settlementStep > 0 && (
                  <div className="content-box">
                      <h3 style={{ marginBottom: '8px' }}>Processing Engine</h3>
                      <div className="tracker-container">
                          <p>Step {Math.min(settlementStep,3)}/3 Processing...</p>
                      </div>
                      {settlementStep === 4 && <div className="success-alert">✓ Settlement Process completed! Ledgers reconciled to ₹0.</div>}
                  </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
