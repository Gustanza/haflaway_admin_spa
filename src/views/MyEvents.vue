<template>
  <div class="me-root">

    <!-- ── Topbar ── -->
    <nav class="me-topbar">
      <div class="me-topbar-inner">
        <span class="me-page-title">My Events</span>
        <button class="me-create-btn" @click="$router.push('/create-event')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create event
        </button>
      </div>
    </nav>

    <!-- ── Page shell ── -->
    <div class="me-page">

      <!-- Filter bar -->
      <div class="me-filterbar">
        <div class="me-search-wrap">
          <svg class="me-search-icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="me-search-input"
            placeholder="Search events…"
            @input="onSearch"
          />
          <button v-if="searchQuery" class="me-search-clear" @click="clearSearch">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="me-fb-divider" />
        <div class="me-status-chips">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            class="me-status-chip"
            :class="{ 'me-status-chip--active': activeFilter === f.value }"
            @click="activeFilter = f.value; clearSearch()"
          >
            {{ f.label }}
            <span class="me-chip-count" :class="{ 'me-chip-count--active': activeFilter === f.value }">{{ f.count }}</span>
          </button>
        </div>
        <div class="me-fb-divider" />
        <select v-model="activeSort" class="me-fb-select">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">A → Z</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="me-skeleton-list">
        <div class="me-skeleton" v-for="i in 3" :key="i" />
      </div>

      <!-- Empty -->
      <div v-else-if="sourceEvents.length === 0" class="me-empty">
        <span class="me-empty-glyph">✦</span>
        <p class="me-empty-title">{{ searchQuery ? `No results for "${searchQuery}"` : 'No events yet. Create your first.' }}</p>
        <button v-if="!searchQuery" class="me-create-btn me-create-btn--lg" @click="$router.push('/create-event')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create event
        </button>
      </div>

      <template v-else>

        <!-- Events count heading -->
        <div class="me-section-head">
          <span class="me-section-line" />
          <span class="me-section-meta">
            {{ sourceEvents.length }} event{{ sourceEvents.length !== 1 ? 's' : '' }}
            <template v-if="totalPages > 1"> · page {{ currentPage }} of {{ totalPages }}</template>
          </span>
        </div>

        <!-- Hanging event rows -->
        <div class="me-hanging-list">
          <article
            v-for="(event, idx) in displayedEvents"
            :key="event.id"
            class="me-row"
            :style="{ '--rot': rotations[idx % rotations.length] + 'deg' }"
            @click="goToEvent(event.id)"
          >
            <!-- Pin tack -->
            <div class="me-pin" />
            <div class="me-pin-shadow" />

            <!-- Left: invitation thumbnail -->
            <div class="me-row-thumb-col">
              <div class="me-row-thumb" v-html="invitationSvg(event)" />
            </div>

            <!-- Middle: content -->
            <div class="me-row-content">
              <div class="me-row-chips">
                <span class="me-status-pill" :class="`me-status-pill--${statusClass(event)}`">
                  <span class="me-status-dot" />{{ statusLabel(event) }}
                </span>
                <span class="me-role-badge" :class="event.authorId === uid ? 'me-role-badge--owner' : 'me-role-badge--admin'">
                  {{ event.authorId === uid ? 'OWNER' : 'ADMIN' }}
                </span>
                <span class="me-code-chip">{{ event.code || event.id?.slice(0,8) }}</span>
              </div>
              <h3 class="me-row-title">{{ event.title }}</h3>
              <div class="me-row-meta">
                <div class="me-row-meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{{ formatFullDate(event.startDate) }}<template v-if="event.endDate"> – {{ formatFullDate(event.endDate) }}</template></span>
                </div>
                <div v-if="event.location" class="me-row-meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{{ event.location }}</span>
                </div>
                <div class="me-row-meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>{{ event.adminsIds?.length ?? 1 }} member{{ (event.adminsIds?.length ?? 1) !== 1 ? 's' : '' }}</span>
                </div>
              </div>
              <div v-if="event.contributionGoal" class="me-row-progress">
                <div class="me-row-progress-track">
                  <div class="me-row-progress-fill" :style="{ width: Math.min(100, ((event.collected || 0) / event.contributionGoal) * 100) + '%' }" />
                </div>
              </div>
            </div>

            <!-- Right: date + days pill + manage -->
            <div class="me-row-right">
              <div class="me-row-date">
                <span class="me-row-date-eyebrow">{{ formatMonth(event.startDate) }}</span>
                <span class="me-row-date-day">{{ formatDay(event.startDate) }}</span>
                <span class="me-row-date-year">{{ event.startDate ? new Date(event.startDate).getFullYear() : '' }}</span>
              </div>
              <div class="me-row-days-pill" :class="daysAwayClass(event)">
                <template v-if="statusClass(event) === 'ongoing'">
                  <span class="me-live-dot" />LIVE NOW
                </template>
                <template v-else-if="(daysAway(event.startDate) ?? 0) > 0">
                  {{ daysAway(event.startDate) }}d away
                </template>
                <template v-else>
                  {{ Math.round(Math.abs(daysAway(event.startDate) ?? 0) / 30) }}mo ago
                </template>
              </div>
              <button class="me-row-manage-btn" @click.stop="goToEvent(event.id)">
                Manage →
              </button>
            </div>
          </article>
        </div>

        <!-- Pagination (hidden if < 10 total) -->
        <div v-if="!loading && totalPages > 1 && sourceEvents.length >= PAGE_SIZE" class="me-pagination">
          <span class="me-pagination-info">
            Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, sourceEvents.length) }} of {{ sourceEvents.length }}
          </span>
          <div class="me-pagination-controls">
            <button class="me-page-btn me-page-btn--nav" :disabled="currentPage === 1" @click="currentPage--">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <template v-for="p in pageRange" :key="p">
              <span v-if="p === '…'" class="me-page-ellipsis">…</span>
              <button v-else class="me-page-btn" :class="{ 'me-page-btn--active': p === currentPage }" @click="currentPage = p">{{ p }}</button>
            </template>
            <button class="me-page-btn me-page-btn--nav" :disabled="currentPage === totalPages" @click="currentPage++">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db, auth } from '../firebase'
