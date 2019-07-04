"use strict"; //for safer JavaScript

const app = require('./src/app');

//Start the express server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});