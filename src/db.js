const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const fs = require('fs');
const util = require('./util');

const cred = JSON.parse(fs.readFileSync('./credential.json'));
const mongoUser = cred.mongo.user;
const mongoPwd = cred.mongo.pwd;

if (process.env.NODE_ENV == 'production') {
    dbURL = '127.0.0.1';
}
else {
    dbURL = 'dropgame.io'
}

const url = "mongodb://" + mongoUser + ":" + mongoPwd + "@" + dbURL + ":27017/drop-db";


/**
 * Insert a new user
 * @param user object
 * @param callback
 * 
 * @returns callback(err, userResponse)
 */
exports.insertUser = (user, callback) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("drop-db");
        dbo.collection("users").insertOne(user, function(err, res) {
            db.close();
            if (err) return callback(err);
            
            return callback(err, res);
        });
    });
}

/**
 * Delete a user
 * @param userId ObjectID
 * @param callback
 * 
 * @returns callback(err, userResponse)
 */
exports.deleteUser = (userId, callback) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        let dbo = db.db("drop-db");
        let query = {"_id": mongo.ObjectID(userId)};
        dbo.collection("users").deleteOne(query, function(err, res) {
            db.close();
            if (err) return callback(err);
            
            return callback(err, res);
        });
    });
}

/**
 * Find a user by username
 * @param name string
 * @param callback
 * 
 * @returns callback(err, userResponse)
 */
exports.findUser = (name, callback) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("drop-db");
        let query = {username: name}
        dbo.collection("users").find(query).toArray(function(err, res) {
            db.close();
            if (err) return callback(err);
            
            return callback(err, res);
        });
    });
}

/**
 * Get a user by id
 * @param userId ObjectID
 * @param callback
 * 
 * @returns callback(err, userResponse)
 */
exports.getUser = (userId, callback) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("drop-db");
        let query = {"_id": mongo.ObjectID(userId)};
        dbo.collection("users").find(query).toArray(function(err, res) {
            db.close();
            if (err) return callback(err);
            
            return callback(err, res);
        });
    });
}

/**
 * Return the leaderboard in descending order
 * @param inf bool  get infinite high score or timed highscore
 * @param callback
 * 
 * @returns callback(err, queryResponse) 
 */
exports.getLeaderboard = (inf = false, callback) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("drop-db");
        let decendingHighscores;
        if (!inf) {
            decendingHighscores = {highscore: -1};
        }
        else {
            decendingHighscores = {infHighscore: -1};
        }
        dbo.collection("users").find().sort(decendingHighscores).toArray(function(err, res) {
            db.close();
            if (err) return callback(err);
            return callback(err, res);
        });
    });
}

/**
 * Update a highscore
 * @param userId ObjectID
 * @param newHighscore highscore to be updated
 * @param userAgent string from the user agent description
 * @param inf bool infinite score or not?
 * @param callback
 * 
 * @returns callback(err, successResponse)
 */
exports.updateHighscore = (userId, newHighscore, userAgent, inf = false, callback) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("drop-db");
        let query = {"_id": mongo.ObjectID(userId)};
        let updateObj = {userAgentString: userAgent};
        if (!inf) {
            updateObj.highscore = newHighscore;
        }
        else {
            updateObj.infHighscore = newHighscore;
        }
        let update = { $set: updateObj };
        dbo.collection("users").updateOne(query, update, (err, res) => {
            db.close();
            if (err) return callback(err);
            return callback(err, res);
        });
    });
}