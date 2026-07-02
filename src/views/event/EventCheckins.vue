<template>
  <div class="ec-root">

    <!-- ══ Stats ══ -->
    <div class="ec-stats">
      <div class="ec-stat-card">
        <div class="ec-stat-icon ec-stat-icon--purple">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="ec-stat-body">
          <span class="ec-stat-lbl">Total</span>
          <span class="ec-stat-val">{{ checkinStats.total }}</span>
        </div>
      </div>

      <div class="ec-stat-card ec-stat-card--link" :class="{ 'ec-stat-card--active': statusFilter === 'checked' }"
        @click="statusFilter = statusFilter === 'checked' ? 'all' : 'checked'; currentPage = 1">
        <div class="ec-stat-icon ec-stat-icon--green">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="ec-stat-body">
          <span class="ec-stat-lbl">Checked In</span>
          <span class="ec-stat-val">{{ checkinStats.checked }}</span>
        </div>
      </div>

      <div class="ec-stat-card ec-stat-card--link" :class="{ 'ec-stat-card--active': statusFilter === 'partial' }"
        @click="statusFilter = statusFilter === 'partial' ? 'all' : 'partial'; currentPage = 1">
        <div class="ec-stat-icon ec-stat-icon--orange">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="ec-stat-body">
          <span class="ec-stat-lbl">Partial</span>
          <span class="ec-stat-val">{{ checkinStats.partial }}</span>
        </div>
      </div>

      <div class="ec-stat-card ec-stat-card--link" :class="{ 'ec-stat-card--active': statusFilter === 'none' }"
        @click="statusFilter = statusFilter === 'none' ? 'all' : 'none'; currentPage = 1">
        <div class="ec-stat-icon ec-stat-icon--red">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
        <div class="ec-stat-body">
          <span class="ec-stat-lbl">Not Checked</span>
          <span class="ec-stat-val">{{ checkinStats.none }}</span>
        </div>
      </div>
    </div>

    <div class="ec-panel">

      <!-- ══ Panel Header ══ -->
      <div class="ec-panel-hd">
        <h2 class="ec-panel-title">Check-ins</h2>

        <div class="ec-panel-acts">
          <!-- Search -->
          <div class="ec-search-wrap">
            <svg class="ec-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

          <!-- Refresh -->
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

      <!-- ══ Card List ══ -->
      <div class="ec-table-wrap">
      <div class="ec-list">

        <!-- Loading skeletons -->
        <template v-if="loading">
          <div v-for="n in 6" :key="n" class="ec-card ec-card--sk">
            <div class="ec-card-av-wrap">
              <div class="ec-sk-circle"/>
            </div>
            <div class="ec-card-info">
              <div class="ec-sk-bar ec-sk-bar--lg"/>
              <div class="ec-sk-bar ec-sk-bar--sm" style="margin-top:4px"/>
            </div>
            <div class="ec-card-badges">
              <div class="ec-sk-bar ec-sk-bar--sm"/>
              <div class="ec-sk-bar ec-sk-bar--sm"/>
            </div>
            <div class="ec-card-date">
              <div class="ec-sk-bar ec-sk-bar--sm"/>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else-if="!pagedList.length" class="ec-list-empty">
          No attendees found
        </div>

        <!-- Attendee cards -->
        <div v-else v-for="att in pagedList" :key="att.id"
          class="ec-card"
          :class="{
            'ec-card--checked-in': statusOf(att) === 'checked',
            'ec-card--pending':    statusOf(att) === 'partial',
            'ec-card--absent':     statusOf(att) === 'none',
          }"
          @click="openDetail(att)">

          <!-- Avatar -->
          <div class="ec-card-av-wrap">
            <div class="ec-card-avatar"
              :style="{ background: avatarBg(att.fullName), color: avatarColor(att.fullName) }">
              {{ initials(att.fullName) }}
            </div>
            <span class="ec-card-dot"
              :class="{
                'ec-card-dot--checked': statusOf(att) === 'checked',
                'ec-card-dot--partial': statusOf(att) === 'partial',
                'ec-card-dot--none':    statusOf(att) === 'none',
                'ec-card-dot--nocard':  statusOf(att) === 'nocard',
              }"/>
          </div>

          <!-- Identity -->
          <div class="ec-card-info">
            <span class="ec-card-name">{{ att.fullName }}</span>
            <span class="ec-card-meta">{{ att.phone || '—' }}</span>
          </div>

          <!-- Badges -->
          <div class="ec-card-badges">
            <!-- Type -->
            <span class="ec-type-badge" :class="`ec-type--${getKardType(att)}`">
              {{ typeLabels[getKardType(att)] }}
            </span>
            <!-- Status -->
            <span class="ec-badge"
              :class="{
                'ec-badge--checked-in': statusOf(att) === 'checked',
                'ec-badge--pending':    statusOf(att) === 'partial',
                'ec-badge--absent':     statusOf(att) === 'none',
                'ec-badge--default':    statusOf(att) === 'nocard',
              }">
              {{ statusLabel(att) }}
            </span>
            <!-- Slots fraction -->
            <span v-if="(att.checkinStatus ?? []).length" class="ec-badge ec-badge--default ec-badge--slots">
              <span class="ec-slots-checked">{{ checkedSlots(att) }}</span>
              <span class="ec-slots-sep">/</span>
              <span class="ec-slots-total">{{ att.checkinStatus.length }}</span>
            </span>
          </div>

          <!-- Date -->
          <div class="ec-card-date">{{ formatDate(att.createdAt) }}</div>
        </div>

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
    </div><!-- /ec-panel -->

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
}

