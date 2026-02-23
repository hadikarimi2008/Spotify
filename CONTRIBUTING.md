## Contributing to Hadi’s Spotify Project

Thank you for your interest in contributing. This is a curated, professional project and its **core structure, architecture, and main behavior must not be changed** without explicit approval from the maintainer.

Please read this document carefully before opening an issue or submitting a pull request.

---

## 1. Core Principles

- **Do not change the core structure**  
  The existing architecture, folder layout, main flows, and design patterns are intentional.  
  - Do **not** reorganize folders or files.  
  - Do **not** introduce new global state management solutions or routing paradigms.  
  - Do **not** rewrite major features or flows.

- **Preserve existing behavior and UX**  
  All changes must be strictly additive, corrective, or internal improvements.  
  - Bug fixes are welcome.  
  - Small internal refactors that do not change external behavior are acceptable.  
  - Visual or UX changes must be minimal and conservative.

- **English only in contribution artifacts**  
  - All pull request titles, descriptions, commit messages, comments, and documentation **must be in English**.  
  - In-code comments should be concise, technical, and only when necessary to explain non-obvious decisions.

---

## 2. Types of Contributions Accepted

- **Bug fixes**  
  - Fix runtime errors, console errors, accessibility issues, and obvious UI glitches.  
  - Add defensive checks and robust error handling where it is clearly missing.

- **Accessibility and quality improvements**  
  - ARIA attributes, keyboard navigation improvements, contrast fixes, and semantic markup enhancements that do **not** alter the core layout or visual identity.

- **Performance and internal improvements**  
  - Micro-optimizations (memoization, small query optimizations, reducing unnecessary renders) that do not change APIs or user-facing behavior.

- **Documentation and meta files**  
  - Enhancements to documentation, security policy, changelog entries, and similar meta assets are welcome, as long as they remain consistent and professional.

If you want to propose a **larger feature** or a **structural change**, open an issue first and clearly explain the motivation. Such changes will only be considered in exceptional cases.

---

## 3. How to Propose a Change

1. **Open an issue first (recommended)**  
   - Describe the problem clearly.  
   - Include steps to reproduce (if applicable).  
   - Suggest a _minimal_ solution that does not touch the core structure.

2. **Wait for feedback**  
   - Do not start large changes before there is confirmation that the direction is acceptable.  

3. **Implement the change**  
   - Keep the change set as small and focused as possible.  
   - Avoid unrelated cleanups in the same pull request.

4. **Submit a pull request**  
   - Use a clear, descriptive title in English.  
   - In the description, explain:  
     - **What** you changed.  
     - **Why** the change was needed.  
     - **How** you tested it.

---

## 4. Code Style and Practices

- **Languages & stack**  
  - Follow the existing Next.js / React / Tailwind CSS patterns that are already present in the codebase.  
  - Prefer consistency over personal preference.

- **Formatting & linting**  
  - Use the existing formatting conventions (indentation, naming, import order).  
  - Fix any linter errors or warnings introduced by your changes.

- **Components and logic**  
  - Reuse existing utilities and components where possible.  
  - Avoid introducing heavy dependencies for small problems.  
  - Keep components small, focused, and predictable.

---

## 5. Tests and Manual Verification

- Before submitting a pull request, you should:
  - Run the app locally and verify that your change behaves as expected.  
  - Check the browser console for new errors or warnings.  
  - Verify that existing pages still load and function normally.

- For accessibility-related changes:
  - Re-run your accessibility checks (e.g., Lighthouse / Axe) and ensure that your changes reduce, not increase, issues.

---

## 6. Professional Conduct

- Treat other contributors with respect and patience.  
- Provide **constructive**, technical feedback in reviews.  
- Avoid personal comments, sarcasm, or unprofessional language.  
- Assume good intent, but be precise and honest about technical concerns.

See the `CODE_OF_CONDUCT.md` file for more details on expected behavior.

---

## 7. Ownership and License Notes

- This project is maintained by **Hadi**.  
- All contributions are made under the project’s license.  
- By submitting a pull request, you confirm that you have the right to contribute the code and that it does not contain third-party code you do not have permission to share.

If in doubt, ask **before** you contribute significant work.

Thank you for helping keep this project clean, professional, and maintainable.

