const express = require("express");
const bodyParser = require("body-parser");
const Cookies = require("cookies");
const app = express();
const util = require('./util');
const db = require('./db');

let clientURL = 'http://localhost:8000/index.html';
if (process.env.NODE_ENV == 'production') {
    clientURL = 'https://drop.memstudios.com/';
}

//Express Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(Cookies.express());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Timestamp endpoint responds to GET request with timestamp JSON.
app.get("/timestamp", (req, res) => {
    res.status(200).json(util.isoTimestamp());
});

/**
 * POST user endpoint checks for existing username and doesn't allow duplicates.
 * application/json: {"username": "name", "password": "newpassword"}
 * Highscore will be initialized to 0
 */
app.post("/user", (req, res) => {
    if (req.body.username === undefined || req.body.password === undefined) {
        res.status(400).json({error: "Invalid request!"});
    }
    else {
        db.findUser(req.body.username, (err, findRes) => {
            if (err) console.error(err);
            else {
                if (findRes[0] !== undefined) {
                    res.status(200).json({error: "User already exists!"});
                }
                else {
                    util.cryptPassword(req.body.password, (err, hash) => {
                        if (err) {
                            res.status(500).json({error: 'Error encrypting password'});
                        }
                        else {
                            let user = {
                                username: req.body.username, 
                                password: hash, 
                                highscore: 0, 
                                infHighscore: 0
                            };
                            db.insertUser(user, (err, insertRes) => {
                                if (err) console.error(err);
                                else {
                                    res.status(200).json({
                                        success: true,
                                        id: insertRes.insertedId
                                    });
                                }
                            });
                            
                        }
                    });
                }
            }
        });
    }
});

/**
 * GET user endpoint takes and id in the query string
 */
app.get("/user", (req, res) => {
    if (req.query.id === undefined) {
        res.status(400).json({error: "Invalid Request!"});
    }
    else {
        db.getUser(req.query.id, (err, userRes) => {
            if (err) {
                console.error(err)
                res.status(500).json({error: "Database error!"});
            }
            else {
                if (userRes[0] === undefined) {
                    console.log(userRes);
                    res.status(400).json({error: "User not found!"});
                }
                else {
                    res.status(200).json({
                        username: userRes[0].username, 
                        highscore: userRes[0].highscore, 
                        infHighscore: userRes[0].infHighscore, 
                        id: userRes[0]._id
                    });
                }
            }
        })
    }
})

/**
 * POST login endpoint takes a username and password in the request body
 */
app.post("/login", (req, res) => {
    if (req.body.username === undefined || req.body.password === undefined) {
        console.log(req.body);
        res.status(400).json({error: "Invalid request!"});
        
    }
    else {
        db.findUser(req.body.username, (err, userRes) => {
            if (err) {
                console.error(err);
                res.status(500).json({error: "database error!"});
            }
            else {
                if (userRes[0] === undefined) {
                    res.status(200).json({error: "Invalid username!"});
                }
                else {
                    let user = userRes[0];
                    util.comparePassword(req.body.password, user.password, (err, success) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({error: "server error!"});
                        }
                        else {
                            if (success) {
                                res.status(200).json({
                                    success: true, 
                                    id: user._id
                                });
                            }
                            else {
                                res.status(200).json({error: "Wrong password!  I can't help you."});
                            }
                        }
                    });
                }
            }
        });
    }
});

app.get("/leaderboard", (req, res) => {
    let inf = req.query.inf === 'true';
   
    db.getLeaderboard(inf, (err, leadersRes) => {
        if (err) {
            console.error(err);
            res.status(500).json({error: "database error!"});
        }
        else {
            if (leadersRes.length > 0) {
                let leaderBoard;
                //Maximum 10 on the leaderboard
                if (leadersRes.length < 10) {
                    leaderBoard = Array(leadersRes.length);
                }
                else {
                    leaderBoard = Array(10);
                }
                
                for (let i = 0; i < leaderBoard.length; i++) {
                    let userHighscore;
                    //Show the correct score if it's the infinite leaderboard.
                    
                    if (inf) {
                        userHighscore = leadersRes[i].infHighscore;
                    }
                    else {
                        userHighscore = leadersRes[i].highscore;
                    }
                    leaderBoard[i] = {
                        username: leadersRes[i].username,                        
                        highscore: userHighscore
                    };
                }
                res.status(200).json(leaderBoard);
            }
            else {
                res.status(200).json({error: "No users found!"});
            }
        }
    });
});

app.post("/highscore", (req, res) => {
    //security!  All the requests should only be coming from our application.
    if (req.headers.referer !== clientURL) {
        res.status(401).json({error: "No Cheating!"});
    }
    else {
        if (req.body.id === undefined || req.body.highscore === undefined) {
            res.status(400).json({error: "Invalid request!"});
        }
        else {
            db.updateHighscore(req.body.id, req.body.highscore, req.body.inf, (err, scoreRes) => {
                if (err) {
                    res.status(500).json({error: "Database error!"});
                }
                else {
                    if (scoreRes.modifiedCount > 0) {
                        res.status(200).json({success: true, message: "Updated highscore!"});
                    }
                    else {
                        res.status(200).json({success: false, message: "Nothing changed."})
                    }
                }
            });
        }
    }
});

module.exports = app;
