<template>
  <div class="mv-root">

    <!-- Topbar -->
    <nav class="mv-topbar">
      <div class="mv-topbar-inner">
        <span class="mv-page-title">Messaging</span>
      </div>
    </nav>

    <div class="mv-page">

      <!-- Filter bar -->
      <div class="mv-filterbar">

        <!-- Row 1: presets + channel + view mode -->
        <div class="mv-filterbar-row">
          <div class="mv-preset-chips">
            <button
              v-for="p in presets" :key="p.key"
              :class="['mv-preset-chip', selectedPreset === p.key && 'mv-preset-chip--on']"
              @click="applyPreset(p.key)"
            >{{ p.label }}</button>
          </div>
          <div class="mv-fb-div" />
          <div class="mv-channel-chips">
            <button
              v-for="c in channelOptions" :key="c.value"
              :class="['mv-preset-chip', channelFilter === c.value && 'mv-preset-chip--on']"
              @click="channelFilter = c.value"
            >{{ c.label }}</button>
          </div>
          <div class="mv-fb-div" />
          <div class="mv-view-chips">
            <button :class="['mv-preset-chip', viewMode === 'logs' && 'mv-preset-chip--on']" @click="viewMode = 'logs'">Logs</button>
            <button :class="['mv-preset-chip', viewMode === 'dispatchers' && 'mv-preset-chip--on']" @click="viewMode = 'dispatchers'">By Dispatcher</button>
            <button :class="['mv-preset-chip', viewMode === 'events' && 'mv-preset-chip--on']" @click="viewMode = 'events'">By Event</button>
          </div>
        </div>

        <!-- Row 2: date range + user filter + apply -->
        <div class="mv-filterbar-row mv-filterbar-row--sub">
          <div class="mv-sub-field">
            <label class="mv-sub-label">From</label>
            <input class="mv-sub-input" type="datetime-local" v-model="fromDate" @change="selectedPreset = 'custom'" />
          </div>
          <svg class="mv-date-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          <div class="mv-sub-field">
            <label class="mv-sub-label">To</label>
            <input class="mv-sub-input" type="datetime-local" v-model="toDate" @change="selectedPreset = 'custom'" />
          </div>
          <div class="mv-fb-div" />
          <div class="mv-sub-field" style="position:relative">
            <label class="mv-sub-label">User</label>
            <!-- Selected pill -->
            <div v-if="selectedUser" class="mv-user-pill">
              <span class="mv-user-pill-name">{{ fullName(selectedUser) }}</span>
              <button class="mv-user-pill-clear" @click="clearUser">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <!-- Search input -->
            <div v-else class="mv-user-search-wrap">
              <svg class="mv-sub-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                class="mv-sub-input mv-sub-input--search"
                v-model="userSearchQuery"
                placeholder="Search user…"
                @focus="userDropOpen = true"
                @blur="onUserBlur"
                autocomplete="off"
              />
            </div>
            <!-- Suggestions dropdown -->
            <div v-if="userDropOpen && userSuggestions.length > 0" class="mv-user-drop">
              <button
                v-for="u in userSuggestions" :key="u.id"
                class="mv-user-opt"
                @mousedown.prevent="selectUser(u)"
              >
                <span class="mv-user-opt-name">{{ fullName(u) }}</span>
                <span class="mv-user-opt-email">{{ u.email || u.phoneNumber || '' }}</span>
              </button>
            </div>
          </div>
          <button class="mv-apply-btn" :disabled="loading" @click="fetchLogs">
            <svg v-if="!loading" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>{{ loading ? 'Loading…' : 'Apply' }}</span>
          </button>
        </div>

      </div>

      <!-- Stats strip -->
      <div class="mv-stats">
        <div class="mv-stat">
          <span class="mv-stat-num">{{ totalMessages }}</span>
          <span class="mv-stat-label">Total Messages</span>
        </div>
        <div class="mv-stat-div" />
        <div class="mv-stat">
          <span class="mv-stat-num">{{ smsCount }}</span>
          <span class="mv-stat-label">SMS</span>
        </div>
        <div class="mv-stat-div" />
        <div class="mv-stat">
          <span class="mv-stat-num">{{ whatsappCount }}</span>
          <span class="mv-stat-label">WhatsApp</span>
        </div>
        <div class="mv-stat-div" />
        <div class="mv-stat">
          <span class="mv-stat-num mv-stat-num--gold">{{ formatBalance(smsRevenue) }}</span>
          <span class="mv-stat-label">SMS Revenue</span>
        </div>
        <div class="mv-stat-div" />
        <div class="mv-stat">
          <span class="mv-stat-num mv-stat-num--gold">{{ formatBalance(whatsappRevenue) }}</span>
          <span class="mv-stat-label">WhatsApp Revenue</span>
        </div>
        <div class="mv-stat-div" />
        <div class="mv-stat">
          <span class="mv-stat-num mv-stat-num--gold">{{ formatBalance(totalRevenue) }}</span>
          <span class="mv-stat-label">Total Revenue</span>
        </div>
      </div>

      <!-- ── MESSAGE LOGS VIEW ── -->
      <template v-if="viewMode === 'logs'">

        <!-- Initial prompt -->
        <div v-if="!hasFetched && !loading" class="mv-prompt">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="color:var(--ink-dim)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.38 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <p class="mv-prompt-title">Select a date range and press Apply</p>
          <p class="mv-prompt-sub">Message logs will appear here.</p>
        </div>

        <!-- Loading skeletons -->
        <div v-else-if="loading" class="mv-skeleton-list">
          <div class="mv-skeleton" v-for="i in 6" :key="i" />
        </div>

        <!-- Empty -->
        <div v-else-if="hasFetched && filtered.length === 0" class="mv-empty">
          <span class="mv-empty-glyph">✦</span>
          <p class="mv-empty-title">No messages in this range</p>
          <p class="mv-empty-sub">Try widening the date range or changing the filters.</p>
        </div>

        <!-- Table -->
        <div v-else class="mv-table-wrap">
          <table class="mv-table">
            <thead>
              <tr>
                <th class="mv-th">Time</th>
                <th class="mv-th">Channel</th>
                <th class="mv-th">Campaign</th>
                <th class="mv-th">Event</th>
                <th class="mv-th">Author</th>
                <th class="mv-th">Dispatched By</th>
                <th class="mv-th mv-th--right">Charged</th>
                <th class="mv-th">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in paginated" :key="log.id" class="mv-row">
                <td class="mv-td mv-td--date">{{ formatLogDate(log.timestamp) }}</td>
                <td class="mv-td">
                  <span :class="['mv-channel-badge', `mv-channel-badge--${log.channel}`]">
                    {{ log.channel === 'sms'
                        ? (resolveSegments(log) > 1 ? `SMS ×${resolveSegments(log)}` : 'SMS')
                        : 'WhatsApp' }}
                  </span>
                </td>
                <td class="mv-td">
                  <span class="mv-campaign-label">{{ campaignLabel(log.type) }}</span>
                </td>
                <td class="mv-td mv-td--event" :title="log.eventId">{{ eventMap[log.eventId] ?? (log.eventId ? log.eventId.slice(0, 10) + '…' : '—') }}</td>
                <td class="mv-td">{{ userLabel(log.authorId) }}</td>
                <td class="mv-td mv-td--muted">{{ userLabel(log.dispatchedBy) }}</td>
                <td class="mv-td mv-td--right">
                  <span v-if="log.chargeAmount > 0" class="mv-charge">{{ formatBalance(log.chargeAmount) }}</span>
                  <span v-else class="mv-charge mv-charge--free">Quota</span>
                </td>
                <td class="mv-td">
                  <span :class="['mv-status-badge', `mv-status-badge--${log.status}`]">{{ log.status ?? '—' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && totalPages > 1" class="mv-pagination">
          <span class="mv-pagination-info">
            Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filtered.length) }} of {{ filtered.length }}
          </span>
          <div class="mv-pagination-controls">
            <button class="mv-page-btn mv-page-btn--nav" :disabled="currentPage === 1" @click="currentPage--">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <template v-for="p in pageNumbers" :key="p">
              <span v-if="p === '…'" class="mv-page-ellipsis">…</span>
              <button v-else class="mv-page-btn" :class="{ 'mv-page-btn--active': p === currentPage }" @click="currentPage = p">{{ p }}</button>
            </template>
            <button class="mv-page-btn mv-page-btn--nav" :disabled="currentPage === totalPages" @click="currentPage++">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

      </template>

      <!-- ── BY DISPATCHER VIEW ── -->
      <template v-else-if="viewMode === 'dispatchers'">

        <!-- Initial prompt -->
        <div v-if="!hasFetched && !loading" class="mv-prompt">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="color:var(--ink-dim)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <p class="mv-prompt-title">Select a date range and press Apply</p>
          <p class="mv-prompt-sub">Dispatcher breakdown will appear here.</p>
        </div>

        <!-- Loading -->
        <div v-else-if="loading" class="mv-skeleton-list">
          <div class="mv-skeleton" v-for="i in 4" :key="i" />
        </div>

        <!-- Empty -->
        <div v-else-if="sortedDispatchers.length === 0" class="mv-empty">
          <span class="mv-empty-glyph">✦</span>
          <p class="mv-empty-title">No dispatchers in this range</p>
          <p class="mv-empty-sub">Try widening the date range or changing the filters.</p>
        </div>

        <!-- Dispatcher leaderboard -->
        <div v-else class="mv-table-wrap">
          <table class="mv-table">
            <thead>
              <tr>
                <th class="mv-th" style="width:44px">#</th>
                <th class="mv-th mv-th--sortable" @click="toggleSort('name')">
                  Dispatcher
                  <svg class="mv-sort-icon" :class="dispatcherSortKey === 'name' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="dispatcherSortKey === 'name' && dispatcherSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleSort('messages')">
                  Messages
                  <svg class="mv-sort-icon" :class="dispatcherSortKey === 'messages' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="dispatcherSortKey === 'messages' && dispatcherSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleSort('sms')">
                  SMS
                  <svg class="mv-sort-icon" :class="dispatcherSortKey === 'sms' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="dispatcherSortKey === 'sms' && dispatcherSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleSort('whatsapp')">
                  WhatsApp
                  <svg class="mv-sort-icon" :class="dispatcherSortKey === 'whatsapp' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="dispatcherSortKey === 'whatsapp' && dispatcherSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleSort('smsRev')">
                  SMS Rev
                  <svg class="mv-sort-icon" :class="dispatcherSortKey === 'smsRev' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="dispatcherSortKey === 'smsRev' && dispatcherSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleSort('waRev')">
                  WA Rev
                  <svg class="mv-sort-icon" :class="dispatcherSortKey === 'waRev' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="dispatcherSortKey === 'waRev' && dispatcherSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleSort('totalRev')">
                  Total Rev
                  <svg class="mv-sort-icon" :class="dispatcherSortKey === 'totalRev' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="dispatcherSortKey === 'totalRev' && dispatcherSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in sortedDispatchers" :key="d.uid" :class="['mv-row', i === 0 && 'mv-row--top']">
                <td class="mv-td mv-td--rank">
                  <span :class="['mv-rank', i === 0 && 'mv-rank--gold']">{{ i + 1 }}</span>
                </td>
                <td class="mv-td">
                  <span class="mv-dispatcher-name">{{ d.name }}</span>
                </td>
                <td class="mv-td mv-td--right mv-td--num">{{ d.messages.toLocaleString() }}</td>
                <td class="mv-td mv-td--right mv-td--muted">{{ d.sms.toLocaleString() }}</td>
                <td class="mv-td mv-td--right mv-td--muted">{{ d.whatsapp.toLocaleString() }}</td>
                <td class="mv-td mv-td--right">
                  <span v-if="d.smsRev > 0" class="mv-charge">{{ formatBalance(d.smsRev) }}</span>
                  <span v-else class="mv-charge mv-charge--free">—</span>
                </td>
                <td class="mv-td mv-td--right">
                  <span v-if="d.waRev > 0" class="mv-charge">{{ formatBalance(d.waRev) }}</span>
                  <span v-else class="mv-charge mv-charge--free">—</span>
                </td>
                <td class="mv-td mv-td--right mv-td--num">
                  <span v-if="d.totalRev > 0" class="mv-charge mv-charge--gold">{{ formatBalance(d.totalRev) }}</span>
                  <span v-else class="mv-charge mv-charge--free">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>

      <!-- ── BY EVENT VIEW ── -->
      <template v-else-if="viewMode === 'events'">

        <!-- Initial prompt -->
        <div v-if="!hasFetched && !loading" class="mv-prompt">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="color:var(--ink-dim)"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p class="mv-prompt-title">Select a date range and press Apply</p>
          <p class="mv-prompt-sub">Event breakdown will appear here.</p>
        </div>

        <!-- Loading -->
        <div v-else-if="loading" class="mv-skeleton-list">
          <div class="mv-skeleton" v-for="i in 4" :key="i" />
        </div>

        <!-- Empty -->
        <div v-else-if="sortedEvents.length === 0" class="mv-empty">
          <span class="mv-empty-glyph">✦</span>
          <p class="mv-empty-title">No events in this range</p>
          <p class="mv-empty-sub">Try widening the date range or changing the filters.</p>
        </div>

        <!-- Event leaderboard -->
        <div v-else class="mv-table-wrap">
          <table class="mv-table">
            <thead>
              <tr>
                <th class="mv-th" style="width:44px">#</th>
                <th class="mv-th mv-th--sortable" @click="toggleEventSort('title')">
                  Event
                  <svg class="mv-sort-icon" :class="eventSortKey === 'title' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="eventSortKey === 'title' && eventSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleEventSort('messages')">
                  Messages
                  <svg class="mv-sort-icon" :class="eventSortKey === 'messages' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="eventSortKey === 'messages' && eventSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleEventSort('sms')">
                  SMS
                  <svg class="mv-sort-icon" :class="eventSortKey === 'sms' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="eventSortKey === 'sms' && eventSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleEventSort('whatsapp')">
                  WhatsApp
                  <svg class="mv-sort-icon" :class="eventSortKey === 'whatsapp' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="eventSortKey === 'whatsapp' && eventSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleEventSort('smsRev')">
                  SMS Rev
                  <svg class="mv-sort-icon" :class="eventSortKey === 'smsRev' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="eventSortKey === 'smsRev' && eventSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleEventSort('waRev')">
                  WA Rev
                  <svg class="mv-sort-icon" :class="eventSortKey === 'waRev' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="eventSortKey === 'waRev' && eventSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
                <th class="mv-th mv-th--sortable mv-th--right" @click="toggleEventSort('totalRev')">
                  Total Rev
                  <svg class="mv-sort-icon" :class="eventSortKey === 'totalRev' && 'mv-sort-icon--on'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline :points="eventSortKey === 'totalRev' && eventSortDir === 'asc' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                  </svg>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(e, i) in sortedEvents" :key="e.eid" :class="['mv-row', i === 0 && 'mv-row--top']">
                <td class="mv-td mv-td--rank">
                  <span :class="['mv-rank', i === 0 && 'mv-rank--gold']">{{ i + 1 }}</span>
                </td>
                <td class="mv-td mv-td--event-title" :title="e.eid">
                  <span class="mv-dispatcher-name">{{ e.title }}</span>
                </td>
                <td class="mv-td mv-td--right mv-td--num">{{ e.messages.toLocaleString() }}</td>
                <td class="mv-td mv-td--right mv-td--muted">{{ e.sms.toLocaleString() }}</td>
                <td class="mv-td mv-td--right mv-td--muted">{{ e.whatsapp.toLocaleString() }}</td>
                <td class="mv-td mv-td--right">
                  <span v-if="e.smsRev > 0" class="mv-charge">{{ formatBalance(e.smsRev) }}</span>
                  <span v-else class="mv-charge mv-charge--free">—</span>
                </td>
                <td class="mv-td mv-td--right">
                  <span v-if="e.waRev > 0" class="mv-charge">{{ formatBalance(e.waRev) }}</span>
                  <span v-else class="mv-charge mv-charge--free">—</span>
                </td>
                <td class="mv-td mv-td--right mv-td--num">
                  <span v-if="e.totalRev > 0" class="mv-charge mv-charge--gold">{{ formatBalance(e.totalRev) }}</span>
                  <span v-else class="mv-charge mv-charge--free">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import {
  collection, getDocs, query,
  where, orderBy, limit, Timestamp, doc, getDoc,
} from 'firebase/firestore'

