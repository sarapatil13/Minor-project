const mongoose = require('mongoose');
const Department = require('./models/Department');
require('dotenv').config();

const checkDepartments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const departments = await Department.find({});
        console.log(`Found ${departments.length} departments:`);
        departments.forEach(d => console.log(`- ${d.name} (${d.code})`));

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkDepartments();
