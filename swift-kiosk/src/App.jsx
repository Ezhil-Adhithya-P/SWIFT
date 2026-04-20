import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [step, setStep] = useState('HOME');
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  
  const [cart, setCart] = useState([]);
  const [rollNumber, setRollNumber] = useState('');
  const [otp, setOtp] = useState('');

  // Computations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    fetch(`${API_URL}/kiosk/stores`).then(r => r.json()).then(data => {
        if(data.success) setStores(data.stores);
    });
  }, [step]);

  const handleSelectStore = async (storeId) => {
    setSelectedStore(storeId);
    setCart([]);
    const res = await fetch(`${API_URL}/kiosk/store/${storeId}/products`);
    const data = await res.json();
    if(data.success) {
      setStoreProducts(data.products);
      setStep('STORE');
    }
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setStep('CART');
  };

  const handleSendOTP = async () => {
    if (!rollNumber) return alert("Please enter roll number");
    
    try {
        const res = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ phoneNumber: rollNumber }) // Our generic backend catches "21CS101" and translates to Twilio Mobile
        });
        const data = await res.json();
        
        if (data.success) {
            setStep('OTP');
        } else {
            alert(data.message);
        }
    } catch(e) {
        alert("Server connection failed.");
    }
  };

  const handleVerifyOTP = async () => {
    try {
        const verifyRes = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ phoneNumber: rollNumber, otp })
        });
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
            // Checkout completely
            const checkoutRes = await fetch(`${API_URL}/kiosk/checkout`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ rollNo: rollNumber, storeId: selectedStore, amount: cartTotal, cart })
            });
            const checkoutData = await checkoutRes.json();

            if (checkoutData.success) {
                setStep('RECEIPT');
            } else {
                alert("Checkout failed: " + checkoutData.message);
                setStep('CART');
            }
        } else {
            alert("Invalid OTP! " + verifyData.message);
        }
    } catch(e) {
        alert("Transaction Failed.");
    }
  };

  const resetKiosk = () => {
    setStep('HOME'); setSelectedStore(null); setCart([]); setRollNumber(''); setOtp('');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header"><h2>SWIFT KIOSK</h2><p>REC CAMPUS E-STORE</p></div>
        <nav className="sidebar-nav">
          <div className="nav-item active" onClick={resetKiosk}>Browse Stores</div>
        </nav>
      </aside>

      <main className="main-area">
        <header className="top-nav">
          <div className="nav-title">SWIFT Web-App Interface</div>
          <div className="nav-user"><span>Welcome, Student User</span></div>
        </header>

        <section className="page-content">

          {step === 'HOME' && (
            <>
              <div className="page-header"><div className="page-title"><h1>Store Directory</h1><p>Select a store to browse available items.</p></div></div>
              <div className="card-grid">
                {stores.map(store => (
                  <div key={store.id} className="dashboard-card border-green" onClick={() => handleSelectStore(store.id)}>
                    <div className="card-value">{store.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 'STORE' && (
            <>
              <div className="page-header">
                <div className="page-title"><h1>Store Inventory</h1></div>
                <div>
                    <button className="btn-secondary" onClick={() => setStep('HOME')} style={{marginRight: '12px'}}>Go Back</button>
                    <button className="btn-primary" onClick={handleCheckout} disabled={cart.length === 0}>View Cart ({cart.reduce((a,c)=>a+c.quantity,0)})</button>
                </div>
              </div>

              <div className="content-box">
                {storeProducts.map(product => {
                  const inCart = cart.find(i => i.id === product.id)?.quantity || 0;
                  return (
                    <div key={product.id} className="list-item">
                      <div className="item-info"><h4>{product.name}</h4><p>Current Stock: {product.stock - inCart}</p></div>
                      <div className="item-action">
                        <span className="item-price">₹{product.price}</span>
                        <button className="btn-primary" onClick={() => handleAddToCart(product)} disabled={inCart >= product.stock}>Add to Cart</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {step === 'CART' && (
            <>
              <div className="page-header"><div className="page-title"><h1>Shopping Cart</h1></div></div>
              {cart.length === 0 ? (
                <div className="content-box"><p>Empty.</p></div>
              ) : (
                <div className="content-box">
                  {cart.map(item => (
                    <div key={item.id} className="list-item">
                      <div className="item-info"><h4>{item.name} (x{item.quantity})</h4></div>
                      <div className="item-action"><span className="item-price">₹{item.price * item.quantity}</span></div>
                    </div>
                  ))}
                  <div className="list-item" style={{ borderTop: '2px dashed #e5e7eb', marginTop: '16px', paddingTop: '20px' }}>
                      <div className="item-info"><h4 style={{ fontSize: '20px', color: '#5B21B6' }}>Total Amount</h4></div>
                      <div className="item-action"><span className="item-price" style={{ fontSize: '24px' }}>₹{cartTotal}</span></div>
                  </div>
                  <button className="btn-primary btn-large" onClick={() => setStep('AUTH')}>Proceed & Pay Using College Wallet</button>
                </div>
              )}
            </>
          )}

          {step === 'AUTH' && (
            <div className="content-box auth-box">
              <h3>Wallet Authentication</h3>
              <p style={{ color: '#6b7280', marginTop: '8px' }}>Security verification required to access wallet funds.</p>
              <input className="input-field" type="text" placeholder="Enter Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value.toUpperCase())} />
              <button className="btn-primary" onClick={handleSendOTP}>Request Twilio SMS OTP</button>
              <button className="btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={() => setStep('HOME')}>Cancel</button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="content-box auth-box">
              <h3>Verify Transaction</h3>
              <p>Check your registered mobile number for the OTP SMS sent via Twilio.</p>
              <input className="input-field" type="text" placeholder="Enter 6-digit OTP" maxLength={6} value={otp} style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '20px' }} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
              <button className="btn-primary" onClick={handleVerifyOTP}>Verify & Complete Payment</button>
            </div>
          )}

          {step === 'RECEIPT' && (
            <>
              <div className="mock-alert" style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
                <strong>Transaction Processed!</strong> Actual API transfer resolved.
              </div>
              <div className="bill-receipt">
                <h2 style={{ textAlign: 'center', color: '#5B21B6', marginBottom: '8px' }}>E-RECEIPT</h2>
                <div style={{ borderTop: '1px solid #d1d5db', padding: '16px 0' }}>
                  <div className="bill-row"><span>Date:</span> <span>{new Date().toLocaleString()}</span></div>
                  <div className="bill-row"><span>Auth ID:</span> <span>{rollNumber}</span></div>
                </div>
                <div style={{ borderTop: '1px solid #d1d5db', padding: '16px 0' }}>
                  {cart.map(item => (<div key={item.id} className="bill-row"><span>{item.quantity}x {item.name}</span><span>₹{item.price * item.quantity}</span></div>))}
                </div>
                <div style={{ borderTop: '2px dashed #5B21B6', padding: '16px 0', marginTop: '8px' }}>
                  <div className="bill-row" style={{ fontWeight: 'bold', fontSize: '18px', color: '#5B21B6' }}><span>TOTAL DEDUCTED </span><span>₹{cartTotal}</span></div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}><button className="btn-primary" onClick={resetKiosk}>Start New Session</button></div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}

export default App;
