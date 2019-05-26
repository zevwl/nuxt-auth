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
import { mapActions, mapState } from 'vuex'

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

  computed: mapState('auth', ['redirectUrl']),

  mounted() {
    const nextRoute = this.$route.query.next
    this.setRedirectUrl(nextRoute)

    // Leave a clean url
    this.$router.push({ query: null })

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
    ...mapActions('auth', [
      'login',
      'loginGoogle',
      'setRedirectUrl'
    ]),

    submit() {
      return this._login()
    },

    async googleSubmit() {
      this._login('google')
    },

    async _login(type) {
      const googleLogin = type === 'google'

      if (googleLogin) {
        if (!this.googleReady) {
          return
        } else {
          this.googleLoading = true
        }
      } else {
        // email-password login
        this.loading = true
      }

      this.alert = null

      try {
        let result

        if (googleLogin) {
          await window.google_auth2.signIn()
          result = await this.loginGoogle(window.google_auth2.currentUser.get().Zi.access_token)

        } else {
          result = await this.login({
            email: this.email,
            password: this.password
          })
        }

        // If there is an error
        if (result.response) {
          // Pass the result to the catch block
          throw result
        }

        this.alert = {
          type: 'success',
          message: result.data.message
        }

        if (googleLogin) {
          this.googleLoading = false
        } else {
          this.loading = false
        }

        // Show the message for one second
        setTimeout(() => {
          this.$router.push(this.redirectUrl || '/admin')
        }, 1000);
      } catch (error) {
        if (googleLogin) {
          this.googleLoading = false
        } else {
          this.loading = false
        }

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
