const mysql = require('mysql2/promise');

async function wipe() {
    try {
        const db = await mysql.createPool({
            host: '127.0.0.1',
            user: 'root',
            password: 'pass123',
            database: 'swift_db'
        });

        console.log("Wiping all transactions...");
        await db.query('DELETE FROM Transactions');
        
        console.log("Resetting student balances to zero...");
        await db.query('UPDATE Students SET WalletBalance = 0, TotalAmountAdded = 0, LatestAmountAdded = 0');
        
        console.log("Resetting vendor pending ledgers to zero...");
        await db.query('UPDATE Vendors SET PendingLedgerBalance = 0');
        
        console.log("Resetting college fiat balance...");
        await db.query('UPDATE CollegeFiat SET Balance = 12500 WHERE Id = 1');
        
        console.log("Wipe complete! The application is now 100% fresh.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

wipe();
