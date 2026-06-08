<template>
  <div class="el-root">

    <!-- ── Sidebar ── -->
    <aside class="el-sidebar">

      <!-- Brand -->
      <div class="el-brand" @click="$router.push('/')">
        <span class="el-brand-glyph">✦</span>
        <span class="el-brand-name">Haflaway</span>
      </div>

      <!-- Event identity -->
      <div class="el-event-block">
        <div class="el-event-thumb">
          <img v-if="event?.eventThumbnail" :src="event.eventThumbnail" :alt="event.title" />
          <div v-else class="el-event-thumb-ph">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DCDCE0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="3"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
        </div>
        <div class="el-event-info">
          <p class="el-event-name">{{ event?.title ?? '…' }}</p>
          <p class="el-event-type">{{ event?.categoryId ?? 'Event' }}</p>
        </div>
      </div>

      <!-- Back link -->
      <button class="el-back-btn" @click="goAllEvents">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        All Events
      </button>

      <!-- Nav -->
      <nav class="el-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="resolvedTo(item.to)"
          class="el-nav-item"
          active-class="el-nav-item--active"
        >
          <span class="el-nav-icon" v-html="item.icon" />
          <span class="el-nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- ── Main ── -->
    <div class="el-main">

      <!-- Topbar -->
      <header class="el-topbar">
        <div class="el-topbar-left">
          <div class="el-tb-brand" @click="$router.push('/')">
            <span class="el-tb-glyph">✦</span>
            <span class="el-tb-name">Haflaway</span>
          </div>
          <span class="el-sep">/</span>
          <span class="el-crumb" @click="$router.push('/my-events')">My Events</span>
          <span class="el-sep">/</span>
          <span class="el-crumb el-crumb--event" @click="$router.push(`/event/${eventId}/overview`)">{{ event?.title ?? '…' }}</span>
          <span class="el-sep">/</span>
          <span class="el-crumb el-crumb--page">{{ route.meta.title }}</span>
        </div>
        <div class="el-topbar-right">
          <div class="el-status-pill" :class="`el-status-pill--${eventStatus}`">
            <span class="el-status-dot" />
            {{ statusLabel }}
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="el-content">
        <RouterView :event="event" :eventId="eventId" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const eventId = computed(() => route.params.eventId)
const event = ref(null)

const navItems = [
  {
    label: 'Overview',
    to: 'overview',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>`,
  },
  {
    label: 'Attendees',
    to: 'attendees',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
  },
  {
    label: 'Check-ins',
    to: 'checkins',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,
  },
  {
    label: 'Cards',
    to: 'cards',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>`,
  },
  {
    label: 'Messages',
    to: 'messages',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,
  },
  {
    label: 'Gallery',
    to: 'gallery',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>`,
  },
  {
    label: 'Gifts of Love',
    to: 'zawadi',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>`,
  },
  {
    label: 'Payments',
    to: 'payments',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,
  },
  {
    label: 'Team',
    to: 'team',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
    </svg>`,
  },
  {
    label: 'Settings',
    to: 'settings',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`,
  },
]

function resolvedTo(segment) {
  return `/event/${eventId.value}/${segment}`
}

function goAllEvents() {
  const back = window.history.state?.back ?? ''
  if (back && String(back).startsWith('/my-events')) {
    router.back()
  } else {
    router.push('/my-events')
  }
}

const eventStatus = computed(() => {
  if (!event.value?.eventDate) return 'upcoming'
  const now = new Date()
  const d = event.value.eventDate.toDate ? event.value.eventDate.toDate() : new Date(event.value.eventDate)
  const end = event.value.endDate
    ? (event.value.endDate.toDate ? event.value.endDate.toDate() : new Date(event.value.endDate))
    : new Date(d.getTime() + 86400000)
  if (now < d) return 'upcoming'
  if (now <= end) return 'ongoing'
  return 'completed'
})

