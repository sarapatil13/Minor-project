const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let studentToken = '';
let adminToken = '';
let paperId = '';
let deptId = '';

// Helper to log and execute
async function runTest(name, curlCmd, fn) {
    console.log(`\n--- TEST: ${name} ---`);
    console.log(`CURL: ${curlCmd}`);
    try {
        await fn();
        console.log('RESULT: SUCCESS');
    } catch (err) {
        console.error('RESULT: FAILED');
        console.error('Error:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

async function main() {
    // 0. Get Departments (to get a valid ID)
    await runTest('Get Departments', `curl ${BASE_URL}/departments`, async () => {
        const res = await fetch(`${BASE_URL}/departments`);
        const data = await res.json();
        if (!data.length) throw new Error('No departments found');
        deptId = data[0]._id;
        console.log('Using Department:', data[0].name);
    });

    // 1. Register Student
    await runTest('Register Student',
        `curl -X POST ${BASE_URL}/auth/register -H "Content-Type: application/json" -d '{"fullName":"Test Student","email":"student${Date.now()}@test.com","password":"password123","role":"student","departmentId":"${deptId}"}'`,
        async () => {
            const res = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: 'Test Student',
                    email: `student${Date.now()}@test.com`,
                    password: 'password123',
                    role: 'student',
                    departmentId: deptId
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            studentToken = data.token;
            console.log('Student Registered. Token acquired.');
        }
    );

    // 2. Upload Paper
    await runTest('Upload Paper',
        `curl -X POST ${BASE_URL}/papers -H "Authorization: Bearer ${studentToken}" -F "title=Test Paper" -F "abstract=This is a test abstract." -F "departmentId=${deptId}" -F "file=@test.pdf"`,
        async () => {
            const boundary = '--------------------------' + Date.now().toString(16);
            const fileContent = fs.readFileSync(path.join(__dirname, 'test.pdf'));

            let body = Buffer.concat([
                Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nTest Paper\r\n`),
                Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="abstract"\r\n\r\nThis is a test abstract for the paper.\r\n`),
                Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="departmentId"\r\n\r\n${deptId}\r\n`),
                Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="authors"\r\n\r\n["Test Author"]\r\n`),
                Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
                fileContent,
                Buffer.from(`\r\n--${boundary}--`)
            ]);

            const res = await fetch(`${BASE_URL}/papers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${studentToken}`,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`
                },
                body: body
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || JSON.stringify(data));
            paperId = data._id;
            console.log('Paper Uploaded. ID:', paperId);
        }
    );

    // 3. Login Admin
    await runTest('Login Admin',
        `curl -X POST ${BASE_URL}/auth/login -H "Content-Type: application/json" -d '{"email":"admin@college.edu","password":"Admin@123"}'`,
        async () => {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@college.edu', password: 'Admin@123' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            adminToken = data.token;
            console.log('Admin Logged in.');
        }
    );

    // 4. Approve Paper
    await runTest('Approve Paper',
        `curl -X PATCH ${BASE_URL}/admin/approve-paper/${paperId} -H "Authorization: Bearer ${adminToken}"`,
        async () => {
            const res = await fetch(`${BASE_URL}/admin/approve-paper/${paperId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            console.log('Paper Approved.');
        }
    );

    // 5. Check Public Papers
    await runTest('Check Public Papers',
        `curl ${BASE_URL}/papers`,
        async () => {
            const res = await fetch(`${BASE_URL}/papers`);
            const data = await res.json();
            const found = data.find(p => p._id === paperId);
            if (!found) throw new Error('Approved paper not found in public list');
            console.log('Approved paper found in public list.');
        }
    );

    // 6. AI Summary
    await runTest('AI Summary',
        `curl -X POST ${BASE_URL}/ai/summary -H "Content-Type: application/json" -d '{"abstract":"This is a test abstract."}'`,
        async () => {
            const res = await fetch(`${BASE_URL}/ai/summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ abstract: "This is a test abstract. It is used to test the summary feature. Hopefully it works." })
            });
            const data = await res.json();
            console.log('Summary:', data.summary);
        }
    );

    // 7. AI Chat
    await runTest('AI Chat',
        `curl -X POST ${BASE_URL}/ai/chat -H "Content-Type: application/json" -d '{"question":"Papers from CSE in 2024"}'`,
        async () => {
            const res = await fetch(`${BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: "Papers from CSE in 2024" })
            });
            const data = await res.json();
            console.log('Answer:', data.answerText);
        }
    );
}

main();
