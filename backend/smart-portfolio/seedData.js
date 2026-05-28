require("dotenv").config();
const mongoose = require("mongoose");
const Achievement = require("./models/Achievement");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected for seeding"))
  .catch(err => console.log(err));

const types = ["paper", "event"];
const paperData = [
  { title: "AI Optimization", desc: "Explored novel neural network architectures to reduce training time by 20% on edge devices." },
  { title: "Deep Learning in Healthcare", desc: "Developed a diagnostic model using CNNs for early detection of lung anomalies." },
  { title: "Computer Vision Systems", desc: "Published a comparative study on object detection algorithms under low-light conditions." },
  { title: "NLP Systems", desc: "Authored a paper on zero-shot learning capabilities of large language models in domain-specific tasks." },
  { title: "Distributed AI", desc: "Presented findings on federated learning approaches to maintain data privacy in distributed networks." },
  { title: "Cloud Computing Paradigms", desc: "Analyzed the performance metrics of serverless architectures for high-traffic AI workloads." },
  { title: "Data Mining Techniques", desc: "Proposed a new clustering algorithm that improves anomaly detection in time-series data." },
  { title: "Blockchain Systems", desc: "Investigated consensus mechanisms for reducing latency in decentralized finance applications." }
];

const eventData = [
  { title: "Global Hackathon 2023", desc: "Collaborated in a team of four to build a real-time carbon footprint tracker, winning 2nd place." },
  { title: "AI Innovation Workshop", desc: "Completed intensive hands-on training for deploying scalable machine learning models on AWS." },
  { title: "Tech Leadership Seminar", desc: "Engaged with industry leaders to discuss the ethical implications of autonomous systems." },
  { title: "Open Source Coding Contest", desc: "Contributed over 50 commits to a popular open-source repository over a 48-hour period." },
  { title: "Annual Tech Fest", desc: "Showcased a prototype for an IoT-based smart home security system." },
  { title: "International Web3 Conference", desc: "Attended sessions on smart contract security and decentralized identity solutions." }
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateData() {
  const data = [];

  for (let i = 101; i <= 150; i++) {
    const studentId = i.toString();

    const entriesCount = Math.floor(Math.random() * 6) + 3; // 3–8 entries

    const usedTitles = new Set(); // To prevent duplicate exact entries for a student

    for (let j = 0; j < entriesCount; j++) {
      const type = randomItem(types);
      let selectedItem;
      
      // Ensure we don't pick the exact same paper/event twice for realism
      let attempts = 0;
      do {
        selectedItem = type === "paper" ? randomItem(paperData) : randomItem(eventData);
        attempts++;
      } while (usedTitles.has(selectedItem.title) && attempts < 10);
      
      usedTitles.add(selectedItem.title);

      data.push({
        studentId,
        type,
        title: selectedItem.title,
        description: selectedItem.desc,
        year: 2021 + Math.floor(Math.random() * 5), // 2021–2025
        status: "approved"
      });
    }
  }

  return data;
}

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }
    
    await Achievement.deleteMany({});
    console.log("Cleared old achievements.");
    
    const data = generateData();
    await Achievement.insertMany(data);
    
    console.log(`Successfully seeded ${data.length} realistic achievements!`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
