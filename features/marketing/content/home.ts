import { productConfig } from "@/config/product";

const productName = productConfig.name;
const bonusName = productConfig.bonusName;

export const homePageContent = {
  assets: {
    proofImage: productConfig.images.founderProof,
    missionImage: productConfig.images.missionPreview,
  },
  hero: {
    docsLabel: "Docs",
    loginLabel: "Log in",
    topBarStart: "One weekend",
    topBarEnd: "Prototype to v1",
    headlineLead: "Go from app idea",
    headlineTailPrefix: "to live v1 ",
    headlineTailHover: "by Sunday",
    body: "One guided weekend sprint. Four blocks. One real outcome.",
    outcomesHeading: "You leave the weekend with",
    outcomes: [
      "A one-page product brief",
      "A screen-by-screen build plan",
      "A working first version",
      "A live link you can share",
    ],
    primaryCta: "Get instant access",
    secondaryCta: "See how it works",
    eyebrow:
      "One-time payment. Lifetime access. Start immediately after checkout.",
  },
  sprintPathSection: {
    label: "Sprint Path",
    title: "The 4-block path to a real v1",
    intro:
      "Built for builders who can already prototype but keep getting stuck before they ship. Four blocks, each with a concrete output — inside one guided workspace.",
    outcomesLabel: "Deliverables",
    blocks: [
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
          "One-page product brief",
        ],
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
          "Build-ready spec",
        ],
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
          "Main screens working",
        ],
      },
      {
        name: "Ship Block",
        eyebrow: "04",
        hover: ["Deploy it live", "Leave with a real link"],
        summary:
          "Get it live, get it seen, and stop sitting on unfinished work.",
        description:
          "Most people never ship because launch feels like a separate project. Deploy the app, package it, and take the first step toward real feedback.",
        artifact: [
          "Live deployed app",
          "Shareable link",
          "Demo asset",
          "First launch plan",
        ],
      },
    ],
  },
  offerSection: {
    stackLabel: "What you get",
    sectionTitle: "Everything under one roof",
    stackTitle: "Included",
    insideIntro:
      "One workspace ties the sprint, template, walkthroughs, and Codex-ready steps together so you are not rebuilding the process from scratch every weekend.",
    missionAlt: `${productName} workspace preview`,
    items: [
      {
        name: `${productName} guided workspace`,
        description:
          "Step-by-step workspace from rough idea to shipped v1—no blank-page restart each session.",
      },
      {
        name: "4-block guided sprint",
        description:
          "CEO, Design, Build, and Ship in order so scope and momentum stay aligned.",
      },
      {
        name: "Starter template",
        description:
          "A ready-to-use starting point so you are never stuck staring at a blank screen.",
      },
      {
        name: "Exact paste-ready Codex instructions",
        description:
          "Use the exact instructions you need to move fast in Figma and in the build without overthinking prompts.",
      },
      {
        name: "30+ walkthroughs showing the full system in action",
        description:
          "Watch the entire process used on a real build from first scope to live deployment.",
      },
      {
        name: bonusName,
        description:
          "A 25-video bonus course for builders who want stronger product judgment while they ship.",
      },
    ],
    workspacePreviews: [
      {
        name: "CEO Block",
        src: "/product/block-ceo.png",
        description: "Scope the right app before you start building.",
      },
      {
        name: "Design Block",
        src: "/product/block-design.png",
        description: "Turn the plan into screens, flows, and build direction.",
      },
      {
        name: "Build Block",
        src: "/product/block-build.png",
        description: "Keep the implementation focused on the real v1.",
      },
      {
        name: "Ship Block",
        src: "/product/block-ship.png",
        description: "Get it live and stop sitting on unfinished work.",
      },
    ],
  },
  proofSection: {
    label: "Built by someone who ships",
    intro:
      "This is not theory from the sidelines. It is a system shaped by years of shipping products, tools, and MVPs in public.",
    imageAlt: "Founder proof visual",
    imageCaption:
      "Built by someone who has moved from design to engineering to product and knows what it takes to turn rough ideas into shippable products.",
    points: [
      "10 years in product, from design to engineering",
      "Scaled Delivery Dudes to $73M GMV and a $23M acquisition",
      "Built GPTs for Devs to 100K users in its first week",
      "Taught 110+ students through Vibe with AI",
    ],
  },
  faqSection: {
    label: "FAQ",
    titleLead: "Common",
    titleAccent: "Questions",
    lead: "Straight answers beside a short track record—so you know who stands behind the system.",
    items: [
      {
        question: "Who is this for?",
        answer:
          "Builders who can already prototype or get things working, but keep getting stuck before they ship a real v1.",
      },
      {
        question: "What happens right after I pay?",
        answer:
          "If you are not signed in yet, you will sign in first. After Stripe checkout, you will land on the success page while access finalizes. As soon as it is ready, you will be sent into Mission to start the sprint.",
      },
      {
        question: "Is this a coding course?",
        answer: `It includes walkthroughs, but ${productName} is not just a video course. It is a guided workspace built to help you scope, design, build, and ship a real v1.`,
      },
      {
        question: "What if I already know a lot of this?",
        answer:
          "Then the value is not more theory. The value is the structure. Ship by Sunday gives you a clean sequence, concrete outputs, and a tighter path from idea to shipped version so you actually finish.",
      },
      {
        question: "What if I buy this and still do not finish?",
        answer:
          "The sprint is built around four blocks and concrete outputs so you keep moving. If you complete the CEO Block within 14 days and do not leave with a clear One-Page Product Brief and tighter MVP scope, email us and we will refund you.",
      },
      {
        question: "What kind of app is a good fit for this?",
        answer:
          "Scoped web apps, MVPs, narrow tools, and practical products are the best fit. It is not for giant multi-system startup ideas.",
      },
      {
        question: "How long do I get access?",
        answer: "Lifetime access. One payment, no subscription.",
      },
      {
        question: "Do I need product experience?",
        answer: `No. But if product judgment feels like your weak spot, ${bonusName} is included as a bonus.`,
      },
      {
        question: "Do I need to be good at design?",
        answer:
          "No. You need enough design direction to make a usable, coherent v1. This is not about becoming a professional designer in a weekend.",
      },
      {
        question: "Why does the workspace matter?",
        answer: `Because scattered execution kills momentum. ${productName} keeps product thinking, design direction, and build execution in one place so you are not juggling random tabs and half-decisions.`,
      },
      {
        question: "What is the starter template?",
        answer:
          "It is a ready-to-use starting point inside the system that helps you skip blank-page paralysis and start moving immediately.",
      },
      {
        question: "What are the Codex instructions?",
        answer:
          "They are exact paste-ready instructions you can use to move through the design and build process faster without having to figure out every prompt from scratch.",
      },
      {
        question: "What do the walkthroughs actually show?",
        answer:
          "They show the full system in action on a real build, so you can see how the process works from start to finish instead of trying to piece it together yourself.",
      },
      {
        question: "Do I have to use the same stack as the example build?",
        answer:
          "No. The example build shows the process in action. You can apply the same system to the stack that fits your app.",
      },
    ],
  },
  pricingSection: {
    label: productName,
    titleLead: "Go from idea to v1",
    titleAccent: "this weekend",
    intro:
      "A custom software-backed weekend sprint for builders who struggle to get a v1 out the door. Scope the MVP, map the core screens, build the core flow, and get a real first version live.",
    priceDisplay: productConfig.priceDisplay,
    eyebrow: "One-time payment. Lifetime access. No subscription.",
    paymentLabel: "One-time payment",
    ctaTitle: "Get instant access",
    trustLine:
      "After checkout, your access finishes syncing and you go straight into Mission to start.",
    includes: [
      `${productName} guided workspace`,
      "4-block guided sprint",
      "Starter template",
      "Exact paste-ready Codex instructions",
      "30+ walkthroughs showing the full system in action",
      "25-video Product Management for Beginners bonus",
      "Lifetime access",
    ],
    guarantee:
      "Complete the CEO Block within 14 days. If you do not leave with a clear One-Page Product Brief and a tighter MVP scope, email us and we will refund you.",
  },
  footerNav: [
    "Home",
    productName,
    "The AI Primer",
    "Blog",
    "Shop",
    "Instagram",
  ],
  footerWordmark: productName,
} as const;

export type HomePageContent = typeof homePageContent;
