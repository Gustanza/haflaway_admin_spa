<template>
  <div class="st-root">

    <!-- Topbar -->
    <nav class="st-topbar">
      <div class="st-topbar-inner">
        <span class="st-page-title">SMS Templates</span>
        <button class="st-add-btn" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Template
        </button>
      </div>
    </nav>

    <div class="st-page">

      <!-- Stats bar -->
      <div class="st-stats">
        <div class="st-stat">
          <span class="st-stat-num">{{ templates.length }}</span>
          <span class="st-stat-label">Total</span>
        </div>
        <div class="st-stat-div"/>
        <div class="st-stat">
          <span class="st-stat-num st-stat-num--green">{{ templates.filter(t => t.active !== false).length }}</span>
          <span class="st-stat-label">Active</span>
        </div>
        <div class="st-stat-div"/>
        <div v-for="cat in CATEGORIES" :key="cat.key" class="st-stat">
          <span class="st-stat-num">{{ templates.filter(t => t.category === cat.key).length }}</span>
          <span class="st-stat-label">{{ cat.label }}</span>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="st-filterbar">
        <div class="st-search-wrap">
          <svg class="st-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="search" class="st-search" placeholder="Search templates…" autocomplete="off" />
        </div>
        <select v-model="filterCat" class="st-select">
          <option value="">All categories</option>
          <option v-for="c in CATEGORIES" :key="c.key" :value="c.key">{{ c.label }}</option>
        </select>
        <select v-model="filterChannel" class="st-select">
          <option value="">All channels</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="both">Both</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="st-empty">Loading templates…</div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="st-empty">
        {{ templates.length === 0 ? 'No templates yet. Create your first one.' : 'No templates match your filters.' }}
      </div>

      <!-- Table -->
      <div v-else class="st-table">
        <div class="st-thead">
          <div class="st-th st-th--name">Name</div>
          <div class="st-th">Category</div>
          <div class="st-th">Channel</div>
          <div class="st-th">Language</div>
          <div class="st-th">Status</div>
          <div class="st-th"/>
        </div>

        <div
          v-for="tpl in filtered"
          :key="tpl.id"
          class="st-row"
          @click="openEdit(tpl)"
        >
          <div class="st-td st-td--name">
            <span class="st-tpl-name">{{ tpl.name }}</span>
            <span class="st-tpl-preview">{{ tpl.body?.slice(0, 72) }}{{ tpl.body?.length > 72 ? '…' : '' }}</span>
          </div>
          <div class="st-td">
            <span class="st-badge" :class="`st-badge--${tpl.category}`">{{ catLabel(tpl.category) }}</span>
          </div>
          <div class="st-td">
            <span class="st-channel-badge" :class="`st-channel--${tpl.channel}`">{{ channelLabel(tpl.channel) }}</span>
          </div>
          <div class="st-td st-td--muted">{{ tpl.language || '—' }}</div>
          <div class="st-td">
            <span class="st-status-dot" :class="tpl.active !== false ? 'st-status-dot--on' : 'st-status-dot--off'" />
            <span class="st-td--muted">{{ tpl.active !== false ? 'Active' : 'Inactive' }}</span>
          </div>
          <div class="st-td st-td--actions" @click.stop>
            <button class="st-row-btn" title="Edit" @click="openEdit(tpl)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="st-row-btn st-row-btn--toggle" :title="tpl.active !== false ? 'Deactivate' : 'Activate'" @click="toggleActive(tpl)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18.36 6.64A9 9 0 0 1 20.77 15" v-if="tpl.active !== false"/>
                <path d="M6.16 6.16a9 9 0 1 0 11.31 11.31" v-if="tpl.active !== false"/>
                <circle cx="12" cy="12" r="9" v-if="tpl.active === false"/>
                <path d="M12 8v4" v-if="tpl.active === false"/>
              </svg>
            </button>
            <button class="st-row-btn st-row-btn--delete" title="Delete" @click="confirmDelete(tpl)">
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
      <Transition name="st-drawer-fade">
        <div v-if="drawerOpen" class="st-backdrop" @click.self="closeDrawer">
          <div class="st-drawer">

            <div class="st-drawer-header">
              <span class="st-drawer-title">{{ editId ? 'Edit Template' : 'New Template' }}</span>
              <button class="st-drawer-close" @click="closeDrawer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="st-drawer-body">

              <!-- Name -->
              <div class="st-field">
                <label class="st-label">Name</label>
                <input v-model="form.name" class="st-input" placeholder="e.g. Standard Invitation (Swahili)" autocomplete="off" />
              </div>

              <!-- Category + Channel -->
              <div class="st-field-row">
                <div class="st-field">
                  <label class="st-label">Category</label>
                  <select v-model="form.category" class="st-input st-input--select">
                    <option value="">Select category</option>
                    <option v-for="c in CATEGORIES" :key="c.key" :value="c.key">{{ c.label }}</option>
                  </select>
                </div>
                <div class="st-field">
                  <label class="st-label">Channel</label>
                  <div class="st-channel-toggle">
                    <button
                      v-for="ch in CHANNELS" :key="ch.key"
                      class="st-ch-btn" :class="{ 'st-ch-btn--active': form.channel === ch.key }"
                      @click="form.channel = ch.key"
                    >{{ ch.label }}</button>
                  </div>
                </div>
              </div>

              <!-- Language -->
              <div class="st-field">
                <label class="st-label">Language <span class="st-label-opt">(optional)</span></label>
                <input v-model="form.language" class="st-input" placeholder="e.g. Swahili, English" autocomplete="off" />
              </div>

              <!-- Body -->
              <div class="st-field">
                <label class="st-label">Message body</label>
                <div class="st-placeholder-chips">
                  <span class="st-chip-label">Insert:</span>
                  <button v-for="p in PLACEHOLDERS" :key="p" class="st-chip" @click="insertPlaceholder(p)">{{ p }}</button>
                </div>
                <textarea
                  ref="bodyRef"
                  v-model="form.body"
                  class="st-textarea"
                  rows="8"
                  placeholder="Write your message here. Use the chips above to insert dynamic tokens."
                  autocomplete="off"
                />
                <div class="st-char-count" :class="{ 'st-char-count--warn': charCount > 160 }">
                  {{ charCount }} chars · {{ Math.ceil(charCount / 160) }} SMS segment{{ Math.ceil(charCount / 160) !== 1 ? 's' : '' }}
                </div>
              </div>

              <!-- Live preview -->
              <div class="st-field">
                <label class="st-label">Preview <span class="st-label-opt">(with sample data)</span></label>
                <div class="st-preview-box">{{ previewBody }}</div>
              </div>

              <!-- Active toggle -->
              <div class="st-toggle-card">
                <div class="st-toggle-card-text">
                  <span class="st-toggle-card-label">Active</span>
                  <span class="st-toggle-card-sub">Template will be available for use in events</span>
                </div>
                <button class="st-toggle" :class="{ 'st-toggle--on': form.active }" @click="form.active = !form.active">
                  <span class="st-toggle-knob"/>
                </button>
              </div>

            </div>

            <div class="st-drawer-footer">
              <button class="st-footer-cancel" @click="closeDrawer">Cancel</button>
              <button class="st-footer-save" :disabled="saving || !form.name || !form.category || !form.body" @click="save">
                {{ saving ? 'Saving…' : (editId ? 'Save changes' : 'Create template') }}
              </button>
            </div>

          </div>
        </div>
      </Transition>

      <!-- Delete confirm -->
      <Transition name="st-drawer-fade">
        <div v-if="deleteTarget" class="st-backdrop" @click.self="deleteTarget = null">
          <div class="st-confirm">
            <p class="st-confirm-title">Delete template?</p>
            <p class="st-confirm-body">
              "<strong>{{ deleteTarget.name }}</strong>" will be permanently removed. Event organizers using it won't be affected, but it won't appear in the picker anymore.
            </p>
            <div class="st-confirm-actions">
              <button class="st-footer-cancel" @click="deleteTarget = null">Cancel</button>
              <button class="st-footer-delete" :disabled="saving" @click="doDelete">
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
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'

