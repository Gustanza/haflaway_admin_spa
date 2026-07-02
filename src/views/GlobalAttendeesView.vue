<template>
  <div class="ga-root">

    <!-- ── Topbar ── -->
    <nav class="ga-topbar">
      <div class="ga-topbar-inner">
        <span class="ga-page-title">Guests</span>
      </div>
    </nav>

    <!-- ── Page shell ── -->
    <div class="ga-page">

      <!-- Stats -->
      <div class="ga-stats">
        <div class="ga-stat">
          <span class="ga-stat-num">{{ statsLoading ? '—' : totalAttendees }}</span>
          <span class="ga-stat-label">Total Attendees</span>
        </div>
        <div class="ga-stat">
          <span class="ga-stat-num ga-stat-num--gold">{{ statsLoading ? '—' : totalAppearances }}</span>
          <span class="ga-stat-label">Total Appearances</span>
        </div>
        <div class="ga-stat">
          <span class="ga-stat-num ga-stat-num--green">{{ statsLoading ? '—' : repeatCount }}</span>
          <span class="ga-stat-label">Repeat Attendees</span>
        </div>
        <div class="ga-stat">
          <span class="ga-stat-num">{{ statsLoading ? '—' : avgEvents }}</span>
          <span class="ga-stat-label">Avg Events / Attendee</span>
        </div>
      </div>

      <!-- Top attendees spotlight -->
      <div v-if="topAttendees.length" class="ga-spotlight">
        <div class="ga-spotlight-head">
          <span class="ga-spotlight-title">Most Active Attendees</span>
          <span class="ga-spotlight-sub">Ranked by number of events attended</span>
        </div>
        <div class="ga-leaderboard">
          <div v-for="(p, i) in topAttendees" :key="p.id" class="ga-lb-row" @click="openEvents(p)">
            <span class="ga-lb-rank" :class="i === 0 && 'ga-lb-rank--first'">{{ i + 1 }}</span>
            <div class="ga-avatar" :style="avatarBg(p)">
              <span class="ga-avatar-letters">{{ initials(p) }}</span>
            </div>
            <div class="ga-lb-meta">
              <span class="ga-lb-name">{{ p.fullName || 'Unnamed' }}</span>
              <span class="ga-lb-phone">{{ p.phone || '—' }}</span>
            </div>
            <span class="ga-lb-count">{{ p.totalEventsCount || 0 }} events</span>
          </div>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="ga-filterbar">
        <div class="ga-search-wrap">
          <svg class="ga-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" class="ga-search-input" placeholder="Search by full phone number or name prefix…" />
          <button v-if="searchQuery" class="ga-search-clear" @click="searchQuery = ''">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="ga-fb-divider" />
        <div class="ga-status-chips">
          <button
            v-for="f in repeatFilters"
            :key="f.value"
            class="ga-status-chip"
            :class="{ 'ga-status-chip--active': repeatFilter === f.value, 'ga-status-chip--disabled': isSearching }"
            :disabled="isSearching"
            @click="repeatFilter = f.value"
          >{{ f.label }}</button>
        </div>
        <div class="ga-fb-divider" />
        <div class="ga-select-wrap">
          <select v-model="sortBy" class="ga-sort-select" :disabled="isSearching || repeatFilter !== 'all'">
            <option value="events">Most Events</option>
            <option value="newest">Newest First</option>
            <option value="name">Name A–Z</option>
          </select>
          <svg class="ga-select-caret" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <p v-if="isSearching" class="ga-search-hint">
        {{ isPhoneMode ? 'Exact phone match' : 'Matching names starting with your search' }} — filters and sorting are disabled while searching.
      </p>

      <!-- Loading -->
      <div v-if="loading" class="ga-skeleton-list">
        <div class="ga-skeleton" v-for="i in 5" :key="i" />
      </div>

      <!-- Empty -->
      <div v-else-if="rows.length === 0" class="ga-empty">
        <span class="ga-empty-glyph">✦</span>
        <p class="ga-empty-title">{{ searchQuery ? `No results for "${searchQuery}"` : 'No guests yet' }}</p>
        <p class="ga-empty-sub">{{ searchQuery ? 'Try the full phone number, or the start of a name.' : 'Profiles appear here once attendees are added to events.' }}</p>
      </div>

      <!-- Table -->
      <div v-else class="ga-table-wrap">
        <table class="ga-table">
          <thead>
            <tr>
              <th class="ga-th">Attendee</th>
              <th class="ga-th">Phone</th>
              <th class="ga-th">Events</th>
              <th class="ga-th">Pledged</th>
              <th class="ga-th">Paid</th>
              <th class="ga-th">Last Seen</th>
              <th class="ga-th ga-th--end"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in rows" :key="p.id" class="ga-row">
              <td class="ga-td">
                <div class="ga-cell-user">
                  <div class="ga-avatar" :style="avatarBg(p)">
                    <span class="ga-avatar-letters">{{ initials(p) }}</span>
                  </div>
                  <div class="ga-user-meta">
                    <span class="ga-user-name">{{ p.fullName || 'Unnamed' }}</span>
                    <span class="ga-user-email">{{ p.email || '—' }}</span>
                  </div>
                </div>
              </td>
              <td class="ga-td ga-td--muted">{{ p.phone || '—' }}</td>
              <td class="ga-td">
                <span class="ga-events-badge" :class="eventsBadgeClass(p.totalEventsCount)">{{ p.totalEventsCount || 0 }}</span>
              </td>
              <td class="ga-td ga-td--muted">{{ formatMoney(totalPledged(p)) }}</td>
              <td class="ga-td ga-td--muted">{{ formatMoney(totalPaid(p)) }}</td>
              <td class="ga-td ga-td--date">{{ formatDate(lastSeen(p)) }}</td>
              <td class="ga-td ga-td--actions">
                <button class="ga-view-btn" @click="openEvents(p)">View Events</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && (currentPage > 1 || hasNextPage)" class="ga-pagination">
        <span class="ga-pagination-info">
          Page {{ currentPage }}<span v-if="knownTotal !== null"> · ~{{ knownTotal }} total</span>
        </span>
        <div class="ga-pagination-controls">
          <button class="ga-page-btn ga-page-btn--nav" :disabled="currentPage === 1" @click="prevPage">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Prev
          </button>
          <button class="ga-page-btn ga-page-btn--nav" :disabled="!hasNextPage" @click="nextPage">
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

    </div>

    <!-- ── Events modal ── -->
    <Teleport to="body">
      <Transition name="ga-fade">
        <div v-if="eventsProfile" class="ga-backdrop" @click.self="eventsProfile = null">
          <div class="ga-events-modal">

            <div class="ga-em-header">
              <div class="ga-em-header-left">
                <span class="ga-em-title">Event History</span>
                <span class="ga-em-name">{{ eventsProfile.fullName || 'Unnamed' }}</span>
              </div>
              <button class="ga-close-btn" @click="eventsProfile = null">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="ga-em-stats">
              <div class="ga-em-stat">
                <span class="ga-em-stat-val">{{ eventsProfile.totalEventsCount || 0 }}</span>
                <span class="ga-em-stat-label">Events</span>
              </div>
              <div class="ga-em-stat-div" />
              <div class="ga-em-stat">
                <span class="ga-em-stat-val">{{ formatMoney(totalPledged(eventsProfile)) }}</span>
                <span class="ga-em-stat-label">Total Pledged</span>
              </div>
              <div class="ga-em-stat-div" />
              <div class="ga-em-stat">
                <span class="ga-em-stat-val">{{ formatMoney(totalPaid(eventsProfile)) }}</span>
                <span class="ga-em-stat-label">Total Paid</span>
              </div>
            </div>

            <div v-if="!eventsProfile.events?.length" class="ga-em-empty">
              <p class="ga-em-empty-text">No event records found.</p>
            </div>

            <div v-else class="ga-em-list">
              <div v-for="ev in sortedEvents(eventsProfile)" :key="ev.eventId + ev.attendeeId" class="ga-em-row">
                <div class="ga-em-row-top">
                  <span class="ga-em-status-badge">
                    <span class="ga-em-status-dot" :style="{ background: statusColor(ev.attendanceStatus) }" />
                    {{ ev.attendanceStatus || 'Not Confirmed' }}
                  </span>
                  <span class="ga-em-date">{{ formatDate(ev.addedAt) }}</span>
                </div>
                <div class="ga-em-row-bot">
                  <span class="ga-em-money">Pledged <strong>{{ formatMoney(ev.pledgedAmount) }}</strong></span>
                  <span class="ga-em-money">Paid <strong>{{ formatMoney(ev.paidAmount) }}</strong></span>
                  <router-link :to="`/event/${ev.eventId}/overview`" class="ga-em-link" @click="eventsProfile = null">
                    Manage Event
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                  </router-link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase'
import {
  collection, doc, getDoc, getDocs, getCountFromServer, getAggregateFromServer, sum,
  query, where, orderBy, limit, startAfter,
} from 'firebase/firestore'

