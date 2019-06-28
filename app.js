var express = require("express");
var app = express();
var util = require('./util');

app.get("/timestamp", (req, res) => {
    res.status(200).json(util.isoTimestamp());
});

module.exports = app;