import {
  collection, collectionGroup, query, where, orderBy, getDocs, limit,
} from 'firebase/firestore'

const PAGE_SIZE = 10
const router = useRouter()
const route = useRoute()
const uid = auth.currentUser?.uid ?? null

// ── State (unchanged) ──────────────────────────────────────────────────────
const events = ref([])
const searchResults = ref([])
const loading = ref(true)
const currentPage = ref(1)
const activeFilter = ref('all')
const activeSort = ref('newest')
const searchQuery = ref('')
let searchTimer = null

const rotations = [-0.35, 0.45, -0.25, 0.5, -0.4, 0.3]

// ── Firestore (unchanged) ──────────────────────────────────────────────────
async function loadEvents() {
  loading.value = true
  try {
    const snap = await getDocs(query(
      collection(db, 'events'),
      orderBy('startDate', 'desc'),
    ))
    events.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('loadEvents:', e)
  } finally {
    loading.value = false
  }
}

async function performSearch(key) {
  if (!key) { searchResults.value = []; return }
  const k = key.toLowerCase()
  try {
    const snap = await getDocs(query(
      collection(db, 'events'),
      where('titleLower', '>=', k),
      where('titleLower', '<=', k + ''),
      limit(20),
    ))
    searchResults.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('performSearch:', e)
  }
}

// ── Status (unchanged) ─────────────────────────────────────────────────────
function statusClass(event) {
  const now = new Date()
  const start = event.startDate ? new Date(event.startDate) : null
  const end = event.endDate
    ? new Date(event.endDate)
    : start ? new Date(start.getTime() + 86400000) : null
  if (!start) return 'upcoming'
  if (now < start) return 'upcoming'
  if (end && now <= end) return 'ongoing'
  return 'completed'
}

function statusLabel(event) {
  return { upcoming: 'Upcoming', ongoing: 'Live', completed: 'Completed' }[statusClass(event)]
}

