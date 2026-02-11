# Database Schema Documentation

## Overview
BloodLink uses MongoDB as the database with Mongoose ODM for schema definition and validation. The database is hosted on MongoDB Atlas.

**Database Name:** `test`  
**Connection:** MongoDB Atlas Cluster

---

## Collections

### 1. Users
**Collection Name:** `users`  
Stores admin and staff accounts for the blood bank management system.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  role: String (enum: ['manager', 'staff', 'admin'], default: 'staff'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: unique index

---

### 2. Donors
**Collection Name:** `donors`  
Stores information about blood donors.

```javascript
{
  _id: ObjectId,
  D_Name: String (required),
  D_Age: Number (required, min: 18, max: 65),
  D_Bgroup: String (required, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  D_Reg_Date: Date (required),
  D_Phno: String (required, 10 digits),
  D_Mail: String (required, valid email),
  D_Add: String,
  City_ID: ObjectId (ref: 'City'),
  lastDonationDate: Date,
  totalDonations: Number (default: 0),
  eligibilityStatus: String (enum: ['eligible', 'ineligible', 'pending']),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `D_Mail`: unique index
- `D_Phno`: unique index
- `D_Bgroup`: index for filtering
- `City_ID`: index for location-based queries

**Relationships:**
- `City_ID` → references `cities` collection

---

### 3. Blood Specimens
**Collection Name:** `bloodspecimens`  
Manages blood inventory with detailed tracking.

```javascript
{
  _id: ObjectId,
  Specimen_Number: String (required, unique),
  Blood_Group: String (required, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  Donor_ID: ObjectId (ref: 'Donor', required),
  M_Id: ObjectId (ref: 'User', required),
  Collection_Date: Date (default: current date),
  Expiry_Date: Date (required),
  Status: String (enum: ['Available', 'Reserved', 'Used', 'Expired', 'Discarded'], default: 'Available'),
  Disease_Tested: Boolean (default: false),
  Volume_ml: Number (default: 450),
  Component_Type: String (enum: ['Whole Blood', 'Red Cells', 'Plasma', 'Platelets', 'Cryoprecipitate'], default: 'Whole Blood'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `Specimen_Number`: unique index
- `Blood_Group`: index for filtering
- `Status`: index for inventory queries
- `Expiry_Date`: index for expiration checks

**Relationships:**
- `Donor_ID` → references `donors` collection
- `M_Id` → references `users` collection (BB Manager)

---

### 4. Hospitals
**Collection Name:** `hospitals`  
Stores hospital information and authentication credentials.

```javascript
{
  _id: ObjectId,
  Hosp_Name: String (required),
  Hosp_Phno: String (required, 10 digits),
  Hosp_Add: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  City_ID: ObjectId (ref: 'City', required),
  type: String (enum: ['government', 'private', 'general', 'specialty']),
  licenseNumber: String,
  isVerified: Boolean (default: false),
  registrationDate: Date (default: current date),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: unique index
- `City_ID`: index for location filtering

**Relationships:**
- `City_ID` → references `cities` collection

---

### 5. Blood Requests
**Collection Name:** `bloodrequests`  
Manages blood requests from hospitals.

```javascript
{
  _id: ObjectId,
  Req_ID: String (auto-generated),
  bloodGroup: String (required, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  unitsNeeded: Number (required, min: 1),
  urgencyLevel: String (enum: ['low', 'medium', 'high', 'critical'], default: 'medium'),
  status: String (enum: ['pending', 'approved', 'fulfilled', 'rejected'], default: 'pending'),
  patientName: String,
  reason: String,
  hospitalId: ObjectId (ref: 'Hospital', required),
  approvedBy: ObjectId (ref: 'User'),
  requestDate: Date (default: current date),
  fulfilledDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `hospitalId`: index
- `status`: index for filtering requests
- `bloodGroup`: index for matching
- `requestDate`: index for sorting

**Relationships:**
- `hospitalId` → references `hospitals` collection
- `approvedBy` → references `users` collection

---

### 6. Emergency Requests
**Collection Name:** `emergencyrequests`  
Handles urgent emergency blood requests (SOS system).

```javascript
{
  _id: ObjectId,
  bloodGroup: String (required, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  unitsNeeded: Number (required, min: 1),
  patientName: String (required),
  hospitalId: ObjectId (ref: 'Hospital', required),
  contactNumber: String (required, 10 digits),
  location: String (required),
  status: String (enum: ['active', 'fulfilled', 'cancelled'], default: 'active'),
  priority: String (enum: ['critical', 'urgent'], default: 'critical'),
  requestTime: Date (default: current date),
  responseTime: Date,
  fulfilledBy: ObjectId (ref: 'User'),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `status`: index for active requests
- `bloodGroup`: index for matching
- `requestTime`: index for sorting by urgency

**Relationships:**
- `hospitalId` → references `hospitals` collection
- `fulfilledBy` → references `users` collection

---

### 7. Appointments
**Collection Name:** `appointments`  
Manages donor appointment scheduling.

```javascript
{
  _id: ObjectId,
  donorId: ObjectId (ref: 'Donor', required),
  appointmentDate: Date (required),
  timeSlot: String (required),
  purpose: String (enum: ['Blood Donation', 'Health Checkup', 'Follow-up'], default: 'Blood Donation'),
  status: String (enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled'),
  scheduledBy: ObjectId (ref: 'User'),
  notes: String,
  reminderSent: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `donorId`: index
- `appointmentDate`: index for scheduling
- `status`: index for filtering

**Relationships:**
- `donorId` → references `donors` collection
- `scheduledBy` → references `users` collection

---

### 8. Donation Camps
**Collection Name:** `donationcamps`  
Tracks blood donation camp events.

```javascript
{
  _id: ObjectId,
  Camp_Name: String (required),
  Camp_Date: Date (required),
  Location: String (required),
  City_ID: ObjectId (ref: 'City', required),
  Organized_By: ObjectId (ref: 'User', required),
  expectedDonors: Number (default: 0),
  actualDonors: Number (default: 0),
  unitsCollected: Number (default: 0),
  startTime: String,
  endTime: String,
  status: String (enum: ['planned', 'ongoing', 'completed', 'cancelled'], default: 'planned'),
  contactPerson: String,
  contactPhone: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `Camp_Date`: index for scheduling
- `City_ID`: index for location
- `status`: index for filtering

**Relationships:**
- `City_ID` → references `cities` collection
- `Organized_By` → references `users` collection

---

### 9. Cities
**Collection Name:** `cities`  
Stores city information for location management.

```javascript
{
  _id: ObjectId,
  City_Name: String (required, unique),
  State: String (required),
  pincode: String,
  district: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `City_Name`: unique index
- `State`: index for filtering

---

### 10. Chats
**Collection Name:** `chats`  
Manages messaging between hospitals and blood bank admin.

```javascript
{
  _id: ObjectId,
  hospitalId: ObjectId (ref: 'Hospital', required),
  senderId: ObjectId (required),
  senderModel: String (enum: ['Hospital', 'User'], required),
  message: String (required),
  isRead: Boolean (default: false),
  timestamp: Date (default: current date),
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `hospitalId`: index
- `timestamp`: index for sorting
- `isRead`: index for unread messages

**Relationships:**
- `hospitalId` → references `hospitals` collection
- `senderId` → references either `hospitals` or `users` collection based on `senderModel`

---

### 11. Donor Rewards
**Collection Name:** `donorrewards`  
Tracks donor rewards and incentives.

```javascript
{
  _id: ObjectId,
  donorId: ObjectId (ref: 'Donor', required),
  points: Number (default: 0),
  totalDonations: Number (default: 0),
  badges: [String],
  rewardsTier: String (enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze'),
  lastUpdated: Date (default: current date),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `donorId`: unique index
- `points`: index for leaderboard

**Relationships:**
- `donorId` → references `donors` collection

---

### 12. Notifications
**Collection Name:** `notifications`  
Stores system notifications for users and hospitals.

```javascript
{
  _id: ObjectId,
  recipientId: ObjectId (required),
  recipientModel: String (enum: ['User', 'Hospital', 'Donor'], required),
  title: String (required),
  message: String (required),
  type: String (enum: ['info', 'warning', 'success', 'alert'], default: 'info'),
  isRead: Boolean (default: false),
  link: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `recipientId`: index
- `isRead`: index for unread notifications
- `createdAt`: index for sorting

**Relationships:**
- `recipientId` → references `users`, `hospitals`, or `donors` collection based on `recipientModel`

---

## Relationships Diagram

```
Users (Admin/Staff)
├── manages → BloodSpecimens
├── organizes → DonationCamps
├── approves → BloodRequests
├── schedules → Appointments
└── sends → Chats

Donors
├── donates → BloodSpecimens
├── books → Appointments
└── earns → DonorRewards

Hospitals
├── requests → BloodRequests
├── creates → EmergencyRequests
├── sends → Chats
└── located_in → Cities

Cities
├── has → Donors
├── has → Hospitals
└── hosts → DonationCamps

BloodSpecimens
├── donated_by → Donors
└── managed_by → Users
```

---

## Indexes Summary

### Performance-Critical Indexes
1. **bloodspecimens**: `Blood_Group`, `Status`, `Expiry_Date`
2. **donors**: `D_Bgroup`, `D_Mail`, `City_ID`
3. **bloodrequests**: `status`, `hospitalId`, `bloodGroup`, `requestDate`
4. **emergencyrequests**: `status`, `bloodGroup`, `requestTime`
5. **chats**: `hospitalId`, `timestamp`, `isRead`

### Unique Indexes
- `users.email`
- `donors.D_Mail`, `donors.D_Phno`
- `bloodspecimens.Specimen_Number`
- `hospitals.email`
- `cities.City_Name`
- `donorrewards.donorId`

---

## Data Validation Rules

### Blood Group Validation
All blood group fields must be one of: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

### Phone Number Validation
- Must be exactly 10 digits
- Stored as String for international compatibility

### Email Validation
- Must be valid email format
- Case-insensitive uniqueness

### Date Validation
- `Donor.D_Age`: 18-65 years
- `BloodSpecimen.Expiry_Date`: Must be future date
- `Appointment.appointmentDate`: Cannot be in the past

### Password Security
- Minimum 6 characters
- Hashed using bcrypt (salt rounds: 10)
- Never stored in plain text

---

## Database Connection

```javascript
// Connection String Format
mongodb+srv://<username>:<password>@cluster0.assaduf.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0

// Current Configuration
Database: test
Host: MongoDB Atlas (cluster0.assaduf.mongodb.net)
Options: 
  - retryWrites: true
  - w: majority (write concern)
  - appName: Cluster0
```

---

## Backup & Maintenance

### Recommended Practices
1. **Daily Backups**: Automated MongoDB Atlas backups
2. **Index Monitoring**: Check index usage monthly
3. **Data Cleanup**: Remove expired blood specimens quarterly
4. **Archive Old Records**: Archive fulfilled requests older than 1 year

### Data Retention Policy
- **Active Blood Specimens**: Until expiry + 30 days
- **Donor Records**: Permanent (HIPAA/Medical Compliance)
- **Blood Requests**: 2 years
- **Chat Messages**: 1 year
- **Notifications**: 6 months
- **Audit Logs**: 3 years

---

## Migration Notes

If migrating from `blood_bank_db` to `test`:

```bash
# Update connection string in .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/test

# All existing data is in "test" database
# No migration needed, just update connection string
```
