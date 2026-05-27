import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as postApi from '../api/postApi';
import * as categoryApi from '../api/categoryApi';
import './RabbitChatbot.css';

const MAX_FRAMES = 112;
const ANIMATION_SPEED = 30;
const TYPING_SPEED = 40;

const INITIAL_MESSAGE = '안녕하세요! 블로그에 오신 걸 환영해요 🐰\n궁금한 게 있으면 눌러주세요!';

const OPTIONS = [
  {
    id: 'write',
    label: '글 쓰는 법이 궁금해요',
    response:
      '상단의 녹색 ✏️ 글쓰기 버튼을 누르면 바로 작성할 수 있어요!\n제목, 카테고리, 내용을 입력하고 대표 이미지도 첨부할 수 있답니다.\n공개 범위도 전체 공개 / 이웃만 / 비공개 중에 고를 수 있어요.',
  },
  {
    id: 'categories',
    label: '어떤 카테고리가 있나요?',
    response: null,
  },
  {
    id: 'popular',
    label: '인기 글 보러가기',
    response: null,
  },
];

export default function RabbitChatbot() {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState(1);
  const [displayedMsg, setDisplayedMsg] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [phase, setPhase] = useState('initial');

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

  const fetchResponse = useCallback(async (opt) => {
    if (opt.id === 'categories') {
      try {
        const res = await categoryApi.getCategories(currentUser.id);
        const cats = (res.data ?? []).filter((c) => !c.parentId);
        if (cats.length === 0) {
          return '아직 카테고리가 없어요.\n내 블로그 탭에서 카테고리를 직접 만들 수 있어요! 📁';
        }
        const list = cats.map((c) => `• ${c.name}`).join('\n');
        return `현재 블로그에는 이런 카테고리들이 있어요!\n\n${list}\n\n내 블로그 탭에서 카테고리별로 모아볼 수 있어요 📚`;
      } catch {
        return '카테고리 정보를 불러오지 못했어요 😢\n잠시 후 다시 시도해주세요.';
      }
    }

    if (opt.id === 'popular') {
      try {
        const res = await postApi.getAllPosts('', 0, 100);
        const posts = (res.content ?? [])
          .sort((a, b) => b.likeCount - a.likeCount)
          .slice(0, 3);
        if (posts.length === 0) {
          return '아직 게시글이 없어요.\n첫 번째 글을 작성해볼까요? ✍️';
        }
        const list = posts
          .map((p, i) => `${i + 1}. ${p.title} — ❤️ ${p.likeCount}`)
          .join('\n');
        return `지금 가장 인기 있는 글이에요 🔥\n\n${list}\n\n목록에서 바로 확인해보세요!`;
      } catch {
        return '인기 글 정보를 불러오지 못했어요 😢\n잠시 후 다시 시도해주세요.';
      }
    }

    return opt.response;
  }, [currentUser]);

  const handleOption = useCallback(async (opt) => {
    setPhase('answered');
    typeMessage('잠깐만요, 불러올게요! 🐾', null);
    const response = await fetchResponse(opt);
    typeMessage(response, () => {
      setTimeout(() => setShowOptions(true), 400);
    });
  }, [typeMessage, fetchResponse]);

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