const CATEGORIES = [
  { key: 'invitation',    label: 'Invitation' },
  { key: 'reminder',      label: 'Reminder' },
  { key: 'save-the-date', label: 'Save the Date' },
  { key: 'contribution',  label: 'Contribution' },
  { key: 'gratitude',     label: 'Gratitude' },
  { key: 'contact',       label: 'Contact / General' },
]

const CHANNELS = [
  { key: 'sms',      label: 'SMS' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'both',     label: 'Both' },
]

const PLACEHOLDERS = ['{{username}}', '{{cname}}', '{{eventname}}', '{{date}}', '{{time}}', '{{venue}}', '{{passcode}}']

const SAMPLE = {
  '{{username}}':  'Amina',
  '{{cname}}':     'Bw. & Bi. Njeama',
  '{{eventname}}': 'Sherehe ya Sendoff',
  '{{date}}':      '4th September 2026',
  '{{time}}':      'Saa 3:00 Asubuhi',
  '{{venue}}':     'Mirado Hall',
  '{{passcode}}':  'HF-2026',
}

// ── State ──────────────────────────────────────────────────────────────────
const templates    = ref([])
const loading      = ref(true)
const search       = ref('')
const filterCat    = ref('')
const filterChannel = ref('')

const drawerOpen   = ref(false)
const editId       = ref(null)
const saving       = ref(false)
const deleteTarget = ref(null)
const bodyRef      = ref(null)

