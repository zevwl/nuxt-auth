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
      loading: false
    }
  },

  methods: {
    ...mapActions({
      login: 'auth/login'
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

    }
  }
}
</script>

<style>

</style>
