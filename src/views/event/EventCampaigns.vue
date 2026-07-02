<template>
  <div class="em-root">

    <!-- ══════════════════════════════════════════════
         CAMPAIGN LIST (no campaign selected)
         ══════════════════════════════════════════════ -->
    <template v-if="!selectedCustomCamp">

      <!-- Stat cards -->
      <div class="em-stats" v-if="!loadingCustomCamps || customCampaigns.length">
        <div class="em-stat-card">
          <div class="em-stat-icon em-stat-icon--purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div class="em-stat-body">
            <span class="em-stat-lbl">Total Campaigns</span>
            <span class="em-stat-val">{{ customCampaigns.length }}</span>
          </div>
        </div>
        <div class="em-stat-card">
          <div class="em-stat-icon em-stat-icon--blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div class="em-stat-body">
            <span class="em-stat-lbl">Invitation</span>
            <span class="em-stat-val">{{ customCampaigns.filter(c => c.type === 'invitation').length }}</span>
          </div>
        </div>
        <div class="em-stat-card">
          <div class="em-stat-icon em-stat-icon--gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div class="em-stat-body">
            <span class="em-stat-lbl">Contribution</span>
            <span class="em-stat-val">{{ customCampaigns.filter(c => c.type === 'contribution').length }}</span>
          </div>
        </div>
        <div class="em-stat-card">
          <div class="em-stat-icon em-stat-icon--teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="em-stat-body">
            <span class="em-stat-lbl">Contact</span>
            <span class="em-stat-val">{{ customCampaigns.filter(c => c.type === 'contact').length }}</span>
          </div>
        </div>
      </div>

      <!-- Panel -->
      <div class="em-panel">
        <div class="em-panel-hd">
          <h2 class="em-panel-title">Notifications</h2>
          <div class="em-panel-acts">
            <button class="em-add-btn" @click="openCampDialog(null)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Campaign
            </button>
          </div>
        </div>

        <div class="em-table-area">
          <div v-if="loadingCustomCamps" class="em-loading-state">
            <svg class="em-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Loading campaigns…</span>
          </div>

          <div v-else-if="!customCampaigns.length" class="em-empty-state">
            <div class="em-empty-icon">
              <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#1e1e1e"/>
                <path d="M42 22H22a2 2 0 0 0-2 2v16l6-4h16a2 2 0 0 0 2-2V24a2 2 0 0 0-2-2z" fill="#3a3a3a"/>
                <circle cx="44" cy="40" r="5" fill="#B8924D" fill-opacity="0.2" stroke="#B8924D" stroke-width="1.5"/>
                <line x1="44" y1="37.5" x2="44" y2="42.5" stroke="#B8924D" stroke-width="1.8" stroke-linecap="round"/>
                <line x1="41.5" y1="40" x2="46.5" y2="40" stroke="#B8924D" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="em-empty-title">No campaigns yet</p>
            <p class="em-empty-sub">Create a named campaign to send targeted SMS messages to specific attendees.</p>
            <button class="em-empty-cta" @click="openCampDialog(null)">Create First Campaign</button>
          </div>

          <div v-else class="eca-list">
            <div v-for="camp in pagedCampaigns" :key="camp.id"
              class="eca-card" @click="selectCustomCamp(camp)">
              <div class="eca-card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div class="eca-card-info">
                <span class="eca-card-name">{{ camp.name }}</span>
                <span class="eca-card-meta">Created {{ formatDate(camp.createdAt) }}</span>
              </div>
              <div class="eca-card-badges">
                <span class="eca-badge eca-badge--draft" style="text-transform:capitalize">{{ camp.type }}</span>
              </div>
              <div class="eca-camp-actions" @click.stop>
                <button class="em-camp-item-btn" @click="openCampDialog(camp)" title="Edit">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="em-camp-item-btn em-camp-item-btn--del" @click="deleteCustomCampaign(camp)" title="Delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B5B5BB" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loadingCustomCamps && customCampaigns.length" class="em-table-footer" :class="{ 'em-footer--disabled': campTotalPages === 1 }">
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
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         CAMPAIGN DETAIL (campaign selected)
         ══════════════════════════════════════════════ -->
    <template v-else>

      <!-- Stat cards for detail view -->
      <div class="em-stats">
        <div class="em-stat-card">
          <div class="em-stat-icon em-stat-icon--purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="em-stat-body">
            <span class="em-stat-lbl">Total Attendees</span>
            <span class="em-stat-val">{{ customStatusCounts.all }}</span>
          </div>
        </div>
        <div class="em-stat-card">
          <div class="em-stat-icon em-stat-icon--blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </div>
          <div class="em-stat-body">
            <span class="em-stat-lbl">Sent</span>
            <span class="em-stat-val">{{ customStatusCounts.sent }}</span>
          </div>
        </div>
        <div class="em-stat-card">
          <div class="em-stat-icon em-stat-icon--teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="em-stat-body">
            <span class="em-stat-lbl">Delivered</span>
            <span class="em-stat-val">{{ customStatusCounts.delivered }}</span>
          </div>
        </div>
        <div class="em-stat-card">
          <div class="em-stat-icon em-stat-icon--red">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="em-stat-body">
            <span class="em-stat-lbl">Failed</span>
            <span class="em-stat-val">{{ customStatusCounts.failed }}</span>
          </div>
        </div>
      </div>

      <!-- Panel -->
      <div class="em-panel">

        <!-- Panel header -->
        <div class="em-panel-hd">
          <button class="em-detail-back" @click="selectedCustomCamp = null; customSelectList = []">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Notifications
          </button>
          <h2 class="em-panel-title">{{ selectedCustomCamp.name }}</h2>
          <span class="em-detail-type">{{ selectedCustomCamp.type }}</span>
          <span class="em-detail-count">{{ customFilteredAttendees.length }} attendee{{ customFilteredAttendees.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- Filter bar -->
        <div class="em-panel-filter-bar">
          <div class="em-filter-group">
            <span class="em-filter-lbl">Status</span>
            <div class="em-filter-pills">
              <button v-for="s in STATUS_OPTIONS" :key="s.v"
                class="em-filter-pill" :class="[s.v !== 'all' ? `em-filter-pill--${s.v}` : 'em-filter-pill--all', { 'em-filter-pill--on': customStatus === s.v }]"
                @click="customStatus = s.v">
                <span class="em-fp-n">{{ customStatusCounts[s.v] ?? 0 }}</span> {{ s.l }}
              </button>
            </div>
          </div>
          <div class="em-filter-group" v-if="props.event?.labels?.length">
            <span class="em-filter-lbl">List</span>
            <select v-model="customLabelId" class="em-filter-select">
              <option :value="null">All Lists</option>
              <option v-for="lbl in props.event.labels" :key="lbl.id" :value="lbl.id">{{ lbl.name }}</option>
            </select>
          </div>
        </div>

        <!-- Detail card list -->
        <div class="em-table-area">
          <!-- Select-all bar -->
          <div class="eca-selbar" v-if="!loading || attendees.length">
            <label class="eca-selbar-cb">
              <input type="checkbox"
                :checked="allCustomSelected"
                :indeterminate.prop="someCustomSelected && !allCustomSelected"
                @change="toggleCustomSelectAll" />
              <span class="eca-selbar-lbl">Select all</span>
            </label>
          </div>

          <!-- Skeleton -->
          <div v-if="loading && !attendees.length" class="eca-list">
            <div v-for="n in 8" :key="`csk-${n}`" class="eca-card eca-card--sk">
              <div class="eca-sk-circle" />
              <div class="eca-card-info">
                <div class="eca-sk-bar eca-sk-bar--lg" />
                <div class="eca-sk-bar eca-sk-bar--sm" style="margin-top:4px" />
              </div>
              <div class="eca-card-badges">
                <div class="eca-sk-bar eca-sk-bar--sm" />
              </div>
              <div class="eca-sk-bar eca-sk-bar--sm" style="width:60px" />
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="!loading && !customFilteredAttendees.length" class="em-empty-state em-empty-state--sm">
            <p class="em-empty-title">No attendees match these filters</p>
            <p class="em-empty-sub">Try changing the status or list filter.</p>
          </div>

          <!-- Cards -->
          <div v-else class="eca-list">
            <div v-for="att in pagedDetailAttendees" :key="att.id"
              class="eca-card eca-card--detail"
              :class="[`eca-card--${getCustomStatus(att) ?? 'unsent'}`, { 'eca-card--selected': isCustomSelected(att) }]"
              @click="toggleCustomSelect(att)">
              <!-- Checkbox -->
              <div class="eca-card-cb" @click.stop>
                <input type="checkbox" :checked="isCustomSelected(att)" @change="toggleCustomSelect(att)" />
              </div>
              <!-- Avatar -->
              <div class="eca-card-icon eca-card-icon--avatar"
                :style="{ background: avatarBg(att.fullName), color: avatarFg(att.fullName) }">
                {{ initials(att.fullName) }}
              </div>
              <!-- Identity -->
              <div class="eca-card-info">
                <span class="eca-card-name">{{ att.fullName }}</span>
                <span class="eca-card-meta">{{ att.phone || '—' }}</span>
              </div>
              <!-- Status badge -->
              <div class="eca-card-badges">
                <span class="eca-badge"
                  :class="`eca-badge--${getCustomStatus(att) === 'delivered' || getCustomStatus(att) === 'read' ? 'sent' : (getCustomStatus(att) ?? 'draft')}`">
                  <svg v-if="['delivered','read'].includes(getCustomStatus(att))" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else-if="getCustomStatus(att) === 'failed'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  {{ STATUS_LABELS[getCustomStatus(att)] ?? 'Unsent' }}
                </span>
              </div>
              <!-- Date -->
              <span class="eca-card-date">{{ formatDate(att.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Detail footer -->
        <div class="em-table-footer" :class="{ 'em-footer--disabled': detailTotalPages === 1 }">
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

    <!-- ══════════════════════════════════════════════
         SEND DRAWER
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
                  <span class="em-drawer-title">Send SMS Campaign</span>
                </div>
                <button class="em-drawer-close" @click="closeSendDrawer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

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
                <div class="em-drawer-section">
                  <p class="em-drawer-section-label">Campaign</p>
                  <div class="em-custom-camp-display">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.8" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {{ selectedCustomCamp?.name }}
                    <span class="em-custom-camp-type">{{ selectedCustomCamp?.type }}</span>
                  </div>
                </div>

                <div class="em-drawer-section">
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

                <div class="em-drawer-section">
                  <p class="em-drawer-section-label">Recipients</p>
                  <div class="em-selected-recip-display">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span><strong>{{ customSelectList.length }}</strong> attendees selected</span>
                  </div>
                </div>

                <div class="em-drawer-section">
                  <p class="em-drawer-section-label">
                    Template
                    <button class="em-browse-tpl-btn" @click="openTemplatePicker">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      Browse Haflaway templates
                    </button>
                    <span v-if="loadingTemplates" class="em-tpl-loading">
                      <svg class="em-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                      Loading…
                    </span>
                  </p>
                  <div v-if="!loadingTemplates && !templates.length" class="em-tpl-empty">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B5B5BB" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    No templates found for this campaign.
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
                    Send to {{ customSelectList.length }}
                  </template>
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

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

  <!-- Global template picker -->
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
              No global templates available yet.
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
                <button class="em-tpk-import-btn" :disabled="importingTplId === tpl.id" @click="importGlobalTemplate(tpl)">
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
import { collection, query, orderBy, where, getDocs, addDoc, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

const props = defineProps({ event: Object, eventId: String })
const route  = useRoute()
const eventId = computed(() => props.eventId ?? route.params.eventId)

const SMS_URL = 'https://sendsmsaction-frbu33fema-uc.a.run.app'

const STATUS_LABELS = {
  unsent: 'Unsent', sent: 'Sent', delivered: 'Delivered',
  read: 'Read', failed: 'Failed', pending: 'Pending', undelivered: 'Undelivered',
}

const STATUS_OPTIONS = [
  { v: 'unsent',    l: 'Unsent'    },
  { v: 'sent',      l: 'Sent'      },
  { v: 'delivered', l: 'Delivered' },
  { v: 'failed',    l: 'Failed'    },
  { v: 'all',       l: 'All'       },
]

// ── Attendees ──────────────────────────────────────────────────────────────────
const attendees = ref([])
const loading   = ref(false)

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

// ── Custom campaigns ───────────────────────────────────────────────────────────
const customCampaigns     = ref([])
const loadingCustomCamps  = ref(false)
const campPage            = ref(1)
const CAMP_PAGE_SIZE      = 10

const campTotalPages = computed(() => Math.max(1, Math.ceil(customCampaigns.value.length / CAMP_PAGE_SIZE)))
const pagedCampaigns = computed(() => {
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

const selectedCustomCamp = ref(null)
const customStatus       = ref('unsent')
const customLabelId      = ref(null)
const customSelectList   = ref([])

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

function selectCustomCamp(camp) {
  selectedCustomCamp.value = camp
  customSelectList.value = []
  customStatus.value = 'unsent'
  customLabelId.value = null
}

// ── Campaign dialog ────────────────────────────────────────────────────────────
const campDialogOpen  = ref(false)
const editingCamp     = ref(null)
const campDialogName  = ref('')
const campDialogType  = ref('invitation')
const savingCamp      = ref(false)

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

// ── Filtered attendees ─────────────────────────────────────────────────────────
const customFilteredAttendees = computed(() => {
  if (!selectedCustomCamp.value) return []
  const campId   = selectedCustomCamp.value.id
  const status   = customStatus.value
  const labelId  = customLabelId.value
  const cardType = selectedCustomCamp.value.type

  return attendees.value.filter(att => {
    if (!att.cards || att.cards[cardType] == null) return false
    if (labelId && !(att.labelIds ?? []).includes(labelId)) return false
    const prefix = `sms_${campId}_`
    const match  = (att.messageIndexes ?? []).find(idx => idx.startsWith(prefix))
    const s      = match ? match.slice(match.lastIndexOf('_') + 1) : null
    if (status === 'all') return true
    if (status === 'unsent') return s === null || s === 'unsent'
    return s === status
  })
})

function getCustomStatus(att) {
  if (!selectedCustomCamp.value) return null
  const prefix = `sms_${selectedCustomCamp.value.id}_`
  const match  = (att.messageIndexes ?? []).find(idx => idx.startsWith(prefix))
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

// ── Detail pagination ──────────────────────────────────────────────────────────
const detailPage       = ref(1)
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
watch(customFilteredAttendees, () => { detailPage.value = 1 })

// ── Selection ──────────────────────────────────────────────────────────────────
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
watch([customStatus, customLabelId], () => { customSelectList.value = [] })

// ── Send drawer ────────────────────────────────────────────────────────────────
const sendDrawerOpen   = ref(false)
const sendCampaign     = ref(null)
const templates        = ref([])
const selectedTemplate = ref(null)
const loadingTemplates = ref(false)
const sending          = ref(false)
const sendResult       = ref(null)

const canSend = computed(() => selectedTemplate.value && customSelectList.value.length > 0 && !sending.value)

function openCustomSend() {
  sendCampaign.value = selectedCustomCamp.value.id
  sendResult.value   = null
  sendDrawerOpen.value = true
  loadSendTemplates()
}

function closeSendDrawer() {
  sendDrawerOpen.value = false
  if (sendResult.value?.ok) customSelectList.value = []
}

async function loadSendTemplates() {
  if (!eventId.value) return
  loadingTemplates.value = true
  templates.value = []
  selectedTemplate.value = null
  try {
    const snap = await getDocs(collection(db, 'events', eventId.value, 'messageTemplates'))
    templates.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (templates.value.length === 1) selectedTemplate.value = templates.value[0]
  } catch (e) {
    console.error('Failed to load templates', e)
  } finally {
    loadingTemplates.value = false
  }
}

async function executeSend() {
  if (!canSend.value) return
  sending.value = true
  sendResult.value = null
  try {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    const kardType = selectedCustomCamp.value?.type ?? 'invitation'
    const body = {
      content: selectedTemplate.value.content,
      type: sendCampaign.value,
      eventId: eventId.value,
      attendeesIds: customSelectList.value.map(a => a.id),
      kardType,
    }
    const res  = await fetch(SMS_URL, { method: 'POST', headers: { Authorization: `Bearer ${user.uid}` }, body: JSON.stringify(body) })
    const data = await res.json()
    sendResult.value = { ok: data.status === true, message: data.message ?? (data.status ? 'Done.' : 'Request failed.') }
    if (data.status) {
      await load()
      customSelectList.value = []
    }
  } catch (e) {
    sendResult.value = { ok: false, message: e.message }
  } finally {
    sending.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return '?'
  const p = name.trim().split(/\s+/).filter(Boolean)
  return p.length === 1 ? (p[0][0] ?? '?').toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}
function nameHash(s) { let h = 0; for (let i = 0; i < (s?.length ?? 0); i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) }
function avatarBg(n) { return `hsl(${nameHash(n ?? '') % 360}, 50%, 88%)` }
function avatarFg(n) { return `hsl(${nameHash(n ?? '') % 360}, 50%, 30%)` }
function formatDate(iso) { if (!iso) return '—'; try { return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '—' } }

onMounted(() => { load(); loadCustomCampaigns() })
watch(eventId, () => { if (eventId.value) { load(); loadCustomCampaigns() } })

// ── Global template picker ────────────────────────────────────────────────────
const tplPickerOpen     = ref(false)
const globalTemplates   = ref([])
const loadingGlobalTpls = ref(false)
const importingTplId    = ref(null)

async function openTemplatePicker() {
  tplPickerOpen.value = true
  if (globalTemplates.value.length) return
  loadingGlobalTpls.value = true
  try {
    const snap = await getDocs(query(collection(db, 'smsTemplates'), orderBy('createdAt', 'desc')))
    globalTemplates.value = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.active !== false)
  } catch (e) { console.error(e) }
  finally { loadingGlobalTpls.value = false }
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
</script>

<style scoped>
.em-root {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
}

/* ── Stat cards ── */
.em-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.em-stat-card {
  background: #111111; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 20px 20px 18px; display: flex; align-items: flex-start; gap: 16px;
}
.em-stat-icon {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0; margin-top: 2px;
  display: flex; align-items: center; justify-content: center;
}
.em-stat-icon--gold   { background: rgba(201,168,76,0.08);  color: #C9A84C; }
.em-stat-icon--blue   { background: rgba(96,165,250,0.08);  color: #60a5fa; }
.em-stat-icon--teal   { background: rgba(45,212,191,0.08);  color: #2dd4bf; }
.em-stat-icon--purple { background: rgba(167,139,250,0.08); color: #a78bfa; }
.em-stat-icon--red    { background: rgba(252,129,129,0.08); color: #fc8181; }
.em-stat-body { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.em-stat-lbl  { font-size: 11px; color: #777; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.6px; text-transform: uppercase; }
.em-stat-val  { font-size: 32px; font-weight: 700; color: #f0f0ec; white-space: nowrap; line-height: 1; letter-spacing: -0.5px; }

/* ── Panel ── */
.em-panel {
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
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
  font-size: 19px; font-weight: 700; color: #f0ece6; margin: 0;
  letter-spacing: -0.3px; white-space: nowrap;
}
.em-panel-acts { display: flex; align-items: center; gap: 8px; margin-left: auto; }

/* ── New Campaign button ── */
.em-add-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: #C9A84C; color: #070707; border: none; border-radius: 10px;
  font-size: 13px; font-weight: 700; cursor: pointer; transition: background 150ms;
  font-family: inherit; flex-shrink: 0;
}
.em-add-btn:hover { background: #d4b560; }

/* ── Table area ── */
.em-table-area { overflow-x: auto; }

/* ── Filter bar (inside detail panel) ── */
.em-panel-filter-bar {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding: 10px 20px; border-bottom: 1px solid #1e1e1e; background: #0d0d0d;
}

/* ── Detail header extras ── */
.em-detail-back {
  display: flex; align-items: center; gap: 5px; background: none; border: none;
  font-size: 13px; color: #888; cursor: pointer; transition: color 130ms; flex-shrink: 0;
  font-family: inherit;
}
.em-detail-back:hover { color: #C9A84C; }
.em-detail-type {
  font-size: 11px; font-weight: 600; color: #888; background: rgba(255,255,255,0.06);
  padding: 3px 8px; border-radius: 20px; white-space: nowrap; text-transform: capitalize; flex-shrink: 0;
}
.em-detail-count { margin-left: auto; font-size: 12px; color: #888; white-space: nowrap; }

/* ── Loading / empty states ── */
.em-loading-state { display: flex; align-items: center; gap: 10px; color: #888; font-size: 14px; padding: 48px 0; justify-content: center; }
.em-empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; text-align: center; }
.em-empty-state--sm { padding: 40px 24px; }
.em-empty-icon  { margin-bottom: 16px; }
.em-empty-title { font-size: 16px; font-weight: 700; color: #f0f0ec; margin: 0 0 6px; }
.em-empty-sub   { font-size: 14px; color: #888; margin: 0 0 16px; max-width: 300px; }
.em-empty-cta   {
  height: 36px; padding: 0 18px; border-radius: 10px; border: none;
  background: #C9A84C; color: #070707; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: background 150ms; font-family: inherit;
}
.em-empty-cta:hover { background: #d4b560; }

/* ── Action buttons (shared) ── */
.em-camp-item-btn {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid #2a2a2a;
  background: rgba(255,255,255,0.04); color: #888; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 130ms;
}
.em-camp-item-btn:hover { background: #1a2236; color: #f0f0ec; }
.em-camp-item-btn--del:hover { background: rgba(255,69,58,0.08); color: #fc8181; border-color: rgba(255,69,58,0.25); }

/* ── Card list ── */
.eca-list {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px 16px; background: #0d0d0d;
}
.eca-card {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 16px;
  background: #141414; border: 1px solid #202020; border-radius: 12px;
  transition: background 150ms, border-color 150ms, box-shadow 150ms;
  cursor: pointer;
}
.eca-card:hover:not(.eca-card--sk) { background: #191919; border-color: #2c2c2c; box-shadow: 0 4px 16px rgba(0,0,0,0.35); }
.eca-card--sk { pointer-events: none; }
.eca-card--selected { background: rgba(201,168,76,0.06) !important; border-color: rgba(201,168,76,0.25) !important; }

/* Card icon zone */
.eca-card-icon {
  width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(201,168,76,0.10); color: #C9A84C;
}
.eca-card-icon--avatar {
  font-size: 12px; font-weight: 700; background: unset;
}

/* Card identity */
.eca-card-info { display: flex; flex-direction: column; gap: 3px; flex: 0 0 200px; min-width: 0; }
.eca-card-name { font-size: 13px; font-weight: 600; color: #e8e4dd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.eca-card-meta { font-size: 11px; color: #505050; }

/* Card badges zone */
.eca-card-badges { flex: 1; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

/* Badge */
.eca-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
  border: 1px solid transparent;
}
.eca-badge--sent      { background: rgba(48,209,88,0.10);   color: #1D7A38; border-color: rgba(48,209,88,0.20); }
.eca-badge--scheduled { background: rgba(201,168,76,0.10);  color: #B36800; border-color: rgba(201,168,76,0.20); }
.eca-badge--draft     { background: rgba(255,255,255,0.05); color: #888;    border-color: #2a2a2a; }
.eca-badge--failed    { background: rgba(255,69,58,0.10);   color: #C41E1E; border-color: rgba(255,69,58,0.20); }
.eca-badge--unsent    { background: rgba(255,255,255,0.05); color: #888;    border-color: #2a2a2a; }
.eca-badge--pending   { background: rgba(255,204,0,0.10);   color: #B36800; border-color: rgba(255,204,0,0.20); }
.eca-badge--undelivered { background: rgba(255,69,58,0.08); color: #C41E1E; border-color: rgba(255,69,58,0.15); }

/* Left border stripe by status */
.eca-card--sent      { box-shadow: inset 3px 0 0 rgba(48,209,88,0.55); }
.eca-card--scheduled { box-shadow: inset 3px 0 0 rgba(201,168,76,0.55); }
.eca-card--draft     { box-shadow: inset 3px 0 0 rgba(255,255,255,0.08); }
.eca-card--failed    { box-shadow: inset 3px 0 0 rgba(255,69,58,0.40); }
.eca-card--unsent    { box-shadow: inset 3px 0 0 rgba(255,255,255,0.06); }

/* Date */
.eca-card-date { font-size: 11px; color: #3a3a3a; white-space: nowrap; flex-shrink: 0; text-align: right; }

/* Checkbox in detail cards */
.eca-card-cb { display: flex; align-items: center; flex-shrink: 0; }

/* Campaign list actions */
.eca-camp-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

/* Select-all bar */
.eca-selbar { display: flex; align-items: center; padding: 10px 16px; border-bottom: 1px solid #1e1e1e; background: #0d0d0d; }
.eca-selbar-cb { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.eca-selbar-lbl { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; user-select: none; }

/* Skeleton */
@keyframes eca-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.eca-sk-circle { width: 40px; height: 40px; border-radius: 11px; background: #2a2a2a; flex-shrink: 0; animation: eca-pulse 1.4s ease-in-out infinite; }
.eca-sk-bar    { height: 12px; border-radius: 6px; background: #2a2a2a; animation: eca-pulse 1.4s ease-in-out infinite; }
.eca-sk-bar--lg { width: 140px; }
.eca-sk-bar--sm { width: 80px; }

/* Responsive */
@media (max-width: 640px) {
  .eca-list { padding: 8px 10px; gap: 5px; }

  /* Campaign list cards — simple two-row layout */
  .eca-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas: "icon info badges" "icon info badges";
    align-items: start; gap: 3px 12px; padding: 12px 14px;
  }
  .eca-card-icon   { grid-area: icon; align-self: center; }
  .eca-card-info   { grid-area: info; flex: unset; }
  .eca-card-badges { grid-area: badges; justify-content: flex-end; flex: unset; align-self: center; }
  .eca-card-date   { display: none; }
  .eca-camp-actions { display: none; }

  /* Detail cards: compact 2-row grid
     Row 1: cb | avatar | NAME         | [badge]
     Row 2: cb | avatar | phone        | date          */
  .eca-card.eca-card--detail {
    grid-template-columns: auto auto 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas:
      "cb icon name  bdg"
      "cb icon meta  dt";
    gap: 2px 10px;
    padding: 10px 12px;
  }
  .eca-card.eca-card--detail .eca-card-cb   { grid-area: cb;   align-self: center; grid-row: 1/3; }
  .eca-card.eca-card--detail .eca-card-icon { grid-area: icon; align-self: center; grid-row: 1/3; width: 36px; height: 36px; font-size: 11px; }
  /* Flatten info wrapper so name and meta each become a grid item */
  .eca-card.eca-card--detail .eca-card-info   { display: contents; }
  .eca-card.eca-card--detail .eca-card-name   { grid-area: name; align-self: center; font-size: 12px; min-width: 0; }
  .eca-card.eca-card--detail .eca-card-meta   { grid-area: meta; align-self: center; font-size: 10px; color: #444; }
  .eca-card.eca-card--detail .eca-card-badges { grid-area: bdg;  align-self: center; justify-content: flex-end; flex: unset; margin-top: 0; }
  .eca-card.eca-card--detail .eca-card-date   { grid-area: dt;   display: block; align-self: center; font-size: 10px; color: #444; padding-top: 0; text-align: right; }
}
@media (max-width: 400px) { .eca-card-date { display: none; } }

/* ── SMS status badges ── */
.em-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.em-badge--null, .em-badge--undefined { background: transparent; color: #555; }
.em-badge--unsent      { background: rgba(255,255,255,0.06); color: #888; }
.em-badge--sent        { background: rgba(255,159,10,0.12);  color: #f59e0b; }
.em-badge--delivered   { background: rgba(52,211,153,0.12);  color: #34d399; }
.em-badge--read        { background: rgba(99,179,237,0.12);  color: #63b3ed; }
.em-badge--failed      { background: rgba(255,69,58,0.12);   color: #fc8181; }
.em-badge--pending     { background: rgba(255,204,0,0.12);   color: #fbbf24; }
.em-badge--undelivered { background: rgba(255,69,58,0.08);   color: #fc8181; }

/* ── Skeleton ── */
.em-sk-name   { display: flex; align-items: center; gap: 9px; }
.em-sk-circle { width: 32px; height: 32px; border-radius: 8px; background: #2a2a2a; flex-shrink: 0; animation: em-pulse 1.4s ease-in-out infinite; }
.em-sk-bar    { height: 12px; border-radius: 6px; background: #2a2a2a; width: 90px; animation: em-pulse 1.4s ease-in-out infinite; }
.em-sk-bar--lg{ width: 130px; }
.em-sk-bar--sm{ width: 60px; }
@keyframes em-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Filter pills ── */
.em-filter-group { display: flex; align-items: center; gap: 8px; }
.em-filter-lbl   { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
.em-filter-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.em-filter-pill  { height: 28px; padding: 0 12px; border-radius: 20px; border: 1px solid transparent; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 130ms; font-family: inherit; }
.em-filter-pill:hover { filter: brightness(1.15); }
.em-filter-pill--all       { background: rgba(255,255,255,0.06); color: #888; border-color: #2a2a2a; }
.em-filter-pill--unsent    { background: rgba(255,255,255,0.06); color: #888; border-color: #2a2a2a; }
.em-filter-pill--sent      { background: rgba(255,159,10,0.10);  color: #f59e0b; border-color: rgba(255,159,10,0.2); }
.em-filter-pill--delivered { background: rgba(52,211,153,0.10);  color: #34d399; border-color: rgba(52,211,153,0.2); }
.em-filter-pill--failed    { background: rgba(255,69,58,0.10);   color: #fc8181; border-color: rgba(255,69,58,0.2); }
.em-filter-pill--all.em-filter-pill--on       { background: rgba(226,232,240,0.15); color: #f0f0ec; border-color: rgba(226,232,240,0.2); }
.em-filter-pill--unsent.em-filter-pill--on    { background: #555; color: #f0f0ec; border-color: #555; }
.em-filter-pill--sent.em-filter-pill--on      { background: #B36800; color: #fff; border-color: #B36800; }
.em-filter-pill--delivered.em-filter-pill--on { background: #1D7A38; color: #fff; border-color: #1D7A38; }
.em-filter-pill--failed.em-filter-pill--on    { background: #C41E1E; color: #fff; border-color: #C41E1E; }
.em-fp-n { font-size: 13px; font-weight: 800; line-height: 1; }
.em-filter-select {
  height: 28px; padding: 0 8px; border: 1px solid #2a2a2a; border-radius: 7px;
  background: #111111; font-size: 12px; color: #f0f0ec; outline: none; cursor: pointer; color-scheme: dark;
}
.em-filter-select:focus { border-color: #C9A84C; }

/* ── Table footer / pagination ── */
.em-table-footer {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; background: #0d0d0d; border-top: 1px solid #1e1e1e;
}
.em-footer--disabled { opacity: 0.38; pointer-events: none; }
.em-range-lbl   { font-size: 13px; color: #888; }
.em-paginator   { display: flex; align-items: center; gap: 4px; }
.em-page-btn    { min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 1px solid #2a2a2a; background: #0d0d0d; font-size: 13px; font-weight: 500; color: #888; cursor: pointer; transition: all 130ms; display: flex; align-items: center; justify-content: center; }
.em-page-btn:hover:not(:disabled) { background: #1a2236; }
.em-page-btn:disabled { opacity: 0.4; cursor: default; }
.em-page-btn--active { background: rgba(226,232,240,0.12); border-color: rgba(226,232,240,0.18); color: #f0f0ec; }
.em-page-btn--nav    { color: #888; }
.em-page-ellipsis   { font-size: 13px; color: #555; padding: 0 4px; }

/* ── Floating action bar ── */
.em-action-bar {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px; background: #1a2236; border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5); white-space: nowrap;
  border: 1px solid #2a2a2a; z-index: 200;
}
.em-action-count { font-size: 13px; font-weight: 600; color: #d4cfc8; }
.em-action-btn {
  display: flex; align-items: center; gap: 6px; height: 34px; padding: 0 16px;
  border-radius: 8px; border: none; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: opacity 130ms; font-family: inherit;
}
.em-action-btn--sms { background: #C9A84C; color: #070707; }
.em-action-btn--sms:hover { background: #d4b560; opacity: 1; }

/* ── Send Drawer ── */
.em-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 1000; display: flex; align-items: stretch; justify-content: flex-end; }
.em-overlay--center { align-items: center; justify-content: center; }
.em-drawer  { width: 400px; max-width: 95vw; height: 100%; background: #0d0d0d; display: flex; flex-direction: column; box-shadow: -8px 0 32px rgba(0,0,0,0.45); }
.em-drawer-header { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #2a2a2a; }
.em-drawer-header-left { display: flex; align-items: center; gap: 8px; }
.em-drawer-title { font-size: 16px; font-weight: 700; color: #f0f0ec; }
.em-drawer-close { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.06); border: none; cursor: pointer; color: #888; display: flex; align-items: center; justify-content: center; transition: background 130ms; }
.em-drawer-close:hover { background: rgba(255,255,255,0.10); }
.em-send-result { flex-shrink: 0; display: flex; align-items: flex-start; gap: 10px; padding: 12px 20px; font-size: 13px; }
.em-send-result--ok  { background: rgba(52,211,153,0.08); color: #34d399; border-bottom: 1px solid rgba(52,211,153,0.2); }
.em-send-result--err { background: rgba(255,69,58,0.08);  color: #fc8181; border-bottom: 1px solid rgba(255,69,58,0.2); }
.em-result-title { font-weight: 700; margin: 0 0 2px; }
.em-result-msg   { margin: 0; opacity: 0.8; }
.em-result-dismiss { margin-left: auto; background: none; border: none; cursor: pointer; font-size: 12px; opacity: 0.7; color: inherit; flex-shrink: 0; }
.em-result-dismiss:hover { opacity: 1; }
.em-drawer-body  { flex: 1; overflow-y: auto; padding: 0 20px 20px; }
.em-drawer-section { padding: 18px 0; border-bottom: 1px solid #2a2a2a; }
.em-drawer-section:last-child { border-bottom: none; }
.em-drawer-section-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 12px; }
.em-custom-camp-display { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(201,168,76,0.3); background: rgba(201,168,76,0.06); font-size: 14px; font-weight: 600; color: #f0f0ec; }
.em-custom-camp-type { margin-left: auto; font-size: 11px; font-weight: 500; color: #888; text-transform: capitalize; }
.em-ch-sms-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(88,86,214,0.3); background: rgba(88,86,214,0.1); }
.em-ch-sms-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(88,86,214,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.em-ch-sms-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.em-ch-sms-name { font-size: 13px; font-weight: 600; color: #f0f0ec; }
.em-ch-sms-note { font-size: 11px; color: #888; }
.em-ch-sms-badge { display: flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 20px; background: #5856D6; color: #fff; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.em-selected-recip-display { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(201,168,76,0.3); background: rgba(201,168,76,0.06); font-size: 14px; color: #f0f0ec; }
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
.em-drawer-footer { flex-shrink: 0; display: flex; gap: 10px; padding: 14px 20px; border-top: 1px solid #2a2a2a; background: #0d0d0d; }
.em-drawer-cancel { flex: 1; height: 40px; border-radius: 10px; border: 1px solid #2a2a2a; background: rgba(255,255,255,0.05); font-size: 14px; font-weight: 500; color: #888; cursor: pointer; transition: background 130ms; font-family: inherit; }
.em-drawer-cancel:hover { background: rgba(255,255,255,0.09); }
.em-drawer-send { flex: 2; height: 40px; border-radius: 10px; background: #C9A84C; color: #070707; border: none; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background 150ms; font-family: inherit; }
.em-drawer-send:hover:not(:disabled) { background: #d4b560; }
.em-drawer-send:disabled { opacity: 0.45; cursor: default; }

/* ── Campaign dialog ── */
.em-dialog { width: 400px; max-width: 95vw; background: #0d0d0d; border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,0.5); border: 1px solid #2a2a2a; overflow: hidden; }
.em-dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #2a2a2a; }
.em-dialog-title  { font-size: 16px; font-weight: 700; color: #f0f0ec; margin: 0; }
.em-dialog-body   { padding: 20px; }
.em-dialog-lbl    { display: block; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
.em-dialog-input  { width: 100%; height: 40px; padding: 0 12px; border: 1px solid #2a2a2a; border-radius: 10px; font-size: 14px; color: #f0f0ec; background: #111111; outline: none; box-sizing: border-box; transition: border-color 130ms; font-family: inherit; }
.em-dialog-input:focus { border-color: #C9A84C; }
.em-dialog-type-row { display: flex; gap: 8px; }
.em-dialog-type-btn { flex: 1; height: 36px; border-radius: 9px; border: 1px solid #2a2a2a; background: #111111; font-size: 13px; font-weight: 500; color: #888; cursor: pointer; transition: all 130ms; font-family: inherit; }
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
.em-slide-up-enter-from,  .em-slide-up-leave-to     { transform: translateX(-50%) translateY(80px); opacity: 0; }

/* ── Responsive ── */
@media (max-width: 900px) {
  /* Switch to 2-column stat grid before the 4th card clips off-screen */
  .em-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; min-width: 0; }
  .em-stat-card { min-width: 0; overflow: hidden; }
  .em-stat-lbl { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}

@media (max-width: 700px) {
  .em-root  { padding: 12px 14px 20px; gap: 12px; }
  /* Column layout so labels get full card width */
  .em-stat-card { padding: 12px; gap: 6px; flex-direction: column; align-items: flex-start; }
  .em-stat-icon { width: 32px; height: 32px; flex-shrink: 0; }
  .em-stat-val  { font-size: 22px; }
  .em-stat-body { gap: 2px; min-width: 0; width: 100%; }
  .em-stat-lbl  { font-size: 10px; letter-spacing: 0; }
  /* Status filter pills: scroll horizontally instead of wrapping */
  .em-filter-pills { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .em-filter-pills::-webkit-scrollbar { display: none; }
  .em-filter-pill { flex-shrink: 0; }
  /* Panel header: allow wrapping on narrow screens */
  .em-panel-hd { flex-wrap: wrap; padding: 10px 14px; gap: 8px; }
  .em-panel-title { font-size: 16px; }
  .em-panel-filter-bar { padding: 8px 14px; gap: 10px; }
}

/* ── Browse templates button ── */
.em-browse-tpl-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: transparent; border: none; color: #C9A84C; padding: 0; margin-left: auto;
  font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit;
  text-transform: none; letter-spacing: 0; transition: opacity 130ms;
}
.em-browse-tpl-btn:hover { opacity: 0.75; }

/* ── Global template picker ── */
.em-tpk-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 1100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.em-tpk-panel { background: #141414; border: 1px solid #2a2a2a; border-radius: 18px; width: 480px; max-width: calc(100vw - 40px); max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5); }
.em-tpk-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px 0; flex-shrink: 0; }
.em-tpk-title { font-size: 16px; font-weight: 700; color: #f0f0ec; }
.em-tpk-close { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 7px; border: 1px solid #2a2a2a; background: rgba(255,255,255,0.06); color: #888; cursor: pointer; transition: background 120ms; flex-shrink: 0; }
.em-tpk-close:hover { background: rgba(255,255,255,0.10); color: #f0f0ec; }
.em-tpk-body { flex: 1; overflow-y: auto; padding: 16px 22px 22px; }
.em-tpk-sub { font-size: 10.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #888; margin: 0 0 12px; }
.em-tpk-empty { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #888; padding: 12px; border: 0.8px dashed #2a2a2a; border-radius: 10px; }
.em-tpk-list { display: flex; flex-direction: column; gap: 8px; }
.em-tpk-card { padding: 12px; border-radius: 10px; border: 1px solid #2a2a2a; background: #111111; display: flex; flex-direction: column; gap: 8px; transition: border-color 130ms; }
.em-tpk-card:hover { border-color: #C9A84C; }
.em-tpk-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.em-tpk-name { font-size: 13.5px; font-weight: 600; color: #f0f0ec; }
.em-tpk-badges { display: flex; gap: 5px; flex-shrink: 0; }
.em-tpk-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 5px; background: rgba(255,255,255,0.06); color: #888; }
.em-tpk-body-text { font-size: 13px; color: #f0f0ec; line-height: 1.5; white-space: pre-wrap; margin: 0; }
.em-tpk-import-btn { align-self: flex-end; display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px; border-radius: 8px; background: rgba(255,255,255,0.07); border: 1px solid #2a2a2a; color: #f0f0ec; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 130ms, border-color 130ms; }
.em-tpk-import-btn:hover:not(:disabled) { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.4); color: #C9A84C; }
.em-tpk-import-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.em-tpk-fade-enter-active, .em-tpk-fade-leave-active { transition: opacity 180ms; }
.em-tpk-fade-enter-from, .em-tpk-fade-leave-to { opacity: 0; }
</style>
