import { fetchQuestionById, fetchAnswersByQuestionId } from "@/lib/data";
import { createAnswer, markAsAnswer } from "@/lib/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Check } from "lucide-react";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await fetchQuestionById(id);
  if (!question) notFound();

  const answers = await fetchAnswersByQuestionId(id);

  // Sort: accepted answer first, then rest in original order
  const sortedAnswers = [
    ...answers.filter((a) => a.id === question.answer_id),
    ...answers.filter((a) => a.id !== question.answer_id),
  ];

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href={`/ui/topics/${question.topic_id}`}
        className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
      >
        ← Back to Topic
      </Link>

      {/* Question Heading */}
      <h1 className="text-2xl font-bold text-black mb-8 leading-snug">
        {question.text}
      </h1>

      {/* Answer Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Submit an Answer
        </h2>
        <form action={createAnswer} className="flex gap-2">
          <input type="hidden" name="questionId" value={id} />
          <Input
            name="answer"
            type="text"
            required
            placeholder="Write your answer here..."
            className="flex-1 border-gray-300"
          />
          <Button type="submit" className="shrink-0">
            Submit
          </Button>
        </form>
      </div>

      {/* Answers List */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          {answers.length} Answer{answers.length !== 1 ? "s" : ""}
        </h2>

        {sortedAnswers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No answers yet</p>
            <p className="text-sm text-muted-foreground">Be the first to answer!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedAnswers.map((ans) => {
              const isAccepted = ans.id === question.answer_id;
              return (
                <li
                  key={ans.id}
                  className={`bg-white rounded-xl border shadow-sm p-4 flex items-start justify-between gap-4 ${
                    isAccepted
                      ? "border-green-300 bg-green-50"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {isAccepted && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    )}
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {ans.answer}
                    </p>
                  </div>

                  {/* Mark as answer button */}
                  {!isAccepted && (
                    <form action={markAsAnswer} className="shrink-0">
                      <input type="hidden" name="questionId" value={id} />
                      <input type="hidden" name="answerId" value={ans.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon-sm"
                        title="Mark as accepted answer"
                        className="border-gray-200 hover:border-green-400 hover:text-green-600"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
