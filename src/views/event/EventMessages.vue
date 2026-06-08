<template>
  <div class="em-root">

    <!-- ══ Mode bar ══ -->
    <div class="em-mode-bar">
      <button class="em-mode-tab" :class="{ 'em-mode-tab--on': mode === 'system' }" @click="mode = 'system'">System</button>
      <button class="em-mode-tab" :class="{ 'em-mode-tab--on': mode === 'custom' }" @click="switchToCustom">
        Custom Campaigns
        <span v-if="customCampaigns.length" class="em-mode-badge">{{ customCampaigns.length }}</span>
      </button>
    </div>

    <!-- ══════════════════════════════════════════════
         SYSTEM MODE
         ══════════════════════════════════════════════ -->
    <template v-if="mode === 'system'">

      <!-- Toolbar -->
      <div class="em-toolbar">
        <div class="em-toolbar-left">
          <div class="em-search-wrap">
            <svg class="em-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#6B6B72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="searchQ" class="em-search" placeholder="Search by name or phone…" />
            <button v-if="searchQ" class="em-search-clear" @click="searchQ = ''">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="em-camp-tabs">
            <button v-for="c in displayCampaigns" :key="c.id"
              class="em-camp-tab" :class="{ 'em-camp-tab--active': activeCampaign === c.id }"
              @click="activeCampaign = c.id">
              {{ c.label }}<span class="em-camp-badge">{{ attendees.length }}</span>
            </button>
          </div>
        </div>
        <div class="em-toolbar-right">
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

      <!-- Stats -->
      <div class="em-stats">
        <div class="em-stat-block em-stat-block--wa">
          <div class="em-stat-block-hd">
            <svg width="11" height="11" viewBox="0 0 448 512" fill="#128C7E"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
            <span class="em-stat-block-title">WhatsApp</span>
          </div>
          <div class="em-chips-wrap">
            <button class="em-chips-arrow" @click="scrollRow($event, -1)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div class="em-stat-chips" v-drag-scroll>
              <button v-for="s in channelStats.wa" :key="s.status"
                class="em-stat-chip" :class="[`em-sc--${s.status}`, { 'em-sc--on': isActiveFilter('whatsapp', s.status) }]"
                @click="toggleFilter('whatsapp', s.status)"
              ><span class="em-sc-n">{{ s.n }}</span> <span class="em-sc-lbl">{{ s.label }}</span></button>
            </div>
            <button class="em-chips-arrow" @click="scrollRow($event, 1)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        </div>
        <div class="em-stat-block em-stat-block--sms">
          <div class="em-stat-block-hd">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5856D6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="em-stat-block-title">SMS</span>
          </div>
          <div class="em-chips-wrap">
            <button class="em-chips-arrow" @click="scrollRow($event, -1)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div class="em-stat-chips" v-drag-scroll>
              <button v-for="s in channelStats.sms" :key="s.status"
                class="em-stat-chip" :class="[`em-sc--${s.status}`, { 'em-sc--on': isActiveFilter('sms', s.status) }]"
                @click="toggleFilter('sms', s.status)"
              ><span class="em-sc-n">{{ s.n }}</span> <span class="em-sc-lbl">{{ s.label }}</span></button>
            </div>
            <button class="em-chips-arrow" @click="scrollRow($event, 1)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        </div>
        <div class="em-stat-block em-stat-block--rsvp">
          <div class="em-stat-block-hd">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B6B72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="em-stat-block-title">RSVP</span>
          </div>
          <div class="em-chips-wrap">
            <button class="em-chips-arrow" @click="scrollRow($event, -1)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div class="em-stat-chips" v-drag-scroll>
              <button v-for="s in channelStats.rsvp" :key="s.status"
                class="em-stat-chip" :class="[`em-sc--rsvp-${s.status.toLowerCase().replace(/\s+/g,'-')}`, { 'em-sc--on': isActiveRsvpFilter(s.status) }]"
                @click="toggleRsvpFilter(s.status)"
              ><span class="em-sc-n">{{ s.n }}</span> <span class="em-sc-lbl">{{ s.status }}</span></button>
            </div>
            <button class="em-chips-arrow" @click="scrollRow($event, 1)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="em-table-wrap">
        <div class="em-table-scroll">
          <table class="em-table">
            <thead>
              <tr>
                <th class="em-th">Name</th>
                <th class="em-th">Phone</th>
                <th class="em-th">
                  <div class="em-ch-head">
                    <svg width="11" height="11" viewBox="0 0 448 512" fill="#128C7E">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                    WhatsApp
                  </div>
                </th>
                <th class="em-th">
                  <div class="em-ch-head">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="#5856D6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    SMS
                  </div>
                </th>
                <th class="em-th">RSVP</th>
                <th class="em-th">Added</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loading && !attendees.length">
                <tr v-for="n in 10" :key="`sk-${n}`" class="em-tr em-tr--sk">
                  <td class="em-td"><div class="em-sk-name"><div class="em-sk-circle"/><div class="em-sk-bar em-sk-bar--lg"/></div></td>
                  <td class="em-td"><div class="em-sk-bar"/></td>
                  <td class="em-td"><div class="em-sk-bar em-sk-bar--sm"/></td>
                  <td class="em-td"><div class="em-sk-bar em-sk-bar--sm"/></td>
                  <td class="em-td"><div class="em-sk-bar em-sk-bar--sm"/></td>
                  <td class="em-td"><div class="em-sk-bar"/></td>
                </tr>
              </template>
              <tr v-for="att in pageList" :key="att.id" class="em-tr">
                <td class="em-td">
                  <div class="em-name-cell">
                    <div class="em-avatar" :style="{ background: avatarBg(att.fullName), color: avatarFg(att.fullName) }">
                      {{ initials(att.fullName) }}
                    </div>
                    <span class="em-name-text">{{ att.fullName }}</span>
                  </div>
                </td>
                <td class="em-td em-td--muted">{{ att.phone || '—' }}</td>
                <td class="em-td">
                  <span class="em-badge" :class="`em-badge--${wspStatus(att)}`">
                    <svg v-if="['delivered','read'].includes(wspStatus(att))" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="1 12 5 16 11 6"/><polyline points="9 12 13 16 23 6"/></svg>
                    <svg v-else-if="wspStatus(att) === 'sent'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="wspStatus(att) === 'failed'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    {{ STATUS_LABELS[wspStatus(att)] || '—' }}
                  </span>
                </td>
                <td class="em-td">
                  <span class="em-badge" :class="`em-badge--${smsStatus(att)}`">
                    <svg v-if="['delivered','read'].includes(smsStatus(att))" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="smsStatus(att) === 'sent'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="smsStatus(att) === 'failed'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    {{ STATUS_LABELS[smsStatus(att)] || '—' }}
                  </span>
                </td>
                <td class="em-td">
                  <div class="em-rsvp-cell">
                    <span class="em-rsvp-dot" :style="{ background: rsvpColor(att.attendanceStatus) }" />
                    <span class="em-rsvp-text">{{ att.attendanceStatus || 'Not Confirmed' }}</span>
                  </div>
                </td>
                <td class="em-td em-td--muted">{{ formatDate(att.createdAt) }}</td>
              </tr>
              <tr v-if="!loading && !filteredList.length">
                <td colspan="6" class="em-td-empty">
                  <div class="em-empty">
                    <div class="em-empty-icon">
                      <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill="#F4F4F6"/>
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
                </td>
              </tr>
            </tbody>
          </table>
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

    </template>

    <!-- ══════════════════════════════════════════════
         CUSTOM CAMPAIGNS MODE
         ══════════════════════════════════════════════ -->
    <template v-else>

      <!-- ── Campaign grid (no campaign selected) ── -->
      <template v-if="!selectedCustomCamp">
        <div class="em-custom-toolbar">
          <div>
            <h2 class="em-custom-title">Custom Campaigns</h2>
            <p class="em-custom-sub">Named SMS campaigns you can send to any group of attendees</p>
          </div>
          <button class="em-send-btn" @click="openCampDialog(null)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Campaign
          </button>
        </div>

        <div class="em-custom-body">
          <div class="em-custom-scroll">
          <div v-if="loadingCustomCamps" class="em-custom-loading">
            <svg class="em-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8924D" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Loading campaigns…</span>
          </div>

          <div v-else-if="!customCampaigns.length" class="em-custom-empty">
            <div class="em-empty-icon">
              <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#F4F4F6"/>
                <path d="M42 22H22a2 2 0 0 0-2 2v16l6-4h16a2 2 0 0 0 2-2V24a2 2 0 0 0-2-2z" fill="#DDDBD6"/>
              </svg>
            </div>
            <p class="em-empty-title">No campaigns yet</p>
            <p class="em-empty-sub">Create a named campaign to send targeted SMS messages to specific attendees.</p>
            <button class="em-empty-cta em-empty-cta--primary" @click="openCampDialog(null)">Create First Campaign</button>
          </div>

          <div v-else class="em-camp-table-wrap">
            <table class="em-camp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="camp in pagedCampaigns" :key="camp.id" class="em-camp-row" @click="selectCustomCamp(camp)">
                  <td class="em-ct-name">{{ camp.name }}</td>
                  <td class="em-ct-type"><span class="em-ct-type-badge">{{ camp.type }}</span></td>
                  <td class="em-ct-date">{{ formatDate(camp.createdAt) }}</td>
                  <td class="em-ct-actions" @click.stop>
                    <button class="em-camp-item-btn" @click="openCampDialog(camp)" title="Edit">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="em-camp-item-btn em-camp-item-btn--del" @click="deleteCustomCampaign(camp)" title="Delete">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B5B5BB" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div><!-- /em-custom-scroll -->
        </div>

        <!-- Sticky paginator footer -->
        <div v-if="!loadingCustomCamps && customCampaigns.length" class="em-table-footer" :class="{ 'em-camp-footer--disabled': campTotalPages === 1 }">
          <span class="em-range-lbl">
            {{ (campPage - 1) * CAMP_PAGE_SIZE + 1 }}–{{ Math.min(campPage * CAMP_PAGE_SIZE, customCampaigns.length) }}
            of {{ customCampaigns.length }}
          </span>
          <div class="em-paginator">
            <button class="em-page-btn em-page-btn--nav" :disabled="campPage === 1" @click="campGoPage(campPage - 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <template v-for="p in campPageNumbers" :key="String(p)">
              <span v-if="p === '…'" class="em-page-ellipsis">…</span>
              <button v-else class="em-page-btn" :class="{ 'em-page-btn--active': campPage === p }" @click="campGoPage(p)">{{ p }}</button>
            </template>
            <button class="em-page-btn em-page-btn--nav" :disabled="campPage === campTotalPages" @click="campGoPage(campPage + 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </template>

      <!-- ── Campaign detail (campaign selected) ── -->
      <template v-else>

        <!-- Detail header -->
        <div class="em-detail-top">
          <button class="em-detail-back" @click="selectedCustomCamp = null; customSelectList = []">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Campaigns
          </button>
          <h2 class="em-detail-title">{{ selectedCustomCamp.name }}</h2>
          <span class="em-detail-type">{{ selectedCustomCamp.type }}</span>
        </div>

        <!-- Filters -->
        <div class="em-detail-filters">
          <div class="em-filter-group">
            <span class="em-filter-lbl">STATUS</span>
            <div class="em-filter-pills">
              <button v-for="s in STATUS_OPTIONS" :key="s.v"
                class="em-filter-pill" :class="[s.v !== 'all' ? `em-filter-pill--${s.v}` : 'em-filter-pill--all', { 'em-filter-pill--on': customStatus === s.v }]"
                @click="customStatus = s.v"><span class="em-fp-n">{{ customStatusCounts[s.v] ?? 0 }}</span> {{ s.l }}</button>
            </div>
          </div>
          <div class="em-filter-group" v-if="props.event?.labels?.length">
            <span class="em-filter-lbl">LIST</span>
            <select v-model="customLabelId" class="em-filter-select">
              <option :value="null">All Lists</option>
              <option v-for="lbl in props.event.labels" :key="lbl.id" :value="lbl.id">{{ lbl.name }}</option>
            </select>
          </div>
          <div class="em-detail-count">
            {{ customFilteredAttendees.length }} attendee{{ customFilteredAttendees.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Detail table -->
        <div class="em-detail-table-wrap">
          <table class="em-table">
            <thead>
              <tr>
                <th class="em-th em-th--cb">
                  <input type="checkbox"
                    :checked="allCustomSelected"
                    :indeterminate.prop="someCustomSelected && !allCustomSelected"
                    @change="toggleCustomSelectAll" />
                </th>
                <th class="em-th">Name</th>
                <th class="em-th">Phone</th>
                <th class="em-th">SMS Status</th>
                <th class="em-th">Added</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loading && !attendees.length">
                <tr v-for="n in 8" :key="`csk-${n}`" class="em-tr em-tr--sk">
                  <td class="em-td em-td--cb"><div class="em-sk-bar em-sk-bar--sm" style="width:16px;height:16px;border-radius:3px"/></td>
                  <td class="em-td"><div class="em-sk-name"><div class="em-sk-circle"/><div class="em-sk-bar em-sk-bar--lg"/></div></td>
                  <td class="em-td"><div class="em-sk-bar"/></td>
                  <td class="em-td"><div class="em-sk-bar em-sk-bar--sm"/></td>
                  <td class="em-td"><div class="em-sk-bar"/></td>
                </tr>
              </template>
              <tr v-for="att in pagedDetailAttendees" :key="att.id"
                class="em-tr em-tr--cb" :class="{ 'em-tr--sel': isCustomSelected(att) }"
                @click="toggleCustomSelect(att)">
                <td class="em-td em-td--cb" @click.stop>
                  <input type="checkbox" :checked="isCustomSelected(att)" @change="toggleCustomSelect(att)" />
                </td>
                <td class="em-td">
                  <div class="em-name-cell">
                    <div class="em-avatar" :style="{ background: avatarBg(att.fullName), color: avatarFg(att.fullName) }">
                      {{ initials(att.fullName) }}
                    </div>
                    <span class="em-name-text">{{ att.fullName }}</span>
                  </div>
                </td>
                <td class="em-td em-td--muted">{{ att.phone || '—' }}</td>
                <td class="em-td">
                  <span class="em-badge" :class="`em-badge--${getCustomStatus(att) ?? 'unsent'}`">
                    <svg v-if="['delivered','read'].includes(getCustomStatus(att))" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="getCustomStatus(att) === 'failed'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    {{ STATUS_LABELS[getCustomStatus(att)] ?? 'Unsent' }}
                  </span>
                </td>
                <td class="em-td em-td--muted">{{ formatDate(att.createdAt) }}</td>
              </tr>
              <tr v-if="!loading && !customFilteredAttendees.length">
                <td colspan="5" class="em-td-empty">
                  <div class="em-empty">
                    <p class="em-empty-title">No attendees match these filters</p>
                    <p class="em-empty-sub">Try changing the status or list filter.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Detail attendees paginator -->
        <div class="em-table-footer" :class="{ 'em-camp-footer--disabled': detailTotalPages === 1 }">
          <span class="em-range-lbl">
            {{ customFilteredAttendees.length === 0 ? '0' : (detailPage - 1) * DETAIL_PAGE_SIZE + 1 }}–{{ Math.min(detailPage * DETAIL_PAGE_SIZE, customFilteredAttendees.length) }}
            of {{ customFilteredAttendees.length }}
          </span>
          <div class="em-paginator">
            <button class="em-page-btn em-page-btn--nav" :disabled="detailPage === 1" @click="detailGoPage(detailPage - 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <template v-for="p in detailPageNumbers" :key="String(p)">
              <span v-if="p === '…'" class="em-page-ellipsis">…</span>
              <button v-else class="em-page-btn" :class="{ 'em-page-btn--active': detailPage === p }" @click="detailGoPage(p)">{{ p }}</button>
            </template>
            <button class="em-page-btn em-page-btn--nav" :disabled="detailPage === detailTotalPages" @click="detailGoPage(detailPage + 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <!-- Floating action bar -->
        <Transition name="em-slide-up">
          <div v-if="customSelectList.length" class="em-action-bar">
            <span class="em-action-count">{{ customSelectList.length }} selected</span>
            <button class="em-action-btn em-action-btn--sms" @click="openCustomSend">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Send SMS
            </button>
          </div>
        </Transition>

      </template>
    </template>

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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B8924D"
                    stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  <span class="em-drawer-title">{{ isCustomSend ? 'Send SMS Campaign' : 'Send Messages' }}</span>
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

                <!-- Campaign — system mode: picker; custom mode: locked display -->
                <div class="em-drawer-section" v-if="!isCustomSend">
                  <p class="em-drawer-section-label">Campaign</p>
                  <div class="em-camp-grid-wrap">
                    <button class="em-chips-arrow em-chips-arrow--l" @click="scrollCampGrid(-1)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div class="em-camp-grid" ref="campGridEl">
                      <button v-for="c in KNOWN_CAMPAIGNS" :key="c.id"
                        class="em-camp-card" :class="{ 'em-camp-card--active': sendCampaign === c.id }"
                        @click="onCampaignChange(c.id)">
                        <span class="em-camp-card-icon" v-html="c.icon" />
                        <span class="em-camp-card-label">{{ c.label }}</span>
                      </button>
                    </div>
                    <button class="em-chips-arrow em-chips-arrow--r" @click="scrollCampGrid(1)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>
                <div class="em-drawer-section" v-else>
                  <p class="em-drawer-section-label">Campaign</p>
                  <div class="em-custom-camp-display">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8924D" stroke-width="1.8" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {{ selectedCustomCamp?.name }}
                    <span class="em-custom-camp-type">{{ selectedCustomCamp?.type }}</span>
                  </div>
                </div>

                <!-- Channel — system mode: both; custom mode: SMS only -->
                <div class="em-drawer-section" v-if="!isCustomSend">
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
                <div class="em-drawer-section" v-else>
                  <p class="em-drawer-section-label">Channel</p>
                  <div class="em-ch-sms-card">
                    <div class="em-ch-sms-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5856D6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div class="em-ch-sms-info">
                      <span class="em-ch-sms-name">SMS Channel</span>
                      <span class="em-ch-sms-note">Custom campaigns are SMS only</span>
                    </div>
                    <div class="em-ch-sms-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Active
                    </div>
                  </div>
                </div>

                <!-- Recipients — system mode: status chips + pick; custom mode: selected count -->
                <div class="em-drawer-section" v-if="!isCustomSend">
                  <p class="em-drawer-section-label">Recipients</p>

                  <!-- Label filter (system mode only, when event has labels) -->
                  <div v-if="props.event?.labels?.length" class="em-drawer-list-row">
                    <span class="em-drawer-list-lbl">List</span>
                    <select v-model="sendLabelId" class="em-filter-select em-filter-select--drawer">
                      <option :value="null">All Lists</option>
                      <option v-for="lbl in props.event.labels" :key="lbl.id" :value="lbl.id">{{ lbl.name }}</option>
                    </select>
                  </div>

                  <!-- Status chips -->
                  <div class="em-recip-chips-wrap">
                    <button class="em-chips-arrow em-chips-arrow--l" @click="scrollChips(-1)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div class="em-recip-chips" ref="chipsScrollEl">
                      <button v-for="opt in SEND_STATUS_OPTS" :key="opt.v"
                        class="em-recip-chip"
                        :class="['em-recip-chip--' + opt.v, { 'em-recip-chip--on': sendRecipMode === opt.v }]"
                        @click="sendRecipMode = opt.v">
                        {{ opt.l }}
                        <span class="em-chip-cnt">{{ opt.v === 'all' ? sendRecipPool.length : (sendStatusCounts[opt.v] ?? 0) }}</span>
                      </button>
                    </div>
                    <button class="em-chips-arrow em-chips-arrow--r" @click="scrollChips(1)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
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
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B6B72" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B6B72" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {{ sendRecipCount }} recipient{{ sendRecipCount !== 1 ? 's' : '' }} will receive this message
                  </p>
                </div>
                <div class="em-drawer-section" v-else>
                  <p class="em-drawer-section-label">Recipients</p>
                  <div class="em-selected-recip-display">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8924D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span><strong>{{ customSelectList.length }}</strong> attendees selected</span>
                  </div>
                </div>

                <!-- Template -->
                <div class="em-drawer-section">
                  <p class="em-drawer-section-label">
                    Template
                    <span v-if="loadingTemplates" class="em-tpl-loading">
                      <svg class="em-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B8924D" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                      Loading…
                    </span>
                  </p>
                  <div v-if="!loadingTemplates && !templates.length" class="em-tpl-empty">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B5B5BB" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    No templates found for this campaign + channel.
                  </div>
                  <div v-else class="em-tpl-list">
                    <label v-for="tpl in templates" :key="tpl.id"
                      class="em-tpl-item" :class="{ 'em-tpl-item--active': selectedTemplate?.id === tpl.id }"
                      @click="selectedTemplate = tpl">
                      <div class="em-tpl-radio">
                        <div class="em-tpl-radio-dot" v-if="selectedTemplate?.id === tpl.id" />
                      </div>
                      <div class="em-tpl-body">
                        <p class="em-tpl-content">{{ tpl.content }}</p>
                        <p v-if="tpl.language" class="em-tpl-meta">{{ tpl.language.toUpperCase() }}</p>
                      </div>
                    </label>
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

    <!-- ══════════════════════════════════════════════
         CAMPAIGN CREATE / EDIT DIALOG
         ══════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="em-fade">
        <div v-if="campDialogOpen" class="em-overlay em-overlay--center" @click.self="campDialogOpen = false">
          <div class="em-dialog">
            <div class="em-dialog-header">
              <h3 class="em-dialog-title">{{ editingCamp ? 'Edit Campaign' : 'New Campaign' }}</h3>
              <button class="em-drawer-close" @click="campDialogOpen = false">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="em-dialog-body">
              <label class="em-dialog-lbl">Campaign Name</label>
              <input v-model="campDialogName" class="em-dialog-input" placeholder="e.g. Thank You Messages"
                @keydown.enter="saveCamp" autofocus />
              <template v-if="!editingCamp">
                <label class="em-dialog-lbl" style="margin-top:14px">Type</label>
                <div class="em-dialog-type-row">
                  <button class="em-dialog-type-btn" :class="{ 'em-dialog-type-btn--on': campDialogType === 'invitation' }" @click="campDialogType = 'invitation'">Invitation</button>
                  <button class="em-dialog-type-btn" :class="{ 'em-dialog-type-btn--on': campDialogType === 'contribution' }" @click="campDialogType = 'contribution'">Contribution</button>
                  <button class="em-dialog-type-btn" :class="{ 'em-dialog-type-btn--on': campDialogType === 'contact' }" @click="campDialogType = 'contact'">Contact</button>
                </div>
              </template>
            </div>
            <div class="em-dialog-footer">
              <button class="em-drawer-cancel" @click="campDialogOpen = false">Cancel</button>
              <button class="em-drawer-send" :disabled="!campDialogName.trim() || savingCamp" @click="saveCamp">
                <svg v-if="savingCamp" class="em-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                {{ savingCamp ? 'Saving…' : (editingCamp ? 'Save' : 'Create') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { db, auth } from '../../firebase'
import { collection, query, orderBy, where, getDocs, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore'
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

const STATUS_OPTIONS = [
  { v: 'unsent',    l: 'Unsent'    },
  { v: 'sent',      l: 'Sent'      },
  { v: 'delivered', l: 'Delivered' },
  { v: 'failed',    l: 'Failed'    },
  { v: 'all',       l: 'All'       },
]

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

const WSP_URL = 'https://sendwhatsappinvitationmessages-frbu33fema-uc.a.run.app'
const SMS_URL = 'https://sendsmsaction-frbu33fema-uc.a.run.app'

// ── Mode ──────────────────────────────────────────────────────────────────────
const mode = ref('system')

// ── System mode state ─────────────────────────────────────────────────────────
const attendees    = ref([])
const loading      = ref(false)
const searchQ      = ref('')
const activeCampaign = ref('haflaway-invitation-campaign')
const currentPage    = ref(1)
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

const isCustomSend     = computed(() => sendRecipMode.value === 'selected')
const chipsScrollEl    = ref(null)
function scrollChips(dir) { chipsScrollEl.value?.scrollBy({ left: dir * 120, behavior: 'smooth' }) }

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

// ── Custom campaigns state ────────────────────────────────────────────────────
const customCampaigns     = ref([])
const loadingCustomCamps  = ref(false)
const campPage            = ref(1)
const CAMP_PAGE_SIZE      = 10
const campTotalPages      = computed(() => Math.max(1, Math.ceil(customCampaigns.value.length / CAMP_PAGE_SIZE)))
const pagedCampaigns      = computed(() => {
  const start = (campPage.value - 1) * CAMP_PAGE_SIZE
  return customCampaigns.value.slice(start, start + CAMP_PAGE_SIZE)
})
const campPageNumbers = computed(() => {
  const total = campTotalPages.value, cur = campPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (cur > 3) pages.push('…')
  const start = Math.max(2, cur - 1)
  const end   = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cur < total - 2) pages.push('…')
  if (total > 1) pages.push(total)
  return pages
})
function campGoPage(n) { if (n >= 1 && n <= campTotalPages.value) campPage.value = n }
const selectedCustomCamp  = ref(null)
const customStatus        = ref('unsent')
const customLabelId       = ref(null)
const customSelectList    = ref([])

// Campaign dialog state
const campDialogOpen  = ref(false)
const editingCamp     = ref(null)
const campDialogName  = ref('')
const campDialogType  = ref('invitation')
const savingCamp      = ref(false)

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

// ── Firestore: custom campaigns ───────────────────────────────────────────────
async function loadCustomCampaigns() {
  if (!eventId.value) return
  loadingCustomCamps.value = true
  try {
    const snap = await getDocs(
      query(collection(db, 'events', eventId.value, 'campaigns'), orderBy('createdAt', 'desc'))
    )
    customCampaigns.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to load campaigns', e)
  } finally {
    loadingCustomCamps.value = false
  }
}

function openCampDialog(camp) {
  editingCamp.value = camp ?? null
  campDialogName.value = camp?.name ?? ''
  campDialogType.value = camp?.type ?? 'invitation'
  campDialogOpen.value = true
}

async function saveCamp() {
  if (!campDialogName.value.trim()) return
  savingCamp.value = true
  try {
    if (editingCamp.value) {
      await setDoc(
        doc(db, 'events', eventId.value, 'campaigns', editingCamp.value.id),
        { name: campDialogName.value.trim(), updatedAt: new Date().toISOString() },
        { merge: true }
      )
      if (selectedCustomCamp.value?.id === editingCamp.value.id) {
        selectedCustomCamp.value = { ...selectedCustomCamp.value, name: campDialogName.value.trim() }
      }
    } else {
      await addDoc(collection(db, 'events', eventId.value, 'campaigns'), {
        name: campDialogName.value.trim(),
        type: campDialogType.value,
        createdAt: new Date().toISOString(),
      })
    }
    campDialogOpen.value = false
    await loadCustomCampaigns()
  } catch (e) {
    console.error('Failed to save campaign', e)
  } finally {
    savingCamp.value = false
  }
}

async function deleteCustomCampaign(camp) {
  if (!confirm(`Delete campaign "${camp.name}"? This cannot be undone.`)) return
  try {
    await deleteDoc(doc(db, 'events', eventId.value, 'campaigns', camp.id))
    if (selectedCustomCamp.value?.id === camp.id) {
      selectedCustomCamp.value = null
      customSelectList.value = []
    }
    await loadCustomCampaigns()
  } catch (e) {
    console.error('Failed to delete campaign', e)
  }
}

function selectCustomCamp(camp) {
  selectedCustomCamp.value = camp
  customSelectList.value = []
  customStatus.value = 'unsent'
  customLabelId.value = null
}

function switchToCustom() {
  mode.value = 'custom'
  if (!customCampaigns.value.length && !loadingCustomCamps.value) loadCustomCampaigns()
}

// ── Custom campaign: filtered attendees ───────────────────────────────────────
const customFilteredAttendees = computed(() => {
  if (!selectedCustomCamp.value) return []
  const campId = selectedCustomCamp.value.id
  const status = customStatus.value
  const labelId = customLabelId.value

  const cardType = selectedCustomCamp.value.type
  return attendees.value.filter(att => {
    // Mirror attendees.dart: only include attendees who have a card of this campaign's type
    if (!att.cards || att.cards[cardType] == null) return false

    if (labelId && !(att.labelIds ?? []).includes(labelId)) return false

    const prefix = `sms_${campId}_`
    const match = (att.messageIndexes ?? []).find(idx => idx.startsWith(prefix))
    const attStatus = match ? match.slice(match.lastIndexOf('_') + 1) : null

    if (status === 'all') return true
    if (status === 'unsent') return attStatus === null || attStatus === 'unsent'
    return attStatus === status
  })
})

function getCustomStatus(att) {
  if (!selectedCustomCamp.value) return null
  const prefix = `sms_${selectedCustomCamp.value.id}_`
  const match = (att.messageIndexes ?? []).find(idx => idx.startsWith(prefix))
  return match ? match.slice(match.lastIndexOf('_') + 1) : null
}

const customStatusCounts = computed(() => {
  if (!selectedCustomCamp.value) return { all: 0, unsent: 0, sent: 0, delivered: 0, failed: 0 }
  const campId   = selectedCustomCamp.value.id
  const cardType = selectedCustomCamp.value.type
  const labelId  = customLabelId.value
  const prefix   = `sms_${campId}_`
  const base = attendees.value.filter(att => {
    if (!att.cards || att.cards[cardType] == null) return false
    if (labelId && !(att.labelIds ?? []).includes(labelId)) return false
    return true
  })
  const counts = { all: base.length, unsent: 0, sent: 0, delivered: 0, failed: 0 }
  for (const att of base) {
    const match = (att.messageIndexes ?? []).find(idx => idx.startsWith(prefix))
    const s = match ? match.slice(match.lastIndexOf('_') + 1) : null
    if (!s || s === 'unsent') counts.unsent++
    else if (counts[s] !== undefined) counts[s]++
  }
  return counts
})

// ── Custom campaign: attendee pagination ──────────────────────────────────────
const detailPage      = ref(1)
const DETAIL_PAGE_SIZE = 10
const detailTotalPages = computed(() => Math.max(1, Math.ceil(customFilteredAttendees.value.length / DETAIL_PAGE_SIZE)))
const pagedDetailAttendees = computed(() => {
  const start = (detailPage.value - 1) * DETAIL_PAGE_SIZE
  return customFilteredAttendees.value.slice(start, start + DETAIL_PAGE_SIZE)
})
const detailPageNumbers = computed(() => {
  const total = detailTotalPages.value, cur = detailPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (cur > 3) pages.push('…')
  const start = Math.max(2, cur - 1)
  const end   = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cur < total - 2) pages.push('…')
  if (total > 1) pages.push(total)
  return pages
})
function detailGoPage(n) { if (n >= 1 && n <= detailTotalPages.value) detailPage.value = n }
watch([customFilteredAttendees], () => { detailPage.value = 1 })

// ── Custom campaign: selection ────────────────────────────────────────────────
const allCustomSelected  = computed(() => customFilteredAttendees.value.length > 0 && customSelectList.value.length === customFilteredAttendees.value.length)
const someCustomSelected = computed(() => customSelectList.value.length > 0 && customSelectList.value.length < customFilteredAttendees.value.length)

function isCustomSelected(att)  { return customSelectList.value.some(a => a.id === att.id) }
function toggleCustomSelect(att) {
  const i = customSelectList.value.findIndex(a => a.id === att.id)
  if (i === -1) customSelectList.value.push(att)
  else customSelectList.value.splice(i, 1)
}
function toggleCustomSelectAll() {
  if (allCustomSelected.value) customSelectList.value = []
  else customSelectList.value = [...customFilteredAttendees.value]
}

// Clear selection when filter changes
watch([customStatus, customLabelId], () => { customSelectList.value = [] })

// ── Custom campaign: open send ────────────────────────────────────────────────
function openCustomSend() {
  sendCampaign.value = selectedCustomCamp.value.id
  sendChannel.value = 'sms'
  sendRecipMode.value = 'selected'
  sendResult.value = null
  sendDrawerOpen.value = true
  loadSendTemplates()
}

// ── System send drawer ────────────────────────────────────────────────────────
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
  // Clear custom select list after a successful send
  if (isCustomSend.value && sendResult.value?.ok) customSelectList.value = []
}

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
const sendStatusCounts = computed(() => {
  const c = { unsent: 0, sent: 0, delivered: 0, read: 0, failed: 0, undelivered: 0, pending: 0 }
  for (const att of sendRecipPool.value) {
    const s = getStatusForSend(att) ?? 'unsent'
    if (s in c) c[s]++
  }
  return c
})
const sendRecipCount = computed(() => {
  if (sendRecipMode.value === 'selected') return customSelectList.value.length
  if (sendRecipMode.value === 'pick') return drawerPickList.value.length
  if (sendRecipMode.value === 'all') return sendRecipPool.value.length
  return sendStatusCounts.value[sendRecipMode.value] ?? 0
})
const sendRecipIds = computed(() => {
  if (sendRecipMode.value === 'selected') return customSelectList.value.map(a => a.id)
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
    const kardType = CAMPAIGN_KARD_TYPE[sendCampaign.value] ?? selectedCustomCamp.value?.type ?? 'invitation'
    const body = sendChannel.value === 'whatsapp'
      ? { templateId: selectedTemplate.value.id, type: sendCampaign.value, eventId: eventId.value, attendeesIds: sendRecipIds.value, kardType }
      : { content: selectedTemplate.value.content,  type: sendCampaign.value, eventId: eventId.value, attendeesIds: sendRecipIds.value, kardType }

    const res  = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${uid}` }, body: JSON.stringify(body) })
    const data = await res.json()
    sendResult.value = { ok: data.status === true, message: data.message ?? (data.status ? 'Done.' : 'Request failed.') }
    if (data.status) {
      await load()
      if (sendRecipMode.value === 'selected') customSelectList.value = []
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

// ── System mode: campaign tabs ────────────────────────────────────────────────
const displayCampaigns = computed(() => {
  const seen = new Set()
  for (const att of attendees.value) {
    for (const idx of (att.messageIndexes ?? [])) {
      const p = parseIdx(idx)
      if (p && KNOWN_CAMPAIGN_IDS.has(p.campaignId)) seen.add(p.campaignId)
    }
  }
  const result = []
  const addedLabels = new Set()
  for (const c of KNOWN_CAMPAIGNS) {
    const hasData = seen.has(c.id) || (c.id === 'haflaway-gratitude-campaign' && seen.has('haflaway-invitation-gratitude-campaign'))
    if (hasData && !addedLabels.has(c.label)) { result.push(c); addedLabels.add(c.label) }
  }
  return result
})

watch(displayCampaigns, (camps) => {
  if (camps.length && !camps.find(c => c.id === activeCampaign.value)) activeCampaign.value = camps[0].id
})

// ── System mode: filter + pagination ─────────────────────────────────────────
const filteredList = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  let list = q
    ? attendees.value.filter(a =>
        (a.fullNameLower ?? a.fullName?.toLowerCase() ?? '').includes(q) ||
        (a.phone ?? '').includes(q)
      )
    : attendees.value
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
    .brand{font-size:32px;font-weight:900;letter-spacing:-1.5px;color:#B8924D;line-height:1;}
    .tagline{font-size:10px;color:rgba(255,255,255,0.45);margin-top:6px;letter-spacing:1.2px;text-transform:uppercase;}
    .hdr-event{text-align:right;}
    .hdr-event-name{font-size:15px;font-weight:700;color:#fff;}
    .hdr-event-sub{font-size:10px;color:rgba(255,255,255,0.45);margin-top:3px;}
    /* Gold bar */
    .gold-bar{height:3px;background:linear-gradient(90deg,#B8924D,#e8c76a,#B8924D);}
    /* Meta */
    .meta{background:#FFFFFF;padding:14px 40px;display:flex;gap:40px;border-bottom:0.5px solid #E5E4E0;}
    .meta-item{}
    .meta-lbl{font-size:9px;text-transform:uppercase;letter-spacing:0.8px;color:#6B6B72;font-weight:600;}
    .meta-val{font-size:13px;font-weight:700;color:#0A0A0B;margin-top:2px;}
    /* Table */
    .content{padding:24px 40px 0;}
    .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#B8924D;margin-bottom:10px;}
    table{width:100%;border-collapse:collapse;}
    th{padding:8px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#6B6B72;border-top:1.5px solid #B8924D;border-bottom:1.5px solid #B8924D;text-align:left;background:#fff;}
    td{padding:8px 12px;border-bottom:0.5px solid #F0EFEC;font-size:11px;color:#0A0A0B;}
    tr:nth-child(even) td{background:#FAFAF9;}
    tr:last-child td{border-bottom:none;}
    /* Footer */
    .footer{background:#0A0A0B;padding:20px 40px;margin-top:32px;}
    .footer-grid{display:flex;gap:40px;}
    .footer-section{}
    .footer-lbl{font-size:9px;text-transform:uppercase;letter-spacing:0.8px;color:#B8924D;font-weight:700;margin-bottom:7px;}
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
        ? `<td style="text-align:right">${fmt(pledged)}</td><td style="text-align:right">${fmt(paid)}</td><td style="text-align:right;${(pledged - paid) > 0 ? 'color:#B8924D;font-weight:600' : ''}">${fmt(pledged - paid)}</td><td>${a.attendanceStatus || 'Not Confirmed'}</td><td style="color:#6B6B72;">${formatDate(a.createdAt)}</td>`
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
  background: #0a0e1c;
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
  font-size: 13px; font-weight: 500; color: #8892a4; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 130ms, border-color 130ms;
}
.em-mode-tab:hover { color: #e2e8f0; }
.em-mode-tab--on { color: #C9A84C; font-weight: 600; border-bottom-color: #C9A84C; }
.em-mode-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 16px; padding: 0 5px;
  border-radius: 8px; background: rgba(201,168,76,0.12); color: #C9A84C;
  font-size: 10px; font-weight: 700;
}

/* ── Toolbar (system mode) ── */
.em-toolbar {
  flex-shrink: 0;
  padding: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.em-toolbar-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; min-width: 0; }
.em-search-wrap  { position: relative; display: flex; align-items: center; flex-shrink: 0; }
.em-search-icon  { position: absolute; left: 10px; pointer-events: none; }
.em-search {
  height: 34px; padding: 0 30px 0 32px; border: 1px solid #2a3a52; border-radius: 8px;
  font-size: 14px; color: #e2e8f0; background: #0f1729; width: 200px; outline: none; transition: border-color 130ms;
}
.em-search:focus { border-color: #C9A84C; }
.em-search-clear { position: absolute; right: 8px; background: none; border: none; cursor: pointer; color: #4f617a; display: flex; align-items: center; padding: 0; }
.em-camp-tabs    { display: flex; gap: 4px; flex-wrap: wrap; }
.em-camp-tab {
  height: 30px; padding: 0 12px; border-radius: 8px; border: 1px solid transparent; background: transparent;
  font-size: 13px; font-weight: 500; color: #8892a4; cursor: pointer; transition: all 130ms; white-space: nowrap;
}
.em-camp-tab:hover { background: #1a2236; color: #e2e8f0; }
.em-camp-tab--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #e2e8f0; font-weight: 600; }
.em-camp-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 16px; padding: 0 5px; margin-left: 5px;
  border-radius: 8px; background: rgba(255,255,255,0.08); color: #4f617a;
  font-size: 10px; font-weight: 700; transition: background 130ms, color 130ms;
}
.em-camp-tab--active .em-camp-badge { background: rgba(201,168,76,0.15); color: #C9A84C; }
.em-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.em-export-btn {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 14px; border-radius: 8px;
  border: 1px solid #1e2d44; background: #111827; color: #e2e8f0;
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
  background: #111827; border: 1px solid #1e2d44; border-radius: 18px;
  width: 480px; max-width: calc(100vw - 32px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.em-expd-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px 0;
}
.em-expd-title { font-size: 16px; font-weight: 700; color: #e2e8f0; }
.em-expd-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid #1e2d44;
  background: rgba(255,255,255,0.06); color: #8892a4; cursor: pointer; transition: background 120ms;
}
.em-expd-close:hover { background: rgba(255,255,255,0.10); color: #e2e8f0; }
.em-expd-body { padding: 16px 22px 4px; }
.em-expd-label {
  font-size: 10.5px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: #8892a4; margin-bottom: 10px;
}
.em-expd-type-grid { display: flex; flex-direction: column; gap: 8px; }
.em-expd-type-card {
  display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 12px 14px; border-radius: 11px; border: 1.5px solid #1e2d44;
  background: #0f1729; cursor: pointer; text-align: left; font-family: inherit;
  transition: border-color 130ms, background 130ms;
}
.em-expd-type-card:hover { border-color: #C9A84C; background: rgba(201,168,76,0.05); }
.em-expd-type-card--on { border-color: #C9A84C; background: rgba(201,168,76,0.05); }
.em-expd-type-card svg { color: #C9A84C; flex-shrink: 0; }
.em-expd-type-name { font-size: 13.5px; font-weight: 600; color: #e2e8f0; white-space: nowrap; }
.em-expd-type-desc { font-size: 11.5px; color: #8892a4; margin-top: 1px; }
.em-expd-type-card > div, .em-expd-type-card span { display: block; }
.em-expd-type-card { flex-direction: row; }
.em-expd-type-card > svg + * { display: flex; flex-direction: column; }
.em-expd-fmt-row { display: flex; gap: 8px; }
.em-expd-fmt-btn {
  display: flex; align-items: center; gap: 7px; flex: 1;
  padding: 10px 14px; border-radius: 10px; border: 1.5px solid #1e2d44;
  background: #0f1729; font-size: 13px; font-weight: 500; color: #8892a4;
  cursor: pointer; font-family: inherit; transition: border-color 130ms, color 130ms;
}
.em-expd-fmt-btn:hover { border-color: #e2e8f0; color: #e2e8f0; }
.em-expd-fmt-btn--on { border-color: #e2e8f0; color: #e2e8f0; font-weight: 600; }
.em-expd-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 22px 20px;
}
.em-send-btn {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  height: 34px; padding: 0 16px; border-radius: 8px;
  background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 130ms;
}
.em-send-btn:hover { opacity: 0.85; }

/* ── Stats ── */
.em-stats { flex-shrink: 0; display: flex; align-items: stretch; background: #111827; border-bottom: 1px solid #1e2d44; }
.em-stat-block { display: flex; flex-direction: column; justify-content: center; padding: 12px 20px; border-right: 1px solid #1e2d44; min-width: 0; }
.em-chips-wrap { display: flex; align-items: center; gap: 4px; min-width: 0; flex: 1; }
.em-chips-arrow {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
  border: 1px solid #2a3a52; background: #111827;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #8892a4; transition: all 130ms;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.em-chips-arrow:hover { border-color: #C9A84C; color: #C9A84C; }
.em-stat-block:last-child { border-right: none; }
.em-stat-block--wa    { flex: 1; min-width: 0; }
.em-stat-block--sms   { flex: 1; min-width: 0; }
.em-stat-block--rsvp  { flex: 1; min-width: 0; }
.em-stat-big      { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; line-height: 1; color: #e2e8f0; }
.em-stat-block-lbl{ font-size: 10px; color: #8892a4; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.em-stat-block-hd { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; }
.em-stat-block-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #8892a4; }
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
.em-sc--unsent      { background: rgba(255,255,255,0.06); color: #8892a4; border-color: #2a3a52; }
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
.em-sc--rsvp-not-confirmed { background: rgba(255,255,255,0.06); color: #8892a4; border-color: #2a3a52; }
.em-sc--rsvp-declined      { background: rgba(255,69,58,0.10);  color: #C41E1E; border-color: rgba(255,69,58,0.2); }
.em-sc--rsvp-called        { background: rgba(100,210,255,0.12); color: #0077A8; border-color: rgba(100,210,255,0.25); }
.em-sc--rsvp-unreachable   { background: rgba(255,159,10,0.10); color: #B36800; border-color: rgba(255,159,10,0.2); }
.em-sc--on.em-sc--rsvp-confirmed     { background: #1D7A38; color: #fff; border-color: #1D7A38; }
.em-sc--on.em-sc--rsvp-not-confirmed { background: #6B6B72; color: #fff; border-color: #6B6B72; }
.em-sc--on.em-sc--rsvp-declined      { background: #C41E1E; color: #fff; border-color: #C41E1E; }
.em-sc--on.em-sc--rsvp-called        { background: #0077A8; color: #fff; border-color: #0077A8; }
.em-sc--on.em-sc--rsvp-unreachable   { background: #B36800; color: #fff; border-color: #B36800; }

/* ── Table (shared) ── */
.em-table-wrap  { display: flex; flex-direction: column; background: #111827; border: 1px solid #1e2d44; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
.em-table-scroll{ overflow-x: auto; }
.em-table { width: 100%; border-collapse: collapse; }
.em-th {
  padding: 9px 16px; font-size: 11px; font-weight: 700; color: #8892a4;
  text-align: left; background: #0f1729; border-bottom: 1px solid #1e2d44;
  white-space: nowrap; position: sticky; top: 0; z-index: 1; text-transform: uppercase; letter-spacing: 0.3px;
}
.em-th--cb { width: 40px; padding: 9px 8px 9px 16px; }
.em-ch-head{ display: flex; align-items: center; gap: 5px; }
.em-tr     { transition: background 120ms; }
.em-tr:hover { background: #1a2236; }
.em-tr--sk { pointer-events: none; }
.em-tr--cb { cursor: pointer; }
.em-tr--sel { background: rgba(201,168,76,0.06) !important; }
.em-td     { padding: 11px 16px; font-size: 14px; color: #e2e8f0; border-bottom: 1px solid #1e2d44; vertical-align: middle; }
.em-td--muted { color: #8892a4; font-size: 13px; }
.em-td--cb  { padding: 11px 8px 11px 16px; width: 40px; }
.em-td-empty { padding: 0; border: none; }
.em-name-cell { display: flex; align-items: center; gap: 9px; }
.em-avatar    { width: 32px; height: 32px; border-radius: 8px; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.em-name-text { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.em-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;
}
.em-badge--null, .em-badge--undefined { background: transparent; color: #4f617a; }
.em-badge--unsent      { background: rgba(255,255,255,0.06); color: #8892a4; }
.em-badge--sent        { background: rgba(255,159,10,0.12); color: #f59e0b; }
.em-badge--delivered   { background: rgba(52,211,153,0.12); color: #34d399; }
.em-badge--read        { background: rgba(99,179,237,0.12); color: #63b3ed; }
.em-badge--failed      { background: rgba(255,69,58,0.12);  color: #fc8181; }
.em-badge--pending     { background: rgba(255,204,0,0.12);  color: #fbbf24; }
.em-badge--undelivered { background: rgba(255,69,58,0.08);  color: #fc8181; }
.em-rsvp-cell { display: flex; align-items: center; gap: 6px; }
.em-rsvp-dot  { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.em-rsvp-text { font-size: 13px; color: #8892a4; }
.em-sk-name   { display: flex; align-items: center; gap: 9px; }
.em-sk-circle { width: 32px; height: 32px; border-radius: 8px; background: #1e2d44; flex-shrink: 0; animation: em-pulse 1.4s ease-in-out infinite; }
.em-sk-bar    { height: 12px; border-radius: 6px; background: #1e2d44; width: 90px; animation: em-pulse 1.4s ease-in-out infinite; }
.em-sk-bar--lg{ width: 130px; }
.em-sk-bar--sm{ width: 60px; }
@keyframes em-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.em-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; text-align: center; }
.em-empty-icon  { margin-bottom: 16px; }
.em-empty-title { font-size: 16px; font-weight: 700; color: #e2e8f0; margin: 0 0 6px; }
.em-empty-sub   { font-size: 14px; color: #8892a4; margin: 0 0 16px; max-width: 300px; }
.em-empty-cta   { height: 34px; padding: 0 16px; border-radius: 8px; border: 1px solid #1e2d44; background: #111827; font-size: 14px; font-weight: 500; color: #e2e8f0; cursor: pointer; transition: background 130ms; }
.em-empty-cta:hover { background: #1a2236; }
.em-empty-cta--primary { background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0; border-color: transparent; }
.em-empty-cta--primary:hover { opacity: 0.85; }
.em-table-footer { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; background: #111827; border-top: 1px solid #1e2d44; }
.em-range-lbl   { font-size: 13px; color: #8892a4; }
.em-filter-clear { background: none; border: none; cursor: pointer; font-size: 13px; color: #C9A84C; font-weight: 600; padding: 0; font-family: inherit; }
.em-filter-clear:hover { color: #e2e8f0; }
.em-paginator   { display: flex; align-items: center; gap: 4px; }
.em-paginator--disabled { opacity: 0.38; pointer-events: none; }
.em-page-btn    { min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 1px solid #1e2d44; background: #111827; font-size: 13px; font-weight: 500; color: #8892a4; cursor: pointer; transition: all 130ms; display: flex; align-items: center; justify-content: center; }
.em-page-btn:hover:not(:disabled) { background: #1a2236; }
.em-page-btn:disabled { opacity: 0.4; cursor: default; }
.em-page-btn--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #e2e8f0; }
.em-page-btn--nav    { color: #8892a4; }
.em-page-ellipsis   { font-size: 13px; color: #4f617a; padding: 0 4px; }

/* ── Custom campaigns: toolbar & grid ── */
.em-custom-toolbar {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 12px; background: #111827; border-bottom: 1px solid #1e2d44;
}
.em-custom-title { font-size: 20px; font-weight: 800; color: #e2e8f0; margin: 0 0 2px; letter-spacing: -0.3px; }
.em-custom-sub   { font-size: 13px; color: #8892a4; margin: 0; }
.em-custom-body  { display: flex; flex-direction: column; }
.em-custom-scroll { overflow-x: auto; }
.em-custom-loading { display: flex; align-items: center; gap: 10px; color: #8892a4; font-size: 14px; padding: 40px 0; justify-content: center; }
.em-custom-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; text-align: center; }
.em-camp-table-wrap { }
.em-camp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.em-camp-table thead tr { border-bottom: 1px solid #1e2d44; }
.em-camp-table th { padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #8892a4; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; position: sticky; top: 0; z-index: 1; background: #0f1729; }
.em-camp-row { cursor: pointer; border-bottom: 1px solid #1e2d44; transition: background 120ms; }
.em-camp-row:last-child { border-bottom: none; }
.em-camp-row:hover { background: #1a2236; }
.em-ct-name { padding: 10px 12px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
.em-ct-type { padding: 10px 12px; white-space: nowrap; }
.em-ct-type-badge { display: inline-block; padding: 2px 8px; border-radius: 20px; background: rgba(255,255,255,0.06); font-size: 11px; font-weight: 600; color: #8892a4; text-transform: capitalize; }
.em-ct-date { padding: 10px 12px; color: #8892a4; white-space: nowrap; font-size: 12px; }
.em-ct-actions { padding: 10px 12px; display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
.em-camp-footer--disabled { opacity: 0.38; pointer-events: none; }
.em-camp-items   { display: flex; flex-direction: column; gap: 8px; }
.em-camp-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; background: #111827; border: 1px solid #1e2d44;
  border-radius: 12px; cursor: pointer; transition: border-color 130ms, box-shadow 130ms;
}
.em-camp-item:hover { border-color: #C9A84C; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.em-camp-item-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(255,255,255,0.06); border: 1px solid #1e2d44;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.em-camp-item-info   { flex: 1; min-width: 0; }
.em-camp-item-name   { display: block; font-size: 14px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-camp-item-meta   { display: block; font-size: 12px; color: #8892a4; margin-top: 2px; text-transform: capitalize; }
.em-camp-item-actions { display: flex; gap: 4px; flex-shrink: 0; }
.em-camp-item-btn {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid #1e2d44;
  background: rgba(255,255,255,0.04); color: #8892a4; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 130ms;
}
.em-camp-item-btn:hover { background: #1a2236; color: #e2e8f0; border-color: #2a3a52; }
.em-camp-item-btn--del:hover { background: rgba(255,69,58,0.08); color: #fc8181; border-color: rgba(255,69,58,0.25); }

/* ── Custom campaign detail ── */
.em-detail-top {
  flex-shrink: 0; display: flex; align-items: center; gap: 12px;
  padding: 14px 24px; background: #111827; border-bottom: 1px solid #1e2d44;
}
.em-detail-back {
  display: flex; align-items: center; gap: 5px; background: none; border: none;
  font-size: 13px; color: #8892a4; cursor: pointer; transition: color 130ms; flex-shrink: 0;
}
.em-detail-back:hover { color: #C9A84C; }
.em-detail-title { flex: 1; font-size: 18px; font-weight: 700; color: #e2e8f0; margin: 0; letter-spacing: -0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-detail-type  { font-size: 11px; font-weight: 600; color: #8892a4; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 20px; white-space: nowrap; text-transform: capitalize; flex-shrink: 0; }
.em-detail-filters {
  flex-shrink: 0; display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding: 12px 24px; background: #0f1729; border-bottom: 1px solid #1e2d44;
}
.em-filter-group { display: flex; align-items: center; gap: 8px; }
.em-filter-lbl   { font-size: 10px; font-weight: 700; color: #8892a4; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
.em-filter-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.em-filter-pill  {
  height: 28px; padding: 0 12px; border-radius: 20px; border: 1px solid transparent;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all 130ms; font-family: inherit;
}
.em-filter-pill:hover { filter: brightness(1.15); }
/* per-status base colors */
.em-filter-pill--all       { background: rgba(255,255,255,0.06); color: #8892a4; border-color: #2a3a52; }
.em-filter-pill--unsent    { background: rgba(255,255,255,0.06); color: #8892a4; border-color: #2a3a52; }
.em-filter-pill--sent      { background: rgba(255,159,10,0.10); color: #f59e0b; border-color: rgba(255,159,10,0.2); }
.em-filter-pill--delivered { background: rgba(52,211,153,0.10); color: #34d399; border-color: rgba(52,211,153,0.2); }
.em-filter-pill--failed    { background: rgba(255,69,58,0.10);  color: #fc8181; border-color: rgba(255,69,58,0.2); }
/* active: frosted */
.em-filter-pill--all.em-filter-pill--on       { background: rgba(226,232,240,0.15); color: #e2e8f0; border-color: rgba(226,232,240,0.2); }
.em-filter-pill--unsent.em-filter-pill--on    { background: #4f617a; color: #e2e8f0; border-color: #4f617a; }
.em-filter-pill--sent.em-filter-pill--on      { background: #B36800; color: #fff; border-color: #B36800; }
.em-filter-pill--delivered.em-filter-pill--on { background: #1D7A38; color: #fff; border-color: #1D7A38; }
.em-filter-pill--failed.em-filter-pill--on    { background: #C41E1E; color: #fff; border-color: #C41E1E; }
.em-fp-n { font-size: 13px; font-weight: 800; line-height: 1; }
.em-filter-select {
  height: 28px; padding: 0 8px; border: 1px solid #2a3a52; border-radius: 7px;
  background: #0f1729; font-size: 12px; color: #e2e8f0; outline: none; cursor: pointer;
  color-scheme: dark;
}
.em-filter-select:focus { border-color: #C9A84C; }
.em-filter-select--drawer { height: 32px; font-size: 13px; flex: 1; }
.em-detail-filters--sys { padding: 8px 24px; }
.em-drawer-list-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.em-drawer-list-lbl { font-size: 11px; font-weight: 700; color: #8892a4; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.em-detail-count { margin-left: auto; font-size: 12px; color: #8892a4; white-space: nowrap; }
.em-detail-table-wrap { overflow-x: auto; }

/* ── Floating action bar ── */
.em-action-bar {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px; background: #1a2236; border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5); white-space: nowrap;
  border: 1px solid #2a3a52;
}
.em-action-count { font-size: 13px; font-weight: 600; color: #c8d4e0; }
.em-action-btn {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 16px; border-radius: 8px; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 130ms;
}
.em-action-btn:hover { opacity: 0.88; }
.em-action-btn--sms { background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0; }
.em-action-btn--sms:hover { opacity: 1; background: rgba(201,168,76,0.2); }

/* ── Send Drawer ── */
.em-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 1000; display: flex; align-items: stretch; justify-content: flex-end; }
.em-overlay--center { align-items: center; justify-content: center; }
.em-drawer  { width: 400px; max-width: 95vw; height: 100%; background: #111827; display: flex; flex-direction: column; box-shadow: -8px 0 32px rgba(0,0,0,0.45); }
.em-drawer-header { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #1e2d44; }
.em-drawer-header-left { display: flex; align-items: center; gap: 8px; }
.em-drawer-title { font-size: 16px; font-weight: 700; color: #e2e8f0; }
.em-drawer-close { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.06); border: none; cursor: pointer; color: #8892a4; display: flex; align-items: center; justify-content: center; transition: background 130ms; }
.em-drawer-close:hover { background: rgba(255,255,255,0.10); }
.em-send-result { flex-shrink: 0; display: flex; align-items: flex-start; gap: 10px; padding: 12px 20px; font-size: 13px; }
.em-send-result--ok  { background: rgba(52,211,153,0.08); color: #34d399; border-bottom: 1px solid rgba(52,211,153,0.2); }
.em-send-result--err { background: rgba(255,69,58,0.08);  color: #fc8181; border-bottom: 1px solid rgba(255,69,58,0.2); }
.em-result-title { font-weight: 700; margin: 0 0 2px; }
.em-result-msg   { margin: 0; opacity: 0.8; }
.em-result-dismiss { margin-left: auto; background: none; border: none; cursor: pointer; font-size: 12px; opacity: 0.7; color: inherit; flex-shrink: 0; }
.em-result-dismiss:hover { opacity: 1; }
.em-drawer-body  { flex: 1; overflow-y: auto; padding: 0 20px 20px; }
.em-drawer-section { padding: 18px 0; border-bottom: 1px solid #1e2d44; }
.em-drawer-section:last-child { border-bottom: none; }
.em-drawer-section-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #8892a4; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 12px; }
.em-camp-grid-wrap { display: flex; align-items: center; gap: 4px; }
.em-camp-grid    { display: flex; flex-wrap: nowrap; gap: 8px; overflow-x: auto; scrollbar-width: none; flex: 1; }
.em-camp-grid::-webkit-scrollbar { display: none; }
.em-camp-card    { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; border: 1px solid #1e2d44; background: #0f1729; font-size: 13px; font-weight: 500; color: #8892a4; cursor: pointer; transition: all 130ms; text-align: left; flex-shrink: 0; min-width: 140px; }
.em-camp-card:hover { border-color: #C9A84C; color: #e2e8f0; }
.em-camp-card--active { border-color: rgba(226,232,240,0.25); background: rgba(226,232,240,0.08); color: #e2e8f0; font-weight: 600; }
.em-camp-card-icon  { display: flex; align-items: center; flex-shrink: 0; }
.em-camp-card-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-custom-camp-display {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 10px;
  border: 1px solid rgba(201,168,76,0.3); background: rgba(201,168,76,0.06);
  font-size: 14px; font-weight: 600; color: #e2e8f0;
}
.em-custom-camp-type { margin-left: auto; font-size: 11px; font-weight: 500; color: #8892a4; text-transform: capitalize; }
.em-send-ch-toggle { display: flex; gap: 8px; }
.em-send-ch-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; height: 40px; border-radius: 10px; border: 1px solid #1e2d44; background: #0f1729; font-size: 14px; font-weight: 500; color: #8892a4; cursor: pointer; transition: all 130ms; }
.em-send-ch-btn:hover { border-color: #C9A84C; }
.em-send-ch-btn--wsp { background: #128C7E; color: #fff; border-color: #128C7E; }
.em-send-ch-btn--sms { background: #5856D6; color: #fff; border-color: #5856D6; }
.em-ch-sms-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(88,86,214,0.3); background: rgba(88,86,214,0.1); }
.em-ch-sms-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(88,86,214,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.em-ch-sms-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.em-ch-sms-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
.em-ch-sms-note { font-size: 11px; color: #8892a4; }
.em-ch-sms-badge { display: flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 20px; background: #5856D6; color: #fff; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.em-recip-chips-wrap { display: flex; align-items: center; gap: 4px; margin-bottom: 10px; }
.em-chips-arrow { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; border: 1px solid #2a3a52; background: #111827; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #8892a4; transition: all 120ms; }
.em-chips-arrow:hover { border-color: #C9A84C; color: #C9A84C; }
.em-recip-chips { flex: 1; display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
.em-recip-chips::-webkit-scrollbar { display: none; }
.em-recip-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 20px; border: 1px solid #1e2d44; background: #0f1729; font-size: 12px; font-weight: 500; color: #8892a4; cursor: pointer; transition: all 130ms; white-space: nowrap; }
.em-recip-chip:hover { border-color: #C9A84C; }
.em-recip-chip--on { font-weight: 700; }
.em-recip-chip--unsent.em-recip-chip--on      { background: rgba(201,168,76,0.08); border-color: #C9A84C; color: #C9A84C; }
.em-recip-chip--sent.em-recip-chip--on        { background: rgba(59,130,246,0.12); border-color: #3B82F6; color: #63b3ed; }
.em-recip-chip--delivered.em-recip-chip--on   { background: rgba(52,211,153,0.12); border-color: #34d399; color: #34d399; }
.em-recip-chip--read.em-recip-chip--on        { background: rgba(52,211,153,0.08); border-color: #34d399; color: #34d399; }
.em-recip-chip--undelivered.em-recip-chip--on { background: rgba(249,115,22,0.12); border-color: #f97316; color: #f97316; }
.em-recip-chip--failed.em-recip-chip--on      { background: rgba(239,68,68,0.12); border-color: #ef4444; color: #fc8181; }
.em-recip-chip--all.em-recip-chip--on         { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.2); color: #e2e8f0; }
.em-chip-cnt { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 16px; padding: 0 4px; border-radius: 8px; background: rgba(255,255,255,0.08); font-size: 10px; font-weight: 700; }
.em-chip-cnt--gold { background: rgba(201,168,76,0.2); color: #C9A84C; }
.em-pick-toggle-btn { width: 100%; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 10px; border: 1px solid #1e2d44; background: #0f1729; font-size: 13px; font-weight: 500; color: #8892a4; cursor: pointer; transition: all 130ms; margin-bottom: 8px; }
.em-pick-toggle-btn:hover { border-color: #C9A84C; }
.em-pick-toggle-btn--on { border-color: #C9A84C; background: rgba(201,168,76,0.06); color: #C9A84C; font-weight: 600; }
.em-recip-hint { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #8892a4; margin: 0; }
.em-pick-wrap { margin-top: 10px; border: 1px solid #1e2d44; border-radius: 12px; overflow: hidden; }
.em-pick-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-bottom: 1px solid #1e2d44; background: #0f1729; }
.em-pick-search-wrap { flex: 1; display: flex; align-items: center; gap: 6px; background: #111827; border: 1px solid #2a3a52; border-radius: 8px; padding: 5px 8px; }
.em-pick-search { flex: 1; border: none; outline: none; font-size: 12px; color: #e2e8f0; background: transparent; }
.em-pick-clear { background: none; border: none; padding: 0; cursor: pointer; color: #4f617a; display: flex; }
.em-pick-all-btn { flex-shrink: 0; font-size: 11px; font-weight: 600; color: #C9A84C; background: none; border: none; cursor: pointer; padding: 4px 6px; white-space: nowrap; }
.em-pick-list { max-height: 220px; overflow-y: auto; }
.em-pick-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #1e2d44; transition: background 100ms; }
.em-pick-row:last-child { border-bottom: none; }
.em-pick-row:hover { background: #1a2236; }
.em-pick-row--on { background: rgba(201,168,76,0.05); }
.em-pick-cb { width: 15px; height: 15px; accent-color: #C9A84C; flex-shrink: 0; cursor: pointer; }
.em-pick-avatar { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.em-pick-info { flex: 1; min-width: 0; }
.em-pick-name { display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.em-pick-phone { display: block; font-size: 11px; color: #8892a4; }
.em-badge--sm { font-size: 10px; padding: 2px 6px; }
.em-pick-empty { padding: 20px; text-align: center; font-size: 12px; color: #8892a4; }
.em-selected-recip-display {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 10px;
  border: 1px solid rgba(201,168,76,0.3); background: rgba(201,168,76,0.06);
  font-size: 14px; color: #e2e8f0;
}
.em-tpl-loading { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: #C9A84C; font-weight: 500; text-transform: none; letter-spacing: 0; }
.em-tpl-empty   { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #8892a4; padding: 12px; border: 0.8px dashed #2a3a52; border-radius: 10px; }
.em-tpl-list    { display: flex; flex-direction: column; gap: 8px; }
.em-tpl-item    { display: flex; align-items: flex-start; gap: 10px; padding: 12px; border-radius: 10px; border: 1px solid #1e2d44; background: #0f1729; cursor: pointer; transition: all 130ms; }
.em-tpl-item:hover { border-color: #C9A84C; }
.em-tpl-item--active { border-color: rgba(226,232,240,0.2); background: rgba(226,232,240,0.06); }
.em-tpl-radio   { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #C9A84C; flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; }
.em-tpl-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #C9A84C; }
.em-tpl-body    { flex: 1; min-width: 0; }
.em-tpl-content { font-size: 13px; color: #e2e8f0; margin: 0 0 4px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
.em-tpl-meta    { font-size: 11px; color: #4f617a; margin: 0; }
.em-drawer-footer { flex-shrink: 0; display: flex; gap: 10px; padding: 14px 20px; border-top: 1px solid #1e2d44; background: #111827; }
.em-drawer-cancel { flex: 1; height: 40px; border-radius: 10px; border: 1px solid #1e2d44; background: rgba(255,255,255,0.05); font-size: 14px; font-weight: 500; color: #8892a4; cursor: pointer; transition: background 130ms; }
.em-drawer-cancel:hover { background: rgba(255,255,255,0.09); }
.em-drawer-send { flex: 2; height: 40px; border-radius: 10px; background: linear-gradient(180deg, #2e3a58 0%, #1e2d46 100%); color: #e2e8f0; border: none; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: opacity 130ms; }
.em-drawer-send:hover:not(:disabled) { opacity: 0.85; }
.em-drawer-send:disabled { opacity: 0.45; cursor: default; }

/* ── Campaign dialog ── */
.em-dialog {
  width: 400px; max-width: 95vw; background: #111827;
  border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  border: 1px solid #1e2d44; overflow: hidden;
}
.em-dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #1e2d44; }
.em-dialog-title  { font-size: 16px; font-weight: 700; color: #e2e8f0; margin: 0; }
.em-dialog-body   { padding: 20px; }
.em-dialog-lbl    { display: block; font-size: 11px; font-weight: 700; color: #8892a4; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
.em-dialog-input  {
  width: 100%; height: 40px; padding: 0 12px; border: 1px solid #2a3a52;
  border-radius: 10px; font-size: 14px; color: #e2e8f0; background: #0f1729;
  outline: none; box-sizing: border-box; transition: border-color 130ms;
}
.em-dialog-input:focus { border-color: #C9A84C; }
.em-dialog-type-row { display: flex; gap: 8px; }
.em-dialog-type-btn {
  flex: 1; height: 36px; border-radius: 9px; border: 1px solid #1e2d44;
  background: #0f1729; font-size: 13px; font-weight: 500; color: #8892a4; cursor: pointer; transition: all 130ms;
}
.em-dialog-type-btn:hover { border-color: #C9A84C; color: #e2e8f0; }
.em-dialog-type-btn--on { border-color: #C9A84C; background: rgba(201,168,76,0.06); color: #C9A84C; font-weight: 600; }
.em-dialog-footer { display: flex; gap: 10px; padding: 14px 20px; border-top: 1px solid #1e2d44; }

/* ── Animations ── */
.em-spin { animation: em-rotate 0.8s linear infinite; }
@keyframes em-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.em-fade-enter-active, .em-fade-leave-active { transition: opacity 180ms; }
.em-fade-enter-from,  .em-fade-leave-to     { opacity: 0; }
.em-slide-right-enter-active, .em-slide-right-leave-active { transition: transform 220ms cubic-bezier(0.4,0,0.2,1); }
.em-slide-right-enter-from,  .em-slide-right-leave-to     { transform: translateX(100%); }
.em-slide-up-enter-active, .em-slide-up-leave-active { transition: transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 180ms; }
.em-slide-up-enter-from,   .em-slide-up-leave-to    { transform: translateX(-50%) translateY(20px); opacity: 0; }
</style>