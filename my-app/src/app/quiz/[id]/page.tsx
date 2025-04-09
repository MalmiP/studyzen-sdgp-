import TakeQuizClient from './TakeQuizClient';

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <TakeQuizClient quizId={resolvedParams.id} />;
}