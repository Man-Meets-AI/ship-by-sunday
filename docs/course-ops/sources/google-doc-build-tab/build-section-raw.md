<span class="c11">Build Block</span>

# <span class="c8">Build Block </span>

<span class="c0"> </span>

<span class="c0">The build loop. </span>

<span class="c0"> </span>

<span class="c0">GitHub. </span>

## <span class="c5">Setting up a Landing Page</span>

Using <span class="c4"> <a
href="https://www.google.com/url?q=http://next.js&amp;sa=D&amp;source=editors&amp;ust=1773414633239370&amp;usg=AOvVaw3juNZfVEDnZ1EZ1Ks5V7x0"
class="c12">next.js</a> </span> <span class="c0">. React. Typescript.
</span>

<span class="c0"> </span>

<span class="c0">We are going to use an IDE which is like a browser for
your files and a terminal. Every terminal for every MacBook comes with a
terminal.</span>

<span class="c0"> </span>

<span class="c0">I'm going to give you guys the brief overview of how
all this stuff works, but there's really just a few commands that you
actually need to know when you're building a simple app.</span>

<span class="c0"> </span>

#### <span class="c18">Lay of the Land</span>

<span class="c0">Web projects use a bunch of Lego blocks that are called
packages, and that's what this folder is. They're called node_modules,
but you could just think of them as Lego blocks. There's going to be a
manager that manages those Lego blocks. Used to be that people would
fight over this, but it's more important just to use whatever AI is
accustomed to using.</span>

<span class="c0"> </span>

#### <span class="c18">Important Files</span>

<span class="c0">We have a couple important files that the AI will
likely end up asking you about, and it's just good to know, so I'll give
you a quick overview. The environment files are essentially a list of
your passwords for different accounts. When you're building your app on
your computer, that's called the local environment, and you'll have that
list of passwords there. When you actually get it off your computer and
onto the internet, your list of passwords will be on the company that's
responsible for hosting your site, which is Vercel.</span>

<span class="c0"> </span>

<span class="c0">Knowing these few things will make it a lot easier when
you're prompting your way around the codebase. You can think of it as
just a bunch of different files and different folders. Every app does a
few things:</span>

- <span class="c0">It needs to be able to authenticate, which means it
  knows that it's who you are versus the next person.</span>
- <span class="c0">It needs to be able to authorize, which means it
  knows, "Okay, we know who you are, but are you able to have access to
  this part of the app?"</span>

