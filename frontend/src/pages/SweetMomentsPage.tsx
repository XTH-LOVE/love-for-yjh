import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, Card, Button, Modal, Form, Input, message, Empty, List, Typography } from 'antd';
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
   情话墙 — 双向情话
   ================================================================ */
const STATIC_NOTES = [
  { content: '缐廷华，遇见你是我这辈子最幸运的事', cat: 'love', from: 'xt' },
  { content: '阳婧欢，感谢生命中遇见你，每一天都因你而美好', cat: 'love', from: 'yjh' },
  { content: '从今以后，每一个日出日落，我都想和你一起看', cat: 'love', from: 'xt' },
  { content: '你的笑容是我见过最美的风景，我愿意用一辈子去守护', cat: 'love', from: 'xt' },
  { content: '世界上最动听的三个字不是"我爱你"，而是你的名字', cat: 'love', from: 'yjh' },
  { content: '你是我平淡生活里的那束光，照亮了我所有的日子', cat: 'love', from: 'yjh' },
  { content: '如果全世界都对你恶意相加，我就对你说上一世情话', cat: 'romantic', from: 'xt' },
  { content: '我想和你一起，从晨光微露走到星光漫天', cat: 'romantic', from: 'xt' },
  { content: '余生很长，我只想牵着你的手慢慢走', cat: 'future', from: 'yjh' },
  { content: '每天醒来第一件事就是想你，睡前最后一件事也是想你', cat: 'love', from: 'xt' },
  { content: '你是我藏在心底最深处的秘密，也是我最想炫耀的骄傲', cat: 'love', from: 'yjh' },
  { content: '喜欢你这件事，是我做过最持久的决定', cat: 'love', from: 'xt' },
  { content: '你的眼睛里住着星星，每次看你我都会忍不住微笑', cat: 'romantic', from: 'yjh' },
  { content: '我想给你所有的温柔，因为你值得世间一切美好', cat: 'love', from: 'xt' },
  { content: '和你在一起的每一秒，都是我人生中最珍贵的时刻', cat: 'love', from: 'yjh' },
  { content: '无论刮风下雨，我都会在你身边，永远不离不弃', cat: 'promise', from: 'xt' },
  { content: '这辈子最浪漫的事，就是和你一起慢慢变老', cat: 'future', from: 'yjh' },
  { content: '你让我相信，这个世界上真的有一见钟情和命中注定', cat: 'romantic', from: 'xt' },
  { content: '缐廷华会永远守护阳婧欢，这是我的承诺', cat: 'promise', from: 'xt' },
  { content: '阳婧欢，你就是我今生最大的幸福和骄傲', cat: 'love', from: 'xt' },
  { content: '我想和你一起做饭、散步、看电影，平凡的日子因为有你而闪耀', cat: 'future', from: 'yjh' },
  { content: '不管未来有多远，只要有你在身边，我就什么都不怕', cat: 'future', from: 'xt' },
  { content: '你是我写过最美的情诗，不需要任何修饰，你就是最好的', cat: 'romantic', from: 'yjh' },
  { content: '我愿意把全世界最好的都给你，因为你值得', cat: 'love', from: 'xt' },
  { content: '我们一起创造的每一个回忆，都是我最珍贵的宝藏', cat: 'love', from: 'yjh' },
];

const CATEGORIES = ['all', 'love', 'romantic', 'future', 'promise'];