// ── Filters (unchanged + activeSort) ──────────────────────────────────────
const statusFilters = computed(() => [
  { label: 'All',       value: 'all',       count: events.value.length },
  { label: 'Upcoming',  value: 'upcoming',  count: events.value.filter(e => statusClass(e) === 'upcoming').length },
  { label: 'Ongoing',   value: 'ongoing',   count: events.value.filter(e => statusClass(e) === 'ongoing').length },
  { label: 'Completed', value: 'completed', count: events.value.filter(e => statusClass(e) === 'completed').length },
])

const filteredEvents = computed(() => {
  let list = events.value
  if (activeFilter.value !== 'all') list = list.filter(e => statusClass(e) === activeFilter.value)
  if (activeSort.value === 'oldest') list = [...list].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  else if (activeSort.value === 'az') list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  return list
})

const sourceEvents = computed(() =>
  searchQuery.value ? searchResults.value : filteredEvents.value
)

const totalPages = computed(() => Math.ceil(sourceEvents.value.length / PAGE_SIZE))

const displayedEvents = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return sourceEvents.value.slice(start, start + PAGE_SIZE)
})

const pageRange = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (cur > 3) pages.push('…')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p)
  if (cur < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

// ── Helpers ────────────────────────────────────────────────────────────────
function daysAway(iso) {
  if (!iso) return null
  return Math.ceil((new Date(iso) - new Date()) / 86400000)
}

function daysAwayClass(event) {
  const sc = statusClass(event)
  if (sc === 'ongoing') return 'me-row-days-pill--live'
  const d = daysAway(event.startDate)
  if (d !== null && d > 0 && d < 30) return 'me-row-days-pill--soon'
  if (d !== null && d <= 0) return 'me-row-days-pill--past'
  return ''
}

function coverType(event) {
  const styles = ['goldfloral', 'bridal', 'minimal', 'pearl', 'rose', 'navy']
  if (event.cover && styles.includes(event.cover)) return event.cover
  const hash = event.id
    ? [...event.id].reduce((a, c) => a + c.charCodeAt(0), 0) % styles.length
    : 0
  return styles[hash]
}

function invitationSvg(event) {
  const cover = coverType(event)
  const P = {
    goldfloral: { bg: '#FDFAF4', frame: '#C9A84C', text: '#2A1F0A', accent: '#C9A84C', flora: true },
    bridal:     { bg: '#FDF8FB', frame: '#C8A0B4', text: '#2A0F1E', accent: '#C8A0B4', flora: true },
    minimal:    { bg: '#FAFAFA', frame: '#AAAAAA', text: '#111111', accent: '#777777', flora: false },
    pearl:      { bg: '#F9F7F2', frame: '#B0A898', text: '#2A2520', accent: '#B0A898', flora: false },
    rose:       { bg: '#FDF5F5', frame: '#C87878', text: '#2A0A0A', accent: '#C87878', flora: true },
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
  const year = event.startDate ? new Date(event.startDate).getFullYear() : ''
  const venue = (event.location || '').slice(0, 22)
  const cat = (event.categoryId || 'EVENT').toUpperCase().slice(0, 14)

  const flora = p.flora
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

  const y2 = line2 ? 136 : 120
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
      <circle cx="2.5" cy="2.5" r="0.35" fill="${p.frame}" opacity="0.04"/>
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

// ── Interactions (unchanged) ───────────────────────────────────────────────
function onSearch() {
  clearTimeout(searchTimer)
  currentPage.value = 1
  if (!searchQuery.value.trim()) { searchResults.value = []; return }
  searchTimer = setTimeout(() => performSearch(searchQuery.value.trim()), 300)
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  currentPage.value = 1
}

// ── Date formatting (unchanged) ────────────────────────────────────────────
function formatMonth(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en', { month: 'short' }).toUpperCase()
}

function formatDay(iso) {
  if (!iso) return '—'
  return new Date(iso).getDate()
}

function formatFullDate(iso) {
  if (!iso) return 'Date TBD'
  return new Date(iso).toLocaleDateString('en', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

function goToEvent(id) {
  router.push(`/event/${id}`)
}

// Sync page to URL so browser back/forward and "All Events" button preserve position
watch(currentPage, (n) => {
  router.replace({ query: n > 1 ? { page: n } : {} })
})

watch([activeFilter, activeSort], () => { currentPage.value = 1 })

onMounted(() => {
  const qPage = parseInt(route.query.page)
  if (qPage > 1) currentPage.value = qPage
  loadEvents()
})
</script>

<style scoped>
/* ── Tokens ── */
.me-root {
  --ink: #0A0A0B;
  --ink-soft: #1F1F22;
  --ink-muted: #6B6B72;
  --ink-dim: #B5B5BB;
  --line: #ECECEF;
  --line-soft: #F4F4F6;
  --line-strong: #DCDCE0;
  --paper-soft: #FAFAFB;
  --gold: #B8924D;
  --emerald: #0A9C5F;
  --emerald-soft: #E5F5EE;
  min-height: 100vh;
  background: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif;
  color: var(--ink);
}

/* ── Topbar ── */
.me-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
}
.me-topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.me-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.3px;
}

.me-create-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(180deg, #2A2A2D 0%, #0A0A0B 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.28);
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 150ms, box-shadow 150ms;
  letter-spacing: 0.1px;
}
.me-create-btn:hover {
  opacity: 0.88;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.36);
}
.me-create-btn--lg {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 12px;
}

/* ── Page shell ── */
.me-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* ── Intro ── */
.me-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}
.me-intro-left { display: flex; flex-direction: column; gap: 10px; }
.me-eyebrow-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--ink-muted);
  background: var(--paper-soft);
  border: 1px solid var(--line);
  padding: 4px 12px;
  border-radius: 20px;
  width: fit-content;
}
.me-eyebrow-sparkle { color: var(--gold); font-size: 11px; }
.me-headline {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 64px;
  font-weight: 400;
  letter-spacing: -1.5px;
  color: var(--ink);
  margin: 0;
  line-height: 1.0;
}
.me-subtitle { font-size: 15px; color: var(--ink-muted); margin: 0; }

