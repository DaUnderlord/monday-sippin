export function AboutStats() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">By the numbers</h2>
          <p className="mt-3 text-muted-foreground">
            We’re growing a community of curious readers and builders. Here are a few highlights.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <StatCard value="50K+" label="Monthly readers" />
          <StatCard value="500+" label="Articles published" />
          <StatCard value="120+" label="Guides & tutorials" />
          <StatCard value="3+" label="Years brewing insights" />
        </div>
      </div>
    </section>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
      <div className="text-3xl md:text-4xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

