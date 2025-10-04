require('dotenv').config();
const fs = require('fs');
const path = require('path')
const express = require('express')
const app = express()

// API Port
const port = 1337

// Load local directory from environment variable or use default
const localDir = process.env.LOCAL_DIR || './src/raw';

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
* Reads all JSON files from the local directory and parses them into an array of objects.
*/
const readFiles = () => {
    const data = [];
    const aFiles = fs.readdirSync(localDir).filter(file => path.extname(file) === '.json');
    console.log(`Found ${aFiles.length} files.`);

    //Load each file content to memory
    aFiles.forEach(file => {
        const content = fs.readFileSync(path.join(localDir, file));
        console.log(`Loading file: ${file}`);
        const json = JSON.parse(content.toString());

        // TODO: Erstellle ein Array für jede MemberId und füge alle Shots hinzu
        // TODO: Finde die richten teiler im Shots Array.

        data.push({ 
            id: json.UserSessionInformation.UserData.MemberId || "undefined",
            firstName: json.UserSessionInformation.UserData.FirstName || "undefined",
            lastName: json.UserSessionInformation.UserData.Name || "undefined",
            date: String(json.ExerciseStart).split('T')[0] || "undefined",
            splits: json.ParameterResults[0].Teilers || []
        });
    });
    return data;    
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
app.get('/api/read', (req, res) => {
  res.send(readFiles())
})

/*
* Start the server and listen on the specified port.
*/
app.listen(port, () => {
  console.log(`ResultViewerServer listening on port ${port}`)
})