<span class="c0">Apps' databases are just giant spreadsheets that use
that authentication part that we talked about to let you see information
or not see information. You have ways of getting new information on the
page; that's data fetching. You have something that's called state
management, which is, if something changes on another computer (let's
say your friend's looking at the same screen), does yours need to change
as well? Those are all small details, but I think it's good to at least
know the terms.</span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0">And it uses something called components, which, if
you're familiar with Figma, are just reusable pieces of code. If you
went on amazon.com, you'd notice that they have a nav bar; that nav bar
looks the same in most places. Maybe there's one or two changes
depending on if you're shopping for groceries or not, but they're not
rewriting that code over and over and over again. There's one component
and then maybe a few changes within it.</span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0">As far as styles go, we're going to be using something
that's called Tailwind. Before Tailwind, you'd have to write a bunch of
code in a language called CSS, which was a cascading style sheet. You
don't really need to know that, but that's just something that you would
point out to the coding agent if you were trying to make style
changes.</span>

<span class="c0"> </span>

### <span class="c5">Templates:</span>

<span class="c0">This product you bought is free-to-access. </span>

If you’re not including payments, then you can follow this one:
<span class="c4"> <a
href="https://www.google.com/url?q=https://github.com/get-convex/template-nextjs-clerk.git&amp;sa=D&amp;source=editors&amp;ust=1773414633244507&amp;usg=AOvVaw3tsr-46imLLe14s_HR_J6H"
class="c12">https://github.com/get-convex/template-nextjs-clerk.git</a>
</span>

<span class="c0">  
And just ignore the parts about Stripe in the lessons. </span>

<span class="c0"> </span>

### <span class="c5">Marketing Site</span>

<span class="c0">Now we're going to set up the marketing site, and this
is the thing that every user will see, so it's also known as the home
page or the index route. This is what anyone in the world can go and
look at without buying your thing, and its role is to communicate what
product or service you're offering. In our case, an app is typically
going to solve a problem, typically has a headline, and it tries to
speak to the particular customer profile of the person.</span>

<span class="c0"> </span>

<span class="c0">This goes into all the work that we did up front here
before we started coding and before we started designing, which is just:
who is this for, what problem does it solve? That's the language that we
use on the homepage so that when someone sees it and they have that
problem and it's a big enough problem, they're going to want to
buy.</span>

<span class="c0"> </span>

<span class="c0">So you've already found your inspiration. You've
already gone and come up with examples, and now it's time to use your
coding agent.</span>

<span class="c0"> </span>

<span class="c0">I assume you have Codex or Claude code already set up.
If you don't, you can go to one of their links and get it set up.
There's plenty of information online about that. We're going to set up
just one tool before we get going here.</span>

<span class="c0"> </span>

1.  <span class="c0">MCPS were going to get:</span>

<!-- -->

1.  Figma: <span class="c4"> <a
    href="https://www.google.com/url?q=https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server&amp;sa=D&amp;source=editors&amp;ust=1773414633246469&amp;usg=AOvVaw1-kBGfUvnOsGNoS_H7oA7c"
    class="c12">https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server</a>
    </span>
2.  <span class="c0">Playwright</span>

<span class="c0">What this is going to let us do is take our
pixel-perfect design and have it built for us. It's going to also use
playwright, which is used primarily for testing, without having actually
click through screens.</span>

### <span class="c5">Deploying & GitHub</span>

### <span class="c5">Setting up your core UX for users.</span>

<span class="c0"> </span>

<span class="c0">So for this, I’ll list out all the steps involved with
me actually making the product. </span>

<span class="c0"> </span>

<span class="c0">We need to go beyond static websites to building
something dynamic. This requires adding a few pieces that were typically
tricky pre-ai. </span>

<span class="c0"> </span>

<span class="c0">Don’t get worried - if you have any questions go and
ask ai using the explainer prompt. </span>

<span class="c0"> </span>

#### <span class="c18">Setting up Skills and MCPS</span>

2.  <span class="c0">I start by getting all the skills needed. Skills
    are essentially a list of instructions used for the AI model to know
    exactly what to do. Theyre put out by the companies who produce that
    software. So theyre typifcally very helpful.</span>
3.  <span class="c0">Skills were going to get:</span>

<!-- -->

1.  <span class="c0">Convex Skill</span>

<!-- -->

1.  <span class="c0">This will allow us to set up our database.
    https://github.com/waynesutton/convexskills</span>

<!-- -->

2.  <span class="c0">Clerk Skill https://github.com/clerk/skills</span>

<!-- -->

1.  <span class="c0">This allows us to have our authentication setup
    properly. Authentication allows users to sign up to our app. </span>

<!-- -->

3.  Stripe Skill <span class="c4"> <a
    href="https://www.google.com/url?q=https://docs.stripe.com/building-with-llms&amp;sa=D&amp;source=editors&amp;ust=1773414633248663&amp;usg=AOvVaw3iOqkRx4sY2gogGZE5zs-E"
    class="c12">https://docs.stripe.com/building-with-llms</a> </span>  
    <span class="c4"> <a
    href="https://www.google.com/url?q=https://github.com/stripe/ai/blob/main/skills/stripe-best-practices/SKILL.md&amp;sa=D&amp;source=editors&amp;ust=1773414633248858&amp;usg=AOvVaw3-AvlHbYNuThdyb2pMSjxX"
    class="c12">https://github.com/stripe/ai/blob/main/skills/stripe-best-practices/SKILL.md</a>
    </span> <span class="c0"> </span>

<!-- -->

1.  <span class="c0">This allows us to connect to stripe so we can
    process payments. </span>
2.  <span class="c0">If you don’t have a stripe account, you need to get
    that set up now</span>

#### <span class="c18">Setting up DB, Authentication and Payments</span>

1.  <span class="c0">Next we’re going to write our prompt. \$skill is
    how we summon a skill inside of the prompt, or in claude code it’s
    done by writing a slash command. </span>
2.  <span class="c0">You can call multiple skills in the same prompt. So
    we’re going to do just that.</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 720.00px; height: 142.67px;">
<img src="images/image1.png"
style="width: 720.00px; height: 142.67px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

3.  <span class="c0">Now we need to get a few keys called environment
    variables. These are the passwords involved. </span>

<!-- -->

1.  <span class="c0">Get Stripe Key and Publishable Key</span>

<!-- -->

4.  <span class="c0">Now we need to ask Codex to create the product and
    the price. </span>
5.  <span class="c0">Now we need to set up a webhook </span>
6.  <span class="c0">Now we need to authenticate our Shell. </span>
7.  <span class="c0">We need to sign up for Convex & Clerk</span>
8.  <span class="c0">Inside of Clerk we’ll get a few env vars. These are
    basically passwords.</span>
9.  <span class="c0">The deployment means is this the live app or the
    test app. We’re building the test one. We’ll get more into keys in a
    few minutes.</span>
10. <span class="c0">We have one last step in Clerk that will allow us
    to connect it to Convex, our database. This lets Clerk and Convex be
    on the same page as to who paid for our product!</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1324.00px;">
<img src="images/image20.png"
style="width: 2048.00px; height: 1324.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1324.00px;">
<img src="images/image15.png"
style="width: 2048.00px; height: 1324.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1324.00px;">
<img src="images/image8.png"
style="width: 2048.00px; height: 1324.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c9">What to do in Clerk</span>

<span class="c0">  1. Open Clerk Dashboard</span>

<span class="c0">  2. Go to JWT Templates</span>

<span class="c0">  3. Create a new template from the Convex
preset</span>

<span class="c0">  4. Do not rename it. It must be exactly convex</span>

<span class="c0">  5. Make sure the issuer matches your current Clerk
frontend API domain</span>

<span class="c0"> </span>

<span class="c0">Docs:</span>

<span class="c0">  - https://docs.convex.dev/auth/clerk</span>

<span class="c0">  - https://docs.convex.dev/auth/debug</span>

<span class="c0">  - https://clerk.com/docs/integration/convex</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1168.00px;">
<img src="images/image22.png"
style="width: 2048.00px; height: 1168.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0"> </span>

#### <span class="c18">Testing & Sandbox Keys</span>

<span class="c0">We successfully created our product - but we did so in
a live environment. If we were to go back and test our app, we’d find
that it’s going to try to charge us real money.  
  
We dont want to do that. </span>

<span class="c0"> </span>

<span class="c0">So instead, we’re going to ask our code agent to stop
the project. </span>

<span class="c0"> </span>

<span class="c0">Click on your account name and then create a sandbox.
This is going to ask if you want to copy it, and that's what we're going
to do. This then takes the product and then copies it down. We'll change
out those keys, and that way you can test without actually getting
charged.</span>

<span class="c0"> </span>

<span class="c0">If we had not done this, then it would have actually
charged us.</span>

<span class="c0"> </span>

<span class="c0">Ask your coding agent to create the product again and
get the webhook secret.</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 720.00px; height: 100.00px;">
<img src="images/image14.png"
style="width: 720.00px; height: 100.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

#### <span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 720.00px; height: 337.33px;"> <img src="images/image16.png"
style="width: 720.00px; height: 337.33px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" /> </span>

#### <span class="c18"> </span>

#### <span class="c18">Implementing the UX </span>

<span class="c0">We've finished all of the annoying bits of this, and
now we can actually implement our screen.</span>

<span class="c0"> </span>

<span class="c0">Now, luckily, this is kind of the purpose of this
system. We've picked the right tech, and we've thought about all the
design beforehand, so now we can just cruise through things.</span>

<span class="c0"> </span>

<span class="c0">So, what I'll do is open up my design file. I will tell
the AI the following: We're going to be going screen by screen to
implement this. If you find anything along the way where we don't have
data model support, we'll tag the data model and add something so that
we have it in convex. Otherwise, complete the screen. Come back to me
after you've looked at it with Playwright.</span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0">So now if you do run into any bugs, all you do is you
copy and paste.</span>

<span class="c0"> </span>

<span class="c0">Don't forget to use skills, as those are going to be
what gets you out of trouble with specific providers.</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 720.00px; height: 360.00px;">
<img src="images/image21.png"
style="width: 720.00px; height: 360.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0"> </span>

### <span class="c5">Implementing Core UX </span>

<span class="c0">We didn’t get our designs perfect. Thats ok. Now we can
get things into code. THe important part is that we have the user flow,
and the core ux outlined. </span>

<span class="c0"> </span>

It would actually <span class="c22">NOT </span> <span class="c0">make
sense to go full pixel perfect. </span>

<span class="c0"> </span>

<span class="c0">You learn more as you get something built.</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 961.00px; height: 2048.00px;">
<img src="images/image12.png"
style="width: 961.00px; height: 2048.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>
<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 676.10px; height: 1440.85px;">
<img src="images/image12.png"
style="width: 676.10px; height: 1440.85px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0">I spent a bunch of time chatting with ChatGPT to hammer
out what I thought would make sense such that we wouldnt have to repeat
ourselves over and over and over again. </span>

<span class="c0"> </span>

<span class="c0">In our case. I was writing a curriculum. THen I wrote a
guide for recording all of this. Then afterwards I realized that I
needed to find a faster system to get this into screens. \]</span>

