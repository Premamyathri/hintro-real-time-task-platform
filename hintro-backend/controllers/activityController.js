const db = require("../config/db");

exports.getActivityByBoard = (req, res) => {
  const boardId = req.params.boardId;

  const query = `
    SELECT al.*, t.title AS task_title
    FROM activity_logs al
    JOIN tasks t ON al.task_id = t.id
    JOIN lists l ON t.list_id = l.id
    WHERE l.board_id = ?
    ORDER BY al.created_at DESC
  `;

  db.query(query, [boardId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};
