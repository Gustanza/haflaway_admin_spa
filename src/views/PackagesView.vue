<template>
  <div class="pv-root">

    <!-- Header -->
    <div class="pv-header">
      <h1 class="pv-title">Packages</h1>
      <button class="pv-btn-create" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Package
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="pv-state">
      <div class="pv-spinner" />
      <span>Loading packages…</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!packages.length" class="pv-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="color:#4f617a"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      <span>No packages yet.</span>
    </div>

    <!-- Package list -->
    <div v-else class="pv-list">
      <div v-for="pkg in packages" :key="pkg.id" class="pv-card">

        <!-- Card header -->
        <div class="pv-card-head">
          <div class="pv-card-title-row">
            <span class="pv-card-name">{{ pkg.name }}</span>
            <span class="pv-rank-badge">Rank {{ pkg.rank }}</span>
          </div>
          <div class="pv-card-actions">
            <button class="pv-icon-btn" title="Edit" @click="openEdit(pkg)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="pv-icon-btn pv-icon-btn--danger" title="Delete" @click="confirmDelete(pkg)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>

        <div class="pv-card-body">

          <!-- Pricing -->
          <div class="pv-section">
            <span class="pv-section-label">Pricing (TZS)</span>
            <div class="pv-grid-5">
              <div class="pv-stat">
                <span class="pv-stat-val">{{ fmt(pkg.pricing?.baseSMS) }}</span>
                <span class="pv-stat-key">Base SMS</span>
              </div>
              <div class="pv-stat">
                <span class="pv-stat-val">{{ fmt(pkg.pricing?.baseWhatsAppMessage) }}</span>
                <span class="pv-stat-key">Base WA Msg</span>
              </div>
              <div class="pv-stat">
                <span class="pv-stat-val">{{ fmt(pkg.pricing?.invitationCard) }}</span>
                <span class="pv-stat-key">Invitation Card</span>
              </div>
              <div class="pv-stat">
                <span class="pv-stat-val">{{ fmt(pkg.pricing?.contributionCard) }}</span>
                <span class="pv-stat-key">Contribution Card</span>
              </div>
              <div class="pv-stat">
                <span class="pv-stat-val">{{ fmt(pkg.pricing?.contributionNoCard) }}</span>
                <span class="pv-stat-key">Contribution (No Card)</span>
              </div>
            </div>
          </div>

          <!-- Messaging Quotas -->
          <div class="pv-section">
            <div class="pv-quota-table">
              <button class="pv-quota-toggle-cell" @click="toggleQuota(pkg.id)">
                <span class="pv-section-label">Messaging Quotas</span>
                <svg class="pv-chevron" :class="{ 'pv-chevron--open': !collapsedQuotas.has(pkg.id) }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
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
              <svg class="pv-chevron" :class="{ 'pv-chevron--open': !collapsedServices.has(pkg.id) }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <ul v-if="!collapsedServices.has(pkg.id)" class="pv-services pv-services--spaced">
              <li v-for="(s, i) in pkg.services" :key="i">{{ s }}</li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <Transition name="pv-fade">
        <div v-if="showModal" class="pv-backdrop" @click.self="closeModal">
          <div class="pv-modal">

            <div class="pv-modal-header">
              <span class="pv-modal-title">{{ editingId ? 'Edit Package' : 'New Package' }}</span>
              <button class="pv-modal-close" @click="closeModal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="pv-modal-body">

              <!-- Name + Rank -->
              <div class="pv-field-row">
                <div class="pv-field pv-field--grow">
                  <label>Package Name</label>
                  <input v-model="form.name" type="text" placeholder="e.g. Base Package" />
                </div>
                <div class="pv-field pv-field--sm">
                  <label>Rank</label>
                  <input v-model.number="form.rank" type="number" min="1" placeholder="1" />
                </div>
              </div>

              <!-- Pricing -->
              <div class="pv-modal-section-label">Pricing (TZS)</div>
              <div class="pv-field-grid">
                <div class="pv-field">
                  <label>Base SMS</label>
                  <input v-model.number="form.pricing.baseSMS" type="number" min="0" placeholder="0" />
                </div>
                <div class="pv-field">
                  <label>Base WhatsApp Message</label>
                  <input v-model.number="form.pricing.baseWhatsAppMessage" type="number" min="0" placeholder="0" />
                </div>
                <div class="pv-field">
                  <label>Invitation Card</label>
                  <input v-model.number="form.pricing.invitationCard" type="number" min="0" placeholder="0" />
                </div>
                <div class="pv-field">
                  <label>Contribution Card</label>
                  <input v-model.number="form.pricing.contributionCard" type="number" min="0" placeholder="0" />
                </div>
                <div class="pv-field">
                  <label>Contribution (No Card)</label>
                  <input v-model.number="form.pricing.contributionNoCard" type="number" min="0" placeholder="0" />
                </div>
              </div>

              <!-- Messaging Quotas -->
              <div class="pv-modal-section-label">Messaging Quotas</div>
              <div class="pv-quota-form-head">
                <span></span>
                <span>SMS</span>
                <span>WhatsApp</span>
              </div>
              <div v-for="qkey in quotaKeys" :key="qkey.key" class="pv-quota-form-row">
                <span class="pv-quota-label">{{ qkey.label }}</span>
                <input v-model.number="form.messagingQuota.sms[qkey.key]" type="number" min="0" placeholder="0" />
                <input v-model.number="form.messagingQuota.whatsApp[qkey.key]" type="number" min="0" placeholder="0" />
              </div>

              <!-- Services -->
              <div class="pv-modal-section-label">Services</div>
              <div class="pv-services-form">
                <div v-for="(_, i) in form.services" :key="i" class="pv-service-row">
                  <input v-model="form.services[i]" type="text" placeholder="Service description…" />
                  <button class="pv-icon-btn pv-icon-btn--danger" @click="removeService(i)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="pv-fade">
        <div v-if="deleteTarget" class="pv-backdrop" @click.self="deleteTarget = null">
          <div class="pv-modal pv-modal--sm">
            <p class="pv-modal-title">Delete package?</p>
            <p class="pv-modal-body-text">"{{ deleteTarget.name }}" will be permanently removed.</p>
            <div class="pv-modal-footer">
              <button class="pv-btn-cancel" @click="deleteTarget = null">Cancel</button>
              <button class="pv-btn-danger" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore'

