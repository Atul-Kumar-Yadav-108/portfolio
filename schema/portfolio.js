const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const portfolioSchema = new Schema({
  position: {
    type: String,
    required: true,
    minLength: 3,
  },
  introduction: {
    type: String,
    required: true,
    minLength: 10,
  },
  experience: [
    {
      company: {
        type: String,
        required: true,
        minLength: 3,
      },
      description: {
        type: String,
        required: true,
      },
      designation: {
        type: String,
        required: true,
      },
      DOJ: {
        type: Date,
        required: true,
      },
      DOL: {
        type: Date,
        validate: {
          validator: function (v) {
            // 'this' points to the subdocument
            if (!v) return true; // optional
            return v >= this.DOJ;
          },
          message: "DOL must be after DOJ",
        },
      },
    },
  ],
  education: [
    {
      insitute: {
        type: String,
        required: true,
        minLength: 3,
      },
      course: {
        type: String,
        required: true,
      },
      grade: {
        type: String,
        required: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        validate: {
          validator: function (v) {
            if (!v) return true;
            return v >= this.from;
          },
          message: "To must be after From",
        },
      },
    },
  ],
  projects: [
    {
      projectName: {
        type: String,
        required: true,
        minLength: 3,
      },
      description: {
        type: String,
        required: true,
      },
      technologies: {
        type: [String],
        default: [],
      },
      liveUrl: {
        type: String,
      },
    },
  ],
  contact: {
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  socialmedia: {
    instagram: {
      type: String,
      required: true,
    },
    linkedin: {
      type: String,
      required: true,
    },
    github: {
      type: String,
      required: true,
    },
    facebook: {
      type: String,
      required: true,
    },
  },
  profileimage: {
    path: String,
    filename: String,
  },
  skillexpertise: {
    languages: {
      type: String,
      required: true,
    },
    webtech: {
      type: String,
      required: true,
    },
    frameworkLibrary: {
      type: String,
      required: true,
    },
    databases: {
      type: String,
      required: true,
    },
    toolsplateforms: {
      type: String,
      required: true,
    },
    professionalskills: {
      type: String,
      required: true,
    },
  },
  academicprojects: {
    type: String,
    required: true,
  },
  certifications: {
    type: String,
    required: true,
  },
});

const portfolioModel = mongoose.model("Portfolio", portfolioSchema);
module.exports = portfolioModel;
