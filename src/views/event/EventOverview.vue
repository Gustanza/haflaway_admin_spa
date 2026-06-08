<template>
  <div class="eo-root">

    <!-- ══ KPI row ══ -->
    <div class="eo-kpi-row">

      <!-- Guests -->
      <div class="eo-kpi">
        <div class="eo-kpi-top">
          <span class="eo-kpi-lbl">Guests</span>
          <div class="eo-kpi-ic" style="background:rgba(0,122,255,0.08);color:#007AFF">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        <div class="eo-kpi-num">{{ stats.attendees }}</div>
        <div class="eo-kpi-seg-bar">
          <div class="eo-seg eo-seg--confirmed" :style="{ flex: rsvp.confirmed || 0.01 }" />
          <div class="eo-seg eo-seg--pending"   :style="{ flex: rsvp.pending   || 0.01 }" />
          <div class="eo-seg eo-seg--declined"  :style="{ flex: rsvp.declined  || 0.01 }" />
        </div>
        <div class="eo-kpi-sub">
          <span class="eo-dot eo-dot--confirmed" />{{ rsvp.confirmed }} confirmed
        </div>
      </div>

      <!-- Check-ins -->
      <div class="eo-kpi">
        <div class="eo-kpi-top">
          <span class="eo-kpi-lbl">Check-ins</span>
          <div class="eo-kpi-ic" style="background:rgba(52,199,89,0.08);color:#34C759">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <div class="eo-kpi-num">{{ stats.checkins }}</div>
        <div class="eo-kpi-bar-track">
          <div class="eo-kpi-bar-fill" style="background:#34C759" :style="{ width: checkinRate + '%' }" />
        </div>
        <div class="eo-kpi-sub">{{ checkinRate }}% arrived</div>
      </div>

      <!-- Contributions -->
      <div class="eo-kpi">
        <div class="eo-kpi-top">
          <span class="eo-kpi-lbl">Contributions</span>
          <div class="eo-kpi-ic" style="background:rgba(184,146,77,0.08);color:#B8924D">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        <div class="eo-kpi-num eo-kpi-num--sm">{{ formatMoney(stats.totalContributions) }}</div>
        <div class="eo-kpi-bar-track">
          <div class="eo-kpi-bar-fill" style="background:#B8924D" :style="{ width: progressPct + '%' }" />
        </div>
        <div class="eo-kpi-sub">{{ progressPct }}% of goal</div>
      </div>

      <!-- Team -->
      <div class="eo-kpi">
        <div class="eo-kpi-top">
          <span class="eo-kpi-lbl">Team</span>
          <div class="eo-kpi-ic" style="background:rgba(175,82,222,0.08);color:#AF52DE">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          </div>
        </div>
        <div class="eo-kpi-num">{{ stats.admins }}</div>
        <div class="eo-kpi-sub">{{ stats.admins === 1 ? 'admin' : 'admins & scanners' }}</div>
        <button class="eo-kpi-cta" @click="$router.push(`/event/${id}/team`)">Manage team →</button>
      </div>

    </div>

    <!-- ══ Mid row ══ -->
    <div class="eo-mid-row">

      <!-- Contribution goal arc -->
      <div class="eo-panel eo-panel--goal">
        <div class="eo-panel-hd">
          <span class="eo-panel-title">Contribution Goal</span>
          <span class="eo-panel-mono">{{ formatMoney(stats.totalContributions) }} / {{ formatMoney(event?.contributionGoal ?? 0) }}</span>
        </div>
        <div class="eo-goal-body">
          <div class="eo-arc-wrap">
            <svg viewBox="0 0 120 120" class="eo-arc-svg">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#1e2d44" stroke-width="11" />
              <circle cx="60" cy="60" r="48" fill="none"
                stroke="#C9A84C" stroke-width="11" stroke-linecap="round"
                :stroke-dasharray="arcC" :stroke-dashoffset="arcOffset"
                transform="rotate(-90 60 60)"
                style="transition: stroke-dashoffset 800ms cubic-bezier(.4,0,.2,1)"
              />
              <text x="60" y="56" text-anchor="middle" font-family="'Instrument Serif',Georgia,serif" font-size="20" fill="#e2e8f0">{{ progressPct }}%</text>
              <text x="60" y="70" text-anchor="middle" font-family="Inter,sans-serif" font-size="8.5" fill="#4f617a" letter-spacing="0.5">REACHED</text>
            </svg>
          </div>
          <div class="eo-goal-stats">
            <div class="eo-gstat">
              <span class="eo-gstat-lbl">Goal</span>
              <span class="eo-gstat-val">{{ formatMoney(event?.contributionGoal ?? 0) }}</span>
            </div>
            <div class="eo-gstat-divider" />
            <div class="eo-gstat">
              <span class="eo-gstat-lbl">Collected</span>
              <span class="eo-gstat-val eo-gstat-val--gold">{{ formatMoney(stats.totalContributions) }}</span>
            </div>
            <div class="eo-gstat-divider" />
            <div class="eo-gstat">
              <span class="eo-gstat-lbl">Pledged</span>
              <span class="eo-gstat-val">{{ formatMoney(stats.totalPledged) }}</span>
            </div>
            <div class="eo-gstat-divider" />
            <div class="eo-gstat">
              <span class="eo-gstat-lbl">Outstanding</span>
              <span class="eo-gstat-val">{{ formatMoney(Math.max(0, stats.totalPledged - stats.totalContributions)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Guest response -->
      <div class="eo-panel eo-panel--rsvp">
        <div class="eo-panel-hd">
          <span class="eo-panel-title">Guest Response</span>
          <span class="eo-panel-mono">{{ stats.attendees }} total</span>
        </div>
        <div class="eo-rsvp-list">
          <div class="eo-rsvp-row">
            <span class="eo-dot eo-dot--confirmed" />
            <span class="eo-rsvp-lbl">Confirmed</span>
            <div class="eo-rsvp-track"><div class="eo-rsvp-fill" style="background:#34C759" :style="{ width: rsvpPct(rsvp.confirmed) + '%' }" /></div>
            <span class="eo-rsvp-n">{{ rsvp.confirmed }}</span>
          </div>
          <div class="eo-rsvp-row">
            <span class="eo-dot eo-dot--pending" />
            <span class="eo-rsvp-lbl">Pending</span>
            <div class="eo-rsvp-track"><div class="eo-rsvp-fill" style="background:#4f617a" :style="{ width: rsvpPct(rsvp.pending) + '%' }" /></div>
            <span class="eo-rsvp-n">{{ rsvp.pending }}</span>
          </div>
          <div class="eo-rsvp-row">
            <span class="eo-dot eo-dot--declined" />
            <span class="eo-rsvp-lbl">Declined</span>
            <div class="eo-rsvp-track"><div class="eo-rsvp-fill" style="background:#FF3B30" :style="{ width: rsvpPct(rsvp.declined) + '%' }" /></div>
            <span class="eo-rsvp-n">{{ rsvp.declined }}</span>
          </div>
          <div class="eo-rsvp-divider" />
          <div class="eo-rsvp-row">
            <span class="eo-dot eo-dot--checkin" />
            <span class="eo-rsvp-lbl">Checked in</span>
            <div class="eo-rsvp-track"><div class="eo-rsvp-fill" style="background:#007AFF" :style="{ width: checkinRate + '%' }" /></div>
            <span class="eo-rsvp-n">{{ stats.checkins }}</span>
          </div>
        </div>

        <!-- Mini stacked bar -->
        <div class="eo-stack-bar" v-if="stats.attendees">
          <div class="eo-stack-seg" style="background:#34C759" :style="{ flex: rsvp.confirmed || 0 }" />
          <div class="eo-stack-seg" style="background:#E5E5EA" :style="{ flex: rsvp.pending  || 0 }" />
          <div class="eo-stack-seg" style="background:#FF3B30" :style="{ flex: rsvp.declined || 0 }" />
        </div>
      </div>

    </div>

    <!-- ══ Quick navigate ══ -->
    <div class="eo-nav-hd">
      <span class="eo-nav-title">Quick Navigate</span>
      <span class="eo-nav-line" />
    </div>
    <div class="eo-nav-grid">
      <button v-for="a in quickActions" :key="a.label" class="eo-nav-card" @click="$router.push(a.to)">
        <div class="eo-nav-ic" :style="{ background: a.bg }">
          <span v-html="a.icon" />
        </div>
        <div class="eo-nav-info">
          <span class="eo-nav-lbl">{{ a.label }}</span>
          <span class="eo-nav-desc">{{ a.desc }}</span>
        </div>
        <svg class="eo-nav-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../../firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

const props = defineProps({ event: Object, eventId: String })
const route  = useRoute()
const router = useRouter()
const id = computed(() => props.eventId ?? route.params.eventId)

const stats = ref({ attendees: 0, checkins: 0, totalContributions: 0, totalPledged: 0, admins: 0 })
const rsvp  = ref({ confirmed: 0, pending: 0, declined: 0 })

// ── Computed ──────────────────────────────────────────────────────────────────
const checkinRate = computed(() => {
  if (!stats.value.attendees) return 0
  return Math.min(100, Math.round((stats.value.checkins / stats.value.attendees) * 100))
})

const progressPct = computed(() => {
  const goal = props.event?.contributionGoal ?? 0
  if (!goal) return 0
  return Math.min(100, Math.round((stats.value.totalContributions / goal) * 100))
})

const arcC      = computed(() => 2 * Math.PI * 48)
const arcOffset = computed(() => arcC.value * (1 - progressPct.value / 100))

function rsvpPct(n) {
  if (!stats.value.attendees) return 0
  return Math.round((n / stats.value.attendees) * 100)
}

// ── Formatters ────────────────────────────────────────────────────────────────
function formatMoney(n) {
  if (!n) return 'TZS 0'
  return 'TZS ' + Number(n).toLocaleString()
}

// ── Quick actions ─────────────────────────────────────────────────────────────
const quickActions = computed(() => [
  { label: 'Attendees', desc: 'View & manage guest list', to: `/event/${id.value}/attendees`, bg: 'rgba(0,122,255,0.08)', icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { label: 'Check-ins',  desc: 'Scan & track arrivals',   to: `/event/${id.value}/checkins`,  bg: 'rgba(52,199,89,0.08)',  icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` },
  { label: 'Payments',   desc: 'Contributions & finances', to: `/event/${id.value}/payments`,  bg: 'rgba(184,146,77,0.08)', icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B8924D" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
  { label: 'Messages',   desc: 'Invitations & campaigns',  to: `/event/${id.value}/messages`,  bg: 'rgba(255,149,0,0.08)',  icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
  { label: 'Gallery',    desc: 'Event photos & media',     to: `/event/${id.value}/gallery`,   bg: 'rgba(175,82,222,0.08)', icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#AF52DE" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>` },
  { label: 'Team',       desc: 'Admins & access control',  to: `/event/${id.value}/team`,      bg: 'rgba(255,59,48,0.08)',  icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>` },
])

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadStats() {
  if (!id.value) return
  try {
    const [attSnap, checkinSnap, paySnap] = await Promise.all([
      getDocs(query(collection(db, 'events', id.value, 'attendees'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'events', id.value, 'checkIns'))),
      getDocs(query(collection(db, 'events', id.value, 'contributions'))),
    ])
    const atts = attSnap.docs.map(d => d.data())
    const confirmed = atts.filter(a => a.attendanceStatus === 'Confirmed').length
    const declined  = atts.filter(a => a.attendanceStatus === 'Declined').length
    const pending   = atts.length - confirmed - declined
    const totalPledged = atts.reduce((s, a) => s + (a.pledgedAmount ?? 0), 0)
    const totalContributions = paySnap.docs.reduce((s, d) => s + (d.data().amount ?? 0), 0)

    rsvp.value = { confirmed, pending, declined }
    stats.value = {
      attendees: atts.length,
      checkins: checkinSnap.size,
      totalContributions,
      totalPledged,
      admins: props.event?.adminsIds?.length ?? 1,
    }
  } catch (e) {
    console.error('loadStats:', e)
  }
}

onMounted(loadStats)
watch(() => props.event, loadStats)
</script>

<style scoped>
.eo-root {
  padding: 20px 24px 56px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1080px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ══ KPI row ══ */
.eo-kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
}
.eo-kpi {
  background: #111827; border: 1px solid #1e2d44; border-radius: 14px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 5px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.16), 0 4px 10px -2px rgba(0,0,0,0.22), 0 10px 20px -8px rgba(0,0,0,0.28);
}
.eo-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.eo-kpi-lbl { font-size: 11.5px; font-weight: 500; color: #8892a4; }
.eo-kpi-ic {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.eo-kpi-num {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 30px; font-weight: 400; color: #e2e8f0; letter-spacing: -0.5px; line-height: 1;
}
.eo-kpi-num--sm { font-size: 20px; letter-spacing: -0.3px; }
.eo-kpi-sub {
  font-size: 11px; color: #4f617a; display: flex; align-items: center; gap: 5px;
}

/* Segmented bar (guests) */
.eo-kpi-seg-bar {
  display: flex; height: 4px; border-radius: 3px; overflow: hidden; gap: 1.5px; margin: 2px 0;
}
.eo-seg { border-radius: 3px; min-width: 2px; }
.eo-seg--confirmed { background: #34C759; }
.eo-seg--pending   { background: #2a3a52; }
.eo-seg--declined  { background: #FF3B30; }

/* Linear bar (checkins, contributions) */
.eo-kpi-bar-track {
  height: 4px; background: #1e2d44; border-radius: 3px; overflow: hidden; margin: 2px 0;
}
.eo-kpi-bar-fill {
  height: 100%; border-radius: 3px; transition: width 600ms ease; min-width: 2px;
}

/* Status dots */
.eo-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.eo-dot--confirmed { background: #34C759; }
.eo-dot--pending   { background: #4f617a; }
.eo-dot--declined  { background: #FF3B30; }
.eo-dot--checkin   { background: #007AFF; }

.eo-kpi-cta {
  margin-top: 4px; background: none; border: none; padding: 0; font-size: 11.5px;
  font-weight: 600; color: #B8924D; cursor: pointer; font-family: inherit; text-align: left;
  transition: opacity 120ms;
}
.eo-kpi-cta:hover { opacity: 0.7; }

/* ══ Mid row ══ */
.eo-mid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.eo-panel {
  background: #111827; border: 1px solid #1e2d44; border-radius: 16px; padding: 22px 22px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.18), 0 6px 14px -2px rgba(0,0,0,0.24), 0 16px 32px -12px rgba(0,0,0,0.32);
}
.eo-panel-hd {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;
}
.eo-panel-title {
  font-size: 13.5px; font-weight: 700; color: #e2e8f0;
}
.eo-panel-mono {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8892a4;
}

/* Goal arc */
.eo-goal-body { display: flex; align-items: center; gap: 24px; }
.eo-arc-wrap { flex-shrink: 0; width: 130px; }
.eo-arc-svg { width: 100%; display: block; }
.eo-goal-stats { flex: 1; display: flex; flex-direction: column; gap: 0; }
.eo-gstat { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; }
.eo-gstat-lbl { font-size: 11.5px; color: #8892a4; }
.eo-gstat-val { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; color: #e2e8f0; }
.eo-gstat-val--gold { color: #C9A84C; }
.eo-gstat-divider { height: 1px; background: #1e2d44; }

/* RSVP panel */
.eo-rsvp-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px; }
.eo-rsvp-row { display: flex; align-items: center; gap: 9px; }
.eo-rsvp-lbl { font-size: 12px; color: #8892a4; width: 76px; flex-shrink: 0; }
.eo-rsvp-track {
  flex: 1; height: 5px; background: #1e2d44; border-radius: 3px; overflow: hidden;
}
.eo-rsvp-fill { height: 100%; border-radius: 3px; transition: width 600ms ease; min-width: 2px; }
.eo-rsvp-n { font-size: 12px; font-weight: 600; color: #e2e8f0; width: 28px; text-align: right; flex-shrink: 0; }
.eo-rsvp-divider { height: 1px; background: #1e2d44; margin: 4px 0; }

.eo-stack-bar {
  display: flex; height: 7px; border-radius: 5px; overflow: hidden; gap: 2px;
}
.eo-stack-seg { border-radius: 5px; min-width: 3px; transition: flex 600ms ease; }

/* ══ Quick navigate ══ */
.eo-nav-hd { display: flex; align-items: center; gap: 12px; }
.eo-nav-title {
  font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
  font-size: 15px; color: #e2e8f0; white-space: nowrap;
}
.eo-nav-line { flex: 1; height: 1px; background: linear-gradient(90deg, #2a3a52, transparent); }

.eo-nav-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.eo-nav-card {
  display: flex; align-items: center; gap: 12px; padding: 13px 15px;
  background: #111827; border: 1px solid #1e2d44; border-radius: 12px;
  cursor: pointer; text-align: left; font-family: inherit;
  box-shadow: 0 1px 2px rgba(0,0,0,0.16), 0 3px 8px -2px rgba(0,0,0,0.20), 0 8px 16px -8px rgba(0,0,0,0.28);
  transition: box-shadow 150ms, transform 150ms;
}
.eo-nav-card:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.22), 0 8px 20px -2px rgba(0,0,0,0.28), 0 20px 36px -12px rgba(0,0,0,0.36);
  transform: translateY(-1px);
}
.eo-nav-ic {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.eo-nav-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.eo-nav-lbl { font-size: 13px; font-weight: 600; color: #e2e8f0; }
.eo-nav-desc { font-size: 11px; color: #4f617a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.eo-nav-arrow { color: #2a3a52; flex-shrink: 0; transition: color 150ms; }
.eo-nav-card:hover .eo-nav-arrow { color: #8892a4; }

/* ══ Responsive ══ */
@media (max-width: 860px) {
  .eo-kpi-row { grid-template-columns: repeat(2, 1fr); }
  .eo-mid-row { grid-template-columns: 1fr; }
  .eo-nav-grid { grid-template-columns: repeat(2, 1fr); }
  .eo-hero-title { font-size: 26px; }
  .eo-hd-day { font-size: 30px; }
}
@media (max-width: 560px) {
  .eo-root { padding: 14px 16px 40px; }
  .eo-hero { flex-direction: column; align-items: flex-start; }
  .eo-kpi-row { grid-template-columns: 1fr 1fr; }
  .eo-nav-grid { grid-template-columns: 1fr 1fr; }
}
</style>
