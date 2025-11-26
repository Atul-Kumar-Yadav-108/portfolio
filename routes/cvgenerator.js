const express = require('express');
const router = express.Router();
const portfolioModel = require("../schema/portfolio.js")
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/atul-admin");
}


router.get('/generate-cv', async (req, res) => {
    try {
        // 1. MongoDB से डेटा प्राप्त करें (मान लें कि User मॉडल सही है)
        const user = await portfolioModel.findOne();
        if (!user) {
            return res.status(404).send('यूजर नहीं मिला');
        }

        // 2. EJS टेम्पलेट को HTML स्ट्रिंग में रेंडर करें
        const filePath = path.join(__dirname, '../views/pages/cv_builder.ejs');
        const htmlContent = await ejs.renderFile(filePath, { user: user });

        // 3. Puppeteer का उपयोग करके HTML को PDF में बदलें
        const browser = await puppeteer.launch({
            // सर्वर पर (जैसे Heroku, Vercel) चलने के लिए ये आर्ग्युमेंट्स अक्सर ज़रूरी होते हैं
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' }); // पेज लोड होने तक प्रतीक्षा करें

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // background colors/images को प्रिंट करने के लिए
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        // 4. PDF फ़ाइल को यूजर को भेजें
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="CV_${user.contact.name}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('error in generating pdf:', error);
        res.status(500).send('Problem occurs while generating pdf');
    }
});

module.exports = router;