<span class="c0">  
AI is also GREAT at workflows. So I asked it to help me come up with a
workflow. The output of that chat is what I used above. </span>

<span class="c0"> </span>

<span class="c0">I use the \$figma skill, pass in the concepts, then
pass in the design crit. </span>

<span class="c0"> </span>

<span class="c0">While that goes off and does its thing I’ll actually go
do something else. </span>

<span class="c0"> </span>

<span class="c0">The planning, the thinking, the design. That’s the part
that matters. </span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 1118.00px; height: 806.00px;">
<img src="images/image18.png"
style="width: 1118.00px; height: 806.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0">Next it will ask me a series of questions. </span>

<span class="c0"> </span>

<span class="c0">Next I get a BIG old plan. </span>

### <span class="c5">PLAN Mission-Control Lesson Layout System</span>

#### <span class="c18">Summary</span>

- <span class="c0">Replace the current ProductShell plus monolithic
  LessonPage with a product-only workspace system that matches the Figma
  dark shell, keeps the existing palette as a light-mode option, and
  covers /mission plus all lesson routes in one implementation
  wave.</span>
- <span class="c0">Keep layouts registry-driven from
  app/lessonRegistry.ts: mission stays fixed, each lesson keeps its
  current shell as the default view, and every non-mission lesson
  supports a client- side split/focus override plus collapsible
  objective/coach chrome.</span>