const PAGE_SIZE = 25

// ── Date helpers ──────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }
function toLocalDT(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── State ─────────────────────────────────────────────────────────────────
const logs        = ref([])
const users       = ref([])
const eventMap    = ref({})
const loading     = ref(false)
const hasFetched  = ref(false)
const currentPage = ref(1)

const selectedPreset   = ref('today')
const channelFilter    = ref('')
const userFilter       = ref('')
const userSearchQuery  = ref('')
const userDropOpen     = ref(false)
const selectedUser     = ref(null)

const viewMode           = ref('logs')
const dispatcherSortKey  = ref('messages')
const dispatcherSortDir  = ref('desc')
const eventSortKey       = ref('messages')
const eventSortDir       = ref('desc')

const userSuggestions = computed(() => {
  const q = userSearchQuery.value.trim().toLowerCase()
  if (!q) return []
  return users.value.filter(u =>
    fullName(u).toLowerCase().includes(q) ||
    (u.email || '').toLowerCase().includes(q) ||
    (u.phoneNumber || '').includes(q)
  ).slice(0, 6)
})

function selectUser(u) {
  selectedUser.value  = u
  userFilter.value    = u.id
  userSearchQuery.value = ''
  userDropOpen.value  = false
}

function clearUser() {
  selectedUser.value    = null
  userFilter.value      = ''
  userSearchQuery.value = ''
}

function onUserBlur() {
  setTimeout(() => { userDropOpen.value = false }, 150)
}

const now = new Date()
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
const fromDate = ref(toLocalDT(startOfToday))
const toDate   = ref(toLocalDT(now))

// ── Presets ───────────────────────────────────────────────────────────────
const presets = [
  { key: 'today',     label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d',        label: 'Last 7 days' },
  { key: '30d',       label: 'Last 30 days' },
]

const channelOptions = [
  { value: '',          label: 'All' },
  { value: 'sms',       label: 'SMS' },
  { value: 'whatsapp',  label: 'WhatsApp' },
]

function applyPreset(key) {
  selectedPreset.value = key
  const n = new Date()
  const sod = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0)
  if (key === 'today') {
    fromDate.value = toLocalDT(sod)
    toDate.value   = toLocalDT(n)
  } else if (key === 'yesterday') {
    const ys = new Date(sod); ys.setDate(ys.getDate() - 1)
    const ye = new Date(sod); ye.setSeconds(-1)
    fromDate.value = toLocalDT(ys)
    toDate.value   = toLocalDT(ye)
  } else if (key === '7d') {
    const s = new Date(n); s.setDate(s.getDate() - 7)
    fromDate.value = toLocalDT(s)
    toDate.value   = toLocalDT(n)
  } else if (key === '30d') {
    const s = new Date(n); s.setDate(s.getDate() - 30)
    fromDate.value = toLocalDT(s)
    toDate.value   = toLocalDT(n)
  }
}

// ── Fetch ─────────────────────────────────────────────────────────────────
async function fetchLogs() {
  loading.value = true
  try {
    const from = Timestamp.fromDate(new Date(fromDate.value))
    const to   = Timestamp.fromDate(new Date(toDate.value))

    const snap = await getDocs(
      query(
        collection(db, 'messageLogs'),
        where('timestamp', '>=', from),
        where('timestamp', '<=', to),
        orderBy('timestamp', 'desc'),
        limit(1000)
      )
    )
    logs.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    hasFetched.value = true
    currentPage.value = 1
    fetchEventTitles(logs.value)
  } finally {
    loading.value = false
  }
}

async function fetchEventTitles(logList) {
  const ids = [...new Set(logList.map(l => l.eventId).filter(Boolean))]
  if (!ids.length) return
  const map = { ...eventMap.value }
  const missing = ids.filter(id => !map[id])
  if (!missing.length) return
  // Firestore 'in' limit is 30 — chunk it
  const chunks = []
  for (let i = 0; i < missing.length; i += 30) chunks.push(missing.slice(i, i + 30))
  await Promise.all(chunks.map(async chunk => {
    const snap = await getDocs(query(collection(db, 'events'), where('__name__', 'in', chunk)))
    snap.docs.forEach(d => { map[d.id] = d.data().title ?? d.id })
  }))
  eventMap.value = map
}

async function fetchUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'))
    users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch { /* silent */ }
}

