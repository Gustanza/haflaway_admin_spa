<template>
  <aside class="as-root" :class="{ 'as-root--collapsed': collapsed }">

    <!-- Brand row -->
    <div class="as-brand-row">
      <div class="as-brand" @click="router.push('/')">
        <span class="as-glyph">✦</span>
        <span class="as-brand-name">Haflaway</span>
      </div>
      <button class="as-collapse-btn" @click="toggle" :title="collapsed ? 'Expand' : 'Collapse'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
      </button>
    </div>

    <!-- Nav -->
    <nav class="as-nav">
      <span class="as-nav-label">Workspace</span>

      <router-link to="/" class="as-item" :class="{ 'as-item--active': route.path === '/' }" :title="collapsed ? 'All Events' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <span class="as-item-label">All Events</span>
        <span v-if="!collapsed" class="as-item-badge">{{ eventCount }}</span>
      </router-link>

      <router-link to="/users" class="as-item" :class="{ 'as-item--active': route.path.startsWith('/users') || route.path.startsWith('/user-events') }" :title="collapsed ? 'Users' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </span>
        <span class="as-item-label">Users</span>
      </router-link>

      <router-link to="/organizations" class="as-item" :class="{ 'as-item--active': route.path.startsWith('/organizations') }" :title="collapsed ? 'Organizations' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/>
            <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/>
            <path d="M15 21V11h4a2 2 0 0 1 2 2v8"/>
            <path d="M9 7h2"/><path d="M9 11h2"/><path d="M9 15h2"/>
          </svg>
        </span>
        <span class="as-item-label">Organizations</span>
        <span v-if="!collapsed && pendingBrandingCount > 0" class="as-item-badge as-item-badge--alert">{{ pendingBrandingCount }}</span>
      </router-link>

      <router-link to="/global-attendees" class="as-item" :class="{ 'as-item--active': route.path.startsWith('/global-attendees') }" :title="collapsed ? 'Guests' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <polyline points="16 11 18 13 22 9"/>
          </svg>
        </span>
        <span class="as-item-label">Guests</span>
        <span v-if="!collapsed" class="as-item-badge">{{ attendeeCount }}</span>
      </router-link>

      <router-link to="/messaging" class="as-item" :class="{ 'as-item--active': route.path.startsWith('/messaging') }" :title="collapsed ? 'Messaging' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.38 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </span>
        <span class="as-item-label">Messaging</span>
      </router-link>

      <router-link to="/packages" class="as-item" :class="{ 'as-item--active': route.path.startsWith('/packages') }" :title="collapsed ? 'Packages' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </span>
        <span class="as-item-label">Packages</span>
      </router-link>

      <router-link to="/sms-templates" class="as-item" :class="{ 'as-item--active': route.path.startsWith('/sms-templates') }" :title="collapsed ? 'SMS Templates' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="14" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 17v4"/>
            <path d="M15 17v4"/>
            <path d="M9 21h6"/>
          </svg>
        </span>
        <span class="as-item-label">SMS Templates</span>
      </router-link>

      <router-link to="/whatsapp-templates" class="as-item" :class="{ 'as-item--active': route.path.startsWith('/whatsapp-templates') }" :title="collapsed ? 'WhatsApp Templates' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </span>
        <span class="as-item-label">WhatsApp Templates</span>
      </router-link>

      <router-link to="/affiliates" class="as-item" :class="{ 'as-item--active': route.path.startsWith('/affiliates') }" :title="collapsed ? 'Affiliates' : ''">
        <span class="as-item-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="3"/>
            <path d="M6 20v-1a6 6 0 0 1 12 0v1"/>
            <path d="M19 8a3 3 0 1 1 0-6"/>
            <path d="M21 18v-1a4 4 0 0 0-3-3.87"/>
            <path d="M5 8a3 3 0 1 0 0-6"/>
            <path d="M3 18v-1a4 4 0 0 1 3-3.87"/>
          </svg>
        </span>
        <span class="as-item-label">Affiliates</span>
      </router-link>
    </nav>

    <!-- Spacer -->
    <div class="as-spacer" />

    <!-- Bottom section -->
    <div class="as-bottom">

      <!-- Wallet balance -->
      <div class="as-balance" :title="collapsed ? formatBalance(balance) : ''">
        <span class="as-balance-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
          </svg>
        </span>
        <div class="as-balance-body">
          <span class="as-balance-label">Wallet</span>
          <span class="as-balance-val">{{ balance !== null ? formatBalance(balance) : '—' }}</span>
        </div>
      </div>

      <!-- User row -->
      <div class="as-user" :title="collapsed ? displayName : ''">
        <div class="as-user-avatar" :style="avatarStyle">{{ initials }}</div>
        <div class="as-user-info">
          <span class="as-user-name">{{ displayName }}</span>
          <span class="as-user-email">{{ userEmail }}</span>
        </div>
        <span class="as-online-dot" />
      </div>

      <!-- Sign out -->
      <button class="as-signout" @click="showLogout = true" :title="collapsed ? 'Sign out' : ''">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span class="as-item-label">Sign out</span>
      </button>

    </div>

    <!-- Logout modal -->
    <Teleport to="body">
      <Transition name="as-modal-fade">
        <div v-if="showLogout" class="as-backdrop" @click.self="showLogout = false">
          <div class="as-modal">
            <p class="as-modal-title">Sign out?</p>
            <p class="as-modal-body">You'll need to sign back in to access your events.</p>
            <div class="as-modal-actions">
              <button class="as-modal-cancel" @click="showLogout = false">Cancel</button>
              <button class="as-modal-confirm" @click="doLogout">Sign out</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth, db } from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, collectionGroup, getDoc, getDocs, getCountFromServer, doc, query, orderBy, onSnapshot } from 'firebase/firestore'

