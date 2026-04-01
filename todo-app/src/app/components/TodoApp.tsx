'use client';

import { useOptimistic, useRef, useState, useTransition } from 'react';
import { addTodo, deleteTodo, toggleTodo } from '../actions';
import type { Todo } from '@/db/schema';

type Filter = 'all' | 'active' | 'done';

export default function TodoApp({ initialTodos }: { initialTodos: Todo[] }) {
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(initialTodos);
  const [filter, setFilter] = useState<Filter>('all');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const completed = optimisticTodos.filter(t => t.completed).length;
  const total = optimisticTodos.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const filtered = optimisticTodos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  async function handleAdd(formData: FormData) {
    const title = formData.get('title') as string;
    if (!title?.trim()) return;
    inputRef.current!.value = '';
    startTransition(async () => {
      setOptimisticTodos(prev => [
        { id: Date.now(), title: title.trim(), completed: false, createdAt: new Date() },
        ...prev,
      ]);
      await addTodo(formData);
    });
  }

  async function handleToggle(id: number, completed: boolean) {
    startTransition(async () => {
      setOptimisticTodos(prev =>
        prev.map(t => (t.id === id ? { ...t, completed } : t))
      );
      await toggleTodo(id, completed);
    });
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      setOptimisticTodos(prev => prev.filter(t => t.id !== id));
      await deleteTodo(id);
    });
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 20%, #0d1a2e 0%, #06060f 50%, #0a0612 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 40px' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,209,88,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 4px 0', marginBottom: '32px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.03em' }}>{dateStr}</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < 2 ? '#0A84FF' : 'rgba(255,255,255,0.15)', boxShadow: i < 2 ? '0 0 6px rgba(10,132,255,0.6)' : 'none' }} />
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', animation: 'fadeIn 0.5s ease' }}>
          <div>
            <h1 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1 }}>任务</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', letterSpacing: '0.02em' }}>
              {total === 0 ? '暂无任务' : `${completed} / ${total} 已完成`}
            </p>
          </div>

          {/* Progress ring */}
          {total > 0 && (
            <div style={{ position: 'relative', width: '72px', height: '72px' }}>
              <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <circle
                  cx="36" cy="36" r={radius} fill="none"
                  stroke={progress === 100 ? '#30D158' : '#0A84FF'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="progress-ring-circle"
                  style={{ filter: `drop-shadow(0 0 6px ${progress === 100 ? '#30D158' : '#0A84FF'})` }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: progress === 100 ? '#30D158' : '#fff', letterSpacing: '-0.02em' }}>{progress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Add Todo */}
        <form action={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '24px', animation: 'fadeIn 0.5s ease 0.1s both' }}>
          <input
            ref={inputRef}
            name="title"
            type="text"
            placeholder="添加新任务..."
            className="task-input"
            style={{ height: '50px' }}
            autoComplete="off"
          />
          <button type="submit" className="add-btn" aria-label="添加">
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="10" y1="3" x2="10" y2="17" />
              <line x1="3" y1="10" x2="17" y2="10" />
            </svg>
          </button>
        </form>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', animation: 'fadeIn 0.5s ease 0.15s both' }}>
          {(['all', 'active', 'done'] as Filter[]).map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
            </button>
          ))}
          {optimisticTodos.some(t => t.completed) && (
            <button
              className="filter-tab"
              style={{ marginLeft: 'auto', color: 'rgba(255,69,58,0.6)', borderColor: 'rgba(255,69,58,0.15)' }}
              onClick={() => {
                startTransition(async () => {
                  const completed = optimisticTodos.filter(t => t.completed);
                  setOptimisticTodos(prev => prev.filter(t => !t.completed));
                  await Promise.all(completed.map(t => deleteTodo(t.id)));
                });
              }}
            >
              清除已完成
            </button>
          )}
        </div>

        {/* Todo list */}
        <div className="glass" style={{ overflow: 'hidden', animation: 'fadeIn 0.5s ease 0.2s both' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>✦</div>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', letterSpacing: '0.05em' }}>
                {filter === 'done' ? '暂无已完成任务' : filter === 'active' ? '暂无进行中任务' : '添加你的第一个任务'}
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {filtered.map((todo, index) => (
                <li
                  key={todo.id}
                  className="todo-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 20px',
                    borderBottom: index < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    animationDelay: `${index * 0.04}s`,
                  }}
                >
                  {/* Checkbox */}
                  <button
                    className={`checkbox${todo.completed ? ' checked' : ''}`}
                    onClick={() => handleToggle(todo.id, !todo.completed)}
                    aria-label={todo.completed ? '标记未完成' : '标记完成'}
                  >
                    {todo.completed && (
                      <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    )}
                  </button>

                  {/* Title */}
                  <span style={{
                    flex: 1,
                    fontSize: '15px',
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                    color: todo.completed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    transition: 'color 0.2s ease',
                    wordBreak: 'break-word',
                  }}>
                    {todo.title}
                  </span>

                  {/* Delete */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(todo.id)}
                    aria-label="删除"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="2" y1="2" x2="12" y2="12" />
                      <line x1="12" y1="2" x2="2" y2="12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {total > 0 && (
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.12)', letterSpacing: '0.06em', animation: 'fadeIn 0.5s ease 0.3s both' }}>
            {optimisticTodos.filter(t => !t.completed).length} 个任务待完成
          </p>
        )}
      </div>
    </div>
  );
}
