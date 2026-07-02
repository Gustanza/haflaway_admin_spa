<template>
  <div class="em-root">

      <!-- ══ Stats ══ -->
      <div class="em-stats">

        <!-- WhatsApp -->
        <div class="em-stat-block em-stat-block--wa">
          <div class="em-stat-card-top">
            <div class="em-stat-card-icon em-stat-card-icon--wa">
              <svg width="16" height="16" viewBox="0 0 448 512" fill="#128C7E"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
            </div>
            <div class="em-stat-card-body">
              <span class="em-stat-card-val">{{ channelStats.wa.find(s => s.status === 'read')?.n ?? channelStats.wa.find(s => s.status === 'delivered')?.n ?? 0 }}</span>
              <span class="em-stat-card-lbl">WhatsApp Read</span>
            </div>
          </div>
          <div class="em-stat-dd" v-click-outside="() => waDropOpen = false">
            <button class="em-stat-dd-trigger"
              :style="waFilterSelect ? { background: STATUS_COLORS[waFilterSelect]?.bg, color: STATUS_COLORS[waFilterSelect]?.fg, borderColor: STATUS_COLORS[waFilterSelect]?.border } : {}"
              @click="waDropOpen = !waDropOpen; smsDropOpen = false; rsvpDropOpen = false">
              <span class="em-stat-dd-dot" v-if="waFilterSelect" :style="{ background: STATUS_COLORS[waFilterSelect]?.fg }"/>
              <span class="em-stat-dd-label">{{ waFilterSelect ? channelStats.wa.find(s => s.status === waFilterSelect)?.label ?? waFilterSelect : 'All statuses' }}</span>
              <svg class="em-stat-dd-chev" :class="{ 'em-stat-dd-chev--open': waDropOpen }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div v-if="waDropOpen" class="em-stat-dd-menu">
              <button class="em-stat-dd-item" :class="{ 'em-stat-dd-item--on': !waFilterSelect }" @click="waFilterSelect = ''; waDropOpen = false">All statuses</button>
              <button v-for="s in channelStats.wa" :key="s.status"
                class="em-stat-dd-item" :class="{ 'em-stat-dd-item--on': waFilterSelect === s.status }"
                :style="{ color: STATUS_COLORS[s.status]?.fg }"
                @click="waFilterSelect = s.status; waDropOpen = false">
                <span class="em-stat-dd-dot" :style="{ background: STATUS_COLORS[s.status]?.fg }"/>
                <span class="em-stat-dd-n">{{ s.n }}</span> {{ s.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- SMS -->
        <div class="em-stat-block em-stat-block--sms">
          <div class="em-stat-card-top">
            <div class="em-stat-card-icon em-stat-card-icon--sms">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5856D6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="em-stat-card-body">
              <span class="em-stat-card-val">{{ channelStats.sms.find(s => s.status === 'delivered')?.n ?? 0 }}</span>
              <span class="em-stat-card-lbl">SMS Delivered</span>
            </div>
          </div>
          <div class="em-stat-dd" v-click-outside="() => smsDropOpen = false">
            <button class="em-stat-dd-trigger"
              :style="smsFilterSelect ? { background: STATUS_COLORS[smsFilterSelect]?.bg, color: STATUS_COLORS[smsFilterSelect]?.fg, borderColor: STATUS_COLORS[smsFilterSelect]?.border } : {}"
              @click="smsDropOpen = !smsDropOpen; waDropOpen = false; rsvpDropOpen = false">
              <span class="em-stat-dd-dot" v-if="smsFilterSelect" :style="{ background: STATUS_COLORS[smsFilterSelect]?.fg }"/>
              <span class="em-stat-dd-label">{{ smsFilterSelect ? channelStats.sms.find(s => s.status === smsFilterSelect)?.label ?? smsFilterSelect : 'All statuses' }}</span>
              <svg class="em-stat-dd-chev" :class="{ 'em-stat-dd-chev--open': smsDropOpen }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div v-if="smsDropOpen" class="em-stat-dd-menu">
              <button class="em-stat-dd-item" :class="{ 'em-stat-dd-item--on': !smsFilterSelect }" @click="smsFilterSelect = ''; smsDropOpen = false">All statuses</button>
              <button v-for="s in channelStats.sms" :key="s.status"
                class="em-stat-dd-item" :class="{ 'em-stat-dd-item--on': smsFilterSelect === s.status }"
                :style="{ color: STATUS_COLORS[s.status]?.fg }"
                @click="smsFilterSelect = s.status; smsDropOpen = false">
                <span class="em-stat-dd-dot" :style="{ background: STATUS_COLORS[s.status]?.fg }"/>
                <span class="em-stat-dd-n">{{ s.n }}</span> {{ s.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- RSVP -->
        <div class="em-stat-block em-stat-block--rsvp">
          <div class="em-stat-card-top">
            <div class="em-stat-card-icon em-stat-card-icon--rsvp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="em-stat-card-body">
              <span class="em-stat-card-val">{{ channelStats.rsvp.find(s => s.status === 'Confirmed')?.n ?? 0 }}</span>
              <span class="em-stat-card-lbl">RSVP Confirmed</span>
            </div>
          </div>
          <div class="em-stat-dd" v-click-outside="() => rsvpDropOpen = false">
            <button class="em-stat-dd-trigger"
              :style="rsvpFilterSelect ? { background: STATUS_COLORS[rsvpFilterSelect]?.bg, color: STATUS_COLORS[rsvpFilterSelect]?.fg, borderColor: STATUS_COLORS[rsvpFilterSelect]?.border } : {}"
              @click="rsvpDropOpen = !rsvpDropOpen; waDropOpen = false; smsDropOpen = false">
              <span class="em-stat-dd-dot" v-if="rsvpFilterSelect" :style="{ background: STATUS_COLORS[rsvpFilterSelect]?.fg }"/>
              <span class="em-stat-dd-label">{{ rsvpFilterSelect || 'All statuses' }}</span>
              <svg class="em-stat-dd-chev" :class="{ 'em-stat-dd-chev--open': rsvpDropOpen }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div v-if="rsvpDropOpen" class="em-stat-dd-menu">
              <button class="em-stat-dd-item" :class="{ 'em-stat-dd-item--on': !rsvpFilterSelect }" @click="rsvpFilterSelect = ''; rsvpDropOpen = false">All statuses</button>
              <button v-for="s in channelStats.rsvp" :key="s.status"
                class="em-stat-dd-item" :class="{ 'em-stat-dd-item--on': rsvpFilterSelect === s.status }"
                :style="{ color: STATUS_COLORS[s.status]?.fg }"
                @click="rsvpFilterSelect = s.status; rsvpDropOpen = false">
                <span class="em-stat-dd-dot" :style="{ background: STATUS_COLORS[s.status]?.fg }"/>
                <span class="em-stat-dd-n">{{ s.n }}</span> {{ s.status }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ Panel ══ -->
      <div class="em-panel">
        <div class="em-panel-hd">
          <h2 class="em-panel-title">Messages</h2>
          <div class="em-hd-search">
            <div class="em-search-wrap">
              <svg class="em-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input v-model="searchQ" class="em-search" placeholder="Search by name or phone…" />
              <button v-if="searchQ" class="em-search-clear" @click="searchQ = ''">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="em-aud-tabs">
            <button v-for="grp in AUDIENCE_GROUPS" :key="grp.id"
              class="em-aud-tab" :class="{ 'em-aud-tab--active': activeAudience === grp.id }"
              @click="setAudience(grp.id)">
              {{ grp.label }}
            </button>
          </div>
          <div class="em-panel-acts">
            <button class="em-export-btn" @click="showExportDialog = true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button class="em-send-btn" @click="openSendDrawer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Send
            </button>
          </div>
        </div>

        <!-- ── Campaign steps ── -->
        <div class="em-steps">
          <button v-for="camp in activeAudienceGroup.campaigns" :key="camp.id"
            class="em-step"
            :class="{ 'em-step--active': activeCampaign === camp.id, 'em-step--has-data': hasCampaignData(camp.id) }"
            @click="selectStep(camp.id)">
            <span class="em-step-num">{{ camp.step }}</span>
            <div class="em-step-body">
              <span class="em-step-label">{{ camp.label }}</span>
              <span class="em-step-hint">{{ camp.hint }}</span>
            </div>
          </button>
        </div>

        <!-- Label filter row -->
        <div v-if="props.event?.labels?.length" class="em-detail-filters em-detail-filters--sys">
          <div class="em-filter-group">
            <span class="em-filter-lbl">LIST</span>
            <select v-model="systemLabelId" class="em-filter-select">
              <option :value="null">All Lists</option>
              <option v-for="lbl in props.event.labels" :key="lbl.id" :value="lbl.id">{{ lbl.name }}</option>
            </select>
          </div>
          <button v-if="systemLabelId" class="em-filter-clear" @click="systemLabelId = null">
            {{ props.event.labels.find(l => l.id === systemLabelId)?.name }} ×
          </button>
        </div>

        <!-- Table -->
        <div class="em-table-wrap">
        <div class="em-guest-list">

          <!-- Skeleton -->
          <template v-if="loading && !attendees.length">
            <div v-for="n in 10" :key="`sk-${n}`" class="em-gc em-gc--sk">
              <div class="em-gc-av-wrap">
                <div class="em-sk-circle em-gc-avatar"/>
              </div>
              <div class="em-gc-info">
                <div class="em-sk-bar em-sk-bar--lg"/>
                <div class="em-sk-bar em-sk-bar--sm" style="margin-top:5px; width:36%"/>
              </div>
              <div class="em-gc-statuses">
                <div class="em-sk-bar em-sk-bar--sm" style="width:58px"/>
                <div class="em-sk-bar em-sk-bar--sm" style="width:58px"/>
                <div class="em-sk-bar em-sk-bar--sm" style="width:74px"/>
              </div>
            </div>
          </template>

          <!-- Guest cards -->
          <div v-for="att in pageList" :key="att.id"
            class="em-gc"
            :class="`em-gc--wa-${wspStatus(att)}`">

            <!-- Avatar + RSVP dot -->
            <div class="em-gc-av-wrap">
              <div class="em-gc-avatar" :style="{ background: avatarBg(att.fullName), color: avatarFg(att.fullName) }">
                {{ initials(att.fullName) }}
              </div>
              <span class="em-gc-rsvp-dot" :style="{ background: rsvpColor(att.attendanceStatus) }"/>
            </div>

            <!-- Identity -->
            <div class="em-gc-info">
              <span class="em-gc-name">{{ att.fullName }}</span>
              <span class="em-gc-meta">{{ att.phone || '—' }}</span>
            </div>

            <!-- Status badges -->
            <div class="em-gc-statuses">
              <span class="em-gc-badge" :class="`em-gc-badge--${wspStatus(att)}`">
                <svg class="em-gc-ch-icon em-gc-ch-icon--wa" width="10" height="10" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                {{ STATUS_LABELS[wspStatus(att)] || 'Unsent' }}
              </span>
              <span class="em-gc-badge" :class="`em-gc-badge--${smsStatus(att)}`">
                <svg class="em-gc-ch-icon em-gc-ch-icon--sms" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {{ STATUS_LABELS[smsStatus(att)] || 'Unsent' }}
              </span>
              <span class="em-gc-rsvp-lbl">
                <span class="em-rsvp-dot" :style="{ background: rsvpColor(att.attendanceStatus) }"/>
                {{ att.attendanceStatus || 'Not Confirmed' }}
              </span>
            </div>

            <!-- Date -->
            <span class="em-gc-date">{{ formatDate(att.createdAt) }}</span>
          </div>

          <!-- Empty state -->
          <div v-if="!loading && !filteredList.length" class="em-empty">
            <div class="em-empty-icon">
              <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#2a2a2a"/>
                <path d="M44 22H20a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3V25a3 3 0 0 0-3-3z" fill="#DDDBD6"/>
                <path d="M17 25l15 10 15-10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="em-empty-title">{{ searchQ ? `No results for "${searchQ}"` : activeFilter ? `No attendees with ${activeFilter.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} status "${STATUS_LABELS[activeFilter.status]}"` : 'No messages yet' }}</p>
            <p class="em-empty-sub">{{ searchQ ? 'Try a different name or phone number.' : activeFilter ? 'Try a different status filter.' : 'Send your first invitation and delivery status will appear here in real time.' }}</p>
            <button v-if="searchQ" class="em-empty-cta" @click="searchQ = ''">Clear search</button>
            <button v-else-if="activeFilter" class="em-empty-cta" @click="activeFilter = null">Clear filter</button>
            <button v-else class="em-empty-cta em-empty-cta--primary" @click="openSendDrawer">Send Invitations</button>
          </div>

        </div>
        <div class="em-table-footer">
          <span class="em-range-lbl">
            {{ filteredList.length ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredList.length)}` : '0' }}
            of {{ filteredList.length }}<template v-if="activeFilter"> · <button class="em-filter-clear" @click="activeFilter = null">{{ activeFilter.channel === 'whatsapp' ? 'WA' : 'SMS' }}: {{ STATUS_LABELS[activeFilter.status] }} ×</button></template>
          </span>
          <div class="em-paginator" :class="{ 'em-paginator--disabled': totalPages <= 1 }">
            <button class="em-page-btn em-page-btn--nav" :disabled="currentPage === 1 || totalPages <= 1" @click="goPage(currentPage - 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <template v-for="p in pageNumbers" :key="String(p)">
              <span v-if="p === '…'" class="em-page-ellipsis">…</span>
              <button v-else class="em-page-btn" :class="{ 'em-page-btn--active': currentPage === p }" :disabled="totalPages <= 1" @click="goPage(p)">{{ p }}</button>
            </template>
            <button class="em-page-btn em-page-btn--nav" :disabled="currentPage === totalPages || totalPages <= 1" @click="goPage(currentPage + 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
      </div><!-- /em-panel -->


    <!-- ══════════════════════════════════════════════
         SEND DRAWER  (shared between both modes)
         ══════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="em-fade">
        <div v-if="sendDrawerOpen" class="em-overlay" @click.self="closeSendDrawer">
          <Transition name="em-slide-right">
            <div v-if="sendDrawerOpen" class="em-drawer">

              <div class="em-drawer-header">
                <div class="em-drawer-header-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
                    stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  <span class="em-drawer-title">Send Messages</span>
                </div>
                <button class="em-drawer-close" @click="closeSendDrawer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <!-- Result banner -->
              <div v-if="sendResult" class="em-send-result"
                :class="sendResult.ok ? 'em-send-result--ok' : 'em-send-result--err'">
                <svg v-if="sendResult.ok" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <p class="em-result-title">{{ sendResult.ok ? 'Messages sent!' : 'Something went wrong' }}</p>
                  <p class="em-result-msg">{{ sendResult.message }}</p>
                </div>
                <button class="em-result-dismiss" @click="sendResult = null">Dismiss</button>
              </div>

              <div class="em-drawer-body">

                <!-- Campaign (locked to selected step) -->
                <div class="em-drawer-section">
                  <p class="em-drawer-section-label">Campaign</p>
                  <div class="em-locked-camp">
                    <div class="em-locked-camp-icon" v-html="KNOWN_CAMPAIGNS.find(c => c.id === sendCampaign)?.icon"/>
                    <div class="em-locked-camp-body">
                      <span class="em-locked-camp-label">{{ KNOWN_CAMPAIGNS.find(c => c.id === sendCampaign)?.label }}</span>
                      <span class="em-locked-camp-hint">Step {{ sendStepMeta?.step }} · {{ sendStepMeta?.hint }}</span>
                    </div>
                    <div class="em-locked-camp-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Locked
                    </div>
                  </div>
                </div>

                <!-- Channel -->
                <div class="em-drawer-section">
                  <p class="em-drawer-section-label">Channel</p>
                  <div class="em-send-ch-toggle">
                    <button class="em-send-ch-btn" :class="{ 'em-send-ch-btn--wsp': sendChannel === 'whatsapp' }" @click="onChannelChange('whatsapp')">
                      <svg width="14" height="14" viewBox="0 0 448 512" :fill="sendChannel === 'whatsapp' ? '#fff' : '#128C7E'"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                      WhatsApp
                    </button>
                    <button class="em-send-ch-btn" :class="{ 'em-send-ch-btn--sms': sendChannel === 'sms' }" @click="onChannelChange('sms')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="sendChannel === 'sms' ? '#fff' : '#5856D6'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      SMS
                    </button>
                  </div>
                </div>

                <!-- Recipients -->
                <div class="em-drawer-section">
                  <p class="em-drawer-section-label">Recipients</p>

                  <!-- Label filter (system mode only, when event has labels) -->
                  <div v-if="props.event?.labels?.length" class="em-drawer-list-row">
                    <span class="em-drawer-list-lbl">List</span>
                    <select v-model="sendLabelId" class="em-filter-select em-filter-select--drawer">
                      <option :value="null">All Lists</option>
                      <option v-for="lbl in props.event.labels" :key="lbl.id" :value="lbl.id">{{ lbl.name }}</option>
                    </select>
                  </div>

                  <!-- Status dropdown -->
                  <div class="em-stat-dd em-recip-dd" v-click-outside="() => recipDropOpen = false">
                    <button class="em-stat-dd-trigger"
                      :style="DRAWER_STATUS_COLORS[sendRecipMode] ? { background: DRAWER_STATUS_COLORS[sendRecipMode].bg, color: DRAWER_STATUS_COLORS[sendRecipMode].fg, borderColor: DRAWER_STATUS_COLORS[sendRecipMode].border } : {}"
                      @click="recipDropOpen = !recipDropOpen">
                      <span class="em-stat-dd-dot" :style="{ background: DRAWER_STATUS_COLORS[sendRecipMode]?.fg ?? '#555' }"/>
                      <span class="em-stat-dd-label">{{ SEND_STATUS_OPTS.find(o => o.v === sendRecipMode)?.l ?? 'All' }}</span>
                      <span class="em-stat-dd-n">{{ sendRecipMode === 'all' ? sendRecipPool.length : (sendStatusCounts[sendRecipMode] ?? 0) }}</span>
                      <svg class="em-stat-dd-chev" :class="{ 'em-stat-dd-chev--open': recipDropOpen }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div v-if="recipDropOpen" class="em-stat-dd-menu">
                      <button v-for="opt in SEND_STATUS_OPTS" :key="opt.v"
                        class="em-stat-dd-item" :class="{ 'em-stat-dd-item--on': sendRecipMode === opt.v }"
                        :style="{ color: DRAWER_STATUS_COLORS[opt.v]?.fg }"
                        @click="sendRecipMode = opt.v; recipDropOpen = false">
                        <span class="em-stat-dd-dot" :style="{ background: DRAWER_STATUS_COLORS[opt.v]?.fg ?? '#555' }"/>
                        <span class="em-stat-dd-n">{{ opt.v === 'all' ? sendRecipPool.length : (sendStatusCounts[opt.v] ?? 0) }}</span>
                        {{ opt.l }}
                      </button>
                    </div>
                  </div>

                  <!-- Pick manually — collapsible accordion -->
                  <button class="em-pick-toggle-btn" :class="{ 'em-pick-toggle-btn--on': pickOpen || drawerPickList.length }" @click="pickOpen = !pickOpen">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Pick specific attendees
                    <span v-if="drawerPickList.length" class="em-chip-cnt em-chip-cnt--gold" style="margin-left:auto">{{ drawerPickList.length }} selected</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-left:auto; transition:transform 200ms" :style="{ transform: pickOpen ? 'rotate(90deg)' : 'rotate(0deg)' }"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>

                  <!-- Pick mode: search + attendee list -->
                  <div v-if="pickOpen" class="em-pick-wrap">
                    <div class="em-pick-toolbar">
                      <div class="em-pick-search-wrap">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input v-model="drawerPickSearch" class="em-pick-search" placeholder="Search name or phone…" />
                        <button v-if="drawerPickSearch" class="em-pick-clear" @click="drawerPickSearch = ''">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <button class="em-pick-all-btn" @click="drawerPickSelectAll">
                        {{ drawerPickFiltered.every(a => drawerPickList.includes(a.id)) && drawerPickFiltered.length ? 'Clear all' : 'Select all' }}
                      </button>
                    </div>
                    <div class="em-pick-list">
                      <label v-for="att in drawerPickFiltered" :key="att.id" class="em-pick-row" :class="{ 'em-pick-row--on': drawerPickList.includes(att.id) }">
                        <input type="checkbox" :checked="drawerPickList.includes(att.id)" @change="drawerPickToggle(att)" class="em-pick-cb" />
                        <div class="em-pick-avatar" :style="{ background: avatarBg(att.fullName), color: avatarFg(att.fullName) }">{{ initials(att.fullName) }}</div>
                        <div class="em-pick-info">
                          <span class="em-pick-name">{{ att.fullName }}</span>
                          <span class="em-pick-phone">{{ att.phone || '—' }}</span>
                        </div>
                        <span class="em-badge em-badge--sm" :class="`em-badge--${getStatusForSend(att) ?? 'unsent'}`">{{ STATUS_LABELS[getStatusForSend(att)] ?? 'Unsent' }}</span>
                      </label>
                      <div v-if="!drawerPickFiltered.length" class="em-pick-empty">No attendees found</div>
                    </div>
                  </div>

                  <p class="em-recip-hint">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {{ sendRecipCount }} recipient{{ sendRecipCount !== 1 ? 's' : '' }} will receive this message
                  </p>
                </div>

                <!-- Template -->
                <div class="em-drawer-section">
                  <p class="em-drawer-section-label">
                    Template
                    <button v-if="sendChannel === 'sms'" class="em-browse-tpl-btn" @click="openTemplatePicker">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      Browse Haflaway templates
                    </button>
                    <span v-if="loadingTemplates" class="em-tpl-loading">
                      <svg class="em-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                      Loading…
                    </span>
                  </p>
                  <div v-if="!loadingTemplates && !templates.length" class="em-tpl-empty">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    No templates found for this campaign + channel.
                  </div>
                  <div v-else class="em-tpl-list">
                    <div v-for="tpl in templates" :key="tpl.id"
                      class="em-tpl-item"
                      :class="{ 'em-tpl-item--active': selectedTemplate?.id === tpl.id, 'em-tpl-item--editing': editingTplId === tpl.id }"
                      @click="editingTplId !== tpl.id && (selectedTemplate = tpl)">

                      <!-- View mode -->
                      <template v-if="editingTplId !== tpl.id">
                        <div class="em-tpl-radio" @click.stop="selectedTemplate = tpl">
                          <div class="em-tpl-radio-dot" v-if="selectedTemplate?.id === tpl.id" />
                        </div>
                        <div class="em-tpl-body">
                          <p class="em-tpl-content">{{ tpl.content }}</p>
                          <p v-if="tpl.language" class="em-tpl-meta">{{ tpl.language.toUpperCase() }}</p>
                        </div>
                        <div class="em-tpl-actions" @click.stop>
                          <button class="em-tpl-act-btn" title="Edit" @click="startEditTpl(tpl, $event)">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            class="em-tpl-act-btn em-tpl-act-btn--del"
                            :class="{ 'em-tpl-act-btn--confirm': deletingTplId === tpl.id }"
                            :title="deletingTplId === tpl.id ? 'Tap again to confirm' : 'Delete'"
                            @click="deleteTpl(tpl, $event)">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                            <span v-if="deletingTplId === tpl.id" class="em-tpl-act-confirm-txt">Confirm</span>
                          </button>
                        </div>
                      </template>

                      <!-- Edit mode -->
                      <template v-else>
                        <div class="em-tpl-edit" @click.stop>
                          <textarea
                            v-model="editingTplBody"
                            class="em-tpl-edit-ta"
                            rows="5"
                            autocomplete="off"
                            @keydown.esc="cancelEditTpl"
                          />
                          <div class="em-tpl-edit-actions">
                            <button class="em-tpl-edit-cancel" @click.stop="cancelEditTpl">Cancel</button>
                            <button
                              class="em-tpl-edit-save"
                              :disabled="savingTplId === tpl.id || !editingTplBody.trim()"
                              @click.stop="saveEditTpl(tpl)">
                              {{ savingTplId === tpl.id ? 'Saving…' : 'Save' }}
                            </button>
                          </div>
                        </div>
                      </template>

                    </div>
                  </div>
                </div>

              </div>

              <div class="em-drawer-footer">
                <button class="em-drawer-cancel" @click="closeSendDrawer">Cancel</button>
                <button class="em-drawer-send" :disabled="!canSend || sending" @click="executeSend">
                  <template v-if="sending">
                    <svg class="em-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Sending…
                  </template>
                  <template v-else>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Send to {{ sendRecipCount }}
                  </template>
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════
         EXPORT DIALOG
         ══════════════════════════════════════════════ -->
    <div v-if="showExportDialog" class="em-expd-backdrop" @click.self="showExportDialog = false">
      <div class="em-expd">
        <div class="em-expd-header">
          <span class="em-expd-title">Export Data</span>
          <button class="em-expd-close" @click="showExportDialog = false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="em-expd-body">
          <p class="em-expd-label">What do you want to export?</p>
          <div class="em-expd-type-grid">
            <button class="em-expd-type-card" :class="{ 'em-expd-type-card--on': exportType === 'invitation' }" @click="exportType = 'invitation'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 9l10 6 10-6"/></svg>
              <span class="em-expd-type-name">Invitation Data</span>
              <span class="em-expd-type-desc">Name · Phone · WhatsApp · SMS · RSVP</span>
            </button>
            <button class="em-expd-type-card" :class="{ 'em-expd-type-card--on': exportType === 'contribution' }" @click="exportType = 'contribution'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span class="em-expd-type-name">Contribution Data</span>
              <span class="em-expd-type-desc">Name · Phone · Pledged · Paid · Outstanding</span>
            </button>
            <button class="em-expd-type-card" :class="{ 'em-expd-type-card--on': exportType === 'contact' }" @click="exportType = 'contact'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span class="em-expd-type-name">Contact Data</span>
              <span class="em-expd-type-desc">Name · Phone · Pledged · Paid · Outstanding · RSVP</span>
            </button>
          </div>
          <p class="em-expd-label" style="margin-top:20px">Format</p>
          <div class="em-expd-fmt-row">
            <button class="em-expd-fmt-btn" :class="{ 'em-expd-fmt-btn--on': exportFormat === 'excel' }" @click="exportFormat = 'excel'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8l8 8M16 8l-8 8"/></svg>
              Excel (.xlsx)
            </button>
            <button class="em-expd-fmt-btn" :class="{ 'em-expd-fmt-btn--on': exportFormat === 'pdf' }" @click="exportFormat = 'pdf'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              PDF (Print)
            </button>
          </div>
        </div>
        <div class="em-expd-footer">
          <button class="em-drawer-cancel" @click="showExportDialog = false">Cancel</button>
          <button class="em-drawer-send" @click="doExport">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>
    </div>

  </div>

  <!-- ══════════════════════════════════════════════
       GLOBAL TEMPLATE PICKER
       ══════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="em-tpk-fade">
      <div v-if="tplPickerOpen" class="em-tpk-backdrop" @click.self="tplPickerOpen = false">
        <div class="em-tpk-panel">

          <div class="em-tpk-header">
            <span class="em-tpk-title">Haflaway Templates</span>
            <button class="em-tpk-close" @click="tplPickerOpen = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="em-tpk-body">
            <p class="em-tpk-sub">Pick one to import into this event</p>
            <div v-if="loadingGlobalTpls" class="em-tpk-empty">
              <svg class="em-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              Loading templates…
            </div>
            <div v-else-if="!globalTemplates.length" class="em-tpk-empty">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              No global templates available yet for this message type.
            </div>
            <div v-else class="em-tpk-list">
              <div v-for="tpl in globalTemplates" :key="tpl.id" class="em-tpk-card">
                <div class="em-tpk-card-head">
                  <span class="em-tpk-name">{{ tpl.name }}</span>
                  <div class="em-tpk-badges">
                    <span v-if="tpl.language" class="em-tpk-badge em-tpk-badge--lang">{{ tpl.language }}</span>
                    <span class="em-tpk-badge em-tpk-badge--ch">{{ tpl.channel?.toUpperCase() ?? 'SMS' }}</span>
                  </div>
                </div>
                <p class="em-tpk-body-text">{{ tpl.body }}</p>
                <button
                  class="em-tpk-import-btn"
                  :disabled="importingTplId === tpl.id"
                  @click="importGlobalTemplate(tpl)"
                >
                  <svg v-if="importingTplId !== tpl.id" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <svg v-else class="em-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  {{ importingTplId === tpl.id ? 'Importing…' : 'Import' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { db, auth } from '../../firebase'
import { collection, query, orderBy, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { utils, writeFile } from 'xlsx'

const vClickOutside = {
  mounted(el, binding) {
    el._co = (e) => { if (!el.contains(e.target)) binding.value(e) }
    document.addEventListener('mousedown', el._co)
  },
  unmounted(el) { document.removeEventListener('mousedown', el._co) }
}

const vDragScroll = {
  mounted(el) {
    let active = false, startX = 0, startScroll = 0
    el.addEventListener('mousedown', e => {
      active = true; startX = e.pageX; startScroll = el.scrollLeft
      el.style.cursor = 'grabbing'; el.style.userSelect = 'none'
    })
    const stop = () => { active = false; el.style.cursor = ''; el.style.userSelect = '' }
    el.addEventListener('mouseup', stop)
    el.addEventListener('mouseleave', stop)
    el.addEventListener('mousemove', e => {
      if (!active) return
      e.preventDefault()
      el.scrollLeft = startScroll - (e.pageX - startX)
    })
  }
}

const props = defineProps({ event: Object, eventId: String })
const route  = useRoute()
const eventId = computed(() => props.eventId ?? route.params.eventId)

const PAGE_SIZE = 15

const STATUS_LABELS = { unsent: 'Unsent', sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Failed', pending: 'Pending', undelivered: 'Undelivered' }
const STATUS_RANK   = { read: 5, delivered: 4, sent: 3, failed: 2, unsent: 1 }

const KNOWN_CAMPAIGN_IDS = new Set([
  'haflaway-invitation-campaign',
  'haflaway-invitation-reminder-campaign',
  'haflaway-contribution-campaign',
  'haflaway-save-the-date-campaign',
  'haflaway-gratitude-campaign',
  'haflaway-invitation-gratitude-campaign',
])

const CAMPAIGN_TEMPLATE_CATEGORIES = {
  'haflaway-invitation-campaign':           'whatsapp-wedding-invitations',
  'haflaway-invitation-reminder-campaign':  'haflaway-invitation-reminder-campaign',
  'haflaway-contribution-campaign':         'matrimony-contributions',
  'haflaway-save-the-date-campaign':        'whatsapp-wedding-save-the-date',
  'haflaway-gratitude-campaign':            'haflaway-gratitude-campaign',
  'haflaway-invitation-gratitude-campaign': 'haflaway-invitation-gratitude-campaign',
}

// Maps campaign ID → smsTemplates category key
const CAMPAIGN_TO_SMS_CATEGORY = {
  'haflaway-invitation-campaign':           'invitation',
  'haflaway-invitation-reminder-campaign':  'reminder',
  'haflaway-contribution-campaign':         'invitation',
  'haflaway-save-the-date-campaign':        'save-the-date',
  'haflaway-gratitude-campaign':            'gratitude',
  'haflaway-invitation-gratitude-campaign': 'gratitude',
}

const CAMPAIGN_KARD_TYPE = {
  'haflaway-invitation-campaign':           'invitation',
  'haflaway-invitation-reminder-campaign':  'invitation',
  'haflaway-contribution-campaign':         'contribution',
  'haflaway-save-the-date-campaign':        'invitation',
  'haflaway-gratitude-campaign':            'invitation',
  'haflaway-invitation-gratitude-campaign': 'invitation',
}

const KNOWN_CAMPAIGNS = [
  { id: 'haflaway-invitation-campaign', label: 'Invitation', icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 9l10 6 10-6"/></svg>` },
  { id: 'haflaway-invitation-reminder-campaign', label: 'Reminder', icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>` },
  { id: 'haflaway-save-the-date-campaign', label: 'Save the Date', icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { id: 'haflaway-contribution-campaign', label: 'Contribution', icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
  { id: 'haflaway-gratitude-campaign', label: 'Gratitude', icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` },
]

const AUDIENCE_GROUPS = [
  {
    id: 'invitation',
    label: 'Invitation Guests',
    campaigns: [
      { id: 'haflaway-invitation-campaign',          step: 1, label: 'Invitation',    hint: 'The main invite with their card' },
      { id: 'haflaway-invitation-reminder-campaign', step: 2, label: 'Reminder',      hint: 'Follow up closer to the event'  },
      { id: 'haflaway-save-the-date-campaign',       step: 3, label: 'Save the Date', hint: 'Send early to announce the date' },
      { id: 'haflaway-gratitude-campaign',           step: 4, label: 'Gratitude',     hint: 'Thank them after the event'     },
    ],
  },
  {
    id: 'contribution',
    label: 'Contribution Guests',
    campaigns: [
      { id: 'haflaway-contribution-campaign', step: 1, label: 'Contribution', hint: 'Request contributions from guests' },
    ],
  },
]

const WSP_URL = 'https://sendwhatsappinvitationmessages-frbu33fema-uc.a.run.app'
const SMS_URL = 'https://sendsmsaction-frbu33fema-uc.a.run.app'

// ── State ─────────────────────────────────────────────────────────────────────
const attendees    = ref([])
const loading      = ref(false)
const searchQ      = ref('')
const activeCampaign  = ref('haflaway-invitation-campaign')
const activeAudience  = ref('invitation')
const currentPage     = ref(1)

const activeAudienceGroup = computed(() =>
  AUDIENCE_GROUPS.find(g => g.id === activeAudience.value) ?? AUDIENCE_GROUPS[0]
)

function getKardType(att) {
  const c = att.cards ?? {}
  if (c.invitation != null) return 'invitation'
  if (c.contribution != null) return 'contribution'
  return 'contact'
}

function hasCampaignData(campaignId) {
  return attendees.value.some(a =>
    (a.messageIndexes ?? []).some(idx => {
      const p = parseIdx(idx)
      return p && p.campaignId === campaignId
    })
  )
}

function setAudience(id) {
  activeAudience.value = id
  const group = AUDIENCE_GROUPS.find(g => g.id === id)
  if (group?.campaigns.length) activeCampaign.value = group.campaigns[0].id
  activeFilter.value = null
  rsvpFilter.value = null
  currentPage.value = 1
}

function selectStep(campaignId) {
  activeCampaign.value = campaignId
  activeFilter.value = null
  rsvpFilter.value = null
  currentPage.value = 1
}
const activeFilter   = ref(null) // { channel: string, status: string } | null
const rsvpFilter     = ref(null) // string | null
const systemLabelId  = ref(null) // string | null — mirrors Flutter _labelFilterId

// ── Send drawer ───────────────────────────────────────────────────────────────
const sendDrawerOpen   = ref(false)
const sendCampaign     = ref('haflaway-invitation-campaign')
const sendChannel      = ref('whatsapp')
const sendRecipMode    = ref('unsent')   // 'unsent' | 'all' | 'selected'
const sendLabelId      = ref(null)       // label filter inside the drawer (system mode only)
const templates        = ref([])
const selectedTemplate = ref(null)
const loadingTemplates = ref(false)
const sending          = ref(false)
const sendResult       = ref(null)

const chipsScrollEl    = ref(null)
function scrollChips(dir) { chipsScrollEl.value?.scrollBy({ left: dir * 120, behavior: 'smooth' }) }

// ── Global template picker ────────────────────────────────────────────────────
const tplPickerOpen       = ref(false)
const globalTemplates     = ref([])
const loadingGlobalTpls   = ref(false)
const importingTplId      = ref(null)

async function openTemplatePicker() {
  tplPickerOpen.value = true
  if (globalTemplates.value.length) return
  loadingGlobalTpls.value = true
  try {
    const category = CAMPAIGN_TO_SMS_CATEGORY[sendCampaign.value]
    const snap = await getDocs(query(collection(db, 'smsTemplates'), orderBy('createdAt', 'desc')))
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.active !== false)
    globalTemplates.value = category ? all.filter(t => t.category === category || !t.category) : all
  } catch (e) { console.error(e) }
  finally { loadingGlobalTpls.value = false }
}

// ── Per-event template inline edit / delete ───────────────────────────────────
const editingTplId   = ref(null)
const editingTplBody = ref('')
const savingTplId    = ref(null)
const deletingTplId  = ref(null)

function startEditTpl(tpl, e) {
  e.stopPropagation()
  editingTplId.value   = tpl.id
  editingTplBody.value = tpl.content ?? ''
}

function cancelEditTpl() { editingTplId.value = null; editingTplBody.value = '' }

async function saveEditTpl(tpl) {
  if (!eventId.value || !editingTplBody.value.trim()) return
  savingTplId.value = tpl.id
  try {
    await updateDoc(doc(db, 'events', eventId.value, 'messageTemplates', tpl.id), { content: editingTplBody.value.trim() })
    tpl.content = editingTplBody.value.trim()
    if (selectedTemplate.value?.id === tpl.id) selectedTemplate.value = { ...selectedTemplate.value, content: tpl.content }
    cancelEditTpl()
  } catch (e) { console.error(e) }
  finally { savingTplId.value = null }
}

async function deleteTpl(tpl, e) {
  e.stopPropagation()
  if (deletingTplId.value === tpl.id) {
    // second click = confirm
    try {
      await deleteDoc(doc(db, 'events', eventId.value, 'messageTemplates', tpl.id))
      templates.value = templates.value.filter(t => t.id !== tpl.id)
      if (selectedTemplate.value?.id === tpl.id) selectedTemplate.value = null
    } catch (e) { console.error(e) }
    finally { deletingTplId.value = null }
  } else {
    deletingTplId.value = tpl.id
    // auto-reset confirm state after 3s if user doesn't click again
    setTimeout(() => { if (deletingTplId.value === tpl.id) deletingTplId.value = null }, 3000)
  }
}

async function importGlobalTemplate(tpl) {
  if (!eventId.value) return
  importingTplId.value = tpl.id
  try {
    await addDoc(
      collection(db, 'events', eventId.value, 'messageTemplates'),
      { content: tpl.body, language: tpl.language ?? null, importedFrom: tpl.id, createdAt: serverTimestamp() }
    )
    tplPickerOpen.value = false
    globalTemplates.value = []
    await loadSendTemplates()
  } catch (e) { console.error(e) }
  finally { importingTplId.value = null }
}

const campGridEl       = ref(null)
function scrollCampGrid(dir) { campGridEl.value?.scrollBy({ left: dir * 160, behavior: 'smooth' }) }
const drawerPickSearch = ref('')
const drawerPickList   = ref([])   // attendee ids picked manually
const pickOpen         = ref(false)
// Attendees scoped by sendLabelId — used as the base pool for all send-drawer recipient logic
const sendRecipPool = computed(() => {
  if (!sendLabelId.value) return attendees.value
  return attendees.value.filter(a => (a.labelIds ?? []).includes(sendLabelId.value))
})

const drawerPickFiltered = computed(() => {
  const q = drawerPickSearch.value.trim().toLowerCase()
  const base = sendRecipPool.value
  if (!q) return base
  return base.filter(a =>
    (a.fullName ?? '').toLowerCase().includes(q) ||
    (a.phone ?? '').includes(q)
  )
})
function drawerPickToggle(att) {
  const idx = drawerPickList.value.indexOf(att.id)
  if (idx === -1) drawerPickList.value.push(att.id)
  else drawerPickList.value.splice(idx, 1)
  sendRecipMode.value = drawerPickList.value.length ? 'pick' : 'unsent'
}
function drawerPickSelectAll() {
  const ids = drawerPickFiltered.value.map(a => a.id)
  const allIn = ids.every(id => drawerPickList.value.includes(id))
  if (allIn) drawerPickList.value = drawerPickList.value.filter(id => !ids.includes(id))
  else ids.forEach(id => { if (!drawerPickList.value.includes(id)) drawerPickList.value.push(id) })
}

// ── Firestore: load attendees ─────────────────────────────────────────────────
async function load() {
  if (!eventId.value) return
  loading.value = true
  attendees.value = []
  try {
    const snap = await getDocs(
      query(collection(db, 'events', eventId.value, 'attendees'), orderBy('createdAt', 'desc'))
    )
    attendees.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to load attendees', e)
  } finally {
    loading.value = false
  }
}

// ── Send drawer ────────────────────────────────────────────────────────────────
function openSendDrawer() {
  sendRecipMode.value = 'unsent'
  sendCampaign.value = activeCampaign.value ?? 'haflaway-invitation-campaign'
  sendChannel.value = 'whatsapp'
  sendResult.value = null
  sendLabelId.value = systemLabelId.value  // inherit current table label filter
  drawerPickList.value = []
  drawerPickSearch.value = ''
  pickOpen.value = false
  sendDrawerOpen.value = true
  loadSendTemplates()
}
function closeSendDrawer() {
  sendDrawerOpen.value = false
}

const sendStepMeta = computed(() => {
  for (const grp of AUDIENCE_GROUPS) {
    const s = grp.campaigns.find(c => c.id === sendCampaign.value)
    if (s) return s
  }
  return null
})

function onCampaignChange(id) { sendCampaign.value = id; selectedTemplate.value = null; loadSendTemplates() }
function onChannelChange(ch)  { sendChannel.value = ch;  selectedTemplate.value = null; loadSendTemplates() }

async function loadSendTemplates() {
  if (!eventId.value) return
  loadingTemplates.value = true
  templates.value = []
  selectedTemplate.value = null
  try {
    if (sendChannel.value === 'whatsapp') {
      const category = CAMPAIGN_TEMPLATE_CATEGORIES[sendCampaign.value]
      if (category) {
        const lang = props.event?.language ?? 'sw'
        const snap = await getDocs(
          query(collection(db, 'messageTemplates'), where('category', '==', category), where('language', '==', lang))
        )
        templates.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
      // Custom campaigns: no WhatsApp templates — user sees empty state
    } else {
      const snap = await getDocs(collection(db, 'events', eventId.value, 'messageTemplates'))
      templates.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    if (templates.value.length === 1) selectedTemplate.value = templates.value[0]
  } catch (e) {
    console.error('Failed to load templates', e)
  } finally {
    loadingTemplates.value = false
  }
}

// ── Send recipients ───────────────────────────────────────────────────────────
function getStatusForSend(att) {
  const prefix = `${sendChannel.value}_${sendCampaign.value}_`
  const match = (att.messageIndexes ?? []).find(idx => idx.startsWith(prefix))
  return match ? match.slice(match.lastIndexOf('_') + 1) : null
}

const SEND_STATUS_OPTS = [
  { v: 'unsent',      l: 'Unsent'      },
  { v: 'sent',        l: 'Sent'        },
  { v: 'delivered',   l: 'Delivered'   },
  { v: 'read',        l: 'Read'        },
  { v: 'undelivered', l: 'Undelivered' },
  { v: 'failed',      l: 'Failed'      },
  { v: 'all',         l: 'All'         },
]
const DRAWER_STATUS_COLORS = {
  unsent:      { bg: 'rgba(201,168,76,0.08)',  fg: '#C9A84C', border: 'rgba(201,168,76,0.30)' },
  sent:        { bg: 'rgba(99,179,237,0.10)',  fg: '#63b3ed', border: 'rgba(99,179,237,0.30)' },
  delivered:   { bg: 'rgba(52,211,153,0.10)',  fg: '#34d399', border: 'rgba(52,211,153,0.30)' },
  read:        { bg: 'rgba(52,211,153,0.08)',  fg: '#34d399', border: 'rgba(52,211,153,0.25)' },
  undelivered: { bg: 'rgba(249,115,22,0.10)',  fg: '#f97316', border: 'rgba(249,115,22,0.30)' },
  failed:      { bg: 'rgba(255,69,58,0.10)',   fg: '#ff6b6b', border: 'rgba(255,69,58,0.25)' },
  all:         { bg: 'rgba(255,255,255,0.05)', fg: '#d4cfc8', border: 'rgba(255,255,255,0.15)' },
}
const recipDropOpen = ref(false)
const sendStatusCounts = computed(() => {
  const c = { unsent: 0, sent: 0, delivered: 0, read: 0, failed: 0, undelivered: 0, pending: 0 }
  for (const att of sendRecipPool.value) {
    const s = getStatusForSend(att) ?? 'unsent'
    if (s in c) c[s]++
  }
  return c
})
const sendRecipCount = computed(() => {
  if (sendRecipMode.value === 'pick') return drawerPickList.value.length
  if (sendRecipMode.value === 'all') return sendRecipPool.value.length
  return sendStatusCounts.value[sendRecipMode.value] ?? 0
})
const sendRecipIds = computed(() => {
  if (sendRecipMode.value === 'pick') return [...drawerPickList.value]
  if (sendRecipMode.value === 'all') return sendRecipPool.value.map(a => a.id)
  return sendRecipPool.value.filter(a => (getStatusForSend(a) ?? 'unsent') === sendRecipMode.value).map(a => a.id)
})
const canSend = computed(() =>
  sendCampaign.value && sendChannel.value && selectedTemplate.value && sendRecipCount.value > 0 && !sending.value
)

async function executeSend() {
  if (!canSend.value) return
  sending.value = true
  sendResult.value = null
  try {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    const uid = user.uid
    const url = sendChannel.value === 'whatsapp' ? WSP_URL : SMS_URL
    const kardType = CAMPAIGN_KARD_TYPE[sendCampaign.value] ?? 'invitation'
    const body = sendChannel.value === 'whatsapp'
      ? { templateId: selectedTemplate.value.id, type: sendCampaign.value, eventId: eventId.value, attendeesIds: sendRecipIds.value, kardType }
      : { content: selectedTemplate.value.content,  type: sendCampaign.value, eventId: eventId.value, attendeesIds: sendRecipIds.value, kardType }

    const res  = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${uid}` }, body: JSON.stringify(body) })
    const data = await res.json()
    sendResult.value = { ok: data.status === true, message: data.message ?? (data.status ? 'Done.' : 'Request failed.') }
    if (data.status) {
      await load()
      if (sendRecipMode.value === 'pick') { drawerPickList.value = []; drawerPickSearch.value = ''; pickOpen.value = false }
    }
  } catch (e) {
    sendResult.value = { ok: false, message: e.message }
  } finally {
    sending.value = false
  }
}

// ── System mode: parse messageIndex ──────────────────────────────────────────
function parseIdx(idx) {
  const firstU = idx.indexOf('_')
  const lastU  = idx.lastIndexOf('_')
  if (firstU === -1 || firstU === lastU) return null
  return { channel: idx.slice(0, firstU), campaignId: idx.slice(firstU + 1, lastU), status: idx.slice(lastU + 1) }
}

function getStatus(att, channel) {
  const indexes = att.messageIndexes ?? []
  if (!indexes.length) return null
  if (activeCampaign.value) {
    for (const idx of indexes) {
      const p = parseIdx(idx)
      if (p && p.channel === channel && p.campaignId === activeCampaign.value) return p.status
    }
    return null
  }
  let best = null
  for (const idx of indexes) {
    const p = parseIdx(idx)
    if (!p || p.channel !== channel || !KNOWN_CAMPAIGN_IDS.has(p.campaignId)) continue
    if (!best || (STATUS_RANK[p.status] ?? 0) > (STATUS_RANK[best] ?? 0)) best = p.status
  }
  return best
}

const wspStatus = (att) => getStatus(att, 'whatsapp')
const smsStatus = (att) => getStatus(att, 'sms')

// ── System mode: filter + pagination ─────────────────────────────────────────
const filteredList = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  let list = attendees.value.filter(a => {
    const t = getKardType(a)
    return activeAudience.value === 'invitation' ? t === 'invitation' : t === 'contribution'
  })
  if (q) {
    list = list.filter(a =>
      (a.fullNameLower ?? a.fullName?.toLowerCase() ?? '').includes(q) ||
      (a.phone ?? '').includes(q)
    )
  }
  if (systemLabelId.value) {
    list = list.filter(a => (a.labelIds ?? []).includes(systemLabelId.value))
  }
  if (activeFilter.value) {
    const { channel, status } = activeFilter.value
    list = list.filter(a => {
      const s = getStatus(a, channel)
      return status === 'unsent' ? (!s || s === 'unsent') : s === status
    })
  }
  if (rsvpFilter.value) {
    list = list.filter(a => (a.attendanceStatus || 'Not Confirmed') === rsvpFilter.value)
  }
  return list
})
watch(searchQ,        () => { currentPage.value = 1 })
watch(systemLabelId,  () => { currentPage.value = 1; activeFilter.value = null; rsvpFilter.value = null })
watch(activeCampaign, () => { currentPage.value = 1; activeFilter.value = null; rsvpFilter.value = null })
watch(activeAudience, () => { currentPage.value = 1; activeFilter.value = null; rsvpFilter.value = null })
const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / PAGE_SIZE)))
const pageList   = computed(() => { const s = (currentPage.value - 1) * PAGE_SIZE; return filteredList.value.slice(s, s + PAGE_SIZE) })
const pageNumbers = computed(() => {
  const total = totalPages.value, cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (cur > 3) pages.push('…')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('…')
  if (total > 1) pages.push(total)
  return pages
})
function goPage(n) { if (n >= 1 && n <= totalPages.value) currentPage.value = n }

// ── System mode: stats ────────────────────────────────────────────────────────
const DISPLAY_STATUSES = ['unsent', 'sent', 'delivered', 'read', 'failed', 'pending', 'undelivered']
const channelStats = computed(() => {
  const list = systemLabelId.value
    ? attendees.value.filter(a => (a.labelIds ?? []).includes(systemLabelId.value))
    : attendees.value
  const total = list.length
  const countCh = (channel, status) => {
    if (status === 'unsent') return list.filter(a => { const s = getStatus(a, channel); return !s || s === 'unsent' }).length
    return list.filter(a => getStatus(a, channel) === status).length
  }
  const wa  = DISPLAY_STATUSES.map(s => ({ status: s, n: countCh('whatsapp', s), label: STATUS_LABELS[s] })).filter(s => s.n > 0)
  const sms = DISPLAY_STATUSES.filter(s => s !== 'read').map(s => ({ status: s, n: countCh('sms', s), label: STATUS_LABELS[s] })).filter(s => s.n > 0)
  const RSVP_STATUSES = ['Confirmed', 'Not Confirmed', 'Declined', 'Called', 'Unreachable']
  const rsvp = RSVP_STATUSES
    .map(s => ({ status: s, n: list.filter(a => (a.attendanceStatus || 'Not Confirmed') === s).length }))
    .filter(s => s.n > 0)
  return { total, wa, sms, rsvp }
})

// ── Export ────────────────────────────────────────────────────────────────────
const showExportDialog = ref(false)
const exportType   = ref('invitation')   // 'invitation' | 'contribution' | 'contact'
const exportFormat = ref('excel')        // 'excel' | 'pdf'

function doExport() {
  if (exportFormat.value === 'pdf') exportPDF()
  else exportExcel()
}

function exportExcel() {
  const type         = exportType.value
  const isContrib    = type === 'contribution' || type === 'contact'
  const campaignLabel = KNOWN_CAMPAIGNS.find(c => c.id === activeCampaign.value)?.label ?? activeCampaign.value
  const eventName    = props.event?.title ?? 'Event'
  const exportedOn   = new Date().toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })
  const rows         = filteredList.value

  // ── Column config per type ────────────────────────────────────────
  const hdrs = isContrib
    ? ['Name', 'Phone', 'Pledged (TZS)', 'Paid (TZS)', 'Outstanding (TZS)', 'RSVP', 'Added']
    : ['Name', 'Phone', 'WhatsApp', 'SMS', 'RSVP', 'Added']
  const colDefs = isContrib
    ? [{ wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 14 }]
    : [{ wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }]
  const getVals = isContrib
    ? a => { const p = a.pledgedAmount ?? 0; const pd = a.paidAmount ?? 0; return [a.fullName||'', a.phone||'', p, pd, p - pd, a.attendanceStatus||'Not Confirmed', formatDate(a.createdAt)] }
    : a => [a.fullName||'', a.phone||'', STATUS_LABELS[wspStatus(a)]||'—', STATUS_LABELS[smsStatus(a)]||'—', a.attendanceStatus||'Not Confirmed', formatDate(a.createdAt)]

  const nC      = hdrs.length
  const COLS    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, nC)
  const lastCol = COLS[nC - 1]

  // ── Palette ───────────────────────────────────────────────────────
  const DARK='1C1A18', GOLD='C9A84C', GOLDMID='A89A6A', WHITE='FFFFFF', LIGHT='F8F8F6', BORDER='E5E4E0', GRAY='8A8580'

  const ws = {}
  const put    = (r, c, v, s, t) => { ws[`${COLS[c]}${r}`] = { v, t: t ?? (typeof v === 'number' ? 'n' : 's'), s } }
  const blk    = (r, c, bg) => put(r, c, '', { fill: { patternType: 'solid', fgColor: { rgb: bg } } })
  const blkRow = (r, bg) => { for (let c = 0; c < nC; c++) blk(r, c, bg) }
  const mkFont = (sz, bold, italic, rgb) => { const o = { name: 'Calibri', sz, color: { rgb } }; if (bold) o.bold = true; if (italic) o.italic = true; return o }
  const fl     = rgb => ({ patternType: 'solid', fgColor: { rgb } })

  // ── Row 1: HAFLAWAY ──────────────────────────────────────────────
  blkRow(1, DARK)
  put(1, 0, 'HAFLAWAY', { font: mkFont(24, true, false, GOLD), fill: fl(DARK), alignment: { horizontal: 'center', vertical: 'center' } })

  // ── Row 2: tagline ───────────────────────────────────────────────
  blkRow(2, DARK)
  put(2, 0, 'Invitations with Class  ·  Guests Welcomed  ·  Perfect Celebration', { font: mkFont(9, false, true, GOLDMID), fill: fl(DARK), alignment: { horizontal: 'center', vertical: 'center' } })

  // ── Row 3: gold bar ──────────────────────────────────────────────
  blkRow(3, GOLD)

  // ── Rows 4-5: meta strip ─────────────────────────────────────────
  const sLbl  = { font: mkFont(9, true, false, GRAY),   fill: fl(LIGHT), alignment: { vertical: 'center' } }
  const sVal  = { font: mkFont(10, false, false, DARK), fill: fl(LIGHT), alignment: { vertical: 'center' } }
  const sValB = { font: mkFont(10, true, false, DARK),  fill: fl(LIGHT), alignment: { vertical: 'center' } }
  const sNum  = { font: mkFont(10, true, false, DARK),  fill: fl(LIGHT) }

  blkRow(4, LIGHT); blkRow(5, LIGHT)
  put(4, 0, 'EVENT',    sLbl); put(4, 1, eventName,  sValB)
  put(5, 0, 'EXPORTED', sLbl); put(5, 1, exportedOn, sVal)

  if (isContrib) {
    const totalPledged = rows.reduce((s, a) => s + (a.pledgedAmount ?? 0), 0)
    const totalPaid    = rows.reduce((s, a) => s + (a.paidAmount ?? 0), 0)
    put(4, 3, 'TOTAL PLEDGED', sLbl); ws[`${COLS[4]}4`] = { v: totalPledged, t: 'n', s: sNum }
    put(5, 3, 'TOTAL PAID',    sLbl); ws[`${COLS[4]}5`] = { v: totalPaid,    t: 'n', s: sNum }
    put(4, 5, 'OUTSTANDING',   sLbl); ws[`${COLS[6]}4`] = { v: totalPledged - totalPaid, t: 'n', s: sNum }
    put(5, 5, 'RECORDS',       sLbl); ws[`${COLS[6]}5`] = { v: rows.length, t: 'n', s: sNum }
  } else {
    put(4, 3, 'CAMPAIGN', sLbl); put(4, 4, campaignLabel, sVal)
    put(5, 3, 'TOTAL',    sLbl); ws[`${COLS[4]}5`] = { v: rows.length, t: 'n', s: sNum }
  }

  // ── Row 6: spacer ────────────────────────────────────────────────
  blkRow(6, WHITE)

  // ── Row 7: column headers ────────────────────────────────────────
  const sHdr = { font: mkFont(10, true, false, WHITE), fill: fl(GOLD), alignment: { horizontal: 'center', vertical: 'center' } }
  hdrs.forEach((h, c) => put(7, c, h, sHdr))

  // ── Data rows ────────────────────────────────────────────────────
  const bdr = { bottom: { style: 'thin', color: { rgb: BORDER } } }
  rows.forEach((a, i) => {
    const r  = i + 8
    const bg = i % 2 === 0 ? WHITE : LIGHT
    const d  = { font: mkFont(10, false, false, DARK), fill: fl(bg), border: bdr }
    const dc = { font: mkFont(10, false, false, DARK), fill: fl(bg), border: bdr, alignment: { horizontal: 'center' } }
    const dr = { font: mkFont(10, false, false, DARK), fill: fl(bg), border: bdr, alignment: { horizontal: 'right' } }
    const vals = getVals(a)
    vals.forEach((v, c) => {
      ws[`${COLS[c]}${r}`] = { v, t: typeof v === 'number' ? 'n' : 's', s: c === 0 ? d : (typeof v === 'number' ? dr : dc) }
    })
  })

  // ── Footer ───────────────────────────────────────────────────────
  const fs = rows.length + 9
  const fH = { font: mkFont(9, true, false, GOLD),      fill: fl(DARK), alignment: { vertical: 'center' } }
  const fV = { font: mkFont(9, false, false, 'D4C89A'), fill: fl(DARK), alignment: { vertical: 'center' } }

  blkRow(fs, DARK)
  blkRow(fs+1, DARK); put(fs+1, 0, 'CONTACT',   fH); put(fs+1, 3, 'SOCIAL',    fH)
  blkRow(fs+2, DARK); put(fs+2, 0, 'Email',     fH); put(fs+2, 1, 'haflaway@gmail.com', fV); put(fs+2, 3, 'Instagram', fH); put(fs+2, 4, '@haflaway', fV)
  blkRow(fs+3, DARK); put(fs+3, 0, 'Phone',     fH); put(fs+3, 1, '+255 754 980 535',   fV); put(fs+3, 3, 'TikTok',    fH); put(fs+3, 4, '@haflaway', fV)
  blkRow(fs+4, DARK); put(fs+4, 0, 'Phone',     fH); put(fs+4, 1, '+255 615 675 680',   fV); put(fs+4, 3, 'Web',       fH); put(fs+4, 4, 'haflaway.com', fV)
  blkRow(fs+5, DARK); put(fs+5, 0, 'Generated by Haflaway Event Management Platform  ·  haflaway.com', { font: mkFont(8, false, true, GOLDMID), fill: fl(DARK), alignment: { horizontal: 'center', vertical: 'center' } })
  blkRow(fs+6, DARK); put(fs+6, 0, '© 2026 Haflaway  ·  All rights reserved', { font: mkFont(8, false, false, GRAY), fill: fl(DARK), alignment: { horizontal: 'center', vertical: 'center' } })

  // ── Sheet metadata ───────────────────────────────────────────────
  ws['!ref'] = `A1:${lastCol}${fs + 6}`
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: nC - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: nC - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: nC - 1 } },
    { s: { r: fs + 4, c: 0 }, e: { r: fs + 4, c: nC - 1 } },
    { s: { r: fs + 5, c: 0 }, e: { r: fs + 5, c: nC - 1 } },
  ]
  ws['!rows'] = [{ hpt: 38 }, { hpt: 16 }, { hpt: 5 }, { hpt: 18 }, { hpt: 18 }, { hpt: 8 }, { hpt: 22 }]
  ws['!cols'] = colDefs

  const sheetName  = type === 'contribution' ? 'Contributions' : type === 'contact' ? 'Contacts' : 'Messages'
  const fileSlug   = type === 'contribution' ? 'contributions' : type === 'contact' ? 'contacts' : 'messages'
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, sheetName)
  writeFile(wb, `haflaway-${fileSlug}-${(eventName).toLowerCase().replace(/\s+/g, '-')}.xlsx`, { cellStyles: true })
  showExportDialog.value = false
}

function exportPDF() {
  const type          = exportType.value
  const isContrib     = type === 'contribution' || type === 'contact'
  const rows          = filteredList.value
  const campaignLabel = KNOWN_CAMPAIGNS.find(c => c.id === activeCampaign.value)?.label ?? activeCampaign.value
  const eventName     = props.event?.title ?? 'Event'
  const exportedOn    = new Date().toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalPledged  = isContrib ? rows.reduce((s, a) => s + (a.pledgedAmount ?? 0), 0) : 0
  const totalPaid     = isContrib ? rows.reduce((s, a) => s + (a.paidAmount ?? 0), 0) : 0
  const fmt           = n => n.toLocaleString('en')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Haflaway — ${eventName} — ${campaignLabel}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#fff;color:#0A0A0B;font-size:12px;}
    /* Header */
    .hdr{background:#0A0A0B;padding:28px 40px 24px;display:flex;align-items:flex-end;justify-content:space-between;}
    .brand{font-size:32px;font-weight:900;letter-spacing:-1.5px;color:#C9A84C;line-height:1;}
    .tagline{font-size:10px;color:rgba(255,255,255,0.45);margin-top:6px;letter-spacing:1.2px;text-transform:uppercase;}
    .hdr-event{text-align:right;}
    .hdr-event-name{font-size:15px;font-weight:700;color:#fff;}
    .hdr-event-sub{font-size:10px;color:rgba(255,255,255,0.45);margin-top:3px;}
    /* Gold bar */
    .gold-bar{height:3px;background:linear-gradient(90deg,#C9A84C,#e8c76a,#C9A84C);}
    /* Meta */
    .meta{background:#FFFFFF;padding:14px 40px;display:flex;gap:40px;border-bottom:0.5px solid #E5E4E0;}
    .meta-item{}
    .meta-lbl{font-size:9px;text-transform:uppercase;letter-spacing:0.8px;color:#6B6B72;font-weight:600;}
    .meta-val{font-size:13px;font-weight:700;color:#0A0A0B;margin-top:2px;}
    /* Table */
    .content{padding:24px 40px 0;}
    .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;margin-bottom:10px;}
    table{width:100%;border-collapse:collapse;}
    th{padding:8px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#6B6B72;border-top:1.5px solid #C9A84C;border-bottom:1.5px solid #C9A84C;text-align:left;background:#fff;}
    td{padding:8px 12px;border-bottom:0.5px solid #F0EFEC;font-size:11px;color:#0A0A0B;}
    tr:nth-child(even) td{background:#FAFAF9;}
    tr:last-child td{border-bottom:none;}
    /* Footer */
    .footer{background:#0A0A0B;padding:20px 40px;margin-top:32px;}
    .footer-grid{display:flex;gap:40px;}
    .footer-section{}
    .footer-lbl{font-size:9px;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;font-weight:700;margin-bottom:7px;}
    .footer-line{font-size:11px;color:rgba(255,255,255,0.65);margin-bottom:4px;}
    .footer-divider{border:none;border-top:0.5px solid rgba(255,255,255,0.1);margin:14px 0;}
    .footer-bottom{display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,0.3);}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.footer{page-break-inside:avoid;}}
  </style></head><body>
  <div class="hdr">
    <div>
      <div class="brand">Haflaway</div>
      <div class="tagline">Invitations with Class · Guests Welcomed · Perfect Celebration</div>
    </div>
    <div class="hdr-event">
      <div class="hdr-event-name">${eventName}</div>
      <div class="hdr-event-sub">${campaignLabel} Campaign · ${exportedOn}</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="meta">
    ${isContrib ? `
    <div class="meta-item"><div class="meta-lbl">Total Records</div><div class="meta-val">${rows.length} contacts</div></div>
    <div class="meta-item"><div class="meta-lbl">Total Pledged</div><div class="meta-val">TZS ${fmt(totalPledged)}</div></div>
    <div class="meta-item"><div class="meta-lbl">Total Paid</div><div class="meta-val">TZS ${fmt(totalPaid)}</div></div>
    <div class="meta-item"><div class="meta-lbl">Outstanding</div><div class="meta-val">TZS ${fmt(totalPledged - totalPaid)}</div></div>
    <div class="meta-item"><div class="meta-lbl">Exported On</div><div class="meta-val">${exportedOn}</div></div>
    ` : `
    <div class="meta-item"><div class="meta-lbl">Campaign</div><div class="meta-val">${campaignLabel}</div></div>
    <div class="meta-item"><div class="meta-lbl">Total Exported</div><div class="meta-val">${rows.length} attendees</div></div>
    <div class="meta-item"><div class="meta-lbl">WhatsApp Read</div><div class="meta-val">${rows.filter(a => wspStatus(a) === 'read').length}</div></div>
    <div class="meta-item"><div class="meta-lbl">RSVP Confirmed</div><div class="meta-val">${rows.filter(a => a.attendanceStatus === 'Confirmed').length}</div></div>
    <div class="meta-item"><div class="meta-lbl">Exported On</div><div class="meta-val">${exportedOn}</div></div>
    `}
  </div>
  <div class="content">
    <div class="section-title">${isContrib ? (type === 'contribution' ? 'Contribution' : 'Contact') : 'Attendee'} Details</div>
    <table><thead><tr>
      <th>#</th><th>Name</th><th>Phone</th>
      ${isContrib
        ? '<th style="text-align:right">Pledged (TZS)</th><th style="text-align:right">Paid (TZS)</th><th style="text-align:right">Outstanding (TZS)</th><th>RSVP</th><th>Added</th>'
        : '<th>WhatsApp</th><th>SMS</th><th>RSVP</th><th>Added</th>'}
    </tr></thead>
    <tbody>${rows.map((a, i) => {
      const pledged = a.pledgedAmount ?? 0
      const paid    = a.paidAmount ?? 0
      return `<tr>
      <td style="color:#B5B5BB;">${i + 1}</td>
      <td style="font-weight:600;">${a.fullName || ''}</td>
      <td style="color:#6B6B72;">${a.phone || '—'}</td>
      ${isContrib
        ? `<td style="text-align:right">${fmt(pledged)}</td><td style="text-align:right">${fmt(paid)}</td><td style="text-align:right;${(pledged - paid) > 0 ? 'color:#C9A84C;font-weight:600' : ''}">${fmt(pledged - paid)}</td><td>${a.attendanceStatus || 'Not Confirmed'}</td><td style="color:#6B6B72;">${formatDate(a.createdAt)}</td>`
        : `<td>${STATUS_LABELS[wspStatus(a)] || '—'}</td><td>${STATUS_LABELS[smsStatus(a)] || '—'}</td><td>${a.attendanceStatus || 'Not Confirmed'}</td><td style="color:#6B6B72;">${formatDate(a.createdAt)}</td>`}
    </tr>`
    }).join('')}</tbody></table>
  </div>
  <div class="footer">
    <div class="footer-grid">
      <div class="footer-section">
        <div class="footer-lbl">Contact Us</div>
        <div class="footer-line">✉ haflaway@gmail.com</div>
        <div class="footer-line">📞 +255 754 980 535</div>
        <div class="footer-line">📞 +255 615 675 680</div>
      </div>
      <div class="footer-section">
        <div class="footer-lbl">Social Media</div>
        <div class="footer-line">Instagram · @haflaway</div>
        <div class="footer-line">TikTok · @haflaway</div>
      </div>
      <div class="footer-section">
        <div class="footer-lbl">Platform</div>
        <div class="footer-line">haflaway.com</div>
        <div class="footer-line">Plan your perfect event</div>
        <div class="footer-line">Digital invitations & guest management</div>
      </div>
    </div>
    <hr class="footer-divider"/>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Haflaway · All rights reserved</span>
      <span>Generated by Haflaway Event Management Platform</span>
    </div>
  </div>
</body></html>`

  const win = window.open('', '_blank')
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
  showExportDialog.value = false
}

function scrollRow(e, dir) {
  const chips = e.currentTarget.parentElement.querySelector('.em-stat-chips')
  if (chips) chips.scrollBy({ left: dir * 120, behavior: 'smooth' })
}

function toggleFilter(channel, status) {
  if (activeFilter.value?.channel === channel && activeFilter.value?.status === status) {
    activeFilter.value = null
  } else {
    activeFilter.value = { channel, status }
    currentPage.value = 1
  }
}
const isActiveFilter = (channel, status) => activeFilter.value?.channel === channel && activeFilter.value?.status === status

function toggleRsvpFilter(status) {
  rsvpFilter.value = rsvpFilter.value === status ? null : status
  currentPage.value = 1
}
const isActiveRsvpFilter = (status) => rsvpFilter.value === status

const waFilterSelect = computed({
  get: () => activeFilter.value?.channel === 'whatsapp' ? activeFilter.value.status : '',
  set: (v) => { activeFilter.value = v ? { channel: 'whatsapp', status: v } : null; currentPage.value = 1 },
})
const smsFilterSelect = computed({
  get: () => activeFilter.value?.channel === 'sms' ? activeFilter.value.status : '',
  set: (v) => { activeFilter.value = v ? { channel: 'sms', status: v } : null; currentPage.value = 1 },
})
const rsvpFilterSelect = computed({
  get: () => rsvpFilter.value ?? '',
  set: (v) => { rsvpFilter.value = v || null; currentPage.value = 1 },
})

const waDropOpen   = ref(false)
const smsDropOpen  = ref(false)
const rsvpDropOpen = ref(false)

const STATUS_COLORS = {
  unsent:      { bg: 'rgba(255,255,255,0.06)', fg: '#888',    border: 'rgba(255,255,255,0.12)' },
  sent:        { bg: 'rgba(255,159,10,0.10)',  fg: '#B36800', border: 'rgba(255,159,10,0.25)' },
  delivered:   { bg: 'rgba(48,209,88,0.10)',   fg: '#1D7A38', border: 'rgba(48,209,88,0.25)' },
  read:        { bg: 'rgba(0,122,255,0.08)',    fg: '#0060A8', border: 'rgba(0,122,255,0.20)' },
  failed:      { bg: 'rgba(255,69,58,0.10)',    fg: '#C41E1E', border: 'rgba(255,69,58,0.25)' },
  pending:     { bg: 'rgba(255,204,0,0.10)',    fg: '#8B6800', border: 'rgba(255,204,0,0.25)' },
  undelivered: { bg: 'rgba(255,69,58,0.06)',    fg: '#C41E1E', border: 'rgba(255,69,58,0.20)' },
  Confirmed:       { bg: 'rgba(48,209,88,0.10)',   fg: '#1D7A38', border: 'rgba(48,209,88,0.25)' },
  'Not Confirmed': { bg: 'rgba(255,255,255,0.06)', fg: '#888',    border: 'rgba(255,255,255,0.12)' },
  Declined:        { bg: 'rgba(255,69,58,0.10)',   fg: '#C41E1E', border: 'rgba(255,69,58,0.25)' },
  Called:          { bg: 'rgba(100,210,255,0.12)', fg: '#0077A8', border: 'rgba(100,210,255,0.30)' },
  Unreachable:     { bg: 'rgba(255,159,10,0.10)',  fg: '#B36800', border: 'rgba(255,159,10,0.25)' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return '?'
  const p = name.trim().split(/\s+/).filter(Boolean)
  return p.length === 1 ? (p[0][0] ?? '?').toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}
function nameHash(s) { let h = 0; for (let i = 0; i < (s?.length ?? 0); i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) }
function avatarBg(n) { return `hsl(${nameHash(n ?? '') % 360}, 50%, 88%)` }
function avatarFg(n) { return `hsl(${nameHash(n ?? '') % 360}, 50%, 30%)` }
function rsvpColor(s) { return { Confirmed: '#30D158', Declined: '#FF453A', Called: '#64D2FF', Unreachable: '#FF9F0A', 'Not Confirmed': '#8E8E93' }[s] ?? '#8E8E93' }
function formatDate(iso) { if (!iso) return '—'; try { return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '—' } }

onMounted(load)
watch(eventId, () => { if (eventId.value) load() })
</script>

<style scoped>
.em-root {
  display: flex; flex-direction: column;
  gap: 16px;
  padding: 20px 24px 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Mode bar ── */
.em-mode-bar {
  flex-shrink: 0; display: flex; align-items: center; gap: 4px;
  padding: 0 4px;
}
.em-mode-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border: none; background: none;
  font-size: 13px; font-weight: 500; color: #888; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 130ms, border-color 130ms;
}
.em-mode-tab:hover { color: #f0f0ec; }
.em-mode-tab--on { color: #C9A84C; font-weight: 600; border-bottom-color: #C9A84C; }
.em-mode-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 16px; padding: 0 5px;
  border-radius: 8px; background: rgba(201,168,76,0.12); color: #C9A84C;
  font-size: 10px; font-weight: 700;
}

/* ── Panel ── */
.em-panel {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
}
.em-panel-hd {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #1e1e1e;
  gap: 10px;
}
.em-panel-title {
  font-size: 19px; font-weight: 700; color: #f0f0ec;
  margin: 0; letter-spacing: -0.3px; white-space: nowrap;
}
.em-hd-search { margin-left: auto; min-width: 160px; max-width: 260px; flex-shrink: 1; }
.em-panel-acts { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* ── Search ── */
.em-search-wrap  { position: relative; display: flex; align-items: center; width: 100%; }
.em-search-icon  { position: absolute; left: 10px; pointer-events: none; }
.em-search {
  height: 34px; padding: 0 30px 0 32px; border: 1px solid #2a2a2a; border-radius: 8px;
  font-size: 14px; color: #f0f0ec; background: #111111; width: 100%; outline: none; transition: border-color 130ms;
}
.em-search:focus { border-color: #C9A84C; }
.em-search-clear { position: absolute; right: 8px; background: none; border: none; cursor: pointer; color: #555; display: flex; align-items: center; padding: 0; }
/* ── Audience tabs (panel header) ── */
.em-aud-tabs { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.em-aud-tabs::-webkit-scrollbar { display: none; }
.em-aud-tab {
  height: 30px; padding: 0 14px; border-radius: 8px; border: 1px solid transparent;
  background: transparent; font-family: inherit; font-size: 13px; font-weight: 500;
  color: #888; cursor: pointer; transition: all 130ms; white-space: nowrap;
}
.em-aud-tab:hover { background: #1a1a1a; color: #f0f0ec; }
.em-aud-tab--active {
  background: rgba(226,232,240,0.10);
  border-color: rgba(226,232,240,0.15);
  color: #f0f0ec;
  font-weight: 600;
}

/* ── Campaign step strip ── */
.em-steps {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid #1e1e1e;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}
.em-steps::-webkit-scrollbar { display: none; }

.em-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #242424;
  background: #111111;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  flex: 1;
  position: relative;
  transition: border-color 130ms, background 130ms, box-shadow 130ms;
}
.em-step:hover { border-color: #333333; background: #161616; }
.em-step--active {
  border-color: rgba(201,168,76,0.40);
  background: rgba(201,168,76,0.06);
  box-shadow: inset 3px 0 0 #C9A84C;
}
.em-step--has-data::after {
  content: '';
  position: absolute;
  top: 8px; right: 8px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #34d399;
}

.em-step-num {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #242424;
  color: #888;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 130ms, color 130ms;
}
.em-step--active .em-step-num {
  background: rgba(201,168,76,0.15);
  color: #C9A84C;
}
.em-step--has-data:not(.em-step--active) .em-step-num {
  background: rgba(52,211,153,0.10);
  color: #34d399;
}

.em-step-body { display: flex; flex-direction: column; gap: 2px; }
.em-step-label { font-size: 13px; font-weight: 600; color: #b0b0b0; white-space: nowrap; transition: color 130ms; }
.em-step--active .em-step-label { color: #f0f0ec; }
.em-step-hint { font-size: 11px; color: #505050; white-space: nowrap; }

.em-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.em-export-btn {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 14px; border-radius: 8px;
  border: 1px solid #2a2a2a; background: #141414; color: #f0f0ec;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 130ms; font-family: inherit;
}
.em-export-btn:hover { border-color: #C9A84C; color: #C9A84C; }

/* Export dialog */
.em-expd-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 300; display: flex; align-items: center; justify-content: center;
}
.em-expd {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 18px;
  width: 480px; max-width: calc(100vw - 32px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.em-expd-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px 0;
}
.em-expd-title { font-size: 16px; font-weight: 700; color: #f0f0ec; }
.em-expd-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid #2a2a2a;
  background: rgba(255,255,255,0.06); color: #888; cursor: pointer; transition: background 120ms;
}
.em-expd-close:hover { background: rgba(255,255,255,0.10); color: #f0f0ec; }
.em-expd-body { padding: 16px 22px 4px; }
.em-expd-label {
  font-size: 10.5px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: #888; margin-bottom: 10px;
}
.em-expd-type-grid { display: flex; flex-direction: column; gap: 8px; }
.em-expd-type-card {
  display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 12px 14px; border-radius: 11px; border: 1.5px solid #2a2a2a;
  background: #111111; cursor: pointer; text-align: left; font-family: inherit;
  transition: border-color 130ms, background 130ms;
}
.em-expd-type-card:hover { border-color: #C9A84C; background: rgba(201,168,76,0.05); }
.em-expd-type-card--on { border-color: #C9A84C; background: rgba(201,168,76,0.05); }
.em-expd-type-card svg { color: #C9A84C; flex-shrink: 0; }
.em-expd-type-name { font-size: 13.5px; font-weight: 600; color: #f0f0ec; white-space: nowrap; }
.em-expd-type-desc { font-size: 11.5px; color: #888; margin-top: 1px; }
.em-expd-type-card > div, .em-expd-type-card span { display: block; }
.em-expd-type-card { flex-direction: row; }
.em-expd-type-card > svg + * { display: flex; flex-direction: column; }
.em-expd-fmt-row { display: flex; gap: 8px; }
.em-expd-fmt-btn {
  display: flex; align-items: center; gap: 7px; flex: 1;
  padding: 10px 14px; border-radius: 10px; border: 1.5px solid #2a2a2a;
  background: #111111; font-size: 13px; font-weight: 500; color: #888;
  cursor: pointer; font-family: inherit; transition: border-color 130ms, color 130ms;
}
.em-expd-fmt-btn:hover { border-color: #f0f0ec; color: #f0f0ec; }
.em-expd-fmt-btn--on { border-color: #f0f0ec; color: #f0f0ec; font-weight: 600; }
.em-expd-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 22px 20px;
}
.em-send-btn {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  height: 34px; padding: 0 16px; border-radius: 8px;
  background: #C9A84C; color: #0e0e0e; border: none;
  font-size: 13px; font-weight: 700; cursor: pointer; transition: background 130ms;
}
.em-send-btn:hover { background: #d4b560; }

/* ── Stats ── */
.em-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.em-stat-block {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3); min-width: 0;
}

/* Card top: icon + headline number */
.em-stat-card-top { display: flex; align-items: center; gap: 14px; }
.em-stat-card-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.em-stat-card-icon--wa   { background: rgba(18,140,126,0.10); }
.em-stat-card-icon--sms  { background: rgba(88,86,214,0.10); }
.em-stat-card-icon--rsvp { background: rgba(52,211,153,0.10); }
.em-stat-card-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.em-stat-card-val { font-size: 28px; font-weight: 700; color: #f0f0ec; line-height: 1; letter-spacing: -0.5px; }
.em-stat-card-lbl { font-size: 11px; color: #777; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }

.em-stat-dd { position: relative; margin-top: 10px; }
.em-stat-dd-trigger {
  width: 100%; height: 32px;
  display: flex; align-items: center; gap: 7px;
  padding: 0 10px;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  background: #111;
  color: #888;
  font-family: inherit; font-size: 12px; font-weight: 500;
  cursor: pointer; outline: none;
  transition: border-color 130ms, background 130ms, color 130ms;
}
.em-stat-dd-trigger:hover { border-color: #3a3a3a; }
.em-stat-dd-label { flex: 1; text-align: left; }
.em-stat-dd-chev { flex-shrink: 0; transition: transform 180ms; }
.em-stat-dd-chev--open { transform: rotate(180deg); }
.em-stat-dd-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.em-stat-dd-menu {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #161616; border: 1px solid #2a2a2a;
  border-radius: 9px; overflow: hidden;
  z-index: 60;
  box-shadow: 0 8px 24px rgba(0,0,0,0.45);
}
.em-stat-dd-item {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 8px 10px;
  border: none; background: none;
  font-family: inherit; font-size: 12px; font-weight: 500;
  color: #888; cursor: pointer; text-align: left;
  transition: background 120ms;
}
.em-stat-dd-item:hover { background: rgba(255,255,255,0.04); }
.em-stat-dd-item--on  { background: rgba(255,255,255,0.05); color: #d4cfc8; }
.em-stat-dd-n { font-weight: 700; }

.em-chips-wrap { display: flex; align-items: center; gap: 4px; min-width: 0; }
.em-chips-arrow {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
  border: 1px solid #2a2a2a; background: #141414;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #888; transition: all 130ms;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.em-chips-arrow:hover { border-color: #C9A84C; color: #C9A84C; }
.em-stat-big      { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; line-height: 1; color: #f0f0ec; }
.em-stat-block-lbl{ font-size: 11px; color: #777; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.6px; }
.em-stat-block-hd { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; }
.em-stat-block-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #888; }
.em-stat-chips {
  display: flex; flex-wrap: nowrap; gap: 4px;
  overflow-x: auto; cursor: grab; flex: 1; min-width: 0;
  -ms-overflow-style: none; scrollbar-width: none;
}
.em-stat-chips::-webkit-scrollbar { display: none; }
.em-stat-chip  { display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 3px 8px; border-radius: 20px; border: 1px solid transparent; cursor: pointer; transition: all 130ms; font-family: inherit; flex: 1; min-width: max-content; white-space: nowrap; }
.em-stat-chip:hover { filter: brightness(0.95); }
.em-sc-n   { font-size: 13px; font-weight: 800; line-height: 1; }
.em-sc-lbl { font-size: 11px; font-weight: 500; }
.em-sc--unsent      { background: rgba(255,255,255,0.06); color: #888; border-color: #2a2a2a; }
.em-sc--sent        { background: rgba(255,159,10,0.10); color: #B36800; border-color: rgba(255,159,10,0.2); }
.em-sc--delivered   { background: rgba(48,209,88,0.10); color: #1D7A38; border-color: rgba(48,209,88,0.2); }
.em-sc--read        { background: rgba(0,122,255,0.08); color: #0060A8; border-color: rgba(0,122,255,0.15); }
.em-sc--failed      { background: rgba(255,69,58,0.10); color: #C41E1E; border-color: rgba(255,69,58,0.2); }
.em-sc--pending     { background: rgba(255,204,0,0.10); color: #8B6800; border-color: rgba(255,204,0,0.2); }
.em-sc--undelivered { background: rgba(255,69,58,0.06); color: #C41E1E; border-color: rgba(255,69,58,0.15); }
.em-sc--on.em-sc--unsent      { background: #6B6B72; color: #fff; border-color: #6B6B72; }
.em-sc--on.em-sc--sent        { background: #B36800; color: #fff; border-color: #B36800; }
.em-sc--on.em-sc--delivered   { background: #1D7A38; color: #fff; border-color: #1D7A38; }
.em-sc--on.em-sc--read        { background: #0060A8; color: #fff; border-color: #0060A8; }
.em-sc--on.em-sc--failed      { background: #C41E1E; color: #fff; border-color: #C41E1E; }
.em-sc--on.em-sc--pending     { background: #8B6800; color: #fff; border-color: #8B6800; }
.em-sc--on.em-sc--undelivered { background: #C41E1E; color: #fff; border-color: #C41E1E; }
.em-sc--rsvp-confirmed     { background: rgba(48,209,88,0.10);  color: #1D7A38; border-color: rgba(48,209,88,0.2); }
.em-sc--rsvp-not-confirmed { background: rgba(255,255,255,0.06); color: #888; border-color: #2a2a2a; }
.em-sc--rsvp-declined      { background: rgba(255,69,58,0.10);  color: #C41E1E; border-color: rgba(255,69,58,0.2); }
.em-sc--rsvp-called        { background: rgba(100,210,255,0.12); color: #0077A8; border-color: rgba(100,210,255,0.25); }
.em-sc--rsvp-unreachable   { background: rgba(255,159,10,0.10); color: #B36800; border-color: rgba(255,159,10,0.2); }
.em-sc--on.em-sc--rsvp-confirmed     { background: #1D7A38; color: #fff; border-color: #1D7A38; }
.em-sc--on.em-sc--rsvp-not-confirmed { background: #6B6B72; color: #fff; border-color: #6B6B72; }
.em-sc--on.em-sc--rsvp-declined      { background: #C41E1E; color: #fff; border-color: #C41E1E; }
.em-sc--on.em-sc--rsvp-called        { background: #0077A8; color: #fff; border-color: #0077A8; }
.em-sc--on.em-sc--rsvp-unreachable   { background: #B36800; color: #fff; border-color: #B36800; }

/* ── Table (shared) ── */
.em-table-wrap  { display: flex; flex-direction: column; background: #141414; border-top: 1px solid #1e1e1e; overflow: hidden; }

/* ── Guest card list ── */
.em-guest-list {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px 16px; background: #0d0d0d;
}

.em-gc {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 16px;
  background: #141414;
  border: 1px solid #202020;
  border-radius: 12px;
  transition: background 150ms, border-color 150ms, box-shadow 150ms;
  overflow: hidden;
}
.em-gc:hover:not(.em-gc--sk) {
  background: #191919; border-color: #2c2c2c;
  box-shadow: 0 4px 16px rgba(0,0,0,0.35);
}
.em-gc--sk { pointer-events: none; }

/* Left border colour = WA delivery tier */
.em-gc--wa-read        { box-shadow: inset 3px 0 0 rgba(0,122,255,0.55); }
.em-gc--wa-delivered   { box-shadow: inset 3px 0 0 rgba(48,209,88,0.55); }
.em-gc--wa-sent        { box-shadow: inset 3px 0 0 rgba(255,159,10,0.55); }
.em-gc--wa-failed,
.em-gc--wa-undelivered { box-shadow: inset 3px 0 0 rgba(255,69,58,0.55); }
.em-gc--wa-unsent,
.em-gc--wa-null,
.em-gc--wa-undefined   { box-shadow: inset 3px 0 0 rgba(255,255,255,0.07); }
.em-gc:hover.em-gc--wa-read        { box-shadow: 0 4px 16px rgba(0,0,0,0.35), inset 3px 0 0 rgba(0,122,255,0.55); }
.em-gc:hover.em-gc--wa-delivered   { box-shadow: 0 4px 16px rgba(0,0,0,0.35), inset 3px 0 0 rgba(48,209,88,0.55); }
.em-gc:hover.em-gc--wa-sent        { box-shadow: 0 4px 16px rgba(0,0,0,0.35), inset 3px 0 0 rgba(255,159,10,0.55); }
.em-gc:hover.em-gc--wa-failed,
.em-gc:hover.em-gc--wa-undelivered { box-shadow: 0 4px 16px rgba(0,0,0,0.35), inset 3px 0 0 rgba(255,69,58,0.55); }
.em-gc:hover.em-gc--wa-unsent      { box-shadow: 0 4px 16px rgba(0,0,0,0.35), inset 3px 0 0 rgba(255,255,255,0.07); }

/* Avatar */
.em-gc-av-wrap { position: relative; flex-shrink: 0; }
.em-gc-avatar  {
  width: 40px; height: 40px; border-radius: 11px;
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.em-gc-rsvp-dot {
  position: absolute; bottom: -2px; right: -2px;
  width: 11px; height: 11px; border-radius: 50%;
  border: 2.5px solid #141414;
}
.em-gc:hover .em-gc-rsvp-dot { border-color: #191919; }

/* Identity */
.em-gc-info {
  display: flex; flex-direction: column; gap: 3px;
  flex: 0 0 190px; min-width: 0;
}
.em-gc-name {
  font-size: 13px; font-weight: 600; color: #e8e4dd;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: 0.01em;
}
.em-gc-meta { font-size: 11px; color: #505050; letter-spacing: 0.02em; }

/* Status badges zone */
.em-gc-statuses {
  flex: 1; display: flex; align-items: center;
  gap: 6px; flex-wrap: wrap; justify-content: flex-end;
}

.em-gc-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
  border: 1px solid transparent;
}
.em-gc-ch-icon { flex-shrink: 0; opacity: 0.8; }
.em-gc-ch-icon--wa  { color: #128C7E; }
.em-gc-ch-icon--sms { color: #5856D6; }

/* Badge status colours */
.em-gc-badge--null,
.em-gc-badge--undefined,
.em-gc-badge--unsent      { background: rgba(255,255,255,0.04); color: #555; border-color: #222; }
.em-gc-badge--sent        { background: rgba(255,159,10,0.10);  color: #B36800; border-color: rgba(255,159,10,0.20); }
.em-gc-badge--delivered   { background: rgba(48,209,88,0.10);   color: #1D7A38; border-color: rgba(48,209,88,0.20); }
.em-gc-badge--read        { background: rgba(0,122,255,0.08);   color: #0060A8; border-color: rgba(0,122,255,0.18); }
.em-gc-badge--failed      { background: rgba(255,69,58,0.10);   color: #C41E1E; border-color: rgba(255,69,58,0.20); }
.em-gc-badge--undelivered { background: rgba(255,69,58,0.07);   color: #C41E1E; border-color: rgba(255,69,58,0.15); }
.em-gc-badge--pending     { background: rgba(255,204,0,0.10);   color: #8B6800; border-color: rgba(255,204,0,0.20); }

.em-gc-rsvp-lbl {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; color: #666; white-space: nowrap;
}

/* Date */
.em-gc-date {
  font-size: 11px; color: #3a3a3a;
  white-space: nowrap; flex-shrink: 0;
  min-width: 68px; text-align: right;
  letter-spacing: 0.02em;
}

/* Mobile */

.em-avatar    { width: 36px; height: 36px; border-radius: 9px; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.em-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;
}
.em-badge--sm { font-size: 11px; padding: 2px 7px; }
.em-badge--null, .em-badge--undefined { background: transparent; color: #555; }
.em-badge--unsent      { background: rgba(255,255,255,0.06); color: #888; }
.em-badge--sent        { background: rgba(255,159,10,0.12); color: #f59e0b; }
.em-badge--delivered   { background: rgba(52,211,153,0.12); color: #34d399; }
.em-badge--read        { background: rgba(99,179,237,0.12); color: #63b3ed; }
.em-badge--failed      { background: rgba(255,69,58,0.12);  color: #C41E1E; }
.em-badge--pending     { background: rgba(255,204,0,0.12);  color: #8B6800; }
.em-badge--undelivered { background: rgba(255,69,58,0.08);  color: #C41E1E; }
.em-rsvp-cell { display: flex; align-items: center; gap: 6px; }
.em-rsvp-dot  { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.em-rsvp-text { font-size: 13px; color: #888; }
.em-sk-name   { display: flex; align-items: center; gap: 9px; }
.em-sk-circle { width: 32px; height: 32px; border-radius: 8px; background: #2a2a2a; flex-shrink: 0; animation: em-pulse 1.4s ease-in-out infinite; }
.em-sk-bar    { height: 12px; border-radius: 6px; background: #2a2a2a; width: 90px; animation: em-pulse 1.4s ease-in-out infinite; }
.em-sk-bar--lg{ width: 130px; }
.em-sk-bar--sm{ width: 60px; }
@keyframes em-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.em-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; text-align: center; }
.em-empty-icon  { margin-bottom: 16px; }
.em-empty-title { font-size: 16px; font-weight: 700; color: #f0f0ec; margin: 0 0 6px; }
.em-empty-sub   { font-size: 14px; color: #888; margin: 0 0 16px; max-width: 300px; }
.em-empty-cta   { height: 34px; padding: 0 16px; border-radius: 8px; border: 1px solid #2a2a2a; background: #141414; font-size: 14px; font-weight: 500; color: #f0f0ec; cursor: pointer; transition: background 130ms; }
.em-empty-cta:hover { background: #1a2236; }
.em-empty-cta--primary { background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%); color: #f0f0ec; border-color: transparent; }
.em-empty-cta--primary:hover { opacity: 0.85; }
.em-table-footer { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; background: #141414; border-top: 1px solid #2a2a2a; }
.em-range-lbl   { font-size: 13px; color: #888; }
.em-filter-clear { background: none; border: none; cursor: pointer; font-size: 13px; color: #C9A84C; font-weight: 600; padding: 0; font-family: inherit; }
.em-filter-clear:hover { color: #f0f0ec; }
.em-paginator   { display: flex; align-items: center; gap: 4px; }
.em-paginator--disabled { opacity: 0.38; pointer-events: none; }
.em-page-btn    { min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 1px solid #2a2a2a; background: #141414; font-size: 13px; font-weight: 500; color: #888; cursor: pointer; transition: all 130ms; display: flex; align-items: center; justify-content: center; }
.em-page-btn:hover:not(:disabled) { background: #1a2236; }
.em-page-btn:disabled { opacity: 0.4; cursor: default; }
.em-page-btn--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #f0f0ec; }
.em-page-btn--nav    { color: #888; }
.em-page-ellipsis   { font-size: 13px; color: #555; padding: 0 4px; }

/* ── Custom campaigns: toolbar & grid ── */
.em-custom-toolbar {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 12px; background: #141414; border-bottom: 1px solid #2a2a2a;
}
.em-custom-title { font-size: 20px; font-weight: 800; color: #f0f0ec; margin: 0 0 2px; letter-spacing: -0.3px; }
.em-custom-sub   { font-size: 13px; color: #888; margin: 0; }
.em-custom-body  { display: flex; flex-direction: column; }
.em-custom-scroll { overflow-x: auto; }
.em-custom-loading { display: flex; align-items: center; gap: 10px; color: #888; font-size: 14px; padding: 40px 0; justify-content: center; }
.em-custom-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; text-align: center; }
.em-camp-table-wrap { }
.em-camp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.em-camp-table thead tr { border-bottom: 1px solid #2a2a2a; }
.em-camp-table th { padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; position: sticky; top: 0; z-index: 1; background: #111111; }
.em-camp-row { cursor: pointer; border-bottom: 1px solid #2a2a2a; transition: background 120ms; }
.em-camp-row:last-child { border-bottom: none; }
.em-camp-row:hover { background: #1a2236; }
.em-ct-name { padding: 10px 12px; font-weight: 600; color: #f0f0ec; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
.em-ct-type { padding: 10px 12px; white-space: nowrap; }
.em-ct-type-badge { display: inline-block; padding: 2px 8px; border-radius: 20px; background: rgba(255,255,255,0.06); font-size: 11px; font-weight: 600; color: #888; text-transform: capitalize; }
.em-ct-date { padding: 10px 12px; color: #888; white-space: nowrap; font-size: 12px; }
.em-ct-actions { padding: 10px 12px; display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
.em-camp-footer--disabled { opacity: 0.38; pointer-events: none; }
.em-camp-items   { display: flex; flex-direction: column; gap: 8px; }
.em-camp-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; background: #141414; border: 1px solid #2a2a2a;
  border-radius: 12px; cursor: pointer; transition: border-color 130ms, box-shadow 130ms;
}
.em-camp-item:hover { border-color: #C9A84C; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.em-camp-item-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(255,255,255,0.06); border: 1px solid #2a2a2a;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.em-camp-item-info   { flex: 1; min-width: 0; }
.em-camp-item-name   { display: block; font-size: 14px; font-weight: 600; color: #f0f0ec; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-camp-item-meta   { display: block; font-size: 12px; color: #888; margin-top: 2px; text-transform: capitalize; }
.em-camp-item-actions { display: flex; gap: 4px; flex-shrink: 0; }
.em-camp-item-btn {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid #2a2a2a;
  background: rgba(255,255,255,0.04); color: #888; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 130ms;
}
.em-camp-item-btn:hover { background: #1a2236; color: #f0f0ec; border-color: #2a2a2a; }
.em-camp-item-btn--del:hover { background: rgba(255,69,58,0.08); color: #C41E1E; border-color: rgba(255,69,58,0.25); }

/* ── Custom campaign detail ── */
.em-detail-top {
  flex-shrink: 0; display: flex; align-items: center; gap: 12px;
  padding: 14px 24px; background: #141414; border-bottom: 1px solid #2a2a2a;
}
.em-detail-back {
  display: flex; align-items: center; gap: 5px; background: none; border: none;
  font-size: 13px; color: #888; cursor: pointer; transition: color 130ms; flex-shrink: 0;
}
.em-detail-back:hover { color: #C9A84C; }
.em-detail-title { flex: 1; font-size: 18px; font-weight: 700; color: #f0f0ec; margin: 0; letter-spacing: -0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-detail-type  { font-size: 11px; font-weight: 600; color: #888; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 20px; white-space: nowrap; text-transform: capitalize; flex-shrink: 0; }
.em-detail-filters {
  flex-shrink: 0; display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding: 12px 16px; background: #111111; border: 1px solid #2a2a2a; border-radius: 10px;
}
.em-filter-group { display: flex; align-items: center; gap: 8px; }
.em-filter-lbl   { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
.em-filter-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.em-filter-pill  {
  height: 28px; padding: 0 12px; border-radius: 20px; border: 1px solid transparent;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all 130ms; font-family: inherit;
}
.em-filter-pill:hover { filter: brightness(0.94); }
/* per-status base colors */
.em-filter-pill--all       { background: rgba(255,255,255,0.06); color: #888; border-color: #2a2a2a; }
.em-filter-pill--unsent    { background: rgba(255,255,255,0.06); color: #888; border-color: #2a2a2a; }
.em-filter-pill--sent      { background: rgba(255,159,10,0.10); color: #f59e0b; border-color: rgba(255,159,10,0.2); }
.em-filter-pill--delivered { background: rgba(52,211,153,0.10); color: #34d399; border-color: rgba(52,211,153,0.2); }
.em-filter-pill--failed    { background: rgba(255,69,58,0.10);  color: #fc8181; border-color: rgba(255,69,58,0.2); }
/* active: frosted */
.em-filter-pill--all.em-filter-pill--on       { background: rgba(226,232,240,0.15); color: #f0f0ec; border-color: rgba(226,232,240,0.2); }
.em-filter-pill--unsent.em-filter-pill--on    { background: #555; color: #f0f0ec; border-color: #555; }
.em-filter-pill--sent.em-filter-pill--on      { background: #B36800; color: #fff; border-color: #B36800; }
.em-filter-pill--delivered.em-filter-pill--on { background: #1D7A38; color: #fff; border-color: #1D7A38; }
.em-filter-pill--failed.em-filter-pill--on    { background: #C41E1E; color: #fff; border-color: #C41E1E; }
.em-fp-n { font-size: 13px; font-weight: 800; line-height: 1; }
.em-filter-select {
  height: 28px; padding: 0 8px; border: 1px solid #2a2a2a; border-radius: 7px;
  background: #111111; font-size: 12px; color: #f0f0ec; outline: none; cursor: pointer;
  color-scheme: dark;
}
.em-filter-select:focus { border-color: #C9A84C; }
.em-filter-select--drawer { height: 32px; font-size: 13px; flex: 1; }
.em-detail-filters--sys { padding: 8px 24px; }
.em-drawer-list-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.em-drawer-list-lbl { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.em-detail-count { margin-left: auto; font-size: 12px; color: #888; white-space: nowrap; }
.em-detail-table-wrap { overflow-x: auto; }

/* ── Floating action bar ── */
.em-action-bar {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px; background: #1a2236; border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5); white-space: nowrap;
  border: 1px solid #2a2a2a;
}
.em-action-count { font-size: 13px; font-weight: 600; color: #d4cfc8; }
.em-action-btn {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 16px; border-radius: 8px; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 130ms;
}
.em-action-btn:hover { opacity: 0.88; }
.em-action-btn--sms { background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%); color: #f0f0ec; }
.em-action-btn--sms:hover { opacity: 1; background: rgba(201,168,76,0.2); }

/* ── Send Drawer ── */
.em-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 1000; display: flex; align-items: stretch; justify-content: flex-end; }
.em-overlay--center { align-items: center; justify-content: center; }
.em-drawer  { width: 400px; max-width: 95vw; height: 100%; background: #141414; display: flex; flex-direction: column; box-shadow: -8px 0 32px rgba(0,0,0,0.45); }
.em-drawer-header { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #2a2a2a; }
.em-drawer-header-left { display: flex; align-items: center; gap: 8px; }
.em-drawer-title { font-size: 16px; font-weight: 700; color: #f0f0ec; }
.em-drawer-close { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.06); border: none; cursor: pointer; color: #888; display: flex; align-items: center; justify-content: center; transition: background 130ms; }
.em-drawer-close:hover { background: rgba(255,255,255,0.10); }
.em-send-result { flex-shrink: 0; display: flex; align-items: flex-start; gap: 10px; padding: 12px 20px; font-size: 13px; }
.em-send-result--ok  { background: rgba(48,209,88,0.08);  color: #34d399; border-bottom: 1px solid rgba(48,209,88,0.2); }
.em-send-result--err { background: rgba(255,69,58,0.08);  color: #C41E1E; border-bottom: 1px solid rgba(255,69,58,0.2); }
.em-result-title { font-weight: 700; margin: 0 0 2px; }
.em-result-msg   { margin: 0; opacity: 0.8; }
.em-result-dismiss { margin-left: auto; background: none; border: none; cursor: pointer; font-size: 12px; opacity: 0.7; color: inherit; flex-shrink: 0; }
.em-result-dismiss:hover { opacity: 1; }
.em-drawer-body  { flex: 1; overflow-y: auto; padding: 0 20px 20px; }
.em-drawer-section { padding: 18px 0; border-bottom: 1px solid #2a2a2a; }
.em-drawer-section:last-child { border-bottom: none; }
.em-drawer-section-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 12px; }
.em-camp-grid-wrap { display: flex; align-items: center; gap: 4px; }
.em-camp-grid    { display: flex; flex-wrap: nowrap; gap: 8px; overflow-x: auto; scrollbar-width: none; flex: 1; }
.em-camp-grid::-webkit-scrollbar { display: none; }
.em-locked-camp {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: #141414; border: 1px solid #2a2a2a; border-radius: 10px;
}
.em-locked-camp-icon {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  background: rgba(201,168,76,0.10); border: 1px solid rgba(201,168,76,0.20);
  display: flex; align-items: center; justify-content: center; color: #C9A84C;
}
.em-locked-camp-body { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.em-locked-camp-label { font-size: 14px; font-weight: 600; color: #f0f0ec; }
.em-locked-camp-hint  { font-size: 11px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-locked-camp-badge {
  display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: 10px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.5px;
}

.em-camp-card    { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; border: 1px solid #2a2a2a; background: #111111; font-size: 13px; font-weight: 500; color: #888; cursor: pointer; transition: all 130ms; text-align: left; flex-shrink: 0; min-width: 140px; }
.em-camp-card:hover { border-color: #C9A84C; color: #f0f0ec; }
.em-camp-card--active { border-color: rgba(226,232,240,0.25); background: rgba(226,232,240,0.08); color: #f0f0ec; font-weight: 600; }
.em-camp-card-icon  { display: flex; align-items: center; flex-shrink: 0; }
.em-camp-card-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-custom-camp-display {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 10px;
  border: 1px solid rgba(201,168,76,0.3); background: rgba(201,168,76,0.06);
  font-size: 14px; font-weight: 600; color: #f0f0ec;
}
.em-custom-camp-type { margin-left: auto; font-size: 11px; font-weight: 500; color: #888; text-transform: capitalize; }
.em-send-ch-toggle { display: flex; gap: 8px; }
.em-send-ch-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; height: 40px; border-radius: 10px; border: 1px solid #2a2a2a; background: #141414; font-size: 14px; font-weight: 500; color: #888; cursor: pointer; transition: all 130ms; }
.em-send-ch-btn:hover { border-color: #C9A84C; color: #C9A84C; }
.em-send-ch-btn--wsp { background: rgba(201,168,76,0.12); color: #C9A84C; border-color: #C9A84C; font-weight: 600; }
.em-send-ch-btn--sms { background: rgba(201,168,76,0.12); color: #C9A84C; border-color: #C9A84C; font-weight: 600; }
.em-ch-sms-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(88,86,214,0.3); background: rgba(88,86,214,0.1); }
.em-ch-sms-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(88,86,214,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.em-ch-sms-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.em-ch-sms-name { font-size: 13px; font-weight: 600; color: #f0f0ec; }
.em-ch-sms-note { font-size: 11px; color: #888; }
.em-ch-sms-badge { display: flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 20px; background: #5856D6; color: #fff; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.em-recip-dd { margin-top: 0; margin-bottom: 10px; }
.em-recip-chips-wrap { display: flex; align-items: center; gap: 4px; margin-bottom: 10px; }
.em-chips-arrow { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; border: 1px solid #2a2a2a; background: #141414; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: all 120ms; }
.em-chips-arrow:hover { border-color: #C9A84C; color: #C9A84C; }
.em-recip-chips { flex: 1; display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
.em-recip-chips::-webkit-scrollbar { display: none; }
.em-recip-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 20px; border: 1px solid #2a2a2a; background: #111111; font-size: 12px; font-weight: 500; color: #888; cursor: pointer; transition: all 130ms; white-space: nowrap; }
.em-recip-chip:hover { border-color: #C9A84C; }
.em-recip-chip--on { font-weight: 700; }
.em-recip-chip--unsent.em-recip-chip--on      { background: rgba(201,168,76,0.08); border-color: #C9A84C; color: #C9A84C; }
.em-recip-chip--sent.em-recip-chip--on        { background: rgba(59,130,246,0.12); border-color: #3B82F6; color: #63b3ed; }
.em-recip-chip--delivered.em-recip-chip--on   { background: rgba(52,211,153,0.12); border-color: #34d399; color: #34d399; }
.em-recip-chip--read.em-recip-chip--on        { background: rgba(52,211,153,0.08); border-color: #34d399; color: #34d399; }
.em-recip-chip--undelivered.em-recip-chip--on { background: rgba(249,115,22,0.12); border-color: #f97316; color: #f97316; }
.em-recip-chip--failed.em-recip-chip--on      { background: rgba(239,68,68,0.12); border-color: #ef4444; color: #fc8181; }
.em-recip-chip--all.em-recip-chip--on         { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.2); color: #f0f0ec; }
.em-chip-cnt { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 16px; padding: 0 4px; border-radius: 8px; background: rgba(255,255,255,0.08); font-size: 10px; font-weight: 700; }
.em-chip-cnt--gold { background: rgba(201,168,76,0.2); color: #C9A84C; }
.em-pick-toggle-btn { width: 100%; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 10px; border: 1px solid #2a2a2a; background: #141414; font-size: 13px; font-weight: 500; color: #888; cursor: pointer; transition: all 130ms; margin-bottom: 8px; }
.em-pick-toggle-btn:hover { border-color: #C9A84C; }
.em-pick-toggle-btn--on { border-color: #C9A84C; background: rgba(201,168,76,0.06); color: #C9A84C; font-weight: 600; }
.em-recip-hint { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #888; margin: 0; }
.em-pick-wrap { margin-top: 10px; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; }
.em-pick-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-bottom: 1px solid #2a2a2a; background: #111111; }
.em-pick-search-wrap { flex: 1; display: flex; align-items: center; gap: 6px; background: #141414; border: 1px solid #2a2a2a; border-radius: 8px; padding: 5px 8px; }
.em-pick-search { flex: 1; border: none; outline: none; font-size: 12px; color: #f0f0ec; background: transparent; }
.em-pick-clear { background: none; border: none; padding: 0; cursor: pointer; color: #555; display: flex; }
.em-pick-all-btn { flex-shrink: 0; font-size: 11px; font-weight: 600; color: #C9A84C; background: none; border: none; cursor: pointer; padding: 4px 6px; white-space: nowrap; }
.em-pick-list { max-height: 220px; overflow-y: auto; }
.em-pick-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #2a2a2a; transition: background 100ms; }
.em-pick-row:last-child { border-bottom: none; }
.em-pick-row:hover { background: #1a2236; }
.em-pick-row--on { background: rgba(201,168,76,0.05); }
.em-pick-cb { width: 15px; height: 15px; accent-color: #C9A84C; flex-shrink: 0; cursor: pointer; }
.em-pick-avatar { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.em-pick-info { flex: 1; min-width: 0; }
.em-pick-name { display: block; font-size: 12px; font-weight: 600; color: #f0f0ec; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-pick-phone { display: block; font-size: 11px; color: #888; }
.em-badge--sm { font-size: 10px; padding: 2px 6px; }
.em-pick-empty { padding: 20px; text-align: center; font-size: 12px; color: #888; }
.em-selected-recip-display {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 10px;
  border: 1px solid rgba(201,168,76,0.3); background: rgba(201,168,76,0.06);
  font-size: 14px; color: #f0f0ec;
}
.em-tpl-loading { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: #C9A84C; font-weight: 500; text-transform: none; letter-spacing: 0; }
.em-tpl-empty   { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #888; padding: 12px; border: 0.8px dashed #2a2a2a; border-radius: 10px; }
.em-tpl-list    { display: flex; flex-direction: column; gap: 8px; }
.em-tpl-item    { display: flex; align-items: flex-start; gap: 10px; padding: 12px; border-radius: 10px; border: 1px solid #2a2a2a; background: #111111; cursor: pointer; transition: all 130ms; }
.em-tpl-item:hover { border-color: #C9A84C; }
.em-tpl-item--active { border-color: rgba(226,232,240,0.2); background: rgba(226,232,240,0.06); }
.em-tpl-radio   { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #C9A84C; flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; }
.em-tpl-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #C9A84C; }
.em-tpl-body    { flex: 1; min-width: 0; }
.em-tpl-content { font-size: 13px; color: #f0f0ec; margin: 0 0 4px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
.em-tpl-meta    { font-size: 11px; color: #555; margin: 0; }
.em-drawer-footer { flex-shrink: 0; display: flex; gap: 10px; padding: 14px 20px; border-top: 1px solid #2a2a2a; background: #141414; }
.em-drawer-cancel { flex: 1; height: 40px; border-radius: 10px; border: 1px solid #2a2a2a; background: rgba(255,255,255,0.05); font-size: 14px; font-weight: 500; color: #888; cursor: pointer; transition: background 130ms; }
.em-drawer-cancel:hover { background: rgba(255,255,255,0.09); }
.em-drawer-send { flex: 2; height: 40px; border-radius: 10px; background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%); color: #f0f0ec; border: none; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: opacity 130ms; }
.em-drawer-send:hover:not(:disabled) { opacity: 0.85; }
.em-drawer-send:disabled { opacity: 0.45; cursor: default; }

/* ── Campaign dialog ── */
.em-dialog {
  width: 400px; max-width: 95vw; background: #141414;
  border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  border: 1px solid #2a2a2a; overflow: hidden;
}
.em-dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #2a2a2a; }
.em-dialog-title  { font-size: 16px; font-weight: 700; color: #f0f0ec; margin: 0; }
.em-dialog-body   { padding: 20px; }
.em-dialog-lbl    { display: block; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
.em-dialog-input  {
  width: 100%; height: 40px; padding: 0 12px; border: 1px solid #2a2a2a;
  border-radius: 10px; font-size: 14px; color: #f0f0ec; background: #111111;
  outline: none; box-sizing: border-box; transition: border-color 130ms;
}
.em-dialog-input:focus { border-color: #C9A84C; }
.em-dialog-type-row { display: flex; gap: 8px; }
.em-dialog-type-btn {
  flex: 1; height: 36px; border-radius: 9px; border: 1px solid #2a2a2a;
  background: #141414; font-size: 13px; font-weight: 500; color: #888; cursor: pointer; transition: all 130ms;
}
.em-dialog-type-btn:hover { border-color: #C9A84C; color: #f0f0ec; }
.em-dialog-type-btn--on { border-color: #C9A84C; background: rgba(201,168,76,0.06); color: #C9A84C; font-weight: 600; }
.em-dialog-footer { display: flex; gap: 10px; padding: 14px 20px; border-top: 1px solid #2a2a2a; }

/* ── Animations ── */
.em-spin { animation: em-rotate 0.8s linear infinite; }
@keyframes em-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.em-fade-enter-active, .em-fade-leave-active { transition: opacity 180ms; }
.em-fade-enter-from,  .em-fade-leave-to     { opacity: 0; }
.em-slide-right-enter-active, .em-slide-right-leave-active { transition: transform 220ms cubic-bezier(0.4,0,0.2,1); }
.em-slide-right-enter-from,  .em-slide-right-leave-to     { transform: translateX(100%); }
.em-slide-up-enter-active, .em-slide-up-leave-active { transition: transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 180ms; }
.em-slide-up-enter-from,   .em-slide-up-leave-to    { transform: translateX(-50%) translateY(20px); opacity: 0; }

/* ── Responsive ── */

/* Stat cards → 1 column on tablet */
@media (max-width: 860px) {
  .em-stats { grid-template-columns: 1fr; }
}

/* Panel header — medium screens (960px):
   Row 1: [Title] [Search flex:1] [Export] [Send]
   Row 2: [Invitation Guests] [Contribution Guests] */
@media (max-width: 960px) {
  .em-panel-hd { flex-wrap: wrap; padding: 12px 16px; gap: 8px; }
  .em-hd-search { flex: 1; min-width: 140px; max-width: none; margin-left: 0; }
  .em-search { width: 100%; }
  .em-search-wrap { width: 100%; }
  .em-aud-tabs {
    order: 3; width: 100%;
    border-top: 1px solid #1e1e1e;
    padding-top: 10px; margin-top: 0;
  }
  .em-aud-tab { flex: 1; justify-content: center; }
}

/* Panel header — small screens (640px):
   Row 1: [Title flex:1] [Export] [Send]
   Row 2: [Search full width]
   Row 3: [Tabs full width] */
@media (max-width: 640px) {
  .em-panel-title { flex: 1; font-size: 16px; }
  .em-panel-acts  { flex-shrink: 0; }
  .em-send-btn, .em-export-btn { padding: 7px 12px; font-size: 12px; }
  .em-hd-search { order: 3; flex: unset; width: 100%; }
  .em-aud-tabs  { order: 4; }

  /* Step cards → compact + hint hidden */
  .em-steps { padding: 10px 12px; gap: 6px; }
  .em-step  { flex: 0 0 auto; min-width: 140px; padding: 9px 12px; }
  .em-step-hint { display: none; }
}

/* Guest cards → CSS grid on screens ≤ 960px */
@media (max-width: 960px) {
  .em-gc-info { flex: 0 0 150px; }
}

@media (max-width: 640px) {
  .em-guest-list { padding: 8px 10px; gap: 5px; }

  .em-gc {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas:
      "avatar info date"
      "avatar statuses statuses";
    align-items: start;
    gap: 3px 12px;
    padding: 12px 14px;
  }
  .em-gc-av-wrap  { grid-area: avatar; align-self: start; padding-top: 2px; }
  .em-gc-info     { grid-area: info; flex: unset; min-width: 0; }
  .em-gc-date     { grid-area: date; text-align: right; align-self: start; padding-top: 2px; }
  .em-gc-statuses { grid-area: statuses; justify-content: flex-start; flex: unset; margin-top: 6px; }
}

@media (max-width: 400px) {
  .em-gc-date { display: none; }
  .em-gc-badge { font-size: 10px; padding: 3px 7px; }
}

/* ── Template inline actions ── */
.em-tpl-item { position: relative; }
.em-tpl-item--editing { cursor: default; border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.03); }
.em-tpl-actions {
  display: flex; gap: 3px; flex-shrink: 0; opacity: 0;
  transition: opacity 140ms; align-self: flex-start; margin-left: auto;
}
.em-tpl-item:hover .em-tpl-actions { opacity: 1; }
.em-tpl-act-btn {
  display: flex; align-items: center; gap: 4px;
  width: 24px; height: 24px; border-radius: 6px; border: none;
  background: rgba(255,255,255,0.05); color: #666;
  cursor: pointer; transition: background 120ms, color 120ms; flex-shrink: 0;
  justify-content: center; white-space: nowrap; overflow: hidden;
}
.em-tpl-act-btn:hover { background: rgba(255,255,255,0.1); color: #f0f0ec; }
.em-tpl-act-btn--del:hover { background: rgba(255,69,58,0.12); color: #FF453A; }
.em-tpl-act-btn--confirm {
  width: auto; padding: 0 8px; background: rgba(255,69,58,0.15);
  color: #FF453A; border: 1px solid rgba(255,69,58,0.3);
}
.em-tpl-act-btn--confirm:hover { background: rgba(255,69,58,0.25); }
.em-tpl-act-confirm-txt { font-size: 10px; font-weight: 700; }

.em-tpl-edit { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.em-tpl-edit-ta {
  width: 100%; background: #0e0e0e; border: 1px solid #333;
  color: #f0f0ec; border-radius: 8px; padding: 10px 12px;
  font-size: 13px; line-height: 1.5; font-family: inherit;
  resize: vertical; box-sizing: border-box; transition: border-color 140ms;
}
.em-tpl-edit-ta:focus { outline: none; border-color: rgba(201,168,76,0.5); }
.em-tpl-edit-actions { display: flex; gap: 6px; justify-content: flex-end; }
.em-tpl-edit-cancel {
  height: 30px; padding: 0 12px; border-radius: 7px;
  border: 1px solid #2a2a2a; background: transparent; color: #888;
  font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit;
  transition: background 120ms;
}
.em-tpl-edit-cancel:hover { background: rgba(255,255,255,0.06); }
.em-tpl-edit-save {
  height: 30px; padding: 0 14px; border-radius: 7px; border: none;
  background: rgba(201,168,76,0.15); color: #C9A84C;
  font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background 120ms;
}
.em-tpl-edit-save:hover:not(:disabled) { background: rgba(201,168,76,0.25); }
.em-tpl-edit-save:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Browse templates button ── */
.em-browse-tpl-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: transparent; border: none;
  color: #C9A84C; padding: 0; margin-left: auto;
  font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit;
  text-transform: none; letter-spacing: 0;
  transition: opacity 130ms;
}
.em-browse-tpl-btn:hover { opacity: 0.75; }

/* ── Global template picker ── */
.em-tpk-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 1100; display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.em-tpk-panel {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 18px;
  width: 480px; max-width: calc(100vw - 40px); max-height: 80vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.em-tpk-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px 0; flex-shrink: 0;
}
.em-tpk-title { font-size: 16px; font-weight: 700; color: #f0f0ec; }
.em-tpk-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid #2a2a2a;
  background: rgba(255,255,255,0.06); color: #888; cursor: pointer;
  transition: background 120ms; flex-shrink: 0;
}
.em-tpk-close:hover { background: rgba(255,255,255,0.10); color: #f0f0ec; }

.em-tpk-body { flex: 1; overflow-y: auto; padding: 16px 22px 22px; }
.em-tpk-sub { font-size: 10.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #888; margin: 0 0 12px; }
.em-tpk-empty { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #888; padding: 12px; border: 0.8px dashed #2a2a2a; border-radius: 10px; }
.em-tpk-list { display: flex; flex-direction: column; gap: 8px; }

.em-tpk-card {
  padding: 12px; border-radius: 10px; border: 1px solid #2a2a2a; background: #111111;
  display: flex; flex-direction: column; gap: 8px;
  transition: border-color 130ms;
}
.em-tpk-card:hover { border-color: #C9A84C; }
.em-tpk-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.em-tpk-name { font-size: 13.5px; font-weight: 600; color: #f0f0ec; }
.em-tpk-badges { display: flex; gap: 5px; flex-shrink: 0; }
.em-tpk-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 5px; background: rgba(255,255,255,0.06); color: #888; }
.em-tpk-body-text { font-size: 13px; color: #f0f0ec; line-height: 1.5; white-space: pre-wrap; margin: 0; }
.em-tpk-import-btn {
  align-self: flex-end; display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 14px; border-radius: 8px;
  background: rgba(255,255,255,0.07); border: 1px solid #2a2a2a;
  color: #f0f0ec; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 130ms, border-color 130ms;
}
.em-tpk-import-btn:hover:not(:disabled) { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.4); color: #C9A84C; }
.em-tpk-import-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.em-tpk-fade-enter-active, .em-tpk-fade-leave-active { transition: opacity 180ms; }
.em-tpk-fade-enter-from, .em-tpk-fade-leave-to { opacity: 0; }
</style>