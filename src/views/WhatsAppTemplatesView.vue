<template>
  <div class="wt-root">

    <!-- Topbar -->
    <nav class="wt-topbar">
      <div class="wt-topbar-inner">
        <span class="wt-page-title">WhatsApp Templates</span>
        <button class="wt-add-btn" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Template
        </button>
      </div>
    </nav>

    <div class="wt-page">

      <p class="wt-intro">
        Registers the Twilio Content Templates used to send WhatsApp campaigns. This does <strong>not</strong> create or
        submit templates to Twilio/Meta — build and get the template approved in
        <a href="https://console.twilio.com/us1/develop/sms/content-template-builder" target="_blank" rel="noopener">Twilio's Content Template Builder</a>
        first, then register its Content SID here so it shows up in the event message picker.
      </p>

      <!-- Stats bar -->
      <div class="wt-stats">
        <div class="wt-stat">
          <span class="wt-stat-num">{{ templates.length }}</span>
          <span class="wt-stat-label">Total</span>
        </div>
        <div class="wt-stat-div"/>
        <div class="wt-stat">
          <span class="wt-stat-num wt-stat-num--green">{{ templates.filter(t => t.active !== false).length }}</span>
          <span class="wt-stat-label">Active</span>
        </div>
        <div class="wt-stat-div"/>
        <div class="wt-stat">
          <span class="wt-stat-num">{{ templates.filter(t => t.active === false).length }}</span>
          <span class="wt-stat-label">Inactive</span>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="wt-filterbar">
        <div class="wt-search-wrap">
          <svg class="wt-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="search" class="wt-search" placeholder="Search templates…" autocomplete="off" />
        </div>
        <select v-model="filterCat" class="wt-select">
          <option value="">All categories</option>
          <option v-for="c in CATEGORIES" :key="c.key" :value="c.key">{{ c.label }}</option>
        </select>
        <select v-model="filterLang" class="wt-select">
          <option value="">All languages</option>
          <option v-for="l in LANGUAGES" :key="l.key" :value="l.key">{{ l.label }}</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="wt-empty">Loading templates…</div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="wt-empty">
        {{ templates.length === 0 ? 'No templates registered yet. Add your first one.' : 'No templates match your filters.' }}
      </div>

      <!-- Table -->
      <div v-else class="wt-table">
        <div class="wt-thead">
          <div class="wt-th wt-th--name">Name</div>
          <div class="wt-th">Category</div>
          <div class="wt-th">Language</div>
          <div class="wt-th">Content SID</div>
          <div class="wt-th">Status</div>
          <div class="wt-th"/>
        </div>

        <div v-for="tpl in filtered" :key="tpl.id" class="wt-row" @click="openEdit(tpl)">
          <div class="wt-td wt-td--name">
            <span class="wt-tpl-name">{{ tpl.name }}</span>
            <span v-if="tpl.content" class="wt-tpl-preview">{{ tpl.content.slice(0, 72) }}{{ tpl.content.length > 72 ? '…' : '' }}</span>
            <span v-else class="wt-tpl-preview wt-tpl-preview--warn">No display text set yet</span>
          </div>
          <div class="wt-td">
            <span class="wt-badge">{{ catLabel(tpl.category) }}</span>
          </div>
          <div class="wt-td wt-td--muted">{{ langLabel(tpl.language) }}</div>
          <div class="wt-td wt-td--muted wt-td--mono">{{ tpl.id }}</div>
          <div class="wt-td">
            <span class="wt-status-dot" :class="tpl.active !== false ? 'wt-status-dot--on' : 'wt-status-dot--off'" />
            <span class="wt-td--muted">{{ tpl.active !== false ? 'Active' : 'Inactive' }}</span>
          </div>
          <div class="wt-td wt-td--actions" @click.stop>
            <button class="wt-row-btn" title="Edit" @click="openEdit(tpl)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="wt-row-btn" title="Duplicate" @click="openDuplicate(tpl)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button class="wt-row-btn wt-row-btn--toggle" :title="tpl.active !== false ? 'Deactivate' : 'Activate'" @click="toggleActive(tpl)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18.36 6.64A9 9 0 0 1 20.77 15" v-if="tpl.active !== false"/>
                <path d="M6.16 6.16a9 9 0 1 0 11.31 11.31" v-if="tpl.active !== false"/>
                <circle cx="12" cy="12" r="9" v-if="tpl.active === false"/>
                <path d="M12 8v4" v-if="tpl.active === false"/>
              </svg>
            </button>
            <button class="wt-row-btn wt-row-btn--delete" title="Delete" @click="confirmDelete(tpl)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════════════ CREATE / EDIT DRAWER ══════════════════ -->
    <Teleport to="body">
      <Transition name="wt-drawer-fade">
        <div v-if="drawerOpen" class="wt-backdrop" @click.self="closeDrawer">
          <div class="wt-drawer">

            <div class="wt-drawer-header">
              <span class="wt-drawer-title">{{ editId ? 'Edit Template' : duplicating ? 'Duplicate Template' : 'New Template' }}</span>
              <button class="wt-drawer-close" @click="closeDrawer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="wt-drawer-body">

              <div v-if="duplicating" class="wt-hint-box">
                <span class="wt-hint-label">Duplicating "{{ duplicateSource?.name }}"</span>
                <p class="wt-hint-text">Everything below is copied over except the Content SID — clone the template in Twilio's Content Template Builder first, then paste its new SID here.</p>
              </div>

              <!-- Name -->
              <div class="wt-field">
                <label class="wt-label">Name</label>
                <input v-model="form.name" class="wt-input" placeholder="e.g. Wedding Invitation (Swahili)" autocomplete="off" />
              </div>

              <!-- Display text -->
              <div class="wt-field">
                <label class="wt-label">
                  Display text
                  <span class="wt-label-opt">(what organizers see in the send picker)</span>
                </label>
                <input v-model="form.content" class="wt-input" placeholder="e.g. EN: Wedding Invitation" autocomplete="off" />
              </div>

              <!-- Category + Language -->
              <div class="wt-field-row">
                <div class="wt-field">
                  <label class="wt-label">Category</label>
                  <select v-model="form.category" class="wt-input wt-input--select">
                    <option value="">Select category</option>
                    <option v-for="c in CATEGORIES" :key="c.key" :value="c.key">{{ c.label }}</option>
                  </select>
                </div>
                <div class="wt-field">
                  <label class="wt-label">Language</label>
                  <select v-model="form.language" class="wt-input wt-input--select">
                    <option value="">Select language</option>
                    <option v-for="l in LANGUAGES" :key="l.key" :value="l.key">{{ l.label }}</option>
                  </select>
                </div>
              </div>

              <!-- Variable hint -->
              <div v-if="selectedCategoryMeta" class="wt-hint-box">
                <span class="wt-hint-label">Content variables expected by the sender</span>
                <p class="wt-hint-text">{{ selectedCategoryMeta.vars }}</p>
              </div>

              <!-- Content SID -->
              <div class="wt-field">
                <label class="wt-label">
                  Twilio Content SID
                  <span class="wt-label-opt">(from Twilio's Content Template Builder — used as the doc ID, can't be changed after creation)</span>
                </label>
                <input
                  ref="sidInputRef"
                  v-model="form.contentSid"
                  class="wt-input wt-input--mono"
                  :class="{ 'wt-input--disabled': !!editId }"
                  :disabled="!!editId"
                  placeholder="HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  autocomplete="off"
                />
                <p v-if="!editId && form.contentSid && !form.contentSid.trim().startsWith('HX')" class="wt-field-warn">
                  Twilio Content SIDs usually start with "HX" — double-check you copied the right value.
                </p>
              </div>

              <!-- Notes -->
              <div class="wt-field">
                <label class="wt-label">Notes <span class="wt-label-opt">(optional — approved copy, submission notes, etc.)</span></label>
                <textarea
                  v-model="form.notes"
                  class="wt-textarea"
                  rows="5"
                  placeholder="Paste the approved template body here for reference, or leave notes for other admins."
                  autocomplete="off"
                />
              </div>

              <!-- Active toggle -->
              <div class="wt-toggle-card">
                <div class="wt-toggle-card-text">
                  <span class="wt-toggle-card-label">Active</span>
                  <span class="wt-toggle-card-sub">Template will be selectable when sending event campaigns</span>
                </div>
                <button class="wt-toggle" :class="{ 'wt-toggle--on': form.active }" @click="form.active = !form.active">
                  <span class="wt-toggle-knob"/>
                </button>
              </div>

              <p v-if="formError" class="wt-form-error">{{ formError }}</p>

            </div>

            <div class="wt-drawer-footer">
              <button class="wt-footer-cancel" @click="closeDrawer">Cancel</button>
              <button
                class="wt-footer-save"
                :disabled="saving || !form.name || !form.content.trim() || !form.category || !form.language || !form.contentSid.trim()"
                @click="save"
              >
                {{ saving ? 'Saving…' : (editId ? 'Save changes' : 'Create template') }}
              </button>
            </div>

          </div>
        </div>
      </Transition>

      <!-- Delete confirm -->
      <Transition name="wt-drawer-fade">
        <div v-if="deleteTarget" class="wt-backdrop" @click.self="deleteTarget = null">
          <div class="wt-confirm">
            <p class="wt-confirm-title">Delete template?</p>
            <p class="wt-confirm-body">
              "<strong>{{ deleteTarget.name }}</strong>" will be removed from the registry. This only deletes the Firestore
              reference — the Content Template still exists in Twilio and can be re-registered later if needed.
            </p>
            <div class="wt-confirm-actions">
              <button class="wt-footer-cancel" @click="deleteTarget = null">Cancel</button>
              <button class="wt-footer-delete" :disabled="saving" @click="doDelete">
                {{ saving ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { db } from '../firebase'
import {
  collection, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  doc, serverTimestamp,
} from 'firebase/firestore'

// Keys must match CAMPAIGN_TEMPLATE_CATEGORIES in EventMessages.vue exactly —
// that's what the organizer-facing template picker filters `messageTemplates` by.
const CATEGORIES = [
  { key: 'whatsapp-wedding-invitations', label: 'Invitation Dispatch',
    vars: '1 Guest name · 2 Event title · 3 Date · 4 Venue · 5 Time · 6 Card image path · 7 Event/Attendee ID' },
  { key: 'haflaway-invitation-reminder-campaign', label: 'Invitation Reminder',
    vars: '1 Guest name · 2 Event title · 3 Date · 4 Venue · 5 Time · 6 Card image path · 7 Event/Attendee ID' },
  { key: 'whatsapp-wedding-save-the-date', label: 'Save the Date',
    vars: '1 Guest name · 2 Event title · 3 Date · 4 Venue · 5 Time · 6 Card image path · 7 Event/Attendee ID' },
  { key: 'haflaway-invitation-gratitude-campaign', label: 'Gratitude (Invitation)',
    vars: '1 Guest name · 2 Event title · 3 Date · 4 Venue · 5 Time · 6 Card image path · 7 Event/Attendee ID' },
  { key: 'matrimony-contributions', label: 'Contribution / Michango',
    vars: '1 Guest name · 2 Card image path' },
  { key: 'haflaway-gratitude-campaign', label: 'Gratitude (General)',
    vars: 'Not currently wired to a WhatsApp sender function — verify before registering a template here' },
]

const LANGUAGES = [
  { key: 'sw', label: 'Kiswahili' },
  { key: 'en', label: 'English' },
]

// ── State ──────────────────────────────────────────────────────────────────
const templates    = ref([])
const loading      = ref(true)
const search       = ref('')
const filterCat    = ref('')
const filterLang   = ref('')

const drawerOpen     = ref(false)
const editId         = ref(null)
const duplicating    = ref(false)
const duplicateSource = ref(null)
const sidInputRef    = ref(null)
const saving         = ref(false)
const deleteTarget   = ref(null)
const formError      = ref('')

const form = ref(freshForm())

function freshForm() {
  return { name: '', content: '', category: '', language: '', contentSid: '', notes: '', active: true }
}

// ── Computed ───────────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = templates.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(t => t.name?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
  }
  if (filterCat.value)  list = list.filter(t => t.category === filterCat.value)
  if (filterLang.value) list = list.filter(t => t.language === filterLang.value)
  return list
})