const PAGE_SIZE = 10
const profilesCol = collection(db, 'attendeeProfiles')

const SORTS = {
  events: { field: 'totalEventsCount', dir: 'desc' },
  newest: { field: 'createdAt', dir: 'desc' },
  name:   { field: 'fullNameLower', dir: 'asc' },
}

function formatMoney(n) {
  if (!n) return 'TZS 0'
  return 'TZS ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = val?.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function statusColor(status) {
  return {
    'Confirmed': '#30D158',
    'Declined': '#FF453A',
    'Called': '#64D2FF',
    'Unreachable': '#FF9F0A',
    'Not Confirmed': '#8E8E93',
  }[status] ?? '#8E8E93'
}

// ── State ────────────────────────────────────────────────────────────────
const rows          = ref([])
const loading       = ref(true)
const statsLoading  = ref(true)
const searchQuery   = ref('')
const repeatFilter  = ref('all')
const sortBy        = ref('events')
const currentPage    = ref(1)
const pageCursors    = ref([null]) // pageCursors[i] = doc to startAfter for page i+1
const hasNextPage    = ref(false)
const eventsProfile  = ref(null)
const topAttendees   = ref([])

const totalAttendees   = ref(0)
const totalAppearances = ref(0)
const repeatCount      = ref(0)

