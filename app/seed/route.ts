import { NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import bcryptjs from "bcryptjs";

export async function GET() {
  try {
    // ── 1. Create tables ─────────────────────────────────────────────────────

    await execute(`
      CREATE TABLE IF NOT EXISTS users (
        id         VARCHAR(36)  NOT NULL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS topics (
        id         VARCHAR(36)  NOT NULL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id         VARCHAR(36)  NOT NULL PRIMARY KEY,
        topic_id   VARCHAR(36)  NOT NULL,
        text       TEXT         NOT NULL,
        votes      INT          NOT NULL DEFAULT 0,
        answer_id  VARCHAR(36)  DEFAULT NULL,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS answers (
        id          VARCHAR(36)  NOT NULL PRIMARY KEY,
        answer      TEXT         NOT NULL,
        question_id VARCHAR(36)  NOT NULL,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);

    // Add answer_id column if it doesn't exist (for existing DBs)
    try {
      await execute(`ALTER TABLE questions ADD COLUMN answer_id VARCHAR(36) DEFAULT NULL`);
    } catch {
      // Column already exists — ignore
    }

    // ── 2. Seed user ──────────────────────────────────────────────────────────
    const hashedPassword = await bcryptjs.hash("123456", 12);
    const userId = crypto.randomUUID();

    type UserRow = { id: string };
    const existingUser = await query<UserRow>(
      "SELECT id FROM users WHERE email = ?",
      ["user@atlasmail.com"]
    );

    if (existingUser.length === 0) {
      await execute(
        "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
        [userId, "Atlas User", "user@atlasmail.com", hashedPassword]
      );
    } else {
      await execute("UPDATE users SET password = ? WHERE email = ?", [
        hashedPassword,
        "user@atlasmail.com",
      ]);
    }

    // ── 3. Clear and re-seed topics, questions, answers ───────────────────────
    await execute("DELETE FROM answers");
    await execute("DELETE FROM questions");
    await execute("DELETE FROM topics");

    const topics: { id: string; name: string }[] = [
      { id: crypto.randomUUID(), name: "JavaScript" },
      { id: crypto.randomUUID(), name: "Python" },
      { id: crypto.randomUUID(), name: "Next.js" },
    ];

    for (const topic of topics) {
      await execute("INSERT INTO topics (id, name) VALUES (?, ?)", [
        topic.id,
        topic.name,
      ]);
    }

    const questionIds = {
      js1: crypto.randomUUID(),
      js2: crypto.randomUUID(),
      js3: crypto.randomUUID(),
      py1: crypto.randomUUID(),
      py2: crypto.randomUUID(),
      nx1: crypto.randomUUID(),
      nx2: crypto.randomUUID(),
      nx3: crypto.randomUUID(),
    };

    const seedQuestions = [
      { id: questionIds.js1, topicId: topics[0].id, text: "What is the difference between let and const?", votes: 5 },
      { id: questionIds.js2, topicId: topics[0].id, text: "How does async/await work in JavaScript?", votes: 3 },
      { id: questionIds.js3, topicId: topics[0].id, text: "What are arrow functions and how are they different from regular functions?", votes: 2 },
      { id: questionIds.py1, topicId: topics[1].id, text: "What is a Python decorator?", votes: 4 },
      { id: questionIds.py2, topicId: topics[1].id, text: "How do list comprehensions work?", votes: 6 },
      { id: questionIds.nx1, topicId: topics[2].id, text: "What is the difference between App Router and Pages Router?", votes: 7 },
      { id: questionIds.nx2, topicId: topics[2].id, text: "How do React Server Components work?", votes: 4 },
      { id: questionIds.nx3, topicId: topics[2].id, text: "What are Server Actions and when should I use them?", votes: 5 },
    ];

    for (const q of seedQuestions) {
      await execute(
        "INSERT INTO questions (id, topic_id, text, votes) VALUES (?, ?, ?, ?)",
        [q.id, q.topicId, q.text, q.votes]
      );
    }

    // Seed some answers
    const ans1 = crypto.randomUUID();
    const ans2 = crypto.randomUUID();
    const ans3 = crypto.randomUUID();

    await execute(
      "INSERT INTO answers (id, answer, question_id) VALUES (?, ?, ?)",
      [ans1, "`let` can be reassigned, `const` cannot. Both are block-scoped unlike `var`.", questionIds.js1]
    );
    await execute(
      "INSERT INTO answers (id, answer, question_id) VALUES (?, ?, ?)",
      [ans2, "`const` is for values that won't change, `let` for variables that might change.", questionIds.js1]
    );
    await execute(
      "INSERT INTO answers (id, answer, question_id) VALUES (?, ?, ?)",
      [ans3, "async/await is syntactic sugar over Promises, making async code look synchronous.", questionIds.js2]
    );

    // Mark ans1 as accepted answer for js1
    await execute("UPDATE questions SET answer_id = ? WHERE id = ?", [ans1, questionIds.js1]);

    return NextResponse.json({
      message: "✅ Database seeded successfully!",
      data: {
        user: "user@atlasmail.com / 123456",
        topics: topics.map((t) => t.name),
        questions: seedQuestions.length,
        answers: 3,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
