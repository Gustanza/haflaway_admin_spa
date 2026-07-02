<template>
  <div class="cs-root">
    <div class="cs-card">
      <div class="cs-icon-wrap">
        <span v-html="icon" />
      </div>
      <h2 class="cs-title">{{ title }}</h2>
      <p class="cs-sub">This section is coming soon. We're building it out.</p>
      <button class="cs-back-btn" @click="$router.push(`/event/${route.params.eventId}/overview`)">
        ← Back to Overview
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const sectionMeta = {
  attendees: {
    title: 'Attendees',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
  },
  checkins: {
    title: 'Check-ins',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,
  },
  cards: {
    title: 'Cards',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B8924D" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>`,
  },
  messages: {
    title: 'Messages',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,
  },
  gallery: {
    title: 'Gallery',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#AF52DE" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>`,
  },
  zawadi: {
    title: 'Zawadi',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>`,
  },
  payments: {
    title: 'Payments',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B8924D" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,
  },
  team: {
    title: 'Team',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
    </svg>`,
  },
  settings: {
    title: 'Event Settings',
    icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f617a" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`,
  },
}

const section = computed(() => route.path.split('/').pop())
const meta = computed(() => sectionMeta[section.value] ?? { title: 'Coming Soon', icon: '' })
const title = computed(() => meta.value.title)
const icon = computed(() => meta.value.icon)
</script>

<style scoped>
.cs-root {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 54px);
  padding: 40px;
}
.cs-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  background: #111827;
  border: 1px solid #1e2d44;
  border-radius: 20px;
  padding: 48px 56px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  text-align: center;
  max-width: 380px;
}
.cs-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #0d1326;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.cs-title {
  font-size: 20px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}
.cs-sub {
  font-size: 14px;
  color: #8892a4;
  margin: 0;
  line-height: 1.5;
}
.cs-back-btn {
  margin-top: 8px;
  background: none;
  border: 1px solid #2a3a52;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  color: #C9A84C;
  cursor: pointer;
  transition: background 130ms;
}
.cs-back-btn:hover { background: #1a2236; }
</style>