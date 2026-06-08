<template>
  <div class="eg-root">

    <!-- ══════════════════════════════════════════════════════════
         FOLDER LIST VIEW
    ═══════════════════════════════════════════════════════════ -->
    <template v-if="!selectedFolder">

      <!-- Toolbar -->
      <div class="eg-toolbar">
        <div class="eg-toolbar-left">
          <div class="eg-search-wrap">
            <svg class="eg-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#6B6B72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        </div>
        <div class="eg-toolbar-right">
          <button class="eg-refresh-btn" @click="loadFolders" :disabled="loading" title="Refresh">
            <svg :class="{ 'eg-spin': loading }" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button class="eg-new-btn" @click="openCreateFolder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            New Folder
          </button>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="eg-stats-bar">
        <div class="eg-stat">
          <span class="eg-stat-n">{{ folders.length }}</span>
          <span class="eg-stat-lbl">Folders</span>
        </div>
        <div class="eg-stat-sep"/>
        <div class="eg-stat">
          <span class="eg-stat-n" style="color:#B8924D">{{ totalMediaCount }}</span>
          <span class="eg-stat-lbl">Total Media</span>
        </div>
      </div>

      <!-- Content -->
      <div class="eg-content">

        <div v-if="loading" class="eg-empty">
          <svg class="eg-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#B8924D" stroke-width="2.2" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p>Loading folders…</p>
        </div>

        <div v-else-if="!filteredFolders.length" class="eg-empty">
          <div class="eg-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
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
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
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
    </template>

    <!-- ══════════════════════════════════════════════════════════
         FOLDER DETAIL VIEW
    ═══════════════════════════════════════════════════════════ -->
    <template v-else>

      <!-- Folder header / toolbar -->
      <div class="eg-folder-header">
        <button class="eg-back-btn" @click="closeFolder">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Folders
        </button>

        <div class="eg-folder-header-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
            stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="eg-folder-header-name">{{ selectedFolder.name }}</span>
        </div>

        <div class="eg-folder-header-actions">
          <!-- Add Media dropdown -->
          <div class="eg-add-wrap">
            <button class="eg-add-btn" @click="addMenuOpen = !addMenuOpen" :disabled="uploading">
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

      <!-- Stats bar -->
      <div class="eg-stats-bar">
        <div class="eg-stat">
          <span class="eg-stat-n">{{ photoCount }}</span>
          <span class="eg-stat-lbl">Photos</span>
        </div>
        <div class="eg-stat-sep"/>
        <div class="eg-stat">
          <span class="eg-stat-n" style="color:#FF9F0A">{{ videoCount }}</span>
          <span class="eg-stat-lbl">Videos</span>
        </div>
        <div class="eg-stat-sep"/>
        <div class="eg-stat">
          <span class="eg-stat-n">{{ folderMedia.length }}</span>
          <span class="eg-stat-lbl">Total</span>
        </div>
      </div>

      <!-- Media content -->
      <div class="eg-content">

        <div v-if="loadingMedia" class="eg-empty">
          <svg class="eg-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#B8924D" stroke-width="2.2" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p>Loading media…</p>
        </div>

        <div v-else-if="!folderMedia.length && !uploading" class="eg-empty">
          <div class="eg-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B6B72"
                stroke-width="1.5" stroke-linecap="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              <div class="eg-tile-video-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="#B8924D" stroke="none">
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
    </template>

    <!-- ══ Create Folder Modal ══ -->
    <Teleport to="body">
      <Transition name="eg-fade">
        <div v-if="showCreateFolder" class="eg-modal-overlay" @click.self="showCreateFolder = false">
          <div class="eg-modal">
            <div class="eg-modal-ico-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
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
  background: #0a0e1c;
}

/* ══ Toolbar ══ */
.eg-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 0;
}
.eg-toolbar-left  { display: flex; align-items: center; gap: 8px; }
.eg-toolbar-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

/* Search */
.eg-search-wrap {
  position: relative; display: flex; align-items: center;
  min-width: 200px; max-width: 280px;
}
.eg-search-icon { position: absolute; left: 10px; pointer-events: none; }
.eg-search {
  width: 100%; padding: 8px 32px;
  border: 1px solid #2a3a52; border-radius: 10px;
  font-size: 13px; font-family: inherit; outline: none;
  background: #0f1729; color: #e2e8f0;
  transition: border-color 150ms, box-shadow 150ms;
}
.eg-search:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }
.eg-search-clear {
  position: absolute; right: 8px;
  background: none; border: none; cursor: pointer; color: #8892a4; padding: 2px;
  display: flex; align-items: center;
}
.eg-search-clear:hover { color: #e2e8f0; }

/* Buttons */
.eg-refresh-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #1e2d44; background: #111827; color: #8892a4;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 140ms;
}
.eg-refresh-btn:hover:not(:disabled) { background: #1a2236; color: #e2e8f0; }
.eg-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.eg-new-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px;
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0;
  font-size: 13px; font-weight: 600; font-family: inherit; border: none;
  text-decoration: none; cursor: pointer;
  transition: opacity 140ms;
}
.eg-new-btn:hover { opacity: 0.85; }