const router = useRouter()
const route  = useRoute()

// ── Collapse state (persisted) ─────────────────────────────────────────────
const collapsed = ref(localStorage.getItem('sb-collapsed') === '1')
function toggle() {
  collapsed.value = !collapsed.value
  localStorage.setItem('sb-collapsed', collapsed.value ? '1' : '0')
}

// ── Auth + user info ───────────────────────────────────────────────────────
const balance  = ref(null)
const showLogout = ref(false)
const eventCount = ref(0)
const attendeeCount = ref(0)

const displayName = computed(() => {
  const u = auth.currentUser
  if (!u) return 'Admin'
  return u.displayName || u.email?.split('@')[0] || 'Admin'
})
const userEmail = computed(() => auth.currentUser?.email ?? '')
const initials  = computed(() => {
  return displayName.value.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
})

const PALETTE = ['#C9A84C', '#30D158', '#0A84FF', '#FF9F0A', '#BF5AF2']
const avatarStyle = computed(() => {
  const uid   = auth.currentUser?.uid ?? 'x'
  const color = PALETTE[uid.charCodeAt(0) % PALETTE.length]
  return { background: color + '22', borderColor: color + '66', color }
})

function formatBalance(n) {
  if (n == null) return '—'
  return 'TZS ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

async function loadUserData() {
  const uid = auth.currentUser?.uid
  if (!uid) return
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const b = snap.data().balance
      balance.value = b != null ? Number(b) : 0
    }
  } catch { /* silent */ }
}

async function loadEventCount() {
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('startDate', 'desc')))
    eventCount.value = snap.size
  } catch { /* silent */ }
}

async function loadAttendeeCount() {
  try {
    const snap = await getCountFromServer(collection(db, 'attendeeProfiles'))
    attendeeCount.value = snap.data().count
  } catch { /* silent */ }
}

// Orgs waiting on staff for branding approval. Firestore can't query "field is
// false OR absent" (and it's absent on every org created before the flag
// existed), so this counts client-side over the small organizations collection.
// Live rather than one-shot so the badge clears the moment you act on one
// instead of going stale until reload.
let unsubOrgs = null
let unsubSenderIds = null
const pendingBrandingOrgs = ref(0)
const pendingSenderIdOrgs = ref(0)

