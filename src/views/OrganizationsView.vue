<template>
  <div class="ov-root">

    <!-- ── Topbar ── -->
    <nav class="ov-topbar">
      <div class="ov-topbar-inner">
        <span class="ov-page-title">Organizations</span>
        <button class="ov-refresh-btn" :disabled="loading" @click="fetchAll">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'ov-spin': loading }">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>
    </nav>

    <!-- ── Page shell ── -->
    <div class="ov-page">

      <!-- Stats -->
      <div class="ov-stats">
        <button class="ov-stat" :class="{ 'ov-stat--sel': statusFilter === 'all' }" @click="statusFilter = 'all'">
          <span class="ov-stat-num">{{ orgs.length }}</span>
          <span class="ov-stat-label">Total Orgs</span>
        </button>
        <button class="ov-stat ov-stat--pending" :class="{ 'ov-stat--sel': statusFilter === 'review' }" @click="statusFilter = 'review'">
          <span class="ov-stat-num ov-stat-num--orange">{{ reviewCount }}</span>
          <span class="ov-stat-label">Awaiting Review</span>
          <span v-if="reviewCount" class="ov-stat-sub">{{ pendingCount }} branding · {{ senderPending }} sender</span>
        </button>
        <button class="ov-stat" :class="{ 'ov-stat--sel': statusFilter === 'pending' }" @click="statusFilter = 'pending'">
          <span class="ov-stat-num ov-stat-num--green">{{ approvedCount }}</span>
          <span class="ov-stat-label">Branding Approved</span>
        </button>
        <button class="ov-stat" :class="{ 'ov-stat--sel': statusFilter === 'sender' }" @click="statusFilter = 'sender'">
          <span class="ov-stat-num ov-stat-num--blue">{{ senderLiveCount }}</span>
          <span class="ov-stat-label">Sender IDs Live</span>
        </button>
        <button class="ov-stat" :class="{ 'ov-stat--sel': statusFilter === 'archived' }" @click="statusFilter = 'archived'">
          <span class="ov-stat-num ov-stat-num--dim">{{ archivedCount }}</span>
          <span class="ov-stat-label">Archived</span>
        </button>
      </div>

      <!-- Filter bar -->
      <div class="ov-filterbar">
        <div class="ov-search-wrap">
          <svg class="ov-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" class="ov-search-input" placeholder="Search organization, owner or ID…" />
          <button v-if="searchQuery" class="ov-search-clear" @click="searchQuery = ''">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="ov-fb-divider" />
        <div class="ov-status-chips">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            class="ov-status-chip"
            :class="{ 'ov-status-chip--active': statusFilter === f.value }"
            @click="statusFilter = f.value"
          >{{ f.label }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="ov-skeleton-list">
        <div class="ov-skeleton" v-for="i in 5" :key="i" />
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="ov-empty">
        <span class="ov-empty-glyph">✦</span>
        <p class="ov-empty-title">{{ searchQuery ? `No results for "${searchQuery}"` : emptyTitleForFilter }}</p>
        <p class="ov-empty-sub">{{ searchQuery ? 'Try a different search term.' : 'Organizations are created from the client app or the Users screen.' }}</p>
      </div>

      <!-- Table -->
      <div v-else class="ov-table-wrap">
        <table class="ov-table">
          <thead>
            <tr>
              <th class="ov-th ov-th--chevron"></th>
              <th class="ov-th">Organization</th>
              <th class="ov-th">Branding</th>
              <th class="ov-th">Sender ID</th>
              <th class="ov-th ov-th--num">Members</th>
              <th class="ov-th ov-th--num">Events</th>
              <th class="ov-th">Balance</th>
              <th class="ov-th">Branding Status</th>
              <th class="ov-th ov-th--end"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="org in paginated" :key="org.id">
              <tr class="ov-row" :class="{ 'ov-row--archived': org.archived, 'ov-row--open': expandedId === org.id }">

                <!-- Expand chevron -->
                <td class="ov-td ov-td--chevron">
                  <button class="ov-chevron-btn" :title="expandedId === org.id ? 'Hide members' : 'Show members'" @click="toggleExpand(org)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"
                      :class="['ov-chevron', { 'ov-chevron--open': expandedId === org.id }]">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </td>

                <!-- Org identity -->
                <td class="ov-td">
                  <div class="ov-cell-org">
                    <div class="ov-org-avatar" :style="orgAvatarStyle(org)">
                      <img v-if="org.logoUrl" :src="org.logoUrl" class="ov-org-avatar-img" @error="e => e.target.style.display = 'none'" />
                      <span class="ov-org-avatar-letter">{{ orgInitial(org) }}</span>
                    </div>
                    <div class="ov-org-meta">
                      <span class="ov-org-name">
                        {{ org.name || 'Untitled Organization' }}
                        <span v-if="org.archived" class="ov-arch-badge">Archived</span>
                      </span>
                      <span class="ov-org-owner">{{ ownerLabel(org) }}</span>
                    </div>
                  </div>
                </td>

                <!-- Branding swatches -->
                <td class="ov-td">
                  <button class="ov-swatch-btn" title="Preview branding" @click="openPreview(org)">
                    <span class="ov-swatch" :style="{ background: org.accentColor || DEFAULT_ORG_ACCENT }" />
                    <span class="ov-swatch" :style="{ background: org.secondaryColor || DEFAULT_ORG_SECONDARY }" />
                    <template v-for="key in SURFACE_FIELDS" :key="key">
                      <span v-if="org[key]" class="ov-swatch ov-swatch--surface" :style="{ background: org[key] }" />
                    </template>
                    <span class="ov-swatch-meta">{{ brandingSummary(org) }}</span>
                  </button>
                </td>

                <!-- Sender ID -->
                <td class="ov-td">
                  <button
                    class="ov-sid-pill"
                    :class="[
                      isSenderPending(org) ? 'ov-sid-pill--pending'
                        : senderLive(org) ? 'ov-sid-pill--live'
                        : 'ov-sid-pill--default',
                    ]"
                    :title="isSenderPending(org) ? 'Review this organization\'s sender ID requests' : 'Manage sender IDs'"
                    @click="openReview(org)"
                  >
                    <span class="ov-dot" />
                    {{ senderPillLabel(org) }}
                    <span v-if="approvedOf(org).length > 1" class="ov-sid-pill-more">+{{ approvedOf(org).length - 1 }}</span>
                    <span v-if="isSenderPending(org)" class="ov-sid-pill-tag">{{ pendingOf(org).length }} to review</span>
                  </button>
                </td>

                <td class="ov-td ov-td--num">{{ memberIdsOf(org).length }}</td>
                <td class="ov-td ov-td--num ov-td--muted">{{ eventCounts[org.id] ?? '—' }}</td>
                <td class="ov-td ov-td--balance">{{ formatBalance(org.balance) }}</td>

                <!-- Approval toggle -->
                <td class="ov-td">
                  <button
                    class="ov-approve-pill"
                    :class="{
                      'ov-approve-pill--on': org.brandingApproved === true,
                      'ov-approve-pill--busy': savingOrgId === org.id,
                    }"
                    :disabled="savingOrgId === org.id"
                    :title="org.brandingApproved === true ? 'Click to revoke custom branding' : 'Click to approve custom branding'"
                    @click="toggleApproval(org)"
                  >
                    <span class="ov-dot" />
                    {{ savingOrgId === org.id ? 'Saving…' : (org.brandingApproved === true ? 'Approved' : 'Not approved') }}
                  </button>
                </td>

                <!-- Row actions -->
                <td class="ov-td ov-td--actions">
                  <button
                    class="ov-icon-btn"
                    :class="{ 'ov-icon-btn--menu-open': menuOrg?.id === org.id }"
                    title="Actions"
                    @click.stop="openMenu(org, $event)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </button>
                </td>
              </tr>

              <!-- Expanded: members + owner -->
              <tr v-if="expandedId === org.id" class="ov-subrow">
                <td class="ov-subrow-td" colspan="9">
                  <!-- Package segments — the org side of plan entitlement -->
                  <div class="ov-members ov-seg-block">
                    <div class="ov-members-hd">
                      <span class="ov-members-title">Package segments</span>
                      <span class="ov-members-hint">
                        Which packages this org can choose from — matched against each package's audience
                      </span>
                    </div>
                    <div class="ov-chip-row">
                      <span v-for="s in (org.planSegments ?? [])" :key="s" class="ov-seg-chip ov-seg-chip--on">
                        {{ s }}
                        <button class="ov-seg-x" :disabled="segSavingOrgId === org.id" @click="removeOrgSegment(org, s)">×</button>
                      </span>
                      <span v-if="!(org.planSegments ?? []).length" class="ov-seg-empty">
                        None — this org sees public packages only
                      </span>
                    </div>
                    <div class="ov-chip-row">
                      <button
                        v-for="s in suggestibleFor(org)"
                        :key="s"
                        class="ov-seg-chip ov-seg-chip--add"
                        :disabled="segSavingOrgId === org.id"
                        @click="addOrgSegment(org, s)"
                      >+ {{ s }}</button>
                      <span v-if="segSavingOrgId === org.id" class="ov-seg-empty">Saving…</span>
                    </div>
                    <div class="ov-seg-input-row">
                      <input
                        v-model="segDrafts[org.id]"
                        class="ov-sid-input ov-seg-input"
                        type="text"
                        placeholder="New segment, e.g. agent"
                        :disabled="segSavingOrgId === org.id"
                        @keydown.enter="addOrgSegment(org, segDrafts[org.id])"
                      />
                      <button
                        class="ov-sid-mini ov-sid-mini--ok"
                        :disabled="segSavingOrgId === org.id || !(segDrafts[org.id] || '').trim()"
                        @click="addOrgSegment(org, segDrafts[org.id])"
                      >Add</button>
                    </div>
                    <p v-if="(org.planSegments ?? []).length" class="ov-seg-note">
                      Can choose: {{ plansForOrgLabel(org) }}
                    </p>
                  </div>

                  <div class="ov-members">
                    <div class="ov-members-hd">
                      <span class="ov-members-title">Members</span>
                      <span class="ov-members-hint">Read only — permissions are managed by the owner in the client app</span>
                    </div>
                    <div v-if="memberIdsOf(org).length === 0" class="ov-members-empty">
                      No members on this organization — it has no owner and no memberIds.
                    </div>
                    <div v-else class="ov-member-list">
                      <div v-for="uid in memberIdsOf(org)" :key="uid" class="ov-member">
                        <div class="ov-member-avatar" :style="userAvatarStyle(uid)">
                          <img v-if="usersById[uid]?.profileImage" :src="usersById[uid].profileImage" class="ov-member-avatar-img" @error="e => e.target.style.display = 'none'" />
                          <span class="ov-member-avatar-letters">{{ userInitials(uid) }}</span>
                        </div>
                        <div class="ov-member-meta">
                          <span class="ov-member-name">{{ userName(uid) }}</span>
                          <span class="ov-member-email">{{ usersById[uid]?.email || uid }}</span>
                        </div>
                        <span v-if="org.ownerId === uid" class="ov-member-badge ov-member-badge--owner">Owner</span>
                        <span
                          v-else
                          class="ov-member-badge"
                          :class="memberCan(org, uid, 'canCreate') ? 'ov-member-badge--can' : 'ov-member-badge--cannot'"
                        >{{ memberCan(org, uid, 'canCreate') ? 'Can create events' : 'View only' }}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && totalPages > 1" class="ov-pagination">
        <span class="ov-pagination-info">
          Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filtered.length) }} of {{ filtered.length }}
        </span>
        <div class="ov-pagination-controls">
          <button class="ov-page-btn ov-page-btn--nav" :disabled="currentPage === 1" @click="currentPage--">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '…'" class="ov-page-ellipsis">…</span>
            <button v-else class="ov-page-btn" :class="{ 'ov-page-btn--active': p === currentPage }" @click="currentPage = p">{{ p }}</button>
          </template>
          <button class="ov-page-btn ov-page-btn--nav" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <p v-if="writeError" class="ov-page-error">{{ writeError }}</p>

    </div>

    <!-- ── Action dropdown ── -->
    <Teleport to="body">
      <div v-if="menuOrg" class="ov-action-backdrop" @click="closeMenu" />
      <Transition name="ov-menu">
        <div
          v-if="menuOrg"
          class="ov-action-menu"
          :style="{ top: menuPos.top + 'px', right: menuPos.right + 'px' }"
          @click.stop
        >
          <button class="ov-action-item ov-action-item--preview" @click="openPreview(menuOrg); closeMenu()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Preview Branding
          </button>
          <button class="ov-action-item ov-action-item--sender" @click="openReview(menuOrg); closeMenu()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M9 17v4"/><path d="M15 17v4"/><path d="M9 21h6"/>
            </svg>
            {{ isSenderPending(menuOrg) ? 'Review Sender ID' : 'Manage Sender ID' }}
          </button>
          <button class="ov-action-item" @click="copyId(menuOrg); closeMenu()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Org ID
          </button>
          <div class="ov-action-sep" />
          <button
            v-if="!menuOrg.archived"
            class="ov-action-item ov-action-item--arch"
            @click="archivingOrg = menuOrg; closeMenu()"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><line x1="10" y1="13" x2="14" y2="13"/>
            </svg>
            Archive Organization
          </button>
          <button
            v-else
            class="ov-action-item ov-action-item--unarch"
            @click="doUnarchive(menuOrg); closeMenu()"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><polyline points="9 15 12 12 15 15"/>
            </svg>
            Unarchive Organization
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Archive confirm ── -->
    <Teleport to="body">
      <Transition name="ov-fade">
        <div v-if="archivingOrg" class="ov-backdrop" @click.self="archivingOrg = null">
          <div class="ov-confirm-box">
            <div class="ov-warn-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ov-warn-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="ov-confirm-title">Archive this organization?</p>
            <p class="ov-confirm-body">
              <strong>{{ archivingOrg.name || 'This organization' }}</strong> will be hidden from new event creation.
              Members keep access to view it, and its balance, events and data are untouched. You can unarchive at any time.
            </p>
            <div class="ov-confirm-row">
              <button class="ov-cancel-btn" :disabled="archiving" @click="archivingOrg = null">Cancel</button>
              <button class="ov-del-btn" :disabled="archiving" @click="doArchive">{{ archiving ? 'Archiving…' : 'Archive' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Sender ID review ── -->
    <Teleport to="body">
      <Transition name="ov-fade">
        <div v-if="reviewOrg" class="ov-backdrop" @click.self="reviewOrg = null">
          <div class="ov-preview-box ov-review-box">
            <div class="ov-bm-header">
              <h3 class="ov-bm-title">SMS Sender ID</h3>
              <button class="ov-close-btn" @click="reviewOrg = null">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <p class="ov-preview-note">
              <strong>{{ reviewOrg.name || 'Untitled Organization' }}</strong> · {{ ownerLabel(reviewOrg) }}
            </p>

            <!-- What this org sends as when an event hasn't picked its own -->
            <div class="ov-sid-compare">
              <div class="ov-sid-side">
                <span class="ov-sid-side-lbl">Default sender</span>
                <span class="ov-sid-side-val" :class="{ 'ov-sid-side-val--default': !senderLive(reviewOrg) }">
                  {{ senderLive(reviewOrg) || DEFAULT_SENDER_ID }}
                </span>
                <span class="ov-sid-side-hint">
                  {{ senderLive(reviewOrg)
                    ? `${approvedOf(reviewOrg).length} approved · events may pick any of them`
                    : 'shared default — nothing approved yet' }}
                </span>
              </div>
            </div>

            <!-- Nothing ever requested -->
            <p v-if="!sidsOf(reviewOrg).length" class="ov-sid-empty">
              This organization hasn't requested a sender ID. Owners request one from their Organization
              settings — there's nothing to approve until they do.
            </p>

            <!-- One row per ID -->
            <div v-else class="ov-sid-rows">
              <div
                v-for="sid in sortedSids(reviewOrg)"
                :key="sid.id"
                class="ov-sid-row"
                :class="{ 'ov-sid-row--open': rowMode(sid), 'ov-sid-row--muted': sid.status === 'revoked' || sid.status === 'rejected' }"
              >
                <div class="ov-sid-row-hd">
                  <span class="ov-sid-row-val">{{ sid.value }}</span>
                  <span class="ov-sid-chip" :class="`ov-sid-chip--${sid.status}`">{{ SID_STATUS_LABELS[sid.status] ?? sid.status }}</span>
                  <span v-if="sid.value === senderLive(reviewOrg)" class="ov-sid-chip ov-sid-chip--default">Default</span>
                  <span v-if="sid.requestedAt" class="ov-sid-row-date">{{ formatDate(sid.requestedAt) }}</span>

                  <span class="ov-sid-row-actions">
                    <template v-if="!rowMode(sid)">
                      <button v-if="sid.status === 'pending'" class="ov-sid-mini ov-sid-mini--ok" :disabled="reviewing" @click="startRowAction(sid, 'approve')">Approve…</button>
                      <button v-if="sid.status === 'pending'" class="ov-sid-mini ov-sid-mini--no" :disabled="reviewing" @click="startRowAction(sid, 'reject')">Reject…</button>
                      <button v-if="sid.status === 'approved'" class="ov-sid-mini ov-sid-mini--no" :disabled="reviewing" @click="startRowAction(sid, 'revoke')">Revoke…</button>
                    </template>
                  </span>
                </div>

                <p v-if="sid.rejectionReason && !rowMode(sid)" class="ov-sid-row-note">
                  Note to owner: “{{ sid.rejectionReason }}”
                </p>

                <!-- Inline decision, scoped to this row -->
                <div v-if="rowMode(sid)" class="ov-sid-row-form">
                  <template v-if="rowMode(sid) === 'approve'">
                    <label class="ov-sid-label">Approve as</label>
                    <input v-model="reviewOverride" class="ov-sid-input" type="text" maxlength="11" placeholder="SENDERID" :disabled="reviewing" />
                    <span class="ov-sid-hint">
                      Edit only if the carrier registered a different string than the one requested — that
                      retires <strong>{{ sid.value }}</strong> and adds the new one instead.
                    </span>
                  </template>

                  <template v-else>
                    <label class="ov-sid-label">
                      Reason shown to the owner{{ rowMode(sid) === 'revoke' ? ' (optional)' : '' }}
                    </label>
                    <textarea
                      v-model="reviewReason"
                      class="ov-sid-input ov-sid-textarea"
                      rows="2"
                      :placeholder="rowMode(sid) === 'revoke'
                        ? 'e.g. The carrier registration for this ID lapsed.'
                        : 'e.g. This name is trademarked by another business.'"
                      :disabled="reviewing"
                    />
                    <span v-if="rowMode(sid) === 'revoke'" class="ov-sid-hint">
                      <template v-if="approvedOf(reviewOrg).length > 1">
                        Their other approved IDs keep sending; if this was the default, the next one takes over.
                      </template>
                      <template v-else>
                        This is their only approved ID — they drop back to <strong>{{ DEFAULT_SENDER_ID }}</strong>.
                      </template>
                    </span>
                    <span v-else class="ov-sid-hint">
                      Only this request is refused. Anything already approved keeps sending.
                    </span>
                  </template>

                  <div class="ov-sid-row-btns">
                    <button class="ov-cancel-btn" :disabled="reviewing" @click="closeRowAction">Cancel</button>
                    <button
                      v-if="rowMode(sid) === 'approve'"
                      class="ov-approve-btn"
                      :disabled="reviewing || !reviewOverride.trim()"
                      @click="submitReview(sid, 'approve')"
                    >{{ reviewing ? 'Saving…' : 'Approve' }}</button>
                    <button
                      v-else
                      class="ov-reject-btn"
                      :disabled="reviewing || (rowMode(sid) === 'reject' && !reviewReason.trim())"
                      @click="submitReview(sid, rowMode(sid))"
                    >{{ reviewing ? 'Saving…' : (rowMode(sid) === 'revoke' ? 'Revoke' : 'Reject') }}</button>
                  </div>
                </div>
              </div>
            </div>

            <p v-if="reviewError" class="ov-sid-error">{{ reviewError }}</p>

            <div class="ov-preview-actions">
              <button class="ov-cancel-btn" @click="reviewOrg = null">Close</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Branding preview ── -->
    <Teleport to="body">
      <Transition name="ov-fade">
        <div v-if="previewOrg" class="ov-backdrop" @click.self="previewOrg = null">
          <div class="ov-preview-box">
            <div class="ov-bm-header">
              <h3 class="ov-bm-title">{{ previewOrg.name || 'Untitled Organization' }}</h3>
              <button class="ov-close-btn" @click="previewOrg = null">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <p class="ov-preview-note">
              This is what the client app shell looks like for <strong>{{ ownerLabel(previewOrg) }}</strong> once branding is approved.
              Unapproved, every org falls back to the default Haflaway shell.
            </p>

            <!-- Mock app shell -->
            <div class="ov-mock" :style="{ background: previewOrg.pageBackgroundColor || '#0a0a0b' }">
              <div class="ov-mock-topbar" :style="{ background: previewOrg.topbarColor || '#111111', color: contrastColor(previewOrg.topbarColor || '#111111') }">
                <span class="ov-mock-logo">
                  <img v-if="previewOrg.logoUrl" :src="previewOrg.logoUrl" class="ov-mock-logo-img" />
                  <span v-else class="ov-mock-logo-fallback" :style="{ background: previewOrg.accentColor || DEFAULT_ORG_ACCENT }" />
                </span>
                <span class="ov-mock-name">{{ previewOrg.name || 'Organization' }}</span>
                <span class="ov-mock-cta" :style="{ background: previewOrg.accentColor || DEFAULT_ORG_ACCENT, color: contrastColor(previewOrg.accentColor || DEFAULT_ORG_ACCENT) }">+ Create event</span>
              </div>
              <div class="ov-mock-body">
                <div class="ov-mock-sidebar" :style="{ background: previewOrg.sidebarColor || '#111111', color: contrastColor(previewOrg.sidebarColor || '#111111') }">
                  <span class="ov-mock-navitem">Events</span>
                  <span class="ov-mock-navitem">Guests</span>
                  <span class="ov-mock-navitem">Settings</span>
                </div>
                <div class="ov-mock-main">
                  <span class="ov-mock-line ov-mock-line--wide" />
                  <span class="ov-mock-line" />
                  <div class="ov-mock-chips">
                    <span class="ov-mock-chip" :style="{ background: previewOrg.accentColor || DEFAULT_ORG_ACCENT, color: contrastColor(previewOrg.accentColor || DEFAULT_ORG_ACCENT) }">Primary</span>
                    <span class="ov-mock-chip" :style="{ background: previewOrg.secondaryColor || DEFAULT_ORG_SECONDARY, color: contrastColor(previewOrg.secondaryColor || DEFAULT_ORG_SECONDARY) }">Secondary</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Raw values -->
            <div class="ov-preview-grid">
              <div class="ov-pv-row">
                <span class="ov-pv-key">Favicon</span>
                <span class="ov-pv-val">
                  <img v-if="previewOrg.faviconUrl" :src="previewOrg.faviconUrl" class="ov-pv-favicon" />
                  <span v-else class="ov-pv-unset">Not set — default used</span>
                </span>
              </div>
              <div class="ov-pv-row" v-for="row in colorRows(previewOrg)" :key="row.key">
                <span class="ov-pv-key">{{ row.label }}</span>
                <span class="ov-pv-val">
                  <template v-if="row.value">
                    <span class="ov-swatch" :style="{ background: row.value }" />
                    <code class="ov-pv-hex">{{ row.value }}</code>
                  </template>
                  <span v-else class="ov-pv-unset">Not set — theme default kept</span>
                </span>
              </div>
              <div class="ov-pv-row">
                <span class="ov-pv-key">Org ID</span>
                <span class="ov-pv-val"><code class="ov-pv-hex">{{ previewOrg.id }}</code></span>
              </div>
              <div v-if="previewOrg.brandingApprovedAt" class="ov-pv-row">
                <span class="ov-pv-key">Approved</span>
                <span class="ov-pv-val ov-pv-muted">{{ formatDate(previewOrg.brandingApprovedAt) }} by {{ userName(previewOrg.brandingApprovedBy) }}</span>
              </div>
            </div>

            <div class="ov-preview-actions">
              <button class="ov-cancel-btn" @click="previewOrg = null">Close</button>
              <button
                class="ov-approve-btn"
                :class="{ 'ov-approve-btn--revoke': previewOrg.brandingApproved === true }"
                :disabled="savingOrgId === previewOrg.id"
                @click="toggleApproval(previewOrg)"
              >
                {{ savingOrgId === previewOrg.id
                  ? 'Saving…'
                  : (previewOrg.brandingApproved === true ? 'Revoke branding' : 'Approve branding') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { auth, db, firebaseApp } from '../firebase'
import {
  collection, getDocs, getDoc, getCountFromServer, updateDoc, doc,
  query, where, serverTimestamp,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { canOrgSeePlan, normalizeSegment, knownSegments } from '../utils/planVisibility.js'

const functions = getFunctions(firebaseApp)

// haflaway_admin_spa doesn't share a module tree with haflaway_spa, so these
// mirror useOrg.js's defaults and its contrastColor() rather than importing
// across projects — same reasoning as UsersView.vue.
const DEFAULT_ORG_ACCENT = '#C9A84C'
const DEFAULT_ORG_SECONDARY = '#3B82F6'

// The optional surface overrides an org can set; unset means "keep the theme's
// own look", which is why the preview falls back instead of showing them blank.
const SURFACE_FIELDS = ['sidebarColor', 'topbarColor', 'pageBackgroundColor']

function contrastColor(hex) {
  const clean = (hex || '').replace('#', '')
  if (clean.length !== 6) return '#070707'
  const [r, g, b] = [0, 2, 4].map(i => parseInt(clean.slice(i, i + 2), 16) / 255)
  const lin = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return luminance > 0.45 ? '#070707' : '#f5f5f5'
}

const PAGE_SIZE = 10

// ── State ──────────────────────────────────────────────────────────────────
const orgs        = ref([])
const usersById   = ref({})
const eventCounts = ref({})
const loading     = ref(true)
const writeError  = ref('')

const searchQuery  = ref('')
const statusFilter = ref('all')
const currentPage  = ref(1)
const expandedId   = ref(null)

const savingOrgId  = ref(null)
const previewOrg   = ref(null)
const archivingOrg = ref(null)
const archiving    = ref(false)

const reviewOrg      = ref(null)
const reviewOverride = ref('')
const reviewReason   = ref('')
const reviewing      = ref(false)
const reviewError    = ref('')
const rowAction      = ref(null)   // { id, mode: 'approve' | 'reject' | 'revoke' }

const menuOrg = ref(null)
const menuPos = ref({ top: 0, right: 0 })

const statusFilters = [
  { label: 'All',              value: 'all'      },
  { label: 'Awaiting review',  value: 'review'   },
  { label: 'Branding pending', value: 'pending'  },
  { label: 'Sender pending',   value: 'sender'   },
  { label: 'Archived',         value: 'archived' },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function formatBalance(n) {
  if (n == null) return '—'
  return 'TZS ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = val?.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

// Older orgs predate memberIds, so fall back to the owner alone — same shape
// UsersView.vue uses when it builds its user -> orgs map.
function memberIdsOf(org) {
  return org?.memberIds?.length ? org.memberIds : [org?.ownerId].filter(Boolean)
}

// Owner is implicitly all-true and never appears in memberPerms (see useOrg.js).
function memberCan(org, uid, key) {
  if (uid && org?.ownerId === uid) return true
  return !!(org?.memberPerms?.[uid]?.[key])
}

function userName(uid) {
  const u = usersById.value[uid]
  if (!u) return uid ? 'Unknown user' : '—'
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'Unnamed User'
}

function userInitials(uid) {
  const u = usersById.value[uid]
  return [u?.firstName, u?.lastName].filter(Boolean).map(s => s.charAt(0).toUpperCase()).join('')
    || (u?.email?.charAt(0)?.toUpperCase() ?? '?')
}

const PALETTE = ['#C9A84C', '#30D158', '#0A84FF', '#FF9F0A', '#BF5AF2', '#FF6961', '#64D2FF']
function userAvatarStyle(uid) {
  const color = PALETTE[(uid || '0').charCodeAt(0) % PALETTE.length]
  return { background: color + '1A', borderColor: color + '55', color }
}

function ownerLabel(org) {
  const owner = usersById.value[org?.ownerId]
  if (!owner) return org?.ownerId ? 'Owner not found' : 'No owner'
  const name = [owner.firstName, owner.lastName].filter(Boolean).join(' ')
  return name || owner.email || 'Unnamed User'
}

function orgInitial(org) {
  return (org?.name || '?').trim().charAt(0).toUpperCase() || '?'
}

function orgAvatarStyle(org) {
  const primary = org.accentColor || DEFAULT_ORG_ACCENT
  const secondary = org.secondaryColor || DEFAULT_ORG_SECONDARY
  return {
    background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    color: contrastColor(primary),
  }
}

// How much the org has actually customized — an org that never touched branding
// is a very different approval decision from one that set six colors and a logo.
function brandingSummary(org) {
  const bits = []
  if (org.logoUrl) bits.push('logo')
  if (org.faviconUrl) bits.push('favicon')
  const surfaces = SURFACE_FIELDS.filter(k => org[k]).length
  if (surfaces) bits.push(`${surfaces} surface${surfaces > 1 ? 's' : ''}`)
  return bits.length ? bits.join(' · ') : 'colors only'
}

function colorRows(org) {
  return [
    { key: 'accentColor',         label: 'Primary',        value: org.accentColor || DEFAULT_ORG_ACCENT },
    { key: 'secondaryColor',      label: 'Secondary',      value: org.secondaryColor || DEFAULT_ORG_SECONDARY },
    { key: 'sidebarColor',        label: 'Sidebar',        value: org.sidebarColor || '' },
    { key: 'topbarColor',         label: 'Topbar',         value: org.topbarColor || '' },
    { key: 'pageBackgroundColor', label: 'Page background', value: org.pageBackgroundColor || '' },
  ]
}

// ── SMS sender IDs ─────────────────────────────────────────────────────────
// An org owns a set of these under organizations/{id}/senderIds. Mirrors
// functions/utils/senderId.js throughout so this screen can never show a
// sender the dispatch path wouldn't actually use.
const DEFAULT_SENDER_ID = 'HAFLAWAY'
const senderIdsByOrg = ref({})

const sidsOf     = (org) => senderIdsByOrg.value[org?.id] ?? []
const approvedOf = (org) => sidsOf(org).filter(s => s.status === 'approved')
const pendingOf  = (org) => sidsOf(org).filter(s => s.status === 'pending')

const ms = (v) => {
  if (!v) return Number.MAX_SAFE_INTEGER
  if (typeof v?.toMillis === 'function') return v.toMillis()
  const p = Date.parse(v)
  return Number.isNaN(p) ? Number.MAX_SAFE_INTEGER : p
}
// Same tiebreak as sortForDefault() in functions/utils/senderId.js.
const sortForDefault = (list) => [...list].sort((a, b) =>
  (ms(a.approvedAt) - ms(b.approvedAt)) || String(a.value).localeCompare(String(b.value))
)

// What this org sends as when an event hasn't pinned its own — the flagged
// default, else the deterministic fallback. null means still on HAFLAWAY.
function senderLive(org) {
  const approved = approvedOf(org)
  if (!approved.length) return null
  return (approved.find(s => s.isDefault === true) ?? sortForDefault(approved)[0]).value
}

const isSenderPending = (org) => pendingOf(org).length > 0

// Names what is actually on the wire today. What was *requested* belongs in the
// review modal — putting it in this cell would read as though the org were
// already sending under an unapproved ID.
function senderPillLabel(org) {
  return senderLive(org) || DEFAULT_SENDER_ID
}

const SID_STATUS_LABELS = {
  pending: 'Pending', approved: 'Approved', rejected: 'Not approved', revoked: 'Revoked',
}
// Usable rows first, history last.
const SID_ORDER = { pending: 0, approved: 1, rejected: 2, revoked: 3 }
function sortedSids(org) {
  return [...sidsOf(org)].sort((a, b) =>
    (SID_ORDER[a.status] ?? 9) - (SID_ORDER[b.status] ?? 9) ||
    String(a.value).localeCompare(String(b.value))
  )
}

// ── Package segments ───────────────────────────────────────────────────────
// The org half of plan entitlement: an org carries commercial segments, each
// package declares the segments it serves, and the intersection decides what
// appears in that org's plan picker. Tagging an org here grants every matching
// package at once — including ones created later — which is the property that
// makes this scale better than listing org IDs on each package.
const plans = ref([])
const segDrafts = ref({})
const segSavingOrgId = ref(null)

// Vocabulary already in use anywhere, minus what this org has — the chips only
// offer something that would actually change the row.
function suggestibleFor(org) {
  const used = new Set((org.planSegments ?? []).map(normalizeSegment))
  return knownSegments(orgs.value, plans.value).filter(s => !used.has(s))
}

// Runs the same predicate the client picker uses, so this line can't disagree
// with what the org actually sees.
function plansForOrgLabel(org) {
  const visible = plans.value.filter(p => canOrgSeePlan(org, p))
  return visible.length ? visible.map(p => p.name || p.id).join(', ') : 'nothing'
}

async function writeSegments(org, next) {
  if (segSavingOrgId.value) return
  segSavingOrgId.value = org.id
  writeError.value = ''
  try {
    await updateDoc(doc(db, 'organizations', org.id), { planSegments: next })
    org.planSegments = next
  } catch (e) {
    console.error('writeSegments error:', e)
    writeError.value = `Could not update segments for ${org.name || org.id}. Try again.`
  } finally {
    segSavingOrgId.value = null
  }
}

function addOrgSegment(org, raw) {
  const s = normalizeSegment(raw)
  segDrafts.value = { ...segDrafts.value, [org.id]: '' }
  if (!s) return
  const current = org.planSegments ?? []
  if (current.includes(s)) return
  writeSegments(org, [...current, s])
}

function removeOrgSegment(org, s) {
  writeSegments(org, (org.planSegments ?? []).filter(x => x !== s))
}

// ── Filtering ──────────────────────────────────────────────────────────────
// `brandingApproved` is absent on every org created before this screen existed
// (useOrg.js's createOrg never wrote it), so anything that isn't explicitly
// true counts as pending rather than as a separate "never requested" state.
const isApproved = o => o.brandingApproved === true

// Anything a staff member still has to act on — either review queue counts.
const needsReview = o => !o.archived && (!isApproved(o) || isSenderPending(o))

const approvedCount   = computed(() => orgs.value.filter(o => isApproved(o) && !o.archived).length)
const pendingCount    = computed(() => orgs.value.filter(o => !isApproved(o) && !o.archived).length)
const senderPending   = computed(() => orgs.value.filter(o => isSenderPending(o) && !o.archived).length)
const senderLiveCount = computed(() => orgs.value.filter(o => senderLive(o) && !o.archived).length)
const reviewCount     = computed(() => orgs.value.filter(needsReview).length)
const archivedCount   = computed(() => orgs.value.filter(o => o.archived).length)

const emptyTitleForFilter = computed(() => ({
  all:      'No organizations yet',
  review:   'Nothing awaiting review',
  pending:  'No branding requests waiting',
  sender:   'No sender ID requests waiting',
  archived: 'No archived organizations',
}[statusFilter.value]))

const filtered = computed(() => {
  let list = orgs.value
  if (statusFilter.value === 'review')   list = list.filter(needsReview)
  if (statusFilter.value === 'pending')  list = list.filter(o => !isApproved(o) && !o.archived)
  if (statusFilter.value === 'sender')   list = list.filter(o => isSenderPending(o) && !o.archived)
  if (statusFilter.value === 'archived') list = list.filter(o => o.archived)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(o =>
      (o.name || '').toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      ownerLabel(o).toLowerCase().includes(q) ||
      (usersById.value[o.ownerId]?.email || '').toLowerCase().includes(q) ||
      sidsOf(o).some(s => String(s.value).toLowerCase().includes(q))
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

const paginated = computed(() => {
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

watch([searchQuery, statusFilter], () => { currentPage.value = 1; expandedId.value = null })

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchAll() {
  loading.value = true
  writeError.value = ''
  try {
    const [orgSnap, userSnap, planSnap] = await Promise.all([
      getDocs(collection(db, 'organizations')),
      getDocs(collection(db, 'users')),
      // Needed to resolve segments into "which packages this org can choose".
      getDocs(collection(db, 'eventPlans')),
    ])

    plans.value = planSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const umap = {}
    for (const d of userSnap.docs) umap[d.id] = { id: d.id, ...d.data() }
    usersById.value = umap

    // Archived last, then alphabetical. Deliberately not sorting by approval
    // status — a row jumping the moment you approve it makes a review pass
    // through the list lose its place.
    orgs.value = orgSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) =>
        (a.archived === b.archived ? 0 : a.archived ? 1 : -1) ||
        (a.name || '').localeCompare(b.name || '')
      )
  } catch (e) {
    console.error('fetchAll error:', e)
    writeError.value = 'Could not load organizations. Check your connection and refresh.'
  } finally {
    loading.value = false
  }
  fetchEventCounts()
  fetchSenderIds()
}

// One subcollection read per org, in parallel, after the table has rendered.
// Kept separate from the org fetch so a slow sender-ID read never delays the
// list itself.
async function fetchSenderIds() {
  const entries = await Promise.all(orgs.value.map(async (o) => {
    try {
      const snap = await getDocs(collection(db, 'organizations', o.id, 'senderIds'))
      return [o.id, snap.docs.map(d => ({ id: d.id, ...d.data() }))]
    } catch {
      return [o.id, []]
    }
  }))
  senderIdsByOrg.value = Object.fromEntries(entries)
}

// Counted server-side per org so the screen never pulls the whole events
// collection just to show a number. Runs after the table has already rendered;
// the column shows "—" until it resolves.
async function fetchEventCounts() {
  const entries = await Promise.all(orgs.value.map(async (o) => {
    try {
      const snap = await getCountFromServer(query(collection(db, 'events'), where('orgId', '==', o.id)))
      return [o.id, snap.data().count]
    } catch {
      return [o.id, null]
    }
  }))
  eventCounts.value = Object.fromEntries(entries.filter(([, v]) => v != null))
}

// ── Actions ────────────────────────────────────────────────────────────────
function toggleExpand(org) {
  expandedId.value = expandedId.value === org.id ? null : org.id
}

function openMenu(org, e) {
  if (menuOrg.value?.id === org.id) { menuOrg.value = null; return }
  const rect = e.currentTarget.getBoundingClientRect()
  menuPos.value = { top: rect.bottom + 6, right: window.innerWidth - rect.right }
  menuOrg.value = org
}
function closeMenu() { menuOrg.value = null }

function openPreview(org) { previewOrg.value = org }

async function copyId(org) {
  try { await navigator.clipboard.writeText(org.id) } catch { /* clipboard blocked — no-op */ }
}

// The one write this screen exists for. Both directions are stamped so there's
// a trail of who flipped it and when — the flag used to be changed by hand in
// the Firestore console, which left no record at all.
async function toggleApproval(org) {
  if (savingOrgId.value) return
  savingOrgId.value = org.id
  writeError.value = ''
  const next = !isApproved(org)
  const uid = auth.currentUser?.uid ?? null
  try {
    await updateDoc(doc(db, 'organizations', org.id), next
      ? { brandingApproved: true,  brandingApprovedAt: serverTimestamp(), brandingApprovedBy: uid }
      : { brandingApproved: false, brandingRevokedAt:  serverTimestamp(), brandingRevokedBy:  uid })
    org.brandingApproved = next
  } catch (e) {
    console.error('toggleApproval error:', e)
    writeError.value = `Could not update branding approval for ${org.name || org.id}. Try again.`
  } finally {
    savingOrgId.value = null
  }
}

// ── Sender ID review ───────────────────────────────────────────────────────
// Unlike branding approval, this never writes Firestore directly:
// reviewOrgSenderId re-checks the caller's clearance level server-side, which
// is the only real gate while firestore.rules are still wide open.
function openReview(org) {
  reviewOrg.value = org
  reviewError.value = ''
  closeRowAction()
}

// Which row in the modal is mid-decision, and which decision. Scoped per row so
// a reason typed against one ID can't be submitted against another.
function startRowAction(sid, mode) {
  rowAction.value = { id: sid.id, mode }
  reviewOverride.value = sid.value
  reviewReason.value = ''
  reviewError.value = ''
}
function closeRowAction() {
  rowAction.value = null
  reviewOverride.value = ''
  reviewReason.value = ''
}
const rowMode = (sid) => (rowAction.value?.id === sid.id ? rowAction.value.mode : null)

async function submitReview(sid, decision) {
  if (!reviewOrg.value || reviewing.value) return
  reviewing.value = true
  reviewError.value = ''
  try {
    await httpsCallable(functions, 'reviewOrgSenderId')({
      orgId: reviewOrg.value.id,
      senderId: sid.id,
      decision,
      override: decision === 'approve' ? reviewOverride.value : undefined,
      reason: decision === 'approve' ? undefined : reviewReason.value,
    })

    // Re-read the org's whole set rather than patching locally: approving with
    // an override retires one document and writes another, and both approve and
    // revoke can move the default onto a different row.
    const snap = await getDocs(collection(db, 'organizations', reviewOrg.value.id, 'senderIds'))
    senderIdsByOrg.value = {
      ...senderIdsByOrg.value,
      [reviewOrg.value.id]: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    }
    closeRowAction()
  } catch (e) {
    console.error('submitReview error:', e)
    reviewError.value = e?.message || 'Could not save that decision. Try again.'
  } finally {
    reviewing.value = false
  }
}

async function doArchive() {
  if (!archivingOrg.value || archiving.value) return
  archiving.value = true
  writeError.value = ''
  try {
    await updateDoc(doc(db, 'organizations', archivingOrg.value.id), {
      archived: true, archivedAt: serverTimestamp(),
    })
    archivingOrg.value.archived = true
    archivingOrg.value = null
  } catch (e) {
    console.error('archive error:', e)
    writeError.value = 'Could not archive that organization. Try again.'
  } finally {
    archiving.value = false
  }
}

async function doUnarchive(org) {
  writeError.value = ''
  try {
    await updateDoc(doc(db, 'organizations', org.id), { archived: false, archivedAt: null })
    org.archived = false
  } catch (e) {
    console.error('unarchive error:', e)
    writeError.value = 'Could not unarchive that organization. Try again.'
  }
}

onMounted(fetchAll)
</script>

<style scoped>
/* ── Tokens ── */
.ov-root {
  --ink: #f0f0ec;
  --ink-soft: #d8d4cd;
  --ink-muted: #888;
  --ink-dim: #555;
  --line: #242424;
  --line-strong: #2a2a2a;
  --paper-soft: #141414;
  --gold: #C9A84C;
  --gold-bg: rgba(201,168,76,0.08);
  --gold-border: rgba(201,168,76,0.25);
  --gold-text: #C9A84C;
  --emerald: #30D158;
  --emerald-soft: rgba(48,209,88,0.12);
  min-height: 100vh;
  background: #0a0a0b;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--ink);
}

/* ── Topbar ── */
.ov-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.ov-topbar-inner {
  max-width: 1200px; margin: 0 auto; padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.ov-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px;
}
.ov-refresh-btn {
  display: flex; align-items: center; gap: 7px;
  background: transparent; border: 1px solid var(--line-strong);
  color: var(--ink-muted); padding: 7px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit;
  transition: color 130ms, border-color 130ms;
}
.ov-refresh-btn:hover:not(:disabled) { color: var(--ink); border-color: rgba(255,255,255,0.16); }
.ov-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ov-spin { animation: ov-rotate 0.9s linear infinite; }
@keyframes ov-rotate { to { transform: rotate(360deg); } }

/* ── Page shell ── */
.ov-page {
  max-width: 1200px; margin: 0 auto;
  padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 20px;
}
.ov-page-error {
  margin: 0; font-size: 13px; color: #FF453A;
  background: rgba(255,69,58,.08); border: 1px solid rgba(255,69,58,.2);
  border-radius: 10px; padding: 10px 14px;
}

/* ── Stats ── */
.ov-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.ov-stat {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 14px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3); text-align: left;
  cursor: pointer; font-family: inherit;
  transition: border-color 150ms, background 150ms;
}
.ov-stat:hover { border-color: rgba(255,255,255,0.14); }
.ov-stat--sel { border-color: rgba(240,240,236,0.28); background: #191919; }
.ov-stat--pending { border-color: rgba(255,159,10,.2); background: rgba(255,159,10,.04); }
.ov-stat--pending:hover { border-color: rgba(255,159,10,.4); background: rgba(255,159,10,.07); }
.ov-stat--pending.ov-stat--sel { border-color: rgba(255,159,10,.65); background: rgba(255,159,10,.09); }
.ov-stat-num { font-size: 32px; font-weight: 700; color: var(--ink); letter-spacing: -0.5px; line-height: 1; }
.ov-stat-num--green  { color: var(--emerald); }
.ov-stat-num--orange { color: #FF9F0A; }
.ov-stat-num--blue   { color: #64D2FF; }
.ov-stat-num--dim    { color: var(--ink-dim); }
.ov-stat-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.6px;
  text-transform: uppercase; color: var(--ink-dim);
}
.ov-stat-sub { font-size: 11px; color: var(--ink-muted); }

/* ── Filter bar ── */
.ov-filterbar {
  display: flex; align-items: center; gap: 4px;
  background: #111; border: 1px solid var(--line-strong); border-radius: 14px;
  padding: 8px 8px 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); flex-wrap: wrap;
}
.ov-search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 160px; }
.ov-search-icon { position: absolute; left: 11px; color: var(--ink-dim); pointer-events: none; flex-shrink: 0; }
.ov-search-input {
  width: 100%; padding: 8px 30px 8px 34px; border: none; background: transparent;
  font-size: 13.5px; color: var(--ink); outline: none; font-family: inherit;
}
.ov-search-input::placeholder { color: var(--ink-dim); }
.ov-search-clear {
  position: absolute; right: 6px; background: none; border: none;
  cursor: pointer; color: var(--ink-dim); display: flex; align-items: center; padding: 2px;
}
.ov-search-clear:hover { color: var(--ink-muted); }
.ov-fb-divider { width: 1px; height: 26px; background: var(--line-strong); flex-shrink: 0; margin: 0 4px; }
.ov-status-chips { display: flex; align-items: center; gap: 4px; }
.ov-status-chip {
  padding: 7px 14px; border-radius: 8px; border: none; background: transparent;
  font-size: 13px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms;
}
.ov-status-chip:hover { background: var(--paper-soft); color: var(--ink); }
.ov-status-chip--active { background: rgba(240,240,236,0.09); color: var(--ink); font-weight: 600; }

/* ── Skeletons ── */
.ov-skeleton-list { display: flex; flex-direction: column; gap: 1px; }
.ov-skeleton {
  height: 58px;
  background: linear-gradient(90deg, #141414 25%, #1a1a1a 50%, #141414 75%);
  background-size: 200% 100%;
  animation: ov-shimmer 1.4s infinite;
}
.ov-skeleton:first-child { border-radius: 14px 14px 0 0; }
.ov-skeleton:last-child  { border-radius: 0 0 14px 14px; }
@keyframes ov-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty ── */
.ov-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 20px; border: 1px dashed var(--line-strong); border-radius: 20px;
}
.ov-empty-glyph { font-size: 28px; color: var(--gold); opacity: 0.6; }
.ov-empty-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: var(--ink); margin: 0; }
.ov-empty-sub   { font-size: 13px; color: var(--ink-muted); margin: 0; }

/* ── Table ── */
.ov-table-wrap {
  background: #141414; border: 1px solid #2a2a2a;
  border-radius: 16px; overflow: hidden; overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.ov-table { width: 100%; border-collapse: collapse; min-width: 940px; }
.ov-th {
  padding: 10px 18px; text-align: left;
  font-size: 11px; font-weight: 600; color: var(--ink-dim);
  letter-spacing: 0.8px; text-transform: uppercase;
  border-bottom: 1px solid #2a2a2a; background: #111;
  white-space: nowrap;
}
.ov-th--chevron { width: 34px; padding-left: 12px; padding-right: 0; }
.ov-th--num { text-align: right; }
.ov-th--end { width: 48px; }
.ov-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 120ms; }
.ov-row:hover { background: rgba(255,255,255,0.025); }
.ov-row--open { background: rgba(255,255,255,0.035); }
.ov-row--archived .ov-org-name,
.ov-row--archived .ov-td--balance { opacity: 0.55; }
.ov-td { padding: 14px 18px; font-size: 13.5px; color: var(--ink); vertical-align: middle; white-space: nowrap; }
.ov-td--muted { color: var(--ink-muted); font-size: 12px; }
.ov-td--num { text-align: right; font-variant-numeric: tabular-nums; }
.ov-td--balance { font-weight: 600; color: var(--gold-text); font-variant-numeric: tabular-nums; }
.ov-td--chevron { width: 34px; padding-left: 12px; padding-right: 0; }

.ov-chevron-btn {
  width: 22px; height: 22px; border: none; background: transparent;
  color: var(--ink-dim); cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px; transition: color 130ms, background 130ms;
}
.ov-chevron-btn:hover { color: var(--ink); background: rgba(255,255,255,0.06); }
.ov-chevron { transition: transform 150ms; }
.ov-chevron--open { transform: rotate(90deg); }

/* Org cell */
.ov-cell-org { display: flex; align-items: center; gap: 12px; min-width: 220px; }
.ov-org-avatar {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden; position: relative;
}
.ov-org-avatar-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.ov-org-avatar-letter { font-size: 13px; font-weight: 700; line-height: 1; }
.ov-org-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ov-org-name {
  font-size: 13.5px; font-weight: 600; color: var(--ink);
  max-width: 240px; overflow: hidden; text-overflow: ellipsis;
  display: flex; align-items: center; gap: 7px;
}
.ov-org-owner { font-size: 12px; color: var(--ink-muted); max-width: 240px; overflow: hidden; text-overflow: ellipsis; }
.ov-arch-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
  color: var(--ink-dim); background: rgba(142,142,147,.14);
  border-radius: 5px; padding: 2px 6px; flex-shrink: 0;
}

/* Branding swatches */
.ov-swatch-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none; padding: 4px 0; cursor: pointer; font-family: inherit;
}
.ov-swatch {
  width: 15px; height: 15px; border-radius: 5px; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.14); display: inline-block;
}
.ov-swatch--surface { border-radius: 50%; width: 13px; height: 13px; }
.ov-swatch-meta {
  margin-left: 5px; font-size: 12px; color: var(--ink-muted);
  border-bottom: 1px dashed transparent; transition: color 140ms, border-color 140ms;
}
.ov-swatch-btn:hover .ov-swatch-meta { color: var(--ink); border-bottom-color: rgba(255,255,255,0.25); }

/* Approval pill */
.ov-approve-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 11px; border-radius: 20px;
  border: 1px solid rgba(255,159,10,.22); background: rgba(255,159,10,.10);
  color: #FF9F0A; font-size: 11.5px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 150ms; white-space: nowrap;
}
.ov-approve-pill:hover:not(:disabled) { background: rgba(255,159,10,.18); }
.ov-approve-pill--on {
  border-color: rgba(48,209,88,.22); background: var(--emerald-soft); color: var(--emerald);
}
.ov-approve-pill--on:hover:not(:disabled) { background: rgba(48,209,88,.2); }
.ov-approve-pill--busy, .ov-approve-pill:disabled { opacity: 0.6; cursor: wait; }
.ov-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

/* Sender ID pill */
.ov-sid-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 11px; border-radius: 20px;
  font-size: 11.5px; font-weight: 700; letter-spacing: 0.4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  cursor: pointer; transition: all 150ms; white-space: nowrap;
  border: 1px solid transparent; background: transparent;
}
.ov-sid-pill--live     { border-color: rgba(100,210,255,.24); background: rgba(100,210,255,.10); color: #64D2FF; }
.ov-sid-pill--live:hover     { background: rgba(100,210,255,.18); }
.ov-sid-pill--pending  { border-color: rgba(255,159,10,.24); background: rgba(255,159,10,.10); color: #FF9F0A; }
.ov-sid-pill--pending:hover  { background: rgba(255,159,10,.18); }
.ov-sid-pill--rejected { border-color: rgba(255,69,58,.2); background: rgba(255,69,58,.08); color: #FF453A; }
.ov-sid-pill--rejected:hover { background: rgba(255,69,58,.15); }
.ov-sid-pill--default  { border-color: var(--line-strong); background: var(--paper-soft); color: var(--ink-dim); }
.ov-sid-pill--default:hover  { color: var(--ink-muted); border-color: rgba(255,255,255,0.14); }
.ov-sid-pill-tag {
  font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  background: rgba(255,159,10,0.2); border-radius: 4px; padding: 1px 5px; margin-left: 1px;
}
.ov-sid-pill-more {
  font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 700;
  background: rgba(255,255,255,0.10); border-radius: 4px; padding: 1px 5px;
}

/* Row actions */
.ov-td--actions { width: 48px; text-align: right; }
.ov-icon-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid var(--line-strong); background: var(--paper-soft);
  color: var(--ink-muted); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: color 150ms, background 150ms, border-color 150ms;
  padding: 0; box-sizing: border-box; margin-left: auto;
}
.ov-icon-btn:hover { color: var(--ink); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
.ov-icon-btn--menu-open { color: var(--gold-text); background: var(--gold-bg); border-color: var(--gold-border); }

/* ── Expanded members ── */
.ov-subrow { background: #101010; border-bottom: 1px solid rgba(255,255,255,0.04); }
.ov-subrow-td { padding: 0 18px 18px 46px; }
.ov-members { display: flex; flex-direction: column; gap: 10px; }
.ov-members-hd { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.ov-members-title {
  font-size: 11px; font-weight: 600; letter-spacing: 0.8px;
  text-transform: uppercase; color: var(--ink-dim);
}
.ov-members-hint { font-size: 11.5px; color: var(--ink-dim); }
.ov-members-empty { font-size: 12.5px; color: var(--ink-muted); padding: 4px 0; }
.ov-member-list {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px;
}
.ov-member {
  display: flex; align-items: center; gap: 10px;
  background: #161616; border: 1px solid #242424; border-radius: 11px;
  padding: 9px 12px; min-width: 0;
}
.ov-member-avatar {
  width: 28px; height: 28px; border-radius: 8px; border: 1px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden; position: relative;
}
.ov-member-avatar-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.ov-member-avatar-letters { font-size: 11px; font-weight: 700; line-height: 1; }
.ov-member-meta { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.ov-member-name  { font-size: 12.5px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ov-member-email { font-size: 11.5px; color: var(--ink-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ov-member-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
  border-radius: 5px; padding: 3px 7px; flex-shrink: 0; white-space: nowrap;
}
.ov-member-badge--owner  { color: var(--gold-text); background: rgba(201,168,76,0.12); }
.ov-member-badge--can    { color: var(--emerald); background: var(--emerald-soft); }
.ov-member-badge--cannot { color: var(--ink-dim); background: rgba(142,142,147,.12); }

/* ── Package segments ── */
.ov-seg-block { padding-bottom: 14px; margin-bottom: 12px; border-bottom: 1px solid #1e1e1e; }
.ov-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.ov-seg-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 600; border-radius: 8px; padding: 4px 8px;
  border: 1px solid transparent; font-family: inherit;
}
.ov-seg-chip--on { color: #64D2FF; background: rgba(100,210,255,.10); border-color: rgba(100,210,255,.24); }
.ov-seg-chip--add {
  color: var(--ink-dim); background: transparent;
  border: 1px dashed var(--line-strong); cursor: pointer; transition: color 130ms, border-color 130ms;
}
.ov-seg-chip--add:hover:not(:disabled) { color: var(--ink); border-color: rgba(255,255,255,0.28); }
.ov-seg-chip--add:disabled { opacity: 0.5; cursor: not-allowed; }
.ov-seg-x {
  background: none; border: none; color: inherit; cursor: pointer;
  font-size: 14px; line-height: 1; padding: 0 1px; opacity: 0.7;
}
.ov-seg-x:hover:not(:disabled) { opacity: 1; }
.ov-seg-x:disabled { cursor: not-allowed; }
.ov-seg-empty { font-size: 11.5px; color: var(--ink-dim); font-style: italic; }
.ov-seg-input-row { display: flex; gap: 8px; align-items: center; max-width: 380px; }
.ov-seg-input { text-transform: none; letter-spacing: normal; font-size: 12.5px; padding: 7px 10px; }
.ov-seg-note { font-size: 11.5px; color: var(--ink-muted); margin: 0; line-height: 1.5; }

/* ── Action dropdown ── */
.ov-action-backdrop { position: fixed; inset: 0; z-index: 9998; }
.ov-action-menu {
  position: fixed; z-index: 9999; width: 210px;
  background: #1a1a1a; border: 1px solid #2a2a2a;
  border-radius: 13px; padding: 5px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35);
}
.ov-action-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px 11px; border-radius: 8px; border: none;
  background: transparent; font-size: 13px; font-weight: 500;
  color: var(--ink-muted); cursor: pointer; font-family: inherit;
  text-align: left; transition: background 100ms, color 100ms;
}
.ov-action-item:hover { background: rgba(255,255,255,0.05); color: var(--ink); }
.ov-action-item--preview:hover { color: #64D2FF; background: rgba(100,210,255,.08); }
.ov-action-item--arch:hover    { color: #FF9F0A; background: rgba(255,159,10,.08); }
.ov-action-item--unarch:hover  { color: var(--emerald); background: rgba(48,209,88,.08); }
.ov-action-sep { height: 1px; background: #2a2a2a; margin: 4px 0; }

.ov-menu-enter-active { transition: opacity 120ms, transform 120ms; }
.ov-menu-leave-active { transition: opacity 100ms; }
.ov-menu-enter-from   { opacity: 0; transform: translateY(-4px) scale(0.97); }
.ov-menu-leave-to     { opacity: 0; }

/* ── Pagination ── */
.ov-pagination { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; }
.ov-pagination-info { font-size: 13px; color: var(--ink-muted); }
.ov-pagination-controls { display: flex; align-items: center; gap: 4px; }
.ov-page-btn {
  min-width: 34px; height: 34px; padding: 0 6px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); border-radius: 8px;
  background: var(--paper-soft); font-size: 13px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: border-color 130ms, color 130ms, background 130ms;
}
.ov-page-btn:hover:not(:disabled):not(.ov-page-btn--active) { border-color: var(--line-strong); color: var(--ink); }
.ov-page-btn--active { background: rgba(240,240,236,0.09); border-color: rgba(240,240,236,0.15); color: var(--ink); font-weight: 700; }
.ov-page-btn--nav { color: var(--ink-dim); }
.ov-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.ov-page-ellipsis { width: 28px; text-align: center; font-size: 13px; color: var(--ink-dim); user-select: none; }

/* ── Backdrop / modals ── */
.ov-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 24px; box-sizing: border-box;
}
.ov-fade-enter-active, .ov-fade-leave-active { transition: opacity 140ms; }
.ov-fade-enter-from, .ov-fade-leave-to { opacity: 0; }

.ov-confirm-box {
  width: 100%; max-width: 380px; background: #161616;
  border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 28px 28px 24px; display: flex; flex-direction: column;
  align-items: center; gap: 12px; text-align: center;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.ov-warn-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(255,159,10,.10); border: 1px solid rgba(255,159,10,.2);
  display: flex; align-items: center; justify-content: center;
}
.ov-warn-icon { color: #FF9F0A; }
.ov-confirm-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); margin: 0; }
.ov-confirm-body  { font-size: 13.5px; color: var(--ink-muted); margin: 0; line-height: 1.5; }
.ov-confirm-row   { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
.ov-cancel-btn {
  flex: 1; padding: 8px 16px; border-radius: 9px; border: 1px solid #2a2a2a;
  background: transparent; color: var(--ink-muted); font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: color 150ms, background 150ms;
}
.ov-cancel-btn:hover:not(:disabled) { background: #1e1e1e; color: var(--ink); }
.ov-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ov-del-btn {
  flex: 1; padding: 8px 18px; border-radius: 9px; border: 1px solid rgba(255,159,10,0.22);
  background: rgba(255,159,10,0.12); color: #FF9F0A; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 150ms;
}
.ov-del-btn:not(:disabled):hover { opacity: 0.85; }
.ov-del-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Branding preview modal ── */
.ov-preview-box {
  width: 100%; max-width: 560px; max-height: calc(100vh - 48px); overflow-y: auto;
  background: #161616; border: 1px solid #2a2a2a; border-radius: 18px;
  padding: 24px; display: flex; flex-direction: column; gap: 16px;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
  box-sizing: border-box;
}
.ov-bm-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ov-bm-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px; margin: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ov-close-btn {
  width: 32px; height: 32px; border-radius: 9px;
  border: 1px solid #2a2a2a; background: transparent; color: var(--ink-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: color 150ms; padding: 0; box-sizing: border-box; flex-shrink: 0;
}
.ov-close-btn:hover { color: var(--ink); }
.ov-preview-note { font-size: 12.5px; color: var(--ink-muted); margin: 0; line-height: 1.55; }
.ov-preview-note strong { color: var(--ink-soft); font-weight: 600; }

/* Mock app shell */
.ov-mock {
  border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden;
  display: flex; flex-direction: column;
}
.ov-mock-topbar { display: flex; align-items: center; gap: 9px; padding: 10px 12px; }
.ov-mock-logo { width: 20px; height: 20px; border-radius: 6px; overflow: hidden; display: flex; flex-shrink: 0; }
.ov-mock-logo-img { width: 100%; height: 100%; object-fit: cover; }
.ov-mock-logo-fallback { width: 100%; height: 100%; border-radius: 6px; }
.ov-mock-name { font-size: 12.5px; font-weight: 700; letter-spacing: -0.2px; }
.ov-mock-cta {
  margin-left: auto; font-size: 10.5px; font-weight: 700;
  padding: 5px 11px; border-radius: 7px; white-space: nowrap;
}
.ov-mock-body { display: flex; min-height: 116px; }
.ov-mock-sidebar {
  width: 96px; flex-shrink: 0; padding: 12px 10px;
  display: flex; flex-direction: column; gap: 9px;
}
.ov-mock-navitem { font-size: 10.5px; font-weight: 500; opacity: 0.8; }
.ov-mock-main { flex: 1; padding: 14px; display: flex; flex-direction: column; gap: 9px; }
.ov-mock-line { height: 7px; width: 45%; border-radius: 4px; background: rgba(255,255,255,0.10); }
.ov-mock-line--wide { width: 70%; height: 9px; background: rgba(255,255,255,0.16); }
.ov-mock-chips { display: flex; gap: 7px; margin-top: 4px; }
.ov-mock-chip { font-size: 10px; font-weight: 700; padding: 5px 10px; border-radius: 7px; }

/* Raw values */
.ov-preview-grid {
  display: flex; flex-direction: column;
  border: 1px solid #242424; border-radius: 12px; overflow: hidden;
}
.ov-pv-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 9px 13px; border-bottom: 1px solid #202020;
}
.ov-pv-row:last-child { border-bottom: none; }
.ov-pv-key { font-size: 12px; color: var(--ink-muted); flex-shrink: 0; }
.ov-pv-val { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ov-pv-muted { font-size: 12px; color: var(--ink-muted); }
.ov-pv-hex {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px; color: var(--ink-soft);
  overflow: hidden; text-overflow: ellipsis;
}
.ov-pv-unset { font-size: 12px; color: var(--ink-dim); font-style: italic; }
.ov-pv-favicon { width: 16px; height: 16px; border-radius: 4px; object-fit: cover; }

.ov-preview-actions { display: flex; gap: 10px; }
.ov-approve-btn {
  flex: 2; padding: 9px 18px; border-radius: 9px;
  border: 1px solid rgba(48,209,88,0.24); background: rgba(48,209,88,0.14);
  color: var(--emerald); font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 150ms;
}
.ov-approve-btn--revoke {
  border-color: rgba(255,159,10,0.24); background: rgba(255,159,10,0.12); color: #FF9F0A;
}
.ov-approve-btn:not(:disabled):hover { opacity: 0.85; }
.ov-approve-btn:disabled { opacity: 0.5; cursor: wait; }

/* ── Sender ID review modal ── */
.ov-review-box { max-width: 500px; }
.ov-sid-compare {
  display: flex; align-items: center; gap: 14px;
  border: 1px solid #242424; border-radius: 12px; padding: 14px 16px;
}
.ov-sid-side { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.ov-sid-side-lbl {
  font-size: 10px; font-weight: 600; letter-spacing: 0.7px;
  text-transform: uppercase; color: var(--ink-dim);
}
.ov-sid-side-val {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 17px; font-weight: 700; letter-spacing: 1px; color: #64D2FF;
  overflow: hidden; text-overflow: ellipsis;
}
.ov-sid-side-val--default { color: var(--ink-dim); }
.ov-sid-side-val--req     { color: #FF9F0A; }
.ov-sid-side-hint { font-size: 11px; color: var(--ink-dim); }
.ov-sid-arrow { color: var(--ink-dim); font-size: 16px; flex-shrink: 0; }

.ov-sid-empty { font-size: 12.5px; color: var(--ink-muted); margin: 0; line-height: 1.55; }

/* Per-ID rows in the review modal */
.ov-sid-rows { display: flex; flex-direction: column; gap: 8px; }
.ov-sid-row {
  border: 1px solid #242424; border-radius: 12px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 7px;
  transition: border-color 150ms;
}
.ov-sid-row--open  { border-color: var(--gold-border); background: rgba(201,168,76,0.04); }
.ov-sid-row--muted { opacity: 0.65; }
.ov-sid-row-hd { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ov-sid-row-val {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 15px; font-weight: 700; letter-spacing: 1px; color: var(--ink);
}
.ov-sid-row-date { font-size: 11px; color: var(--ink-dim); }
.ov-sid-row-actions { display: flex; gap: 6px; margin-left: auto; }
.ov-sid-row-note { font-size: 11.5px; color: var(--ink-muted); margin: 0; line-height: 1.5; }
.ov-sid-row-form { display: flex; flex-direction: column; gap: 7px; padding-top: 3px; }
.ov-sid-row-btns { display: flex; gap: 8px; }
.ov-sid-row-btns .ov-cancel-btn,
.ov-sid-row-btns .ov-approve-btn,
.ov-sid-row-btns .ov-reject-btn { flex: 1; padding: 7px 14px; font-size: 12.5px; }

.ov-sid-mini {
  border-radius: 7px; padding: 4px 9px; font-size: 11.5px; font-weight: 700;
  font-family: inherit; cursor: pointer; white-space: nowrap;
  border: 1px solid transparent; transition: opacity 150ms;
}
.ov-sid-mini:disabled { opacity: 0.4; cursor: not-allowed; }
.ov-sid-mini--ok { border-color: rgba(48,209,88,.24); background: rgba(48,209,88,.12); color: var(--emerald); }
.ov-sid-mini--no { border-color: rgba(255,69,58,.22); background: rgba(255,69,58,.10); color: #FF453A; }
.ov-sid-mini:not(:disabled):hover { opacity: 0.8; }

.ov-sid-chip {
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px;
  text-transform: uppercase; border-radius: 5px; padding: 2px 6px;
}
.ov-sid-chip--approved { color: var(--emerald); background: var(--emerald-soft); }
.ov-sid-chip--pending  { color: #FF9F0A; background: rgba(255,159,10,.14); }
.ov-sid-chip--rejected { color: #FF453A; background: rgba(255,69,58,.12); }
.ov-sid-chip--revoked  { color: var(--ink-dim); background: rgba(142,142,147,.14); }
.ov-sid-chip--default  { color: var(--gold-text); background: var(--gold-bg); }
.ov-sid-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); }
.ov-sid-input {
  width: 100%; box-sizing: border-box;
  padding: 10px 12px; border-radius: 10px;
  border: 1px solid var(--line-strong); background: #101010;
  color: var(--ink); font-size: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 1px; text-transform: uppercase; outline: none;
  transition: border-color 150ms;
}
.ov-sid-input:focus { border-color: var(--gold-border); }
.ov-sid-input:disabled { opacity: 0.6; cursor: not-allowed; }
.ov-sid-textarea {
  font-family: 'Inter', sans-serif; text-transform: none; letter-spacing: normal;
  font-size: 13px; resize: vertical; line-height: 1.5;
}
.ov-sid-hint { font-size: 11.5px; color: var(--ink-dim); line-height: 1.5; }
.ov-sid-error {
  margin: 0; font-size: 12.5px; color: #FF453A;
  background: rgba(255,69,58,.08); border: 1px solid rgba(255,69,58,.2);
  border-radius: 9px; padding: 9px 12px;
}
.ov-reject-btn {
  flex: 2; padding: 9px 18px; border-radius: 9px;
  border: 1px solid rgba(255,69,58,0.22); background: rgba(255,69,58,0.12);
  color: #FF453A; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 150ms;
}
.ov-reject-btn:not(:disabled):hover { opacity: 0.85; }
.ov-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 1100px) { .ov-stats { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 860px) {
  .ov-stats { grid-template-columns: repeat(2, 1fr); }
  .ov-topbar-inner, .ov-page { padding-left: 18px; padding-right: 18px; }
}
</style>