- <span class="c0">Keep marketing pages out of scope. This refactor
  applies to protected product routes only.</span>

#### <span class="c18">Implementation Changes</span>

- <span class="c0">Introduce a product-scoped theme provider for
  protected routes only. Default to dark, persist the choice in
  localStorage as sbs:theme, and expose the toggle in the top HUD. Do
  not add next-themes; use a lightweight data-theme attribute and
  semantic CSS variables.</span>
- <span class="c0">Convert hardcoded protected-route colors into
  semantic tokens for background, surface, border, HUD, rail, text,
  muted text, and accent states. Light mode maps to the current palette.
  Dark mode maps to the Figma shell, including the dark chrome,
  translucent panels, blue active accents, and wider workbench
  proportions.</span>
- <span class="c0">Do not block shell work on exact Figma font sourcing.
  Use the current loaded brand fonts plus a mono chrome style for HUD,
  coach, and workbench labels until exact font assets are
  available.</span>
- <span class="c0">Replace ProductShell with a shared
  ProductWorkspaceShell that owns the top HUD, route nav, block
  progression, progress count, theme toggle, split/focus controls, coach
  toggle, and bottom skill rail. /mission, /lesson/\[lessonId\],
  /artifacts, and / settings all consume this shell; only /mission and
  lesson bodies get redesigned in this pass.</span>