// Both queues feed one badge — it answers "is there anything for me on the
// Organizations screen", and splitting it would just make two small numbers.
const pendingBrandingCount = computed(() => pendingBrandingOrgs.value + pendingSenderIdOrgs.value)

function watchPendingBranding() {
  unsubOrgs = onSnapshot(
    collection(db, 'organizations'),
    snap => {
      pendingBrandingOrgs.value = snap.docs
        .filter(d => !d.data().archived && d.data().brandingApproved !== true).length
    },
    () => { /* silent — the badge is informational */ },
  )

  // Sender IDs live one subcollection per org, so a collection-group listener is
  // the only way to see every pending request without a read per org. Counted by
  // distinct org so an org with three requests doesn't inflate the badge to 3.
  unsubSenderIds = onSnapshot(
    collectionGroup(db, 'senderIds'),
    snap => {
      const orgIds = new Set(
        snap.docs
          .filter(d => d.data().status === 'pending')
          .map(d => d.ref.parent.parent?.id)
          .filter(Boolean)
      )
      pendingSenderIdOrgs.value = orgIds.size
    },
    () => { pendingSenderIdOrgs.value = 0 },
  )
}

async function doLogout() {
  showLogout.value = false
  await signOut(auth)
  router.push('/login')
}

let unsubAuth = null

onMounted(() => {
  unsubAuth = onAuthStateChanged(auth, (user) => {
    if (user) loadUserData()
  })
  loadEventCount()
  loadAttendeeCount()
  watchPendingBranding()
})

onUnmounted(() => {
  if (unsubAuth) unsubAuth()
  if (unsubOrgs) unsubOrgs()
  if (unsubSenderIds) unsubSenderIds()
})
</script>

<style scoped>
/* ── Tokens ── */
.as-root {
  --sb-w: 224px;
  --sb-icon-w: 60px;
  --ink: #f0f0ec;
  --ink-muted: #888;
  --ink-dim: #555;
  --line: #242424;
  --line-strong: #2a2a2a;
  --paper: #1a1a1a;
  --gold: #C9A84C;
  --emerald: #30D158;

  width: var(--sb-w);
  min-height: 100vh;
  background: #111111;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  padding: 0;
  transition: width 220ms cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  flex-shrink: 0;
  box-shadow: 2px 0 20px rgba(0,0,0,0.4);
}
.as-root--collapsed { width: var(--sb-icon-w); }

/* ── Brand row ── */
.as-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 14px 14px;
  min-height: 64px;
  gap: 8px;
}
.as-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}
.as-glyph {
  font-size: 16px;
  color: var(--gold);
  flex-shrink: 0;
  line-height: 1;
}
.as-brand-name {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 19px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: opacity 180ms, max-width 220ms;
  max-width: 120px;
}
.as-root--collapsed .as-brand-name {
  opacity: 0;
  max-width: 0;
  pointer-events: none;
}

.as-collapse-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--ink-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 130ms, color 130ms, border-color 130ms;
}
.as-collapse-btn:hover { background: var(--line); color: var(--ink); }

/* ── Nav ── */
.as-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px 0;
}

.as-nav-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--ink-dim);
  padding: 0 6px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: opacity 180ms;
}
.as-root--collapsed .as-nav-label { opacity: 0; }

.as-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink-muted);
  cursor: pointer;
  transition: background 130ms, color 130ms;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  min-height: 38px;
}
.as-item:hover { background: var(--paper); color: var(--ink); }
.as-item--active {
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.10);
  color: #e2e8f0;
}
.as-item--active:hover { background: rgba(255,255,255,0.13); }

