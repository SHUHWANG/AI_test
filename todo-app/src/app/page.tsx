import { db } from '@/db';
import { todos } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import TodoApp from './components/TodoApp';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userTodos = await db.select()
    .from(todos)
    .where(eq(todos.userId, session.user.id))
    .orderBy(desc(todos.createdAt));

  return <TodoApp initialTodos={userTodos} userId={session.user.id} />;
}
