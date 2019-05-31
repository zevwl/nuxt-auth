<template>
  <v-form class="layout justify-center align-center" @submit.prevent="submit">
    <v-card class="flex xs12 sm10 md8 lg6">
      <v-card-title>
        <h2 class="headline">Signup</h2>
      </v-card-title>
      <v-card-text>
        <v-alert v-if="alert" :type="alert.type" value="true">{{ alert.message }}</v-alert>

        <v-text-field v-model="email" label="Email" />

        <v-text-field v-model="password" type="password" label="Password" />

        <v-text-field v-model="confirmPassword" type="password" label="Confirm Password" />
      </v-card-text>
      <v-card-actions>
        <v-btn type="submit" color="primary" :loading="loading" :disabled="loading">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  layout: 'empty',

  data: () => ({
    email: '',
    password: '',
    confirmPassword: '',
    alert: null,
    loading: false
  }),

  computed: {
    passwordFields() {
      return (this.password, this.confirmPassword, Date.now())
    }
  },

  watch: {
    passwordFields() {
      if (this.alert) {
        this.alert = null
      }
    }
  },

  methods: {
    ...mapActions('auth', ['signup']),

    async submit() {
      if (this.password !== this.confirmPassword) {
        return this.alert = {
          type: 'error',
          message: 'Passwords don\'t match'
        }
      }

      // I/O process is starting
      this.loading =  true

      try {
        const result = await this.signup({
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

        // Show the message for one second
        setTimeout(() => {
          this.$router.push(this.redirectUrl || '/me')
        }, 1000);

      } catch (error) {
        if (error.response && error.response.data) {
          this.alert = {
            type: 'error',
            message: error.response.data.message || error.response.status
          }
        } else {
          console.log('Signup error.', error)
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style>

</style>
