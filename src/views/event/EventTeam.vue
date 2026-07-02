<template>
  <div class="et-root">

    <!-- ══ Stat cards ══ -->
    <div class="et-stats">
      <div class="et-stat-card">
        <div class="et-stat-icon et-stat-icon--purple">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="et-stat-body">
          <span class="et-stat-lbl">Total Members</span>
          <span class="et-stat-val">{{ adminsIds.length + scannersIds.length }}</span>
        </div>
      </div>
      <div class="et-stat-card">
        <div class="et-stat-icon et-stat-icon--gold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="et-stat-body">
          <span class="et-stat-lbl">Admins</span>
          <span class="et-stat-val">{{ adminsIds.length }}</span>
        </div>
      </div>
      <div class="et-stat-card">
        <div class="et-stat-icon et-stat-icon--blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M7 7h.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01M7 17h.01M12 17h.01M17 17h.01"/>
          </svg>
        </div>
        <div class="et-stat-body">
          <span class="et-stat-lbl">Scanning Team</span>
          <span class="et-stat-val">{{ scannersIds.length }}</span>
        </div>
      </div>
      <div class="et-stat-card">
        <div class="et-stat-icon et-stat-icon--teal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="et-stat-body">
          <span class="et-stat-lbl">Event Owner</span>
          <span class="et-stat-val">1</span>
        </div>
      </div>
    </div>

    <!-- ══ Panel ══ -->
    <div class="et-panel">

      <!-- Panel header -->
      <div class="et-panel-hd">
        <h2 class="et-panel-title">Team</h2>
        <div class="et-panel-acts">
          <button class="et-refresh-btn" @click="loadTeam" :disabled="loading" title="Refresh">
            <svg :class="{ 'et-spin': loading }" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Panel body -->
      <div class="et-panel-body">

        <!-- Loading -->
        <div v-if="loading" class="et-empty">
          <svg class="et-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#C9A84C" stroke-width="2.2" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p>Loading team…</p>
        </div>

        <template v-else>

          <!-- ── Add Admin section ─────────────────────────────────── -->
          <div class="et-add-section">
            <p class="et-section-lbl">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
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
                  stroke="#555" stroke-width="2" stroke-linecap="round">
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
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
      </div><!-- /et-panel-body -->

    </div><!-- /et-panel -->

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
}

