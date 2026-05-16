import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, message, Modal, Tag } from 'antd';
import { FireworksCanvas } from '../components/Fireworks';
import dayjs from 'dayjs';

/* ================================================================
   LETTER PAGE — 爱的信箱 💌
   ================================================================ */

const LETTER_TEMPLATES = [
  {
    title: '第一封情书',
    content: `亲爱的阳婧欢，

写下这封信的时候，我的心里有说不完的话。

自从遇见你，我才真正明白什么叫做"命中注定"。你的笑容，你的眼神，你说话时的样子，都深深刻在我的心里，成了我这辈子最美好的画面。

每天早上睁开眼睛，第一个想到的就是你。每天晚上入睡前，最后的念想也是你。你占据了我所有的日与夜，却让我甘之如饴。

我不知道命运为何让我们相遇，但我知道，遇见你是我这辈子做过最幸运的事。无论未来走多远，我都想牵着你的手，一步一步，慢慢走。

爱你的人
敬上`,
    emoji: '💌',
    color: 'linear-gradient(135deg, #fff0f6, #fce4ec)',
  },
  {
    title: '想念你的夜晚',
    content: `阳婧欢，

今晚的月亮特别圆，我不禁想，你此刻在做什么？

思念一个人是什么感觉？是胸口那股说不清的暖意，是嘴角不由自主上扬的弧度，是脑海里反复出现的那张脸。

这种感觉，我以前不懂，直到遇见你。

我好想你。不是那种轰轰烈烈的想，而是平静又深切地想——想和你分享今天发生的每一件小事，想听你说说你的一天，想在你身边，什么都不做，只是陪着。

月光很美，但没有你美。

永远爱你`,
    emoji: '🌙',
    color: 'linear-gradient(135deg, #1a0533, #330055)',
  },
  {
    title: '未来的约定',
    content: `未来的我们，

当你看到这封信的时候，我不知道我们已经走过了多少个日日夜夜。但有一件事我可以确定——我对你的爱，只会越来越深，永远不会改变。

我想和你约定：
☀️ 每天早晨，我都会告诉你，今天也爱你
🌙 每个夜晚，我都会守护你，让你安心入睡
🌹 每个节日，我都会陪在你身边，让每一天都成为节日
💍 有一天，我会亲手把戒指戴在你的手上

无论生活给我们什么，我都想和你一起面对。有你在的地方，就是我的家。

爱你到永远`,
    emoji: '🌟',
    color: 'linear-gradient(135deg, #fff9c4, #fff3e0)',
  },
];

const LOCAL_LETTERS_KEY = 'love_letters_yjh';

interface Letter {
  id: number;
  title: string;
  content: string;
  emoji: string;
  createdAt: string;
  isRead: boolean;
  sealed: boolean;
}

