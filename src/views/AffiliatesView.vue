<template>
  <div class="af-root">

    <!-- ── Topbar ── -->
    <nav class="af-topbar">
      <div class="af-topbar-inner">
        <span class="af-page-title">Affiliates</span>
        <button v-if="activeTab === 'affiliates'" class="af-add-btn" @click="openCreateAffiliate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Affiliate
        </button>
        <button v-if="activeTab === 'referrals'" class="af-add-btn" @click="openCreateReferral">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Referral
        </button>
      </div>
    </nav>

    <div class="af-page">

      <!-- ── Tabs ── -->
      <div class="af-tabs">
        <button
          v-for="t in tabs" :key="t.key"
          class="af-tab" :class="{ 'af-tab--active': activeTab === t.key }"
          @click="activeTab = t.key"
        >{{ t.label }}</button>
      </div>

      <!-- ════════════════════════════════ AFFILIATES TAB ════════════════════════════════ -->
      <template v-if="activeTab === 'affiliates'">

        <!-- Stats -->
        <div class="af-stats">
          <div class="af-stat">
            <span class="af-stat-num">{{ affiliates.length }}</span>
            <span class="af-stat-label">Total</span>
          </div>
          <div class="af-stat-div"/>
          <div class="af-stat">
            <span class="af-stat-num af-stat-num--green">{{ affiliates.filter(a => a.status === 'active').length }}</span>
            <span class="af-stat-label">Active</span>
          </div>
          <div class="af-stat-div"/>
          <div class="af-stat">
            <span class="af-stat-num af-stat-num--muted">{{ affiliates.filter(a => a.status !== 'active').length }}</span>
            <span class="af-stat-label">Inactive</span>
          </div>
        </div>

        <!-- Search -->
        <div class="af-filterbar">
          <div class="af-search-wrap">
            <svg class="af-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="affSearch" class="af-search-input" placeholder="Search name, email or code…"/>
            <button v-if="affSearch" class="af-search-clear" @click="affSearch = ''">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingAff" class="af-skeleton-list">
          <div class="af-skeleton" v-for="i in 4" :key="i"/>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredAffiliates.length === 0" class="af-empty">
          <span class="af-empty-glyph">✦</span>
          <p class="af-empty-title">{{ affSearch ? `No results for "${affSearch}"` : 'No affiliates yet' }}</p>
          <p class="af-empty-sub">{{ affSearch ? 'Try a different search.' : 'Create your first affiliate above.' }}</p>
        </div>

        <!-- Table -->
        <div v-else class="af-table-wrap">
          <table class="af-table">
            <thead>
              <tr>
                <th class="af-th">Affiliate</th>
                <th class="af-th">Referral Code</th>
                <th class="af-th">Commission</th>
                <th class="af-th">Status</th>
                <th class="af-th">Created</th>
                <th class="af-th af-th--end"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in paginatedAff" :key="a.id" class="af-row">
                <td class="af-td">
                  <div class="af-cell-user">
                    <div class="af-avatar" :style="avatarBg(a.userId)">{{ initials(a.userName) }}</div>
                    <div class="af-user-meta">
                      <span class="af-user-name">{{ a.userName || '—' }}</span>
                      <span class="af-user-email">{{ a.userEmail || '—' }}</span>
                    </div>
                  </div>
                </td>
                <td class="af-td">
                  <span class="af-code-pill">{{ a.referralCode }}</span>
                </td>
                <td class="af-td af-td--mono">{{ (a.commissionRate * 100).toFixed(0) }}%</td>
                <td class="af-td">
                  <button :class="['af-status-pill', a.status === 'active' && 'af-status-pill--on']" @click="toggleAffiliateStatus(a)">
                    <span class="af-dot"/>{{ a.status === 'active' ? 'Active' : 'Inactive' }}
                  </button>
                </td>
                <td class="af-td af-td--muted">{{ formatDate(a.createdAt) }}</td>
                <td class="af-td">
                  <div class="af-row-actions">
                    <button class="af-icon-btn" @click="openEditAffiliate(a)" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loadingAff && totalAffPages > 1" class="af-pagination">
          <span class="af-pagination-info">
            Showing {{ (affPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(affPage * PAGE_SIZE, filteredAffiliates.length) }} of {{ filteredAffiliates.length }}
          </span>
          <div class="af-pagination-controls">
            <button class="af-page-btn af-page-btn--nav" :disabled="affPage === 1" @click="affPage--">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button v-for="p in affPageNums" :key="p" class="af-page-btn" :class="{ 'af-page-btn--active': p === affPage }" @click="affPage = p">{{ p }}</button>
            <button class="af-page-btn af-page-btn--nav" :disabled="affPage === totalAffPages" @click="affPage++">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

      </template>

      <!-- ════════════════════════════════ REFERRALS TAB ════════════════════════════════ -->
      <template v-if="activeTab === 'referrals'">

        <!-- Stats -->
        <div class="af-stats">
          <div class="af-stat">
            <span class="af-stat-num">{{ referrals.length }}</span>
            <span class="af-stat-label">Total</span>
          </div>
          <div class="af-stat-div"/>
          <div class="af-stat">
            <span class="af-stat-num af-stat-num--green">{{ referrals.filter(r => r.status === 'active').length }}</span>
            <span class="af-stat-label">Active</span>
          </div>
          <div class="af-stat-div"/>
          <div class="af-stat">
            <span class="af-stat-num af-stat-num--muted">{{ referrals.filter(r => r.status === 'exhausted').length }}</span>
            <span class="af-stat-label">Exhausted</span>
          </div>
          <div class="af-stat-div"/>
          <div class="af-stat">
            <span class="af-stat-num af-stat-num--red">{{ referrals.filter(r => r.status === 'revoked').length }}</span>
            <span class="af-stat-label">Revoked</span>
          </div>
        </div>

        <!-- Search -->
        <div class="af-filterbar">
          <div class="af-search-wrap">
            <svg class="af-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="refSearch" class="af-search-input" placeholder="Search affiliate or user…"/>
            <button v-if="refSearch" class="af-search-clear" @click="refSearch = ''">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingRef" class="af-skeleton-list">
          <div class="af-skeleton" v-for="i in 4" :key="i"/>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredReferrals.length === 0" class="af-empty">
          <span class="af-empty-glyph">✦</span>
          <p class="af-empty-title">{{ refSearch ? `No results for "${refSearch}"` : 'No referrals yet' }}</p>
          <p class="af-empty-sub">{{ refSearch ? 'Try a different search.' : 'Create your first referral above.' }}</p>
        </div>

        <!-- Table -->
        <div v-else class="af-table-wrap">
          <table class="af-table">
            <thead>
              <tr>
                <th class="af-th">Affiliate</th>
                <th class="af-th">Referred User</th>
                <th class="af-th">Code</th>
                <th class="af-th">Events</th>
                <th class="af-th">Commission</th>
                <th class="af-th">Status</th>
                <th class="af-th">Created</th>
                <th class="af-th af-th--end"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in paginatedRef" :key="r.id" class="af-row">
                <td class="af-td">
                  <div class="af-cell-user">
                    <div class="af-avatar af-avatar--sm" :style="avatarBg(r.affiliateId)">{{ initials(r.affiliateName) }}</div>
                    <span class="af-user-name">{{ r.affiliateName || '—' }}</span>
                  </div>
                </td>
                <td class="af-td">
                  <div class="af-cell-user">
                    <div class="af-avatar af-avatar--sm" :style="avatarBg(r.userId)">{{ initials(r.userName) }}</div>
                    <div class="af-user-meta">
                      <span class="af-user-name">{{ r.userName || '—' }}</span>
                      <span class="af-user-email">{{ r.userEmail || '—' }}</span>
                    </div>
                  </div>
                </td>
                <td class="af-td"><span class="af-code-pill">{{ r.referralCode }}</span></td>
                <td class="af-td">
                  <div class="af-events-progress">
                    <span class="af-events-label">{{ r.eventsConsumed }}/{{ r.eventLimit }}</span>
                    <div class="af-events-bar">
                      <div class="af-events-bar-fill" :style="{ width: Math.min((r.eventsConsumed / r.eventLimit) * 100, 100) + '%', background: r.eventsConsumed >= r.eventLimit ? 'var(--gold)' : 'var(--emerald)' }"/>
                    </div>
                  </div>
                </td>
                <td class="af-td af-td--mono">{{ (r.commissionRate * 100).toFixed(0) }}%</td>
                <td class="af-td">
                  <span :class="['af-ref-status', `af-ref-status--${r.status}`]">{{ r.status }}</span>
                </td>
                <td class="af-td af-td--muted">{{ formatDate(r.createdAt) }}</td>
                <td class="af-td">
                  <div class="af-row-actions">
                    <button v-if="r.status === 'active'" class="af-icon-btn af-icon-btn--del" @click="revokeReferral(r)" title="Revoke">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loadingRef && totalRefPages > 1" class="af-pagination">
          <span class="af-pagination-info">
            Showing {{ (refPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(refPage * PAGE_SIZE, filteredReferrals.length) }} of {{ filteredReferrals.length }}
          </span>
          <div class="af-pagination-controls">
            <button class="af-page-btn af-page-btn--nav" :disabled="refPage === 1" @click="refPage--">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button v-for="p in refPageNums" :key="p" class="af-page-btn" :class="{ 'af-page-btn--active': p === refPage }" @click="refPage = p">{{ p }}</button>
            <button class="af-page-btn af-page-btn--nav" :disabled="refPage === totalRefPages" @click="refPage++">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

      </template>

      <!-- ════════════════════════════════ COMMISSIONS TAB ════════════════════════════════ -->
      <template v-if="activeTab === 'commissions'">

        <!-- Stats -->
        <div class="af-stats">
          <div class="af-stat">
            <span class="af-stat-num">{{ commissions.length }}</span>
            <span class="af-stat-label">Total</span>
          </div>
          <div class="af-stat-div"/>
          <div class="af-stat">
            <span class="af-stat-num af-stat-num--gold">{{ formatMoney(totalPending) }}</span>
            <span class="af-stat-label">Pending Payout</span>
          </div>
          <div class="af-stat-div"/>
          <div class="af-stat">
            <span class="af-stat-num af-stat-num--green">{{ formatMoney(totalPaid) }}</span>
            <span class="af-stat-label">Paid Out</span>
          </div>
        </div>

        <!-- Search -->
        <div class="af-filterbar">
          <div class="af-search-wrap">
            <svg class="af-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="comSearch" class="af-search-input" placeholder="Search affiliate or event…"/>
            <button v-if="comSearch" class="af-search-clear" @click="comSearch = ''">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="af-fb-divider"/>
          <div class="af-status-chips">
            <button v-for="f in comFilters" :key="f.value" class="af-status-chip" :class="{ 'af-status-chip--active': comStatusFilter === f.value }" @click="comStatusFilter = f.value">{{ f.label }}</button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingCom" class="af-skeleton-list">
          <div class="af-skeleton" v-for="i in 4" :key="i"/>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredCommissions.length === 0" class="af-empty">
          <span class="af-empty-glyph">✦</span>
          <p class="af-empty-title">{{ comSearch ? `No results for "${comSearch}"` : 'No commissions yet' }}</p>
          <p class="af-empty-sub">Commissions are created automatically when qualifying events are detected.</p>
        </div>

        <!-- Table -->
        <div v-else class="af-table-wrap">
          <table class="af-table">
            <thead>
              <tr>
                <th class="af-th">Affiliate</th>
                <th class="af-th">Event ID</th>
                <th class="af-th">Platform Revenue</th>
                <th class="af-th">Rate</th>
                <th class="af-th">Commission</th>
                <th class="af-th">Status</th>
                <th class="af-th">Date</th>
                <th class="af-th af-th--end"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in paginatedCom" :key="c.id" class="af-row">
                <td class="af-td">
                  <div class="af-cell-user">
                    <div class="af-avatar af-avatar--sm" :style="avatarBg(c.affiliateId)">{{ initials(c.affiliateName) }}</div>
                    <span class="af-user-name">{{ c.affiliateName || '—' }}</span>
                  </div>
                </td>
                <td class="af-td af-td--mono af-td--muted">{{ c.eventId ? c.eventId.slice(0, 10) + '…' : '—' }}</td>
                <td class="af-td af-td--mono">{{ formatMoney(c.totalPlatformRevenue) }}</td>
                <td class="af-td af-td--mono">{{ (c.commissionRate * 100).toFixed(0) }}%</td>
                <td class="af-td">
                  <span class="af-commission-amount">{{ formatMoney(c.commissionAmount) }}</span>
                </td>
                <td class="af-td">
                  <span :class="['af-com-status', `af-com-status--${c.status}`]">{{ c.status }}</span>
                </td>
                <td class="af-td af-td--muted">{{ formatDate(c.calculatedAt) }}</td>
                <td class="af-td">
                  <div class="af-row-actions">
                    <button v-if="c.status === 'pending'" class="af-pay-btn" :disabled="payingId === c.id" @click="markAsPaid(c)">
                      {{ payingId === c.id ? 'Saving…' : 'Mark Paid' }}
                    </button>
                    <span v-else class="af-paid-at">{{ formatDate(c.paidAt) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loadingCom && totalComPages > 1" class="af-pagination">
          <span class="af-pagination-info">
            Showing {{ (comPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(comPage * PAGE_SIZE, filteredCommissions.length) }} of {{ filteredCommissions.length }}
          </span>
          <div class="af-pagination-controls">
            <button class="af-page-btn af-page-btn--nav" :disabled="comPage === 1" @click="comPage--">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button v-for="p in comPageNums" :key="p" class="af-page-btn" :class="{ 'af-page-btn--active': p === comPage }" @click="comPage = p">{{ p }}</button>
            <button class="af-page-btn af-page-btn--nav" :disabled="comPage === totalComPages" @click="comPage++">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

      </template>

    </div>

    <!-- ══════════════════════════════ CREATE / EDIT AFFILIATE MODAL ══════════════════════════════ -->
    <Teleport to="body">
      <Transition name="af-fade">
        <div v-if="affModal" class="af-backdrop" @click.self="affModal = null">
          <div class="af-modal">
            <div class="af-modal-header">
              <span class="af-modal-title">{{ affModal.id ? 'Edit Affiliate' : 'New Affiliate' }}</span>
              <button class="af-close-btn" @click="affModal = null">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- User picker (only on create) -->
            <div class="af-modal-body">
            <div v-if="!affModal.id" class="af-field">
              <label class="af-field-label">Select User</label>
              <div class="af-search-wrap">
                <svg class="af-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input v-model="userPickerSearch" class="af-search-input" placeholder="Search users…"/>
              </div>
              <div class="af-user-picker">
                <div v-if="loadingUsers" class="af-picker-loading">Loading users…</div>
                <div
                  v-for="u in filteredPickerUsers"
                  :key="u.id"
                  class="af-picker-row"
                  :class="{ 'af-picker-row--selected': affModal.userId === u.id }"
                  @click="selectUser(u)"
                >
                  <div class="af-avatar af-avatar--sm" :style="avatarBg(u.id)">{{ initials(u.firstName + ' ' + u.lastName) }}</div>
                  <div class="af-user-meta">
                    <span class="af-user-name">{{ u.firstName }} {{ u.lastName }}</span>
                    <span class="af-user-email">{{ u.email || '—' }}</span>
                  </div>
                  <svg v-if="affModal.userId === u.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div v-if="!loadingUsers && filteredPickerUsers.length === 0" class="af-picker-empty">No users found</div>
              </div>
            </div>

            <!-- Selected user display (on edit) -->
            <div v-else class="af-field">
              <label class="af-field-label">Affiliate User</label>
              <div class="af-selected-user">
                <div class="af-avatar af-avatar--sm" :style="avatarBg(affModal.userId)">{{ initials(affModal.userName) }}</div>
                <div class="af-user-meta">
                  <span class="af-user-name">{{ affModal.userName }}</span>
                  <span class="af-user-email">{{ affModal.userEmail }}</span>
                </div>
              </div>
            </div>

            <div class="af-field">
              <label class="af-field-label">Referral Code</label>
              <input v-model.trim="affModal.referralCode" class="af-field-input" placeholder="e.g. STAN01" maxlength="20"/>
            </div>
            <div class="af-field">
              <label class="af-field-label">Default Commission Rate (%)</label>
              <input v-model.number="affModal.commissionRatePct" class="af-field-input" type="number" min="0" max="100" step="1" placeholder="e.g. 10"/>
            </div>

            <p v-if="affSaveError" class="af-error-msg">{{ affSaveError }}</p>
            <button class="af-submit-btn" :disabled="affSaving || !affModal.userId || !affModal.referralCode || !affModal.commissionRatePct" @click="saveAffiliate">
              {{ affSaving ? 'Saving…' : (affModal.id ? 'Save Changes' : 'Create Affiliate') }}
            </button>
            </div><!-- end af-modal-body -->
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════ CREATE REFERRAL MODAL ══════════════════════════════ -->
    <Teleport to="body">
      <Transition name="af-fade">
        <div v-if="refModal" class="af-backdrop" @click.self="refModal = null">
          <div class="af-modal">
            <div class="af-modal-header">
              <span class="af-modal-title">New Referral</span>
              <button class="af-close-btn" @click="refModal = null">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="af-modal-body">
            <!-- Affiliate picker -->
            <div class="af-field">
              <label class="af-field-label">Select Affiliate</label>
              <select v-model="refModal.affiliateId" class="af-field-input" @change="onAffiliateSelected">
                <option value="" disabled>Choose an affiliate…</option>
                <option v-for="a in affiliates.filter(a => a.status === 'active')" :key="a.id" :value="a.id">
                  {{ a.userName }} — {{ a.referralCode }}
                </option>
              </select>
            </div>

            <!-- User picker -->
            <div class="af-field">
              <label class="af-field-label">Select Referred User</label>
              <div class="af-search-wrap">
                <svg class="af-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input v-model="refUserSearch" class="af-search-input" placeholder="Search users…"/>
              </div>
              <div class="af-user-picker">
                <div v-if="loadingUsers" class="af-picker-loading">Loading users…</div>
                <div
                  v-for="u in filteredRefUsers"
                  :key="u.id"
                  class="af-picker-row"
                  :class="{ 'af-picker-row--selected': refModal.userId === u.id }"
                  @click="selectRefUser(u)"
                >
                  <div class="af-avatar af-avatar--sm" :style="avatarBg(u.id)">{{ initials(u.firstName + ' ' + u.lastName) }}</div>
                  <div class="af-user-meta">
                    <span class="af-user-name">{{ u.firstName }} {{ u.lastName }}</span>
                    <span class="af-user-email">{{ u.email || '—' }}</span>
                  </div>
                  <svg v-if="refModal.userId === u.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div v-if="!loadingUsers && filteredRefUsers.length === 0" class="af-picker-empty">No users found</div>
              </div>
            </div>

            <div class="af-field-row">
              <div class="af-field">
                <label class="af-field-label">Event Limit</label>
                <input v-model.number="refModal.eventLimit" class="af-field-input" type="number" min="1" step="1" placeholder="e.g. 3"/>
              </div>
              <div class="af-field">
                <label class="af-field-label">Commission Rate (%)</label>
                <input v-model.number="refModal.commissionRatePct" class="af-field-input" type="number" min="0" max="100" step="1" placeholder="e.g. 10"/>
              </div>
            </div>

            <p v-if="refSaveError" class="af-error-msg">{{ refSaveError }}</p>
            <button class="af-submit-btn" :disabled="refSaving || !refModal.affiliateId || !refModal.userId || !refModal.eventLimit || refModal.commissionRatePct === ''" @click="saveReferral">
              {{ refSaving ? 'Saving…' : 'Create Referral' }}
            </button>
            </div><!-- end af-modal-body -->
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '../firebase'
import {
  collection, getDocs, addDoc, updateDoc, doc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'

const PAGE_SIZE = 10
const PALETTE = ['#C9A84C', '#30D158', '#0A84FF', '#FF9F0A', '#BF5AF2', '#FF6961', '#64D2FF']

// ── Tabs ───────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'affiliates', label: 'Affiliates' },
  { key: 'referrals',  label: 'Referrals' },
  { key: 'commissions', label: 'Commissions' },
]
const activeTab = ref('affiliates')

// ── Shared: all users (loaded once) ────────────────────────────────────────
const allUsers = ref([])
const loadingUsers = ref(false)

async function loadUsers() {
  if (allUsers.value.length) return
  loadingUsers.value = true
  try {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('registrationDate', 'desc')))
    allUsers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('loadUsers:', e)
  } finally {
    loadingUsers.value = false
  }
}

// ── Affiliates ──────────────────────────────────────────────────────────────
const affiliates    = ref([])
const loadingAff    = ref(false)
const affSearch     = ref('')
const affPage       = ref(1)
const affModal      = ref(null)
const affSaving     = ref(false)
const affSaveError  = ref('')
const userPickerSearch = ref('')

async function loadAffiliates() {
  loadingAff.value = true
  try {
    const snap = await getDocs(query(collection(db, 'affiliates'), orderBy('createdAt', 'desc')))
    affiliates.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('loadAffiliates:', e)
  } finally {
    loadingAff.value = false
  }
}

const filteredAffiliates = computed(() => {
  const q = affSearch.value.toLowerCase().trim()
  if (!q) return affiliates.value
  return affiliates.value.filter(a =>
    (a.userName || '').toLowerCase().includes(q) ||
    (a.userEmail || '').toLowerCase().includes(q) ||
    (a.referralCode || '').toLowerCase().includes(q)
  )
})
const totalAffPages = computed(() => Math.ceil(filteredAffiliates.value.length / PAGE_SIZE))
const paginatedAff  = computed(() => filteredAffiliates.value.slice((affPage.value - 1) * PAGE_SIZE, affPage.value * PAGE_SIZE))
const affPageNums   = computed(() => pageNumbers(affPage.value, totalAffPages.value))

const filteredPickerUsers = computed(() => {
  const q = userPickerSearch.value.toLowerCase().trim()
  const existingIds = new Set(affiliates.value.map(a => a.userId))
  const available = allUsers.value.filter(u => !existingIds.has(u.id))
  if (!q) return available.slice(0, 20)
  return available.filter(u =>
    (`${u.firstName} ${u.lastName}`).toLowerCase().includes(q) ||
    (u.email || '').toLowerCase().includes(q)
  ).slice(0, 20)
})

function openCreateAffiliate() {
  affSaveError.value = ''
  userPickerSearch.value = ''
  affModal.value = { id: null, userId: '', userName: '', userEmail: '', referralCode: '', commissionRatePct: 10 }
  loadUsers()
}

function openEditAffiliate(a) {
  affSaveError.value = ''
  affModal.value = { ...a, commissionRatePct: Math.round(a.commissionRate * 100) }
}

function selectUser(u) {
  affModal.value.userId    = u.id
  affModal.value.userName  = `${u.firstName || ''} ${u.lastName || ''}`.trim()
  affModal.value.userEmail = u.email || ''
}

async function saveAffiliate() {
  if (!affModal.value.userId || !affModal.value.referralCode || !affModal.value.commissionRatePct) return
  affSaving.value = true
  affSaveError.value = ''
  try {
    const payload = {
      userId:         affModal.value.userId,
      userName:       affModal.value.userName,
      userEmail:      affModal.value.userEmail,
      referralCode:   affModal.value.referralCode.toUpperCase(),
      commissionRate: affModal.value.commissionRatePct / 100,
      status:         affModal.value.status ?? 'active',
    }
    if (affModal.value.id) {
      await updateDoc(doc(db, 'affiliates', affModal.value.id), payload)
      const idx = affiliates.value.findIndex(a => a.id === affModal.value.id)
      if (idx !== -1) affiliates.value[idx] = { ...affiliates.value[idx], ...payload }
    } else {
      payload.createdAt = new Date().toISOString()
      const ref = await addDoc(collection(db, 'affiliates'), payload)
      affiliates.value.unshift({ id: ref.id, ...payload })
    }
    affModal.value = null
  } catch (e) {
    affSaveError.value = e.message || 'Failed to save affiliate'
  } finally {
    affSaving.value = false
  }
}

async function toggleAffiliateStatus(a) {
  const next = a.status === 'active' ? 'inactive' : 'active'
  try {
    await updateDoc(doc(db, 'affiliates', a.id), { status: next })
    a.status = next
  } catch (e) {
    console.error('toggleAffiliateStatus:', e)
  }
}

watch(affSearch, () => { affPage.value = 1 })

// ── Referrals ───────────────────────────────────────────────────────────────
const referrals    = ref([])
const loadingRef   = ref(false)
const refSearch    = ref('')
const refPage      = ref(1)
const refModal     = ref(null)
const refSaving    = ref(false)
const refSaveError = ref('')
const refUserSearch = ref('')

async function loadReferrals() {
  loadingRef.value = true
  try {
    const snap = await getDocs(query(collection(db, 'affiliateReferrals'), orderBy('createdAt', 'desc')))
    referrals.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('loadReferrals:', e)
  } finally {
    loadingRef.value = false
  }
}

const filteredReferrals = computed(() => {
  const q = refSearch.value.toLowerCase().trim()
  if (!q) return referrals.value
  return referrals.value.filter(r =>
    (r.affiliateName || '').toLowerCase().includes(q) ||
    (r.userName || '').toLowerCase().includes(q) ||
    (r.userEmail || '').toLowerCase().includes(q) ||
    (r.referralCode || '').toLowerCase().includes(q)
  )
})
const totalRefPages = computed(() => Math.ceil(filteredReferrals.value.length / PAGE_SIZE))
const paginatedRef  = computed(() => filteredReferrals.value.slice((refPage.value - 1) * PAGE_SIZE, refPage.value * PAGE_SIZE))
const refPageNums   = computed(() => pageNumbers(refPage.value, totalRefPages.value))

const filteredRefUsers = computed(() => {
  const q = refUserSearch.value.toLowerCase().trim()
  if (!q) return allUsers.value.slice(0, 20)
  return allUsers.value.filter(u =>
    (`${u.firstName} ${u.lastName}`).toLowerCase().includes(q) ||
    (u.email || '').toLowerCase().includes(q)
  ).slice(0, 20)
})

function openCreateReferral() {
  refSaveError.value = ''
  refUserSearch.value = ''
  refModal.value = { affiliateId: '', affiliateName: '', referralCode: '', userId: '', userName: '', userEmail: '', eventLimit: 3, commissionRatePct: '' }
  loadUsers()
}

function onAffiliateSelected() {
  const aff = affiliates.value.find(a => a.id === refModal.value.affiliateId)
  if (aff) {
    refModal.value.affiliateName    = aff.userName
    refModal.value.referralCode     = aff.referralCode
    refModal.value.commissionRatePct = Math.round(aff.commissionRate * 100)
  }
}

function selectRefUser(u) {
  refModal.value.userId    = u.id
  refModal.value.userName  = `${u.firstName || ''} ${u.lastName || ''}`.trim()
  refModal.value.userEmail = u.email || ''
}

async function saveReferral() {
  if (!refModal.value.affiliateId || !refModal.value.userId || !refModal.value.eventLimit) return
  refSaving.value = true
  refSaveError.value = ''
  try {
    const payload = {
      affiliateId:    refModal.value.affiliateId,
      affiliateName:  refModal.value.affiliateName,
      referralCode:   refModal.value.referralCode,
      userId:         refModal.value.userId,
      userName:       refModal.value.userName,
      userEmail:      refModal.value.userEmail,
      eventLimit:     refModal.value.eventLimit,
      commissionRate: refModal.value.commissionRatePct / 100,
      eventsConsumed: 0,
      status:         'active',
      createdAt:      new Date().toISOString(),
    }
    const ref = await addDoc(collection(db, 'affiliateReferrals'), payload)
    referrals.value.unshift({ id: ref.id, ...payload })
    refModal.value = null
  } catch (e) {
    refSaveError.value = e.message || 'Failed to save referral'
  } finally {
    refSaving.value = false
  }
}

async function revokeReferral(r) {
  try {
    await updateDoc(doc(db, 'affiliateReferrals', r.id), { status: 'revoked' })
    r.status = 'revoked'
  } catch (e) {
    console.error('revokeReferral:', e)
  }
}

watch(refSearch, () => { refPage.value = 1 })

// ── Commissions ─────────────────────────────────────────────────────────────
const commissions     = ref([])
const loadingCom      = ref(false)
const comSearch       = ref('')
const comPage         = ref(1)
const comStatusFilter = ref('all')
const payingId        = ref(null)

const comFilters = [
  { label: 'All',     value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid',    value: 'paid' },
]

async function loadCommissions() {
  loadingCom.value = true
  try {
    const snap = await getDocs(query(collection(db, 'affiliateCommissions'), orderBy('calculatedAt', 'desc')))
    commissions.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('loadCommissions:', e)
  } finally {
    loadingCom.value = false
  }
}

const filteredCommissions = computed(() => {
  let list = commissions.value
  if (comStatusFilter.value !== 'all') list = list.filter(c => c.status === comStatusFilter.value)
  const q = comSearch.value.toLowerCase().trim()
  if (!q) return list
  return list.filter(c =>
    (c.affiliateName || '').toLowerCase().includes(q) ||
    (c.eventId || '').toLowerCase().includes(q)
  )
})
const totalComPages = computed(() => Math.ceil(filteredCommissions.value.length / PAGE_SIZE))
const paginatedCom  = computed(() => filteredCommissions.value.slice((comPage.value - 1) * PAGE_SIZE, comPage.value * PAGE_SIZE))
const comPageNums   = computed(() => pageNumbers(comPage.value, totalComPages.value))

const totalPending = computed(() => commissions.value.filter(c => c.status === 'pending').reduce((s, c) => s + (c.commissionAmount ?? 0), 0))
const totalPaid    = computed(() => commissions.value.filter(c => c.status === 'paid').reduce((s, c) => s + (c.commissionAmount ?? 0), 0))

async function markAsPaid(c) {
  payingId.value = c.id
  try {
    const paidAt = new Date().toISOString()
    await updateDoc(doc(db, 'affiliateCommissions', c.id), { status: 'paid', paidAt })
    c.status = 'paid'
    c.paidAt = paidAt
  } catch (e) {
    console.error('markAsPaid:', e)
  } finally {
    payingId.value = null
  }
}

watch([comSearch, comStatusFilter], () => { comPage.value = 1 })

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(() => {
  loadAffiliates()
  loadReferrals()
  loadCommissions()
})

watch(activeTab, (tab) => {
  if (tab === 'affiliates' && !affiliates.value.length) loadAffiliates()
  if (tab === 'referrals'  && !referrals.value.length)  loadReferrals()
  if (tab === 'commissions' && !commissions.value.length) loadCommissions()
})

// ── Helpers ─────────────────────────────────────────────────────────────────
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (current > 3) { pages.push(1); if (current > 4) pages.push('…') }
  for (let p = Math.max(1, current - 1); p <= Math.min(total, current + 1); p++) pages.push(p)
  if (current < total - 2) { if (current < total - 3) pages.push('…'); pages.push(total) }
  return pages
}

function avatarBg(seed = '') {
  const idx = seed.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % PALETTE.length
  return { background: PALETTE[idx], color: '#fff' }
}

function initials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?'
}

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = val?.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function formatMoney(val) {
  if (val == null) return '—'
  return 'TZS ' + Number(val).toLocaleString('en-TZ', { minimumFractionDigits: 0 })
}
</script>

<style scoped>
/* ── Tokens ── */
.af-root {
  --ink:          #f0f0ec;
  --ink-soft:     #d8d4cd;
  --ink-muted:    #888;
  --ink-dim:      #555;
  --line:         #242424;
  --line-soft:    #1e1e1e;
  --line-strong:  #2a2a2a;
  --paper-soft:   #141414;
  --gold:         #C9A84C;
  --emerald:      #30D158;
  --emerald-soft: rgba(48,209,88,0.12);
  --red:          #FF453A;
  min-height: 100vh;
  background: #0a0a0b;
  color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Topbar ── */
.af-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.af-topbar-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.af-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; letter-spacing: -0.3px; color: var(--ink);
}
.af-add-btn {
  display: flex; align-items: center; gap: 7px;
  background: #C9A84C; color: #070707; border: none;
  padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 130ms;
}
.af-add-btn:hover { background: #d4b560; }

/* ── Page shell ── */
.af-page {
  max-width: 1200px; margin: 0 auto;
  padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Tabs ── */
.af-tabs {
  display: flex; gap: 2px;
  background: #111; border: 1px solid var(--line-strong);
  border-radius: 14px; padding: 6px;
  width: fit-content;
}
.af-tab {
  padding: 7px 16px; border-radius: 10px; border: none;
  background: transparent; font-size: 13px; font-weight: 500;
  color: var(--ink-muted); cursor: pointer; font-family: inherit;
  transition: background 120ms, color 120ms;
}
.af-tab--active { background: rgba(240,240,236,0.09); color: var(--ink); font-weight: 600; }
.af-tab:hover:not(.af-tab--active) { color: var(--ink-soft); }

/* ── Stats ── */
.af-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.af-stat {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 14px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.af-stat-num { font-size: 32px; font-weight: 700; color: var(--ink); letter-spacing: -0.5px; line-height: 1; }
.af-stat-num--green { color: var(--emerald); }
.af-stat-num--gold  { color: var(--gold); }
.af-stat-num--muted { color: var(--ink-dim); }
.af-stat-num--red   { color: #FF453A; }
.af-stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-dim); }
.af-stat-div { display: none; }

/* ── Filter bar ── */
.af-filterbar {
  background: #111; border: 1px solid var(--line-strong); border-radius: 14px;
  padding: 8px 8px 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.af-search-wrap { position: relative; display: flex; align-items: center; }
.af-search-icon { position: absolute; left: 11px; color: var(--ink-dim); pointer-events: none; }
.af-search-input {
  background: transparent; border: none;
  padding: 7px 32px 7px 34px; color: var(--ink);
  font-size: 13.5px; width: 260px; outline: none; font-family: inherit;
}
.af-search-input::placeholder { color: var(--ink-dim); }
.af-search-clear { position: absolute; right: 9px; background: none; border: none; color: var(--ink-dim); cursor: pointer; display: flex; align-items: center; padding: 2px; }
.af-fb-divider { width: 1px; height: 24px; background: var(--line-strong); margin: 0 4px; }
.af-status-chips { display: flex; gap: 6px; }
.af-status-chip {
  padding: 6px 14px; border-radius: 20px;
  border: 1px solid var(--line-strong); background: transparent;
  color: var(--ink-muted); font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: all 0.14s;
}
.af-status-chip--active { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.08); color: #C9A84C; }

/* ── Skeleton ── */
.af-skeleton-list { display: flex; flex-direction: column; gap: 8px; }
.af-skeleton {
  background: linear-gradient(90deg, #141414 25%, #1a1a1a 50%, #141414 75%);
  background-size: 200% 100%;
  animation: af-shimmer 1.4s infinite;
  border-radius: 14px; height: 60px;
}
@keyframes af-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty ── */
.af-empty {
  border: 1px dashed var(--line-strong); border-radius: 20px;
  padding: 60px 20px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.af-empty-glyph { font-size: 28px; color: var(--gold); }
.af-empty-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: var(--ink); margin: 0; }
.af-empty-sub { font-size: 13px; color: var(--ink-muted); margin: 0; }

/* ── Table ── */
.af-table-wrap { background: #141414; border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.af-table { width: 100%; border-collapse: collapse; }
.af-th {
  padding: 10px 18px; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.8px; color: var(--ink-dim);
  text-align: left; background: #111; border-bottom: 1px solid #2a2a2a;
}
.af-th--end { width: 100px; }
.af-td { padding: 14px 18px; font-size: 13.5px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; color: var(--ink); }
.af-td--mono  { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }
.af-td--muted { font-size: 12px; color: var(--ink-muted); }
.af-row:last-child .af-td { border-bottom: none; }
.af-row { cursor: pointer; transition: background 120ms; }
.af-row:hover .af-td { background: rgba(255,255,255,0.025); }

/* ── Cell user ── */
.af-cell-user { display: flex; align-items: center; gap: 10px; }
.af-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.af-avatar--sm { width: 28px; height: 28px; font-size: 11px; }
.af-user-meta { display: flex; flex-direction: column; gap: 2px; }
.af-user-name { font-size: 13.5px; color: var(--ink); }
.af-user-email { font-size: 12px; color: var(--ink-muted); }

/* ── Pills / badges ── */
.af-code-pill { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.4); color: #C9A84C; letter-spacing: 0.06em; }
.af-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px;
  border: 1px solid var(--line-strong); background: var(--paper-soft);
  color: var(--ink-dim); font-size: 11px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.14s;
}
.af-status-pill--on { border-color: rgba(48,209,88,0.3); background: var(--emerald-soft); color: var(--emerald); }
.af-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

.af-ref-status { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: capitalize; letter-spacing: 0.02em; }
.af-ref-status--active    { background: var(--emerald-soft); color: var(--emerald); }
.af-ref-status--exhausted { background: rgba(201,168,76,0.08); color: #C9A84C; }
.af-ref-status--revoked   { background: rgba(255,69,58,0.10);  color: var(--red); }

.af-com-status { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: capitalize; }
.af-com-status--pending { background: rgba(201,168,76,0.08); color: #C9A84C; }
.af-com-status--paid    { background: var(--emerald-soft); color: var(--emerald); }

/* ── Events progress bar ── */
.af-events-progress { display: flex; flex-direction: column; gap: 5px; min-width: 80px; }
.af-events-label { font-size: 11px; font-weight: 600; color: var(--ink-soft); font-family: 'SF Mono','Fira Code',monospace; }
.af-events-bar { height: 4px; border-radius: 2px; background: var(--line-strong); overflow: hidden; }
.af-events-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }

/* ── Commission amount ── */
.af-commission-amount { font-size: 13px; font-weight: 700; color: #C9A84C; font-family: 'SF Mono','Fira Code',monospace; }
.af-paid-at { font-size: 11px; color: var(--ink-dim); }

/* ── Row actions ── */
.af-row-actions { display: flex; align-items: center; gap: 6px; }
.af-icon-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--line-strong); background: rgba(255,255,255,0.03); color: var(--ink-muted); cursor: pointer; transition: all 0.14s; }
.af-icon-btn:hover { border-color: rgba(201,168,76,0.4); color: #C9A84C; background: rgba(201,168,76,0.08); }
.af-icon-btn--del:hover { border-color: rgba(255,69,58,0.3); color: var(--red); background: rgba(255,69,58,0.08); }
.af-pay-btn { padding: 6px 13px; border-radius: 8px; border: 1px solid rgba(48,209,88,0.3); background: var(--emerald-soft); color: var(--emerald); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.14s; white-space: nowrap; }
.af-pay-btn:hover { background: rgba(48,209,88,0.2); }
.af-pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Pagination ── */
.af-pagination { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; }
.af-pagination-info { font-size: 12px; color: var(--ink-muted); }
.af-pagination-controls { display: flex; align-items: center; gap: 4px; }
.af-page-btn { min-width: 30px; height: 30px; padding: 0 6px; border-radius: 7px; border: 1px solid var(--line-strong); background: transparent; color: var(--ink-muted); font-size: 12px; cursor: pointer; font-family: inherit; transition: all 0.14s; }
.af-page-btn--active { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.08); color: #C9A84C; font-weight: 600; }
.af-page-btn--nav { color: var(--ink-soft); }
.af-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── Modal backdrop ── */
.af-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 9999; display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.af-modal {
  background: #161616; border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 0; min-width: 340px; max-width: 480px; width: 100%;
  max-height: 88vh; overflow-y: auto; display: flex; flex-direction: column;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.af-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #2a2a2a; flex-shrink: 0; }
.af-modal-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px; margin: 0; }
.af-close-btn { display: flex; align-items: center; justify-content: center; background: none; border: none; color: var(--ink-muted); cursor: pointer; padding: 4px; }
.af-close-btn:hover { color: var(--ink); }

/* ── Form fields ── */
.af-modal-body { padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 14px; }
.af-field { display: flex; flex-direction: column; gap: 6px; }
.af-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.af-field-label { font-size: 12px; font-weight: 600; color: var(--ink-muted); }
.af-field-input {
  padding: 10px 13px; border: 0.8px solid #2a2a2a; border-radius: 10px;
  background: #161616; font-size: 14px; color: var(--ink);
  width: 100%; box-sizing: border-box; font-family: inherit; outline: none;
  transition: border-color 140ms, box-shadow 140ms;
}
.af-field-input:focus { border-color: rgba(201,168,76,0.5); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); }
.af-field-input::placeholder { color: var(--ink-dim); }
select.af-field-input { cursor: pointer; }

/* ── User picker ── */
.af-user-picker { max-height: 190px; overflow-y: auto; border: 1px solid #2a2a2a; border-radius: 10px; background: rgba(0,0,0,0.2); }
.af-picker-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; transition: background 0.12s; }
.af-picker-row:hover { background: rgba(255,255,255,0.04); }
.af-picker-row--selected { background: rgba(201,168,76,0.08); }
.af-picker-empty, .af-picker-loading { padding: 18px; text-align: center; font-size: 13px; color: var(--ink-dim); }
.af-selected-user { display: flex; align-items: center; gap: 10px; padding: 10px 13px; background: rgba(255,255,255,0.03); border: 1px solid #2a2a2a; border-radius: 10px; }

/* ── Submit / action buttons ── */
.af-submit-btn {
  padding: 8px 18px; border-radius: 9px; border: none;
  background: #C9A84C; color: #070707; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 130ms; width: 100%;
}
.af-submit-btn:hover:not(:disabled) { background: #d4b560; }
.af-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.af-error-msg {
  background: rgba(255,59,48,0.07); border: 0.8px solid rgba(255,59,48,0.2);
  border-radius: 10px; padding: 12px 16px;
  font-size: 13px; color: #FF453A; margin: 0;
}

/* ── Fade transition ── */
.af-fade-enter-active, .af-fade-leave-active { transition: opacity 180ms; }
.af-fade-enter-from, .af-fade-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .af-page { padding: 18px 16px 48px; }
  .af-topbar-inner { padding: 14px 16px; }
  .af-search-input { width: 200px; }
}
@media (max-width: 600px) {
  .af-field-row { grid-template-columns: 1fr; }
}
</style>