const selectedCategoryMeta = computed(() => CATEGORIES.find(c => c.key === form.value.category))

// ── Helpers ────────────────────────────────────────────────────────────────
function catLabel(key)  { return CATEGORIES.find(c => c.key === key)?.label ?? key ?? '—' }
function langLabel(key) { return LANGUAGES.find(l => l.key === key)?.label ?? key ?? '—' }

// ── Firestore ──────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    // No orderBy: templates created directly in the Firebase console (the only
    // way to register one before this screen existed) may not have createdAt,
    // and Firestore excludes docs missing the ordered field from the results.
    const snap = await getDocs(collection(db, 'messageTemplates'))
    templates.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function save() {
  formError.value = ''
  if (!form.value.name || !form.value.content.trim() || !form.value.category || !form.value.language || !form.value.contentSid.trim()) return
  saving.value = true
  try {
    const payload = {
      name:     form.value.name.trim(),
      content:  form.value.content.trim(),
      category: form.value.category,
      language: form.value.language,
      notes:    form.value.notes.trim() || null,
      active:   form.value.active,
    }
    if (editId.value) {
      await updateDoc(doc(db, 'messageTemplates', editId.value), payload)
    } else {
      const sid = form.value.contentSid.trim()
      const existing = await getDoc(doc(db, 'messageTemplates', sid))
      if (existing.exists()) {
        formError.value = 'A template with that Content SID is already registered.'
        saving.value = false
        return
      }
      payload.createdAt = serverTimestamp()
      await setDoc(doc(db, 'messageTemplates', sid), payload)
    }
    await load()
    closeDrawer()
  } catch (e) {
    console.error(e)
    formError.value = 'Error: ' + e.message
  } finally {
    saving.value = false
  }
}

