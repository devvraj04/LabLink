const mongoose = require('mongoose');
const DonationCamp = require('./models/DonationCamp');
require('dotenv').config();

const camps = [
  {
    campName: "New Year Blood Drive 2026",
    description: "Start the year by saving lives! Join our first blood donation camp of 2026.",
    campDate: new Date('2026-01-15'),
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "City Community Center",
      address: "123 Main Street, Downtown",
      city: "Mumbai"
    },
    organizer: "BloodLink Foundation",
    contactPerson: {
      name: "Rajesh Kumar",
      phone: "9876543210",
      email: "rajesh@bloodlink.org"
    },
    expectedDonors: 150,
    status: "completed",
    unitsCollected: 142
  },
  {
    campName: "Republic Day Special Blood Camp",
    description: "Celebrate Republic Day by donating blood and honoring our nation.",
    campDate: new Date('2026-01-26'),
    startTime: "08:00 AM",
    endTime: "06:00 PM",
    location: {
      name: "National Stadium",
      address: "Stadium Road, Central Area",
      city: "Delhi"
    },
    organizer: "Red Cross Society",
    contactPerson: {
      name: "Priya Sharma",
      phone: "9876543211",
      email: "priya@redcross.org"
    },
    expectedDonors: 200,
    status: "completed",
    unitsCollected: 185
  },
  {
    campName: "Corporate Blood Donation Drive",
    description: "Tech companies unite for blood donation. Corporate employees welcome!",
    campDate: new Date('2026-02-05'),
    startTime: "10:00 AM",
    endTime: "04:00 PM",
    location: {
      name: "Tech Park Convention Center",
      address: "IT Park, Phase 2",
      city: "Bangalore"
    },
    organizer: "Tech For Good Initiative",
    contactPerson: {
      name: "Arjun Patel",
      phone: "9876543212",
      email: "arjun@techforgood.org"
    },
    expectedDonors: 120,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Valentine's Day Blood Donation",
    description: "Share love, donate blood! Special camp on Valentine's Day.",
    campDate: new Date('2026-02-14'),
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "City Hospital Auditorium",
      address: "Hospital Road, Medical District",
      city: "Pune"
    },
    organizer: "City Hospital",
    contactPerson: {
      name: "Dr. Sneha Desai",
      phone: "9876543213",
      email: "sneha@cityhospital.org"
    },
    expectedDonors: 100,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Youth Blood Donation Camp",
    description: "Calling all youth! College students and young professionals, step forward.",
    campDate: new Date('2026-02-28'),
    startTime: "10:00 AM",
    endTime: "04:00 PM",
    location: {
      name: "University Auditorium",
      address: "University Campus, North Wing",
      city: "Hyderabad"
    },
    organizer: "Student Volunteers Association",
    contactPerson: {
      name: "Rahul Verma",
      phone: "9876543214",
      email: "rahul@sva.org"
    },
    expectedDonors: 180,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Women's Day Blood Donation",
    description: "Women power! Special blood donation camp celebrating International Women's Day.",
    campDate: new Date('2026-03-08'),
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "Women's College Grounds",
      address: "College Street, Education District",
      city: "Chennai"
    },
    organizer: "Women's Welfare Organization",
    contactPerson: {
      name: "Lakshmi Iyer",
      phone: "9876543215",
      email: "lakshmi@wwo.org"
    },
    expectedDonors: 130,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Holi Blood Donation Festival",
    description: "Add colors to someone's life! Blood donation camp during Holi festivities.",
    campDate: new Date('2026-03-14'),
    startTime: "08:00 AM",
    endTime: "02:00 PM",
    location: {
      name: "Community Garden",
      address: "Garden Road, Green Park",
      city: "Jaipur"
    },
    organizer: "Jaipur Blood Bank",
    contactPerson: {
      name: "Vikram Singh",
      phone: "9876543216",
      email: "vikram@jaipurbloodbank.org"
    },
    expectedDonors: 90,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Spring Mega Blood Drive",
    description: "Largest blood donation camp of the season. Multiple locations available.",
    campDate: new Date('2026-03-21'),
    startTime: "07:00 AM",
    endTime: "07:00 PM",
    location: {
      name: "Exhibition Center",
      address: "Exhibition Road, Trade Fair Complex",
      city: "Ahmedabad"
    },
    organizer: "Gujarat Blood Bank Network",
    contactPerson: {
      name: "Amit Mehta",
      phone: "9876543217",
      email: "amit@gujaratbloodbank.org"
    },
    expectedDonors: 300,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Earth Day Blood Donation",
    description: "Save the planet, save lives! Earth Day special blood donation camp.",
    campDate: new Date('2026-04-22'),
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "Eco Park",
      address: "Green Belt, Environmental Zone",
      city: "Kolkata"
    },
    organizer: "Green Earth Foundation",
    contactPerson: {
      name: "Sanjay Banerjee",
      phone: "9876543218",
      email: "sanjay@greenearth.org"
    },
    expectedDonors: 110,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Summer Blood Donation Marathon",
    description: "Beat the heat with a cool gesture! Summer blood donation drive.",
    campDate: new Date('2026-05-01'),
    startTime: "06:00 AM",
    endTime: "12:00 PM",
    location: {
      name: "Sports Complex",
      address: "Stadium Road, Sports District",
      city: "Chandigarh"
    },
    organizer: "Chandigarh Health Department",
    contactPerson: {
      name: "Manpreet Kaur",
      phone: "9876543219",
      email: "manpreet@chdhealthdept.gov.in"
    },
    expectedDonors: 140,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "World Blood Donor Day Celebration",
    description: "Join the global celebration! Special camp for World Blood Donor Day.",
    campDate: new Date('2026-06-14'),
    startTime: "08:00 AM",
    endTime: "06:00 PM",
    location: {
      name: "Central Hospital Complex",
      address: "Hospital Street, Medical City",
      city: "Lucknow"
    },
    organizer: "WHO India & BloodLink",
    contactPerson: {
      name: "Dr. Anita Gupta",
      phone: "9876543220",
      email: "anita@who-india.org"
    },
    expectedDonors: 250,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Monsoon Blood Drive",
    description: "Don't let the rains stop you from saving lives! Indoor camp with refreshments.",
    campDate: new Date('2026-07-15'),
    startTime: "10:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "Shopping Mall - Central Atrium",
      address: "Mall Road, Commercial District",
      city: "Mumbai"
    },
    organizer: "Monsoon Care Initiative",
    contactPerson: {
      name: "Rohan Deshmukh",
      phone: "9876543221",
      email: "rohan@monsooncare.org"
    },
    expectedDonors: 160,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Independence Day Blood Donation",
    description: "Celebrate freedom by giving the gift of life. Independence Day special camp.",
    campDate: new Date('2026-08-15'),
    startTime: "07:00 AM",
    endTime: "06:00 PM",
    location: {
      name: "Freedom Park",
      address: "Liberty Road, National Heritage Area",
      city: "Delhi"
    },
    organizer: "National Blood Transfusion Council",
    contactPerson: {
      name: "Col. Rajiv Kumar",
      phone: "9876543222",
      email: "rajiv@nbtc.gov.in"
    },
    expectedDonors: 400,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Teachers' Day Blood Camp",
    description: "Teachers lead by example! Special camp honoring educators who donate blood.",
    campDate: new Date('2026-09-05'),
    startTime: "09:00 AM",
    endTime: "04:00 PM",
    location: {
      name: "Teachers' Training Institute",
      address: "Education Street, Academic Zone",
      city: "Bangalore"
    },
    organizer: "Education Department & BloodLink",
    contactPerson: {
      name: "Prof. Suresh Nair",
      phone: "9876543223",
      email: "suresh@tti.edu.in"
    },
    expectedDonors: 95,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Ganesh Chaturthi Blood Donation",
    description: "Seek blessings by donating blood during Ganesh Chaturthi festival.",
    campDate: new Date('2026-09-17'),
    startTime: "08:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "Temple Community Hall",
      address: "Temple Road, Religious District",
      city: "Pune"
    },
    organizer: "Temple Trust & Blood Bank",
    contactPerson: {
      name: "Ganesh Patil",
      phone: "9876543224",
      email: "ganesh@templetrust.org"
    },
    expectedDonors: 170,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Gandhi Jayanti Blood Donation",
    description: "Practice non-violence by saving lives. Gandhi Jayanti special camp.",
    campDate: new Date('2026-10-02'),
    startTime: "08:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "Gandhi Memorial Center",
      address: "Mahatma Gandhi Road, Heritage Area",
      city: "Ahmedabad"
    },
    organizer: "Gandhi Foundation",
    contactPerson: {
      name: "Kiran Patel",
      phone: "9876543225",
      email: "kiran@gandhifoundation.org"
    },
    expectedDonors: 135,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Diwali Blood Donation Festival",
    description: "Light up someone's life this Diwali! Pre-Diwali blood donation camp.",
    campDate: new Date('2026-10-19'),
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "Cultural Center",
      address: "Festival Road, Cultural District",
      city: "Jaipur"
    },
    organizer: "Diwali Seva Trust",
    contactPerson: {
      name: "Deepak Sharma",
      phone: "9876543226",
      email: "deepak@diwalisevatrust.org"
    },
    expectedDonors: 190,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Children's Day Blood Camp",
    description: "Donate for the children's future! Children's Day special blood donation.",
    campDate: new Date('2026-11-14'),
    startTime: "10:00 AM",
    endTime: "04:00 PM",
    location: {
      name: "Children's Hospital Grounds",
      address: "Hospital Road, Children's Medical Center",
      city: "Chennai"
    },
    organizer: "Children's Welfare Society",
    contactPerson: {
      name: "Meera Subramaniam",
      phone: "9876543227",
      email: "meera@childwelfare.org"
    },
    expectedDonors: 105,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Winter Blood Drive",
    description: "Warm hearts in winter! Season's largest blood donation drive.",
    campDate: new Date('2026-12-01'),
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    location: {
      name: "Convention Center",
      address: "Convention Road, Business District",
      city: "Hyderabad"
    },
    organizer: "Winter Care Foundation",
    contactPerson: {
      name: "Aditya Reddy",
      phone: "9876543228",
      email: "aditya@wintercare.org"
    },
    expectedDonors: 220,
    status: "upcoming",
    unitsCollected: 0
  },
  {
    campName: "Christmas Blood Donation",
    description: "Give the gift of life this Christmas! Special festive blood camp.",
    campDate: new Date('2026-12-25'),
    startTime: "08:00 AM",
    endTime: "02:00 PM",
    location: {
      name: "Church Community Hall",
      address: "Church Street, Mission Area",
      city: "Goa"
    },
    organizer: "Church Medical Mission",
    contactPerson: {
      name: "Father John D'Souza",
      phone: "9876543229",
      email: "father.john@churchmission.org"
    },
    expectedDonors: 80,
    status: "upcoming",
    unitsCollected: 0
  }
];