/* ══ Stat cards ══ */
.et-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.et-stat-card {
  background: #111111; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 20px 20px 18px; display: flex; align-items: flex-start; gap: 16px;
}
.et-stat-icon {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0; margin-top: 2px;
  display: flex; align-items: center; justify-content: center;
}
.et-stat-icon--gold   { background: rgba(201,168,76,0.08);  color: #C9A84C; }
.et-stat-icon--blue   { background: rgba(96,165,250,0.08);  color: #60a5fa; }
.et-stat-icon--teal   { background: rgba(45,212,191,0.08);  color: #2dd4bf; }
.et-stat-icon--purple { background: rgba(167,139,250,0.08); color: #a78bfa; }
.et-stat-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.et-stat-lbl  { font-size: 11px; color: #777; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
.et-stat-val  { font-size: 32px; font-weight: 700; color: #f0f0ec; line-height: 1; letter-spacing: -0.5px; }

/* ══ Panel ══ */
.et-panel {
  display: flex; flex-direction: column;
  background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden;
}
.et-panel-hd {
  display: flex; align-items: center;
  padding: 14px 20px; border-bottom: 1px solid #1e1e1e; gap: 10px;
}
.et-panel-title {
  font-size: 19px; font-weight: 700; color: #f0ece6; margin: 0; letter-spacing: -0.3px;
}
.et-panel-acts { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.et-panel-body { display: flex; flex-direction: column; gap: 24px; padding: 20px 24px 24px; max-width: 680px; }

.et-refresh-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #2a2a2a; background: rgba(255,255,255,0.04); color: #888;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 140ms;
}
.et-refresh-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #f0f0ec; }
.et-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Empty */
.et-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; min-height: 260px; color: #555;
}
.et-empty-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: rgba(10,10,11,0.03); border: 1px solid rgba(10,10,11,0.08);
  display: flex; align-items: center; justify-content: center;
}
.et-empty-title { font-size: 15px; font-weight: 600; color: #888; margin: 0; }
.et-empty-sub   { font-size: 13px; color: #555; margin: 0; text-align: center; }

/* ══ Add Admin section ══ */
.et-add-section {
  display: flex; flex-direction: column; gap: 12px;
}
.et-section-lbl {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 700; color: #888;
  text-transform: uppercase; letter-spacing: 0.5px;
}

.et-search-row { display: flex; gap: 8px; }
.et-search-wrap {
  flex: 1; position: relative; display: flex; align-items: center;
}
.et-search-icon { position: absolute; left: 10px; pointer-events: none; }
.et-search-inp {
  width: 100%; padding: 9px 34px 9px 32px;
  border: 1px solid #2a2a2a; border-radius: 10px;
  font-size: 13px; font-family: inherit; outline: none; color: #f0f0ec;
  background: #0d0d0d; box-sizing: border-box;
  transition: border-color 150ms, box-shadow 150ms;
}
.et-search-inp:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(184,146,77,0.10); }
.et-search-clear {
  position: absolute; right: 8px; background: none; border: none;
  cursor: pointer; color: #888; padding: 2px; display: flex; align-items: center;
}
.et-search-btn {
  padding: 9px 18px; border-radius: 10px;
  background: rgba(226,232,240,0.12); color: #f0f0ec; border: none;
  font-size: 13px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: background 140ms; white-space: nowrap;
  flex-shrink: 0;
}
.et-search-btn:hover:not(:disabled) { background: #1a2236; }
.et-search-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.et-search-error {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: #FF453A; padding: 8px 12px;
  background: rgba(255,59,48,0.06); border: 1px solid rgba(255,59,48,0.18);
  border-radius: 8px;
}

.et-search-result { margin-top: 2px; }
.et-add-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 9px;
  background: rgba(201,168,76,0.08); color: #C9A84C;
  border: 1px solid rgba(10,10,11,0.12); font-size: 12px; font-weight: 600;
  font-family: inherit; cursor: pointer; transition: all 130ms; white-space: nowrap;
}
.et-add-btn:hover:not(:disabled) { background: rgba(10,10,11,0.09); }
.et-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.et-already-badge {
  padding: 5px 10px; border-radius: 8px;
  background: #1a1a1a; color: #888;
  font-size: 11px; font-weight: 600;
}

/* ══ Team section ══ */
.et-team-section { display: flex; flex-direction: column; gap: 10px; }
.et-section-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 2px;
}
.et-section-cnt {
  padding: 1px 7px; border-radius: 8px;
  background: #1a1a1a; color: #888;
  font-size: 11px; font-weight: 700;
}

/* ══ Member card ══ */
.et-member-list { display: flex; flex-direction: column; gap: 8px; }
.et-member-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px;
  background: #0d0d0d; border: 1px solid #2a2a2a;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* Avatar */
.et-avatar {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  border: 1.5px solid rgba(10,10,11,0.1);
}
.et-avatar-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;
}
.et-avatar-init { font-size: 14px; font-weight: 700; }

/* Skeleton */
.et-avatar-skeleton {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(90deg, #0d0d0d 25%, #1a1a1a 50%, #0d0d0d 75%);
  background-size: 200% 100%;
  animation: et-shimmer 1.4s infinite;
}
.et-skeleton {
  border-radius: 4px;
  background: linear-gradient(90deg, #0d0d0d 25%, #1a1a1a 50%, #0d0d0d 75%);
  background-size: 200% 100%;
  animation: et-shimmer 1.4s infinite;
}
.et-skeleton--name  { height: 13px; width: 140px; margin-bottom: 6px; }
.et-skeleton--email { height: 11px; width: 200px; }
@keyframes et-shimmer { to { background-position: -200% 0; } }

/* Member info */
.et-member-info { flex: 1; min-width: 0; }
.et-member-name  { font-size: 14px; font-weight: 600; color: #f0f0ec; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.et-member-email { font-size: 12px; color: #888; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Member actions */
.et-member-action { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.et-owner-badge {
  padding: 4px 10px; border-radius: 8px;
  background: rgba(201,168,76,0.08); color: #C9A84C;
  border: 1px solid rgba(10,10,11,0.1);
  font-size: 11px; font-weight: 700;
}
.et-remove-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid rgba(255,59,48,0.22); background: rgba(255,59,48,0.06);
  color: #FF453A; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 130ms;
}
.et-remove-btn:hover { background: rgba(255,59,48,0.12); border-color: rgba(255,59,48,0.4); }
.et-del-lbl { font-size: 11px; font-weight: 600; color: #FF453A; }
.et-del-yes {
  padding: 4px 9px; border-radius: 6px; font-size: 11px; font-weight: 700;
  border: 1px solid rgba(255,59,48,0.3); background: rgba(255,59,48,0.08); color: #FF453A;
  cursor: pointer; font-family: inherit;
}
.et-del-yes:hover:not(:disabled) { background: rgba(255,59,48,0.16); }
.et-del-yes:disabled { opacity: 0.6; cursor: not-allowed; }
.et-del-no {
  padding: 4px 9px; border-radius: 6px; font-size: 11px; font-weight: 500;
  border: 1px solid #2a2a2a; background: #0d0d0d; color: #888;
  cursor: pointer; font-family: inherit;
}
.et-del-no:hover { background: #1a1a1a; }

/* Spin */
.et-spin { animation: et-spin-anim 1.1s linear infinite; }
@keyframes et-spin-anim { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 700px) {
  .et-stats      { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .et-root       { padding: 12px 14px 20px; gap: 12px; }
  .et-panel-body { padding: 16px 14px 20px; max-width: 100%; }

  /* Stat card — tighten + prevent grid overflow */
  .et-stat-card  { padding: 14px 14px 12px; gap: 12px; min-width: 0; overflow: hidden; }
  .et-stat-icon  { width: 36px; height: 36px; flex-shrink: 0; }
  .et-stat-val   { font-size: 24px; }
  .et-stat-body  { gap: 6px; min-width: 0; }
  .et-stat-lbl   { font-size: 10px; letter-spacing: 0; }

  /* Search row wraps on very small screens */
  .et-search-row { flex-wrap: wrap; }
  .et-search-btn { width: 100%; justify-content: center; }

  /* Member card — grid layout so action zone never overflows */
  .et-member-card {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      "avatar info"
      "avatar acts";
    align-items: start;
    gap: 2px 12px;
    padding: 12px 12px;
  }
  .et-avatar         { grid-area: avatar; align-self: center; }
  .et-avatar-skeleton { grid-area: avatar; align-self: center; }
  .et-member-info    { grid-area: info; }
  .et-member-action  {
    grid-area: acts;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }

  /* Skeleton bars — cap width so they don't overflow */
  .et-skeleton--name  { width: min(140px, 55%); }
  .et-skeleton--email { width: min(200px, 80%); }

  /* Confirm-remove: stack label above buttons */
  .et-del-lbl { width: 100%; }
}

@media (max-width: 400px) {
  .et-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
  .et-stat-icon { width: 34px; height: 34px; border-radius: 8px; }
  .et-stat-icon svg { width: 15px; height: 15px; }
  .et-stat-val { font-size: 22px; }
}
</style>