const express = require("express");
const portfolioModel = require("../schema/portfolio.js");

const router = express.Router();

const methodOverride = require("method-override");

// form me _method use karne ke liye
router.use(methodOverride("_method"));

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

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/atul-admin");
}

router.get("/", (req, res) => {
  res.render("./pages/admin/loginPage.ejs", {
    currentPage: "",
    error: req.flash("error"),
  });
});

router.get("/dashboard", isLoggedIn, async (req, res) => {
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: req.originalUrl,
    data,
  });
});

router.get("/position", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  // console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

router.put("/position/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const { position } = req.body;
  await portfolioModel.findByIdAndUpdate(id.id, { position });
  res.redirect("/atul-admin/dashboard");
});

router.get("/introduction", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

router.put("/introduction/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const { introduction } = req.body;
  await portfolioModel.findByIdAndUpdate(id.id, { introduction });
  res.redirect("/atul-admin/dashboard");
});
router.get("/experience", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

router.post("/experience/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const { company, designation, description, doj, dol } = req.body;
  await portfolioModel.findByIdAndUpdate(
    id.id,
    {
      $push: {
        experience: { company, designation, description, DOJ: doj, DOL: dol },
      },
    },
    { new: true },
  );
  res.redirect("/atul-admin/experience");
  // res.send(req.body)
});