async function toggleActive(tpl) {
  try {
    await updateDoc(doc(db, 'messageTemplates', tpl.id), { active: tpl.active === false })
    tpl.active = tpl.active === false
  } catch (e) { console.error(e) }
}

function confirmDelete(tpl) { deleteTarget.value = tpl }

async function doDelete() {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await deleteDoc(doc(db, 'messageTemplates', deleteTarget.value.id))
    templates.value = templates.value.filter(t => t.id !== deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

// ── Drawer helpers ─────────────────────────────────────────────────────────
function openCreate() {
  editId.value          = null
  duplicating.value     = false
  duplicateSource.value = null
  form.value            = freshForm()
  formError.value        = ''
  drawerOpen.value       = true
}

function openEdit(tpl) {
  editId.value          = tpl.id
  duplicating.value     = false
  duplicateSource.value = null
  form.value    = {
    name:       tpl.name ?? '',
    content:    tpl.content ?? tpl.name ?? '',
    category:   tpl.category ?? '',
    language:   tpl.language ?? '',
    contentSid: tpl.id,
    notes:      tpl.notes ?? '',
    active:     tpl.active !== false,
  }
  formError.value  = ''
  drawerOpen.value = true
}

function openDuplicate(tpl) {
  editId.value          = null
  duplicating.value     = true
  duplicateSource.value = tpl
  form.value    = {
    name:       tpl.name ? `${tpl.name} (Copy)` : '',
    content:    tpl.content ?? tpl.name ?? '',
    category:   tpl.category ?? '',
    language:   tpl.language ?? '',
    contentSid: '',
    notes:      tpl.notes ?? '',
    active:     tpl.active !== false,
  }
  formError.value  = ''
  drawerOpen.value = true
  nextTick(() => sidInputRef.value?.focus())
}

function closeDrawer() {
  drawerOpen.value       = false
  editId.value           = null
  duplicating.value      = false
  duplicateSource.value  = null
  formError.value        = ''
}

onMounted(load)
</script>

<style scoped>
.wt-root {
  --ink:          #f0f0ec;
  --ink-soft:     #d8d4cd;
  --ink-muted:    #888;
  --ink-dim:      #555;
  --line:         #242424;
  --line-soft:    #1e1e1e;
  --line-strong:  #2a2a2a;
  --paper-soft:   #141414;
  --gold:         #C9A84C;
  --emerald:      #30D158;
  --emerald-soft: rgba(48,209,88,0.12);
  --red:          #FF453A;
  min-height: 100vh;
  background: #0a0a0b;
  color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Topbar ── */
.wt-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.wt-topbar-inner { max-width: 1200px; margin: 0 auto; padding: 14px 32px; display: flex; align-items: center; justify-content: space-between; }
.wt-page-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 20px; font-weight: 400; letter-spacing: -0.3px; color: var(--ink); }
.wt-add-btn {
  display: flex; align-items: center; gap: 7px;
  background: #C9A84C; color: #070707;
  border: none; padding: 8px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background 130ms;
}
.wt-add-btn:hover { background: #d4b560; }

/* ── Page ── */
.wt-page { max-width: 1200px; margin: 0 auto; padding: 24px 32px 32px; display: flex; flex-direction: column; gap: 20px; }

.wt-intro { font-size: 12.5px; color: var(--ink-muted); line-height: 1.6; background: var(--paper-soft); border: 1px solid var(--line-strong); border-radius: 12px; padding: 14px 16px; }
.wt-intro a { color: var(--gold); font-weight: 600; }

/* ── Stats ── */
.wt-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.wt-stat { background: #141414; border: 1px solid #2a2a2a; border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.wt-stat-num { font-size: 32px; font-weight: 700; color: var(--ink); letter-spacing: -0.5px; line-height: 1; }
.wt-stat-num--green { color: var(--emerald); }
.wt-stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-dim); }
.wt-stat-div { display: none; }

/* ── Filter bar ── */
.wt-filterbar { background: #111; border: 1px solid var(--line-strong); border-radius: 14px; padding: 8px 8px 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.wt-search-wrap { position: relative; flex: 1; display: flex; align-items: center; }
.wt-search-icon { position: absolute; left: 12px; color: var(--ink-dim); pointer-events: none; }
.wt-search { width: 100%; background: transparent; border: none; color: var(--ink); padding: 7px 14px 7px 36px; font-size: 13.5px; font-family: inherit; box-sizing: border-box; outline: none; }
.wt-search::placeholder { color: var(--ink-dim); }
.wt-select { padding: 6px 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper-soft); font-size: 12.5px; font-weight: 500; color: var(--ink-muted); font-family: inherit; outline: none; color-scheme: dark; cursor: pointer; }

/* ── Empty / loading ── */
.wt-empty { border: 1px dashed var(--line-strong); border-radius: 20px; padding: 60px 20px; text-align: center; font-size: 13px; color: var(--ink-muted); }

/* ── Table ── */
.wt-table { background: #141414; border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.wt-thead { display: grid; grid-template-columns: 1.6fr .9fr .6fr 1.2fr .8fr 110px; padding: 10px 18px; border-bottom: 1px solid #2a2a2a; background: #111; }
.wt-th { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--ink-dim); }
.wt-row { display: grid; grid-template-columns: 1.6fr .9fr .6fr 1.2fr .8fr 110px; padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; cursor: pointer; transition: background 120ms; }
.wt-row:last-child { border-bottom: none; }
.wt-row:hover { background: rgba(255,255,255,0.025); }
.wt-td { font-size: 13.5px; color: var(--ink); padding-right: 8px; }
.wt-td--name { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
.wt-tpl-name { font-size: 13.5px; font-weight: 600; color: var(--ink); }
.wt-tpl-preview { font-size: 11.5px; color: var(--ink-muted); line-height: 1.4; }
.wt-tpl-preview--warn { color: #FF9F0A; font-style: italic; }
.wt-td--muted { font-size: 12px; color: var(--ink-muted); }
.wt-td--mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: var(--ink-muted); }
.wt-td--actions { display: flex; gap: 4px; justify-content: flex-end; }

.wt-badge { display: inline-block; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.4px; background: rgba(201,168,76,0.12); color: var(--gold); }

.wt-status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 6px; flex-shrink: 0; }
.wt-status-dot--on { background: var(--emerald); }
.wt-status-dot--off { background: var(--ink-dim); }

.wt-row-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--line-strong); background: transparent; color: var(--ink-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 120ms, color 120ms, border-color 120ms; }
.wt-row-btn:hover { background: var(--paper-soft); color: var(--ink); border-color: rgba(255,255,255,0.12); }
.wt-row-btn--delete:hover { background: rgba(255,69,58,0.1); color: var(--red); border-color: rgba(255,69,58,0.25); }

/* ── Drawer / modal ── */
.wt-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: stretch; justify-content: flex-end; }
.wt-drawer { width: 460px; max-width: 100vw; background: #161616; border-left: 1px solid #2a2a2a; display: flex; flex-direction: column; height: 100vh; box-shadow: 4px 8px 0 rgba(0,0,0,0.4); }
.wt-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #2a2a2a; flex-shrink: 0; }
.wt-drawer-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px; }
.wt-drawer-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #2a2a2a; background: transparent; color: var(--ink-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 130ms, color 130ms; }
.wt-drawer-close:hover { background: rgba(255,255,255,0.05); color: var(--ink); }

