import { defineStore } from 'pinia'

export const useUI = defineStore('ui', {
  state: () => ({
    showAppointmentPanel: false
  }),
  getters: {
    appointmentPanelVisible(state) {
      return state.showAppointmentPanel
    }
  },
  actions: {
    toggleAppointmentPanel() {
      this.showAppointmentPanel = !this.showAppointmentPanel
    }
  }
})
