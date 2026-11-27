// sync-db.js - Pulls live data from Render to prevent any data loss before local commits
const https = require('https');
const fs = require('fs');
const path = require('path');

const LIVE_URL = 'https://senthilvel-vidyalaya-fees.onrender.com/api/database/backup';
const LOCAL_DB = path.join(__dirname, 'database.json');
const SEED_FILE = path.join(__dirname, 'seed_students.json');

console.log('Checking live Render database at:', LIVE_URL);

https.get(LIVE_URL, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    try {
      const liveData = JSON.parse(raw);
      if (liveData && liveData.students && Array.isArray(liveData.students)) {
        console.log(`Live data verified: ${liveData.students.length} students, ${(liveData.payments || []).length} payments.`);
        
        let localData = null;
        if (fs.existsSync(LOCAL_DB)) {
          try { localData = JSON.parse(fs.readFileSync(LOCAL_DB, 'utf8')); } catch(e){}
        }

        const livePmts = (liveData.payments || []).length;
        const localPmts = localData && localData.payments ? localData.payments.length : 0;

        console.log(`Live payments: ${livePmts} | Local payments: ${localPmts}`);

        fs.writeFileSync(LOCAL_DB, JSON.stringify(liveData, null, 2), 'utf8');
        if (fs.existsSync(SEED_FILE)) {
          fs.writeFileSync(SEED_FILE, JSON.stringify(liveData.students, null, 2), 'utf8');
        }
        console.log('Successfully synced live database to local database.json and seed_students.json!');
      } else {
        console.warn('Live endpoint returned non-database payload. Skipping overwrite.');
      }
    } catch(err) {
      console.warn('Could not parse live database response. Skipping overwrite:', err.message);
    }
  });
}).on('error', (err) => {
  console.warn('Network error reaching live database:', err.message);
});
