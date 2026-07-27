// Which event plans (packages) an organization may choose from.
//
// The rule is attribute-based rather than a list of org IDs per plan: orgs carry
// commercial segments ("agent", "enterprise"), plans declare the segments they
// serve, and visibility is the intersection. That keeps both frequent operations
// to a single write — onboarding an org grants every plan for its segment
// including ones created later, and launching a plan reaches every org in the
// segment including ones onboarded later. Per-org allowlists would instead make
// onboarding cost one write per eligible plan, which is the operation that
// happens most often.
//
// Shapes:
//   eventPlans/{id}
//     visibility   'public' | 'segments' | 'hidden'   (absent ⇒ public)
//     segments     string[]        — when visibility === 'segments'
//     allowOrgIds  string[]        — override: visible regardless of segments
//     denyOrgIds   string[]        — override: never visible; beats everything
//   organizations/{id}
//     planSegments string[]
//
// Overrides exist for timing ("let this org in early"), not for pricing. An org
// that needs different rates should get its own plan restricted to it, so the
// variation lives in the catalogue rather than accumulating here.
//
// MIRRORED in haflaway_spa/src/utils/planVisibility.js — the two SPAs
// don't share a module tree. Change both together.

export const PLAN_VISIBILITY = {
  PUBLIC:   'public',
  SEGMENTS: 'segments',
  HIDDEN:   'hidden',
}

// Segments are typed by hand in the admin console, so they're normalized on both
// sides of every comparison — "Agent", " agent " and "agent" are one segment.
export function normalizeSegment(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function canOrgSeePlan(org, plan) {
  if (!plan) return false

  const orgId = org?.id ?? null

  // Deny beats everything, including an explicit allow — a mistake in one list
  // shouldn't be able to open access that another list closed.
  if (orgId && (plan.denyOrgIds ?? []).includes(orgId)) return false
  if (orgId && (plan.allowOrgIds ?? []).includes(orgId)) return true

  // Plans created before this feature carry no `visibility`, and reading that as
  // public keeps every existing catalogue working with no migration.
  const mode = plan.visibility ?? PLAN_VISIBILITY.PUBLIC
  if (mode === PLAN_VISIBILITY.HIDDEN) return false
  if (mode === PLAN_VISIBILITY.PUBLIC) return true

  const orgSegments = new Set((org?.planSegments ?? []).map(normalizeSegment).filter(Boolean))
  if (!orgSegments.size) return false
  return (plan.segments ?? []).some(s => orgSegments.has(normalizeSegment(s)))
}

// `keepPlanId` keeps a plan in the list even when the org can no longer choose
// it — used by the edit screens so restricting a package tomorrow doesn't blank
// out the selection on an event that already uses it. Entitlement governs what
// can be *picked*, never what an event already holds.
export function visiblePlansFor(org, plans, { keepPlanId = null } = {}) {
  return (plans ?? []).filter(p => (keepPlanId && p.id === keepPlanId) || canOrgSeePlan(org, p))
}

// Every segment already in use anywhere, so the admin UI can offer the existing
// vocabulary as chips instead of relying on people retyping it consistently.
export function knownSegments(orgs = [], plans = []) {
  const all = new Set()
  for (const o of orgs) for (const s of o?.planSegments ?? []) {
    const n = normalizeSegment(s); if (n) all.add(n)
  }
  for (const p of plans) for (const s of p?.segments ?? []) {
    const n = normalizeSegment(s); if (n) all.add(n)
  }
  return [...all].sort()
}
