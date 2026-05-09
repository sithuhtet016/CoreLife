**CoreLife Design System**

- **Scope**: analysis focused on CSS in these files only: [client/src/index.css](client/src/index.css), [client/src/pages/LandingPage.css](client/src/pages/LandingPage.css), [client/src/pages/LoginPage.css](client/src/pages/LoginPage.css), [client/src/pages/RegisterPage.css](client/src/pages/RegisterPage.css), [client/src/pages/AssessmentPage.css](client/src/pages/AssessmentPage.css), [client/src/pages/AssessmentStep2Page.css](client/src/pages/AssessmentStep2Page.css), [client/src/pages/AssessmentStep3Page.css](client/src/pages/AssessmentStep3Page.css).

**Tokens**

- **Primary color**: `--cl-primary: #3b82f6` with hover `--cl-primary-hover: #2563eb` and deeper variants `--cl-primary-strong/deep/deeper`.
- **Accent / purple**: `--cl-accent-purple` / `--cl-purple` reused for gradients and emphasis.
- **Success / danger / warning**: `--cl-success` `--cl-danger` `--cl-warning` with soft/tint/border variants.
- **Surfaces & borders**: `--cl-surface` (white), `--cl-surface-alt`, `--cl-surface-slate`, `--cl-border`, `--cl-border-soft`, `--cl-border-slate`.
- **Text tones**: `--cl-text` (primary), `--cl-text-muted`, `--cl-text-subtle`, `--cl-text-faint`.
- **Spacing scale**: `--cl-spacing-xs` … `--cl-spacing-3xl` (0.25rem → 3rem).
- **Radii**: `--cl-radius-sm` → `--cl-radius-2xl`, plus `--cl-radius-full` for pills.
- **Shadows & ring**: `--cl-shadow-*` and `--cl-ring` for focus states.
- **Typography scale**: `--cl-text-xs` → `--cl-text-6xl`; base font-family is Inter via Google Fonts; `html { font-size: 15.5px }`.

**Buttons**

- **Primary CTA**: filled, pill or rounded (`border-radius: var(--cl-radius-full)` or 0.75rem), background `--cl-primary`, white text (`--cl-surface`), bold (`font-weight: 700`), box-shadow `--cl-shadow-primary-sm`. Hover uses `--cl-primary-hover` and slight lift transform.
- **Secondary / Muted**: outline or soft background, `border: 1px solid var(--cl-border)` or transparent border, `color: var(--cl-text-muted)` or `--cl-primary` for accent variants; hover changes background to surface-alt or border color.
- **Hero CTA**: large pill with sheen effect implemented via ::after (linear-gradient white overlay), isolation and overflow hidden for highlight.
- **Auth / small CTAs**: smaller sizes using `--cl-text-sm`/`--cl-text-xs`, full-width in forms, disabled states reduce opacity and remove transforms.

**Cards & Containers**

- **Glass/blur shells**: Used extensively for auth and assessment shells: translucent white `background: rgba(255,255,255,0.8)` + `backdrop-filter: blur(14px)` and subtle border `1px solid rgba(255,255,255,0.5)`; rounded corners 1–2rem.
- **Feature / testimonial cards**: subtle gradients, inset highlight, and deeper drop shadows (`box-shadow` variants) to lift from background. Large border-radius (1–2rem) for friendly feel.
- **Area / rating cards**: solid surface background with `border: 1px solid var(--cl-border-slate)` and hover state using `--cl-primary-tint` or soft shadow.

**Forms & Inputs**

- Inputs use `border-radius` (0.75–1rem), `background: var(--cl-surface-alt)` or variants, and `border: 1px solid var(--cl-border)`.
- Focus: `border-color: var(--cl-primary)` and `box-shadow: var(--cl-ring)` (accessible high-contrast focus ring).
- Placeholders use `--cl-text-faint`; error states use `--cl-danger`/tint/border.
- Accessibility: focus-visible rules applied globally (box-shadow ring) and `:focus-visible` used on interactive controls.

**Typography & Hierarchy**

- Font: Inter, weights 300–700. Headings use heavier weight and tight letter-spacing (`-0.02` to `-0.025em`).
- Large hero h1 uses big sizes (up to `--cl-text-6xl`), but page CSS often sets explicit px/rem sizes for hero copy.
- Body copy uses `--cl-text-base`–`--cl-text-lg` with muted color for secondary text.

**Layout & Spacing**

- Centered max-width container: `--cl-container-xl: 80rem` with page-specific padding using `--cl-spacing-*` tokens.
- Many sections use grid for responsive columns; responsive breakpoints are implemented with media queries (min-width: 640px, 768px, 1024px).
- Sticky headers and bottom action bars for assessment flows; action bars use translucent background + blur to separate from content.

**Components / Patterns**

- **Brand / icon box**: square with rounded corners, `background: var(--cl-primary)`, white icon, slight shadow.
- **Badges**: pill-shaped (9999px radius) with `--cl-primary-tint` and border `--cl-primary-border` for hero badge.
- **Progress bars / steppers**: small rounded bars with fills using `--cl-primary` and `--cl-border-slate` as background.
- **Rating UI**: multiple selectable boxes with checked states changing border, background and applying box-shadow.
- **Panes / sidebars**: translucent panels using surface variant + border and vertical stacking for steps.

**Visual Language / Motion**

- Subtle lift on hover (translateY -1px to -2px) for buttons and cards.
- Sheen overlay on hero CTAs via pseudo-element.
- Blurred ambient shapes / orbs for background interest (large, soft radial gradients) using `mix-blend-mode: screen` and `filter: blur()`.
- Entrance animations indicated by classes like `.is-visible` (translate + opacity transitions) — animation implementation happens in JS.

**Accessibility notes**

- Focus rings are present via `--cl-ring`; global :focus-visible rules applied for keyboard users.
- Color tokens provide good separation, but ensure contrast of text on tinted backgrounds (e.g., hero glass) remains >= WCAG when used with `--cl-primary-tint`.
- Buttons and inputs have size affordances (padding and hit targets) appropriate for touch.

**Usage guidance (authoring rules)**

- Use tokens from `client/src/index.css` whenever possible instead of hardcoded values.
- For CTAs: prefer `--cl-primary` with `--cl-surface` text; use pill radii for main CTAs and 0.75rem for contextual buttons.
- For panels/shells: use translucent background + `backdrop-filter` for the CoreLife aesthetic; add `border: 1px solid rgba(255,255,255,0.5)` to increase separation.
- For success/danger states: prefer the token variants (`--cl-success-tint`, `--cl-danger-tint`, etc.) for background and `--cl-success-strong` / `--cl-danger` for text.

**Where to look in repo**

- Global tokens & base rules: [client/src/index.css](client/src/index.css)
- Landing: [client/src/pages/LandingPage.css](client/src/pages/LandingPage.css)
- Auth (login/register): [client/src/pages/LoginPage.css](client/src/pages/LoginPage.css), [client/src/pages/RegisterPage.css](client/src/pages/RegisterPage.css)
- Assessment flows: [client/src/pages/AssessmentPage.css](client/src/pages/AssessmentPage.css), [client/src/pages/AssessmentStep2Page.css](client/src/pages/AssessmentStep2Page.css), [client/src/pages/AssessmentStep3Page.css](client/src/pages/AssessmentStep3Page.css)

**Next steps**

- Optionally: extract these tokens into a single `tokens.css` or Tailwind config for reuse and automation.
- I can generate a component CSS snippet library (buttons, card, input) using the tokens — want me to do that?

(End of design summary)
