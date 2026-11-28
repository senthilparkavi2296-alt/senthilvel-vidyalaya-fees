const fs = require('fs');
const https = require('https');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const dbData = fs.readFileSync(dbPath, 'utf8');

const url = new URL('https://senthilvel-vidyalaya-fees.onrender.com/api/database/restore');

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(dbData)
  }
}, (res) => {
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => {
    console.log(`Render Restore Status: ${res.statusCode}`);
    console.log(`Response: ${responseBody}`);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(dbData);
req.end();
