import AiChat from "@/components/ai-coach/AiChat";

function AiCoachPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold heading text-center mb-4">AI Fitness Coach</h2>
        <AiChat isAuthenticated={isAuthenticated} />
      </div>
    </section>
  );
}
export default AiCoachPage;