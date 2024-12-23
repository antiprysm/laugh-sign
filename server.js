const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Store laugh count in a simple file
const laughCountFile = './laughCount.json';

// Load the current count from the file
function loadLaughCount() {
    try {
        const data = fs.readFileSync(laughCountFile, 'utf8');
        return JSON.parse(data).count || 0;
    } catch (err) {
        return 0;
    }
}

// Update the laugh count in the file
function updateLaughCount(count) {
    const data = JSON.stringify({ count });
    fs.writeFileSync(laughCountFile, data, 'utf8');
}

// Endpoint to get the current laugh count
app.get('/get-laugh-count', (req, res) => {
    const count = loadLaughCount();
    res.json({ count });
});

// Endpoint to increment the laugh count
app.post('/increment-laugh-count', (req, res) => {
    let count = loadLaughCount();
    count++;
    updateLaughCount(count);
    res.json({ count });
});

// Serve static files (your website)
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
