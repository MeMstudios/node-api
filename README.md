# Node.js REST API for dropgame.io
Requirements
---
Updated Node.js and NPM

Usage
---
Clone and cd into the repo.  
run `npm install`  
run `node server.js`  
visit localhost:3000/timestamp in the browser.

Tests
---
Run the test suite with Jest: `npm run test`  
The server and app files are split up so you can test app without running the server.  
Supertest starts up a server on port 4000 (instead of 3000)  
We test the lifecycle of the user: Create, login, read the user data, and delete the user  
This covers most of the functions in util and db.  
The only tests left to write are for the leaderboard endpoints.

Description
---
This is the REST API for my game at [https://dropgame.io]dropgame.io.  
It handles simple user signup/login with functions to update highscores and return the top ten scores as a leaderboard.  
