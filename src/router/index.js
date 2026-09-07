import { createRouter, createWebHistory } from 'vue-router'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'
import { sectionForPath, canAccess, firstAccessiblePath } from '../utils/adminAccess.js'
import Ahadi_Mchango from '../views/Ahadi_Mchango.vue'
import Event_Landing from '../views/Event_Landing.vue'
// import DashboardLayout from '../views/dashboard/DashboardLayout.vue'
// import ManageEvents from '../views/dashboard/ManageEvents.vue'
// import ManageUsers from '../views/dashboard/ManageUsers.vue'
// import ManageCardTemplates from '../views/dashboard/ManageCardTemplates.vue'
// import DashSettings from '../views/dashboard/DashSettings.vue'
import CardTemplateGallery from '../views/CardTemplateGallery.vue'
import UsersView from '../views/UsersView.vue'
import OrganizationsView from '../views/OrganizationsView.vue'
import UserEventsView from '../views/UserEventsView.vue'
import GlobalAttendeesView from '../views/GlobalAttendeesView.vue'
import Login from '../views/Login.vue'
import CreateEvent from '../views/CreateEvent.vue'
import MyEvents from '../views/MyEvents.vue'
import EventLayout from '../views/event/EventLayout.vue'
import EventOverview from '../views/event/EventOverview.vue'
import EventAttendees from '../views/event/EventAttendees.vue'
import EventMessages from '../views/event/EventMessages.vue'
import EventCampaigns from '../views/event/EventCampaigns.vue'
import EventCheckins from '../views/event/EventCheckins.vue'
import EventCards from '../views/event/EventCards.vue'
import EventGallery from '../views/event/EventGallery.vue'
import EventZawadi from '../views/event/EventZawadi.vue'
import EventSettings from '../views/event/EventSettings.vue'
import EventTeam from '../views/event/EventTeam.vue'
import EventPayments from '../views/event/EventPayments.vue'
import EventBudget from '../views/event/EventBudget.vue'
import EditEvent from '../views/EditEvent.vue'
import MessagingView from '../views/MessagingView.vue'
import AffiliatesView from '../views/AffiliatesView.vue'
import SmsTemplatesView from '../views/SmsTemplatesView.vue'
import WhatsAppTemplatesView from '../views/WhatsAppTemplatesView.vue'
import PackagesView from '../views/PackagesView.vue'
import CardTemplatesManagerView from '../views/CardTemplatesManagerView.vue'

// Resolves once Firebase has restored the persisted session (or confirmed no user)
let authResolved = false
const waitForAuth = new Promise(resolve => {
    const unsub = auth.onAuthStateChanged(user => {
        unsub()
        authResolved = true
        resolve(user)
    })
})

// Cache the user doc per uid to avoid a Firestore read on every navigation —
// holds clearanceLevel, email and adminSections together since section-level
// access (adminAccess.js) needs all three, not just the clearance number.
const userDocCache = {}
async function getUserDoc(uid) {
    if (userDocCache[uid] != null) return userDocCache[uid]
    try {
        const snap = await getDoc(doc(db, 'users', uid))
        userDocCache[uid] = snap.exists() ? { id: uid, ...snap.data() } : { id: uid, clearanceLevel: 0 }
    } catch {
        userDocCache[uid] = { id: uid, clearanceLevel: 0 }
    }
    return userDocCache[uid]
}
async function getClearanceLevel(uid) {
    const u = await getUserDoc(uid)
    return Number(u.clearanceLevel) || 0
}

async function rejectUser() {
    delete userDocCache[auth.currentUser?.uid]
    await signOut(auth)
}