.me-intro-stats {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}
.me-stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 28px;
}
.me-stat-value {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 38px;
  font-weight: 400;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -1px;
}
.me-stat-label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.me-stat-block--emerald .me-stat-value { color: var(--emerald); }
.me-stat-block--dim .me-stat-value { color: var(--ink-dim); }
.me-stat-divider {
  width: 1px;
  height: 44px;
  background: var(--line-strong);
  flex-shrink: 0;
}

/* ── Filter bar ── */
.me-filterbar {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 10px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  flex-wrap: wrap;
}
.me-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 160px;
}
.me-search-icon-svg {
  position: absolute;
  left: 11px;
  color: var(--ink-dim);
  pointer-events: none;
  flex-shrink: 0;
}
.me-search-input {
  width: 100%;
  padding: 8px 30px 8px 34px;
  border: none;
  background: transparent;
  font-size: 13.5px;
  color: var(--ink);
  outline: none;
  font-family: inherit;
}
.me-search-input::placeholder { color: var(--ink-dim); }
.me-search-clear {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ink-dim);
  display: flex;
  align-items: center;
  padding: 2px;
  transition: color 130ms;
}
.me-search-clear:hover { color: var(--ink-muted); }
.me-fb-divider { width: 1px; height: 28px; background: var(--line-strong); flex-shrink: 0; }

.me-status-chips { display: flex; align-items: center; gap: 4px; }
.me-status-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-muted);
  cursor: pointer;
  font-family: inherit;
  transition: background 130ms, color 130ms;
}
.me-status-chip:hover { background: var(--paper-soft); color: var(--ink); }
.me-status-chip--active {
  background: var(--ink);
  color: #fff;
}
.me-chip-count {
  font-size: 10.5px;
  font-weight: 600;
  background: var(--paper-soft);
  color: var(--ink-dim);
  padding: 1px 6px;
  border-radius: 8px;
}
.me-chip-count--active { background: rgba(255,255,255,0.18); color: rgba(255,255,255,0.8); }
.me-fb-select {
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper-soft);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-muted);
  font-family: inherit;
  outline: none;
  cursor: pointer;
}
.me-fb-select:focus { border-color: var(--line-strong); }