/* ══ Panel ══ */
.ec-panel {
  display: flex; flex-direction: column;
  background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden;
}
.ec-panel-hd {
  display: flex; align-items: center; flex-wrap: wrap;
  padding: 14px 20px; border-bottom: 1px solid #1e1e1e; gap: 10px;
}
.ec-panel-title {
  font-size: 19px; font-weight: 700; color: #f0f0ec; margin: 0; letter-spacing: -0.3px; white-space: nowrap;
}
.ec-panel-acts { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0; margin-left: auto; }

/* Search */
.ec-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 160px;
  max-width: 280px;
}
.ec-search-icon { position: absolute; left: 10px; pointer-events: none; flex-shrink: 0; }
.ec-search {
  width: 100%;
  padding: 8px 32px;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  background: #0d0d0d;
  color: #f0f0ec;
  transition: border-color 150ms, box-shadow 150ms;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ec-search:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(184,146,77,0.10); background: #0d0d0d; }
.ec-search-clear {
  position: absolute; right: 8px;
  background: none; border: none; cursor: pointer; color: #888; padding: 2px;
  display: flex; align-items: center; justify-content: center;
}
.ec-search-clear:hover { color: #f0f0ec; }

/* Filter chips */
.ec-filter-chips { display: flex; gap: 4px; }
.ec-chip {
  padding: 6px 12px; border-radius: 20px;
  border: 1px solid #2a2a2a; background: #0d0d0d;
  font-size: 12px; font-weight: 500; color: #888;
  cursor: pointer; transition: all 140ms; font-family: inherit;
}
.ec-chip:hover { background: #1a1a1a; color: #888; }
.ec-chip--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.2); color: #f0f0ec; font-weight: 600; }
.ec-chip-cnt {
  display: inline-flex; min-width: 18px; padding: 1px 5px;
  background: #1a1a1a; border-radius: 10px;
  font-size: 11px; font-weight: 600; color: #888; margin-left: 5px;
}
.ec-chip--active .ec-chip-cnt { background: rgba(255,255,255,0.18); color: rgba(255,255,255,0.75); }

/* Checkpoint dropdown */
.ec-cp-wrap { position: relative; }
.ec-cp-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 10px;
  border: 1px solid #2a2a2a; background: #0d0d0d;
  font-size: 12px; font-weight: 500; color: #888;
  cursor: pointer; transition: all 140ms; font-family: inherit;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ec-cp-btn:hover { background: #1a1a1a; }
.ec-cp-btn--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.2); color: #f0f0ec; }
.ec-cp-menu {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 100;
  background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4); padding: 4px; min-width: 180px;
}
.ec-cp-item {
  display: block; width: 100%; text-align: left;
  padding: 8px 12px; border: none; background: none; border-radius: 7px;
  font-size: 13px; font-family: inherit; color: #f0f0ec; cursor: pointer; transition: background 130ms;
}
.ec-cp-item:hover { background: #1a1a1a; }
.ec-cp-item--on { color: #C9A84C; font-weight: 600; background: #111111; }

/* Refresh button */
.ec-refresh-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #2a2a2a; background: #1a1a1a; color: #888;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 140ms; flex-shrink: 0;
}
.ec-refresh-btn:hover:not(:disabled) { background: #1a1a1a; color: #f0f0ec; }
.ec-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ══ Stats ══ */
.ec-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ec-stat-card {
  background: #111111; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 20px 20px 18px; display: flex; align-items: flex-start; gap: 16px;
  transition: background 130ms, border-color 130ms;
}
.ec-stat-card--link { cursor: pointer; }
.ec-stat-card--link:hover { background: #1e1e1e; border-color: #333; }
.ec-stat-card--active { background: #1a1a1a !important; border-color: #3a3a3a !important; }
.ec-stat-icon {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0; margin-top: 2px;
  display: flex; align-items: center; justify-content: center;
}
.ec-stat-icon--purple { background: rgba(167,139,250,0.08); color: #a78bfa; }
.ec-stat-icon--green  { background: rgba(52,211,153,0.08);  color: #34d399; }
.ec-stat-icon--orange { background: rgba(251,146,60,0.08);  color: #fb923c; }
.ec-stat-icon--red    { background: rgba(252,129,129,0.08); color: #fc8181; }
.ec-stat-icon--gold   { background: rgba(201,168,76,0.08);  color: #C9A84C; }
.ec-stat-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.ec-stat-lbl {
  font-size: 11px; font-weight: 600; color: #777;
  text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap;
}
.ec-stat-val {
  font-size: 32px; font-weight: 700; color: #f0f0ec;
  line-height: 1; letter-spacing: -0.5px;
}

/* ══ Card List ══ */
.ec-table-wrap {
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  border-top: 1px solid #1e1e1e;
  overflow: hidden;
}

.ec-list {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px 16px; background: #0d0d0d;
}

.ec-list-empty {
  padding: 48px 16px;
  text-align: center;
  color: #555;
  font-size: 13px;
}

/* Card */
.ec-card {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 16px;
  background: #141414; border: 1px solid #202020; border-radius: 12px;
  cursor: pointer;
  transition: background 150ms, border-color 150ms, box-shadow 150ms;
}
.ec-card:hover:not(.ec-card--sk) { background: #191919; border-color: #2c2c2c; box-shadow: 0 4px 16px rgba(0,0,0,0.35); }
.ec-card--sk { pointer-events: none; }

/* Status left-border stripe (applied on top of hover box-shadow via cascade) */
.ec-card--checked-in { box-shadow: inset 3px 0 0 rgba(48,209,88,0.55); }
.ec-card--pending    { box-shadow: inset 3px 0 0 rgba(255,159,10,0.55); }
.ec-card--absent     { box-shadow: inset 3px 0 0 rgba(255,69,58,0.40); }
.ec-card--checked-in:hover:not(.ec-card--sk) { box-shadow: inset 3px 0 0 rgba(48,209,88,0.55), 0 4px 16px rgba(0,0,0,0.35); }
.ec-card--pending:hover:not(.ec-card--sk)    { box-shadow: inset 3px 0 0 rgba(255,159,10,0.55), 0 4px 16px rgba(0,0,0,0.35); }
.ec-card--absent:hover:not(.ec-card--sk)     { box-shadow: inset 3px 0 0 rgba(255,69,58,0.40),  0 4px 16px rgba(0,0,0,0.35); }

/* Avatar */
.ec-card-av-wrap { position: relative; flex-shrink: 0; }
.ec-card-avatar  { width: 40px; height: 40px; border-radius: 11px; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.ec-card-dot { position: absolute; bottom: -2px; right: -2px; width: 11px; height: 11px; border-radius: 50%; border: 2.5px solid #141414; }
.ec-card-dot--checked { background: #30D158; }
.ec-card-dot--partial { background: #FF9F0A; }
.ec-card-dot--none    { background: #6B6B72; }
.ec-card-dot--nocard  { background: #3a3a3a; }

/* Identity */
.ec-card-info { display: flex; flex-direction: column; gap: 3px; flex: 0 0 200px; min-width: 0; }
.ec-card-name { font-size: 13px; font-weight: 600; color: #e8e4dd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ec-card-meta { font-size: 11px; color: #505050; }

/* Badges zone */
.ec-card-badges { flex: 1; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

/* Type badge */
.ec-type-badge {
  display: inline-flex; align-items: center;
  padding: 4px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
  border: 1px solid transparent;
}
.ec-type--invitation   { background: rgba(201,168,76,0.08); color: #C9A84C; border-color: rgba(201,168,76,0.18); }
.ec-type--contribution { background: rgba(52,211,153,0.08);  color: #34d399; border-color: rgba(52,211,153,0.18); }
.ec-type--contact      { background: rgba(255,255,255,0.04); color: #5A5550; border-color: #222; }

/* Status + generic badge */
.ec-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
  border: 1px solid transparent;
}
.ec-badge--checked-in { background: rgba(48,209,88,0.10);  color: #1D7A38; border-color: rgba(48,209,88,0.20); }
.ec-badge--pending    { background: rgba(255,159,10,0.10); color: #B36800; border-color: rgba(255,159,10,0.20); }
.ec-badge--absent     { background: rgba(255,69,58,0.10);  color: #C41E1E; border-color: rgba(255,69,58,0.20); }
.ec-badge--default    { background: rgba(255,255,255,0.04); color: #555; border-color: #222; }
.ec-badge--slots      { font-variant-numeric: tabular-nums; }

/* Slots fraction inside badge */
.ec-slots-checked { font-weight: 700; color: #30D158; }
.ec-slots-sep     { color: #555; margin: 0 2px; }
.ec-slots-total   { color: #888; }

/* Date */
.ec-card-date { font-size: 11px; color: #3a3a3a; white-space: nowrap; flex-shrink: 0; text-align: right; }

/* Skeleton */
@keyframes ec-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.ec-sk-circle { width: 40px; height: 40px; border-radius: 11px; background: #2a2a2a; flex-shrink: 0; animation: ec-pulse 1.4s ease-in-out infinite; }
.ec-sk-bar    { height: 12px; border-radius: 6px; background: #2a2a2a; animation: ec-pulse 1.4s ease-in-out infinite; }
.ec-sk-bar--lg { width: 140px; }
.ec-sk-bar--sm { width: 80px; }

/* ══ Paginator ══ */
.ec-table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #2a2a2a;
  background: #0d0d0d;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.ec-range-lbl {
  font-size: 12px;
  color: #888;
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
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  background: #0d0d0d;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 140ms;
  font-family: inherit;
}
.ec-page-btn:hover:not(:disabled):not(.ec-page-btn--active) {
  background: #1a1a1a;
  border-color: #3a3a3a;
  color: #f0f0ec;
}
.ec-page-btn--active {
  background: #0A0A0B;
  border-color: #f0f0ec;
  color: #FFFFFF;
  font-weight: 600;
  cursor: default;
}
.ec-page-btn--nav { color: #888; }
.ec-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ec-page-ellipsis {
  min-width: 28px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #555;
  letter-spacing: 1px;
}

/* ══ Drawer status badge (ec-sb used in drawer header) ══ */
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
.ec-sb--checked { background: rgba(52,211,153,0.12);    color: #34d399; }
.ec-sb--checked .ec-sb-dot { background: #30D158; }
.ec-sb--partial { background: rgba(255,159,10,0.12);   color: #9A5A00; }
.ec-sb--partial .ec-sb-dot { background: #FF9F0A; }
.ec-sb--none    { background: rgba(255,255,255,0.06);  color: #5A5550; }
.ec-sb--none    .ec-sb-dot { background: #6B6B72; }
.ec-sb--nocard  { background: rgba(255,255,255,0.04);  color: #555; }
.ec-sb--nocard  .ec-sb-dot { background: #C0BAB2; }

/* ══ Drawer ══ */
.ec-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(1px);
}
.ec-drawer {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: 360px; background: #0d0d0d;
  box-shadow: -4px 0 32px rgba(0,0,0,0.5);
  display: flex; flex-direction: column; overflow-y: auto; z-index: 201;
}
.ec-drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
}
.ec-drawer-back {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 8px;
  border: none; background: #1a1a1a; color: #888;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 130ms; font-family: inherit;
}
.ec-drawer-back:hover { background: #2a2a2a; color: #f0f0ec; }

/* Hero */
.ec-drawer-hero {
  display: flex; flex-direction: column; align-items: center;
  padding: 24px 20px 20px; gap: 4px;
  border-bottom: 1px solid #1a1a1a;
}
.ec-drawer-avatar {
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; margin-bottom: 8px;
}
.ec-drawer-name {
  font-size: 17px; font-weight: 700; color: #f0f0ec;
  margin: 0; text-align: center; letter-spacing: -0.2px;
}
.ec-drawer-phone { font-size: 13px; color: #888; margin: 0 0 4px; }

/* Body */
.ec-drawer-body { display: flex; flex-direction: column; padding: 6px 0 24px; }
.ec-drawer-block { padding: 16px 20px; }
.ec-block-lbl {
  font-size: 10px; font-weight: 700; color: #555;
  text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 14px;
}
.ec-block-lbl-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.ec-block-lbl-row .ec-block-lbl { margin: 0; }
.ec-slots-summary { font-size: 12px; color: #888; font-weight: 500; }
.ec-drawer-added { font-size: 12px; color: #555; margin: 0; padding: 4px 20px 0; }

/* No card */
.ec-no-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 24px 0; color: #555; text-align: center;
}
.ec-no-card p { font-size: 13px; margin: 0; line-height: 1.5; }

/* Slot rows */
.ec-slot {
  padding: 12px 0;
  border-bottom: 1px solid #1a1a1a;
}
.ec-slot:last-child { border-bottom: none; }
.ec-slot-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.ec-slot-name { font-size: 13px; font-weight: 600; color: #f0f0ec; }
.ec-slot-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
}
.ec-slot-badge--on  { background: rgba(52,211,153,0.12);   color: #34d399; }
.ec-slot-badge--off { background: rgba(255,255,255,0.06); color: #888; }

/* Checkpoint toggles */
.ec-cp-toggles { display: flex; flex-wrap: wrap; gap: 6px; }
.ec-cp-toggle {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all 160ms; border: none;
}
.ec-cp-toggle--on  { background: #30D158; color: #fff; box-shadow: 0 2px 8px rgba(48,209,88,0.30); }
.ec-cp-toggle--off { background: #1a1a1a; color: #888; }
.ec-cp-toggle--off:hover:not(:disabled) { background: #2a2a2a; color: #f0f0ec; }
.ec-cp-toggle--on:hover:not(:disabled)  { background: #28BA4E; }
.ec-cp-toggle:disabled { opacity: 0.5; cursor: not-allowed; }

/* ══ Transitions ══ */
.ec-fade-enter-active, .ec-fade-leave-active { transition: opacity 200ms ease; }
.ec-fade-enter-from,   .ec-fade-leave-to     { opacity: 0; }
.ec-slide-enter-active, .ec-slide-leave-active { transition: transform 260ms ease; }
.ec-slide-enter-from,   .ec-slide-leave-to     { transform: translateX(100%); }

/* Spin animation */
.ec-spin { animation: ec-spin-anim 1.1s linear infinite; }
@keyframes ec-spin-anim { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 900px) {
  .ec-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .ec-list { padding: 8px 10px; gap: 5px; }
  .ec-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas: "avatar info date" "avatar badges badges";
    align-items: start; gap: 3px 12px; padding: 12px 14px;
  }
  .ec-card-av-wrap { grid-area: avatar; align-self: start; padding-top: 2px; }
  .ec-card-info    { grid-area: info; flex: unset; }
  .ec-card-date    { grid-area: date; align-self: start; padding-top: 2px; }
  .ec-card-badges  { grid-area: badges; justify-content: flex-start; flex: unset; margin-top: 6px; }
}
@media (max-width: 600px) {
  .ec-root { padding: 12px 14px 20px; gap: 12px; }

  /* Stat cards: column layout so labels get full width */
  .ec-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; min-width: 0; }
  .ec-stat-card { min-width: 0; overflow: hidden; padding: 12px; gap: 6px; flex-direction: column; align-items: flex-start; }
  .ec-stat-icon { width: 32px; height: 32px; flex-shrink: 0; }
  .ec-stat-val  { font-size: 22px; }
  .ec-stat-val--money { font-size: 16px; }
  .ec-stat-body { gap: 2px; min-width: 0; width: 100%; }
  .ec-stat-lbl  { font-size: 10px; letter-spacing: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Panel header: stack search + chips as full-width rows */
  .ec-panel-hd { padding: 10px 14px; gap: 8px; }
  .ec-panel-title { font-size: 17px; }
  .ec-panel-acts { margin-left: 0; flex: 0 0 100%; flex-direction: column; align-items: stretch; gap: 6px; }
  .ec-search-wrap { min-width: 0; max-width: 100%; width: 100%; }
  .ec-search { font-size: 13px; }

  /* Filter chips: scroll horizontally */
  .ec-filter-chips { overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; flex-wrap: nowrap; }
  .ec-filter-chips::-webkit-scrollbar { display: none; }
  .ec-chip { flex-shrink: 0; }

  /* Checkpoint button full width */
  .ec-cp-wrap { width: 100%; }
  .ec-cp-btn { width: 100%; justify-content: flex-start; }
}
@media (max-width: 400px) { .ec-card-date { display: none; } }
</style>