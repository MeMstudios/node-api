var bcrypt = require('bcrypt');

//Utility functions

/**
 * Returns timestamp object in ISO 8601 format with no milliseconds.
 */
exports.isoTimestamp = () => {
    const date = new Date();
    //Remove the milliseconds and add +00:00 instead of Z.
    const timestampObject = {timestamp: date.toISOString().split('.')[0] + "+00:00"};
    return timestampObject;
}

/**
 * encrypt password
 */
exports.cryptPassword = (password, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
     if (err)
       return callback(err);
 
     bcrypt.hash(password, salt, (err, hash) => {
       return callback(err, hash);
     });
   });
 };
 
 /**
  * check password against saved hash
  */
 exports.comparePassword = (plainPass, hashword, callback) => {
    bcrypt.compare(plainPass, hashword, (err, isPasswordMatch) => {
        return err == null ?
            callback(null, isPasswordMatch) :
            callback(err);
    });
 };