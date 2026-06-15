<template>
  <div class="cv-root">

    <!-- Header -->
    <div class="cv-header">
      <div>
        <h1 class="cv-title">Contacts</h1>
        <p class="cv-subtitle">Global attendee profiles across all events</p>
      </div>
      <div class="cv-header-stats">
        <div class="cv-hstat">
          <span class="cv-hstat-val">{{ totalCount ?? '—' }}</span>
          <span class="cv-hstat-key">Total contacts</span>
        </div>
      </div>
    </div>

    <!-- Search + sort bar -->
    <div class="cv-toolbar">
      <div class="cv-search-wrap">
        <svg class="cv-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="searchQ" class="cv-search" placeholder="Search by name or phone…" @input="onSearch" />
        <button v-if="searchQ" class="cv-search-clear" @click="clearSearch">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="cv-sort-chips">
        <button v-for="s in sortOptions" :key="s.val"
          class="cv-sort-chip" :class="{ 'cv-sort-chip--active': sortBy === s.val }"
          @click="setSort(s.val)">
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !contacts.length" class="cv-state">
      <div class="cv-spinner" />
      <span>Loading contacts…</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!loading && !contacts.length" class="cv-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="color:#4f617a">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <span>{{ searchQ ? 'No contacts match your search.' : 'No contacts yet — run the sync function first.' }}</span>
    </div>

    <!-- Table -->
    <div v-else class="cv-table-wrap">
      <table class="cv-table">
        <thead>
          <tr>
            <th class="cv-th">#</th>
            <th class="cv-th">Name</th>
            <th class="cv-th">Phone</th>
            <th class="cv-th cv-th--center">Events Attended</th>
            <th class="cv-th">First Seen</th>
            <th class="cv-th">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, idx) in contacts" :key="c.id"
            class="cv-row" @click="openDetail(c)">
            <td class="cv-td cv-td--dim">{{ rowNumber(idx) }}</td>
            <td class="cv-td">
              <div class="cv-name-cell">
                <div class="cv-avatar">{{ initials(c.fullName) }}</div>
                <span class="cv-name">{{ c.fullName || '—' }}</span>
              </div>
            </td>
            <td class="cv-td cv-td--mono">{{ formatPhone(c.phone) }}</td>
            <td class="cv-td cv-td--center">
              <span class="cv-event-badge" :class="badgeClass(c.totalEventsCount)">
                {{ c.totalEventsCount ?? 0 }}
              </span>
            </td>
            <td class="cv-td cv-td--dim">{{ fmtDate(c.createdAt) }}</td>
            <td class="cv-td cv-td--dim">{{ fmtDate(c.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && contacts.length" class="cv-pagination">
      <span class="cv-page-info">
        Page {{ currentPage }} · {{ contacts.length }} shown
      </span>
      <div class="cv-page-btns">
        <button class="cv-page-btn" :disabled="currentPage === 1" @click="prevPage">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Prev
        </button>
        <button class="cv-page-btn" :disabled="!hasMore" @click="nextPage">
          Next
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- Detail drawer -->
    <Transition name="cv-slide">
      <div v-if="selected" class="cv-drawer-backdrop" @click.self="selected = null">
        <div class="cv-drawer">

          <div class="cv-drawer-head">
            <div class="cv-drawer-avatar">{{ initials(selected.fullName) }}</div>
            <div class="cv-drawer-info">
              <span class="cv-drawer-name">{{ selected.fullName || '—' }}</span>
              <span class="cv-drawer-phone">{{ formatPhone(selected.phone) }}</span>
            </div>
            <button class="cv-drawer-close" @click="selected = null">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="cv-drawer-stats">
            <div class="cv-dstat">
              <span class="cv-dstat-val">{{ selected.totalEventsCount ?? 0 }}</span>
              <span class="cv-dstat-key">Events</span>
            </div>
            <div class="cv-dstat">
              <span class="cv-dstat-val">{{ fmtDate(selected.createdAt) }}</span>
              <span class="cv-dstat-key">First seen</span>
            </div>
          </div>

          <div class="cv-drawer-section-label">Event History</div>

          <div v-if="historyLoading" class="cv-drawer-loading">
            <div class="cv-spinner cv-spinner--sm" />
          </div>
          <div v-else-if="!eventHistory.length" class="cv-drawer-empty">No event history yet.</div>
          <ul v-else class="cv-history-list">
            <li v-for="ev in eventHistory" :key="ev.id" class="cv-history-item">
              <div class="cv-history-dot" />
              <div class="cv-history-body">
                <span class="cv-history-name">{{ ev.eventName || ev.eventId }}</span>
                <div class="cv-history-meta">
                  <span class="cv-history-type">{{ ev.attendeeType }}</span>
                  <span class="cv-history-status" :class="statusClass(ev.attendanceStatus)">{{ ev.attendanceStatus }}</span>
                </div>
                <div v-if="ev.pledgedAmount || ev.paidAmount" class="cv-history-amounts">
                  <span v-if="ev.pledgedAmount">Pledged: TZS {{ fmtNum(ev.pledgedAmount) }}</span>
                  <span v-if="ev.paidAmount">Paid: TZS {{ fmtNum(ev.paidAmount) }}</span>
                </div>
                <span class="cv-history-date">{{ fmtDate(ev.processedAt) }}</span>
              </div>
            </li>
          </ul>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { db } from '../firebase'
import {
  collection, query, orderBy, limit,
  startAfter, getDocs, getCountFromServer,
  getDoc, doc
} from 'firebase/firestore'

const PAGE_SIZE = 25

const contacts     = ref([])
const loading      = ref(true)
const totalCount   = ref(null)
const currentPage  = ref(1)
const hasMore      = ref(false)
const cursors      = ref([null])   // cursors[i] = startAfter doc for page i+1
const searchQ      = ref('')
const sortBy       = ref('totalEventsCount')

const selected      = ref(null)
const eventHistory  = ref([])
const historyLoading = ref(false)

const sortOptions = [
  { val: 'totalEventsCount', label: 'Most events' },
  { val: 'createdAt',        label: 'First seen'  },
  { val: 'updatedAt',        label: 'Recent'      },
]

// ── Load ──────────────────────────────────────────────────────────────────────

async function loadPage(cursor = null) {
  loading.value = true
  try {
    const col = collection(db, 'attendeeProfiles')
    const constraints = [orderBy(sortBy.value, 'desc'), limit(PAGE_SIZE + 1)]
    if (cursor) constraints.push(startAfter(cursor))

    const snap = await getDocs(query(col, ...constraints))
    hasMore.value = snap.docs.length > PAGE_SIZE
    contacts.value = snap.docs.slice(0, PAGE_SIZE).map(d => ({ id: d.id, ...d.data() }))

    if (hasMore.value) {
      cursors.value[currentPage.value] = snap.docs[PAGE_SIZE - 1]
    }
  } catch (e) {
    console.error('[ContactsView] load error', e)
  } finally {
    loading.value = false
  }
}

async function loadCount() {
  try {
    const snap = await getCountFromServer(collection(db, 'attendeeProfiles'))
    totalCount.value = snap.data().count
  } catch { /* silent */ }
}

function nextPage() {
  if (!hasMore.value) return
  currentPage.value++
  loadPage(cursors.value[currentPage.value - 1])
}

function prevPage() {
  if (currentPage.value === 1) return
  currentPage.value--
  loadPage(cursors.value[currentPage.value - 1] ?? null)
}

function setSort(val) {
  sortBy.value = val
  reset()
}

function reset() {
  currentPage.value = 1
  cursors.value = [null]
  loadPage(null)
}

// ── Search (client-side within loaded page for now) ──────────────────────────
// Full-text search across Firestore requires an index or external service.
// We filter the current page locally; for deeper search, use fullNameLower.
const filteredContacts = ref([])
watch([contacts, searchQ], () => {
  const q = searchQ.value.toLowerCase().trim()
  if (!q) { filteredContacts.value = contacts.value; return }
  filteredContacts.value = contacts.value.filter(c =>
    (c.fullName || '').toLowerCase().includes(q) ||
    (c.phone || '').includes(q)
  )
}, { immediate: true })

function onSearch() { /* reactive via watch */ }
function clearSearch() { searchQ.value = '' }

// ── Detail drawer ─────────────────────────────────────────────────────────────
async function openDetail(c) {
  selected.value = c
  eventHistory.value = []
  historyLoading.value = true
  try {
    // Source 1: eventHistory subcollection (written by syncContactsFromEvents)
    const subSnap = await getDocs(
      query(
        collection(db, 'attendeeProfiles', c.id, 'eventHistory'),
        orderBy('processedAt', 'desc')
      )
    )
    const fromSub = subSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Source 2: events array on root doc (written by backfillAttendeesToGlobal)
    const backfillArray = Array.isArray(c.events) ? c.events : []
    const subIds = new Set(fromSub.map(e => e.eventId))
    const fromArray = backfillArray
      .filter(ev => ev.eventId && !subIds.has(ev.eventId))
      .map(ev => ({
        id:               ev.eventId,
        eventId:          ev.eventId,
        eventName:        null,
        attendeeType:     ev.cards ? Object.keys(ev.cards)[0] : 'unknown',
        attendanceStatus: ev.attendanceStatus || 'Not Confirmed',
        processedAt:      ev.addedAt || null,
        pledgedAmount:    ev.pledgedAmount || 0,
        paidAmount:       ev.paidAmount    || 0,
      }))

    const merged = [...fromSub, ...fromArray]

    // Batch-fetch event titles for entries that don't have one
    const needsTitle = merged.filter(e => !e.eventName)
    if (needsTitle.length) {
      const uniqueIds = [...new Set(needsTitle.map(e => e.eventId))]
      const eventDocs = await Promise.all(
        uniqueIds.map(id => getDoc(doc(db, 'events', id)))
      )
      const nameMap = {}
      eventDocs.forEach(d => { if (d.exists()) nameMap[d.id] = d.data().title || d.id })
      merged.forEach(e => { if (!e.eventName) e.eventName = nameMap[e.eventId] || e.eventId })
    }

    // Sort newest first
    merged.sort((a, b) => new Date(b.processedAt || 0) - new Date(a.processedAt || 0))

    eventHistory.value = merged
  } catch (e) {
    console.error('[ContactsView] history error', e)
  } finally {
    historyLoading.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

function formatPhone(p) {
  if (!p) return '—'
  return '+' + p
}

function fmtNum(n) {
  return Number(n).toLocaleString('en-US')
}

function fmtDate(val) {
  if (!val) return '—'
  try { return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

function rowNumber(idx) {
  return (currentPage.value - 1) * PAGE_SIZE + idx + 1
}

function badgeClass(n) {
  if (!n || n < 2) return ''
  if (n >= 10)     return 'cv-event-badge--gold'
  if (n >= 5)      return 'cv-event-badge--blue'
  return 'cv-event-badge--green'
}

function statusClass(s) {
  if (!s) return ''
  const l = s.toLowerCase()
  if (l.includes('confirmed') || l.includes('attended')) return 'cv-status--green'
  if (l.includes('not'))  return 'cv-status--dim'
  return ''
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadPage()
loadCount()
</script>

<style scoped>
.cv-root {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0d1117;
  color: #e2e8f0;
}

/* ── Header ── */
.cv-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 32px 40px 20px;
  border-bottom: 1px solid #1e2d44;
}
.cv-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  color: #e2e8f0;
  margin: 0 0 4px;
  letter-spacing: -0.4px;
}
.cv-subtitle {
  font-size: 13px;
  color: #4f617a;
  margin: 0;
}
.cv-header-stats { display: flex; gap: 24px; }
.cv-hstat { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.cv-hstat-val { font-size: 22px; font-weight: 700; color: #e2e8f0; line-height: 1; }
.cv-hstat-key { font-size: 11px; color: #4f617a; text-transform: uppercase; letter-spacing: 0.6px; }

/* ── Toolbar ── */
.cv-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  border-bottom: 1px solid #1e2d44;
}
.cv-search-wrap {
  position: relative;
  flex: 1;
  max-width: 320px;
}
.cv-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #4f617a;
  pointer-events: none;
}
.cv-search {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 9px;
  color: #e2e8f0;
  font-size: 13px;
  font-family: inherit;
  padding: 8px 32px 8px 32px;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.18);
  transition: border-color 150ms, box-shadow 150ms;
  box-sizing: border-box;
}
.cv-search:focus {
  border-color: rgba(201,168,76,0.5);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.12), 0 0 0 3px rgba(201,168,76,0.09);
}
.cv-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #4f617a;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}
.cv-search-clear:hover { color: #e2e8f0; }

.cv-sort-chips { display: flex; gap: 4px; }
.cv-sort-chip {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #1e2d44;
  background: transparent;
  color: #4f617a;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 130ms;
}
.cv-sort-chip:hover { border-color: #2a3a52; color: #8892a4; }
.cv-sort-chip--active {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.12);
  color: #e2e8f0;
}

/* ── State ── */
.cv-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #4f617a;
  font-size: 14px;
  padding: 80px 0;
}
.cv-spinner {
  width: 28px; height: 28px;
  border: 2.5px solid #1e2d44;
  border-top-color: #8892a4;
  border-radius: 50%;
  animation: cv-spin 0.7s linear infinite;
}
.cv-spinner--sm { width: 18px; height: 18px; border-width: 2px; }
@keyframes cv-spin { to { transform: rotate(360deg); } }

/* ── Table ── */
.cv-table-wrap { flex: 1; overflow-x: auto; padding: 0 40px; }
.cv-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
.cv-th {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: #4f617a;
  padding: 0 12px 10px;
  text-align: left;
  border-bottom: 1px solid #1e2d44;
  white-space: nowrap;
}
.cv-th--center { text-align: center; }
.cv-td {
  padding: 13px 12px;
  font-size: 13.5px;
  color: #e2e8f0;
  border-bottom: 1px solid #1a2236;
  vertical-align: middle;
}
.cv-td--dim   { color: #4f617a; font-size: 12.5px; }
.cv-td--mono  { font-family: 'JetBrains Mono', 'Fira Mono', monospace; font-size: 12.5px; color: #8892a4; }
.cv-td--center { text-align: center; }
.cv-row {
  cursor: pointer;
  transition: background 120ms;
}
.cv-row:hover td { background: rgba(255,255,255,0.025); }

.cv-name-cell { display: flex; align-items: center; gap: 10px; }
.cv-avatar {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(201,168,76,0.12);
  border: 1px solid rgba(201,168,76,0.2);
  color: #C9A84C;
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cv-name { font-weight: 500; }

.cv-event-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(255,255,255,0.06);
  color: #8892a4;
  border: 1px solid #1e2d44;
}
.cv-event-badge--green { background: rgba(52,211,153,0.1); color: #34d399; border-color: rgba(52,211,153,0.2); }
.cv-event-badge--blue  { background: rgba(96,165,250,0.1); color: #60a5fa; border-color: rgba(96,165,250,0.2); }
.cv-event-badge--gold  { background: rgba(201,168,76,0.12); color: #C9A84C; border-color: rgba(201,168,76,0.25); }

/* ── Pagination ── */
.cv-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px 32px;
  border-top: 1px solid #1e2d44;
  margin-top: 8px;
}
.cv-page-info { font-size: 12.5px; color: #4f617a; }
.cv-page-btns { display: flex; gap: 6px; }
.cv-page-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid #1e2d44;
  background: transparent;
  color: #8892a4;
  font-size: 12.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 130ms;
}
.cv-page-btn:hover:not(:disabled) { background: #1e2d44; color: #e2e8f0; }
.cv-page-btn:disabled { opacity: 0.35; cursor: default; }

/* ── Detail drawer ── */
.cv-drawer-backdrop {
  position: fixed; inset: 0;
  z-index: 800;
  display: flex; justify-content: flex-end;
}
.cv-drawer {
  width: 380px;
  max-width: 100vw;
  height: 100vh;
  background: #111827;
  border-left: 1px solid #1e2d44;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: -8px 0 40px rgba(0,0,0,0.5);
}

.cv-drawer-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 18px;
  border-bottom: 1px solid #1e2d44;
  flex-shrink: 0;
}
.cv-drawer-avatar {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(201,168,76,0.12);
  border: 1px solid rgba(201,168,76,0.25);
  color: #C9A84C;
  font-size: 15px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cv-drawer-info { flex: 1; min-width: 0; }
.cv-drawer-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cv-drawer-phone {
  display: block;
  font-size: 12.5px;
  color: #4f617a;
  font-family: 'JetBrains Mono', 'Fira Mono', monospace;
  margin-top: 2px;
}
.cv-drawer-close {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid #1e2d44;
  background: transparent;
  color: #4f617a;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 130ms;
}
.cv-drawer-close:hover { background: #1e2d44; color: #e2e8f0; }

.cv-drawer-stats {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #1e2d44;
}
.cv-dstat {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-right: 1px solid #1e2d44;
}
.cv-dstat:last-child { border-right: none; }
.cv-dstat-val { font-size: 18px; font-weight: 700; color: #e2e8f0; }
.cv-dstat-key { font-size: 10.5px; color: #4f617a; text-transform: uppercase; letter-spacing: 0.7px; }

.cv-drawer-section-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #4f617a;
  padding: 16px 20px 8px;
}
.cv-drawer-loading { display: flex; justify-content: center; padding: 24px; }
.cv-drawer-empty { font-size: 13px; color: #4f617a; padding: 0 20px; }

.cv-history-list { list-style: none; margin: 0; padding: 0 20px 24px; display: flex; flex-direction: column; gap: 0; }
.cv-history-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #1a2236;
}
.cv-history-item:last-child { border-bottom: none; }
.cv-history-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #C9A84C;
  margin-top: 5px;
  flex-shrink: 0;
}
.cv-history-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.cv-history-name { font-size: 13.5px; font-weight: 500; color: #e2e8f0; }
.cv-history-meta { display: flex; align-items: center; gap: 8px; }
.cv-history-type {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: capitalize;
  color: #8892a4;
  background: rgba(255,255,255,0.06);
  border: 1px solid #1e2d44;
  border-radius: 6px;
  padding: 1px 7px;
}
.cv-history-status { font-size: 11px; color: #4f617a; }
.cv-status--green { color: #34d399; }
.cv-status--dim   { color: #4f617a; }
.cv-history-amounts {
  display: flex;
  gap: 12px;
  font-size: 11.5px;
  color: #8892a4;
}
.cv-history-amounts span { white-space: nowrap; }
.cv-history-date  { font-size: 11.5px; color: #4f617a; }

/* ── Transitions ── */
.cv-slide-enter-active, .cv-slide-leave-active { transition: opacity 200ms; }
.cv-slide-enter-active .cv-drawer, .cv-slide-leave-active .cv-drawer { transition: transform 220ms cubic-bezier(.4,0,.2,1); }
.cv-slide-enter-from .cv-drawer, .cv-slide-leave-to .cv-drawer { transform: translateX(100%); }
.cv-slide-enter-from, .cv-slide-leave-to { opacity: 0; }
</style>
