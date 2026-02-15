import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import {
  DndContext,
  closestCenter,
  useDroppable
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* -------------------- DRAGGABLE TASK -------------------- */

function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "white",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "4px",
    cursor: "grab"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {task.title}
    </div>
  );
}

/* -------------------- DROPPABLE LIST -------------------- */

function DroppableList({ list, tasks, createTask }) {
  const { setNodeRef } = useDroppable({
    id: list.id.toString(),
  });

  const [taskTitle, setTaskTitle] = useState("");

  return (
    <div
      ref={setNodeRef}
      style={{
        background: "#f4f4f4",
        padding: "15px",
        width: "250px",
        borderRadius: "8px",
      }}
    >
      <h4>{list.title}</h4>

      <input
        type="text"
        placeholder="New Task"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />
      <button
        onClick={() => {
          createTask(list.id, taskTitle);
          setTaskTitle("");
        }}
      >
        Add
      </button>

      <SortableContext
        items={tasks?.map((task) => task.id.toString()) || []}
        strategy={verticalListSortingStrategy}
      >
        {tasks?.map((task) => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}

/* -------------------- MAIN BOARD COMPONENT -------------------- */

function Board() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});
  const [activity, setActivity] = useState([]);

  const socketRef = useRef(null);

  /* -------------------- API FUNCTIONS -------------------- */

  const fetchBoards = async () => {
    const res = await axios.get("http://localhost:5000/api/boards", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBoards(res.data);
  };

  const createBoard = async () => {
    await axios.post(
      "http://localhost:5000/api/boards",
      { name: newBoardName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNewBoardName("");
    fetchBoards();
  };

  const fetchLists = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/lists/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLists(res.data);

    res.data.forEach((list) => {
      fetchTasksForList(list.id);
    });
  };

  const fetchTasksForList = async (listId) => {
    const res = await axios.get(
      `http://localhost:5000/api/tasks/${listId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTasks((prev) => ({
      ...prev,
      [listId]: res.data
    }));
  };

  const fetchActivity = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/activity/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setActivity(res.data);
  };

  const createTask = async (listId, title) => {
    if (!title) return;

    await axios.post(
      "http://localhost:5000/api/tasks",
      { title, list_id: listId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  /* -------------------- DRAG LOGIC -------------------- */

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;

    let draggedTask = null;

    Object.values(tasks).forEach((taskList) => {
      taskList.forEach((task) => {
        if (task.id.toString() === taskId) {
          draggedTask = task;
        }
      });
    });

    if (!draggedTask) return;

    await axios.put(
      `http://localhost:5000/api/tasks/${taskId}`,
      {
        title: draggedTask.title,
        description: draggedTask.description,
        list_id: over.id,
        position: 0,
        assigned_user_id: draggedTask.assigned_user_id
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    if (!id) {
      fetchBoards();
    } else {
      fetchLists();
      fetchActivity();
    }
  }, [id]);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("taskUpdated", () => {
      if (id) {
        fetchLists();
        fetchActivity();
      }
    });

    return () => socketRef.current.disconnect();
  }, [id]);

  /* -------------------- RENDER -------------------- */

  if (!id) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Your Boards</h2>

        <input
          type="text"
          placeholder="New Board Name"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
        />
        <button onClick={createBoard}>Create Board</button>

        <ul>
          {boards.map((board) => (
            <li key={board.id}>
              <button onClick={() => window.location.href = `/board/${board.id}`}>
                {board.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", display: "flex", gap: "30px" }}>
      
      <div>
        <h2>Board ID: {id}</h2>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            {lists.map((list) => (
              <DroppableList
                key={list.id}
                list={list}
                tasks={tasks[list.id]}
                createTask={createTask}
              />
            ))}
          </div>
        </DndContext>
      </div>

      <div
        style={{
          width: "300px",
          background: "#fafafa",
          padding: "15px",
          borderRadius: "8px",
          height: "500px",
          overflowY: "auto"
        }}
      >
        <h4>Activity Log</h4>

        {activity.map((item) => (
          <div
            key={item.id}
            style={{
              background: "white",
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          >
            <strong>{item.task_title}</strong>
            <div>{item.action}</div>
            <small>
              {new Date(item.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Board;