onMounted(() => {
  fetchUsers()
  fetchLogs()
})

// ── Computed ──────────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = logs.value
  if (channelFilter.value) list = list.filter(l => l.channel === channelFilter.value)
  if (userFilter.value)    list = list.filter(l => l.authorId === userFilter.value || l.dispatchedBy === userFilter.value)
  return list
})

function resolveSegments(log) {
  if (log.segments != null) return log.segments
  if (log.chargeAmount > 0 && log.baseSMSCharge > 0) return Math.round(log.chargeAmount / log.baseSMSCharge)
  return 1
}
const smsCount = computed(() => filtered.value.filter(l => l.channel === 'sms').reduce((sum, l) => sum + resolveSegments(l), 0))
const whatsappCount = computed(() => filtered.value.filter(l => l.channel === 'whatsapp').length)
const smsRevenue      = computed(() => filtered.value.filter(l => l.channel === 'sms').reduce((sum, l) => sum + (l.chargeAmount ?? 0), 0))
const whatsappRevenue = computed(() => filtered.value.filter(l => l.channel === 'whatsapp').reduce((sum, l) => sum + (l.chargeAmount ?? 0), 0))
const totalRevenue    = computed(() => smsRevenue.value + whatsappRevenue.value)
const totalMessages = computed(() => smsCount.value + whatsappCount.value)