const avgEvents = computed(() => {
  if (!totalAttendees.value) return '0'
  return (totalAppearances.value / totalAttendees.value).toFixed(1)
})

// Only known when the current filter maps directly onto an aggregate we already fetched.
const knownTotal = computed(() => {
  if (isSearching.value) return null
  if (repeatFilter.value === 'all')    return totalAttendees.value
  if (repeatFilter.value === 'repeat') return repeatCount.value
  if (repeatFilter.value === 'first')  return totalAttendees.value - repeatCount.value
  return null
})

const repeatFilters = [
  { label: 'All',         value: 'all'    },
  { label: 'Repeat (2+)', value: 'repeat' },
  { label: 'First-Time',  value: 'first'  },
]

// ── Per-row aggregates (cheap — events array is embedded in the profile doc) ─
function totalPledged(p) { return (p.events || []).reduce((s, e) => s + (Number(e.pledgedAmount) || 0), 0) }
function totalPaid(p)    { return (p.events || []).reduce((s, e) => s + (Number(e.paidAmount) || 0), 0) }
function lastSeen(p) {
  const dates = (p.events || []).map(e => e.addedAt).filter(Boolean)
  if (!dates.length) return p.updatedAt || null
  return dates.reduce((latest, d) => new Date(d) > new Date(latest) ? d : latest, dates[0])
}
function sortedEvents(p) {
  return [...(p.events || [])].sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0))
}

// ── Search mode detection ───────────────────────────────────────────────────
// Firestore can't do substring search server-side, so the search box supports
// two cheap, index-backed lookups instead of scanning the collection:
//   - an exact phone match, via the attendeePhoneIndex collection (keyed by normalized phone)
//   - a "starts with" prefix match on fullNameLower
function normalizedDigits(s) { return (s || '').replace(/\D/g, '') }
function isPhoneQuery(q) {
  const digits = normalizedDigits(q)
  return /^[+\d][\d\s\-()]*$/.test(q.trim()) && digits.length >= 4
}

