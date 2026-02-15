const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createBoard, getBoards } = require("../controllers/boardController");

router.post("/", authMiddleware, createBoard);
router.get("/", authMiddleware, getBoards);

module.exports = router;
