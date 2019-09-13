"use strict";

const request = require('supertest');
const app = require('../src/app');
const util = require('../src/util');
const fs = require('fs');

const cred = JSON.parse(fs.readFileSync('credential.json'));
const testUser = cred.test.user;
const testPwd = cred.test.pwd;

let userId, server, agent;

beforeEach((done) => {
    server = app.listen(4000, (err) => {
      if (err) return done(err);

       agent = request.agent(server); // since the application is already listening, it should use the allocated port
       done();
    });
});

afterEach((done) => {
    return server && server.close(done);
});

describe('Testing the timestamp endpoint', () => {
    test('It should respond to the GET method with 200 status', async () => {
        const response = await agent.get('/timestamp');
        expect(response.statusCode).toBe(200);
    });
});

describe('Testing the insert user endpoint', () => {
    test('It should respond to the POST method with 200 status', async ()=> {
        expect.assertions(1);
        await agent.post('/user')
        .send({username: testUser, password: testPwd})
        .set('Accept', 'application/json')
        .then((res) => {
            if (res.error != false) {
                console.log(res.error);
            }
            expect(res.statusCode).toBe(200);
        }, (rej) => {
            expect(rej.statusCode).toBe(500);
        });
    });
});

describe('Testing the login endpoint', ()=> {
    test('It should respond with json and 200 status', async ()=> {
        expect.assertions(1);
        await agent.post('/login')
        .send({username: testUser, password: testPwd})
        .set('Accept', 'application/json')
        .then((res) => {
            if (res.error != false) {
                console.log(res.error);
            }
            else {
                userId = res.body.id;
            }
            expect(res.statusCode).toBe(200);
        }, (rej) => {
            expect(rej.statusCode).toBe(500);
        })
    });
});

describe('Testing the get user endpoint', () => {
    test('It should respond to the GET method with 200 status', async () => {
        expect.assertions(1);
        await agent.get('/user?id=' + userId)
        .then((res) => {
            if (res.error != false) {
                console.log(res.error);
            }
            expect(res.statusCode).toBe(200);
        }, (rej) => {
            expect(rej.statusCode).toBe(500);
        });
    });
});

describe('Testing the delete endpoint', ()=> {
    test('It should respond with json and 200 status', async ()=> {
        expect.assertions(1);
        await agent.delete('/user')
        .send({id: userId})
        .set('Accept', 'application/json')
        .then((res) => {
            if (res.error != false) {
                console.log(res.error);
            }
            console.log("deleted test user: " + res.body.success)
            expect(res.statusCode).toBe(200);
        }, (rej) => {
            expect(rej.statusCode).toBe(500);
        });
    });
});

describe('Test the date function', () => {
    test('It should return the date in UTC in ISO 8601 format', () => {
        const date = util.isoTimestamp();
        //Regex should match the ISO 8601 for datetime without milliseconds.  I think the regex can be improved.  We're assuming it's a valid timestamp.
        const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/;
        expect(date.timestamp).toMatch(isoRegex);
    });
});