<template>
  <div class="es-root">

    <!-- ── Loading skeleton ── -->
    <div v-if="!event" class="es-skeleton">
      <div class="es-sk-bar es-sk-bar--title" />
      <div class="es-sk-bar es-sk-bar--sub" />
      <div class="es-sk-section" v-for="n in 4" :key="n">
        <div class="es-sk-bar es-sk-bar--label" />
        <div class="es-sk-tile" />
      </div>
    </div>

    <template v-else>
      <!-- ── Page header ── -->
      <div class="es-header">
        <div>
          <h1 class="es-page-title">Event Settings</h1>
          <p class="es-page-sub">Manage language, card format, locations and visibility.</p>
        </div>
        <button class="es-save-btn" :disabled="saving" @click="saveSettings">
          <svg v-if="saving" class="es-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>

      <!-- ── Two-column grid ── -->
      <div class="es-grid">

        <!-- ════════════ LEFT COLUMN ════════════ -->
        <div class="es-col">

          <!-- 1. EVENT LOCATIONS -->
          <div class="es-panel">
            <div class="es-panel-hd">
              <div class="es-panel-hd-left">
                <div class="es-accent-bar" />
                <div class="es-section-meta">
                  <span class="es-section-label">EVENT LOCATIONS</span>
                  <span class="es-section-hint">Add map locations for this event</span>
                </div>
              </div>
              <button class="es-add-btn" @click="openLocationModal">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add
              </button>
            </div>

            <div v-if="!locations.length" class="es-placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D0CEC9" stroke-width="1.4" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              No locations added yet
            </div>
            <div v-else class="es-location-list">
              <div
                v-for="(loc, idx) in locations"
                :key="loc.id"
                class="es-location-row"
                :class="{ 'es-location-row--sep': idx < locations.length - 1 }"
              >
                <div class="es-loc-icon-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div class="es-loc-info">
                  <span class="es-loc-label">{{ loc.label }}</span>
                  <span class="es-loc-place">{{ loc.placeName }}</span>
                </div>
                <a v-if="loc.mapsUrl" :href="loc.mapsUrl" target="_blank" rel="noopener" class="es-loc-link" title="Open in Google Maps">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
                <button class="es-loc-del" @click="removeLocation(loc)" title="Remove">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. LANGUAGE -->
          <div class="es-panel">
            <div class="es-panel-hd es-panel-hd--flat">
              <div class="es-accent-bar" />
              <div class="es-section-meta">
                <span class="es-section-label">LANGUAGE</span>
                <span class="es-section-hint">Preferred language for message templates</span>
              </div>
            </div>
            <div class="es-radio-group">
              <button class="es-radio-opt" :class="{ 'es-radio-opt--on': language === 'sw' }" @click="language = 'sw'">
                <span class="es-radio-flag">🇹🇿</span>
                <span class="es-radio-lbl">Kiswahili</span>
                <svg v-if="language === 'sw'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DDDBD6" stroke-width="1.6"><circle cx="12" cy="12" r="10"/></svg>
              </button>
              <div class="es-radio-sep" />
              <button class="es-radio-opt" :class="{ 'es-radio-opt--on': language === 'en' }" @click="language = 'en'">
                <span class="es-radio-flag">🇬🇧</span>
                <span class="es-radio-lbl">English</span>
                <svg v-if="language === 'en'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DDDBD6" stroke-width="1.6"><circle cx="12" cy="12" r="10"/></svg>
              </button>
            </div>
          </div>

          <!-- 3. SCAN PROMO -->
          <div class="es-panel">
            <div class="es-panel-hd es-panel-hd--flat">
              <div class="es-accent-bar" />
              <div class="es-section-meta">
                <span class="es-section-label">SCAN PROMO</span>
                <span class="es-section-hint">Promotional message sent to attendees after a successful check-in scan</span>
              </div>
            </div>
            <textarea
              v-model="scanPromo"
              class="es-textarea"
              placeholder="Write your promotional message here…"
              rows="5"
            />
            <div class="es-promo-footer">
              <span class="es-promo-note">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Triggered automatically on successful check-in
              </span>
              <button class="es-inline-save" :disabled="savingPromo" @click="saveScanPromo">
                {{ savingPromo ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>

        </div><!-- /left col -->

        <!-- ════════════ RIGHT COLUMN ════════════ -->
        <div class="es-col es-col--right">

          <!-- Event summary card -->
          <div class="es-event-card">
            <div class="es-event-card-thumb">
              <img v-if="event.eventThumbnail" :src="event.eventThumbnail" :alt="event.title" />
              <div v-else class="es-event-card-thumb-placeholder">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(184,146,77,0.5)" stroke-width="1.5" stroke-linecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="3"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>
            <div class="es-event-card-info">
              <span class="es-event-card-name">{{ event.title }}</span>
              <span class="es-event-card-type">{{ event.categoryId ?? 'Event' }}</span>
            </div>
            <div class="es-event-card-status" :class="isPublished ? 'es-status--pub' : 'es-status--draft'">
              <span class="es-status-dot" />
              {{ isPublished ? 'Published' : 'Draft' }}
            </div>
          </div>

          <!-- 4. CARD FORMAT -->
          <div class="es-panel">
            <div class="es-panel-hd es-panel-hd--flat">
              <div class="es-accent-bar" />
              <div class="es-section-meta">
                <span class="es-section-label">CARD FORMAT</span>
                <span class="es-section-hint">File type when sharing invitation and contribution cards</span>
              </div>
            </div>
            <div class="es-toggle-group">
              <button class="es-toggle-opt" :class="{ 'es-toggle-opt--on': usePng }" @click="usePng = true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" :stroke="usePng ? '#C9A84C' : '#B5B5BB'" stroke-width="2" stroke-linecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                PNG Image
              </button>
              <button class="es-toggle-opt" :class="{ 'es-toggle-opt--on': !usePng }" @click="usePng = false">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" :stroke="!usePng ? '#C9A84C' : '#B5B5BB'" stroke-width="2" stroke-linecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                PDF Document
              </button>
            </div>
          </div>

          <!-- 5. VISIBILITY -->
          <div class="es-panel">
            <div class="es-panel-hd es-panel-hd--flat">
              <div class="es-accent-bar" />
              <div class="es-section-meta">
                <span class="es-section-label">VISIBILITY</span>
                <span class="es-section-hint">Control who can see this event</span>
              </div>
            </div>
            <button class="es-action-row" @click="showPublishDialog = true">
              <div class="es-action-icon" :class="isPublished ? 'es-action-icon--green' : ''">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" :stroke="isPublished ? '#34d399' : '#888'" stroke-width="2" stroke-linecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span class="es-action-label" :class="isPublished ? 'es-action-label--green' : ''">
                {{ isPublished ? 'Published · Unpublish' : 'Draft · Publish' }}
              </span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- 6. DANGER ZONE -->
          <div class="es-panel es-panel--danger">
            <div class="es-panel-hd es-panel-hd--flat">
              <div class="es-accent-bar es-accent-bar--red" />
              <div class="es-section-meta">
                <span class="es-section-label es-section-label--red">DANGER ZONE</span>
                <span class="es-section-hint">Irreversible actions</span>
              </div>
            </div>
            <button class="es-danger-row" @click="showDeleteDialog = true">
              <div class="es-danger-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <span>Delete Event</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

        </div><!-- /right col -->
      </div><!-- /grid -->
    </template>

    <!-- ══════════════════════════════════════
         MODALS
         ══════════════════════════════════════ -->

    <!-- Add Location side panel -->
    <Teleport to="body">
      <Transition name="es-fade">
        <div v-if="locationModalOpen" class="es-drawer-backdrop" @click.self="closeLocationModal" />
      </Transition>
      <Transition name="es-drawer">
        <div v-if="locationModalOpen" class="es-drawer">
          <div class="es-drawer-hd">
            <div>
              <h3 class="es-modal-title">Add Location</h3>
              <p class="es-drawer-sub">Search and pin a place for this event</p>
            </div>
            <button class="es-modal-close" @click="closeLocationModal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="es-drawer-body">
            <label class="es-field-label">LOCATION LABEL</label>
            <input v-model="locForm.label" class="es-input" placeholder="e.g. Main Venue" />

            <label class="es-field-label" style="margin-top:8px">SEARCH PLACE</label>
            <div class="es-search-wrap">
              <svg class="es-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref="placeSearchRef"
                v-model="placeQuery"
                class="es-input es-input--search"
                placeholder="Search for a place…"
                autocomplete="off"
                @input="onPlaceInput"
                @keydown.down.prevent="suggestionCursor = Math.min(suggestionCursor + 1, placeSuggestions.length - 1)"
                @keydown.up.prevent="suggestionCursor = Math.max(suggestionCursor - 1, 0)"
                @keydown.enter.prevent="suggestionCursor >= 0 && pickSuggestion(placeSuggestions[suggestionCursor])"
                @keydown.escape="placeSuggestions = []"
              />
              <svg v-if="placesLoading" class="es-spin es-search-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <button v-else-if="locForm.placeName" class="es-search-clear" @click="clearPlacePick" title="Clear">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              <ul v-if="placeSuggestions.length" class="es-suggestions">
                <li
                  v-for="(s, i) in placeSuggestions"
                  :key="s.place"
                  class="es-suggestion"
                  :class="{ 'es-suggestion--active': i === suggestionCursor }"
                  @mousedown.prevent="pickSuggestion(s)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" style="flex-shrink:0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div class="es-suggestion-text">
                    <span class="es-suggestion-main">{{ s.structuredFormat?.mainText?.text }}</span>
                    <span class="es-suggestion-sub">{{ s.structuredFormat?.secondaryText?.text }}</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Picked place chip -->
            <div v-if="locForm.placeName" class="es-picked-place">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span class="es-picked-name">{{ locForm.placeName }}</span>
              <span v-if="locForm.lat" class="es-picked-coords">{{ Number(locForm.lat).toFixed(4) }}, {{ Number(locForm.lng).toFixed(4) }}</span>
            </div>
          </div>

          <div class="es-drawer-footer">
            <button class="es-modal-cancel" @click="closeLocationModal">Cancel</button>
            <button
              class="es-modal-confirm"
              :disabled="!locForm.label.trim() || !locForm.placeName.trim() || savingLoc"
              @click="addLocation"
            >
              {{ savingLoc ? 'Adding…' : 'Add Location' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Publish / Unpublish dialog -->
    <Teleport to="body">
      <Transition name="es-fade">
        <div v-if="showPublishDialog" class="es-overlay" @click.self="showPublishDialog = false">
          <div class="es-dialog">
            <div class="es-dialog-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.8" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <h3 class="es-dialog-title">{{ isPublished ? 'Unpublish Event?' : 'Publish Event?' }}</h3>
            <p class="es-dialog-msg">
              {{ isPublished
                  ? 'This will hide the event from end-users.'
                  : 'This will make the event visible to all users.' }}
            </p>
            <div class="es-dialog-actions">
              <button class="es-dialog-cancel" @click="showPublishDialog = false">Cancel</button>
              <button class="es-dialog-confirm" :class="{ 'es-dialog-confirm--red': isPublished }" @click="togglePublish">
                {{ isPublished ? 'Unpublish' : 'Publish' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete dialog -->
    <Teleport to="body">
      <Transition name="es-fade">
        <div v-if="showDeleteDialog" class="es-overlay" @click.self="closeDeleteDialog">
          <div class="es-dialog">
            <div class="es-dialog-icon es-dialog-icon--red">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="1.8" stroke-linecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 class="es-dialog-title">Delete Event</h3>
            <p class="es-dialog-msg">This is irreversible. Type <strong>"delete"</strong> below to confirm.</p>
            <input
              v-model="deleteConfirm"
              class="es-input es-input--center"
              placeholder="delete"
              @keydown.enter="deleteEvent"
            />
            <div class="es-dialog-actions">
              <button class="es-dialog-cancel" @click="closeDeleteDialog">Cancel</button>
              <button
                class="es-dialog-confirm es-dialog-confirm--red"
                :disabled="deleteConfirm !== 'delete' || deleting"
                :style="{ opacity: deleteConfirm !== 'delete' ? 0.35 : 1 }"
                @click="deleteEvent"
              >
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="es-toast">
        <div v-if="toastVisible" class="es-toast" :class="{ 'es-toast--err': toastErr }">
          <svg v-if="!toastErr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ toastMsg }}
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../../firebase'
import { doc, setDoc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore'
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const props = defineProps({ event: Object, eventId: String })
const route  = useRoute()
const router = useRouter()

const eventId = computed(() => props.eventId ?? route.params.eventId)

// ── Settings state ─────────────────────────────────────────────────────────
const language   = ref('sw')
const usePng     = ref(true)
const scanPromo  = ref('')
const isPublished = ref(false)
const locations  = ref([])

watch(() => props.event, (ev) => {
  if (!ev) return
  language.value    = ev.language ?? 'sw'
  usePng.value      = ev.usepng ?? true
  scanPromo.value   = ev.scanPromo ?? ''
  isPublished.value = (ev.status ?? 'draft').toLowerCase() === 'published'
  locations.value   = Array.isArray(ev.locations) ? [...ev.locations] : []
}, { immediate: true })

// ── Saving flags ───────────────────────────────────────────────────────────
const saving      = ref(false)
const savingPromo = ref(false)
const savingLoc   = ref(false)
const deleting    = ref(false)

// ── Dialog/modal visibility ────────────────────────────────────────────────
const locationModalOpen  = ref(false)
const showPublishDialog  = ref(false)
const showDeleteDialog   = ref(false)
const deleteConfirm      = ref('')

// ── Location form ──────────────────────────────────────────────────────────
const locForm = ref({ label: '', placeName: '', lat: '', lng: '' })

// ── Google Places autocomplete ─────────────────────────────────────────────
const placeSearchRef    = ref(null)
const placeQuery        = ref('')
const placeSuggestions  = ref([])
const suggestionCursor  = ref(-1)
const placesLoading     = ref(false)
let debounceTimer = null

function onPlaceInput() {
  locForm.value.placeName = ''
  locForm.value.lat = ''
  locForm.value.lng = ''
  placeSuggestions.value = []
  suggestionCursor.value = -1
  clearTimeout(debounceTimer)
  const q = placeQuery.value.trim()
  if (q.length < 2) return
  debounceTimer = setTimeout(() => fetchSuggestions(q), 280)
}

async function fetchSuggestions(q) {
  placesLoading.value = true
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': MAPS_KEY },
      body: JSON.stringify({ input: q, languageCode: 'sw' }),
    })
    const data = await res.json()
    placeSuggestions.value = (data.suggestions ?? [])
      .map(s => s.placePrediction)
      .filter(Boolean)
  } catch {
    placeSuggestions.value = []
  } finally {
    placesLoading.value = false
  }
}

async function pickSuggestion(s) {
  placeSuggestions.value = []
  placeQuery.value = s.text.text
  placesLoading.value = true
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${s.place}?fields=location,displayName,formattedAddress`,
      { headers: { 'X-Goog-Api-Key': MAPS_KEY } }
    )
    const place = await res.json()
    locForm.value.placeName = place.formattedAddress || place.displayName?.text || s.text.text
    locForm.value.lat  = place.location?.latitude  ?? ''
    locForm.value.lng  = place.location?.longitude ?? ''
    if (!locForm.value.label.trim()) locForm.value.label = place.displayName?.text ?? ''
  } catch {
    locForm.value.placeName = s.text.text
  } finally {
    placesLoading.value = false
  }
}

function clearPlacePick() {
  placeQuery.value = ''
  locForm.value.placeName = ''
  locForm.value.lat = ''
  locForm.value.lng = ''
  placeSuggestions.value = []
  placeSearchRef.value?.focus()
}

function openLocationModal() {
  locForm.value = { label: '', placeName: '', lat: '', lng: '' }
  placeQuery.value = ''
  placeSuggestions.value = []
  locationModalOpen.value = true
}
function closeLocationModal() { locationModalOpen.value = false; placeSuggestions.value = [] }
function closeDeleteDialog()  { showDeleteDialog.value = false; deleteConfirm.value = '' }

// ── Save language + card format together ───────────────────────────────────
async function saveSettings() {
  if (!eventId.value) return
  saving.value = true
  try {
    await setDoc(doc(db, 'events', eventId.value), {
      language: language.value,
      usepng:   usePng.value,
    }, { merge: true })
    showToast('Settings saved')
  } catch (e) {
    showToast('Error: ' + e.message, true)
  } finally {
    saving.value = false
  }
}

// ── Scan promo ─────────────────────────────────────────────────────────────
async function saveScanPromo() {
  if (!eventId.value) return
  savingPromo.value = true
  const trimmed = scanPromo.value.trim()
  try {
    await updateDoc(doc(db, 'events', eventId.value), {
      scanPromo: trimmed.length ? trimmed : deleteField(),
    })
    showToast(trimmed.length ? 'Promo message saved' : 'Promo message removed')
  } catch (e) {
    showToast('Error: ' + e.message, true)
  } finally {
    savingPromo.value = false
  }
}

// ── Locations ──────────────────────────────────────────────────────────────
async function addLocation() {
  const label     = locForm.value.label.trim()
  const placeName = locForm.value.placeName.trim()
  if (!label || !placeName) return

  const lat = locForm.value.lat !== '' ? parseFloat(locForm.value.lat) : null
  const lng = locForm.value.lng !== '' ? parseFloat(locForm.value.lng) : null
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)

  const newLoc = {
    id: Date.now().toString(),
    label,
    placeName,
    ...(hasCoords ? {
      lat,
      lng,
      mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
    } : {}),
  }

  const updated = [...locations.value, newLoc]
  savingLoc.value = true
  try {
    await updateDoc(doc(db, 'events', eventId.value), { locations: updated })
    locations.value = updated
    closeLocationModal()
    showToast('Location added')
  } catch (e) {
    showToast('Error: ' + e.message, true)
  } finally {
    savingLoc.value = false
  }
}

async function removeLocation(loc) {
  const updated = locations.value.filter(l => l.id !== loc.id)
  try {
    await updateDoc(doc(db, 'events', eventId.value), { locations: updated })
    locations.value = updated
    showToast('Location removed')
  } catch (e) {
    showToast('Error: ' + e.message, true)
  }
}

// ── Visibility ─────────────────────────────────────────────────────────────
async function togglePublish() {
  showPublishDialog.value = false
  const newStatus = isPublished.value ? 'Draft' : 'Published'
  try {
    await updateDoc(doc(db, 'events', eventId.value), { status: newStatus })
    isPublished.value = !isPublished.value
    showToast(isPublished.value ? 'Event published' : 'Event set as Draft')
  } catch (e) {
    showToast('Error: ' + e.message, true)
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
async function deleteEvent() {
  if (deleteConfirm.value !== 'delete') return
  deleting.value = true
  try {
    await deleteDoc(doc(db, 'events', eventId.value))
    router.push('/')
  } catch (e) {
    showToast('Error: ' + e.message, true)
    deleting.value = false
    closeDeleteDialog()
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────
const toastMsg     = ref('')
const toastErr     = ref(false)
const toastVisible = ref(false)
let toastTimer     = null

function showToast(msg, isErr = false) {
  toastMsg.value     = msg
  toastErr.value     = isErr
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 3200)
}
</script>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────────── */
.es-root {
  padding: 28px 32px 64px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Two-column grid ────────────────────────────────────────────────────── */
.es-grid {
  display: grid;
  grid-template-columns: 55fr 45fr;
  gap: 20px;
  align-items: start;
}
.es-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Panel card ─────────────────────────────────────────────────────────── */
.es-panel {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 16px;
  overflow: hidden;
}
.es-panel--danger {
  border-color: rgba(255,59,48,0.2);
  background: rgba(255,59,48,0.02);
}
.es-panel-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.es-panel-hd--flat { margin-bottom: 12px; justify-content: flex-start; }
.es-panel-hd-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* ── Add button ─────────────────────────────────────────────────────────── */
.es-add-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(10,10,11,0.12);
  color: #C9A84C;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 130ms;
  flex-shrink: 0;
  white-space: nowrap;
}
.es-add-btn:hover { background: rgba(184,146,77,0.18); }

/* ── Event summary card (right column top) ──────────────────────────────── */
.es-event-card {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.es-event-card-thumb {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}
.es-event-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.es-event-card-thumb-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(10,10,11,0.03);
  border: 1px solid rgba(10,10,11,0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.es-event-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.es-event-card-name {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #f0f0ec;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.es-event-card-type {
  display: block;
  font-size: 11.5px;
  color: #888;
}
.es-event-card-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 20px;
  padding: 4px 10px;
  flex-shrink: 0;
}
.es-status--pub  { background: rgba(52,199,89,0.1);   color: #34d399; }
.es-status--draft { background: rgba(201,168,76,0.08); color: #A08230; }
.es-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.es-status--pub  .es-status-dot { background: #34C759; }
.es-status--draft .es-status-dot { background: linear-gradient(180deg, #2A2A2D 0%, #0A0A0B 100%); }

/* ── Responsive collapse ────────────────────────────────────────────────── */
@media (max-width: 680px) {
  .es-grid { grid-template-columns: 1fr; }
}

/* ── Skeleton ──────────────────────────────────────────────────────────── */
.es-skeleton { display: flex; flex-direction: column; gap: 20px; }
.es-sk-bar {
  background: linear-gradient(90deg, #F4F4F6 25%, #EAEAE8 50%, #F4F4F6 75%);
  background-size: 200% 100%;
  animation: es-shimmer 1.4s infinite;
  border-radius: 8px;
}
.es-sk-bar--title { height: 28px; width: 220px; }
.es-sk-bar--sub   { height: 14px; width: 320px; }
.es-sk-bar--label { height: 11px; width: 120px; margin-bottom: 10px; }
.es-sk-tile  { height: 56px; border-radius: 14px; background: #1a1a1a; }
.es-sk-section { display: flex; flex-direction: column; gap: 8px; }
@keyframes es-shimmer { 0%{background-position:200%}100%{background-position:-200%} }

/* ── Page header ───────────────────────────────────────────────────────── */
.es-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}
.es-page-title {
  font-size: 24px;
  font-weight: 800;
  color: #f0f0ec;
  letter-spacing: -0.5px;
  margin: 0 0 4px;
}
.es-page-sub {
  font-size: 13px;
  color: #888;
  margin: 0;
  line-height: 1.5;
}
.es-save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(180deg, #2A2A2D 0%, #0A0A0B 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 150ms;
  flex-shrink: 0;
}
.es-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.es-save-btn:not(:disabled):hover { opacity: 0.88; }

/* ── Sections ──────────────────────────────────────────────────────────── */
.es-section {
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid #F0EFED;
}
.es-section--last { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.es-section-hd {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}
.es-accent-bar {
  width: 3px;
  height: 34px;
  border-radius: 2px;
  background: linear-gradient(180deg, #2A2A2D 0%, #0A0A0B 100%);
  flex-shrink: 0;
  margin-top: 1px;
}
.es-accent-bar--red { background: #FF3B30; }
.es-section-meta { display: flex; flex-direction: column; gap: 3px; }
.es-section-label {
  font-size: 11px;
  font-weight: 700;
  color: #888;
  letter-spacing: 1.3px;
  text-transform: uppercase;
}
.es-section-label--red { color: #FF453A; }
.es-section-hint { font-size: 12px; color: #555; line-height: 1.4; }

/* ── Card shell ────────────────────────────────────────────────────────── */
.es-card {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
}

/* ── Action row (generic) ──────────────────────────────────────────────── */
.es-action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #f0f0ec;
  transition: background 130ms;
  text-align: left;
}
.es-action-row:hover { background: #141414; }

.es-action-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(201,168,76,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.es-action-icon--green { background: rgba(52,199,89,0.1); }
.es-action-label { flex: 1; }
.es-action-label--green { color: #34d399; }

/* ── Placeholder ───────────────────────────────────────────────────────── */
.es-placeholder {
  margin-top: 10px;
  padding: 20px;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 14px;
  text-align: center;
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

/* ── Locations list ────────────────────────────────────────────────────── */
.es-location-list { margin-top: 10px; }
.es-location-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}
.es-location-row--sep { border-bottom: 1px solid #1a1a1a; }

.es-loc-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(201,168,76,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.es-loc-info { flex: 1; min-width: 0; }
.es-loc-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #f0f0ec;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.es-loc-place {
  display: block;
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.es-loc-link {
  display: flex;
  align-items: center;
  color: #888;
  padding: 6px;
  border-radius: 7px;
  transition: color 130ms, background 130ms;
}
.es-loc-link:hover { color: #C9A84C; background: rgba(10,10,11,0.03); }
.es-loc-del {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  padding: 6px;
  border-radius: 7px;
  transition: color 130ms, background 130ms;
}
.es-loc-del:hover { color: #FF453A; background: rgba(255,59,48,0.07); }

/* ── Scan promo card ───────────────────────────────────────────────────── */
.es-promo-card { padding: 14px; }
.es-textarea {
  width: 100%;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13.5px;
  font-family: inherit;
  color: #f0f0ec;
  resize: vertical;
  outline: none;
  transition: border-color 150ms;
  box-sizing: border-box;
  line-height: 1.6;
}
.es-textarea:focus { border-color: #C9A84C; background: #141414; }
.es-textarea::placeholder { color: #555; }

.es-promo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  gap: 12px;
}
.es-promo-note {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: #888;
}
.es-inline-save {
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(10,10,11,0.12);
  color: #C9A84C;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 130ms;
  flex-shrink: 0;
}
.es-inline-save:hover:not(:disabled) { background: rgba(184,146,77,0.18); }
.es-inline-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Language radio group ──────────────────────────────────────────────── */
.es-radio-group { display: flex; flex-direction: column; }
.es-radio-sep { height: 0.8px; background: #1a1a1a; margin: 0; }
.es-radio-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 130ms;
}
.es-radio-opt:hover { background: #141414; }
.es-radio-opt--on { background: rgba(184,146,77,0.05); }
.es-radio-flag { font-size: 20px; }
.es-radio-lbl {
  flex: 1;
  font-size: 14.5px;
  font-weight: 500;
  color: #f0f0ec;
}
.es-radio-opt--on .es-radio-lbl { font-weight: 600; color: #C9A84C; }

/* ── Card format toggle ────────────────────────────────────────────────── */
.es-toggle-group {
  display: flex;
  gap: 0;
  background: #1a1a1a;
  border-radius: 12px;
  padding: 4px;
}
.es-toggle-opt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 16px;
  border: none;
  border-radius: 9px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  font-family: inherit;
  transition: all 160ms;
}
.es-toggle-opt--on {
  background: #141414;
  color: #C9A84C;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  border: 1px solid rgba(10,10,11,0.08);
}

/* ── Danger row ────────────────────────────────────────────────────────── */
.es-danger-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: rgba(255,59,48,0.05);
  border: 1px solid rgba(255,59,48,0.25);
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #FF453A;
  transition: background 130ms;
  text-align: left;
}
.es-danger-row:hover { background: rgba(255,59,48,0.09); }
.es-danger-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(255,59,48,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Shared inputs ─────────────────────────────────────────────────────── */
.es-input {
  width: 100%;
  padding: 11px 14px;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #f0f0ec;
  outline: none;
  transition: border-color 150ms, background 150ms;
  box-sizing: border-box;
}
.es-input:focus { border-color: #C9A84C; background: #141414; }
.es-input::placeholder { color: #555; }
.es-input--center { text-align: center; }

/* ── Place search ──────────────────────────────────────────────────────── */
.es-search-wrap {
  position: relative;
}
.es-search-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.es-input--search {
  padding-left: 36px;
  padding-right: 36px;
}
.es-search-spin {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}
.es-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
  transition: color 130ms, background 130ms;
}
.es-search-clear:hover { color: #f0f0ec; background: #1a1a1a; }

.es-suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  z-index: 200;
  list-style: none;
  margin: 0;
  padding: 4px;
}
.es-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 120ms;
}
.es-suggestion:hover,
.es-suggestion--active { background: rgba(10,10,11,0.03); }
.es-suggestion-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.es-suggestion-main {
  font-size: 13.5px;
  font-weight: 600;
  color: #f0f0ec;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.es-suggestion-sub {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.es-picked-place {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  background: rgba(184,146,77,0.07);
  border: 1px solid rgba(10,10,11,0.1);
  border-radius: 10px;
  margin-top: 2px;
}
.es-picked-name {
  flex: 1;
  font-size: 12.5px;
  font-weight: 500;
  color: #f0f0ec;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.es-picked-coords {
  font-size: 11px;
  color: #888;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* ── Overlay ───────────────────────────────────────────────────────────── */
.es-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* ── Add Location drawer ────────────────────────────────────────────────── */
.es-drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.18);
  z-index: 9998;
}
.es-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 92vw;
  background: #141414;
  box-shadow: -8px 0 40px rgba(0,0,0,0.12);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}
.es-drawer-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 24px 0;
  flex-shrink: 0;
}
.es-drawer-sub {
  font-size: 12.5px;
  color: #888;
  margin: 3px 0 0;
}
.es-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.es-drawer-footer {
  display: flex;
  gap: 10px;
  padding: 16px 24px 24px;
  border-top: 1px solid #1a1a1a;
  flex-shrink: 0;
}

.es-modal-title { font-size: 18px; font-weight: 700; color: #f0f0ec; margin: 0; }
.es-modal-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #888;
  transition: background 130ms;
  flex-shrink: 0;
}
.es-modal-close:hover { background: #2a2a2a; }

.es-field-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #888;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}
.es-field-optional { font-weight: 400; text-transform: none; letter-spacing: 0; }

.es-modal-cancel {
  flex: 1;
  padding: 11px;
  background: #1a1a1a;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  font-family: inherit;
  transition: background 130ms;
}
.es-modal-cancel:hover { background: #2a2a2a; }
.es-modal-confirm {
  flex: 1;
  padding: 11px;
  background: linear-gradient(180deg, #2A2A2D 0%, #0A0A0B 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 130ms;
}
.es-modal-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
.es-modal-confirm:not(:disabled):hover { opacity: 0.88; }

/* ── Small dialogs (publish / delete) ─────────────────────────────────── */
.es-dialog {
  background: #141414;
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  padding: 28px 24px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.es-dialog-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(201,168,76,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.es-dialog-icon--red { background: rgba(255,59,48,0.1); }
.es-dialog-title { font-size: 18px; font-weight: 700; color: #f0f0ec; margin: 0; }
.es-dialog-msg { font-size: 13.5px; color: #888; margin: 0; line-height: 1.55; }
.es-dialog-msg strong { color: #f0f0ec; }
.es-dialog .es-input { margin-top: 4px; }
.es-dialog-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 6px;
}
.es-dialog-cancel {
  flex: 1;
  padding: 12px;
  background: #1a1a1a;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  font-family: inherit;
  transition: background 130ms;
}
.es-dialog-cancel:hover { background: #2a2a2a; }
.es-dialog-confirm {
  flex: 1;
  padding: 12px;
  background: linear-gradient(180deg, #2A2A2D 0%, #0A0A0B 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 130ms;
}
.es-dialog-confirm:not(:disabled):hover { opacity: 0.88; }
.es-dialog-confirm--red { background: #FF3B30; }
.es-dialog-confirm:disabled { cursor: not-allowed; }

/* ── Toast ─────────────────────────────────────────────────────────────── */
.es-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #0A0A0B;
  color: #fff;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 10000;
  white-space: nowrap;
}
.es-toast--err { background: #FF3B30; }

/* ── Spin animation ────────────────────────────────────────────────────── */
.es-spin { animation: es-rotate 0.8s linear infinite; }
@keyframes es-rotate { to { transform: rotate(360deg); } }

/* ── Transitions ───────────────────────────────────────────────────────── */
.es-fade-enter-active, .es-fade-leave-active { transition: opacity 200ms; }
.es-fade-enter-from, .es-fade-leave-to { opacity: 0; }

.es-drawer-enter-active { transition: transform 260ms cubic-bezier(0.32,0.72,0,1); }
.es-drawer-leave-active { transition: transform 200ms cubic-bezier(0.32,0.72,0,1); }
.es-drawer-enter-from,
.es-drawer-leave-to     { transform: translateX(100%); }

.es-toast-enter-active { transition: opacity 220ms, transform 220ms cubic-bezier(0.34,1.56,0.64,1); }
.es-toast-leave-active { transition: opacity 180ms, transform 180ms; }
.es-toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(12px); }
.es-toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(8px); }

/* ── Responsive ── */
@media (max-width: 900px) {
  /* Tighten side padding so panels don't feel cramped on tablets / DevTools viewports */
  .es-root { padding: 20px 20px 56px; }
  .es-header { margin-bottom: 24px; }
  .es-page-title { font-size: 22px; }
}

@media (max-width: 780px) {
  /* Single-column layout earlier — 680px is too late when a sidebar is present */
  .es-grid { grid-template-columns: 1fr; }
  .es-root { padding: 16px 16px 48px; }
}

@media (max-width: 600px) {
  .es-root { padding: 14px 14px 48px; }
  /* Header: remove the double-padding from earlier rule, just tighten spacing */
  .es-header { margin-bottom: 16px; gap: 12px; }
  .es-page-title { font-size: 19px; letter-spacing: -0.3px; }
  .es-page-sub { font-size: 12px; }
  .es-save-btn { padding: 8px 16px; font-size: 13px; }
  /* Panels: reduce padding and ensure long description text wraps cleanly */
  .es-panel { padding: 12px; }
  .es-section-hint { overflow-wrap: break-word; word-break: break-word; }
  /* Panel header left: shrink so hint text doesn't push outside the panel */
  .es-panel-hd { gap: 8px; }
  .es-panel-hd-left { min-width: 0; }
}
</style>