async function seedCamps() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected...');

    // Clear existing camps (optional - remove if you want to keep existing data)
    await DonationCamp.deleteMany({});
    console.log('Existing camps cleared...');

    // Insert new camps
    const createdCamps = await DonationCamp.insertMany(camps);
    console.log(`✅ Successfully seeded ${createdCamps.length} donation camps!`);

    // Display summary
    console.log('\n📊 Camps Summary:');
    console.log(`- Total Camps: ${createdCamps.length}`);
    console.log(`- Upcoming Camps: ${camps.filter(c => c.status === 'upcoming').length}`);
    console.log(`- Completed Camps: ${camps.filter(c => c.status === 'completed').length}`);
    console.log(`- Total Expected Donors: ${camps.reduce((sum, c) => sum + c.expectedDonors, 0)}`);
    console.log(`- Total Units Collected: ${camps.reduce((sum, c) => sum + c.unitsCollected, 0)}`);

    console.log('\n🗓️ Upcoming Camp Dates:');
    camps
      .filter(c => c.status === 'upcoming')
      .slice(0, 5)
      .forEach(camp => {
        console.log(`  - ${camp.campDate.toLocaleDateString()}: ${camp.campName} (${camp.location.city})`);
      });

    mongoose.connection.close();
    console.log('\n✅ Database connection closed. Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding camps:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCamps();
