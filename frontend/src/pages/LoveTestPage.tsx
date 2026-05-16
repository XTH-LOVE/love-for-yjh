import React, { useState, useRef } from 'react';
import { FireworksCanvas } from '../components/Fireworks';

/* ================================================================
   LOVE TEST PAGE — 爱情测试 💝
   ================================================================ */

interface Question {
  id: number;
  question: string;
  emoji: string;
  options: { text: string; score: number; emoji: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '你们第一次见面时，你心里的第一感觉是？',
    emoji: '✨',
    options: [
      { text: '心跳加速，感觉命中注定', score: 4, emoji: '💘' },
      { text: '觉得这个人很特别，想多了解', score: 3, emoji: '🥰' },
      { text: '对眼神，感觉很对', score: 3, emoji: '👀' },
      { text: '就是朋友该有的感觉', score: 1, emoji: '😊' },
    ],
  },
  {
    id: 2,
    question: '你们之间最常做的甜蜜小事是什么？',
    emoji: '💕',
    options: [
      { text: '一起看日落，什么都不说也很舒服', score: 4, emoji: '🌅' },
      { text: '给对方发早安晚安，从不间断', score: 4, emoji: '🌙' },
      { text: '突然给对方买喜欢的零食', score: 3, emoji: '🍡' },
      { text: '一起看剧，互相依靠', score: 3, emoji: '🎬' },
    ],
  },
  {
    id: 3,
    question: '阳婧欢的哪个特点最让你心动？',
    emoji: '🌸',
    options: [
      { text: '她笑起来的样子，整个世界都亮了', score: 4, emoji: '😄' },
      { text: '她在认真做事时专注的神情', score: 4, emoji: '💪' },
      { text: '她偶尔会撒娇的可爱样子', score: 3, emoji: '🐱' },
      { text: '她独立又温柔的气质', score: 4, emoji: '🌺' },
    ],
  },
  {
    id: 4,
    question: '当你们吵架或有矛盾时，你通常怎么做？',
    emoji: '🤝',
    options: [
      { text: '冷静下来主动道歉，因为爱比面子重要', score: 4, emoji: '🙏' },
      { text: '给她时间，然后好好谈', score: 4, emoji: '💬' },
      { text: '用行动弥补，买她喜欢的东西', score: 3, emoji: '🎁' },
      { text: '缓一缓再说，避免说气话', score: 3, emoji: '⏸' },
    ],
  },
  {
    id: 5,
    question: '你最想和阳婧欢一起完成的事是什么？',
    emoji: '🌈',
    options: [
      { text: '带她去世界各地旅行，看遍天下风景', score: 4, emoji: '✈️' },
      { text: '陪她实现她所有的小小心愿', score: 4, emoji: '🌠' },
      { text: '一起建造一个属于我们的温暖的家', score: 4, emoji: '🏠' },
      { text: '牵着手，把余生的每一天都过成节日', score: 5, emoji: '💒' },
    ],
  },
  {
    id: 6,
    question: '你们在一起多久了？',
    emoji: '📅',
    options: [
      { text: '半年以内，还在甜蜜期', score: 3, emoji: '🌱' },
      { text: '半年到一年，越来越懂对方', score: 3, emoji: '🌷' },
      { text: '一到三年，经历了风风雨雨', score: 4, emoji: '🌳' },
      { text: '三年以上，早已融为一体', score: 5, emoji: '🌲' },
    ],
  },
  {
    id: 7,
    question: '如果明天就是你们的最后一天，你最想做什么？',
    emoji: '💝',
    options: [
      { text: '紧紧抱着她，把所有的爱说给她听', score: 5, emoji: '🤗' },
      { text: '带她去第一次约会的地方，重温那段时光', score: 4, emoji: '🌹' },
      { text: '一起把所有愿望单上的事都做完', score: 4, emoji: '📝' },
      { text: '就在家里，平静地陪着她', score: 4, emoji: '🏡' },
    ],
  },
];

