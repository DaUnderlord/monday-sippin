type Member = {
  name: string
  role: string
  bio: string
  avatar?: string
}

const TEAM: Member[] = [
  {
    name: 'Ava Thompson',
    role: 'Editor-in-Chief',
    bio: 'Leads editorial direction and ensures every story is carefully brewed to perfection.'
  },
  {
    name: 'Liam Carter',
    role: 'Lead Analyst',
    bio: 'Breaks down market signals and macro trends into reader-first insights.'
  },
  {
    name: 'Maya Patel',
    role: 'Community Manager',
    bio: 'Champion of our readers—keeps conversations warm and welcoming.'
  },
  {
    name: 'Noah Williams',
    role: 'Staff Writer',
    bio: 'Writes deep dives and tutorials with clarity and care.'
  }
]

export function AboutTeam() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Meet the team</h2>
          <p className="mt-3 text-muted-foreground">
            A small group of writers, analysts, and tinkerers behind Monday Sippin'.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {TEAM.map((m) => (
            <article key={m.name} className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={m.name} src={m.avatar} />
                <div>
                  <h3 className="font-semibold leading-none">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-12 w-12 rounded-full object-cover border"
      />
    )
  }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="h-12 w-12 rounded-full grid place-items-center border bg-muted text-foreground/80 text-sm font-semibold">
      {initials}
    </div>
  )
}

