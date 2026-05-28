const express = require("express");
const router = express.Router();

const Achievement = require("../models/Achievement");
const Portfolio = require("../models/Portfolio");

console.log("Portfolio routes loaded");

// IMPORTS
const fs = require("fs");
const path = require("path");
const formatData = require("../services/formatter");
const renderTemplate = require("../utils/templateEngine");
const generatePDF = require("../utils/pdfGenerator");
const generateDocx = require("../utils/docxGenerator");
const enhanceText = require("../services/aiEnhancer");


// ========================
// GENERATE PORTFOLIO (PDF / DOCX)
// ========================
router.get("/generate/:studentId", async (req, res) => {
  try {
    const format = req.query.format || "pdf";

    // 1. Validate studentId
    if (!req.params.studentId || req.params.studentId.length < 1) {
      return res.status(400).json({ error: "Invalid Student ID provided." });
    }

    // 2. Fetch data
    let raw = await Achievement.find({
      studentId: req.params.studentId,
      status: "approved"
    });

    if (!raw || raw.length === 0) {
      return res.status(404).json({ error: `No approved achievements found for student ${req.params.studentId}.` });
    }

    // 3. SMART AI Enhancement
    raw = await Promise.all(
      raw.map(async (item) => {
        let desc = item.description || "";

        const needsAI =
          desc.length < 60 &&
          !desc.toLowerCase().includes("developed") &&
          !desc.toLowerCase().includes("designed") &&
          !desc.toLowerCase().includes("implemented");

        if (needsAI) {
          console.log("AI USED →", desc);
          desc = await enhanceText(desc);
        } else {
          console.log("AI SKIPPED →", desc);
        }

        return {
          ...item._doc,
          description: desc
        };
      })
    );

    // 4. Format data
    const formatted = formatData(raw);

    // ========================
    // DOCX EXPORT
    // ========================
    if (format === "docx") {
      await generateDocx({
        name: "Student Name",
        ...formatted
      });

      await new Portfolio({
        studentId: req.params.studentId,
        fileName: "portfolio.docx"
      }).save();

      return res.download("portfolio.docx");
    }

    // ========================
    // PDF EXPORT
    // ========================
    const templateType = req.query.template || "professional";

    let templatePath = path.join(
      __dirname,
      `../templates/${templateType}.html`
    );

    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(__dirname, "../templates/professional.html");
    }

    const template = fs.readFileSync(templatePath, "utf-8");

    const html = renderTemplate(template, {
      name: "Student Name",
      ...formatted
    });

    await generatePDF(html);

    await new Portfolio({
      studentId: req.params.studentId,
      fileName: "portfolio.pdf"
    }).save();

    res.download("portfolio.pdf");

  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ========================
// HISTORY ROUTE
// ========================
router.get("/history/:studentId", async (req, res) => {
  try {
    const data = await Portfolio.find({
      studentId: req.params.studentId
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ========================
// RAW DATA (KEEP LAST ALWAYS)
// ========================
router.get("/:studentId", async (req, res) => {
  try {
    const data = await Achievement.find({
      studentId: req.params.studentId,
      status: "approved"
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;