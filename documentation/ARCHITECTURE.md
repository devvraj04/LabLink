# System Architecture Documentation

## Overview
BloodLink is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) designed to manage blood bank operations including inventory management, donor registration, hospital requests, and emergency blood distribution.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          React Frontend (Port 3000/Netlify)            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │   Pages  │  │Components│  │  Context │             │ │
│  │  │  - Login │  │- Sidebar │  │  - Auth  │             │ │
│  │  │- Dashboard│ │- Tables  │  │  - Theme │             │ │
│  │  │- Donors  │  │- Forms   │  │          │             │ │
│  │  │- Inventory│ │- Modals  │  │          │             │ │
│  │  └──────────┘  └──────────┘  └──────────┘             │ │
│  │           │           │            │                    │ │
│  │           └───────────┴────────────┘                    │ │
│  │                      │                                  │ │
│  │           ┌──────────▼──────────┐                       │ │
│  │           │   Axios Services    │                       │ │
│  │           │  (API Integration)  │                       │ │
│  │           └─────────────────────┘                       │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/REST API
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       API GATEWAY                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │       Express.js Backend (Port 5000/Render)            │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │              Middleware Layer                    │  │ │
│  │  │  - CORS      - Auth (JWT)    - Error Handler    │  │ │
│  │  │  - Body Parser - Helmet      - Rate Limiter     │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │                        │                               │ │
│  │  ┌─────────────────────▼───────────────────────────┐  │ │
│  │  │              Route Handlers                      │  │ │
│  │  │  /api/auth          /api/donors                  │  │ │
│  │  │  /api/bloodspecimens /api/hospitals              │  │ │
│  │  │  /api/requests      /api/emergency               │  │ │
│  │  │  /api/appointments  /api/camps                   │  │ │
│  │  │  /api/chat          /api/analytics               │  │ │
│  │  └─────────────────────┬───────────────────────────┘  │ │
│  │                        │                               │ │
│  │  ┌─────────────────────▼───────────────────────────┐  │ │
│  │  │            Controllers Layer                     │  │ │
│  │  │  - Business Logic   - Validation                 │  │ │
│  │  │  - Data Processing  - Error Handling             │  │ │
│  │  └─────────────────────┬───────────────────────────┘  │ │
│  │                        │                               │ │
│  │  ┌─────────────────────▼───────────────────────────┐  │ │
│  │  │            Mongoose Models                       │  │ │
│  │  │  - Schema Definition - Validation Rules          │  │ │
│  │  │  - Relationships     - Virtual Fields            │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ MongoDB Driver
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           MongoDB Atlas (Cloud Database)               │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │  users   │ │  donors  │ │hospitals │ │bloodspec.│ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │ requests │ │emergency │ │ camps    │ │  chats   │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router 7.9.4
- **Styling**: Tailwind CSS 3.5.1
- **State Management**: React Context API
- **HTTP Client**: Axios 1.8.1
- **Charts**: Chart.js 4.4.8 with react-chartjs-2
- **Internationalization**: i18next 24.2.0
- **QR Codes**: qrcode.react 3.2.0
- **Icons**: React Icons
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB 6.20.0 with Mongoose 8.19.2
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Security**: 
  - Helmet 8.0.0
  - CORS 2.8.5
  - express-rate-limit 7.5.0
- **Validation**: express-validator 7.2.0
- **Environment**: dotenv 16.4.7

### Database
- **Type**: NoSQL (Document-based)
- **Hosting**: MongoDB Atlas
- **Collections**: 12 main collections
- **ODM**: Mongoose for schema validation

### Deployment
- **Frontend**: Netlify
- **Backend**: Render
- **Version Control**: Git/GitHub

---

## Application Layers

### 1. Presentation Layer (Frontend)

**Structure:**
```
blood-bank-app/src/
├── pages/           # Route components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Donors.jsx
│   ├── Inventory.jsx
│   ├── Hospitals.jsx
│   └── ...
├── components/      # Reusable components
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── Table.jsx
│   └── ...
├── context/         # React Context for state
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── services/        # API service layer
│   ├── api.js
│   ├── authService.js
│   └── ...
└── data/           # Static data and constants
```

**Key Features:**
- Single Page Application (SPA) with client-side routing
- Responsive design with Tailwind CSS
- Protected routes with authentication guards
- Context API for global state management
- Axios interceptors for token management
- Multi-language support (i18n)

**Authentication Flow:**
```
Login → JWT Token → LocalStorage → Axios Headers → Protected Routes
```

---

### 2. Application Layer (Backend)

**Structure:**
```
blood-bank-backend/
├── routes/          # API route definitions
│   ├── auth.routes.js
│   ├── donor.routes.js
│   └── ...
├── controllers/     # Business logic
│   ├── authController.js
│   ├── donorController.js
│   └── ...
├── models/          # Mongoose schemas
│   ├── User.js
│   ├── Donor.js
│   └── ...
├── middleware/      # Custom middleware
│   ├── isAuthenticated.js
│   ├── isAuthorized.js
│   └── ...
├── config/          # Configuration files
│   ├── database.js
│   └── passport.js
└── server.js        # Entry point
```

**Middleware Stack:**
1. **CORS**: Cross-origin resource sharing
2. **Helmet**: Security headers
3. **Body Parser**: JSON/URL-encoded parsing
4. **Rate Limiter**: API rate limiting
5. **Authentication**: JWT verification
6. **Authorization**: Role-based access control
7. **Error Handler**: Centralized error handling

---

### 3. Data Layer

**Database Design Principles:**
- **Document-oriented**: NoSQL flexibility
- **Denormalization**: Optimized read operations
- **References**: Object ID relationships
- **Indexes**: Performance optimization
- **Validation**: Schema-level constraints

