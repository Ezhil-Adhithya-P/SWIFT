import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import './App.css';

const API_URL = 'http://192.168.0.109:3000/api';
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vendorId, setVendorId] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorData, setVendorData] = useState(null);

  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', internalId: '', stock: '', price: '' });
  
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const fetchVendorData = async () => {
    if (!vendorId) return;
    try {
      const res = await fetch(`${API_URL}/vendor/${vendorId}`);
      const data = await res.json();
      if (data.success) {
        setVendorData(data.vendor);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated && vendorId) {
      fetchVendorData();
      const interval = setInterval(fetchVendorData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, vendorId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
        const res = await fetch(`${API_URL}/vendor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginCreds)
        });
        const data = await res.json();
        if (data.success) {
            setVendorId(data.vendorId);
            setVendorName(data.vendorName);
            setIsAuthenticated(true);
        } else {
            setLoginError(data.message || 'Login failed.');
        }
    } catch (e) {
        setLoginError('Server connection failed.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setVendorId(null);
    setVendorData(null);
    setLoginCreds({ username: '', password: '' });
  };

  const toggleProductStatus = async (id) => {
    try {
      await fetch(`${API_URL}/vendor/${vendorId}/product/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id })
      });
      fetchVendorData();
    } catch(e) {}
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return alert("Please fill all fields");
    try {
      await fetch(`${API_URL}/vendor/${vendorId}/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: newProduct.name,
            internalId: newProduct.internalId || 'ITEM-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
            stock: parseInt(newProduct.stock),
            price: parseFloat(newProduct.price)
        })
      });
      setNewProduct({ name: '', internalId: '', stock: '', price: '' });
      setIsAddingProduct(false);
      fetchVendorData();
    } catch(e) {}
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <form className="auth-box" onSubmit={handleLogin}>
          <h2 style={{color: '#3B0764'}}>Vendor Login</h2>
          <p style={{marginBottom: '24px', color: '#64748b', fontSize: '13px'}}>REC Smart Kiosk Ecosystem</p>
          
          <input className="input-field" placeholder="Username" value={loginCreds.username} onChange={e => setLoginCreds({...loginCreds, username: e.target.value})} required />
          <input className="input-field" type="password" placeholder="Password" value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} required />
          
          {loginError && <p style={{color: '#dc2626', fontSize: '12px', marginBottom: '16px'}}>{loginError}</p>}
          <button type="submit" className="btn-primary" style={{width: '100%'}}>Enter Dashboard</button>
        </form>
      </div>
    );
  }

  if (!vendorData) return <div style={{padding: '40px', textAlign: 'center', fontSize: '14px'}}>Synchronizing Data...</div>;

  const activeProductsCount = vendorData.products.filter(p => p.isActive).length;
  const totalStockCount = vendorData.products.reduce((sum, p) => sum + parseInt(p.stock || 0), 0);
  
  const revenueTrend = [
    { hour: '08:00', amount: 450 }, { hour: '10:00', amount: 1200 }, { hour: '12:00', amount: 3800 },
    { hour: '14:00', amount: 2100 }, { hour: '16:00', amount: 950 }, { hour: '18:00', amount: 1400 },
    { hour: '20:00', amount: 600 }
  ];

  const topSelling = vendorData.products.slice(0, 5).map(p => ({
    name: p.name,
    sales: Math.floor(Math.random() * 50) + 20
  }));

  const stockDistribution = vendorData.products.slice(0, 5).map(p => ({
    name: p.name,
    value: parseInt(p.stock)
  }));

  return (
    <div className="app-container">
      <header className="top-nav">
        <div className="nav-title">{vendorName} Vendor Console</div>
        <div className="logout-btn-container">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="content-wrapper">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className={`nav-item ${activeTab === 'DASHBOARD' ? 'active' : ''}`} onClick={() => setActiveTab('DASHBOARD')}>Insights Dashboard</div>
            <div className={`nav-item ${activeTab === 'PRODUCTS' ? 'active' : ''}`} onClick={() => setActiveTab('PRODUCTS')}>Inventory Control</div>
            <div className={`nav-item ${activeTab === 'TRANSACTIONS' ? 'active' : ''}`} onClick={() => setActiveTab('TRANSACTIONS')}>Live Sales</div>
          </nav>
        </aside>

        <main className="main-area">
          <section className="page-content">
            
            {activeTab === 'DASHBOARD' && (
              <>
                <div className="page-header"><div className="page-title"><h1>Real-time Store Performance</h1></div></div>
                <div className="card-grid">
                  <div className="dashboard-card border-purple"><h3>Active Catalog</h3><div className="card-value">{activeProductsCount} Items</div></div>
                  <div className="dashboard-card border-orange"><h3>Warehouse Stock</h3><div className="card-value">{totalStockCount} Units</div></div>
                  <div className="dashboard-card border-green"><h3>Total Revenue</h3><div className="card-value">₹{vendorData.accumulatedBalance}</div></div>
                </div>

                <div className="charts-grid">
                  <div className="chart-box">
                    <h3>Today's Revenue Flow (Hourly)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueTrend}>
                        <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hour" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px'}} />
                        <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-box" style={{textAlign: 'center'}}>
                    <h3>Inventory Asset Value</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie 
                          data={stockDistribution} 
                          innerRadius={0} 
                          outerRadius={90} 
                          paddingAngle={0} 
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={true}
                        >
                          {stockDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="charts-grid" style={{marginTop: '24px'}}>
                   <div className="chart-box">
                    <h3>Peak Hour Demand Analysis</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hour" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-box">
                    <h3>Top Selling Items (Volume)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topSelling} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" fontSize={11} stroke="#94a3b8" hide />
                        <YAxis dataKey="name" type="category" fontSize={10} stroke="#475569" width={100} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px'}} />
                        <Bar dataKey="sales" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'PRODUCTS' && (
              <>
                <div className="page-header">
                  <div className="page-title"><h1>Inventory Management</h1></div>
                  <button className="btn-primary" onClick={() => setIsAddingProduct(!isAddingProduct)}>{isAddingProduct ? 'Cancel' : '+ Add New Item'}</button>
                </div>

                {isAddingProduct && (
                  <div className="content-box" style={{padding: '24px', marginBottom: '24px', border: '2px solid #e2e8f0', animation: 'fadeIn 0.2s ease'}}>
                    <h4 style={{marginBottom: '16px', fontSize: '14px'}}>Add Product to Catalog</h4>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px'}}>
                        <div><input className="input-field" style={{marginBottom: 0}} placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                        <div><input className="input-field" style={{marginBottom: 0}} placeholder="ProductID (SKU)" value={newProduct.internalId} onChange={e => setNewProduct({...newProduct, internalId: e.target.value})} /></div>
                        <div><input className="input-field" style={{marginBottom: 0}} type="number" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
                        <div><input className="input-field" style={{marginBottom: 0}} type="number" placeholder="Initial Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} /></div>
                    </div>
                    <button className="btn-primary" onClick={handleAddProduct}>Add to Kiosk</button>
                  </div>
                )}

                <div className="content-box">
                  <table>
                    <thead><tr><th>Product Info</th><th>Unit Price</th><th>Stock Status</th><th>Visibility</th><th style={{textAlign: 'right'}}>Action</th></tr></thead>
                    <tbody>
                      {vendorData.products.map(product => (
                        <tr key={product.id}>
                          <td><div style={{fontWeight: '700'}}>{product.name}</div><div style={{fontSize: '11px', color: '#94a3b8', marginTop: '2px'}}>{product.internalId}</div></td>
                          <td style={{fontWeight: '700', color: '#10b981'}}>₹{product.price}</td>
                          <td>
                            <div style={{fontWeight: '600'}}>{product.stock} units</div>
                            <div style={{width: '60px', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '4px'}}><div style={{width: `${Math.min(100, (product.stock/100)*100)}%`, height: '100%', background: product.stock < 10 ? '#ef4444' : '#10b981', borderRadius: '2px'}}></div></div>
                          </td>
                          <td><span className={`badge ${product.isActive ? 'active' : 'inactive'}`}>{product.isActive ? 'ACTIVE' : 'HIDDEN'}</span></td>
                          <td style={{textAlign: 'right'}}><button className="btn-primary" style={{padding: '6px 12px', fontSize: '11px'}} onClick={() => toggleProductStatus(product.id)}>Toggle</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div style={{padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '24px', fontSize: '12px', color: '#64748b'}}>
                        <span>Total SKUs: <strong>{vendorData.products.length}</strong></span>
                        <span>Active in Kiosk: <strong>{activeProductsCount}</strong></span>
                        <span>Total Inventory Units: <strong>{totalStockCount}</strong></span>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'TRANSACTIONS' && (
              <>
                <div className="page-header"><div className="page-title"><h1>Live Sales</h1></div></div>
                <div className="content-box">
                  <table>
                    <thead><tr><th>TXN ID</th><th>Timestamp</th><th>Student ID</th><th>Details</th><th style={{textAlign: 'right'}}>Revenue</th></tr></thead>
                    <tbody>
                      {vendorData.transactions.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No transactions recorded.</td></tr>}
                      {vendorData.transactions.map(txn => (
                        <tr key={txn.id}>
                          <td style={{ color: '#5B21B6', fontWeight: '800' }}>{txn.id}</td>
                          <td>{new Date(txn.date).toLocaleTimeString()}</td>
                          <td><strong>{txn.rollNo}</strong></td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>{txn.items}</td>
                          <td style={{ fontWeight: '800', color: '#10b981', fontSize: '15px', textAlign: 'right' }}>₹{txn.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
