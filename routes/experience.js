const express = require("express");
const portfolioModel = require("../schema/portfolio.js");

function makeSafeResult(result) {
  result = result || {};

  return {
    _id: result._id ? result._id.toString() : "",
    position: result.position || "",
    introduction: result.introduction || "",
    experience: result.experience || [],
    education: result.education || [],
    projects: result.projects || [],
    contact: result.contact || {
      name: "",
      contact: "",
      email: "",
      address: "",
    },
    socialmedia: result.socialmedia || {
      instagram: "",
      linkedin: "",
      github: "",
      facebook: "",
    },
    profileimage: result.profileimage || { path: "", filename: "" },
    skillexpertise: result.skillexpertise || {
      languages: "",
      webtech: "",
      frameworkLibrary: "",
      databases: "",
      toolsplateforms: "",
      professionalskills: "",
    },
    academicprojects: result.academicprojects || "",
    certifications: result.certifications || "",
  };
}

const experienceRoute = express.Router();

experienceRoute.get("/:id", async (req, res) => {
  try {
    const result = makeSafeResult(null);
    const experience_id = req.params.id;

    // 1️⃣ Validate ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(experience_id)) {
      return res.render("./pages/pagenotfound.ejs", {
        currentPage: "Experience Details",
        result: result,
      });
    }

    // 2️⃣ Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(experience_id);

    // 3️⃣ Query safely
    const exp = await portfolioModel
      .findOne(
        { "experience._id": objectId },
        { experience: { $elemMatch: { _id: objectId } } },
      )
      .lean(); // lean() for faster query

    // console.log(exp);

    // 4️⃣ Handle not found
    if (!exp) {
      return res.render("./pages/pagenotfound.ejs", {
        currentPage: "Experience Details",
        result: result,
      });
    }

    // 5️⃣ Render project details
    res.render("./pages/exp_details.ejs", {
      experience: exp.experience[0],
      currentPage: "Experience Details",
      result: result,
    });

    // console.log(project_id);
  } catch (error) {
    console.log(error);
  }
});

module.exports = experienceRoute;
