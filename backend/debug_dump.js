const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Paper = require('./models/Paper');
const User = require('./models/User');
const Department = require('./models/Department');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const logs = [];
        const log = (msg) => { console.log(msg); logs.push(msg); };

        const admin = await User.findOne({ role: 'admin' });
        log("Admin Found: " + (admin ? admin.email : "Not Found"));

        if (admin) {
            log("Querying for ADMIN: { status: 'pending_admin' }");
            const papers = await Paper.find({ status: 'pending_admin' });
            log("Papers Found via Admin Query: " + papers.length);

            if (papers.length > 0) {
                log("Sample Paper Title: " + papers[0].title);
                log("Sample Paper Status: " + papers[0].status);
            } else {
                log("No papers found with status 'pending_admin'. Checking ALL papers statuses:");
                const alld = await Paper.find({}, 'title status');
                alld.forEach(p => log(`${p.title}: ${p.status}`));
            }
        }

        const output = {
            logs: logs
        };

        const fs = require('fs');
        fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));
        console.log("Debug output written to debug_output.json");
        process.exit();

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

debug();
