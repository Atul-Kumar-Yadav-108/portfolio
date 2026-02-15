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

const projectRoute = express.Router();

projectRoute.get("/", async (req, res) => {
  try {
    const result = makeSafeResult(null);
    const projects = await portfolioModel.find({}, { projects: 1, _id: 0 });
    res.render("./pages/project_all.ejs", {
      data: "I am atul kumar yadav",
      projects: projects[0]["projects"],
      currentPage: "Project List",
      result: result,
    });
  } catch (error) {}
});

projectRoute.get("/:id", async (req, res) => {
  try {
    const result = makeSafeResult(null);
    const project_id = req.params.id;

    // 1️⃣ Validate ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(project_id)) {
      return res.render("./pages/pagenotfound.ejs", {
        currentPage: "Project Details",
        result: result,
      });
    }

    // 2️⃣ Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(project_id);

    // 3️⃣ Query safely
    const project = await portfolioModel
      .findOne(
        { "projects._id": objectId },
        { projects: { $elemMatch: { _id: objectId } } },
      )
      .lean(); // lean() for faster query

    console.log(project);

    // 4️⃣ Handle not found
    if (!project) {
      return res.render("./pages/pagenotfound.ejs", {
        currentPage: "Project Details",
        result: result,
      });
    }

    // 5️⃣ Render project details
    res.render("./pages/project_details.ejs", {
      data: "I am atul kumar yadav",
      project: project.projects[0],
      currentPage: "Project Details",
      result: result,
    });

    // console.log(project_id);
  } catch (error) {}
});

module.exports = projectRoute;
