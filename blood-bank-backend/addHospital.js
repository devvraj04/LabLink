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

// Hospital Schema (simplified for script usage)
const hospitalSchema = new mongoose.Schema({
    Hosp_Name: String,
    Hosp_Phone: String,
    name: String,
    phone: String,
    email: String,
    password: String,
    address: String,
    city: String,
    City_Id: mongoose.Schema.Types.Mixed,
    isApproved: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now },
    lastLogin: Date,
    type: { type: String, enum: ['general', 'specialized', 'emergency'], default: 'general' },
    capacity: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to sync fields
hospitalSchema.pre('save', function (next) {
    if (this.Hosp_Name) this.name = this.Hosp_Name;
    if (this.Hosp_Phone) this.phone = this.Hosp_Phone;
    if (this.name && !this.Hosp_Name) this.Hosp_Name = this.name;
    if (this.phone && !this.Hosp_Phone) this.Hosp_Phone = this.phone;
    next();
});

// Hash password before saving
hospitalSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
hospitalSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Check if model is already compiled to avoid OverwriteModelError
const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);

// Create hospital
const createHospital = async () => {
    try {
        await connectDB();

        const hospitalData = {
            Hosp_Name: 'Karuna Hospital',
            name: 'Karuna Hospital',
            email: 'admin@karuna.ac.in',
            password: 'admin123',
            Hosp_Phone: '022-1234567',
            phone: '022-1234567',
            address: 'Jeevan Bima Nagar, Borivali West, Mumbai',
            city: 'Mumbai',
            City_Id: 3, // Mumbai or relevant city ID
            type: 'general',
            capacity: 200,
            isApproved: true,
            registrationDate: new Date()
        };

        // Check if hospital already exists
        const existingHospital = await Hospital.findOne({ email: hospitalData.email });

        if (existingHospital) {
            console.log('\n⚠️  Hospital already exists!');
            console.log('🏥 Hospital Name:', existingHospital.Hosp_Name);
            console.log('📧 Email:', existingHospital.email);
            console.log('\nUpdating password to: admin123\n');

            // Update password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await Hospital.updateOne(
                { email: hospitalData.email },
                { $set: { password: hashedPassword, isApproved: true } }
            );

            console.log('✅ Password and approval status updated successfully!\n');
        } else {
            // Create new hospital
            const newHospital = await Hospital.create(hospitalData);

            console.log('\n✅ Hospital created successfully!');
            console.log('\n🏥 Hospital Name:', newHospital.Hosp_Name);
            console.log('📧 Email:', newHospital.email);
            console.log('🔑 Password: admin123');
            console.log('📍 Address:', newHospital.address);
            console.log('✔️  Status: Approved & Ready to Login');
        }

        console.log('\nYou can now login with these credentials.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createHospital();
