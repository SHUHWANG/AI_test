import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { desc } from 'drizzle-orm';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session) redirect('/login');

  const allTodos = await db.select().from(todos).orderBy(desc(todos.createdAt));

  return <DashboardClient user={session.user} initialTodos={allTodos} />;
}
