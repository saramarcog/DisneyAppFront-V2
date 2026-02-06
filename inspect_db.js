const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('../backend/data/disney.sqlite');
console.log('Opening DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        return;
    }
});

db.serialize(() => {
    db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Table:", row.name);
            db.all(`PRAGMA table_info(${row.name})`, (err, cols) => {
                if (cols) {
                    const colNames = cols.map(c => c.name).join(', ');
                    console.log(`  Columns: ${colNames}`);
                }
            });
        }
    });
});
