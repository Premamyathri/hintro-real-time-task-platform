const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getActivityByBoard } = require("../controllers/activityController");

router.get("/:boardId", authMiddleware, getActivityByBoard);

module.exports = router;