// experience view
router.get(
  "/portfolio/:protid/experience/:expid",
  isLoggedIn,
  async (req, res) => {
    try {
      const portfolio = await portfolioModel.findOne(
        { _id: req.params.protid, "experience._id": req.params.expid },
        { "experience.$": 1 },
      );

      if (!portfolio) {
        return res.status(404).json({ error: "Experience not found" });
      }

      res.json(portfolio.experience[0]);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// experience edit view
router.get("/experience/edit/:protid/:expid", isLoggedIn, async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne(
      { _id: req.params.protid, "experience._id": req.params.expid },
      { "experience.$": 1 },
    );

    if (!portfolio) {
      return res.status(404).json({ error: "Experience not found" });
    }

    res.json(portfolio.experience[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/experience/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const { company, description, doj, dol } = req.body;
  await portfolioModel.findByIdAndUpdate(
    id.id,
    { $push: { experience: { company, description, DOJ: doj, DOL: dol } } },
    { new: true },
  );
  res.redirect("/atul-admin/experience");
  // res.send(req.body)
});

// experience update
// router.put("/experience/:id", async (req, res) => {
//     try {
//   const id = req.params.id;
//       const {expId,company, description, doj, dol} = req.body;
//       await portfolioModel.findByIdAndUpdate({id : id.id,"experience._id" : expId}, { $set : { experience : { company, description, DOJ : doj, DOL : dol }}}, { new: true });
//     res.redirect("/atul-admin/experience")

//     } catch (err) {
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

router.put("/experience/:expid", isLoggedIn, async (req, res) => {
  try {
    const portfolioId = req.body.portfolioId; // hidden input in form
    const expId = req.body.expId; // hidden input in form
    const { company, designation, description, doj, dol } = req.body;

    await portfolioModel.updateOne(
      { _id: portfolioId, "experience._id": expId }, // find correct experience
      {
        $set: {
          "experience.$.company": company,
          "experience.$.designation": designation,
          "experience.$.description": description,
          "experience.$.DOJ": doj,
          "experience.$.DOL": dol,
        },
      },
    );

    res.redirect("/atul-admin/experience");
    // res.send(req.body)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// experience delete
router.post(
  "/experience/delete/:protid/:expid",
  isLoggedIn,
  async (req, res) => {
    const { protid, expid } = req.params;

    await portfolioModel.findByIdAndUpdate(protid, {
      $pull: { experience: { _id: expid } },
    });

    res.redirect("/atul-admin/experience");
  },
);

router.get("/education", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

// add education
router.post("/education/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const { insitute, course, grade, from, to } = req.body;
  await portfolioModel.findByIdAndUpdate(
    id.id,
    {
      $push: {
        education: {
          insitute,
          course,
          grade,
          from,
          to,
        },
      },
    },
    { new: true },
  );
  res.redirect("/atul-admin/education");
  // res.send(req.body);
});

// /view education
router.get("/education/view/:protid/:eduid", isLoggedIn, async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne(
      { _id: req.params.protid, "education._id": req.params.eduid },
      { "education.$": 1 },
    );

    if (!portfolio) {
      return res.status(404).json({ error: "Experience not found" });
    }

    res.json(portfolio.education[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// /edit education
router.get("/education/edit/:protid/:eduid", isLoggedIn, async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne(
      { _id: req.params.protid, "education._id": req.params.eduid },
      { "education.$": 1 },
    );

    if (!portfolio) {
      return res.status(404).json({ error: "Experience not found" });
    }

    res.json(portfolio.education[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// update education
router.put("/education/:eduid", isLoggedIn, async (req, res) => {
  try {
    const portfolioId = req.body.portfolioId; // hidden input in form
    const eduid = req.body.eduid; // hidden input in form
    const { insitute, course, grade, from, to } = req.body;

    await portfolioModel.updateOne(
      { _id: portfolioId, "education._id": eduid }, // find correct education
      {
        $set: {
          "education.$.insitute": insitute,
          "education.$.course": course,
          "education.$.grade": grade,
          "education.$.from": from,
          "education.$.to": to,
        },
      },
    );

    res.redirect("/atul-admin/education");
    // res.send(req.body)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// delete education
// experience delete
router.post(
  "/education/delete/:protid/:eduid",
  isLoggedIn,
  async (req, res) => {
    const { protid, eduid } = req.params;
    console.log(protid, eduid);

    await portfolioModel.findByIdAndUpdate(protid, {
      $pull: { education: { _id: eduid } },
    });

    res.redirect("/atul-admin/education");
  },
);

router.get("/projects", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

// create project
router.post("/projects/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  let { projectname, description, technologies, liveUrl } = req.body;
  let techArray = JSON.parse(technologies);
  technologies = techArray.map((item) => item.value);
  await portfolioModel.findByIdAndUpdate(id.id, {
    $push: {
      projects: {
        projectName: projectname,
        description,
        technologies,
        liveUrl,
      },
    },
  });
  res.redirect("/atul-admin/projects");
  // res.send(req.body)
});

// view project
router.get("/projects/:portid/:projid", isLoggedIn, async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne(
      { _id: req.params.portid, "projects._id": req.params.projid },
      { "projects.$": 1 },
    );

    if (!portfolio) {
      return res.status(404).json({ error: "Experience not found" });
    }

    res.json(portfolio.projects[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// edit project
router.get("/projects/edit/:portid/:projid", isLoggedIn, async (req, res) => {
  const portid = req.params.portid;
  const projid = req.params.projid;
  // console.log("first",projid, portid);
  try {
    let portfolio = await portfolioModel.findOne(
      {
        _id: portid,
        "projects._id": projid,
      },
      {
        "projects.$": 1,
      },
    );
    if (!portfolio) {
      return res.status(404).json({ error: "Experience not found" });
    }
    res.json(portfolio.projects[0]);
  } catch (error) {
    console.log("error : ", error);
  }
});

// update project
router.put("/projects/edit/:portid", isLoggedIn, async (req, res) => {
  const portid = req.body.portfolioid;
  const projid = req.body.projectid;
  console.log("first", projid, portid);
  let technologies = req.body.technologies;
  let techArray = await JSON.parse(technologies);
  technologies = techArray.map((tech) => tech.value);
  try {
    let portfolio = await portfolioModel.findOneAndUpdate(
      {
        _id: portid,
        "projects._id": projid,
      },
      {
        $set: {
          "projects.$.projectName": req.body.projectname,
          "projects.$.description": req.body.description,
          "projects.$.technologies": technologies,
          "projects.$.liveUrl": req.body.liveUrl,
        },
      },
    );
    res.redirect("/atul-admin/projects");
  } catch (error) {
    console.log("error : ", error);
  }
  // res.send(req.body)
});

// delete project
router.post(
  "/projects/delete/:portid/:projid",
  isLoggedIn,
  async (req, res) => {
    const { portid, projid } = req.params;

    await portfolioModel.findByIdAndUpdate(portid, {
      $pull: { projects: { _id: projid } },
    });

    res.redirect("/atul-admin/projects");
  },
);

router.put("/projects/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const { introduction } = req.body;
  await portfolioModel.findByIdAndUpdate(id.id, { introduction });
  res.redirect("/atul-admin/dashboard");
});

// contact view
router.get("/contact", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});
// update contact
router.put("/contact/:projectid", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const { name, contact, email, address } = req.body;
  try {
    const data = await portfolioModel.findByIdAndUpdate(
      req.params.projectid,
      {
        $set: {
          contact: {
            name,
            contact,
            email,
            address,
          },
        },
      },
      { new: true },
    );
    // console.log(data);
    res.redirect("/atul-admin/contact");
  } catch (error) {
    console.log("Update Error:", error);
    res.status(500).send("Server error");
  }
});

router.get("/socialmedia", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

router.put("/socialmedia/:projectid", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const { instagram, linkedin, github, facebook } = req.body;
  try {
    const data = await portfolioModel.findByIdAndUpdate(
      req.params.projectid,
      {
        $set: {
          socialmedia: {
            instagram,
            linkedin,
            github,
            facebook,
          },
        },
      },
      { new: true },
    );
    // console.log(data);
    res.redirect("/atul-admin/socialmedia");
  } catch (error) {
    console.log("Update Error:", error);
    res.status(500).send("Server error");
  }
});

// certifications

router.get("/certifications", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

router.put("/certifications/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const { certifications } = req.body;
  await portfolioModel.findByIdAndUpdate(id.id, { certifications });
  res.redirect("/atul-admin/dashboard");
});

// academicprojects

router.get("/academicprojects", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

router.put("/academicprojects/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const { academicprojects } = req.body;
  await portfolioModel.findByIdAndUpdate(id.id, { academicprojects });
  res.redirect("/atul-admin/dashboard");
});

// skillexpertise

router.get("/skillexpertise", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

router.put("/skillexpertise/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const {
    languages,
    webtech,
    frameworkLibrary,
    databases,
    toolsplateforms,
    professionalskills,
  } = req.body;
  await portfolioModel.findByIdAndUpdate(
    id.id,
    {
      $set: {
        skillexpertise: {
          languages,
          webtech,
          frameworkLibrary,
          databases,
          toolsplateforms,
          professionalskills,
        },
      },
    },
    { new: true },
  );
  res.redirect("/atul-admin/dashboard");
});

// profile image

router.get("/profileimage", isLoggedIn, async (req, res) => {
  const parts = req.originalUrl.split("/");
  let data = await portfolioModel.findOne();
  data = makeSafeResult(data);
  console.log(data);
  res.render("./pages/admin/dashboard.ejs", {
    currentPage: "dashboard",
    url: parts.pop(),
    data: data,
  });
});

router.put("/skillexpertise/:id", isLoggedIn, async (req, res) => {
  // const parts = req.originalUrl.split('/');
  const id = req.params;
  const {
    languages,
    webtech,
    frameworkLibrary,
    databases,
    toolsplateforms,
    professionalskills,
  } = req.body;
  await portfolioModel.findByIdAndUpdate(
    id.id,
    {
      $set: {
        skillexpertise: {
          languages,
          webtech,
          frameworkLibrary,
          databases,
          toolsplateforms,
          professionalskills,
        },
      },
    },
    { new: true },
  );
  res.redirect("/atul-admin/dashboard");
});

module.exports = router;
