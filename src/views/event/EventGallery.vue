<template>
  <div class="eg-root">

    <!-- ══════════════════════════════════════════════════════════
         FOLDER LIST VIEW
    ═══════════════════════════════════════════════════════════ -->
    <template v-if="!selectedFolder">

      <!-- Stat cards -->
      <div class="eg-stats" v-if="!loading || folders.length">
        <div class="eg-stat-card">
          <div class="eg-stat-icon eg-stat-icon--purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="eg-stat-body">
            <span class="eg-stat-lbl">Folders</span>
            <span class="eg-stat-val">{{ folders.length }}</span>
          </div>
        </div>
        <div class="eg-stat-card">
          <div class="eg-stat-icon eg-stat-icon--blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div class="eg-stat-body">
            <span class="eg-stat-lbl">Total Media</span>
            <span class="eg-stat-val">{{ folders.reduce((s, f) => s + (f.mediaCount ?? 0), 0) }}</span>
          </div>
        </div>
        <div class="eg-stat-card">
          <div class="eg-stat-icon eg-stat-icon--teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="eg-stat-body">
            <span class="eg-stat-lbl">With Content</span>
            <span class="eg-stat-val">{{ folders.filter(f => (f.mediaCount ?? 0) > 0).length }}</span>
          </div>
        </div>
        <div class="eg-stat-card">
          <div class="eg-stat-icon eg-stat-icon--gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="eg-stat-body">
            <span class="eg-stat-lbl">Empty</span>
            <span class="eg-stat-val">{{ folders.filter(f => !(f.mediaCount ?? 0)).length }}</span>
          </div>
        </div>
      </div>

      <!-- Panel -->
      <div class="eg-panel">

        <!-- Panel header -->
        <div class="eg-panel-hd">
          <h2 class="eg-panel-title">Gallery</h2>
          <div class="eg-search-wrap eg-hd-search">
            <svg class="eg-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="searchQ" class="eg-search" placeholder="Search folders…" />
            <button v-if="searchQ" class="eg-search-clear" @click="searchQ = ''">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="eg-panel-acts">
            <button class="eg-refresh-btn" @click="loadFolders" :disabled="loading" title="Refresh">
              <svg :class="{ 'eg-spin': loading }" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button class="eg-new-folder-btn" @click="openCreateFolder">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
              New Folder
            </button>
          </div>
        </div>

        <!-- Panel body -->
        <div class="eg-panel-body">

          <div v-if="loading" class="eg-empty">
            <svg class="eg-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#C9A84C" stroke-width="2.2" stroke-linecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <p>Loading folders…</p>
          </div>

          <div v-else-if="!filteredFolders.length" class="eg-empty">
            <div class="eg-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
                stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p class="eg-empty-title">{{ searchQ ? 'No folders match' : 'No folders yet' }}</p>
            <p class="eg-empty-sub">{{ searchQ ? 'Try a different search' : 'Create your first album to organise event photos and videos' }}</p>
            <button v-if="!searchQ" class="eg-empty-cta" @click="openCreateFolder">New Folder</button>
          </div>

          <div v-else class="eg-folder-grid">
            <div v-for="folder in filteredFolders" :key="folder.id"
              class="eg-folder-card" @click="openFolder(folder)">

              <!-- Thumbnail preview grid -->
              <div class="eg-fc-thumbs">
                <template v-if="folder.thumbnails && folder.thumbnails.length">
                  <div class="eg-fc-thumb-grid">
                    <div v-for="i in 4" :key="i" class="eg-fc-thumb-cell">
                      <img v-if="folder.thumbnails[i - 1]"
                        :src="folder.thumbnails[i - 1].url"
                        loading="lazy" draggable="false" />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="eg-fc-thumb-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
                      stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Empty folder</span>
                  </div>
                </template>
              </div>

              <!-- Card footer -->
              <div class="eg-fc-body">
                <p class="eg-fc-name">{{ folder.name }}</p>
                <p class="eg-fc-meta">
                  {{ folder.mediaCount ?? 0 }} {{ (folder.mediaCount ?? 0) === 1 ? 'item' : 'items' }}
                  · {{ formatDate(folder.createdAt) }}
                </p>
              </div>

              <!-- Delete button (top-right corner, shown on hover) -->
              <div class="eg-fc-del-wrap" @click.stop>
                <template v-if="confirmDeleteFolderId === folder.id">
                  <div class="eg-fc-del-confirm">
                    <span>Delete?</span>
                    <button class="eg-del-yes" @click.stop="deleteFolder(folder)"
                      :disabled="deletingFolderId === folder.id">
                      {{ deletingFolderId === folder.id ? '…' : 'Yes' }}
                    </button>
                    <button class="eg-del-no" @click.stop="confirmDeleteFolderId = null">No</button>
                  </div>
                </template>
                <button v-else class="eg-fc-del-btn"
                  @click.stop="confirmDeleteFolderId = folder.id" title="Delete folder">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.2" stroke-linecap="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

    </template>

    <!-- ══════════════════════════════════════════════════════════
         FOLDER DETAIL VIEW
    ═══════════════════════════════════════════════════════════ -->
    <template v-else>

      <!-- Stat cards for folder detail -->
      <div class="eg-stats">
        <div class="eg-stat-card">
          <div class="eg-stat-icon eg-stat-icon--purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div class="eg-stat-body">
            <span class="eg-stat-lbl">Total Items</span>
            <span class="eg-stat-val">{{ folderMedia.length }}</span>
          </div>
        </div>
        <div class="eg-stat-card">
          <div class="eg-stat-icon eg-stat-icon--blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div class="eg-stat-body">
            <span class="eg-stat-lbl">Photos</span>
            <span class="eg-stat-val">{{ photoCount }}</span>
          </div>
        </div>
        <div class="eg-stat-card">
          <div class="eg-stat-icon eg-stat-icon--teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </div>
          <div class="eg-stat-body">
            <span class="eg-stat-lbl">Videos</span>
            <span class="eg-stat-val">{{ videoCount }}</span>
          </div>
        </div>
        <div class="eg-stat-card">
          <div class="eg-stat-icon eg-stat-icon--gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="eg-stat-body">
            <span class="eg-stat-lbl">In Album</span>
            <span class="eg-stat-val">{{ folderMedia.length }}</span>
          </div>
        </div>
      </div>

      <!-- Panel -->
      <div class="eg-panel">

        <!-- Panel header -->
        <div class="eg-panel-hd">
          <button class="eg-back-btn" @click="closeFolder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Folders
          </button>
          <h2 class="eg-panel-title">{{ selectedFolder.name }}</h2>
          <div class="eg-panel-acts">
            <!-- Add Media dropdown -->
            <div class="eg-add-wrap">
              <button class="eg-add-media-btn" @click="addMenuOpen = !addMenuOpen" :disabled="uploading">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Media
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <!-- Dropdown backdrop -->
              <div v-if="addMenuOpen" class="eg-add-backdrop" @click="addMenuOpen = false"/>
              <div v-if="addMenuOpen" class="eg-add-menu">
                <button class="eg-add-menu-item" @click="triggerImageUpload">
                  <div class="eg-add-menu-ico eg-add-menu-ico--photo">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div class="eg-add-menu-info">
                    <span class="eg-add-menu-lbl">Photos</span>
                    <span class="eg-add-menu-sub">Select multiple images</span>
                  </div>
                </button>
                <button class="eg-add-menu-item" @click="triggerVideoUpload">
                  <div class="eg-add-menu-ico eg-add-menu-ico--video">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                  </div>
                  <div class="eg-add-menu-info">
                    <span class="eg-add-menu-lbl">Video</span>
                    <span class="eg-add-menu-sub">Select a video file</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload progress banner -->
        <div v-if="uploading" class="eg-upload-banner">
          <div class="eg-upload-banner-top">
            <span class="eg-upload-lbl">Uploading…</span>
            <div class="eg-upload-count">{{ uploadIndex }} / {{ uploadTotal }}</div>
            <button class="eg-upload-cancel" @click="cancelUpload">Cancel</button>
          </div>
          <div class="eg-upload-track">
            <div class="eg-upload-fill"
              :style="{ width: uploadTotal > 0 ? `${((uploadIndex - 1 + uploadProgress) / uploadTotal) * 100}%` : '0%' }"/>
          </div>
        </div>

        <!-- Panel body: media grid -->
        <div class="eg-panel-body">

          <div v-if="loadingMedia" class="eg-empty">
            <svg class="eg-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#C9A84C" stroke-width="2.2" stroke-linecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <p>Loading media…</p>
          </div>

          <div v-else-if="!folderMedia.length && !uploading" class="eg-empty">
            <div class="eg-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
                stroke-width="1.4" stroke-linecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p class="eg-empty-title">This folder is empty</p>
            <p class="eg-empty-sub">Upload photos or videos to get started</p>
            <button class="eg-empty-cta" @click="triggerImageUpload">Add Photos</button>
          </div>

          <div v-else class="eg-media-grid">
            <div v-for="item in folderMedia" :key="item.id"
              class="eg-media-tile"
              @click="confirmDeleteMediaId === item.id ? null : openLightbox(item)">

              <!-- Image -->
              <img v-if="item.type === 'image'"
                :src="item.url" class="eg-tile-img"
                loading="lazy" draggable="false" />

              <!-- Video placeholder -->
              <div v-else class="eg-tile-video">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555"
                  stroke-width="1.5" stroke-linecap="round">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
                <div class="eg-tile-video-badge">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="#C9A84C" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  VIDEO
                </div>
              </div>

              <!-- Delete overlay (hover) -->
              <div class="eg-tile-actions" @click.stop>
                <template v-if="confirmDeleteMediaId === item.id">
                  <div class="eg-tile-confirm">
                    <span>Delete?</span>
                    <button class="eg-tile-yes"
                      @click.stop="deleteMedia(item)"
                      :disabled="deletingMediaId === item.id">
                      {{ deletingMediaId === item.id ? '…' : 'Yes' }}
                    </button>
                    <button class="eg-tile-no" @click.stop="confirmDeleteMediaId = null">No</button>
                  </div>
                </template>
                <template v-else>
                  <button class="eg-tile-del-btn" @click.stop="confirmDeleteMediaId = item.id"
                    title="Delete">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5" stroke-linecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </template>
              </div>
            </div>
          </div>

        </div>
      </div>

    </template>

    <!-- ══ Create Folder Modal ══ -->
    <Teleport to="body">
      <Transition name="eg-fade">
        <div v-if="showCreateFolder" class="eg-modal-overlay" @click.self="showCreateFolder = false">
          <div class="eg-modal">
            <div class="eg-modal-ico-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
            </div>
            <h3 class="eg-modal-title">New Folder</h3>
            <p class="eg-modal-sub">Give your album a name</p>
            <input
              ref="folderNameInputRef"
              v-model="newFolderName"
              class="eg-modal-input"
              placeholder="e.g. Pre-Wedding"
              @keydown.enter="createFolder"
              @keydown.esc="showCreateFolder = false"
            />
            <div class="eg-modal-actions">
              <button class="eg-modal-cancel" @click="showCreateFolder = false">Cancel</button>
              <button class="eg-modal-create" @click="createFolder"
                :disabled="creatingFolder || !newFolderName.trim()">
                {{ creatingFolder ? 'Creating…' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ Lightbox ══ -->
    <Teleport to="body">
      <Transition name="eg-fade">
        <div v-if="lightboxItem" class="eg-lightbox" @click.self="lightboxItem = null">
          <button class="eg-lightbox-close" @click="lightboxItem = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <img v-if="lightboxItem.type === 'image'"
            :src="lightboxItem.url" class="eg-lightbox-img" @click.stop />
          <video v-else
            :src="lightboxItem.url"
            class="eg-lightbox-video"
            controls autoplay @click.stop />
        </div>
      </Transition>
    </Teleport>

    <!-- Hidden file inputs -->
    <input ref="imageInputRef" type="file" accept="image/*" multiple
      style="display:none" @change="handleImageFiles" />
    <input ref="videoInputRef" type="file" accept="video/*"
      style="display:none" @change="handleVideoFile" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { db, storage, auth } from '../../firebase'
import {
  collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit,
} from 'firebase/firestore'
import {
  ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage'

const props   = defineProps({ event: Object, eventId: String })
const route   = useRoute()
const eventId = computed(() => props.eventId ?? route.params.eventId)

// ── State: folders ──────────────────────────────────────────────────────────
const folders             = ref([])
const loading             = ref(false)
const searchQ             = ref('')
const confirmDeleteFolderId = ref(null)
const deletingFolderId    = ref(null)
const totalMediaCount     = ref(0)

// ── State: folder detail ─────────────────────────────────────────────────────
const selectedFolder      = ref(null)
const folderMedia         = ref([])
const loadingMedia        = ref(false)
const confirmDeleteMediaId = ref(null)
const deletingMediaId     = ref(null)

// ── State: create folder ─────────────────────────────────────────────────────
const showCreateFolder    = ref(false)
const newFolderName       = ref('')
const creatingFolder      = ref(false)
const folderNameInputRef  = ref(null)

// ── State: upload ─────────────────────────────────────────────────────────────
const uploading           = ref(false)
const uploadProgress      = ref(0)
const uploadIndex         = ref(0)
const uploadTotal         = ref(0)
let   uploadCancelled     = false
let   currentUploadTask   = null
const addMenuOpen         = ref(false)

// ── State: add media ──────────────────────────────────────────────────────────
const imageInputRef       = ref(null)
const videoInputRef       = ref(null)

// ── State: lightbox ───────────────────────────────────────────────────────────
const lightboxItem        = ref(null)

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredFolders = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  if (!q) return folders.value
  return folders.value.filter(f => f.name.toLowerCase().includes(q))
})

const photoCount = computed(() => folderMedia.value.filter(m => m.type === 'image').length)
const videoCount = computed(() => folderMedia.value.filter(m => m.type === 'video').length)

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadFolders() {
  if (!eventId.value) return
  loading.value = true
  try {
    const snap = await getDocs(
      query(collection(db, 'events', eventId.value, 'galleryFolders'), orderBy('createdAt'))
    )
    const rawFolders = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Load media count + first 4 thumbnails per folder in parallel
    const extras = await Promise.all(
      rawFolders.map(async f => {
        const mediaSnap = await getDocs(
          query(
            collection(db, 'events', eventId.value, 'galleryFolders', f.id, 'media'),
            orderBy('uploadedAt', 'desc')
          )
        )
        const thumbnails = mediaSnap.docs
          .slice(0, 4)
          .map(d => ({ url: d.data().url, type: d.data().type }))
        return { mediaCount: mediaSnap.size, thumbnails }
      })
    )

    folders.value = rawFolders.map((f, i) => ({ ...f, ...extras[i] }))
    totalMediaCount.value = extras.reduce((acc, e) => acc + e.mediaCount, 0)
  } catch (e) {
    console.error('Failed to load gallery folders', e)
  } finally {
    loading.value = false
  }
}

async function loadFolderMedia(folder) {
  loadingMedia.value = true
  folderMedia.value  = []
  try {
    const snap = await getDocs(
      query(
        collection(db, 'events', eventId.value, 'galleryFolders', folder.id, 'media'),
        orderBy('uploadedAt', 'desc')
      )
    )
    folderMedia.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to load folder media', e)
  } finally {
    loadingMedia.value = false
  }
}

onMounted(loadFolders)

// ── Folder actions ────────────────────────────────────────────────────────────
function openFolder(folder) {
  selectedFolder.value      = folder
  confirmDeleteFolderId.value = null
  confirmDeleteMediaId.value  = null
  loadFolderMedia(folder)
}

function closeFolder() {
  selectedFolder.value      = null
  folderMedia.value         = []
  confirmDeleteMediaId.value = null
  addMenuOpen.value          = false
  loadFolders()
}

function openCreateFolder() {
  newFolderName.value    = ''
  showCreateFolder.value = true
  nextTick(() => folderNameInputRef.value?.focus())
}

async function createFolder() {
  const name = newFolderName.value.trim()
  if (!name || creatingFolder.value) return
  creatingFolder.value = true
  try {
    const docRef = await addDoc(
      collection(db, 'events', eventId.value, 'galleryFolders'),
      { name, createdAt: new Date().toISOString(), createdBy: auth.currentUser?.uid ?? '' }
    )
    folders.value.push({ id: docRef.id, name, createdAt: new Date().toISOString(), mediaCount: 0, thumbnails: [] })
    showCreateFolder.value = false
    newFolderName.value    = ''
  } catch (e) {
    console.error('Failed to create folder', e)
  } finally {
    creatingFolder.value = false
  }
}

async function deleteFolder(folder) {
  if (deletingFolderId.value) return
  deletingFolderId.value = folder.id
  try {
    // Load + delete all media first
    const mediaSnap = await getDocs(
      collection(db, 'events', eventId.value, 'galleryFolders', folder.id, 'media')
    )
    await Promise.allSettled(
      mediaSnap.docs.map(async d => {
        const sp = d.data().storagePath
        if (sp) {
          try { await deleteObject(storageRef(storage, sp)) } catch (_) {}
        }
        await deleteDoc(d.ref)
      })
    )
    await deleteDoc(doc(db, 'events', eventId.value, 'galleryFolders', folder.id))
    folders.value             = folders.value.filter(f => f.id !== folder.id)
    confirmDeleteFolderId.value = null
    totalMediaCount.value     = Math.max(0, totalMediaCount.value - mediaSnap.size)
  } catch (e) {
    console.error('Failed to delete folder', e)
  } finally {
    deletingFolderId.value = null
  }
}

// ── Media upload ──────────────────────────────────────────────────────────────
function triggerImageUpload() {
  addMenuOpen.value = false
  imageInputRef.value?.click()
}

function triggerVideoUpload() {
  addMenuOpen.value = false
  videoInputRef.value?.click()
}

function handleImageFiles(e) {
  const files = Array.from(e.target.files ?? [])
  e.target.value = ''
  if (!files.length) return
  uploadFiles(files, 'image')
}

function handleVideoFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  uploadFiles([file], 'video')
}

