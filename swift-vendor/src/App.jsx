import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vendorData, setVendorData] = useState(null);

  const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, PRODUCTS, TRANSACTIONS
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', internalId: '', stock: '', price: '' });

  const fetchVendorData = async () => {
    try {
      const res = await fetch(`${API_URL}/vendor/1`); // Hardcoded to Canteen
      const data = await res.json();
      if (data.success) {
        setVendorData(data.vendor);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchVendorData();
      const interval = setInterval(fetchVendorData, 3000); // Polling for real-time
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const toggleProductStatus = async (id) => {
    try {
      await fetch(`${API_URL}/vendor/1/product/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id })
      });
      fetchVendorData();
    } catch(e) {}
  };

  const handleAddProduct = async () => {
    try {
      await fetch(`${API_URL}/vendor/1/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: newProduct.name,
            internalId: newProduct.internalId,
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
          <h2>Vendor Admin Console</h2>
          <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>Secure Login</button>
        </form>
      </div>
    );
  }

  if (!vendorData) return <div>Loading...</div>;

  const activeProductsCount = vendorData.products.filter(p => p.isActive).length;
  const totalStockCount = vendorData.products.reduce((sum, p) => sum + parseInt(p.stock || 0), 0);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header"><h2>SWIFT VENDOR</h2></div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'DASHBOARD' ? 'active' : ''}`} onClick={() => setActiveTab('DASHBOARD')}>Overview Dashboard</div>
          <div className={`nav-item ${activeTab === 'PRODUCTS' ? 'active' : ''}`} onClick={() => setActiveTab('PRODUCTS')}>Product Management</div>
          <div className={`nav-item ${activeTab === 'TRANSACTIONS' ? 'active' : ''}`} onClick={() => setActiveTab('TRANSACTIONS')}>Transaction Monitoring</div>
        </nav>
      </aside>

      <main className="main-area">
        <header className="top-nav">
          <div className="nav-title">Vendor Console | {vendorData.name}</div>
          <div className="nav-user"><button className="logout-btn" onClick={handleLogout}>Logout</button></div>
        </header>

        <section className="page-content">
          {activeTab === 'DASHBOARD' && (
            <>
              <div className="page-header"><div className="page-title"><h1>Executive Overview</h1></div></div>
              <div className="card-grid">
                <div className="dashboard-card border-purple"><h3>Active Products Listed</h3><div className="card-value">{activeProductsCount}</div></div>
                <div className="dashboard-card border-orange"><h3>Total Inventory Stock</h3><div className="card-value">{totalStockCount}</div></div>
                <div className="dashboard-card border-green"><h3>Pending Ledger Balance</h3><div className="card-value">₹{vendorData.accumulatedBalance}</div></div>
              </div>
            </>
          )}

          {activeTab === 'PRODUCTS' && (
            <>
              <div className="page-header">
                <div className="page-title"><h1>Product Management</h1></div>
                <button className="btn-primary" onClick={() => setIsAddingProduct(!isAddingProduct)}>{isAddingProduct ? 'Cancel' : '+ Add New Product'}</button>
              </div>

              {isAddingProduct && (
                <div className="content-box">
                  <div className="form-grid">
                    <input className="input-field" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                    <input className="input-field" placeholder="ProductID" value={newProduct.internalId} onChange={e => setNewProduct({...newProduct, internalId: e.target.value})} />
                    <input className="input-field" type="number" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <input className="input-field" type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                  </div>
                  <button className="btn-primary" onClick={handleAddProduct}>Save Product</button>
                </div>
              )}

              <div className="content-box">
                <table>
                  <thead><tr><th>Product Info</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {vendorData.products.map(product => (
                      <tr key={product.id}>
                        <td><strong>{product.name}</strong></td>
                        <td>₹{product.price}</td>
                        <td>{product.stock} units</td>
                        <td><span className={`badge ${product.isActive ? 'active' : 'inactive'}`}>{product.isActive ? 'ACTIVE' : 'HIDDEN'}</span></td>
                        <td><button className="btn-primary btn-small" onClick={() => toggleProductStatus(product.id)}>Toggle</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'TRANSACTIONS' && (
            <>
              <div className="page-header"><div className="page-title"><h1>Transaction Monitoring</h1></div></div>
              <div className="content-box">
                <table>
                  <thead><tr><th>TXN ID</th><th>Date & Time</th><th>Student Roll No</th><th>Items Purchased</th><th>Amount</th></tr></thead>
                  <tbody>
                    {vendorData.transactions.length === 0 && <tr><td colSpan="5">No transactions yet recorded on the API.</td></tr>}
                    {vendorData.transactions.map(txn => (
                      <tr key={txn.id}>
                        <td style={{ color: '#5B21B6', fontWeight: '600' }}>{txn.id}</td>
                        <td>{txn.date}</td>
                        <td><strong>{txn.rollNo}</strong></td>
                        <td style={{ color: '#6b7280' }}>{txn.items}</td>
                        <td style={{ fontWeight: 'bold', color: '#10b981' }}>₹{txn.amount}</td>
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
  );
}

export default App;