const groupedByDispatcher = computed(() => {
  const map = {}
  const um = userMap.value
  for (const log of filtered.value) {
    const uid = log.dispatchedBy ?? '__unknown__'
    if (!map[uid]) {
      const u = um[uid]
      const name = u ? fullName(u) : (uid === '__unknown__' ? 'Unknown' : uid.slice(0, 10) + '…')
      map[uid] = { uid, name, messages: 0, sms: 0, whatsapp: 0, smsRev: 0, waRev: 0, totalRev: 0 }
    }
    const entry = map[uid]
    if (log.channel === 'sms') {
      const segs = resolveSegments(log)
      entry.messages += segs
      entry.sms += segs
      entry.smsRev += log.chargeAmount ?? 0
    } else {
      entry.messages += 1
      entry.whatsapp += 1
      entry.waRev += log.chargeAmount ?? 0
    }
    entry.totalRev += log.chargeAmount ?? 0
  }
  return Object.values(map)
})

const sortedDispatchers = computed(() => {
  const list = [...groupedByDispatcher.value]
  const key = dispatcherSortKey.value
  const dir = dispatcherSortDir.value === 'asc' ? 1 : -1
  list.sort((a, b) => {
    if (key === 'name') return dir * a.name.localeCompare(b.name)
    return dir * ((a[key] ?? 0) - (b[key] ?? 0))
  })
  return list
})

