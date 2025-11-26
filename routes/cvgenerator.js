// cvgenerator.js
const express = require('express');
const router = express.Router();
const portfolioModel = require("../schema/portfolio.js");
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/atul-admin");
}

// Route to generate CV PDF
router.get('/generate-cv', async (req, res) => {
  try {
    // 1️⃣ MongoDB से डेटा प्राप्त करें
    const user = await portfolioModel.findOne();
    if (!user) {
      return res.status(404).send('यूजर नहीं मिला');
    }

    // 2️⃣ EJS टेम्पलेट को HTML में रेंडर करें
    const filePath = path.join(__dirname, '../views/pages/cv_builder.ejs');
    const htmlContent = await ejs.renderFile(filePath, { user: user });

    // 3️⃣ Puppeteer का उपयोग करके HTML को PDF में बदलें
    const browser = await puppeteer.launch({
      headless: true,  // server environment
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: puppeteer.executablePath() // Render par Chrome ka sahi path
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    // 4️⃣ PDF को user को bhej dein
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CV_${user.contact.name}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error in generating PDF:', error);
    res.status(500).send('Problem occurs while generating PDF');
  }
});

module.exports = router;