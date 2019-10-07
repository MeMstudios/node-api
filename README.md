# Node.js REST API for [dropgame.io](https://dropgame.io)
Requirements
---
Updated Node.js, NPM, and MongoDB

Usage
---
Clone and cd into the repo.  
You need a credential.json file in the root directory to connect to a mongodb  
run `npm install`  
run `node server.js`  
visit localhost:3000/timestamp in the browser.

Tests
---
Run the test suite with Jest: `npm run test`  
The server and app files are split up so you can test app without running the server.  
Supertest starts up a server on port 4000 (instead of 3000)  
We test the lifecycle of the user: Create, login, read the user data, and delete the user.  
The leaderboard tests update the test users score to 1000, then test the get leaderboard function, before deleting the test user.  
This covers the functions in util and db.  

Description
---
This is the REST API for my game at [dropgame.io](https://dropgame.io)  
It handles simple user signup/login with functions to update highscores and return the top ten scores as a leaderboard.  
