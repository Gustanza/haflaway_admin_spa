<template>
  <div class="ue-root">

    <!-- ── Topbar ── -->
    <nav class="ue-topbar">
      <div class="ue-topbar-inner">
        <div class="ue-topbar-left">
          <span class="ue-bc-link" @click="$router.push('/users')">Users</span>
          <span class="ue-bc-sep">/</span>
          <span class="ue-bc-page">{{ userInfo ? fullName(userInfo) : '…' }}</span>
        </div>
        <button class="ue-back-btn" @click="$router.push('/users')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
      </div>
    </nav>

    <!-- ── Page ── -->
    <div class="ue-page">

      <!-- User identity card -->
      <div v-if="userInfo" class="ue-identity">
        <div class="ue-avatar" :style="avatarBg(userInfo)">
          <img v-if="userInfo.profileImage" :src="userInfo.profileImage" class="ue-avatar-img" @error="e => e.target.style.display='none'" />
          <span class="ue-avatar-letters">{{ initials(userInfo) }}</span>
        </div>
        <div class="ue-identity-body">
          <span class="ue-identity-name">{{ fullName(userInfo) }}</span>
          <span class="ue-identity-meta">
            <template v-if="userInfo.email">{{ userInfo.email }}</template>
            <template v-if="userInfo.email && userInfo.phoneNumber"> · </template>
            <template v-if="userInfo.phoneNumber">{{ userInfo.phoneNumber }}</template>
          </span>
        </div>
        <div class="ue-identity-stats">
          <div class="ue-istat">
            <span class="ue-istat-num">{{ allEvents.length }}</span>
            <span class="ue-istat-label">Total</span>
          </div>
          <div class="ue-istat-div" />
          <div class="ue-istat">
            <span class="ue-istat-num ue-istat-num--owner">{{ ownerCount }}</span>
            <span class="ue-istat-label">Owner</span>
          </div>
          <div class="ue-istat-div" />
          <div class="ue-istat">
            <span class="ue-istat-num ue-istat-num--admin">{{ adminCount }}</span>
            <span class="ue-istat-label">Admin</span>
          </div>
        </div>
      </div>

      <!-- Filter bar -->
      <div v-if="!loading && allEvents.length > 0" class="ue-filterbar">
        <div class="ue-search-wrap">
          <svg class="ue-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" class="ue-search-input" placeholder="Search events…" />
          <button v-if="searchQuery" class="ue-search-clear" @click="searchQuery = ''">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="ue-fb-div" />
        <div class="ue-role-chips">
          <button
            v-for="r in roleFilters"
            :key="r.value"
            class="ue-role-chip"
            :class="{ 'ue-role-chip--active': roleFilter === r.value }"
            @click="roleFilter = r.value"
          >
            {{ r.label }}
            <span class="ue-chip-count" :class="{ 'ue-chip-count--active': roleFilter === r.value }">{{ r.count }}</span>
          </button>
        </div>
        <div class="ue-fb-div" />
        <div class="ue-status-chips">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            class="ue-status-chip"
            :class="{ 'ue-status-chip--active': statusFilter === f.value }"
            @click="statusFilter = f.value"
          >{{ f.label }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="ue-skeleton-list">
        <div class="ue-skeleton" v-for="i in 4" :key="i" />
      </div>

      <!-- Empty -->
      <div v-else-if="displayed.length === 0 && !loading" class="ue-empty">
        <span class="ue-empty-glyph">✦</span>
        <p class="ue-empty-title">
          {{ allEvents.length === 0 ? `${userInfo ? fullName(userInfo) : 'This user'} has no associated events` : `No events match your filters` }}
        </p>
      </div>

      <!-- Event count line -->
      <div v-else class="ue-section-head">
        <span class="ue-section-line" />
        <span class="ue-section-meta">
          {{ filtered.length }} event{{ filtered.length !== 1 ? 's' : '' }}
          <template v-if="totalPages > 1"> · page {{ currentPage }} of {{ totalPages }}</template>
        </span>
      </div>

      <!-- Event rows -->
      <div v-if="displayed.length > 0" class="ue-list">
        <article
          v-for="(event, idx) in displayed"
          :key="event.id"
          class="ue-row"
          :style="{ '--rot': rotations[idx % rotations.length] + 'deg' }"
          @click="$router.push(`/event/${event.id}`)"
        >
          <div class="ue-pin" />
          <div class="ue-pin-shadow" />

          <!-- Thumbnail -->
          <div class="ue-thumb-col">
            <div class="ue-thumb" v-html="invitationSvg(event)" />
          </div>

          <!-- Content -->
          <div class="ue-row-content">
            <div class="ue-row-chips">
              <span class="ue-status-pill" :class="`ue-status-pill--${statusClass(event)}`">
                <span class="ue-status-dot" />{{ statusLabel(event) }}
              </span>
              <span class="ue-role-badge" :class="roleClass(event)">
                {{ roleLabel(event) }}
              </span>
              <span class="ue-code-chip">{{ event.code || event.id?.slice(0,8) }}</span>
            </div>
            <h3 class="ue-row-title">{{ event.title }}</h3>
            <div class="ue-row-meta">
              <div class="ue-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{{ formatFullDate(event.startDate) }}</span>
              </div>
              <div v-if="event.location" class="ue-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ event.location }}</span>
              </div>
              <div class="ue-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>{{ event.adminsIds?.length ?? 1 }} member{{ (event.adminsIds?.length ?? 1) !== 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>

          <!-- Right: date + manage -->
          <div class="ue-row-right">
            <div class="ue-row-date">
              <span class="ue-date-month">{{ formatMonth(event.startDate) }}</span>
              <span class="ue-date-day">{{ formatDay(event.startDate) }}</span>
              <span class="ue-date-year">{{ event.startDate ? new Date(event.startDate).getFullYear() : '' }}</span>
            </div>
            <div class="ue-days-pill" :class="daysAwayClass(event)">
              <template v-if="statusClass(event) === 'ongoing'">
                <span class="ue-live-dot" />LIVE NOW
              </template>
              <template v-else-if="(daysAway(event.startDate) ?? 0) > 0">
                {{ daysAway(event.startDate) }}d away
              </template>
              <template v-else>
                {{ Math.round(Math.abs(daysAway(event.startDate) ?? 0) / 30) }}mo ago
              </template>
            </div>
            <button class="ue-manage-btn" @click.stop="$router.push(`/event/${event.id}`)">Manage →</button>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && totalPages > 1" class="ue-pagination">
        <span class="ue-pagination-info">
          Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filtered.length) }} of {{ filtered.length }}
        </span>
        <div class="ue-pagination-controls">
          <button class="ue-page-btn ue-page-btn--nav" :disabled="currentPage === 1" @click="currentPage--">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <template v-for="p in pageRange" :key="p">
            <span v-if="p === '…'" class="ue-page-ellipsis">…</span>
            <button v-else class="ue-page-btn" :class="{ 'ue-page-btn--active': p === currentPage }" @click="currentPage = p">{{ p }}</button>
          </template>
          <button class="ue-page-btn ue-page-btn--nav" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase'
