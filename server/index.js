const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { send } = require('process');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const DEV_MODE = process.env.NODE_ENV === "true";

const app = express();

app.use(express.static(path.join(__dirname, '/../client/build')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../client/build/index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});