<template>
  <div class="et-root">

    <!-- ══ Toolbar ══ -->
    <div class="et-toolbar">
      <div class="et-toolbar-left">
        <p class="et-toolbar-title">Manage Team</p>
        <p class="et-toolbar-sub">Admins &amp; scanning team</p>
      </div>
      <div class="et-toolbar-right">
        <button class="et-refresh-btn" @click="loadTeam" :disabled="loading" title="Refresh">
          <svg :class="{ 'et-spin': loading }" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ══ Stats bar ══ -->
    <div class="et-stats-bar">
      <div class="et-stat">
        <span class="et-stat-n">{{ adminsIds.length }}</span>
        <span class="et-stat-lbl">Admins</span>
      </div>
      <div class="et-stat-sep"/>
      <div class="et-stat">
        <span class="et-stat-n">{{ scannersIds.length }}</span>
        <span class="et-stat-lbl">Scanning Team</span>
      </div>
      <div class="et-stat-sep"/>
      <div class="et-stat">
        <span class="et-stat-n" style="color:#B8924D">{{ adminsIds.length + scannersIds.length }}</span>
        <span class="et-stat-lbl">Total Members</span>
      </div>
    </div>

    <!-- ══ Content ══ -->
    <div class="et-content">

      <!-- Loading -->
      <div v-if="loading" class="et-empty">
        <svg class="et-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="#B8924D" stroke-width="2.2" stroke-linecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <p>Loading team…</p>
      </div>

      <template v-else>

        <!-- ── Add Admin section ─────────────────────────────────── -->
        <div class="et-add-section">
          <p class="et-section-lbl">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
              stroke-width="2" stroke-linecap="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Add Admin by Email
          </p>
          <div class="et-search-row">
            <div class="et-search-wrap">
              <svg class="et-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#6B6B72" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                v-model="searchEmail"
                class="et-search-inp"
                type="email"
                placeholder="Enter email address…"
                @keydown.enter="searchUser"
                @input="searchResult = null; searchError = ''"
              />
              <button v-if="searchEmail" class="et-search-clear" @click="clearSearch">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <button class="et-search-btn" @click="searchUser" :disabled="searchLoading || !searchEmail.trim()">
              {{ searchLoading ? 'Searching…' : 'Search' }}
            </button>
          </div>

          <!-- Search result -->
          <div v-if="searchError" class="et-search-error">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ searchError }}
          </div>

          <div v-if="searchResult" class="et-search-result">
            <div class="et-member-card">
              <div class="et-avatar" :style="avatarStyle(searchResult)">
                <img v-if="searchResult.profileImage"
                  :src="searchResult.profileImage" class="et-avatar-img"
                  @error="e => e.target.style.display = 'none'" />
                <span class="et-avatar-init">{{ initials(searchResult) }}</span>
              </div>
              <div class="et-member-info">
                <p class="et-member-name">{{ fullName(searchResult) }}</p>
                <p class="et-member-email">{{ searchResult.email }}</p>
              </div>
              <div class="et-member-action">
                <template v-if="alreadyInTeam(searchResult.id)">
                  <span class="et-already-badge">Already added</span>
                </template>
                <button v-else class="et-add-btn" @click="addAsAdmin(searchResult)"
                  :disabled="addingUid === searchResult.id">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {{ addingUid === searchResult.id ? 'Adding…' : 'Add as Admin' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Admins section ────────────────────────────────────── -->
        <div v-if="adminProfiles.length || adminsIds.length" class="et-team-section">
          <div class="et-section-head">
            <span class="et-section-lbl">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
                stroke-width="2" stroke-linecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Admins
            </span>
            <span class="et-section-cnt">{{ adminsIds.length }}</span>
          </div>
          <div class="et-member-list">
            <div v-for="uid in adminsIds" :key="uid" class="et-member-card">
              <template v-if="adminProfiles.find(u => u.id === uid)">
                <div class="et-avatar" :style="avatarStyle(adminProfiles.find(u => u.id === uid))">
                  <img v-if="adminProfiles.find(u => u.id === uid).profileImage"
                    :src="adminProfiles.find(u => u.id === uid).profileImage"
                    class="et-avatar-img"
                    @error="e => e.target.style.display = 'none'" />
                  <span class="et-avatar-init">{{ initials(adminProfiles.find(u => u.id === uid)) }}</span>
                </div>
                <div class="et-member-info">
                  <p class="et-member-name">{{ fullName(adminProfiles.find(u => u.id === uid)) }}</p>
                  <p class="et-member-email">{{ adminProfiles.find(u => u.id === uid).email }}</p>
                </div>
              </template>
              <template v-else>
                <div class="et-avatar-skeleton"/>
                <div class="et-member-info">
                  <div class="et-skeleton et-skeleton--name"/>
                  <div class="et-skeleton et-skeleton--email"/>
                </div>
              </template>
              <div class="et-member-action">
                <span v-if="uid === authorId" class="et-owner-badge">Owner</span>
                <template v-else>
                  <template v-if="confirmRemove?.uid === uid && confirmRemove?.list === 'adminsIds'">
                    <span class="et-del-lbl">Remove?</span>
                    <button class="et-del-yes" @click="removeMember(uid, 'adminsIds')"
                      :disabled="removingId === uid">
                      {{ removingId === uid ? '…' : 'Yes' }}
                    </button>
                    <button class="et-del-no" @click="confirmRemove = null">No</button>
                  </template>
                  <button v-else class="et-remove-btn"
                    @click="confirmRemove = { uid, list: 'adminsIds' }"
                    title="Remove">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="22" y1="18" x2="16" y2="18"/>
                    </svg>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Scanning Team section ─────────────────────────────── -->
        <div v-if="scannerProfiles.length || scannersIds.length" class="et-team-section">
          <div class="et-section-head">
            <span class="et-section-lbl">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5E9AFF"
                stroke-width="2" stroke-linecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M7 7h.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01M7 17h.01M12 17h.01M17 17h.01"/>
              </svg>
              Scanning Team
            </span>
            <span class="et-section-cnt">{{ scannersIds.length }}</span>
          </div>
          <div class="et-member-list">
            <div v-for="uid in scannersIds" :key="uid" class="et-member-card">
              <template v-if="scannerProfiles.find(u => u.id === uid)">
                <div class="et-avatar" :style="avatarStyle(scannerProfiles.find(u => u.id === uid))">
                  <img v-if="scannerProfiles.find(u => u.id === uid).profileImage"
                    :src="scannerProfiles.find(u => u.id === uid).profileImage"
                    class="et-avatar-img"
                    @error="e => e.target.style.display = 'none'" />
                  <span class="et-avatar-init">{{ initials(scannerProfiles.find(u => u.id === uid)) }}</span>
                </div>
                <div class="et-member-info">
                  <p class="et-member-name">{{ fullName(scannerProfiles.find(u => u.id === uid)) }}</p>
                  <p class="et-member-email">{{ scannerProfiles.find(u => u.id === uid).email }}</p>
                </div>
              </template>
              <template v-else>
                <div class="et-avatar-skeleton"/>
                <div class="et-member-info">
                  <div class="et-skeleton et-skeleton--name"/>
                  <div class="et-skeleton et-skeleton--email"/>
                </div>
              </template>
              <div class="et-member-action">
                <template v-if="confirmRemove?.uid === uid && confirmRemove?.list === 'usersIds'">
                  <span class="et-del-lbl">Remove?</span>
                  <button class="et-del-yes" @click="removeMember(uid, 'usersIds')"
                    :disabled="removingId === uid">
                    {{ removingId === uid ? '…' : 'Yes' }}
                  </button>
                  <button class="et-del-no" @click="confirmRemove = null">No</button>
                </template>
                <button v-else class="et-remove-btn"
                  @click="confirmRemove = { uid, list: 'usersIds' }"
                  title="Remove">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="22" y1="18" x2="16" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Empty (no team yet) ───────────────────────────────── -->
        <div v-if="!adminsIds.length && !scannersIds.length && !loading" class="et-empty">
          <div class="et-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
              stroke-width="1.4" stroke-linecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p class="et-empty-title">No team members yet</p>
          <p class="et-empty-sub">Search by email above to add your first admin</p>
        </div>

      </template>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../../firebase'
import {
  doc, getDoc, getDocs, collection,
  updateDoc, arrayUnion, arrayRemove, query, where, limit,
} from 'firebase/firestore'

const props   = defineProps({ event: Object, eventId: String })
const route   = useRoute()
const eventId = computed(() => props.eventId ?? route.params.eventId)

// ── State ─────────────────────────────────────────────────────────────────────
const loading        = ref(false)
const authorId       = ref('')
const adminsIds      = ref([])
const scannersIds    = ref([])
const adminProfiles  = ref([])
const scannerProfiles = ref([])

const searchEmail  = ref('')
const searchLoading = ref(false)
const searchResult = ref(null)
const searchError  = ref('')
const addingUid    = ref(null)

const confirmRemove = ref(null) // { uid, list }
const removingId   = ref(null)

// ── Load ───────────────────────────────────────────────────────────────────────
async function loadTeam() {
  if (!eventId.value) return
  loading.value = true
  try {
    const snap = await getDoc(doc(db, 'events', eventId.value))
    if (!snap.exists()) return
    const data    = snap.data()
    authorId.value    = data.authorId ?? ''
    adminsIds.value   = Array.from(data.adminsIds ?? [])
    scannersIds.value = Array.from(data.usersIds  ?? [])

    // Fetch profiles in parallel
    const [aProfiles, sProfiles] = await Promise.all([
      fetchProfiles(adminsIds.value),
      fetchProfiles(scannersIds.value),
    ])
    adminProfiles.value   = aProfiles
    scannerProfiles.value = sProfiles
  } catch (e) {
    console.error('Failed to load team', e)
  } finally {
    loading.value = false
  }
}

async function fetchProfiles(uids) {
  if (!uids.length) return []
  const results = await Promise.allSettled(
    uids.map(uid => getDoc(doc(db, 'users', uid)))
  )
  return results
    .filter(r => r.status === 'fulfilled' && r.value.exists())
    .map(r => ({ id: r.value.id, ...r.value.data() }))
}

onMounted(loadTeam)

// ── Search ────────────────────────────────────────────────────────────────────
async function searchUser() {
  const email = searchEmail.value.trim().toLowerCase()
  if (!email) return
  searchLoading.value = true
  searchResult.value  = null
  searchError.value   = ''
  try {
    const snap = await getDocs(
      query(collection(db, 'users'), where('email', '==', email), limit(1))
    )
    if (snap.empty) {
      searchError.value = `No user found with email "${email}"`
    } else {
      const d = snap.docs[0]
      searchResult.value = { id: d.id, ...d.data() }
    }
  } catch (e) {
    searchError.value = 'Search failed. Please try again.'
  } finally {
    searchLoading.value = false
  }
}

function clearSearch() {
  searchEmail.value  = ''
  searchResult.value = null
  searchError.value  = ''
}

function alreadyInTeam(uid) {
  return adminsIds.value.includes(uid) || scannersIds.value.includes(uid)
}

async function addAsAdmin(user) {
  if (addingUid.value) return
  addingUid.value = user.id
  try {
    await updateDoc(doc(db, 'events', eventId.value), {
      adminsIds: arrayUnion(user.id),
    })
    adminsIds.value = [...adminsIds.value, user.id]
    adminProfiles.value = [...adminProfiles.value, user]
    clearSearch()
  } catch (e) {
    console.error('Failed to add admin', e)
  } finally {
    addingUid.value = null
  }
}

// ── Remove ────────────────────────────────────────────────────────────────────
async function removeMember(uid, listField) {
  if (removingId.value) return
  removingId.value = uid
  try {
    await updateDoc(doc(db, 'events', eventId.value), {
      [listField]: arrayRemove(uid),
    })
    if (listField === 'adminsIds') {
      adminsIds.value    = adminsIds.value.filter(id => id !== uid)
      adminProfiles.value = adminProfiles.value.filter(u => u.id !== uid)
    } else {
      scannersIds.value    = scannersIds.value.filter(id => id !== uid)
      scannerProfiles.value = scannerProfiles.value.filter(u => u.id !== uid)
    }
    confirmRemove.value = null
  } catch (e) {
    console.error('Failed to remove member', e)
  } finally {
    removingId.value = null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fullName(u) {
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Haflaway User'
}
function initials(u) {
  const f = u.firstName?.[0] ?? ''
  const l = u.lastName?.[0]  ?? ''
  return (f + l).toUpperCase() || '?'
}

const AVATAR_COLORS = [
  ['#D4E8C2','#3A6B1A'],['#C2D8E8','#1A4B6B'],['#E8D4C2','#6B3A1A'],
  ['#D4C2E8','#3A1A6B'],['#E8C2D4','#6B1A3A'],['#C2E8D4','#1A6B3A'],
  ['#E8E4C2','#6B5A1A'],['#C2E8E8','#1A6B6B'],
]
function avatarStyle(u) {
  const idx = (u.firstName?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length
  return { background: AVATAR_COLORS[idx][0], color: AVATAR_COLORS[idx][1] }
}
</script>

<style scoped>
/* ══ Root ══ */
.et-root {
  display: flex;
  flex-direction: column;
  padding: 20px 24px 24px;
  gap: 16px;
  background: #0a0e1c;
}

/* ══ Toolbar ══ */
.et-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; flex-shrink: 0;
  padding: 0;
}
.et-toolbar-left { display: flex; flex-direction: column; gap: 2px; }
.et-toolbar-title { font-size: 16px; font-weight: 700; color: #e2e8f0; margin: 0; }
.et-toolbar-sub   { font-size: 12px; color: #8892a4; margin: 0; }
.et-toolbar-right { display: flex; align-items: center; gap: 6px; }
.et-refresh-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #1e2d44; background: #111827; color: #8892a4;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 140ms; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.et-refresh-btn:hover:not(:disabled) { background: #1a2236; color: #e2e8f0; }
.et-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ══ Stats bar ══ */
.et-stats-bar {
  display: flex; align-items: center; flex-shrink: 0;
  padding: 0 16px; background: #111827; border: 1px solid #1e2d44; border-radius: 12px; min-height: 52px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
.et-stat { display: flex; flex-direction: column; align-items: center; padding: 10px 20px; gap: 2px; }
.et-stat-n   { font-size: 18px; font-weight: 700; color: #e2e8f0; line-height: 1; }
.et-stat-lbl { font-size: 10px; font-weight: 600; color: #4f617a; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; }
.et-stat-sep { width: 0.8px; height: 28px; background: #1e2d44; flex-shrink: 0; }

/* ══ Content ══ */
.et-content { flex: 1; padding: 0; display: flex; flex-direction: column; gap: 24px; max-width: 680px; }

/* Empty */
.et-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; min-height: 260px; color: #4f617a;
}
.et-empty-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: rgba(255,255,255,0.04); border: 1px solid #1e2d44;
  display: flex; align-items: center; justify-content: center;
}
.et-empty-title { font-size: 15px; font-weight: 600; color: #8892a4; margin: 0; }
.et-empty-sub   { font-size: 13px; color: #4f617a; margin: 0; text-align: center; }

/* ══ Add Admin section ══ */
.et-add-section {
  display: flex; flex-direction: column; gap: 12px;
}
.et-section-lbl {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 700; color: #8892a4;
  text-transform: uppercase; letter-spacing: 0.5px;
}

.et-search-row { display: flex; gap: 8px; }
.et-search-wrap {
  flex: 1; position: relative; display: flex; align-items: center;
}
.et-search-icon { position: absolute; left: 10px; pointer-events: none; }
.et-search-inp {
  width: 100%; padding: 9px 34px 9px 32px;
  border: 1px solid #2a3a52; border-radius: 10px;
  font-size: 13px; font-family: inherit; outline: none; color: #e2e8f0;
  background: #0f1729; box-sizing: border-box;
  transition: border-color 150ms, box-shadow 150ms;
}
.et-search-inp:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }
.et-search-clear {
  position: absolute; right: 8px; background: none; border: none;
  cursor: pointer; color: #8892a4; padding: 2px; display: flex; align-items: center;
}
.et-search-btn {
  padding: 9px 18px; border-radius: 10px;
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0; border: none;
  font-size: 13px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: opacity 140ms; white-space: nowrap;
  flex-shrink: 0;
}
.et-search-btn:hover:not(:disabled) { opacity: 0.85; }
.et-search-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.et-search-error {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: #fc8181; padding: 8px 12px;
  background: rgba(255,59,48,0.06); border: 1px solid rgba(255,59,48,0.18);
  border-radius: 8px;
}

.et-search-result { margin-top: 2px; }
.et-add-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 9px;
  background: rgba(201,168,76,0.1); color: #C9A84C;
  border: 1px solid rgba(201,168,76,0.2); font-size: 12px; font-weight: 600;
  font-family: inherit; cursor: pointer; transition: all 130ms; white-space: nowrap;
}
.et-add-btn:hover:not(:disabled) { background: rgba(201,168,76,0.18); }
.et-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.et-already-badge {
  padding: 5px 10px; border-radius: 8px;
  background: rgba(255,255,255,0.06); color: #8892a4;
  font-size: 11px; font-weight: 600;
}

/* ══ Team section ══ */
.et-team-section { display: flex; flex-direction: column; gap: 10px; }
.et-section-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 2px;
}
.et-section-cnt {
  padding: 1px 7px; border-radius: 8px;
  background: rgba(255,255,255,0.06); color: #8892a4;
  font-size: 11px; font-weight: 700;
}

/* ══ Member card ══ */
.et-member-list { display: flex; flex-direction: column; gap: 8px; }
.et-member-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px;
  background: #111827; border: 1px solid #1e2d44;
  box-shadow: 0 1px 1px rgba(0,0,0,0.2), 0 4px 12px -2px rgba(0,0,0,0.3), 0 16px 32px -8px rgba(0,0,0,0.25);
}

/* Avatar */
.et-avatar {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  border: 1.5px solid rgba(255,255,255,0.1);
}
.et-avatar-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;
}
.et-avatar-init { font-size: 14px; font-weight: 700; }

/* Skeleton */
.et-avatar-skeleton {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(90deg, #1e2d44 25%, #2a3a52 50%, #1e2d44 75%);
  background-size: 200% 100%;
  animation: et-shimmer 1.4s infinite;
}
.et-skeleton {
  border-radius: 4px;
  background: linear-gradient(90deg, #1e2d44 25%, #2a3a52 50%, #1e2d44 75%);
  background-size: 200% 100%;
  animation: et-shimmer 1.4s infinite;
}
.et-skeleton--name  { height: 13px; width: 140px; margin-bottom: 6px; }
.et-skeleton--email { height: 11px; width: 200px; }
@keyframes et-shimmer { to { background-position: -200% 0; } }

/* Member info */
.et-member-info { flex: 1; min-width: 0; }
.et-member-name  { font-size: 14px; font-weight: 600; color: #e2e8f0; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.et-member-email { font-size: 12px; color: #8892a4; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Member actions */
.et-member-action { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.et-owner-badge {
  padding: 4px 10px; border-radius: 8px;
  background: rgba(201,168,76,0.1); color: #C9A84C;
  border: 1px solid rgba(201,168,76,0.2);
  font-size: 11px; font-weight: 700;
}
.et-remove-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid rgba(255,59,48,0.22); background: rgba(255,59,48,0.06);
  color: #fc8181; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 130ms;
}
.et-remove-btn:hover { background: rgba(255,59,48,0.12); border-color: rgba(255,59,48,0.4); }
.et-del-lbl { font-size: 11px; font-weight: 600; color: #fc8181; }
.et-del-yes {
  padding: 4px 9px; border-radius: 6px; font-size: 11px; font-weight: 700;
  border: 1px solid rgba(255,59,48,0.3); background: rgba(255,59,48,0.08); color: #fc8181;
  cursor: pointer; font-family: inherit;
}
.et-del-yes:hover:not(:disabled) { background: rgba(255,59,48,0.16); }
.et-del-yes:disabled { opacity: 0.6; cursor: not-allowed; }
.et-del-no {
  padding: 4px 9px; border-radius: 6px; font-size: 11px; font-weight: 500;
  border: 1px solid #1e2d44; background: #0f1729; color: #8892a4;
  cursor: pointer; font-family: inherit;
}
.et-del-no:hover { background: #1a2236; }

/* Spin */
.et-spin { animation: et-spin-anim 1.1s linear infinite; }
@keyframes et-spin-anim { to { transform: rotate(360deg); } }
</style>