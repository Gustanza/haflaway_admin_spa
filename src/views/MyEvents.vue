<template>
  <div class="me-root">

    <!-- ── Topbar ── -->
    <nav class="me-topbar">
      <div class="me-topbar-inner">
        <span class="me-page-title">All Events</span>
        <button class="me-create-btn" @click="$router.push('/create-event')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create event
        </button>
      </div>
    </nav>

    <!-- ── Page shell ── -->
    <div class="me-page">

      <!-- Greeting + stats -->
      <div class="me-header">
        <div class="me-header-left">
          <h1 class="me-greeting">{{ greeting }}</h1>
          <p class="me-subline">{{ events.length }} event{{ events.length !== 1 ? 's' : '' }} in your workspace.</p>
        </div>
        <div class="me-header-stats">
          <div class="me-stat-block">
            <span class="me-stat-value">{{ events.length }}</span>
            <span class="me-stat-label">Total</span>
          </div>
          <div class="me-stat-divider" />
          <div class="me-stat-block">
            <span class="me-stat-value me-stat-value--gold">{{ upcomingCount }}</span>
            <span class="me-stat-label">Upcoming</span>
          </div>
          <div class="me-stat-divider" />
          <div class="me-stat-block">
            <span class="me-stat-value me-stat-value--emerald">{{ liveCount }}</span>
            <span class="me-stat-label">Live Now</span>
          </div>
        </div>
      </div>

      <!-- Filter bar: tabs → search → sort -->
      <div class="me-filterbar">
        <div class="me-tabs">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            class="me-tab"
            :class="{ 'me-tab--active': activeFilter === f.value }"
            @click="activeFilter = f.value; clearSearch()"
          >
            {{ f.label }}
            <span class="me-tab-count" :class="{ 'me-tab-count--active': activeFilter === f.value }">{{ f.count }}</span>
          </button>
        </div>
        <div class="me-fb-divider" />
        <div class="me-search-wrap">
          <svg class="me-search-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="me-search-input"
            placeholder="Search events…"
            @input="onSearch"
          />
          <button v-if="searchQuery" class="me-search-clear" @click="clearSearch">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="me-fb-divider" />
        <select v-model="activeSort" class="me-fb-select">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">A → Z</option>
        </select>
        <div class="me-fb-divider" />
        <!-- Owner filter -->
        <div class="me-owner-wrap">
          <button
            class="me-owner-btn"
            :class="{ 'me-owner-btn--active': activeOwner }"
            @click="showOwnerDrop = !showOwnerDrop; ownerSearch = ''"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span>{{ activeOwner ? (ownerNames[activeOwner] || 'Owner') : 'All owners' }}</span>
            <button v-if="activeOwner" class="me-owner-clear" @click.stop="activeOwner = null; currentPage = 1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <!-- Backdrop -->
          <div v-if="showOwnerDrop" class="me-owner-backdrop" @click="showOwnerDrop = false" />
          <!-- Dropdown -->
          <div v-if="showOwnerDrop" class="me-owner-drop">
            <div class="me-owner-search-wrap">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:10px;color:var(--ink-dim);pointer-events:none">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input v-model="ownerSearch" class="me-owner-search" placeholder="Search owners…" autofocus />
            </div>
            <div class="me-owner-list">
              <button
                v-for="o in ownerList"
                :key="o.id"
                class="me-owner-opt"
                :class="{ 'me-owner-opt--active': activeOwner === o.id }"
                @click="activeOwner = o.id; showOwnerDrop = false; ownerSearch = ''; currentPage = 1"
              >
                <span class="me-owner-avatar">{{ o.name[0]?.toUpperCase() }}</span>
                <span class="me-owner-opt-name">{{ o.name }}</span>
                <svg v-if="activeOwner === o.id" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:auto;color:var(--gold);flex-shrink:0">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
              <p v-if="!ownerList.length" class="me-owner-empty">No owners found</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="me-skeleton-list">
        <div class="me-skeleton" v-for="i in 3" :key="i" />
      </div>

      <!-- Empty -->
      <div v-else-if="sourceEvents.length === 0" class="me-empty">
        <span class="me-empty-glyph">✦</span>
        <p class="me-empty-title">{{ searchQuery ? `No results for "${searchQuery}"` : 'No events yet. Create your first.' }}</p>
        <button v-if="!searchQuery" class="me-create-btn me-create-btn--lg" @click="$router.push('/create-event')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create event
        </button>
      </div>

      <template v-else>

        <!-- Section heading + tiles grouped so spacing matches tile gap -->
        <div class="me-list-wrap">
        <div class="me-section-head">
          <span class="me-section-sparkle">✦</span>
          <span class="me-section-line" />
          <span class="me-section-meta">
            {{ sourceEvents.length }} event{{ sourceEvents.length !== 1 ? 's' : '' }}
            <template v-if="totalPages > 1"> · page {{ currentPage }} of {{ totalPages }}</template>
          </span>
        </div>

        <!-- Hanging event rows -->
        <div class="me-hanging-list">
          <article
            v-for="(event, idx) in displayedEvents"
            :key="event.id"
            class="me-row"
            :class="`me-row--${statusClass(event)}`"
            :style="{ '--theme': rowThemeColor(event) }"
            @click="goToEvent(event.id)"
          >

            <!-- Left: invitation thumbnail -->
            <div class="me-row-thumb-col">
              <div class="me-row-thumb" v-html="invitationSvg(event)" />
            </div>

            <!-- Middle: content -->
            <div class="me-row-body">
              <div class="me-row-eyebrow">
                <span class="me-row-eyebrow-spark">✦</span>
                <span class="me-row-eyebrow-line" />
              </div>
              <div class="me-row-chips">
                <span class="me-status-pill" :class="`me-status-pill--${statusClass(event)}`">
                  <span class="me-status-dot" />{{ statusLabel(event) }}
                </span>
                <span class="me-role-badge" :class="event.authorId === uid ? 'me-role-badge--owner' : 'me-role-badge--admin'">
                  {{ event.authorId === uid ? 'OWNER' : 'ADMIN' }}
                </span>
                <span class="me-code-chip">{{ event.code || event.id?.slice(0, 8) }}</span>
                <template v-if="ownerFirstName(event.authorId)">
                  <span class="me-chip-sep">·</span>
                  <button
                    class="me-owner-credit"
                    :class="{ 'me-owner-credit--open': swapEvent?.id === event.id }"
                    @click.stop="openSwap(event, $event)"
                    title="Reassign owner"
                  >
                    <span class="me-owner-credit-av" :style="ownerAvatarStyle(event.authorId)">{{ ownerInitials(event.authorId) }}</span>
                    {{ ownerFirstName(event.authorId) }}
                    <svg class="me-owner-credit-icon" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
                    </svg>
                  </button>
                </template>
                <span class="me-chip-sep">·</span>
                <button
                  class="me-owner-credit"
                  :class="{ 'me-owner-credit--open': swapOrgEvent?.id === event.id }"
                  @click.stop="openOrgSwap(event, $event)"
                  title="Reassign organization"
                >
                  <span class="me-owner-credit-av" :style="orgAvatarStyle(event.orgId)">{{ event.orgId ? orgInitials(event.orgId) : '?' }}</span>
                  {{ event.orgId ? (orgNames[event.orgId] || 'Org') : 'No org' }}
                  <svg class="me-owner-credit-icon" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
                  </svg>
                </button>
              </div>
              <h3 class="me-row-title">{{ event.title }}</h3>
              <div class="me-row-meta">
                <div class="me-row-meta-item">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{{ formatFullDate(event.startDate) }}<template v-if="event.endDate"> – {{ formatFullDate(event.endDate) }}</template></span>
                </div>
                <div v-if="event.location" class="me-row-meta-item">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{{ event.location }}</span>
                </div>
                <div class="me-row-meta-item">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>{{ event.adminsIds?.length ?? 1 }} member{{ (event.adminsIds?.length ?? 1) !== 1 ? 's' : '' }}</span>
                </div>
              </div>
              <div v-if="event.contributionGoal" class="me-row-progress">
                <div class="me-row-progress-track">
                  <div class="me-row-progress-fill" :style="{ width: Math.min(100, ((event.collected || 0) / event.contributionGoal) * 100) + '%' }" />
                </div>
              </div>
            </div>

            <!-- Right: date countdown -->
            <div class="me-row-cd">
              <span class="me-row-cd-month">{{ formatMonth(event.startDate) }}</span>
              <span class="me-row-cd-day">{{ formatDay(event.startDate) }}</span>
              <span class="me-row-cd-year">{{ event.startDate ? new Date(event.startDate).getFullYear() : '' }}</span>
              <div class="me-row-cd-ticket" :class="daysAwayClass(event)">
                <template v-if="statusClass(event) === 'ongoing'">
                  <span class="me-live-dot" />LIVE NOW
                </template>
                <template v-else-if="(daysAway(event.startDate) ?? 0) > 0">
                  {{ daysAway(event.startDate) }}d away
                </template>
                <template v-else>
                  {{ Math.round(Math.abs(daysAway(event.startDate) ?? 0) / 30) }}mo ago
                </template>
              </div>
              <button class="me-row-manage-btn" @click.stop="goToEvent(event.id)">Manage →</button>
            </div>
          </article>
        </div>
        </div><!-- /me-list-wrap -->

        <!-- Pagination -->
        <div v-if="!loading && totalPages > 1 && sourceEvents.length >= PAGE_SIZE" class="me-pagination">
          <span class="me-pagination-info">
            Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, sourceEvents.length) }} of {{ sourceEvents.length }}
          </span>
          <div class="me-pagination-controls">
            <button class="me-page-btn me-page-btn--nav" :disabled="currentPage === 1" @click="currentPage--">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <template v-for="p in pageRange" :key="p">
              <span v-if="p === '…'" class="me-page-ellipsis">…</span>
              <button v-else class="me-page-btn" :class="{ 'me-page-btn--active': p === currentPage }" @click="currentPage = p">{{ p }}</button>
            </template>
            <button class="me-page-btn me-page-btn--nav" :disabled="currentPage === totalPages" @click="currentPage++">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

      </template>
    </div>
  </div>

  <!-- ── Owner swap panel ── -->
  <Teleport to="body">
    <div v-if="swapEvent" class="me-swap-backdrop" @click="closeSwap" />
    <Transition name="me-swap">
      <div
        v-if="swapEvent"
        class="me-swap-panel"
        :style="{ top: swapPos.top + 'px', left: swapPos.left + 'px' }"
        @click.stop
      >
        <div class="me-swap-header">
          <div class="me-swap-header-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold);flex-shrink:0">
              <path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
            </svg>
            <span>Reassign owner</span>
          </div>
          <button class="me-swap-close" @click="closeSwap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="me-swap-current" v-if="ownerFirstName(swapEvent.authorId)">
          <span class="me-swap-current-label">Current</span>
          <span class="me-swap-current-val">
            <span class="me-swap-current-av" :style="ownerAvatarStyle(swapEvent.authorId)">{{ ownerInitials(swapEvent.authorId) }}</span>
            {{ ownerNames[swapEvent.authorId] || ownerFirstName(swapEvent.authorId) }}
          </span>
        </div>

        <div class="me-swap-search-wrap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ink-dim);pointer-events:none">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="swapSearch" class="me-swap-search" placeholder="Search users…" autofocus />
        </div>

        <div class="me-swap-list">
          <div v-if="!allUsersReady" class="me-swap-loading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-swap-spinner"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            Loading users…
          </div>
          <template v-else>
            <button
              v-for="u in swapFiltered"
              :key="u.id"
              class="me-swap-opt"
              :class="{ 'me-swap-opt--current': u.id === swapEvent.authorId, 'me-swap-opt--saving': swapSaving }"
              :disabled="swapSaving || u.id === swapEvent.authorId"
              @click="doSwap(u)"
            >
              <span class="me-swap-opt-av" :style="ownerAvatarStyle(u.id)">
                {{ (u.name[0] || '?').toUpperCase() }}{{ (u.name.split(' ')[1]?.[0] || '').toUpperCase() }}
              </span>
              <span class="me-swap-opt-info">
                <span class="me-swap-opt-name">{{ u.name }}</span>
                <span class="me-swap-opt-email">{{ u.email }}</span>
              </span>
              <svg v-if="u.id === swapEvent.authorId" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="margin-left:auto;flex-shrink:0;color:var(--gold)">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <p v-if="swapFiltered.length === 0" class="me-swap-empty">No users match "{{ swapSearch }}"</p>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Org swap panel ── -->
  <Teleport to="body">
    <div v-if="swapOrgEvent" class="me-swap-backdrop" @click="closeOrgSwap" />
    <Transition name="me-swap">
      <div
        v-if="swapOrgEvent"
        class="me-swap-panel"
        :style="{ top: swapOrgPos.top + 'px', left: swapOrgPos.left + 'px' }"
        @click.stop
      >
        <div class="me-swap-header">
          <div class="me-swap-header-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold);flex-shrink:0">
              <path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
            </svg>
            <span>Reassign organization</span>
          </div>
          <button class="me-swap-close" @click="closeOrgSwap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="me-swap-current" v-if="swapOrgEvent.orgId">
          <span class="me-swap-current-label">Current</span>
          <span class="me-swap-current-val">
            <span class="me-swap-current-av" :style="orgAvatarStyle(swapOrgEvent.orgId)">{{ orgInitials(swapOrgEvent.orgId) }}</span>
            {{ orgNames[swapOrgEvent.orgId] || 'Org' }}
          </span>
        </div>

        <div class="me-swap-search-wrap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ink-dim);pointer-events:none">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="swapOrgSearch" class="me-swap-search" placeholder="Search organizations…" autofocus />
        </div>

        <div class="me-swap-list">
          <div v-if="!allOrgsReady" class="me-swap-loading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-swap-spinner"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            Loading organizations…
          </div>
          <template v-else>
            <button
              v-for="o in orgSwapFiltered"
              :key="o.id"
              class="me-swap-opt"
              :class="{ 'me-swap-opt--current': o.id === swapOrgEvent.orgId, 'me-swap-opt--saving': swapOrgSaving }"
              :disabled="swapOrgSaving || o.id === swapOrgEvent.orgId"
              @click="doOrgSwap(o)"
            >
              <span class="me-swap-opt-av" :style="orgAvatarStyle(o.id)">{{ orgInitials(o.id) }}</span>
              <span class="me-swap-opt-info">
                <span class="me-swap-opt-name">{{ o.name }}</span>
                <span class="me-swap-opt-email">{{ formatBalance(o.balance) }}</span>
              </span>
              <svg v-if="o.id === swapOrgEvent.orgId" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="margin-left:auto;flex-shrink:0;color:var(--gold)">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <p v-if="orgSwapFiltered.length === 0" class="me-swap-empty">No organizations match "{{ swapOrgSearch }}"</p>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db, auth } from '../firebase'
