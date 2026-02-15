const db = require("../config/db");

exports.createTask = (req, res) => {
    const { title, description, list_id, assigned_user_id } = req.body;

    if (!title || !list_id) {
        return res.status(400).json({ message: "Title and list_id required" });
    }

    const query = `
    INSERT INTO tasks (title, description, list_id, assigned_user_id)
    VALUES (?, ?, ?, ?)
  `;

    db.query(query, [title, description || null, list_id, assigned_user_id || null], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        const activityQuery = `
    INSERT INTO activity_logs (task_id, action, user_id)
    VALUES (?, ?, ?)
  `;

        db.query(activityQuery, [result.insertId, "Task Created", req.user.id]);

        const io = req.app.get("io");
        io.emit("taskUpdated");

        res.status(201).json({ message: "Task created successfully" });
    });

};

exports.getTasksByList = (req, res) => {
    const listId = req.params.listId;

    const query = "SELECT * FROM tasks WHERE list_id = ? ORDER BY position ASC";

    db.query(query, [listId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
};

exports.updateTask = (req, res) => {
    const taskId = req.params.id;
    const { title, description, list_id, position, assigned_user_id } = req.body;

    const query = `
    UPDATE tasks 
    SET title = ?, description = ?, list_id = ?, position = ?, assigned_user_id = ?
    WHERE id = ?
  `;

    db.query(
        query,
        [title, description, list_id, position, assigned_user_id, taskId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }

            // 🔥 Insert Activity Log
            const activityQuery = `
        INSERT INTO activity_logs (task_id, action, user_id)
        VALUES (?, ?, ?)
      `;

            db.query(
                activityQuery,
                [taskId, "Task Updated / Moved", req.user.id]
            );

            // 🔥 Emit real-time event
            const io = req.app.get("io");
            io.emit("taskUpdated", {
                action: "updated",
                taskId: taskId
            });

            res.json({ message: "Task updated successfully" });
        }
    );
};


exports.deleteTask = (req, res) => {
    const taskId = req.params.id;

    const query = "DELETE FROM tasks WHERE id = ?";

    db.query(query, [taskId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Task deleted successfully" });
    });
};
