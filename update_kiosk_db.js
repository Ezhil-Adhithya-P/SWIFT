const mysql = require('mysql2/promise');

async function updateDB() {
    try {
        const db = await mysql.createPool({
            host: '127.0.0.1',
            user: 'root',
            password: 'pass123',
            database: 'swift_db'
        });

        console.log("Updating Vendors...");
        await db.query("UPDATE Vendors SET Name = 'REC Cafe' WHERE VendorID = '1'");
        await db.query("UPDATE Vendors SET Name = 'REC Mart' WHERE VendorID = '2'");

        console.log("Cleaning old products...");
        await db.query("DELETE FROM Products WHERE VendorID IN ('1', '2')");

        console.log("Adding REC Cafe Menu...");
        const cafeItems = [
            ['Idli (Set)', 40, 50],
            ['Plain Dosa', 50, 40],
            ['Masala Dosa', 70, 30],
            ['Podi Dosa', 65, 30],
            ['Ghee Roast', 85, 20],
            ['Poori Masala', 60, 40],
            ['Medhu Vadai (1pc)', 15, 100],
            ['Tea', 15, 200],
            ['Filter Coffee', 20, 200]
        ];

        for (const [name, price, stock] of cafeItems) {
            const id = 'C' + Math.random().toString(36).substr(2, 5).toUpperCase();
            await db.query("INSERT INTO Products (ProductID, VendorID, Name, InternalID, Price, Stock) VALUES (?, ?, ?, ?, ?, ?)",
                [id, '1', name, 'ITEM-' + id, price, stock]);
        }

        console.log("Adding REC Mart Items...");
        const martItems = [
            ['Notebook (120 Pages)', 45, 100],
            ['Notebook (60 Pages)', 25, 100],
            ['Pencil', 5, 500],
            ['Pen (Blue/Black)', 10, 500],
            ['Eraser', 5, 200],
            ['Sharpener', 5, 200],
            ['Scale (30cm)', 20, 100],
            ['KitKat', 25, 100],
            ['Snickers', 35, 100],
            ['Boost (Small Pack)', 15, 100],
            ['Milo (Small Pack)', 15, 100],
            ['Cavins Milkshake (Chocolate)', 40, 50],
            ['Cavins Milkshake (Vanilla)', 40, 50],
            ['Cavins Milkshake (Strawberry)', 40, 50]
        ];

        for (const [name, price, stock] of martItems) {
            const id = 'M' + Math.random().toString(36).substr(2, 5).toUpperCase();
            await db.query("INSERT INTO Products (ProductID, VendorID, Name, InternalID, Price, Stock) VALUES (?, ?, ?, ?, ?, ?)",
                [id, '2', name, 'ITEM-' + id, price, stock]);
        }

        console.log("Database updated successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updateDB();