function toggleSort(key) {
  if (dispatcherSortKey.value === key) {
    dispatcherSortDir.value = dispatcherSortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    dispatcherSortKey.value = key
    dispatcherSortDir.value = 'desc'
  }
}

const groupedByEvent = computed(() => {
  const map = {}
  const em = eventMap.value
  for (const log of filtered.value) {
    const eid = log.eventId ?? '__unknown__'
    if (!map[eid]) {
      const title = em[eid] ?? (eid === '__unknown__' ? 'Unknown Event' : eid.slice(0, 10) + '…')
      map[eid] = { eid, title, messages: 0, sms: 0, whatsapp: 0, smsRev: 0, waRev: 0, totalRev: 0 }
    }
    const entry = map[eid]
    if (log.channel === 'sms') {
      const segs = resolveSegments(log)
      entry.messages += segs
      entry.sms += segs
      entry.smsRev += log.chargeAmount ?? 0
    } else {
      entry.messages += 1
      entry.whatsapp += 1
      entry.waRev += log.chargeAmount ?? 0
    }
    entry.totalRev += log.chargeAmount ?? 0
  }
  return Object.values(map)
})

const sortedEvents = computed(() => {
  const list = [...groupedByEvent.value]
  const key = eventSortKey.value
  const dir = eventSortDir.value === 'asc' ? 1 : -1
  list.sort((a, b) => {
    if (key === 'title') return dir * a.title.localeCompare(b.title)
    return dir * ((a[key] ?? 0) - (b[key] ?? 0))
  })
  return list
})

