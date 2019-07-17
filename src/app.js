const express = require("express");
const app = express();
const util = require('./util');
const db = require('./db');

//Timestamp endpoint responds to GET request with timestamp JSON.
app.get("/timestamp", (req, res) => {
    res.status(200).json(util.isoTimestamp());
});

app.post("user", (req, res) => {
    const passHash = '';
    db.findUser(req.body.username, (err, res) => {
        if (err) console.log(err);
        else {
            if (res[0] !== undefined) {
                res.status(401).json({error: "user already exists"});
            }
            else {
                util.cryptPassword(req.body.password, (err, hash) => {
                    if (err) {
                        res.status(500).send('Error encrypting password');
                    }
                    else {
                        passHash = hash;
                        let user = {username: req.body.username, password: passHash};
                        db.insertUser(user);
                        req.status(200).send("successfully inserted user!");
                    }
                });
            }
        }
    });
});

app.post("login", (req, res) => {
    let pwdMatch = false;
    util.comparePassword(req.body.password, )
})

module.exports = app;
