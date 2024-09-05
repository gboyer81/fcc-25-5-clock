import { useCallback, useEffect, useRef, useState } from 'react'

const Timer = () => {
  const [sessionLength, setSessionLength] = useState(25 * 60)
  const [breakLength, setBreakLength] = useState(5 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [timerType, setTimerType] = useState('Session')
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)

	const intervalRef = useRef<number | null>(null)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	
	const updateTimer = useCallback(() => {
		setTimeRemaining((prevTime) => {
			if (prevTime === 0) {
				playAlarm()
				if (timerType === 'Session') {
					setTimerType('Break')
					return breakLength
				} else {
					setTimerType('Session')
					return sessionLength
				}
			}
			return prevTime - 1
		})
	}, [timerType, breakLength, sessionLength])

	useEffect(() => {
		if (isRunning) {
			intervalRef.current = window.setInterval(updateTimer, 1000)
		}

		return () => {
			if (intervalRef.current) {
				window.clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
	}, [isRunning, updateTimer])

  const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}
	
	const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(error => console.log('Audio play failed:', error))
    }
  }

	const handleStartStop = () => {
		setIsRunning((prevIsRunning) => {
			if (prevIsRunning && intervalRef.current) {
				window.clearInterval(intervalRef.current)
				intervalRef.current = null
			}
			return !prevIsRunning
		})
  }

	const handleReset = () => {
    // Stop any running timer
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Reset all states to their default values
    setIsRunning(false)
    setSessionLength(25 * 60)
    setBreakLength(5 * 60)
    setTimerType('Session')
		setTimeRemaining(25 * 60)
		if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
	}
	
	const adjustTime = (type: 'session' | 'break', increment: boolean) => {
		if (!isRunning) {
			const setter = type === 'session' ? setSessionLength : setBreakLength
			const currentValue = type === 'session' ? sessionLength : breakLength
			const newValue = increment
				? Math.min(currentValue + 60, 60 * 60)
				: Math.max(currentValue - 60, 60)
			setter(newValue)
			if ((type === 'session' && timerType === 'Session') || 
					(type === 'break' && timerType === 'Break')) {
				setTimeRemaining(newValue)
			}
		}
	}

  return (
    <>
      <div className="break-timer-ctrl">
        <div id="break-label" className="timer-label">
          <h3>Break Length</h3>
        </div>
        <div className="length-ctrl">
          <div className="inc-dec">
            <button id="break-increment" onClick={() => adjustTime('break', true)}>
              <span className="inc-dec-icon">
                <i className="fa-solid fa-arrow-up"></i>
              </span>
            </button>
            <span className="inc-dec-icon" id="break-length">
              {breakLength / 60}
            </span>
            <button id="break-decrement" onClick={() => adjustTime('break', false)}>
              <span className="inc-dec-icon">
                <i className="fa-solid fa-arrow-down"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="session-timer-ctrl">
        <div id="session-label" className="timer-label">
          <h3>Session Length</h3>
        </div>
        <div className="length-ctrl">
          <button id="session-increment" onClick={() => adjustTime('session', true)}>
            <span className="inc-dec-icon">
              <i className="fa-solid fa-arrow-up"></i>
            </span>
          </button>
          <span className="inc-dec-icon" id="session-length">
            {sessionLength / 60}
          </span>
          <button id="session-decrement" onClick={() => adjustTime('session', false)}>
            <span className="inc-dec-icon">
              <i className="fa-solid fa-arrow-down"></i>
            </span>
          </button>
        </div>
      </div>
      <div id="time-left-wrapper">
        <div id="timer-label">
          <h1>{timerType}</h1>
          <div>
            <span id="time-left">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>
      <div id="timer-interactions">
        <div className="icon-wrap">
          <button id="start_stop" onClick={handleStartStop}>
            <span className="interact-icons">
              <i
                className={isRunning ? 'fa-solid fa-pause' : 'fa-solid fa-play'}
              ></i>
            </span>
          </button>
          <button onClick={handleReset} id="reset">
            <span className="interact-icons">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </span>
          </button>
        </div>
			</div>
			<audio id="beep" ref={audioRef} src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" />
    </>
  )
}

export default Timer