function cancelUpload() {
  uploadCancelled = true
  currentUploadTask?.cancel()
}

async function uploadFiles(files, type) {
  if (!selectedFolder.value) return
  uploading.value       = true
  uploadTotal.value     = files.length
  uploadIndex.value     = 0
  uploadProgress.value  = 0
  uploadCancelled       = false

  let uploadedCount = 0
  try {
    for (let i = 0; i < files.length; i++) {
      if (uploadCancelled) break
      const file = files[i]
      uploadIndex.value    = i + 1
      uploadProgress.value = 0

      const path  = `gallery/${eventId.value}/${selectedFolder.value.id}/${Date.now()}_${file.name}`
      const sRef  = storageRef(storage, path)
      const task  = uploadBytesResumable(sRef, file)
      currentUploadTask = task

      await new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          snap => { uploadProgress.value = snap.bytesTransferred / snap.totalBytes },
          err  => { if (err.code !== 'storage/canceled') { reject(err) } else { resolve() } },
          resolve,
        )
      })

      if (uploadCancelled) break

      const url = await getDownloadURL(sRef)
      const mediaRef = collection(
        db, 'events', eventId.value, 'galleryFolders', selectedFolder.value.id, 'media'
      )
      const now    = new Date().toISOString()
      const docRef = await addDoc(mediaRef, {
        url, storagePath: path, type,
        uploadedAt: now,
        uploadedBy: auth.currentUser?.uid ?? '',
      })
      folderMedia.value.unshift({ id: docRef.id, url, storagePath: path, type, uploadedAt: now })
      totalMediaCount.value++
      uploadedCount++
    }
  } catch (e) {
    if (!uploadCancelled) console.error('Upload failed', e)
  } finally {
    uploading.value       = false
    uploadProgress.value  = 0
    uploadIndex.value     = 0
    uploadTotal.value     = 0
    currentUploadTask     = null
    uploadCancelled       = false
  }
}

