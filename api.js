// api.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
// Your API routes go here
router.use(express.json());
const dbPath = './microverba.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(`Error opening or creating the database: ${err.message}`);
    } else {
        console.log(`Connected to the database at ${dbPath}`);

        // Create the 'user_info' table
        db.run(`
        CREATE TABLE IF NOT EXISTS user_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          socket_id TEXT NOT NULL,
          token TEXT,
          mobile_os TEXT
        )
      `, (createTableErr) => {
            if (createTableErr) {
                console.error(`Error creating 'user_info' table: ${createTableErr.message}`);
            } else {
                console.log('Table \'user_info\' created or already exists.');
            }
        });
    }
});

// Assuming the 'token' parameter is provided as a query parameter: /api/data?token=abc123
router.get('/api/data', (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ error: 'Token is missing in the request URL.' });
    }

    // Query user info based on the provided token
    const query = `
        SELECT * FROM user_info WHERE token = ?
    `;

    db.get(query, [token], (err, userInfo) => {
        if (err) {
            console.error(`Error retrieving user info: ${err.message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (userInfo) {
                // User info found, send it in the response
                res.json({ success: true, data: userInfo });
            } else {
                // User info not found for the given token
                res.status(404).json({ error: 'User not found for the provided token.' });
            }
        }
    });
});


router.post('/api/data', (req, res) => {
    let { socket_id, token, mobile_os } = req.body;

    if (!socket_id) {
        socket_id = token;
    }

    // Check if a record with the given token exists
    const checkQuery = `
SELECT * FROM user_info WHERE token = ?
`;

    db.get(checkQuery, [token], (checkErr, existingRecord) => {
        if (checkErr) {
            console.error(`Error checking if record exists: ${checkErr.message}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (existingRecord) {
                // Update the existing record
                const updateQuery = `
            UPDATE user_info SET socket_id = ?, mobile_os = ? WHERE token = ?
        `;

                db.run(updateQuery, [socket_id, mobile_os, token], (updateErr) => {
                    if (updateErr) {
                        console.error(`Error updating data in 'user_info' table: ${updateErr.message}`);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        console.log('Data updated in \'user_info\' table.');
                        res.json({ success: true, status: 200 });
                    }
                });
            } else {
                // Insert a new record
                const insertQuery = `
            INSERT INTO user_info (socket_id, token, mobile_os) VALUES (?, ?, ?)
        `;

                db.run(insertQuery, [socket_id, token, mobile_os], (insertErr) => {
                    if (insertErr) {
                        console.error(`Error inserting data into 'user_info' table: ${insertErr.message}`);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        console.log('Data inserted into \'user_info\' table.');
                        res.json({ success: true, status: 200 });
                    }
                });
            }
        }
    });



});

module.exports = router;
