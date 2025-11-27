const express = require('express');
const router = express.Router();
const portfolioModel = require("../schema/portfolio.js");
const PDFDocument = require("pdfkit");
const createCV = require("./cv-pdf-template");

router.get('/generate-cv', async (req, res) => {
    try {
        const user = await portfolioModel.findOne(); // or from DB
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${user.contact.name}.pdf`);

    doc.pipe(res);

    
    createCV(doc, user);

    } catch (error) {
        console.error('Error in generating PDF:', error);
        res.status(500).send('Problem occurs while generating PDF');
    }
});

module.exports = router;
