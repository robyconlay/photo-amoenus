const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const locations     = require('./locations');
const mongoose = require('mongoose');
//const Location = require('./models/locationScheme');
const app = require('./app.js');
const validId = '5fc7c867a38bb10cc8921b2a';
const validNotRealId = '5fc7c867a38bb10cc8921baa';
const invalidId = '5fc7c867a38bb10cc8921b';


let connection;

beforeAll(async () => {
  jest.setTimeout(8000);
  jest.unmock('mongoose');
  connection = await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Database connected!');
});

afterAll(() => {
  mongoose.connection.close(true);
  console.log("Database connection closed");
});

// create a valid token
var token = jwt.sign({
  username: 'fratm',
  email: "rob@gmail.com",
  password: "1234"
},
  process.env.JWT_KEY,
  { expiresIn: 86400 }
);


describe('GET /lib/checkReports initial', () => {
    test('GET / should return 200', () => {
        return request(app)
            .get('/checkReports')
            .expect('Content-Type', /json/)
            .expect(200);
    });
});

describe('GET /lib/checkReports/:repId', () => {
  test('GET /:validId should return 200', () => {
      return request(app)
          .get('/checkReports/'+validId)
          .send({
            repId: validId
          }) 
          .expect('Content-Type', /json/)
          .expect(200);
  });

  test('GET /:validIdNotReal should return 404, valid entry but no locations with this ID', () => {
    return request(app)
        .get('/checkReports/'+validNotRealId)
        .send({
          repId: validNotRealId
        }) 
        .expect('Content-Type', /json/)
        .expect(404).expect({
          message: 'Valid entry but no locations with this ID'
        });
  });

  test('GET /:invalidId should return 500, no valid entry', () => {
    return request(app)
        .get('/checkReports/'+invalidId)
        .send({
          repId: invalidId
        }) 
        .expect('Content-Type', /json/)
        .expect(500);
  });

});
  