const isSearching = computed(() => searchQuery.value.trim().length > 0)
const isPhoneMode  = computed(() => isSearching.value && isPhoneQuery(searchQuery.value))

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(p) {
  const name = (p?.fullName || '').trim()
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

const PALETTE = ['#C9A84C', '#30D158', '#0A84FF', '#FF9F0A', '#BF5AF2', '#FF6961', '#64D2FF']
function avatarBg(p) {
  const color = PALETTE[(p.id || '0').charCodeAt(0) % PALETTE.length]
  return { background: color + '1A', borderColor: color + '55', color }
}

function eventsBadgeClass(count) {
  const n = count || 0
  if (n >= 5) return 'ga-events-badge--vip'
  if (n >= 2) return 'ga-events-badge--repeat'
  return ''
}

function openEvents(p) { eventsProfile.value = p }

// ── Stats + leaderboard (aggregation queries — never download full docs) ────
async function fetchStats() {
  statsLoading.value = true
  try {
    const [totalSnap, repeatSnap, aggSnap] = await Promise.all([
      getCountFromServer(profilesCol),
      getCountFromServer(query(profilesCol, where('totalEventsCount', '>', 1))),
      getAggregateFromServer(profilesCol, { totalEvents: sum('totalEventsCount') }),
    ])
    totalAttendees.value   = totalSnap.data().count
    repeatCount.value      = repeatSnap.data().count
    totalAppearances.value = aggSnap.data().totalEvents || 0
  } catch (e) {
    console.error(e)
  } finally {
    statsLoading.value = false
  }
}

async function fetchLeaderboard() {
  try {
    const snap = await getDocs(query(profilesCol, orderBy('totalEventsCount', 'desc'), limit(5)))
    topAttendees.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
  }
}

// ── Browse pagination (cursor-based — one page of docs per read) ────────────
async function fetchBrowsePage(pageIndex) {
  const sort = SORTS[sortBy.value]
  const constraints = []
  if (repeatFilter.value === 'repeat') constraints.push(where('totalEventsCount', '>', 1))
  if (repeatFilter.value === 'first')  constraints.push(where('totalEventsCount', '<=', 1))
  constraints.push(orderBy(sort.field, sort.dir))
  const cursor = pageCursors.value[pageIndex - 1]
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(PAGE_SIZE + 1)) // peek one extra to know if there's a next page

  const snap = await getDocs(query(profilesCol, ...constraints))
  const docs = snap.docs
  hasNextPage.value = docs.length > PAGE_SIZE
  const pageDocs = docs.slice(0, PAGE_SIZE)
  rows.value = pageDocs.map(d => ({ id: d.id, ...d.data() }))
  if (pageDocs.length) pageCursors.value[pageIndex] = pageDocs[pageDocs.length - 1]
}

// ── Name-prefix search (same cursor pattern, scoped to the prefix range) ────
async function fetchNamePage(pageIndex, qLower) {
  const constraints = [
    orderBy('fullNameLower'),
    where('fullNameLower', '>=', qLower),
    where('fullNameLower', '<=', qLower + ''),
  ]
  const cursor = pageCursors.value[pageIndex - 1]
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(PAGE_SIZE + 1))

  const snap = await getDocs(query(profilesCol, ...constraints))
  const docs = snap.docs
  hasNextPage.value = docs.length > PAGE_SIZE
  const pageDocs = docs.slice(0, PAGE_SIZE)
  rows.value = pageDocs.map(d => ({ id: d.id, ...d.data() }))
  if (pageDocs.length) pageCursors.value[pageIndex] = pageDocs[pageDocs.length - 1]
}