**Key Collections:**
- `users`: Admin and staff accounts
- `donors`: Blood donor registry
- `bloodspecimens`: Inventory management
- `hospitals`: Hospital network
- `bloodrequests`: Request tracking
- `emergencyrequests`: SOS system
- `appointments`: Donor scheduling
- `donationcamps`: Camp management
- `chats`: Communication system
- `cities`: Location data
- `donorrewards`: Gamification
- `notifications`: Alert system

---

## Security Architecture

### Authentication & Authorization

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "manager",
    "iat": 1234567890,
    "exp": 1234654290
  },
  "signature": "..."
}
```

**Role-Based Access Control (RBAC):**
```
Admin: Full system access
Manager: Inventory + Requests + Reports
Staff: Basic operations
Hospital: Own requests and inventory view
```

**Security Measures:**
1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret key
3. **HTTPS Only**: Production deployment
4. **CORS Whitelist**: Controlled origins
5. **Rate Limiting**: Prevent abuse
6. **Helmet**: Security headers
7. **Input Validation**: Express-validator
8. **SQL Injection**: MongoDB + Mongoose protection
9. **XSS Protection**: React auto-escaping

---

## API Architecture

### RESTful Design Principles
- Resource-based URLs
- HTTP method semantics (GET, POST, PUT, DELETE)
- Stateless communication
- JSON data format
- Consistent response structure

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null,
  "timestamp": "2026-01-08T10:30:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

---

## Data Flow

### Example: Blood Request Workflow

```
1. Hospital Login
   └─→ POST /api/hospital/auth/login
       └─→ JWT Token Generated

2. Create Blood Request
   └─→ POST /api/requests
       └─→ Validation (Express-validator)
           └─→ Controller (bloodRequestController)
               └─→ Model (BloodRequest)
                   └─→ MongoDB Insert
                       └─→ Notification Created
                           └─→ Response Sent

3. Admin Approval
   └─→ GET /api/requests (Admin View)
   └─→ PATCH /api/requests/:id/approve
       └─→ Update Status
           └─→ Inventory Reserved
               └─→ Notification Sent
                   └─→ Chat Message Created

4. Fulfillment
   └─→ PUT /api/requests/:id/fulfill
       └─→ Inventory Updated
           └─→ Hospital Notified
               └─→ Analytics Updated
```

---

## Scalability Considerations

### Current Architecture
- **Monolithic**: Single backend server
- **Database**: Single MongoDB cluster
- **Deployment**: Serverless (Render/Netlify)

### Future Scalability Options

**Horizontal Scaling:**
- Load balancer (Nginx/Cloudflare)
- Multiple backend instances
- Database sharding

**Microservices Migration:**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Auth       │  │  Inventory  │  │  Requests   │
│  Service    │  │  Service    │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┴────────────────┘
                        │
                  API Gateway
```

**Caching Strategy:**
- Redis for session management
- CDN for static assets
- Database query caching

**Message Queue:**
- RabbitMQ/Redis for async tasks
- Email notifications
- Report generation

---

## Monitoring & Logging

### Application Monitoring
- Server health checks
- API response times
- Error rate tracking
- Database query performance

### Logging Strategy
```javascript
// Log Levels
ERROR: Critical failures
WARN: Potential issues
INFO: Important events
DEBUG: Detailed debugging
```

### Recommended Tools
- **Application**: PM2 for process management
- **Database**: MongoDB Atlas monitoring
- **Errors**: Sentry for error tracking
- **Analytics**: Google Analytics
- **Uptime**: UptimeRobot

---

## Deployment Architecture

### Production Environment

**Frontend (Netlify):**
```
GitHub Repo → Netlify CI/CD → Build → Deploy
- Auto-deploy on push to main
- Environment variables injected
- CDN distribution
- HTTPS enabled
```

**Backend (Render):**
```
GitHub Repo → Render CI/CD → Build → Deploy
- Auto-deploy on push to main
- Environment variables configured
- Health checks enabled
- Auto-restart on failure
```

**Database (MongoDB Atlas):**
```
- Managed cluster
- Automated backups
- Replica sets (high availability)
- Monitoring dashboard
```

### Environment Separation
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Development  │  │   Staging    │  │  Production  │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ Local DB     │  │ Test DB      │  │ Live DB      │
│ Local Server │  │ Staging URL  │  │ Render.com   │
│ localhost    │  │ .netlify     │  │ Netlify      │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Lazy loading components
- Memoization (React.memo)
- Virtual scrolling for large lists

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Compression (gzip)
- Pagination for large datasets

### Database
- Compound indexes for complex queries
- Projection (select specific fields)
- Aggregation pipeline optimization
- Connection limits

---

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups (MongoDB Atlas)
- **Code**: Version control (Git)
- **Configuration**: Environment variables documented

### Recovery Procedures
1. Database corruption: Restore from latest backup
2. Server failure: Render auto-restarts
3. Code issues: Git revert/rollback
4. Data loss: Point-in-time recovery (MongoDB Atlas)

---

## Future Enhancements

### Phase 1: Current System
✅ Basic CRUD operations
✅ Authentication system
✅ Blood inventory management
✅ Hospital network
✅ Emergency requests

### Phase 2: Enhancements (Planned)
- [ ] Real-time notifications (WebSocket)
- [ ] Mobile app (React Native)
- [ ] SMS notifications (Twilio)
- [ ] Email notifications (SendGrid)
- [ ] Advanced analytics dashboard
- [ ] AI-powered demand forecasting
- [ ] Geolocation-based donor matching

### Phase 3: Advanced Features
- [ ] Blockchain for blood traceability
- [ ] IoT integration for refrigeration monitoring
- [ ] Machine learning for predictive inventory
- [ ] Multi-tenant architecture for multiple blood banks
- [ ] Payment integration for camp registrations
