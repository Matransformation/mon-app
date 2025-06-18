"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import ReactPlayer from "react-player"
import Confetti from "react-confetti"
import { useTrainingStore } from "../../../stores/training-store"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  ArrowLeft,
  Trophy,
  Clock,
} from "lucide-react"

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default function SessionInterface({ workout, exercises }) {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  if (!workout || !exercises) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500">
        Erreur : entraînement introuvable.
      </div>
    )
  }

  const [videoPlaying, setVideoPlaying] = useState(false)
  const bgAudioRef = useRef(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [nextExerciseName, setNextExerciseName] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const {
    currentSession,
    currentExercise,
    currentExerciseIndex,
    timeRemaining,
    isTimerRunning,
    completedExercises,
    startSession,
    startTimer,
    pauseTimer,
    completeCurrentExercise,
    completeSession,
    resetSession,
  } = useTrainingStore()

  useEffect(() => {
    if (currentSession?.status === "completed") {
      setShowSummary(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      bgAudioRef.current?.pause()
    }
  }, [currentSession])

  useEffect(() => {
    setVideoPlaying(isTimerRunning)
    if (sessionStarted && bgAudioRef.current) {
      isTimerRunning && !isMuted
        ? bgAudioRef.current.play().catch(() => {})
        : bgAudioRef.current.pause()
    }
  }, [isTimerRunning, sessionStarted, isMuted])

  useEffect(() => {
    const next = exercises[currentExerciseIndex + 1]
    if (timeRemaining <= 10 && next && next.name) {
      setNextExerciseName(next.name)
    }
    if (timeRemaining <= 1) {
      setNextExerciseName(null)
    }
  }, [timeRemaining, currentExerciseIndex, exercises])

  const handleStartSession = async () => {
    if (!user) return alert("Vous devez être connecté pour commencer une séance")
    try {
      await startSession(workout.id, user.id, exercises)
      setSessionStarted(true)
      startTimer()
      if (!isMuted) {
        bgAudioRef.current?.play().catch(() => {})
      }
    } catch (err) {
      console.error(err)
      alert("Erreur lors du démarrage de la séance")
    }
  }

  const handleTimerToggle = () => isTimerRunning ? pauseTimer() : startTimer()
  const handleSkipExercise = () => completeCurrentExercise()
  const handleFinishSession = () => completeSession()
  const handleBackToTraining = () => { resetSession(); router.push("/training") }
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (bgAudioRef.current) {
      if (!isMuted) bgAudioRef.current.pause()
      else bgAudioRef.current.play().catch(() => {})
    }
  }

  if (showSummary && currentSession) {
    const estimatedDuration = Math.floor(
      exercises.reduce((acc, ex) => acc + (ex.duration || 0), 0) / 60
    )

    return (
      <div className="container mx-auto px-4 py-8 max-w-md relative">
        {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
        <Card className="text-center shadow-lg rounded-2xl px-6 py-8">
          <CardHeader>
            <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
            <CardTitle className="text-3xl font-bold">Félicitations !</CardTitle>
            <p className="text-gray-500 mt-2">Vous avez terminé la séance</p>
          </CardHeader>
          <CardContent className="space-y-6 mt-6">
            <div>
              <div className="text-4xl font-extrabold text-blue-600">{estimatedDuration} min</div>
              <div className="text-sm text-gray-500">Durée estimée</div>
            </div>
            <Button onClick={handleBackToTraining} className="w-full text-lg mt-4">
              Retour aux programmes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <button onClick={() => router.push("/training")} className="flex items-center text-gray-600 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </button>
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{workout.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between text-sm text-gray-500">
              <div className="flex items-center"><Clock className="mr-1" />{exercises.length} étapes</div>
            </div>
            <ul className="space-y-2">
              {exercises.map((ex, idx) => (
                <li key={idx} className="flex justify-between p-2 bg-gray-100 rounded">
                  <span>{idx + 1}. {ex.name}</span>
                  <Badge>{ex.duration != null ? formatTime(ex.duration) : `${ex.repCount} reps`}</Badge>
                </li>
              ))}
            </ul>
            <Button onClick={handleStartSession} className="w-full text-lg" size="lg">
              <Play className="mr-2" /> Commencer la séance
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentExercise) return <div>Chargement…</div>
  const isRestPhase = currentExercise.isRest === true
  const progress = (completedExercises / exercises.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <audio ref={bgAudioRef} src="/bg-music.MP3" loop style={{ display: 'none' }} />

      {isRestPhase && (
        <div className="mb-4 px-4 py-1 text-sm text-white bg-green-600 rounded-full text-center w-fit mx-auto">
          🧘 Phase de repos
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-semibold">{workout.title}</h1>
          <Badge variant="outline">{completedExercises + 1}/{exercises.length}</Badge>
        </div>
        <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute h-2 bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {isRestPhase ? (() => {
        const next = exercises[currentExerciseIndex + 1]
        const showPreview = next && next.videoUrl && !next.isRest

        return showPreview ? (
          <div className="mb-4 aspect-video rounded-xl overflow-hidden">
            <ReactPlayer
              url={next.videoUrl}
              playing
              muted
              loop
              controls={false}
              width="100%"
              height="100%"
            />
          </div>
        ) : (
          <div className="mb-4 aspect-video flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl">
            <span className="text-xl">Repos en cours...</span>
          </div>
        )
      })() : (
        <div className="mb-4 aspect-video rounded-xl overflow-hidden">
          <ReactPlayer
            url={currentExercise.videoUrl}
            playing={videoPlaying}
            muted
            loop
            controls
            width="100%"
            height="100%"
          />
        </div>
      )}

      <Card className={`mb-6 ${isRestPhase ? "bg-green-100 border border-green-300 animate-pulse" : ""} rounded-2xl shadow-md`}>
        <CardHeader className="text-center space-y-1">
          {isRestPhase ? (
            <>
              <CardTitle className="text-lg font-bold text-green-800">
                🧘 Repos : visualisez le prochain exercice
              </CardTitle>
              <div className="text-sm text-gray-600 italic">
                {exercises[currentExerciseIndex + 1]?.name || "À venir"}
              </div>
            </>
          ) : (
            <CardTitle className="text-2xl font-bold">{currentExercise.name}</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-4 text-center py-4">
          <div className="text-5xl font-extrabold text-gray-800">{formatTime(timeRemaining)}</div>

          {!isRestPhase && currentExercise.instructions && (
            <div className="text-left">
              <h4 className="font-semibold mb-2 text-gray-700">Instructions :</h4>
              <ul className="list-disc list-inside text-sm text-gray-500">
                {currentExercise.instructions.split("\n").filter(Boolean).map((line, idx) => <li key={idx}>{line}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {isRestPhase && (
        <div className="flex justify-center mb-6">
          <Button onClick={handleSkipExercise} variant="outline">
            Passer le repos
          </Button>
        </div>
      )}

      <div className="flex gap-4 justify-center mb-6">
        <Button onClick={handleTimerToggle} size="lg" className="flex-1">
          {isTimerRunning ? <><Pause className="mr-2" /> Pause</> : <><Play className="mr-2" /> Reprendre</>}
        </Button>
        <Button onClick={handleSkipExercise} variant="outline" size="lg">
          <SkipForward className="mr-2" /> Suivant
        </Button>
      </div>

      <div className="flex justify-center mt-2">
        <Button variant="ghost" onClick={toggleMute} className="text-sm">
          {isMuted ? "🔇 Musique coupée" : "🔊 Musique activée"}
        </Button>
      </div>

      {currentExerciseIndex === exercises.length - 1 && (
        <Button onClick={handleFinishSession} variant="secondary" className="w-full mt-4 text-lg">
          <CheckCircle className="mr-2" /> Terminer la séance
        </Button>
      )}
    </div>
  )
}
