# Achievement Management System

A full-stack Achievement Management System built with MERN (MongoDB, Express, React/Next.js, Node.js) stack. This system allows students to submit their achievements, with an admin approval workflow.

## Features

### Student Features
- ✅ Submit new achievements with title, category, description, and date
- ✅ Upload certificate links (PDF/Image)
- ✅ Edit own achievements (before approval)
- ✅ View personal achievement history
- ✅ Track achievement status (Pending, Approved, Rejected)
- ✅ Search and filter achievements by department/category

### Admin Features
- ✅ Review pending achievements
- ✅ Approve or reject achievements with reason
- ✅ View all achievements across departments
- ✅ Generate dashboard statistics and charts
- ✅ Filter achievements by status, category, and department

### Dashboard Features
- 📊 Total achievements count
- ✅ Approved achievements count
- ⏳ Pending achievements count
- ❌ Rejected achievements count
- 📈 Achievements by category (Bar chart)
- 🥧 Achievements by department (Pie chart)
- 📋 Status distribution visualization

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Cloudinary** - File upload service
- **Multer** - File middleware
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Chart library
- **jsPDF** - PDF generation

## Project Structure

```
Minor-project/
├── backend/
│   ├── models/
│   │   └── Achievement.js          # Achievement data model
│   ├── controllers/
│   │   └── achievementController.js # Business logic
│   ├── routes/
│   │   └── achievementRoutes.js    # API endpoints
│   ├── index.js                    # Server entry point
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── achievements/
    │   │   ├── page.tsx            # List all achievements
    │   │   ├── create/
    │   │   │   └── page.tsx        # Create achievement form
    │   │   └── [id]/
    │   │       ├── page.tsx        # Achievement detail
    │   │       └── edit/
    │   │           └── page.tsx    # Edit achievement
    │   └── dashboard/
    │       └── achievements/
    │           └── page.tsx        # Dashboard with stats
    ├── lib/
    │   └── api/
    │       └── achievements.ts     # API utilities
    └── package.json
```

## Achievement Model

```javascript
{
  studentName: String,           // Student full name
  usn: String,                   // University Serial Number
  department: String,            // CSE, ECE, ME, etc.
  achievementTitle: String,      // Title of achievement
  category: String,              // Academic, Sports, Cultural, etc.
  description: String,           // Detailed description
  certificateLink: String,       // Link to certificate/proof
  achievementDate: Date,         // When achievement was obtained
  status: String,                // pending, approved, rejected
  rejectionReason: String,       // Reason if rejected
  approvedBy: ObjectId,          // Admin who approved
  createdAt: Date,               // Submission date
  updatedAt: Date                // Last update date
}
```

## API Endpoints

### Public Endpoints

#### Get All Achievements
```
GET /api/achievements?status=approved&category=Academic&department=CSE
```

#### Get Achievement Statistics
```
GET /api/achievements/stats/dashboard
```

#### Get Achievement by ID
```
GET /api/achievements/:id
```

#### Get Achievements by USN
```
GET /api/achievements/usn/:usn
```

### Private Endpoints (Authentication Required)

#### Create Achievement
```
POST /api/achievements
Body: {
  studentName: String,
  usn: String,
  department: String,
  achievementTitle: String,
  category: String,
  description: String,
  achievementDate: Date,
  certificateLink: String (optional)
}
```

#### Update Achievement
```
PUT /api/achievements/:id
Body: { ...achievement fields }
```

#### Delete Achievement
```
DELETE /api/achievements/:id
```

### Admin Endpoints

#### Approve Achievement
```
PUT /api/achievements/:id/approve
Body: { adminId: String }
```

#### Reject Achievement
```
PUT /api/achievements/:id/reject
Body: { rejectionReason: String }
```

## Category Options
- Academic
- Sports
- Cultural
- Technical
- Research
- Social Service
- Other

## Department Options
- CSE (Computer Science)
- ECE (Electronics & Communication)
- ME (Mechanical)
- CE (Civil)
- EEE (Electrical & Electronics)
- CIVIL (Civil Engineering)
- IT (Information Technology)

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/achievements
PORT=5000
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Installation & Setup

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create .env file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB service:
```bash
mongod
```

