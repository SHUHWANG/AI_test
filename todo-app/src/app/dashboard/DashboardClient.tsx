'use client';

import { useOptimistic, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { addTodo, deleteTodo, toggleTodo } from '../actions';
import type { Todo } from '@/db/schema';

type Filter = 'all' | 'active' | 'done';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardClient({
  user,
  initialTodos,
}: {
  user: User;
  initialTodos: Todo[];
}) {
  const router = useRouter();
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(initialTodos);
  const [filter, setFilter] = useState<Filter>('all');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const completed = optimisticTodos.filter(t => t.completed).length;
  const total = optimisticTodos.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

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
        { id: Date.now(), title: title.trim(), completed: false, createdAt: new Date(), userId: user.id },
        ...prev,
      ]);
      await addTodo(formData);
    });
  }

  async function handleToggle(id: number, completed: boolean) {
    startTransition(async () => {
      setOptimisticTodos(prev => prev.map(t => (t.id === id ? { ...t, completed } : t)));
      await toggleTodo(id, completed);
    });
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      setOptimisticTodos(prev => prev.filter(t => t.id !== id));
      await deleteTodo(id);
    });
  }

  async function handleSignOut() {
    await signOut();
    router.push('/login');
    router.refresh();
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px', fontFamily: 'var(--font-inter, sans-serif)',
    }}>
      {/* Header */}
      <div style={{
        width: '100%', maxWidth: '480px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>你好，{user.name}</p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: '2px 0 0' }}>{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: '8px 16px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
            color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer',
          }}
        >
          登出
        </button>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: '32px',
      }}>
        {/* Progress ring + date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>待办事项</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '4px 0 0' }}>{dateStr}</p>
          </div>
          <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="36" cy="36" r={radius} fill="none"
              stroke="url(#grad)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <text
              x="36" y="36"
              dominantBaseline="middle" textAnchor="middle"
              fill="rgba(255,255,255,0.85)" fontSize="13" fontWeight="600"
              style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}
            >{progress}%</text>
          </svg>
        </div>

        {/* Add todo */}
        <form action={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            ref={inputRef} name="title"
            placeholder="添加新任务…"
            style={{
              flex: 1, padding: '11px 16px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none',
            }}
          />
          <button type="submit" style={{
            padding: '11px 20px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none', borderRadius: '10px',
            color: '#fff', fontSize: '20px', cursor: 'pointer', lineHeight: 1,
          }}>+</button>
        </form>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['all', 'active', 'done'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.1)',
                background: filter === f ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? '#fff' : 'rgba(255,255,255,0.4)',
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {{ all: '全部', active: '进行中', done: '已完成' }[f]}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px', padding: '32px 0' }}>暂无任务</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(todo => (
              <li key={todo.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
              }}>
                <input
                  type="checkbox" checked={todo.completed}
                  onChange={e => handleToggle(todo.id, e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#764ba2' }}
                />
                <span style={{
                  flex: 1, fontSize: '14px', color: todo.completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  transition: 'color 0.2s',
                }}>{todo.title}</span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.25)', padding: '4px', lineHeight: 1,
                    fontSize: '16px',
                  }}
                  aria-label="删除"
                >×</button>
              </li>
            ))}
          </ul>
        )}

        {total > 0 && (
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.15)' }}>
            {optimisticTodos.filter(t => !t.completed).length} 个任务待完成
          </p>
        )}
      </div>
    </div>
  );
}