// ── Media delete ──────────────────────────────────────────────────────────────
async function deleteMedia(item) {
  if (deletingMediaId.value) return
  deletingMediaId.value = item.id
  try {
    if (item.storagePath) {
      try { await deleteObject(storageRef(storage, item.storagePath)) } catch (_) {}
    }
    await deleteDoc(
      doc(db, 'events', eventId.value, 'galleryFolders', selectedFolder.value.id, 'media', item.id)
    )
    folderMedia.value         = folderMedia.value.filter(m => m.id !== item.id)
    confirmDeleteMediaId.value = null
    totalMediaCount.value     = Math.max(0, totalMediaCount.value - 1)
  } catch (e) {
    console.error('Failed to delete media', e)
  } finally {
    deletingMediaId.value = null
  }
}

// ── Lightbox ───────────────────────────────────────────────────────────────────
function openLightbox(item) {
  lightboxItem.value = item
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return '—'
  try {
    const d = val.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '—' }
}
</script>

<style scoped>
/* ══ Root ══ */
.eg-root {
  display: flex;
  flex-direction: column;
  padding: 20px 24px 24px;
  gap: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Stat cards ── */
.eg-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.eg-stat-card {
  background: #111111; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 20px 20px 18px; display: flex; align-items: flex-start; gap: 16px;
}
.eg-stat-icon {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0; margin-top: 2px;
  display: flex; align-items: center; justify-content: center;
}
.eg-stat-icon--gold   { background: rgba(201,168,76,0.08);  color: #C9A84C; }
.eg-stat-icon--blue   { background: rgba(96,165,250,0.08);  color: #60a5fa; }
.eg-stat-icon--teal   { background: rgba(45,212,191,0.08);  color: #2dd4bf; }
.eg-stat-icon--purple { background: rgba(167,139,250,0.08); color: #a78bfa; }
.eg-stat-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.eg-stat-lbl  { font-size: 11px; color: #777; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.6px; text-transform: uppercase; }
.eg-stat-val  { font-size: 32px; font-weight: 700; color: #f0f0ec; white-space: nowrap; line-height: 1; letter-spacing: -0.5px; }

/* ── Panel ── */
.eg-panel {
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
}
.eg-panel-hd {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #1e1e1e;
  gap: 10px;
}
.eg-panel-title {
  font-size: 19px; font-weight: 700; color: #f0ece6; margin: 0;
  letter-spacing: -0.3px; white-space: nowrap;
}
.eg-panel-acts { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.eg-panel-body { padding: 20px; }

/* Search in panel header */
.eg-hd-search {
  margin-left: 10px;
}

/* New Folder button (gold primary) */
.eg-new-folder-btn {
  display: flex; align-items: center; gap: 6px;
  background: #C9A84C; color: #070707; border: none; border-radius: 10px;
  padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: background 150ms; font-family: inherit; flex-shrink: 0;
}
.eg-new-folder-btn:hover { background: #d4b560; }

/* Add Media button (gold primary) */
.eg-add-media-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #C9A84C; color: #070707; border: none; border-radius: 10px;
  padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background 150ms; font-family: inherit; flex-shrink: 0;
}
.eg-add-media-btn:hover:not(:disabled) { background: #d4b560; }
.eg-add-media-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Refresh button */
.eg-refresh-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #2a2a2a; background: #0d0d0d; color: #888;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 140ms;
}
.eg-refresh-btn:hover:not(:disabled) { background: #1a1a1a; color: #f0f0ec; }
.eg-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Back button in detail panel header */
.eg-back-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 12px; border-radius: 10px;
  border: 1px solid #2a2a2a; background: #1a1a1a; color: #888;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 130ms; font-family: inherit; flex-shrink: 0;
}
.eg-back-btn:hover { background: #2a2a2a; color: #f0f0ec; }

/* Search */
.eg-search-wrap {
  position: relative; display: flex; align-items: center;
  min-width: 180px; max-width: 260px;
}
.eg-search-icon { position: absolute; left: 10px; pointer-events: none; }
.eg-search {
  width: 100%; padding: 8px 32px;
  border: 1px solid #2a2a2a; border-radius: 10px;
  font-size: 13px; font-family: inherit; outline: none;
  background: #111111; color: #f0f0ec;
  transition: border-color 150ms, box-shadow 150ms;
}
.eg-search:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(184,146,77,0.10); }
.eg-search-clear {
  position: absolute; right: 8px;
  background: none; border: none; cursor: pointer; color: #888; padding: 2px;
  display: flex; align-items: center;
}
.eg-search-clear:hover { color: #f0f0ec; }

/* ══ Upload banner ══ */
.eg-upload-banner {
  flex-shrink: 0; padding: 12px 20px;
  background: rgba(201,168,76,0.06); border-bottom: 1px solid rgba(201,168,76,0.15);
}
.eg-upload-banner-top {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
}
.eg-upload-lbl   { font-size: 13px; font-weight: 600; color: #f0f0ec; flex: 1; }
.eg-upload-count { font-size: 12px; color: #888; }
.eg-upload-cancel {
  padding: 4px 10px; border-radius: 7px;
  border: 1px solid rgba(255,59,48,0.3); background: rgba(255,59,48,0.07); color: #FF453A;
  font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer;
}
.eg-upload-cancel:hover { background: rgba(255,59,48,0.13); }
.eg-upload-track {
  height: 5px; border-radius: 3px; background: #2a2a2a; overflow: hidden;
}
.eg-upload-fill {
  height: 100%; border-radius: 3px; background: #C9A84C;
  transition: width 200ms linear;
}

/* Empty state */
.eg-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; min-height: 280px; color: #555;
}
.eg-empty-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(255,255,255,0.03);
  border: 1px solid #2a2a2a;
  display: flex; align-items: center; justify-content: center;
}
.eg-empty-title { font-size: 15px; font-weight: 600; color: #888; margin: 0; }
.eg-empty-sub   { font-size: 13px; color: #555; margin: 0; text-align: center; max-width: 280px; }
.eg-empty-cta {
  margin-top: 6px; padding: 9px 20px; border-radius: 10px;
  background: rgba(226,232,240,0.12); color: #f0f0ec; font-size: 13px; font-weight: 600;
  border: none; cursor: pointer; transition: background 140ms; font-family: inherit;
}
.eg-empty-cta:hover { background: #1a2236; }

/* ══ Folder grid ══ */
.eg-folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
}

.eg-folder-card {
  background: #111111;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: box-shadow 160ms, border-color 160ms, transform 160ms;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.eg-folder-card:hover {
  box-shadow: 0 4px 18px rgba(0,0,0,0.10);
  border-color: #3a3a3a;
  transform: translateY(-1px);
}
.eg-folder-card:hover .eg-fc-del-btn { opacity: 1; }

/* Thumbnail grid */
.eg-fc-thumbs { width: 100%; aspect-ratio: 4/3; overflow: hidden; }

.eg-fc-thumb-grid {
  width: 100%; height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  background: #2a2a2a;
}
.eg-fc-thumb-cell {
  background: #2a2a2a;
  overflow: hidden;
}
.eg-fc-thumb-cell img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}

.eg-fc-thumb-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(145deg, #F5EDD5 0%, #EDD89A 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
}
.eg-fc-thumb-placeholder span {
  font-size: 11px; font-weight: 600; color: #C9A84C; opacity: 0.7;
}

/* Card footer */
.eg-fc-body { padding: 12px 14px 14px; }
.eg-fc-name {
  font-size: 14px; font-weight: 700; color: #f0f0ec; margin: 0 0 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.eg-fc-meta { font-size: 12px; color: #888; margin: 0; }

/* Delete controls (overlay top-right) */
.eg-fc-del-wrap {
  position: absolute; top: 8px; right: 8px;
  display: flex; align-items: center; gap: 5px;
}
.eg-fc-del-btn {
  opacity: 0; transition: opacity 150ms;
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.eg-fc-del-btn:hover { background: rgba(255,59,48,0.75); }
.eg-fc-del-confirm {
  display: flex; align-items: center; gap: 5px;
  background: rgba(0,0,0,0.65); border-radius: 9px;
  padding: 5px 8px; backdrop-filter: blur(6px);
}
.eg-fc-del-confirm span { font-size: 11px; font-weight: 600; color: #FF453A; }
.eg-del-yes  {
  padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700;
  border: 1px solid rgba(255,59,48,0.4); background: rgba(255,59,48,0.22); color: #FF453A;
  cursor: pointer; font-family: inherit; transition: background 120ms;
}
.eg-del-yes:hover:not(:disabled) { background: rgba(255,59,48,0.38); }
.eg-del-yes:disabled { opacity: 0.6; cursor: not-allowed; }
.eg-del-no {
  padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600;
  border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.12); color: #fff;
  cursor: pointer; font-family: inherit; transition: background 120ms;
}
.eg-del-no:hover { background: rgba(255,255,255,0.22); }

/* Add media dropdown */
.eg-add-wrap { position: relative; }
.eg-add-backdrop {
  position: fixed; inset: 0; z-index: 49;
}
.eg-add-menu {
  position: absolute; right: 0; top: calc(100% + 6px); z-index: 50;
  background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 8px; min-width: 240px;
  display: flex; flex-direction: column; gap: 4px;
}
.eg-add-menu-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 10px; border: none;
  background: transparent; cursor: pointer; font-family: inherit;
  transition: background 120ms; text-align: left;
}
.eg-add-menu-item:hover { background: #1a1a1a; }
.eg-add-menu-ico {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.eg-add-menu-ico--photo { background: rgba(90,200,250,0.12); color: #0A7EE3; border: 1px solid rgba(90,200,250,0.2); }
.eg-add-menu-ico--video { background: rgba(255,159,10,0.12); color: #B86B00; border: 1px solid rgba(255,159,10,0.2); }
.eg-add-menu-info { display: flex; flex-direction: column; gap: 2px; }
.eg-add-menu-lbl  { font-size: 14px; font-weight: 600; color: #f0f0ec; }
.eg-add-menu-sub  { font-size: 12px; color: #888; }

/* ══ Media grid ══ */
.eg-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 6px;
}

.eg-media-tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #2a2a2a;
}
.eg-media-tile:hover .eg-tile-actions { opacity: 1; }

.eg-tile-img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform 200ms;
}
.eg-media-tile:hover .eg-tile-img { transform: scale(1.03); }

/* Video placeholder */
.eg-tile-video {
  width: 100%; height: 100%;
  background: #2A2825;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.eg-tile-video-badge {
  position: absolute; bottom: 6px; right: 6px;
  padding: 3px 6px; border-radius: 5px;
  background: rgba(0,0,0,0.65);
  font-size: 8px; font-weight: 800; color: #C9A84C; letter-spacing: 0.4px;
  display: flex; align-items: center; gap: 3px;
}

/* Tile hover actions */
.eg-tile-actions {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.38);
  display: flex; align-items: flex-start; justify-content: flex-end;
  padding: 7px; opacity: 0; transition: opacity 160ms;
}
.eg-tile-del-btn {
  width: 26px; height: 26px; border-radius: 7px;
  background: rgba(255,59,48,0.85); border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 120ms;
}
.eg-tile-del-btn:hover { background: #FF3B30; }

/* Delete confirm on tile */
.eg-tile-confirm {
  display: flex; align-items: center; gap: 5px;
  background: rgba(0,0,0,0.70); border-radius: 8px;
  padding: 5px 8px; backdrop-filter: blur(4px);
}
.eg-tile-confirm span { font-size: 11px; font-weight: 600; color: #FF453A; }
.eg-tile-yes {
  padding: 3px 9px; border-radius: 6px;
  background: rgba(255,59,48,0.22); border: 1px solid rgba(255,59,48,0.4);
  color: #FF453A; font-size: 11px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.eg-tile-yes:hover:not(:disabled) { background: rgba(255,59,48,0.35); }
.eg-tile-yes:disabled { opacity: 0.6; cursor: not-allowed; }
.eg-tile-no {
  padding: 3px 9px; border-radius: 6px;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit;
}
.eg-tile-no:hover { background: rgba(255,255,255,0.22); }

/* ══ Create folder modal ══ */
.eg-modal-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.eg-modal {
  background: #0d0d0d; border-radius: 20px;
  padding: 28px 28px 22px;
  width: 100%; max-width: 360px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column; align-items: center; gap: 0;
}
.eg-modal-ico-wrap {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(184,146,77,0.10);
  border: 1px solid rgba(201,168,76,0.2);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.eg-modal-title { font-size: 18px; font-weight: 700; color: #f0f0ec; margin: 0 0 5px; }
.eg-modal-sub   { font-size: 13px; color: #888; margin: 0 0 18px; }
.eg-modal-input {
  width: 100%; padding: 10px 14px;
  border: 1px solid #2a2a2a; border-radius: 10px;
  font-size: 14px; font-family: inherit; outline: none; color: #f0f0ec;
  background: #111111; box-sizing: border-box; margin-bottom: 18px;
  transition: border-color 150ms, box-shadow 150ms;
}
.eg-modal-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(184,146,77,0.10); }
.eg-modal-actions {
  display: flex; gap: 10px; width: 100%;
  padding-top: 16px; border-top: 1px solid #2a2a2a;
}
.eg-modal-cancel {
  flex: 1; padding: 11px; border-radius: 10px;
  border: 1px solid #2a2a2a; background: #1a1a1a; color: #888;
  font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
  transition: background 130ms;
}
.eg-modal-cancel:hover { background: #2a2a2a; }
.eg-modal-create {
  flex: 1; padding: 11px; border-radius: 10px;
  border: none; background: #C9A84C; color: #070707;
  font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer;
  transition: background 130ms;
}
.eg-modal-create:hover:not(:disabled) { background: #d4b560; }
.eg-modal-create:disabled { opacity: 0.45; cursor: not-allowed; }

/* ══ Lightbox ══ */
.eg-lightbox {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.eg-lightbox-close {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.12); border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 140ms; z-index: 1;
}
.eg-lightbox-close:hover { background: rgba(255,255,255,0.22); }
.eg-lightbox-img {
  max-width: 100%; max-height: 100%;
  object-fit: contain; border-radius: 8px;
  user-select: none;
}
.eg-lightbox-video {
  max-width: 100%; max-height: 100%;
  border-radius: 8px; outline: none;
}

/* ══ Transitions ══ */
.eg-fade-enter-active, .eg-fade-leave-active { transition: opacity 180ms ease; }
.eg-fade-enter-from,   .eg-fade-leave-to     { opacity: 0; }

/* Spin */
.eg-spin { animation: eg-spin-anim 1.1s linear infinite; }
@keyframes eg-spin-anim { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 700px) {
  .eg-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; min-width: 0; }
  .eg-root  { padding: 12px 14px 20px; gap: 12px; }
  .eg-stat-card { min-width: 0; overflow: hidden; padding: 14px 14px 12px; gap: 12px; }
  .eg-stat-icon { width: 36px; height: 36px; flex-shrink: 0; }
  .eg-stat-val  { font-size: 24px; }
  .eg-stat-body { gap: 6px; min-width: 0; }
  .eg-stat-lbl  { font-size: 10px; letter-spacing: 0; }
}

@media (max-width: 640px) {
  /* Panel header toolbar wrapping */
  .eg-panel-hd { flex-wrap: wrap; gap: 8px; }
  .eg-panel-title { font-size: 16px; }
  .eg-hd-search { min-width: 0; flex: 1; max-width: 100%; margin-left: 0; }
  .eg-search-wrap { min-width: 0; max-width: 100%; width: 100%; }
  .eg-panel-acts { flex-wrap: wrap; gap: 6px; }

  /* Folder grid: narrower cards on small screens */
  .eg-folder-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }

  /* Media grid collapses to 2-3 tight columns */
  .eg-media-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 4px; }
}
</style>
