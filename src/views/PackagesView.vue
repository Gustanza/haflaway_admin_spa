<template>
  <div class="pv-root">

    <!-- ── Topbar ── -->
    <nav class="pv-topbar">
      <div class="pv-topbar-inner">
        <span class="pv-page-title">Packages</span>
        <button class="pv-add-btn" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Package
        </button>
      </div>
    </nav>

    <!-- ── Page shell ── -->
    <div class="pv-page">

      <!-- Stats -->
      <div v-if="!loading && packages.length" class="pv-stats">
        <div class="pv-stat">
          <span class="pv-stat-num">{{ packages.length }}</span>
          <span class="pv-stat-label">Total Packages</span>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="pv-skeleton-list">
        <div class="pv-skeleton" v-for="i in 3" :key="i" />
      </div>

      <!-- Empty -->
      <div v-else-if="!packages.length" class="pv-empty">
        <span class="pv-empty-glyph">✦</span>
        <p class="pv-empty-title">No packages yet</p>
        <p class="pv-empty-sub">Add your first package above.</p>
      </div>

      <!-- Package list -->
      <div v-else class="pv-list">
        <div v-for="pkg in packages" :key="pkg.id" class="pv-card">

          <!-- Card header -->
          <div class="pv-card-head">
            <div class="pv-card-title-row">
              <span class="pv-card-name">{{ pkg.name }}</span>
              <span class="pv-rank-badge">Rank {{ pkg.rank }}</span>
              <span class="pv-vis-badge" :class="`pv-vis-badge--${pkg.visibility ?? 'public'}`">
                {{ visibilitySummary(pkg) }}
              </span>
            </div>
            <div class="pv-card-actions">
              <button class="pv-icon-btn" title="Edit" @click="openEdit(pkg)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="pv-icon-btn pv-icon-btn--danger" title="Delete" @click="confirmDelete(pkg)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="pv-card-body">

            <!-- Pricing -->
            <div class="pv-section">
              <span class="pv-section-label">Pricing (TZS)</span>
              <div class="pv-grid-5">
                <div class="pv-price-cell">
                  <span class="pv-price-val">{{ fmt(pkg.pricing?.baseSMS) }}</span>
                  <span class="pv-price-key">Base SMS</span>
                </div>
                <div class="pv-price-cell">
                  <span class="pv-price-val">{{ fmt(pkg.pricing?.baseWhatsAppMessage) }}</span>
                  <span class="pv-price-key">Base WA Msg</span>
                </div>
                <div class="pv-price-cell">
                  <span class="pv-price-val">{{ fmt(pkg.pricing?.invitationCard) }}</span>
                  <span class="pv-price-key">Invitation Card</span>
                </div>
                <div class="pv-price-cell">
                  <span class="pv-price-val">{{ fmt(pkg.pricing?.contributionCard) }}</span>
                  <span class="pv-price-key">Contribution Card</span>
                </div>
                <div class="pv-price-cell">
                  <span class="pv-price-val">{{ fmt(pkg.pricing?.contributionNoCard) }}</span>
                  <span class="pv-price-key">Contribution (No Card)</span>
                </div>
              </div>
            </div>

            <!-- Messaging Quotas -->
            <div class="pv-section">
              <div class="pv-quota-table">
                <button class="pv-quota-toggle-cell" @click="toggleQuota(pkg.id)">
                  <span class="pv-section-label">Messaging Quotas</span>
                  <svg class="pv-chevron" :class="{ 'pv-chevron--open': !collapsedQuotas.has(pkg.id) }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <span class="pv-quota-col-head">{{ collapsedQuotas.has(pkg.id) ? '' : 'SMS' }}</span>
                <span class="pv-quota-col-head">{{ collapsedQuotas.has(pkg.id) ? '' : 'WhatsApp' }}</span>
                <template v-if="!collapsedQuotas.has(pkg.id)">
                  <div v-for="qkey in quotaKeys" :key="qkey.key" class="pv-quota-row">
                    <span class="pv-quota-label">{{ qkey.label }}</span>
                    <span>{{ pkg.messagingQuota?.sms?.[qkey.key] ?? '—' }}</span>
                    <span>{{ pkg.messagingQuota?.whatsApp?.[qkey.key] ?? '—' }}</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Services -->
            <div v-if="pkg.services?.length" class="pv-section">
              <button class="pv-services-toggle" @click="toggleServices(pkg.id)">
                <span class="pv-section-label">Services</span>
                <svg class="pv-chevron" :class="{ 'pv-chevron--open': !collapsedServices.has(pkg.id) }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <ul v-if="!collapsedServices.has(pkg.id)" class="pv-services pv-services--spaced">
                <li v-for="(s, i) in pkg.services" :key="i">{{ s }}</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- ── Create / Edit Modal ── -->
    <Teleport to="body">
      <Transition name="pv-fade">
        <div v-if="showModal" class="pv-backdrop" @click.self="closeModal">
          <div class="pv-modal">

            <div class="pv-modal-header">
              <span class="pv-modal-title">{{ editingId ? 'Edit Package' : 'New Package' }}</span>
              <button class="pv-close-btn" @click="closeModal">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="pv-modal-body">

              <!-- Name + Rank -->
              <div class="pv-field-row">
                <div class="pv-field pv-field--grow">
                  <label class="pv-field-label">Package Name</label>
                  <input v-model="form.name" class="pv-field-input" type="text" placeholder="e.g. Base Package" />
                </div>
                <div class="pv-field pv-field--sm">
                  <label class="pv-field-label">Rank</label>
                  <input v-model.number="form.rank" class="pv-field-input" type="number" min="1" placeholder="1" />
                </div>
              </div>

              <!-- Pricing -->
              <div class="pv-modal-section-label">Pricing (TZS)</div>
              <div class="pv-field-grid">
                <div class="pv-field">
                  <label class="pv-field-label">Base SMS</label>
                  <input v-model.number="form.pricing.baseSMS" class="pv-field-input" type="number" min="0" placeholder="0" />
                </div>
                <div class="pv-field">
                  <label class="pv-field-label">Base WhatsApp Message</label>
                  <input v-model.number="form.pricing.baseWhatsAppMessage" class="pv-field-input" type="number" min="0" placeholder="0" />
                </div>
                <div class="pv-field">
                  <label class="pv-field-label">Invitation Card</label>
                  <input v-model.number="form.pricing.invitationCard" class="pv-field-input" type="number" min="0" placeholder="0" />
                </div>
                <div class="pv-field">
                  <label class="pv-field-label">Contribution Card</label>
                  <input v-model.number="form.pricing.contributionCard" class="pv-field-input" type="number" min="0" placeholder="0" />
                </div>
                <div class="pv-field">
                  <label class="pv-field-label">Contribution (No Card)</label>
                  <input v-model.number="form.pricing.contributionNoCard" class="pv-field-input" type="number" min="0" placeholder="0" />
                </div>
              </div>

              <!-- Availability -->
              <div class="pv-modal-section-label">Availability</div>
              <div class="pv-vis-modes" role="radiogroup" aria-label="Availability">
                <button
                  v-for="m in VIS_MODES"
                  :key="m.value"
                  type="button"
                  role="radio"
                  :aria-checked="form.visibility === m.value"
                  class="pv-vis-mode"
                  :class="{ 'pv-vis-mode--on': form.visibility === m.value }"
                  @click="form.visibility = m.value"
                >
                  <span class="pv-vis-mode-top">
                    <span class="pv-vis-radio" aria-hidden="true" />
                    <span class="pv-vis-mode-label">{{ m.label }}</span>
                  </span>
                  <span class="pv-vis-mode-hint">{{ m.hint }}</span>
                </button>
              </div>

              <!-- Segments — only meaningful in segments mode -->
              <template v-if="form.visibility === 'segments'">
                <label class="pv-field-label pv-vis-label">Access tags that can choose this package</label>
                <div class="pv-chip-row">
                  <span v-for="s in form.segments" :key="s" class="pv-chip pv-chip--on">
                    {{ s }}
                    <button type="button" class="pv-chip-x" @click="removeSegment(s)">×</button>
                  </span>
                  <span v-if="!form.segments.length" class="pv-vis-empty">
                    No access tags yet — no organization can choose this package.
                  </span>
                </div>
                <div class="pv-chip-row">
                  <button
                    v-for="s in suggestibleSegments"
                    :key="s"
                    type="button"
                    class="pv-chip pv-chip--add"
                    @click="addSegment(s)"
                  >+ {{ s }}</button>
                </div>
                <div class="pv-seg-input-row">
                  <input
                    v-model="segmentDraft"
                    class="pv-field-input"
                    type="text"
                    placeholder="New access tag, e.g. agent"
                    @keydown.enter.prevent="addSegment(segmentDraft)"
                  />
                  <button type="button" class="pv-add-service-btn" @click="addSegment(segmentDraft)">Add</button>
                </div>
                <p class="pv-vis-note">
                  Access tags are set per organization on the Organizations screen. An org sees this
                  package if it carries any one of these.
                </p>
              </template>

              <!-- Per-org overrides — deliberately secondary -->
              <details class="pv-vis-overrides">
                <summary class="pv-vis-summary">
                  Per-organization overrides
                  <span v-if="overrideCount" class="pv-vis-count">{{ overrideCount }}</span>
                </summary>
                <p class="pv-vis-note">
                  For letting one org in early or holding one back. If an org needs different
                  <em>rates</em>, give it its own package instead — overrides shouldn't carry pricing.
                </p>

                <label class="pv-field-label pv-vis-label">Always allow</label>
                <div class="pv-chip-row">
                  <span v-for="id in form.allowOrgIds" :key="id" class="pv-chip pv-chip--allow">
                    {{ orgName(id) }}
                    <button type="button" class="pv-chip-x" @click="toggleOverride('allow', id)">×</button>
                  </span>
                  <span v-if="!form.allowOrgIds.length" class="pv-vis-empty">None</span>
                </div>

                <label class="pv-field-label pv-vis-label">Never allow <span class="pv-vis-wins">(wins over everything)</span></label>
                <div class="pv-chip-row">
                  <span v-for="id in form.denyOrgIds" :key="id" class="pv-chip pv-chip--deny">
                    {{ orgName(id) }}
                    <button type="button" class="pv-chip-x" @click="toggleOverride('deny', id)">×</button>
                  </span>
                  <span v-if="!form.denyOrgIds.length" class="pv-vis-empty">None</span>
                </div>

                <div class="pv-seg-input-row">
                  <select v-model="overrideOrgId" class="pv-field-input">
                    <option value="">Choose an organization…</option>
                    <option v-for="o in orgs" :key="o.id" :value="o.id">{{ o.name || o.id }}</option>
                  </select>
                  <button type="button" class="pv-add-service-btn" :disabled="!overrideOrgId" @click="toggleOverride('allow', overrideOrgId)">Allow</button>
                  <button type="button" class="pv-add-service-btn pv-add-service-btn--deny" :disabled="!overrideOrgId" @click="toggleOverride('deny', overrideOrgId)">Deny</button>
                </div>
              </details>

              <!-- Live preview: who can actually see this right now -->
              <p class="pv-vis-preview">
                <strong>{{ eligibleOrgs.length }}</strong> of {{ orgs.length }} organizations can choose this package<span v-if="eligibleOrgs.length">: {{ eligibleOrgs.map(o => o.name || o.id).join(', ') }}</span>.
              </p>

              <!-- Messaging Quotas -->
              <div class="pv-modal-section-label">Messaging Quotas</div>
              <div class="pv-quota-form-head">
                <span></span><span>SMS</span><span>WhatsApp</span>
              </div>
              <div v-for="qkey in quotaKeys" :key="qkey.key" class="pv-quota-form-row">
                <span class="pv-quota-label">{{ qkey.label }}</span>
                <input v-model.number="form.messagingQuota.sms[qkey.key]" class="pv-quota-input" type="number" min="0" placeholder="0" />
                <input v-model.number="form.messagingQuota.whatsApp[qkey.key]" class="pv-quota-input" type="number" min="0" placeholder="0" />
              </div>

              <!-- Services -->
              <div class="pv-modal-section-label">Services</div>
              <div class="pv-services-form">
                <div v-for="(_, i) in form.services" :key="i" class="pv-service-row">
                  <input v-model="form.services[i]" class="pv-field-input" type="text" placeholder="Service description…" />
                  <button class="pv-icon-btn pv-icon-btn--danger" @click="removeService(i)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <button class="pv-add-service-btn" @click="addService">+ Add service</button>
              </div>

            </div>

            <div class="pv-modal-footer">
              <button class="pv-btn-cancel" @click="closeModal">Cancel</button>
              <button class="pv-btn-save" :disabled="saving" @click="savePackage">
                {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Create Package') }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirm ── -->
    <Teleport to="body">
      <Transition name="pv-fade">
        <div v-if="deleteTarget" class="pv-backdrop" @click.self="deleteTarget = null">
          <div class="pv-confirm-box">
            <div class="pv-warn-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pv-warn-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="pv-confirm-title">Delete package?</p>
            <p class="pv-confirm-body">"{{ deleteTarget.name }}" will be permanently removed. This cannot be undone.</p>
            <div class="pv-confirm-row">
              <button class="pv-btn-cancel" :disabled="deleting" @click="deleteTarget = null">Cancel</button>
              <button class="pv-btn-danger" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Deleting…' : 'Delete Package' }}
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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import {
  PLAN_VISIBILITY, canOrgSeePlan, normalizeSegment, knownSegments,
} from '../utils/planVisibility.js'

const packages          = ref([])
const loading           = ref(true)
const collapsedQuotas   = ref(new Set())
const collapsedServices = ref(new Set())
const showModal    = ref(false)
const saving       = ref(false)
const editingId    = ref(null)
const deleteTarget = ref(null)
const deleting     = ref(false)

const quotaKeys = [
  { key: 'invitationCardDispatch',          label: 'Invitation Card Dispatch' },
  { key: 'invitationCardReminder',          label: 'Invitation Card Reminder' },
  { key: 'invitationCardGratitudeDispatch', label: 'Invitation Card Gratitude' },
  { key: 'contributionCardDispatch',        label: 'Contribution Card Dispatch' },
  { key: 'saveTheDateCardDispatch',         label: 'Save The Date Dispatch' },
]

function emptyForm() {
  return {
    name: '',
    rank: 1,
    pricing: {
      baseSMS: 0,
      baseWhatsAppMessage: 0,
      invitationCard: 0,
      contributionCard: 0,
      contributionNoCard: 0,
    },
    messagingQuota: {
      sms:      { invitationCardDispatch: 0, invitationCardReminder: 0, invitationCardGratitudeDispatch: 0, contributionCardDispatch: 0, saveTheDateCardDispatch: 0 },
      whatsApp: { invitationCardDispatch: 0, invitationCardReminder: 0, invitationCardGratitudeDispatch: 0, contributionCardDispatch: 0, saveTheDateCardDispatch: 0 },
    },
    services: [],
    // New packages must state their audience rather than inheriting a default —
    // a package that silently ships as public is a pricing leak, and one that
    // silently ships as hidden reads as a bug. 'public' is pre-selected only so
    // the control has a value; the three options are equally weighted in the UI.
    visibility: PLAN_VISIBILITY.PUBLIC,
    segments: [],
    allowOrgIds: [],
    denyOrgIds: [],
  }
}

const form = ref(emptyForm())

// ── Availability ───────────────────────────────────────────────────────────
const VIS_MODES = [
  { value: PLAN_VISIBILITY.PUBLIC,   label: 'Public',     hint: 'Every organization can choose it' },
  { value: PLAN_VISIBILITY.SEGMENTS, label: 'By access tag', hint: 'Only orgs carrying a matching access tag' },
  { value: PLAN_VISIBILITY.HIDDEN,   label: 'Hidden',     hint: 'Nobody — draft or retired' },
]

const orgs = ref([])
const segmentDraft = ref('')
const overrideOrgId = ref('')

const orgName = (id) => orgs.value.find(o => o.id === id)?.name || id

// Existing vocabulary minus what's already on this package, so the chips only
// offer something that would actually change the form.
const suggestibleSegments = computed(() => {
  const used = new Set(form.value.segments)
  return knownSegments(orgs.value, packages.value).filter(s => !used.has(s))
})

const overrideCount = computed(() => form.value.allowOrgIds.length + form.value.denyOrgIds.length)

// Runs the same predicate the client app uses, so this preview can't disagree
// with what orgs actually see in their picker.
const eligibleOrgs = computed(() => orgs.value.filter(o => canOrgSeePlan(o, form.value)))

function addSegment(raw) {
  const s = normalizeSegment(raw)
  if (!s || form.value.segments.includes(s)) { segmentDraft.value = ''; return }
  form.value.segments.push(s)
  segmentDraft.value = ''
}
function removeSegment(s) {
  form.value.segments = form.value.segments.filter(x => x !== s)
}

// An org is in exactly one override list or neither — putting it in both would
// be ambiguous to read even though deny would win.
function toggleOverride(kind, orgId) {
  if (!orgId) return
  const inList = kind === 'allow' ? form.value.allowOrgIds : form.value.denyOrgIds
  if (inList.includes(orgId)) {
    if (kind === 'allow') form.value.allowOrgIds = form.value.allowOrgIds.filter(x => x !== orgId)
    else form.value.denyOrgIds = form.value.denyOrgIds.filter(x => x !== orgId)
  } else {
    form.value.allowOrgIds = form.value.allowOrgIds.filter(x => x !== orgId)
    form.value.denyOrgIds  = form.value.denyOrgIds.filter(x => x !== orgId)
    if (kind === 'allow') form.value.allowOrgIds.push(orgId)
    else form.value.denyOrgIds.push(orgId)
  }
  overrideOrgId.value = ''
}

function toggleServices(id) {
  const s = collapsedServices.value
  if (s.has(id)) s.delete(id); else s.add(id)
  collapsedServices.value = new Set(s)
}

function toggleQuota(id) {
  const s = collapsedQuotas.value
  if (s.has(id)) s.delete(id); else s.add(id)
  collapsedQuotas.value = new Set(s)
}

// Card-level summary — says who can choose the package without opening it.
function visibilitySummary(pkg) {
  const mode = pkg.visibility ?? PLAN_VISIBILITY.PUBLIC
  const extra = (pkg.allowOrgIds?.length ?? 0) + (pkg.denyOrgIds?.length ?? 0)
  const suffix = extra ? ` · ${extra} override${extra > 1 ? 's' : ''}` : ''
  if (mode === PLAN_VISIBILITY.HIDDEN) return 'Hidden' + suffix
  if (mode === PLAN_VISIBILITY.SEGMENTS) {
    const segs = pkg.segments ?? []
    return (segs.length ? segs.join(', ') : 'No access tags') + suffix
  }
  return 'Public' + suffix
}

function fmt(n) {
  if (n == null) return '—'
  return 'TZS ' + Number(n).toLocaleString('en-US')
}

async function load() {
  loading.value = true
  try {
    // Orgs are needed to resolve segment names into "who can actually see this"
    // and to populate the override picker.
    const [snap, orgSnap] = await Promise.all([
      getDocs(query(collection(db, 'eventPlans'), orderBy('rank', 'asc'))),
      getDocs(collection(db, 'organizations')),
    ])
    orgs.value = orgSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    packages.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const ids = new Set(packages.value.map(p => p.id))
    collapsedQuotas.value   = new Set(ids)
    collapsedServices.value = new Set(ids)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  showModal.value = true
}

function openEdit(pkg) {
  editingId.value = pkg.id
  form.value = {
    name: pkg.name ?? '',
    rank: pkg.rank ?? 1,
    pricing: {
      baseSMS:             pkg.pricing?.baseSMS ?? 0,
      baseWhatsAppMessage: pkg.pricing?.baseWhatsAppMessage ?? 0,
      invitationCard:      pkg.pricing?.invitationCard ?? 0,
      contributionCard:    pkg.pricing?.contributionCard ?? 0,
      contributionNoCard:  pkg.pricing?.contributionNoCard ?? 0,
    },
    messagingQuota: {
      sms: {
        invitationCardDispatch:          pkg.messagingQuota?.sms?.invitationCardDispatch ?? 0,
        invitationCardReminder:          pkg.messagingQuota?.sms?.invitationCardReminder ?? 0,
        invitationCardGratitudeDispatch: pkg.messagingQuota?.sms?.invitationCardGratitudeDispatch ?? 0,
        contributionCardDispatch:        pkg.messagingQuota?.sms?.contributionCardDispatch ?? 0,
        saveTheDateCardDispatch:         pkg.messagingQuota?.sms?.saveTheDateCardDispatch ?? 0,
      },
      whatsApp: {
        invitationCardDispatch:          pkg.messagingQuota?.whatsApp?.invitationCardDispatch ?? 0,
        invitationCardReminder:          pkg.messagingQuota?.whatsApp?.invitationCardReminder ?? 0,
        invitationCardGratitudeDispatch: pkg.messagingQuota?.whatsApp?.invitationCardGratitudeDispatch ?? 0,
        contributionCardDispatch:        pkg.messagingQuota?.whatsApp?.contributionCardDispatch ?? 0,
        saveTheDateCardDispatch:         pkg.messagingQuota?.whatsApp?.saveTheDateCardDispatch ?? 0,
      },
    },
    services: [...(pkg.services ?? [])],
    // Packages created before this feature carry no visibility field; reading
    // that as public matches how the client resolver treats them, so opening
    // and saving an old package doesn't silently change who can see it.
    visibility:  pkg.visibility ?? PLAN_VISIBILITY.PUBLIC,
    segments:    [...(pkg.segments ?? [])],
    allowOrgIds: [...(pkg.allowOrgIds ?? [])],
    denyOrgIds:  [...(pkg.denyOrgIds ?? [])],
  }
  segmentDraft.value = ''
  overrideOrgId.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

function addService()     { form.value.services.push('') }
function removeService(i) { form.value.services.splice(i, 1) }

async function savePackage() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    const payload = {
      name:    form.value.name.trim(),
      rank:    form.value.rank,
      pricing: { ...form.value.pricing },
      messagingQuota: {
        sms:      { ...form.value.messagingQuota.sms },
        whatsApp: { ...form.value.messagingQuota.whatsApp },
      },
      services: form.value.services.filter(s => s.trim()),
      visibility:  form.value.visibility,
      // Segments are only consulted in 'segments' mode, but they're persisted
      // either way so flipping a package to public and back doesn't lose the
      // audience someone already configured.
      segments:    [...new Set(form.value.segments.map(normalizeSegment).filter(Boolean))],
      allowOrgIds: [...new Set(form.value.allowOrgIds)],
      denyOrgIds:  [...new Set(form.value.denyOrgIds)],
    }
    if (editingId.value) {
      await updateDoc(doc(db, 'eventPlans', editingId.value), payload)
    } else {
      await addDoc(collection(db, 'eventPlans'), payload)
    }
    closeModal()
    await load()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function confirmDelete(pkg) { deleteTarget.value = pkg }

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteDoc(doc(db, 'eventPlans', deleteTarget.value.id))
    deleteTarget.value = null
    await load()
  } catch (e) {
    console.error(e)
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
/* ── Tokens ── */
.pv-root {
  --ink:         #f0f0ec;
  --ink-soft:    #d8d4cd;
  --ink-muted:   #888;
  --ink-dim:     #555;
  --line:        #242424;
  --line-soft:   #1e1e1e;
  --line-strong: #2a2a2a;
  --paper-soft:  #141414;
  --gold:        #C9A84C;
  --gold-bg:     rgba(201,168,76,0.08);
  --gold-border: rgba(201,168,76,0.25);
  --emerald:     #30D158;
  min-height: 100vh;
  background: #0a0a0b;
  color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Topbar ── */
.pv-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.pv-topbar-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.pv-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px;
}
.pv-add-btn {
  display: flex; align-items: center; gap: 7px;
  background: #C9A84C; color: #070707; border: none;
  padding: 8px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 130ms;
}
.pv-add-btn:hover { background: #d4b560; }

/* ── Page shell ── */
.pv-page {
  max-width: 1200px; margin: 0 auto;
  padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Stats ── */
.pv-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}
.pv-stat {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 14px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.pv-stat-num {
  font-size: 32px; font-weight: 700; color: var(--ink);
  letter-spacing: -0.5px; line-height: 1;
}
.pv-stat-label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--ink-dim);
}

/* ── Skeletons ── */
.pv-skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.pv-skeleton {
  height: 120px; border-radius: 14px;
  background: linear-gradient(90deg, #141414 25%, #1a1a1a 50%, #141414 75%);
  background-size: 200% 100%;
  animation: pv-shimmer 1.4s infinite;
}
@keyframes pv-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty ── */
.pv-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 20px;
  border: 1px dashed var(--line-strong); border-radius: 20px;
}
.pv-empty-glyph { font-size: 28px; color: var(--gold); opacity: 0.6; }
.pv-empty-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px; color: var(--ink); margin: 0;
}
.pv-empty-sub { font-size: 13px; color: var(--ink-muted); margin: 0; }

/* ── Package list ── */
.pv-list { display: flex; flex-direction: column; gap: 12px; }

/* ── Card ── */
.pv-card {
  background: #141414; border: 1px solid #2a2a2a;
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.pv-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--line-strong);
  background: #111;
}
.pv-card-title-row { display: flex; align-items: center; gap: 10px; }
.pv-card-name {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px;
}
.pv-rank-badge {
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.5px;
  color: var(--gold); background: var(--gold-bg); border: 1px solid var(--gold-border);
  border-radius: 8px; padding: 2px 8px;
}
/* ── Availability ── */
.pv-card-title-row { flex-wrap: wrap; }
.pv-vis-badge {
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.4px;
  border-radius: 8px; padding: 2px 8px; border: 1px solid transparent;
}
.pv-vis-badge--public   { color: var(--ink-dim);  background: rgba(142,142,147,.12); border-color: rgba(142,142,147,.2); }
.pv-vis-badge--segments { color: #64D2FF; background: rgba(100,210,255,.10); border-color: rgba(100,210,255,.24); }
.pv-vis-badge--hidden   { color: #FF9F0A; background: rgba(255,159,10,.10); border-color: rgba(255,159,10,.24); }

.pv-vis-modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.pv-vis-mode {
  display: flex; flex-direction: column; gap: 6px; text-align: left;
  padding: 10px 12px; border-radius: 10px; cursor: pointer; font-family: inherit;
  border: 1px solid var(--line-strong); background: rgba(255,255,255,0.02);
  transition: border-color 140ms, background 140ms, box-shadow 140ms;
}
.pv-vis-mode:hover { border-color: rgba(255,255,255,0.28); background: rgba(255,255,255,0.04); }
.pv-vis-mode--on {
  border-color: var(--gold);
  background: rgba(201,168,76,0.12);
  box-shadow: inset 0 0 0 1px rgba(201,168,76,0.35);
}
.pv-vis-mode-top { display: flex; align-items: center; gap: 8px; }
/* Real radio dot — the border-color/background diff alone read as "nothing changed"
   against this dark panel, so selection needs its own explicit glyph. */
.pv-vis-radio {
  width: 15px; height: 15px; flex-shrink: 0; box-sizing: border-box;
  border-radius: 50%; border: 1.5px solid var(--ink-dim);
  position: relative;
  transition: border-color 140ms;
}
.pv-vis-mode--on .pv-vis-radio { border-color: var(--gold); }
.pv-vis-mode--on .pv-vis-radio::after {
  content: ''; position: absolute; inset: 3px; border-radius: 50%; background: var(--gold);
}
.pv-vis-mode-label { font-size: 13px; font-weight: 700; color: var(--ink); }
.pv-vis-mode--on .pv-vis-mode-label { color: var(--gold); }
.pv-vis-mode-hint { font-size: 11px; color: var(--ink-dim); line-height: 1.4; padding-left: 23px; }

.pv-vis-label { margin-top: 12px; display: block; }
.pv-chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pv-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 600; border-radius: 8px; padding: 4px 8px;
  border: 1px solid transparent; font-family: inherit;
}
.pv-chip--on    { color: #64D2FF; background: rgba(100,210,255,.10); border-color: rgba(100,210,255,.24); }
.pv-chip--allow { color: var(--emerald, #30D158); background: rgba(48,209,88,.10); border-color: rgba(48,209,88,.24); }
.pv-chip--deny  { color: #FF453A; background: rgba(255,69,58,.10); border-color: rgba(255,69,58,.22); }
.pv-chip--add {
  color: var(--ink-dim); background: transparent; border: 1px dashed var(--line-strong); cursor: pointer;
}
.pv-chip--add:hover { color: var(--ink); border-color: rgba(255,255,255,0.28); }
.pv-chip-x {
  background: none; border: none; color: inherit; cursor: pointer;
  font-size: 14px; line-height: 1; padding: 0 1px; opacity: 0.7;
}
.pv-chip-x:hover { opacity: 1; }

.pv-seg-input-row { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
.pv-seg-input-row .pv-field-input { flex: 1; }
.pv-add-service-btn--deny { color: #FF453A; border-color: rgba(255,69,58,.3); }
.pv-vis-empty { font-size: 11.5px; color: var(--ink-dim); font-style: italic; }
.pv-vis-wins  { font-weight: 400; color: var(--ink-dim); text-transform: none; letter-spacing: 0; }
.pv-vis-note  { font-size: 11.5px; color: var(--ink-dim); line-height: 1.55; margin: 8px 0 0; }
.pv-vis-preview {
  font-size: 12px; color: var(--ink-muted); line-height: 1.55; margin: 12px 0 0;
  background: rgba(255,255,255,0.03); border: 1px solid var(--line-strong);
  border-radius: 10px; padding: 9px 12px;
}
.pv-vis-preview strong { color: var(--ink); }

.pv-vis-overrides { margin-top: 14px; border-top: 1px solid var(--line-strong); padding-top: 12px; }
.pv-vis-summary {
  font-size: 12px; font-weight: 600; color: var(--ink-muted);
  cursor: pointer; display: flex; align-items: center; gap: 7px;
}
.pv-vis-summary:hover { color: var(--ink); }
.pv-vis-count {
  font-size: 10px; font-weight: 700; color: var(--gold);
  background: var(--gold-bg); border-radius: 6px; padding: 1px 6px;
}

.pv-card-actions { display: flex; gap: 6px; }
.pv-icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--line-strong); background: transparent;
  color: var(--ink-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 130ms, color 130ms, border-color 130ms;
}
.pv-icon-btn:hover { background: rgba(255,255,255,0.05); color: var(--ink); border-color: rgba(255,255,255,0.12); }
.pv-icon-btn--danger:hover { background: rgba(255,69,58,0.12); color: #FF453A; border-color: rgba(255,69,58,0.2); }

.pv-card-body { display: flex; flex-direction: column; }

/* ── Section ── */
.pv-section {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.pv-section:last-child { border-bottom: none; }
.pv-section-label {
  display: block;
  font-size: 9.5px; font-weight: 700; letter-spacing: 1.2px;
  text-transform: uppercase; color: var(--ink-dim); margin-bottom: 12px;
}

/* ── Pricing grid ── */
.pv-grid-5 {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
}
.pv-price-cell { display: flex; flex-direction: column; gap: 4px; }
.pv-price-val  { font-size: 14px; font-weight: 700; color: var(--ink); }
.pv-price-key  { font-size: 11px; color: var(--ink-dim); }

/* ── Chevron ── */
.pv-chevron { color: var(--ink-dim); transition: transform 180ms ease; flex-shrink: 0; }
.pv-chevron--open { transform: rotate(0deg); }
.pv-chevron:not(.pv-chevron--open) { transform: rotate(-90deg); }

/* ── Quota table ── */
.pv-quota-table { display: grid; grid-template-columns: 1fr auto auto; gap: 2px 24px; }
.pv-quota-toggle-cell {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; padding: 0 0 6px;
  cursor: pointer; text-align: left;
}
.pv-quota-toggle-cell .pv-section-label { margin-bottom: 0; }
.pv-quota-toggle-cell:hover .pv-section-label,
.pv-quota-toggle-cell:hover .pv-chevron { color: var(--ink-muted); }
.pv-quota-col-head {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; color: var(--ink-dim);
  padding-bottom: 6px; text-align: center; min-width: 40px;
}
.pv-quota-row { display: contents; }
.pv-quota-row span {
  font-size: 13px; color: var(--ink-muted);
  padding: 5px 0; border-top: 1px solid rgba(255,255,255,0.04);
  display: flex; align-items: center;
}
.pv-quota-row span:not(:first-child) { justify-content: center; color: var(--ink); font-weight: 600; }
.pv-quota-label { color: var(--ink-muted) !important; }

/* ── Services ── */
.pv-services-toggle {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; padding: 0;
  cursor: pointer; text-align: left; width: 100%;
}
.pv-services-toggle .pv-section-label { margin-bottom: 0; }
.pv-services-toggle:hover .pv-section-label,
.pv-services-toggle:hover .pv-chevron { color: var(--ink-muted); }
.pv-services--spaced { margin-top: 12px; }
.pv-services { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
.pv-services li { font-size: 13px; color: var(--ink-muted); display: flex; align-items: flex-start; gap: 8px; }
.pv-services li::before { content: '✓'; color: var(--emerald); font-size: 11px; margin-top: 1px; flex-shrink: 0; }

/* ── Backdrop ── */
.pv-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 9999; display: flex; align-items: center; justify-content: center;
  padding: 24px; box-sizing: border-box;
}

/* ── Modal ── */
.pv-modal {
  background: #161616; border: 1px solid #2a2a2a; border-radius: 16px;
  width: 620px; max-width: 100%; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.pv-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid #2a2a2a; flex-shrink: 0;
}
.pv-modal-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px; margin: 0;
}
.pv-close-btn {
  width: 32px; height: 32px; border-radius: 9px;
  border: 1px solid #2a2a2a; background: transparent; color: var(--ink-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: color 150ms; padding: 0; box-sizing: border-box;
}
.pv-close-btn:hover { color: var(--ink); }
.pv-modal-body {
  flex: 1; overflow-y: auto; padding: 20px 24px;
  display: flex; flex-direction: column; gap: 14px;
}
.pv-modal-section-label {
  font-size: 9.5px; font-weight: 700; letter-spacing: 1.2px;
  text-transform: uppercase; color: var(--ink-dim); padding-top: 4px;
}

/* ── Form fields ── */
.pv-field-row   { display: flex; gap: 12px; }
.pv-field       { display: flex; flex-direction: column; gap: 6px; }
.pv-field--grow { flex: 1; }
.pv-field--sm   { width: 80px; }
.pv-field-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pv-field-label { font-size: 12px; font-weight: 600; color: var(--ink-muted); }
.pv-field-input {
  background: #161616; border: 0.8px solid #2a2a2a; border-radius: 10px;
  padding: 10px 13px; font-size: 14px; color: var(--ink); font-family: inherit;
  outline: none; width: 100%; box-sizing: border-box;
  transition: border-color 150ms, box-shadow 150ms;
  color-scheme: dark;
}
.pv-field-input::placeholder { color: var(--ink-dim); }
.pv-field-input:focus { border-color: rgba(201,168,76,0.5); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }

/* ── Quota form ── */
.pv-quota-form-head,
.pv-quota-form-row {
  display: grid; grid-template-columns: 1fr 100px 100px; gap: 8px; align-items: center;
}
.pv-quota-form-head span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--ink-dim); }
.pv-quota-form-head span:not(:first-child) { text-align: center; }
.pv-quota-form-row { border-top: 1px solid rgba(255,255,255,0.04); padding-top: 6px; }
.pv-quota-input {
  background: #161616; border: 0.8px solid #2a2a2a; border-radius: 7px;
  color: var(--ink); font-size: 13px; font-family: inherit;
  padding: 6px 8px; outline: none; text-align: center;
  width: 100%; box-sizing: border-box;
  transition: border-color 150ms, box-shadow 150ms;
  color-scheme: dark;
}
.pv-quota-input:hover { border-color: rgba(255,255,255,0.12); }
.pv-quota-input:focus { border-color: rgba(201,168,76,0.5); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }

/* ── Services form ── */
.pv-services-form { display: flex; flex-direction: column; gap: 6px; }
.pv-service-row   { display: flex; gap: 6px; align-items: center; }
.pv-service-row .pv-field-input { flex: 1; }
.pv-add-service-btn {
  align-self: flex-start; background: transparent;
  border: 1px dashed var(--line-strong); border-radius: 8px;
  color: var(--ink-dim); font-size: 12.5px; font-family: inherit;
  padding: 6px 12px; cursor: pointer;
  transition: border-color 130ms, color 130ms;
}
.pv-add-service-btn:hover { border-color: var(--ink-muted); color: var(--ink-muted); }

/* ── Modal footer ── */
.pv-modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 24px; border-top: 1px solid #2a2a2a; flex-shrink: 0;
}
.pv-btn-cancel {
  background: transparent; border: 1px solid #2a2a2a; color: var(--ink-muted);
  padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms;
}
.pv-btn-cancel:hover:not(:disabled) { background: #1e1e1e; color: var(--ink); }
.pv-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
.pv-btn-save {
  background: #C9A84C; color: #070707; border: none;
  padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 130ms;
}
.pv-btn-save:hover:not(:disabled) { background: #d4b560; }
.pv-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Delete confirm ── */
.pv-confirm-box {
  width: 100%; max-width: 360px; background: #161616;
  border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 28px 28px 24px; display: flex; flex-direction: column;
  align-items: center; gap: 12px; text-align: center;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.pv-warn-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(255,69,58,0.10); border: 1px solid rgba(255,69,58,0.2);
  display: flex; align-items: center; justify-content: center;
}
.pv-warn-icon { color: #FF453A; }
.pv-confirm-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px; font-weight: 400; color: var(--ink); margin: 0;
}
.pv-confirm-body { font-size: 13.5px; color: var(--ink-muted); margin: 0; line-height: 1.5; }
.pv-confirm-row  { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
.pv-confirm-row .pv-btn-cancel { flex: 1; }
.pv-btn-danger {
  flex: 1; padding: 8px 18px; border-radius: 9px;
  border: 1px solid rgba(255,69,58,0.2); background: rgba(255,69,58,0.12);
  color: #FF453A; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 130ms;
}
.pv-btn-danger:hover:not(:disabled) { opacity: 0.85; }
.pv-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Transition ── */
.pv-fade-enter-active, .pv-fade-leave-active { transition: opacity 180ms; }
.pv-fade-enter-from,   .pv-fade-leave-to     { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .pv-page    { padding: 20px 20px 40px; }
  .pv-grid-5  { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .pv-topbar-inner { padding: 12px 16px; }
  .pv-page    { padding: 16px 16px 32px; }
  .pv-grid-5  { grid-template-columns: repeat(2, 1fr); }
  .pv-field-grid { grid-template-columns: 1fr; }
  .pv-quota-form-head,
  .pv-quota-form-row { grid-template-columns: 1fr 80px 80px; }
}
</style>