/* ══ Stats bar ══ */
.eg-stats-bar {
  display: flex; align-items: center; gap: 0; flex-shrink: 0;
  padding: 0 16px; background: #111827; border: 1px solid #1e2d44; border-radius: 12px; min-height: 52px;
}
.eg-stat {
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 20px; gap: 2px;
}
.eg-stat-n { font-size: 18px; font-weight: 700; color: #e2e8f0; line-height: 1; }
.eg-stat-lbl {
  font-size: 10px; font-weight: 600; color: #8892a4;
  text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap;
}
.eg-stat-sep { width: 0.8px; height: 28px; background: #1e2d44; flex-shrink: 0; }

/* ══ Content ══ */
.eg-content { flex: 1; padding: 0; }

/* Empty state */
.eg-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; min-height: 300px; color: #4f617a;
}
.eg-empty-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
  border: 1px solid #1e2d44;
  display: flex; align-items: center; justify-content: center;
}
.eg-empty-title { font-size: 15px; font-weight: 600; color: #8892a4; margin: 0; }
.eg-empty-sub   { font-size: 13px; color: #4f617a; margin: 0; text-align: center; max-width: 280px; }
.eg-empty-cta {
  margin-top: 6px; padding: 9px 20px; border-radius: 10px;
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0; font-size: 13px; font-weight: 600;
  border: none; cursor: pointer; transition: opacity 140ms; font-family: inherit;
}
.eg-empty-cta:hover { opacity: 0.85; }

/* ══ Folder grid ══ */
.eg-folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
}

.eg-folder-card {
  background: #111827;
  border: 1px solid #1e2d44;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: box-shadow 160ms, border-color 160ms, transform 160ms;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.eg-folder-card:hover {
  box-shadow: 0 4px 18px rgba(0,0,0,0.35);
  border-color: #2a3a52;
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
  background: #0a0e1c;
}
.eg-fc-thumb-cell {
  background: #1e2d44;
  overflow: hidden;
}
.eg-fc-thumb-cell img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}

.eg-fc-thumb-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(145deg, #1a2a3a 0%, #2a3a52 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
}
.eg-fc-thumb-placeholder span {
  font-size: 11px; font-weight: 600; color: #C9A84C; opacity: 0.7;
}

