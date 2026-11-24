const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Module = require("../models/Module");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const writeGuard = [requireAuth, requireRole(["admin", "instructor"])];

function toCourseDto(course) {
  return {
    id: String(course._id),
    title: course.title,
    description: course.description,
    is_published: course.isPublished,
    created_at: course.createdAt,
    updated_at: course.updatedAt,
    instructor_id: String(course.instructorId?._id || course.instructorId),
    instructor_name: course.instructorId?.fullName || null
  };
}

function toModuleDto(module) {
  return {
    id: String(module._id),
    course_id: String(module.courseId),
    title: module.title,
    module_order: module.moduleOrder,
    created_at: module.createdAt,
    updated_at: module.updatedAt
  };
}

router.get("/", async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("instructorId", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      courses: courses.map(toCourseDto)
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/:courseId", async (req, res, next) => {
  const { courseId } = req.params;

  try {
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const course = await Course.findById(courseId).populate("instructorId", "fullName").lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    return res.json({
      success: true,
      course: toCourseDto(course)
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/", ...writeGuard, async (req, res, next) => {
  const { title, description = null, isPublished = false } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "title is required"
    });
  }

  try {
    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const course = await Course.create({
      instructorId: req.user.id,
      title,
      description,
      isPublished: Boolean(isPublished)
    });

    return res.status(201).json({
      success: true,
      course: {
        id: String(course._id),
        instructor_id: String(course.instructorId),
        title: course.title,
        description: course.description,
        is_published: course.isPublished,
        created_at: course.createdAt,
        updated_at: course.updatedAt
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/:courseId/modules", async (req, res, next) => {
  const { courseId } = req.params;

  try {
    if (!mongoose.isValidObjectId(courseId)) {
      return res.json({
        success: true,
        modules: []
      });
    }

    const modules = await Module.find({ courseId }).sort({ moduleOrder: 1, _id: 1 }).lean();

    return res.json({
      success: true,
      modules: modules.map(toModuleDto)
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/:courseId/modules", ...writeGuard, async (req, res, next) => {
  const { courseId } = req.params;
  const { title, moduleOrder = 1 } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "title is required"
    });
  }

  try {
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const course = await Course.findById(courseId).select("_id").lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const moduleDoc = await Module.create({
      courseId,
      title,
      moduleOrder: Number(moduleOrder) || 1
    });

    return res.status(201).json({
      success: true,
      module: {
        id: String(moduleDoc._id),
        course_id: String(moduleDoc.courseId),
        title: moduleDoc.title,
        module_order: moduleDoc.moduleOrder,
        created_at: moduleDoc.createdAt,
        updated_at: moduleDoc.updatedAt
      }
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