import { collection, query, where, orderBy, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore'

const PAGE_SIZE = 10
const router = useRouter()
const route = useRoute()
const uid = auth.currentUser?.uid ?? null

// ── State ──────────────────────────────────────────────────────────────────
const events = ref([])
const loading = ref(true)
const currentPage = ref(1)
const activeFilter = ref('all')
const activeSort = ref('newest')
const activeOwner = ref(null)
const ownerNames = ref({})
const orgNames = ref({})
const ownerSearch = ref('')
const showOwnerDrop = ref(false)
const searchQuery = ref('')

const rotations = [-0.35, 0.45, -0.25, 0.5, -0.4, 0.3]

// ── Greeting ───────────────────────────────────────────────────────────────
const displayName = computed(() => {
  const u = auth.currentUser
  if (!u) return 'Admin'
  return u.displayName || u.email?.split('@')[0] || 'Admin'
})

const greeting = computed(() => {
  const h = new Date().getHours()
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${part}, ${displayName.value}.`
})

const upcomingCount = computed(() => events.value.filter(e => statusClass(e) === 'upcoming').length)
const liveCount = computed(() => events.value.filter(e => statusClass(e) === 'ongoing').length)

// ── Firestore ──────────────────────────────────────────────────────────────
async function loadEvents() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('startDate', 'desc')))
    events.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    fetchOwnerNames()
    fetchOrgNames()
  } catch (e) {
    console.error('loadEvents:', e)
  } finally {
    loading.value = false
  }
}

async function fetchOrgNames() {
  const ids = [...new Set(events.value.map(e => e.orgId).filter(Boolean))]
  const map = {}
  await Promise.all(ids.map(async id => {
    try {
      const d = await getDoc(doc(db, 'organizations', id))
      map[id] = d.exists() ? (d.data().name || id.slice(0, 8)) : id.slice(0, 8)
    } catch { map[id] = id.slice(0, 8) }
  }))
  orgNames.value = map
}

async function fetchOwnerNames() {
  const ids = [...new Set(events.value.map(e => e.authorId).filter(Boolean))]
  const map = {}
  await Promise.all(ids.map(async id => {
    try {
      const d = await getDoc(doc(db, 'users', id))
      const data = d.exists() ? d.data() : {}
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ')
      map[id] = fullName || data.email?.split('@')[0] || id.slice(0, 8)
    } catch { map[id] = id.slice(0, 8) }
  }))
  ownerNames.value = map
}

function fuzzyScore(event, q) {
  const title    = (event.title    || '').toLowerCase()
  const location = (event.location || '').toLowerCase()
  const code     = (event.code     || '').toLowerCase()
  const needle   = q.toLowerCase().trim()
  if (!needle) return 0
  if (title.includes(needle))                        return 4  // exact substring in title
  if (location.includes(needle) || code.includes(needle)) return 3  // exact match in location / code
  const words = needle.split(/\s+/)
  if (words.every(w => title.includes(w)))           return 2  // all words present in title
  let ti = 0, qi = 0
  while (ti < title.length && qi < needle.length) {
    if (title[ti] === needle[qi]) qi++
    ti++
  }
  return qi === needle.length ? 1 : 0                          // character subsequence match
}

// ── Status ─────────────────────────────────────────────────────────────────
function statusClass(event) {
  const now = new Date()
  const start = event.startDate ? new Date(event.startDate) : null
  const end = event.endDate
    ? new Date(event.endDate)
    : start ? new Date(start.getTime() + 86400000) : null
  if (!start) return 'upcoming'
  if (now < start) return 'upcoming'
  if (end && now <= end) return 'ongoing'
  return 'completed'
}

function statusLabel(event) {
  return { upcoming: 'Upcoming', ongoing: 'Live', completed: 'Completed' }[statusClass(event)]
}

// ── Filters ────────────────────────────────────────────────────────────────
const statusFilters = computed(() => [
  { label: 'All',       value: 'all',       count: events.value.length },
  { label: 'Upcoming',  value: 'upcoming',  count: events.value.filter(e => statusClass(e) === 'upcoming').length },
  { label: 'Ongoing',   value: 'ongoing',   count: events.value.filter(e => statusClass(e) === 'ongoing').length },
  { label: 'Completed', value: 'completed', count: events.value.filter(e => statusClass(e) === 'completed').length },
])

const ownerList = computed(() => {
  const ids = [...new Set(events.value.map(e => e.authorId).filter(Boolean))]
  return ids
    .map(id => ({ id, name: ownerNames.value[id] || id.slice(0, 8) }))
    .filter(o => !ownerSearch.value || o.name.toLowerCase().includes(ownerSearch.value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const filteredEvents = computed(() => {
  let list = events.value
  if (activeFilter.value !== 'all') list = list.filter(e => statusClass(e) === activeFilter.value)
  if (activeOwner.value) list = list.filter(e => e.authorId === activeOwner.value)
  if (activeSort.value === 'oldest') list = [...list].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  else if (activeSort.value === 'az') list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  return list
})

const sourceEvents = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return filteredEvents.value
  return filteredEvents.value
    .map(e => ({ e, score: fuzzyScore(e, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ e }) => e)
})

const totalPages = computed(() => Math.ceil(sourceEvents.value.length / PAGE_SIZE))

const displayedEvents = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return sourceEvents.value.slice(start, start + PAGE_SIZE)
})

const pageRange = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (cur > 3) pages.push('…')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p)
  if (cur < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

// ── Owner swap ─────────────────────────────────────────────────────────────
const swapEvent     = ref(null)
const swapPos       = ref({ top: 0, left: 0 })
const swapSearch    = ref('')
const swapSaving    = ref(false)
const allUsers      = ref([])
const allUsersReady = ref(false)

async function fetchAllUsers() {
  if (allUsersReady.value) return
  try {
    const snap = await getDocs(collection(db, 'users'))
    allUsers.value = snap.docs.map(d => {
      const data = d.data()
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email?.split('@')[0] || d.id.slice(0, 8)
      return { id: d.id, name, email: data.email || '', firstName: data.firstName || '' }
    }).sort((a, b) => a.name.localeCompare(b.name))
    allUsersReady.value = true
  } catch (e) { console.error('fetchAllUsers:', e) }
}

function openSwap(event, e) {
  e.stopPropagation()
  closeOrgSwap()
  if (swapEvent.value?.id === event.id) { swapEvent.value = null; return }
  const rect = e.currentTarget.getBoundingClientRect()
  swapPos.value = { top: rect.bottom + 6, left: Math.max(8, rect.left) }
  swapEvent.value = event
  swapSearch.value = ''
  fetchAllUsers()
}
function closeSwap() { swapEvent.value = null; swapSearch.value = '' }

async function doSwap(user) {
  if (!swapEvent.value || swapSaving.value) return
  swapSaving.value = true
  try {
    await updateDoc(doc(db, 'events', swapEvent.value.id), { authorId: user.id })
    swapEvent.value.authorId = user.id
    if (!ownerNames.value[user.id]) ownerNames.value[user.id] = user.name
    closeSwap()
  } catch (e) { console.error('doSwap:', e) } finally { swapSaving.value = false }
}

const swapFiltered = computed(() => {
  const q = swapSearch.value.trim().toLowerCase()
  if (!q) return allUsers.value
  return allUsers.value.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

// ── Owner credit helpers ───────────────────────────────────────────────────
const OWNER_PALETTE = ['#C9A84C', '#30D158', '#0A84FF', '#FF9F0A', '#BF5AF2', '#64D2FF']
function ownerAvatarStyle(id) {
  const color = OWNER_PALETTE[(id || '0').charCodeAt(0) % OWNER_PALETTE.length]
  return { background: color + '22', color, border: `1px solid ${color}55` }
}
function ownerInitials(id) {
  return (ownerNames.value[id] || '').split(' ').map(w => w[0]?.toUpperCase()).filter(Boolean).slice(0, 2).join('')
}
function ownerFirstName(id) {
  return (ownerNames.value[id] || '').split(' ')[0] || ''
}

// ── Org swap ───────────────────────────────────────────────────────────────
// Lets staff manually move an event to a different organization — events are
// billed against whichever org they carry as orgId, so this is the fix for
// an event that landed under the wrong org (or none) and needs correcting.
const swapOrgEvent   = ref(null)
const swapOrgPos     = ref({ top: 0, left: 0 })
const swapOrgSearch  = ref('')
const swapOrgSaving  = ref(false)
const allOrgs        = ref([])
const allOrgsReady   = ref(false)

async function fetchAllOrgs() {
  if (allOrgsReady.value) return
  try {
    const snap = await getDocs(collection(db, 'organizations'))
    allOrgs.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    allOrgsReady.value = true
  } catch (e) { console.error('fetchAllOrgs:', e) }
}

function openOrgSwap(event, e) {
  e.stopPropagation()
  closeSwap()
  if (swapOrgEvent.value?.id === event.id) { swapOrgEvent.value = null; return }
  const rect = e.currentTarget.getBoundingClientRect()
  swapOrgPos.value = { top: rect.bottom + 6, left: Math.max(8, rect.left) }
  swapOrgEvent.value = event
  swapOrgSearch.value = ''
  fetchAllOrgs()
}
function closeOrgSwap() { swapOrgEvent.value = null; swapOrgSearch.value = '' }

async function doOrgSwap(org) {
  if (!swapOrgEvent.value || swapOrgSaving.value) return
  swapOrgSaving.value = true
  try {
    await updateDoc(doc(db, 'events', swapOrgEvent.value.id), { orgId: org.id })
    swapOrgEvent.value.orgId = org.id
    orgNames.value[org.id] = org.name
    closeOrgSwap()
  } catch (e) { console.error('doOrgSwap:', e) } finally { swapOrgSaving.value = false }
}

const orgSwapFiltered = computed(() => {
  const q = swapOrgSearch.value.trim().toLowerCase()
  if (!q) return allOrgs.value
  return allOrgs.value.filter(o => (o.name || '').toLowerCase().includes(q))
})

const ORG_PALETTE = ['#C9A84C', '#30D158', '#0A84FF', '#FF9F0A', '#BF5AF2', '#64D2FF']
function orgAvatarStyle(id) {
  const color = ORG_PALETTE[(id || '0').charCodeAt(0) % ORG_PALETTE.length]
  return { background: color + '22', color, border: `1px solid ${color}55` }
}
function orgInitials(id) {
  return (orgNames.value[id] || '').split(' ').map(w => w[0]?.toUpperCase()).filter(Boolean).slice(0, 2).join('') || '?'
}
function formatBalance(n) {
  if (n == null) return '—'
  return 'TZS ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Helpers ────────────────────────────────────────────────────────────────
function daysAway(iso) {
  if (!iso) return null
  return Math.ceil((new Date(iso) - new Date()) / 86400000)
}

function daysAwayClass(event) {
  const sc = statusClass(event)
  if (sc === 'ongoing') return 'me-row-cd-ticket--live'
  const d = daysAway(event.startDate)
  if (d !== null && d > 0 && d < 30) return 'me-row-cd-ticket--soon'
  if (d !== null && d <= 0) return 'me-row-cd-ticket--past'
  return ''
}

function coverType(event) {
  const styles = ['goldfloral', 'bridal', 'minimal', 'pearl', 'rose', 'navy']
  if (event.cover && styles.includes(event.cover)) return event.cover
  const hash = event.id
    ? [...event.id].reduce((a, c) => a + c.charCodeAt(0), 0) % styles.length
    : 0
  return styles[hash]
}

const COVER_COLORS = {
  goldfloral: 'rgba(201,168,76,',
  bridal:     'rgba(200,160,180,',
  minimal:    'rgba(170,170,170,',
  pearl:      'rgba(176,168,152,',
  rose:       'rgba(200,120,120,',
  navy:       'rgba(42,58,106,',
}

function rowThemeColor(event) {
  return COVER_COLORS[coverType(event)] ?? 'rgba(201,168,76,'
}

function invitationSvg(event) {
  const cover = coverType(event)
  const P = {
    goldfloral: { bg: '#FDFAF4', frame: '#C9A84C', text: '#2A1F0A', accent: '#C9A84C', flora: true },
    bridal:     { bg: '#FDF8FB', frame: '#C8A0B4', text: '#2A0F1E', accent: '#C8A0B4', flora: true },
    minimal:    { bg: '#FAFAFA', frame: '#AAAAAA', text: '#111111', accent: '#777777', flora: false },
    pearl:      { bg: '#F9F7F2', frame: '#B0A898', text: '#2A2520', accent: '#B0A898', flora: false },
    rose:       { bg: '#FDF5F5', frame: '#C87878', text: '#2A0A0A', accent: '#C87878', flora: true },
    navy:       { bg: '#F3F5FA', frame: '#2A3A6A', text: '#0A1530', accent: '#2A3A6A', flora: false },
  }
  const p = P[cover] || P.minimal
  const uid_frag = (event.id || 'x').slice(0, 6)
  const title = event.title || 'Untitled'
  const words = title.split(' ')
  const mid = Math.ceil(words.length / 2)
  const line1 = words.slice(0, mid).join(' ')
  const line2 = words.slice(mid).join(' ')
  const shortLine1 = line1.length > 20 ? line1.slice(0, 18) + '…' : line1
  const shortLine2 = line2.length > 20 ? line2.slice(0, 18) + '…' : line2
  const dateNum = event.startDate ? new Date(event.startDate).getDate() : '—'
  const dateMon = event.startDate ? new Date(event.startDate).toLocaleDateString('en', { month: 'short' }).toUpperCase() : ''
  const year = event.startDate ? new Date(event.startDate).getFullYear() : ''
  const venue = (event.location || '').slice(0, 22)
  const cat = (event.categoryId || 'EVENT').toUpperCase().slice(0, 14)

  const flora = p.flora
    ? `<circle cx="150" cy="26" r="5" fill="${p.accent}" opacity="0.45"/>
       <circle cx="133" cy="33" r="3.5" fill="${p.accent}" opacity="0.32"/>
       <circle cx="167" cy="33" r="3.5" fill="${p.accent}" opacity="0.32"/>
       <path d="M143,28 Q137,20 132,24 Q138,29 143,28Z" fill="${p.accent}" opacity="0.38"/>
       <path d="M157,28 Q163,20 168,24 Q162,29 157,28Z" fill="${p.accent}" opacity="0.38"/>
       <line x1="110" y1="44" x2="190" y2="44" stroke="${p.frame}" stroke-width="0.7" opacity="0.28"/>
       <g transform="translate(0,400) scale(1,-1)">
         <circle cx="150" cy="26" r="4" fill="${p.accent}" opacity="0.28"/>
         <circle cx="135" cy="32" r="2.5" fill="${p.accent}" opacity="0.2"/>
         <circle cx="165" cy="32" r="2.5" fill="${p.accent}" opacity="0.2"/>
         <line x1="110" y1="44" x2="190" y2="44" stroke="${p.frame}" stroke-width="0.7" opacity="0.2"/>
       </g>`
    : `<line x1="88" y1="38" x2="212" y2="38" stroke="${p.frame}" stroke-width="0.8" opacity="0.3"/>
       <line x1="88" y1="362" x2="212" y2="362" stroke="${p.frame}" stroke-width="0.8" opacity="0.22"/>`

  const y2 = line2 ? 136 : 120
  const divY = line2 ? 153 : 133
  const numY = line2 ? 193 : 173
  const monY = line2 ? 213 : 193
  const sepY = line2 ? 228 : 208
  const venY = line2 ? 250 : 230
  const ornY = line2 ? 295 : 272

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
  <defs>
    <pattern id="gr-${uid_frag}" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="3" fill="${p.bg}"/>
      <circle cx="1" cy="1" r="0.45" fill="${p.frame}" opacity="0.05"/>
      <circle cx="2.5" cy="2.5" r="0.35" fill="${p.frame}" opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="300" height="400" fill="${p.bg}"/>
  <rect width="300" height="400" fill="url(#gr-${uid_frag})"/>
  <rect x="11" y="11" width="278" height="378" rx="3" fill="none" stroke="${p.frame}" stroke-width="0.9" opacity="0.42"/>
  <rect x="17" y="17" width="266" height="366" rx="2" fill="none" stroke="${p.frame}" stroke-width="0.4" opacity="0.26"/>
  ${flora}
  <text x="150" y="76" text-anchor="middle" font-family="Inter,sans-serif" font-size="7.5" font-weight="600" letter-spacing="2.5" fill="${p.text}" opacity="0.38">${cat}</text>
  <text x="150" y="112" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-style="italic" fill="${p.text}">${shortLine1}</text>
  ${line2 ? `<text x="150" y="${y2}" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-style="italic" fill="${p.text}">${shortLine2}</text>` : ''}
  <line x1="112" y1="${divY}" x2="138" y2="${divY}" stroke="${p.accent}" stroke-width="0.8" opacity="0.52"/>
  <circle cx="150" cy="${divY}" r="2.5" fill="none" stroke="${p.accent}" stroke-width="0.8" opacity="0.52"/>
  <line x1="162" y1="${divY}" x2="188" y2="${divY}" stroke="${p.accent}" stroke-width="0.8" opacity="0.52"/>
  <text x="150" y="${numY}" text-anchor="middle" font-family="Georgia,serif" font-size="32" fill="${p.text}" letter-spacing="-1">${dateNum}</text>
  <text x="150" y="${monY}" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="600" letter-spacing="2" fill="${p.text}" opacity="0.48">${dateMon} · ${year}</text>
  <line x1="100" y1="${sepY}" x2="200" y2="${sepY}" stroke="${p.frame}" stroke-width="0.5" opacity="0.22"/>
  ${venue ? `<text x="150" y="${venY}" text-anchor="middle" font-family="Inter,sans-serif" font-size="8.5" fill="${p.text}" opacity="0.42" letter-spacing="0.4">${venue}</text>` : ''}
  <text x="150" y="${ornY}" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${p.accent}" opacity="0.42">✦</text>
</svg>`
}

// ── Interactions ───────────────────────────────────────────────────────────
function onSearch() {
  currentPage.value = 1
}

function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
}

// ── Date formatting ────────────────────────────────────────────────────────
function formatMonth(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en', { month: 'short' }).toUpperCase()
}

function formatDay(iso) {
  if (!iso) return '—'
  return new Date(iso).getDate()
}

function formatFullDate(iso) {
  if (!iso) return 'Date TBD'
  return new Date(iso).toLocaleDateString('en', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

function goToEvent(id) {
  router.push(`/event/${id}`)
}

watch(currentPage, (n) => {
  router.replace({ query: n > 1 ? { page: n } : {} })
})

watch([activeFilter, activeSort], () => { currentPage.value = 1 })

onMounted(() => {
  const qPage = parseInt(route.query.page)
  if (qPage > 1) currentPage.value = qPage
  loadEvents()
})
</script>

<style scoped>
/* ── Tokens ── */
.me-root {
  --ink: #f0f0ec;
  --ink-soft: #d8d4cd;
  --ink-muted: #8a8a8e;
  --ink-dim: #636366;
  /* Hairlines are light-on-glass rather than flat greys — they have to read
     against whatever the aurora happens to be doing behind them. */
  --line: rgba(255,255,255,0.08);
  --line-soft: rgba(255,255,255,0.04);
  --line-strong: rgba(255,255,255,0.16);
  --paper-soft: rgba(20,20,25,0.35);
  --gold: #C9A84C;
  --emerald: #30D158;
  --emerald-soft: rgba(48,209,88,0.12);

  min-height: 100vh;
  /* flow-root establishes a BFC so the topbar's 16px top margin is contained
     here instead of collapsing through the root and exposing the flat shell
     background as a band at the very top edge. */
  display: flow-root;
  background-color: #040308;
  /* Cosmic nebula base backing — static, sits under the animated orbs. */
  background-image:
    radial-gradient(circle at 80% 20%, rgba(201,168,76,0.08) 0%, transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(6,182,212,0.04) 0%, transparent 40%),
    radial-gradient(140% 120% at 50% 100%, #090815 0%, #030206 100%);
  position: relative;
  overflow: clip; /* clip orb overflow */
  z-index: 1;     /* stacking context so the z-index:-1 orbs stay above the base */

  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif;
  color: var(--ink);
}

/* ── Animated ambient glow ── two slow liquid orbs drifting behind everything.
   `screen` blending keeps them additive over the nebula instead of muddying it. */
.me-root::before,
.me-root::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.85;
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: -1;
  will-change: transform, border-radius;
}

/* Indigo-cyan aurora */
.me-root::before {
  top: -15%;
  left: -5%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle,
    rgba(6,182,212,0.22) 0%,
    rgba(124,58,237,0.08) 55%,
    transparent 100%);
  animation: float-aurora-indigo 26s infinite alternate ease-in-out;
}

/* Fuchsia-gold aurora */
.me-root::after {
  bottom: -15%;
  right: -10%;
  width: 55vw;
  height: 55vw;
  background: radial-gradient(circle,
    rgba(236,72,153,0.18) 0%,
    rgba(201,168,76,0.05) 60%,
    transparent 100%);
  animation: float-aurora-gold 30s infinite alternate ease-in-out;
}

/* The border-radius morph is what makes them read as liquid rather than as a
   blurred circle sliding around. */
@keyframes float-aurora-indigo {
  0%   { transform: translate(0, 0) scale(1) rotate(0deg);          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  33%  { transform: translate(8vw, 6vh) scale(1.15) rotate(120deg); border-radius: 60% 40% 50% 50% / 50% 60% 40% 60%; }
  66%  { transform: translate(-4vw, 10vh) scale(0.9) rotate(240deg);border-radius: 50% 60% 40% 60% / 60% 40% 60% 40%; }
  100% { transform: translate(0, 0) scale(1) rotate(360deg);        border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
}

@keyframes float-aurora-gold {
  0%   { transform: translate(0, 0) scale(1) rotate(0deg);              border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%; }
  33%  { transform: translate(-10vw, -12vh) scale(1.2) rotate(-120deg); border-radius: 30% 70% 60% 40% / 60% 40% 60% 40%; }
  66%  { transform: translate(6vw, 4vh) scale(0.95) rotate(-240deg);    border-radius: 60% 40% 50% 50% / 40% 60% 40% 60%; }
  100% { transform: translate(0, 0) scale(1) rotate(-360deg);           border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .me-root::before,
  .me-root::after { animation: none; }
}

/* ── Topbar — floats as a rounded glass capsule, aligned to the same 1200px
   content column as .me-page so its edges line up with the cards below. The
   outer element is just the width container; the capsule visual lives on
   .me-topbar-inner. ── */
.me-topbar {
  position: sticky;
  top: 16px;
  z-index: 100;
  max-width: 1200px;
  margin: 16px auto 0;
  padding: 0 32px;
  box-sizing: border-box;
}
.me-topbar-inner {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%),
    rgba(14,14,18,0.28);
  backdrop-filter: blur(36px) saturate(190%);
  -webkit-backdrop-filter: blur(36px) saturate(190%);
  border: 1px solid rgba(255,255,255,0.16);
  /* Top inset = the light catching the upper lip of the glass; bottom inset =
     the shaded underside. Both are what sell it as a physical surface. */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.18),
    inset 0 -1px 0 rgba(0,0,0,0.22),
    0 8px 32px rgba(0,0,0,0.35),
    0 20px 48px -12px rgba(0,0,0,0.4);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.me-topbar-inner:hover {
  background:
    linear-gradient(135deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 100%),
    rgba(14,14,18,0.28);
  border-color: rgba(255,255,255,0.22);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 -1px 0 rgba(0,0,0,0.22),
    0 12px 40px rgba(0,0,0,0.45);
}
.me-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.3px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.55);
}

/* ── Create button — neon ──
   Not a solid fill. Three layers stacked read as "lit from within":
     1. a translucent tinted glass body (the aurora shows through it)
     2. a luminous 1px edge, brighter than anything inside the button
     3. a two-stop outer halo — tight + hot, then wide + faint — which is what
        actually makes it glow rather than just sit on a shadow.
   Everything keys off --neon, so recoloring the CTA is a one-line change. */
.me-create-btn {
  --neon: 34, 211, 238;        /* cyan — matches the aurora's indigo-cyan orb */
  --neon-lit: 103, 232, 249;   /* brighter tint for the edge + highlights */

  display: flex;
  align-items: center;
  gap: 7px;
  position: relative;
  background:
    linear-gradient(135deg,
      rgba(var(--neon), 0.30) 0%,
      rgba(var(--neon), 0.14) 55%,
      rgba(var(--neon), 0.20) 100%),
    rgba(8, 24, 32, 0.55);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  color: #eaffff;
  border: 1px solid rgba(var(--neon-lit), 0.75);
  padding: 8px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 220ms cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: 0.1px;
  /* Hold the label on one line — a squeezed flex item wrapping mid-phrase is
     what makes a topbar look mangled at narrow widths. */
  white-space: nowrap;
  flex-shrink: 0;
  text-shadow: 0 0 12px rgba(var(--neon-lit), 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    inset 0 0 18px rgba(var(--neon), 0.22),
    0 0 0 1px rgba(var(--neon), 0.18),
    0 0 18px rgba(var(--neon), 0.38),
    0 0 44px rgba(var(--neon), 0.20);
}
.me-create-btn:hover {
  border-color: rgba(var(--neon-lit), 0.95);
  transform: translateY(-1px);
  background:
    linear-gradient(135deg,
      rgba(var(--neon), 0.42) 0%,
      rgba(var(--neon), 0.20) 55%,
      rgba(var(--neon), 0.28) 100%),
    rgba(8, 24, 32, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    inset 0 0 24px rgba(var(--neon), 0.32),
    0 0 0 1px rgba(var(--neon), 0.28),
    0 0 26px rgba(var(--neon), 0.55),
    0 0 66px rgba(var(--neon), 0.30);
}
/* Pressed = the tube dimming, so the halo contracts rather than the button
   just sliding back down. */
.me-create-btn:active {
  transform: translateY(0);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 0 14px rgba(var(--neon), 0.28),
    0 0 12px rgba(var(--neon), 0.32);
}
.me-create-btn:focus-visible {
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    inset 0 0 18px rgba(var(--neon), 0.22),
    0 0 0 3px rgba(var(--neon), 0.45),
    0 0 26px rgba(var(--neon), 0.5);
}
.me-create-btn--lg { padding: 10px 24px; font-size: 14px; border-radius: 14px; }

/* ── Page shell ── */
.me-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Greeting + stats ── */
.me-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255,255,255,0.14);
}
.me-header-left { display: flex; flex-direction: column; gap: 5px; }
.me-greeting {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 40px;
  font-weight: 400;
  color: var(--ink);
  margin: 0;
  letter-spacing: -1px;
  line-height: 1;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
}
/* Copy sits directly on the aurora, so it carries its own shadow instead of
   relying on a card behind it for contrast. */
.me-subline {
  font-size: 13px;
  color: rgba(255,255,255,0.88);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.7);
}

.me-header-stats {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.me-stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 28px;
}
.me-stat-value {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 38px;
  font-weight: 400;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -1px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.55);
}
.me-stat-value--gold    { color: var(--gold);    text-shadow: 0 0 18px rgba(201,168,76,0.35); }
.me-stat-value--emerald { color: var(--emerald); text-shadow: 0 0 18px rgba(48,209,88,0.35); }
.me-stat-label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.72);
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}
.me-stat-divider {
  width: 1px;
  height: 44px;
  background: rgba(255,255,255,0.16);
  flex-shrink: 0;
}