const statusLabel = computed(() => ({
  upcoming: 'Upcoming',
  ongoing: 'Live',
  completed: 'Completed',
}[eventStatus.value]))

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, 'events', eventId.value))
    if (snap.exists()) event.value = { id: snap.id, ...snap.data() }
  } catch (e) {
    console.error('Failed to load event', e)
  }
})
</script>

<style scoped>
/* ── Tokens ── */
.el-root {
  --ink: #e2e8f0;
  --ink-soft: #c8d4e0;
  --ink-muted: #8892a4;
  --ink-dim: #4f617a;
  --line: #1e2d44;
  --line-soft: #111827;
  --line-strong: #2a3a52;
  --paper-soft: #111827;
  --gold: #C9A84C;
  --emerald: #34d399;
  --emerald-soft: rgba(52,211,153,0.12);

  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #0a0e1c;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--ink);
}

/* ── Sidebar ── */
.el-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #111827;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  padding: 0 12px 20px;
  z-index: 10;
  overflow-y: auto;
}

/* Brand */
.el-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 8px 16px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 12px;
  cursor: pointer;
  flex-shrink: 0;
}
.el-brand-glyph {
  font-size: 12px;
  color: var(--gold);
  line-height: 1;
}
.el-brand-name {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 17px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.2px;
}

/* Event identity */
.el-event-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px 12px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 10px;
}
.el-event-thumb {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--paper-soft);
  border: 1px solid var(--line);
}
.el-event-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.el-event-thumb-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-event-info { min-width: 0; }
.el-event-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-event-type {
  font-size: 10.5px;
  color: var(--ink-dim);
  margin: 2px 0 0;
  text-transform: capitalize;
}

/* Back button */
.el-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--ink-muted);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: color 130ms, background 130ms;
  font-family: inherit;
}
.el-back-btn:hover { color: var(--ink); background: var(--paper-soft); }

/* Nav */
.el-nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.el-nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--ink-muted);
  font-size: 13px;
  font-weight: 500;
  transition: background 130ms, color 130ms;
}
.el-nav-item:hover {
  background: var(--paper-soft);
  color: var(--ink);
}
.el-nav-item--active {
  background: rgba(226,232,240,0.10);
  color: #e2e8f0;
  font-weight: 600;
  border: 1px solid rgba(226,232,240,0.12);
}
.el-nav-item--active .el-nav-icon { opacity: 1; }
.el-nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.7;
}
.el-nav-item--active .el-nav-icon { opacity: 1; }

/* ── Main ── */
.el-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* Topbar */
.el-topbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(10,14,28,0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--line);
}
.el-topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.el-tb-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  flex-shrink: 0;
}
.el-tb-glyph { font-size: 11px; color: var(--gold); }
.el-tb-name {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 17px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.2px;
}
.el-sep {
  font-size: 15px;
  color: var(--line-strong);
  font-weight: 300;
  flex-shrink: 0;
}
.el-crumb {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-muted);
  cursor: pointer;
  transition: color 130ms;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-crumb:hover { color: var(--ink); }
.el-crumb--event { max-width: 160px; }
.el-crumb--page {
  font-weight: 600;
  color: var(--ink);
  cursor: default;
}
.el-crumb--page:hover { color: var(--ink); }
.el-topbar-right { flex-shrink: 0; }

/* Status pill */
.el-status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  letter-spacing: 0.1px;
}
.el-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.el-status-pill--upcoming {
  background: var(--paper-soft);
  color: var(--ink-muted);
}
.el-status-pill--upcoming .el-status-dot { background: var(--ink-dim); }
.el-status-pill--ongoing {
  background: rgba(201,168,76,0.15);
  color: #C9A84C;
}
.el-status-pill--ongoing .el-status-dot {
  background: var(--gold);
  animation: pulse-dot 1.6s ease-in-out infinite;
}
.el-status-pill--completed {
  background: var(--paper-soft);
  color: var(--ink-dim);
}
.el-status-pill--completed .el-status-dot { background: var(--ink-dim); }
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}

/* Content */
.el-content {
  flex: 1;
  overflow-y: auto;
  background: #0a0e1c;
}
</style>
