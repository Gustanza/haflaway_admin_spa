// Which admin-console sections a user can see, and who's exempt from ever
// being restricted.
//
// Two tiers, default-deny:
//   1. Super admins — a fixed email allowlist, not stored in Firestore, so
//      this tier can never be revoked by a bad write or a UI bug. Always get
//      every section.
//   2. Everyone else at clearanceLevel 5 — governed by users/{uid}.adminSections.
//      An absent or empty list means NO sections. A super admin has to
//      explicitly check sections for a person before they see anything —
//      deliberate opt-in per admin, rather than starting everyone wide open
//      and having to hunt down and restrict each one by hand.
//
// clearanceLevel < 5 never reaches the admin app at all (see router's
// PROTECTED_EXACT/PROTECTED guard) — this module only decides what a level-5
// user sees once inside.

export const SUPER_ADMIN_EMAILS = ['haflaway@gmail.com', 'projectcogneto@gmail.com']

export function isSuperAdminEmail(email) {
  return SUPER_ADMIN_EMAILS.includes(String(email ?? '').trim().toLowerCase())
}

// One entry per sidebar nav item (route-gated) plus the Halotel toggle
// (feature-gated, not a route). `route` is used to build the router's
// path -> section lookup and to redirect a restricted user to the first
// section they can actually reach.
export const ADMIN_SECTIONS = [
  { key: 'all-events',        label: 'All Events',             hint: 'Browse and manage every event',            route: '/' },
  { key: 'users',              label: 'Users',                   hint: 'Manage user accounts and clearance',       route: '/users' },
  { key: 'organizations',      label: 'Organizations',           hint: 'Manage organizations and branding',        route: '/organizations' },
  { key: 'global-attendees',   label: 'Guests',                   hint: 'Search guests across every event',         route: '/global-attendees' },
  { key: 'messaging',          label: 'Messaging',               hint: 'Send platform-wide messages',              route: '/messaging' },
  { key: 'packages',           label: 'Packages',                hint: 'Manage pricing packages',                  route: '/packages' },
  { key: 'card-templates',     label: 'Card Templates',          hint: 'Manage invitation & contribution designs', route: '/manage-card-templates' },
  { key: 'sms-templates',      label: 'SMS Templates',           hint: 'Manage SMS message templates',             route: '/sms-templates' },
  { key: 'whatsapp-templates', label: 'WhatsApp Templates',      hint: 'Manage WhatsApp message templates',        route: '/whatsapp-templates' },
  { key: 'affiliates',         label: 'Affiliates',              hint: 'Manage the affiliate program',             route: '/affiliates' },
  { key: 'halotel-routing',    label: 'Halotel → SMTZ Routing',  hint: 'Toggle the SMS gateway routing switch',    route: null },
]

// Route path prefixes reached by drilling into a section rather than via its
// own sidebar link (e.g. opening an event from All Events).
const ROUTE_PREFIX_SECTION = [
  ['/create-event',   'all-events'],
  ['/edit-event/',    'all-events'],
  ['/event/',          'all-events'],
  ['/user-events/',   'users'],
]

export function sectionForPath(path) {
  const exact = ADMIN_SECTIONS.find(s => s.route === path)
  if (exact) return exact.key
  const prefixed = ROUTE_PREFIX_SECTION.find(([prefix]) => path.startsWith(prefix))
  return prefixed ? prefixed[1] : null
}

export function sectionsFor(user) {
  if (!user) return []
  if (isSuperAdminEmail(user.email)) return ADMIN_SECTIONS.map(s => s.key)
  if (Number(user.clearanceLevel) < 5) return []
  // Default-deny: a level-5 admin with no adminSections granted sees nothing
  // until a super admin explicitly checks sections for them. Only the two
  // super-admin emails above start with everything.
  return user.adminSections ?? []
}

export function canAccess(user, sectionKey) {
  return sectionsFor(user).includes(sectionKey)
}

// Where to send a level-5 user who just hit a section they don't have —
// the first routable section (in sidebar order) they're actually allowed.
export function firstAccessiblePath(user) {
  const allowed = new Set(sectionsFor(user))
  const match = ADMIN_SECTIONS.find(s => s.route && allowed.has(s.key))
  return match?.route ?? null
}