function toggleEventSort(key) {
  if (eventSortKey.value === key) {
    eventSortDir.value = eventSortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    eventSortKey.value = key
    eventSortDir.value = 'desc'
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paginated  = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set    = new Set([1, total, cur, cur - 1, cur + 1].filter(p => p >= 1 && p <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…')
    result.push(sorted[i])
  }
  return result
})

// ── Helpers ───────────────────────────────────────────────────────────────
const userMap = computed(() => {
  const m = {}
  for (const u of users.value) m[u.id] = u
  return m
})

function fullName(u) {
  return [(u?.firstName || ''), (u?.lastName || '')].filter(Boolean).join(' ') || 'Unnamed'
}

function userLabel(uid) {
  if (!uid) return '—'
  const u = userMap.value[uid]
  return u ? fullName(u) : uid.slice(0, 10) + '…'
}

function formatBalance(n) {
  if (n == null || n === 0) return 'TZS 0'
  return 'TZS ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatLogDate(ts) {
  if (!ts) return '—'
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '—' }
}

const CAMPAIGN_LABELS = {
  'haflaway-invitation-campaign':           'Invitation',
  'haflaway-invitation-reminder-campaign':  'Reminder',
  'haflaway-contribution-campaign':         'Contribution',
  'haflaway-save-the-date-campaign':        'Save the Date',
  'haflaway-invitation-gratitude-campaign': 'Thank You',
}
function campaignLabel(type) {
  return CAMPAIGN_LABELS[type] ?? type ?? '—'
}
</script>

<style scoped>
/* ── Tokens ── */
.mv-root {
  --ink: #e2e8f0;
  --ink-soft: #cbd5e1;
  --ink-muted: #8892a4;
  --ink-dim: #4f617a;
  --line: #1e2d44;
  --line-soft: #1a2a3e;
  --line-strong: #2a3a52;
  --paper-soft: #111827;
  --gold: #C9A84C;
  --gold-bg: rgba(201,168,76,0.08);
  --gold-border: rgba(201,168,76,0.25);
  --gold-text: #C9A84C;
  min-height: 100vh;
  background: #0a0e1c;
  font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif;
  color: var(--ink);
}

/* ── Topbar ── */
.mv-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,14,28,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.mv-topbar-inner {
  max-width: 1300px; margin: 0 auto; padding: 28px 32px;
  display: flex; align-items: center;
}
.mv-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px;
}

