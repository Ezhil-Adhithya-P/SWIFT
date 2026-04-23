const mysql = require('mysql2/promise');

async function updateVendors() {
    try {
        const db = await mysql.createPool({
            host: '127.0.0.1',
            user: 'root',
            password: 'pass123',
            database: 'swift_db'
        });

        console.log("Adding Credentials columns to Vendors table...");
        try {
            await db.query("ALTER TABLE Vendors ADD COLUMN Username VARCHAR(50) DEFAULT ''");
            await db.query("ALTER TABLE Vendors ADD COLUMN Password VARCHAR(100) DEFAULT 'admin123'");
        } catch (e) {
            console.log("Columns might already exist.");
        }

        console.log("Setting credentials for REC Cafe and REC Mart...");
        // REC Cafe (ID: 1)
        await db.query("UPDATE Vendors SET Username = 'reccafe', Password = 'cafepassword' WHERE VendorID = '1'");
        // REC Mart (ID: 2)
        await db.query("UPDATE Vendors SET Username = 'recmart', Password = 'martpassword' WHERE VendorID = '2'");

        console.log("Vendor credentials updated in MySQL!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updateVendors();
