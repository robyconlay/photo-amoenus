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

const agent = request.agent(app);

const email = 'mazzalairob@gmail.com';
const password = 'FyEJv5WR';

describe('account creation', () => {
    test('POST api/signup/ should return 200', () => {
        return agent
            .post('/api/signup/')
            .send({
                email,
                password
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('set-cookie', 'token=' + /\d/)
            .expect('set-cookie', 'uid=' + /\d/);
    });

    test('POST api/login/ should return 200', () => {
        return request(app)
            .post('/api/login/')
            .expect('Content-Type', /json/)
            .expect(200);
    });
});
