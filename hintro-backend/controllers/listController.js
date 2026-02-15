const db = require("../config/db");

exports.createList = (req, res) => {
  const { title, board_id } = req.body;

  if (!title || !board_id) {
    return res.status(400).json({ message: "Title and board_id required" });
  }

  const query = "INSERT INTO lists (title, board_id) VALUES (?, ?)";

  db.query(query, [title, board_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({ message: "List created successfully" });
  });
};

exports.getListsByBoard = (req, res) => {
  const boardId = req.params.boardId;

  const query = "SELECT * FROM lists WHERE board_id = ? ORDER BY position ASC";

  db.query(query, [boardId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};