.as-item-icon {
  flex-shrink: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.as-item--active .as-item-icon svg { stroke: #e2e8f0; }

.as-item-label {
  overflow: hidden;
  opacity: 1;
  max-width: 120px;
  transition: opacity 160ms, max-width 220ms;
  flex: 1;
}
.as-root--collapsed .as-item-label {
  opacity: 0;
  max-width: 0;
  pointer-events: none;
}

.as-item-badge {
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 7px;
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
  transition: opacity 160ms;
  color: rgba(226,232,240,0.8);
}
.as-item:not(.as-item--active) .as-item-badge {
  background: var(--paper);
  color: var(--ink-dim);
  border: 1px solid var(--line);
}
.as-root--collapsed .as-item-badge { opacity: 0; pointer-events: none; }

/* Pending-approval count — reads as a queue waiting on you, not a total */
.as-item:not(.as-item--active) .as-item-badge--alert,
.as-item-badge--alert {
  background: rgba(255,159,10,0.14);
  color: #FF9F0A;
  border: 1px solid rgba(255,159,10,0.28);
}

/* ── Spacer ── */
.as-spacer { flex: 1; }

/* ── Bottom ── */
.as-bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px 16px;
  border-top: 1px solid var(--line);
}

/* Balance */
.as-balance {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 10px;
  background: rgba(201,168,76,0.07);
  border: 1px solid rgba(201,168,76,0.18);
  margin-bottom: 2px;
  min-height: 38px;
  overflow: hidden;
}
.as-balance-icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: rgba(201,168,76,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  flex-shrink: 0;
}
.as-balance-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  overflow: hidden;
  opacity: 1;
  max-width: 120px;
  transition: opacity 160ms, max-width 220ms;
}
.as-root--collapsed .as-balance-body { opacity: 0; max-width: 0; }
.as-balance-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(201,168,76,0.65);
}
.as-balance-val {
  font-size: 13px;
  font-weight: 700;
  color: var(--gold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* User row */
.as-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 10px;
  transition: background 130ms;
  min-height: 40px;
  overflow: hidden;
  cursor: default;
}
.as-user:hover { background: var(--paper); }
.as-user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  border: 1.5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
}
.as-user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
  opacity: 1;
  max-width: 120px;
  transition: opacity 160ms, max-width 220ms;
}
.as-root--collapsed .as-user-info { opacity: 0; max-width: 0; }
.as-user-name  {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.as-user-email {
  font-size: 11px;
  color: var(--ink-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.as-online-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--emerald);
  flex-shrink: 0;
  transition: opacity 160ms;
}
.as-root--collapsed .as-online-dot { opacity: 0; }

/* Sign out */
.as-signout {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink-muted);
  cursor: pointer;
  font-family: inherit;
  width: 100%;
  text-align: left;
  transition: background 130ms, color 130ms;
  min-height: 38px;
  overflow: hidden;
  white-space: nowrap;
}
.as-signout:hover { background: rgba(255,69,58,0.12); color: #FF453A; }
.as-signout svg { flex-shrink: 0; width: 24px; display: flex; align-items: center; justify-content: center; }

/* ── Modal ── */
.as-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.as-modal {
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 28px 28px 24px;
  width: 340px;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4), 1px 2px 0 rgba(0,0,0,0.3);
  display: flex; flex-direction: column; gap: 8px;
}
.as-modal-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px; font-weight: 400; color: #e2e8f0; margin: 0; letter-spacing: -0.3px;
}
.as-modal-body { font-size: 13.5px; color: #888888; margin: 0 0 8px; line-height: 1.5; }
.as-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.as-modal-cancel {
  background: transparent; border: 1px solid #2a2a2a; color: #888888;
  padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: background 130ms;
}
.as-modal-cancel:hover { background: #1e1e1e; }
.as-modal-confirm {
  background: rgba(255,255,255,0.12); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.12);
  padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: opacity 130ms;
}
.as-modal-confirm:hover { opacity: 0.85; }

.as-modal-fade-enter-active, .as-modal-fade-leave-active { transition: opacity 180ms; }
.as-modal-fade-enter-from, .as-modal-fade-leave-to { opacity: 0; }
</style>
