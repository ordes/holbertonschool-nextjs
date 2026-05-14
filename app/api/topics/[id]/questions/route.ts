import { NextResponse } from "next/server";
import { fetchQuestions } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questions = await fetchQuestions(id);
    // Map text -> title as per spec (id, title, topic_id, votes)
    const data = questions.map((q) => ({
      id: q.id,
      title: q.text,
      topic_id: q.topic_id,
      votes: q.votes,
    }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error /api/topics/:id/questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