const packages       = ref([])
const loading        = ref(true)
const collapsedQuotas   = ref(new Set())
const collapsedServices = ref(new Set())
const showModal = ref(false)
const saving    = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)
const deleting  = ref(false)

const quotaKeys = [
  { key: 'invitationCardDispatch',         label: 'Invitation Card Dispatch' },
  { key: 'invitationCardReminder',         label: 'Invitation Card Reminder' },
  { key: 'invitationCardGratitudeDispatch',label: 'Invitation Card Gratitude' },
  { key: 'contributionCardDispatch',       label: 'Contribution Card Dispatch' },
  { key: 'saveTheDateCardDispatch',        label: 'Save The Date Dispatch' },
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
  }
}

const form = ref(emptyForm())

function toggleServices(id) {
  const s = collapsedServices.value
  if (s.has(id)) s.delete(id)
  else s.add(id)
  collapsedServices.value = new Set(s)
}

function toggleQuota(id) {
  const s = collapsedQuotas.value
  if (s.has(id)) s.delete(id)
  else s.add(id)
  collapsedQuotas.value = new Set(s)
}

function fmt(n) {
  if (n == null) return '—'
  return 'TZS ' + Number(n).toLocaleString('en-US')
}

async function load() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'eventPlans'), orderBy('rank', 'asc')))
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
      baseSMS: pkg.pricing?.baseSMS ?? 0,
      baseWhatsAppMessage: pkg.pricing?.baseWhatsAppMessage ?? 0,
      invitationCard: pkg.pricing?.invitationCard ?? 0,
      contributionCard: pkg.pricing?.contributionCard ?? 0,
      contributionNoCard: pkg.pricing?.contributionNoCard ?? 0,
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
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

function addService() { form.value.services.push('') }
function removeService(i) { form.value.services.splice(i, 1) }

async function savePackage() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      rank: form.value.rank,
      pricing: { ...form.value.pricing },
      messagingQuota: {
        sms:      { ...form.value.messagingQuota.sms },
        whatsApp: { ...form.value.messagingQuota.whatsApp },
      },
      services: form.value.services.filter(s => s.trim()),
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
/* ── Root ── */
.pv-root {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0d1117;
  color: #e2e8f0;
}