const RESULTS = [
  {
    min: 0, max: 14,
    title: '萌芽之恋 🌱',
    level: '初恋甜蜜',
    color: '#10b981',
    desc: '你们的感情正像一粒种子，在阳光与雨露下慢慢生根发芽。这段感情充满了新鲜感与美好的期待，好好珍惜每一个第一次，那些第一次永远值得被铭记。',
    advice: '保持你的真诚与热情，让她感受到你是认真的 💚',
    emoji: '🌱',
  },
  {
    min: 15, max: 21,
    title: '温暖相伴 ☀️',
    level: '相知阶段',
    color: '#f59e0b',
    desc: '你们已经越来越了解对方，感情在稳步升温。像阳光一样温暖，像清风一样舒适。你们在互相磨合中越来越默契，这是爱情最美好的阶段之一。',
    advice: '多创造两人独处的甜蜜时刻，让爱意在细节中流淌 🌤️',
    emoji: '☀️',
  },
  {
    min: 22, max: 27,
    title: '深情相恋 💕',
    level: '深度相爱',
    color: '#e91e63',
    desc: '你们的感情已经相当深厚，彼此已成为对方不可或缺的存在。风雨同舟，甘苦与共。在你眼里，她就是最美的风景；在她心里，你是最安全的港湾。',
    advice: '继续经营这份深情，把爱说出口，让她知道你的心 💗',
    emoji: '💕',
  },
  {
    min: 28, max: 35,
    title: '天定姻缘 💍',
    level: '命中注定',
    color: '#a78bfa',
    desc: '恭喜你们！这是一段命中注定的相遇，你们的缘分深到令人羡慕。你爱她胜过自己，她也是你今生最重要的人。这种感情，值得你用尽全力去守护，用一辈子去经营。',
    advice: '你已经找到了那个人，勇敢地许下承诺，让这段爱情走向永恒 👑',
    emoji: '👑',
  },
];

