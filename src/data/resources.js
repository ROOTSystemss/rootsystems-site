// "Tools We Use" - a short, honest list of things we'd recommend whether or
// not there was a commission attached. Where a real affiliate link exists,
// `href` holds it; until then it stays null on purpose (see the disclosure
// line rendered above this list on the homepage) - never fabricate a link.
//
// TODO: replace each `href: null` below with the real affiliate/referral URL
// once you have one for that tool. Nothing renders as a clickable link until
// href is set - the item just shows plainly with a "(link pending)" note.
const resources = [
  {
    name: "Cloudflare",
    description: "Domain registration and DNS - this domain runs on it.",
    href: null // TODO: Cloudflare affiliate/referral link
  },
  {
    name: "1Password",
    description: "Password manager - for you and for every account behind these products.",
    href: null // TODO: 1Password affiliate link
  },
  {
    name: "Railway",
    description: "Simple app + Postgres hosting for small, single-founder products.",
    href: null // TODO: Railway affiliate/referral link
  }
];

module.exports = resources;