// ── Exact phone lookup (single indexed read, no scan) ────────────────────────
async function fetchPhoneMatch(qRaw) {
  hasNextPage.value = false
  const digits = normalizedDigits(qRaw)
  const idxSnap = await getDoc(doc(db, 'attendeePhoneIndex', digits))
  if (!idxSnap.exists()) { rows.value = []; return }
  const profileSnap = await getDoc(doc(db, 'attendeeProfiles', idxSnap.data().profileId))
  rows.value = profileSnap.exists() ? [{ id: profileSnap.id, ...profileSnap.data() }] : []
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function loadCurrentPage() {
  loading.value = true
  try {
    const q = searchQuery.value.trim()
    if (!q) await fetchBrowsePage(currentPage.value)
    else if (isPhoneQuery(q)) await fetchPhoneMatch(q)
    else await fetchNamePage(currentPage.value, q.toLowerCase())
  } catch (e) {
    console.error(e)
    rows.value = []
  } finally {
    loading.value = false
  }
}

function resetAndLoad() {
  currentPage.value = 1
  pageCursors.value = [null]
  loadCurrentPage()
}

function nextPage() { currentPage.value++; loadCurrentPage() }
function prevPage() { currentPage.value--; loadCurrentPage() }

let searchDebounce = null
watch(searchQuery, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(resetAndLoad, 300)
})
// An inequality filter on totalEventsCount (repeat/first) requires that field
// to be the first orderBy too, or Firestore rejects the query — so force the
// sort back to "events" whenever a repeat filter is active.
watch([repeatFilter, sortBy], ([rf, sb]) => {
  if (rf !== 'all' && sb !== 'events') { sortBy.value = 'events'; return }
  resetAndLoad()
})

onMounted(() => {
  fetchStats()
  fetchLeaderboard()
  loadCurrentPage()
})
onUnmounted(() => clearTimeout(searchDebounce))
</script>

<style scoped>
/* ── Tokens ── */
.ga-root {
  --ink: #f0f0ec;
  --ink-muted: #888;
  --ink-dim: #555;
  --line: #242424;
  --line-strong: #2a2a2a;
  --paper-soft: #141414;
  --gold: #C9A84C;
  --gold-bg: rgba(201,168,76,0.08);
  --gold-border: rgba(201,168,76,0.25);
  --emerald: #30D158;
  --emerald-soft: rgba(48,209,88,0.12);
  min-height: 100vh;
  background: #0a0a0b;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--ink);
}

/* ── Topbar ── */
.ga-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.ga-topbar-inner {
  max-width: 1200px; margin: 0 auto; padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.ga-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px;
}

