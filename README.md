# Node.js API with Express
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
You should see the two tests pass.  
One tests the endpoint is responding,  
the other tests the actual datetime function.

Description
---
This is a skeleton structure for a REST API.  
The server and app files are split up so you can test app without running the server.  
Add more utility functions to util.js and more endpoints to app.js.  
I would eventually split them into two test suites.  
Next step would be adding database access.
