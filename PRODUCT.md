# Product

## Register

product

## Users

The primary user is a soldier in the days or hours before a record ACFT. They open this on a phone, in barracks or at home, often in dim light and at the end of a long day. They already know the test. They are not learning the standards from this tool — they are checking whether their training numbers add up to a passing score, and where the soft spots are.

Secondary users without alienating them: NCOs / cadre running practice scoring (efficient, repeating the flow many times across soldiers), and recruits or civilian candidates who land on the page from a search and want to understand what they'd need to pass. Design decisions favor the primary user when there's tension; the secondary users get adequacy, not optimization.

## Product Purpose

Convert raw ACFT inputs (age, sex, six event results) into the score the soldier would be assigned on test day, with per-event points, total, and pass/fail surfaced clearly enough to read at a glance.

Success looks like: the user enters their numbers, sees their score, trusts it, and either feels prepared or knows exactly which event they need to bring up. No further explanation, no signup, no upsell. They close the tab.

## Brand Personality

Three words: **disciplined · honest · earned**.

Voice: the precision instrument, not the coach and not the drill sergeant. Confident enough to omit reassurance. Spare with words. Numbers are the message; copy supports them and gets out of the way.

Reference lane: Linear (tool precision), Hardgraft / WORN Journal (honest, material, no theater), Strava segment leaderboards (numbers presented as a record). The "definitive scorecard" feel.

A small, committed brand moment lives in the header: a real wordmark / identity treatment that gives the page a name and a point of view. Everywhere else, the surface serves the calculation.

## Anti-references

Two explicit no-go lanes:

- **Generic dark SaaS dashboard.** Purple-on-near-black gradients, glassmorphism cards, the big-number-small-label hero metric grid, the icon + heading + paragraph card grid. The reflex direction this codebase already drifts toward today.
- **Fitness-bro hype.** Aggressive display type, neon red/yellow accents, motivational caps lock, supplement-ad energy.

Also off the table by extension of the brand personality: cosplay-tactical (OD green, camo, stencil type, "OPERATOR" labels), consumer-friendly wellness pastels, Casio-calculator skeuomorphism, and DoD-form aesthetic.

## Design Principles

1. **Numbers are the product.** Every design choice serves reading a score fast and trusting it. Anything that pulls attention away from the digits is suspect.

2. **Respect the user's expertise.** The user knows more about the ACFT than this tool does. No tutorialization, no gamification, no encouragement copy. Adequacy of explanation, not abundance.

3. **The phone in the barracks is the primary surface.** Mobile is not a port of the desktop layout; it is the canonical layout. Desktop is the wide-screen variant, not the inverse.

4. **The header earns one brand beat. Everywhere else is the instrument.** A committed wordmark / identity moment up top — name, mark, type treatment — gives the page a point of view. From the form down, the design recedes and lets the numbers speak.

5. **Honest material, not theater.** Visual decisions read as deliberate and material (real type, real spacing, real hierarchy), never as costume. The user is an actual soldier; performing military identity at them is condescending. Earn trust by being a serious instrument, not by dressing like one.

## Accessibility & Inclusion

No formal WCAG target. The pragmatic floor: text and interactive elements remain legible in dim conditions on a phone, the primary input flow works one-handed, and `prefers-reduced-motion` is honored for any motion that isn't essential to communicating a state change.