/* ── Header ── */
.pv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 40px 24px;
  border-bottom: 1px solid #1e2d44;
}
.pv-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: -0.4px;
}
.pv-btn-create {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.10);
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.3);
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 150ms, box-shadow 150ms;
  letter-spacing: 0.1px;
}
.pv-btn-create:hover {
  opacity: 0.90;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.4);
}

/* ── State (loading / empty) ── */
.pv-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #4f617a;
  font-size: 14px;
  padding: 80px 0;
}
.pv-spinner {
  width: 28px; height: 28px;
  border: 2.5px solid #1e2d44;
  border-top-color: #8892a4;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── List ── */
.pv-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 40px 40px;
}

/* ── Card ── */
.pv-card {
  background: #111827;
  border: 1px solid #1e2d44;
  border-radius: 14px;
  overflow: hidden;
}
.pv-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #1e2d44;
}
.pv-card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pv-card-name {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px;
  font-weight: 400;
  color: #e2e8f0;
  letter-spacing: -0.3px;
}
.pv-rank-badge {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #C9A84C;
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 8px;
  padding: 2px 8px;
}
.pv-card-actions {
  display: flex;
  gap: 6px;
}
.pv-icon-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #1e2d44;
  background: transparent;
  color: #8892a4;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 130ms, color 130ms, border-color 130ms;
}
.pv-icon-btn:hover { background: #1e2d44; color: #e2e8f0; }
.pv-icon-btn--danger:hover { background: rgba(255,69,58,0.12); color: #FF453A; border-color: rgba(255,69,58,0.2); }

.pv-card-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Section ── */
.pv-section {
  padding: 16px 20px;
  border-bottom: 1px solid #1a2236;
}
.pv-section:last-child { border-bottom: none; }
.pv-section-label {
  display: block;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #4f617a;
  margin-bottom: 12px;
}
.pv-chevron {
  color: #4f617a;
  transition: transform 180ms ease;
  flex-shrink: 0;
}
.pv-chevron--open { transform: rotate(0deg); }
.pv-chevron:not(.pv-chevron--open) { transform: rotate(-90deg); }

/* ── Pricing grid ── */
.pv-grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.pv-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pv-stat-val {
  font-size: 15px;
  font-weight: 700;
  color: #e2e8f0;
}
.pv-stat-key {
  font-size: 11px;
  color: #4f617a;
}

/* ── Quota table ── */
.pv-quota-table { display: grid; grid-template-columns: 1fr auto auto; gap: 2px 24px; }
.pv-quota-toggle-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0 0 6px;
  cursor: pointer;
  text-align: left;
}
.pv-quota-toggle-cell .pv-section-label { margin-bottom: 0; }
.pv-quota-toggle-cell:hover .pv-section-label { color: #8892a4; }
.pv-quota-toggle-cell:hover .pv-chevron { color: #8892a4; }
.pv-quota-col-head {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #4f617a;
  padding-bottom: 6px;
  text-align: center;
  min-width: 40px;
}
.pv-quota-row {
  display: contents;
}
.pv-quota-row span {
  font-size: 13px;
  color: #8892a4;
  padding: 4px 0;
  border-top: 1px solid #1a2236;
  display: flex; align-items: center;
}
.pv-quota-row span:not(:first-child) { justify-content: center; color: #e2e8f0; font-weight: 600; }
.pv-quota-label { color: #8892a4 !important; font-size: 13px; }

/* ── Services ── */
.pv-services-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  width: 100%;
}
.pv-services-toggle .pv-section-label { margin-bottom: 0; }
.pv-services-toggle:hover .pv-section-label { color: #8892a4; }
.pv-services-toggle:hover .pv-chevron { color: #8892a4; }
.pv-services--spaced { margin-top: 12px; }
.pv-services {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pv-services li {
  font-size: 13px;
  color: #8892a4;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.pv-services li::before {
  content: '✓';
  color: #34d399;
  font-size: 11px;
  margin-top: 1px;
  flex-shrink: 0;
}

/* ── Modal ── */
.pv-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.pv-modal {
  background: #111827;
  border: 1px solid #1e2d44;
  border-radius: 16px;
  width: 620px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.pv-modal--sm { width: 380px; }
.pv-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #1e2d44;
  flex-shrink: 0;
}
.pv-modal-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px;
  font-weight: 400;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: -0.3px;
}
.pv-modal-close {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid #1e2d44;
  background: transparent;
  color: #4f617a;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 130ms, color 130ms;
}
.pv-modal-close:hover { background: #1e2d44; color: #e2e8f0; }

.pv-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Fields */
.pv-field-row { display: flex; gap: 12px; }
.pv-field { display: flex; flex-direction: column; gap: 6px; }
.pv-field--grow { flex: 1; }
.pv-field--sm { width: 80px; }
.pv-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pv-field label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: #4f617a;
  text-transform: uppercase;
}
.pv-field input, .pv-services-form input[type="text"] {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13.5px;
  font-family: inherit;
  padding: 8px 10px;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
  width: 100%;
  box-sizing: border-box;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.18);
}
.pv-field input:hover, .pv-services-form input[type="text"]:hover {
  border-color: rgba(255,255,255,0.16);
}
.pv-field input:focus, .pv-services-form input[type="text"]:focus {
  border-color: rgba(201,168,76,0.55);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.12), 0 0 0 3px rgba(201,168,76,0.10);
}

.pv-modal-section-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #4f617a;
  padding-top: 4px;
}

/* Quota form */
.pv-quota-form-head, .pv-quota-form-row {
  display: grid;
  grid-template-columns: 1fr 100px 100px;
  gap: 8px;
  align-items: center;
}
.pv-quota-form-head span {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #4f617a;
}
.pv-quota-form-head span:not(:first-child) { text-align: center; }
.pv-quota-form-row {
  border-top: 1px solid #1a2236;
  padding-top: 6px;
}
.pv-quota-form-row input {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 7px;
  color: #e2e8f0;
  font-size: 13px;
  font-family: inherit;
  padding: 6px 8px;
  outline: none;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 150ms, box-shadow 150ms;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.18);
}
.pv-quota-form-row input:hover { border-color: rgba(255,255,255,0.16); }
.pv-quota-form-row input:focus {
  border-color: rgba(201,168,76,0.55);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.12), 0 0 0 3px rgba(201,168,76,0.10);
}

/* Services form */
.pv-services-form { display: flex; flex-direction: column; gap: 6px; }
.pv-service-row { display: flex; gap: 6px; align-items: center; }
.pv-service-row input { flex: 1; }
.pv-add-service-btn {
  align-self: flex-start;
  background: transparent;
  border: 1px dashed #2a3a52;
  border-radius: 8px;
  color: #4f617a;
  font-size: 12.5px;
  font-family: inherit;
  padding: 6px 12px;
  cursor: pointer;
  transition: border-color 130ms, color 130ms;
}
.pv-add-service-btn:hover { border-color: #8892a4; color: #8892a4; }

/* Modal footer */
.pv-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #1e2d44;
  flex-shrink: 0;
}
.pv-modal-body-text {
  font-size: 13.5px;
  color: #8892a4;
  margin: 4px 24px 0;
  line-height: 1.5;
}
.pv-btn-cancel {
  background: transparent;
  border: 1px solid #2a3a52;
  color: #8892a4;
  padding: 8px 16px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 130ms;
}
.pv-btn-cancel:hover { background: #1a2236; }
.pv-btn-save {
  background: rgba(255,255,255,0.12);
  color: #e2e8f0;
  border: 1px solid rgba(255,255,255,0.12);
  padding: 8px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 130ms;
}
.pv-btn-save:hover { opacity: 0.85; }
.pv-btn-save:disabled { opacity: 0.5; cursor: default; }
.pv-btn-danger {
  background: rgba(255,69,58,0.15);
  color: #FF453A;
  border: 1px solid rgba(255,69,58,0.25);
  padding: 8px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 130ms;
}
.pv-btn-danger:hover { opacity: 0.85; }
.pv-btn-danger:disabled { opacity: 0.5; cursor: default; }

/* ── Transition ── */
.pv-fade-enter-active, .pv-fade-leave-active { transition: opacity 180ms; }
.pv-fade-enter-from, .pv-fade-leave-to { opacity: 0; }
</style>
