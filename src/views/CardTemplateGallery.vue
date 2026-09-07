<template>
  <div class="gallery-root">

    <!-- ── Topbar — same floating glass capsule as /events ── -->
    <nav class="gallery-topbar">
      <div class="gallery-topbar-inner">
        <div class="gallery-brand" @click="$router.push('/')">
          <span class="gallery-brand-dot" />
          <span class="gallery-brand-name">haflaway</span>
        </div>
        <span v-if="!loading && allTemplates.length" class="gallery-topbar-count">
          {{ allTemplates.length }} design{{ allTemplates.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </nav>

    <!-- ── Page shell — same 1200px column + padding scale as /events ── -->
    <div class="gallery-page">

      <!-- Page header -->
      <header class="gallery-header">
        <div class="gallery-header-copy">
          <span class="gallery-eyebrow">The Haflaway Collection</span>
          <h1 class="gallery-title">Card Templates</h1>
          <p class="gallery-sub">Browse invitation & contribution designs — tap any card to zoom in.</p>
        </div>
        <div v-if="!loading && allTemplates.length" class="gallery-header-stats">
          <div class="gallery-hstat">
            <span class="gallery-hstat-val">{{ allTemplates.length }}</span>
            <span class="gallery-hstat-label">Total</span>
          </div>
          <div class="gallery-hstat-div" />
          <div class="gallery-hstat">
            <span class="gallery-hstat-val gallery-hstat-val--accent">{{ counts.invitation }}</span>
            <span class="gallery-hstat-label">Invitation</span>
          </div>
          <div class="gallery-hstat-div" />
          <div class="gallery-hstat">
            <span class="gallery-hstat-val">{{ counts.contribution }}</span>
            <span class="gallery-hstat-label">Contribution</span>
          </div>
        </div>
      </header>

      <!-- Controls bar — same shell as the /events status-filter bar -->
      <div class="gallery-controls">
        <div class="gallery-tabs">
          <button
            class="gallery-tab"
            :class="{ 'gallery-tab--active': activeType === 'invitation' }"
            @click="setType('invitation')"
          >
            <EnvelopeIcon class="gallery-tab-icon" />
            Invitation
            <span class="gallery-tab-count" :class="{ 'gallery-tab-count--active': activeType === 'invitation' }">{{ counts.invitation }}</span>
          </button>
          <button
            class="gallery-tab"
            :class="{ 'gallery-tab--active': activeType === 'contribution' }"
            @click="setType('contribution')"
          >
            <GiftIcon class="gallery-tab-icon" />
            Contribution
            <span class="gallery-tab-count" :class="{ 'gallery-tab-count--active': activeType === 'contribution' }">{{ counts.contribution }}</span>
          </button>
        </div>

        <div v-if="packages.length" class="gallery-controls-right">
          <div class="pkg-filter-wrap" ref="pkgWrapRef">
            <button class="pkg-filter-trigger" @click="pkgDropOpen = !pkgDropOpen">
              <span class="pkg-dot" :style="{ background: activePackageColor }" />
              {{ activePackageLabel }}
              <ChevronDownIcon class="pkg-filter-chevron" :class="{ 'pkg-filter-chevron--open': pkgDropOpen }" />
            </button>

            <Transition name="pkg-fade">
              <div v-if="pkgDropOpen" class="pkg-filter-dropdown">
                <button class="pkg-filter-row" :class="{ 'pkg-filter-row--active': !activePackageId }" @click="selectPackage(null)">
                  <span class="pkg-dot pkg-dot--all" />
                  <span class="pkg-filter-row-label">All packages</span>
                  <span class="pkg-count-badge">{{ typedTemplates.length }}</span>
                </button>
                <div class="pkg-filter-divider" />
                <button
                  v-for="p in packages"
                  :key="p.id"
                  class="pkg-filter-row"
                  :class="{ 'pkg-filter-row--active': activePackageId === p.id }"
                  @click="selectPackage(p.id)"
                >
                  <span class="pkg-dot" :style="{ background: packageColor(p.id) }" />
                  <span class="pkg-filter-row-label">{{ p.name }}</span>
                  <span class="pkg-count-badge">{{ countForPackage(p.id) }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="gallery-skeleton-grid">
        <div class="gallery-skeleton" v-for="i in 10" :key="i" />
      </div>

      <!-- Empty -->
      <div v-else-if="filteredTemplates.length === 0" class="gallery-empty">
        <span class="gallery-empty-glyph">✦</span>
        <p class="gallery-empty-title">No templates here yet</p>
        <p class="gallery-empty-sub">{{ emptyHint }}</p>
      </div>

      <template v-else>
        <!-- Grid -->
        <div class="gallery-grid">
          <div
            v-for="t in paginated"
            :key="t.id"
            class="gallery-card"
            @click="openLightbox(t)"
          >
            <img :src="t.imageUrl" :alt="t.type" loading="lazy" draggable="false" />
            <div class="gallery-card-stripe">
              <span
                v-for="(seg, i) in packageStripe(t)" :key="i"
                class="gallery-card-stripe-seg" :style="{ background: seg }"
              />
            </div>
            <div v-if="t.featured" class="gallery-card-featured">
              <StarSolidIcon class="gallery-card-featured-icon" />
            </div>
            <div class="gallery-card-pkg" :class="{ 'gallery-card-pkg--universal': packageChip(t).universal }">
              <span class="gallery-card-pkg-dot" :style="{ background: packageChip(t).color }" />
              {{ packageChip(t).label }}
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="gallery-pagination">
          <div class="gallery-pagination-controls">
            <button class="gallery-page-btn gallery-page-btn--nav" :disabled="currentPage === 1" @click="goTo(currentPage - 1)">
              <ChevronLeftIcon class="gallery-page-arrow" />
            </button>
            <template v-for="p in pageNumbers" :key="p">
              <span v-if="p === '…'" class="gallery-page-ellipsis">…</span>
              <button
                v-else
                :class="['gallery-page-btn', currentPage === p && 'gallery-page-btn--active']"
                @click="goTo(p)"
              >{{ p }}</button>
            </template>
            <button class="gallery-page-btn gallery-page-btn--nav" :disabled="currentPage === totalPages" @click="goTo(currentPage + 1)">
              <ChevronRightIcon class="gallery-page-arrow" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lb-fade">
        <div
          v-if="active"
          class="lightbox"
          @click="closeLightbox"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <!-- Close -->
          <button class="lb-close" @click.stop="closeLightbox">
            <XMarkIcon class="lb-close-icon" />
          </button>

          <!-- Hint -->
          <p class="lb-hint">Scroll or pinch to zoom · Drag to pan · Double-click to reset</p>

          <!-- Image -->
          <img
            :src="active.imageUrl"
            class="lb-img"
            :style="{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, cursor: lbCursor }"
            draggable="false"
            @click.stop
            @wheel.prevent="onWheel"
            @mousedown.prevent.stop="onMouseDown"
            @dblclick.stop="onDblClick"
            @touchstart.prevent="onTouchStart"
            @touchmove.prevent="onTouchMove"
            @touchend="onTouchEnd"
          />

          <!-- Controls -->
          <div class="lb-controls" @click.stop>
            <button class="lb-ctrl-btn" :disabled="scale <= 1" @click="zoomOut">
              <MinusIcon class="lb-ctrl-icon" />
            </button>
            <span class="lb-scale">{{ Math.round(scale * 100) }}%</span>
            <button class="lb-ctrl-btn" :disabled="scale >= 5" @click="zoomIn">
              <PlusIcon class="lb-ctrl-icon" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase.js'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { StarIcon as StarSolidIcon } from '@heroicons/vue/24/solid'
import {
  ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, XMarkIcon,
  PlusIcon, MinusIcon, EnvelopeIcon, GiftIcon,
} from '@heroicons/vue/24/outline'

const route  = useRoute()
const router = useRouter()

const PAGE_SIZE = 20

// Reused from the /events invitation-card palette (MyEvents.vue thumbColors) so
// package dots read as the same visual language as the rest of the app.
const PALETTE = ['#C9A84C', '#C8A0B4', '#7090d0', '#30D158', '#B0A898', '#C87878']

// ── Gallery state ──────────────────────────────────────────────────────────
const allTemplates = ref([])
const packages     = ref([])
const loading      = ref(true)
const currentPage  = ref(1)

const activeType      = ref(route.query.type === 'contribution' ? 'contribution' : 'invitation')
const activePackageId = ref(typeof route.query.package === 'string' ? route.query.package : null)

function setType(t) {
  if (activeType.value === t) return
  activeType.value  = t
  currentPage.value = 1
  syncQuery()
}

function selectPackage(id) {
  activePackageId.value = id
  currentPage.value     = 1
  pkgDropOpen.value      = false
  syncQuery()
}

function syncQuery() {
  router.replace({
    query: {
      ...(activeType.value === 'contribution' ? { type: 'contribution' } : {}),
      ...(activePackageId.value ? { package: activePackageId.value } : {}),
    },
  })
}

// ── Package filter dropdown ──────────────────────────────────────────────────
const pkgDropOpen = ref(false)
const pkgWrapRef  = ref(null)
function onClickOutsidePkg(e) {
  if (pkgWrapRef.value && !pkgWrapRef.value.contains(e.target)) pkgDropOpen.value = false
}

const packageIndex = computed(() => new Map(packages.value.map((p, i) => [p.id, i])))
function packageColor(id) {
  const i = packageIndex.value.get(id)
  return PALETTE[(i ?? 0) % PALETTE.length]
}
const activePackageColor = computed(() =>
  activePackageId.value ? packageColor(activePackageId.value) : '#6b6b6b'
)
const activePackageLabel = computed(() => {
  if (!activePackageId.value) return 'All packages'
  return packages.value.find(p => p.id === activePackageId.value)?.name ?? 'All packages'
})

// A template with no packageIds is universal — available under every package,
// matching how eventPlans.visibility treats an absent field as "public" so
// existing templates don't need a migration when this feature ships.
function templateInPackage(t, pkgId) {
  if (!pkgId) return true
  if (!t.packageIds?.length) return true
  return t.packageIds.includes(pkgId)
}

// Always returns a tag — "All packages" is itself information the "All
// packages" filter can't convey on its own, so a universal template needs to
// say so on the card rather than going unlabeled.
function packageChip(t) {
  if (!t.packageIds?.length) return { universal: true, color: '#6b6b6b', label: 'All packages' }
  const first = packages.value.find(p => p.id === t.packageIds[0])
  const extra = t.packageIds.length - 1
  return {
    universal: false,
    color: packageColor(t.packageIds[0]),
    label: extra > 0 ? `${first?.name ?? 'Package'} +${extra}` : (first?.name ?? 'Package'),
  }
}

// A thin color-coded strip across the top of every card — one segment per
// package it belongs to — so the palette is scannable at a glance across the
// whole grid without reading a single label, even under "All packages".
function packageStripe(t) {
  if (!t.packageIds?.length) return ['#3a3a3a']
  return t.packageIds.map(id => packageColor(id))
}

// ── Filtering ─────────────────────────────────────────────────────────────
const typedTemplates = computed(() => allTemplates.value.filter(t => t.type === activeType.value))
const filteredTemplates = computed(() =>
  typedTemplates.value.filter(t => templateInPackage(t, activePackageId.value))
)

function countForPackage(pkgId) {
  return typedTemplates.value.filter(t => templateInPackage(t, pkgId)).length
}

const counts = computed(() => ({
  invitation:   allTemplates.value.filter(t => t.type === 'invitation'   && templateInPackage(t, activePackageId.value)).length,
  contribution: allTemplates.value.filter(t => t.type === 'contribution' && templateInPackage(t, activePackageId.value)).length,
}))

const emptyHint = computed(() =>
  activePackageId.value
    ? `No ${activeType.value} templates in ${activePackageLabel.value} yet — try another package.`
    : 'Check back soon — new designs are added regularly.'
)

// ── Pagination ────────────────────────────────────────────────────────────
const totalPages = computed(() => Math.max(1, Math.ceil(filteredTemplates.value.length / PAGE_SIZE)))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredTemplates.value.slice(start, start + PAGE_SIZE)
})

const pageNumbers = computed(() => {
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

function goTo(page) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Fetch ─────────────────────────────────────────────────────────────────
async function fetchTemplates() {
  loading.value = true
  try {
    const [tplSnap, pkgSnap] = await Promise.all([
      getDocs(query(collection(db, 'cardTemplates'), where('active', '==', true))),
      getDocs(query(collection(db, 'eventPlans'), orderBy('rank', 'asc'))),
    ])
    allTemplates.value = tplSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(t => t.type === 'invitation' || t.type === 'contribution')
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      })
    // Hidden packages (draft/retired) shouldn't appear as a browsable filter.
    packages.value = pkgSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => (p.visibility ?? 'public') !== 'hidden')
  } finally {
    loading.value = false
  }
}

