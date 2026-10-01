// Door check-in slots: one entry in an attendee's `checkinStatus` array per
// person their card admits — the guest ('primary') plus each party member,
// keyed by that person's id. `checkpoints` stays a { checkpointId: bool } map
// so every existing reader (installed scanner apps, the scan-promo SMS
// trigger, the reports export) keeps working unchanged.
//
//   { id, attendee_name, relation, checkpoints: { gate: true }, log: [...],
//     removed?: true, extra?: true }
//
// Mirrored in haflaway_admin_spa/src/utils/checkinSlots.js,
// functions/utils/checkinSlots.js and lib/utils/checkin_slots.dart.
// Keep all four in step.

export const PRIMARY_SLOT_ID = 'primary'

// The people a guest's card admits, in door order.
export function partyPeople(attendee) {
  const primaryName = (attendee?.fullName ?? '').trim() || 'Guest'
  const members = Array.isArray(attendee?.partyMembers) ? attendee.partyMembers : []
  // Ids must be unique or two people would share one slot.
  const seen = new Set([PRIMARY_SLOT_ID])
  return [
    { id: PRIMARY_SLOT_ID, name: primaryName, relation: 'Guest' },
    ...members.map((m, i) => {
      let id = m?.id || `member_${i + 1}`
      if (seen.has(id)) id = `${id}__${i + 1}`
      seen.add(id)
      return {
        id,
        name: (m?.name ?? '').trim() || `${primaryName} +${i + 1}`,
        relation: m?.relation || 'Guest',
      }
    }),
  ]
}

export function isSlotCheckedIn(slot) {
  return Object.values(slot?.checkpoints ?? {}).some(v => v === true)
}

// Rebuilds the slot array so it matches the party, without ever losing a
// real arrival:
//  - a person keeps the slot bound to their id (renamed if their name changed)
//  - a person with no slot yet takes over an unbound slot (legacy "SLOT 02"
//    entries written before slots had ids, or an `extra`), else gets a new one
//  - a removed member's slot is dropped, unless someone was already checked in
//    on it — then it stays, flagged `removed`, so the door still sees it
//  - leftover unbound slots: when the attendee has a recorded party
//    (`partyMembers` is an array) the party decides, so they're dropped like a
//    removed member's. Older attendees with no party on record got their
//    capacity from the card template instead; there they stay as `extra`
//    admits, because shrinking one at the door would turn away a guest the
//    card allowed. `partyIsAuthoritative` overrides that guess.
// Deterministic for a given input, so the check-in screen and the
// transaction that writes a check-in agree on every slot id.
export function reconcileSlots(existingSlots, attendee, {
  checkpointIds = [],
  partyIsAuthoritative = Array.isArray(attendee?.partyMembers),
} = {}) {
  const existing = Array.isArray(existingSlots) ? existingSlots : []
  const bound = new Map()
  const unbound = []
  existing.forEach((slot, idx) => {
    if (!slot || typeof slot !== 'object') return
    // A duplicated id (written by an older client) is treated as unbound so
    // it gets its own id below instead of shadowing the first.
    if (slot.id && !slot.extra && !bound.has(slot.id)) bound.set(slot.id, slot)
    else unbound.push({ slot, idx })
  })

  const seed = Object.fromEntries(checkpointIds.map(id => [id, false]))
  const withSeed = cps => ({ ...seed, ...(cps ?? {}) })

  const out = []
  const people = partyPeople(attendee)
  const peopleIds = new Set(people.map(p => p.id))
  // Someone without a slot takes the first free unbound slot, in order. A
  // `removed` one is history of whoever came in on it, never reassigned.
  const takeUnbound = () => {
    const i = unbound.findIndex(u => !u.slot.removed)
    return i === -1 ? null : unbound.splice(i, 1)[0].slot
  }
  for (const p of people) {
    const base = bound.get(p.id) ?? takeUnbound()
    const { removed, extra, ...rest } = base ?? {}
    out.push({
      ...rest,
      id: p.id,
      attendee_name: p.name,
      relation: p.relation,
      checkpoints: withSeed(base?.checkpoints),
      log: Array.isArray(base?.log) ? base.log : [],
    })
  }

  for (const [id, slot] of bound) {
    if (peopleIds.has(id) || !isSlotCheckedIn(slot)) continue
    out.push({ ...slot, checkpoints: withSeed(slot.checkpoints), log: slot.log ?? [], removed: true })
  }

  const usedIds = new Set(out.map(s => s.id))
  const uniqueId = base => {
    let id = base
    for (let n = 2; usedIds.has(id); n++) id = `${base}_${n}`
    usedIds.add(id)
    return id
  }
  for (const { slot, idx } of unbound) {
    if (partyIsAuthoritative && !isSlotCheckedIn(slot)) continue
    const { removed, ...rest } = slot
    out.push({
      ...rest,
      id: uniqueId(slot.id || `extra_${idx + 1}`),
      attendee_name: `${people[0].name} +${out.length}`,
      relation: 'Extra admit',
      checkpoints: withSeed(slot.checkpoints),
      log: Array.isArray(slot.log) ? slot.log : [],
      extra: true,
      ...(partyIsAuthoritative ? { removed: true } : {}),
    })
  }

  return out
}

// What the door works with. An attendee with no stored slots has no card
// yet and cannot be checked in; never invent slots for them here.
export function doorSlots(attendee) {
  const stored = attendee?.checkinStatus
  if (!Array.isArray(stored) || !stored.length) return []
  return reconcileSlots(stored, attendee)
}

// Slots the card still admits (a removed member's slot is history only).
export function activeSlots(slots) {
  return slots.filter(s => !s.removed)
}

export function slotCounts(slots, checkpointId = null) {
  const active = activeSlots(slots)
  const isIn = s => (checkpointId ? s.checkpoints?.[checkpointId] === true : isSlotCheckedIn(s))
  return { checked: active.filter(isIn).length, total: active.length }
}

// Pure check-in: marks `slotIds` in at `checkpointId`. Already-in and removed
// slots are skipped, so a double tap or a second gate scanning the same card
// can never flip anyone back out. Returns the new array and the ids changed.
export function applyCheckin(slots, slotIds, checkpointId, actor) {
  const want = new Set(slotIds)
  const at = new Date().toISOString()
  const changed = []
  const next = slots.map(slot => {
    if (!want.has(slot.id) || slot.removed || slot.checkpoints?.[checkpointId] === true) return slot
    changed.push(slot.id)
    return {
      ...slot,
      checkpoints: { ...(slot.checkpoints ?? {}), [checkpointId]: true },
      log: [...(slot.log ?? []), { cp: checkpointId, action: 'in', at, by: actor ?? null }],
    }
  })
  return { slots: next, changed }
}

// Pure check-out: the deliberate undo, logged like a check-in.
export function applyCheckout(slots, slotId, checkpointId, actor) {
  const at = new Date().toISOString()
  const changed = []
  const next = slots.map(slot => {
    if (slot.id !== slotId || slot.checkpoints?.[checkpointId] !== true) return slot
    changed.push(slot.id)
    return {
      ...slot,
      checkpoints: { ...slot.checkpoints, [checkpointId]: false },
      log: [...(slot.log ?? []), { cp: checkpointId, action: 'out', at, by: actor ?? null }],
    }
  })
  return { slots: next, changed }
}

// When this slot was last checked in at `checkpointId`, or null.
export function lastCheckinAt(slot, checkpointId) {
  const log = slot?.log ?? []
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].cp === checkpointId) return log[i].action === 'in' ? log[i].at : null
  }
  return null
}
