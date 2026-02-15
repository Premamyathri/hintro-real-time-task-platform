const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createList, getListsByBoard } = require("../controllers/listController");

router.post("/", authMiddleware, createList);
router.get("/:boardId", authMiddleware, getListsByBoard);

module.exports = router;