export default function LoveTestPage() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<(typeof RESULTS)[0] | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [animating, setAnimating] = useState(false);

  const totalScore = answers.reduce((a, b) => a + b, 0);

  const handleAnswer = (score: number) => {
    if (animating) return;
    setAnimating(true);
    const newAnswers = [...answers, score];
    setTimeout(() => {
      setAnimating(false);
      if (currentQ < QUESTIONS.length - 1) {
        setAnswers(newAnswers);
        setCurrentQ(currentQ + 1);
      } else {
        const total = newAnswers.reduce((a, b) => a + b, 0);
        const r = RESULTS.find(r => total >= r.min && total <= r.max) || RESULTS[RESULTS.length - 1];
        setAnswers(newAnswers);
        setResult(r);
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 5000);
      }
    }, 300);
  };

  const restart = () => {
    setStarted(false);
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  if (!started) {
    return (
      <div className="page-enter" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="love-card" style={{ textAlign: 'center', padding: '60px 32px', background: 'linear-gradient(160deg, #fff0f6, #fce4ec)' }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'heartBeat 2s ease-in-out infinite' }}>💝</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>
            爱情深度测试
          </h2>
          <p style={{ color: '#888', fontSize: 16, lineHeight: 1.9, marginBottom: 8 }}>
            通过 {QUESTIONS.length} 道专属问题<br />
            测量你和阳婧欢的爱情深度 💕
          </p>
          <p style={{ color: '#bbb', fontSize: 13, marginBottom: 32 }}>约需 3 分钟，选出最符合你内心的答案</p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {['❤️ 测测爱情深度', '💕 了解彼此', '🌟 专属报告'].map((tag, i) => (
              <span key={i} className="love-badge">{tag}</span>
            ))}
          </div>

          <button
            className="love-btn love-btn-primary"
            style={{ fontSize: 16, padding: '14px 48px', letterSpacing: 2 }}
            onClick={() => setStarted(true)}
          >
            开始测试 ❤️
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page-enter" style={{ maxWidth: 680, margin: '0 auto' }}>
        {showFireworks && <FireworksCanvas active />}
        <div className="love-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 80, marginBottom: 16, animation: 'bounce 1s ease-in-out infinite' }}>{result.emoji}</div>
          <div style={{ fontSize: 13, color: '#bbb', marginBottom: 8, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
            测试结果
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: result.color, marginBottom: 8 }}>
            {result.title}
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 20px', borderRadius: 20, background: `${result.color}15`, marginBottom: 24 }}>
            <span style={{ color: result.color, fontWeight: 700, fontSize: 14 }}>爱情等级：{result.level}</span>
          </div>

          {/* 分数条 */}
          <div style={{ maxWidth: 300, margin: '0 auto 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#aaa' }}>爱情指数</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: result.color }}>
                {Math.round((totalScore / 35) * 100)}%
              </span>
            </div>
            <div style={{ height: 10, background: 'rgba(0,0,0,0.06)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 5,
                background: `linear-gradient(90deg, ${result.color}, ${result.color}aa)`,
                width: `${Math.round((totalScore / 35) * 100)}%`,
                transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                animation: 'none',
              }} />
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(255,240,246,0.9), rgba(255,220,235,0.5))',
            borderRadius: 16, padding: '20px 24px', marginBottom: 24,
            border: '1px solid rgba(255,107,157,0.15)', textAlign: 'left',
          }}>
            <p style={{ fontSize: 16, lineHeight: 1.9, color: '#555', marginBottom: 16 }}>{result.desc}</p>
            <div style={{ fontSize: 14, color: result.color, fontWeight: 600, padding: '10px 16px', background: `${result.color}10`, borderRadius: 10 }}>
              💡 {result.advice}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: '#bbb', marginBottom: 12 }}>你们的专属数据</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: '总得分', value: `${totalScore}分`, color: result.color },
                { label: '题目数', value: `${QUESTIONS.length}题`, color: '#3b82f6' },
                { label: '爱情深度', value: result.level, color: '#e91e63' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px 20px', borderRadius: 14, background: 'rgba(255,240,246,0.7)', border: `1px solid ${s.color}25`, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, fontSize: 15, color: '#c2185b', fontStyle: 'italic', lineHeight: 1.8 }}>
            "阳婧欢，无论测试结果如何，我对你的爱都是满分，永远是满分 💖"
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="love-btn love-btn-ghost" style={{ fontSize: 14 }} onClick={restart}>🔄 再测一次</button>
            <button className="love-btn love-btn-primary" style={{ fontSize: 14 }} onClick={() => navigator.clipboard?.writeText(`我和阳婧欢的爱情测试结果：${result.title}，爱情指数 ${Math.round((totalScore / 35) * 100)}% 💖`).then(() => {}).catch(() => {})}>
              📤 分享结果
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  return (
    <div className="page-enter" style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* 进度 */}
      <div className="love-card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#aaa' }}>问题 {currentQ + 1} / {QUESTIONS.length}</span>
          <span style={{ fontSize: 13, color: '#ff6b9d', fontWeight: 700 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,107,157,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: 'var(--gradient-love)',
            width: `${progress}%`, transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>
      </div>

      {/* 问题卡 */}
      <div className="love-card" style={{
        marginBottom: 16, textAlign: 'center', padding: '40px 32px',
        animation: animating ? 'slideInFromRight 0.3s ease' : 'slideInUp 0.4s ease',
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{q.emoji}</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#333', lineHeight: 1.6, marginBottom: 0 }}>
          {q.question}
        </h3>
      </div>

      {/* 选项 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => (
          <button
            key={i}
            className="love-card"
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
              cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              animation: `fadeInLeft ${0.1 + i * 0.08}s ease`,
              background: 'rgba(255,255,255,0.9)',
            }}
            onClick={() => handleAnswer(opt.score)}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(6px) scale(1.01)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(255,45,120,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #ffe0ed, #ffbdd5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>
              {opt.emoji}
            </div>
            <span style={{ fontSize: 15, color: '#333', fontWeight: 500, lineHeight: 1.5 }}>{opt.text}</span>
          </button>
        ))}
      </div>

      {currentQ > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 13 }}
            onClick={() => { setCurrentQ(currentQ - 1); setAnswers(answers.slice(0, -1)); }}
          >
            ← 返回上一题
          </button>
        </div>
      )}
    </div>
  );
}