/* ── Loading skeletons ── */
.me-skeleton-list { display: flex; flex-direction: column; gap: 20px; padding-top: 8px; }
.me-skeleton {
  height: 160px;
  border-radius: 16px;
  background: linear-gradient(90deg, #F4F4F6 25%, #ECECEF 50%, #F4F4F6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty state ── */
.me-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 20px;
  border: 1px dashed var(--line-strong);
  border-radius: 20px;
}
.me-empty-glyph { font-size: 32px; color: var(--gold); opacity: 0.6; }
.me-empty-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: var(--ink); margin: 0; text-align: center; }

/* ── Status pills ── */
.me-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.1px;
  white-space: nowrap;
}
.me-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.me-status-pill--upcoming  { background: var(--paper-soft); color: var(--ink-muted); }
.me-status-pill--upcoming .me-status-dot { background: var(--ink-dim); }
.me-status-pill--ongoing   { background: rgba(184,146,77,0.10); color: #96660A; }
.me-status-pill--ongoing .me-status-dot { background: var(--gold); animation: pulse-dot 1.6s ease-in-out infinite; }
.me-status-pill--completed { background: var(--paper-soft); color: var(--ink-dim); }
.me-status-pill--completed .me-status-dot { background: var(--ink-dim); }
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}
/* draft status treated same as upcoming */
.me-status-pill--draft { background: var(--line-soft); color: var(--ink-muted); }
.me-status-pill--draft .me-status-dot { background: var(--ink-dim); }

/* ── Role badge ── */
.me-role-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
}
.me-role-badge--owner { background: var(--ink); color: #fff; }
.me-role-badge--admin { background: transparent; border: 1px solid var(--line-strong); color: var(--ink-muted); }

/* ── Featured hero ── */
.me-featured {
  display: grid;
  grid-template-columns: 220px 1fr 220px;
  gap: 32px;
  padding: 28px 28px 28px 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 8px 24px -4px rgba(0,0,0,0.07), 0 24px 48px -16px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: box-shadow 280ms ease, transform 280ms ease;
  background: #fff;
}
.me-featured:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.05), 0 16px 40px -6px rgba(0,0,0,0.12), 0 40px 72px -24px rgba(0,0,0,0.14);
  transform: translateY(-2px);
}

/* Featured thumb col */
.me-feat-thumb-col {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.me-feat-thumb-outline {
  position: absolute;
  inset: 6px;
  border: 1px solid var(--line);
  border-radius: 10px;
  transform: rotate(-2deg);
  pointer-events: none;
}
.me-feat-thumb {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  transform: rotate(1deg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  line-height: 0;
}
.me-feat-thumb :deep(svg) { display: block; width: 100%; height: auto; }

/* Featured content col */
.me-feat-content { display: flex; flex-direction: column; gap: 12px; justify-content: center; }
.me-feat-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
}
.me-feat-eyebrow-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.me-feat-eyebrow-sparkle { color: var(--gold); font-size: 10px; }
.me-feat-eyebrow-line { flex: 1; height: 1px; background: var(--line); }
.me-feat-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: var(--ink-dim);
  padding: 2px 7px;
  border: 1px solid var(--line);
  border-radius: 5px;
}
.me-feat-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 40px;
  font-weight: 400;
  color: var(--ink);
  margin: 0;
  letter-spacing: -1px;
  line-height: 1.05;
}
.me-feat-subtitle {
  font-size: 14px;
  color: var(--ink-muted);
  margin: 0;
  font-family: 'Instrument Serif', Georgia, serif;
}
.me-feat-meta { display: flex; gap: 20px; flex-wrap: wrap; }
.me-feat-meta-item { display: flex; align-items: flex-start; gap: 7px; }
.me-feat-meta-item svg { margin-top: 3px; color: var(--ink-dim); flex-shrink: 0; }
.me-feat-meta-block { display: flex; flex-direction: column; gap: 1px; }
.me-feat-meta-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.me-feat-meta-val { font-size: 12.5px; color: var(--ink-soft); font-weight: 500; }

