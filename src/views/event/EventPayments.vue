<template>
  <div class="ep-root">

    <!-- ── Stat cards ── -->
    <div class="ep-stats" v-if="!loading || transactions.length">
      <!-- Total Charged -->
      <div class="ep-stat-card">
        <div class="ep-stat-icon ep-stat-icon--gold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="ep-stat-body">
          <span class="ep-stat-lbl">Total Charged</span>
          <span class="ep-stat-val ep-stat-val--money">TZS {{ formatMoney(Math.abs(totalAmount)) }}</span>
        </div>
      </div>
      <!-- Transactions -->
      <div class="ep-stat-card">
        <div class="ep-stat-icon ep-stat-icon--purple">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <div class="ep-stat-body">
          <span class="ep-stat-lbl">{{ searchQ ? 'Matching' : 'Total' }} Transactions</span>
          <span class="ep-stat-val">{{ filtered.length }}</span>
        </div>
      </div>
      <!-- Debits (negative amounts = charges) -->
      <div class="ep-stat-card">
        <div class="ep-stat-icon ep-stat-icon--teal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="ep-stat-body">
          <span class="ep-stat-lbl">Debits</span>
          <span class="ep-stat-val">{{ transactions.filter(t => (t.amount ?? 0) < 0).length }}</span>
        </div>
      </div>
      <!-- Latest Activity -->
      <div class="ep-stat-card">
        <div class="ep-stat-icon ep-stat-icon--blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="ep-stat-body">
          <span class="ep-stat-lbl">Latest Activity</span>
          <span class="ep-stat-val ep-stat-val--date">{{ latestDate }}</span>
        </div>
      </div>
    </div>

    <!-- ── Panel ── -->
    <div class="ep-panel">

      <!-- Panel header -->
      <div class="ep-panel-hd">
        <h2 class="ep-panel-title">Payments</h2>
        <div class="ep-panel-acts">
          <!-- Search -->
          <div class="ep-search-wrap">
            <svg class="ep-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="searchQ" class="ep-search" placeholder="Search transactions…" />
            <button v-if="searchQ" class="ep-search-clear" @click="searchQ = ''">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="ep-list">
        <div v-for="i in 6" :key="i" class="ep-card ep-card--sk">
          <div class="ep-sk-circle"></div>
          <div class="ep-card-info">
            <div class="ep-sk-bar ep-sk-bar--lg"></div>
            <div class="ep-sk-bar ep-sk-bar--sm" style="margin-top:6px"></div>
          </div>
          <div class="ep-sk-bar ep-sk-bar--sm" style="width:70px"></div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="loadError" class="ep-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fc8181" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="ep-empty-title">Something went wrong</p>
        <p class="ep-empty-sub">{{ loadError }}</p>
      </div>

      <!-- Card list -->
      <div v-else class="ep-list">

        <!-- Empty state -->
        <div v-if="!filtered.length" class="ep-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p class="ep-empty-title">{{ searchQ ? 'No matching transactions' : 'No transactions yet' }}</p>
          <p class="ep-empty-sub">{{ searchQ ? 'Try a different search term' : 'Platform charges will appear here' }}</p>
        </div>

        <!-- Transaction cards -->
        <div
          v-for="(trn, i) in paginated"
          :key="trn.id"
          class="ep-card"
          :class="`ep-card--${statusClass(trn)}`"
        >
          <!-- Icon -->
          <div class="ep-card-icon-wrap">
            <div class="ep-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
          </div>

          <!-- Identity -->
          <div class="ep-card-info">
            <span class="ep-card-name">{{ trn.reason }}</span>
            <span class="ep-card-meta">{{ trn.eventId ?? '—' }}</span>
          </div>

          <!-- Amount -->
          <span class="ep-card-amount" :class="{ 'ep-card-amount--neg': (trn.amount ?? 0) < 0 }">
            TZS {{ formatMoney(trn.amount) }}
          </span>

          <!-- Badges + date -->
          <div class="ep-card-badges">
            <span class="ep-badge" :class="`ep-badge--${statusClass(trn)}`">
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill="currentColor"/></svg>
              {{ statusLabel(trn) }}
            </span>
            <span class="ep-card-date">{{ formatDate(trn.createdAt) }}</span>
          </div>
        </div>

      </div>

      <!-- Footer: range + paginator -->
      <div class="ep-table-footer" v-if="!loading && !loadError">
        <span class="ep-range-label">
          {{ filtered.length ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)}` : '0' }}
          of {{ filtered.length }}
        </span>
        <div class="ep-paginator" :class="{ 'ep-paginator--disabled': totalPages <= 1 }">
          <button class="ep-page-btn ep-page-btn--nav"
            :disabled="currentPage === 1 || totalPages <= 1" @click="goToPage(currentPage - 1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <template v-for="p in pageNumbers" :key="String(p)">
            <span v-if="p === '…'" class="ep-page-ellipsis">…</span>
            <button v-else class="ep-page-btn"
              :class="{ 'ep-page-btn--active': currentPage === p }"
              :disabled="totalPages <= 1"
              @click="goToPage(p)">{{ p }}</button>
          </template>
          <button class="ep-page-btn ep-page-btn--nav"
            :disabled="currentPage === totalPages || totalPages <= 1" @click="goToPage(currentPage + 1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

    </div><!-- /ep-panel -->

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db, auth } from '../../firebase'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const route = useRoute()

const PAGE_SIZE = 20

const loading   = ref(true)
const loadError = ref('')
const transactions = ref([])
const searchQ   = ref('')
const sortDesc  = ref(true)
const currentPage = ref(1)

// ── Helpers ────────────────────────────────────────────────────────────────

function toMs(val) {
  if (!val) return 0
  if (typeof val.toDate === 'function') return val.toDate().getTime()
  const d = new Date(val)
  return isNaN(d) ? 0 : d.getTime()
}

function formatMoney(n) {
  if (n == null) return '0'
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatDate(val) {
  if (!val) return '—'
  const d = typeof val.toDate === 'function' ? val.toDate() : new Date(val)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusClass(trn) {
  const amt = trn.amount ?? 0
  if (amt < 0) return 'completed'
  if (trn.status === 'pending') return 'pending'
  if (trn.status === 'failed') return 'failed'
  if (trn.status === 'refunded') return 'refunded'
  return 'completed'
}

function statusLabel(trn) {
  const cls = statusClass(trn)
  return cls.charAt(0).toUpperCase() + cls.slice(1)
}

// ── Computed ───────────────────────────────────────────────────────────────

const sorted = computed(() => {
  const list = [...transactions.value]
  list.sort((a, b) => sortDesc.value ? toMs(b.createdAt) - toMs(a.createdAt) : toMs(a.createdAt) - toMs(b.createdAt))
  return list
})

const filtered = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  if (!q) return sorted.value
  return sorted.value.filter(t =>
    (t.reason ?? '').toLowerCase().includes(q) ||
    (t.eventId ?? '').toLowerCase().includes(q)
  )
})

const totalAmount = computed(() => transactions.value.reduce((s, t) => s + (t.amount ?? 0), 0))

const latestDate = computed(() => {
  if (!transactions.value.length) return '—'
  const ms = Math.max(...transactions.value.map(t => toMs(t.createdAt)))
  return formatDate(new Date(ms))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (cur > 3) pages.push('…')
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cur < total - 2) pages.push('…')
  if (total > 1) pages.push(total)
  return pages
})

function goToPage(n) {
  if (n < 1 || n > totalPages.value) return
  currentPage.value = n
}

function toggleSort() { sortDesc.value = !sortDesc.value; currentPage.value = 1 }

// ── Data ───────────────────────────────────────────────────────────────────

async function load(uid) {
  loading.value = true
  loadError.value = ''
  try {
    const q = query(
      collection(db, 'userTransactions'),
      where('authorId', '==', uid),
      limit(200),
    )
    const snap = await getDocs(q)
    transactions.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('EventPayments:', e)
    loadError.value = e.message ?? 'Failed to load transactions'
  } finally {
    loading.value = false
  }
}

watch(searchQ, () => { currentPage.value = 1 })

onMounted(() => {
  if (auth.currentUser) {
    load(auth.currentUser.uid)
  } else {
    const unsub = onAuthStateChanged(auth, user => {
      unsub()
      if (user) load(user.uid)
      else loading.value = false
    })
  }
})
</script>

<style scoped>
.ep-root {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Stat cards ── */
.ep-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ep-stat-card {
  background: #111111; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 20px 20px 18px; display: flex; align-items: flex-start; gap: 16px;
}
.ep-stat-icon {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0; margin-top: 2px;
  display: flex; align-items: center; justify-content: center;
}
.ep-stat-icon--gold   { background: rgba(201,168,76,0.08);  color: #C9A84C; }
.ep-stat-icon--purple { background: rgba(167,139,250,0.08); color: #a78bfa; }
.ep-stat-icon--teal   { background: rgba(45,212,191,0.08);  color: #2dd4bf; }
.ep-stat-icon--blue   { background: rgba(96,165,250,0.08);  color: #60a5fa; }
.ep-stat-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.ep-stat-lbl  { font-size: 11px; color: #777; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-stat-val  { font-size: 32px; font-weight: 700; color: #f0f0ec; line-height: 1; letter-spacing: -0.5px; white-space: nowrap; }
.ep-stat-val--money { font-size: 22px; }
.ep-stat-val--date  { font-size: 20px; }

/* ── Panel ── */
.ep-panel {
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
}
.ep-panel-hd {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #1e1e1e;
  gap: 10px;
}
.ep-panel-title {
  font-size: 19px; font-weight: 700; color: #f0ece6; margin: 0;
  letter-spacing: -0.3px; white-space: nowrap;
}
.ep-panel-acts { display: flex; align-items: center; gap: 8px; margin-left: auto; }

/* Search */
.ep-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 180px;
  max-width: 300px;
}
.ep-search-icon { position: absolute; left: 10px; pointer-events: none; flex-shrink: 0; }
.ep-search {
  width: 100%; padding: 8px 32px;
  border: 1px solid #2a2a2a; border-radius: 10px;
  font-size: 13px; font-family: inherit; outline: none;
  background: #111; color: #f0f0ec;
  transition: border-color 150ms;
}
.ep-search:focus { border-color: #C9A84C; }
.ep-search::placeholder { color: #555; }
.ep-search-clear {
  position: absolute; right: 8px;
  background: none; border: none; cursor: pointer; color: #888; padding: 2px;
  display: flex; align-items: center; justify-content: center;
}
.ep-search-clear:hover { color: #f0f0ec; }

/* ── Card list ── */
.ep-list {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px 16px; background: #0d0d0d;
}

/* ── Card ── */
.ep-card {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 16px;
  background: #141414; border: 1px solid #202020; border-radius: 12px;
  transition: background 150ms, border-color 150ms, box-shadow 150ms;
}
.ep-card:hover:not(.ep-card--sk) { background: #191919; border-color: #2c2c2c; box-shadow: 0 4px 16px rgba(0,0,0,0.35); }
.ep-card--sk { pointer-events: none; }

/* Icon/Avatar zone */
.ep-card-icon-wrap { position: relative; flex-shrink: 0; }
.ep-card-icon {
  width: 40px; height: 40px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(201,168,76,0.12); color: #C9A84C;
}

/* Identity */
.ep-card-info { display: flex; flex-direction: column; gap: 3px; flex: 0 0 200px; min-width: 0; }
.ep-card-name { font-size: 13px; font-weight: 600; color: #e8e4dd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-card-meta { font-size: 11px; color: #505050; }

/* Amount */
.ep-card-amount { font-size: 15px; font-weight: 700; color: #C9A84C; white-space: nowrap; flex-shrink: 0; }
.ep-card-amount--neg { color: #C9A84C; }

/* Badges zone */
.ep-card-badges { flex: 1; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

/* Badge */
.ep-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
  border: 1px solid transparent;
}
.ep-badge--completed { background: rgba(48,209,88,0.10);   color: #1D7A38; border-color: rgba(48,209,88,0.20); }
.ep-badge--pending   { background: rgba(255,159,10,0.10);  color: #B36800; border-color: rgba(255,159,10,0.20); }
.ep-badge--failed    { background: rgba(255,69,58,0.10);   color: #C41E1E; border-color: rgba(255,69,58,0.20); }
.ep-badge--refunded  { background: rgba(99,179,237,0.10);  color: #0060A8; border-color: rgba(99,179,237,0.20); }
.ep-badge--default   { background: rgba(255,255,255,0.04); color: #555;    border-color: #222; }

/* Left border stripe */
.ep-card--completed { box-shadow: inset 3px 0 0 rgba(48,209,88,0.55); }
.ep-card--pending   { box-shadow: inset 3px 0 0 rgba(255,159,10,0.55); }
.ep-card--failed    { box-shadow: inset 3px 0 0 rgba(255,69,58,0.40); }
.ep-card--refunded  { box-shadow: inset 3px 0 0 rgba(99,179,237,0.40); }

/* Date */
.ep-card-date { font-size: 11px; color: #3a3a3a; white-space: nowrap; flex-shrink: 0; text-align: right; }

/* ── Footer + Paginator ── */
.ep-table-footer {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; background: #0d0d0d; border-top: 1px solid #1e1e1e;
  gap: 12px; flex-wrap: wrap;
}
.ep-range-label { font-size: 12px; color: #888; font-weight: 500; white-space: nowrap; }
.ep-paginator { display: flex; align-items: center; gap: 3px; }
.ep-paginator--disabled { opacity: 0.38; pointer-events: none; }
.ep-page-btn {
  min-width: 32px; height: 32px; padding: 0 6px;
  border: 1px solid #2a2a2a; border-radius: 8px; background: #0d0d0d;
  font-size: 13px; font-weight: 500; color: #888; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 140ms; font-family: inherit;
}
.ep-page-btn:hover:not(:disabled):not(.ep-page-btn--active) {
  background: #1a2236; color: #f0f0ec;
}
.ep-page-btn--active {
  background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #f0f0ec;
  font-weight: 600; cursor: default;
}
.ep-page-btn--nav { color: #888; }
.ep-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ep-page-ellipsis {
  min-width: 28px; height: 32px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #555; letter-spacing: 1px;
}

/* ── Skeleton ── */
@keyframes ep-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.ep-sk-circle { width: 40px; height: 40px; border-radius: 11px; background: #2a2a2a; flex-shrink: 0; animation: ep-pulse 1.4s ease-in-out infinite; }
.ep-sk-bar    { height: 12px; border-radius: 6px; background: #2a2a2a; animation: ep-pulse 1.4s ease-in-out infinite; }
.ep-sk-bar--lg { width: 140px; }
.ep-sk-bar--sm { width: 80px; }

/* ── Empty ── */
.ep-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; gap: 8px;
}
.ep-empty-title { font-size: 14px; font-weight: 600; color: #888; margin: 4px 0 0; }
.ep-empty-sub   { font-size: 13px; color: #555; margin: 0; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .ep-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .ep-list { padding: 8px 10px; gap: 5px; }
  .ep-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas: "icon info amount" "icon badges badges";
    align-items: start; gap: 3px 12px; padding: 12px 14px;
  }
  .ep-card-icon-wrap { grid-area: icon; align-self: start; padding-top: 2px; }
  .ep-card-info      { grid-area: info; flex: unset; }
  .ep-card-amount    { grid-area: amount; align-self: start; padding-top: 2px; }
  .ep-card-badges    { grid-area: badges; justify-content: flex-start; flex: unset; margin-top: 6px; }
}
@media (max-width: 600px) {
  .ep-root  { padding: 12px 14px 20px; gap: 12px; }
  .ep-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; min-width: 0; }
  .ep-stat-card { min-width: 0; overflow: hidden; padding: 14px 14px 12px; gap: 12px; }
  .ep-stat-icon { width: 36px; height: 36px; flex-shrink: 0; }
  .ep-stat-val  { font-size: 24px; }
  .ep-stat-val--money { font-size: 18px; }
  .ep-stat-val--date  { font-size: 16px; }
  .ep-stat-body { gap: 6px; min-width: 0; }
  .ep-stat-lbl  { font-size: 10px; letter-spacing: 0; }
  .ep-search-wrap { min-width: 0; max-width: 100%; }
}
@media (max-width: 400px) { .ep-card-date { display: none; } }
</style>