/* ── Filter bar ── */
.me-filterbar {
  display: flex;
  align-items: center;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%),
    rgba(18,18,22,0.35);
  backdrop-filter: blur(32px) saturate(190%);
  -webkit-backdrop-filter: blur(32px) saturate(190%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 8px 8px 8px 12px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.08),
    0 4px 16px rgba(0,0,0,0.25);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  flex-wrap: wrap;
  gap: 4px;
}
.me-filterbar:hover {
  border-color: rgba(255,255,255,0.18);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 6px 22px rgba(0,0,0,0.3);
}

.me-tabs { display: flex; align-items: center; gap: 2px; }
.me-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  font-family: inherit;
  transition: all 180ms ease;
  white-space: nowrap;
  text-shadow: 0 1px 1px rgba(0,0,0,0.2);
}
.me-tab:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
  transform: translateY(-0.5px);
}
/* Active tab is a raised chip of glass, not just a lighter fill. */
.me-tab--active {
  background:
    linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%),
    rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.15);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 2px 8px rgba(0,0,0,0.2);
  color: #fff;
  font-weight: 600;
}
.me-tab-count {
  font-size: 10.5px;
  font-weight: 600;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  padding: 1px 6px;
  border-radius: 6px;
  transition: all 150ms ease;
}
.me-tab-count--active { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.95); }

