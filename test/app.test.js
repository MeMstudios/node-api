const request = require('supertest');
const app = require('../src/app');
const util = require('../src/util');

expect.extend({
    toMatchISOregex(timestamp) {
        //Regex should match the ISO 8601 for datetime without milliseconds
        const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/;
        const pass = isoRegex.test(timestamp);

        if (pass) {
            return {
              message: () =>
                `${timestamp} is in ISO 8601 format!`,
              pass: true,
            };
          } 
          else {
            return {
              message: () =>
                `expected ${timestamp} to be in ISO 8601 format.  If it is, check the regex.`,
              pass: false,
            };
        }
    }
});

describe('Testing the timestamp endpoint', () => {
    test('It should responsed to the GET method with 200 status', async () => {
        const response = await request(app).get('/timestamp');
        expect(response.statusCode).toBe(200);
    });
});

describe('Test the date function', () => {
    test('It should return the date in UTC in ISO 8601 format', () => {
        const date = util.isoTimestamp();
        expect(date.timestamp).toMatchISOregex();
    });
});