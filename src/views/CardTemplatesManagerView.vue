<template>
  <div class="ctv-root">

    <!-- ── Topbar ── -->
    <nav class="ctv-topbar">
      <div class="ctv-topbar-inner">
        <span class="ctv-page-title">Card Templates</span>
        <button class="ctv-add-btn" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Template
        </button>
      </div>
    </nav>

    <div class="ctv-page">

      <!-- Stats -->
      <div v-if="!loading && templates.length" class="ctv-stats">
        <div class="ctv-stat">
          <span class="ctv-stat-num">{{ templates.length }}</span>
          <span class="ctv-stat-label">Total Templates</span>
        </div>
        <div class="ctv-stat">
          <span class="ctv-stat-num">{{ counts.invitation }}</span>
          <span class="ctv-stat-label">Invitation</span>
        </div>
        <div class="ctv-stat">
          <span class="ctv-stat-num">{{ counts.contribution }}</span>
          <span class="ctv-stat-label">Contribution</span>
        </div>
      </div>

      <!-- Filters -->
      <div v-if="!loading && templates.length" class="ctv-filters">
        <div class="ctv-type-tabs">
          <button
            v-for="t in TYPE_TABS" :key="t.value"
            class="ctv-type-tab" :class="{ 'ctv-type-tab--active': filterType === t.value }"
            @click="filterType = t.value"
          >{{ t.label }} <span class="ctv-type-tab-count">{{ t.value === 'all' ? templates.length : counts[t.value] }}</span></button>
        </div>
        <div class="ctv-pkg-filter-wrap" ref="pkgFilterWrapRef">
          <button class="ctv-pkg-filter-trigger" @click="pkgFilterOpen = !pkgFilterOpen">
            <span class="ctv-pkg-dot" :style="{ background: filterPackageId ? packageColor(filterPackageId) : '#5a5a5e' }" />
            {{ filterPackageId ? (packages.find(p => p.id === filterPackageId)?.name ?? 'All packages') : 'All packages' }}
            <svg class="ctv-chevron" :class="{ 'ctv-chevron--open': pkgFilterOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div v-if="pkgFilterOpen" class="ctv-pkg-filter-dropdown">
            <button class="ctv-pkg-filter-row" :class="{ 'ctv-pkg-filter-row--active': !filterPackageId }" @click="filterPackageId = null; pkgFilterOpen = false">
              <span class="ctv-pkg-dot" style="background:#5a5a5e" /> All packages
            </button>
            <div class="ctv-pkg-filter-divider" />
            <button
              v-for="p in packages" :key="p.id"
              class="ctv-pkg-filter-row" :class="{ 'ctv-pkg-filter-row--active': filterPackageId === p.id }"
              @click="filterPackageId = p.id; pkgFilterOpen = false"
            >
              <span class="ctv-pkg-dot" :style="{ background: packageColor(p.id) }" /> {{ p.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="ctv-skeleton-grid">
        <div class="ctv-skeleton" v-for="i in 8" :key="i" />
      </div>

      <!-- Empty (no templates at all) -->
      <div v-else-if="!templates.length" class="ctv-empty">
        <span class="ctv-empty-glyph">✦</span>
        <p class="ctv-empty-title">No card templates yet</p>
        <p class="ctv-empty-sub">Add your first template above.</p>
      </div>

      <!-- Empty (filtered to nothing) -->
      <div v-else-if="!filteredTemplates.length" class="ctv-empty">
        <span class="ctv-empty-glyph">✦</span>
        <p class="ctv-empty-title">No templates match this filter</p>
        <p class="ctv-empty-sub">Try a different type or package.</p>
      </div>

      <!-- Grid -->
      <div v-else class="ctv-grid">
        <div v-for="t in filteredTemplates" :key="t.id" class="ctv-card">
          <div class="ctv-card-img-wrap">
            <img :src="t.imageUrl" class="ctv-card-img" loading="lazy" />
            <span class="ctv-type-badge" :class="`ctv-type-badge--${t.type}`">{{ t.type }}</span>
            <span v-if="!t.active" class="ctv-inactive-badge">Inactive</span>
            <span v-if="t.featured" class="ctv-featured-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9 7.1.6-5.5 4.6 1.7 7-6.2-4-6.2 4 1.7-7-5.5-4.6 7.1-.6z"/></svg>
            </span>
          </div>
          <div class="ctv-card-body">
            <div class="ctv-pkg-chips">
              <span v-if="!t.packageIds?.length" class="ctv-pkg-chip ctv-pkg-chip--universal">All packages</span>
              <span v-for="pid in t.packageIds" :key="pid" class="ctv-pkg-chip">
                <span class="ctv-pkg-chip-dot" :style="{ background: packageColor(pid) }" />
                {{ packageName(pid) }}
              </span>
            </div>
            <div class="ctv-card-actions">
              <button class="ctv-icon-btn" title="Edit" @click="openEdit(t)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="ctv-icon-btn ctv-icon-btn--danger" title="Delete" @click="confirmDelete(t)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Create / Edit Modal ── -->
    <Teleport to="body">
      <Transition name="ctv-fade">
        <div v-if="showModal" class="ctv-backdrop" @click.self="closeModal">
          <div class="ctv-modal">

            <div class="ctv-modal-header">
              <span class="ctv-modal-title">{{ editingId ? 'Edit Template' : 'New Template' }}</span>
              <button class="ctv-close-btn" @click="closeModal">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="ctv-modal-body">

              <!-- Image -->
              <div class="ctv-modal-section-label">Card Image</div>
              <label class="ctv-drop" :class="{ 'ctv-drop--has': form.imageUrl }">
                <input type="file" accept="image/*" class="ctv-drop-input" @change="handleImageFile" :disabled="uploading" />
                <img v-if="form.imageUrl" :src="form.imageUrl" class="ctv-drop-preview" />
                <template v-else>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span class="ctv-drop-hint">Click to upload an image</span>
                </template>
                <div v-if="uploading" class="ctv-drop-progress">
                  <div class="ctv-drop-progress-bar" :style="{ width: Math.round(uploadProgress * 100) + '%' }" />
                </div>
              </label>

              <!-- Type -->
              <div class="ctv-modal-section-label">Type</div>
              <div class="ctv-type-modes" role="radiogroup">
                <button
                  v-for="t in ['invitation', 'contribution']" :key="t"
                  type="button" role="radio" :aria-checked="form.type === t"
                  class="ctv-type-mode" :class="{ 'ctv-type-mode--on': form.type === t }"
                  @click="form.type = t"
                >
                  <span class="ctv-type-radio" />
                  <span class="ctv-type-mode-label">{{ t === 'invitation' ? 'Invitation' : 'Contribution' }}</span>
                </button>
              </div>

              <!-- Toggles -->
              <div class="ctv-toggle-row">
                <div class="ctv-toggle-field">
                  <span class="ctv-field-label">Active</span>
                  <button class="ctv-toggle" :class="{ 'ctv-toggle--on': form.active }" @click="form.active = !form.active">
                    <span class="ctv-toggle-knob" />
                  </button>
                </div>
                <div class="ctv-toggle-field">
                  <span class="ctv-field-label">Featured</span>
                  <button class="ctv-toggle" :class="{ 'ctv-toggle--on': form.featured }" @click="form.featured = !form.featured">
                    <span class="ctv-toggle-knob" />
                  </button>
                </div>
              </div>

              <!-- Package assignment -->
              <div class="ctv-modal-section-label">Available in packages</div>
              <p class="ctv-vis-note">
                Leave every package unchecked to make this template available everywhere.
                Check specific packages to restrict it to only those.
              </p>
              <div class="ctv-chip-row">
                <button
                  v-for="p in packages" :key="p.id"
                  type="button"
                  class="ctv-pkg-toggle-chip"
                  :class="{ 'ctv-pkg-toggle-chip--on': form.packageIds.includes(p.id) }"
                  @click="togglePackage(p.id)"
                >
                  <span class="ctv-pkg-check" aria-hidden="true">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span class="ctv-pkg-dot" :style="{ background: packageColor(p.id) }" />
                  {{ p.name }}
                </button>
                <span v-if="!packages.length" class="ctv-vis-empty">No packages yet — create one on the Packages screen.</span>
              </div>

            </div>

            <div class="ctv-modal-footer">
              <button class="ctv-btn-cancel" @click="closeModal">Cancel</button>
              <button class="ctv-btn-save" :disabled="saving || uploading || !form.imageUrl" @click="saveTemplate">
                {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Create Template') }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirm ── -->
    <Teleport to="body">
      <Transition name="ctv-fade">
        <div v-if="deleteTarget" class="ctv-backdrop" @click.self="deleteTarget = null">
          <div class="ctv-confirm-box">
            <div class="ctv-warn-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ctv-warn-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="ctv-confirm-title">Delete this template?</p>
            <p class="ctv-confirm-body">This card will no longer appear in the customer gallery. This cannot be undone.</p>
            <div class="ctv-confirm-row">
              <button class="ctv-btn-cancel" :disabled="deleting" @click="deleteTarget = null">Cancel</button>
              <button class="ctv-btn-danger" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Deleting…' : 'Delete Template' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db, storage } from '../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import {
  ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage'

// Reused from the customer gallery (MyEvents invitation-card palette) so package
// dots read as the same visual language across both apps.
const PALETTE = ['#C9A84C', '#C8A0B4', '#7090d0', '#30D158', '#B0A898', '#C87878']

const TYPE_TABS = [
  { value: 'all',          label: 'All' },
  { value: 'invitation',   label: 'Invitation' },
  { value: 'contribution', label: 'Contribution' },
]

const templates = ref([])
const packages  = ref([])
const loading   = ref(true)

const filterType      = ref('all')
const filterPackageId = ref(null)
const pkgFilterOpen    = ref(false)
const pkgFilterWrapRef = ref(null)

function onClickOutsidePkgFilter(e) {
  if (pkgFilterWrapRef.value && !pkgFilterWrapRef.value.contains(e.target)) pkgFilterOpen.value = false
}

const packageIndex = computed(() => new Map(packages.value.map((p, i) => [p.id, i])))
function packageColor(id) {
  const i = packageIndex.value.get(id)
  return PALETTE[(i ?? 0) % PALETTE.length]
}
function packageName(id) { return packages.value.find(p => p.id === id)?.name ?? 'Unknown package' }

// A template with no packageIds is universal, matching how eventPlans.visibility
// treats an absent field — existing templates don't need a migration.
function templateInPackage(t, pkgId) {
  if (!pkgId) return true
  if (!t.packageIds?.length) return true
  return t.packageIds.includes(pkgId)
}

const counts = computed(() => ({
  invitation:   templates.value.filter(t => t.type === 'invitation').length,
  contribution: templates.value.filter(t => t.type === 'contribution').length,
}))

const filteredTemplates = computed(() => templates.value.filter(t =>
  (filterType.value === 'all' || t.type === filterType.value) &&
  templateInPackage(t, filterPackageId.value)
))

// ── Modal state ─────────────────────────────────────────────────────────────
const showModal    = ref(false)
const saving       = ref(false)
const editingId    = ref(null)
const deleteTarget = ref(null)
const deleting     = ref(false)

const uploading       = ref(false)
const uploadProgress  = ref(0)
let currentStoragePath = null

function emptyForm() {
  return { type: 'invitation', imageUrl: '', storagePath: '', active: true, featured: false, packageIds: [] }
}
const form = ref(emptyForm())

function togglePackage(id) {
  const i = form.value.packageIds.indexOf(id)
  if (i === -1) form.value.packageIds.push(id)
  else form.value.packageIds.splice(i, 1)
}

async function handleImageFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return

  uploading.value      = true
  uploadProgress.value = 0
  try {
    const path = `cardTemplates/${Date.now()}_${file.name}`
    const sRef = storageRef(storage, path)
    const task = uploadBytesResumable(sRef, file)
    await new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        snap => { uploadProgress.value = snap.bytesTransferred / snap.totalBytes },
        reject,
        resolve,
      )
    })
    const url = await getDownloadURL(sRef)
    // The previous image (if any) is now orphaned — clean it up so re-uploading
    // during editing doesn't leave dangling files in storage.
    if (currentStoragePath && currentStoragePath !== path) {
      try { await deleteObject(storageRef(storage, currentStoragePath)) } catch (_) {}
    }
    currentStoragePath   = path
    form.value.imageUrl     = url
    form.value.storagePath  = path
  } catch (e) {
    console.error('Upload failed', e)
  } finally {
    uploading.value      = false
    uploadProgress.value = 0
  }
}