const form = ref(freshForm())

function freshForm() {
  return { name: '', category: '', channel: 'sms', language: '', body: '', active: true }
}

// ── Computed ───────────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = templates.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(q) || t.body?.toLowerCase().includes(q))
  }
  if (filterCat.value)     list = list.filter(t => t.category === filterCat.value)
  if (filterChannel.value) list = list.filter(t => t.channel  === filterChannel.value)
  return list
})

const charCount  = computed(() => form.value.body.length)

const previewBody = computed(() => {
  let text = form.value.body
  Object.entries(SAMPLE).forEach(([token, val]) => {
    text = text.replaceAll(token, val)
  })
  return text || '—'
})

// ── Helpers ────────────────────────────────────────────────────────────────
function catLabel(key)     { return CATEGORIES.find(c => c.key === key)?.label ?? key }
function channelLabel(key) { return CHANNELS.find(c => c.key === key)?.label ?? key }

function insertPlaceholder(token) {
  const el = bodyRef.value
  if (!el) { form.value.body += token; return }
  const start = el.selectionStart
  const end   = el.selectionEnd
  form.value.body = form.value.body.slice(0, start) + token + form.value.body.slice(end)
  el.focus()
  const pos = start + token.length
  el.$nextTick?.(() => el.setSelectionRange(pos, pos))
}

// ── Firestore ──────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'smsTemplates'), orderBy('createdAt', 'desc')))
    templates.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function save() {
  if (!form.value.name || !form.value.category || !form.value.body) return
  saving.value = true
  try {
    const payload = {
      name:     form.value.name.trim(),
      category: form.value.category,
      channel:  form.value.channel,
      language: form.value.language.trim() || null,
      body:     form.value.body,
      active:   form.value.active,
    }
    if (editId.value) {
      await updateDoc(doc(db, 'smsTemplates', editId.value), payload)
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'smsTemplates'), payload)
    }
    await load()
    closeDrawer()
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

async function toggleActive(tpl) {
  try {
    await updateDoc(doc(db, 'smsTemplates', tpl.id), { active: tpl.active === false })
    tpl.active = tpl.active === false
  } catch (e) { console.error(e) }
}