/* ── Page shell ── */
.ga-page {
  max-width: 1200px; margin: 0 auto;
  padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Stats ── */
.ga-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.ga-stat {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ga-stat-num {
  font-size: 32px; font-weight: 700; color: var(--ink);
  letter-spacing: -0.5px; line-height: 1;
}
.ga-stat-num--gold  { color: var(--gold); }
.ga-stat-num--green { color: var(--emerald); }
.ga-stat-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.6px;
  text-transform: uppercase; color: var(--ink-dim);
}

/* ── Spotlight / leaderboard ── */
.ga-spotlight {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 18px 20px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ga-spotlight-head { display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px; }
.ga-spotlight-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 17px; color: var(--ink); }
.ga-spotlight-sub { font-size: 12px; color: var(--ink-dim); }
.ga-leaderboard { display: flex; flex-direction: column; }
.ga-lb-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 4px; border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer; transition: background 120ms; border-radius: 8px;
}
.ga-lb-row:last-child { border-bottom: none; }
.ga-lb-row:hover { background: rgba(255,255,255,0.025); }
.ga-lb-rank {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--ink-dim);
  background: var(--paper-soft); border: 1px solid var(--line-strong);
}
.ga-lb-rank--first { color: #070707; background: var(--gold); border-color: var(--gold); }
.ga-lb-meta { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.ga-lb-name { font-size: 13.5px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ga-lb-phone { font-size: 11.5px; color: var(--ink-dim); }
.ga-lb-count { font-size: 12px; font-weight: 700; color: var(--gold); white-space: nowrap; }

/* ── Filter bar ── */
.ga-filterbar {
  display: flex; align-items: center; gap: 4px;
  background: #111; border: 1px solid var(--line-strong); border-radius: 14px;
  padding: 8px 8px 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); flex-wrap: wrap;
}
.ga-search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 160px; }
.ga-search-icon { position: absolute; left: 11px; color: var(--ink-dim); pointer-events: none; flex-shrink: 0; }
.ga-search-input {
  width: 100%; padding: 8px 30px 8px 34px; border: none; background: transparent;
  font-size: 13.5px; color: var(--ink); outline: none; font-family: inherit;
}
.ga-search-input::placeholder { color: var(--ink-dim); }
.ga-search-clear {
  position: absolute; right: 6px; background: none; border: none;
  cursor: pointer; color: var(--ink-dim); display: flex; align-items: center; padding: 2px;
}
.ga-search-clear:hover { color: var(--ink-muted); }
.ga-fb-divider { width: 1px; height: 26px; background: var(--line-strong); flex-shrink: 0; margin: 0 4px; }

.ga-status-chips { display: flex; align-items: center; gap: 4px; }
.ga-status-chip {
  padding: 7px 14px; border-radius: 8px; border: none; background: transparent;
  font-size: 13px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms;
  white-space: nowrap;
}
.ga-status-chip:hover { background: var(--paper-soft); color: var(--ink); }
.ga-status-chip--active { background: rgba(240,240,236,0.09); color: var(--ink); font-weight: 600; }
.ga-status-chip:disabled,
.ga-status-chip--disabled { opacity: 0.4; cursor: not-allowed; }
.ga-status-chip:disabled:hover { background: transparent; color: var(--ink-muted); }

.ga-select-wrap { position: relative; display: flex; align-items: center; }
.ga-sort-select {
  appearance: none; background: transparent; border: none;
  font-size: 13px; font-weight: 500; color: var(--ink-muted);
  padding: 7px 24px 7px 10px; font-family: inherit; cursor: pointer; outline: none;
}
.ga-sort-select:hover { color: var(--ink); }
.ga-sort-select:disabled { opacity: 0.4; cursor: not-allowed; }
.ga-select-caret { position: absolute; right: 8px; color: var(--ink-dim); pointer-events: none; }

.ga-search-hint { font-size: 11.5px; color: var(--ink-dim); padding: 0 4px; margin: -12px 0 0; }

/* ── Skeletons ── */
.ga-skeleton-list { display: flex; flex-direction: column; gap: 1px; }
.ga-skeleton {
  height: 58px;
  background: linear-gradient(90deg, #141414 25%, #1a1a1a 50%, #141414 75%);
  background-size: 200% 100%;
  animation: ga-shimmer 1.4s infinite;
}
.ga-skeleton:first-child { border-radius: 14px 14px 0 0; }
.ga-skeleton:last-child  { border-radius: 0 0 14px 14px; }
@keyframes ga-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty ── */
.ga-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 20px; border: 1px dashed var(--line-strong); border-radius: 20px;
}
.ga-empty-glyph { font-size: 28px; color: var(--gold); opacity: 0.6; }
.ga-empty-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: var(--ink); margin: 0; }
.ga-empty-sub   { font-size: 13px; color: var(--ink-muted); margin: 0; }

/* ── Table ── */
.ga-table-wrap {
  background: #141414; border: 1px solid #2a2a2a;
  border-radius: 16px; overflow: hidden; overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ga-table { width: 100%; border-collapse: collapse; min-width: 820px; }
.ga-th {
  padding: 10px 18px; text-align: left;
  font-size: 11px; font-weight: 600; color: var(--ink-dim);
  letter-spacing: 0.8px; text-transform: uppercase;
  border-bottom: 1px solid #2a2a2a; background: #111;
  white-space: nowrap;
}
.ga-th--end { width: 110px; }
.ga-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 120ms; }
.ga-row:last-child { border-bottom: none; }
.ga-row:hover { background: rgba(255,255,255,0.025); }
.ga-td { padding: 14px 18px; font-size: 13.5px; color: var(--ink); vertical-align: middle; white-space: nowrap; }
.ga-td--muted { color: var(--ink-muted); font-size: 12px; }
.ga-td--date  { color: var(--ink-muted); font-size: 12px; }