function openCreate() {
  editingId.value        = null
  form.value              = emptyForm()
  currentStoragePath      = null
  showModal.value         = true
}

function openEdit(t) {
  editingId.value     = t.id
  form.value = {
    type: t.type ?? 'invitation',
    imageUrl: t.imageUrl ?? '',
    storagePath: t.storagePath ?? '',
    active: t.active ?? true,
    featured: t.featured ?? false,
    packageIds: [...(t.packageIds ?? [])],
  }
  currentStoragePath = t.storagePath ?? null
  showModal.value    = true
}

function closeModal() {
  showModal.value  = false
  editingId.value  = null
}

async function saveTemplate() {
  if (!form.value.imageUrl) return
  saving.value = true
  try {
    const payload = {
      type:        form.value.type,
      imageUrl:    form.value.imageUrl,
      storagePath: form.value.storagePath,
      active:      form.value.active,
      featured:    form.value.featured,
      packageIds:  [...new Set(form.value.packageIds)],
    }
    if (editingId.value) {
      await updateDoc(doc(db, 'cardTemplates', editingId.value), payload)
    } else {
      await addDoc(collection(db, 'cardTemplates'), { ...payload, createdAt: serverTimestamp() })
    }
    closeModal()
    await load()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function confirmDelete(t) { deleteTarget.value = t }

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    if (deleteTarget.value.storagePath) {
      try { await deleteObject(storageRef(storage, deleteTarget.value.storagePath)) } catch (_) {}
    }
    await deleteDoc(doc(db, 'cardTemplates', deleteTarget.value.id))
    deleteTarget.value = null
    await load()
  } catch (e) {
    console.error(e)
  } finally {
    deleting.value = false
  }
}

