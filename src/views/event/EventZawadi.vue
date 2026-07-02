<template>
  <div class="ez-root">

    <!-- ── Stat cards ── -->
    <div class="ez-stats">
      <div class="ez-stat-card">
        <div class="ez-stat-icon ez-stat-icon--purple">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
        <div class="ez-stat-body">
          <span class="ez-stat-lbl">Gift Items</span>
          <span class="ez-stat-val">{{ items.length }}</span>
        </div>
      </div>
      <div class="ez-stat-card">
        <div class="ez-stat-icon ez-stat-icon--gold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="8 12 12 16 16 12"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
          </svg>
        </div>
        <div class="ez-stat-body">
          <span class="ez-stat-lbl">Total Target</span>
          <span class="ez-stat-val ez-stat-val--money">TZS {{ fmtAmt(totalTarget) }}</span>
        </div>
      </div>
      <div class="ez-stat-card">
        <div class="ez-stat-icon ez-stat-icon--teal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="ez-stat-body">
          <span class="ez-stat-lbl">Funded</span>
          <span class="ez-stat-val ez-stat-val--money">TZS {{ fmtAmt(totalFunded) }}</span>
        </div>
      </div>
      <div class="ez-stat-card">
        <div class="ez-stat-icon ez-stat-icon--blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="ez-stat-body">
          <span class="ez-stat-lbl">Contributors</span>
          <span class="ez-stat-val">{{ totalContribs }}</span>
        </div>
      </div>
    </div>

    <!-- ── Panel ── -->
    <div class="ez-panel">

      <!-- Panel header -->
      <div class="ez-panel-hd">
        <h2 class="ez-panel-title">Gifts of Love</h2>
        <div class="ez-search-wrap ez-hd-search">
          <svg class="ez-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQ" class="ez-search" placeholder="Search gift items…" />
          <button v-if="searchQ" class="ez-search-clear" @click="searchQ = ''">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="ez-panel-acts">
          <button class="ez-refresh-btn" @click="loadItems" :disabled="loading" title="Refresh">
            <svg :class="{ 'ez-spin': loading }" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button class="ez-add-btn" @click="openItemForm(null)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Item
          </button>
        </div>
      </div>

      <!-- Panel body -->
      <div class="ez-panel-body">

        <!-- Loading -->
        <div v-if="loading" class="ez-empty">
          <svg class="ez-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#C9A84C" stroke-width="2.2" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p>Loading gift items…</p>
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredItems.length" class="ez-empty">
          <div class="ez-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
              stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          </div>
          <p class="ez-empty-title">{{ searchQ ? 'No items match' : 'No gift items yet' }}</p>
          <p class="ez-empty-sub">{{ searchQ ? 'Try a different search' : 'Add your first Gift of Love item for guests to contribute to' }}</p>
          <button v-if="!searchQ" class="ez-empty-cta" @click="openItemForm(null)">Add Item</button>
        </div>

        <!-- Items list -->
        <div v-else class="ez-items-list">
          <div v-for="item in filteredItems" :key="item.id"
            class="ez-item-card" @click="openDetail(item)">

            <!-- Header row -->
            <div class="ez-item-head">
              <div class="ez-item-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
                  stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              </div>
              <div class="ez-item-info">
                <p class="ez-item-title">{{ item.title }}</p>
                <p v-if="item.description" class="ez-item-desc">{{ item.description }}</p>
              </div>
              <!-- Actions -->
              <div class="ez-item-actions" @click.stop>
                <template v-if="confirmDeleteId === item.id">
                  <span class="ez-del-lbl">Delete?</span>
                  <button class="ez-del-yes" @click.stop="deleteItem(item)"
                    :disabled="deletingId === item.id">
                    {{ deletingId === item.id ? '…' : 'Yes' }}
                  </button>
                  <button class="ez-del-no" @click.stop="confirmDeleteId = null">No</button>
                </template>
                <template v-else>
                  <button class="ez-action-btn ez-action-btn--edit"
                    @click.stop="openItemForm(item)" title="Edit">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.2" stroke-linecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="ez-action-btn ez-action-btn--del"
                    @click.stop="confirmDeleteId = item.id" title="Delete">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.2" stroke-linecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </template>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="ez-item-bar-track">
              <div class="ez-item-bar-fill"
                :style="{
                  width: `${Math.min(100, itemPct(item) * 100)}%`,
                  background: itemPct(item) >= 1 ? '#30D158' : '#C9A84C'
                }"/>
            </div>

            <!-- Amounts row -->
            <div class="ez-item-foot">
              <span class="ez-item-funded">TZS {{ fmtAmt(item.totalFunded) }}</span>
              <span class="ez-item-target">/ TZS {{ fmtAmt(item.targetAmount) }}</span>
              <div class="ez-item-badges">
                <span class="ez-item-pct-badge"
                  :class="itemPct(item) >= 1 ? 'ez-item-pct-badge--done' : ''">
                  {{ (itemPct(item) * 100).toFixed(0) }}%
                </span>
                <span class="ez-item-gifts-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#C9A84C" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ item.contributorCount }}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- ══ Detail Drawer ══ -->
    <Teleport to="body">
      <Transition name="ez-fade">
        <div v-if="selectedItem" class="ez-overlay" @click.self="closeDetail">
          <Transition name="ez-slide">
            <div class="ez-drawer" v-if="selectedItem">

              <!-- Drawer header -->
              <div class="ez-drawer-head">
                <button class="ez-drawer-back" @click="closeDetail">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Close
                </button>
                <button class="ez-drawer-edit-btn" @click="openItemForm(selectedItem)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.2" stroke-linecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              </div>

              <!-- Item title + badge -->
              <div class="ez-drawer-title-row">
                <div class="ez-drawer-ico">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
                    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"/>
                    <rect x="2" y="7" width="20" height="5"/>
                    <line x1="12" y1="22" x2="12" y2="7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                </div>
                <div>
                  <p class="ez-drawer-item-title">{{ selectedItem.title }}</p>
                  <span class="ez-drawer-badge">GIFT OF LOVE</span>
                </div>
              </div>

              <!-- Progress card -->
              <div class="ez-prog-card">
                <p v-if="selectedItem.description" class="ez-prog-desc">{{ selectedItem.description }}</p>

                <!-- Ring + stats -->
                <div class="ez-prog-row">
                  <!-- SVG ring -->
                  <svg class="ez-ring" width="76" height="76" viewBox="0 0 76 76">
                    <circle cx="38" cy="38" r="29" fill="none" stroke="#ECECEF" stroke-width="6"/>
                    <circle cx="38" cy="38" r="29" fill="none"
                      :stroke="itemPct(selectedItem) >= 1 ? '#30D158' : '#C9A84C'"
                      stroke-width="6"
                      :stroke-dasharray="182.2"
                      :stroke-dashoffset="182.2 * (1 - itemPct(selectedItem))"
                      stroke-linecap="round"
                      transform="rotate(-90 38 38)"/>
                    <text x="38" y="43" text-anchor="middle" font-size="13" font-weight="800"
                      :fill="itemPct(selectedItem) >= 1 ? '#30D158' : '#C9A84C'">
                      {{ (itemPct(selectedItem) * 100).toFixed(0) }}%
                    </text>
                  </svg>

                  <!-- Stats -->
                  <div class="ez-prog-stats">
                    <div class="ez-prog-stat-row">
                      <span class="ez-prog-stat-lbl">Funded</span>
                      <span class="ez-prog-stat-val" style="color:#C9A84C">
                        TZS {{ fmtAmt(selectedItem.totalFunded) }}
                      </span>
                    </div>
                    <div class="ez-prog-stat-row">
                      <span class="ez-prog-stat-lbl">Target</span>
                      <span class="ez-prog-stat-val">TZS {{ fmtAmt(selectedItem.targetAmount) }}</span>
                    </div>
                    <div class="ez-prog-stat-row">
                      <span class="ez-prog-stat-lbl">Remaining</span>
                      <span class="ez-prog-stat-val">
                        TZS {{ fmtAmt(Math.max(0, selectedItem.targetAmount - selectedItem.totalFunded)) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Linear bar -->
                <div class="ez-prog-bar-track" style="margin-top:14px">
                  <div class="ez-prog-bar-fill"
                    :style="{
                      width: `${Math.min(100, itemPct(selectedItem) * 100)}%`,
                      background: itemPct(selectedItem) >= 1 ? '#30D158' : '#C9A84C'
                    }"/>
                </div>

                <!-- Goal reached -->
                <div v-if="itemPct(selectedItem) >= 1" class="ez-goal-reached">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30D158"
                    stroke-width="2.5" stroke-linecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Goal reached!
                </div>
              </div>

              <!-- Contributors section -->
              <div class="ez-drawer-section">
                <div class="ez-section-head">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#C9A84C" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span class="ez-section-lbl">Contributors</span>
                  <span v-if="selectedItem.contributorCount > 0" class="ez-section-cnt">
                    {{ selectedItem.contributorCount }}
                  </span>
                </div>

                <div v-if="loadingContribs" class="ez-contribs-loading">
                  <svg class="ez-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#C9A84C" stroke-width="2.2" stroke-linecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>

                <div v-else-if="!contributions.length" class="ez-contribs-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D0CAC0"
                    stroke-width="1.5" stroke-linecap="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <p>No contributions yet</p>
                  <p class="ez-contribs-empty-sub">Gifts will appear here once guests contribute</p>
                </div>

                <div v-else class="ez-contribs-list">
                  <div v-for="c in contributions" :key="c.id" class="ez-contrib-tile">
                    <div class="ez-contrib-avatar"
                      :style="{ background: avatarBg(c.attendeeInitial), color: avatarFg(c.attendeeInitial) }">
                      {{ c.attendeeInitial }}
                    </div>
                    <div class="ez-contrib-info">
                      <div class="ez-contrib-name-row">
                        <span class="ez-contrib-name">{{ c.attendeeName }}</span>
                        <span class="ez-contrib-amt">TZS {{ fmtAmt(c.amount) }}</span>
                      </div>
                      <p v-if="c.note" class="ez-contrib-note">"{{ c.note }}"</p>
                      <p class="ez-contrib-date">{{ formatDate(c.paidAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ Add / Edit Modal ══ -->
    <Teleport to="body">
      <Transition name="ez-fade">
        <div v-if="showItemForm" class="ez-modal-overlay" @click.self="showItemForm = false">
          <div class="ez-modal">
            <!-- Header -->
            <div class="ez-modal-head">
              <div class="ez-modal-ico">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
                  stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              </div>
              <h3 class="ez-modal-title">{{ editingItem ? 'Edit Item' : 'New Gift Item' }}</h3>
            </div>

            <!-- Fields -->
            <div class="ez-modal-body">
              <label class="ez-field-lbl">Item Name <span class="ez-required">*</span></label>
              <input ref="titleInputRef" v-model="formTitle" class="ez-field-inp"
                :class="{ 'ez-field-inp--err': formErrors.title }"
                placeholder="e.g. Honeymoon Trip to Zanzibar"
                @keydown.enter="saveItem" />
              <p v-if="formErrors.title" class="ez-field-err">{{ formErrors.title }}</p>

              <label class="ez-field-lbl" style="margin-top:14px">Description <span class="ez-optional">(optional)</span></label>
              <textarea v-model="formDesc" class="ez-field-inp ez-field-ta"
                placeholder="Short note about this item…" rows="2"/>

              <label class="ez-field-lbl" style="margin-top:14px">Target Amount (TZS) <span class="ez-required">*</span></label>
              <input v-model="formAmount" class="ez-field-inp"
                :class="{ 'ez-field-inp--err': formErrors.amount }"
                type="number" min="1"
                placeholder="e.g. 500000"
                @keydown.enter="saveItem" />
              <p v-if="formErrors.amount" class="ez-field-err">{{ formErrors.amount }}</p>
            </div>

            <!-- Actions -->
            <div class="ez-modal-actions">
              <button class="ez-modal-cancel" @click="showItemForm = false">Cancel</button>
              <button class="ez-modal-save" @click="saveItem" :disabled="savingItem">
                {{ savingItem ? 'Saving…' : (editingItem ? 'Save Changes' : 'Add Item') }}
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
import { useRoute } from 'vue-router'
import { db } from '../../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, where, serverTimestamp,
} from 'firebase/firestore'

const props   = defineProps({ event: Object, eventId: String })
const route   = useRoute()
const eventId = computed(() => props.eventId ?? route.params.eventId)

// ── State ─────────────────────────────────────────────────────────────────────
const items        = ref([])
const loading      = ref(false)
const searchQ      = ref('')

const selectedItem    = ref(null)
const contributions   = ref([])
const loadingContribs = ref(false)

const showItemForm  = ref(false)
const editingItem   = ref(null)
const formTitle     = ref('')
const formDesc      = ref('')
const formAmount    = ref('')
const formErrors    = ref({})
const savingItem    = ref(false)
const titleInputRef = ref(null)

const confirmDeleteId = ref(null)
const deletingId      = ref(null)

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredItems = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(i => i.title.toLowerCase().includes(q))
})

const totalTarget   = computed(() => items.value.reduce((s, i) => s + (i.targetAmount ?? 0), 0))
const totalFunded   = computed(() => items.value.reduce((s, i) => s + (i.totalFunded ?? 0), 0))
const totalContribs = computed(() => items.value.reduce((s, i) => s + (i.contributorCount ?? 0), 0))
const pctDone       = computed(() =>
  totalTarget.value > 0
    ? Math.min(100, (totalFunded.value / totalTarget.value) * 100)
    : 0
)

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadItems() {
  if (!eventId.value) return
  loading.value = true
  try {
    const snap = await getDocs(
      query(collection(db, 'events', eventId.value, 'zawadiItems'), orderBy('order'))
    )
    items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to load zawadi items', e)
  } finally {
    loading.value = false
  }
}

async function loadContributions(item) {
  loadingContribs.value = true
  contributions.value   = []
  try {
    const snap = await getDocs(
      query(
        collection(db, 'events', eventId.value, 'zawadiContributions'),
        where('itemId', '==', item.id),
        where('status', '==', 'PAID'),
        orderBy('paidAt', 'desc')
      )
    )
    contributions.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to load contributions', e)
  } finally {
    loadingContribs.value = false
  }
}

onMounted(loadItems)

// ── Item CRUD ─────────────────────────────────────────────────────────────────
function openItemForm(item) {
  editingItem.value = item
  formTitle.value   = item?.title ?? ''
  formDesc.value    = item?.description ?? ''
  formAmount.value  = item ? String(item.targetAmount ?? '') : ''
  formErrors.value  = {}
  showItemForm.value = true
  nextTick(() => titleInputRef.value?.focus())
}

async function saveItem() {
  // Validate
  const errors = {}
  if (!formTitle.value.trim()) errors.title = 'Name is required'
  const amt = parseFloat(String(formAmount.value ?? ''))
  if (!String(formAmount.value ?? '').trim()) errors.amount = 'Amount is required'
  else if (isNaN(amt) || amt <= 0) errors.amount = 'Enter a valid positive number'
  formErrors.value = errors
  if (Object.keys(errors).length) return

  savingItem.value = true
  try {
    const data = {
      title:        formTitle.value.trim(),
      description:  formDesc.value.trim(),
      targetAmount: amt,
      currency:     'TZS',
      isActive:     true,
    }

    if (editingItem.value) {
      await updateDoc(doc(db, 'events', eventId.value, 'zawadiItems', editingItem.value.id), data)
      const idx = items.value.findIndex(i => i.id === editingItem.value.id)
      if (idx !== -1) items.value[idx] = { ...items.value[idx], ...data }
      if (selectedItem.value?.id === editingItem.value.id) {
        selectedItem.value = { ...selectedItem.value, ...data }
      }
    } else {
      const newData = {
        ...data,
        totalFunded:      0,
        contributorCount: 0,
        order:            Date.now(),
        createdAt:        serverTimestamp(),
      }
      const ref = await addDoc(collection(db, 'events', eventId.value, 'zawadiItems'), newData)
      items.value.push({ id: ref.id, ...newData })
    }
    showItemForm.value = false
  } catch (e) {
    console.error('Failed to save item', e)
  } finally {
    savingItem.value = false
  }
}

async function deleteItem(item) {
  if (deletingId.value) return
  deletingId.value = item.id
  try {
    await deleteDoc(doc(db, 'events', eventId.value, 'zawadiItems', item.id))
    items.value       = items.value.filter(i => i.id !== item.id)
    confirmDeleteId.value = null
    if (selectedItem.value?.id === item.id) selectedItem.value = null
  } catch (e) {
    console.error('Failed to delete item', e)
  } finally {
    deletingId.value = null
  }
}

// ── Detail drawer ─────────────────────────────────────────────────────────────
function openDetail(item) {
  selectedItem.value = item
  confirmDeleteId.value = null
  loadContributions(item)
}
function closeDetail() { selectedItem.value = null }

// ── Helpers ───────────────────────────────────────────────────────────────────
function itemPct(item) {
  return item.targetAmount > 0
    ? Math.min(1, (item.totalFunded ?? 0) / item.targetAmount)
    : 0
}

function fmtAmt(v) {
  const n = v ?? 0
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`
  return Math.round(n).toLocaleString()
}

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = val.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

const AVATAR_PALETTE = [
  ['#D4E8C2', '#3A6B1A'], ['#C2D8E8', '#1A4B6B'], ['#E8D4C2', '#6B3A1A'],
  ['#D4C2E8', '#3A1A6B'], ['#E8C2D4', '#6B1A3A'], ['#C2E8D4', '#1A6B3A'],
  ['#E8E4C2', '#6B5A1A'], ['#C2E8E8', '#1A6B6B'],
]
function avatarBg(init) { return AVATAR_PALETTE[(init?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length][0] }
function avatarFg(init) { return AVATAR_PALETTE[(init?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length][1] }
</script>

<style scoped>
/* ══ Root ══ */
.ez-root {
  display: flex;
  flex-direction: column;
  padding: 20px 24px 24px;
  gap: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Stat cards ── */
.ez-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ez-stat-card {
  background: #111111; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 20px 20px 18px; display: flex; align-items: flex-start; gap: 16px;
}
.ez-stat-icon {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0; margin-top: 2px;
  display: flex; align-items: center; justify-content: center;
}
.ez-stat-icon--gold   { background: rgba(201,168,76,0.08);  color: #C9A84C; }
.ez-stat-icon--blue   { background: rgba(96,165,250,0.08);  color: #60a5fa; }
.ez-stat-icon--teal   { background: rgba(45,212,191,0.08);  color: #2dd4bf; }
.ez-stat-icon--purple { background: rgba(167,139,250,0.08); color: #a78bfa; }
.ez-stat-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.ez-stat-lbl  { font-size: 11px; color: #777; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.6px; text-transform: uppercase; }
.ez-stat-val  { font-size: 32px; font-weight: 700; color: #f0f0ec; white-space: nowrap; line-height: 1; letter-spacing: -0.5px; }
.ez-stat-val--money { font-size: 24px; letter-spacing: -0.3px; }

/* ── Panel ── */
.ez-panel {
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
}
.ez-panel-hd {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #1e1e1e;
  gap: 10px;
}
.ez-panel-title {
  font-size: 19px; font-weight: 700; color: #f0ece6; margin: 0;
  letter-spacing: -0.3px; white-space: nowrap;
}
.ez-panel-acts { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.ez-panel-body { padding: 20px; }

/* Search in panel header */
.ez-hd-search { margin-left: 10px; }

/* Search */
.ez-search-wrap {
  position: relative; display: flex; align-items: center;
  min-width: 180px; max-width: 260px;
}
.ez-search-icon { position: absolute; left: 10px; pointer-events: none; }
.ez-search {
  width: 100%; padding: 8px 32px;
  border: 1px solid #2a2a2a; border-radius: 10px;
  font-size: 13px; font-family: inherit; outline: none;
  background: #111111; color: #f0f0ec;
  transition: border-color 150ms, box-shadow 150ms;
}
.ez-search:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(184,146,77,0.10); }
.ez-search-clear {
  position: absolute; right: 8px; background: none; border: none;
  cursor: pointer; color: #888; padding: 2px;
  display: flex; align-items: center;
}
.ez-search-clear:hover { color: #f0f0ec; }

/* Refresh button */
.ez-refresh-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #2a2a2a; background: #0d0d0d; color: #888;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 140ms;
}
.ez-refresh-btn:hover:not(:disabled) { background: #1a1a1a; color: #f0f0ec; }
.ez-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Add Item button (gold primary) */
.ez-add-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: #C9A84C; color: #070707; border: none; border-radius: 10px;
  font-size: 13px; font-weight: 700; cursor: pointer; transition: background 150ms;
  font-family: inherit; flex-shrink: 0;
}
.ez-add-btn:hover { background: #d4b560; }

/* Empty state */
.ez-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; min-height: 280px; color: #555;
}
.ez-empty-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(255,255,255,0.03); border: 1px solid #2a2a2a;
  display: flex; align-items: center; justify-content: center;
}
.ez-empty-title { font-size: 15px; font-weight: 600; color: #888; margin: 0; }
.ez-empty-sub   { font-size: 13px; color: #555; margin: 0; text-align: center; max-width: 300px; }
.ez-empty-cta {
  margin-top: 6px; padding: 9px 20px; border-radius: 10px;
  background: rgba(226,232,240,0.12); color: #f0f0ec; font-size: 13px; font-weight: 600;
  border: none; cursor: pointer; transition: background 140ms; font-family: inherit;
}
.ez-empty-cta:hover { background: #1a2236; }

/* ══ Items list ══ */
.ez-items-list { display: flex; flex-direction: column; gap: 12px; max-width: 720px; }

.ez-item-card {
  background: #111111; border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 16px 16px 14px; cursor: pointer;
  transition: box-shadow 150ms, border-color 150ms;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.ez-item-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,0.09); border-color: #3a3a3a; }

/* Item head */
.ez-item-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.ez-item-ico {
  width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
  background: rgba(184,146,77,0.10); border: 1px solid rgba(201,168,76,0.15);
  display: flex; align-items: center; justify-content: center;
}
.ez-item-info { flex: 1; min-width: 0; }
.ez-item-title { font-size: 15px; font-weight: 600; color: #f0f0ec; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ez-item-desc  { font-size: 12px; color: #888; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ez-item-actions { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.ez-del-lbl { font-size: 12px; font-weight: 600; color: #FF453A; }
.ez-del-yes {
  padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
  border: 1px solid rgba(255,59,48,0.3); background: rgba(255,59,48,0.08); color: #FF453A;
  cursor: pointer; font-family: inherit; transition: background 120ms;
}
.ez-del-yes:hover:not(:disabled) { background: rgba(255,59,48,0.16); }
.ez-del-yes:disabled { opacity: 0.6; cursor: not-allowed; }
.ez-del-no {
  padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
  border: 1px solid #2a2a2a; background: #0d0d0d; color: #888;
  cursor: pointer; font-family: inherit;
}
.ez-del-no:hover { background: #1a1a1a; }
.ez-action-btn {
  width: 28px; height: 28px; border-radius: 8px; border: 1px solid #2a2a2a;
  background: #0d0d0d; color: #888;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 130ms;
}
.ez-action-btn--edit:hover { border-color: rgba(201,168,76,0.3); color: #C9A84C; background: #111111; }
.ez-action-btn--del:hover  { border-color: rgba(255,59,48,0.3); color: #FF453A; background: rgba(255,59,48,0.05); }

/* Progress bar */
.ez-item-bar-track { height: 5px; border-radius: 3px; background: #2a2a2a; overflow: hidden; margin-bottom: 10px; }
.ez-item-bar-fill  { height: 100%; border-radius: 3px; transition: width 400ms ease; }

/* Foot row */
.ez-item-foot { display: flex; align-items: center; gap: 4px; }
.ez-item-funded { font-size: 13px; font-weight: 700; color: #C9A84C; }
.ez-item-target { font-size: 12px; color: #888; flex: 1; }
.ez-item-badges { display: flex; gap: 6px; }
.ez-item-pct-badge {
  padding: 2px 8px; border-radius: 20px;
  font-size: 11px; font-weight: 600;
  background: #2a2a2a; color: #888; border: 1px solid #2a2a2a;
}
.ez-item-pct-badge--done { background: rgba(52,211,153,0.12); color: #34d399; border-color: transparent; }
.ez-item-gifts-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 20px;
  font-size: 11px; font-weight: 600;
  background: rgba(184,146,77,0.10); color: #C9A84C; border: 1px solid rgba(201,168,76,0.15);
}

/* ══ Drawer ══ */
.ez-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(1px);
}
.ez-drawer {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: 400px; background: #0d0d0d;
  box-shadow: -4px 0 32px rgba(0,0,0,0.5);
  display: flex; flex-direction: column; overflow-y: auto; z-index: 201;
}
.ez-drawer-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
}
.ez-drawer-back {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 8px;
  border: none; background: #1a1a1a; color: #888;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 130ms; font-family: inherit;
}
.ez-drawer-back:hover { background: #2a2a2a; color: #f0f0ec; }
.ez-drawer-edit-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  border: 1px solid #2a2a2a; background: #0d0d0d; color: #888;
  font-size: 12px; font-weight: 500; font-family: inherit;
  text-decoration: none; cursor: pointer; transition: all 130ms;
}
.ez-drawer-edit-btn:hover { border-color: rgba(184,146,77,0.5); color: #C9A84C; background: #111111; }

/* Item title row in drawer */
.ez-drawer-title-row {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid #1a1a1a;
}
.ez-drawer-ico {
  width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
  background: rgba(184,146,77,0.10); border: 1px solid rgba(201,168,76,0.15);
  display: flex; align-items: center; justify-content: center;
}
.ez-drawer-item-title { font-size: 17px; font-weight: 700; color: #f0f0ec; margin: 0 0 5px; }
.ez-drawer-badge {
  display: inline-block; padding: 2px 8px; border-radius: 20px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.4px;
  background: rgba(201,168,76,0.08); color: #C9A84C;
  border: 1px solid rgba(201,168,76,0.15);
}

/* Progress card */
.ez-prog-card {
  margin: 16px 20px; padding: 18px;
  background: #111111; border: 1px solid #2a2a2a; border-radius: 16px;
}
.ez-prog-desc { font-size: 13px; color: #888; margin: 0 0 14px; line-height: 1.5; }
.ez-prog-row  { display: flex; align-items: center; gap: 18px; }
.ez-ring      { flex-shrink: 0; }
.ez-prog-stats { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.ez-prog-stat-row { display: flex; align-items: center; gap: 6px; }
.ez-prog-stat-lbl { font-size: 12px; color: #888; min-width: 64px; }
.ez-prog-stat-val { font-size: 13px; font-weight: 600; color: #f0f0ec; }
.ez-prog-bar-track { height: 6px; border-radius: 3px; background: #2a2a2a; overflow: hidden; }
.ez-prog-bar-fill  { height: 100%; border-radius: 3px; transition: width 400ms ease; }
.ez-goal-reached {
  display: flex; align-items: center; gap: 5px; justify-content: center;
  margin-top: 10px; font-size: 12px; font-weight: 600; color: #30D158;
}

/* Contributors section */
.ez-drawer-section { padding: 0 20px 24px; }
.ez-section-head {
  display: flex; align-items: center; gap: 7px;
  margin-bottom: 12px;
}
.ez-section-lbl { font-size: 13px; font-weight: 600; color: #f0f0ec; }
.ez-section-cnt {
  padding: 1px 7px; border-radius: 20px;
  background: rgba(201,168,76,0.08); color: #C9A84C;
  font-size: 11px; font-weight: 600;
}
.ez-contribs-loading {
  display: flex; justify-content: center; padding: 24px;
}
.ez-contribs-empty {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 28px; color: #555;
}
.ez-contribs-empty p { margin: 0; font-size: 14px; font-weight: 500; color: #888; }
.ez-contribs-empty-sub { font-size: 12px; color: #555 !important; }
.ez-contribs-list { display: flex; flex-direction: column; gap: 0; }
.ez-contrib-tile {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid #1a1a1a;
}
.ez-contrib-tile:last-of-type { border-bottom: none; }
.ez-contrib-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
}
.ez-contrib-info { flex: 1; min-width: 0; }
.ez-contrib-name-row {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  margin-bottom: 2px;
}
.ez-contrib-name { font-size: 13px; font-weight: 600; color: #f0f0ec; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ez-contrib-amt  { font-size: 13px; font-weight: 700; color: #C9A84C; flex-shrink: 0; }
.ez-contrib-note { font-size: 12px; color: #888; margin: 0 0 2px; font-style: italic; line-height: 1.4; }
.ez-contrib-date { font-size: 11px; color: #555; margin: 0; }

/* ══ Add/Edit Modal ══ */
.ez-modal-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.ez-modal {
  background: #0d0d0d; border-radius: 20px;
  padding: 0; width: 100%; max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18); overflow: hidden;
  border: 1px solid #2a2a2a;
}
.ez-modal-head {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 24px 16px; border-bottom: 1px solid #1e1e1e;
}
.ez-modal-ico {
  width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
  background: rgba(184,146,77,0.10); border: 1px solid rgba(201,168,76,0.15);
  display: flex; align-items: center; justify-content: center;
}
.ez-modal-title { font-size: 17px; font-weight: 700; color: #f0f0ec; margin: 0; }
.ez-modal-body { padding: 18px 24px; display: flex; flex-direction: column; }
.ez-field-lbl {
  font-size: 12px; font-weight: 500; color: #888;
  display: block; margin-bottom: 6px;
}
.ez-required { color: #FF453A; }
.ez-optional { color: #555; font-weight: 400; }
.ez-field-inp {
  width: 100%; padding: 10px 14px; box-sizing: border-box;
  border: 1px solid #2a2a2a; border-radius: 10px;
  font-size: 14px; font-family: inherit; outline: none; color: #f0f0ec;
  background: #111111; transition: border-color 150ms, box-shadow 150ms;
}
.ez-field-inp:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(184,146,77,0.10); }
.ez-field-inp--err { border-color: rgba(255,59,48,0.5); }
.ez-field-ta { resize: none; line-height: 1.5; }
.ez-field-err { font-size: 11px; color: #FF453A; margin: 4px 0 0; }
.ez-modal-actions {
  display: flex; gap: 10px;
  padding: 16px 24px; border-top: 1px solid #1e1e1e;
}
.ez-modal-cancel {
  flex: 1; padding: 11px; border-radius: 10px;
  border: 1px solid #2a2a2a; background: #1a1a1a; color: #888;
  font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
  transition: background 130ms;
}
.ez-modal-cancel:hover { background: #2a2a2a; }
.ez-modal-save {
  flex: 1; padding: 11px; border-radius: 10px;
  border: none; background: #C9A84C; color: #070707;
  font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer;
  transition: background 130ms;
}
.ez-modal-save:hover:not(:disabled) { background: #d4b560; }
.ez-modal-save:disabled { opacity: 0.45; cursor: not-allowed; }

/* ══ Transitions ══ */
.ez-fade-enter-active, .ez-fade-leave-active { transition: opacity 200ms ease; }
.ez-fade-enter-from,   .ez-fade-leave-to     { opacity: 0; }
.ez-slide-enter-active, .ez-slide-leave-active { transition: transform 260ms ease; }
.ez-slide-enter-from,   .ez-slide-leave-to     { transform: translateX(100%); }

/* Spin */
.ez-spin { animation: ez-spin-anim 1.1s linear infinite; }
@keyframes ez-spin-anim { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 700px) {
  .ez-root  { padding: 12px 14px 20px; gap: 12px; }

  /* Stats */
  .ez-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .ez-stat-card { padding: 14px 14px 12px; gap: 12px; min-width: 0; overflow: hidden; }
  .ez-stat-icon { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; }
  .ez-stat-val  { font-size: 24px; }
  .ez-stat-val--money { font-size: 18px; }
  .ez-stat-body { gap: 6px; min-width: 0; }
  .ez-stat-lbl  { font-size: 10px; letter-spacing: 0; }

  /* Panel header: stack title + search on first row, buttons on second */
  .ez-panel-hd {
    flex-wrap: wrap;
    row-gap: 8px;
    padding: 12px 14px;
  }
  .ez-panel-title { font-size: 16px; }
  .ez-hd-search {
    min-width: 0;
    flex: 1 1 100%;
    max-width: 100%;
    order: 3;
  }
  .ez-panel-acts { margin-left: auto; }

  /* Panel body */
  .ez-panel-body { padding: 12px; }

  /* Item cards */
  .ez-items-list { max-width: 100%; gap: 10px; }
  .ez-item-card { padding: 14px 12px 12px; }
  .ez-item-title { font-size: 14px; }
  .ez-item-foot { flex-wrap: wrap; gap: 6px; }
  .ez-item-target { flex: 1 1 100%; order: 3; font-size: 11px; }
  .ez-item-badges { order: 2; }

  /* Drawer */
  .ez-drawer { width: 100%; }

  /* Progress ring row: stack vertically on small screens */
  .ez-prog-row { flex-direction: column; align-items: flex-start; gap: 12px; }
}

@media (max-width: 400px) {
  .ez-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
  .ez-stat-val { font-size: 20px; }
  .ez-stat-val--money { font-size: 15px; }
  .ez-stat-lbl { font-size: 10px; }

  .ez-panel-hd { padding: 10px 12px; }
  .ez-panel-title { font-size: 15px; }
  .ez-add-btn { padding: 7px 12px; font-size: 12px; }

  .ez-item-card { padding: 12px 10px 10px; }
  .ez-item-ico { width: 34px; height: 34px; border-radius: 9px; }
  .ez-item-funded { font-size: 12px; }
  .ez-item-title { font-size: 13px; }

  .ez-search { font-size: 12px; }
}
</style>
