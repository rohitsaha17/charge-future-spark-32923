/**
 * Skeleton shown while a lazy-loaded route chunk is downloading.
 * Mimics the shape of a typical page (hero band + content cards) so the
 * layout doesn't jump when the real content mounts. Uses Tailwind's
 * `animate-pulse` to signal "content is coming", not a spinner — which
 * feels much faster than an empty box or a centred loader.
 */
const PageSkeleton = () => (
  <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
    <div className="container mx-auto px-4 max-w-6xl">
      {/* Hero band */}
      <div className="animate-pulse space-y-4 mb-12">
        <div className="h-4 w-40 bg-primary/20 rounded-full mx-auto" />
        <div className="h-10 md:h-14 w-3/4 md:w-1/2 bg-foreground/10 rounded-lg mx-auto" />
        <div className="h-5 w-full max-w-xl bg-foreground/5 rounded-lg mx-auto" />
        <div className="h-5 w-3/4 max-w-md bg-foreground/5 rounded-lg mx-auto" />
      </div>

      {/* Content grid */}
      <div className="animate-pulse grid gap-4 md:grid-cols-3">
        <div className="h-40 md:h-48 bg-white/60 rounded-2xl border border-border/40" />
        <div className="h-40 md:h-48 bg-white/60 rounded-2xl border border-border/40" />
        <div className="h-40 md:h-48 bg-white/60 rounded-2xl border border-border/40" />
      </div>

      <div className="animate-pulse mt-6 h-56 md:h-72 bg-white/60 rounded-2xl border border-border/40" />
    </div>
  </div>
);

export default PageSkeleton;
