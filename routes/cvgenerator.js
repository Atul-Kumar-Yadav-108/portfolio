const express = require('express');
const router = express.Router();
const portfolioModel = require("../schema/portfolio.js");
const ejs = require('ejs');
const path = require('path');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

router.get('/generate-cv', async (req, res) => {
    try {
        const user = await portfolioModel.findOne();
        if (!user) return res.status(404).send('यूजर नहीं मिला');

        const filePath = path.join(__dirname, '../views/pages/cv_builder.ejs');
        const htmlContent = await ejs.renderFile(filePath, { user: user });

        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="CV_${user.contact.name}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error in generating PDF:', error);
        res.status(500).send('Problem occurs while generating PDF');
    }
});

module.exports = router;
