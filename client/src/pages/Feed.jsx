import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { formatDistanceToNow } from 'date-fns';

function PostCard({ post, currentUser, onLike, onDelete }) {
  const isOwn = post.author_id === currentUser?.id;
  const isAdmin = currentUser?.role === 'admin';
  const liked = post.liked_by?.includes(currentUser?.id);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '20px 22px',
        transition: 'border-color var(--transition)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <Avatar name={post.author_name} color={post.author_color} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{post.author_name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : ''}
            </span>
            {post.category && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                background: 'var(--accent-dim)', color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>{post.category}</span>
            )}
          </div>
        </div>
        {(isOwn || isAdmin) && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDelete(s => !s)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4, fontSize: 18, lineHeight: 1 }}
            >⋯</button>
            {showDelete && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '4px', zIndex: 10, minWidth: 100,
              }}>
                <button
                  onClick={() => { setShowDelete(false); onDelete(post.id); }}
                  style={{ display: 'block', width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-dim)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', marginBottom: 14 }}>
        {post.content}
      </div>

      {post.image_url && (
        <div style={{ marginBottom: 14, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={post.image_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: liked ? 'var(--accent-dim)' : 'none',
            border: `1px solid ${liked ? 'var(--accent)' : 'transparent'}`,
            borderRadius: 20, padding: '4px 12px',
            color: liked ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 14 }}>{liked ? '❤️' : '🤍'}</span>
          {post.likes_count || 0}
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          {post.comments_count || 0} comments
        </span>
      </div>
    </div>
  );
}

const CATEGORIES = ['', 'update', 'announcement', 'question', 'win', 'idea'];

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const textareaRef = useRef(null);

  const load = async (p = 1, append = false) => {
    try {
      const res = await api.get(`/feed?page=${p}&limit=10`);
      if (append) setPosts(prev => [...prev, ...res.data]);
      else setPosts(res.data);
      setHasMore(res.data.length === 10);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/feed', { content: content.trim(), category });
      setPosts(prev => [res.data, ...prev]);
      setContent('');
      setCategory('');
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/feed/${postId}/like`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: res.data.likes_count, liked_by: res.data.liked_by } : p));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/feed/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) { console.error(err); }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    load(nextPage, true);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>Team Feed</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Share updates, announcements, and celebrate wins</p>
      </div>

      {/* Compose Box */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar name={user?.name} color={user?.avatar_color} size={38} />
          <form onSubmit={handlePost} style={{ flex: 1 }}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
              rows={3}
              style={{
                width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 14,
                padding: '10px 12px', resize: 'none', outline: 'none',
                transition: 'border-color var(--transition)', lineHeight: 1.5,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  padding: '6px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', color: category ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: 12, outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">No category</option>
                {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <Button type="submit" loading={submitting} disabled={!content.trim()}>Post Update</Button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No posts yet</div>
          <div>Be the first to share something with the team!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={user} onLike={handleLike} onDelete={handleDelete} />
          ))}
          {hasMore && (
            <button onClick={loadMore} style={{
              padding: '12px', background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >Load more posts</button>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
