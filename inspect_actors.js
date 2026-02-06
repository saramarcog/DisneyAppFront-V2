const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('../backend/data/disney.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check Actor table schema
    console.log("--- Schema: Actor ---");
    db.all("PRAGMA table_info(Actor)", (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });

    // Check Pelicula_Actor table schema
    console.log("--- Schema: Pelicula_Actor ---");
    db.all("PRAGMA table_info(Pelicula_Actor)", (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });

    // Check first 10 actors to see name formats
    db.all("SELECT * FROM Actor LIMIT 10", (err, rows) => {
        console.log("--- Data: Actor Sample ---");
        console.log(rows);
    });
});
