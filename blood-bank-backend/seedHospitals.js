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

const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);

const hospitals = [
    {
        Hosp_Name: 'Sassoon General Hospital',
        email: 'sassoon@hospital.com',
        password: 'hospital123',
        Hosp_Phone: '020-26128000',
        address: 'Near Pune Station, Pune',
        city: 'Pune',
        City_Id: 1,
        type: 'general',
        capacity: 1200,
        isApproved: true,
    },
    {
        Hosp_Name: 'Ruby Hall Clinic',
        email: 'ruby@hospital.com',
        password: 'hospital123',
        Hosp_Phone: '020-66455300',
        address: '40, Sasoon Road, Pune',
        city: 'Pune',
        City_Id: 1,
        type: 'specialized',
        capacity: 550,
        isApproved: true,
    },
    {
        Hosp_Name: 'KEM Hospital Pune',
        email: 'kem@hospital.com',
        password: 'hospital123',
        Hosp_Phone: '020-26126000',
        address: 'Rasta Peth, Pune',
        city: 'Pune',
        City_Id: 1,
        type: 'general',
        capacity: 800,
        isApproved: true,
    },
    {
        Hosp_Name: 'Jehangir Hospital',
        email: 'jehangir@hospital.com',
        password: 'hospital123',
        Hosp_Phone: '020-66813333',
        address: '32, Sasoon Road, Pune',
        city: 'Pune',
        City_Id: 1,
        type: 'specialized',
        capacity: 350,
        isApproved: true,
    },
    {
        Hosp_Name: 'Deenanath Mangeshkar Hospital',
        email: 'deenanath@hospital.com',
        password: 'hospital123',
        Hosp_Phone: '020-40151000',
        address: 'Erandwane, Pune',
        city: 'Pune',
        City_Id: 1,
        type: 'specialized',
        capacity: 600,
        isApproved: true,
    },
];

const seedHospitals = async () => {
    try {
        await connectDB();

        console.log('\n🏥 Seeding hospitals...\n');

        for (const data of hospitals) {
            const existing = await Hospital.findOne({ email: data.email });

            if (existing) {
                // Update password and approval
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(data.password, salt);
                await Hospital.updateOne(
                    { email: data.email },
                    { $set: { password: hashedPassword, isApproved: true } }
                );
                console.log(`⚠️  Updated existing: ${data.Hosp_Name} (${data.email})`);
            } else {
                const hospital = new Hospital({
                    ...data,
                    name: data.Hosp_Name,
                    phone: data.Hosp_Phone,
                    registrationDate: new Date(),
                });
                await hospital.save();
                console.log(`✅ Created: ${data.Hosp_Name} (${data.email})`);
            }
        }

        console.log('\n========================================');
        console.log('  Hospital Login Credentials');
        console.log('========================================');
        hospitals.forEach(h => {
            console.log(`\n🏥 ${h.Hosp_Name}`);
            console.log(`   📧 Email: ${h.email}`);
            console.log(`   🔑 Password: ${h.password}`);
        });
        console.log('\n========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedHospitals();
