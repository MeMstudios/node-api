const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

let url = "mongodb://drop:2938woagjn2039tj@drop.memstudios.com:27017/drop-db";

let testuser = {username: "test", password: "test"};

exports.insertUser = (user, callback) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("drop-db");
        dbo.collection("users").insertOne(user, function(err, res) {
            if (err) return callback(err);
            
            db.close();
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
            if (err) return callback(err);
            
            db.close();
            return callback(err, res);
        });
    });
}

// this.insertUser(testuser, (err, res) => {
//     if (err) throw err;
//     else console.log(res);
// })

this.findUser("pos", (err, res) => {
    if (err) throw err;
    if (res[0] != undefined) {
        console.log(res[0].username);
    }
    else { console.log(res) }
})