const express = require("express");
const app = express();
const util = require('./util');

//Timestamp endpoint responds to GET request with timestamp JSON.
app.get("/timestamp", (req, res) => {
    res.status(200).json(util.isoTimestamp());
});

module.exports = app;
