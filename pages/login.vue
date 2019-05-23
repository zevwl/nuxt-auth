<template>
  <v-layout justify-center align-center>
    <v-card class="elevation-10" style="flex: 0 1 400px">
      <v-card-title class="headline">Login</v-card-title>

      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-alert v-if="alert" :type="alert.type" value="true">{{ alert.message }}</v-alert>

          <v-text-field label="Email" v-model="email" />

          <v-text-field label="Password" v-model="password" type="password" />
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit" color="primary" block :loading="loading" :disabled="loading">Login</v-btn>
          <v-btn v-if="googleReady" color="red white--text" @click="googleSubmit" :loading="googleLoading" :disabled="googleLoading">Login with Google</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  layout: 'fullscreen',

  data() {
    return {
      email: '',
      password: '',
      alert: null,
      loading: false,
      googleLoading: false,
      googleReady: false
    }
  },

  mounted() {
    window.gapiOnLoadCallback = () => {
      window.gapi.load('auth2', () => {
        window.google_auth2 = window.gapi.auth2.init({
          client_id: process.env.googleClientId,
          fetch_basic_profile: false,
          scope: 'profile email'
        })
      })
      this.googleReady = true
    }

    const installGoogleSdkScript = (d, s, id) => {
      if (d.getElementById(id)) {
        this.googleReady = true
        return
      }

      let fjs = d.querySelector(s)
      let js = d.createElement(s)
      js.id = id
      js.src = 'https://apis.google.com/js/platform.js?onload=gapiOnLoadCallback',
      fjs.parentNode.insertBefore(js, fjs)
    }
    installGoogleSdkScript(document, 'script', 'google-jssdk')
  },

  methods: {
    ...mapActions({
      login: 'auth/login',
      loginGoogle: 'auth/loginGoogle'
    }),

    async submit() {
      this.alert = null
      this.loading = true

      try {
        const result = await this.login({
          email: this.email,
          password: this.password
        })

        // If there is an error
        if (result.response) {
          // Pass the result to the catch block
          throw result
        }

        this.alert = {
          type: 'success',
          message: result.data.message
        }
        this.loading = false

        // Show the message for one second
        setTimeout(() => {
          this.$router.push('/admin')
        }, 1000);
      } catch (error) {
        this.loading = false

        if (error.response && error.response.data) {
          this.alert = {
            type: 'error',
            message: error.response.data.message || error.response.status
          }
        } else {
          console.log('login error', error)
        }
      }
    },

    async googleSubmit() {
      if (!this.googleReady) return

      this.alert = null
      this.googleLoading = true

      try {
        await window.google_auth2.signIn()
        const result = await this.loginGoogle(window.google_auth2.currentUser.get().Zi.access_token)

        // If there is an error
        if (result.response) {
          // Pass the result to the catch block
          throw result
        }

        this.alert = {
          type: 'success',
          message: result.data.message
        }

        this.googleLoading = false

        // Show the message for one second
        setTimeout(() => {
          this.$router.push('/admin')
        }, 1000);
      } catch (error) {
        this.googleLoading = false

        if (error.response && error.response.data) {
          this.alert = {
            type: 'error',
            message: error.response.data.message || error.response.status
          }
        } else {
          console.log('login error', error)
        }
      }
    }
  }
}
</script>

<style>

</style>