async function load() {
  loading.value = true
  try {
    const [tplSnap, pkgSnap] = await Promise.all([
      getDocs(collection(db, 'cardTemplates')),
      getDocs(query(collection(db, 'eventPlans'), orderBy('rank', 'asc'))),
    ])
    templates.value = tplSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    packages.value = pkgSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  document.addEventListener('click', onClickOutsidePkgFilter)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutsidePkgFilter)
})
</script>

<style scoped>
/* ── Tokens ── */
.ctv-root {
  --ink:         #f0f0ec;
  --ink-muted:   #888;
  --ink-dim:     #555;
  --line:        #242424;
  --line-strong: #2a2a2a;
  --gold:        #C9A84C;
  --gold-bg:     rgba(201,168,76,0.08);
  --gold-border: rgba(201,168,76,0.25);
  min-height: 100vh;
  background: #0a0a0b;
  color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Topbar ── */
.ctv-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.ctv-topbar-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.ctv-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px;
}
.ctv-add-btn {
  display: flex; align-items: center; gap: 7px;
  background: var(--gold); color: #070707; border: none;
  padding: 8px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 130ms;
}
.ctv-add-btn:hover { background: #d4b560; }

/* ── Page shell ── */
.ctv-page {
  max-width: 1280px; margin: 0 auto;
  padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Stats ── */
.ctv-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px;
}
.ctv-stat {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 14px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ctv-stat-num { font-size: 32px; font-weight: 700; color: var(--ink); letter-spacing: -0.5px; line-height: 1; }
.ctv-stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-dim); }

