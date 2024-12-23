const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;
const fs = require('fs');
const resetConfig = JSON.parse(fs.readFileSync('./server.json', 'utf8'));

// Check if we need to reset the laugh count
if (resetConfig.reset_laugh_count) {
  pool.query('UPDATE laugh_counter SET count = 0 WHERE id = 1;', (err, result) => {
    if (err) {
      console.error('Error resetting laugh count:', err);
    } else {
      console.log('Laugh count reset successfully!');
    }
  });

  // Reset the flag in the server.json after reset to avoid continuous resets
  resetConfig.reset_laugh_count = false;
  fs.writeFileSync('./server.json', JSON.stringify(resetConfig, null, 2), 'utf8');
}

// Set up PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'YOUR_CONNECTION_STRING_HERE', // Replace with your Render connection string
  ssl: { rejectUnauthorized: false } // Required for connecting securely on Render
});

// Create the "laugh_counter" table if it doesn't exist
pool.query(
  `CREATE TABLE IF NOT EXISTS laugh_counter (id SERIAL PRIMARY KEY, count INTEGER DEFAULT 0);`
);


// Get the current laugh count
app.get('/get-laugh-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT count FROM laugh_counter WHERE id = 1;');
    const count = result.rows[0]?.count || 0;
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching laugh count.');
  }
});

// Increment the laugh count
app.post('/increment-laugh-count', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO laugh_counter (id, count)
       VALUES (1, 1)
       ON CONFLICT (id)
       DO UPDATE SET count = laugh_counter.count + 1;`
    );
    const result = await pool.query('SELECT count FROM laugh_counter WHERE id = 1;');
    const count = result.rows[0].count;
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error incrementing laugh count.');
  }
});

// Serve static files (your website)
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

