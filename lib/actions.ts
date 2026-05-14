"use server";

import { execute, query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ── Topics ────────────────────────────────────────────────────────────────────

export async function createTopic(formData: FormData) {
  const parsed = z
    .object({ name: z.string().min(1).max(100) })
    .safeParse({ name: formData.get("name") });
  if (!parsed.success) throw new Error("Invalid topic data");

  const id = crypto.randomUUID();
  await execute("INSERT INTO topics (id, name) VALUES (?, ?)", [
    id,
    parsed.data.name,
  ]);

  revalidatePath("/ui");
  redirect("/ui");
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function createQuestion(formData: FormData) {
  const parsed = z
    .object({
      topicId: z.string().min(1),
      text: z.string().min(1).max(500),
    })
    .safeParse({
      topicId: formData.get("topicId"),
      text: formData.get("text"),
    });
  if (!parsed.success) throw new Error("Invalid question data");

  const id = crypto.randomUUID();
  await execute(
    "INSERT INTO questions (id, topic_id, text, votes) VALUES (?, ?, ?, 0)",
    [id, parsed.data.topicId, parsed.data.text]
  );

  revalidatePath(`/ui/topics/${parsed.data.topicId}`);
}

export async function voteQuestion(formData: FormData) {
  const questionId = formData.get("questionId") as string;
  if (!questionId) throw new Error("Question ID required");

  type Row = { topic_id: string };
  const rows = await query<Row>(
    "SELECT topic_id FROM questions WHERE id = ?",
    [questionId]
  );
  const topicId = rows[0]?.topic_id;

  await execute("UPDATE questions SET votes = votes + 1 WHERE id = ?", [
    questionId,
  ]);

  if (topicId) revalidatePath(`/ui/topics/${topicId}`);
}

// ── Answers ───────────────────────────────────────────────────────────────────

export async function createAnswer(formData: FormData) {
  const parsed = z
    .object({
      questionId: z.string().min(1),
      answer: z.string().min(1, "Answer cannot be empty").max(1000),
    })
    .safeParse({
      questionId: formData.get("questionId"),
      answer: formData.get("answer"),
    });
  if (!parsed.success) throw new Error("Invalid answer data");

  const id = crypto.randomUUID();
  await execute(
    "INSERT INTO answers (id, answer, question_id) VALUES (?, ?, ?)",
    [id, parsed.data.answer, parsed.data.questionId]
  );

  revalidatePath(`/ui/questions/${parsed.data.questionId}`);
}

export async function markAsAnswer(formData: FormData) {
  const questionId = formData.get("questionId") as string;
  const answerId = formData.get("answerId") as string;
  if (!questionId || !answerId) throw new Error("Missing IDs");

  await execute("UPDATE questions SET answer_id = ? WHERE id = ?", [
    answerId,
    questionId,
  ]);

  revalidatePath(`/ui/questions/${questionId}`);
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function registerUser(formData: FormData) {
  const parsed = z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    return { error: "Invalid data. Password must be at least 8 characters." };
  }

  const { name, email, password } = parsed.data;

  type UserRow = { id: string };
  const existing = await query<UserRow>(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  const bcryptjs = await import("bcryptjs");
  const hashed = await bcryptjs.hash(password, 12);
  const id = crypto.randomUUID();

  await execute(
    "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
    [id, name, email, hashed]
  );

  return { success: true };
}