- <span class="c0">Redesign /mission as the Figma-style mission control
  home: 4 block cards, registry-driven block state, direct entry to the
  next available lesson, and the bottom skill rail. Use registry truth
  for progress, so the HUD denominator becomes 26 lessons plus the
  separate mission screen.</span>
- <span class="c0">Promote the Figma dark-shell background and block art
  into checked-in assets under public/ so the product UI does not depend
  on expiring Figma URLs. and resources payloads. Missing content
  renders intentional</span>
- <span class="c0">Keep shell, coachMode, and panelDefaults as the
  default layout seed. Persist per-lesson UI chrome overrides in
  localStorage as sbs:lesson-ui:. Do not store layout preferences in
  Convex.</span>
- <span class="c0">Replace the monolithic lesson renderer with
  LessonShellSplit, LessonShellFocus, and WorkbenchRenderer. The shell
  owns layout only. The workbench owns lesson interaction. Pinned
  artifacts move out of the shell sidebar and become inline context
  cards or readonly fields inside the workbench.</span>
- <span class="c0">Implement one renderer per workbench type instead of
  one giant field switch: guided_form, score_table, collector_board,
  capture_upload, scope_split, brief_assembler, console_checklist,
  tracker_log, and external_workspace.</span>
- <span class="c0">Back those workbench renderers with reusable field
  controls for text, textarea, select, toggle, table, board, readonly,
  and upload placeholder states.</span>
- <span class="c0">Add a stable UploadFieldValue object shape for
  image_upload and video_upload fields so layout work does not need to
  change when storage lands. This phase only needs the renderer contract
  and local preview or empty states; durable student upload storage
  remains a separate implementation dependency.</span>
- <span class="c0">Keep Convex lesson progress, autosave, completion,
  and artifact preview flows intact. getLessonState only needs to return
  the richer registry payload. No schema migration is required because
  fieldValues already accepts objects.</span>

#### <span class="c18">Public Interfaces / Types</span>

- <span class="c0">LessonConfig gains coachContent with typed video,
  transcript, examples, and resources.</span>
- <span class="c0">PersistedFieldValue expands to include an
  UploadFieldValue object for image and video workbench fields.</span>
- <span class="c0">LessonPage stops owning layout details directly and
  instead passes lesson data, field values, save/complete actions, and
  pinned artifacts into LessonShell\* plus WorkbenchRenderer.</span>

#### <span class="c18">Test Plan</span>

- <span class="c0">Run pnpm run typecheck and pnpm run build.</span>
- <span class="c0">Manually QA /mission, /lesson/1.1, /lesson/1.5,
  /lesson/2.4, / lesson/3.5, and /lesson/4.3 to cover mission, split,
  focus, upload, external workspace, and tracker layouts.</span>
- <span class="c0">Verify dark is the default, the theme toggle persists
  across refresh and navigation, and light mode reuses the current
  palette without broken contrast.</span>
- <span class="c0">Verify split/focus/coach state persists per lesson,
  defaults come from the registry, and switching views never drops
  autosaved field values.</span>
