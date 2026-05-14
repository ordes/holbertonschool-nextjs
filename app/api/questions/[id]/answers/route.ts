import { NextResponse } from "next/server";
import { fetchAnswersByQuestionId } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const answers = await fetchAnswersByQuestionId(id);
    // Return id, answer, question_id as per spec
    return NextResponse.json(answers);
  } catch (error) {
    console.error("API Error /api/questions/:id/answers:", error);
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}