// ── Lightbox state ─────────────────────────────────────────────────────────
const active    = ref(null)
const scale     = ref(1)
const tx        = ref(0)
const ty        = ref(0)
const dragging  = ref(false)

let dragStartX     = 0
let dragStartY     = 0
let lastTouchDist  = 0
let lastTouchScale = 1

const lbCursor = computed(() => {
  if (dragging.value)  return 'grabbing'
  if (scale.value > 1) return 'grab'
  return 'zoom-in'
})

function openLightbox(t) {
  active.value = t
  resetView()
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKey)
}

function closeLightbox() {
  active.value             = null
  dragging.value           = false
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKey)
}

function resetView() {
  scale.value = 1
  tx.value    = 0
  ty.value    = 0
}

function onKey(e) { if (e.key === 'Escape') closeLightbox() }

// ── Zoom ───────────────────────────────────────────────────────────────────
function clampScale(v) { return Math.min(5, Math.max(1, v)) }

function applyScale(v) {
  scale.value = clampScale(v)
  if (scale.value === 1) { tx.value = 0; ty.value = 0 }
}

function zoomIn()  { applyScale(scale.value + 0.5) }
function zoomOut() { applyScale(scale.value - 0.5) }

function onWheel(e) { applyScale(scale.value + (e.deltaY < 0 ? 0.15 : -0.15)) }

