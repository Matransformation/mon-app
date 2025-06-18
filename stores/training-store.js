import { create } from "zustand"
import axios from "axios"

let timerRef = null // ⏱ référence globale

export const useTrainingStore = create((set, get) => ({
  currentSession: null,
  exercises: [],
  currentExercise: null,
  currentExerciseIndex: 0,
  timeRemaining: 0,
  isTimerRunning: false,
  isResting: false,
  completedExercises: 0,
  sessionStartTime: null,
  mute: false, // 🔇 mode muet activé ou non

  toggleMute: () => set((state) => ({ mute: !state.mute })),

  startSession: async (workoutId, userId, initialExercises = null) => {
    try {
      const res = await axios.post(`/api/workouts/${workoutId}/sessions`, { userId })
      const session = res.data

      let list = []
      if (Array.isArray(initialExercises) && initialExercises.length) {
        list = initialExercises
      } else {
        const workoutRes = await axios.get(`/api/workouts/${workoutId}`)
        list = workoutRes.data.exercises
      }

      const first = list[0] || {}
      set({
        currentSession: session,
        exercises: list,
        currentExercise: first,
        currentExerciseIndex: 0,
        timeRemaining: first.duration || 0,
        completedExercises: 0,
        isTimerRunning: false,
        isResting: first.isRest === true,
        sessionStartTime: Date.now(),
      })

      return session
    } catch (error) {
      console.error("startSession error:", error.response?.data || error.message)
      throw new Error("Échec startSession: " + (error.response?.data?.error || error.message))
    }
  },

  startTimer: () => {
    const { isTimerRunning } = get()
    if (isTimerRunning) return

    set({ isTimerRunning: true })

    if (timerRef) clearInterval(timerRef)

    timerRef = setInterval(() => {
      const { timeRemaining, isTimerRunning } = get()
      if (!isTimerRunning) return

      if (timeRemaining <= 1) {
        clearInterval(timerRef)
        timerRef = null
        get().handleTimerComplete()
      } else {
        set({ timeRemaining: timeRemaining - 1 })
      }
    }, 1000)
  },

  pauseTimer: () => {
    if (timerRef) clearInterval(timerRef)
    timerRef = null
    set({ isTimerRunning: false })
  },

  handleTimerComplete: () => {
    const { mute } = get()

    if (!mute) {
      const audio = new Audio("/beep.mp3")
      audio.play().catch(() => {}) // éviter crash navigateur silencieux

      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
    }

    get().completeCurrentExercise()
  },

  completeCurrentExercise: () => {
    const {
      currentExerciseIndex,
      exercises,
      completedExercises,
      currentSession,
    } = get()

    const newIndex = currentExerciseIndex + 1
    const newCompleted = completedExercises + 1

    if (newIndex < exercises.length) {
      const next = exercises[newIndex]

      set({
        currentExerciseIndex: newIndex,
        currentExercise: next,
        timeRemaining: next.duration,
        completedExercises: newCompleted,
        isTimerRunning: true,
        isResting: next.isRest === true,
      })

      get().startTimer()
    } else {
      get().completeSession()
    }

    axios.put(
      `/api/workouts/${currentSession.workoutId}/sessions/${currentSession.id}`,
      { exercisesCompleted: newCompleted }
    )
  },

  completeSession: async () => {
    if (timerRef) clearInterval(timerRef)
    timerRef = null

    const { currentSession, sessionStartTime } = get()
    const totalDuration = Math.floor((Date.now() - sessionStartTime) / 1000)

    await axios.put(
      `/api/workouts/${currentSession.workoutId}/sessions/${currentSession.id}`,
      { completedAt: new Date().toISOString(), totalDuration }
    )

    set({
      currentSession: { ...currentSession, status: 'completed' },
      isTimerRunning: false,
    })
  },

  resetSession: () => {
    if (timerRef) clearInterval(timerRef)
    timerRef = null

    set({
      currentSession: null,
      exercises: [],
      currentExercise: null,
      currentExerciseIndex: 0,
      timeRemaining: 0,
      isTimerRunning: false,
      isResting: false,
      completedExercises: 0,
      sessionStartTime: null,
    })
  },
}))
