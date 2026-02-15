// importing
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const path = require("path");
const engine = require("ejs-mate");
const mongoose = require("mongoose");
const { constants } = require("buffer");
const session = require("express-session");
// const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const portfolioModel = require("./schema/portfolio");
const userModel = require("./schema/user.js");
const adminRouter = require("./routes/admin.js");
const methodOverride = require("method-override");
const PDFDocument = require("pdfkit");
const cvRoutes = require("./routes/cvgenerator.js");
const multer = require("multer");
const { resolveSoa } = require("dns");
const projectRoute = require("./routes/project.js");
const experienceRoute = require("./routes/experience.js");
// const upload = multer({ dest: 'uploads/' })

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'uploads/'); // folder
//   },
//   filename: function(req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname); // unique filename
//   }
// });

const { storage } = require("./cloudnaryConfig.js");
const upload = multer({ storage });

// variables
PORT = process.env.PORT || 3000;
const LOCALMONGODBURL = process.env.LOCALMONGODBURL;
const MONGO_ATLAS_URL = process.env.MONGO_ATLAS_URL;

const connectMongodb = async () => {
  try {
    const conn = await mongoose.connect(MONGO_ATLAS_URL);
    return conn;
  } catch (error) {
    handleError(error);
  }
};

connectMongodb()
  .then((result) => {
    console.log(`Result :  ${result}`);
  })
  .catch((err) => {
    console.log(`Some error occured during connect ${err}`);
  });

// middlewares

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY, // change in production
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_ATLAS_URL,
      collectionName: "sessions",
      touchAfter: 24 * 3600,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

app.use(flash());
// ------------------- PASSPORT ----------------------
app.use(passport.initialize());
app.use(passport.session());

// Use passport-local with email as username
passport.use(
  new LocalStrategy({ usernameField: "email" }, userModel.authenticate()),
);

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// use ejs-locals for all ejs templates:
app.engine("ejs", engine);
// ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// public / static path setting
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
app.use(methodOverride("_method"));

// custom middlewares

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/atul-admin");
}

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;
  next();
});
// routes

app.get("/", async (req, res) => {
  try {
    let result = await portfolioModel.findOne();

    // ⭐ One-time universal fix
    result = result || {};

    // Assign default empty values to all fields expected in EJS
    const safeResult = {
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

    res.render("pages/landingpage1", {
      currentPage: "home",
      result: safeResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/contact", async (req, res) => {
  let result = await portfolioModel.findOne();
  // ⭐ One-time universal fix
  result = result || {};

  // Assign default empty values to all fields expected in EJS
  const safeResult = {
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

  res.render("./pages/contact.ejs", {
    currentPage: "contact",
    result: safeResult,
  });
});

// admin

app.use("/atul-admin", adminRouter);

// // demo record
// app.get("/demoRecord", async (req, res) => {
//   try {
//     const record = new portfolioModel({
//       position: "Software Developer",
//       introduction: "Passionate developer with experience in building web applications.",
//       experience: [
//         {
//           company: "ABC Corp",
//           description: "Worked on backend APIs",
//           designation: "Backend Developer",
//           DOJ: new Date("2022-01-01"),
//           DOL: new Date("2023-01-01") // ✅ DOL >= DOJ
//         }
//       ],
//       education: [
//         {
//           insitute: "XYZ University",
//           course: "B.Tech Computer Science",
//           grade: "A",
//           from: new Date("2018-07-01"),
//           to: new Date("2022-05-01") // ✅ to >= from
//         }
//       ],
//       projects: [
//         {
//           projectName: "Portfolio Website",
//           description: "Personal portfolio built with MERN stack",
//           technologies: ["React", "Node.js", "MongoDB"]
//         }
//       ],
//       contact: {
//         name: "John Doe",
//         contact: "1234567890",
//         email: "johndoe@example.com",
//         address: "123 Street, City, Country"
//       },
//       socialmedia: {
//         instagram: "https://instagram.com/johndoe",
//         linkedin: "https://linkedin.com/in/johndoe",
//         github: "https://github.com/johndoe",
//         facebook: "https://facebook.com/johndoe"
//       },
//       profileimage: { path: "", filename: "" },
//       skillexpertise: {
//         languages: "JavaScript, Python",
//         webtech: "HTML, CSS, JS",
//         frameworkLibrary: "Express, React",
//         databases: "MongoDB",
//         toolsplateforms: "VSCode, Git",
//         professionalskills: "Teamwork, Problem Solving"
//       },
//       academicprojects: "Smart Home Automation",
//       certifications: "MongoDB Basics"
//     });

//     const result = await record.save();
//     res.send(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error creating demo record");
//   }
// });

app.get("/register", isLoggedIn, async (req, res) => {
  try {
    const email = process.env.USERLOGINEMAIL;
    const password = process.env.USERPASSWORD;

    const user = new userModel({ email });
    await userModel.register(user, password); // password gets hashed automatically

    res.send("User registered successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/atul-admin",
    successRedirect: "/atul-admin/dashboard",
    failureFlash: true,
  }),
);

app.get("/logout", isLoggedIn, (req, res) => {
  req.logout(() => {
    // res.send("Logged out successfully");
    res.redirect("/atul-admin");
  });
});

// generate resume pdf
app.get("/generate-cv1", async (req, res) => {
  try {
    const user = await portfolioModel.findOne();

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response headers to indicate a PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="CV_${user.contact.name}.pdf"`,
    );

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Add content to the PDF
    doc
      .fontSize(25)
      .text(`Curriculum Vitae: ${user.contact.name}`, { align: "center" });
    doc.moveDown();

    doc.fontSize(16).text("Contact Information:");
    doc.fontSize(12).text(`Email: ${user.contact.email}`);
    doc.text(`Phone: ${user.contact.contact}`);
    doc.moveDown();

    doc.fontSize(16).text("Education:");
    // Loop through user's education array (example)
    user.education.forEach((edu) => {
      doc.fontSize(12).text(`${edu.course} from ${edu.insitute}, ${edu.to}`);
    });
    doc.moveDown();

    doc.fontSize(16).text("Experience:");
    // Loop through user's experience array (example)
    user.experience.forEach((exp) => {
      doc.fontSize(12).text(`${exp.designation} at ${exp.company}, ${exp.DOL}`);
    });
    // Add more sections as needed (skills, projects, etc.)

    // Finalize the PDF and end the stream
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});

app.use("/", cvRoutes);
app.use("/projects/", projectRoute);
app.use("/experience/", experienceRoute);

// image profile
app.put("/profile/:id", upload.single("profileimage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const imagePath = req.file.path; // Cloudinary URL
    const filename = req.file.filename; // Cloudinary public_id

    await portfolioModel.findByIdAndUpdate(req.params.id, {
      profileimage: {
        path: imagePath,
        filename: filename,
      },
    });

    res.redirect("/atul-admin/profileimage");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating profile image");
  }
});

app.get("*splash", (req, res) => {
  res.render("./pages/pagenotfound.ejs", {
    currentPage: "404 | Page Error",
  });
});

//   app.get("/dashboard", isLoggedIn, (req, res) => {
//   // res.send(`Welcome ${req.user.email}, you are logged in.`);
//   res.render
// });

app.listen(PORT, () => {
  console.log(`Server is listening on port : ${PORT}`);
});
