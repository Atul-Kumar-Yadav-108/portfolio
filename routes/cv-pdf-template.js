// cv-pdf-template.js
const PDFDocument = require("pdfkit");
const { htmlToText } = require("html-to-text");


function createCV(doc, user) {

    // ---------- HEADER ----------
    doc.fillColor("#0056b3").fontSize(22).text(user.contact.name, { align: "center" });

    doc.moveDown(0.3);
    doc.fillColor("black").fontSize(14).text(user.position, { align: "center" });

    doc.moveDown(0.3);
    doc.fontSize(10).text(
        `${user.contact.address} | ${user.contact.email} | ${user.contact.contact}`,
        { align: "center" }
    );

    doc.text(`LinkedIn: ${user.socialmedia.linkedin}`, { align: "center" });
    doc.moveDown(0.3);
    doc.text(`Portfolio: https://portfolio-atul-kumar-yadav.onrender.com/ `, { align: "center" });
    doc.moveDown(1);

    // ---------- SECTION HEADING ----------
    const addSection = (title) => {
        doc.moveDown(0.8);
        doc.fillColor("#0056b3").fontSize(16).text(title);  // Blue H2

        doc.moveTo(doc.x, doc.y)
            .lineTo(550, doc.y)
            .stroke("#0056b3");

        doc.moveDown(0.5);
        doc.fillColor("black"); // IMPORTANT: Switch back to black for content
    };

    // ---------- SUMMARY ----------
    addSection("Summary");
    doc.fontSize(10).text(htmlToText(user.introduction || "", { wordwrap: false }) || "", { align: "left" });

    // ---------- EXPERIENCE ----------
    addSection("Work Experience");

    user.experience.reverse().forEach(exp => {
        const DOJ = formatMonthYear(exp.DOJ);
        const DOL = exp.DOL ? formatMonthYear(exp.DOL) : "Present";

        doc.fontSize(12).text(`${exp.designation} | ${exp.company}`);
        doc.fontSize(10).text(`[${DOJ} - ${DOL}]`);

        doc.moveDown(0.3).fontSize(10).text(htmlToText(exp.description || "", { wordwrap: false }));
        doc.moveDown(0.5);
    });

    // ---------- PROJECTS ----------
    addSection("Projects");

    user.projects.reverse().forEach(project => {
        doc.fontSize(12).text(`${project.projectName}  |  (${project.technologies})`);
        doc.moveDown(0.3).fontSize(10).text(htmlToText(project.description || "", { wordwrap: false }));
        doc.moveDown(0.5);
    });

    // ---------- SKILLS ----------
    addSection("Skills and Certifications");

    doc.fontSize(10).text(`Languages: ${user.skillexpertise.languages || ''}`);
    doc.text(`Web technologies: ${user.skillexpertise.webtech || ''}`);
    doc.text(`Frameworks / Libraries: ${user.skillexpertise.frameworkLibrary || ''}`);
    doc.text(`Databases: ${user.skillexpertise.databases || ''}`);
    doc.text(`Tools & Platforms: ${user.skillexpertise.toolsplateforms || ''}`);
    doc.text(`Professional skills: ${user.skillexpertise.professionalskills || ''}`);

    // ---------- EDUCATION ----------
    addSection("Education");

    user.education.reverse().forEach(edu => {
        doc.fontSize(12).text(`${edu.course}  [${edu.from.getFullYear()} - ${edu.to.getFullYear()}]`);
        doc.fontSize(10).text(edu.insitute);
        doc.text(`Grade/CGPA: ${edu.grade}`);
        doc.moveDown(0.5);
    });

    // ---------- CERTIFICATIONS ----------
    addSection("Certifications");

    doc.fontSize(10).text(htmlToText(user.certifications || "", { wordwrap: false }) || "");

    doc.end();
}

function formatMonthYear(dateStr) {
    const d = new Date(dateStr);
    const month = d.toLocaleString("default", { month: "short" });
    return `${month}/${d.getFullYear()}`;
}

module.exports = createCV;
