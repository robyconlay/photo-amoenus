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
  //jest.setTimeout(8000);
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

  //jest.unmock('mongoose');
  //connection = await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  //console.log('Database connected!');
});

afterAll(() => {
  User.findOne({ email: 'rob@gmail.com' })
  .exec()
  .then(data => {
    //console.log("Nostro id è: " + data._id)
      return request(app)
          .delete('/user/' + data._id)
          .send({_id: data._id});
  })
  .catch(err => console.log(err));

  //mongoose.connection.close(true);
  //console.log("Database connection closed");
});

// create a valid token
/*var token = jwt.sign({
  username: 'fratm',
  email: "rob@gmail.com",
  password: "1234"
},
  process.env.JWT_KEY,
  { expiresIn: 86400 }
);*/

test('Locations module should be defined', () => {
  expect(locations).toBeDefined();
});

describe('POST locations/', function() {
  /*test('POST locations/ with correct parameters should responds with json and 201, location created', function() {
    return request(app)
      .post('/locations')
      .send({
        //_id: new  mongoose.Types.ObjectId,
        name: 'Nothing',
        address: 'Nowhere',
        city: 'Idk',
        description: 'null',
        locationImage: 'uploads\\2020-12-6-1607268512678lemure-e1435405671562.jpg',      //array of IDs, with every id identifying an image
        category: 'Fantasy', 
        likes: 0,
        raggiungibilita: 'Piedi',
        photoDesc: 'NoPhDesc',
        hour: 'NoHour',
        date: 'NoDate'
      })
      .set({ Authorization: "Bearer " + token })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
  });*/

  test('POST locations/ with no authentication should responds with 401 error', function() {
    return request(app)
      .post('/locations')
      .send()
      .set('Accept', 'application/json')
      .expect(401)
  });
}); 

describe('GET /lib/locations initial', () => {
  test('GET / should return 200', () => {
      return request(app)
          .get('/locations')
          .expect('Content-Type', /json/)
          .expect(200);
  });
});

describe('GET /lib/locations/:locationId', function() {
  test('GET /validId responds with 200 json', function() {
    return request(app)
      .get('/locations/'+ locationId)
      .expect('Content-Type', /json/)
      .expect(200);
  });
  test('GET /invalidId responds with 404 error, no valid entry', function() {
    return request(app)
      .get('/locations/invalidId000')
      .expect(404).expect({"message": 'No valid entry'});
  });
  test('GET /null responds with 500 error, null location Id', function() {
    return request(app)
      .get('/locations/'+'null')
      .expect(500);
  });
});


describe('PATCH locations/:validId', function() {
  test('PATCH /validId responds with 200 and json', function() {
    return request(app)
      .patch('/locations/'+ locationId)
      .send({
        locationId: locationId
      })
      .expect('Content-Type', /json/)
      .expect(200);
  });

  test('PATCH /invalidId responds with error 500 and json', function() {
    return request(app)
      .patch('/locations/'+ 'invalidId')
      .send()
      .expect('Content-Type', /json/)
      .expect(500);
  });

  test('PATCH / with no parameters sent responds with error 404 not found', function() {
    return request(app)
      .patch('/locations/')
      .send()
      .expect(404);
  });
});

describe('DELETE locations/:locationId', function() {
  /*test('DELETE locations/:validId should responds with 200 and json', function() {    //funziona ma elimina esistente!
    return request(app)
      .delete('/locations/'+ locationId)
      .send()
      .set('Accept', 'application/json')
      .expect(200).expect({message: 'Location and image deleted'})
  });*/

  test('DELETE locations/:invalidId should responds with 404 and json', function() {    //funziona ma elimina esistente!
    return request(app)
      .delete('/locations/'+ 'invalidId')
      .send()
      .set('Accept', 'application/json')
      .expect(404);
  });

  test('DELETE locations/ should responds with error 404 not found', function() {
    return request(app)
      .delete('/locations/')
      .send()
      .set('Accept', 'application/json')
      .expect(404)
  });
});