.me-fb-divider { width: 1px; height: 26px; background: rgba(255,255,255,0.14); flex-shrink: 0; margin: 0 4px; }

.me-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 160px;
}
.me-search-icon-svg {
  position: absolute;
  left: 11px;
  color: rgba(255,255,255,0.7);
  pointer-events: none;
  flex-shrink: 0;
}
.me-search-input {
  width: 100%;
  padding: 8px 30px 8px 34px;
  border: none;
  background: transparent;
  font-size: 13.5px;
  color: var(--ink);
  outline: none;
  font-family: inherit;
}
.me-search-input::placeholder { color: rgba(255,255,255,0.6); }
.me-search-clear {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ink-dim);
  display: flex;
  align-items: center;
  padding: 2px;
  transition: color 130ms;
}
.me-search-clear:hover { color: var(--ink-muted); }

.me-fb-select {
  padding: 6px 10px;
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  font-family: inherit;
  outline: none;
  cursor: pointer;
  color-scheme: dark;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  transition: all 180ms ease;
}
/* The native popup isn't glass — give its options an opaque surface so they
   stay readable when the control itself is translucent. */
.me-fb-select option { color: #1a1a1a; text-shadow: none; background: #fff; }
.me-fb-select:hover  { border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.08); }
.me-fb-select:focus  { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.09); }

