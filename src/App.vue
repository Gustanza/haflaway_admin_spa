<template>
  <div class="app-shell" :class="{ 'app-shell--sidebar': showSidebar }">
    <AdminSidebar v-if="showSidebar" />
    <div class="app-main">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router' 
import AdminSidebar from './components/AdminSidebar.vue'

const route = useRoute()

// Show sidebar for all admin routes; hide for public/auth pages
const NO_SIDEBAR = ['/login', '/changia/', '/events/']
const showSidebar = computed(() => {
  const p = route.path
  if (NO_SIDEBAR.some(r => p === r || p.startsWith(r))) return false
  if (p.startsWith('/event/')) return false           // EventLayout has its own nav
  if (p.startsWith('/invitation-card-templates')) return false
  if (p.startsWith('/contribution-card-templates')) return false
  return true
})
</script>

<style>
* { box-sizing: border-box; }

body { margin: 0; }

.app-shell {
  display: flex;
  min-height: 100vh;
  background: #0a0e1c;
}

.app-main {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
}
</style>