/* ── Filters ── */
.ctv-filters { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.ctv-type-tabs { display: flex; gap: 6px; }
.ctv-type-tab {
  padding: 7px 14px; border-radius: 9px; border: 1px solid var(--line-strong);
  background: #141414; color: var(--ink-muted); font-family: inherit; font-size: 12.5px; font-weight: 600;
  cursor: pointer; transition: background 130ms, color 130ms, border-color 130ms;
  display: flex; align-items: center; gap: 6px;
}
.ctv-type-tab:hover { color: var(--ink); border-color: rgba(255,255,255,0.2); }
.ctv-type-tab--active { background: var(--gold-bg); border-color: var(--gold-border); color: var(--gold); }
.ctv-type-tab-count {
  font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.06); border-radius: 7px; padding: 1px 6px; color: inherit;
}

.ctv-pkg-filter-wrap { position: relative; }
.ctv-pkg-filter-trigger {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 12px; border-radius: 9px; border: 1px solid var(--line-strong);
  background: #141414; color: var(--ink); font-family: inherit; font-size: 12.5px; font-weight: 600;
  cursor: pointer;
}
.ctv-pkg-filter-trigger:hover { border-color: rgba(255,255,255,0.2); }
.ctv-pkg-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.ctv-chevron { color: var(--ink-dim); transition: transform 160ms; }
.ctv-chevron--open { transform: rotate(180deg); }
.ctv-pkg-filter-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0; min-width: 220px;
  background: #161616; border: 1px solid var(--line-strong); border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.5); padding: 6px; z-index: 50;
  display: flex; flex-direction: column; gap: 1px;
}
.ctv-pkg-filter-row {
  display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 8px;
  border: none; background: transparent; color: var(--ink-muted); font-family: inherit;
  font-size: 12.5px; font-weight: 500; cursor: pointer; text-align: left; width: 100%;
}
.ctv-pkg-filter-row:hover { background: rgba(255,255,255,0.05); }
.ctv-pkg-filter-row--active { background: var(--gold-bg); color: var(--gold); }
.ctv-pkg-filter-divider { height: 1px; background: var(--line-strong); margin: 4px 6px; }

