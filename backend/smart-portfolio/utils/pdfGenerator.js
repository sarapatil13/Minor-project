const puppeteer = require("puppeteer");

async function generatePDF(html) {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new"
  });

  const page = await browser.newPage();
  await page.setContent(html);

  await page.pdf({
    path: "portfolio.pdf",
    format: "A4"
  });

  await browser.close();
}

module.exports = generatePDF;   // ✅ THIS LINE IS CRITICAL