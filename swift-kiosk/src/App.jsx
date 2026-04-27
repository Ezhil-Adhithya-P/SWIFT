import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://10.50.38.4:3000/api';

function App() {
  const [step, setStep] = useState('HOME');
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  
  const [cart, setCart] = useState([]);
  const [rollNumber, setRollNumber] = useState(['', '', '', '', '', '', '', '', '']); 
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState('roll'); 
  const [focusedIndex, setFocusedIndex] = useState(0);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    fetch(`${API_URL}/kiosk/stores`).then(r => r.json()).then(data => {
        if(data.success) setStores(data.stores);
    });
  }, [step]);

  // Auto-redirect from Receipt to Home after 5 seconds
  useEffect(() => {
    if (step === 'RECEIPT') {
        const timer = setTimeout(() => {
            resetKiosk();
        }, 5000);
        return () => clearTimeout(timer);
    }
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

  const handleKeypadPress = (val) => {
    if (activeInput === 'roll') {
        const newRoll = [...rollNumber];
        if (val === 'DEL') {
            if (focusedIndex > 0 || newRoll[focusedIndex] !== '') {
                const idx = newRoll[focusedIndex] === '' ? focusedIndex - 1 : focusedIndex;
                newRoll[idx] = '';
                setRollNumber(newRoll);
                setFocusedIndex(idx);
            }
        } else {
            if (focusedIndex < 9) {
                newRoll[focusedIndex] = val;
                setRollNumber(newRoll);
                if (focusedIndex < 8) setFocusedIndex(focusedIndex + 1);
            }
        }
    } else {
        const newOtp = [...otp];
        if (val === 'DEL') {
            if (focusedIndex > 0 || newOtp[focusedIndex] !== '') {
                const idx = newOtp[focusedIndex] === '' ? focusedIndex - 1 : focusedIndex;
                newOtp[idx] = '';
                setOtp(newOtp);
                setFocusedIndex(idx);
            }
        } else {
            if (focusedIndex < 6) {
                newOtp[focusedIndex] = val;
                setOtp(newOtp);
                if (focusedIndex < 5) setFocusedIndex(focusedIndex + 1);
            }
        }
    }
  };

  const handleSendOTP = async () => {
    const fullRoll = rollNumber.join('');
    if (fullRoll.length < 5) return alert("Please enter valid roll number");
    
    try {
        const res = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ phoneNumber: fullRoll })
        });
        const data = await res.json();
        
        if (data.success) {
            setStep('OTP');
            setActiveInput('otp');
            setFocusedIndex(0);
        } else {
            alert(data.message);
        }
    } catch(e) {
        alert("Server connection failed.");
    }
  };

  const handleVerifyOTP = async () => {
    const fullRoll = rollNumber.join('');
    const fullOtp = otp.join('');
    try {
        const verifyRes = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ phoneNumber: fullRoll, otp: fullOtp })
        });
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
            const checkoutRes = await fetch(`${API_URL}/kiosk/checkout`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ rollNo: fullRoll, storeId: selectedStore, amount: cartTotal, cart })
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
    setStep('HOME'); setSelectedStore(null); setCart([]); 
    setRollNumber(['', '', '', '', '', '', '', '', '']); 
    setOtp(['', '', '', '', '', '']);
    setActiveInput('roll'); setFocusedIndex(0);
  };

  const Keypad = () => (
    <div className="virtual-keypad">
        {[1,2,3,4,5,6,7,8,9,0].map(n => (
            <button key={n} className="keypad-btn" onClick={() => handleKeypadPress(n.toString())}>{n}</button>
        ))}
        <button className="keypad-btn" style={{gridColumn: 'span 2', background: '#fee2e2'}} onClick={() => handleKeypadPress('DEL')}>DELETE</button>
    </div>
  );

  return (
    <div className="app-container">
      <header className="top-nav">
        <div className="nav-title">REC Kiosk</div>
      </header>

      <main className="main-area">
        <section className="page-content">

          {step === 'HOME' && (
            <div className="card-grid" style={{marginTop: '40px'}}>
                {stores.map(store => (
                    <div key={store.id} className="dashboard-card" onClick={() => handleSelectStore(store.id)}>
                        <div className="card-value">{store.name}</div>
                    </div>
                ))}
            </div>
          )}

          {step === 'STORE' && (
            <>
              <div className="header-controls">
                  <button className="btn-secondary" onClick={() => setStep('HOME')}>Switch Store</button>
                  <button className="btn-primary" onClick={() => setStep('CART')} disabled={cart.length === 0}>View Cart ({cart.reduce((a,c)=>a+c.quantity,0)})</button>
              </div>

              <div className="product-grid">
                {storeProducts.map(product => {
                  const inCart = cart.find(i => i.id === product.id)?.quantity || 0;
                  return (
                    <div key={product.id} className="product-card">
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p>In Stock: {product.stock - inCart}</p>
                      </div>
                      <div className="product-action">
                        <span className="item-price">₹{product.price}</span>
                        <button className="btn-primary" onClick={() => handleAddToCart(product)} disabled={inCart >= product.stock}>Add</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {step === 'CART' && (
            <div style={{maxWidth: '800px', margin: '0 auto'}}>
              <div className="page-header"><div className="page-title"><h1>Your Shopping Cart</h1></div></div>
              <div className="content-box">
                {cart.length === 0 ? <p>Your cart is empty.</p> : (
                    <>
                        {cart.map(item => (
                            <div key={item.id} className="list-item">
                                <div className="item-info"><h4>{item.name} (x{item.quantity})</h4></div>
                                <div className="item-action"><span className="item-price" style={{color: '#1e293b'}}>₹{item.price * item.quantity}</span></div>
                            </div>
                        ))}
                        <div className="list-item" style={{ borderTop: '2px solid #e2e8f0', marginTop: '24px', paddingTop: '24px' }}>
                            <div className="item-info"><h4 style={{ fontSize: '22px' }}>Total Payable</h4></div>
                            <div className="item-action"><span className="item-price" style={{ fontSize: '28px', color: '#5B21B6' }}>₹{cartTotal}</span></div>
                        </div>
                        <div className="header-controls" style={{marginTop: '32px', justifyContent: 'center'}}>
                            <button className="btn-secondary" style={{padding: '16px 32px'}} onClick={() => setStep('STORE')}>Back to Store</button>
                            <button className="btn-primary" style={{padding: '16px 40px'}} onClick={() => { setStep('AUTH'); setActiveInput('roll'); setFocusedIndex(0); }}>Proceed to Payment</button>
                        </div>
                    </>
                )}
              </div>
            </div>
          )}

          {step === 'AUTH' && (
            <div className="content-box auth-box">
              <h2 style={{fontSize: '24px', color: '#1e1b4b'}}>Prior to proceeding for the payment</h2>
              <p style={{marginTop: '8px', color: '#64748b'}}>Enter your 9-digit Student Roll Number</p>
              
              <div className="digit-container">
                {rollNumber.map((d, i) => (
                    <input key={i} className={`digit-box ${focusedIndex === i ? 'active' : ''}`} readOnly value={d} />
                ))}
              </div>

              <Keypad />

              <button className="btn-primary btn-large" onClick={handleSendOTP}>Send OTP</button>
              <button className="btn-secondary" style={{ width: '100%', marginTop: '16px' }} onClick={() => setStep('CART')}>Cancel</button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="content-box auth-box">
              <h2 style={{fontSize: '24px', color: '#1e1b4b'}}>Verify Your Identity</h2>
              <p style={{marginTop: '8px', color: '#64748b'}}>Enter the 6-digit OTP sent to your registered mobile</p>
              
              <div className="digit-container">
                {otp.map((d, i) => (
                    <input key={i} className={`digit-box ${focusedIndex === i ? 'active' : ''}`} readOnly value={d} />
                ))}
              </div>

              <Keypad />

              <button className="btn-primary btn-large" onClick={handleVerifyOTP}>Verify & Complete Payment</button>
            </div>
          )}

          {step === 'RECEIPT' && (
            <>
              <div className="bill-receipt">
                <h1 style={{ textAlign: 'center', color: '#5B21B6', marginBottom: '32px', fontSize: '28px' }}>REC KIOSK RECEIPT</h1>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div className="bill-row"><span>Date:</span> <span>{new Date().toLocaleDateString()}</span></div>
                    <div className="bill-row"><span>Time:</span> <span>{new Date().toLocaleTimeString()}</span></div>
                    <div className="bill-row"><span>Roll No:</span> <span>{rollNumber.join('')}</span></div>
                    <div className="bill-row"><span>Status:</span> <span style={{color: '#10b981', fontWeight: '800'}}>PAID</span></div>
                </div>
                <div>
                    {cart.map(item => (
                        <div key={item.id} className="bill-row">
                            <span>{item.quantity}x {item.name}</span>
                            <span>₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: '2px dashed #5B21B6', paddingTop: '20px', marginTop: '20px' }}>
                    <div className="bill-row" style={{ fontWeight: '900', fontSize: '24px' }}>
                        <span>TOTAL PAID</span>
                        <span style={{color: '#5B21B6'}}>₹{cartTotal}</span>
                    </div>
                </div>
              </div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}

export default App;
