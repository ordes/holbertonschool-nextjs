import { NextResponse } from "next/server";
import { fetchTopics } from "@/lib/data";

export async function GET() {
  try {
    const topics = await fetchTopics();
    // Map name -> title as per API spec
    const data = topics.map((t) => ({ id: t.id, title: t.name }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error /api/topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}