/* ── Page shell ── */
.mv-page {
  max-width: 1300px; margin: 0 auto;
  padding: 28px 32px 80px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Filter bar ── */
.mv-filterbar {
  display: flex; flex-direction: column; gap: 0;
  background: #111827; border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.2);
}
.mv-filterbar-row {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px; flex-wrap: wrap;
}
.mv-filterbar-row--sub {
  border-top: 1px solid var(--line);
  background: #0f1729;
  padding: 10px 16px;
  border-radius: 0 0 14px 14px;
}
.mv-fb-div { width: 1px; height: 24px; background: var(--line-strong); flex-shrink: 0; }
.mv-filterbar-row--sub .mv-fb-div { align-self: flex-end; margin-bottom: 5px; }

/* Preset + channel chips */
.mv-preset-chips, .mv-channel-chips { display: flex; align-items: center; gap: 4px; }
.mv-preset-chip {
  padding: 5px 12px; border-radius: 20px; border: 1px solid var(--line-strong);
  background: transparent; color: var(--ink-muted); font-size: 12.5px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: all 130ms; white-space: nowrap;
}
.mv-preset-chip:hover { background: rgba(255,255,255,0.06); color: var(--ink); }
.mv-preset-chip--on { background: rgba(226,232,240,0.12); color: #e2e8f0; border-color: rgba(226,232,240,0.16); }

/* Row 2 inputs */
.mv-date-arrow { color: var(--ink-dim); flex-shrink: 0; margin: 0 2px; }
.mv-sub-field { display: flex; flex-direction: column; gap: 2px; }
.mv-sub-label {
  font-size: 9.5px; font-weight: 700; color: var(--ink-dim);
  text-transform: uppercase; letter-spacing: 0.8px;
}
.mv-sub-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  color: var(--ink-dim); pointer-events: none;
}
.mv-sub-input {
  background: #0a0e1c; border: 1.5px solid #2a3a52;
  border-radius: 9px; padding: 7px 11px; font-size: 12.5px; color: var(--ink);
  font-family: inherit; outline: none; transition: border-color 150ms, box-shadow 150ms;
  color-scheme: dark;
}
.mv-sub-input:focus { border-color: var(--gold-text); box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
.mv-sub-input--search { padding-left: 30px; min-width: 170px; }

/* User typeahead */
.mv-user-search-wrap { position: relative; display: flex; align-items: center; }
.mv-user-drop {
  position: absolute; top: calc(100% + 4px); left: 0; z-index: 500;
  background: #111827; border: 1.5px solid #2a3a52; border-radius: 11px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5); overflow: hidden;
  min-width: 220px; max-height: 220px; overflow-y: auto;
}
.mv-user-opt {
  width: 100%; display: flex; flex-direction: column; gap: 1px;
  padding: 9px 13px; border: none; background: transparent;
  text-align: left; cursor: pointer; transition: background 100ms;
}
.mv-user-opt:hover { background: #1a2236; }
.mv-user-opt-name  { font-size: 13px; font-weight: 600; color: var(--ink); }
.mv-user-opt-email { font-size: 11px; color: var(--ink-dim); }

/* Selected pill */
.mv-user-pill {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(226,232,240,0.12); color: #e2e8f0;
  border: 1px solid rgba(226,232,240,0.16);
  padding: 6px 10px 6px 13px; border-radius: 9px;
  font-size: 12.5px; font-weight: 600; white-space: nowrap;
}
.mv-user-pill-name { line-height: 1; }
.mv-user-pill-clear {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%; border: none;
  background: rgba(226,232,240,0.15); color: #e2e8f0; cursor: pointer; padding: 0;
  transition: background 130ms; flex-shrink: 0;
}
.mv-user-pill-clear:hover { background: rgba(226,232,240,0.25); }

/* Apply btn */
.mv-apply-btn {
  display: flex; align-items: center; gap: 6px;
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.10);
  color: #e2e8f0; padding: 7px 16px; border-radius: 9px;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: opacity 150ms; white-space: nowrap; margin-left: auto;
}
.mv-apply-btn:hover:not(:disabled) { opacity: 0.88; }
.mv-apply-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Stats ── */
.mv-stats {
  display: flex; align-items: center;
  background: #111827; border: 1px solid var(--line); border-radius: 16px;
  padding: 18px 28px; box-shadow: 0 1px 8px rgba(0,0,0,0.2); gap: 0;
}
.mv-stat { display: flex; flex-direction: column; gap: 4px; padding: 0 24px; }
.mv-stat:first-child { padding-left: 0; }
.mv-stat:last-child  { padding-right: 0; }
.mv-stat-div { width: 1px; height: 36px; background: var(--line-strong); flex-shrink: 0; }
.mv-stat-num {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 30px; font-weight: 400; color: var(--ink); line-height: 1; letter-spacing: -1px;
}
.mv-stat-num--gold { color: var(--gold-text); }
.mv-stat-label {
  font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
  text-transform: uppercase; color: var(--ink-muted);
}

/* ── Skeletons ── */
.mv-skeleton-list { display: flex; flex-direction: column; gap: 1px; }
.mv-skeleton {
  height: 52px;
  background: linear-gradient(90deg, #111827 25%, #1a2236 50%, #111827 75%);
  background-size: 200% 100%; animation: mv-shimmer 1.4s infinite;
}
.mv-skeleton:first-child { border-radius: 14px 14px 0 0; }
.mv-skeleton:last-child  { border-radius: 0 0 14px 14px; }
@keyframes mv-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty / Prompt ── */
.mv-empty, .mv-prompt {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 20px; border: 1px dashed var(--line-strong); border-radius: 20px;
}
.mv-empty-glyph { font-size: 28px; color: var(--gold); opacity: 0.6; }
.mv-empty-title, .mv-prompt-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 20px; color: var(--ink); margin: 0; }
.mv-empty-sub, .mv-prompt-sub { font-size: 13px; color: var(--ink-muted); margin: 0; }

/* ── Table ── */
.mv-table-wrap {
  background: #111827; border: 1px solid var(--line);
  border-radius: 16px; overflow: hidden; overflow-x: auto;
  box-shadow: 0 1px 8px rgba(0,0,0,0.2);
}
.mv-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.mv-th {
  padding: 11px 14px; text-align: left;
  font-size: 10.5px; font-weight: 700; color: var(--ink-muted);
  letter-spacing: 0.8px; text-transform: uppercase;
  border-bottom: 1px solid var(--line); background: #0f1729;
  white-space: nowrap;
}
.mv-th--right { text-align: right; }
.mv-row { transition: background 100ms; }
.mv-row:hover { background: #1a2236; }
.mv-row:not(:last-child) .mv-td { border-bottom: 1px solid var(--line-soft); }
.mv-td {
  padding: 12px 14px; font-size: 13px; color: var(--ink-muted);
  vertical-align: middle; white-space: nowrap;
}
.mv-td--date  { color: var(--ink-dim); font-size: 12px; min-width: 140px; }
.mv-td--muted { color: var(--ink-dim); }
.mv-td--mono  { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11.5px; }
.mv-td--event { max-width: 180px; overflow: hidden; text-overflow: ellipsis; color: var(--ink); font-weight: 500; }
.mv-td--right { text-align: right; }

/* Channel badge */
.mv-channel-badge {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
}
.mv-channel-badge--sms      { background: rgba(10,132,255,.10); color: #0A84FF; border: 1px solid rgba(10,132,255,.2); }
.mv-channel-badge--whatsapp { background: rgba(10,156,95,.10);  color: #0A9C5F; border: 1px solid rgba(10,156,95,.2); }

/* Campaign label */
.mv-campaign-label { font-size: 12.5px; color: var(--ink); font-weight: 500; }

/* Charge */
.mv-charge       { font-size: 12.5px; font-weight: 600; color: var(--ink); }
.mv-charge--free { font-size: 11.5px; font-weight: 500; color: var(--ink-dim); font-style: italic; }

/* Status badge */
.mv-status-badge {
  display: inline-flex; padding: 3px 9px; border-radius: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
  background: var(--paper-soft); color: var(--ink-muted); border: 1px solid var(--line-strong);
  text-transform: capitalize;
}
.mv-status-badge--queued    { background: rgba(255,159,10,.08); color: #FF9F0A; border-color: rgba(255,159,10,.2); }
.mv-status-badge--sent,
.mv-status-badge--submitted,
.mv-status-badge--delivered { background: rgba(10,156,95,.08);  color: #0A9C5F; border-color: rgba(10,156,95,.2); }
.mv-status-badge--failed    { background: rgba(255,69,58,.08);   color: #FF453A; border-color: rgba(255,69,58,.2); }

/* ── Pagination ── */
.mv-pagination {
  display: flex; align-items: center; justify-content: space-between; padding-top: 4px;
}
.mv-pagination-info { font-size: 13px; color: var(--ink-muted); }
.mv-pagination-controls { display: flex; align-items: center; gap: 4px; }
.mv-page-btn {
  min-width: 34px; height: 34px; padding: 0 6px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); border-radius: 8px;
  background: #111827; font-size: 13px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: border-color 130ms, color 130ms, background 130ms;
}
.mv-page-btn:hover:not(:disabled):not(.mv-page-btn--active) { border-color: var(--line-strong); color: var(--ink); }
.mv-page-btn--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #e2e8f0; font-weight: 700; }
.mv-page-btn--nav { color: var(--ink-dim); }
.mv-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.mv-page-ellipsis { width: 28px; text-align: center; font-size: 13px; color: var(--ink-dim); user-select: none; }

.mv-view-chips { display: flex; align-items: center; gap: 4px; }

/* ── Dispatcher table ── */
.mv-th--sortable { cursor: pointer; user-select: none; }
.mv-th--sortable:hover { color: var(--ink); }
.mv-sort-icon { vertical-align: middle; margin-left: 4px; color: var(--ink-dim); }
.mv-sort-icon--on { color: var(--gold-text); }

.mv-row--top { background: rgba(201,168,76,0.07); }

.mv-td--rank { padding: 12px 8px 12px 14px; }
.mv-td--num  { color: var(--ink); font-weight: 600; font-size: 13px; }

.mv-rank {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 6px;
  font-size: 11.5px; font-weight: 700; color: var(--ink-muted);
  background: #0f1729; border: 1px solid #2a3a52;
}
.mv-rank--gold {
  background: var(--gold-bg); color: var(--gold-text);
  border-color: var(--gold-border);
}
.mv-dispatcher-name { font-size: 13px; font-weight: 600; color: var(--ink); }
.mv-td--event-title { max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
.mv-charge--gold    { color: var(--gold-text); font-weight: 700; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .mv-page { padding: 20px 20px 60px; }
}
@media (max-width: 600px) {
  .mv-topbar-inner { padding: 12px 16px; }
  .mv-page { padding: 16px 16px 48px; }
}
</style>
