import { create } from 'zustand'

export const STEPS = {
  AVAILABILITY: 1,
  DETAILS: 2,
  SUMMARY: 3,
}

export const STEP_LABELS = [
  { step: 1, label: 'Date & Services' },
  { step: 2, label: 'Your Details' },
  { step: 3, label: 'Review' },
]

const useBookingStore = create((set, get) => ({
  // Salon context
  salonId: null,
  salon: null,

  // Current step
  currentStep: STEPS.AVAILABILITY,

  // Step 1: selected services
  selectedServices: [],

  // Step 2: selected staff (null means "no preference" → any available)
  selectedStaff: null,
  noPreference: false,

  // Step 3: date and time
  selectedDate: null,
  selectedTime: null,

  // Step 4: client details
  clientDetails: {
    full_name: '',
    email: '',
    phone: '',
    notes: '',
  },

  // Confirmed appointment result
  confirmedAppointment: null,

  // Actions
  setSalon: (salon) => set({ salon, salonId: salon.id }),

  setCurrentStep: (step) => set({ currentStep: step }),

  goToNextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, STEPS.SUMMARY),
  })),

  goToPrevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, STEPS.AVAILABILITY),
  })),

  toggleService: (service) => set((state) => {
    const exists = state.selectedServices.find((s) => s.id === service.id)
    if (exists) {
      return { selectedServices: state.selectedServices.filter((s) => s.id !== service.id) }
    }
    return { selectedServices: [...state.selectedServices, service] }
  }),

  clearServices: () => set({ selectedServices: [] }),

  setSelectedStaff: (staff) => set({ selectedStaff: staff, noPreference: false, selectedTime: null }),

  setNoPreference: () => set({ selectedStaff: null, noPreference: true, selectedTime: null }),

  // Sets selectedStaff without touching noPreference or selectedTime — used to
  // silently assign a concrete staff member when the user picks "any available".
  assignStaff: (staff) => set({ selectedStaff: staff }),

  setSelectedDate: (date) => set({ selectedDate: date, selectedTime: null, selectedStaff: null, noPreference: false }),

  setSelectedTime: (time) => set({ selectedTime: time }),

  setClientDetails: (details) => set((state) => ({
    clientDetails: { ...state.clientDetails, ...details },
  })),

  setConfirmedAppointment: (appointment) => set({ confirmedAppointment: appointment }),

  getTotalDuration: () => {
    const { selectedServices } = get()
    return selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
  },

  getTotalPrice: () => {
    const { selectedServices } = get()
    return selectedServices.reduce((sum, s) => sum + parseFloat(s.price || 0), 0)
  },

  getServiceIds: () => get().selectedServices.map((s) => s.id),

  getServicePricesMap: () => {
    const { selectedServices } = get()
    return selectedServices.reduce((acc, s) => ({ ...acc, [s.id]: parseFloat(s.price) }), {})
  },

  resetBooking: () => set({
    currentStep: STEPS.AVAILABILITY,
    selectedServices: [],
    selectedStaff: null,
    noPreference: false,
    selectedDate: null,
    selectedTime: null,
    clientDetails: { full_name: '', email: '', phone: '', notes: '' },
    confirmedAppointment: null,
  }),
}))

export default useBookingStore
