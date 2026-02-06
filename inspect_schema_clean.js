const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('../backend/data/disney.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("DB Path:", dbPath);

db.serialize(() => {
    console.log("--- PELICULA COLUMNS ---");
    db.all("PRAGMA table_info(Pelicula)", (err, rows) => {
        if (rows) rows.forEach(r => console.log(r.name, r.type));

        // Check sample data
        db.all("SELECT * FROM Pelicula LIMIT 1", (err, rows) => {
            console.log("Sample:", rows);
        });
    });
});
