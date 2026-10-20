import Config from '@/lib/config';
import Image from 'next/image';
import OfficerTile from './officerTile';

const activities = [
  { icon: 'fa-calendar-days', title: 'Host events', description: 'Technical workshops, industry panels, socials, and competitions.' },
  { icon: 'fa-users', title: 'Build community', description: 'A welcoming space for students of all backgrounds and interests.' },
  { icon: 'fa-code', title: 'Create opportunities', description: 'Hands-on projects, research, and internship connections.' },
  { icon: 'fa-graduation-cap', title: 'Develop leaders', description: 'Grow technical and leadership skills through shared experience.' },
];

const heading = 'font-[family-name:var(--font-poppins)] text-base font-semibold text-black/85';
const panel = 'rounded-xl border border-[#d8d8d8] bg-white p-5';
const linkFocus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3b59ed]';
const committeeColors = Object.fromEntries(Config.committeeColors);

export default function Resources() {
  return (
    <div className="resources-wrapper">
      <main className="px-[60px] pt-7" aria-label="About ACM at UCLA">
        <section className="relative isolate flex items-center justify-between gap-8 overflow-hidden rounded-xl border border-[#d5e3f6] bg-[linear-gradient(110deg,#e0edff_0%,#f0f6ff_48%,#c3dcff_75%,#78aaff_100%)] px-6 py-8 text-[#14243b] md:px-8 md:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute -top-[68px] -right-4 size-64 rotate-45 rounded-3xl bg-blue-500/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -bottom-36 size-80 rotate-45 rounded-3xl border border-white/40 bg-blue-500/15" />
          <div className="relative z-10 max-w-[650px]">
            <p className="mb-4 text-[11px] font-bold tracking-[1.4px] text-[#526780] uppercase">{Config.organization.shortName}</p>
            <h1 className="font-[family-name:var(--font-poppins)] text-2xl leading-tight font-semibold md:text-[32px]">
              Association for Computing Machinery at UCLA
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-balance text-[#526175]">
              A community to learn, build, and find your place in tech. Open to every major, background, and experience level.
            </p>
          </div>
          <Image src={Config.organization.logo} alt="" width={160} height={160} priority className="relative z-10 shrink-0 drop-shadow-xl max-lg:hidden" />
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-2 gap-y-5 rounded-xl border border-[#d8d8d8] bg-white py-5 2xl:grid-cols-4 [&>div]:border-[#eeeeee] [&>div:nth-child(even)]:border-l 2xl:[&>div+div]:border-l">
              {[
                { value: '1,000+', label: 'Members', icon: 'fa-users' },
                { value: Config.committees.length, label: 'Committees', icon: 'fa-layer-group' },
                { value: 'Workshops', label: 'Learn together', icon: 'fa-calendar-days' },
                { value: 'Projects', label: 'Build with peers', icon: 'fa-code' },
              ].map(({ value, label, icon }) => (
                <div key={label} className="flex items-center justify-center gap-5 px-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#3b59ed]/8 text-[#3b59ed]">
                    <i className={`fa-solid ${icon}`} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col">
                    <dt className="order-2 text-xs text-black/60">{label}</dt>
                    <dd className="font-[family-name:var(--font-poppins)] text-xl font-semibold text-black/85">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <section className={`${panel} flex-1`} aria-labelledby="organization-mission">
              <h2 id="organization-mission" className={heading}>Our mission</h2>
              <p className="mt-2 text-sm leading-6 text-black/60">{Config.organization.mission}</p>
              <div className="my-5 border-t border-[#eeeeee]" />
              <h2 className={heading}>What we do</h2>
              <div className="mt-4 grid gap-x-6 gap-y-6 sm:grid-cols-2">
                {activities.map(({ icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#3b59ed]/8 text-[#3b59ed]">
                      <i className={`fa-solid ${icon}`} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-black/85">{title}</h3>
                      <p className="mt-1 text-[13px] leading-5 text-black/60">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="my-5 border-t border-[#eeeeee]" />
              <h2 className={heading}>Find your place</h2>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Whether you’re writing your first line of code or looking for your next challenge, there’s room to explore at ACM.
                Bring your curiosity, meet people who share your interests, and learn something new together.
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-3">
                {[
                  { title: 'Start with an event', description: 'Try a workshop, join a social, or hear a new perspective at an industry panel.' },
                  { title: 'Explore a committee', description: 'Find a group that sparks your interest, from AI and cybersecurity to design and game development.' },
                  { title: 'Make it your own', description: 'Share an idea, collaborate on a project, and help shape the community you want to be part of.' },
                ].map(({ title, description }) => (
                  <div key={title}>
                    <h3 className="text-sm font-bold text-black/85">{title}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-black/60">{description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid content-start gap-5">
            <section className={panel} aria-labelledby="organization-connect">
              <h2 id="organization-connect" className={heading}>Connect with us</h2>
              <p className="mt-1 text-[13px] text-black/60">Join the conversation and keep up with ACM.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Config.organization.resources.slice(0, 3).map(resource => (
                  <a key={resource.type} href={resource.link} target="_blank" rel="noreferrer" className={`group min-w-0 overflow-hidden rounded-lg border border-[#eeeeee] transition-colors hover:border-[#3b59ed]/40 motion-reduce:transition-none ${linkFocus}`}>
                    <div className="relative h-28 bg-[#fbfbfb]">
                      <Image src={`/resource_types/${resource.type === 'website' ? 'website-preview' : resource.type}.png`} alt="" fill sizes="(min-width: 1024px) 180px, 30vw" className="object-cover" />
                    </div>
                    <div className="flex items-center justify-between gap-1 p-3 text-xs font-bold text-black/85">
                      {resource.title}
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-black/45 group-hover:text-[#3b59ed]" aria-hidden="true" />
                    </div>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <span className="text-xs text-black/60">Also see:</span>
                {Config.organization.resources.slice(3).map(resource => (
                  <a key={resource.type} href={resource.link} target="_blank" rel="noreferrer" className={`text-xs !text-black/60 hover:!text-[#3b59ed] ${linkFocus}`}>
                    {resource.title} <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[9px]" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </div>
            </section>

            <section className={panel} aria-labelledby="organization-committees">
              <div className="flex items-center justify-between gap-3">
                <h2 id="organization-committees" className={heading}>Our committees</h2>
              </div>
              <p className="mt-1 text-[13px] text-black/60">Find a community that shares your interests.</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {Config.committees.map(name => (
                  <li key={name}>
                    <a
                      href={name === 'Dev Team' ? 'https://www.uclaacm.com/dev' : `https://www.uclaacm.com/committees#${name.toLowerCase()}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ '--committee-color': committeeColors[name], '--committee-tint': `${committeeColors[name]}14` }}
                      className={`flex items-center gap-2 rounded-md bg-[#fbfbfb] px-2 py-2 text-[13px] !text-black/80 transition-colors hover:bg-[var(--committee-tint)] hover:!text-[var(--committee-color)] motion-reduce:transition-none ${linkFocus}`}
                    >
                      <Image src={`/committees/${name === 'Dev Team' ? 'dev' : name.toLowerCase()}.png`} alt="" width={28} height={28} className="shrink-0 object-contain" />
                      {name}
                      <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-[10px] text-black/45" aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
      {[
        { title: 'Current Dev Team', key: 'currentDevTeam' },
        { title: 'Dev Team Directors', key: 'devTeamDirectors' },
        { title: 'Founding Team', key: 'foundingTeam' },
      ].map(({ title, key }) =>
        Config.organization[key]?.length > 0 ? (
          <div key={key}>
            <div className="divider" />
            <h2 className="officer-section-title">{title}</h2>
            <div className="officers">
              {Config.organization[key].map(officer => (
                <OfficerTile officer={officer} key={officer.name} />
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