.me-feat-progress { display: flex; flex-direction: column; gap: 5px; }
.me-feat-progress-track {
  height: 4px;
  background: var(--line);
  border-radius: 4px;
  overflow: hidden;
}
.me-feat-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ink-soft), var(--ink));
  border-radius: 4px;
  transition: width 600ms ease;
}
.me-feat-progress-label { font-size: 11px; color: var(--ink-dim); font-family: 'JetBrains Mono', monospace; }

.me-feat-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.me-feat-actions-spacer { flex: 1; }
.me-feat-open-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--ink);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 140ms;
}
.me-feat-open-btn:hover { opacity: 0.85; }
.me-feat-edit-btn {
  background: transparent;
  border: 1px solid var(--line-strong);
  color: var(--ink-muted);
  padding: 8px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 130ms, color 130ms;
}
.me-feat-edit-btn:hover { background: var(--paper-soft); color: var(--ink); }

/* Featured countdown col */
.me-feat-countdown {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  padding-right: 4px;
}
.me-feat-cd-month {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ink-dim);
  line-height: 1;
  margin-bottom: 2px;
}
.me-feat-cd-day {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 110px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -6px;
  line-height: 0.85;
  display: block;
}
.me-feat-cd-year {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--ink-dim);
  margin-top: 6px;
  margin-bottom: 14px;
}
.me-feat-cd-ticket {
  background: var(--ink);
  color: #fff;
  border-radius: 10px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.22);
}
.me-feat-cd-num {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.5px;
}
.me-feat-cd-words {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.65);
  white-space: pre-line;
  line-height: 1.3;
}

/* ── Section heading ── */
.me-section-head {
  display: flex;
  align-items: center;
  gap: 14px;
}
.me-section-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 24px;
  font-style: italic;
  font-weight: 400;
  color: var(--ink);
  white-space: nowrap;
}
.me-section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--line-strong), transparent);
}
.me-section-meta { font-size: 12px; color: var(--ink-dim); font-weight: 500; white-space: nowrap; }

/* ── Hanging rows ── */
.me-hanging-list {
  display: flex;
  flex-direction: column;
  gap: 36px;
  padding-top: 14px;
}

.me-row {
  position: relative;
  display: grid;
  grid-template-columns: 170px 1fr 170px;
  gap: 28px;
  padding: 24px 28px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: #fff;
  cursor: pointer;
  transform: rotate(var(--rot, 0deg));
  box-shadow:
    0 1px 1px rgba(0,0,0,0.03),
    0 6px 14px -2px rgba(0,0,0,0.07),
    0 20px 36px -12px rgba(0,0,0,0.14),
    0 50px 90px -50px rgba(0,0,0,0.12);
  transition: transform 0.35s cubic-bezier(.2,.7,.2,1), box-shadow 0.35s cubic-bezier(.2,.7,.2,1);
}
.me-row:hover {
  transform: translateY(-4px) rotate(0deg) !important;
  box-shadow:
    0 2px 2px rgba(0,0,0,0.04),
    0 10px 24px -2px rgba(0,0,0,0.11),
    0 28px 56px -12px rgba(0,0,0,0.18),
    0 64px 100px -50px rgba(0,0,0,0.14);
}

/* Pin tack */
.me-pin {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #8c8c94, #1a1a1d 60%, #000);
  box-shadow: 0 2px 4px rgba(0,0,0,0.45);
  z-index: 2;
}
.me-pin-shadow {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 3.5px;
  border-radius: 50%;
  background: rgba(0,0,0,0.18);
  filter: blur(3px);
  z-index: 1;
}

/* Row thumbnail col */
.me-row-thumb-col {
  display: flex;
  align-items: center;
  justify-content: center;
}
.me-row-thumb {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  transform: rotate(-2deg);
  box-shadow: 0 3px 10px rgba(0,0,0,0.10);
  line-height: 0;
  transition: transform 0.35s cubic-bezier(.2,.7,.2,1);
}
.me-row:hover .me-row-thumb { transform: rotate(-1deg); }
.me-row-thumb :deep(svg) { display: block; width: 100%; height: auto; }

