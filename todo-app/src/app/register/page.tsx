'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth-client';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp.email({ name, email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? '注册失败，请重试');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
        padding: '40px', width: '100%', maxWidth: '400px',
      }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>创建账户</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>开始管理你的待办事项</p>

        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: '8px', padding: '12px', marginBottom: '20px',
            color: '#ff8080', fontSize: '14px', textAlign: 'center',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>昵称</label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="你的名字"
              style={{
                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>邮箱</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>密码</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="至少 8 位"
              minLength={8}
              style={{
                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              marginTop: '8px', padding: '13px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            }}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          已有账户？{' '}
          <Link href="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>立即登录</Link>
        </p>
      </div>
    </div>
  );
}