function LoveWordsTab() {
  const [notes, setNotes] = useState(STATIC_NOTES);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/love/notes');
        if (res.code === 200 && res.data?.length > 0) {
          setNotes(res.data.map((n: any) => ({ 
            content: n.content, 
            cat: n.category || 'love',
            from: 'xt'
          })));
        }
      } catch {}
    })();
  }, []);

  const filtered = activeCategory === 'all' ? notes : notes.filter(n => n.cat === activeCategory);

  return (
    <div>
      {/* 分类标签 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '5px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: activeCategory === cat ? 'var(--gradient-love)' : 'rgba(255,107,157,0.08)',
              color: activeCategory === cat ? '#fff' : '#999',
              transition: 'all 0.2s',
            }}
          >
            {cat === 'all' ? '全部' : cat === 'love' ? '💕 爱' : cat === 'romantic' ? '🌹 浪漫' : cat === 'future' ? '🌟 未来' : '🤝 承诺'}
          </button>
        ))}
      </div>

      {/* 随机展示模式 */}
      {currentIdx !== null ? (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, rgba(255,240,248,0.9), rgba(255,220,238,0.7))', borderRadius: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 120, opacity: 0.05 }}>💖</div>
          <div style={{ position: 'absolute', bottom: -20, left: -20, fontSize: 100, opacity: 0.05 }}>💕</div>
          <div style={{
            fontSize: 56, marginBottom: 20,
            animation: 'heartBeat 2s ease-in-out infinite',
          }}>💖</div>
          <div style={{ 
            fontSize: 14, color: '#e91e63', marginBottom: 16, fontWeight: 600,
            padding: '4px 16px', background: 'rgba(255,107,157,0.1)', borderRadius: 20, display: 'inline-block'
          }}>
            {filtered[currentIdx]?.from === 'xt' ? '🌟 缐廷华说' : '🌸 阳婧欢说'}
          </div>
          <Typography.Text style={{
            fontSize: 20, lineHeight: 2, color: '#555', display: 'block',
            fontStyle: 'italic', maxWidth: 480, margin: '0 auto', fontWeight: 500,
          }}>
            "{filtered[currentIdx]?.content}"
          </Typography.Text>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentIdx(Math.floor(Math.random() * filtered.length))}
              style={{
                padding: '10px 28px', borderRadius: 24, border: '2px solid rgba(255,107,157,0.3)',
                background: 'transparent', color: '#ff6b9d', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >🔀 换一句</button>
            <button
              onClick={() => setCurrentIdx(null)}
              style={{
                padding: '10px 28px', borderRadius: 24, border: 'none',
                background: 'var(--gradient-love)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}
            >📜 查看全部</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map((note, i) => (
            <div
              key={i}
              onClick={() => { setCurrentIdx(i); }}
              style={{
                background: 'rgba(255,240,248,0.8)',
                border: '1px solid rgba(255,107,157,0.15)',
                borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: `fadeInUp ${0.1 + (i % 6) * 0.07}s ease`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,157,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{note.from === 'xt' ? '🌟' : '🌸'}</span>
                <span style={{ fontSize: 11, color: '#ccc', fontWeight: 600 }}>{note.from === 'xt' ? '缐廷华' : '阳婧欢'}</span>
              </div>
              <Typography.Text style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>
                {note.content}
              </Typography.Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   悄悄话墙 — 双向消息
   ================================================================ */
interface Whisper {
  id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  from_nickname?: string;
  to_nickname?: string;
  from_username?: string;
}

function WhisperTab() {
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState<Whisper[]>([]);
  const [sent, setSent] = useState<Whisper[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [preview, setPreview] = useState<Whisper | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recvRes, sentRes] = await Promise.all([
        apiFetch('/whispers/received'),
        apiFetch('/whispers/sent'),
      ]);
      if (recvRes.code === 200) setReceived(recvRes.data || []);
      if (sentRes.code === 200) setSent(sentRes.data || []);
    } catch {
      message.error('加载失败');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const markRead = async (id: number) => {
    await apiFetch(`/whispers/${id}/read`, { method: 'PUT' });
    setReceived(prev => prev.map(w => w.id === id ? { ...w, is_read: true } : w));
  };

  const handleSend = async (values: any) => {
    setSaving(true);
    try {
      await apiFetch('/whispers', {
        method: 'POST',
        body: JSON.stringify({ toUsername: values.toUsername, content: values.content }),
      });
      message.success('悄悄话已送达 💕');
      setSendOpen(false);
      form.resetFields();
      loadData();
      apiFetch('/achievements/check', { method: 'POST' });
    } catch (e: any) {
      message.error(e?.message || '发送失败');
    }
    setSaving(false);
  };

  const data = tab === 'received' ? received : sent;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'received', label: '收到的 💌', count: received.filter(w => !w.is_read).length },
            { key: 'sent', label: '发出的 ✉️', count: 0 },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: tab === t.key ? 'var(--gradient-love)' : 'rgba(255,107,157,0.08)',
                color: tab === t.key ? '#fff' : '#999',
                position: 'relative',
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{ 
                  position: 'absolute', top: -4, right: -4,
                  background: '#ff4d4f', color: '#fff', borderRadius: '50%',
                  width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <Button type="primary" onClick={() => setSendOpen(true)} style={{
          background: 'var(--gradient-love)', border: 'none', borderRadius: 20, fontWeight: 600,
        }}>
          ✨ 说悄悄话
        </Button>
      </div>

      <List
        loading={loading}
        dataSource={data}
        locale={{ emptyText: <div style={{ textAlign: 'center', padding: 60 }}><div style={{ fontSize: 64, marginBottom: 12 }}>💭</div><div style={{ color: '#bbb', fontSize: 16, marginBottom: 4 }}>还没有悄悄话</div><div style={{ color: '#ccc', fontSize: 13 }}>点击右上角，说一句悄悄话吧</div></div> }}
        renderItem={(w: Whisper) => (
          <Card
            key={w.id}
            className="love-card"
            style={{
              marginBottom: 12,
              borderLeft: tab === 'received' && !w.is_read ? '4px solid #ff6b9d' : '4px solid #eee',
              background: tab === 'received' && !w.is_read ? 'linear-gradient(135deg, rgba(255,107,157,0.05), rgba(255,240,248,0.5))' : undefined,
              cursor: 'pointer',
              transition: 'all 0.2s',
              animation: 'scaleIn 0.3s ease',
            }}
            onClick={() => {
              setPreview(w);
              if (tab === 'received' && !w.is_read) markRead(w.id);
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: 12, color: '#e91e63', marginBottom: 6, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {tab === 'received' ? (
                    <>
                      <span style={{ fontSize: 14 }}>💌</span>
                      <span>来自 {w.from_nickname || w.from_username || '神秘人'}</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 14 }}>✉️</span>
                      <span>发给 {w.to_nickname || 'ta'}</span>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 15, color: '#555', lineHeight: 1.7 }}>
                  {w.content}
                </div>
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>
                  {dayjs(w.created_at).fromNow()}
                </div>
              </div>
              {!w.is_read && tab === 'received' && (
                <div style={{ 
                  width: 10, height: 10, borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ff6b9d, #ff2d78)',
                  flexShrink: 0, marginTop: 6, marginLeft: 12,
                  animation: 'pulse 2s infinite',
                }} />
              )}
            </div>
          </Card>
        )}
      />

      {/* 发送悄悄话 */}
      <Modal
        open={sendOpen}
        onCancel={() => setSendOpen(false)}
        footer={null}
        title={<span style={{ color: '#ff6b9d', fontWeight: 700 }}>💭 发送悄悄话</span>}
        centered
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, animation: 'heartBeat 2s infinite' }}>💕</div>
          <p style={{ color: '#999', fontSize: 13, marginTop: 8 }}>把想说的话，轻轻说给ta听</p>
        </div>
        <Form form={form} layout="vertical" onFinish={handleSend}>
          <Form.Item name="toUsername" label="对方的用户名" rules={[{ required: true, message: '请输入对方用户名' }]}>
            <Input placeholder="例如：yjh" />
          </Form.Item>
          <Form.Item name="content" label="悄悄话内容" rules={[{ required: true, message: '写点什么吧' }]}>
            <Input.TextArea rows={4} placeholder="把想说的话说给ta听..." maxLength={500} showCount />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} block style={{
            background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 46, fontSize: 15, fontWeight: 600,
          }}>
            💕 发送悄悄话
          </Button>
        </Form>
      </Modal>

      {/* 预览 */}
      <Modal
        open={!!preview}
        onCancel={() => setPreview(null)}
        footer={null}
        title={null}
        centered
        width={420}
        styles={{ body: { padding: '32px 24px', textAlign: 'center' } }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255,240,248,0.9), rgba(255,220,238,0.7))',
          borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 100, opacity: 0.08 }}>💖</div>
          <div style={{ fontSize: 64, marginBottom: 20, animation: 'heartBeat 2s infinite' }}>💖</div>
          <Typography.Text style={{ fontSize: 17, lineHeight: 2, color: '#555', display: 'block', fontStyle: 'italic' }}>
            "{preview?.content}"
          </Typography.Text>
          <div style={{ 
            marginTop: 24, padding: '8px 16px', background: 'rgba(255,107,157,0.1)', 
            borderRadius: 20, display: 'inline-block',
            fontSize: 12, color: '#e91e63', fontWeight: 600,
          }}>
            {tab === 'received' ? `来自 ${preview?.from_nickname || 'ta'}` : `发给 ${preview?.to_nickname || 'ta'}`}
          </div>
          <div style={{ fontSize: 12, color: '#bbb', marginTop: 16 }}>
            {preview?.created_at ? dayjs(preview.created_at).format('YYYY年MM月DD日 HH:mm') : ''}
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================================================================
   爱的信件 — 双人情书
   ================================================================ */
const LETTER_TEMPLATES = [
  { 
    title: '第一封情书', 
    content: '亲爱的，\n\n写下这封信的时候，我的心里有说不完的话。\n\n自从遇见你，我才真正明白什么叫做"命中注定"。你的笑容，你的眼神，都深深刻在我的心里。\n\n每天早上睁开眼睛，第一个想到的就是你。每天晚上入睡前，最后的念想也是你。\n\n爱你的人', 
    emoji: '💌' 
  },
  { 
    title: '想念你的夜晚', 
    content: '亲爱的，\n\n今晚的月亮特别圆，我不禁想，你此刻在做什么？\n\n思念一个人是什么感觉？是胸口那股说不清的暖意，是嘴角不由自主上扬的弧度。\n\n这种感觉，我以前不懂，直到遇见你。\n\n月光很美，但没有你美。\n\n永远爱你', 
    emoji: '🌙' 
  },
  { 
    title: '未来的约定', 
    content: '致未来的我们，\n\n有一件事我可以确定——我对你的爱，只会越来越深，永远不会改变。\n\n☀️ 每天早晨，我都会告诉你，今天也爱你\n🌙 每个夜晚，我都会守护你\n🌹 每个节日，我都会陪在你身边\n💍 有一天，我会亲手把戒指戴在你的手上\n\n爱你到永远', 
    emoji: '🌟' 
  },
  { 
    title: '在一起的每一天', 
    content: '亲爱的，\n\n谢谢你出现在我的生命里。\n\n谢谢你包容我的小脾气，谢谢你在我需要的时候给我拥抱，谢谢你让我的世界变得完整。\n\n和你在一起的每一天，都是上天最好的安排。\n\n我想和你一起，走过每一个春夏秋冬，看遍每一处风景。\n\n永远在一起', 
    emoji: '💕' 
  },
];

const LOCAL_LETTERS_KEY = 'love_letters_couple_v1';

interface Letter {
  id: number;
  title: string;
  content: string;
  emoji: string;
  createdAt: string;
  sealed: boolean;
  from?: string;
}

function LetterTab() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [writing, setWriting] = useState(false);
  const [viewing, setViewing] = useState<Letter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [sealed, setSealed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_LETTERS_KEY);
    if (saved) setLetters(JSON.parse(saved));
  }, []);

  const saveLetter = () => {
    if (!title.trim()) { message.error('请给信件起个标题 💌'); return; }
    if (!content.trim()) { message.error('写点内容吧，哪怕一行字都好 ✨'); return; }
    const newLetter: Letter = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      emoji: '💌',
      createdAt: new Date().toISOString(),
      sealed,
    };
    const updated = [newLetter, ...letters];
    setLetters(updated);
    localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
    setWriting(false);
    setTitle('');
    setContent('');
    setSelectedTemplate(null);
    setSealed(false);
    if (!sealed) setViewing(newLetter);
    else message.success('信已封存，等待合适的时候再打开 💕');
  };

  const deleteLetter = (id: number) => {
    const updated = letters.filter(l => l.id !== id);
    setLetters(updated);
    localStorage.setItem(LOCAL_LETTERS_KEY, JSON.stringify(updated));
    message.success('信已删除');
    if (viewing?.id === id) setViewing(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>💌</span>
          <Typography.Text style={{ fontSize: 15, color: '#999' }}>
            共 {letters.length} 封信
          </Typography.Text>
        </div>
        <Button type="primary" onClick={() => setWriting(true)} style={{
          background: 'var(--gradient-love)', border: 'none', borderRadius: 20, fontWeight: 600,
        }}>
          ✍️ 写一封信
        </Button>
      </div>

      {letters.length === 0 && (
        <div style={{ 
          textAlign: 'center', padding: '60px 20px',
          background: 'linear-gradient(135deg, rgba(255,240,248,0.8), rgba(255,220,238,0.5))',
          borderRadius: 24, border: '2px dashed rgba(255,107,157,0.3)',
        }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'heartBeat 2s infinite' }}>💌</div>
          <div style={{ color: '#ff6b9d', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>还没有写过信</div>
          <div style={{ color: '#bbb', fontSize: 14, marginBottom: 20 }}>点击右上角，写下第一封情书吧</div>
          <button
            onClick={() => setWriting(true)}
            style={{
              padding: '12px 32px', borderRadius: 24, border: 'none',
              background: 'var(--gradient-love)', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600,
            }}
          >
            ✍️ 开始写信
          </button>
        </div>
      )}

      {letters.map((letter, idx) => (
        <Card
          key={letter.id}
          className="love-card"
          style={{ 
            marginBottom: 12, 
            cursor: 'pointer', 
            border: letter.sealed ? '2px dashed rgba(255,107,157,0.3)' : undefined,
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            animation: `fadeInUp ${0.1 + (idx % 6) * 0.07}s ease`,
          }}
          onClick={() => !letter.sealed && setViewing(letter)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,157,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ 
              fontSize: 40, 
              animation: letter.sealed ? 'none' : 'heartBeat 3s infinite',
            }}>{letter.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: 15, fontWeight: 700, color: letter.sealed ? '#bbb' : '#333', 
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {letter.sealed && <span>🔒</span>}
                {letter.title}
              </div>
              <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>
                {dayjs(letter.createdAt).format('YYYY-MM-DD HH:mm')}
              </div>
            </div>
            {!letter.sealed && (
              <button
                onClick={e => { e.stopPropagation(); deleteLetter(letter.id); }}
                style={{ 
                  border: 'none', background: 'rgba(255,0,0,0.06)', color: '#ff4d4f', 
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,0,0,0.06)'; }}
              >
                删除
              </button>
            )}
          </div>
        </Card>
      ))}

      {/* 写信 */}
      <Modal
        open={writing}
        onCancel={() => { setWriting(false); setSelectedTemplate(null); setTitle(''); setContent(''); setSealed(false); }}
        footer={null}
        title={<span style={{ color: '#ff6b9d', fontWeight: 700 }}>✍️ 写一封信</span>}
        width={560}
        centered
        styles={{ body: { padding: '20px 24px' } }}
      >
        {/* 信纸模板选择 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 10, fontWeight: 600 }}>📝 快速开始（可选）</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LETTER_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedTemplate(i);
                  setTitle(t.title);
                  setContent(t.content);
                  setTimeout(() => textareaRef.current?.focus(), 100);
                }}
                style={{
                  padding: '6px 14px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: selectedTemplate === i ? 'var(--gradient-love)' : 'rgba(255,107,157,0.08)',
                  color: selectedTemplate === i ? '#fff' : '#999',
                  transition: 'all 0.2s',
                }}
              >
                {t.emoji} {t.title}
              </button>
            ))}
          </div>
        </div>

        <Form layout="vertical">
          <Form.Item style={{ marginBottom: 12 }}>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="给这封信起个标题..."
              style={{ borderRadius: 12, fontWeight: 600 }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 16 }}>
            <Input.TextArea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              placeholder="在这里写下你想说的话..."
              style={{ borderRadius: 12, lineHeight: 2 }}
            />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#999', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={sealed}
                onChange={e => setSealed(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#ff6b9d' }}
              />
              🔒 封存这封信，等以后再打开
            </label>
          </div>
          <Button
            type="primary"
            onClick={saveLetter}
            block
            style={{
              background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 48, fontSize: 15, fontWeight: 600,
            }}
          >
            {sealed ? '🔒 封存情书' : '💕 完成'}
          </Button>
        </Form>
      </Modal>

      {/* 查看信件 */}
      <Modal
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={null}
        title={null}
        centered
        width={500}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, #fff9f0 0%, #fff5eb 50%, #ffe4d6 100%)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(255,107,157,0.2)',
        }}>
          {/* 信封头部 */}
          <div style={{ 
            background: 'var(--gradient-love)', 
            padding: '24px 24px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{viewing?.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{viewing?.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
              {viewing?.createdAt ? dayjs(viewing.createdAt).format('YYYY年MM月DD日 HH:mm') : ''}
            </div>
          </div>
          {/* 信纸内容 */}
          <div style={{ padding: '32px 28px', minHeight: 200 }}>
            <div style={{ 
              fontSize: 15, lineHeight: 2.2, color: '#555', 
              whiteSpace: 'pre-wrap', fontStyle: 'italic',
            }}>
              {viewing?.content}
            </div>
          </div>
          {/* 装饰 */}
          <div style={{ 
            textAlign: 'center', padding: '0 28px 28px',
            color: '#ffb4c8', fontSize: 24,
          }}>
            💖 缐廷华 💕 阳婧欢 💖
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================================================================
   纪念日倒计时
   ================================================================ */
function AnniversaryTab() {
  const [anniversaries, setAnniversaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextKey, setNextKey] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const res = await apiFetch('/love/anniversaries');
      if (res.code === 200) setAnniversaries(res.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getDaysUntil = (date: string) => {
    const today = dayjs().startOf('day');
    let target = dayjs(date).startOf('day');
    while (target.isBefore(today) || target.isSame(today, 'day')) {
      target = target.add(1, 'year');
    }
    return target.diff(today, 'day');
  };

  const counter = useLiveCounter('2026-01-14');

  return (
    <div>
      {/* 在一起天数 */}
      <div style={{ 
        textAlign: 'center', padding: '32px 20px', marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(255,107,157,0.08), rgba(255,200,220,0.15))',
        borderRadius: 24, border: '2px solid rgba(255,107,157,0.15)',
      }}>
        <div style={{ fontSize: 14, color: '#999', marginBottom: 16, letterSpacing: 2 }}>💕 我们在一起</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { val: counter.days, label: '天' },
            { val: String(counter.hours).padStart(2, '0'), label: '时' },
            { val: String(counter.minutes).padStart(2, '0'), label: '分' },
            { val: String(counter.seconds).padStart(2, '0'), label: '秒' },
          ].map((t, i) => (
            <React.Fragment key={i}>
              <div style={{
                background: 'var(--gradient-love)',
                borderRadius: 12, padding: '12px 16px', minWidth: 52,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{t.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{t.label}</div>
              </div>
              {i < 3 && <div style={{ fontSize: 24, color: '#ffb4c8', fontWeight: 700 }}>:</div>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontSize: 13, color: '#e91e63', fontWeight: 600 }}>🌸 从 2026年1月14日 开始 🌸</div>
      </div>

      {/* 下一个纪念日 */}
      {anniversaries.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {anniversaries.map((a, i) => {
            const days = getDaysUntil(a.date);
            const isToday = days === 0;
            return (
              <div
                key={a.id}
                style={{
                  background: isToday 
                    ? 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(255,200,220,0.2))'
                    : 'rgba(255,240,248,0.8)',
                  border: `2px solid ${isToday ? '#ff6b9d' : 'rgba(255,107,157,0.15)'}`,
                  borderRadius: 16, padding: '16px 20px', marginBottom: 12,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  animation: `fadeInUp ${0.1 + i * 0.1}s ease`,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>📅 {a.title}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{a.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: isToday ? 24 : 20, fontWeight: 900, 
                    color: isToday ? '#ff6b9d' : '#e91e63',
                  }}>
                    {isToday ? '🎉 今天！' : `${days} 天`}
                  </div>
                  {!isToday && <div style={{ fontSize: 11, color: '#bbb' }}>后到来</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {anniversaries.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#bbb' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <div>还没有纪念日</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>可以在个人中心添加</div>
        </div>
      )}
    </div>
  );
}

function useLiveCounter(startDate: string) {
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);
  const start = dayjs(startDate);
  const diff = dayjs.duration(now.diff(start));
  return {
    days: Math.floor(diff.asDays()),
    hours: diff.hours(),
    minutes: diff.minutes(),
    seconds: diff.seconds(),
  };
}

/* ================================================================
   主组件
   ================================================================ */
export default function SweetMomentsPage() {
  return (
    <div className="page-enter">
      {/* 页面标题 */}
      <div style={{ 
        textAlign: 'center', marginBottom: 24, padding: '32px 20px',
        background: 'linear-gradient(135deg, rgba(255,240,248,0.9), rgba(255,220,238,0.7))',
        borderRadius: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 150, opacity: 0.05 }}>💖</div>
        <div style={{ position: 'absolute', bottom: -20, left: -20, fontSize: 120, opacity: 0.05 }}>💕</div>
        <div style={{ fontSize: 56, marginBottom: 12, animation: 'heartBeat 2s infinite' }}>💖</div>
        <h2 style={{ 
          fontSize: 'clamp(24px,5vw,36px)', fontWeight: 900, margin: 0, marginBottom: 8,
          background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          甜蜜时光
        </h2>
        <p style={{ color: '#999', fontSize: 14, margin: 0 }}>
          缐廷华 💕 阳婧欢 · 我们的爱情故事
        </p>
      </div>

      <Tabs
        defaultActiveKey="words"
        size="large"
        style={{ marginBottom: 0 }}
        items={[
          {
            key: 'words',
            label: <span style={{ fontWeight: 600 }}>💕 双向情话</span>,
            children: <LoveWordsTab />,
          },
          {
            key: 'whisper',
            label: <span style={{ fontWeight: 600 }}>💌 悄悄话</span>,
            children: <WhisperTab />,
          },
          {
            key: 'letter',
            label: <span style={{ fontWeight: 600 }}>✉️ 情书</span>,
            children: <LetterTab />,
          },
          {
            key: 'anniversary',
            label: <span style={{ fontWeight: 600 }}>📅 纪念日</span>,
            children: <AnniversaryTab />,
          },
        ]}
      />
    </div>
  );
}
