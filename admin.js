const mongoose = require('mongoose');
const { hashPassword } = require('./server/utils/hashPassword');
const { signRefreshToken } = require('./server/utils/jwtUtils');
const User = require('./server/models/user');
require('dotenv').config(); // Load environment variables


const { DATABASE_URL, DATABASE_NAME, ADMIN_NAME, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;


// Create an admin user
const createAdmin = async () => {

    // Connect to MongoDB

    mongoose.connect(DATABASE_URL, {
            dbName: DATABASE_NAME,
            // user: MONGODB_USERNAME,
            // pass: MONGODB_PASSWORD
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
    

    try {

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Hash the admin password
        const { hash, salt } = await hashPassword(ADMIN_PASSWORD);

        // Create the admin user
        const newAdmin = new User({
            name: ADMIN_NAME,
            username: ADMIN_USERNAME,
            hash,
            salt,
            role: 'admin'
        });

        const createdAdmin = await newAdmin.save();

        // Create Refresh Token
        const refreshToken = await signRefreshToken({ userId: createdAdmin._id, role: createdAdmin.role }, '180d');

        // Push refresh token to sessions in user object
        await User.findOneAndUpdate({ _id: createdAdmin._id }, { $push: { sessions: refreshToken } });

        console.log('Admin user created successfully');
        console.log(`Admin Refresh Token: ${refreshToken}`);

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close(); // Close the database connection
    }
};

// Execute the function
createAdmin();
