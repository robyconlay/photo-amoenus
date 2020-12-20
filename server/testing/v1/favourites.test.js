const request = require('supertest');
const app = require('./app.js')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require("./models/userScheme");
const Location = require('./models/locationScheme');

var token = undefined;
var locationId = undefined;


/**
 * create user, get token and a random location
 */
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

/**
 * delete user
 */
afterAll(async () => {

    User.findOne({ email: 'rob@gmail.com' })
        .exec()
        .then(data => {
            return request(app)
                .delete('/user/' + data._id);
        })
        .catch(err => console.log(err));

});


describe('GET /lib/favourite initial', () => {

    test('GET /all should return 200', () => {
        return request(app)
            .get('/lib/favourites/all')
            .expect('Content-Type', /json/)
            .expect(200);
    });

    test('GET with token of user with no favourites should return 404', () => {
        return request(app)
            .get('/lib/favourites')
            .set({ 'Authorization' : "Bearer " + token })
            .expect('Content-Type', /json/)
            .expect(404);
    });

    test('GET without token should return 401', () => {
        return request(app)
            .get('/lib/favourites')
            .expect('Content-Type', /json/)
            .expect(401, { message: 'Auth failed' });
    });
});

describe('add favourites and get them', () => {

    test('/add/:id should return 200', () => {
        return request(app)
            .patch('/lib/favourites/add/' + locationId)
            .set({ 'Authorization' : "Bearer " + token })
            .expect('Content-Type', /json/)
            .expect(200, { message: "Favourite added with success" });
    });

    test('/add/:id of location already in user\'s favourites should return 409', () => {
        return request(app)
            .patch('/lib/favourites/add/' + locationId)
            .set({ 'Authorization' : "Bearer " + token })
            .expect('Content-Type', /json/)
            .expect(409, { message: "Location is already in user's favourites" });
    });

    test('GET with token and user has faourites should return 200', () => {
        return request(app)
            .get('/lib/favourites')
            .set({ 'Authorization' : "Bearer " + token })
            .expect('Content-Type', /json/)
            .expect(200);
    });

});

describe('remove favourites', () => {

    test('/remove/:id should return 200', () => {
        return request(app)
            .patch('/lib/favourites/remove/' + locationId)
            .set({ 'Authorization' : "Bearer " + token })
            .expect('Content-Type', /json/)
            .expect(200, { message: 'Favourite deleted for user' });
    });

    test('/remove/:id of location already deleted from user\'s favourites should return 200', () => {
        return request(app)
            .patch('/lib/favourites/remove/' + locationId)
            .set({ 'Authorization' : "Bearer " + token })
            .expect('Content-Type', /json/)
            .expect(200, { message: 'Favourite deleted for user' });
    });

    test('DELETE with token should return 200', () => {
        return request(app)
            .delete('/lib/favourites/')
            .set({ 'Authorization' : "Bearer " + token })
            .expect('Content-Type', /json/)
            .expect(200, { message: 'All favourite of a user deleted' });
    });
});