/* ── Owner filter ── */
.me-owner-wrap { position: relative; flex-shrink: 0; }
.me-owner-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,0.85);
  cursor: pointer; font-family: inherit; white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  transition: all 180ms ease;
}
.me-owner-btn:hover { border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.08); color: #fff; }
.me-owner-btn--active {
  border-color: rgba(201,168,76,0.4);
  color: var(--gold);
  background: rgba(201,168,76,0.10);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 10px rgba(201,168,76,0.15);
}
.me-owner-clear {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%;
  background: rgba(255,255,255,0.08); border: none; cursor: pointer;
  color: var(--ink-dim); padding: 0; transition: background 120ms;
}
.me-owner-clear:hover { background: rgba(255,255,255,0.14); color: var(--ink); }
.me-owner-backdrop {
  position: fixed; inset: 0; z-index: 99;
}
.me-owner-drop {
  position: absolute; top: calc(100% + 8px); right: 0;
  width: 240px; z-index: 100;
  /* Opaque body — a menu is a read-and-act surface, so nothing behind it should
     compete with its contents. The glass reads through the sheen, hairline and
     insets instead of through the alpha. */
  background:
    linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.03) 100%),
    rgba(17,17,23,0.985);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 16px; overflow: hidden;
  box-shadow:
    inset 0 1px 1px 0 rgba(255,255,255,0.16),
    inset 0 -1px 0 0 rgba(0,0,0,0.2),
    0 24px 64px rgba(0,0,0,0.62),
    0 4px 12px rgba(0,0,0,0.4);
}
.me-owner-search-wrap {
  position: relative; display: flex; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.me-owner-search {
  width: 100%; padding: 10px 12px 10px 30px;
  background: transparent; border: none; outline: none;
  font-size: 13px; color: var(--ink); font-family: inherit;
}
.me-owner-search::placeholder { color: var(--ink-dim); }
.me-owner-list {
  max-height: 220px; overflow-y: auto; padding: 6px;
}
.me-owner-opt {
  display: flex; align-items: center; gap: 9px; width: 100%;
  padding: 8px 10px; border-radius: 9px; border: none;
  background: transparent; font-size: 13px; color: var(--ink);
  cursor: pointer; font-family: inherit; text-align: left;
  transition: background 110ms;
}
.me-owner-opt:hover { background: rgba(255,255,255,0.05); }
.me-owner-opt--active { background: rgba(201,168,76,0.07); }
.me-owner-avatar {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.2);
  color: var(--gold); font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.me-owner-opt-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.me-owner-empty { margin: 0; padding: 16px 10px; font-size: 12.5px; color: var(--ink-dim); text-align: center; }

/* ── Loading skeletons ── */
.me-skeleton-list { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
.me-skeleton {
  height: 160px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  background: linear-gradient(90deg,
    rgba(255,255,255,0.03) 25%,
    rgba(255,255,255,0.07) 50%,
    rgba(255,255,255,0.03) 75%);
  backdrop-filter: blur(28px) saturate(185%);
  -webkit-backdrop-filter: blur(28px) saturate(185%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty state ── */
.me-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 20px;
  border: 1px dashed rgba(255,255,255,0.18);
  border-radius: 20px;
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.me-empty-glyph {
  font-size: 32px;
  color: var(--gold);
  opacity: 0.6;
  text-shadow: 0 0 24px rgba(201,168,76,0.5);
}
.me-empty-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px;
  color: var(--ink);
  margin: 0;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

/* ── Status pills ── */
.me-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.1px;
  white-space: nowrap;
}
.me-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.me-status-pill--upcoming  { background: var(--paper-soft); color: var(--ink-muted); }
.me-status-pill--upcoming .me-status-dot { background: var(--ink-dim); }
.me-status-pill--ongoing   { background: rgba(201,168,76,0.10); color: #C9A84C; }
.me-status-pill--ongoing .me-status-dot { background: var(--gold); animation: pulse-dot 1.6s ease-in-out infinite; }
.me-status-pill--completed { background: var(--paper-soft); color: var(--ink-dim); }
.me-status-pill--completed .me-status-dot { background: var(--ink-dim); }
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}

/* ── Role badge ── */
.me-role-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
}
.me-role-badge--owner { background: rgba(240,240,236,0.12); border: 1px solid rgba(240,240,236,0.16); color: var(--ink); }
.me-role-badge--admin { background: transparent; border: 1px solid var(--line-strong); color: var(--ink-muted); }

/* ── Code chip ── */
.me-code-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--ink-dim);
  padding: 2px 7px;
  border: 1px solid var(--line);
  border-radius: 5px;
  letter-spacing: 0.3px;
}

