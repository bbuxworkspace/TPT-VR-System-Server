const request = require('supertest');
const { expect } = require('chai');
const app = require('../server'); // Adjust path as necessary to your Express app
const User = require('../server/models/user');
const { signAccessToken, signRefreshToken } = require('../server/utils/jwtUtils');



describe('Authentication and User Management', function () {

  

    after(async function () {
        // Cleanup test data
        await User.deleteMany({});
    });

    // Test signup
    describe('POST /api/v1/auth/signup', function () {

        it('should create a new user successfully', async function () {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User',
                    username: 'testuser',
                    password: 'testpassword'
                })
                .expect(200);

            expect(response.body.message).to.equal('Account created successfully');


            
        });

        it('should return an error for existing username', async function () {

            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Another User',
                    username: 'testuser',
                    password: 'newpassword'
                })
                .expect(401);

            expect(response.body.message).to.equal('User Already Exists');
        });

        it('should return an error for a short username', async function () {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Short User',
                    username: 'sh',
                    password: 'shortuser'
                })
                .expect(422);
    
            expect(response.body.message).to.equal('"username" length must be at least 3 characters long');
        });
    


        it('should return an error for missing fields', async function () {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User',
                    username: 'testuser'
                })
                .expect(422);
            expect(response.body.message).to.equal('"password" is required');
        });

        
        it('should return an error for a weak password', async function () {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Weakpassword User',
                    username: 'weakpassuser',
                    password: '123'
                })
                .expect(422);

            expect(response.body.message).to.equal('"password" length must be at least 6 characters long');
        });


        after(async function () {
            // Cleanup test data
            await User.deleteMany({});
        });


    });


    // Test login
    describe('POST /api/v1/auth/login', function () {


        before(async function () {

            const response = await request(app)
            .post('/api/v1/auth/signup')
            .send({
                name: 'Login User',
                username: 'loginuser',
                password: 'loginpassword'
            })
            .expect(200);
    
            expect(response.body.message).to.equal('Account created successfully');
    
        });
    

        it('should login and return a refresh token cookie', async function () {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'loginuser',
                    password: 'loginpassword'
                })
                .expect(200);

            // Extract refreshToken from cookies
            refreshTokenCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('refreshToken='));
            expect(refreshTokenCookie).to.be.a('string');
        });
    });


    describe('Refresh Token', function () {
        let refreshToken;
        let accessToken;
    
        before(async function () {
            // Signup to create a new user
            await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Refresh Token User',
                    username: 'tokenuser',
                    password: 'tokenpassword'
                })
                .expect(200);
    
            // Login to get refreshToken
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'tokenuser',
                    password: 'tokenpassword'
                })
                .expect(200);
    
            refreshToken = loginResponse.headers['set-cookie'].find(cookie => cookie.startsWith('refreshToken='));

            expect(refreshToken).to.be.a('string');
        });
    
        it('should return a new access token with a valid refresh token', async function () {
            const response = await request(app)
                .post('/api/v1/auth/refresh-token')
                .set('Cookie', refreshToken)
                .expect(200);
    
            accessToken = response.body.accessToken;
            expect(response.body.message).to.equal('Access token sent successfully');
            expect(accessToken).to.be.a('string');
        });
    
        it('should return an error for an invalid user', async function () {
            // Simulate an expired or invalid refresh token
            const invalidRefreshToken = 'refreshToken=s%3AeyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmNiMmIxMmE1ZjA2MjQwOWQ1MmQwNGMiLCJyb2xlIjoiY2xpZW50IiwiaWF0IjoxNzI0NTkwODY3LCJleHAiOjE3NDAxNDI4Njd9.k8bN1Ab67posJFG3owE2nKxHmiUc8tycQNQ8mzaEWpqz9_U3ZB-QXSgjeIAWP4zfuGvCCurLo2I3EOq8xHNb5A.wvJlETH5xp3jDKNkJRHETCfjcAk2FiCYbz0ZBUr3E1w; Max-Age=15552000; Path=api/v1/auth; Expires=Fri, 21 Feb 2025 13:01:07 GMT; HttpOnly; Secure';
        
            const response = await request(app)
                .post('/api/v1/auth/refresh-token')
                .set('Cookie', invalidRefreshToken)
                .expect(401);
        
            expect(response.body.message).to.equal('Invalid user');
        });

        it('should return an error when no refresh token is provided', async function () {
            const response = await request(app)
                .post('/api/v1/auth/refresh-token')
                .expect(401);
    
            expect(response.body.message).to.equal('Refresh token is not provided');
        });

        it('should return an error for a malformed refresh token', async function () {
            const malformedToken = 'malformed_token';
    
            const response = await request(app)
                .post('/api/v1/auth/refresh-token')
                .set('Cookie', `refreshToken=${malformedToken}`)
                .expect(401);
    
            expect(response.body.message).to.equal('Refresh token is not provided');
        });
    
        after(async function () {
            // Cleanup test data
            await User.deleteMany({});
        });
    });




    describe('Logout', function () {
        let refreshToken;
        let accessToken;
    
        before(async function () {
            // Signup to create a new user
            await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Logout User',
                    username: 'logoutuser',
                    password: 'logoutpassword'
                })
                .expect(200);
    
            // Login to get refreshToken
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'logoutuser',
                    password: 'logoutpassword'
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

    
        it('should logout successfully', async function () {
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Cookie', refreshToken)
                .expect(200);
    
            expect(response.body.message).to.equal('Logout successfully');
    
            // Verify that the refresh token is no longer valid
            const logoutCheckResponse = await request(app)
                .post('/api/v1/auth/refresh-token')
                .set('Cookie', refreshToken)
                .expect(401);
    
            expect(logoutCheckResponse.body.message).to.equal('Refresh token is invalid or expired');
        });
    
        after(async function () {
            // Cleanup test data
            await User.deleteMany({});
        });
    });
    

    describe('Reset Password', function () {
        let refreshToken;
        let accessToken;
    
        before(async function () {
            // Signup to create a new user
            await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Reset User',
                    username: 'resetuser',
                    password: 'oldpassword'
                })
                .expect(200);
    
            // Login to get refreshToken
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'resetuser',
                    password: 'oldpassword'
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

    
        it('should reset the password successfully', async function () {
            const response = await request(app)
                .post('/api/v1/auth/reset-password')
                .set('Authorization', accessToken)
                .send({
                    username: 'resetuser',
                    newPassword: 'newpassword'
                })
                .expect(200);
    
            expect(response.body.message).to.equal('Password reset successfully');
        });

        

        after(async function () {
            // Cleanup test data
            await User.deleteMany({});
        });
    
        
    });


     // Test delete user
     describe('DELETE /api/v1/auth/delete', function () {

        let refreshToken;
        let accessToken;

        before(async function () {

            const response = await request(app)
            .post('/api/v1/auth/signup')
            .send({
                name: 'Delete User',
                username: 'deleteuser',
                password: 'deletepassword'
            })
            .expect(200);
    
            expect(response.body.message).to.equal('Account created successfully');

            // Login to get refreshToken
            const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
            username: 'deleteuser',
            password: 'deletepassword'
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

        it('should delete the user successfully', async function () {
            const response = await request(app)
                .delete('/api/v1/auth/delete')
                .set('Authorization', accessToken)
                .expect(200);

            expect(response.body.message).to.equal('User deleted successfully');
        });

        it('should return an error if an invalid token is used', async function () {
            const invalidToken = 'invalid_access_token';
    
            const response = await request(app)
                .delete('/api/v1/auth/delete')
                .set('Authorization', `Bearer ${invalidToken}`)
                .expect(401);
    
            expect(response.body.message).to.equal('jwt malformed');
        });
    });


});


