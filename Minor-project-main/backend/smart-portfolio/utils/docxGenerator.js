const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
const fs = require("fs");

async function generateDocx(data) {
  const children = [];

  // Title: Student Name
  children.push(
    new Paragraph({
      text: data.name || "Student Name",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 } // 120 twips = 6 pt
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Professional Portfolio",
          italics: true,
          size: 24, // 12pt (size is in half-points)
          color: "555555"
        })
      ]
    })
  );

  // Section: Core Publications
  if (data.publications && data.publications.length > 0) {
    children.push(
      new Paragraph({
        text: "CORE PUBLICATIONS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );

    for (const pub of data.publications) {
      // Bold Title (Year)
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: "• ",
              bold: true
            }),
            new TextRun({
              text: `${pub.title} `,
              bold: true
            }),
            new TextRun({
              text: `(${pub.year})`,
              bold: true,
              color: "444444"
            })
          ]
        })
      );

      // Indented Description
      children.push(
        new Paragraph({
          indent: { left: 360 }, // 0.25 inches
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: pub.description,
              size: 22, // 11pt
              color: "333333"
            })
          ]
        })
      );
    }
  }

  // Section: Activity & Engagements
  if (data.events && data.events.length > 0) {
    children.push(
      new Paragraph({
        text: "ACTIVITY & ENGAGEMENTS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );

    for (const event of data.events) {
      // Bold Title (Year)
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: "• ",
              bold: true
            }),
            new TextRun({
              text: `${event.title} `,
              bold: true
            }),
            new TextRun({
              text: `(${event.year})`,
              bold: true,
              color: "444444"
            })
          ]
        })
      );

      // Indented Description
      children.push(
        new Paragraph({
          indent: { left: 360 },
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: event.description,
              size: 22,
              color: "333333"
            })
          ]
        })
      );
    }
  }

  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: {
            size: 32, // 16pt
            bold: true,
            color: "000000",
            font: "Arial"
          },
          paragraph: {
            spacing: { before: 240, after: 120 }
          }
        },
        heading2: {
          run: {
            size: 26, // 13pt
            bold: true,
            color: "2563EB", // Blue accent
            font: "Arial"
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
            border: {
              bottom: {
                color: "E2E8F0",
                space: 1,
                value: "single",
                size: 6
              }
            }
          }
        },
        document: {
          run: {
            size: 22, // 11pt
            font: "Arial"
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: children
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("portfolio.docx", buffer);
}

module.exports = generateDocx;