/* ── Skeletons / empty ── */
.ctv-skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.ctv-skeleton {
  height: 220px; border-radius: 14px;
  background: linear-gradient(90deg, #141414 25%, #1a1a1a 50%, #141414 75%);
  background-size: 200% 100%; animation: ctv-shimmer 1.4s infinite;
}
@keyframes ctv-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.ctv-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 20px; border: 1px dashed var(--line-strong); border-radius: 20px;
}
.ctv-empty-glyph { font-size: 28px; color: var(--gold); opacity: 0.6; }
.ctv-empty-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: var(--ink); margin: 0; }
.ctv-empty-sub { font-size: 13px; color: var(--ink-muted); margin: 0; }

/* ── Grid ── */
.ctv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.ctv-card {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 14px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; flex-direction: column;
}
.ctv-card-img-wrap { position: relative; aspect-ratio: 3 / 4; background: #1c1c1e; }
.ctv-card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ctv-type-badge {
  position: absolute; top: 8px; left: 8px;
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 7px; backdrop-filter: blur(6px);
}
.ctv-type-badge--invitation   { background: rgba(201,168,76,0.85); color: #1a1200; }
.ctv-type-badge--contribution { background: rgba(200,120,120,0.85); color: #200a0a; }
.ctv-inactive-badge {
  position: absolute; bottom: 8px; left: 8px;
  font-size: 9.5px; font-weight: 700; color: #eee; background: rgba(0,0,0,0.65);
  padding: 3px 8px; border-radius: 7px;
}
.ctv-featured-badge {
  position: absolute; top: 8px; right: 8px; width: 22px; height: 22px; border-radius: 6px;
  background: rgba(17,17,20,0.72); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; color: var(--gold);
}
.ctv-card-body { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.ctv-pkg-chips { display: flex; flex-wrap: wrap; gap: 5px; flex: 1; }
.ctv-pkg-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 10.5px; font-weight: 600; color: var(--ink-muted);
  background: rgba(255,255,255,0.04); border: 1px solid var(--line-strong);
  border-radius: 7px; padding: 3px 7px;
}
.ctv-pkg-chip--universal { color: var(--ink-dim); font-style: italic; font-weight: 500; }
.ctv-pkg-chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.ctv-card-actions { display: flex; gap: 6px; justify-content: flex-end; }
.ctv-icon-btn {
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid var(--line-strong); background: transparent; color: var(--ink-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 130ms, color 130ms, border-color 130ms;
}
.ctv-icon-btn:hover { background: rgba(255,255,255,0.05); color: var(--ink); border-color: rgba(255,255,255,0.12); }
.ctv-icon-btn--danger:hover { background: rgba(255,69,58,0.12); color: #FF453A; border-color: rgba(255,69,58,0.2); }

/* ── Backdrop / modal ── */
/* Teleport moves this to a direct child of <body>, outside .ctv-root — so it
   can't inherit .ctv-root's custom properties through the DOM tree. Without
   redeclaring them here, every var(--gold)/var(--ink-muted)/var(--line-strong)
   inside the modal resolves to nothing: the Save button loses its gold fill,
   package chips lose their selected-state border/background, and borders
   throughout the modal silently vanish (an invalid var() drops the whole
   declaration, not just that one value). */
.ctv-backdrop {
  --ink:         #f0f0ec;
  --ink-muted:   #888;
  --ink-dim:     #555;
  --line:        #242424;
  --line-strong: #2a2a2a;
  --gold:        #C9A84C;
  --gold-bg:     rgba(201,168,76,0.08);
  --gold-border: rgba(201,168,76,0.25);
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box;
}
.ctv-modal {
  background: #161616; border: 1px solid #2a2a2a; border-radius: 16px;
  width: 560px; max-width: 100%; max-height: 90vh;
  display: flex; flex-direction: column; box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.ctv-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid #2a2a2a; flex-shrink: 0;
}
.ctv-modal-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px; margin: 0; }
.ctv-close-btn {
  width: 32px; height: 32px; border-radius: 9px; border: 1px solid #2a2a2a; background: transparent; color: var(--ink-muted);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: color 150ms; padding: 0; box-sizing: border-box;
}
.ctv-close-btn:hover { color: var(--ink); }
.ctv-modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
.ctv-modal-section-label { font-size: 9.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink-dim); padding-top: 4px; }

/* ── Image drop ── */
.ctv-drop {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  min-height: 160px; border: 1.5px dashed var(--line-strong); border-radius: 14px;
  color: var(--ink-dim); cursor: pointer; overflow: hidden; background: rgba(255,255,255,0.02);
  transition: border-color 130ms;
}
.ctv-drop:hover { border-color: var(--ink-muted); }
.ctv-drop--has { border-style: solid; padding: 0; }
.ctv-drop-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.ctv-drop-hint { font-size: 12.5px; }
.ctv-drop-preview { width: 100%; max-height: 320px; object-fit: contain; display: block; }
.ctv-drop-progress { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(0,0,0,0.4); }
.ctv-drop-progress-bar { height: 100%; background: var(--gold); transition: width 150ms; }

/* ── Type radio ── */
.ctv-type-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ctv-type-mode {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 10px;
  cursor: pointer; font-family: inherit; border: 1px solid var(--line-strong); background: rgba(255,255,255,0.02);
  transition: border-color 140ms, background 140ms;
}
.ctv-type-mode:hover { border-color: rgba(255,255,255,0.28); }
.ctv-type-mode--on { border-color: var(--gold); background: rgba(201,168,76,0.12); }
.ctv-type-radio {
  width: 15px; height: 15px; flex-shrink: 0; box-sizing: border-box;
  border-radius: 50%; border: 1.5px solid var(--ink-dim); position: relative; transition: border-color 140ms;
}
.ctv-type-mode--on .ctv-type-radio { border-color: var(--gold); }
.ctv-type-mode--on .ctv-type-radio::after {
  content: ''; position: absolute; inset: 3px; border-radius: 50%; background: var(--gold);
}
.ctv-type-mode-label { font-size: 13px; font-weight: 700; color: var(--ink); }
.ctv-type-mode--on .ctv-type-mode-label { color: var(--gold); }

/* ── Toggles ── */
.ctv-toggle-row { display: flex; gap: 24px; }
.ctv-toggle-field { display: flex; align-items: center; gap: 10px; }
.ctv-field-label { font-size: 12.5px; font-weight: 600; color: var(--ink-muted); }
.ctv-toggle {
  width: 34px; height: 20px; border-radius: 10px; background: #383838; border: 1px solid #484848; padding: 2px;
  display: flex; align-items: center; flex-shrink: 0; cursor: pointer; transition: background 200ms, border-color 200ms;
}
.ctv-toggle--on { background: var(--gold); border-color: var(--gold); }
.ctv-toggle-knob { width: 15px; height: 15px; border-radius: 50%; background: #fff; transition: transform 200ms; box-shadow: 0 1px 3px rgba(0,0,0,0.25); }
.ctv-toggle--on .ctv-toggle-knob { transform: translateX(14px); }

/* ── Package chips ── */
.ctv-vis-note { font-size: 11.5px; color: var(--ink-dim); line-height: 1.5; margin: -4px 0 0; }
.ctv-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.ctv-pkg-toggle-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; border-radius: 9px; padding: 6px 10px;
  border: 1px solid var(--line-strong); background: transparent; color: var(--ink-muted);
  font-family: inherit; cursor: pointer; transition: border-color 130ms, background 130ms, color 130ms;
}
.ctv-pkg-toggle-chip:hover { border-color: rgba(255,255,255,0.28); color: var(--ink); }
.ctv-pkg-toggle-chip--on { border-color: var(--gold-border); background: var(--gold-bg); color: var(--gold); }
/* A real checkbox glyph — a border/background tint alone reads as "nothing
   changed" against this dark panel, so selection needs its own explicit mark. */
.ctv-pkg-check {
  width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; box-sizing: border-box;
  border: 1.5px solid var(--line-strong); background: transparent; color: transparent;
  display: flex; align-items: center; justify-content: center;
  transition: background 130ms, border-color 130ms, color 130ms;
}
.ctv-pkg-toggle-chip--on .ctv-pkg-check { background: var(--gold); border-color: var(--gold); color: #070707; }
.ctv-vis-empty { font-size: 11.5px; color: var(--ink-dim); font-style: italic; }

/* ── Footer / buttons ── */
.ctv-modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid #2a2a2a; flex-shrink: 0; }
.ctv-btn-cancel {
  background: transparent; border: 1px solid #2a2a2a; color: var(--ink-muted);
  padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms;
}
.ctv-btn-cancel:hover:not(:disabled) { background: #1e1e1e; color: var(--ink); }
.ctv-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
.ctv-btn-save {
  background: var(--gold); color: #070707; border: none;
  padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 130ms;
}
.ctv-btn-save:hover:not(:disabled) { background: #d4b560; }
.ctv-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Delete confirm ── */
.ctv-confirm-box {
  width: 100%; max-width: 360px; background: #161616; border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 28px 28px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.ctv-warn-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px; background: rgba(255,69,58,0.10); border: 1px solid rgba(255,69,58,0.2);
  display: flex; align-items: center; justify-content: center;
}
.ctv-warn-icon { color: #FF453A; }
.ctv-confirm-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); margin: 0; }
.ctv-confirm-body { font-size: 13.5px; color: var(--ink-muted); margin: 0; line-height: 1.5; }
.ctv-confirm-row { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
.ctv-confirm-row .ctv-btn-cancel { flex: 1; }
.ctv-btn-danger {
  flex: 1; padding: 8px 18px; border-radius: 9px; border: 1px solid rgba(255,69,58,0.2); background: rgba(255,69,58,0.12);
  color: #FF453A; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 130ms;
}
.ctv-btn-danger:hover:not(:disabled) { opacity: 0.85; }
.ctv-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Transition ── */
.ctv-fade-enter-active, .ctv-fade-leave-active { transition: opacity 180ms; }
.ctv-fade-enter-from, .ctv-fade-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 700px) {
  .ctv-page { padding: 20px 16px 32px; }
  .ctv-topbar-inner { padding: 12px 16px; }
  .ctv-filters { flex-direction: column; align-items: flex-start; }
}
</style>
