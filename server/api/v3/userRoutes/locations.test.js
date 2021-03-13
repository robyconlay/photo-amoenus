const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server');

const request = require('supertest');

const app = require('../app.js');
// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer;
const opts = {}; // remove this option if you use mongoose 5 and above

beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, opts, (err) => {
        if (err) console.error(err);
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('methods with empty database', () => {
    test('GET /locations/ should return 200', () => {
        return request(app)
            .get('/locations/')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ message: "success retrieval of locations" })
            .expect((res) => {
                if (!res.body.locations) {
                    throw new Error("attribute locations missing in response");
                }
            });
    });
});

describe('create location and try things on it', () => {
    // test('POST /locations/ without user token should return 401', () => {
    //     return request(app)
    //         .post('/locations/')
    //         .expect('Content-Type', /json/)
    //         .expect(401)
    //         .expect({ message: "success retrieval of locations" });
    // });

    // test('POST /locations/ with user token but missing parameters should return 500', () => {
    //     return request(app)
    //         .post('/locations/')
    //         .expect('Content-Type', /json/)
    //         .expect(500)
    //         .expect({ message: "Some information is missing" });
    // });

    // test('POST /locations/ with user token and parameters but invalid uid should return 500', () => {
    //     return request(app)
    //         .post('/locations/')
    //         .expect('Content-Type', /json/)
    //         .expect(500)
    //         .expect({ message: "Some information is missing" });
    // });

    // test('POST /locations/ with user token and parameters should return 201', () => {});
    // test('POST /locations/ with duplicate location should return 409', () => {});
    // test('POST /locations/ with duplicate location attributes should return 409', () => {});
    // test('PATCH /locations/ with invalid location id should return 500', () => {});
    // test('PATCH /locations/ with invalid options should return 500', () => {});
    // test('PATCH /locations/ should return 200', () => {});
    // test('DELETE /locations/ with invalid location id should return 200', () => {});
    // test('DELETE /locations/ with valid but not in database location id should return 200', () => {});
    // test('DELETE /locations/ image should return 200', () => {});
});