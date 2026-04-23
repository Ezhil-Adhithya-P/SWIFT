import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, LineChart, Line, PieChart, Pie } from 'recharts';
import './App.css';

const API_URL = 'http://localhost:3000/api';
const COLORS = ['#3B0764', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [newStudent, setNewStudent] = useState({ rollNo: '', name: '', phone: '', balance: '500' });
  const [newShop, setNewShop] = useState({ name: '', username: '', password: '', bankAccount: '' });
  
  const [settlementStatus, setSettlementStatus] = useState('IDLE'); 

  const fetchAdminData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`);
      const data = await res.json();
      if (data.success) {
        setAdminData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.username === 'admin' && loginCreds.password === 'admin123') {
        setIsAuthenticated(true);
    } else {
        setLoginError('Access Denied: Invalid Credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminData(null);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
        await fetch(`${API_URL}/admin/student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStudent)
        });
        alert("Student registered successfully");
        setNewStudent({ rollNo: '', name: '', phone: '', balance: '500' });
        fetchAdminData();
    } catch(e) {}
  };

  const handleAddShop = async (e) => {
    e.preventDefault();
    try {
        await fetch(`${API_URL}/admin/shop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newShop)
        });
        alert("Shop registered successfully");
        setNewShop({ name: '', username: '', password: '', bankAccount: '' });
        fetchAdminData();
    } catch(e) {}
  };

  const runMidnightSettlement = async () => {
    setSettlementStatus('RUNNING');
    try {
        await fetch(`${API_URL}/admin/settle`, { method: 'POST' });
        setTimeout(() => {
            setSettlementStatus('DONE');
            fetchAdminData();
        }, 2000);
    } catch(e) {
        setSettlementStatus('IDLE');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <form className="auth-box" onSubmit={handleLogin}>
          <h2 style={{color: '#3B0764', marginBottom: '8px'}}>College Admin</h2>
          <p style={{color: '#64748b', fontSize: '13px', marginBottom: '24px'}}>SWIFT Central Control</p>
          <input className="input-field" placeholder="Admin ID" value={loginCreds.username} onChange={e => setLoginCreds({...loginCreds, username: e.target.value})} required />
          <input className="input-field" type="password" placeholder="Master Password" value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} required />
          {loginError && <p style={{color: '#dc2626', fontSize: '12px', marginBottom: '16px'}}>{loginError}</p>}
          <button type="submit" className="btn-primary" style={{width: '100%'}}>Authorize Access</button>
        </form>
      </div>
    );
  }

  if (!adminData) return <div style={{padding: '40px', textAlign: 'center', fontSize: '14px'}}>Synchronizing Data...</div>;

  // Realistic parallel data for graphs
  const hourlyData = [
    { hour: '08:00', cafe: 450, mart: 200 }, { hour: '10:00', cafe: 1200, mart: 850 },
    { hour: '12:00', cafe: 3800, mart: 1500 }, { hour: '14:00', cafe: 2100, mart: 3100 },
    { hour: '16:00', cafe: 950, mart: 2800 }, { hour: '18:00', cafe: 1400, mart: 1100 }
  ];

  const vendorPerformance = adminData.vendorBalances.map(v => ({
    name: v.name,
    volume: v.balance + Math.floor(Math.random() * 5000) // Simulated historical volume
  }));

  const marketShare = adminData.vendorBalances.map(v => ({
    name: v.name,
    value: v.balance + 1 // Ensure no zero values for pie
  }));

  return (
    <div className="app-container">
      <header className="top-nav">
        <div className="nav-title">REC Admin Console</div>
        <div className="logout-btn-container">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="content-wrapper">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className={`nav-item ${activeTab === 'DASHBOARD' ? 'active' : ''}`} onClick={() => setActiveTab('DASHBOARD')}>Central Dashboard</div>
            <div className={`nav-item ${activeTab === 'STUDENTS' ? 'active' : ''}`} onClick={() => setActiveTab('STUDENTS')}>Student Top-Ups</div>
            <div className={`nav-item ${activeTab === 'SHOPS' ? 'active' : ''}`} onClick={() => setActiveTab('SHOPS')}>Shop Management</div>
            <div className={`nav-item ${activeTab === 'SETTLEMENT' ? 'active' : ''}`} onClick={() => setActiveTab('SETTLEMENT')}>Midnight Settlement</div>
          </nav>
        </aside>

        <main className="main-area">
          <section className="page-content">
            
            {activeTab === 'DASHBOARD' && (
              <>
                <div className="page-header"><h1>Detailed Ecosystem Analysis</h1></div>
                <div className="card-grid">
                  <div className="dashboard-card" style={{borderLeft: '4px solid #3B0764'}}><h3>Total Ecosystem Volume</h3><div className="card-value">₹{adminData.totalVolume || 0}</div></div>
                  <div className="dashboard-card" style={{borderLeft: '4px solid #10b981'}}><h3>Active Student Wallets</h3><div className="card-value">{adminData.studentCount}</div></div>
                  <div className="dashboard-card" style={{borderLeft: '4px solid #f59e0b'}}><h3>Pending Liabilities</h3><div className="card-value">₹{adminData.totalPendingPayout}</div></div>
                </div>

                <div className="chart-box" style={{ marginTop: '24px' }}>
                    <h3>Hourly Revenue Growth Comparison (Line Chart)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hour" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36}/>
                        <Line type="monotone" name="REC Cafe" dataKey="cafe" stroke="#3B0764" strokeWidth={4} dot={{r: 6}} activeDot={{r: 8}} />
                        <Line type="monotone" name="REC Mart" dataKey="mart" stroke="#10b981" strokeWidth={4} dot={{r: 6}} activeDot={{r: 8}} />
                      </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="charts-grid">
                  <div className="chart-box">
                    <h3>Total Accumulated Volume (Bar)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={vendorPerformance}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="volume" name="Total Volume (₹)" radius={[8, 8, 0, 0]} barSize={50}>
                           {vendorPerformance.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#3B0764' : '#10b981'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-box">
                    <h3>Market Revenue Share (Pie)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={marketShare} innerRadius={0} outerRadius={80} paddingAngle={0} dataKey="value" label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {marketShare.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'STUDENTS' && (
              <>
                <div className="page-header"><h1>Student Wallet Registry</h1></div>
                
                <div className="form-section">
                    <h3>Provision Student Wallet</h3>
                    <form className="form-grid" onSubmit={handleAddStudent}>
                        <div className="form-group"><label>Roll Number</label><input className="input-field" placeholder="e.g. 21CS101" value={newStudent.rollNo} onChange={e => setNewStudent({...newStudent, rollNo: e.target.value})} required /></div>
                        <div className="form-group"><label>Full Name</label><input className="input-field" placeholder="e.g. Adhithya P" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} required /></div>
                        <div className="form-group"><label>Mobile Phone</label><input className="input-field" placeholder="e.g. 9876543210" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} required /></div>
                        <div className="form-group"><label>Initial Balance (₹)</label><input className="input-field" type="number" value={newStudent.balance} onChange={e => setNewStudent({...newStudent, balance: e.target.value})} required /></div>
                        <div style={{gridColumn: 'span 2'}}><button type="submit" className="btn-primary" style={{width: '100%'}}>Create Wallet</button></div>
                    </form>
                </div>

                <div className="content-box">
                  <div style={{padding: '20px', fontWeight: '800', borderBottom: '1px solid #e2e8f0'}}>Student Directory</div>
                  <table>
                    <thead><tr><th>Roll No</th><th>Student Name</th><th>Wallet Balance</th><th>Verification</th></tr></thead>
                    <tbody>
                      {adminData.students && adminData.students.map(s => (
                        <tr key={s.rollNo}>
                          <td style={{fontWeight: '800', color: '#3B0764'}}>{s.rollNo}</td>
                          <td><strong>{s.name}</strong></td>
                          <td style={{fontWeight: '700', color: '#10b981'}}>₹{s.balance}</td>
                          <td><span className="badge active">VERIFIED</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="content-box" style={{marginTop: '32px'}}>
                  <div style={{padding: '20px', fontWeight: '800', borderBottom: '1px solid #e2e8f0'}}>Recent Top-Up History</div>
                  <table>
                    <thead><tr><th>TXN ID</th><th>Roll Number</th><th>Amount</th><th>Timestamp</th></tr></thead>
                    <tbody>
                      {adminData.topupHistory && adminData.topupHistory.map(t => (
                        <tr key={t.id}>
                          <td style={{color: '#5B21B6', fontWeight: '700'}}>{t.id}</td>
                          <td>{t.rollNo}</td>
                          <td style={{fontWeight: '800', color: '#10b981'}}>+ ₹{t.amount}</td>
                          <td>{new Date(t.date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'SHOPS' && (
              <>
                <div className="page-header"><h1>Vendor Management</h1></div>
                
                <div className="form-section" style={{maxWidth: '1200px', margin: '0 auto 24px'}}>
                    <h3 style={{textAlign: 'center', marginBottom: '24px'}}>Commission New Vendor</h3>
                    <form onSubmit={handleAddShop}>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px'}}>
                            <div className="form-group"><label>Vendor Name</label><input className="input-field" placeholder="e.g. Juice Bar" value={newShop.name} onChange={e => setNewShop({...newShop, name: e.target.value})} required /></div>
                            <div className="form-group"><label>System Username</label><input className="input-field" placeholder="e.g. juiceadmin" value={newShop.username} onChange={e => setNewShop({...newShop, username: e.target.value})} required /></div>
                            <div className="form-group"><label>Access Password</label><input className="input-field" type="password" placeholder="••••••••" value={newShop.password} onChange={e => setNewShop({...newShop, password: e.target.value})} required /></div>
                            <div className="form-group"><label>Settlement Bank Account</label><input className="input-field" placeholder="AC-8877XXXX" value={newShop.bankAccount} onChange={e => setNewShop({...newShop, bankAccount: e.target.value})} required /></div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <button type="submit" className="btn-primary" style={{padding: '12px 60px'}}>Register Vendor</button>
                        </div>
                    </form>
                </div>

                <div className="content-box">
                    <table>
                        <thead><tr><th>Store Name</th><th>Current Ledger</th><th>Bank Details</th></tr></thead>
                        <tbody>
                            {adminData.vendorBalances.map(v => (
                                <tr key={v.id}>
                                    <td><strong>{v.name}</strong></td>
                                    <td style={{fontWeight: '700', color: '#f59e0b'}}>₹{v.balance}</td>
                                    <td style={{color: '#64748b'}}>{v.bankAccount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </>
            )}

            {activeTab === 'SETTLEMENT' && (
              <>
                <div className="page-header"><h1>Midnight Settlement</h1></div>
                
                <div className="content-box" style={{marginBottom: '24px'}}>
                    <div style={{padding: '20px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between'}}>
                        <span>Pending Merchant Ledgers</span>
                        <span style={{color: '#f59e0b'}}>Total Liability: ₹{adminData.totalPendingPayout}</span>
                    </div>
                    <table>
                        <thead><tr><th>Vendor Store</th><th>Status</th><th style={{textAlign: 'right'}}>Settlement Amount</th></tr></thead>
                        <tbody>
                            {adminData.vendorBalances.map(v => (
                                <tr key={v.id}>
                                    <td><strong>{v.name}</strong></td>
                                    <td><span className="badge" style={{background: v.balance > 0 ? '#fff7ed' : '#f0fdf4', color: v.balance > 0 ? '#c2410c' : '#166534'}}>{v.balance > 0 ? 'PENDING' : 'CLEARED'}</span></td>
                                    <td style={{textAlign: 'right', fontWeight: '800', fontSize: '16px'}}>₹{v.balance}</td>
                                </tr>
                            ))}
                            <tr style={{background: '#f8fafc', borderTop: '2px solid #e2e8f0'}}>
                                <td colSpan="2" style={{fontWeight: '800'}}>NET SETTLEMENT VALUE</td>
                                <td style={{textAlign: 'right', fontWeight: '900', fontSize: '20px', color: '#3B0764'}}>₹{adminData.totalPendingPayout}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="content-box" style={{padding: '40px', textAlign: 'center'}}>
                    <div style={{fontSize: '48px', marginBottom: '20px'}}>🏛️</div>
                    <h2 style={{marginBottom: '12px'}}>Execute Final Ledger Reconciliation</h2>
                    <p style={{color: '#64748b', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px'}}>
                        Review the breakdown above. Pressing the button below will transfer <strong>₹{adminData.totalPendingPayout}</strong> to vendor accounts and reset all ecosystem ledgers to zero.
                    </p>
                    
                    {settlementStatus === 'IDLE' && (
                        <button 
                            className="btn-primary" 
                            style={{padding: '16px 40px', fontSize: '15px', background: adminData.totalPendingPayout === 0 ? '#94a3b8' : '#3B0764'}} 
                            onClick={runMidnightSettlement}
                            disabled={adminData.totalPendingPayout === 0}
                        >
                            {adminData.totalPendingPayout === 0 ? 'No Pending Settlements' : 'Confirm & Reconcile Ledgers'}
                        </button>
                    )}
                    
                    {settlementStatus === 'RUNNING' && (
                        <div className="engine-flow">
                            <div className="engine-stage active"><div className="stage-name">Transferring Funds...</div></div>
                            <div className="engine-stage active"><div className="stage-name">Resetting DB Ledgers...</div></div>
                        </div>
                    )}
                    
                    {settlementStatus === 'DONE' && (
                        <div style={{color: '#10b981', fontWeight: '800', fontSize: '18px', animation: 'fadeIn 0.5s'}}>
                            ✓ Daily Settlement Complete. Ledgers Reconciled.
                        </div>
                    )}
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
