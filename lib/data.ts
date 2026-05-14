import { query } from "@/lib/db";

export type Topic = {
  id: string;
  name: string;
};

export type Question = {
  id: string;
  topic_id: string;
  text: string;
  votes: number;
  answer_id: string | null;
};

export type Answer = {
  id: string;
  answer: string;
  question_id: string;
};

// ── Topics ────────────────────────────────────────────────────────────────────

export async function fetchTopics(): Promise<Topic[]> {
  try {
    return await query<Topic>("SELECT id, name FROM topics ORDER BY name ASC");
  } catch (error) {
    console.error("DB Error fetchTopics:", error);
    return [];
  }
}

export async function fetchTopicById(id: string): Promise<Topic | null> {
  try {
    const rows = await query<Topic>(
      "SELECT id, name FROM topics WHERE id = ?",
      [id]
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("DB Error fetchTopicById:", error);
    return null;
  }
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function fetchQuestionsByTopicId(topicId: string): Promise<Question[]> {
  try {
    return await query<Question>(
      "SELECT id, topic_id, text, votes, answer_id FROM questions WHERE topic_id = ? ORDER BY votes DESC, id ASC",
      [topicId]
    );
  } catch (error) {
    console.error("DB Error fetchQuestionsByTopicId:", error);
    return [];
  }
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  try {
    const rows = await query<Question>(
      "SELECT id, topic_id, text, votes, answer_id FROM questions WHERE id = ?",
      [id]
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("DB Error fetchQuestionById:", error);
    return null;
  }
}

// Alias used by REST API (Task 4)
export async function fetchQuestions(topicId: string): Promise<Question[]> {
  return fetchQuestionsByTopicId(topicId);
}

// ── Answers ───────────────────────────────────────────────────────────────────

export async function fetchAnswersByQuestionId(questionId: string): Promise<Answer[]> {
  try {
    return await query<Answer>(
      "SELECT id, answer, question_id FROM answers WHERE question_id = ? ORDER BY created_at ASC",
      [questionId]
    );
  } catch (error) {
    console.error("DB Error fetchAnswersByQuestionId:", error);
    return [];
  }
}
