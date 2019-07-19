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
    dbURL = 'drop.memstudios.com'
}

let url = "mongodb://" + mongoUser + ":" + mongoPwd + "@" + dbURL + ":27017/drop-db";


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

exports.getUser = (userId, callback) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("drop-db");
        let query = {"_id": mongo.ObjectID(userId)}
        dbo.collection("users").find(query).toArray(function(err, res) {
            db.close();
            if (err) return callback(err);
            
            return callback(err, res);
        });
    });
}

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

exports.updateHighscore = (userId, newHighscore, inf = false, callback) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("drop-db");
        let query = {"_id": mongo.ObjectID(userId)};
        let update;
        if (!inf) {
            update = { $set: {highscore: newHighscore}};
        }
        else {
            update = { $set: {infHighscore: newHighscore}};
        }
        dbo.collection("users").updateOne(query, update, (err, res) => {
            db.close();
            if (err) return callback(err);
            return callback(err, res);
        });
    });
}