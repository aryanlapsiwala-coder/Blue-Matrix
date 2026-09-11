import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from './Button';
import { knowledgeService } from '../../services/knowledgeService';
import { canManageComment } from '../../services/comments';

export function CommentThread({ entryId, authUserId, onCommentsChange }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setLoadError(false);
    knowledgeService.getComments(entryId).then((rows) => {
      if (!active) return;
      setComments(rows);
      onCommentsChange(entryId, rows);
    }).catch(() => {
      if (active) { setError('Unable to load comments. Please try again.'); setLoadError(true); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [entryId, onCommentsChange, retry]);

  const persist = async (operation) => {
    if (busy || loading || loadError) return;
    setBusy(true); setError('');
    try { await operation(); }
    catch (err) { if (mounted.current) setError(err.message || 'Unable to save your comment. Please try again.'); }
    finally { if (mounted.current) setBusy(false); }
  };
  const replace = (rows) => {
    if (!mounted.current) return;
    setComments(rows); onCommentsChange(entryId, rows);
  };
  const add = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    return persist(async () => {
      const saved = await knowledgeService.addComment(entryId, { text });
      replace([...comments, saved]);
      if (mounted.current) setText('');
    });
  };
  const edit = (event) => {
    event.preventDefault();
    return persist(async () => {
      const saved = await knowledgeService.editComment(entryId, editing, draft);
      replace(comments.map((comment) => comment.id === editing ? saved : comment));
      if (mounted.current) setEditing(null);
    });
  };
  const remove = (id) => persist(async () => {
    await knowledgeService.deleteComment(entryId, id);
    replace(comments.filter((comment) => comment.id !== id));
    if (mounted.current) setDeleting(null);
  });

  return <section aria-label="Post comments" className="space-y-4 pt-4 border-t border-slate-100">
    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
      <MessageSquare className="w-4 h-4 text-indigo-600" /> Campus Discussion & Questions ({comments.length})
    </h4>
    {loading && <p role="status" className="text-sm text-slate-500">Loading comments…</p>}
    {error && <div role="alert" className="text-sm text-rose-700 rounded-xl bg-rose-50 p-3">
      {error} {loadError && <button type="button" onClick={() => setRetry((n) => n + 1)} className="font-semibold underline">Try again</button>}
    </div>}
    {!loading && !loadError && comments.length === 0 && <p className="text-sm text-slate-500">No questions yet. Be the first to ask!</p>}
    <div className="space-y-3">
      {comments.map((comment) => <article key={comment.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="font-bold text-slate-900">{comment.user} <span className="text-xs text-indigo-600">({comment.role})</span></span>
          <span className="text-xs text-slate-500">{comment.time}{comment.edited && ' · edited'}</span>
        </div>
        {editing === comment.id ? <form onSubmit={edit} className="space-y-2">
          <textarea aria-label="Edit comment" required maxLength={2000} rows={3} value={draft}
            onChange={(event) => setDraft(event.target.value)} disabled={busy} autoFocus
            className="w-full rounded-lg border border-slate-300 p-3 text-base focus:ring-2 focus:ring-indigo-200 outline-none" />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={busy} disabled={!draft.trim()}>Save</Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form> : <p className="text-slate-600 whitespace-pre-wrap break-words">{comment.text}</p>}
        {canManageComment(comment, authUserId) && editing !== comment.id && <div className="mt-3 flex flex-wrap items-center gap-3">
          {deleting === comment.id ? <>
            <span className="text-slate-700">Delete this comment?</span>
            <Button size="sm" variant="danger" loading={busy} onClick={() => remove(comment.id)}>Delete</Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancel</Button>
          </> : <>
            <button type="button" disabled={busy} className="text-indigo-600 font-semibold disabled:opacity-50" onClick={() => { setEditing(comment.id); setDraft(comment.text); setDeleting(null); setError(''); }}>Edit</button>
            <button type="button" disabled={busy} className="text-rose-600 font-semibold disabled:opacity-50" onClick={() => { setDeleting(comment.id); setEditing(null); setError(''); }}>Delete</button>
          </>}
        </div>}
      </article>)}
    </div>
    <form onSubmit={add} className="flex gap-2">
      <input type="text" aria-label="Add a comment" maxLength={2000} required value={text}
        onChange={(event) => setText(event.target.value)} disabled={busy || loading || loadError}
        placeholder="Ask a question or thank the contributor…"
        className="min-w-0 flex-1 text-base px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
      <Button type="submit" aria-label="Post comment" loading={busy} disabled={!text.trim() || loading || loadError}><Send className="w-4 h-4" /></Button>
    </form>
  </section>;
}
