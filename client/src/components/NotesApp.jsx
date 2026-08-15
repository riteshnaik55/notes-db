import React, { useEffect, useState } from "react";
import API from "../api/notesApi";
import axios from 'axios';

function NotesApp({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await API.get("/");
      const notesData = Array.isArray(res.data) ? res.data : [];
      setNotes(notesData);
    } catch (error) {
      console.error("Failed to load notes:", error);
      setNotes([]);
    }
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
    <div className="v2-shell">
      <header>
        <h1>
          Notes<span className="swipe" />
        </h1>
        <button className="lock-btn" aria-label="Lock" type="button" onClick={onLogout}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
        </button>
      </header>

      <div className="search">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4.5 4.5" />
        </svg>
      </div>

      <main>
        <section>
          <div className="col-head">
            <h3>Your notes</h3>
            <span className="badge">{notes.length}</span>
          </div>
          <div className="notes">
            {notes.map((note) => (
              <div className="note" key={note._id}>
                    <div className="note-head">
                      <h2>{note.title}</h2>
                      <div className="actions">
                        <button className="edit" aria-label="Edit" type="button" onClick={() => startEdit(note)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.7 3.8a2.2 2.2 0 0 1 3.1 3.1L7 19.7l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button className="del" aria-label="Delete" type="button"onClick={() => deleteNote(note._id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                            <path d="M3.5 6.5h17" />
                            <path d="M8.5 6.5v-2A1.5 1.5 0 0 1 10 3h4a1.5 1.5 0 0 1 1.5 1.5v2" />
                            <path d="m18.5 6.5-.9 12.6a2 2 0 0 1-2 1.9H8.4a2 2 0 0 1-2-1.9L5.5 6.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p>{note.content}</p>
              </div>
            ))}
          </div>
        </section>
        
        <aside className="composer">
          <h3>
            <span className="dot" />
            {editingId ? "Edit Note" : "New Note"}
          </h3>
          <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
          {editingId ? (
          <div className="flex gap-2 place-content-center">
            <button onClick={updateNote} className="btn update-btn">Update Note</button>
            <button onClick={cancelEdit} className="btn cancel-btn">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={createNote} className="btn add-btn">Add Note</button>
        )}
        </aside>
      </main>

    </div>
  );
}

export default NotesApp;
