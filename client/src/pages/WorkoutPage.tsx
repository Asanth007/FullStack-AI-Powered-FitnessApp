import WorkoutVideos from "@/components/workouts/WorkoutVideos";

export default function WorkoutsPage() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold heading text-center text-gray-900 dark:text-gray-100 mb-4">Workout Videos</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-8">
          Follow along with our curated collection of effective workout videos targeting different muscle groups.
        </p>
        <WorkoutVideos limit={999} />
      </div>
    </section>
  );
}