export default function LetterPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [writing, setWriting] = useState(false);
  const [viewing, setViewing] = useState<Letter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [sealed, setSealed] = useState(false);
  const [openAnimation, setOpenAnimation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_LETTERS_KEY);
    if (saved) {
      setLetters(JSON.parse(saved));
    }
  }, []);

  const saveLetter = () => {
    if (!title.trim()) { message.error('请给信件起个标题 💌'); return; }
    if (!content.trim()) { message.error('写点内容吧，哪怕一行字都好 ✨'); return; }
    const newLetter: Letter = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      emoji: '💌',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
      isRead: false,
      sealed,
    };
    const updated = [newLetter, ...letters];
    setLetters(updated);
    localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
    setWriting(false);
    setTitle(''); setContent(''); setSealed(false); setSelectedTemplate(null);
    if (sealed) {
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 4000);
    }
    message.success(sealed ? '💌 信件已封存！等待开启的那一刻...' : '📝 信件已保存！');
  };

  const openLetter = (letter: Letter) => {
    if (letter.sealed && !letter.isRead) {
      setOpenAnimation(true);
      setTimeout(() => {
        setOpenAnimation(false);
        const updated = letters.map(l => l.id === letter.id ? { ...l, isRead: true } : l);
        setLetters(updated);
        localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
        setViewing({ ...letter, isRead: true });
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 3000);
      }, 1500);
    } else {
      const updated = letters.map(l => l.id === letter.id ? { ...l, isRead: true } : l);
      setLetters(updated);
      localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
      setViewing(letter);
    }
  };

  const deleteLetter = (id: number) => {
    const updated = letters.filter(l => l.id !== id);
    setLetters(updated);
    localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
    message.success('已删除');
  };

  const applyTemplate = (idx: number) => {
    const t = LETTER_TEMPLATES[idx];
    setTitle(t.title);
    setContent(t.content);
    setSelectedTemplate(idx);
  };

  const unreadCount = letters.filter(l => !l.isRead).length;

  return (
    <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto' }}>
      {showFireworks && <FireworksCanvas active />}

      {/* 开信动画 */}
      {openAnimation && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9995,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
        }}>
          <div style={{ fontSize: 120, animation: 'heartBeat 0.8s ease-in-out infinite' }}>💌</div>
        </div>
      )}

      {/* 头部 */}
      <div className="love-card" style={{ marginBottom: 24, textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(160deg, #fff0f6, #fce4ec)' }}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: 'bounce 2s ease-in-out infinite' }}>💌</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          爱的信箱
        </h2>
        <p style={{ color: '#aaa', fontSize: 15, marginBottom: 0 }}>
          把最想说的话，写成一封信，封存在这里，等待打开的那一刻
        </p>
        {unreadCount > 0 && (
          <div style={{ marginTop: 12 }}>
            <span style={{ background: 'var(--gradient-love)', color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              📬 有 {unreadCount} 封未读信件
            </span>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          className="love-btn love-btn-primary"
          style={{ fontSize: 15, padding: '12px 32px' }}
          onClick={() => { setWriting(true); setTitle(''); setContent(''); setSelectedTemplate(null); setSealed(false); }}
        >
          ✍️ 写一封信
        </button>
        <div style={{ color: '#bbb', fontSize: 13, display: 'flex', alignItems: 'center' }}>
          共 {letters.length} 封信件
        </div>
      </div>

      {/* 信件列表 */}
      {letters.length === 0 ? (
        <div className="love-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 80, marginBottom: 16, opacity: 0.5 }}>📭</div>
          <h3 style={{ color: '#e91e63', marginBottom: 8 }}>信箱还是空的</h3>
          <p style={{ color: '#bbb', marginBottom: 24 }}>写下第一封信吧，把最想说的话，留在这里</p>
          <button className="love-btn love-btn-primary" onClick={() => setWriting(true)}>
            ✍️ 写第一封信
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {letters.map((letter, idx) => (
            <div
              key={letter.id}
              className="love-card"
              style={{
                cursor: 'pointer',
                animation: `fadeInUp ${0.1 + idx * 0.05}s ease`,
                background: letter.sealed && !letter.isRead
                  ? 'linear-gradient(135deg, #fff0f6, #fce4ec)'
                  : 'rgba(255,255,255,0.85)',
                border: letter.sealed && !letter.isRead ? '2px solid rgba(255,107,157,0.4)' : undefined,
                position: 'relative',
                overflow: 'visible',
              }}
              onClick={() => openLetter(letter)}
            >
              {letter.sealed && !letter.isRead && (
                <div style={{
                  position: 'absolute', top: -8, right: 16,
                  background: 'var(--gradient-love)', color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(255,45,120,0.3)',
                }}>
                  🔒 未开封
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  background: letter.sealed && !letter.isRead ? 'var(--gradient-love)' : 'linear-gradient(135deg, #ffe0ed, #ffbdd5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, boxShadow: '0 4px 16px rgba(255,107,157,0.2)',
                }}>
                  {letter.sealed && !letter.isRead ? '💌' : '📖'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {letter.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#bbb', marginBottom: 4 }}>{letter.createdAt}</div>
                  <div style={{ fontSize: 13, color: '#999', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {letter.sealed && !letter.isRead ? '点击开启这封信...' : letter.content.slice(0, 80) + (letter.content.length > 80 ? '...' : '')}
                  </div>
                </div>
                <button
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,107,157,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#ff6b9d', flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); deleteLetter(letter.id); }}
                  title="删除"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 写信弹窗 */}
      <Modal
        open={writing}
        onCancel={() => setWriting(false)}
        footer={null}
        width={680}
        centered
        title={<span style={{ color: '#e91e63', fontWeight: 800, fontSize: 18 }}>✍️ 写一封信</span>}
        styles={{ body: { padding: '20px 0' } }}
      >
        {/* 模板选择 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 10, fontWeight: 600 }}>💡 选择模板快速开始</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LETTER_TEMPLATES.map((t, i) => (
              <button
                key={i}
                style={{
                  padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
                  background: selectedTemplate === i ? 'var(--gradient-love)' : 'rgba(255,107,157,0.08)',
                  color: selectedTemplate === i ? '#fff' : '#e91e63',
                  transition: 'all 0.25s',
                  fontWeight: 600,
                }}
                onClick={() => applyTemplate(i)}
              >
                {t.emoji} {t.title}
              </button>
            ))}
            {selectedTemplate !== null && (
              <button
                style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, background: 'rgba(200,200,200,0.1)', color: '#bbb' }}
                onClick={() => { setTitle(''); setContent(''); setSelectedTemplate(null); }}
              >
                ✕ 清空
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="给这封信起个名字..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ fontSize: 16, fontWeight: 600, borderRadius: 12, height: 46 }}
            maxLength={50}
          />
        </div>
        <Input.TextArea
          placeholder="亲爱的阳婧欢，想对你说的话都写在这里吧...&#10;&#10;你的心里话，你的想念，你的承诺，你的爱..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={12}
          style={{ fontSize: 15, lineHeight: 1.9, borderRadius: 12, resize: 'none', borderColor: 'rgba(255,107,157,0.3)' }}
          maxLength={5000}
          showCount
        />
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <div
              style={{
                width: 40, height: 22, borderRadius: 11, transition: 'all 0.3s',
                background: sealed ? 'var(--gradient-love)' : '#e5e7eb',
                position: 'relative', flexShrink: 0,
              }}
              onClick={() => setSealed(!sealed)}
            >
              <div style={{
                position: 'absolute', top: 2, left: sealed ? 20 : 2, width: 18, height: 18,
                borderRadius: '50%', background: '#fff', transition: 'all 0.3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }} />
            </div>
            <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>
              {sealed ? '🔒 封存信件（神秘！点击开启才能读）' : '📖 直接保存（随时可看）'}
            </span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="love-btn love-btn-ghost" style={{ fontSize: 14 }} onClick={() => setWriting(false)}>取消</button>
            <button className="love-btn love-btn-primary" style={{ fontSize: 14 }} onClick={saveLetter}>
              {sealed ? '💌 封存！' : '📝 保存'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 阅读弹窗 */}
      <Modal
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={null}
        centered
        width={620}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>📖</span>
            <span style={{ color: '#e91e63', fontWeight: 800, fontSize: 17 }}>{viewing?.title}</span>
          </div>
        }
        styles={{ body: { paddingTop: 8 } }}
      >
        {viewing && (
          <div>
            <div style={{ color: '#bbb', fontSize: 12, marginBottom: 20 }}>{viewing.createdAt}</div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,240,246,0.8), rgba(255,220,235,0.5))',
              borderRadius: 16, padding: '24px 28px',
              border: '1px solid rgba(255,107,157,0.15)',
              fontSize: 16, lineHeight: 2, color: '#444',
              whiteSpace: 'pre-wrap', fontFamily: "'PingFang SC', 'Noto Serif SC', serif",
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', top: 8, left: 16, fontSize: 60, color: 'rgba(255,107,157,0.08)', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</span>
              {viewing.content}
              <span style={{ position: 'absolute', bottom: 8, right: 16, fontSize: 60, color: 'rgba(255,107,157,0.08)', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 20, color: '#ff6b9d', fontSize: 14 }}>
              — 写给阳婧欢，永远爱你 💖
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
