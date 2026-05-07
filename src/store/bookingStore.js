import { create } from 'zustand'

export const STEPS = {
  SERVICES: 1,
  STAFF: 2,
  DATETIME: 3,
  DETAILS: 4,
  SUMMARY: 5,
}

export const STEP_LABELS = [
  { step: 1, label: 'Services' },
  { step: 2, label: 'Stylist' },
  { step: 3, label: 'Date & Time' },
  { step: 4, label: 'Your Details' },
  { step: 5, label: 'Review' },
]

const useBookingStore = create((set, get) => ({
  // Salon context
  salonId: null,
  salon: null,

  // Current step
  currentStep: STEPS.SERVICES,

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
    currentStep: Math.max(state.currentStep - 1, STEPS.SERVICES),
  })),

  toggleService: (service) => set((state) => {
    const exists = state.selectedServices.find((s) => s.id === service.id)
    if (exists) {
      return { selectedServices: state.selectedServices.filter((s) => s.id !== service.id) }
    }
    return { selectedServices: [...state.selectedServices, service] }
  }),

  clearServices: () => set({ selectedServices: [] }),

  setSelectedStaff: (staff) => set({ selectedStaff: staff, noPreference: false }),

  setNoPreference: () => set({ selectedStaff: null, noPreference: true }),

  setSelectedDate: (date) => set({ selectedDate: date, selectedTime: null }),

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
    currentStep: STEPS.SERVICES,
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
