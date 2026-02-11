// Mock Inventory Data
export const mockInventory = [
  {
    id: 'BB001',
    group: 'A+',
    status: 'available',
    collectionDate: '2025-10-15',
    expiryDate: '2025-11-15'
  },
  {
    id: 'BB002',
    group: 'O+',
    status: 'available',
    collectionDate: '2025-10-18',
    expiryDate: '2025-11-18'
  },
  {
    id: 'BB003',
    group: 'B+',
    status: 'reserved',
    collectionDate: '2025-10-10',
    expiryDate: '2025-11-10'
  },
  {
    id: 'BB004',
    group: 'AB+',
    status: 'available',
    collectionDate: '2025-10-20',
    expiryDate: '2025-11-20'
  },
  {
    id: 'BB005',
    group: 'A-',
    status: 'used',
    collectionDate: '2025-10-05',
    expiryDate: '2025-11-05'
  },
  {
    id: 'BB006',
    group: 'O-',
    status: 'available',
    collectionDate: '2025-10-19',
    expiryDate: '2025-11-19'
  },
  {
    id: 'BB007',
    group: 'B-',
    status: 'contaminated',
    collectionDate: '2025-10-12',
    expiryDate: '2025-11-12'
  },
  {
    id: 'BB008',
    group: 'AB-',
    status: 'available',
    collectionDate: '2025-10-17',
    expiryDate: '2025-11-17'
  },
  {
    id: 'BB009',
    group: 'A+',
    status: 'reserved',
    collectionDate: '2025-10-14',
    expiryDate: '2025-11-14'
  },
  {
    id: 'BB010',
    group: 'O+',
    status: 'available',
    collectionDate: '2025-10-21',
    expiryDate: '2025-11-21'
  }
];

// Mock Donors Data
export const mockDonors = [
  {
    id: 'D001',
    name: 'Rajesh Kumar',
    bloodGroup: 'A+',
    phone: '+91-9876543210',
    city: 'Mumbai',
    registrationDate: '2025-01-15'
  },
  {
    id: 'D002',
    name: 'Priya Sharma',
    bloodGroup: 'O+',
    phone: '+91-9876543211',
    city: 'Delhi',
    registrationDate: '2025-02-20'
  },
  {
    id: 'D003',
    name: 'Amit Patel',
    bloodGroup: 'B+',
    phone: '+91-9876543212',
    city: 'Ahmedabad',
    registrationDate: '2025-03-10'
  },
  {
    id: 'D004',
    name: 'Sneha Desai',
    bloodGroup: 'AB+',
    phone: '+91-9876543213',
    city: 'Bangalore',
    registrationDate: '2025-04-05'
  },
  {
    id: 'D005',
    name: 'Vikram Singh',
    bloodGroup: 'A-',
    phone: '+91-9876543214',
    city: 'Pune',
    registrationDate: '2025-05-12'
  },
  {
    id: 'D006',
    name: 'Anjali Verma',
    bloodGroup: 'O-',
    phone: '+91-9876543215',
    city: 'Chennai',
    registrationDate: '2025-06-18'
  },
  {
    id: 'D007',
    name: 'Rahul Mehta',
    bloodGroup: 'B-',
    phone: '+91-9876543216',
    city: 'Kolkata',
    registrationDate: '2025-07-22'
  },
  {
    id: 'D008',
    name: 'Kavita Reddy',
    bloodGroup: 'AB-',
    phone: '+91-9876543217',
    city: 'Hyderabad',
    registrationDate: '2025-08-08'
  },
  {
    id: 'D009',
    name: 'Arjun Nair',
    bloodGroup: 'A+',
    phone: '+91-9876543218',
    city: 'Kochi',
    registrationDate: '2025-09-14'
  },
  {
    id: 'D010',
    name: 'Neha Gupta',
    bloodGroup: 'O+',
    phone: '+91-9876543219',
    city: 'Jaipur',
    registrationDate: '2025-10-01'
  }
];

// Mock Dashboard Statistics
export const mockStats = {
  totalUnits: 1247,
  donorsThisMonth: 42,
  lowStockGroups: ['AB-', 'B-', 'O-'],
  pendingRequests: 8
};
