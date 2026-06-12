const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Department = require('./models/Department');
const User = require('./models/User');
const { Student } = require('./controllers/recController');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding');

        // Clear existing data
        await Department.deleteMany({});
        await User.deleteMany({});
        await Student.deleteMany({});

        // Create Departments
        const departments = await Department.insertMany([
            { code: 'CSE', name: 'Computer Science' },
            { code: 'ECE', name: 'Electronics and Communication' },
            { code: 'EEE', name: 'Electrical and Electronics' },
            { code: 'ME', name: 'Mechanical Engineering' },
            { code: 'CE', name: 'Civil Engineering' },
            { code: 'IT', name: 'Information Technology' }
        ]);
        console.log('Departments seeded');

        // Create Admin User
        // Create Users Arrays
        const students = [];
        const faculty = [];
        const admins = [];
        const userCredentials = []; // To save to JSON later if needed

        const commonPassword = 'User@123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(commonPassword, salt);

        // Helper to create user
        const createUserObj = (name, email, role, deptId) => ({
            fullName: name,
            email: email,
            passwordHash: passwordHash,
            role: role,
            departmentId: deptId
        });

        // 1. Create 5 Admins (One Head Admin, others can be HODs or specialized admins)
        // We'll make the first one the super admin, and maybe some Department Heads
        admins.push(createUserObj('System Admin', 'admin@college.edu', 'admin', departments[0]._id));
        admins.push(createUserObj('Registrar', 'registrar@college.edu', 'admin', departments[0]._id));
        admins.push(createUserObj('Dean of Research', 'dean@college.edu', 'admin', departments[0]._id));
        admins.push(createUserObj('Exam Controller', 'controller@college.edu', 'admin', departments[0]._id));
        admins.push(createUserObj('Librarian', 'librarian@college.edu', 'admin', departments[0]._id));

        // 2. Create 15 Faculty (Distributed among departments)
        // 6 departments, so ~2-3 per department
        departments.forEach((dept, index) => {
            faculty.push(createUserObj(`Dr. Faculty ${dept.code} 1`, `faculty.${dept.code.toLowerCase()}1@college.edu`, 'faculty', dept._id));
            faculty.push(createUserObj(`Prof. Faculty ${dept.code} 2`, `faculty.${dept.code.toLowerCase()}2@college.edu`, 'faculty', dept._id));
            if (index < 3) { // Add a 3rd faculty to first 3 depts
                faculty.push(createUserObj(`Asst. Prof. Faculty ${dept.code} 3`, `faculty.${dept.code.toLowerCase()}3@college.edu`, 'faculty', dept._id));
            }
        });

        // 3. Create 30 Students (Distributed among departments)
        // 5 per department
        departments.forEach(dept => {
            for (let i = 1; i <= 5; i++) {
                students.push(createUserObj(`Student ${dept.code} ${i}`, `student.${dept.code.toLowerCase()}${i}@college.edu`, 'student', dept._id));
            }
        });

        const allUsers = [...admins, ...faculty, ...students];
        await User.insertMany(allUsers);

        console.log(`Seeded ${allUsers.length} users successfully.`);
        console.log('Credentials for all users: Email as listed, Password: ' + commonPassword);

        // Seed recommendation student profiles
        const studentProfiles = [];
        const targetDomains = [
            "Software Engineering",
            "Frontend Developer",
            "Backend Developer",
            "Data Science",
            "Machine Learning",
            "UI/UX Design",
            "Cloud Architect"
        ];
        
        const skillSets = [
            ["javascript", "react", "html", "css", "node.js", "git"],
            ["python", "machine learning", "deep learning", "nlp", "statistics"],
            ["java", "spring", "sql", "docker", "kubernetes", "aws"],
            ["golang", "rust", "kubernetes", "docker", "gcp", "git"],
            ["javascript", "typescript", "angular", "css", "html"],
            ["python", "data analysis", "pandas", "numpy", "tableau", "excel"],
            ["communication", "leadership", "problem solving", "agile", "scrum"]
        ];

        // Seed profiles for actual user database students
        const studentUsers = allUsers.filter(u => u.role === 'student');
        studentUsers.forEach((studentUser, idx) => {
            studentProfiles.push({
                studentId: studentUser._id.toString(),
                skills: skillSets[idx % skillSets.length],
                targetDomain: targetDomains[idx % targetDomains.length],
                appliedInternships: []
            });
        });

        // Seed fallback/test S101 to S150 student profiles
        for (let i = 101; i <= 150; i++) {
            const index = i % targetDomains.length;
            studentProfiles.push({
                studentId: `S${i}`,
                skills: skillSets[i % skillSets.length],
                targetDomain: targetDomains[index],
                appliedInternships: []
            });
        }

        await Student.insertMany(studentProfiles);
        console.log('Seeded recommendation student profiles.');

        // Write credentials to file for user reference (optional but helpful for the request)
        const runFs = require('fs');
        const path = require('path');
        const artifactPath = path.join(__dirname, 'mock_users.json');

        const exportData = allUsers.map(u => ({
            name: u.fullName,
            email: u.email,
            role: u.role,
            department: departments.find(d => d._id.toString() === u.departmentId.toString())?.code || 'None',
            password: commonPassword
        }));

        runFs.writeFileSync(artifactPath, JSON.stringify(exportData, null, 2));
        console.log(`Mock user data exported to ${artifactPath}`);

        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
