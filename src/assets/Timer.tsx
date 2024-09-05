import React, { useRef, useState } from 'react';

interface AlarmColor {
  color: string;
}

interface LengthControlProps {
  title: string;
  length: number;
  lengthControl: (type: string, operator: string, currentLength: number, oppositeType: string) => void;
  type: string;
  oppositeType: string;
}

const Timer: React.FC = () => {
  const [brkLength, setBrkLength] = useState<number>(5);
  const [seshLength, setSeshLength] = useState<number>(25);
  const [timerState, setTimerState] = useState<"stopped" | "running">("stopped");
  const [timerType, setTimerType] = useState<"Session" | "Break">("Session");
  const [timer, setTimer] = useState<number>(1500);
  const [alarmColor, setAlarmColor] = useState<AlarmColor>({ color: "white" });

  const intervalID = useRef<number | null>(null);
  const audioBeep = useRef<HTMLAudioElement | null>(null);

  const lengthControl = (type: string, operator: string, currentLength: number, oppositeType: string) => {
    if (timerState === "running") return;

    if (timerType === oppositeType) {
      if (operator === "-" && currentLength > 1) {
        setStateWithTimer(type, currentLength - 1);
      } else if (operator === "+" && currentLength < 60) {
        setStateWithTimer(type, currentLength + 1);
      }
    } else {
      if (operator === "-" && currentLength > 1) {
        setStateWithoutTimer(type, currentLength - 1);
      } else if (operator === "+" && currentLength < 60) {
        setStateWithoutTimer(type, currentLength + 1);
      }
    }
  };

  const setStateWithTimer = (type: string, length: number) => {
    if (type === "brkLength") {
      setBrkLength(length);
    } else {
      setSeshLength(length);
      setTimer(length * 60);
    }
  };

  const setStateWithoutTimer = (type: string, length: number) => {
    if (type === "brkLength") {
      setBrkLength(length);
    } else {
      setSeshLength(length);
    }
    setTimer(length * 60);
  };

  const timerControl = () => {
    if (timerState === "stopped") {
      beginCountDown();
      setTimerState("running");
    } else {
      setTimerState("stopped");
      if (intervalID.current) {
        clearInterval(intervalID.current);
        intervalID.current = null;
      }
    }
  };

  const beginCountDown = () => {
    const tick = () => {
      decrementTimer();
      phaseControl();
    };

    intervalID.current = window.setInterval(tick, 1000);
  };

  const decrementTimer = () => {
    setTimer((prevTimer) => prevTimer - 1);
  };

  const phaseControl = () => {
    if (timer < 0) {
      clearInterval(intervalID.current as number);
      intervalID.current = null;
      if (timerType === "Session") {
        beginCountDown();
        switchTimer(brkLength * 60, "Break");
      } else {
        beginCountDown();
        switchTimer(seshLength * 60, "Session");
      }
    } else {
      warning(timer);
      buzzer(timer);
    }
  };

  const warning = (timeLeft: number) => {
    if (timeLeft < 61) {
      setAlarmColor({ color: "#a50d0d" });
    } else {
      setAlarmColor({ color: "white" });
    }
  };

  const buzzer = (timeLeft: number) => {
    if (timeLeft === 0 && audioBeep.current) {
      audioBeep.current.play();
    }
  };

  const switchTimer = (newTimer: number, type: "Session" | "Break") => {
    setTimer(newTimer);
    setTimerType(type);
    setAlarmColor({ color: "white" });
  };

  const clockify = (): string => {
    if (timer < 0) return "00:00";

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const reset = () => {
    setBrkLength(5);
    setSeshLength(25);
    setTimerState("stopped");
    setTimerType("Session");
    setTimer(1500);
    setAlarmColor({ color: "white" });
    
    if (intervalID.current) {
      clearInterval(intervalID.current);
      intervalID.current = null;
    }

    if (audioBeep.current) {
      audioBeep.current.pause();
      audioBeep.current.currentTime = 0;
    }
  };

  return (
    <div>
      <div className="main-title">25 + 5 Clock</div>
      <LengthControl
        title={"Break Length"}
        length={brkLength}
        lengthControl={lengthControl}
        type="brkLength"
        oppositeType="Session"
      />
      <LengthControl
        title={"Session Length"}
        length={seshLength}
        lengthControl={lengthControl}
        type="seshLength"
        oppositeType="Break"
      />
      <div className="timer" style={alarmColor}>
        <div className="timer-wrapper">
          <div id="timer-label">{timerType}</div>
          <div id="time-left">{clockify()}</div>
        </div>
      </div>
      <div className="timer-control">
        <button id="start_stop" onClick={timerControl}>
          <i className="fa fa-play fa-2x" />
          <i className="fa fa-pause fa-2x" />
        </button>
        <button id="reset" onClick={reset}>
          <i className="fa fa-refresh fa-2x" />
        </button>
      </div>
      <audio
        id="beep"
        preload="auto"
        ref={audioBeep}
        src="https://cdn.freecodecamp.org/testable-projects-fcc/audio/BeepSound.wav"
      />
    </div>
  );
};

const LengthControl: React.FC<LengthControlProps> = ({ title, length, lengthControl, type, oppositeType }) => {
  return (
    <div>
      <div id={`${type}-label`}>{title}</div>
      <button
        id={`${type}-decrement`}
        onClick={() => lengthControl(type, "-", length, oppositeType)}
      >
        -
      </button>
      <span id={`${type}-length`}>{length}</span>
      <button
        id={`${type}-increment`}
        onClick={() => lengthControl(type, "+", length, oppositeType)}
      >
        +
      </button>
    </div>
  );
};

export default Timer;