/* Card footer */
.eg-fc-body { padding: 12px 14px 14px; }
.eg-fc-name {
  font-size: 14px; font-weight: 700; color: #e2e8f0; margin: 0 0 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.eg-fc-meta { font-size: 12px; color: #8892a4; margin: 0; }

/* Delete controls (overlay top-right) */
.eg-fc-del-wrap {
  position: absolute; top: 8px; right: 8px;
  display: flex; align-items: center; gap: 5px;
}
.eg-fc-del-btn {
  opacity: 0; transition: opacity 150ms;
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(28,26,24,0.55); backdrop-filter: blur(4px);
  border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.eg-fc-del-btn:hover { background: rgba(255,59,48,0.75); }
.eg-fc-del-confirm {
  display: flex; align-items: center; gap: 5px;
  background: rgba(28,26,24,0.72); border-radius: 9px;
  padding: 5px 8px; backdrop-filter: blur(6px);
}
.eg-fc-del-confirm span { font-size: 11px; font-weight: 600; color: #FF3B30; }
.eg-del-yes  {
  padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700;
  border: 1px solid rgba(255,59,48,0.4); background: rgba(255,59,48,0.22); color: #FF3B30;
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

/* ══ Folder detail header ══ */
.eg-folder-header {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  flex-shrink: 0; padding: 12px 20px;
  background: #111827; border-bottom: 1px solid #1e2d44;
}
.eg-back-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 12px; border-radius: 10px;
  border: 1px solid #1e2d44; background: #0f1729; color: #8892a4;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 130ms; font-family: inherit; flex-shrink: 0;
}
.eg-back-btn:hover { background: #1a2236; color: #e2e8f0; }

.eg-folder-header-title {
  display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;
}
.eg-folder-header-name {
  font-size: 17px; font-weight: 700; color: #e2e8f0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.eg-folder-header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* Add media dropdown */
.eg-add-wrap { position: relative; }
.eg-add-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 10px;
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0;
  font-size: 13px; font-weight: 600; font-family: inherit; border: none;
  cursor: pointer; transition: opacity 140ms;
}
.eg-add-btn:hover:not(:disabled) { opacity: 0.85; }
.eg-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.eg-add-backdrop {
  position: fixed; inset: 0; z-index: 49;
}
.eg-add-menu {
  position: absolute; right: 0; top: calc(100% + 6px); z-index: 50;
  background: #111827; border: 1px solid #1e2d44; border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45);
  padding: 8px; min-width: 240px;
  display: flex; flex-direction: column; gap: 4px;
}
.eg-add-menu-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 10px; border: none;
  background: transparent; cursor: pointer; font-family: inherit;
  transition: background 120ms; text-align: left;
}
.eg-add-menu-item:hover { background: #1a2236; }
.eg-add-menu-ico {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.eg-add-menu-ico--photo { background: rgba(90,200,250,0.12); color: #63b3ed; border: 1px solid rgba(90,200,250,0.2); }
.eg-add-menu-ico--video { background: rgba(255,159,10,0.12); color: #f59e0b; border: 1px solid rgba(255,159,10,0.2); }
.eg-add-menu-info { display: flex; flex-direction: column; gap: 2px; }
.eg-add-menu-lbl  { font-size: 14px; font-weight: 600; color: #e2e8f0; }
.eg-add-menu-sub  { font-size: 12px; color: #8892a4; }

/* ══ Upload banner ══ */
.eg-upload-banner {
  flex-shrink: 0; padding: 12px 20px;
  background: #111827; border-bottom: 1px solid #1e2d44;
}
.eg-upload-banner-top {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
}
.eg-upload-lbl   { font-size: 13px; font-weight: 600; color: #e2e8f0; flex: 1; }
.eg-upload-count { font-size: 12px; color: #8892a4; }
.eg-upload-cancel {
  padding: 4px 10px; border-radius: 7px;
  border: 1px solid rgba(255,59,48,0.3); background: rgba(255,59,48,0.07); color: #fc8181;
  font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer;
}
.eg-upload-cancel:hover { background: rgba(255,59,48,0.13); }
.eg-upload-track {
  height: 5px; border-radius: 3px; background: #1e2d44; overflow: hidden;
}
.eg-upload-fill {
  height: 100%; border-radius: 3px; background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%);
  transition: width 200ms linear;
}

/* ══ Media grid ══ */
.eg-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 6px;
}

.eg-media-tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #1e2d44;
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
  font-size: 8px; font-weight: 800; color: #B8924D; letter-spacing: 0.4px;
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
  background: rgba(28,26,24,0.78); border-radius: 8px;
  padding: 5px 8px; backdrop-filter: blur(4px);
}
.eg-tile-confirm span { font-size: 11px; font-weight: 600; color: #FF3B30; }
.eg-tile-yes {
  padding: 3px 9px; border-radius: 6px;
  background: rgba(255,59,48,0.22); border: 1px solid rgba(255,59,48,0.4);
  color: #FF3B30; font-size: 11px; font-weight: 700; cursor: pointer; font-family: inherit;
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
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.eg-modal {
  background: #111827; border-radius: 20px;
  padding: 28px 28px 22px;
  width: 100%; max-width: 360px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: flex; flex-direction: column; align-items: center; gap: 0;
  border: 1px solid #1e2d44;
}
.eg-modal-ico-wrap {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(201,168,76,0.10);
  border: 1px solid rgba(201,168,76,0.2);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.eg-modal-title { font-size: 18px; font-weight: 700; color: #e2e8f0; margin: 0 0 5px; }
.eg-modal-sub   { font-size: 13px; color: #8892a4; margin: 0 0 18px; }
.eg-modal-input {
  width: 100%; padding: 10px 14px;
  border: 1px solid #2a3a52; border-radius: 10px;
  font-size: 14px; font-family: inherit; outline: none; color: #e2e8f0;
  background: #0f1729; box-sizing: border-box; margin-bottom: 18px;
  transition: border-color 150ms, box-shadow 150ms;
}
.eg-modal-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }
.eg-modal-actions {
  display: flex; gap: 10px; width: 100%;
  padding-top: 16px; border-top: 1px solid #1e2d44;
}
.eg-modal-cancel {
  flex: 1; padding: 11px; border-radius: 10px;
  border: 1px solid #1e2d44; background: #0f1729; color: #8892a4;
  font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
  transition: background 130ms;
}
.eg-modal-cancel:hover { background: #1a2236; }
.eg-modal-create {
  flex: 1; padding: 11px; border-radius: 10px;
  border: none; background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0;
  font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer;
  transition: opacity 130ms;
}
.eg-modal-create:hover:not(:disabled) { opacity: 0.85; }
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
</style>