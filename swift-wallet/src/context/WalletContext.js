import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const WalletContext = createContext();

// Use your computer's local IP address if testing on a physical phone, e.g., 'http://192.168.1.5:3000/api'
const API_URL = 'http://192.168.0.104:3000/api'; // Using Hotspot HackIP

export const WalletProvider = ({ children }) => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    
    // We mock login by just defaulting to the hardcoded student the API has
    const DEFAULT_ROLL_NO = '21CS101'; 

    const fetchWalletData = async () => {
        try {
            // Utilizing proper LAN IP for physical device
            const res = await fetch(`${API_URL}/student/${DEFAULT_ROLL_NO}`);
            
            const data = await res.json();
            if (data.success) {
                setBalance(data.student.balance);
                setTransactions(data.student.transactions);
            }
        } catch (error) {
            console.log("Could not sync wallet with API. Is the server running?");
        }
    };

    useEffect(() => {
        fetchWalletData();
        const interval = setInterval(fetchWalletData, 5000); // Poll for latest deducts from kiosk
        return () => clearInterval(interval);
    }, []);

    const addFunds = async (amount, description) => {
        try {
            const res = await fetch(`${API_URL}/student/topup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rollNo: DEFAULT_ROLL_NO, amount: parseFloat(amount) })
            });

            const data = await res.json();
            if (data.success) {
                setBalance(data.balance);
                setTransactions([data.transaction, ...transactions]);
                return true;
            }
            return false;
        } catch (e) {
            Alert.alert("Error", "Could not reach actual API for top up.");
            return false;
        }
    };

    return (
        <WalletContext.Provider value={{ balance, transactions, addFunds, refreshWallet: fetchWalletData }}>
            {children}
        </WalletContext.Provider>
    );
};