function onDblClick() {
  scale.value > 1 ? resetView() : applyScale(2.5)
}

// ── Mouse drag ─────────────────────────────────────────────────────────────
function onMouseDown(e) {
  if (scale.value <= 1) return
  dragging.value = true
  dragStartX     = e.clientX - tx.value
  dragStartY     = e.clientY - ty.value
}

function onMouseMove(e) {
  if (!dragging.value) return
  tx.value = e.clientX - dragStartX
  ty.value = e.clientY - dragStartY
}

function onMouseUp() { dragging.value = false }

// ── Touch ──────────────────────────────────────────────────────────────────
function onTouchStart(e) {
  if (e.touches.length === 2) {
    lastTouchDist  = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
    lastTouchScale = scale.value
    dragging.value = false
  } else if (e.touches.length === 1 && scale.value > 1) {
    dragging.value = true
    dragStartX     = e.touches[0].clientX - tx.value
    dragStartY     = e.touches[0].clientY - ty.value
  }
}

function onTouchMove(e) {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
    applyScale(lastTouchScale * (dist / lastTouchDist))
  } else if (e.touches.length === 1 && dragging.value) {
    tx.value = e.touches[0].clientX - dragStartX
    ty.value = e.touches[0].clientY - dragStartY
  }
}

function onTouchEnd(e) {
  if (e.touches.length < 2) dragging.value = false
}