/* User cell */
.ga-cell-user { display: flex; align-items: center; gap: 12px; min-width: 200px; }
.ga-avatar {
  width: 34px; height: 34px; border-radius: 10px; border: 1px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden; position: relative;
}
.ga-avatar-letters { font-size: 12px; font-weight: 700; line-height: 1; }
.ga-user-meta  { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ga-user-name  { font-size: 13.5px; font-weight: 600; color: var(--ink); max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.ga-user-email { font-size: 12px; color: var(--ink-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; }

/* Events badge */
.ga-events-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 26px; padding: 3px 9px; border-radius: 20px;
  font-size: 11.5px; font-weight: 700;
  background: var(--paper-soft); color: var(--ink-muted); border: 1px solid var(--line-strong);
}
.ga-events-badge--repeat { background: rgba(10,132,255,.12); color: #0A84FF; border-color: rgba(10,132,255,.2); }
.ga-events-badge--vip    { background: var(--gold-bg); color: var(--gold); border-color: var(--gold-border); }

/* Row actions */
.ga-td--actions { text-align: right; }
.ga-view-btn {
  background: transparent; border: 1px solid var(--line-strong); color: var(--ink-muted);
  padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms, border-color 130ms;
}
.ga-view-btn:hover { background: var(--gold-bg); color: var(--gold); border-color: var(--gold-border); }

/* ── Pagination ── */
.ga-pagination { display: flex; align-items: center; justify-content: space-between; padding: 4px 2px; flex-wrap: wrap; gap: 10px; }
.ga-pagination-info { font-size: 12.5px; color: var(--ink-dim); }
.ga-pagination-controls { display: flex; align-items: center; gap: 4px; }
.ga-page-btn {
  min-width: 30px; height: 32px; padding: 0 12px; border-radius: 8px;
  border: 1px solid var(--line-strong); background: var(--paper-soft);
  color: var(--ink-muted); font-size: 12.5px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms, border-color 130ms;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.ga-page-btn:hover:not(:disabled) { background: var(--line); color: var(--ink); }
.ga-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Modal ── */
.ga-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.ga-events-modal {
  background: #161616; border: 1px solid #2a2a2a; border-radius: 18px;
  padding: 22px 22px 8px; width: 460px; max-width: 100%; max-height: 82vh;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4), 1px 2px 0 rgba(0,0,0,0.3);
}
.ga-em-header { display: flex; align-items: flex-start; justify-content: space-between; }
.ga-em-header-left { display: flex; flex-direction: column; gap: 2px; }
.ga-em-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 19px; font-weight: 400; color: #e2e8f0; letter-spacing: -0.3px; }
.ga-em-name { font-size: 12.5px; color: var(--ink-dim); }
.ga-close-btn { background: none; border: none; color: var(--ink-dim); cursor: pointer; padding: 4px; display: flex; }
.ga-close-btn:hover { color: var(--ink); }

.ga-em-stats {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--paper-soft); border: 1px solid var(--line-strong); border-radius: 12px; padding: 12px 14px;
}
.ga-em-stat { display: flex; flex-direction: column; gap: 2px; align-items: center; flex: 1; }
.ga-em-stat-val { font-size: 15px; font-weight: 700; color: var(--ink); }
.ga-em-stat-label { font-size: 9.5px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--ink-dim); }
.ga-em-stat-div { width: 1px; height: 26px; background: var(--line-strong); }

.ga-em-empty { padding: 30px 0; text-align: center; }
.ga-em-empty-text { font-size: 13px; color: var(--ink-muted); }

.ga-em-list { display: flex; flex-direction: column; gap: 2px; overflow-y: auto; padding-bottom: 14px; margin-right: -6px; padding-right: 6px; }
.ga-em-row { padding: 11px 4px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 6px; }
.ga-em-row:last-child { border-bottom: none; }
.ga-em-row-top { display: flex; align-items: center; justify-content: space-between; }
.ga-em-status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--ink); }
.ga-em-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.ga-em-date { font-size: 11.5px; color: var(--ink-dim); }
.ga-em-row-bot { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ga-em-money { font-size: 11.5px; color: var(--ink-muted); }
.ga-em-money strong { color: var(--ink); font-weight: 600; }
.ga-em-link {
  display: inline-flex; align-items: center; gap: 4px; margin-left: auto;
  font-size: 11.5px; font-weight: 600; color: var(--gold); text-decoration: none;
}
.ga-em-link:hover { color: #d4b560; }

.ga-fade-enter-active, .ga-fade-leave-active { transition: opacity 180ms; }
.ga-fade-enter-from, .ga-fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .ga-stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