import {
  collection, query, where, getDocs, getDoc, doc,
} from 'firebase/firestore'

const route  = useRoute()
const router = useRouter()
const userId = route.params.userId

const PAGE_SIZE  = 10
const rotations  = [-0.35, 0.45, -0.25, 0.5, -0.4, 0.3]

// ── State ──────────────────────────────────────────────────────────────────
const loading     = ref(true)
const userInfo    = ref(null)
const allEvents   = ref([])
const eventRoles  = ref({})   // { eventId: 'owner' | 'admin' | 'attendee' }

const searchQuery  = ref('')
const roleFilter   = ref('all')
const statusFilter = ref('all')
const currentPage  = ref(1)

// ── Load user + events ─────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    const [userSnap, eventsSnap] = await Promise.all([
      getDoc(doc(db, 'users', userId)),
      getDocs(query(collection(db, 'events'), where('adminsIds', 'array-contains', userId))),
    ])

    if (userSnap.exists()) userInfo.value = { id: userId, ...userSnap.data() }

    const roles = {}
    allEvents.value = eventsSnap.docs.map(d => {
      const data = { id: d.id, ...d.data() }
      roles[d.id] = data.authorId === userId ? 'owner' : 'admin'
      return data
    })
    eventRoles.value = roles
  } catch (e) {
    console.error('loadData:', e)
  } finally {
    loading.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fullName(u) {
  return [(u?.firstName || ''), (u?.lastName || '')].filter(Boolean).join(' ') || 'Unknown User'
}
function initials(u) {
  return [u?.firstName, u?.lastName].filter(Boolean).map(s => s.charAt(0).toUpperCase()).join('') || '?'
}
const PALETTE = ['#C9A84C', '#30D158', '#0A84FF', '#FF9F0A', '#BF5AF2', '#FF6961', '#64D2FF']
function avatarBg(u) {
  const color = PALETTE[(u.id || '0').charCodeAt(0) % PALETTE.length]
  return { background: color + '1A', borderColor: color + '55', color }
}

function statusClass(event) {
  const now   = new Date()
  const start = event.startDate ? new Date(event.startDate) : null
  const end   = event.endDate ? new Date(event.endDate) : start ? new Date(start.getTime() + 86400000) : null
  if (!start) return 'upcoming'
  if (now < start) return 'upcoming'
  if (end && now <= end) return 'ongoing'
  return 'completed'
}
function statusLabel(e) {
  return { upcoming: 'Upcoming', ongoing: 'Live', completed: 'Completed' }[statusClass(e)]
}

function roleClass(event) {
  return eventRoles.value[event.id] === 'owner' ? 'ue-role-badge--owner' : 'ue-role-badge--admin'
}
function roleLabel(event) {
  return eventRoles.value[event.id] === 'owner' ? 'OWNER' : 'ADMIN'
}

function daysAway(iso) {
  if (!iso) return null
  return Math.ceil((new Date(iso) - new Date()) / 86400000)
}
function daysAwayClass(event) {
  const sc = statusClass(event)
  if (sc === 'ongoing') return 'ue-days-pill--live'
  const d = daysAway(event.startDate)
  if (d !== null && d > 0 && d < 30) return 'ue-days-pill--soon'
  if (d !== null && d <= 0) return 'ue-days-pill--past'
  return ''
}
function formatMonth(iso) { return iso ? new Date(iso).toLocaleDateString('en', { month: 'short' }).toUpperCase() : '' }
function formatDay(iso)   { return iso ? new Date(iso).getDate() : '—' }
function formatFullDate(iso) {
  if (!iso) return 'Date TBD'
  return new Date(iso).toLocaleDateString('en', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

// ── Counts ─────────────────────────────────────────────────────────────────
const ownerCount = computed(() => allEvents.value.filter(e => eventRoles.value[e.id] === 'owner').length)
const adminCount = computed(() => allEvents.value.filter(e => eventRoles.value[e.id] === 'admin').length)

// ── Filters ────────────────────────────────────────────────────────────────
const roleFilters = computed(() => [
  { label: 'All',   value: 'all',   count: allEvents.value.length },
  { label: 'Owner', value: 'owner', count: ownerCount.value },
  { label: 'Admin', value: 'admin', count: adminCount.value },
])

const statusFilters = [
  { label: 'All',       value: 'all'       },
  { label: 'Upcoming',  value: 'upcoming'  },
  { label: 'Ongoing',   value: 'ongoing'   },
  { label: 'Completed', value: 'completed' },
]

const filtered = computed(() => {
  let list = allEvents.value
  if (roleFilter.value !== 'all')   list = list.filter(e => eventRoles.value[e.id] === roleFilter.value)
  if (statusFilter.value !== 'all') list = list.filter(e => statusClass(e) === statusFilter.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(e => (e.title || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q))
  }
  return [...list].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

const displayed = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

const pageRange = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set    = new Set([1, total, cur, cur - 1, cur + 1].filter(p => p >= 1 && p <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…')
    result.push(sorted[i])
  }
  return result
})

watch([roleFilter, statusFilter, searchQuery], () => { currentPage.value = 1 })

// ── Invitation SVG (same logic as MyEvents) ────────────────────────────────
function coverType(event) {
  const styles = ['goldfloral', 'bridal', 'minimal', 'pearl', 'rose', 'navy']
  if (event.cover && styles.includes(event.cover)) return event.cover
  const hash = event.id ? [...event.id].reduce((a, c) => a + c.charCodeAt(0), 0) % styles.length : 0
  return styles[hash]
}

function invitationSvg(event) {
  const cover = coverType(event)
  const P = {
    goldfloral: { bg: '#FDFAF4', frame: '#C9A84C', text: '#2A1F0A', accent: '#C9A84C', flora: true  },
    bridal:     { bg: '#FDF8FB', frame: '#C8A0B4', text: '#2A0F1E', accent: '#C8A0B4', flora: true  },
    minimal:    { bg: '#FAFAFA', frame: '#AAAAAA', text: '#111111', accent: '#777777', flora: false },
    pearl:      { bg: '#F9F7F2', frame: '#B0A898', text: '#2A2520', accent: '#B0A898', flora: false },
    rose:       { bg: '#FDF5F5', frame: '#C87878', text: '#2A0A0A', accent: '#C87878', flora: true  },
    navy:       { bg: '#F3F5FA', frame: '#2A3A6A', text: '#0A1530', accent: '#2A3A6A', flora: false },
  }
  const p = P[cover] || P.minimal
  const uid_frag = (event.id || 'x').slice(0, 6)
  const title = event.title || 'Untitled'
  const words = title.split(' ')
  const mid = Math.ceil(words.length / 2)
  const line1 = words.slice(0, mid).join(' ')
  const line2 = words.slice(mid).join(' ')
  const shortLine1 = line1.length > 20 ? line1.slice(0, 18) + '…' : line1
  const shortLine2 = line2.length > 20 ? line2.slice(0, 18) + '…' : line2
  const dateNum = event.startDate ? new Date(event.startDate).getDate() : '—'
  const dateMon = event.startDate ? new Date(event.startDate).toLocaleDateString('en', { month: 'short' }).toUpperCase() : ''
  const year    = event.startDate ? new Date(event.startDate).getFullYear() : ''
  const venue   = (event.location || '').slice(0, 22)
  const cat     = (event.categoryId || 'EVENT').toUpperCase().slice(0, 14)
  const flora   = p.flora
    ? `<circle cx="150" cy="26" r="5" fill="${p.accent}" opacity="0.45"/>
       <circle cx="133" cy="33" r="3.5" fill="${p.accent}" opacity="0.32"/>
       <circle cx="167" cy="33" r="3.5" fill="${p.accent}" opacity="0.32"/>
       <path d="M143,28 Q137,20 132,24 Q138,29 143,28Z" fill="${p.accent}" opacity="0.38"/>
       <path d="M157,28 Q163,20 168,24 Q162,29 157,28Z" fill="${p.accent}" opacity="0.38"/>
       <line x1="110" y1="44" x2="190" y2="44" stroke="${p.frame}" stroke-width="0.7" opacity="0.28"/>
       <g transform="translate(0,400) scale(1,-1)">
         <circle cx="150" cy="26" r="4" fill="${p.accent}" opacity="0.28"/>
         <circle cx="135" cy="32" r="2.5" fill="${p.accent}" opacity="0.2"/>
         <circle cx="165" cy="32" r="2.5" fill="${p.accent}" opacity="0.2"/>
         <line x1="110" y1="44" x2="190" y2="44" stroke="${p.frame}" stroke-width="0.7" opacity="0.2"/>
       </g>`
    : `<line x1="88" y1="38" x2="212" y2="38" stroke="${p.frame}" stroke-width="0.8" opacity="0.3"/>
       <line x1="88" y1="362" x2="212" y2="362" stroke="${p.frame}" stroke-width="0.8" opacity="0.22"/>`
  const y2   = line2 ? 136 : 120
  const divY = line2 ? 153 : 133
  const numY = line2 ? 193 : 173
  const monY = line2 ? 213 : 193
  const sepY = line2 ? 228 : 208
  const venY = line2 ? 250 : 230
  const ornY = line2 ? 295 : 272
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
  <defs>
    <pattern id="gr-${uid_frag}" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="3" fill="${p.bg}"/>
      <circle cx="1" cy="1" r="0.45" fill="${p.frame}" opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="300" height="400" fill="${p.bg}"/>
  <rect width="300" height="400" fill="url(#gr-${uid_frag})"/>
  <rect x="11" y="11" width="278" height="378" rx="3" fill="none" stroke="${p.frame}" stroke-width="0.9" opacity="0.42"/>
  <rect x="17" y="17" width="266" height="366" rx="2" fill="none" stroke="${p.frame}" stroke-width="0.4" opacity="0.26"/>
  ${flora}
  <text x="150" y="76" text-anchor="middle" font-family="Inter,sans-serif" font-size="7.5" font-weight="600" letter-spacing="2.5" fill="${p.text}" opacity="0.38">${cat}</text>
  <text x="150" y="112" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-style="italic" fill="${p.text}">${shortLine1}</text>
  ${line2 ? `<text x="150" y="${y2}" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-style="italic" fill="${p.text}">${shortLine2}</text>` : ''}
  <line x1="112" y1="${divY}" x2="138" y2="${divY}" stroke="${p.accent}" stroke-width="0.8" opacity="0.52"/>
  <circle cx="150" cy="${divY}" r="2.5" fill="none" stroke="${p.accent}" stroke-width="0.8" opacity="0.52"/>
  <line x1="162" y1="${divY}" x2="188" y2="${divY}" stroke="${p.accent}" stroke-width="0.8" opacity="0.52"/>
  <text x="150" y="${numY}" text-anchor="middle" font-family="Georgia,serif" font-size="32" fill="${p.text}" letter-spacing="-1">${dateNum}</text>
  <text x="150" y="${monY}" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="600" letter-spacing="2" fill="${p.text}" opacity="0.48">${dateMon} · ${year}</text>
  <line x1="100" y1="${sepY}" x2="200" y2="${sepY}" stroke="${p.frame}" stroke-width="0.5" opacity="0.22"/>
  ${venue ? `<text x="150" y="${venY}" text-anchor="middle" font-family="Inter,sans-serif" font-size="8.5" fill="${p.text}" opacity="0.42" letter-spacing="0.4">${venue}</text>` : ''}
  <text x="150" y="${ornY}" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${p.accent}" opacity="0.42">✦</text>
</svg>`
}

onMounted(loadData)
</script>

<style scoped>
.ue-root {
  --ink: #f0f0ec;
  --ink-soft: #d8d4cd;
  --ink-muted: #888;
  --ink-dim: #555;
  --line: #242424;
  --line-soft: #1e1e1e;
  --line-strong: #2a2a2a;
  --paper-soft: #141414;
  --gold: #C9A84C;
  --emerald: #30D158;
  --emerald-soft: rgba(48,209,88,0.12);
  min-height: 100vh;
  background: #0a0a0b;
  color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Topbar ── */
.ue-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.ue-topbar-inner {
  max-width: 1200px; margin: 0 auto; padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.ue-topbar-left { display: flex; align-items: center; gap: 8px; }
.ue-bc-sep  { font-size: 14px; color: var(--ink-dim); font-weight: 300; }
.ue-bc-link { font-size: 14px; color: var(--ink-muted); cursor: pointer; transition: color 120ms; }
.ue-bc-link:hover { color: var(--ink); }
.ue-bc-page { font-size: 14px; color: var(--ink-muted); }
.ue-back-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 8px; border: none;
  background: transparent; font-size: 12.5px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: background 120ms, color 120ms;
}
.ue-back-btn:hover { background: rgba(255,255,255,0.06); color: var(--ink); }

/* ── Page ── */
.ue-page {
  max-width: 1200px; margin: 0 auto; padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── User identity card ── */
.ue-identity {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 20px 24px; display: flex; align-items: center; gap: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ue-avatar {
  width: 52px; height: 52px; border-radius: 14px; border: 1.5px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden; position: relative;
}
.ue-avatar-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.ue-avatar-letters { font-size: 18px; font-weight: 700; line-height: 1; }
.ue-identity-body { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.ue-identity-name {
  font-family: 'Instrument Serif', Georgia, serif; font-size: 24px; font-weight: 400;
  color: var(--ink); letter-spacing: -0.3px;
}
.ue-identity-meta { font-size: 13px; color: var(--ink-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ue-identity-stats { display: flex; align-items: center; flex-shrink: 0; margin-left: auto; }
.ue-istat { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 0 20px; }
.ue-istat-div { width: 1px; height: 36px; background: var(--line-strong); flex-shrink: 0; }
.ue-istat-num {
  font-family: 'Instrument Serif', Georgia, serif; font-size: 30px;
  font-weight: 400; color: var(--ink); line-height: 1; letter-spacing: -0.5px;
}
.ue-istat-num--owner    { color: var(--gold); }
.ue-istat-num--admin    { color: var(--ink-muted); }
.ue-istat-num--attendee { color: var(--emerald); }
.ue-istat-label {
  font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
  text-transform: uppercase; color: var(--ink-dim);
}

/* ── Filter bar ── */
.ue-filterbar {
  background: #111; border: 1px solid var(--line-strong); border-radius: 14px;
  padding: 8px 8px 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.ue-search-wrap {
  position: relative; display: flex; align-items: center; flex: 1; min-width: 140px;
}
.ue-search-icon { position: absolute; left: 11px; color: var(--ink-dim); pointer-events: none; }
.ue-search-input {
  width: 100%; padding: 7px 28px 7px 32px; border: none; background: transparent;
  font-size: 13.5px; color: var(--ink); outline: none; font-family: inherit;
}
.ue-search-input::placeholder { color: var(--ink-dim); }
.ue-search-clear {
  position: absolute; right: 6px; background: none; border: none; cursor: pointer;
  color: var(--ink-dim); display: flex; align-items: center; padding: 2px;
}
.ue-search-clear:hover { color: var(--ink-muted); }
.ue-fb-div { width: 1px; height: 26px; background: var(--line-strong); flex-shrink: 0; margin: 0 4px; }

.ue-role-chips, .ue-status-chips { display: flex; align-items: center; gap: 4px; }
.ue-role-chip, .ue-status-chip {
  display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 8px; border: none; background: transparent;
  font-size: 12.5px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: background 120ms, color 120ms;
  white-space: nowrap;
}
.ue-role-chip:hover, .ue-status-chip:hover { background: rgba(255,255,255,0.06); color: var(--ink); }
.ue-role-chip--active, .ue-status-chip--active { background: rgba(240,240,236,0.09); color: var(--ink); font-weight: 600; }
.ue-chip-count {
  font-size: 10.5px; font-weight: 600; background: rgba(255,255,255,0.06);
  color: var(--ink-dim); padding: 1px 6px; border-radius: 8px;
}
.ue-chip-count--active { background: rgba(240,240,236,0.12); color: var(--ink-muted); }

/* ── Skeletons ── */
.ue-skeleton-list { display: flex; flex-direction: column; gap: 16px; }
.ue-skeleton {
  height: 160px; border-radius: 14px;
  background: linear-gradient(90deg, #141414 25%, #1e1e1e 50%, #141414 75%);
  background-size: 200% 100%; animation: ue-shimmer 1.4s infinite;
}
@keyframes ue-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty ── */
.ue-empty {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 60px 20px; border: 1px dashed var(--line-strong); border-radius: 20px;
  text-align: center;
}
.ue-empty-glyph { font-size: 28px; color: var(--gold); opacity: 0.6; }
.ue-empty-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: var(--ink); margin: 0; text-align: center; }

/* ── Section head ── */
.ue-section-head { display: flex; align-items: center; gap: 14px; }
.ue-section-line { flex: 1; height: 1px; background: linear-gradient(90deg, var(--line-strong), transparent); }
.ue-section-meta { font-size: 12px; color: var(--ink-dim); font-weight: 500; white-space: nowrap; }

/* ── Event list ── */
.ue-list { display: flex; flex-direction: column; gap: 16px; padding-top: 4px; }

.ue-row {
  position: relative;
  background: linear-gradient(160deg, #181818 0%, #141414 100%);
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 4px solid rgba(255,255,255,0.10);
  border-radius: 14px; cursor: pointer;
  padding: 16px 20px; display: flex; align-items: center; gap: 16px;
  transition: border-color 200ms, box-shadow 200ms, transform 200ms;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ue-row:hover {
  border-color: rgba(255,255,255,0.14);
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  transform: translateY(-2px);
}

.ue-pin {
  position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
  width: 11px; height: 11px; border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #3a3a3e, #111 60%, #000);
  box-shadow: 0 2px 4px rgba(0,0,0,0.6); z-index: 2;
}
.ue-pin-shadow {
  position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
  width: 14px; height: 3.5px; border-radius: 50%;
  background: rgba(0,0,0,0.35); filter: blur(3px); z-index: 1;
}

.ue-thumb-col { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ue-thumb {
  width: 80px; border-radius: 8px; overflow: hidden;
  transform: rotate(-2deg); box-shadow: 0 3px 10px rgba(0,0,0,0.4);
  line-height: 0; transition: transform 200ms;
}
.ue-row:hover .ue-thumb { transform: rotate(-1deg); }
.ue-thumb :deep(svg) { display: block; width: 100%; height: auto; }

.ue-row-content {
  display: flex; flex-direction: column; gap: 8px; justify-content: center; min-width: 0; flex: 1;
}
.ue-row-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

/* Status pills */
.ue-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap;
}
.ue-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.ue-status-pill--upcoming  { background: rgba(255,255,255,0.06); color: var(--ink-muted); }
.ue-status-pill--upcoming .ue-status-dot { background: var(--ink-dim); }
.ue-status-pill--ongoing   { background: rgba(201,168,76,0.10); color: var(--gold); }
.ue-status-pill--ongoing .ue-status-dot { background: var(--gold); animation: ue-pulse 1.6s ease-in-out infinite; }
.ue-status-pill--completed { background: rgba(255,255,255,0.04); color: var(--ink-dim); }
.ue-status-pill--completed .ue-status-dot { background: var(--ink-dim); }
@keyframes ue-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }

/* Role badges */
.ue-role-badge {
  display: inline-flex; align-items: center;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; padding: 2px 8px; border-radius: 6px;
}
.ue-role-badge--owner    { background: rgba(240,240,236,0.12); border: 1px solid rgba(240,240,236,0.16); color: var(--ink); }
.ue-role-badge--admin    { background: transparent; border: 1px solid var(--line-strong); color: var(--ink-muted); }
.ue-role-badge--attendee { background: var(--emerald-soft); color: var(--emerald); border: 1px solid rgba(48,209,88,0.25); }

.ue-code-chip {
  font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--ink-dim);
  padding: 2px 7px; border: 1px solid var(--line-strong); border-radius: 5px; letter-spacing: 0.3px;
}

.ue-row-title {
  font-family: 'Instrument Serif', Georgia, serif; font-size: 18px; font-weight: 400;
  color: var(--ink); margin: 0; letter-spacing: -0.3px; line-height: 1.2;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.ue-row-meta { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.ue-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--ink-muted); }
.ue-meta-item svg { color: var(--ink-dim); flex-shrink: 0; }

/* Row right */
.ue-row-right {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 10px; flex-shrink: 0;
}
.ue-row-date { display: flex; flex-direction: column; align-items: flex-end; gap: 0; }
.ue-date-month { font-size: 9.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-dim); line-height: 1; }
.ue-date-day   { font-family: 'Instrument Serif', Georgia, serif; font-size: 48px; font-weight: 400; color: var(--ink); letter-spacing: -2px; line-height: 0.9; }
.ue-date-year  { font-size: 9.5px; font-weight: 600; letter-spacing: 1.5px; color: var(--ink-dim); margin-top: 3px; }

.ue-days-pill {
  font-size: 11.5px; font-weight: 600; padding: 5px 12px; border-radius: 20px;
  display: flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.05); border: 1px solid var(--line-strong); color: var(--ink-muted);
}
.ue-days-pill--soon { background: rgba(201,168,76,0.10); border-color: rgba(201,168,76,0.3); color: var(--gold); }
.ue-days-pill--live { background: var(--emerald-soft); border-color: rgba(48,209,88,0.3); color: var(--emerald); }
.ue-days-pill--past { color: var(--ink-dim); }
.ue-live-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--emerald);
  animation: ue-pulse 1.6s ease-in-out infinite; flex-shrink: 0;
}

.ue-manage-btn {
  background: transparent; border: 1px solid var(--line-strong); color: var(--ink-muted);
  padding: 7px 14px; border-radius: 9px; font-size: 12.5px; font-weight: 600;
  cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: background 200ms, color 200ms, border-color 200ms;
}
.ue-row:hover .ue-manage-btn { background: rgba(240,240,236,0.09); border-color: rgba(240,240,236,0.14); color: var(--ink); }

/* ── Pagination ── */
.ue-pagination { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; }
.ue-pagination-info { font-size: 13px; color: var(--ink-muted); }
.ue-pagination-controls { display: flex; align-items: center; gap: 4px; }
.ue-page-btn {
  min-width: 34px; height: 34px; padding: 0 6px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); border-radius: 8px; background: #141414; font-size: 13px;
  font-weight: 500; color: var(--ink-muted); cursor: pointer; font-family: inherit;
  transition: border-color 130ms, color 130ms, background 130ms;
}
.ue-page-btn:hover:not(:disabled):not(.ue-page-btn--active) { border-color: var(--line-strong); color: var(--ink); }
.ue-page-btn--active { background: rgba(240,240,236,0.09); border-color: rgba(240,240,236,0.14); color: var(--ink); font-weight: 700; }
.ue-page-btn--nav { color: var(--ink-dim); }
.ue-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.ue-page-ellipsis { width: 28px; text-align: center; font-size: 13px; color: var(--ink-dim); user-select: none; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .ue-page { padding: 20px 20px 60px; }
  .ue-row  { flex-wrap: wrap; }
  .ue-row-right { display: none; }
  .ue-identity  { flex-wrap: wrap; }
  .ue-identity-stats { border-top: 1px solid var(--line-strong); padding-top: 14px; width: 100%; justify-content: space-around; margin-left: 0; }
  .ue-istat { padding: 0 12px; }
}
@media (max-width: 600px) {
  .ue-topbar-inner { padding: 12px 16px; }
  .ue-page { padding: 16px 16px 48px; }
  .ue-row-title { font-size: 16px; }
}
</style>
