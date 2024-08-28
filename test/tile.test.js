const request = require('supertest');
const { expect } = require('chai');
const app = require('../server'); // Adjust the path if necessary
const User = require('../server/models/user'); // Adjust the path if necessary
const Tile = require('../server/models/tile'); // Adjust the path if necessary
require('dotenv').config();

const { ADMIN_NAME, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;


describe('Tile Routes', () => {
    let tileId;
    let refreshToken;
    let accessToken;

    before(async function () {

        await User.deleteMany({});
        await Tile.deleteMany({});

         // Signup to create a new user
         await request(app)
         .post('/api/v1/auth/create-admin')
         .send({
             name: ADMIN_NAME,
             username: ADMIN_USERNAME,
             password: ADMIN_PASSWORD
         })
         .expect(200);

        // Login to get refreshToken
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD
            })
            .expect(200);

        refreshToken = loginResponse.headers['set-cookie'].find(cookie => cookie.startsWith('refreshToken='));
        expect(refreshToken).to.be.a('string');

        // Refresh token to get a new accessToken
        const refreshTokenResponse = await request(app)
            .post('/api/v1/auth/refresh-token')
            .set('Cookie', refreshToken)
            .expect(200);

        accessToken = refreshTokenResponse.body.accessToken;
        expect(accessToken).to.be.a('string');

    });


    after(async function () {
        // Cleanup test data
        await Tile.deleteMany({});
    });

    // Test the POST /tile route (Create Tile)
    describe('POST /tile', () => {

        it('should create a new tile', (done) => {
            request(app)
                .post('/api/v1/tile/create')
                .set('Authorization', accessToken) // Replace with a valid token
                .send({
                    name: 'Ceramic Tile',
                    size: '30x30',
                    areaCoverage: 1.2,
                    price: 25.5,
                    category: 'Bathroom',
                    image: 'image1.jpg'
                })
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message').eql('Tile created successfully');
                    expect(res.body).to.have.property('tile').that.includes({
                        name: 'Ceramic Tile',
                        size: '30x30',
                        areaCoverage: 1.2,
                        price: 25.5,
                        category: 'Bathroom'
                    });
                    tileId = res.body.tile._id; // Save the ID for future tests
                    done();
                });
        });
    });

    // Test the GET /tile/:id route (Get One Tile)
    describe('GET /tile/:id', () => {
        it('should get a tile by ID', (done) => {
            request(app)
                .get(`/api/v1/tile/${tileId}`)
                .set('Authorization', accessToken) // Replace with a valid token
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message').eql('Tile details');
                    expect(res.body.tile).to.include({
                        name: 'Ceramic Tile',
                        size: '30x30',
                        areaCoverage: 1.2,
                        price: 25.5,
                        category: 'Bathroom'
                    });
                    done();
                });
        });

        it('should return 404 for a non-existing tile', (done) => {
            request(app)
                .get('/api/v1/tile/invalidid')
                .set('Authorization', accessToken) // Replace with a valid token
                .expect(404)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('error').eql('Tile not found');
                    done();
                });
        });
    });

    // Test the GET /tile route (Get All Tiles)
    describe('GET /tile', () => {
        it('should get all tiles', (done) => {
            request(app)
                .get('/api/v1/tile/getAll')
                .set('Authorization', accessToken) // Replace with a valid token
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message').eql('All tile details');
                    expect(res.body.tiles).to.be.an('object');
                    done();
                });
        });
    });

    // Test the PATCH /tile/:id route (Update Tile)
    describe('PATCH /tile/:id', () => {
        it('should update a tile by ID', (done) => {
            request(app)
                .patch(`/api/v1/tile/${tileId}`)
                .set('Authorization', accessToken) // Replace with a valid token
                .send({
                    name: 'Updated Ceramic Tile',
                    price: 30.0
                })
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message').eql('Tile updated successfully');
                    expect(res.body.tile).to.include({
                        name: 'Updated Ceramic Tile',
                        price: 30.0
                    });
                    done();
                });
        });

        it('should return 404 for a non-existing tile', (done) => {
            request(app)
                .patch('/api/v1/tile/invalidid')
                .set('Authorization', accessToken) // Replace with a valid token
                .send({
                    name: 'Updated Tile'
                })
                .expect(404)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('error').eql('Tile not found');
                    done();
                });
        });
    });

    // Test the DELETE /tile/:id route (Delete Tile)
    describe('DELETE /tile/:id', () => {
        it('should delete a tile by ID', (done) => {
            request(app)
                .delete(`/api/v1/tile/${tileId}`)
                .set('Authorization', accessToken) // Replace with a valid token
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message').eql('Tile deleted successfully');
                    done();
                });
        });

        it('should return 404 for a non-existing tile', (done) => {
            request(app)
                .delete('/api/v1/tile/invalidid')
                .set('Authorization', accessToken) // Replace with a valid token
                .expect(404)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('error').eql('Tile not found');
                    done();
                });
        });
    });
});
