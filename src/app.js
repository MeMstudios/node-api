const express = require("express");
const bodyParser = require("body-parser");
const Cookies = require("cookies");
const {check, validationResult} = require('express-validator');
const app = express();
const util = require('./util');
const db = require('./db');

let clientURL = 'http://localhost:8000/index.html';
if (process.env.NODE_ENV == 'production') {
    clientURL = 'https://dropgame.io/';
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
app.use(express.json())

//Timestamp endpoint responds to GET request with timestamp JSON.
app.get("/timestamp", (req, res) => {
    res.status(200).json(util.isoTimestamp());
});

/**
 * POST user endpoint checks for existing username and doesn't allow duplicates.
 * Highscore will be initialized to 0
 * 
 * @param username string
 * @param password string
 */
app.post("/user", [
    check('username').isLength({min: 3}).trim().escape(),
    check('password').isLength({min: 3}).trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (req.body.username === undefined || req.body.password === undefined) {
        res.status(400).json({error: "Invalid request!"});
    }
    else if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
    }
    else {
        db.findUser(req.body.username, (err, findRes) => {
            if (err) console.error(err);
            else {
                if (findRes[0] !== undefined) {
                    res.status(422).json({error: "User already exists!"});
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
                                infHighscore: 0,
                                userAgentString: req.headers["user-agent"]
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
 * GET user endpoint takes an id in the query string
 * 
 * @param id
 */
app.get("/user", [
    check('id').isLength({min: 20}).trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (req.query.id === undefined) {
        res.status(400).json({error: "Invalid Request!"});
    }
    else if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
    }
    else {
        db.getUser(req.query.id, (err, userRes) => {
            if (err) {
                console.error(err)
                res.status(500).json({error: err});
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
 * 
 * @param username string
 * @param password string
 */
app.post("/login", [
    check('username').isLength({min: 3}).trim().escape(),
    check('password').isLength({min: 3}).trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (req.body.username === undefined || req.body.password === undefined) {
        console.log(req.body);
        res.status(400).json({error: "Invalid request!"});
    }
    else if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
    }
    else {
        db.findUser(req.body.username, (err, userRes) => {
            if (err) {
                console.error(err);
                res.status(500).json({error: err});
            }
            else {
                if (userRes[0] === undefined) {
                    res.status(401).json({error: "Invalid username!"});
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
                                res.status(401).json({error: "Wrong password!  I can't help you."});
                            }
                        }
                    });
                }
            }
        });
    }
});

if (process.env.NODE_ENV != 'production') {
/**
 * DELETE endpoint for users. Only used for testing.
 * 
 * @param id string
 */
    app.delete("/user", (req, res) => {
            if (req.body.id === undefined) {
                res.status(400).json({error: "Invalid Request!"});
            }
            else {
                db.deleteUser(req.body.id, (err, deleteRes) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({error: err});
                    }
                    else if (deleteRes.result.ok === 1 && deleteRes.result.n === 1) {
                        res.status(200).json({success: true});
                    }
                    else {
                        res.status(200).json({success: false});
                    }
                });
            }
        }
    )
}

/**
 * GET leaderboard endpoint returns the top 10 scores for the infite or timed game
 * 
 * @param inf boolean
 */
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
                // Initialize array to maximum 10 on the leaderboard
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

/**
 * POST endpoint to update the highscore for a given user id
 * 
 * @param id string  the user's ID
 * @param highscore number
 * @param inf boolean  the infinite table or not
 */
app.post("/highscore", [
    check('id').isLength({min: 20}).trim().escape(),
    check('highscore').isNumeric(),
    check('inf').isBoolean()
], (req, res) => {
    const errors = validationResult(req);
    //security!  All the requests should only be coming from our application.
    if (req.headers.referer !== clientURL) {
        res.status(401).json({error: "No Cheating!"});
    }    
    else if (!errors.isEmpty()) {
        res.status(422).json({ error: errors.array() });
    }
    else {
        if (req.body.id === undefined || req.body.highscore === undefined) {
            res.status(400).json({error: "Invalid request!"});
        }
        else {
            db.updateHighscore(req.body.id, req.body.highscore, req.headers["user-agent"], req.body.inf, (err, scoreRes) => {
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
