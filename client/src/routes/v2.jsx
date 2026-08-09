import { useEffect, useMemo, useRef, useState } from 'react';

const initialNotes = [
  { title: 'Note1', content: 'Note1 content update', color: 'c-mint' },
  { title: 'Note2', content: 'Note2 content', color: 'c-yellow' },
];

const colors = ['c-mint', 'c-yellow', 'c-pink', 'c-sky'];

function v2() {
  const [notes, setNotes] = useState(initialNotes);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const searchRef = useRef(null);

  const filteredNotes = useMemo(() => {
    const q = query.toLowerCase();
    return notes.filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(q));
  }, [notes, query]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const targetTag = document.activeElement?.tagName;
      if (event.key === '/' && targetTag !== 'INPUT' && targetTag !== 'TEXTAREA') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddOrUpdate = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent) return;

    if (editingIndex !== null) {
      setNotes((current) =>
        current.map((note, index) =>
          index === editingIndex ? { ...note, title: trimmedTitle || 'Untitled', content: trimmedContent || '—' } : note
        )
      );
      setEditingIndex(null);
    } else {
      setNotes((current) => [
        ...current,
        {
          title: trimmedTitle || 'Untitled',
          content: trimmedContent || '—',
          color: colors[current.length % colors.length],
        },
      ]);
    }

    setTitle('');
    setContent('');
  };

  const handleEdit = (index) => {
    const note = notes[index];
    setTitle(note.title);
    setContent(note.content);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setNotes((current) => current.filter((_, currentIndex) => currentIndex !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="v2-shell">
      <style>{`
        :root {
          --ink:#141414; --paper:#f4efe6;
          --yellow:#ffd02f; --mint:#8bf0da; --pink:#ff8fe0; --sky:#7cc6ff; --coral:#ff7a59;
          --shadow:6px 6px 0 var(--ink);
        }
        *{box-sizing:border-box;margin:0;padding:0}
        body{margin:0}
        .v2-shell{font-family:"Space Grotesk",sans-serif;color:var(--ink);background:var(--paper);background-image:radial-gradient(rgba(20,20,20,.13) 1.4px,transparent 1.4px);background-size:26px 26px;min-height:100vh;padding:44px clamp(20px,6vw,84px) 80px;}
        button{font:inherit;cursor:pointer;background:none;border:none;color:inherit}
        ::placeholder{color:rgba(20,20,20,.4);font-weight:500}
        .v2-shell header{display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto 34px}
        .v2-shell h1{font-family:"League-Spartan";font-size:clamp(2.6rem,5vw,4rem);letter-spacing:-1px;position:relative;z-index:0}
        .v2-shell h1 .swipe{position:absolute;left:-10px;right:-14px;top:52%;height:46%;background:var(--yellow);z-index:-1;transform:rotate(-1.6deg)}
        .lock-btn{width:52px;height:52px;display:grid;place-items:center;background:#fff;border:3px solid var(--ink);border-radius:12px;box-shadow:4px 4px 0 var(--ink);transition:.12s}
        .lock-btn:hover{background:var(--yellow)}
        .lock-btn:active{transform:translate(3px,3px);box-shadow:1px 1px 0 var(--ink)}
        .search{max-width:760px;margin:0 auto 54px;display:flex;align-items:center;gap:14px;background:#fff;border:3px solid var(--ink);border-radius:16px;padding:15px 20px;box-shadow:var(--shadow);transition:.15s}
        .search:focus-within{transform:translate(-2px,-2px);box-shadow:8px 8px 0 var(--ink)}
        .search input{flex:1;border:none;outline:none;font:inherit;font-size:1.05rem;font-weight:500;background:transparent}
        .search kbd{font-weight:700;font-size:.85rem;background:var(--paper);border:2px solid var(--ink);border-bottom-width:4px;border-radius:8px;padding:3px 9px}
        .v2-shell main{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.15fr .85fr;gap:48px;align-items:start}
        .col-head{display:flex;align-items:center;gap:14px;margin-bottom:26px}
        .col-head h3,.composer h3{font-family:"League-Spartan";font-size:1.1rem;text-transform:uppercase;letter-spacing:1px}
        .badge{background:var(--pink);border:2.5px solid var(--ink);border-radius:999px;padding:3px 13px;font-weight:700;box-shadow:3px 3px 0 var(--ink);transform:rotate(2deg)}
        .notes{display:grid;gap:30px}
        .note{position:relative;border:3px solid var(--ink);border-radius:16px;padding:24px 26px;box-shadow:var(--shadow);transform:rotate(var(--rot,0deg));transition:.15s}
        .note:nth-child(odd){--rot:-1.1deg}.note:nth-child(even){--rot:1deg}
        .note:hover{transform:rotate(0) translate(-3px,-3px);box-shadow:9px 9px 0 var(--ink)}
        .note::before{content:"";position:absolute;top:-15px;left:50%;transform:translateX(-50%) rotate(-2deg);width:98px;height:27px;background:rgba(255,255,255,.65);border:2px solid rgba(20,20,20,.15)}
        .c-mint{background:var(--mint)}.c-yellow{background:var(--yellow)}.c-pink{background:var(--pink)}.c-sky{background:var(--sky)}
        .note-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
        .note h2{font-family:"League-Spartan";font-size:1.35rem}
        .note p{margin-top:10px;font-weight:500}
        .actions{display:flex;gap:9px}
        .actions button{width:38px;height:38px;display:grid;place-items:center;background:#fff;border:2.5px solid var(--ink);border-radius:10px;box-shadow:3px 3px 0 var(--ink);transition:.12s}
        .actions button:hover{background:var(--ink);color:#fff}
        .actions button:active{transform:translate(2px,2px);box-shadow:0 0 0 var(--ink)}
        .composer{position:sticky;top:32px;background:#fff;border:3px solid var(--ink);border-radius:20px;padding:30px;box-shadow:10px 10px 0 var(--ink)}
        .composer h3{margin-bottom:20px;display:flex;align-items:center;gap:10px}
        .composer h3 .dot{width:14px;height:14px;background:var(--coral);border:2.5px solid var(--ink);border-radius:50%}
        .composer input,.composer textarea{width:100%;font:inherit;font-weight:500;background:var(--paper);border:2.5px solid var(--ink);border-radius:12px;padding:13px 15px;outline:none;transition:.12s}
        .composer textarea{min-height:130px;resize:vertical;margin-top:16px}
        .composer input:focus,.composer textarea:focus{transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--ink);background:#fff}
        .add-btn{margin-top:22px;width:100%;padding:15px;font-family:"League-Spartan";font-size:1.05rem;text-transform:uppercase;letter-spacing:.5px;background:var(--ink);color:var(--yellow);border:3px solid var(--ink);border-radius:14px;box-shadow:6px 6px 0 var(--coral);transition:.12s}
        .add-btn:hover{transform:translate(-2px,-2px);box-shadow:8px 8px 0 var(--coral)}
        .add-btn:active{transform:translate(3px,3px);box-shadow:2px 2px 0 var(--coral)}
        @media(max-width:940px){.v2-shell main{grid-template-columns:1fr}.composer{position:static}}
      `}</style>

      <header>
        <h1>
          Notes<span className="swipe" />
        </h1>
        <button className="lock-btn" aria-label="Lock" type="button">
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
        <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes…" autoComplete="off" />
        <kbd>/</kbd>
      </div>

      <main>
        <section>
          <div className="col-head">
            <h3>Your notes</h3>
            <span className="badge">{filteredNotes.length}</span>
          </div>
          <div className="notes">
            {filteredNotes.map((note, index) => (
              <article className={`note ${note.color}`} key={`${note.title}-${index}`}>
                <div className="note-head">
                  <h2>{note.title}</h2>
                  <div className="actions">
                    <button className="edit" aria-label="Edit" type="button" onClick={() => handleEdit(index)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.7 3.8a2.2 2.2 0 0 1 3.1 3.1L7 19.7l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button className="del" aria-label="Delete" type="button" onClick={() => handleDelete(index)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                        <path d="M3.5 6.5h17" />
                        <path d="M8.5 6.5v-2A1.5 1.5 0 0 1 10 3h4a1.5 1.5 0 0 1 1.5 1.5v2" />
                        <path d="m18.5 6.5-.9 12.6a2 2 0 0 1-2 1.9H8.4a2 2 0 0 1-2-1.9L5.5 6.5" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p>{note.content}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="composer">
          <h3>
            <span className="dot" />
            {editingIndex !== null ? 'Edit note' : 'New note'}
          </h3>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
          <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Content" />
          <button className="add-btn" type="button" onClick={handleAddOrUpdate}>
            {editingIndex !== null ? 'Save note' : '+ Add note'}
          </button>
        </aside>
      </main>
    </div>
  );
}

export default v2;