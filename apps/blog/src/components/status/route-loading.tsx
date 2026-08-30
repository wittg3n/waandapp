export function RouteLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="در حال بارگذاری"
      className="site-shell py-16 sm:py-24"
      id="main-content"
    >
      <div className="h-4 w-24 animate-pulse rounded-full bg-[#e9e9ec]" />
      <div className="mt-5 h-10 max-w-lg animate-pulse rounded-2xl bg-[#ededf0]" />
      <div className="mt-3 h-5 max-w-2xl animate-pulse rounded-xl bg-[#f1f1f3]" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="overflow-hidden rounded-[1.5rem] border border-[#ececef] bg-white"
            key={index}
          >
            <div className="aspect-[16/10] animate-pulse bg-[#f0f2fb]" />
            <div className="space-y-3 p-6">
              <div className="h-4 w-20 animate-pulse rounded-full bg-[#ececf0]" />
              <div className="h-6 animate-pulse rounded-lg bg-[#e9e9ec]" />
              <div className="h-4 w-4/5 animate-pulse rounded-lg bg-[#f0f0f2]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
