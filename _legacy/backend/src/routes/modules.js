const express = require("express");
const mongoose = require("mongoose");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const writeGuard = [requireAuth, requireRole(["admin", "instructor"])];

function toLessonDto(lesson) {
  return {
    id: String(lesson._id),
    module_id: String(lesson.moduleId),
    title: lesson.title,
    content: lesson.content,
    lesson_order: lesson.lessonOrder,
    created_at: lesson.createdAt,
    updated_at: lesson.updatedAt
  };
}

router.get("/:moduleId/lessons", async (req, res, next) => {
  const { moduleId } = req.params;

  try {
    if (!mongoose.isValidObjectId(moduleId)) {
      return res.json({
        success: true,
        lessons: []
      });
    }

    const lessons = await Lesson.find({ moduleId }).sort({ lessonOrder: 1, _id: 1 }).lean();

    return res.json({
      success: true,
      lessons: lessons.map(toLessonDto)
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/:moduleId/lessons", ...writeGuard, async (req, res, next) => {
  const { moduleId } = req.params;
  const { title, content = null, lessonOrder = 1 } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "title is required"
    });
  }

  try {
    if (!mongoose.isValidObjectId(moduleId)) {
      return res.status(404).json({
        success: false,
        message: "Module not found"
      });
    }

    const moduleDoc = await Module.findById(moduleId).select("_id").lean();

    if (!moduleDoc) {
      return res.status(404).json({
        success: false,
        message: "Module not found"
      });
    }

    const lesson = await Lesson.create({
      moduleId,
      title,
      content,
      lessonOrder: Number(lessonOrder) || 1
    });

    return res.status(201).json({
      success: true,
      lesson: toLessonDto(lesson)
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
