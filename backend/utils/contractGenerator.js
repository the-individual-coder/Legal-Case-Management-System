// backend/utils/contractGenerator.js
const fs = require("fs-extra");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

/**
 * renderTemplateToPdf
 * - templatePath: absolute path to .hbs file
 * - context: object for Handlebars
 * - returns: Buffer (PDF bytes)
 */
async function renderTemplateToPdf({ templatePath, context, pdfOptions = {} }) {
  const templateSrc = await fs.readFile(templatePath, "utf8");
  const template = Handlebars.compile(templateSrc);
  const html = template(context);

  // Launch Puppeteer and render HTML to PDF buffer
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();

    // Set content and wait until network idle to ensure css/images load
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Default page format: A4, you can change
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
      ...pdfOptions,
    });

    await page.close();
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = {
  renderTemplateToPdf,
};