/* ── Owner credit ── */
.me-chip-sep {
  color: var(--ink-dim); opacity: 0.35; font-size: 12px; line-height: 1; user-select: none;
}
.me-owner-credit {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500; color: var(--ink-dim);
  background: none; border: none; cursor: pointer; font-family: inherit; padding: 2px 5px 2px 0;
  border-radius: 6px; transition: color 120ms, background 120ms;
}
.me-owner-credit:hover, .me-owner-credit--open {
  color: var(--ink-muted); background: rgba(255,255,255,0.04);
}
.me-owner-credit-av {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  font-size: 7px; font-weight: 800; letter-spacing: 0;
  display: inline-flex; align-items: center; justify-content: center;
}
.me-owner-credit-icon {
  opacity: 0; transition: opacity 120ms; color: var(--ink-dim); flex-shrink: 0;
}
.me-owner-credit:hover .me-owner-credit-icon,
.me-owner-credit--open .me-owner-credit-icon { opacity: 1; }

/* ── Owner swap panel ── */
.me-swap-backdrop { position: fixed; inset: 0; z-index: 9998; }
/* Teleported to <body>, so it can't inherit the page's aurora. Opaque body —
   this panel carries a search field and a list you pick from, and it sits over
   the densest part of the page. */
.me-swap-panel {
  position: fixed; z-index: 9999;
  width: 272px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.03) 100%),
    rgba(17,17,23,0.985);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 16px; overflow: hidden;
  box-shadow:
    inset 0 1px 1px 0 rgba(255,255,255,0.16),
    inset 0 -1px 0 0 rgba(0,0,0,0.2),
    0 24px 64px rgba(0,0,0,0.62),
    0 4px 12px rgba(0,0,0,0.4);
}
.me-swap-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 14px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.me-swap-header-left {
  display: flex; align-items: center; gap: 7px;
  font-size: 12.5px; font-weight: 600; color: var(--ink-soft);
}
.me-swap-close {
  width: 24px; height: 24px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: var(--ink-dim);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: color 120ms; padding: 0; flex-shrink: 0;
}
.me-swap-close:hover { color: var(--ink); }

