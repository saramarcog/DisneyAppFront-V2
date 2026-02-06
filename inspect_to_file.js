const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve('../backend/data/disney.sqlite');
const db = new sqlite3.Database(dbPath);
const logFile = 'db_info.txt';

db.serialize(() => {
    let output = "DB INFO:\n";

    db.all("PRAGMA table_info(Actor)", (err, rows) => {
        output += "\nACTOR COLUMNS:\n" + JSON.stringify(rows, null, 2);

        db.all("PRAGMA table_info(Pelicula_Actor)", (err, rows) => {
            output += "\n\nPA COLUMNS:\n" + JSON.stringify(rows, null, 2);

            db.all("SELECT * FROM Actor LIMIT 5", (err, rows) => {
                output += "\n\nACTOR DATA:\n" + JSON.stringify(rows, null, 2);

                fs.writeFileSync(logFile, output);
                console.log("Done writing to " + logFile);
            });
        });
    });
});
