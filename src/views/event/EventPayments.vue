<template>
  <div class="ep-root">

    <!-- Stat cards -->
    <div class="ep-stats" v-if="!loading && !loadError">
      <div class="ep-stat-card">
        <div class="ep-stat-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="ep-stat-body">
          <span class="ep-stat-val">TZS {{ formatMoney(Math.abs(totalAmount)) }}</span>
          <span class="ep-stat-lbl">Total Charged</span>
        </div>
      </div>
      <div class="ep-stat-card">
        <div class="ep-stat-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="ep-stat-body">
          <span class="ep-stat-val">{{ filtered.length }}</span>
          <span class="ep-stat-lbl">{{ searchQ ? 'Matching' : 'Total' }} Transactions</span>
        </div>
      </div>
      <div class="ep-stat-card">
        <div class="ep-stat-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="ep-stat-body">
          <span class="ep-stat-val">{{ latestDate }}</span>
          <span class="ep-stat-lbl">Latest Activity</span>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="ep-toolbar">
      <div class="ep-search-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6B72" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="searchQ" class="ep-search" placeholder="Search transactions…" />
        <button v-if="searchQ" class="ep-search-clear" @click="searchQ = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <span class="ep-toolbar-count" v-if="!loading">{{ filtered.length }} record{{ filtered.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Loading -->
    <div class="ep-table-wrap" v-if="loading">
      <table class="ep-table">
        <thead><tr>
          <th class="ep-th">#</th>
          <th class="ep-th">Description</th>
          <th class="ep-th">Event</th>
          <th class="ep-th ep-th--right">Amount (TZS)</th>
          <th class="ep-th ep-th--right">Date</th>
        </tr></thead>
        <tbody>
          <tr v-for="i in 6" :key="i" class="ep-tr"><td colspan="5"><div class="ep-skel"></div></td></tr>
        </tbody>
      </table>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="ep-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e55" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p class="ep-empty-title">Something went wrong</p>
      <p class="ep-empty-sub">{{ loadError }}</p>
    </div>

    <!-- Table -->
    <div v-else class="ep-table-wrap">
      <table class="ep-table">
        <thead>
          <tr>
            <th class="ep-th ep-th--num">#</th>
            <th class="ep-th">Description</th>
            <th class="ep-th">Event ID</th>
            <th class="ep-th ep-th--right">Amount (TZS)</th>
            <th class="ep-th ep-th--right ep-th--sortable" @click="toggleSort">
              Date
              <svg class="ep-sort-icon" :class="{ 'ep-sort-icon--desc': sortDesc }"
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filtered.length">
            <td colspan="5">
              <div class="ep-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p class="ep-empty-title">{{ searchQ ? 'No matching transactions' : 'No transactions yet' }}</p>
                <p class="ep-empty-sub">{{ searchQ ? 'Try a different search term' : 'Platform charges will appear here' }}</p>
              </div>
            </td>
          </tr>
          <tr v-for="(trn, i) in paginated" :key="trn.id" class="ep-tr">
            <td class="ep-td ep-td--num">{{ (currentPage - 1) * PAGE_SIZE + i + 1 }}</td>
            <td class="ep-td">
              <div class="ep-desc-cell">
                <div class="ep-receipt-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <span class="ep-reason">{{ trn.reason }}</span>
              </div>
            </td>
            <td class="ep-td ep-td--mono">{{ trn.eventId ?? '—' }}</td>
            <td class="ep-td ep-td--right">
              <span class="ep-amount" :class="{ 'ep-amount--neg': (trn.amount ?? 0) < 0 }">
                {{ formatMoney(trn.amount) }}
              </span>
            </td>
            <td class="ep-td ep-td--right ep-td--date">{{ formatDate(trn.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Footer: range + paginator -->
      <div class="ep-table-footer">
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
    </div>

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
.ep-root { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; background: #0a0e1c; }

/* ── Stat cards ── */
.ep-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.ep-stat-card {
  background: #111827; border: 1px solid #1e2d44; border-radius: 12px;
  padding: 16px 18px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
.ep-stat-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  background: rgba(201,168,76,0.1); color: #C9A84C;
  display: flex; align-items: center; justify-content: center;
}
.ep-stat-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ep-stat-val  { font-size: 17px; font-weight: 700; color: #e2e8f0; }
.ep-stat-lbl  { font-size: 11px; color: #8892a4; font-weight: 500; }

/* ── Toolbar ── */
.ep-toolbar { display: flex; align-items: center; gap: 12px; }
.ep-search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #0f1729; border: 1px solid #2a3a52; border-radius: 10px;
  padding: 0 12px; height: 36px; flex: 1; max-width: 360px;
  transition: border-color 150ms;
}
.ep-search-wrap:focus-within { border-color: #C9A84C; background: #0f1729; }
.ep-search { flex: 1; border: none; outline: none; font-size: 13px; color: #e2e8f0; background: transparent; }
.ep-search::placeholder { color: #4f617a; }
.ep-search-clear { background: none; border: none; cursor: pointer; color: #4f617a; display: flex; align-items: center; padding: 0; }
.ep-search-clear:hover { color: #e2e8f0; }
.ep-toolbar-count { font-size: 12px; color: #8892a4; margin-left: auto; }

/* ── Table ── */
.ep-table-wrap { background: #111827; border: 1px solid #1e2d44; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
.ep-table { width: 100%; border-collapse: collapse; }

.ep-th {
  padding: 11px 16px; text-align: left;
  font-size: 11px; font-weight: 700; color: #8892a4; letter-spacing: 0.4px; text-transform: uppercase;
  background: #0f1729; border-bottom: 1px solid #1e2d44; white-space: nowrap;
}
.ep-th--right  { text-align: right; }
.ep-th--num    { width: 48px; color: #4f617a; }
.ep-th--sortable { cursor: pointer; user-select: none; }
.ep-th--sortable:hover { color: #e2e8f0; }

.ep-sort-icon { margin-left: 4px; vertical-align: middle; transition: transform 0.15s; }
.ep-sort-icon--desc { transform: rotate(180deg); }

.ep-tr { border-bottom: 1px solid #1e2d44; transition: background 0.1s; }
.ep-tr:last-child { border-bottom: none; }
.ep-tr:hover { background: #1a2236; }

.ep-td { padding: 13px 16px; font-size: 13px; color: #e2e8f0; vertical-align: middle; }
.ep-td--num    { color: #4f617a; font-size: 12px; text-align: center; width: 48px; }
.ep-td--right  { text-align: right; }
.ep-td--date   { color: #8892a4; white-space: nowrap; }
.ep-td--mono   { font-family: monospace; font-size: 11px; color: #4f617a; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ep-desc-cell  { display: flex; align-items: center; gap: 10px; }
.ep-receipt-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: rgba(201,168,76,0.08); color: #C9A84C;
  display: flex; align-items: center; justify-content: center;
}
.ep-reason { font-weight: 500; color: #e2e8f0; }

.ep-amount {
  font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #e2e8f0; }
.ep-amount--neg { color: #C9A84C; }

/* ── Footer + Paginator ── */
.ep-table-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-top: 1px solid #1e2d44;
  background: #111827; gap: 12px; flex-wrap: wrap; flex-shrink: 0;
}
.ep-range-label { font-size: 12px; color: #8892a4; font-weight: 500; white-space: nowrap; }
.ep-paginator { display: flex; align-items: center; gap: 3px; }
.ep-paginator--disabled { opacity: 0.38; pointer-events: none; }
.ep-page-btn {
  min-width: 32px; height: 32px; padding: 0 6px;
  border: 1px solid #1e2d44; border-radius: 8px; background: #111827;
  font-size: 13px; font-weight: 500; color: #8892a4; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 140ms; font-family: inherit;
}
.ep-page-btn:hover:not(:disabled):not(.ep-page-btn--active) {
  background: #1a2236; border-color: #2a3a52; color: #e2e8f0;
}
.ep-page-btn--active {
  background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #e2e8f0;
  font-weight: 600; cursor: default;
}
.ep-page-btn--nav { color: #8892a4; }
.ep-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ep-page-ellipsis {
  min-width: 28px; height: 32px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #4f617a; letter-spacing: 1px;
}

/* ── Skeleton ── */
.ep-skel {
  height: 20px; border-radius: 6px; background: #1e2d44; margin: 8px 16px;
  animation: ep-shimmer 1.4s ease-in-out infinite;
}
@keyframes ep-shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }

/* ── Empty ── */
.ep-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; gap: 8px;
}
.ep-empty-title { font-size: 14px; font-weight: 600; color: #8892a4; margin: 4px 0 0; }
.ep-empty-sub   { font-size: 13px; color: #4f617a; margin: 0; }
</style>