- <span class="c0">Verify empty coach content, missing uploads, and
  unhosted media show intentional placeholder states instead of blank
  panels or runtime errors.</span>
- <span class="c0">Verify HUD progression, bottom skill rail, next/back
  navigation, and progress counts all reflect registry truth on mission
  and lesson routes.</span>
- <span class="c0">Verify tablet and mobile collapse behavior: HUD stays
  usable, objective and coach panels collapse cleanly, and focus mode
  keeps the workbench primary.</span>

#### <span class="c18">Assumptions</span>

- <span class="c0">This first implementation wave includes the
  mission/home redesign plus lesson shells; marketing pages stay
  unchanged.</span>
- <span class="c0">Video hosting, transcript files, examples, and
  download URLs are not blockers for the shell refactor; the UI ships
  with typed content slots and graceful empty states.</span>
- <span class="c0">Typography parity is secondary to color, layout, and
  interaction parity for this pass.</span>

<span class="c0"> </span>

<span class="c0">—</span>

<span class="c0"> </span>

### <span class="c5">What do I do with the plan</span>

<span class="c0">I recommend skimming through it. You’ll start to pick
up on what some of it means. You can always ask the code agent to help
you fix things after.</span>

<span class="c0"> </span>

<span class="c0">Once that got done, I got pretty dang close to the
designs, but I needed to go and click around and find some of the
rougher edges.</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1521.00px;">
<img src="images/image3.png"
style="width: 2048.00px; height: 1521.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0">The fastest way to do that was to find edge cases where
it's like, "Oh, maybe this user shouldn't be able to go do this thing
just yet." In my case, it's a locked lesson, so I clicked on that and I
got an error. I can just grab that text and come up with a plan. If I
can't go and view that content, then I need a plan.</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1324.00px;">
<img src="images/image19.png"
style="width: 2048.00px; height: 1324.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0">PRO TIP: THe more you know, the more leverage you
actually get. Knowing the codebase is super helpful.</span>

<span class="c0"> </span>

Asking to refactor is part of <span class="c17">vibe coding </span>
<span class="c0"> agentic engineering. </span>

<span class="c0"> </span>

<span class="c0"> </span>

### <span class="c5">Cleaning Up Your CodeBase</span>

<span class="c19">› how might we clean up the project so its easier for
devs to work on?</span>

<span class="c0"> </span>

<span class="c0">A prompt like the one above goes a LONG way. The
purpose of it is so that your system can get cleaned up, and documented.
This lets future coding agents add to your project and makes your life a
lot easier! </span>

<span class="c0"> </span>

It’ll suggest up to ten methods for cleaning up your project. You want
to ask it to <span class="c19">come up with a phased approach that
doesn’t interfere with our launch</span> <span class="c0">. </span>

<span class="c0"> </span>

<span class="c0">This will generate a new plan that you can then let the
coding agent run. </span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0"> </span>

### <span class="c5">Cleaning is different from Refactoring. </span>

<span class="c0"> </span>

<span class="c0">Use the following prompt</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1324.00px;">
<img src="images/image11.png"
style="width: 2048.00px; height: 1324.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0">Then spin out new ones</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 872.00px; height: 404.00px;">
<img src="images/image9.png"
style="width: 872.00px; height: 404.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0"> </span>

### <span class="c5">Debugging </span>

<span class="c0">It’s inevitable that the AI can and will make mistakes.
It’s just how you handle them that makes the difference. </span>

<span class="c0"> </span>

<span class="c0">You want your AI agent to be equipped with everything
it needs to solve the problem. </span>

<span class="c0"> </span>

<span class="c0">Logs. These are error messages. The \$convex skill
allows your AI agent to look into what’s going on when you have an
error. </span>

<span class="c0"> </span>

<span class="c0">The Playwright MCP is used for finding things that
appear when you’d usually go to manually click around. </span>

