import { useEffect, useState } from "react";
import API from "./api/notesApi";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await API.get("/");
    setNotes(res.data);
  };

  const createNote = async () => {
    if (!title || !content) return;

    await API.post("/", {
      title,
      content,
    });

    setTitle("");
    setContent("");
    fetchNotes();
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
  };

  const updateNote = async () => {
    if (!editingId) return;

    await API.put(`/${editingId}`, {
      title,
      content,
    });

    setEditingId(null);
    setTitle("");
    setContent("");
    fetchNotes();
  };

  const deleteNote = async (id) => {
    await API.delete(`/${id}`);
    fetchNotes();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Notes</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />

        {editingId ? (
          <>
            <button onClick={updateNote}>Update Note</button>
            <button onClick={cancelEdit} style={{ marginLeft: 8 }}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={createNote}>Add Note</button>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {notes.map((note) => (
          <li
            key={note._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <h3 style={{ margin: "0 0 6px" }}>{note.title}</h3>
            <p style={{ margin: "0 0 10px" }}>{note.content}</p>
            <button onClick={() => startEdit(note)}>Edit</button>
            <button
              onClick={() => deleteNote(note._id)}
              style={{ marginLeft: 8 }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
