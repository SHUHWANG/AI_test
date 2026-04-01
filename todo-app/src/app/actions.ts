'use server';

import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function addTodo(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  if (!title?.trim()) return;

  await db.insert(todos).values({
    title: title.trim(),
    userId: session.user.id,
  });
  revalidatePath('/');
}

export async function toggleTodo(id: number, completed: boolean) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db.update(todos)
    .set({ completed })
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));
  revalidatePath('/');
}

export async function deleteTodo(id: number) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db.delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)));
  revalidatePath('/');
}
