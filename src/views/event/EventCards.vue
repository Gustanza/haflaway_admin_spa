<template>
  <div class="evc-root">

    <!-- ══ Toolbar ══ -->
    <div class="evc-toolbar">
      <div class="evc-toolbar-left">
        <!-- Search -->
        <div class="evc-search-wrap">
          <svg class="evc-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#6B6B72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQ" class="evc-search" placeholder="Search by type or purpose…" />
          <button v-if="searchQ" class="evc-search-clear" @click="searchQ = ''">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Purpose chips -->
        <div class="evc-filter-chips">
          <button v-for="f in PURPOSE_FILTERS" :key="f.val"
            class="evc-chip" :class="{ 'evc-chip--active': purposeFilter === f.val }"
            @click="purposeFilter = f.val">
            {{ f.label }}
            <span class="evc-chip-cnt">{{ purposeCount(f.val) }}</span>
          </button>
        </div>
      </div>

      <div class="evc-toolbar-right">
        <button class="evc-refresh-btn" @click="loadData" :disabled="loading" title="Refresh">
          <svg :class="{ 'evc-spin': loading }" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
        <a :href="designerCreateUrl" target="_blank" rel="noopener" class="evc-new-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Template
        </a>
      </div>
    </div>

    <!-- ══ Content ══ -->
    <div class="evc-content">

      <!-- Loading -->
      <div v-if="loading" class="evc-empty">
        <svg class="evc-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="#B8924D" stroke-width="2.2" stroke-linecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <p>Loading templates…</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!filteredCards.length" class="evc-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D0CAC0"
          stroke-width="1.2" stroke-linecap="round">
          <rect x="2" y="5" width="20" height="14" rx="3"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
          <line x1="7" y1="15" x2="10" y2="15"/>
          <line x1="14" y1="15" x2="17" y2="15"/>
        </svg>
        <p class="evc-empty-title">No card templates yet</p>
        <p class="evc-empty-sub">Create your first template using the designer</p>
        <a :href="designerCreateUrl" target="_blank" rel="noopener" class="evc-empty-cta">
          Open Designer
        </a>
      </div>

      <!-- Grid -->
      <div v-else class="evc-grid">
        <div v-for="card in filteredCards" :key="card.id"
          class="evc-card" :class="{ 'evc-card--selected': selectedCard?.id === card.id }"
          @click="openDetail(card)">

          <!-- Template image / placeholder -->
          <div class="evc-card-thumb"
            :class="{ 'evc-card-thumb--placeholder': !card.templateUrl }"
            :style="card.templateUrl
              ? { backgroundImage: `url(${card.templateUrl})` }
              : { background: purposeGradient(card.purpose) }">
            <!-- No-image placeholder icon -->
            <div v-if="!card.templateUrl" class="evc-thumb-placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.2" stroke-linecap="round" opacity="0.4">
                <rect x="2" y="5" width="20" height="14" rx="3"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <!-- Purpose badge overlay -->
            <span class="evc-thumb-badge" :style="purposeStyle(card.purpose)">
              {{ PURPOSE_LABELS[card.purpose] ?? card.purpose }}
            </span>
          </div>

          <!-- Card info -->
          <div class="evc-card-body">
            <p class="evc-card-type">{{ card.type || '—' }}</p>
            <div class="evc-card-meta">
              <span class="evc-meta-chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                {{ card.capacity ?? '—' }}
              </span>
              <span class="evc-meta-chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ (card.clearAt ?? []).length }}
              </span>
            </div>
          </div>

          <!-- Actions row -->
          <div class="evc-card-actions" @click.stop>
            <template v-if="confirmDeleteId === card.id">
              <span class="evc-del-confirm-lbl">Delete?</span>
              <button class="evc-action-btn evc-action-btn--danger" @click="deleteCard(card)">
                {{ deletingId === card.id ? '…' : 'Yes' }}
              </button>
              <button class="evc-action-btn" @click="confirmDeleteId = null">No</button>
            </template>
            <template v-else>
              <a :href="designerEditUrl(card.id)" target="_blank" rel="noopener"
                class="evc-action-btn evc-action-btn--edit">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.2" stroke-linecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </a>
              <button class="evc-action-btn evc-action-btn--del-ghost"
                @click="confirmDeleteId = card.id">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.2" stroke-linecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Delete
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ Detail Drawer ══ -->
    <Teleport to="body">
      <Transition name="evc-fade">
        <div v-if="selectedCard" class="evc-overlay" @click.self="closeDetail">
          <Transition name="evc-slide">
            <div class="evc-drawer" v-if="selectedCard">

              <!-- Header -->
              <div class="evc-drawer-header">
                <button class="evc-drawer-back" @click="closeDetail">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Close
                </button>
                <a :href="designerEditUrl(selectedCard.id)" target="_blank" rel="noopener"
                  class="evc-drawer-edit-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.2" stroke-linecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit in Designer
                </a>
              </div>

              <!-- Template preview -->
              <div class="evc-preview-wrap">
                <div v-if="selectedCard.templateUrl" class="evc-preview-img"
                  :style="{ backgroundImage: `url(${selectedCard.templateUrl})` }"/>
                <div v-else class="evc-preview-placeholder"
                  :style="{ background: purposeGradient(selectedCard.purpose) }">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.2" stroke-linecap="round" opacity="0.35">
                    <rect x="2" y="5" width="20" height="14" rx="3"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <p>No preview available</p>
                </div>
              </div>

              <!-- Details -->
              <div class="evc-drawer-body">

                <!-- Header row -->
                <div class="evc-detail-head">
                  <div>
                    <p class="evc-detail-type">{{ selectedCard.type || '—' }}</p>
                    <span class="evc-purpose-badge" :style="purposeStyle(selectedCard.purpose)">
                      {{ PURPOSE_LABELS[selectedCard.purpose] ?? selectedCard.purpose }}
                    </span>
                  </div>
                </div>

                <!-- Stats row -->
                <div class="evc-detail-stats">
                  <div class="evc-detail-stat">
                    <span class="evc-detail-stat-n">{{ selectedCard.capacity ?? '—' }}</span>
                    <span class="evc-detail-stat-lbl">Capacity</span>
                  </div>
                  <div class="evc-detail-stat-sep"/>
                  <div class="evc-detail-stat">
                    <span class="evc-detail-stat-n">{{ (selectedCard.clearAt ?? []).length }}</span>
                    <span class="evc-detail-stat-lbl">Checkpoints</span>
                  </div>
                  <div class="evc-detail-stat-sep"/>
                  <div class="evc-detail-stat">
                    <span class="evc-detail-stat-n">{{ attendeeCountFor(selectedCard.id) }}</span>
                    <span class="evc-detail-stat-lbl">Attendees</span>
                  </div>
                </div>

                <!-- Checkpoints -->
                <div v-if="(selectedCard.clearAt ?? []).length" class="evc-drawer-block">
                  <p class="evc-block-lbl">Valid At Checkpoints</p>
                  <div class="evc-cp-list">
                    <div v-for="cpId in selectedCard.clearAt" :key="cpId" class="evc-cp-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
                        stroke-width="2" stroke-linecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {{ checkpointName(cpId) }}
                    </div>
                  </div>
                </div>
                <div v-else class="evc-drawer-block">
                  <p class="evc-block-lbl">Valid At Checkpoints</p>
                  <p class="evc-detail-none">No checkpoints assigned — valid everywhere</p>
                </div>

                <!-- Attendees using this template -->
                <div class="evc-drawer-block">
                  <p class="evc-block-lbl">Attendees Using This Template</p>
                  <div v-if="!attendeesFor(selectedCard).length" class="evc-detail-none">
                    No attendees assigned yet
                  </div>
                  <div v-else class="evc-att-list">
                    <div v-for="att in attendeesFor(selectedCard).slice(0, 8)" :key="att.id"
                      class="evc-att-row">
                      <div class="evc-att-avatar"
                        :style="{ background: avatarBg(att.fullName), color: avatarColor(att.fullName) }">
                        {{ initials(att.fullName) }}
                      </div>
                      <div class="evc-att-info">
                        <span class="evc-att-name">{{ att.fullName }}</span>
                        <span class="evc-att-phone">{{ att.phone || '—' }}</span>
                      </div>
                      <span class="evc-att-card-status"
                        :class="isCardPending(att, selectedCard) ? 'evc-att-pending' : 'evc-att-ready'">
                        {{ isCardPending(att, selectedCard) ? 'Pending' : 'Ready' }}
                      </span>
                    </div>
                    <p v-if="attendeesFor(selectedCard).length > 8" class="evc-att-more">
                      + {{ attendeesFor(selectedCard).length - 8 }} more attendees
                    </p>
                  </div>
                </div>

                <!-- Created date -->
                <p class="evc-drawer-added">
                  Created {{ formatDate(selectedCard.createdAt) }}
                </p>
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
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore'

