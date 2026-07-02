<template>
  <div class="uv-root">

    <!-- ── Topbar ── -->
    <nav class="uv-topbar">
      <div class="uv-topbar-inner">
        <span class="uv-page-title">Users</span>
        <button class="uv-add-btn" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add User
        </button>
      </div>
    </nav>

    <!-- ── Page shell ── -->
    <div class="uv-page">

      <!-- Stats -->
      <div class="uv-stats">
        <div class="uv-stat">
          <span class="uv-stat-num">{{ users.length }}</span>
          <span class="uv-stat-label">Total Users</span>
        </div>
        <div class="uv-stat-div" />
        <div class="uv-stat">
          <span class="uv-stat-num uv-stat-num--green">{{ activeCount }}</span>
          <span class="uv-stat-label">Active</span>
        </div>
        <div class="uv-stat-div" />
        <div class="uv-stat">
          <span class="uv-stat-num uv-stat-num--red">{{ inactiveCount }}</span>
          <span class="uv-stat-label">Inactive</span>
        </div>
        <div class="uv-stat-div" />
        <button class="uv-stat uv-stat--credit" @click="showOutstandingModal = true">
          <span :class="['uv-stat-num', totalOutstanding > 0 ? 'uv-stat-num--orange' : 'uv-stat-num--dim']">
            {{ totalOutstanding > 0 ? formatBalance(totalOutstanding) : '—' }}
          </span>
          <span class="uv-stat-label">Outstanding</span>
        </button>
      </div>

      <!-- Filter bar -->
      <div class="uv-filterbar">
        <div class="uv-search-wrap">
          <svg class="uv-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" class="uv-search-input" placeholder="Search name, email or phone…" />
          <button v-if="searchQuery" class="uv-search-clear" @click="searchQuery = ''">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="uv-fb-divider" />
        <div class="uv-status-chips">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            class="uv-status-chip"
            :class="{ 'uv-status-chip--active': statusFilter === f.value }"
            @click="statusFilter = f.value"
          >{{ f.label }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="uv-skeleton-list">
        <div class="uv-skeleton" v-for="i in 5" :key="i" />
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="uv-empty">
        <span class="uv-empty-glyph">✦</span>
        <p class="uv-empty-title">{{ searchQuery ? `No results for "${searchQuery}"` : 'No users yet' }}</p>
        <p class="uv-empty-sub">{{ searchQuery ? 'Try a different search term.' : 'Add your first user above.' }}</p>
      </div>

      <!-- Table -->
      <div v-else class="uv-table-wrap">
        <table class="uv-table">
          <thead>
            <tr>
              <th class="uv-th">User</th>
              <th class="uv-th">Phone</th>
              <th class="uv-th">Balance</th>
              <th class="uv-th">Status</th>
              <th class="uv-th">Clearance</th>
              <th class="uv-th">Last Login</th>
              <th class="uv-th uv-th--end"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in paginated" :key="u.id" class="uv-row">
              <td class="uv-td">
                <div class="uv-cell-user">
                  <div class="uv-avatar" :style="avatarBg(u)">
                    <img v-if="u.profileImage" :src="u.profileImage" class="uv-avatar-img" @error="e => e.target.style.display = 'none'" />
                    <span class="uv-avatar-letters">{{ initials(u) }}</span>
                  </div>
                  <div class="uv-user-meta">
                    <span class="uv-user-name">{{ fullName(u) }}</span>
                    <span class="uv-user-email">{{ u.email || '—' }}</span>
                  </div>
                </div>
              </td>
              <td class="uv-td uv-td--muted">{{ u.phoneNumber || '—' }}</td>
              <td class="uv-td">
                <button class="uv-balance-btn" @click="openBalanceModal(u)">
                  {{ formatBalance(u.balance) }}
                </button>
              </td>
              <td class="uv-td">
                <button
                  :class="['uv-status-pill', u.isActive && 'uv-status-pill--on']"
                  @click="toggleActive(u)"
                >
                  <span class="uv-dot" />{{ u.isActive ? 'Active' : 'Inactive' }}
                </button>
              </td>
              <td class="uv-td">
                <span :class="['uv-cl-badge', `uv-cl-${u.clearanceLevel ?? 0}`]">L{{ u.clearanceLevel ?? 0 }}</span>
              </td>
              <td class="uv-td uv-td--date">{{ formatDate(u.lastLoginDate) }}</td>
              <td class="uv-td uv-td--actions">
                <button
                  class="uv-icon-btn"
                  :class="{ 'uv-icon-btn--menu-open': menuUser?.id === u.id }"
                  @click.stop="openMenu(u, $event)"
                  title="Actions"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && totalPages > 1" class="uv-pagination">
        <span class="uv-pagination-info">
          Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filtered.length) }} of {{ filtered.length }}
        </span>
        <div class="uv-pagination-controls">
          <button class="uv-page-btn uv-page-btn--nav" :disabled="currentPage === 1" @click="currentPage--">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '…'" class="uv-page-ellipsis">…</span>
            <button v-else class="uv-page-btn" :class="{ 'uv-page-btn--active': p === currentPage }" @click="currentPage = p">{{ p }}</button>
          </template>
          <button class="uv-page-btn uv-page-btn--nav" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

    </div>

    <!-- ── Action dropdown ── -->
    <Teleport to="body">
      <div v-if="menuUser" class="uv-action-backdrop" @click="closeMenu" />
      <Transition name="uv-menu">
        <div
          v-if="menuUser"
          class="uv-action-menu"
          :style="{ top: menuPos.top + 'px', right: menuPos.right + 'px' }"
          @click.stop
        >
          <button class="uv-action-item uv-action-item--events" @click="$router.push(`/user-events/${menuUser.id}`); closeMenu()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            View Events
          </button>
          <button class="uv-action-item uv-action-item--history" @click="openHistoryModal(menuUser); closeMenu()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Balance History
          </button>
          <button class="uv-action-item" @click="openEdit(menuUser); closeMenu()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit User
          </button>
          <div class="uv-action-sep" />
          <button class="uv-action-item uv-action-item--del" @click="confirmDelete(menuUser); closeMenu()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Delete User
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete confirm ── -->
    <Teleport to="body">
      <Transition name="uv-fade">
        <div v-if="deletingUser" class="uv-backdrop" @click.self="deletingUser = null">
          <div class="uv-confirm-box">
            <div class="uv-warn-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="uv-warn-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="uv-confirm-title">Delete this user?</p>
            <p class="uv-confirm-body"><strong>{{ fullName(deletingUser) }}</strong> will be permanently removed. This cannot be undone.</p>
            <div class="uv-confirm-row">
              <button class="uv-cancel-btn" :disabled="deleting" @click="deletingUser = null">Cancel</button>
              <button class="uv-del-btn" :disabled="deleting" @click="doDelete">{{ deleting ? 'Deleting…' : 'Delete User' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Balance modal ── -->
    <Teleport to="body">
      <Transition name="uv-fade">
        <div v-if="balanceUser" class="uv-backdrop" @click.self="balanceUser = null">
          <div class="uv-balance-modal">
            <div class="uv-bm-header">
              <span class="uv-bm-title">Adjust Balance</span>
              <button class="uv-close-btn" @click="balanceUser = null">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="uv-bal-current">
              <span class="uv-bal-current-label">Current Balance</span>
              <span class="uv-bal-current-val">{{ formatBalance(balanceUser.balance) }}</span>
            </div>
            <div class="uv-bal-mode-row">
              <button :class="['uv-bal-mode-btn', balanceMode === 'add' && 'uv-bal-mode-btn--on']" @click="balanceMode = 'add'">Add / Deduct</button>
              <button :class="['uv-bal-mode-btn', balanceMode === 'set' && 'uv-bal-mode-btn--on']" @click="balanceMode = 'set'">Set to value</button>
            </div>
            <div class="uv-field">
              <label class="uv-field-label">{{ balanceMode === 'set' ? 'New Balance (TZS)' : 'Amount (TZS)' }}</label>
              <input v-model.number="balanceInput" class="uv-field-input" type="number" step="1" :placeholder="balanceMode === 'set' ? '0' : 'e.g. 5000 or -500'" />
            </div>
            <div class="uv-bal-preview">
              <span class="uv-bal-preview-label">Result</span>
              <span class="uv-bal-preview-val" :class="previewBalance < 0 && 'uv-bal-preview-val--neg'">{{ formatBalance(previewBalance) }}</span>
            </div>
            <div v-if="isTopUp" class="uv-bal-paid-row">
              <div class="uv-bal-paid-text">
                <span class="uv-bal-paid-label">Payment Received?</span>
                <span class="uv-bal-paid-sub">Turn off if this is on credit</span>
              </div>
              <button :class="['uv-toggle', balancePaid && 'uv-toggle--on']" @click="balancePaid = !balancePaid" />
            </div>
            <p v-if="balanceError" class="uv-error-msg">{{ balanceError }}</p>
            <button class="uv-submit-btn" :disabled="savingBalance || balanceInput === null || balanceInput === ''" @click="doAdjustBalance">
              {{ savingBalance ? 'Saving…' : 'Save Balance' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Balance history modal ── -->
    <Teleport to="body">
      <Transition name="uv-fade">
        <div v-if="historyUser" class="uv-backdrop" @click.self="historyUser = null">
          <div class="uv-history-modal">

            <div class="uv-bm-header">
              <div class="uv-hist-header-left">
                <span class="uv-bm-title">Balance History</span>
                <span class="uv-hist-name">{{ fullName(historyUser) }}</span>
              </div>
              <button class="uv-close-btn" @click="historyUser = null">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Stats strip -->
            <div class="uv-hist-stats">
              <div class="uv-hist-stat">
                <span class="uv-hist-stat-label">Lifetime</span>
                <span class="uv-hist-stat-val uv-hist-stat-val--gold">{{ formatBalance(lifetimeTopUps) }}</span>
              </div>
              <div class="uv-hist-stat">
                <span class="uv-hist-stat-label">Entries</span>
                <span class="uv-hist-stat-val">{{ historyRecords.length }}</span>
              </div>
              <div class="uv-hist-stat">
                <span class="uv-hist-stat-label">Balance</span>
                <span class="uv-hist-stat-val uv-hist-stat-val--gold">{{ formatBalance(historyUser.balance) }}</span>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="historyLoading" class="uv-hist-skeletons">
              <div class="uv-hist-skel" v-for="i in 4" :key="i" />
            </div>

            <!-- Error -->
            <div v-else-if="historyError" class="uv-error-msg" style="margin: 0 20px 20px;">{{ historyError }}</div>

            <!-- Empty -->
            <div v-else-if="historyRecords.length === 0" class="uv-hist-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--ink-dim)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <p class="uv-hist-empty-text">No history yet</p>
              <p class="uv-hist-empty-sub">Adjustments made from now on will appear here.</p>
            </div>

            <!-- Transactions -->
            <div v-else class="uv-hist-list">
              <div
                v-for="rec in historyRecords"
                :key="rec.id"
                :class="['uv-txn', rec.delta >= 0 ? 'uv-txn--cr' : 'uv-txn--dr']"
              >
                <div class="uv-txn-icon">
                  <svg v-if="rec.delta >= 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                  </svg>
                </div>
                <div class="uv-txn-body">
                  <div class="uv-txn-top">
                    <div class="uv-txn-left">
                      <span class="uv-txn-amount">{{ formatBalance(Math.abs(rec.delta)) }}</span>
                      <span class="uv-txn-type">{{ rec.delta >= 0 ? 'Top Up' : 'Deduction' }}</span>
                    </div>
                    <span class="uv-txn-date">{{ formatHistoryDate(rec.timestamp) }}</span>
                  </div>
                  <div class="uv-txn-foot">
                    <span class="uv-txn-after">After: <strong>{{ formatBalance(rec.newBalance) }}</strong></span>
                    <div class="uv-txn-foot-right">
                      <span v-if="rec.delta > 0" :class="['uv-txn-paid-badge', rec.paid !== false ? 'uv-txn-paid-badge--yes' : 'uv-txn-paid-badge--no']">
                        {{ rec.paid !== false ? 'Paid' : 'Credit' }}
                      </span>
                      <span v-if="rec.adjustedBy" class="uv-txn-by">{{ rec.adjustedBy.slice(0, 8) }}…</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Edit / Create modal ── -->
    <Teleport to="body">
      <Transition name="uv-fade">
        <div v-if="showModal" class="uv-backdrop" @click.self="closeModal">
          <div class="uv-edit-modal">
            <div class="uv-bm-header">
              <span class="uv-bm-title">{{ editingUser ? 'Edit User' : 'Add User' }}</span>
              <button class="uv-close-btn" @click="closeModal">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="uv-fields-grid">
              <div class="uv-field">
                <label class="uv-field-label">First Name</label>
                <input v-model="form.firstName" class="uv-field-input" placeholder="First name" />
              </div>
              <div class="uv-field">
                <label class="uv-field-label">Last Name</label>
                <input v-model="form.lastName" class="uv-field-input" placeholder="Last name" />
              </div>
            </div>
            <div v-if="!editingUser" class="uv-field">
              <label class="uv-field-label">Email</label>
              <input v-model="form.email" class="uv-field-input" type="email" placeholder="user@example.com" />
            </div>
            <div v-if="!editingUser" class="uv-field">
              <label class="uv-field-label">Password</label>
              <input v-model="form.password" class="uv-field-input" type="password" placeholder="Min. 6 characters" />
            </div>
            <div class="uv-field">
              <label class="uv-field-label">Phone Number</label>
              <div class="uv-phone-row">
                <button type="button" class="uv-country-trigger" @click="showCountryDrop = !showCountryDrop">
                  <span class="uv-ctry-flag">{{ phoneCountry.flag }}</span>
                  <span class="uv-ctry-code">+{{ phoneCountry.dialCode }}</span>
                  <svg class="uv-ctry-caret" :class="showCountryDrop && 'uv-ctry-caret--up'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <input :value="phoneLocal" @input="onPhoneLocalInput" class="uv-phone-local" type="tel" placeholder="712 345 678" />
              </div>
              <div v-if="showCountryDrop" class="uv-country-picker">
                <div class="uv-picker-search-wrap">
                  <svg class="uv-picker-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="countrySearch" class="uv-picker-search" placeholder="Search country or code…" />
                </div>
                <div class="uv-country-list">
                  <button v-for="c in filteredCountries" :key="c.code" type="button" :class="['uv-country-opt', c.code === phoneCountry.code && 'uv-country-opt--active']" @click="selectCountry(c)">
                    <span class="uv-c-flag">{{ c.flag }}</span>
                    <span class="uv-c-name">{{ c.name }}</span>
                    <span class="uv-c-dial">+{{ c.dialCode }}</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="!editingUser" class="uv-field">
              <label class="uv-field-label">Initial Balance (TZS)</label>
              <input v-model.number="form.balance" class="uv-field-input" type="number" min="0" step="1" placeholder="0" />
            </div>
            <div class="uv-field">
              <label class="uv-field-label">Clearance Level</label>
              <div class="uv-select-wrap">
                <select v-model.number="form.clearanceLevel" class="uv-field-input">
                  <option v-for="n in 6" :key="n - 1" :value="n - 1">Level {{ n - 1 }}</option>
                </select>
                <svg class="uv-select-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
            <div v-if="editingUser" class="uv-meta-strip">
              <div class="uv-meta-item">
                <span class="uv-meta-key">Registered</span>
                <span class="uv-meta-val">{{ formatDate(editingUser.registrationDate) }}</span>
              </div>
              <div class="uv-meta-item">
                <span class="uv-meta-key">Last Login</span>
                <span class="uv-meta-val">{{ formatDate(editingUser.lastLoginDate) }}</span>
              </div>
              <div class="uv-meta-item">
                <span class="uv-meta-key">User ID</span>
                <span class="uv-meta-val uv-meta-mono">{{ editingUser.id }}</span>
              </div>
            </div>
            <div class="uv-toggles-row">
              <div class="uv-toggle-item">
                <div class="uv-toggle-text">
                  <span class="uv-toggle-label">Active</span>
                  <span class="uv-toggle-sub">User can access the platform</span>
                </div>
                <button :class="['uv-toggle', form.isActive && 'uv-toggle--on']" @click="form.isActive = !form.isActive" />
              </div>
            </div>
            <p v-if="saveError" class="uv-error-msg">{{ saveError }}</p>
            <button
              class="uv-submit-btn"
              :disabled="saving || !form.firstName.trim() || (!editingUser && (form.password.length < 6 || !form.email.trim()))"
              @click="submit"
            >
              {{ saving ? 'Saving…' : editingUser ? 'Save Changes' : 'Add User' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Outstanding Credit modal ── -->
    <Teleport to="body">
      <Transition name="uv-fade">
        <div v-if="showOutstandingModal" class="uv-backdrop" @click.self="showOutstandingModal = false">
          <div class="uv-out-modal">

            <div class="uv-bm-header">
              <div>
                <span class="uv-bm-title">Outstanding Credit</span>
                <p class="uv-out-sub">{{ usersWithCredit.length }} user{{ usersWithCredit.length !== 1 ? 's' : '' }} with unpaid balance</p>
              </div>
              <button class="uv-close-btn" @click="showOutstandingModal = false">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Total strip -->
            <div class="uv-out-total">
              <span class="uv-out-total-label">Total Outstanding</span>
              <span class="uv-out-total-val">{{ totalOutstanding > 0 ? formatBalance(totalOutstanding) : '—' }}</span>
            </div>

            <!-- Empty -->
            <div v-if="usersWithCredit.length === 0" class="uv-out-empty">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--emerald)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <p class="uv-out-empty-title">All settled</p>
              <p class="uv-out-empty-sub">No outstanding credit at the moment.</p>
            </div>

            <!-- List -->
            <div v-else class="uv-out-list">
              <div v-for="u in usersWithCredit" :key="u.id" class="uv-out-row">
                <div class="uv-avatar" :style="avatarBg(u)">
                  <img v-if="u.profileImage" :src="u.profileImage" class="uv-avatar-img" @error="e => e.target.style.display = 'none'" />
                  <span class="uv-avatar-letters">{{ initials(u) }}</span>
                </div>
                <div class="uv-out-user">
                  <span class="uv-out-name">{{ fullName(u) }}</span>
                  <span class="uv-out-email">{{ u.email || u.phoneNumber || '—' }}</span>
                </div>
                <span class="uv-out-amount">{{ formatBalance(u.outstandingCredit) }}</span>
                <button
                  class="uv-out-pay-btn"
                  :disabled="markingPaid === u.id"
                  @click="markCreditPaid(u)"
                >{{ markingPaid === u.id ? '…' : 'Mark Paid' }}</button>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { db, firebaseApp } from '../firebase'
import {
  collection, getDocs, setDoc, updateDoc,
  deleteDoc, doc, orderBy, query,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const functions = getFunctions(firebaseApp)

const PAGE_SIZE = 10

function formatBalance(n) {
  if (n == null) return '—'
  return 'TZS ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Users state ────────────────────────────────────────────────────────────
const users        = ref([])
const loading      = ref(true)
const searchQuery  = ref('')
const statusFilter = ref('all')
const currentPage  = ref(1)
const showModal    = ref(false)
const editingUser  = ref(null)
const deletingUser = ref(null)
const deleting     = ref(false)
const saving       = ref(false)
const saveError    = ref('')

// ── Action menu ────────────────────────────────────────────────────────────
const menuUser = ref(null)
const menuPos  = ref({ top: 0, right: 0 })

function openMenu(u, e) {
  if (menuUser.value?.id === u.id) { menuUser.value = null; return }
  const rect = e.currentTarget.getBoundingClientRect()
  menuPos.value = { top: rect.bottom + 6, right: window.innerWidth - rect.right }
  menuUser.value = u
}
function closeMenu() { menuUser.value = null }

const statusFilters = [
  { label: 'All',      value: 'all'      },
  { label: 'Active',   value: 'active'   },
  { label: 'Inactive', value: 'inactive' },
]

// ── Phone picker ───────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'TZ', name: 'Tanzania',       dialCode: '255', flag: '🇹🇿' },
  { code: 'KE', name: 'Kenya',          dialCode: '254', flag: '🇰🇪' },
  { code: 'UG', name: 'Uganda',         dialCode: '256', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda',         dialCode: '250', flag: '🇷🇼' },
  { code: 'BI', name: 'Burundi',        dialCode: '257', flag: '🇧🇮' },
  { code: 'ET', name: 'Ethiopia',       dialCode: '251', flag: '🇪🇹' },
  { code: 'SO', name: 'Somalia',        dialCode: '252', flag: '🇸🇴' },
  { code: 'SS', name: 'South Sudan',    dialCode: '211', flag: '🇸🇸' },
  { code: 'CD', name: 'DR Congo',       dialCode: '243', flag: '🇨🇩' },
  { code: 'ZA', name: 'South Africa',   dialCode: '27',  flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria',        dialCode: '234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana',          dialCode: '233', flag: '🇬🇭' },
  { code: 'EG', name: 'Egypt',          dialCode: '20',  flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco',        dialCode: '212', flag: '🇲🇦' },
  { code: 'AE', name: 'UAE',            dialCode: '971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia',   dialCode: '966', flag: '🇸🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '44',  flag: '🇬🇧' },
  { code: 'US', name: 'United States',  dialCode: '1',   flag: '🇺🇸' },
  { code: 'IN', name: 'India',          dialCode: '91',  flag: '🇮🇳' },
  { code: 'CN', name: 'China',          dialCode: '86',  flag: '🇨🇳' },
  { code: 'FR', name: 'France',         dialCode: '33',  flag: '🇫🇷' },
  { code: 'DE', name: 'Germany',        dialCode: '49',  flag: '🇩🇪' },
  { code: 'IT', name: 'Italy',          dialCode: '39',  flag: '🇮🇹' },
  { code: 'BR', name: 'Brazil',         dialCode: '55',  flag: '🇧🇷' },
  { code: 'CA', name: 'Canada',         dialCode: '1',   flag: '🇨🇦' },
  { code: 'AU', name: 'Australia',      dialCode: '61',  flag: '🇦🇺' },
  { code: 'JP', name: 'Japan',          dialCode: '81',  flag: '🇯🇵' },
]

const phoneCountry    = ref(COUNTRIES[0])
const phoneLocal      = ref('')
const showCountryDrop = ref(false)
const countrySearch   = ref('')

const filteredCountries = computed(() => {
  const q = countrySearch.value.trim().toLowerCase()
  if (!q) return COUNTRIES
  return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dialCode.includes(q))
})

function selectCountry(c) {
  phoneCountry.value    = c
  showCountryDrop.value = false
  countrySearch.value   = ''
}

function onPhoneLocalInput(e) {
  e.target.value   = e.target.value.replace(/[^\d\s\-()]/g, '')
  phoneLocal.value = e.target.value
}

function builtPhone() {
  const digits = phoneLocal.value.replace(/\D/g, '')
  if (!digits) return ''
  return `+${phoneCountry.value.dialCode}${digits}`
}

function parsePhone(stored) {
  phoneCountry.value = COUNTRIES[0]
  phoneLocal.value   = ''
  if (!stored) return
  const clean  = stored.replace(/\s/g, '')
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)
  for (const c of sorted) {
    if (clean.startsWith('+' + c.dialCode)) {
      phoneCountry.value = c
      phoneLocal.value   = clean.slice(c.dialCode.length + 1)
      return
    }
  }
  phoneLocal.value = clean.replace(/^\+/, '')
}

// ── Form ───────────────────────────────────────────────────────────────────
const defaultForm = () => ({ firstName: '', lastName: '', email: '', password: '', balance: 0, isActive: true, clearanceLevel: 0 })
const form = ref(defaultForm())

// ── Computed ───────────────────────────────────────────────────────────────
const activeCount   = computed(() => users.value.filter(u => u.isActive).length)
const inactiveCount = computed(() => users.value.filter(u => !u.isActive).length)

const filtered = computed(() => {
  let list = users.value
  if (statusFilter.value === 'active')   list = list.filter(u => u.isActive)
  if (statusFilter.value === 'inactive') list = list.filter(u => !u.isActive)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(u =>
      (u.searchName  || '').toLowerCase().includes(q) ||
      (u.firstName   || '').toLowerCase().includes(q) ||
      (u.lastName    || '').toLowerCase().includes(q) ||
      (u.email       || '').toLowerCase().includes(q) ||
      (u.phoneNumber || '').toLowerCase().includes(q)
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

watch([searchQuery, statusFilter], () => { currentPage.value = 1 })

// ── Helpers ────────────────────────────────────────────────────────────────
function fullName(obj) {
  return [(obj?.firstName || ''), (obj?.lastName || '')].filter(Boolean).join(' ') || 'Unnamed User'
}
function initials(u) {
  return [u?.firstName, u?.lastName].filter(Boolean).map(s => s.charAt(0).toUpperCase()).join('') || '?'
}

const PALETTE = ['#C9A84C', '#30D158', '#0A84FF', '#FF9F0A', '#BF5AF2', '#FF6961', '#64D2FF']
function avatarBg(u) {
  const color = PALETTE[(u.id || '0').charCodeAt(0) % PALETTE.length]
  return { background: color + '1A', borderColor: color + '55', color }
}

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = val?.toDate ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchUsers() {
  loading.value = true
  try {
    const snap = await getDocs(collection(db, 'users'))
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    all.sort((a, b) => {
      const toMs = v => v ? new Date(v?.toDate?.() ?? v).getTime() : 0
      return toMs(b.registrationDate) - toMs(a.registrationDate)
    })
    users.value = all
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// ── Balance ────────────────────────────────────────────────────────────────
const balanceUser   = ref(null)
const balanceMode   = ref('set')
const balanceInput  = ref(null)
const savingBalance = ref(false)
const balanceError  = ref('')
const balancePaid   = ref(true)

const previewBalance = computed(() => {
  const current = balanceUser.value?.balance ?? 0
  const input   = balanceInput.value ?? 0
  return balanceMode.value === 'set' ? input : current + input
})

const isTopUp = computed(() =>
  !!balanceUser.value && previewBalance.value > (balanceUser.value.balance ?? 0)
)

function openBalanceModal(u) {
  balanceUser.value  = u
  balanceMode.value  = 'add'
  balanceInput.value = null
  balanceError.value = ''
  balancePaid.value  = true
}

async function doAdjustBalance() {
  savingBalance.value = true
  balanceError.value  = ''
  try {
    const newBalance = previewBalance.value
    const adjustBalance = httpsCallable(functions, 'adjustUserBalance')
    const result = await adjustBalance({ userId: balanceUser.value.id, newBalance, paid: balancePaid.value })
    balanceUser.value.balance = newBalance
    if (result.data?.outstandingCredit !== undefined) {
      balanceUser.value.outstandingCredit = result.data.outstandingCredit
    }
    balanceUser.value = null
  } catch {
    balanceError.value = 'Failed to update balance. Try again.'
  } finally {
    savingBalance.value = false
  }
}

// ── Outstanding credit ─────────────────────────────────────────────────────
const showOutstandingModal = ref(false)
const markingPaid          = ref(null)

const totalOutstanding = computed(() =>
  users.value.reduce((sum, u) => sum + (u.outstandingCredit ?? 0), 0)
)

const usersWithCredit = computed(() =>
  users.value
    .filter(u => (u.outstandingCredit ?? 0) > 0)
    .sort((a, b) => (b.outstandingCredit ?? 0) - (a.outstandingCredit ?? 0))
)

async function markCreditPaid(u) {
  markingPaid.value = u.id
  try {
    await updateDoc(doc(db, 'users', u.id), { outstandingCredit: 0 })
    u.outstandingCredit = 0
  } catch (e) {
    console.error('markCreditPaid error:', e)
  } finally {
    markingPaid.value = null
  }
}

// ── Balance history ────────────────────────────────────────────────────────
const historyUser    = ref(null)
const historyRecords = ref([])
const historyLoading = ref(false)
const historyError   = ref('')

const lifetimeTopUps = computed(() =>
  historyRecords.value.filter(r => r.delta > 0).reduce((sum, r) => sum + r.delta, 0)
)

async function openHistoryModal(u) {
  historyUser.value    = u
  historyRecords.value = []
  historyError.value   = ''
  historyLoading.value = true
  try {
    const snap = await getDocs(
      query(collection(db, 'users', u.id, 'balanceHistory'), orderBy('timestamp', 'desc'))
    )
    historyRecords.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('balanceHistory fetch error:', e)
    historyError.value = e?.message || 'Failed to load history.'
  } finally {
    historyLoading.value = false
  }
}

function formatHistoryDate(ts) {
  if (!ts) return '—'
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '—' }
}

// ── Toggle active ──────────────────────────────────────────────────────────
async function toggleActive(u) {
  u.isActive = !u.isActive
  await updateDoc(doc(db, 'users', u.id), { isActive: u.isActive })
}

// ── Create / Update ────────────────────────────────────────────────────────
async function createUser() {
  saving.value    = true
  saveError.value = ''
  const tempApp  = initializeApp(firebaseApp.options, `admin-create-${Date.now()}`)
  const tempAuth = getAuth(tempApp)
  try {
    const { user } = await createUserWithEmailAndPassword(tempAuth, form.value.email.trim(), form.value.password)
    await setDoc(doc(db, 'users', user.uid), {
      firstName:        form.value.firstName.trim(),
      lastName:         form.value.lastName.trim(),
      email:            form.value.email.trim(),
      phoneNumber:      builtPhone(),
      balance:          form.value.balance || 0,
      isActive:         form.value.isActive,
      clearanceLevel:   form.value.clearanceLevel,
      searchName:       `${form.value.firstName} ${form.value.lastName}`.trim().toLowerCase(),
      profileImage:     null,
      registrationDate: new Date().toISOString(),
      lastLoginDate:    null,
    })
    await fetchUsers()
    resetModal()
  } catch (e) {
    const code = e?.code
    if (code === 'auth/email-already-in-use') saveError.value = 'An account with this email already exists.'
    else if (code === 'auth/invalid-email')   saveError.value = 'Invalid email address.'
    else if (code === 'auth/weak-password')   saveError.value = 'Password must be at least 6 characters.'
    else                                      saveError.value = 'Failed to create user. Try again.'
  } finally {
    await tempAuth.signOut().catch(() => {})
    await deleteApp(tempApp).catch(() => {})
    saving.value = false
  }
}

async function saveUser() {
  saving.value    = true
  saveError.value = ''
  try {
    await updateDoc(doc(db, 'users', editingUser.value.id), {
      firstName:      form.value.firstName.trim(),
      lastName:       form.value.lastName.trim(),
      phoneNumber:    builtPhone(),
      isActive:       form.value.isActive,
      clearanceLevel: form.value.clearanceLevel,
      searchName:     `${form.value.firstName} ${form.value.lastName}`.trim().toLowerCase(),
    })
    await fetchUsers()
    resetModal()
  } catch {
    saveError.value = 'Failed to save changes. Try again.'
  } finally {
    saving.value = false
  }
}

function submit() { editingUser.value ? saveUser() : createUser() }

// ── Delete ─────────────────────────────────────────────────────────────────
function confirmDelete(u) { deletingUser.value = u }
async function doDelete() {
  deleting.value = true
  try {
    await deleteDoc(doc(db, 'users', deletingUser.value.id))
    users.value        = users.value.filter(u => u.id !== deletingUser.value.id)
    deletingUser.value = null
  } catch (e) { console.error(e) } finally { deleting.value = false }
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openCreate() {
  editingUser.value = null
  form.value        = defaultForm()
  phoneCountry.value    = COUNTRIES[0]
  phoneLocal.value      = ''
  showCountryDrop.value = false
  countrySearch.value   = ''
  saveError.value   = ''
  showModal.value   = true
}

function openEdit(u) {
  editingUser.value = u
  form.value = { firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', password: '', isActive: u.isActive ?? false, clearanceLevel: u.clearanceLevel ?? 0, balance: 0 }
  parsePhone(u.phoneNumber)
  showCountryDrop.value = false
  countrySearch.value   = ''
  saveError.value = ''
  showModal.value = true
}

function resetModal() {
  showModal.value       = false
  editingUser.value     = null
  form.value            = defaultForm()
  phoneCountry.value    = COUNTRIES[0]
  phoneLocal.value      = ''
  showCountryDrop.value = false
  countrySearch.value   = ''
  saveError.value       = ''
}

function closeModal() { if (saving.value) return; resetModal() }

onMounted(fetchUsers)
</script>

<style scoped>
/* ── Tokens ── */
.uv-root {
  --ink: #f0f0ec;
  --ink-soft: #d8d4cd;
  --ink-muted: #888;
  --ink-dim: #555;
  --line: #242424;
  --line-soft: #1e1e1e;
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
.uv-topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,11,0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3);
}
.uv-topbar-inner {
  max-width: 1200px; margin: 0 auto; padding: 14px 32px;
  display: flex; align-items: center; justify-content: space-between;
}
.uv-page-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 20px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px;
}

/* ── Page shell ── */
.uv-page {
  max-width: 1200px; margin: 0 auto;
  padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 20px;
}

/* ── Stats ── */
.uv-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.uv-stat {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  text-align: left;
}
.uv-stat--credit {
  cursor: pointer; transition: border-color 150ms, background 150ms;
  border: 1px solid rgba(255,159,10,.2);
  background: rgba(255,159,10,.04);
}
.uv-stat--credit:hover { border-color: rgba(255,159,10,.4); background: rgba(255,159,10,.07); }
.uv-stat-div { display: none; }
.uv-stat-num {
  font-size: 32px; font-weight: 700; color: var(--ink);
  letter-spacing: -0.5px; line-height: 1;
}
.uv-stat-num--green  { color: var(--emerald); }
.uv-stat-num--red    { color: #FF453A; }
.uv-stat-num--orange { color: #FF9F0A; font-size: 20px; }
.uv-stat-num--dim    { color: var(--ink-dim); }
.uv-stat-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.6px;
  text-transform: uppercase; color: var(--ink-dim);
}

/* ── Filter bar ── */
.uv-filterbar {
  display: flex; align-items: center; gap: 4px;
  background: #111; border: 1px solid var(--line-strong); border-radius: 14px;
  padding: 8px 8px 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); flex-wrap: wrap;
}
.uv-search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 160px; }
.uv-search-icon { position: absolute; left: 11px; color: var(--ink-dim); pointer-events: none; flex-shrink: 0; }
.uv-search-input {
  width: 100%; padding: 8px 30px 8px 34px; border: none; background: transparent;
  font-size: 13.5px; color: var(--ink); outline: none; font-family: inherit;
}
.uv-search-input::placeholder { color: var(--ink-dim); }
.uv-search-clear {
  position: absolute; right: 6px; background: none; border: none;
  cursor: pointer; color: var(--ink-dim); display: flex; align-items: center; padding: 2px;
}
.uv-search-clear:hover { color: var(--ink-muted); }
.uv-fb-divider { width: 1px; height: 26px; background: var(--line-strong); flex-shrink: 0; margin: 0 4px; }

.uv-status-chips { display: flex; align-items: center; gap: 4px; }
.uv-status-chip {
  padding: 7px 14px; border-radius: 8px; border: none; background: transparent;
  font-size: 13px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: background 130ms, color 130ms;
}
.uv-status-chip:hover { background: var(--paper-soft); color: var(--ink); }
.uv-status-chip--active { background: rgba(240,240,236,0.09); color: var(--ink); font-weight: 600; }

.uv-add-btn {
  display: flex; align-items: center; gap: 7px;
  background: #C9A84C;
  border: none;
  color: #070707; padding: 8px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background 130ms; white-space: nowrap;
}
.uv-add-btn:hover { background: #d4b560; }

/* ── Skeletons ── */
.uv-skeleton-list { display: flex; flex-direction: column; gap: 1px; }
.uv-skeleton {
  height: 58px;
  background: linear-gradient(90deg, #141414 25%, #1a1a1a 50%, #141414 75%);
  background-size: 200% 100%;
  animation: uv-shimmer 1.4s infinite;
}
.uv-skeleton:first-child { border-radius: 14px 14px 0 0; }
.uv-skeleton:last-child  { border-radius: 0 0 14px 14px; }
@keyframes uv-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Empty ── */
.uv-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 20px; border: 1px dashed var(--line-strong); border-radius: 20px;
}
.uv-empty-glyph { font-size: 28px; color: var(--gold); opacity: 0.6; }
.uv-empty-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: var(--ink); margin: 0; }
.uv-empty-sub   { font-size: 13px; color: var(--ink-muted); margin: 0; }

/* ── Table ── */
.uv-table-wrap {
  background: #141414; border: 1px solid #2a2a2a;
  border-radius: 16px; overflow: hidden; overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.uv-table { width: 100%; border-collapse: collapse; min-width: 780px; }
.uv-th {
  padding: 10px 18px; text-align: left;
  font-size: 11px; font-weight: 600; color: var(--ink-dim);
  letter-spacing: 0.8px; text-transform: uppercase;
  border-bottom: 1px solid #2a2a2a; background: #111;
  white-space: nowrap;
}
.uv-th--end { width: 48px; }
.uv-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 120ms; }
.uv-row:last-child { border-bottom: none; }
.uv-row:hover { background: rgba(255,255,255,0.025); }
.uv-row:not(:last-child) .uv-td { border-bottom: none; }
.uv-td { padding: 14px 18px; font-size: 13.5px; color: var(--ink); vertical-align: middle; white-space: nowrap; }
.uv-td--muted { color: var(--ink-muted); font-size: 12px; }
.uv-td--date  { color: var(--ink-muted); font-size: 12px; }

/* User cell */
.uv-cell-user { display: flex; align-items: center; gap: 12px; min-width: 200px; }
.uv-avatar {
  width: 34px; height: 34px; border-radius: 10px; border: 1px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden; position: relative;
}
.uv-avatar-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.uv-avatar-letters { font-size: 12px; font-weight: 700; line-height: 1; }
.uv-user-meta  { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.uv-user-name  { font-size: 13.5px; font-weight: 600; color: var(--ink); max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
.uv-user-email { font-size: 12px; color: var(--ink-muted); max-width: 180px; overflow: hidden; text-overflow: ellipsis; }

/* Status pill */
.uv-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px;
  border: none; background: var(--paper-soft);
  color: var(--ink-dim); font-size: 11px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 150ms; white-space: nowrap;
}
.uv-status-pill--on { background: var(--emerald-soft); color: var(--emerald); }
.uv-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

/* Clearance badge */
.uv-cl-badge {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.5px; min-width: 32px; box-sizing: border-box;
}
.uv-cl-0 { background: rgba(142,142,147,.12); color: var(--ink-muted);  border: 1px solid rgba(142,142,147,.2); }
.uv-cl-1 { background: rgba(10,132,255,.12);  color: #0A84FF; border: 1px solid rgba(10,132,255,.2); }
.uv-cl-2 { background: rgba(201,168,76,.12);  color: var(--gold-text); border: 1px solid var(--gold-border); }
.uv-cl-3 { background: rgba(191,90,242,.12);  color: #BF5AF2; border: 1px solid rgba(191,90,242,.2); }
.uv-cl-4 { background: rgba(255,159,10,.12);  color: #FF9F0A; border: 1px solid rgba(255,159,10,.2); }
.uv-cl-5 { background: rgba(255,69,58,.12);   color: #FF453A; border: 1px solid rgba(255,69,58,.2);  }

/* Balance button */
.uv-balance-btn {
  background: none; border: none; padding: 3px 0;
  font-family: inherit; font-size: 13.5px; font-weight: 600;
  color: var(--gold-text); cursor: pointer;
  border-bottom: 1px dashed var(--gold-border);
  transition: border-color 150ms, color 150ms;
}
.uv-balance-btn:hover { color: #e0bc6e; border-bottom-color: rgba(201,168,76,0.7); }

/* Row actions */
.uv-td--actions { width: 48px; text-align: right; }
.uv-icon-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid var(--line-strong); background: var(--paper-soft);
  color: var(--ink-muted); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: color 150ms, background 150ms, border-color 150ms;
  padding: 0; box-sizing: border-box;
}
.uv-icon-btn:hover { color: var(--ink); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
.uv-icon-btn--menu-open { color: var(--gold-text); background: var(--gold-bg); border-color: var(--gold-border); }

/* Action dropdown */
.uv-action-backdrop {
  position: fixed; inset: 0; z-index: 9998;
}
.uv-action-menu {
  position: fixed; z-index: 9999;
  width: 188px;
  background: #1a1a1a; border: 1px solid #2a2a2a;
  border-radius: 13px; padding: 5px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35);
}
.uv-action-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px 11px; border-radius: 8px; border: none;
  background: transparent; font-size: 13px; font-weight: 500;
  color: var(--ink-muted); cursor: pointer; font-family: inherit;
  text-align: left; transition: background 100ms, color 100ms;
}
.uv-action-item:hover { background: rgba(255,255,255,0.05); color: var(--ink); }
.uv-action-item--events:hover  { color: #0A84FF; background: rgba(10,132,255,.08); }
.uv-action-item--history:hover { color: #BF5AF2; background: rgba(191,90,242,.08); }
.uv-action-item--del:hover     { color: #FF453A; background: rgba(255,69,58,.08); }
.uv-action-sep { height: 1px; background: #2a2a2a; margin: 4px 0; }

.uv-menu-enter-active { transition: opacity 120ms, transform 120ms; }
.uv-menu-leave-active { transition: opacity 100ms; }
.uv-menu-enter-from   { opacity: 0; transform: translateY(-4px) scale(0.97); }
.uv-menu-leave-to     { opacity: 0; }

/* ── Pagination ── */
.uv-pagination {
  display: flex; align-items: center; justify-content: space-between; padding-top: 4px;
}
.uv-pagination-info { font-size: 13px; color: var(--ink-muted); }
.uv-pagination-controls { display: flex; align-items: center; gap: 4px; }
.uv-page-btn {
  min-width: 34px; height: 34px; padding: 0 6px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); border-radius: 8px;
  background: var(--paper-soft); font-size: 13px; font-weight: 500; color: var(--ink-muted);
  cursor: pointer; font-family: inherit; transition: border-color 130ms, color 130ms, background 130ms;
}
.uv-page-btn:hover:not(:disabled):not(.uv-page-btn--active) { border-color: var(--line-strong); color: var(--ink); }
.uv-page-btn--active { background: rgba(240,240,236,0.09); border-color: rgba(240,240,236,0.15); color: var(--ink); font-weight: 700; }
.uv-page-btn--nav { color: var(--ink-dim); }
.uv-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.uv-page-ellipsis { width: 28px; text-align: center; font-size: 13px; color: var(--ink-dim); user-select: none; }

/* ── Backdrop ── */
.uv-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 24px; box-sizing: border-box;
}

/* ── Confirm box ── */
.uv-confirm-box {
  width: 100%; max-width: 360px; background: #161616;
  border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 28px 28px 24px; display: flex; flex-direction: column;
  align-items: center; gap: 12px; text-align: center;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.uv-warn-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(255,69,58,.10); border: 1px solid rgba(255,69,58,.2);
  display: flex; align-items: center; justify-content: center;
}
.uv-warn-icon   { color: #FF453A; }
.uv-confirm-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); margin: 0; }
.uv-confirm-body  { font-size: 13.5px; color: var(--ink-muted); margin: 0; line-height: 1.5; }
.uv-confirm-row   { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
.uv-cancel-btn {
  flex: 1; padding: 8px 16px; border-radius: 9px; border: 1px solid #2a2a2a;
  background: transparent; color: var(--ink-muted); font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: color 150ms, background 150ms;
}
.uv-cancel-btn:hover:not(:disabled) { background: #1e1e1e; color: var(--ink); }
.uv-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.uv-del-btn {
  flex: 1; padding: 8px 18px; border-radius: 9px; border: 1px solid rgba(255,69,58,0.2);
  background: rgba(255,69,58,0.12); color: #FF453A; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 150ms;
}
.uv-del-btn:not(:disabled):hover { opacity: 0.85; }
.uv-del-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Shared modal header ── */
.uv-bm-header { display: flex; align-items: center; justify-content: space-between; }
.uv-bm-title  { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -0.3px; margin: 0; }
.uv-close-btn {
  width: 32px; height: 32px; border-radius: 9px;
  border: 1px solid #2a2a2a; background: transparent; color: var(--ink-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: color 150ms; padding: 0; box-sizing: border-box; flex-shrink: 0;
}
.uv-close-btn:hover { color: var(--ink); }

/* ── Balance modal ── */
.uv-balance-modal {
  width: 100%; max-width: 380px; background: #161616;
  border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 28px 28px 24px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.uv-bal-current {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--gold-bg); border: 1.5px solid var(--gold-border);
  border-radius: 12px; padding: 14px 16px;
}
.uv-bal-current-label { font-size: 12px; color: var(--ink-muted); font-weight: 600; }
.uv-bal-current-val   { font-size: 18px; font-weight: 700; color: var(--gold-text); letter-spacing: -0.5px; }
.uv-bal-mode-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
  background: #161616; border: 1px solid #2a2a2a;
  border-radius: 12px; padding: 4px;
}
.uv-bal-mode-btn {
  padding: 9px 8px; border-radius: 8px; border: none;
  background: transparent; color: var(--ink-muted); font-size: 13.5px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: background 150ms, color 150ms, box-shadow 150ms;
}
.uv-bal-mode-btn:not(.uv-bal-mode-btn--on):hover { color: var(--ink); }
.uv-bal-mode-btn--on {
  background: #2a2a2a; color: var(--ink); font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04);
}
.uv-balance-modal .uv-field-input {
  background: #161616; border: 0.8px solid #2a2a2a;
  border-radius: 10px; padding: 10px 13px;
  font-size: 14px; color: var(--ink); font-family: inherit;
  outline: none; width: 100%; box-sizing: border-box;
  transition: border-color 150ms, box-shadow 150ms;
}
.uv-balance-modal .uv-field-input:focus {
  border-color: rgba(201,168,76,0.5);
  box-shadow: 0 0 0 3px rgba(201,168,76,0.10);
}
.uv-balance-modal .uv-field-input::placeholder { color: var(--ink-dim); }
.uv-bal-preview {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #161616;
  border: 0.8px solid #2a2a2a; border-radius: 12px;
}
.uv-bal-preview-label    { font-size: 12px; color: var(--ink-muted); font-weight: 500; }
.uv-bal-preview-val      { font-size: 16px; font-weight: 700; color: var(--emerald); }
.uv-bal-preview-val--neg { color: #FF453A; }

/* ── Edit modal ── */
.uv-edit-modal {
  width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
  background: #161616; border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 28px 28px 24px; display: flex; flex-direction: column; gap: 18px; box-sizing: border-box;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
}
.uv-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.uv-field       { display: flex; flex-direction: column; gap: 7px; }
.uv-field-label {
  font-size: 12px; font-weight: 600; color: var(--ink-muted);
}
.uv-field-input {
  background: #161616; border: 0.8px solid #2a2a2a; border-radius: 10px;
  padding: 10px 13px; font-size: 14px; color: var(--ink); font-family: inherit;
  outline: none; transition: border-color 150ms, box-shadow 150ms; box-sizing: border-box; width: 100%; appearance: none;
  color-scheme: dark;
}
.uv-field-input::placeholder { color: var(--ink-dim); }
.uv-field-input:focus { border-color: rgba(201,168,76,0.5); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); outline: none; }
.uv-select-wrap { position: relative; }
.uv-select-wrap .uv-field-input { padding-right: 36px; cursor: pointer; }
.uv-select-caret {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  color: var(--ink-muted); pointer-events: none;
}

/* Phone picker */
.uv-phone-row { display: flex; gap: 8px; }
.uv-country-trigger {
  display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 44px;
  border-radius: 10px; border: 0.8px solid #2a2a2a; background: #161616;
  color: var(--ink); font-family: inherit; font-size: 13px; font-weight: 600;
  cursor: pointer; flex-shrink: 0; transition: border-color 150ms;
}
.uv-country-trigger:hover { border-color: rgba(201,168,76,.5); }
.uv-ctry-flag { font-size: 18px; line-height: 1; display: flex; align-items: center; }
.uv-ctry-code { font-size: 13px; color: var(--ink-muted); }
.uv-ctry-caret { color: var(--ink-muted); transition: transform 200ms; flex-shrink: 0; }
.uv-ctry-caret--up { transform: rotate(180deg); }
.uv-phone-local {
  flex: 1; background: #161616; border: 0.8px solid #2a2a2a;
  border-radius: 10px; padding: 10px 13px; font-size: 14px; color: var(--ink);
  font-family: inherit; outline: none; transition: border-color 150ms, box-shadow 150ms; box-sizing: border-box;
}
.uv-phone-local::placeholder { color: var(--ink-dim); }
.uv-phone-local:focus { border-color: rgba(201,168,76,.5); box-shadow: 0 0 0 3px rgba(201,168,76,0.10); outline: none; }
.uv-country-picker { margin-top: 8px; background: #161616; border: 0.8px solid #2a2a2a; border-radius: 14px; overflow: hidden; }
.uv-picker-search-wrap { position: relative; display: flex; align-items: center; border-bottom: 0.8px solid #2a2a2a; }
.uv-picker-search-icon { position: absolute; left: 12px; color: var(--ink-dim); pointer-events: none; }
.uv-picker-search {
  width: 100%; padding: 10px 12px 10px 34px; background: transparent;
  border: none; outline: none; font-size: 13px; color: var(--ink); font-family: inherit; box-sizing: border-box;
}
.uv-picker-search::placeholder { color: var(--ink-dim); }
.uv-country-list { max-height: 200px; overflow-y: auto; }
.uv-country-opt {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; border: none; background: transparent; color: var(--ink-muted);
  font-size: 13px; font-family: inherit; cursor: pointer; text-align: left; transition: background 100ms;
}
.uv-country-opt:hover { background: #1e1e1e; }
.uv-country-opt--active { background: rgba(201,168,76,0.12); color: var(--gold-text); }
.uv-c-flag { font-size: 16px; line-height: 1; flex-shrink: 0; }
.uv-c-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uv-c-dial { font-size: 12px; color: var(--ink-dim); flex-shrink: 0; }

/* Meta strip */
.uv-meta-strip { background: #161616; border: 0.8px solid #2a2a2a; border-radius: 12px; overflow: hidden; }
.uv-meta-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; gap: 12px; }
.uv-meta-item + .uv-meta-item { border-top: 0.8px solid #2a2a2a; }
.uv-meta-key  { font-size: 12px; font-weight: 600; color: var(--ink-muted); flex-shrink: 0; }
.uv-meta-val  { font-size: 12px; color: var(--ink-muted); text-align: right; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.uv-meta-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; letter-spacing: 0.3px; }

/* Toggle */
.uv-toggles-row { border: 0.8px solid #2a2a2a; border-radius: 14px; }
.uv-toggle-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; gap: 16px; }
.uv-toggle-text  { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.uv-toggle-label { font-size: 14px; font-weight: 500; color: var(--ink); }
.uv-toggle-sub   { font-size: 12px; color: var(--ink-muted); }
.uv-toggle {
  width: 52px; height: 30px; border-radius: 15px;
  border: 1.5px solid #404040;
  background: #2a2a2a;
  cursor: pointer; position: relative;
  transition: background 220ms, border-color 220ms;
  flex-shrink: 0; padding: 0; box-sizing: border-box;
}
.uv-toggle::after {
  content: ''; position: absolute;
  top: 3px; left: 3px;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: #666;
  box-shadow: 0 1px 4px rgba(0,0,0,0.5);
  transition: transform 220ms cubic-bezier(.4,0,.2,1), background 220ms;
}
.uv-toggle--on { background: var(--gold-text); border-color: var(--gold-text); }
.uv-toggle--on::after { transform: translateX(22px); background: #fff; }

/* Error / Submit */
.uv-error-msg {
  font-size: 13px; color: #FF453A; margin: 0;
  padding: 12px 16px; background: rgba(255,59,48,0.07);
  border-radius: 10px; border: 0.8px solid rgba(255,59,48,0.2);
}
.uv-submit-btn {
  width: 100%; padding: 8px 18px; border-radius: 9px;
  border: none;
  background: #C9A84C;
  color: #070707; font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: background 130ms; box-sizing: border-box;
}
.uv-submit-btn:disabled             { opacity: 0.4; cursor: not-allowed; }
.uv-submit-btn:not(:disabled):hover { background: #d4b560; }


/* ── History modal ── */
.uv-history-modal {
  width: 100%; max-width: 460px; max-height: 88vh;
  background: #161616;
  border: 1px solid #2a2a2a;
  border-top: 3px solid var(--gold-text);
  border-radius: 16px;
  display: flex; flex-direction: column; gap: 0; box-sizing: border-box;
  box-shadow: 4px 8px 0 rgba(0,0,0,0.4); overflow: hidden;
}
.uv-history-modal > .uv-bm-header {
  padding: 20px 24px;
  background: linear-gradient(180deg, rgba(201,168,76,0.07) 0%, transparent 100%);
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
}
.uv-history-modal > .uv-hist-stats     { margin: 16px 20px 16px; }
.uv-history-modal > .uv-hist-skeletons { padding: 0 20px 20px; }
.uv-history-modal > .uv-hist-empty     { margin: 0 20px 20px; }
.uv-history-modal > .uv-hist-list      { padding: 0 20px 20px; }

.uv-hist-header-left { display: flex; flex-direction: column; gap: 2px; }
.uv-hist-name { font-size: 13px; color: var(--ink-muted); font-weight: 500; }

/* Stats strip */
.uv-hist-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
}
.uv-hist-stat {
  background: #111; border: 1px solid #242424; border-radius: 12px;
  padding: 12px 14px; display: flex; flex-direction: column; gap: 5px;
}
.uv-hist-stat-label {
  font-size: 10px; font-weight: 600; color: var(--ink-dim);
  text-transform: uppercase; letter-spacing: 0.8px;
}
.uv-hist-stat-val {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 17px; font-weight: 400; color: var(--ink); letter-spacing: -0.4px; line-height: 1.2;
}
.uv-hist-stat-val--gold { color: var(--gold-text); }

/* Skeletons */
.uv-hist-skeletons { display: flex; flex-direction: column; gap: 8px; }
.uv-hist-skel {
  height: 60px; border-radius: 12px;
  background: linear-gradient(90deg, #141414 25%, #1a1a1a 50%, #141414 75%);
  background-size: 200% 100%; animation: uv-shimmer 1.4s infinite;
}

/* Empty */
.uv-hist-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 40px 20px; border: 1px dashed rgba(201,168,76,0.2); border-radius: 14px;
  background: rgba(201,168,76,0.04);
}
.uv-hist-empty-text { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0; }
.uv-hist-empty-sub  { font-size: 12px; color: var(--ink-muted); margin: 0; text-align: center; }

/* Transaction list */
.uv-hist-list { display: flex; flex-direction: column; gap: 6px; overflow-y: auto; padding-bottom: 4px; }

.uv-txn {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 14px; border-radius: 12px;
  border: 1px solid transparent; background: #111;
  transition: border-color 150ms, background 150ms;
}
.uv-txn--cr { border-color: rgba(48,209,88,.14); }
.uv-txn--cr:hover { border-color: rgba(48,209,88,.30); background: rgba(48,209,88,.025); }
.uv-txn--dr { border-color: rgba(255,69,58,.12); }
.uv-txn--dr:hover { border-color: rgba(255,69,58,.28); background: rgba(255,69,58,.025); }

.uv-txn-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.uv-txn--cr .uv-txn-icon { background: rgba(48,209,88,.12); color: var(--emerald); }
.uv-txn--dr .uv-txn-icon { background: rgba(255,69,58,.10); color: #FF453A; }

.uv-txn-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.uv-txn-top  { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.uv-txn-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.uv-txn-left { display: flex; flex-direction: column; gap: 2px; }

.uv-txn-amount { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; line-height: 1.2; }
.uv-txn--cr .uv-txn-amount { color: var(--emerald); }
.uv-txn--dr .uv-txn-amount { color: #FF453A; }

.uv-txn-type {
  font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--ink-dim);
}
.uv-txn-date  { font-size: 11.5px; color: var(--ink-dim); white-space: nowrap; flex-shrink: 0; }
.uv-txn-after { font-size: 12px; color: var(--ink-muted); }
.uv-txn-after strong { color: var(--ink-soft); font-weight: 600; }
.uv-txn-by    { font-size: 10.5px; color: var(--ink-dim); font-family: 'SF Mono', 'Fira Code', monospace; }

/* ── Received toggle row (balance modal) ── */
.uv-bal-paid-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 14px; background: #111; border: 0.8px solid #2a2a2a; border-radius: 12px;
}
.uv-bal-paid-text  { display: flex; flex-direction: column; gap: 2px; }
.uv-bal-paid-label { font-size: 13.5px; font-weight: 500; color: var(--ink); }
.uv-bal-paid-sub   { font-size: 11.5px; color: var(--ink-muted); }

/* ── Paid / Credit badge (history) ── */
.uv-txn-foot-right { display: flex; align-items: center; gap: 8px; }
.uv-txn-paid-badge {
  font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
  text-transform: uppercase; padding: 2px 8px; border-radius: 20px;
}
.uv-txn-paid-badge--yes { background: rgba(48,209,88,.10); color: var(--emerald); }
.uv-txn-paid-badge--no  { background: rgba(255,159,10,.12); color: #FF9F0A; }

/* ── Outstanding Credit modal ── */
.uv-out-modal {
  width: 100%; max-width: 480px; max-height: 88vh;
  background: #161616; border: 1px solid #2a2a2a;
  border-top: 3px solid #FF9F0A;
  border-radius: 16px; padding: 24px 24px 20px;
  display: flex; flex-direction: column; gap: 16px;
  box-sizing: border-box; box-shadow: 4px 8px 0 rgba(0,0,0,0.4);
  overflow: hidden;
}
.uv-out-sub { font-size: 12.5px; color: var(--ink-muted); margin: 3px 0 0; }

.uv-out-total {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,159,10,.07); border: 1px solid rgba(255,159,10,.25);
  border-radius: 12px; padding: 14px 16px;
}
.uv-out-total-label { font-size: 12px; font-weight: 600; color: rgba(255,159,10,.7); text-transform: uppercase; letter-spacing: 0.6px; }
.uv-out-total-val   { font-size: 20px; font-weight: 700; color: #FF9F0A; letter-spacing: -0.5px; }

.uv-out-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 36px 20px; border: 1px dashed rgba(48,209,88,.2); border-radius: 14px;
  background: rgba(48,209,88,.03);
}
.uv-out-empty-title { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0; }
.uv-out-empty-sub   { font-size: 12px; color: var(--ink-muted); margin: 0; }

.uv-out-list { display: flex; flex-direction: column; gap: 6px; overflow-y: auto; }
.uv-out-row  {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  background: #111; border: 1px solid #242424;
}
.uv-out-user  { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.uv-out-name  { font-size: 13px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uv-out-email { font-size: 11.5px; color: var(--ink-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uv-out-amount {
  font-size: 14px; font-weight: 700; color: #FF9F0A;
  letter-spacing: -0.3px; flex-shrink: 0;
}
.uv-out-pay-btn {
  padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(48,209,88,.25);
  background: rgba(48,209,88,.08); color: var(--emerald);
  font-size: 12px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: opacity 150ms; white-space: nowrap; flex-shrink: 0;
}
.uv-out-pay-btn:hover:not(:disabled) { opacity: 0.8; }
.uv-out-pay-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Transitions ── */
.uv-fade-enter-active, .uv-fade-leave-active { transition: opacity 180ms; }
.uv-fade-enter-from,   .uv-fade-leave-to     { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .uv-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 860px) {
  .uv-page { padding: 20px 20px 40px; }
  .uv-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .uv-topbar-inner { padding: 12px 16px; }
  .uv-admin-pill   { display: none; }
  .uv-page         { padding: 16px 16px 32px; }
}
</style>