/* Row content col */
.me-row-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  min-width: 0;
}
.me-row-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.me-code-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--ink-dim);
  padding: 2px 7px;
  border: 1px solid var(--line);
  border-radius: 5px;
  letter-spacing: 0.3px;
}
.me-row-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 26px;
  font-weight: 400;
  color: var(--ink);
  margin: 0;
  letter-spacing: -0.4px;
  line-height: 1.15;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.me-row-meta { display: flex; flex-wrap: wrap; gap: 10px 16px; }
.me-row-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--ink-muted);
}
.me-row-meta-item svg { color: var(--ink-dim); flex-shrink: 0; }
.me-row-progress { display: flex; flex-direction: column; gap: 4px; }
.me-row-progress-track {
  height: 3px;
  background: var(--line);
  border-radius: 3px;
  overflow: hidden;
}
.me-row-progress-fill {
  height: 100%;
  background: var(--ink);
  border-radius: 3px;
}

/* Row right col */
.me-row-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
}
.me-row-date { display: flex; flex-direction: column; align-items: flex-end; gap: 0; }
.me-row-date-eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ink-dim);
  line-height: 1;
}
.me-row-date-day {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 60px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -2px;
  line-height: 0.9;
}
.me-row-date-year {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: var(--ink-dim);
  margin-top: 3px;
}
.me-row-days-pill {
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--paper-soft);
  border: 1px solid var(--line);
  color: var(--ink-muted);
  letter-spacing: 0.1px;
}
.me-row-days-pill--soon {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}
.me-row-days-pill--live {
  background: var(--emerald-soft);
  border-color: rgba(10,156,95,0.3);
  color: var(--emerald);
}
.me-row-days-pill--past { color: var(--ink-dim); }
.me-live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--emerald);
  animation: pulse-dot 1.6s ease-in-out infinite;
  flex-shrink: 0;
}
.me-row-manage-btn {
  background: transparent;
  border: 1px solid var(--line-strong);
  color: var(--ink-muted);
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.35s cubic-bezier(.2,.7,.2,1), color 0.35s cubic-bezier(.2,.7,.2,1), border-color 0.35s cubic-bezier(.2,.7,.2,1);
  white-space: nowrap;
}
.me-row:hover .me-row-manage-btn {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

/* ── Pagination ── */
.me-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
}
.me-pagination-info { font-size: 13px; color: var(--ink-muted); }
.me-pagination-controls { display: flex; align-items: center; gap: 4px; }
.me-page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-muted);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 130ms, color 130ms, background 130ms;
}
.me-page-btn:hover:not(:disabled):not(.me-page-btn--active) {
  border-color: var(--line-strong);
  color: var(--ink);
}
.me-page-btn--active {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
  font-weight: 700;
}
.me-page-btn--nav { color: var(--ink-dim); }
.me-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.me-page-ellipsis {
  width: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--ink-dim);
  user-select: none;
}


/* ── Responsive ── */
@media (max-width: 1024px) {
  .me-featured { grid-template-columns: 180px 1fr 180px; gap: 24px; }
  .me-feat-cd-day { font-size: 80px; }
  .me-row { grid-template-columns: 140px 1fr 150px; gap: 20px; padding: 20px 22px; }
}
@media (max-width: 860px) {
  .me-page { padding: 20px 20px 60px; gap: 28px; }
  .me-featured { grid-template-columns: 1fr; gap: 20px; }
  .me-feat-thumb-col { display: none; }
  .me-feat-countdown { flex-direction: row; align-items: center; justify-content: flex-start; }
  .me-feat-cd-day { font-size: 60px; }
  .me-row { grid-template-columns: 120px 1fr; gap: 16px; padding: 18px 18px 18px 14px; }
  .me-row-right { display: none; }
}
@media (max-width: 600px) {
  .me-topbar-inner { padding: 12px 16px; }
  .me-admin-pill { display: none; }
  .me-page { padding: 16px 16px 48px; gap: 24px; }
  .me-filterbar { padding: 8px 12px; gap: 8px; }
  .me-status-chips { gap: 2px; }
  .me-status-chip { padding: 4px 8px; font-size: 12px; }
  .me-row { grid-template-columns: 100px 1fr; gap: 12px; }
  .me-row-title { font-size: 20px; }
}
</style>
