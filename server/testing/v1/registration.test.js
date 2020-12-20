const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const mongoose = require('mongoose');
const app = require('./app.js');
const User = require('./models/userScheme');
const registration = require('./registration.js');
const validIdNotReal = '5fd26394d14fa1313cd5f8ac';
const validId = '5fd4de283477970b68d9bee8';

// Moking User.find method
let userSpy;
const fakeMail = makemail(5);
const fakeId = new mongoose.Types.ObjectId();

function makemail(length) {            //creo una mail random
  var result           = '';
  var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789.';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

beforeAll( async () => {
  //fakeMail = makemail(5);
  userSpy = jest.spyOn(User, 'find').mockImplementation((criterias) => {
    return [{
      _id: fakeId,
      username: 'fakeUser',
      email: fakeMail + '@fake.mail',
      password: 'pass'
    }];
  });
  jest.setTimeout(8000);
  jest.unmock('mongoose');
  connection = await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Database connected!');
});

afterAll(async () => {
  userSpy.mockRestore();
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


test('Registration module should be defined', () => {
  expect(registration).toBeDefined();
});


describe('POST /signup', function() {
  
  test('responds with json and 201, user created', function() {
    return request(app)
      .post('/user/signup')
      .send({
        _id: fakeId,
        username: 'fakeUser',
        email: fakeMail + '@mail.com',
        password: 'pswFake'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201).expect({message : 'User created'})
  });

  test('responds with 500 error, no parameters sent', function() {
    return request(app)
      .post('/user/signup')
      .set('Accept', 'application/json')
      .expect(500)
  });

  test('responds with 422 error, user already exists', function() {
    return request(app)
      .post('/user/signup')
      .send({
        _id: fakeId,
        username: 'fakeUser',
        email: 'roberto@gmail.com',
        password: 'pswFake'
      })
      .set('Accept', 'application/json')
      .expect(422)
  });

});

/*describe('GET /user/registration initial', () => {
  test('GET / should return 200, users found', () => {
      return request(app)
          .get('/user')
          .expect('Content-Type', /json/)
          .expect(200);
  });
});*/

describe('POST /login', function() {
  test('Already existent email and correct password responds with 200, auth SUCCESS', function() {
    return request(app)
      .post('/user/login')
      .send({
        email: fakeMail + '@mail.com',
        password: 'pswFake'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200) 
  });

  test('Not existent email responds with 401, auth FAILED', function() {
    return request(app)
      .post('/user/login')
      .send({
        email: 'ayayay@fake.mail',
        password: 'pass'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401) 
  });

  test('No email sent responds with 500 error, auth FAILED', function() {
    return request(app)
      .post('/user/login')
      .send({
        email: '',
        password: 'pass'
      })
      .set('Accept', 'application/json')
      .expect(500).expect({message : 'No email sent'})
  });

  test('No password sent responds with 500 error, auth FAILED', function() {
    return request(app)
      .post('/user/login')
      .send({
        email: fakeMail + '@mail.com',
        password: ''
      })
      .set('Accept', 'application/json')
      .expect(500).expect({message : 'No password sent'})
  });

  /*it('responds with 500 error, no user exists with this email', function() {
    request(registration)
      .post('/login')
      .send({ email: 'nuovamail@mail.it'})
      .set('Accept', 'application/json')
      .expect(500)
  });*/
})

describe('DELETE user/:id', function() {
  test('responds with json and 201, user deleted', function() {
    return request(app)
      .delete('/user/' + fakeId)
      .send({ _id: fakeId})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
  });

  test('responds with 404 error, no id specified', function() {
    return request(app)
      .delete('/user')
      .send() 
      .set('Accept', 'application/json')
      .expect(404)
  });

})