onMounted(() => {
  fetchTemplates()
  document.addEventListener('click', onClickOutsidePkg)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutsidePkg)
})
</script>

<style scoped>
/* ── Tokens — same Calm Dark palette as /events (.me-root in MyEvents.vue),
   scoped to .gallery-root so this page reads as the same app, not a bespoke
   landing page bolted onto the side of it. ── */
.gallery-root {
  --ink:         #f0f0ec;
  --ink-soft:    #d4cfc8;
  --ink-muted:   #888;
  --ink-dim:     #555;
  --line:        #2a2a2a;
  --line-strong: #3a3a3a;
  --accent:      #c9a84c;
  --accent-deep: #a0863d;
  --accent-soft: rgba(201, 168, 76, 0.14);
  --shadow:      0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-lift: 0 4px 16px rgba(0, 0, 0, 0.4);
  --page-bg:     #070707;
  --card-bg:     #141414;
  --topbar-bg:   #141414;
  --dropdown-bg: #1a1a1a;

  min-height: 100vh;
  display: flow-root;
  background-color: var(--page-bg);
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--ink);
}

/* ── Topbar — floating glass capsule, mirrors /events exactly ── */
.gallery-topbar {
  position: sticky;
  top: 32px;
  z-index: 100;
  max-width: 1200px;
  margin: 32px auto 0;
  padding: 0 32px;
  box-sizing: border-box;
}
.gallery-topbar-inner {
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 14px;
  background: var(--topbar-bg);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.gallery-topbar-inner:hover {
  border-color: var(--line-strong);
  box-shadow: var(--shadow-lift);
}
.gallery-brand { display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 0; }
.gallery-brand-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
.gallery-brand-name {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: -0.1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.gallery-topbar-count {
  font-size: 12.5px; font-weight: 600; color: var(--ink-muted); white-space: nowrap; flex-shrink: 0;
}

/* ── Page shell — same 1200px column + padding as /events ── */
.gallery-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
}

/* ── Header ── */
.gallery-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}
.gallery-header-copy { display: flex; flex-direction: column; gap: 6px; }
.gallery-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink-muted);
}
.gallery-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 32px; font-weight: 700; letter-spacing: -0.5px; color: var(--ink); line-height: 1; margin: 0;
}
.gallery-sub { font-size: 13px; color: var(--ink-muted); margin: 0; font-weight: 400; }

