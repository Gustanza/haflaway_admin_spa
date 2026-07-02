<template>
  <div class="ce-root">

    <!-- Nav -->
    <nav class="ce-nav">
      <div class="ce-nav-inner">
        <div class="ce-nav-left">
          <div class="ce-brand" @click="$router.push('/')">
            <span class="ce-brand-dot" />
            <span class="ce-brand-name">Haflaway</span>
          </div>
          <div class="ce-breadcrumb">
            <span class="ce-sep">/</span>
            <span class="ce-crumb" @click="$router.push('/my-events')">All Events</span>
            <span class="ce-sep">/</span>
            <span class="ce-crumb ce-crumb--event" @click="$router.push(`/event/${eventId}/overview`)">{{ form.title || '…' }}</span>
            <span class="ce-sep">/</span>
            <span class="ce-crumb ce-crumb--page">Edit Event</span>
          </div>
        </div>
        <div class="ce-nav-right">
          <div class="ce-avatar-pill">
            <div class="ce-avatar-dot" />
            <span class="ce-avatar-label">Admin</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading skeleton -->
    <div v-if="loadingEvent" class="ce-body">
      <div class="ce-skeleton-section" v-for="i in 4" :key="i" />
    </div>

    <!-- Form body -->
    <div v-else class="ce-body">
      <form class="ce-form" @submit.prevent="handleSubmit" novalidate>

        <!-- Thumbnail -->
        <div class="ce-section">
          <div class="ce-section-label">Event Thumbnail</div>
          <div
            class="ce-thumb-drop"
            :class="{ 'ce-thumb-drop--has': thumbPreview }"
            @click="$refs.thumbInput.click()"
            @dragover.prevent
            @drop.prevent="onThumbDrop"
          >
            <img v-if="thumbPreview" :src="thumbPreview" class="ce-thumb-preview" />
            <div v-else class="ce-thumb-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p class="ce-thumb-hint">Click or drag to replace thumbnail</p>
              <p class="ce-thumb-sub">Recommended: 16:9, at least 800×450px</p>
            </div>
            <input ref="thumbInput" type="file" accept="image/*" class="ce-hidden" @change="onThumbChange" />
          </div>
        </div>

        <!-- Basic info -->
        <div class="ce-section">
          <div class="ce-section-label">Basic Information</div>
          <div class="ce-fields">

            <div class="ce-field" :class="{ 'ce-field--error': errors.title }">
              <label class="ce-label">Event Title <span class="ce-req">*</span></label>
              <input v-model="form.title" type="text" class="ce-input" placeholder="e.g. Gatsby Night" @input="errors.title = ''" />
              <span v-if="errors.title" class="ce-field-error">{{ errors.title }}</span>
            </div>

            <div class="ce-field" :class="{ 'ce-field--error': errors.category }">
              <label class="ce-label">Category <span class="ce-req">*</span></label>
              <button type="button" class="ce-select-btn" @click="showCatPicker = true" :class="{ 'ce-select-btn--empty': !form.categoryId }">
                <span>{{ form.categoryName || 'Select a category' }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <span v-if="errors.category" class="ce-field-error">{{ errors.category }}</span>
            </div>

            <div class="ce-field ce-field--full" :class="{ 'ce-field--error': errors.description }">
              <label class="ce-label">Description <span class="ce-req">*</span></label>
              <textarea v-model="form.description" class="ce-textarea" rows="4" placeholder="Tell us more about the event…" @input="errors.description = ''" />
              <span v-if="errors.description" class="ce-field-error">{{ errors.description }}</span>
            </div>

          </div>
        </div>

        <!-- Date & Time -->
        <div class="ce-section">
          <div class="ce-section-label">Date &amp; Time</div>
          <div class="ce-fields">

            <div class="ce-field" :class="{ 'ce-field--error': errors.startDate }">
              <label class="ce-label">Start Date &amp; Time <span class="ce-req">*</span></label>
              <input v-model="form.startDate" type="datetime-local" class="ce-input" @change="errors.startDate = ''" />
              <span v-if="errors.startDate" class="ce-field-error">{{ errors.startDate }}</span>
            </div>

            <div class="ce-field">
              <label class="ce-label">End Date &amp; Time</label>
              <input v-model="form.endDate" type="datetime-local" class="ce-input" />
            </div>

          </div>
        </div>

        <!-- Additional details -->
        <div class="ce-section">
          <div class="ce-section-label">Additional Details</div>
          <div class="ce-fields">

            <div class="ce-field" :class="{ 'ce-field--error': errors.location }">
              <label class="ce-label">Location <span class="ce-req">*</span></label>
              <input v-model="form.location" type="text" class="ce-input" placeholder="e.g. Mlimani City Hall" @input="errors.location = ''" />
              <span v-if="errors.location" class="ce-field-error">{{ errors.location }}</span>
            </div>

            <div class="ce-field" :class="{ 'ce-field--error': errors.supportPhone }">
              <label class="ce-label">Support Number <span class="ce-req">*</span></label>
              <input v-model="form.supportPhone" type="tel" class="ce-input" placeholder="+255 7XX XXX XXX" @input="errors.supportPhone = ''" />
              <span v-if="errors.supportPhone" class="ce-field-error">{{ errors.supportPhone }}</span>
            </div>

            <div class="ce-field">
              <label class="ce-label">Event Plan <span class="ce-optional">(optional)</span></label>
              <button type="button" class="ce-select-btn" @click="showPlanPicker = true" :class="{ 'ce-select-btn--empty': !form.eventPlanId }">
                <span>{{ form.eventPlanName || 'Select a plan' }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>

            <div class="ce-field">
              <label class="ce-label">Language</label>
              <div class="ce-radio-row">
                <label class="ce-radio-opt" :class="{ 'ce-radio-opt--active': form.language === 'sw' }">
                  <input type="radio" v-model="form.language" value="sw" class="ce-hidden" /> Kiswahili
                </label>
                <label class="ce-radio-opt" :class="{ 'ce-radio-opt--active': form.language === 'en' }">
                  <input type="radio" v-model="form.language" value="en" class="ce-hidden" /> English
                </label>
              </div>
            </div>

          </div>
        </div>

        <!-- Global error -->
        <div v-if="submitError" class="ce-submit-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ submitError }}
        </div>

        <!-- Actions -->
        <div class="ce-actions">
          <button type="button" class="ce-cancel-btn" @click="$router.push('/my-events')">Cancel</button>
          <button type="submit" class="ce-submit-btn" :disabled="saving">
            <span v-if="saving" class="ce-spinner" />
            <span v-else>Save Changes</span>
          </button>
        </div>

      </form>
    </div>

    <!-- Category picker -->
    <Transition name="fade">
      <div v-if="showCatPicker" class="ce-modal-backdrop" @click.self="showCatPicker = false">
        <div class="ce-modal">
          <div class="ce-modal-head">
            <span class="ce-modal-title">Select Category</span>
            <button class="ce-modal-close" @click="showCatPicker = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="ce-modal-list">
            <div v-if="loadingCats" class="ce-modal-loading">Loading…</div>
            <button v-for="cat in categories" :key="cat.id" type="button" class="ce-modal-item" :class="{ 'ce-modal-item--active': form.categoryId === cat.id }" @click="selectCategory(cat)">
              {{ cat.name }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Plan picker -->
    <Transition name="fade">
      <div v-if="showPlanPicker" class="ce-modal-backdrop" @click.self="showPlanPicker = false">
        <div class="ce-modal">
          <div class="ce-modal-head">
            <span class="ce-modal-title">Select Plan</span>
            <button class="ce-modal-close" @click="showPlanPicker = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="ce-modal-list">
            <div v-if="loadingPlans" class="ce-modal-loading">Loading…</div>
            <button v-for="plan in plans" :key="plan.id" type="button" class="ce-modal-item" :class="{ 'ce-modal-item--active': form.eventPlanId === plan.id }" @click="selectPlan(plan)">
              ★ {{ plan.name }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db, auth, storage } from '../firebase'
import { doc, getDoc, setDoc, getDocs, collection, query, orderBy } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const router = useRouter()
const route = useRoute()
const eventId = route.params.eventId
const uid = auth.currentUser?.uid

const loadingEvent = ref(true)
const saving = ref(false)
const submitError = ref('')
const errors = ref({})

const thumbFile = ref(null)
const thumbPreview = ref('')
const existingThumbUrl = ref('')

const categories = ref([])
const plans = ref([])
const loadingCats = ref(false)
const loadingPlans = ref(false)
const showCatPicker = ref(false)
const showPlanPicker = ref(false)

const form = ref({
  title: '',
  categoryId: '',
  categoryName: '',
  categoryLevel: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
  supportPhone: '',
  eventPlanId: null,
  eventPlanName: '',
  language: 'sw',
})

// ── ISO → datetime-local string ────────────────────────────────────────────

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  // datetime-local needs "YYYY-MM-DDTHH:mm"
  return d.toISOString().slice(0, 16)
}

// ── Load existing event ────────────────────────────────────────────────────

onMounted(async () => {
  loadingCats.value = true
  loadingPlans.value = true

  try {
    const [eventSnap, catSnap, planSnap] = await Promise.all([
      getDoc(doc(db, 'events', eventId)),
      getDocs(collection(db, 'eventCategories')),
      getDocs(query(collection(db, 'eventPlans'), orderBy('rank', 'asc'))),
    ])

    categories.value = catSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    plans.value = planSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    if (eventSnap.exists()) {
      const e = eventSnap.data()
      existingThumbUrl.value = e.eventThumbnail ?? ''
      thumbPreview.value = e.eventThumbnail ?? ''

      // Resolve category name from loaded categories
      const cat = categories.value.find(c => c.id === e.categoryId)
      const plan = plans.value.find(p => p.id === e.eventPlanId)

      form.value = {
        title: e.title ?? '',
        categoryId: e.categoryId ?? '',
        categoryName: cat?.name ?? e.categoryId ?? '',
        categoryLevel: e.categoryLevel ?? '',
        description: e.description ?? '',
        startDate: toDatetimeLocal(e.startDate),
        endDate: toDatetimeLocal(e.endDate),
        location: e.location ?? '',
        supportPhone: e.supportPhone ?? '',
        eventPlanId: e.eventPlanId ?? null,
        eventPlanName: plan?.name ?? '',
        language: e.language ?? 'sw',
      }
    }
  } catch (e) {
    console.error('Failed to load event:', e)
  } finally {
    loadingEvent.value = false
    loadingCats.value = false
    loadingPlans.value = false
  }
})

// ── Thumbnail ──────────────────────────────────────────────────────────────

function onThumbChange(e) {
  const file = e.target.files[0]
  if (!file) return
  thumbFile.value = file
  thumbPreview.value = URL.createObjectURL(file)
}

function onThumbDrop(e) {
  const file = e.dataTransfer.files[0]
  if (!file || !file.type.startsWith('image/')) return
  thumbFile.value = file
  thumbPreview.value = URL.createObjectURL(file)
}

// ── Pickers ────────────────────────────────────────────────────────────────

function selectCategory(cat) {
  form.value.categoryId = cat.id
  form.value.categoryName = cat.name
  form.value.categoryLevel = cat.level ?? ''
  errors.value.category = ''
  showCatPicker.value = false
}

function selectPlan(plan) {
  form.value.eventPlanId = plan.id
  form.value.eventPlanName = plan.name
  showPlanPicker.value = false
}

// ── Validation ─────────────────────────────────────────────────────────────

function validate() {
  const e = {}
  if (!form.value.title.trim())       e.title       = 'Event title is required.'
  if (!form.value.categoryId)         e.category    = 'Please select a category.'
  if (!form.value.description.trim()) e.description = 'Description is required.'
  if (!form.value.startDate)          e.startDate   = 'Start date is required.'
  if (!form.value.location.trim())    e.location    = 'Location is required.'
  if (!form.value.supportPhone.trim()) e.supportPhone = 'Support number is required.'
  errors.value = e
  return Object.keys(e).length === 0
}

// ── Submit ─────────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  submitError.value = ''
  try {
    // Upload new thumbnail only if user picked one
    let thumbnailUrl = existingThumbUrl.value
    if (thumbFile.value) {
      const timestamp = Date.now()
      const sRef = storageRef(storage, `Event-Thumbnails/${uid}?=${timestamp}?=${thumbFile.value.name}`)
      await uploadBytes(sRef, thumbFile.value)
      thumbnailUrl = await getDownloadURL(sRef)
    }

    const title = form.value.title.trim()
    await setDoc(doc(db, 'events', eventId), {
      title,
      titleLower: title.toLowerCase(),
      categoryId: form.value.categoryId,
      categoryLevel: form.value.categoryLevel,
      description: form.value.description.trim(),
      location: form.value.location.trim(),
      eventThumbnail: thumbnailUrl,
      eventPlanId: form.value.eventPlanId ?? null,
      startDate: form.value.startDate ? new Date(form.value.startDate).toISOString() : null,
      endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : null,
      supportPhone: form.value.supportPhone.trim(),
      language: form.value.language,
      updatedAt: new Date().toISOString(),
    }, { merge: true })

    router.push('/my-events')
  } catch (e) {
    console.error('Edit event error:', e)
    submitError.value = 'Failed to save changes. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* ── Design tokens ── */
.ce-root {
  --ink: #f0f0ec;
  --ink-soft: #d8d4cd;
  --ink-muted: #888;
  --ink-dim: #555;
  --line: #2a2a2a;
  --line-strong: #2a2a2a;
  --paper: #161616;
  --gold: #C9A84C;
  --emerald: #30D158;
  min-height: 100vh;
  background: #0a0a0b;
  color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Nav ── */
.ce-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid #2a2a2a;
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.ce-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ce-nav-left { display: flex; align-items: center; gap: 10px; }
.ce-brand { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.ce-brand-dot { width: 10px; height: 10px; border-radius: 50%; background: #C9A84C; font-size: 16px; color: #C9A84C; }
.ce-brand-name { font-family: 'Instrument Serif', Georgia, serif; font-size: 18px; color: var(--ink); }
.ce-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-muted); }
.ce-sep { color: var(--ink-dim); }
.ce-crumb { cursor: pointer; transition: color 120ms; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.ce-crumb:hover { color: var(--ink); }
.ce-crumb--event { max-width: 160px; }
.ce-crumb--page { color: var(--ink); cursor: default; max-width: none; }
.ce-crumb--page:hover { color: var(--ink); }
.ce-avatar-pill { background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.18); border-radius: 20px; padding: 4px 12px; display: flex; align-items: center; gap: 6px; }
.ce-avatar-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
.ce-avatar-label { font-size: 12.5px; font-weight: 600; color: var(--gold); }

/* ── Form body ── */
.ce-body { max-width: 760px; margin: 0 auto; padding: 32px 32px 48px; display: flex; flex-direction: column; gap: 20px; }
.ce-form { display: flex; flex-direction: column; gap: 20px; }

/* ── Skeleton ── */
.ce-skeleton-section {
  height: 160px;
  border-radius: 16px;
  background: linear-gradient(90deg, #161616 25%, #1e1e1e 50%, #161616 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Section ── */
.ce-section { background: #161616; border: 1px solid #2a2a2a; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 16px; }
.ce-section-label { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2px; color: #888888; }

/* ── Fields ── */
.ce-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ce-field { display: flex; flex-direction: column; gap: 6px; }
.ce-field--full { grid-column: 1 / -1; }
.ce-label { font-size: 12px; font-weight: 600; color: #888888; }
.ce-req { color: #C9A84C; }
.ce-optional { color: #555555; font-weight: 400; }

.ce-input, .ce-textarea {
  padding: 10px 13px; border: 0.8px solid #2a2a2a; border-radius: 10px; background: #161616;
  font-size: 14px; color: var(--ink); outline: none; font-family: inherit;
  transition: border-color 140ms, box-shadow 140ms; box-sizing: border-box; width: 100%; color-scheme: dark;
}
.ce-input::placeholder, .ce-textarea::placeholder { color: #555555; }
.ce-input:focus, .ce-textarea:focus { border-color: rgba(201,168,76,0.5); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); background: #111111; }
.ce-textarea { resize: vertical; min-height: 100px; }
.ce-field--error .ce-input, .ce-field--error .ce-textarea { border-color: rgba(255,59,48,0.45); }
.ce-field-error { font-size: 11px; color: #FF453A; font-weight: 500; }

.ce-select-btn {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 13px; border: 0.8px solid #2a2a2a; border-radius: 10px; background: #161616;
  font-size: 14px; color: var(--ink); cursor: pointer; font-family: inherit;
  transition: border-color 140ms; text-align: left; width: 100%;
}
.ce-select-btn--empty { color: #555555; }
.ce-select-btn:hover { border-color: rgba(201,168,76,0.45); }

.ce-radio-row { display: flex; gap: 8px; }
.ce-radio-opt { flex: 1; text-align: center; padding: 9px 12px; border: 0.8px solid #2a2a2a; border-radius: 10px; font-size: 13px; font-weight: 500; color: #888888; cursor: pointer; transition: all 130ms; background: #161616; }
.ce-radio-opt--active { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.4); color: #C9A84C; font-weight: 600; }

.ce-thumb-drop { border: 1.5px dashed #2a2a2a; border-radius: 14px; min-height: 180px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: border-color 150ms; position: relative; background: #161616; }
.ce-thumb-drop:hover { border-color: rgba(201,168,76,0.5); }
.ce-thumb-drop--has { border-style: solid; border-color: #2a2a2a; }
.ce-thumb-preview { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.ce-thumb-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; }
.ce-thumb-hint { font-size: 14px; font-weight: 600; color: #888888; margin: 0; }
.ce-thumb-sub { font-size: 12px; color: #555555; margin: 0; }
.ce-hidden { display: none; }

.ce-submit-error { display: flex; align-items: center; gap: 8px; background: rgba(255,59,48,0.07); border: 0.8px solid rgba(255,59,48,0.2); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #FF453A; }

.ce-actions { display: flex; justify-content: flex-end; gap: 10px; }
.ce-cancel-btn { padding: 11px 24px; border: 1px solid #2a2a2a; border-radius: 10px; background: transparent; font-size: 14px; font-weight: 600; color: #888888; cursor: pointer; font-family: inherit; transition: background 130ms; }
.ce-cancel-btn:hover { background: #1e1e1e; color: var(--ink); }
.ce-submit-btn { padding: 11px 28px; border: none; border-radius: 10px; background: #C9A84C; font-size: 14px; font-weight: 700; color: #070707; cursor: pointer; font-family: inherit; transition: opacity 140ms; display: flex; align-items: center; gap: 8px; min-width: 140px; justify-content: center; }
.ce-submit-btn:hover:not(:disabled) { opacity: 0.88; }
.ce-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.ce-spinner { width: 15px; height: 15px; border: 2px solid rgba(0,0,0,0.25); border-top-color: #070707; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.ce-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.ce-modal { background: #161616; border: 1px solid #2a2a2a; border-radius: 18px; width: 100%; max-width: 400px; max-height: 70vh; display: flex; flex-direction: column; box-shadow: 4px 8px 0 rgba(0,0,0,0.4); overflow: hidden; }
.ce-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 0.8px solid #2a2a2a; flex-shrink: 0; }
.ce-modal-title { font-size: 15px; font-weight: 700; color: var(--ink); }
.ce-modal-close { background: none; border: none; cursor: pointer; color: #888888; display: flex; align-items: center; padding: 4px; }
.ce-modal-list { overflow-y: auto; padding: 10px 12px 14px; display: flex; flex-direction: column; gap: 2px; }
.ce-modal-loading { padding: 20px; text-align: center; color: #888888; font-size: 13px; }
.ce-modal-item { display: flex; align-items: center; padding: 11px 12px; border-radius: 10px; border: none; background: none; font-size: 14px; font-weight: 500; color: var(--ink); cursor: pointer; text-align: left; font-family: inherit; transition: background 120ms; }
.ce-modal-item:hover { background: #1e1e1e; }
.ce-modal-item--active { background: rgba(201,168,76,0.08); color: #C9A84C; font-weight: 600; }

.fade-enter-active, .fade-leave-active { transition: opacity 180ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .ce-nav-inner { padding: 12px 16px; }
  .ce-crumb--event { display: none; }
  .ce-body { padding: 20px 16px 48px; }
  .ce-fields { grid-template-columns: 1fr; }
  .ce-field--full { grid-column: 1; }
  .ce-actions { flex-direction: column-reverse; }
  .ce-cancel-btn, .ce-submit-btn { width: 100%; justify-content: center; }
}
</style>
