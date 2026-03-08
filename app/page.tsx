import Image from "next/image";

const proofImage = "/founder-proof.jpg";

const outcomes = [
  "A clear scoped product brief",
  "A screen-by-screen plan",
  "A working deployed v1",
  "A live link you can share"
];

const blocks = [
  {
    name: "CEO Block",
    eyebrow: "01",
    hover: ["Scope the right app", "Define the MVP clearly"],
    summary: "Make the right thing before you make the thing right.",
    description:
      "Most people fail early because they pick a weak problem, a vague user, or too much scope.",
    artifact: [
      "Clear problem and customer",
      "Tight MVP scope",
      "Core user flow defined",
      "One-page product brief"
    ]
  },
  {
    name: "Design Block",
    eyebrow: "02",
    hover: ["Map the core flow", "Plan what gets built"],
    summary: "Turn the idea into something concrete enough to build.",
    description:
      "AI is fast, but it still needs direction. Map the flow, plan the screens, and define enough visual direction to build cleanly.",
    artifact: [
      "Screen map",
      "User journey",
      "Rough wireframes",
      "Build-ready spec"
    ]
  },
  {
    name: "Build Block",
    eyebrow: "03",
    hover: ["Use AI to implement", "Get the v1 working"],
    summary: "Use AI to implement the product without getting lost.",
    description:
      "Set up the stack, brief the agent properly, and build the core flow without spiraling.",
    artifact: [
      "App running locally",
      "Core flow built",
      "Agent brief dialed in",
      "Main screens working"
    ]
  },
  {
    name: "Ship Block",
    eyebrow: "04",
    hover: ["Deploy it live", "Leave with a real link"],
    summary: "Get it live, get it seen, and stop sitting on unfinished work.",
    description:
      "Most people never ship because launch feels like a separate project. Deploy the app, package it, and take the first step toward real feedback.",
    artifact: [
      "Live deployed app",
      "Shareable link",
      "Demo asset",
      "First launch plan"
    ]
  }
];

const deliverables = [
  "On-demand walkthroughs",
  "Digital guide & workbook",
  "Product brief worksheets",
  "Design & wireframe prompts",
  "Build workflow",
  "Deploy checklists",
  "Lifetime access"
];

const proofPoints = [
  "10 years in product, from design to engineering",
  "Scaled Delivery Dudes to $73M GMV and a $23M acquisition",
  "Built GPTs for Devs to 100K users in its first week",
  "Taught 110+ engineers with participation from Google and Microsoft"
];

const faqs = [
  {
    question: "Is this for beginners?",
    answer:
      "No. This is for junior and mid-level engineers who can already code and want a cleaner system for finishing and shipping."
  },
  {
    question: "Do I need to be a senior engineer?",
    answer:
      "No. You do not need senior-level mastery. You do need enough technical fluency to move through the build with structure."
  },
  {
    question: "Is this live or on-demand?",
    answer:
      "It is fully on-demand. You get the walkthroughs, guide, and worksheets immediately and move through the sprint at your own pace."
  },
  {
    question: "What kind of app is a good fit?",
    answer:
      "Scoped web apps, tools, MVPs, and narrow utilities are the best fit. This is not built for giant multi-system products in version one."
  },
  {
    question: "What if I buy and don't finish?",
    answer:
      "Complete the CEO Block within 14 days. If you do not leave with a clear One-Page Product Brief and a tighter MVP scope, email us and we will refund you."
  }
];

const whatYouGet = [
  "4-block shipping system",
  "On-demand walkthroughs",
  "Digital guide + workbook",
  "Prompts + worksheets",
  "Deploy checklists",
  "Lifetime access"
];

