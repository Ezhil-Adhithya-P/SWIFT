const mysql = require('mysql2/promise');

async function run() {
    const db = await mysql.createPool({
        host: '127.0.0.1',
        user: 'root',
        password: 'pass123',
        database: 'swift_db'
    });

    const rollNo = '231501045';

    // Clear existing txns
    await db.query(`DELETE FROM Transactions WHERE RollNo = ?`, [rollNo]);

    const txns = [];
    let currentBalance = 0;
    
    // Start date Jan 1, 2026
    let currentDate = new Date('2026-01-02T09:00:00Z');
    const endDate = new Date(); // Today

    const vendors = [
        { id: '1', name: 'REC Main Canteen', items: ['2x Masala Dosa, 1x Coffee', '1x Veg Meals', '1x Fried Rice, 1x Coke', '2x Samosa, 1x Tea'] },
        { id: '2', name: 'REC Stationery Shop', items: ['1x Engineering Drawing Sheet Pack', '5x Blue Pens, 2x Notebooks', '1x Scientific Calculator Battery', '1x Record Note'] },
        { id: '3', name: 'Campus Cafe', items: ['1x Cappuccino, 1x Brownie', '2x Cold Coffee', '1x Sandwich'] },
        { id: '4', name: 'Library', items: ['Late Book Return Fine', 'Printout Services (10 pages)', 'Xerox (50 pages)'] }
    ];

    while (currentDate < endDate) {
        // 1. Top-Up if balance is low or start of month (10% chance per day)
        if (currentBalance < 200 || Math.random() < 0.05) {
            const topUpAmount = [500, 1000, 1500, 2000][Math.floor(Math.random() * 4)];
            currentBalance += topUpAmount;
            
            const txnTime = new Date(currentDate.getTime() + Math.random() * 2 * 60 * 60 * 1000); // morning topup
            txns.push({
                TransactionID: `TXN-${Date.now()}-${Math.floor(Math.random()*1000000)}`,
                RollNo: rollNo,
                VendorID: null,
                Amount: topUpAmount,
                Type: 'TOP_UP',
                Title: 'Bank Transfer (UPI)',
                Items: null,
                Timestamp: txnTime.toISOString()
            });
        }

        // 2. Make 0 to 3 purchases per day
        const purchasesToday = Math.floor(Math.random() * 4);
        for(let i = 0; i < purchasesToday; i++) {
            const vendor = vendors[Math.floor(Math.random() * vendors.length)];
            const item = vendor.items[Math.floor(Math.random() * vendor.items.length)];
            const amount = Math.floor(Math.random() * 150) + 20; // ₹20 to ₹170
            
            if (currentBalance >= amount) {
                currentBalance -= amount;
                const txnTime = new Date(currentDate.getTime() + (Math.random() * 8 + 4) * 60 * 60 * 1000); // randomly between 4 to 12 hours after 9 AM
                
                txns.push({
                    TransactionID: `TXN-${Date.now()}-${Math.floor(Math.random()*1000000)}`,
                    RollNo: rollNo,
                    VendorID: vendor.id,
                    Amount: amount,
                    Type: 'PURCHASE',
                    Title: vendor.name,
                    Items: item,
                    Timestamp: txnTime.toISOString()
                });
            }
        }
        
        // Advance 1 day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert all
    for (const t of txns) {
        await db.query('INSERT INTO Transactions (TransactionID, RollNo, VendorID, Amount, Type, Title, Items, Timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [t.TransactionID, t.RollNo, t.VendorID, t.Amount, t.Type, t.Title, t.Items, t.Timestamp]);
    }
    
    // Update balance
    await db.query(`UPDATE Students SET WalletBalance = ?, TotalAmountAdded = 10000, LatestAmountAdded = 500 WHERE RollNo = ?`, [currentBalance, rollNo]);
    
    console.log(`Successfully generated ${txns.length} highly realistic transactions till date!`);
    process.exit(0);
}

run();