.me-swap-current {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; background: rgba(201,168,76,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.me-swap-current-label { font-size: 10px; font-weight: 700; color: var(--gold); letter-spacing: 0.8px; text-transform: uppercase; }
.me-swap-current-val { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-muted); }
.me-swap-current-av {
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
  font-size: 8px; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
}

.me-swap-search-wrap { position: relative; border-bottom: 1px solid rgba(255,255,255,0.08); }
.me-swap-search {
  width: 100%; padding: 10px 12px 10px 30px; box-sizing: border-box;
  background: transparent; border: none; outline: none;
  font-size: 13px; color: var(--ink); font-family: inherit;
}
.me-swap-search::placeholder { color: var(--ink-dim); }

.me-swap-list { max-height: 240px; overflow-y: auto; padding: 6px; }
.me-swap-opt {
  display: flex; align-items: center; gap: 9px; width: 100%;
  padding: 8px 10px; border-radius: 9px; border: none;
  background: transparent; cursor: pointer; font-family: inherit;
  text-align: left; transition: background 100ms;
}
.me-swap-opt:hover:not(:disabled):not(.me-swap-opt--current) { background: rgba(255,255,255,0.05); }
.me-swap-opt--current { background: rgba(201,168,76,0.07); cursor: default; }
.me-swap-opt--saving { opacity: 0.5; cursor: not-allowed; }
.me-swap-opt-av {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  font-size: 9px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.me-swap-opt-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.me-swap-opt-name { font-size: 12.5px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.me-swap-opt-email { font-size: 10.5px; color: var(--ink-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.me-swap-empty { margin: 0; padding: 16px 10px; font-size: 12px; color: var(--ink-dim); text-align: center; }
.me-swap-loading {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 20px 10px; font-size: 12.5px; color: var(--ink-dim);
}
@keyframes me-spin { to { transform: rotate(360deg); } }
.me-swap-spinner { animation: me-spin 0.8s linear infinite; }

.me-swap-enter-active { transition: opacity 130ms, transform 130ms; }
.me-swap-leave-active { transition: opacity 100ms; }
.me-swap-enter-from   { opacity: 0; transform: translateY(-5px) scale(0.97); }
.me-swap-leave-to     { opacity: 0; }

/* ── List wrapper (section head + tiles share same 8px gap) ── */
.me-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Section heading ── */
.me-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.me-section-sparkle { font-size: 10px; color: var(--gold); flex-shrink: 0; }
.me-section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--line-strong), transparent);
}
.me-section-meta { font-size: 12px; color: var(--ink-dim); font-weight: 500; white-space: nowrap; }

/* ── Hanging rows ── */
.me-hanging-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Rows are glass over the aurora rather than opaque panels — the orbs drift
   through them, which is what keeps the list feeling like one lit surface. */
.me-row {
  position: relative;
  display: grid;
  grid-template-columns: 118px 1fr 110px;
  gap: 0;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 4px solid rgba(255,255,255,0.12);
  background:
    linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.005) 60%, rgba(255,255,255,0.02) 100%),
    rgba(18,18,22,0.32);
  backdrop-filter: blur(28px) saturate(185%);
  -webkit-backdrop-filter: blur(28px) saturate(185%);
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    0 2px 8px rgba(0,0,0,0.3),
    0 8px 24px -4px rgba(0,0,0,0.25);
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 124px;
  overflow: hidden;
}
.me-row--upcoming  { border-left-color: rgba(201,168,76,0.75); }
.me-row--ongoing   { border-left-color: rgba(48,209,88,0.85); }
.me-row--completed { border-left-color: rgba(255,255,255,0.10); }
.me-row:hover {
  border-color: rgba(255,255,255,0.18);
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.10),
    0 12px 40px rgba(0,0,0,0.55);
  transform: translateY(-2px) scale(1.003);
  filter: brightness(1.04);
}


