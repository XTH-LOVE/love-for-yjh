import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, message, Tabs, Spin, Tag } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';

dayjs.extend(relativeTime);

/* ================================================================
   API Service
   ================================================================ */
const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { ...((options.headers as Record<string, string>) || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  const json = await res.json();
  if (json.code === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }
  return json;
};

/* ================================================================
   Tab 1: 配对测试
   ================================================================ */
const COMPATIBLE_NAMES: Record<string, string[]> = {
  'yjh': ['阳婧欢', '阳婧', '欢欢', '小欢'],
  'yj': ['阳婧欢', '阳婧', '欢欢'],
  'yang': ['阳婧欢', '阳婧'],
  'jing': ['阳婧欢', '欢欢'],
  'huan': ['阳婧欢', '阳婧'],
};

function getMatchScore(name1: string, name2: string): number {
  const combined = (name1 + name2).toLowerCase().replace(/\s/g, '');
  let score = 50;
  const loveChars = '爱恋心情感恩珍惜永恒承诺陪伴幸福甜蜜浪漫依恋思恋挂念眷恋';
  for (const ch of combined) { if (loveChars.includes(ch)) score += 3; }
  const chars = combined.split('');
  const unique = new Set(chars);
  if (unique.size < chars.length) score += (chars.length - unique.size) * 5;
  const combinedLower = combined.toLowerCase();
  if (combinedLower.includes('y') || combinedLower.includes('j') || combinedLower.includes('h')) score += 10;
  if (combinedLower.includes('love') || combinedLower.includes('ai')) score = 99;
  return Math.min(100, Math.max(10, score));
}

function getResultEmoji(score: number): string {
  if (score >= 95) return '💍';
  if (score >= 85) return '💕';
  if (score >= 75) return '💗';
  if (score >= 60) return '💖';
  if (score >= 40) return '💝';
  return '🌸';
}

function getResultText(score: number): string {
  if (score >= 95) return '天造地设，命中注定！💍';
  if (score >= 85) return '天生一对，甜蜜满分！💕';
  if (score >= 75) return '心有灵犀，非常合拍！💗';
  if (score >= 60) return '缘分不错，继续努力！💖';
  if (score >= 40) return '还需要多了解彼此 💝';
  return '慢慢来，缘分天注定 🌸';
}

function getResultColor(score: number): string {
  if (score >= 85) return '#ff6b9d';
  if (score >= 60) return '#ff9a44';
  return '#a55eea';
}

const FUNNY_TEXTS = [
  '据不可靠数据显示，你们上辈子...也是一对哦！',
  'TA 正在想你，正在想你，正在想你...（假装很准）',
  '系统检测到大量心动的信号 💓',
  '建议：立刻表白（如果还没表的话）',
  '温馨提示：珍惜眼前人 💕',
  '缘分指数正在上升中... 📈',
];

function MatchTestTab() {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState<{ score: number; text: string; emoji: string } | null>(null);

  const handleTest = () => {
    if (!name1.trim() || !name2.trim()) { message.warning('请输入两个名字'); return; }
    const score = getMatchScore(name1.trim(), name2.trim());
    setResult({ score, text: getResultText(score), emoji: getResultEmoji(score) });
  };

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Typography.Title level={3} style={{ color: '#ff6b9d', margin: 0 }}>💘 情侣配对测试</Typography.Title>
        <Typography.Text type="secondary">输入两个名字，测试你们的缘分指数 ✨</Typography.Text>
      </div>

      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input size="large" placeholder="第一个人的名字" value={name1} onChange={e => setName1(e.target.value)}
            style={{ borderRadius: 12, textAlign: 'center' }} prefix={<span>💑</span>}
            onPressEnter={() => document.getElementById('name2-input')?.focus()} />
          <div style={{ textAlign: 'center', fontSize: 20, color: '#ff6b9d' }}>💕</div>
          <Input id="name2-input" size="large" placeholder="第二个人的名字" value={name2} onChange={e => setName2(e.target.value)}
            style={{ borderRadius: 12, textAlign: 'center' }} prefix={<span>💑</span>}
            onPressEnter={handleTest} />
        </div>
        <Button type="primary" size="large" block icon={<HeartFilled />} onClick={handleTest}
          style={{ borderRadius: 24, height: 48, background: 'var(--gradient-love)', border: 'none', fontSize: 16, marginTop: 16 }}>
          测试缘分指数 💘
        </Button>
      </Card>

      {result && (
        <Card style={{ borderRadius: 16, background: `linear-gradient(135deg, ${getResultColor(result.score)} 0%, ${getResultColor(result.score)}99 100%)`, border: 'none', textAlign: 'center' }}
          styles={{ body: { padding: 28 } }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{result.emoji}</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {result.score}<span style={{ fontSize: 20 }}>%</span>
          </div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.95)', marginTop: 10, fontWeight: 600 }}>{result.text}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 12, fontStyle: 'italic' }}>
            {FUNNY_TEXTS[Math.floor(Math.random() * FUNNY_TEXTS.length)]}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ================================================================
   Tab 2: 记忆相册
   ================================================================ */
interface Photo { id: number; filename: string; title: string; created_at: string; }

function MemoryAlbumTab() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [showGuess, setShowGuess] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPhotos = async () => {
    try {
      const res = await apiFetch('/photos');
      if (res.code === 1) setPhotos(res.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadPhotos(); }, []);

  const pickRandomPhoto = () => {
    if (photos.length === 0) return;
    setCurrentPhoto(photos[Math.floor(Math.random() * photos.length)]);
    setShowGuess(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Typography.Title level={3} style={{ color: '#ff6b9d', margin: 0 }}>🧩 记忆相册</Typography.Title>
        <Typography.Text type="secondary">随机抽出一张照片，猜猜是哪一天？💕</Typography.Text>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Button type="primary" size="large" onClick={pickRandomPhoto} disabled={photos.length === 0}
          style={{ borderRadius: 24, height: 48, background: 'var(--gradient-love)', border: 'none', fontSize: 16 }}>
          🎲 {photos.length > 0 ? `随机抽一张（共${photos.length}张）` : '暂无照片'}
        </Button>
      </div>

      {currentPhoto && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <img src={`/api/photos/file/${currentPhoto.id}`} alt="记忆" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            {showGuess ? (
              <div>
                <Tag color="#ff6b9d" style={{ fontSize: 14, padding: '4px 12px', borderRadius: 12 }}>
                  📅 {dayjs(currentPhoto.created_at).format('YYYY-MM-DD')}
                </Tag>
                <div style={{ fontSize: 13, color: '#bbb', marginTop: 8 }}>{dayjs(currentPhoto.created_at).fromNow()}</div>
              </div>
            ) : (
              <Button onClick={() => setShowGuess(true)} style={{ borderRadius: 20 }}>
                🤔 猜猜是哪一天？
              </Button>
            )}
          </div>
        </Card>
      )}

      {photos.length === 0 && (
        <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}>
          <Typography.Text type="secondary">相册里还没有照片，快去上传吧！</Typography.Text>
        </Card>
      )}
    </div>
  );
}

/* ================================================================
   Tab 3: 爱情测试
   ================================================================ */
interface Question { id: number; question: string; emoji: string; options: { text: string; score: number; emoji: string }[]; }

const QUESTIONS: Question[] = [
  { id: 1, question: '你们第一次见面时，你心里的第一感觉是？', emoji: '✨', options: [{ text: '心跳加速，感觉命中注定', score: 4, emoji: '💘' }, { text: '觉得这个人很特别，想多了解', score: 3, emoji: '🥰' }, { text: '对眼神，感觉很对', score: 3, emoji: '👀' }, { text: '就是朋友该有的感觉', score: 1, emoji: '😊' }] },
  { id: 2, question: '你们之间最常做的甜蜜小事是什么？', emoji: '💕', options: [{ text: '一起看日落，什么都不说也很舒服', score: 4, emoji: '🌅' }, { text: '给对方发早安晚安，从不间断', score: 4, emoji: '🌙' }, { text: '突然给对方买喜欢的零食', score: 3, emoji: '🍡' }, { text: '一起看剧，互相依靠', score: 3, emoji: '🎬' }] },
  { id: 3, question: '阳婧欢的哪个特点最让你心动？', emoji: '🌸', options: [{ text: '她笑起来的样子，整个世界都亮了', score: 4, emoji: '😄' }, { text: '她在认真做事时专注的神情', score: 4, emoji: '💪' }, { text: '她偶尔会撒娇的可爱样子', score: 3, emoji: '🐱' }, { text: '她独立又温柔的气质', score: 4, emoji: '🌺' }] },
  { id: 4, question: '当你们吵架或有矛盾时，你通常怎么做？', emoji: '🤝', options: [{ text: '冷静下来主动道歉，因为爱比面子重要', score: 4, emoji: '🙏' }, { text: '给她时间，然后好好谈', score: 4, emoji: '💬' }, { text: '用行动弥补，买她喜欢的东西', score: 3, emoji: '🎁' }, { text: '缓一缓再说，避免说气话', score: 3, emoji: '⏸' }] },
  { id: 5, question: '你最想和阳婧欢一起完成的事是什么？', emoji: '🌈', options: [{ text: '带她去世界各地旅行，看遍天下风景', score: 4, emoji: '✈️' }, { text: '陪她实现她所有的小小心愿', score: 4, emoji: '🌠' }, { text: '一起建造一个属于我们的温暖的家', score: 4, emoji: '🏠' }, { text: '牵着手，把余生的每一天都过成节日', score: 5, emoji: '💒' }] },
];

const RESULTS = [
  { min: 0, max: 10, title: '萌芽之恋 🌱', color: '#10b981', desc: '关系刚刚开始，一切都充满新鲜感，慢慢来~' },
  { min: 11, max: 14, title: '甜蜜热恋中 💕', color: '#f97316', desc: '感情正处于甜蜜期，每天都很幸福！' },
  { min: 15, max: 18, title: '灵魂伴侣 💖', color: '#ff6b9d', desc: '你们是彼此最懂的人，心有灵犀！' },
  { min: 19, max: 21, title: '完美恋人 💍', color: '#a855f7', desc: '命中注定的一对！这份感情珍贵难得~' },
];

function LoveTestTab() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const current = QUESTIONS[currentIdx];
  const result = RESULTS.find(r => totalScore >= r.min && totalScore <= r.max) || RESULTS[0];

  const handleSelect = (score: number) => {
    if (selected !== null) return;
    setSelected(score);
    setTotalScore(prev => prev + score);
  };

  const handleNext = () => {
    if (selected === null) return;
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
      setTimeout(() => setShowResult(true), 800);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0); setTotalScore(0); setSelected(null); setFinished(false); setShowResult(false);
  };

  if (finished && !showResult) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 64, animation: 'heartBeat 1s ease-in-out infinite' }}>💖</div>
      <div style={{ fontSize: 18, color: '#ff6b9d', marginTop: 16 }}>正在计算...</div>
    </div>
  );

  if (finished && showResult) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 72, marginBottom: 12 }}>{result.title.split(' ')[0]}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: result.color, marginBottom: 12 }}>{result.title.split(' ')[1]}</div>
      <Card style={{ borderRadius: 16, border: `2px solid ${result.color}44`, background: `${result.color}11`, textAlign: 'center' }}
        styles={{ body: { padding: 24 } }}>
        <div style={{ fontSize: 15, color: '#555', lineHeight: 1.9 }}>{result.desc}</div>
      </Card>
      <Button type="primary" onClick={handleRestart} style={{ marginTop: 20, background: 'var(--gradient-love)', border: 'none', borderRadius: 20 }}>
        🔄 再测一次
      </Button>
    </div>
  );

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Typography.Title level={3} style={{ color: '#ff6b9d', margin: 0 }}>💝 爱情测试</Typography.Title>
        <Typography.Text type="secondary">回答5个问题，测测你们的爱情深度</Typography.Text>
      </div>

      <div style={{ fontSize: 13, color: '#bbb', marginBottom: 12 }}>第 {currentIdx + 1}/{QUESTIONS.length} 题</div>
      <Card style={{ borderRadius: 16, marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{current.emoji}</div>
          <Typography.Title level={4} style={{ color: '#ff6b9d', margin: 0 }}>{current.question}</Typography.Title>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {current.options.map((opt, i) => {
          const isSelected = selected === opt.score;
          return (
            <button key={i} onClick={() => handleSelect(opt.score)} disabled={selected !== null}
              style={{
                padding: '14px 16px', borderRadius: 14, border: 'none', cursor: selected !== null ? 'default' : 'pointer',
                fontSize: 14, textAlign: 'left',
                background: isSelected ? 'rgba(255,107,157,0.15)' : 'rgba(255,240,248,0.8)',
                color: isSelected ? '#ff6b9d' : '#555',
                fontWeight: isSelected ? 700 : 400,
                borderLeft: `4px solid ${isSelected ? '#ff6b9d' : '#eee'}`,
                transition: 'all 0.2s',
              }}>
              {opt.emoji} {opt.text}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <Button type="primary" onClick={handleNext} block style={{ marginTop: 20, background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 44 }}>
          {currentIdx < QUESTIONS.length - 1 ? '下一题 →' : '查看结果 🎉'}
        </Button>
      )}
    </div>
  );
}

/* ================================================================
   主页面 — 记忆乐园
   ================================================================ */
export default function MatchTestPage() {
  return (
    <div className="page-enter">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 8, animation: 'heartBeat 2s ease-in-out infinite' }}>🧩</div>
        <Typography.Title level={2} style={{
          margin: 0,
          background: 'var(--gradient-love)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          记忆乐园
        </Typography.Title>
        <div style={{ color: '#bbb', fontSize: 14, marginTop: 4 }}>
          配对测试 · 记忆相册 · 爱情测试
        </div>
      </div>

      <Tabs
        defaultActiveKey="match"
        size="small"
        items={[
          { key: 'match', label: '💘 配对测试', children: <MatchTestTab /> },
          { key: 'album', label: '🧩 记忆相册', children: <MemoryAlbumTab /> },
          { key: 'test', label: '💝 爱情测试', children: <LoveTestTab /> },
        ]}
      />
    </div>
  );
}
