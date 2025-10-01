require('dotenv').config();
const fs = require('fs');
const path = require('path')
const express = require('express')
const app = express()

const port = 1337
const localDir = process.env.LOCAL_DIR || './src/raw';

// Basic CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const readFiles = () => {
    const data = [];
    const aFiles = fs.readdirSync(localDir).filter(file => path.extname(file) === '.json');

    //Load each file content to memory
    aFiles.forEach(file => {
        const content = fs.readFileSync(path.join(localDir, file));
        console.log(`Loading file: ${file}`);
        const json = JSON.parse(content.toString());
        data.push({
            name: file,
            content: json
        });
    });
    return data;    
  }

app.get('/', (req, res) => {
  res.send(readFiles())
})

app.listen(port, () => {
  console.log(`ResultViewerServer listening on port ${port}`)
})