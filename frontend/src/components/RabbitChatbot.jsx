import { useState, useEffect, useRef, useCallback } from 'react';
import './RabbitChatbot.css';

const MAX_FRAMES = 112;
const ANIMATION_SPEED = 30;
const TYPING_SPEED = 40;

const INITIAL_MESSAGE = '안녕하세요! 블로그에 오신 걸 환영해요 🐰\n궁금한 게 있으면 눌러주세요!';

const OPTIONS = [
  {
    label: '글 쓰는 법이 궁금해요',
    response:
      '상단의 녹색 ✏️ 글쓰기 버튼을 누르면 바로 작성할 수 있어요!\n제목, 카테고리, 내용을 입력하고 대표 이미지도 첨부할 수 있답니다.\n공개 범위도 전체 공개 / 팔로워만 / 비공개 중에 고를 수 있어요.',
  },
  {
    label: '어떤 카테고리가 있나요?',
    response:
      '현재 블로그에는 이런 카테고리들이 있어요!\n\n• React  • CSS  • TypeScript\n• Git  • 성능  • 개발 문화  • 일상\n\n관심 있는 태그의 글들을 모아볼 수 있어요 📚',
  },
  {
    label: '인기 글 보러가기',
    response:
      '지금 가장 인기 있는 글이에요 🔥\n\n1. CSS Grid vs Flexbox — 좋아요 203개\n2. Git 브랜치 전략 — 좋아요 176개\n3. 리액트로 블로그 만들기 — 좋아요 142개\n\n목록에서 바로 확인해보세요!',
  },
];

export default function RabbitChatbot() {
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState(1);
  const [displayedMsg, setDisplayedMsg] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [phase, setPhase] = useState('initial'); // 'initial' | 'answered'

  const isTypingRef = useRef(false);
  const animTimerRef = useRef(null);
  const typeTimerRef = useRef(null);
  const contentRef = useRef(null);

  const animateRabbit = useCallback(() => {
    clearInterval(animTimerRef.current);
    let f = 1;
    animTimerRef.current = setInterval(() => {
      f = f < MAX_FRAMES ? f + 1 : 1;
      setFrame(f);
      if (!isTypingRef.current && f === MAX_FRAMES) {
        clearInterval(animTimerRef.current);
      }
    }, ANIMATION_SPEED);
  }, []);

  const typeMessage = useCallback((msg, afterDone) => {
    clearInterval(typeTimerRef.current);
    setDisplayedMsg('');
    setShowOptions(false);
    isTypingRef.current = true;
    animateRabbit();

    let i = 0;
    typeTimerRef.current = setInterval(() => {
      if (i < msg.length) {
        setDisplayedMsg(msg.slice(0, i + 1));
        i++;
        contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight });
      } else {
        clearInterval(typeTimerRef.current);
        isTypingRef.current = false;
        afterDone?.();
      }
    }, TYPING_SPEED);
  }, [animateRabbit]);

  // open이 true가 될 때 phase는 항상 'initial'(handleOpen에서 같이 세팅)
  useEffect(() => {
    if (open) {
      typeMessage(INITIAL_MESSAGE, () => {
        setTimeout(() => setShowOptions(true), 400);
      });
    }
    return () => {
      clearInterval(animTimerRef.current);
      clearInterval(typeTimerRef.current);
    };
  }, [open, typeMessage]);

  const handleOption = (opt) => {
    setPhase('answered');
    typeMessage(opt.response, () => {
      setTimeout(() => setShowOptions(true), 400);
    });
  };

  const handleRetry = () => {
    setPhase('initial');
    typeMessage(INITIAL_MESSAGE, () => {
      setTimeout(() => setShowOptions(true), 400);
    });
  };

  const handleClose = () => {
    setOpen(false);
    clearInterval(animTimerRef.current);
    clearInterval(typeTimerRef.current);
    isTypingRef.current = false;
    setFrame(1);
    setDisplayedMsg('');
    setShowOptions(false);
    setPhase('initial');
  };

  const handleOpen = () => {
    setOpen(true);
    setPhase('initial');
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      {!open && (
        <button
          className="rabbit-toggle-btn"
          onClick={handleOpen}
          aria-label="토끼 챗봇 열기"
          title="안녕하세요! 뭔가 궁금한 게 있으면 눌러주세요!"
        >
          <img
            src={`/assets/img/rabbit/rabbitgo (1).png`}
            alt="토끼"
            className="rabbit-toggle-img"
          />
        </button>
      )}

      {/* 챗봇 패널 */}
      {open && (
        <div className="rabbit-panel">
          <div className="rabbit-avatar">
            <div className="rabbit-face">
              <img
                src={`/assets/img/rabbit/rabbitchat (${frame}).png`}
                alt="토끼 캐릭터"
                className="rabbit-img"
              />
            </div>
          </div>

          <div className="rabbit-bubble">
            <div className="bubble-content" ref={contentRef}>
              <p
                className="bubble-text"
                dangerouslySetInnerHTML={{
                  __html: displayedMsg.replace(/\n/g, '<br/>'),
                }}
              />

              {showOptions && (
                <div className="option-list">
                  {phase === 'initial'
                    ? OPTIONS.map((opt, i) => (
                        <button
                          key={i}
                          className="option-btn"
                          onClick={() => handleOption(opt)}
                        >
                          {opt.label}
                        </button>
                      ))
                    : (
                        <button className="retry-btn" onClick={handleRetry}>
                          다른 것도 궁금해요 🐾
                        </button>
                      )}
                </div>
              )}
            </div>
          </div>

          <button className="rabbit-close-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      )}
    </>
  );
}
