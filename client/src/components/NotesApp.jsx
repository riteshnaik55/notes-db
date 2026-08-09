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
    <div className="flex flex-wrap gap-x-2 gap-y-5 justify-center md:justify-between px-5">
      <div className="w-full flex items-center justify-between px-2">
        <h1 className="flex-1 text-center">Notes</h1>
        <button
          onClick={onLogout}
          className="cursor-pointer rounded-md px-3 py-1 text-sm hover:bg-gray-100 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </button>
      </div>

      <ul className="lg:w-2/5 md:w-2/5 w-full">
        {notes.map((note) => (
          <li
            key={note._id}
            className="flex gap-5 place-content-between p-4 mb-4 border border-gray-300 rounded-md"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-lg leading-none">{note.title}</h3>
              <p className="text-xs">{note.content}</p>
            </div>
            <div className="flex gap-1 justify-center">
              <button onClick={() => startEdit(note)} className="size-4 cursor-pointer">
                <svg  className="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
              <button
                onClick={() => deleteNote(note._id)}
                className="size-4 cursor-pointer"
              >
                <svg  className="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="lg:w-2/5 md:w-2/5 w-full">
        <div className="flex flex-col gap-2 rounded-md p-10 bg-stone-900">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded-md p-2 mb-2"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        />

        {editingId ? (
          <div className="flex gap-2 place-content-center">
            <button onClick={updateNote} className="cursor-pointer">Update Note</button>
            <button onClick={cancelEdit} className="cursor-pointer ml-2">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={createNote} className="cursor-pointer">Add Note</button>
        )}
      </div>
      </div>
      
    </div>
  );
}

export default NotesApp;