<span class="c0"> </span>

<span class="c0">Tip: Use image uploads, and logs when possible. </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 720.00px; height: 501.33px;">
<img src="images/image10.png"
style="width: 720.00px; height: 501.33px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>
<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 720.00px; height: 505.33px;">
<img src="images/image2.png"
style="width: 720.00px; height: 505.33px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

### <span class="c5">The Feature Loop</span>

<span class="c0">The rest of the implementation sounds silly, but you're
essentially:</span>

1.  <span class="c0">coming up with a plan</span>
2.  <span class="c0">asking it to implement it</span>
3.  <span class="c0">waiting for it to implement</span>
4.  <span class="c0">then testing it in the browser</span>

<span class="c0">When you run into an issue, paste in screenshots or
errors where you can. Ask it to fix it. That's it.</span>

<span class="c0"> </span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1800.00px;">
<img src="images/image4.png"
style="width: 2048.00px; height: 1800.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0"> </span>

### <span class="c5">Running Multiple Agents in Parallel</span>

<span class="c0">Avoid worktrees. Theyre complicated. It’s more pain
than its worth. </span>

<span class="c0"> </span>

<span class="c0">INstead you can imagine that these agents are all
working in tandem. So long as they dont touch the same files, things
stay clean!</span>

<span class="c0"> </span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 344.00px;">
<img src="images/image5.png"
style="width: 2048.00px; height: 344.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0">Documentation Matters</span>

<span class="c0"> </span>

<span class="c0"> </span>

### <span class="c5">Improving Code Quality</span>

<span class="c9">Do this one time.</span>

<span class="c0">While you may not care to read all the code, the nature
of all the code gen means that we should be cleaning things up as we go.
</span>

<span class="c0"> </span>

<span class="c0">We have 1 skill that could be really helpful here:  
\$vercel-best-practices.</span>

<span class="c0"> </span>

<span class="c0">We can ask it to find 3 areas tht need to be
refactored. </span>

<span class="c0"> </span>

<span class="c9">Call Convex to make a pass of improvements</span>

<span class="c9"> </span>

<span class="c9"> </span>

<span class="c0"> </span>

<span class="c0"> </span>

<span class="c0"> </span>

### <span class="c5">Common Bugs Issues:</span>

#### <span class="c18">Whats NPM / PNPM / BUN? </span>

<span class="c0">The PM stands for package manager. Think of a package
manager as an app store for code people have already written. Instead of
using a website to look for the apps, you just tell the package manager
to install the package you want. Package = code already written. Theres
packages for how to handle timezones, how to show the weather on your
page, you name it! </span>

<span class="c0"> </span>

<span class="c0">NPM is the old one. PNPM is a newer one. BUN is the
newest one. I notice that most Coding Agents prefer using PNPM, so dont
bother asking it to use something it prefers using. </span>

<span class="c0"> </span>

<span class="c0"> </span>

#### <span class="c18">The page is stale!!!</span>

<span class="c0">This means that your AI Agent  may have built the app
for use on the web, in an effort to find errors. This is not good when
you dont want to have to restart your app. </span>

<span class="c0"> </span>

<span class="c0">So you just ask the AI agent to “please stop our
services” then “start our services”</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1031.00px;">
<img src="images/image7.png"
style="width: 2048.00px; height: 1031.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

<span class="c0"> </span>

#### <span class="c21">When I Make a Payment, I’m not shown screens for paid users</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1295.00px;">
<img src="images/image17.png"
style="width: 2048.00px; height: 1295.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1514.00px;">
<img src="images/image6.png"
style="width: 2048.00px; height: 1514.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>

<span class="c0"> </span>

### <span class="c5">Login Is Still Not Working</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 2048.00px; height: 1178.00px;">
<img src="images/image13.png"
style="width: 2048.00px; height: 1178.00px; margin-left: 0.00px; margin-top: 0.00px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px);" />
</span>
