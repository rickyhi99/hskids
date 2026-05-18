import { useState, useEffect, useRef, useCallback } from 'react';
import './RabbitAnimation.css';

const ANIMATIONS = { ID: 'id', PW: 'pw', SUCCESS: 'success' };

const ID_FRAME_COUNT = 10;
const PW_FRAME_COUNT = 16;
const SUCCESS_FRAME_COUNT = 38;

function buildFrames() {
  const id = Array.from({ length: ID_FRAME_COUNT }, (_, i) =>
    `${process.env.PUBLIC_URL}/assets/img/rabbit/rabbitid${i + 1}.png`
  );
  const pw = Array.from({ length: PW_FRAME_COUNT }, (_, i) =>
    `${process.env.PUBLIC_URL}/assets/img/rabbit/rabbitpw${i + 1}.png`
  );
  const success = Array.from({ length: SUCCESS_FRAME_COUNT }, (_, i) =>
    `${process.env.PUBLIC_URL}/assets/img/rabbit/rabbitgo (${i + 1}).png`
  );
  return { id, pw, success };
}

const frames = buildFrames();

export default function RabbitAnimation({ idLength, pwFocused, loginSuccess, onAnimationEnd }) {
  const [currentSrc, setCurrentSrc] = useState(frames.id[0]);
  const currentAnimRef = useRef(null);
  const rafIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  const clearAnim = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    currentAnimRef.current = null;
  }, []);

  const playAnimation = useCallback((frameList, startIdx, endIdx, onComplete) => {
    clearAnim();
    const direction = startIdx <= endIdx ? 1 : -1;
    let idx = startIdx;
    lastFrameTimeRef.current = 0;

    const animate = (timestamp) => {
      const frameDelay = 40;
      if (!lastFrameTimeRef.current || timestamp - lastFrameTimeRef.current >= frameDelay) {
        setCurrentSrc(frameList[idx]);
        idx += direction;
        lastFrameTimeRef.current = timestamp;
        if ((direction > 0 && idx > endIdx) || (direction < 0 && idx < endIdx)) {
          rafIdRef.current = null;
          currentAnimRef.current = null;
          if (onComplete) onComplete();
          return;
        }
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);
  }, [clearAnim]);

  const updateIdFrame = useCallback(() => {
    if (currentAnimRef.current === ANIMATIONS.PW) return;
    if (loginSuccess) return;
    const maxIdx = frames.id.length - 1;
    const frameIdx = Math.min(Math.floor(idLength / 2), maxIdx);
    setCurrentSrc(frames.id[frameIdx]);
  }, [idLength, loginSuccess]);

  // PW 포커스 변화
  useEffect(() => {
    if (loginSuccess) return;
    if (pwFocused) {
      currentAnimRef.current = ANIMATIONS.PW;
      playAnimation(frames.pw, 0, frames.pw.length - 1, null);
    } else {
      currentAnimRef.current = ANIMATIONS.PW;
      playAnimation(frames.pw, frames.pw.length - 1, 0, () => {
        updateIdFrame();
        currentAnimRef.current = ANIMATIONS.ID;
      });
    }
  }, [pwFocused]); // eslint-disable-line react-hooks/exhaustive-deps

  // ID 길이 변화
  useEffect(() => {
    updateIdFrame();
  }, [updateIdFrame]);

  // 로그인 성공
  useEffect(() => {
    if (loginSuccess) {
      currentAnimRef.current = ANIMATIONS.SUCCESS;
      playAnimation(frames.success, 0, frames.success.length - 1, () => {
        if (onAnimationEnd) onAnimationEnd();
      });
    }
  }, [loginSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => clearAnim();
  }, [clearAnim]);

  return <img className="rabbit" src={currentSrc} alt="rabbit" />;
}