.wt-drawer-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

.wt-field { display: flex; flex-direction: column; gap: 8px; }
.wt-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.wt-field-row .wt-field { flex: 1; }
.wt-label { font-size: 12px; font-weight: 600; color: var(--ink-muted); }
.wt-label-opt { font-weight: 400; font-size: 11px; }
.wt-input {
  padding: 10px 13px; border: 1px solid #333; border-radius: 10px;
  background: #0e0e0e; font-size: 14px; color: var(--ink);
  width: 100%; box-sizing: border-box; font-family: inherit; outline: none;
  transition: border-color 150ms, box-shadow 150ms; color-scheme: dark;
}
.wt-input:focus { border-color: rgba(201,168,76,0.55); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }
.wt-input::placeholder { color: var(--ink-dim); }
.wt-input--select { cursor: pointer; }
.wt-input--mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; }
.wt-input--disabled { background: #0a0a0a; color: var(--ink-dim); border-color: var(--line); cursor: not-allowed; }
.wt-field-warn { font-size: 11.5px; color: #FF9F0A; margin: 0; }
.wt-textarea { background: #0e0e0e; border: 1px solid #333; color: var(--ink); padding: 12px 14px; border-radius: 9px; font-size: 13.5px; font-family: inherit; resize: vertical; width: 100%; box-sizing: border-box; line-height: 1.6; transition: border-color 150ms, box-shadow 150ms; outline: none; }
.wt-textarea:focus { border-color: rgba(201,168,76,0.55); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }
.wt-textarea::placeholder { color: var(--ink-dim); }

.wt-hint-box { background: #0e0e0e; border: 1px solid #333; border-radius: 9px; padding: 12px 14px; }
.wt-hint-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: var(--gold); }
.wt-hint-text { font-size: 12.5px; color: var(--ink-soft); margin: 4px 0 0; line-height: 1.5; }

/* Active toggle */
.wt-toggle-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #0e0e0e; border: 1px solid #333; border-radius: 12px; padding: 14px 16px; }
.wt-toggle-card-text { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.wt-toggle-card-label { font-size: 13.5px; font-weight: 600; color: var(--ink); }
.wt-toggle-card-sub { font-size: 11.5px; color: var(--ink-dim); }
.wt-toggle { width: 44px; height: 26px; border-radius: 13px; background: #383838; border: 1px solid #484848; cursor: pointer; padding: 3px; display: flex; align-items: center; transition: background 200ms, border-color 200ms; flex-shrink: 0; }
.wt-toggle--on { background: var(--gold); border-color: var(--gold); }
.wt-toggle-knob { width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.4); transition: transform 200ms; flex-shrink: 0; }
.wt-toggle--on .wt-toggle-knob { transform: translateX(18px); }

.wt-form-error { color: var(--red); font-size: 12.5px; margin: 0; }

/* ── Footer ── */
.wt-footer-cancel, .wt-footer-save, .wt-footer-delete { border: none; border-radius: 9px; padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
.wt-footer-cancel { background: transparent; border: 1px solid #2a2a2a; color: var(--ink-muted); font-weight: 500; transition: background 130ms, color 130ms; }
.wt-footer-cancel:hover { background: #1e1e1e; color: var(--ink); }
.wt-footer-save { background: #C9A84C; color: #070707; padding: 8px 18px; transition: background 130ms; }
.wt-footer-save:hover:not(:disabled) { background: #d4b560; }
.wt-footer-save:disabled { opacity: 0.45; cursor: not-allowed; }
.wt-footer-delete { background: rgba(255,69,58,0.12); color: #FF453A; border: 1px solid rgba(255,69,58,0.2); padding: 8px 18px; transition: background 140ms; }
.wt-footer-delete:hover:not(:disabled) { background: rgba(255,69,58,0.22); }
.wt-footer-delete:disabled { opacity: 0.45; cursor: not-allowed; }

/* Delete confirm modal */
.wt-confirm { background: #161616; border: 1px solid #2a2a2a; border-radius: 16px; padding: 28px 28px 24px; box-shadow: 4px 8px 0 rgba(0,0,0,0.4); min-width: 340px; max-width: 480px; width: 100%; display: flex; flex-direction: column; gap: 12px; align-self: center; margin: auto; }
.wt-confirm-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); margin: 0; letter-spacing: -0.3px; }
.wt-confirm-body { font-size: 13.5px; color: var(--ink-muted); margin: 0 0 8px; line-height: 1.5; }
.wt-confirm-body strong { color: var(--ink); }
.wt-confirm-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }

.wt-drawer-fade-enter-active, .wt-drawer-fade-leave-active { transition: opacity 180ms; }
.wt-drawer-fade-enter-from, .wt-drawer-fade-leave-to { opacity: 0; }
</style>
