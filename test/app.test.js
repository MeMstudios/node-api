"use strict";

const request = require('supertest');
const app = require('../src/app');
const util = require('../src/util');

describe('Testing the timestamp endpoint', () => {
    test('It should respond to the GET method with 200 status', async () => {
        const response = await request(app).get('/timestamp');
        expect(response.statusCode).toBe(200);
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