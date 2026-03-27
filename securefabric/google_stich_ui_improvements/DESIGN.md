# Design System Specification: Editorial Fluidity

## 1. Overview & Creative North Star: "The Digital Atelier"
This design system moves away from the rigid, utilitarian "SaaS dashboard" aesthetic toward a "Digital Atelier"—a space that feels human-crafted, curated, and intentionally soft. Our North Star is **Editorial Immersion**. Every screen should feel like a high-end print monograph or a bespoke gallery space.

To achieve this, we reject the industrial grid in favor of **intentional asymmetry** and **tonal layering**. We do not "box" content; we float it. We do not "separate" sections with lines; we transition them through light and atmosphere. The goal is to make the user feel as though they are interacting with silk and silicon—a marriage of organic warmth and technical precision.

---

### 2. Colors & Surface Philosophy
The palette is rooted in sophisticated pastels that mimic natural light hitting high-quality paper.

*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined solely by background color shifts (e.g., a `surface-container-low` card resting on a `surface` background).
*   **Surface Hierarchy & Nesting:** Use the `surface-container` tiers to create depth. Treat the UI as stacked sheets of frosted glass.
    *   **Background (`#f9f9ff`):** The canvas.
    *   **Surface-Container-Low (`#f1f3ff`):** Subtle depth for secondary modules.
    *   **Surface-Container-Highest (`#d7e2ff`):** For primary interactive zones that need to "pop" against the airy background.
*   **The "Glass & Gradient" Rule:** Use Glassmorphism for floating overlays. Apply a `backdrop-blur` of 20px–40px combined with a semi-transparent `surface-container-lowest` (at 60% opacity) to create a "frosted glass" effect.
*   **Signature Textures:** For Hero CTAs and primary metrics, use a subtle linear gradient transitioning from `primary` (`#6c5a61`) to `primary-container` (`#f4dce4`) at a 135-degree angle. This adds a "soul" to the UI that flat colors lack.

---

### 3. Typography: The Power of Playfair
We utilize **Playfair Display** (mapped to the "Newsreader" tokens in our technical stack) for *all* elements. This monochromatic font choice places the burden of hierarchy on scale and weight.

*   **Display & Headline:** Use `display-lg` (3.5rem) and `headline-lg` (2rem) for high-impact editorial moments. Use negative letter-spacing (-0.02em) for large headings to maintain a tight, professional look.
*   **The Metric Aesthetic:** When displaying data, use `display-md` (2.75rem). Because Playfair is a serif font, metrics feel like financial prestige rather than cold data.
*   **Body & Label:** Use `body-lg` (1rem) for readability. Ensure line-height is generous (1.6 or higher) to maintain the "airy" feel of the system.

---

### 4. Elevation & Depth: Tonal Stacking
Traditional drop shadows are too "digital." We use **Tonal Layering** and **Ambient Light** to convey importance.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` section. The minute shift in tone creates a natural, soft lift.
*   **Ambient Shadows:** For elements that must float (like Modals or Floating Action Buttons), use an ultra-diffused shadow:
    *   `box-shadow: 0 20px 50px rgba(37, 50, 75, 0.06);`
    *   The shadow color must be a tint of `on-surface` (`#25324b`), never pure black.
*   **The "Ghost Border":** If a boundary is legally or functionally required, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

---

### 5. Components & Interface Elements

*   **Buttons:**
    *   *Primary:* Pill-shaped (`rounded-full`). Solid `primary` color with `on-primary` text. No shadow.
    *   *Secondary:* `surface-container-high` background with `primary` text.
    *   *Interaction:* On hover, a subtle scale increase (1.02x) and a transition to a glassmorphic state.
*   **Naked Charts:** Data visualizations must have no axis lines, no grid lines, and no bounding boxes. Use the `tertiary` and `secondary` pastel tokens for data fills. Data should appear to float organically on the page.
*   **Input Fields:** Ghost-style inputs. Use a `surface-container-lowest` background with a `rounded-md` (1.5rem) corner. The active state is signaled by a transition to a `primary-container` tint, not a heavy border.
*   **Cards:** Never use a divider line between a card header and body. Use a `spacing-6` (2rem) vertical gap to define the relationship between elements.
*   **The "Floating Pill" Navigation:** Navigation should be a floating glassmorphic bar at the top or bottom of the viewport, using `rounded-full` and a `backdrop-blur`.

---

### 6. Do’s and Don’ts

**Do:**
*   **Do** embrace white space. If you think there is enough padding, add `spacing-4` more.
*   **Do** use asymmetrical layouts (e.g., a large headline on the left with body text shifted 2/12ths to the right).
*   **Do** use "Pill" roundness for almost everything. It reinforces the fluid, human-crafted feel.

**Don't:**
*   **Don't** use 1px dividers. If you feel the need for a line, use a background color change instead.
*   **Don't** use "Information Density" as an excuse to clutter. If the data is dense, break it into layered "sheets."
*   **Don't** use high-contrast shadows. Shadows should be so soft they are almost imperceptible as a separate effect.
*   **Don't** use standard sans-serif fonts for "readability." Playfair Display is our voice; trust its elegance even in small labels.

---

### 7. Spacing & Rhythm
We follow a 0.35rem base unit, but lean heavily on the larger end of the scale to ensure the "Editorial" feel:
*   **Section Gaps:** Use `spacing-20` (7rem) or `spacing-24` (8.5rem).
*   **Component Internal Padding:** Use `spacing-5` (1.7rem) for horizontal and `spacing-4` (1.4rem) for vertical to create a wide-screen, cinematic feel.