const props   = defineProps({ event: Object, eventId: String })
const route   = useRoute()
const eventId = computed(() => props.eventId ?? route.params.eventId)

// ── Constants ─────────────────────────────────────────────────────────────────
const DESIGNER_BASE = 'https://haflaway-designer.web.app/designer'

const PURPOSE_LABELS = {
  invitation:    'Invitation',
  contribution:  'Contribution',
  save_the_date: 'Save the Date',
  contact:       'Contact',
}

const PURPOSE_STYLES = {
  invitation:    { bg: 'rgba(184,146,77,0.18)',  color: '#7A5A10' },
  contribution:  { bg: 'rgba(48,209,88,0.18)',   color: '#136B2A' },
  save_the_date: { bg: 'rgba(94,154,255,0.18)',  color: '#1A3A8A' },
  contact:       { bg: 'rgba(138,133,128,0.15)', color: '#5A5550' },
}

const PURPOSE_GRADIENTS = {
  invitation:    'linear-gradient(145deg, #F5EDD5 0%, #EDD89A 100%)',
  contribution:  'linear-gradient(145deg, #D5F0DC 0%, #9ADAB0 100%)',
  save_the_date: 'linear-gradient(145deg, #D5E5F8 0%, #9AC0EE 100%)',
  contact:       'linear-gradient(145deg, #ECECEF 0%, #D0CBC4 100%)',
}