.gallery-header-stats { display: flex; align-items: center; gap: 0; flex-shrink: 0; }
.gallery-hstat { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 0 22px; }
.gallery-hstat-div { width: 1px; height: 28px; background: var(--line); flex-shrink: 0; }
.gallery-hstat-val {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 28px; font-weight: 700; color: var(--ink); line-height: 1; letter-spacing: -0.2px;
}
.gallery-hstat-val--accent { color: var(--accent); }
.gallery-hstat-label { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink-muted); }

/* ── Controls bar — same shell as the /events status-filter bar ── */
.gallery-controls {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  background: var(--card-bg); border: 1px solid var(--line); border-radius: 14px;
  padding: 6px 6px 6px 12px; box-shadow: var(--shadow);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.gallery-tabs { display: flex; align-items: center; gap: 3px; }
.gallery-tab {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 12px; border-radius: 8px; border: 1px solid transparent;
  background: transparent; font-size: 13px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: all 180ms ease; white-space: nowrap;
}
.gallery-tab:hover { background: var(--page-bg); color: var(--ink); transform: translateY(-0.5px); }
.gallery-tab--active { background: var(--page-bg); border-color: var(--line); color: var(--ink); font-weight: 600; }
.gallery-tab-icon { width: 14px; height: 14px; flex-shrink: 0; }
.gallery-tab-count {
  font-size: 10.5px; font-weight: 600; background: var(--page-bg); color: var(--ink-muted);
  padding: 1px 6px; border-radius: 6px; transition: all 150ms ease;
}
.gallery-tab-count--active { background: var(--accent-soft); color: var(--accent-deep); }
.gallery-controls-right { display: flex; align-items: center; gap: 8px; }

/* ── Package filter — dropdown trigger matches the /events admin-pill pattern ── */
.pkg-filter-wrap { position: relative; }
.pkg-filter-trigger {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px 6px 14px; border-radius: 20px;
  border: 1px solid var(--line); background: var(--page-bg);
  font-size: 12.5px; font-weight: 500; color: var(--ink-soft);
  cursor: pointer; font-family: inherit; transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pkg-filter-trigger:hover {
  background: var(--card-bg); color: var(--ink); border-color: var(--line-strong);
  transform: translateY(-1px); box-shadow: var(--shadow);
}
.pkg-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.pkg-dot--all { background: #6b6b6b; }
.pkg-filter-chevron { width: 13px; height: 13px; color: var(--ink-dim); transition: transform 185ms cubic-bezier(0.16, 1, 0.3, 1); flex-shrink: 0; }
.pkg-filter-chevron--open { transform: rotate(180deg); }

.pkg-filter-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0; min-width: 230px; max-width: 300px;
  background: var(--dropdown-bg); border: 1px solid var(--line); border-radius: 16px;
  box-shadow: var(--shadow-lift); overflow: hidden; z-index: 200; padding: 6px;
  display: flex; flex-direction: column; gap: 1px;
}
.pkg-filter-row {
  display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 9px;
  border: none; background: transparent; color: var(--ink-soft); font-family: inherit;
  font-size: 12.5px; font-weight: 500; cursor: pointer; text-align: left; width: 100%;
  transition: background 120ms;
}
.pkg-filter-row:hover { background: rgba(255,255,255,0.05); }
.pkg-filter-row--active { background: var(--accent-soft); color: var(--accent); }
.pkg-filter-row-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pkg-count-badge {
  font-size: 10.5px; font-weight: 700; color: var(--ink-muted); background: rgba(255,255,255,0.05);
  border-radius: 8px; padding: 1px 7px; flex-shrink: 0;
}
.pkg-filter-row--active .pkg-count-badge { background: rgba(201,168,76,0.2); color: var(--accent); }
.pkg-filter-divider { height: 1px; background: var(--line); margin: 4px 6px; }

.pkg-fade-enter-active, .pkg-fade-leave-active { transition: opacity 140ms, transform 140ms; }
.pkg-fade-enter-from, .pkg-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Loading skeletons ── */
.gallery-skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
.gallery-skeleton {
  aspect-ratio: 3 / 4; border-radius: 14px;
  background: linear-gradient(90deg, var(--page-bg) 25%, var(--line) 50%, var(--page-bg) 75%);
  background-size: 200% 100%; animation: gallery-shimmer 1.4s infinite;
}
@keyframes gallery-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty state ── */
.gallery-empty {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  padding: 80px 20px; border: 1px dashed var(--line-strong); border-radius: 20px;
}
.gallery-empty-glyph { font-size: 32px; color: var(--accent); opacity: 0.6; }
.gallery-empty-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; font-weight: 700; font-size: 22px; color: var(--ink); margin: 0; text-align: center;
}
.gallery-empty-sub { font-size: 13px; color: var(--ink-muted); margin: 0; text-align: center; max-width: 340px; }

/* ── Grid — uniform card-shaped tiles, same idiom as the event photo gallery ── */
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
.gallery-card {
  position: relative; aspect-ratio: 3 / 4; border-radius: 14px; overflow: hidden;
  background: var(--card-bg); border: 1px solid var(--line); cursor: pointer;
  box-shadow: var(--shadow); transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.gallery-card:hover { border-color: var(--line-strong); box-shadow: var(--shadow-lift); transform: translateY(-3px) scale(1.01); }
.gallery-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: filter 250ms; }
.gallery-card:hover img { filter: brightness(0.88); }

/* Color-coded package strip — always on, so "which package(s)" reads at a
   glance even with the "All packages" filter active and no chip hovered. */
.gallery-card-stripe {
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  display: flex; z-index: 1;
}
.gallery-card-stripe-seg { flex: 1; height: 100%; }

.gallery-card-featured {
  position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 7px;
  background: rgba(7,7,7,0.72); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.gallery-card-featured-icon { width: 12px; height: 12px; color: var(--accent); }

.gallery-card-pkg {
  position: absolute; left: 8px; bottom: 8px;
  display: flex; align-items: center; gap: 5px;
  padding: 3px 8px 3px 6px; border-radius: 20px;
  background: rgba(7,7,7,0.78); backdrop-filter: blur(8px);
  color: var(--ink); font-size: 10px; font-weight: 600;
  max-width: calc(100% - 16px); overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
.gallery-card-pkg-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.gallery-card-pkg--universal { color: var(--ink-soft); font-weight: 500; font-style: italic; }

/* ── Pagination — same control shape as /events ── */
.gallery-pagination { display: flex; align-items: center; justify-content: center; padding-top: 8px; }
.gallery-pagination-controls { display: flex; align-items: center; gap: 4px; }
.gallery-page-btn {
  min-width: 34px; height: 34px; padding: 0 6px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); border-radius: 8px; background: var(--card-bg);
  font-size: 13px; font-weight: 500; color: var(--ink-muted); cursor: pointer; font-family: inherit;
  transition: border-color 130ms, color 130ms, background 130ms;
}
.gallery-page-btn:hover:not(:disabled):not(.gallery-page-btn--active) { border-color: var(--line-strong); color: var(--ink); }
.gallery-page-btn--active { background: var(--accent); border-color: var(--accent); color: #070707; font-weight: 700; }
.gallery-page-btn--nav { color: var(--ink-dim); }
.gallery-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.gallery-page-arrow { width: 15px; height: 15px; }
.gallery-page-ellipsis { width: 28px; text-align: center; font-size: 13px; color: var(--ink-dim); user-select: none; }

/* ── Lightbox — full-viewport overlay, independent of the page shell ── */
.lightbox {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0, 0, 0, 0.93);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(12px);
}

.lb-close {
  position: absolute; top: 16px; right: 16px;
  width: 38px; height: 38px; border-radius: 11px;
  border: 0.8px solid rgba(255,255,255,0.12);
  background: rgba(20,20,20,0.85); backdrop-filter: blur(8px);
  color: #AEAEB2; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 1; transition: color 150ms;
  -webkit-tap-highlight-color: transparent;
}
.lb-close:hover { color: #EEEEF0; }
.lb-close-icon  { width: 16px; height: 16px; }

.lb-hint {
  position: absolute; bottom: 72px; left: 50%; transform: translateX(-50%);
  font-size: 11px; color: rgba(174,174,178,0.5); white-space: nowrap;
  pointer-events: none; font-family: 'Inter', -apple-system, sans-serif;
  letter-spacing: 0.2px;
}

.lb-img {
  max-width: 92vw; max-height: 88vh;
  object-fit: contain; display: block;
  transform-origin: center center;
  user-select: none; -webkit-user-drag: none;
  will-change: transform;
}

.lb-controls {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 0;
  background: rgba(20,20,20,0.88); backdrop-filter: blur(12px);
  border: 0.8px solid rgba(255,255,255,0.1);
  border-radius: 40px; padding: 5px;
}

.lb-ctrl-btn {
  width: 36px; height: 36px; border-radius: 50%;
  border: none; background: transparent; color: #AEAEB2;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 150ms, color 150ms;
  -webkit-tap-highlight-color: transparent;
}
.lb-ctrl-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #EEEEF0; }
.lb-ctrl-btn:disabled { opacity: 0.3; cursor: default; }
.lb-ctrl-icon { width: 16px; height: 16px; }

.lb-scale {
  min-width: 52px; text-align: center;
  font-size: 13px; font-weight: 600; color: #EEEEF0;
  font-family: 'Inter', -apple-system, sans-serif;
}

.lb-fade-enter-active, .lb-fade-leave-active { transition: opacity 180ms; }
.lb-fade-enter-from,   .lb-fade-leave-to     { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 767px) {
  .gallery-topbar { top: 16px; margin-top: 16px; padding: 0 16px; }
  .gallery-topbar-inner { padding: 14px 18px; }
  .gallery-page { padding: 20px 16px 40px; }
  .gallery-header { align-items: flex-start; }
  .gallery-title { font-size: 26px; }
  .gallery-header-stats { width: 100%; justify-content: space-between; }
  .gallery-hstat { padding: 0 12px; }
  .gallery-controls { flex-direction: column; align-items: stretch; padding: 10px; gap: 10px; }
  .gallery-tabs { justify-content: center; }
  .gallery-controls-right { justify-content: center; }
  .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .lb-hint { display: none; }
}

@media (min-width: 520px) and (max-width: 767px) {
  .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
}
</style>
