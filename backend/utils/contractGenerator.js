const fs = require("fs-extra");
const path = require("path");
const Handlebars = require("handlebars");

async function renderTemplateToPdf({ templatePath, context, pdfOptions = {} }) {
  const templateSrc = await fs.readFile(templatePath, "utf8");
  const template = Handlebars.compile(templateSrc);
  const html = template(context);

  let browser = null;

  try {
    // Check if we're on Render or any production environment
    const isProduction =
      process.env.NODE_ENV === "production" || process.env.RENDER === "true";

    if (isProduction) {
      // Production (Render) - use puppeteer-core with @sparticuz/chromium
      const puppeteerCore = require("puppeteer-core");
      const chromium = require("@sparticuz/chromium");

      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      // Local development - use full puppeteer (includes Chrome)
      const puppeteer = require("puppeteer");

      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
      ...pdfOptions,
    });

    await page.close();
    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  renderTemplateToPdf,
};