/* Row thumb col */
.me-row-thumb-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 0 14px 14px;
}
.me-row-thumb {
  width: 100%;
  border-radius: 7px;
  overflow: hidden;
  transform: rotate(-2deg);
  box-shadow: 0 3px 10px rgba(0,0,0,0.35);
  line-height: 0;
  transition: transform 0.35s cubic-bezier(.2,.7,.2,1), filter 0.35s cubic-bezier(.2,.7,.2,1);
  filter: brightness(0.72) saturate(0.85);
}
.me-row:hover .me-row-thumb { transform: rotate(-1deg); filter: brightness(0.82) saturate(0.9); }
.me-row-thumb :deep(svg) { display: block; width: 100%; height: auto; }

/* Row body col */
.me-row-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  justify-content: center;
  min-width: 0;
  padding: 18px 22px;
}
.me-row-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.me-row-eyebrow-spark { font-size: 10px; color: var(--gold); flex-shrink: 0; }
.me-row-eyebrow-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(201,168,76,0.25) 0%, rgba(255,255,255,0.04) 100%);
}
.me-row-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.me-row-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px;
  font-weight: 400;
  color: var(--ink);
  margin: 0 0 10px;
  letter-spacing: -0.4px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.me-row-meta { display: flex; flex-wrap: wrap; gap: 4px 12px; }
.me-row-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--ink-dim);
}
.me-row-meta-item svg { flex-shrink: 0; }
.me-row-progress { margin-top: 10px; }
.me-row-progress-track { height: 3px; background: var(--line); border-radius: 3px; overflow: hidden; }
.me-row-progress-fill { height: 100%; background: var(--ink-soft); border-radius: 3px; }

/* Row countdown col */
.me-row-cd {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 1px solid rgba(255,255,255,0.05);
  padding: 14px 10px;
  gap: 0;
}
.me-row-cd-month {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ink-dim);
  line-height: 1;
  margin-bottom: 2px;
}
.me-row-cd-day {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 60px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -3px;
  line-height: 0.85;
  display: block;
  text-shadow: 0 2px 10px rgba(0,0,0,0.45);
}
.me-row-cd-year {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: var(--ink-dim);
  margin-top: 4px;
  margin-bottom: 10px;
}
.me-row-cd-ticket {
  background: transparent;
  border: 1px dashed rgba(255,255,255,0.18);
  border-radius: 6px;
  padding: 4px 9px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--ink-dim);
  text-align: center;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  margin-bottom: 10px;
  width: max-content;
}
.me-row-cd-ticket--live {
  border-style: solid;
  border-color: rgba(48,209,88,0.4);
  background: var(--emerald-soft);
  color: var(--emerald);
}
.me-row-cd-ticket--soon {
  border-color: rgba(201,168,76,0.35);
  color: rgba(201,168,76,0.85);
}
.me-live-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--emerald);
  animation: pulse-dot 1.6s ease-in-out infinite;
  flex-shrink: 0;
}
.me-row-manage-btn {
  background: transparent;
  border: 1px solid var(--line-strong);
  color: var(--ink-muted);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 200ms, color 200ms, border-color 200ms;
  white-space: nowrap;
}
.me-row:hover .me-row-manage-btn {
  background: rgba(240,240,236,0.10);
  border-color: rgba(240,240,236,0.16);
  color: var(--ink);
}

/* ── Pagination ── */
.me-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
}
.me-pagination-info { font-size: 13px; color: var(--ink-muted); }
.me-pagination-controls { display: flex; align-items: center; gap: 4px; }
.me-page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-family: inherit;
  transition: all 180ms ease;
}
.me-page-btn:hover:not(:disabled):not(.me-page-btn--active) {
  border-color: rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.me-page-btn--active {
  background:
    linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%),
    rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 2px 8px rgba(0,0,0,0.2);
  color: #fff;
  font-weight: 700;
}
.me-page-btn--nav { color: var(--ink-dim); }
.me-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.me-page-ellipsis {
  width: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--ink-dim);
  user-select: none;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .me-row { grid-template-columns: 100px 1fr 100px; }
  .me-row-cd-day { font-size: 48px; }
}
@media (max-width: 860px) {
  .me-page { padding: 20px 20px 60px; }
  .me-greeting { font-size: 30px; }
  .me-row { grid-template-columns: 90px 1fr; }
  .me-row-cd { display: none; }
}
@media (max-width: 600px) {
  .me-topbar-inner { padding: 12px 16px; }
  .me-page { padding: 16px 16px 48px; }
  .me-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .me-filterbar { padding: 6px 8px; }
  .me-tabs { gap: 0; }
  .me-tab { padding: 6px 10px; font-size: 12px; }
  .me-row { grid-template-columns: 80px 1fr; }
  .me-row-title { font-size: 18px; }
}
</style>
