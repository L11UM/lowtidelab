// Central place for monetization/link config. Replace placeholders with real values.
export const monetization = {
  // Formspree form endpoint for the RocketGPT waitlist. Create a free form at https://formspree.io
  // and paste its endpoint here, e.g. "https://formspree.io/f/abc123".
  waitlistFormEndpoint: "https://formspree.io/f/YOUR_FORM_ID",

  // Stripe Payment Links (safe to expose client-side — no secret keys involved).
  // Create at https://dashboard.stripe.com/payment-links
  stripeTipLink: "https://buy.stripe.com/YOUR_TIP_LINK",
  stripeMembershipLink: "https://buy.stripe.com/YOUR_MEMBERSHIP_LINK",

  // Optional fallback/alternate support links.
  koFiUrl: "https://ko-fi.com/lowtidelab",
  githubSponsorsUrl: "https://github.com/sponsors/lowtidelab",
};