4. Run the server:
```bash
npm run dev  # Development mode with nodemon
npm start   # Production mode
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create .env.local file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## Usage Examples

### Create an Achievement (Frontend)
```typescript
const response = await axios.post(
  `${API_URL}/achievements`,
  {
    studentName: "John Doe",
    usn: "1PE19CS001",
    department: "CSE",
    achievementTitle: "National Coding Competition Winner",
    category: "Technical",
    description: "Won first place in National Programming Contest 2024",
    achievementDate: "2024-03-15",
    certificateLink: "https://example.com/certificate.pdf"
  }
);
```

### Filter Achievements
```typescript
// By status
GET /api/achievements?status=approved

// By category and department
GET /api/achievements?category=Sports&department=CSE

// By USN
GET /api/achievements/usn/1PE19CS001
```

### Approve Achievement (Admin)
```typescript
await axios.put(
  `/api/achievements/${id}/approve`,
  { adminId: "admin_user_id" }
);
```

## Key Features Implementation

### 1. Schema Validation
- All required fields are validated at the model level
- Department and Category fields use enums
- Dates are properly formatted and validated

### 2. Admin Approval System
- Achievements start in "pending" status
- Admins can approve or reject with reason
- Rejection reason is stored for student reference
- Approved achievements track approving admin

### 3. Search & Filter
- Filter by status (approved, pending, rejected)
- Filter by category (7 categories)
- Filter by department (7 departments)
- Search by USN
- Sort by creation date

### 4. Dashboard Analytics
- Aggregate counts for each status
- Category distribution using $group aggregation
- Department-wise achievement count
- Visual representation using Recharts

### 5. Responsive UI
- Mobile-first design with Tailwind CSS
- Grid layouts that adapt to screen size
- Touch-friendly buttons and forms
- Smooth transitions and hover effects

## Security Considerations

1. **Input Validation** - All inputs validated on both frontend and backend
2. **Error Handling** - Comprehensive error messages without exposing sensitive data
3. **Status Management** - Prevents unauthorized status changes
4. **Data Indexing** - Indexed fields for efficient queries
5. **Timestamps** - Track creation and modification times

## Performance Optimizations

1. **Database Indexing**
   - Compound index on (department, category)
   - Index on usn
   - Index on status

2. **Query Optimization**
   - Aggregation pipeline for statistics
   - Lean queries where applicable
   - Pagination-ready structure

3. **Frontend Optimization**
   - Client-side caching with axios
   - Efficient re-renders with React hooks
   - Image optimization with Next.js

## Future Enhancements

- [ ] File upload support for certificates
- [ ] Email notifications for approvals/rejections
- [ ] User roles and permissions system
- [ ] Achievement sharing on social media
- [ ] PDF report generation
- [ ] Bulk import from Excel
- [ ] Advanced search with date range
- [ ] Achievement badges/medals system
- [ ] Email verification
- [ ] Two-factor authentication

## Testing

### Backend Testing
```bash
# Run tests
npm test

# With coverage
npm run test:coverage
```

### Frontend Testing
```bash
# Run tests
npm test

# With coverage
npm run test:coverage
```

## Deployment

### Backend (Heroku/Railway)
```bash
git push heroku main
heroku logs --tail
```

### Frontend (Vercel)
```bash
vercel --prod
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB service is running
   - Check MONGODB_URI in .env

2. **API Not Responding**
   - Check if backend server is running on correct port
   - Verify NEXT_PUBLIC_API_URL in frontend

3. **CORS Errors**
   - Enable CORS in Express backend
   - Check frontend URL in CORS configuration

4. **Chart Not Displaying**
   - Ensure Recharts is properly installed
   - Check if data is being fetched correctly

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests if applicable
4. Submit a pull request

## License

ISC License - See LICENSE file for details

## Support

For issues and questions, please create an issue in the repository.

## Project Statistics

- **Total Lines of Code**: ~2000+
- **API Endpoints**: 10+
- **Database Collections**: 1
- **Frontend Pages**: 5
- **React Components**: 5
- **Chart Types**: 3

## Version History

### v1.0.0 (Current)
- Initial release
- Basic CRUD operations
- Admin approval system
- Dashboard with statistics
- Search and filter functionality
