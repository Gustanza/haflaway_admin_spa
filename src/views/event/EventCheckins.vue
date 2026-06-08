<template>
  <div class="ec-root">

    <!-- ══ Toolbar ══ -->
    <div class="ec-toolbar">
      <div class="ec-toolbar-left">
        <!-- Search -->
        <div class="ec-search-wrap">
          <svg class="ec-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#6B6B72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQ" class="ec-search" placeholder="Search by name or phone…" />
          <button v-if="searchQ" class="ec-search-clear" @click="searchQ = ''">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Status filter chips -->
        <div class="ec-filter-chips">
          <button v-for="f in STATUS_FILTERS" :key="f.val"
            class="ec-chip" :class="{ 'ec-chip--active': statusFilter === f.val }"
            @click="statusFilter = f.val; currentPage = 1">
            {{ f.label }}
            <span class="ec-chip-cnt">{{ statusCount(f.val) }}</span>
          </button>
        </div>

        <!-- Checkpoint filter -->
        <div v-if="checkpoints.length > 0" class="ec-cp-wrap" v-click-outside="() => showCpMenu = false">
          <button class="ec-cp-btn" :class="{ 'ec-cp-btn--active': cpFilter !== null }" @click="showCpMenu = !showCpMenu">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {{ cpFilter !== null ? (checkpoints.find(c => c.id === cpFilter)?.name ?? 'Checkpoint') : 'All Checkpoints' }}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="showCpMenu" class="ec-cp-menu">
            <button class="ec-cp-item" :class="{ 'ec-cp-item--on': cpFilter === null }"
              @click="cpFilter = null; showCpMenu = false; currentPage = 1">
              All Checkpoints
            </button>
            <button v-for="cp in checkpoints" :key="cp.id"
              class="ec-cp-item" :class="{ 'ec-cp-item--on': cpFilter === cp.id }"
              @click="cpFilter = cp.id; showCpMenu = false; currentPage = 1">
              {{ cp.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="ec-toolbar-right">
        <button class="ec-refresh-btn" @click="loadData" :disabled="loading"
          :title="loading ? 'Loading…' : 'Refresh'">
          <svg :class="{ 'ec-spin': loading }" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ══ Stats Bar ══ -->
    <div class="ec-stats-bar">
      <div class="ec-stat">
        <span class="ec-stat-n">{{ checkinStats.total }}</span>
        <span class="ec-stat-lbl">Total</span>
      </div>
      <div class="ec-stat-sep"/>
      <div class="ec-stat ec-stat--link" :class="{ 'ec-stat--active': statusFilter === 'checked' }"
        @click="statusFilter = statusFilter === 'checked' ? 'all' : 'checked'; currentPage = 1">
        <span class="ec-stat-n" style="color:#30D158">{{ checkinStats.checked }}</span>
        <span class="ec-stat-lbl">Checked In</span>
      </div>
      <div class="ec-stat-sep"/>
      <div class="ec-stat ec-stat--link" :class="{ 'ec-stat--active': statusFilter === 'partial' }"
        @click="statusFilter = statusFilter === 'partial' ? 'all' : 'partial'; currentPage = 1">
        <span class="ec-stat-n" style="color:#FF9F0A">{{ checkinStats.partial }}</span>
        <span class="ec-stat-lbl">Partial</span>
      </div>
      <div class="ec-stat-sep"/>
      <div class="ec-stat ec-stat--link" :class="{ 'ec-stat--active': statusFilter === 'none' }"
        @click="statusFilter = statusFilter === 'none' ? 'all' : 'none'; currentPage = 1">
        <span class="ec-stat-n" style="color:#6B6B72">{{ checkinStats.none }}</span>
        <span class="ec-stat-lbl">Not Checked</span>
      </div>
      <div class="ec-stat-sep"/>
      <div class="ec-stat">
        <span class="ec-stat-n ec-stat-n--gold">
          {{ checkinStats.total ? Math.round((checkinStats.checked / checkinStats.total) * 100) : 0 }}%
        </span>
        <span class="ec-stat-lbl">Rate</span>
      </div>
    </div>

    <!-- ══ Table ══ -->
    <div class="ec-table-wrap">
      <div class="ec-table-scroll">
        <table class="ec-table">
          <thead>
            <tr>
              <th class="ec-th ec-th-name ec-th--sortable" @click="toggleSort('name')">
                <span>Name</span>
                <svg class="ec-sort-ico"
                  :class="{ 'ec-sort-ico--active': sortKey === 'name', 'ec-sort-ico--desc': sortKey === 'name' && sortDir === 'desc' }"
                  width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
              </th>
              <th class="ec-th">Phone</th>
              <th class="ec-th">Type</th>
              <th class="ec-th ec-th--sortable" @click="toggleSort('status')">
                <span>Status</span>
                <svg class="ec-sort-ico"
                  :class="{ 'ec-sort-ico--active': sortKey === 'status', 'ec-sort-ico--desc': sortKey === 'status' && sortDir === 'desc' }"
                  width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
              </th>
              <th class="ec-th">Slots</th>
              <th class="ec-th ec-th--sortable" @click="toggleSort('date')">
                <span>Added</span>
                <svg class="ec-sort-ico"
                  :class="{ 'ec-sort-ico--active': sortKey === 'date', 'ec-sort-ico--desc': sortKey === 'date' && sortDir === 'desc' }"
                  width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="ec-td-empty">
                <svg class="ec-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#B8924D" stroke-width="2.2" stroke-linecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Loading…
              </td>
            </tr>
            <tr v-else-if="!pagedList.length">
              <td colspan="6" class="ec-td-empty">No attendees found</td>
            </tr>
            <tr v-for="att in pagedList" :key="att.id"
              class="ec-row" @click="openDetail(att)">

              <!-- Name + avatar -->
              <td class="ec-td ec-td-name">
                <div class="ec-name-cell">
                  <div class="ec-avatar"
                    :style="{ background: avatarBg(att.fullName), color: avatarColor(att.fullName) }">
                    {{ initials(att.fullName) }}
                  </div>
                  <span class="ec-name">{{ att.fullName }}</span>
                </div>
              </td>

              <!-- Phone -->
              <td class="ec-td ec-td-mono">{{ att.phone || '—' }}</td>

              <!-- Type badge -->
              <td class="ec-td">
                <span class="ec-type-badge" :class="`ec-type--${getKardType(att)}`">
                  {{ typeLabels[getKardType(att)] }}
                </span>
              </td>

              <!-- Status badge -->
              <td class="ec-td">
                <span class="ec-sb" :class="`ec-sb--${statusOf(att)}`">
                  <span class="ec-sb-dot"/>
                  {{ statusLabel(att) }}
                </span>
              </td>

              <!-- Slots fraction -->
              <td class="ec-td ec-td-slots">
                <span v-if="(att.checkinStatus ?? []).length">
                  <span class="ec-slots-checked">{{ checkedSlots(att) }}</span>
                  <span class="ec-slots-sep">/</span>
                  <span class="ec-slots-total">{{ att.checkinStatus.length }}</span>
                </span>
                <span v-else class="ec-slots-na">—</span>
              </td>

              <!-- Added date -->
              <td class="ec-td ec-td-date">{{ formatDate(att.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Paginator ── -->
      <div class="ec-table-footer">
        <span class="ec-range-lbl">
          {{ filteredList.length
              ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredList.length)}`
              : '0'
          }} of {{ filteredList.length }}
          <template v-if="statusFilter !== 'all'">
            ·
            <button class="ec-filter-clear" @click="statusFilter = 'all'; currentPage = 1">
              {{ STATUS_FILTERS.find(f => f.val === statusFilter)?.label }} ×
            </button>
          </template>
        </span>
        <div class="ec-paginator" :class="{ 'ec-paginator--disabled': totalPages <= 1 }">
          <!-- Prev -->
          <button class="ec-page-btn ec-page-btn--nav"
            :disabled="currentPage === 1 || totalPages <= 1" @click="goToPage(currentPage - 1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <!-- Page numbers -->
          <template v-for="p in pageNumbers" :key="String(p)">
            <span v-if="p === '…'" class="ec-page-ellipsis">…</span>
            <button v-else class="ec-page-btn"
              :class="{ 'ec-page-btn--active': currentPage === p }"
              :disabled="totalPages <= 1"
              @click="goToPage(p)">
              {{ p }}
            </button>
          </template>
          <!-- Next -->
          <button class="ec-page-btn ec-page-btn--nav"
            :disabled="currentPage === totalPages || totalPages <= 1" @click="goToPage(currentPage + 1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ══ Detail Drawer ══ -->
    <Teleport to="body">
      <Transition name="ec-fade">
        <div v-if="selectedAtt" class="ec-overlay" @click.self="closeDetail">
          <Transition name="ec-slide">
            <div class="ec-drawer" v-if="selectedAtt">

              <!-- Header -->
              <div class="ec-drawer-header">
                <button class="ec-drawer-back" @click="closeDetail">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Close
                </button>
                <span class="ec-sb" :class="`ec-sb--${statusOf(selectedAtt)}`" style="font-size:11px">
                  <span class="ec-sb-dot"/>{{ statusLabel(selectedAtt) }}
                </span>
              </div>

              <!-- Hero -->
              <div class="ec-drawer-hero">
                <div class="ec-drawer-avatar"
                  :style="{ background: avatarBg(selectedAtt.fullName), color: avatarColor(selectedAtt.fullName) }">
                  {{ initials(selectedAtt.fullName) }}
                </div>
                <p class="ec-drawer-name">{{ selectedAtt.fullName }}</p>
                <p class="ec-drawer-phone">{{ selectedAtt.phone || '—' }}</p>
                <span class="ec-type-badge" :class="`ec-type--${getKardType(selectedAtt)}`">
                  {{ typeLabels[getKardType(selectedAtt)] }}
                </span>
              </div>

              <!-- Body -->
              <div class="ec-drawer-body">

                <!-- No card assigned -->
                <div v-if="!(selectedAtt.checkinStatus ?? []).length" class="ec-drawer-block">
                  <p class="ec-block-lbl">Check-in Status</p>
                  <div class="ec-no-card">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C0BAB2"
                      stroke-width="1.5" stroke-linecap="round">
                      <rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <p>No card assigned.<br>This attendee cannot be checked in.</p>
                  </div>
                </div>

                <!-- Slot rows -->
                <div v-else class="ec-drawer-block">
                  <div class="ec-block-lbl-row">
                    <p class="ec-block-lbl">Check-in Status</p>
                    <span class="ec-slots-summary">
                      {{ checkedSlots(selectedAtt) }}/{{ selectedAtt.checkinStatus.length }} slots
                    </span>
                  </div>

                  <div v-for="(slot, si) in selectedAtt.checkinStatus" :key="si" class="ec-slot">
                    <div class="ec-slot-head">
                      <span class="ec-slot-name">{{ slot.attendee_name || `Slot ${si + 1}` }}</span>
                      <span class="ec-slot-badge"
                        :class="isSlotChecked(slot) ? 'ec-slot-badge--on' : 'ec-slot-badge--off'">
                        {{ isSlotChecked(slot) ? 'Checked In' : 'Not Checked' }}
                      </span>
                    </div>

                    <!-- Checkpoint toggles -->
                    <div class="ec-cp-toggles">
                      <template v-if="checkpoints.length">
                        <button v-for="cp in checkpoints" :key="cp.id"
                          class="ec-cp-toggle"
                          :class="slot.checkpoints?.[cp.id] ? 'ec-cp-toggle--on' : 'ec-cp-toggle--off'"
                          :disabled="togglingKey === `${selectedAtt.id}-${si}-${cp.id}`"
                          @click="toggleSlot(selectedAtt, si, cp.id)">
                          <svg v-if="slot.checkpoints?.[cp.id]" width="11" height="11" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <circle cx="12" cy="12" r="9"/>
                          </svg>
                          {{ cp.name }}
                        </button>
                      </template>
                      <!-- Fallback: no checkpoints in DB — use generic toggle -->
                      <template v-else>
                        <button class="ec-cp-toggle"
                          :class="hasAnyCheckin(slot) ? 'ec-cp-toggle--on' : 'ec-cp-toggle--off'"
                          :disabled="togglingKey === `${selectedAtt.id}-${si}-default`"
                          @click="toggleSlotGeneric(selectedAtt, si)">
                          <svg v-if="hasAnyCheckin(slot)" width="11" height="11" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <circle cx="12" cy="12" r="9"/>
                          </svg>
                          Check In
                        </button>
                      </template>
                    </div>
                  </div>
                </div>

                <p class="ec-drawer-added">Added {{ formatDate(selectedAtt.createdAt) }}</p>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../../firebase'
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore'

const props = defineProps({ event: Object, eventId: String })
const route  = useRoute()
const eventId = computed(() => props.eventId ?? route.params.eventId)

// ── Custom directive ───────────────────────────────────────────────────────────
const vClickOutside = {
  mounted(el, binding) {
    el._co = e => { if (!el.contains(e.target)) binding.value(e) }
    document.addEventListener('mousedown', el._co)
  },
  unmounted(el) { document.removeEventListener('mousedown', el._co) },
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 25

const STATUS_FILTERS = [
  { val: 'all',     label: 'All'         },
  { val: 'checked', label: 'Checked In'  },
  { val: 'partial', label: 'Partial'     },
  { val: 'none',    label: 'Not Checked' },
]

const typeLabels = { invitation: 'Invitation', contribution: 'Contribution', contact: 'Contact' }

// ── State ─────────────────────────────────────────────────────────────────────
const attendees   = ref([])
const checkpoints = ref([])
const loading     = ref(false)

const searchQ      = ref('')
const statusFilter = ref('all')
const cpFilter     = ref(null)
const showCpMenu   = ref(false)
const sortKey      = ref('name')
const sortDir      = ref('asc')
const currentPage  = ref(1)

const selectedAtt = ref(null)
const togglingKey = ref(null)

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadData() {
  if (!eventId.value) return
  loading.value = true
  try {
    const [attSnap, cpSnap] = await Promise.all([
      getDocs(query(collection(db, 'events', eventId.value, 'attendees'), orderBy('fullNameLower'))),
      getDocs(collection(db, 'events', eventId.value, 'checkpoints')),
    ])
    attendees.value   = attSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    checkpoints.value = cpSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to load checkins data', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// ── Helpers ───────────────────────────────────────────────────────────────────
function getKardType(att) {
  const c = att.cards ?? {}
  if (c.invitation   != null) return 'invitation'
  if (c.contribution != null) return 'contribution'
  return 'contact'
}

function isSlotChecked(slot) {
  return Object.values(slot.checkpoints ?? {}).some(v => v === true)
}

function hasAnyCheckin(slot) {
  return isSlotChecked(slot)
}

function checkedSlots(att) {
  return (att.checkinStatus ?? []).filter(isSlotChecked).length
}

function statusOf(att) {
  const slots = att.checkinStatus ?? []
  if (!slots.length) return 'nocard'
  const checkedCount = slots.filter(s => {
    if (cpFilter.value) return s.checkpoints?.[cpFilter.value] === true
    return isSlotChecked(s)
  }).length
  if (checkedCount === 0)           return 'none'
  if (checkedCount === slots.length) return 'checked'
  return 'partial'
}

function statusLabel(att) {
  const s = statusOf(att)
  if (s === 'nocard')  return 'No Card'
  if (s === 'checked') return 'Checked In'
  if (s === 'partial') return `${checkedSlots(att)}/${att.checkinStatus.length} Slots`
  return 'Not Checked'
}

function statusScore(att) {
  const s = statusOf(att)
  if (s === 'checked') return 0
  if (s === 'partial') return 1
  if (s === 'none')    return 2
  return 3
}

function toggleSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

function formatDate(ts) {
  if (!ts) return '—'
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  ['#D4E8C2','#3A6B1A'], ['#C2D8E8','#1A4B6B'], ['#E8D4C2','#6B3A1A'],
  ['#D4C2E8','#3A1A6B'], ['#E8C2D4','#6B1A3A'], ['#C2E8D4','#1A6B3A'],
  ['#E8E4C2','#6B5A1A'], ['#C2E8E8','#1A6B6B'],
]
function avatarBg(name)    { return AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length][0] }
function avatarColor(name) { return AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length][1] }

// ── Computed lists ────────────────────────────────────────────────────────────
const filteredList = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  let list = attendees.value

  if (q) {
    list = list.filter(a =>
      (a.fullNameLower ?? a.fullName?.toLowerCase() ?? '').includes(q) ||
      (a.phone ?? '').includes(q)
    )
  }

  if (statusFilter.value !== 'all') {
    list = list.filter(a => statusOf(a) === statusFilter.value)
  }

  if (cpFilter.value) {
    list = list.filter(a =>
      (a.checkinStatus ?? []).some(s => s.checkpoints?.[cpFilter.value] === true)
    )
  }

  return [...list].sort((a, b) => {
    let cmp = 0
    if (sortKey.value === 'name')   cmp = (a.fullNameLower ?? '').localeCompare(b.fullNameLower ?? '')
    if (sortKey.value === 'status') cmp = statusScore(a) - statusScore(b)
    if (sortKey.value === 'date')   cmp = (a.createdAt ?? '') < (b.createdAt ?? '') ? -1 : 1
    return sortDir.value === 'desc' ? -cmp : cmp
  })
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / PAGE_SIZE) || 1)

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredList.value.slice(start, start + PAGE_SIZE)
})

const checkinStats = computed(() => {
  const list = attendees.value
  return {
    total:   list.length,
    checked: list.filter(a => statusOf(a) === 'checked').length,
    partial: list.filter(a => statusOf(a) === 'partial').length,
    none:    list.filter(a => statusOf(a) === 'none').length,
  }
})

function statusCount(val) {
  if (val === 'all')     return attendees.value.length
  if (val === 'checked') return checkinStats.value.checked
  if (val === 'partial') return checkinStats.value.partial
  if (val === 'none')    return checkinStats.value.none
  return 0
}

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (cur > 3) pages.push('…')
  const start = Math.max(2, cur - 1)
  const end   = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cur < total - 2) pages.push('…')
  if (total > 1) pages.push(total)
  return pages
})

function goToPage(n) {
  if (n < 1 || n > totalPages.value) return
  currentPage.value = n
}

// ── Detail drawer ─────────────────────────────────────────────────────────────
function openDetail(att) { selectedAtt.value = att }
function closeDetail()   { selectedAtt.value = null }

// ── Toggle checkin ────────────────────────────────────────────────────────────
async function toggleSlot(att, slotIndex, checkpointId) {
  const key = `${att.id}-${slotIndex}-${checkpointId}`
  if (togglingKey.value === key) return
  togglingKey.value = key

  const updatedStatus = att.checkinStatus.map((slot, i) => {
    if (i !== slotIndex) return slot
    const current = slot.checkpoints?.[checkpointId] === true
    return {
      ...slot,
      checkpoints: { ...(slot.checkpoints ?? {}), [checkpointId]: !current },
    }
  })

  try {
    await updateDoc(doc(db, 'events', eventId.value, 'attendees', att.id), {
      checkinStatus: updatedStatus,
    })
    const updated = { ...att, checkinStatus: updatedStatus }
    selectedAtt.value = updated
    const idx = attendees.value.findIndex(a => a.id === att.id)
    if (idx !== -1) attendees.value[idx] = updated
  } catch (e) {
    console.error('Failed to toggle slot', e)
  } finally {
    togglingKey.value = null
  }
}

async function toggleSlotGeneric(att, slotIndex) {
  const current = hasAnyCheckin(att.checkinStatus[slotIndex])
  const updatedStatus = att.checkinStatus.map((slot, i) => {
    if (i !== slotIndex) return slot
    return { ...slot, checkpoints: { default: !current } }
  })
  const key = `${att.id}-${slotIndex}-default`
  if (togglingKey.value === key) return
  togglingKey.value = key
  try {
    await updateDoc(doc(db, 'events', eventId.value, 'attendees', att.id), {
      checkinStatus: updatedStatus,
    })
    const updated = { ...att, checkinStatus: updatedStatus }
    selectedAtt.value = updated
    const idx = attendees.value.findIndex(a => a.id === att.id)
    if (idx !== -1) attendees.value[idx] = updated
  } catch (e) {
    console.error('Failed to toggle slot', e)
  } finally {
    togglingKey.value = null
  }
}
</script>

<style scoped>
/* ══ Root layout ══ */
.ec-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px 24px;
  background: #0a0e1c;
}

/* ══ Toolbar ══ */
.ec-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 0;
}
.ec-toolbar-left  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.ec-toolbar-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

/* Search */
.ec-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
  max-width: 280px;
}
.ec-search-icon { position: absolute; left: 10px; pointer-events: none; flex-shrink: 0; }
.ec-search {
  width: 100%;
  padding: 8px 32px;
  border: 1px solid #2a3a52;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  background: #0f1729;
  color: #e2e8f0;
  transition: border-color 150ms, box-shadow 150ms;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.ec-search:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.10); background: #0f1729; }
.ec-search-clear {
  position: absolute; right: 8px;
  background: none; border: none; cursor: pointer; color: #8892a4; padding: 2px;
  display: flex; align-items: center; justify-content: center;
}
.ec-search-clear:hover { color: #e2e8f0; }

/* Filter chips */
.ec-filter-chips { display: flex; gap: 4px; }
.ec-chip {
  padding: 6px 12px; border-radius: 20px;
  border: 1px solid #1e2d44; background: #111827;
  font-size: 12px; font-weight: 500; color: #8892a4;
  cursor: pointer; transition: all 140ms; font-family: inherit;
}
.ec-chip:hover { background: #1a2236; color: #c8d4e0; }
.ec-chip--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #e2e8f0; font-weight: 600; }
.ec-chip-cnt {
  display: inline-flex; min-width: 18px; padding: 1px 5px;
  background: rgba(255,255,255,0.08); border-radius: 10px;
  font-size: 11px; font-weight: 600; color: #4f617a; margin-left: 5px;
}
.ec-chip--active .ec-chip-cnt { background: rgba(201,168,76,0.12); color: #C9A84C; }

/* Checkpoint dropdown */
.ec-cp-wrap { position: relative; }
.ec-cp-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 10px;
  border: 1px solid #1e2d44; background: #111827;
  font-size: 12px; font-weight: 500; color: #8892a4;
  cursor: pointer; transition: all 140ms; font-family: inherit;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.ec-cp-btn:hover { background: #1a2236; }
.ec-cp-btn--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #e2e8f0; }
.ec-cp-menu {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 100;
  background: #111827; border: 1px solid #1e2d44; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4); padding: 4px; min-width: 180px;
}
.ec-cp-item {
  display: block; width: 100%; text-align: left;
  padding: 8px 12px; border: none; background: none; border-radius: 7px;
  font-size: 13px; font-family: inherit; color: #e2e8f0; cursor: pointer; transition: background 130ms;
}
.ec-cp-item:hover { background: #1a2236; }
.ec-cp-item--on { color: #C9A84C; font-weight: 600; background: rgba(201,168,76,0.06); }

/* Refresh button */
.ec-refresh-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #1e2d44; background: #111827; color: #8892a4;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 140ms;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.ec-refresh-btn:hover:not(:disabled) { background: #1a2236; color: #e2e8f0; }
.ec-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ══ Stats Bar ══ */
.ec-stats-bar {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  padding: 0 16px;
  background: #111827;
  border: 1px solid #1e2d44;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  min-height: 56px;
}
.ec-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  gap: 2px;
  border-radius: 8px;
  transition: background 130ms;
}
.ec-stat--link { cursor: pointer; }
.ec-stat--link:hover { background: rgba(255,255,255,0.04); }
.ec-stat--active { background: rgba(201,168,76,0.06) !important; }
.ec-stat-n {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1;
}
.ec-stat-n--gold { color: #C9A84C; }
.ec-stat-lbl {
  font-size: 10px;
  font-weight: 600;
  color: #4f617a;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}
.ec-stat-sep {
  width: 0.8px;
  height: 28px;
  background: #1e2d44;
  flex-shrink: 0;
}

/* ══ Table ══ */
.ec-table-wrap {
  display: flex;
  flex-direction: column;
  background: #111827;
  border: 1px solid #1e2d44;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.ec-table-scroll { overflow-x: auto; }
.ec-table { width: 100%; border-collapse: collapse; table-layout: fixed; }

/* Header */
.ec-th {
  padding: 11px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #8892a4;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid #1e2d44;
  background: #0f1729;
  position: sticky;
  top: 0;
  z-index: 1;
  white-space: nowrap;
  user-select: none;
}
.ec-th-name  { width: 240px; }
.ec-th--sortable { cursor: pointer; }
.ec-th--sortable:hover { color: #e2e8f0; }

.ec-sort-ico {
  display: inline-block;
  margin-left: 4px;
  opacity: 0.3;
  transition: transform 200ms, opacity 200ms;
  vertical-align: middle;
}
.ec-sort-ico--active  { opacity: 0.9; }
.ec-sort-ico--desc    { transform: rotate(180deg); }

/* Rows */
.ec-row {
  cursor: pointer;
  transition: background 120ms;
  border-bottom: 1px solid #1e2d44;
}
.ec-row:nth-child(even) { background: rgba(255,255,255,0.02); }
.ec-row:nth-child(odd)  { background: transparent; }
.ec-row:hover           { background: #1a2236; }

.ec-td {
  padding: 12px 16px;
  font-size: 13px;
  color: #e2e8f0;
  vertical-align: middle;
  white-space: nowrap;
}
.ec-td-empty {
  padding: 48px 16px;
  text-align: center;
  color: #4f617a;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ec-td-mono  { font-variant-numeric: tabular-nums; color: #8892a4; font-size: 12px; }
.ec-td-date  { color: #8892a4; font-size: 12px; }

/* Name cell */
.ec-name-cell { display: flex; align-items: center; gap: 10px; }
.ec-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.ec-name { font-weight: 600; font-size: 13px; color: #e2e8f0; }

/* Type badge */
.ec-type-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.ec-type--invitation   { background: rgba(201,168,76,0.12); color: #C9A84C; }
.ec-type--contribution { background: rgba(52,211,153,0.12); color: #34d399; }
.ec-type--contact      { background: rgba(255,255,255,0.06); color: #8892a4; }

/* Status badge */
.ec-sb {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.ec-sb-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ec-sb--checked { background: rgba(52,211,153,0.12); color: #34d399; }
.ec-sb--checked .ec-sb-dot { background: #34d399; }
.ec-sb--partial { background: rgba(255,159,10,0.12); color: #f59e0b; }
.ec-sb--partial .ec-sb-dot { background: #FF9F0A; }
.ec-sb--none    { background: rgba(255,255,255,0.06); color: #8892a4; }
.ec-sb--none    .ec-sb-dot { background: #8892a4; }
.ec-sb--nocard  { background: rgba(255,255,255,0.04); color: #4f617a; }
.ec-sb--nocard  .ec-sb-dot { background: #4f617a; }

/* Slots fraction */
.ec-td-slots { font-variant-numeric: tabular-nums; }
.ec-slots-checked { font-weight: 700; color: #34d399; }
.ec-slots-sep     { color: #4f617a; margin: 0 2px; }
.ec-slots-total   { color: #8892a4; }
.ec-slots-na      { color: #4f617a; }

/* ══ Paginator ══ */
.ec-table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #1e2d44;
  background: #111827;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.ec-range-lbl {
  font-size: 12px;
  color: #8892a4;
  font-weight: 500;
  white-space: nowrap;
}
.ec-filter-clear {
  background: none; border: none; color: #C9A84C;
  font-size: 12px; font-family: inherit; cursor: pointer; padding: 0;
}
.ec-filter-clear:hover { text-decoration: underline; }
.ec-paginator { display: flex; align-items: center; gap: 3px; }
.ec-paginator--disabled { opacity: 0.38; pointer-events: none; }
.ec-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid #1e2d44;
  border-radius: 8px;
  background: #111827;
  font-size: 13px;
  font-weight: 500;
  color: #8892a4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 140ms;
  font-family: inherit;
}
.ec-page-btn:hover:not(:disabled):not(.ec-page-btn--active) {
  background: #1a2236;
  border-color: #2a3a52;
  color: #e2e8f0;
}
.ec-page-btn--active {
  background: rgba(226,232,240,0.12);
  border-color: rgba(226,232,240,0.18);
  color: #e2e8f0;
  font-weight: 600;
  cursor: default;
}
.ec-page-btn--nav { color: #8892a4; }
.ec-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ec-page-ellipsis {
  min-width: 28px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #4f617a;
  letter-spacing: 1px;
}

/* ══ Drawer ══ */
.ec-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(1px);
}
.ec-drawer {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: 360px; background: #111827;
  box-shadow: -2px 0 32px rgba(0,0,0,0.45);
  display: flex; flex-direction: column; overflow-y: auto; z-index: 201;
}
.ec-drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #1e2d44; flex-shrink: 0;
}
.ec-drawer-back {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 8px;
  border: none; background: rgba(255,255,255,0.06); color: #8892a4;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 130ms; font-family: inherit;
}
.ec-drawer-back:hover { background: rgba(255,255,255,0.10); color: #e2e8f0; }

/* Hero */
.ec-drawer-hero {
  display: flex; flex-direction: column; align-items: center;
  padding: 24px 20px 20px; gap: 4px;
  border-bottom: 1px solid #1e2d44;
}
.ec-drawer-avatar {
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; margin-bottom: 8px;
}
.ec-drawer-name {
  font-size: 17px; font-weight: 700; color: #e2e8f0;
  margin: 0; text-align: center; letter-spacing: -0.2px;
}
.ec-drawer-phone { font-size: 13px; color: #8892a4; margin: 0 0 4px; }

/* Body */
.ec-drawer-body { display: flex; flex-direction: column; padding: 6px 0 24px; }
.ec-drawer-block { padding: 16px 20px; }
.ec-block-lbl {
  font-size: 10px; font-weight: 700; color: #4f617a;
  text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 14px;
}
.ec-block-lbl-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.ec-block-lbl-row .ec-block-lbl { margin: 0; }
.ec-slots-summary { font-size: 12px; color: #8892a4; font-weight: 500; }
.ec-drawer-added { font-size: 12px; color: #4f617a; margin: 0; padding: 4px 20px 0; }

/* No card */
.ec-no-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 24px 0; color: #4f617a; text-align: center;
}
.ec-no-card p { font-size: 13px; margin: 0; line-height: 1.5; }

/* Slot rows */
.ec-slot {
  padding: 12px 0;
  border-bottom: 1px solid #1e2d44;
}
.ec-slot:last-child { border-bottom: none; }
.ec-slot-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.ec-slot-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
.ec-slot-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
}
.ec-slot-badge--on  { background: rgba(52,211,153,0.12); color: #34d399; }
.ec-slot-badge--off { background: rgba(255,255,255,0.06); color: #8892a4; }

/* Checkpoint toggles */
.ec-cp-toggles { display: flex; flex-wrap: wrap; gap: 6px; }
.ec-cp-toggle {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all 160ms; border: none;
}
.ec-cp-toggle--on  { background: #34d399; color: #0a2a1a; box-shadow: 0 2px 8px rgba(52,211,153,0.25); }
.ec-cp-toggle--off { background: rgba(255,255,255,0.07); color: #8892a4; }
.ec-cp-toggle--off:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: #e2e8f0; }
.ec-cp-toggle--on:hover:not(:disabled)  { background: #2ec085; }
.ec-cp-toggle:disabled { opacity: 0.5; cursor: not-allowed; }

/* ══ Transitions ══ */
.ec-fade-enter-active, .ec-fade-leave-active { transition: opacity 200ms ease; }
.ec-fade-enter-from,   .ec-fade-leave-to     { opacity: 0; }
.ec-slide-enter-active, .ec-slide-leave-active { transition: transform 260ms ease; }
.ec-slide-enter-from,   .ec-slide-leave-to     { transform: translateX(100%); }

/* Spin animation */
.ec-spin { animation: ec-spin-anim 1.1s linear infinite; }
@keyframes ec-spin-anim { to { transform: rotate(360deg); } }
</style>