function SectionFrame({
  id,
  className = "",
  children
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`border border-line bg-white px-5 py-6 shadow-card sm:px-8 sm:py-8 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-ink/70">
      {children}
    </p>
  );
}

export default function Page() {
  return (
    <main className="bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col gap-4 px-3 py-3 sm:px-5 sm:py-5">
        <section className="border border-line bg-white px-4 py-4 shadow-card sm:px-6 sm:py-5">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="mb-5 flex w-full items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.26em] text-ink/65 sm:text-xs">
              <span>One weekend</span>
              <span className="font-display text-2xl tracking-[0.08em] text-ink">
                MMAI
              </span>
              <span>Design & build</span>
            </div>

            <h1 className="font-display text-[3rem] uppercase leading-[0.84] tracking-[-0.04em] text-ink sm:text-[7rem] lg:text-[8.4rem]">
              Go from idea to
              <span className="block text-ink sm:inline sm:pl-4 sm:text-white sm:[text-shadow:-2px_-2px_0_#111,2px_-2px_0_#111,-2px_2px_0_#111,2px_2px_0_#111]">
                v1 in one weekend
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-pretty text-base font-medium leading-relaxed text-ink/80 sm:text-xl">
              An on-demand weekend system for junior and mid-level engineers
              who can code, have ideas, and want a structured way to actually
              ship with AI.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#pricing"
                className="inline-flex min-w-full items-center justify-center border border-line bg-ink px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-paper transition-transform duration-150 hover:-translate-y-1 sm:min-w-72 sm:px-8 sm:text-3xl"
              >
                Get instant access
              </a>
              <a
                href="#system"
                className="inline-flex min-w-full items-center justify-center border border-line bg-white px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-ink transition-transform duration-150 hover:-translate-y-1 sm:min-w-72 sm:px-8 sm:text-3xl"
              >
                See the curriculum
              </a>
            </div>

            <p className="mt-5 text-sm font-semibold text-ink/70 sm:text-base">
              On-demand videos + digital guide/workbook. Lifetime access. Start
              this weekend.
            </p>
          </div>
        </section>

        <SectionFrame className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div>
            <SectionLabel>Outcomes</SectionLabel>
            <h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
              By Sunday you&apos;ll have
            </h2>
          </div>
          <div className="flex items-end">
            <p className="max-w-sm text-sm font-semibold leading-relaxed text-ink/75 sm:text-base">
              Not more theory. Four concrete outputs you&apos;ll use immediately.
            </p>
          </div>
          <div className="grid gap-[1px] border border-line bg-line lg:col-span-2 lg:grid-cols-4">
            {outcomes.map((item) => (
              <div
                key={item}
                className="flex min-h-40 items-end bg-white p-5 font-sans text-lg font-semibold uppercase leading-tight tracking-[0.02em]"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionFrame>

        <SectionFrame id="system" className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line/15 lg:block" />
          <SectionLabel>System</SectionLabel>
          <div className="mt-3 max-w-4xl">
            <h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
              The 4-block shipping system
            </h2>
            <p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-ink/75 sm:text-xl">
              Each block reduces ambiguity and sets up the next so you stop
              wandering and keep moving.
            </p>
          </div>

          <div className="mt-8 grid gap-[1px] border border-line bg-line lg:grid-cols-4">
            {blocks.map((block) => (
              <article
                key={block.name}
                className="group flex min-h-[18rem] flex-col justify-between bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-[2rem] uppercase leading-none sm:text-3xl">
                    {block.name}
                  </span>
                  <span className="text-sm font-light text-ink/60">
                    {block.eyebrow}
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="font-sans text-base font-medium text-ink/85 lg:text-transparent lg:transition-colors lg:duration-150 lg:group-hover:text-ink/85">
                    {block.hover[0]}
                  </p>
                  <p className="font-sans text-base font-medium text-ink/85 lg:text-transparent lg:transition-colors lg:duration-150 lg:group-hover:text-ink/85">
                    {block.hover[1]}
                  </p>
                </div>

                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
                  Hover or tap for the rest below
                </p>
              </article>
            ))}
          </div>
        </SectionFrame>

        <section className="bg-accent px-6 py-10 text-center text-paper shadow-card">
          <h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
            Not theory.
            <span className="block">Deliverables.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-paper/80 sm:text-xl">
            Each block ends with a real artifact: a brief, a plan, a build, or
            a deployment. You are not buying more information. You are buying a
            finishing system.
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <SectionFrame className="lg:sticky lg:top-4 lg:self-start">
            <SectionLabel>Block deep dive</SectionLabel>
            <h2 className="mt-4 font-display text-[2.8rem] uppercase leading-[0.82] tracking-[-0.04em] sm:text-[3.6rem]">
              The blocks
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/75">
              The page sells the system. This section proves each block has a
              real job and a real artifact.
            </p>
          </SectionFrame>

          <div className="grid gap-[1px] border border-line bg-line">
            {blocks.map((block) => (
              <SectionFrame key={block.name} className="shadow-none">
                <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
                  <div className="border border-line p-4">
                    <p className="text-sm font-light text-ink/50">
                      {block.eyebrow}
                    </p>
                    <h3 className="mt-2 font-display text-[2.8rem] uppercase leading-none tracking-[-0.04em]">
                      {block.name}
                    </h3>
                  </div>
                  <div>
                    <p className="text-xl font-medium leading-tight text-ink sm:text-4xl">
                      {block.summary}
                    </p>
                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg">
                      {block.description}
                    </p>
                    <div className="mt-6 border border-line">
                      <div className="border-b border-line px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-ink/55">
                        Outcomes
                      </div>
                      <div className="grid gap-[1px] bg-line md:grid-cols-2">
                        {block.artifact.map((item) => (
                          <div
                            key={item}
                            className="bg-white px-4 py-5 text-sm font-black uppercase tracking-[0.06em] sm:text-base"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionFrame>
            ))}
          </div>
        </div>

        <SectionFrame className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="border border-line p-5">
            <h2 className="font-display text-[2.6rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
              Built for engineers
              <span className="block text-ink sm:text-white sm:[text-shadow:-2px_-2px_0_#111,2px_-2px_0_#111,-2px_2px_0_#111,2px_2px_0_#111]">
                who don&apos;t finish
              </span>
            </h2>
          </div>
          <div className="flex items-end border border-line p-5">
            <p className="text-base leading-relaxed text-ink/75 sm:text-lg">
              For junior and mid-level engineers who can code, have product
              ideas, and keep getting stuck before anything goes live.
            </p>
          </div>
          <div className="border border-line p-5 text-base leading-relaxed text-ink/75 sm:text-lg">
            You do not need to be a senior engineer. You do need a clear system
            for scoping, building, and shipping without getting lost in the
            middle.
          </div>
          <div className="border border-line p-5 text-base leading-relaxed text-ink/75 sm:text-lg">
            This is for people who already have enough technical fluency to
            start. The product exists to help them finally close the loop.
          </div>
        </SectionFrame>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <SectionFrame>
            <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <SectionLabel>What you get</SectionLabel>
                <h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
                  The stack
                </h2>
              </div>
              <span className="font-display text-3xl uppercase sm:text-4xl">
                {deliverables.length}
              </span>
            </div>

            <div className="mt-4 grid gap-[1px] border border-line bg-line">
              {deliverables.map((item) => (
                <div
                  key={item}
                  className="bg-white px-5 py-5 font-display text-[1.45rem] uppercase leading-none tracking-[0.03em] sm:text-[2.4rem]"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionFrame>

          <SectionFrame className="flex flex-col gap-6">
            <div className="border border-line p-4">
              <SectionLabel>Built by someone who ships</SectionLabel>
              <div className="mt-4 space-y-[1px] bg-line">
                {proofPoints.map((point) => (
                  <div
                    key={point}
                    className="bg-white px-4 py-4 text-base font-semibold leading-relaxed sm:text-lg"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[22rem] overflow-hidden border border-line bg-ink">
              <Image
                src={proofImage}
                alt="Founder proof visual"
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
              This isn&apos;t theory from the sidelines. It&apos;s a system
              shaped by years of shipping products, tools, and MVPs in public.
            </p>
          </SectionFrame>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <SectionFrame>
            <div className="grid gap-[1px] border border-line bg-line">
              {faqs.map((faq) => (
                <details key={faq.question} className="group bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left text-xl font-medium leading-tight sm:text-2xl">
                    <span>{faq.question}</span>
                    <span className="grid size-12 place-items-center border border-line text-lg transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="border-t border-line px-5 py-5 text-base leading-relaxed text-ink/75 sm:text-lg">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </SectionFrame>

          <SectionFrame className="flex items-center justify-center">
            <div className="text-center">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
                Common
                <span className="block">Questions</span>
              </h2>
            </div>
          </SectionFrame>
        </div>

        <div
          id="pricing"
          className="grid gap-4 lg:grid-cols-[1fr_1.05fr]"
        >
          <section className="border border-line bg-accent px-6 py-8 text-paper shadow-card">
            <SectionLabel>Ship by Sunday</SectionLabel>
            <h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
              Go from idea to v1
              <span className="block">this weekend</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-paper/80 sm:text-lg">
              A structured, on-demand system for engineers who want to stop
              circling unfinished ideas and ship a real v1 with AI.
            </p>
            <div className="mt-8 text-6xl font-semibold tracking-[-0.05em] sm:text-7xl">
              $499
            </div>
            <p className="mt-4 max-w-sm text-sm font-semibold uppercase tracking-[0.1em] text-paper/80">
              Immediate access. No subscription. Lifetime access.
            </p>
          </section>

          <SectionFrame className="flex flex-col">
            <SectionLabel>One-time payment</SectionLabel>
            <h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
              Get instant access
            </h2>
            <div className="mt-6 grid gap-[1px] border border-line bg-line">
              {whatYouGet.map((item) => (
                <div
                  key={item}
                  className="grid grid-cols-[56px_1fr] bg-white"
                >
                  <div className="grid place-items-center border-r border-line text-2xl">
                    ✓
                  </div>
                  <div className="px-4 py-4 text-lg font-semibold">{item}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-6xl font-semibold tracking-[-0.04em]">
              $499
            </div>

            <a
              href="#pricing"
              className="mt-6 inline-flex items-center justify-center border border-line bg-ink px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-paper transition-transform duration-150 hover:-translate-y-1 sm:text-3xl"
            >
              Get instant access
            </a>

            <p className="mt-6 max-w-lg text-sm font-semibold uppercase leading-relaxed tracking-[0.08em] text-ink/70">
              Complete the CEO Block within 14 days. If you do not leave with a
              clear One-Page Product Brief and a tighter MVP scope, email us and
              we will refund you.
            </p>
          </SectionFrame>
        </div>

        <section className="grid gap-[1px] border border-line bg-line shadow-card sm:grid-cols-3">
          {["Home", "Ship by Sunday", "The AI Primer", "Blog", "Shop", "Instagram"].map(
            (item) => (
              <div
                key={item}
                className="bg-white px-5 py-5 text-sm font-bold uppercase tracking-[0.2em] text-ink/75"
              >
                {item}
              </div>
            )
          )}
        </section>

        <footer className="border border-line bg-white px-5 py-10 text-center shadow-card sm:px-8">
          <p className="font-display text-[3.4rem] uppercase leading-[0.82] tracking-[-0.05em] text-ink sm:text-[9rem]">
            Ship by Sunday
          </p>
        </footer>
      </div>
    </main>
  );
}
