So I'm going to talk a little bit about kind of what's going on behind the build here.
So give you a peek into some of the things we're doing as we enter this third era of building agent teams.
Most of this will be pretty tactical and just kind of things we're actually doing since I find it's a very, I don't know,
hard topic to get into and figure out how you actually start building these teams.
And so I thought it'd be useful to share notes from the field.
But before I do, I wanted to motivate a little bit with sort of as I've been thinking about building agent teams, what are the hard challenges for an engineering leader?
Because I thought it would be good to say these things out loud.
So what are the new challenges?
Well, the new challenges are, as Michael alluded to, we've gone from zero amount of code being written by AI at the beginning of 2025 to, as Michael said, about 15, 20 percent across the enterprise.
It has skyrocketed.
that Michael mentioned of 75, that kind of is off the chart here.
But we've seen just an explosion and a change that's like bigger than any change
I can think of in my career in terms of how engineering teams are getting work done.
And in fact, at more forward-leaning companies such as ourselves,
it's about 98% of merged commits are being written by AI.
So obviously this is quite exciting,
but we find this kind of curious thing when we talk to customers.
They love Cursor, they roll it out, and they get this immediate boost that's really exciting.
And then a year later, that boost is kind of plateaued.
And it's a little different for every customer, but I would say the vibe number of the average kind of plateau is maybe 40-ish percent of increased productivity.
And it doesn't kind of keep growing after that.
My job, in some sense, as I think about building a system or team of agents, is to get way higher than that 40% number.
So why is that?
And if you think about how much you're spending in R&D on engineering,
maybe something like 60% to 80% of your R&D budget
is probably being spent on folks who were handcrafting code.
If you basically instantly collapse that entire 60% to 80%,
you've got these models that are great at writing code and do it way faster.
You'd intuitively expect to see a 3% to 4% improvement,
improvement, but many folks are kind of stuck in this, you know, 40-ish percent throughput
improvement. I think this is actually like a fundamental limit of like using coding assistants
in phase two, like you can try to use them faster and faster, but till you graduate to sort of this
next phase, I think you will find yourself stuck at some kind of throughput that looks something
like that. So why is that? Well, I go to kind of the broader STLC. Of course, the engineering
product and design team at Cursor is doing other things than just writing lines of code. We have
sort of a planning phase, a building phase, a shipping phase, shipping and validating and
making sure that the infrastructure is running. And then of course, like a retro phase to make
sure we're learning from mistakes and kind of making sure that they're better. And so as I
think about this sort of agent system and this team that we're building, I think one of the
really useful things is to actually think about it from the other direction, which is what are all
of the human steps in this new world? Let's assume we can chain together systems like the ones Michael
Let's assume we can chain them together and get agents to do a lot of stuff.
There still is stuff we want humans to do.
And so I like to approach it from that angle and ask myself, like, what are the things we still want humans to do?
This is probably not all of the artifacts, but, you know, when you're in the plan phase, you know, you can kind of imagine agents are getting good at collecting user feedback from interviews, doing market research, maybe even exploring the solutioning space.
But at some point you probably want a human before you go spend a bunch on building and marketing and selling something.
You probably want a human to look at a rigorous plan and make sure that this artifact looks like something we do indeed want to invest in.
And at the build phase, you know, obviously some fraction of that is maybe being done by AI agents writing effectively all of the code.
But at some point you'd like an artifact that explains the architecture decisions that were made, maybe the risky parts of the code.
Maybe you don't need to see every single section of the 20,000 line PR, but you do want to see that key kind of 100 lines here and there.
You want to see a demo of it working.
You know, every PR that I've ever loved when I was reviewing PRs had screenshots or had a demo link.
It's obviously awesome if you have that.
One of the really cool parts of Jonas's demo coming up will be sort of the agents actually producing this demo artifact.
But at the end of the day, before you actually put it in production,
I think almost all of us have agreed that we want a human whose name is on it,
who said, yes, this looks good and it's ready to go into production.
So we probably still will have a human kind of reviewing and approving.
And you can imagine this exists for the ship and the retro.
You know, you probably still want a human.
You know, ideally, you'd have as much of an AISRE kind of doing stuff in production.
But you probably still want humans with pager duty installed if the agents get stuck
is a production outage.
And obviously, humans will be trying
to give feedback on the outcomes.
And you'll be trying to learn from that
and make the system stronger.
And so I think the threshold problem
that we have fundamentally is a problem
that we've only replaced a tiny part of the SDLC.
And we found all of these new bottlenecks.
So the rest of this talk is about how
we're getting into the details of trying
to remove some of the rest of the bottlenecks.
And admittedly, we are early in the journey as well.
But we have been very focused on this
for the last couple of months.
notes from the field. Oh sorry, one more abstract kind of more abstract slide. So
if we think of our job as sort of turning intelligence into software, I
kind of like to think of it like this, where intelligence is you know the
models, the harness, a lot of what has made this sort of AI revolution possible.
Then we have sort of the humans at the top and you know we're thinking about
the humans job and I just kind of shared maybe like reviewing these artifacts and
giving feedback on these artifacts. In the middle we have this system or this
we need to build. And I think this is really the hard part is figuring out what should be coming
out of the system. And ideally, it's these very polished artifacts that have a very clear synthesis
of what the agent did, a very clear set of decisions that the agent needs the human to make,
and obviously all of the pixels so that you can envision exactly what it is that the agent is
proposing. And then obviously, you also want a really good, you know, IO loop where the human
is able to give high fidelity feedback into the agent.
The agent is just going to pick it up, fix it, and run with it.
And I think more and more as we think about sort of the new iteration of the cursor IDE,
we're thinking about making sure it's this amazing system for reviewing these polished artifacts
and also giving feedback to them and learning from that feedback.
As you think about this sort of agent team, I think about it as this middle block.
And so we've been kind of digging in to building some of these.
And you'll notice that some of these are actually outside of the core building part of the SCLC.
But I think it's creating leverage on sort of time that other folks are spending, whether it's PMs, security folks, the growth team.
They were kind of spending a bunch of this human time and they found ways to build little teams of agents to fix those problems.
So the first two agents I'd like to introduce you to are our PM agent and our EM agent.
And if you had told me a month ago that we would have a PM agent and an EM agent,
I would have told you that you were crazy. But we do indeed have these agents.
It was an engineer on our team named Lauren who noticed a problem.
So I'm gonna explain the problem a little bit and then I'll explain what these agents do.
So when we were launching Glass, which was our internal name for the new agent window,
we encouraged the entire company to dog food Glass as much as possible and
and report every single paper cut, every single bug,
every single polished detail
into a channel called Issues Glass.
So we have a Slack channel,
folks are reporting 10, 20 issues a day.
And Lauren was the on-call engineer
and she noticed something that was happening
in the Issues Glass channel,
which was someone would report an issue
and then we would boot up a cloud agent,
say, at cursor, please fix this.
We have this internal joke that we'll say like,
oh, I've got a guy on it,
agent to go solve this problem. But Lauren noticed that our guys were not like really making a ton
of progress all the time and the guys were getting stuck and we weren't actually kind of shipping
fixes all the time. And so she had an interesting idea which is like well I wonder what would happen
if I got a little bit more rigorous on these reports. And so she sort of did a couple manually
and she found a kind of consistent pattern of what she wanted to do here. What she wanted to do is
called the how skill and there was a second skill called the why skill and those skills basically
teach the harness how to inspect the code base in more rigorous detail and get to quite a bit more
of an explanation of what's going on in the code. And then she also wanted a system prompt because
I don't know if you've ever noticed this but sometimes bug reporters don't report all of the
gory details they just give you this kind of vague thing and so what this automation that she built
does is it takes a trigger of a Slack message and it sort of goes and
researches the code base and within a couple minutes it comes back with
usually a bunch more questions about the bug and getting a lot more detail from
from the bug reporter and so this has been a very cool loop we see all of
these kind of hilarious conversations happening where it's almost like the bug
reporter agent is kind of sassing the person who reported the bug and we're
getting like a lot more detail and sometimes it actually sort of resolves
It was like a support ticket.
And now that we have looked at the code base,
we have answered the person's question and it goes away.
But often it's a bug or sometimes it turns out as a feature request.
And so that was kind of the first unit of brilliance is like,
let's use these skills and then let's make a bug reporter agent.
And the PM agent and the EM agent is just one more layer of synthesis on this.
So now that we have a bunch of great issues flowing through issues glass,
and we have a bunch more synthesis about what's happening,
we're able to take two higher level agents and one of them kind of sorts all of the issues and
triages them into P0, P1, P2. And then the other one, this is a more experimental one, is an EM agent who's actually going in and
saying, hey two new remote SSH bugs came in,
can you take a look directly to the engineer? This second one doesn't quite work exactly right yet because we don't have the
perfect map of like who owns which areas of the codebase. So we're trying to teach this agent right now
like who owns which components so that the actual assignment can be more accurate.
But this has been very cool to see the development just a couple weeks of kind of curiosity at the
primitive level up through an automation and then even more higher order automation.
And just to show you the architecture of what this looks like, again all of these are fully
autonomous so when we say agent manager it is a fully autonomous agent that is running I think
it's I forget if it's once a day or once a week but that's EM agent is running at the top it's
It's kind of synthesizing these automations that we have running around bug reports.
And then each of these is using a couple of skills and a couple of tools to figure out what's going on and kind of create clarity for the team.
You know, I think what's cool about this is we're not in the build part of the SDLC right here.
We're actually kind of closer to the plan part of the SDLC.
But we've taken this task that was this really annoying task that one of the engineers would have to do.
And we've made it much faster, more delightful and more automated.
there's a long way to go here. Like we need to get the EM agent sort of routing to the right
engineer. And I think we'll probably need to learn from sort of success rates of what's
happened in the past to create more of a knowledge layer in memories for these workflows. But I think
we can start to get this to feel a lot better if we sort of invest in this. And so this is an
example where we kind of went outside of our normal duties. And in this case, Lauren, she did
a great job of sort of identifying a different problem, more of the meta problem, and started
together some of these primitives of skills in Cursor and automations in Cursor to build what
actually kind of feels like a weirdly magical experience. And then this is the last piece,
kind of skills or the atomic unit. So we did also spend a bunch of time, I think this is actually a
really important piece of the overall equation here. So we have this very kind of lengthy and
precise how skill, which was kind of the critical piece missing when we were sort of assigning a
cloud agent to things. We weren't digging in rigorously enough into the code base to figure
And so this atomic unit was also incredibly important.
And so it was kind of the insight of like,
okay, Slack message comes in,
I got to use this skill and one other skill,
and then I got to get a little bit more information
from the end user.
And then that thing starts to be
what is a more agentic experience.
So I wanted to take you through one deep dive
just to kind of give you a sense of how these are built.
We have a couple other cool areas.
One of them is the security bot.
So this was from our security team.
This trigger is more when a PR is published.
So if you had infinite amounts of security resources, you would have an AppSec engineer kind of dig into every single PR and spend many hours looking over the PR trying to find critical high, medium and low vulnerabilities.
We do not have infinite amounts of security engineers to do this.
And so Travis on our team said, wouldn't it be cool if an agent did this instead?
So again, this is a different automation,
but it's running a series of prompts
to go find all of the kinds of findings
that AppSec engineers tend to find.
And we have fixed over 200 vulnerabilities.
Almost all of these are automatically fixed.
These tend to catch things that are pretty easy
for agents to fix, but we have pretty meaningful progress.
And I think we're not growing the AppSec team
as fast as we would normally need to grow it
because we've created leverage here.
And in some sense, we're doing an even more thorough job
every single PR because we can afford to, because we just got a guy to do it. Another one, we were
sort of changing some of the ways that we kind of require code review in our SDLC. So this is
another automation that we made that's sort of triggered by a PR getting created. I call this
the agentic detection for lower risk commits. In summary, we had changed the policy so that
that a lot more code review is required
in various circumstances.
And we were using this sort of traditional
kind of code owners thing where you'd have a PR
that would sometimes hit like eight different reviewers
and engineers were like super unhappy
that these like tiny little string changes
were then hitting like a whole bunch of different reviewers
and getting blocked on that part of the process.
We said, well, wouldn't it be cool
if we got one of these agents to look at the PR
and just give us a risk assessment?
there are many PRs that go through that are very, very low risk.
And so we got comfortable, you know, without actually turning it on at first.
We got comfortable with the risk assessments over the course of a week or so,
and we get these sort of outputs on our PRs.
And then we, once we got comfortable enough that these assessments seemed pretty reasonable,
we made it so that when you got a very low risk assessment,
you could just merge to production without a human reviewer.
And actually one of the other cool side effects is sometimes we get medium high risk,
agent is also able to tell us who knows the most about this area of the code. And so it actually
routes to a better code reviewer than the code owner's file has because it's using a lot of this
sort of depth of the code base and knowledge there. And so this one has been a hit and has
allowed us to actually do more rigorous code review, but also let the less risky stuff through.
And then finally, this is like a totally different part of the business, but our growth team has also
been doing some cool stuff. So on the growth side, we have about two engineers doing a lot
of experiments. We try to run 20 or 30 experiments a month. We were noticing that we were sort of
doing a lot of manual work as we ran these experiments. So our rough pipeline of experiments
is plan, launch, run the experiment, make a decision, and then kind of make a call on which
one to ship and then hopefully clean up the code. And so the stack we use for growth is we use
stat sig for a b testing we use a linear for the specific sort of experiment kind of to do's we use
like a notion database that has a little bit of the higher level thinking on like what experiments
we're running and then obviously we use the code we ended up building four different agents here
one kind of audits the setup we often make kind of mistakes when we're setting up an experiment
where we don't have the right metrics attached we had a second one sort of to sync the docs
PMs were kind of working in Notion,
the engineers were working in Linear and Statsig,
and the code, and it was actually just like
quite a bit of copy pasting what was going on.
Monitoring the run was kind of a big problem,
so we would sometimes launch an experiment
and then we wouldn't check on it for like six days,
and then we'd see that the metrics
were looking totally bonkers,
or we had not even measured one of the metrics correctly.
We'd be like, oh gosh, we gotta go restart,
we got to go like deploy something that fixes the metric logging and then we got to restart
the experiment from scratch and so we were like losing actually you know a week on a bunch of
these experiments and we said wouldn't it be nice if we had an agent like actually making sure that
the experiments aren't going bonkers you know 24 hours in and so sure enough that problem is very
fixable with an agent you know we have an agent that kind of can help us like read the the data
from statsig uh and actually suggest a winner this is a place where we still have a human
on which variant we want to go with.
And actually, one of the problems we were having
is we weren't actually cleaning up the feature flags sometimes
when we declared a winner.
And so this agent will actually go ahead and also post the PR.
When you say, like, I want variant B,
it will post the PR to actually clean up all of the Statsig
code in the code base and just make branch B happen.
Obviously, still merged by the engineer,
but this meant we had way fewer dead branches existing
So anyway, again, just sort of like a growth engineer realizing, you know, he was wasting a bunch of different time on kind of different admin things that was adding a bunch of overhead and actually our experiment throughput has gone through the roof.
And I think it is things like this, creating leverage on the time so that we can actually focus on the important parts of experimentation, like what are the bets we want to make and actually building the experiments.
So just a couple of places where we've been leveraging AI in different parts of the SDLC.
Hopefully that's helpful.
Maybe a couple last thoughts that I just wanted to share.
I feel like there's been a couple of sort of organizational shifts we've had to do.
As you start to think about the meta system and the team that you're building agent-wise,
you get to just a different set of priorities.
So one of the big things is we've been evolving the culture.
It's really cool to see the culture starting to emerge.
Like last night, someone said, we have a DevX channel,
which is basically where software engineers go to complain
about when they're having a problem with their DevX.
Someone said, it's kind of unfair.
Like why do humans get this channel
and the agents running in the cloud
don't have a place to complain?
So they set up an AgentX channel,
and now we have like a whole stream of agent issues
where the agent is frustrated
because they can't do something.
This is still a work in progress experiment,
actually start to like auto-fix the things that the agent is complaining about. I think this is
like a compounding kind of cultural thing. Once you start talking about the factory and get everyone
thinking about the factory, everyone's setting goals of making skills that people are using,
figuring out who your early champions are. You know, I think Lauren, the person who built the
EM and PM agent, she's been incredible, a new hire. She's been incredible at sort of getting
us thinking in this more meta way about how to build the factory. And so we've been trying to
to kind of make bigger changes across the org.
And then I think also just lastly,
like the teams we're building just feel a little different.
You know, like this growth team I was talking about
is two software engineers, one data scientist,
one designer, one PM.
And it's just like a very different ratio
than I was used to in the past,
but it's been this insanely effective pod
because it turns out that that new set of ratios
is actually a better set of ratios
when you're able to have agents doing a lot of the work.
And so maybe as you're thinking
about evolving your organization,
I'd encourage you to think about some of these things.
Thank you.