const PROTECTED_EXACT = ['/', '/users', '/organizations', '/messaging', '/affiliates', '/sms-templates', '/whatsapp-templates', '/packages', '/global-attendees', '/manage-card-templates']
const PROTECTED = ['/create-event', '/edit-event', '/event/', '/dashboard', '/user-events/']

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guestOnly: true },
    },
    {
        path: '/changia/:eventId/:userId',
        name: 'Changia',
        component: Ahadi_Mchango,
    },
    {
        path: '/events/:eventId/:userId',
        name: 'EventLanding',
        component: Event_Landing,
    },
    {
        path: '/',
        name: 'MyEvents',
        component: MyEvents,
        meta: { title: 'All Events' },
    },
    {
        path: '/users',
        name: 'Users',
        component: UsersView,
        meta: { title: 'Users' },
    },
    {
        path: '/organizations',
        name: 'Organizations',
        component: OrganizationsView,
        meta: { title: 'Organizations' },
    },
    {
        path: '/user-events/:userId',
        name: 'UserEvents',
        component: UserEventsView,
        meta: { title: 'User Events' },
    },
    {
        path: '/global-attendees',
        name: 'GlobalAttendees',
        component: GlobalAttendeesView,
        meta: { title: 'Guests' },
    },
    {
        path: '/messaging',
        name: 'Messaging',
        component: MessagingView,
        meta: { title: 'Messaging' },
    },
    {
        path: '/affiliates',
        name: 'Affiliates',
        component: AffiliatesView,
        meta: { title: 'Affiliates' },
    },
    {
        path: '/sms-templates',
        name: 'SmsTemplates',
        component: SmsTemplatesView,
        meta: { title: 'SMS Templates' },
    },
    {
        path: '/whatsapp-templates',
        name: 'WhatsAppTemplates',
        component: WhatsAppTemplatesView,
        meta: { title: 'WhatsApp Templates' },
    },
    {
        path: '/packages',
        name: 'Packages',
        component: PackagesView,
        meta: { title: 'Packages' },
    },
    {
        path: '/manage-card-templates',
        name: 'ManageCardTemplates',
        component: CardTemplatesManagerView,
        meta: { title: 'Card Templates' },
    },
    // {
    //     path: '/dashboard',
    //     component: DashboardLayout,
    //     redirect: '/dashboard/events',
    //     children: [
    //         { path: 'events', name: 'DashEvents', component: ManageEvents, meta: { title: 'Manage Events' } },
    //         { path: 'users', name: 'DashUsers', component: ManageUsers, meta: { title: 'Manage Users' } },
    //         { path: 'card-templates', name: 'DashCardTemplates', component: ManageCardTemplates, meta: { title: 'Manage Card Templates' } },
    //         { path: 'settings', name: 'DashSettings', component: DashSettings, meta: { title: 'Settings' } },
    //     ],
    // },
    {
        path: '/create-event',
        name: 'CreateEvent',
        component: CreateEvent,
        meta: { title: 'Create Event' },
    },
    {
        path: '/edit-event/:eventId',
        name: 'EditEvent',
        component: EditEvent,
        meta: { title: 'Edit Event' },
    },
    {
        path: '/event/:eventId',
        component: EventLayout,
        redirect: to => `/event/${to.params.eventId}/overview`,
        children: [
            { path: 'overview', name: 'EventOverview', component: EventOverview, meta: { title: 'Overview' } },
            { path: 'attendees', name: 'EventAttendees', component: EventAttendees, meta: { title: 'Attendees' } },
            { path: 'checkins', name: 'EventCheckins', component: EventCheckins, meta: { title: 'Check-ins' } },
            { path: 'cards', name: 'EventCards', component: EventCards, meta: { title: 'Cards' } },
            { path: 'invitations', name: 'EventMessages', component: EventMessages, meta: { title: 'Invitations' } },
            { path: 'bulk-messages', name: 'EventCampaigns', component: EventCampaigns, meta: { title: 'Bulk Messages' } },
            { path: 'gallery', name: 'EventGallery', component: EventGallery, meta: { title: 'Gallery' } },
            { path: 'zawadi', name: 'EventZawadi', component: EventZawadi, meta: { title: 'Zawadi' } },
            { path: 'payments', name: 'EventPayments', component: EventPayments, meta: { title: 'Payments' } },
            { path: 'budget', name: 'EventBudget', component: EventBudget, meta: { title: 'Budget' } },
            { path: 'team', name: 'EventTeam', component: EventTeam, meta: { title: 'Team' } },
            { path: 'settings', name: 'EventSettings', component: EventSettings, meta: { title: 'Settings' } },
        ],
    },
    {
        path: '/card-templates',
        name: 'CardTemplates',
        component: CardTemplateGallery,
    },
    // Old split URLs now resolve into the merged gallery, preserving type via query.
    { path: '/invitation-card-templates', redirect: () => ({ path: '/card-templates', query: { type: 'invitation' } }) },
    { path: '/contribution-card-templates', redirect: () => ({ path: '/card-templates', query: { type: 'contribution' } }) },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async (to) => {
    const user = authResolved ? auth.currentUser : await waitForAuth

    const needsAuth = PROTECTED_EXACT.includes(to.path) || PROTECTED.some(prefix => to.path.startsWith(prefix))
    const isGuestOnly = to.meta.guestOnly

    if (needsAuth) {
        if (!user) return { name: 'Login', query: { redirect: to.fullPath } }

        const userDoc = await getUserDoc(user.uid)
        if (Number(userDoc.clearanceLevel) < 5) {
            await rejectUser()
            return { name: 'Login', query: { error: 'unauthorized' } }
        }

        // Clearance gets you into the admin app; adminSections decides which
        // parts of it you can actually reach. A section-less route (e.g. the
        // event sub-tabs, gated by their '/event/' prefix under 'all-events')
        // returns null here and is allowed through unchecked.
        const section = sectionForPath(to.path)
        if (section && !canAccess(userDoc, section)) {
            const fallback = firstAccessiblePath(userDoc)
            if (fallback && fallback !== to.path) return { path: fallback }
            // No section at all is reachable — nothing left to redirect to.
            await rejectUser()
            return { name: 'Login', query: { error: 'unauthorized' } }
        }
    }

    if (isGuestOnly && user) {
        const userDoc = await getUserDoc(user.uid)
        if (Number(userDoc.clearanceLevel) >= 5) {
            // Land them on the first section they can actually reach rather than
            // always 'MyEvents' ('/'), which a restricted admin may not have.
            const fallback = firstAccessiblePath(userDoc)
            if (fallback) return { path: fallback }
            // Zero accessible sections — nowhere to send them; falls through to reject below.
        }
        // Logged in but insufficient clearance (or no reachable section) — sign out and stay on login
        await rejectUser()
    }
})

export default router