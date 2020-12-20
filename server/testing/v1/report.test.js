const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const locations     = require('./locations');
const mongoose = require('mongoose');
const Location = require('./models/locationScheme');
const app = require('./app.js');
const validIdNotReal = '5fd26394d14fa1313cd5f8ac';
const validId = '5fd24aae03e38c555035b0e7';
const User = require("./models/userScheme");
var token = undefined;
var locationId = undefined;

let connection;

beforeAll(async () => {

    await request(app)
      .post('/user/signup')
      .send({
        username: 'fratm',
        email: 'rob@gmail.com',
        password: '1234'
      })
      .set('Accept', 'application/json');
  
    await request(app)
      .post('/user/login')
      .send({
        email: 'rob@gmail.com',
        password: '1234'
      })
      .set('Accept', 'application/json')
      .then(res => {
        token = res.body.token;
      });
  
    await Location.find()
      .select('_id')
      .exec()
      .then(data => {
        locationId = data[Math.floor(Math.random() * data.length)]._id;
      })
      .catch(err => console.log(err));
    console.log(`locationID: ${locationId} \ntoken: ${token}`)
});
  
  afterAll(() => {
    User.findOne({ email: 'rob@gmail.com' })
    .exec()
    .then(data => {
        return request(app)
            .delete('/user/' + data._id)
            .send({_id: data._id});
    })
    .catch(err => console.log(err));
  });

  describe('POST report/', function() {
    test('POST report/ with correct parameters should responds with json and 201, report created', function() {
      return request(app)
        .post('/report')
        .send({
          email: 'rob@gmail.com',
          report: 'Inappropriate picture',
          id_picture: '5fd62c4ea76b2b10e404d8f3'
        })
        .set({ 'Authorization': "Bearer " + token })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201).expect({ message : 'Report created'})
    });

    test('POST report/ with no parameters should responds with json and 500', function() {
        return request(app)
          .post('/report')
          .send()
          .set({ 'Authorization': "Bearer " + token })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(500)
      });
  
    test('POST report/ with no authentication should responds with 401 error', function() {
      return request(app)
        .post('/report')
        .send()
        .set('Accept', 'application/json')
        .expect(401)
    });
  }); 