# Oakland Clinical — implementation notes (WordPress + Elementor)
- css/site.css: single stylesheet. The :root block holds all tokens (colors, fonts, spacing, radii, shadows). Paste into Elementor > Site Settings > Custom CSS (or Appearance > Customize > Additional CSS) and upload fonts/*.woff2 via Elementor > Custom Fonts.
- js/site.js: optional progressive enhancement only (mobile menu, open-now pill, reveal-on-scroll, placeholder toasts, demo form validation). Elementor's own header/nav menu and form widgets replace most of it.
- Every page is built from <section> blocks = one Elementor container each. Class names (sec, bg-sand, bg-navy on-dark, card, steps, faq, crisis-band, cta, loc) can be added via Advanced > CSS Classes.
- The appointment form is a demo (the redesign has no other public forms; do not add a second contact form). On the WordPress site, rebuild it with Forminator (already in use on the live oaklandcare.org site). Collect only name, phone, email, preferred contact time, and an optional short non-clinical note with a “please don’t include health details” hint. Do not collect date of birth, address, or symptoms. Keep: honeypot, minimum-necessary fields, emergency notice, and the bot-protection settings below.
- Regenerate pages: python3 src/build.py ; screenshots: python3 src/shot.py (needs local server on :8765).

## Bot protection (Forminator)

The old site received a lot of bot form submissions. Replicate the static demo’s protections in WordPress as follows.

1. **Honeypot.** In Forminator, open the appointment form → **Behavior** (or **Settings**, depending on version) → enable **Honeypot** / **Honeypot Protection**. This adds a hidden field that real visitors never see; submissions that fill it are rejected.
2. **Cloudflare Turnstile (preferred) or reCAPTCHA v3.**  
   - Get keys: sign in at [dash.cloudflare.com](https://dash.cloudflare.com/) → **Turnstile** → add a widget for oaklandcare.org → copy the Site Key and Secret Key.  
   - In WordPress: **Forminator → Settings → CAPTCHA**. Choose **Cloudflare Turnstile** (or **reCAPTCHA v3** if Turnstile is not used). Paste the Site Key and Secret Key and save.  
   - Back in the form, add a **CAPTCHA** field (or enable CAPTCHA in the form’s Behavior/Settings) so the widget is required to submit.
3. **Submission / rate limits.** In the same form’s **Behavior / Settings**, enable **submission limits** or **rate limiting** if the installed Forminator version offers it (for example a cap on submissions per IP or a pause after too many tries). Turn it on if the option is present.
4. **Retire the old forms.** The live site also has Contact Form 7 and WPForms Lite. Once the Forminator appointment form is the only public form, **remove or disable** the Contact Form 7 and WPForms Lite forms (and deactivate those plugins if nothing else uses them). Leaving them live is how bots keep getting through.
5. **Leave security plugins on.** Keep **All-In-One Security (AIOS)** and **Loginizer** active. They protect the login and the rest of the site; they do not replace form CAPTCHA.

The static preview also uses a ~4 second time trap (reject too-fast submits) and rejects links/URLs in the note field, and shows a generic “we couldn’t send your request” message without saying why. Forminator may not have a built-in time trap — rely on honeypot + Turnstile + submission limits on the live form, and keep field validation (email format, phone pattern, max lengths, no health details in the note).
