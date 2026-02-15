const db = require("../config/db");

exports.createBoard = (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Board name required" });
  }

  const query = "INSERT INTO boards (name, created_by) VALUES (?, ?)";

  db.query(query, [name, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({ message: "Board created successfully" });
  });
};

exports.getBoards = (req, res) => {
  const userId = req.user.id;

  const query = "SELECT * FROM boards WHERE created_by = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};
