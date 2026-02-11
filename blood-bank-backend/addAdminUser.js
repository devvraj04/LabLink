require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// User Schema (simplified for script usage)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    createdAt: { type: Date, default: Date.now },
});

// Check if model is already compiled to avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Create new admin user
const createAdminUser = async () => {
    try {
        await connectDB();

        const email = 'admin@bloodbank.com';
        const password = 'admin123';
        const name = 'Admin User';

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (existingUser) {
            console.log('\n⚠️  User already exists!');
            console.log('📧 Email:', email);
            console.log('\nUpdating password to: admin123\n');

            // Update password and ensure role is manager
            await User.updateOne({ email }, { $set: { password: hashedPassword, role: 'manager' } });

            console.log('✅ Password and role updated successfully!\n');
        } else {
            // Create new admin user
            const newUser = await User.create({
                name: name,
                email: email,
                password: hashedPassword,
                role: 'manager'
            });

            console.log('\n✅ Admin user created successfully!');
            console.log('\n👤 Name:', name);
            console.log('📧 Email:', email);
            console.log('🔑 Password: admin123');
            console.log('👔 Role: manager');
        }

        console.log('\nYou can now login with these credentials.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdminUser();
