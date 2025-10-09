require('dotenv').config();
const fs = require('fs');
const path = require('path')
const express = require('express')
const app = express()

// API Port
const port = 1337

// Load local directory from environment variable or use default
const localDir = process.env.LOCAL_DIR || './src/data';
console.log(`Using directory: ${localDir}`);

// Array to hold parsed data
var data = [];

//Set CORS headers to allow requests from the frontend application.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  next();
});

/* 
* Reads all directories from the local directory.
*/
function getDirectories() {
    console.log(`Reading directories from: ${localDir}`);
    return fs.readdirSync(localDir)
        .map(file => path.join(localDir, file))
        .filter(path => fs.statSync(path).isDirectory());
}

console.log(`Found directories: ${getDirectories().map(dir => path.basename(dir)).join(', ')}`);

/*
* Reads all JSON files from the local directory and parses them into an array of objects.
*/
const readFiles = () => {
    const aData = [];
    const aDirectories = getDirectories();

    // Iterate through each directory
    aDirectories.forEach(dir => {
      console.log(`Reading directory: ${dir}`);
      
      //Read all files in the directory and filter for .json files
      const sPath = path.join(dir, 'Exercise', 'raw');

      if (!fs.existsSync(sPath)) {
        console.warn(`Directory does not exist: ${sPath}`);
        return;
      }

      const aFiles = fs.readdirSync(sPath).filter(file => path.extname(file) === '.json');

      console.log(`Found ${aFiles.length} files.`);

      //Load each file content to memory
      aFiles.forEach(file => {
          const content = fs.readFileSync(path.join(sPath, file));
          console.log(`Loading file: ${file}`);
          const json = JSON.parse(content.toString());

          aData.push({
            id: json?.UserSessionInformation?.UserData?.MemberId || 'unknown',
            firstName: json?.UserSessionInformation?.UserData?.FirstName || 'unknown',
            lastName: json?.UserSessionInformation?.UserData?.Name || 'unknown',
            date: path.basename(dir) || 'unknown',
            splits: json?.ParameterResults[0]?.Teilers || [0.0, 0.0, 0.0]
          });
      });
    });

    return aData;    
}

/*
* Groups the parsed data by member ID.
*/
const groupById = (rawData) => {
    return rawData.reduce((acc, result) => {
        const memberId = result?.id;
        if (!memberId) return acc;
        if (!acc[memberId]) acc[memberId] = [];
        acc[memberId].push(result);
        return acc;
    }, {});
}

/* 
* Groups the parsed data by date.
*/
const groupByDate = (rawData) => {
    return rawData.reduce((acc, result) => {
        const date = result?.date;
        if (!date) return acc;
        if (!acc[date]) acc[date] = [];
        acc[date].push(result);
        return acc;
    }, {});
}

/*
* Default route to check if the server is running.
*/
app.get('/', (req, res) => {
  res.send('ResultViewerServer is running');
})

/*
* API endpoint to get the parsed data from JSON files.
*/
app.get('/api/raw', (req, res) => {
  res.send(readFiles())
})

/*
* API endpoint to get the data grouped by member ID.
*/
app.get('/api/groupById', (req, res) => {
  res.send(groupById(readFiles()))
})

/*
* API endpoint to get the data grouped by date.
*/
app.get('/api/groupByDate', (req, res) => {
  res.send(groupByDate(readFiles()))
})

/*
* Start the server and listen on the specified port.
*/
app.listen(port, () => {
  console.log(`ResultViewerServer listening on port ${port}`)
})