const PURPOSE_FILTERS = [
  { val: 'all',          label: 'All'          },
  { val: 'invitation',   label: 'Invitation'   },
  { val: 'contribution', label: 'Contribution' },
  { val: 'save_the_date',label: 'Save the Date'},
]

// ── State ─────────────────────────────────────────────────────────────────────
const cards       = ref([])
const checkpoints = ref([])
const attendees   = ref([])
const loading     = ref(false)

const searchQ       = ref('')
const purposeFilter = ref('all')
const selectedCard  = ref(null)
const confirmDeleteId = ref(null)
const deletingId    = ref(null)

// ── URLs ──────────────────────────────────────────────────────────────────────
const designerCreateUrl = computed(() => `${DESIGNER_BASE}/${eventId.value}/create`)
function designerEditUrl(cardId) { return `${DESIGNER_BASE}/${eventId.value}/${cardId}/edit` }

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadData() {
  if (!eventId.value) return
  loading.value = true
  try {
    const [cardsSnap, cpSnap, attSnap] = await Promise.all([
      getDocs(collection(db, 'events', eventId.value, 'cards')),
      getDocs(collection(db, 'events', eventId.value, 'checkpoints')),
      getDocs(collection(db, 'events', eventId.value, 'attendees')),
    ])

    checkpoints.value = cpSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    attendees.value   = attSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const kardList = cardsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Fetch templateUrl from global cards/{id} collection in parallel
    const fullSnaps = await Promise.all(kardList.map(k => getDoc(doc(db, 'cards', k.id))))

    cards.value = kardList.map((k, i) => {
      const full = fullSnaps[i].data() ?? {}
      return {
        ...k,
        templateUrl: full.templateUrl  ?? null,
        cardWidth:   full.cardWidth    ?? null,
        cardHeight:  full.cardHeight   ?? null,
      }
    })
  } catch (e) {
    console.error('Failed to load cards data', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// ── Helpers ───────────────────────────────────────────────────────────────────
function purposeStyle(purpose) {
  const s = PURPOSE_STYLES[purpose]
  return s ? { background: s.bg, color: s.color } : { background: '#ECECEF', color: '#5A5550' }
}
function purposeGradient(purpose) {
  return PURPOSE_GRADIENTS[purpose] ?? PURPOSE_GRADIENTS.contact
}

function checkpointName(cpId) {
  return checkpoints.value.find(c => c.id === cpId)?.name ?? cpId
}

function attendeesFor(card) {
  return attendees.value.filter(a => {
    const cards = a.cards ?? {}
    return Object.values(cards).some(v => v?.templateCardId === card.id)
  })
}

function attendeeCountFor(cardId) {
  return attendees.value.filter(a => {
    const cards = a.cards ?? {}
    return Object.values(cards).some(v => v?.templateCardId === cardId)
  }).length
}

function isCardPending(att, card) {
  const cards = att.cards ?? {}
  const entry = Object.values(cards).find(v => v?.templateCardId === card.id)
  if (!entry?.url) return true
  return !entry.url.startsWith('http') || entry.url.includes('placeholder')
}

function purposeCount(val) {
  if (val === 'all') return cards.value.length
  return cards.value.filter(c => c.purpose === val).length
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

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredCards = computed(() => {
  let list = cards.value
  if (purposeFilter.value !== 'all') {
    list = list.filter(c => c.purpose === purposeFilter.value)
  }
  const q = searchQ.value.trim().toLowerCase()
  if (q) {
    list = list.filter(c =>
      (c.type ?? '').toLowerCase().includes(q) ||
      (PURPOSE_LABELS[c.purpose] ?? c.purpose ?? '').toLowerCase().includes(q)
    )
  }
  return list
})

const statsItems = computed(() => [
  { val: 'all',          label: 'Total',         count: cards.value.length,                              color: null        },
  { val: 'invitation',   label: 'Invitation',    count: cards.value.filter(c => c.purpose === 'invitation').length,   color: '#B8924D'  },
  { val: 'contribution', label: 'Contribution',  count: cards.value.filter(c => c.purpose === 'contribution').length, color: '#30D158'  },
  { val: 'save_the_date',label: 'Save the Date', count: cards.value.filter(c => c.purpose === 'save_the_date').length,color: '#5E9AFF'  },
])

// ── Actions ───────────────────────────────────────────────────────────────────
function openDetail(card) {
  selectedCard.value  = card
  confirmDeleteId.value = null
}
function closeDetail() { selectedCard.value = null }

async function deleteCard(card) {
  if (deletingId.value) return
  deletingId.value = card.id
  try {
    await deleteDoc(doc(db, 'events', eventId.value, 'cards', card.id))
    cards.value = cards.value.filter(c => c.id !== card.id)
    if (selectedCard.value?.id === card.id) selectedCard.value = null
    confirmDeleteId.value = null
  } catch (e) {
    console.error('Failed to delete card', e)
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
/* ══ Root ══ */
.evc-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px 24px;
  background: #0a0e1c;
}

/* ══ Toolbar ══ */
.evc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 0;
}
.evc-toolbar-left  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.evc-toolbar-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

/* Search */
.evc-search-wrap {
  position: relative; display: flex; align-items: center;
  min-width: 200px; max-width: 260px;
}
.evc-search-icon { position: absolute; left: 10px; pointer-events: none; }
.evc-search {
  width: 100%; padding: 8px 32px;
  border: 1px solid #2a3a52; border-radius: 10px;
  font-size: 13px; font-family: inherit; outline: none;
  background: #0f1729; color: #e2e8f0;
  transition: border-color 150ms, box-shadow 150ms;
  box-shadow: 0 1px 1px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.2);
}
.evc-search:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.10); background: #0f1729; }
.evc-search-clear {
  position: absolute; right: 8px;
  background: none; border: none; cursor: pointer; color: #8892a4; padding: 2px;
  display: flex; align-items: center;
}
.evc-search-clear:hover { color: #e2e8f0; }

/* Filter chips */
.evc-filter-chips { display: flex; gap: 4px; }
.evc-chip {
  padding: 6px 12px; border-radius: 20px;
  border: 1px solid #1e2d44; background: #111827;
  font-size: 12px; font-weight: 500; color: #8892a4;
  cursor: pointer; transition: all 140ms; font-family: inherit;
}
.evc-chip:hover { background: #1a2236; color: #c8d4e0; }
.evc-chip--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #e2e8f0; font-weight: 600; }
.evc-chip-cnt {
  display: inline-flex; min-width: 18px; padding: 1px 5px;
  background: rgba(255,255,255,0.08); border-radius: 10px;
  font-size: 11px; font-weight: 600; color: #4f617a; margin-left: 5px;
}
.evc-chip--active .evc-chip-cnt { background: rgba(201,168,76,0.12); color: #C9A84C; }

/* Refresh + New Template */
.evc-refresh-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #1e2d44; background: #111827; color: #8892a4;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 140ms; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.evc-refresh-btn:hover:not(:disabled) { background: #1a2236; color: #e2e8f0; }
.evc-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.evc-new-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px;
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0;
  font-size: 13px; font-weight: 600; font-family: inherit;
  text-decoration: none; cursor: pointer;
  transition: opacity 140ms; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.evc-new-btn:hover { opacity: 0.85; }

/* ══ Stats Bar ══ */
/* ══ Content / Grid ══ */
.evc-content { flex: 1; padding: 0; width: 100%; min-width: 0; }

.evc-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; min-height: 300px; color: #4f617a;
}
.evc-empty-title { font-size: 15px; font-weight: 600; color: #8892a4; margin: 0; }
.evc-empty-sub   { font-size: 13px; color: #4f617a; margin: 0; }
.evc-empty-cta {
  margin-top: 6px; padding: 9px 20px; border-radius: 10px;
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0; font-size: 13px; font-weight: 600;
  text-decoration: none; transition: opacity 140ms;
}
.evc-empty-cta:hover { opacity: 0.85; }

.evc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  width: 100%;
}

/* Card tile */
.evc-card {
  background: #111827;
  border: 1px solid #1e2d44;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 160ms, border-color 160ms, transform 160ms;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.evc-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.35); border-color: #2a3a52; transform: translateY(-1px); }
.evc-card--selected { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }

.evc-card-thumb {
  width: 100%;
  aspect-ratio: 3 / 2;
}
.evc-card-thumb--placeholder {
  aspect-ratio: unset;
  height: 72px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 10px;
}
.evc-thumb-placeholder {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: #4f617a;
}
.evc-thumb-badge {
  position: relative; z-index: 1;
  padding: 3px 9px; border-radius: 20px;
  font-size: 10px; font-weight: 700;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.evc-card-body { padding: 12px 14px 10px; display: flex; align-items: center; gap: 10px; }
.evc-card-type {
  font-size: 14px; font-weight: 700; color: #e2e8f0;
  margin: 0; letter-spacing: -0.1px; white-space: nowrap;
}
.evc-card-meta { display: flex; align-items: center; gap: 10px; }
.evc-meta-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; color: #8892a4; font-weight: 500;
}

/* Card action row */
.evc-card-actions {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px;
  border-top: 1px solid #1e2d44;
}
.evc-del-confirm-lbl { font-size: 12px; color: #FF3B30; font-weight: 600; flex: 1; }
.evc-action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 7px;
  font-size: 12px; font-weight: 500; font-family: inherit;
  border: 1px solid #1e2d44; background: rgba(255,255,255,0.04); color: #8892a4;
  cursor: pointer; transition: all 130ms; text-decoration: none;
}
.evc-action-btn:hover { background: #1a2236; color: #e2e8f0; }
.evc-action-btn--edit:hover { border-color: rgba(201,168,76,0.5); color: #C9A84C; background: rgba(201,168,76,0.06); }
.evc-action-btn--del-ghost:hover { border-color: rgba(255,59,48,0.3); color: #FF3B30; background: rgba(255,59,48,0.05); }
.evc-action-btn--danger { border-color: rgba(255,59,48,0.4); color: #FF3B30; background: rgba(255,59,48,0.06); }
.evc-action-btn--danger:hover { background: rgba(255,59,48,0.12); }

/* ══ Drawer ══ */
.evc-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(28,26,24,0.35);
  backdrop-filter: blur(1px);
}
.evc-drawer {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: 380px; background: #111827;
  box-shadow: -2px 0 32px rgba(0,0,0,0.45);
  display: flex; flex-direction: column; overflow-y: auto; z-index: 201;
}
.evc-drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #1e2d44; flex-shrink: 0;
}
.evc-drawer-back {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 8px;
  border: none; background: rgba(255,255,255,0.06); color: #8892a4;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 130ms; font-family: inherit;
}
.evc-drawer-back:hover { background: rgba(255,255,255,0.10); color: #e2e8f0; }
.evc-drawer-edit-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  border: 1px solid #1e2d44; background: rgba(255,255,255,0.04); color: #8892a4;
  font-size: 12px; font-weight: 500; font-family: inherit;
  text-decoration: none; cursor: pointer; transition: all 130ms;
}
.evc-drawer-edit-btn:hover { border-color: rgba(201,168,76,0.5); color: #C9A84C; background: rgba(201,168,76,0.06); }

/* Template preview */
.evc-preview-wrap { padding: 16px 20px; background: #0f1729; border-bottom: 1px solid #1e2d44; flex-shrink: 0; }
.evc-preview-img {
  width: 100%; aspect-ratio: 3 / 2;
  background-size: contain; background-position: center; background-repeat: no-repeat;
  border-radius: 10px; border: 1px solid #1e2d44; background-color: #0f1729;
}
.evc-preview-placeholder {
  width: 100%; aspect-ratio: 3 / 2;
  border-radius: 10px; border: 1px solid #1e2d44;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; color: #8892a4;
}
.evc-preview-placeholder p { font-size: 12px; margin: 0; color: #4f617a; }

/* Drawer body */
.evc-drawer-body { display: flex; flex-direction: column; padding: 0 0 24px; }

.evc-detail-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px 12px; border-bottom: 1px solid #1e2d44;
}
.evc-detail-type { font-size: 18px; font-weight: 700; color: #e2e8f0; margin: 0 0 6px; }
.evc-purpose-badge {
  display: inline-block; padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 700;
}

.evc-detail-stats {
  display: flex; align-items: center;
  padding: 14px 20px; border-bottom: 1px solid #1e2d44;
}
.evc-detail-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.evc-detail-stat-n { font-size: 18px; font-weight: 700; color: #e2e8f0; line-height: 1; }
.evc-detail-stat-lbl { font-size: 10px; font-weight: 600; color: #4f617a; text-transform: uppercase; letter-spacing: 0.4px; }
.evc-detail-stat-sep { width: 0.8px; height: 28px; background: #1e2d44; flex-shrink: 0; }

.evc-drawer-block { padding: 14px 20px; border-bottom: 1px solid #1e2d44; }
.evc-drawer-block:last-of-type { border-bottom: none; }
.evc-block-lbl {
  font-size: 10px; font-weight: 700; color: #4f617a;
  text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 10px;
}
.evc-detail-none { font-size: 13px; color: #4f617a; font-style: italic; }

/* Checkpoints list */
.evc-cp-list { display: flex; flex-direction: column; gap: 6px; }
.evc-cp-item {
  display: flex; align-items: center; gap: 7px;
  font-size: 13px; color: #e2e8f0; font-weight: 500;
}

/* Attendees list */
.evc-att-list { display: flex; flex-direction: column; gap: 0; }
.evc-att-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid #1e2d44;
}
.evc-att-row:last-of-type { border-bottom: none; }
.evc-att-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
}
.evc-att-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.evc-att-name  { font-size: 12px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.evc-att-phone { font-size: 11px; color: #8892a4; }
.evc-att-card-status { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; }
.evc-att-ready   { background: rgba(48,209,88,0.12);  color: #34d399; }
.evc-att-pending { background: rgba(201,168,76,0.12); color: #C9A84C; }
.evc-att-more { font-size: 12px; color: #8892a4; margin: 8px 0 0; padding: 0; }

.evc-drawer-added { font-size: 12px; color: #4f617a; margin: 0; padding: 4px 20px 0; }

/* ══ Transitions ══ */
.evc-fade-enter-active, .evc-fade-leave-active { transition: opacity 200ms ease; }
.evc-fade-enter-from,   .evc-fade-leave-to     { opacity: 0; }
.evc-slide-enter-active, .evc-slide-leave-active { transition: transform 260ms ease; }
.evc-slide-enter-from,   .evc-slide-leave-to     { transform: translateX(100%); }

/* Spin */
.evc-spin { animation: evc-spin-anim 1.1s linear infinite; }
@keyframes evc-spin-anim { to { transform: rotate(360deg); } }
</style>