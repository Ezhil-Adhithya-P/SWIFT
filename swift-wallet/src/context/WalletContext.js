import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const WalletContext = createContext();

// Use your computer's local IP address if testing on a physical phone, e.g., 'http://192.168.1.5:3000/api'
const API_URL = 'http://192.168.0.109:3000/api';

export const WalletProvider = ({ children }) => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [studentRollNo, setStudentRollNo] = useState(null);
    const [studentName, setStudentName] = useState('');

    const fetchWalletData = async () => {
        if (!studentRollNo) return;
        try {
            // Utilizing proper LAN IP for physical device
            const res = await fetch(`${API_URL}/student/${studentRollNo}`);

            const data = await res.json();
            if (data.success) {
                setBalance(data.student.balance);
                setTransactions(data.student.transactions);
                setStudentName(data.student.name);
            }
        } catch (error) {
            console.log("Could not sync wallet with API. Is the server running?");
        }
    };

    useEffect(() => {
        if (studentRollNo) {
            fetchWalletData();
            const interval = setInterval(fetchWalletData, 5000); // Poll for latest deducts from kiosk
            return () => clearInterval(interval);
        }
    }, [studentRollNo]);

    const login = async (rollNo, password) => {
        try {
            const res = await fetch(`${API_URL}/student/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rollNo, password })
            });
            const data = await res.json();
            if (data.success) {
                setStudentRollNo(data.rollNo);
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (e) {
            return { success: false, message: "Could not reach API." };
        }
    };

    const logout = () => {
        setStudentRollNo(null);
        setBalance(0);
        setTransactions([]);
    };

    const requestPasswordReset = async (rollNo) => {
        try {
            const res = await fetch(`${API_URL}/student/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rollNo })
            });
            return await res.json();
        } catch (e) {
            return { success: false, message: "Could not reach API." };
        }
    };

    const resetPassword = async (rollNo, otp, newPassword) => {
        try {
            const res = await fetch(`${API_URL}/student/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rollNo, otp, newPassword })
            });
            return await res.json();
        } catch (e) {
            return { success: false, message: "Could not reach API." };
        }
    };

    const addFunds = async (amount, description) => {
        if (!studentRollNo) return false;
        try {
            const res = await fetch(`${API_URL}/student/topup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rollNo: studentRollNo, amount: parseFloat(amount) })
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
        <WalletContext.Provider value={{
            balance, transactions, addFunds, refreshWallet: fetchWalletData,
            studentRollNo, studentName, login, logout, requestPasswordReset, resetPassword
        }}>
            {children}
        </WalletContext.Provider>
    );
};