async function doDelete() {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await deleteDoc(doc(db, 'smsTemplates', deleteTarget.value.id))
    templates.value = templates.value.filter(t => t.id !== deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

// ── Drawer helpers ─────────────────────────────────────────────────────────
function openCreate() {
  editId.value  = null
  form.value    = freshForm()
  drawerOpen.value = true
}

function openEdit(tpl) {
  editId.value  = tpl.id
  form.value    = {
    name:     tpl.name,
    category: tpl.category,
    channel:  tpl.channel ?? 'sms',
    language: tpl.language ?? '',
    body:     tpl.body ?? '',
    active:   tpl.active !== false,
  }
  drawerOpen.value = true
}

function closeDrawer() { drawerOpen.value = false }

function confirmDelete(tpl) { deleteTarget.value = tpl }

onMounted(load)
</script>

<style scoped>
/* ── Tokens ── */
.st-root {
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
.st-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.st-topbar-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.st-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; letter-spacing: -0.3px; color: var(--ink);
}
.st-add-btn {
  display: flex; align-items: center; gap: 7px;
  background: #C9A84C; color: #070707;
  border: none; padding: 8px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background 130ms;
}
.st-add-btn:hover { background: #d4b560; }

/* ── Page ── */
.st-page {
  max-width: 1200px; margin: 0 auto;
  padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Stats ── */
.st-stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}
.st-stat {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 14px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.st-stat-num { font-size: 32px; font-weight: 700; color: var(--ink); letter-spacing: -0.5px; line-height: 1; }
.st-stat-num--green { color: var(--emerald); }
.st-stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-dim); }
.st-stat-div { display: none; }

/* ── Filter bar ── */
.st-filterbar {
  background: #111; border: 1px solid var(--line-strong); border-radius: 14px;
  padding: 8px 8px 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.st-search-wrap { position: relative; flex: 1; display: flex; align-items: center; }
.st-search-icon { position: absolute; left: 12px; color: var(--ink-dim); pointer-events: none; }
.st-search {
  width: 100%; background: transparent; border: none;
  color: var(--ink); padding: 7px 14px 7px 36px;
  font-size: 13.5px; font-family: inherit; box-sizing: border-box; outline: none;
}
.st-search::placeholder { color: var(--ink-dim); }
.st-select {
  padding: 6px 10px; border: 1px solid var(--line); border-radius: 8px;
  background: var(--paper-soft); font-size: 12.5px; font-weight: 500;
  color: var(--ink-muted); font-family: inherit; outline: none; color-scheme: dark;
  cursor: pointer;
}

/* ── Empty / loading ── */
.st-empty {
  border: 1px dashed var(--line-strong); border-radius: 20px;
  padding: 60px 20px; text-align: center;
  font-size: 13px; color: var(--ink-muted);
}

/* ── Table ── */
.st-table { background: #141414; border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.st-thead {
  display: grid; grid-template-columns: 1fr 130px 110px 90px 100px 110px;
  padding: 10px 18px; border-bottom: 1px solid #2a2a2a; background: #111;
}
.st-th { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--ink-dim); }
.st-th--name { grid-column: 1; }

.st-row {
  display: grid; grid-template-columns: 1fr 130px 110px 90px 100px 110px;
  padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.04);
  align-items: center; cursor: pointer; transition: background 120ms;
}
.st-row:last-child { border-bottom: none; }
.st-row:hover { background: rgba(255,255,255,0.025); }

.st-td { font-size: 13.5px; color: var(--ink); display: flex; align-items: center; gap: 6px; }
.st-td--name { flex-direction: column; align-items: flex-start; gap: 3px; }
.st-td--muted { font-size: 12px; color: var(--ink-muted); }
.st-td--actions { gap: 4px; justify-content: flex-end; }

.st-tpl-name { font-size: 13.5px; font-weight: 600; color: var(--ink); }
.st-tpl-preview { font-size: 11.5px; color: var(--ink-muted); line-height: 1.4; }

/* Badges */
.st-badge { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
.st-badge--invitation    { background: rgba(60,168,164,0.12); color: #3CA8A4; }
.st-badge--reminder      { background: rgba(201,168,76,0.12); color: var(--gold); }
.st-badge--save-the-date { background: rgba(167,139,250,0.12); color: #a78bfa; }
.st-badge--gratitude     { background: rgba(48,209,88,0.12); color: var(--emerald); }

.st-channel-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 5px; }
.st-channel--sms      { background: rgba(255,159,10,0.12); color: #FF9F0A; }
.st-channel--whatsapp { background: rgba(37,211,102,0.12); color: #25D366; }
.st-channel--both     { background: rgba(255,255,255,0.07); color: var(--ink-soft); }

.st-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.st-status-dot--on  { background: var(--emerald); }
.st-status-dot--off { background: var(--ink-dim); }

.st-row-btn {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--line-strong);
  background: transparent; color: var(--ink-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 120ms, color 120ms, border-color 120ms;
}
.st-row-btn:hover { background: var(--paper-soft); color: var(--ink); border-color: rgba(255,255,255,0.12); }
.st-row-btn--delete:hover { background: rgba(255,69,58,0.1); color: var(--red); border-color: rgba(255,69,58,0.25); }

/* ── Drawer / modal backdrop ── */
.st-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 9999; display: flex; align-items: stretch; justify-content: flex-end;
}
.st-drawer {
  width: 560px; max-width: 100vw;
  background: #161616; border-left: 1px solid #2a2a2a;
  display: flex; flex-direction: column; height: 100vh;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.st-drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #2a2a2a; flex-shrink: 0;
}
.st-drawer-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px;
}
.st-drawer-close {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #2a2a2a; background: transparent;
  color: var(--ink-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 130ms, color 130ms;
}
.st-drawer-close:hover { background: rgba(255,255,255,0.05); color: var(--ink); }

.st-drawer-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

.st-field { display: flex; flex-direction: column; gap: 8px; }
.st-field--row { flex-direction: row; align-items: center; justify-content: space-between; }
.st-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.st-label { font-size: 12px; font-weight: 600; color: var(--ink-muted); }
.st-label-opt { font-weight: 400; font-size: 11px; }
.st-input {
  padding: 10px 13px; border: 1px solid #333; border-radius: 10px;
  background: #0e0e0e; font-size: 14px; color: var(--ink);
  width: 100%; box-sizing: border-box; font-family: inherit; outline: none;
  transition: border-color 150ms, box-shadow 150ms;
  color-scheme: dark;
}
.st-input:focus { border-color: rgba(201,168,76,0.55); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }
.st-input::placeholder { color: var(--ink-dim); }
.st-input--select { cursor: pointer; }

/* Channel toggle */
.st-channel-toggle { display: flex; gap: 4px; background: #0e0e0e; border: 1px solid #333; border-radius: 9px; padding: 4px; }
.st-ch-btn { flex: 1; padding: 7px 8px; border-radius: 6px; border: none; background: transparent; color: var(--ink-muted); font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms; }
.st-ch-btn--active { background: rgba(201,168,76,0.15); color: var(--gold); }
.st-ch-btn:hover:not(.st-ch-btn--active) { background: rgba(255,255,255,0.05); color: var(--ink-soft); }

/* Placeholder chips */
.st-placeholder-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.st-chip-label { font-size: 11px; color: var(--ink-dim); }
.st-chip { background: rgba(255,255,255,0.06); border: 1px solid var(--line-strong); color: var(--ink-soft); padding: 3px 9px; border-radius: 6px; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: background 130ms, border-color 130ms; white-space: nowrap; }
.st-chip:hover { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.3); color: var(--gold); }

.st-textarea { background: #0e0e0e; border: 1px solid #333; color: var(--ink); padding: 12px 14px; border-radius: 9px; font-size: 13.5px; font-family: inherit; resize: vertical; width: 100%; box-sizing: border-box; line-height: 1.6; transition: border-color 150ms, box-shadow 150ms; outline: none; }
.st-textarea:focus { border-color: rgba(201,168,76,0.55); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }

.st-char-count { font-size: 11px; color: var(--ink-dim); text-align: right; }
.st-char-count--warn { color: #FF9F0A; }

.st-preview-box { background: #0e0e0e; border: 1px solid #333; border-radius: 9px; padding: 14px; font-size: 13.5px; color: var(--ink-soft); line-height: 1.65; white-space: pre-wrap; min-height: 80px; }

/* Active toggle */
.st-toggle-card {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: #0e0e0e; border: 1px solid #333; border-radius: 12px;
  padding: 14px 16px;
}
.st-toggle-card-text { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.st-toggle-card-label { font-size: 13.5px; font-weight: 600; color: var(--ink); }
.st-toggle-card-sub   { font-size: 11.5px; color: var(--ink-dim); }
.st-toggle {
  width: 44px; height: 26px; border-radius: 13px;
  background: #383838; border: 1px solid #484848;
  cursor: pointer; padding: 3px; display: flex; align-items: center;
  transition: background 200ms, border-color 200ms; flex-shrink: 0;
}
.st-toggle--on { background: var(--gold); border-color: var(--gold); }
.st-toggle-knob {
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  transition: transform 200ms; flex-shrink: 0;
}
.st-toggle--on .st-toggle-knob { transform: translateX(18px); }

/* Footer */
.st-drawer-footer { padding: 16px 24px; border-top: 1px solid #2a2a2a; display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0; }
.st-footer-cancel {
  background: transparent; border: 1px solid #2a2a2a; color: var(--ink-muted);
  padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms;
}
.st-footer-cancel:hover { background: #1e1e1e; color: var(--ink); }
.st-footer-save {
  background: #C9A84C; color: #070707; border: none;
  padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 130ms;
}
.st-footer-save:hover:not(:disabled) { background: #d4b560; }
.st-footer-save:disabled { opacity: 0.45; cursor: not-allowed; }
.st-footer-delete {
  background: rgba(255,69,58,0.12); color: #FF453A;
  border: 1px solid rgba(255,69,58,0.2); border-radius: 9px;
  padding: 8px 18px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 140ms;
}
.st-footer-delete:hover:not(:disabled) { background: rgba(255,69,58,0.22); }
.st-footer-delete:disabled { opacity: 0.45; cursor: not-allowed; }

/* Delete confirm modal */
.st-confirm {
  background: #161616; border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 28px 28px 24px;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
  min-width: 340px; max-width: 480px; width: 100%;
  display: flex; flex-direction: column; gap: 12px;
  align-self: center; margin: auto;
}
.st-confirm-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); margin: 0; letter-spacing: -0.3px; }
.st-confirm-body { font-size: 13.5px; color: var(--ink-muted); margin: 0 0 8px; line-height: 1.5; }
.st-confirm-body strong { color: var(--ink); }
.st-confirm-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }

/* Transitions */
.st-drawer-fade-enter-active, .st-drawer-fade-leave-active { transition: opacity 180ms; }
.st-drawer-fade-enter-from, .st-drawer-fade-leave-to { opacity: 0; }
</style>
