import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, List, Tag, Empty, message, Popconfirm, Typography, Progress, Checkbox, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleFilled } from '@ant-design/icons';
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
   Tab 1: 优惠券
   ================================================================ */
const COUPON_TEMPLATES = [
  { title: '拥抱券', subtitle: '随时可用，不限次数 💕', color: '#ff6b9d' },
  { title: '做饭券', subtitle: '想吃 TA 做的饭吗？🍳', color: '#ff9a44' },
  { title: '按摩券', subtitle: '累了一天，躺下享受吧 💆', color: '#feca57' },
  { title: '电影券', subtitle: '选一部电影，一起看 🎬', color: '#48dbfb' },
  { title: '撒娇券', subtitle: '今天可以随便撒娇 😊', color: '#a55eea' },
  { title: '火锅券', subtitle: '走，带你去吃火锅 🍲', color: '#ff6b6b' },
  { title: '不生气券', subtitle: '这张券永远有效 😘', color: '#26de81' },
  { title: '牵手券', subtitle: '出门必须牵手 👫', color: '#ff6b9d' },
];

function CouponTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [form] = Form.useForm();

  const loadCoupons = async () => {
    try {
      const res = await apiFetch('/coupons/all');
      if (res.code === 1) setCoupons(res.data || []);
    } catch {}
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleCreate = async (values: any) => {
    try {
      const template = COUPON_TEMPLATES.find(t => t.title === values.template);
      await apiFetch('/coupons', {
        method: 'POST',
        body: JSON.stringify({ title: template?.title || values.title, subtitle: template?.subtitle || '', color: template?.color || '#ff6b9d' }),
      });
      message.success('优惠券已创建 🎫');
      setCreateOpen(false);
      form.resetFields();
      loadCoupons();
    } catch { message.error('创建失败'); }
  };

  const handleUse = async (id: number) => {
    await apiFetch(`/coupons/${id}/use`, { method: 'POST' });
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_used: 1, used_at: new Date().toISOString() } : c));
    message.success('优惠券已使用 💕');
    setPreviewOpen(false);
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/coupons/${id}`, { method: 'DELETE' });
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const unused = coupons.filter(c => !c.is_used);
  const used = coupons.filter(c => c.is_used);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Typography.Text style={{ color: '#999', fontSize: 14 }}>
          {unused.length} 张可用 · {used.length} 张已用
        </Typography.Text>
        <Button type="primary" onClick={() => setCreateOpen(true)} style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 20 }}>
          🎫 创建优惠券
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Empty description={<span style={{ color: '#bbb' }}>还没有优惠券，快创建一张吧 🎫</span>} style={{ margin: '40px 0' }} />
      ) : (
        <>
          {unused.length > 0 && (
            <>
              <Typography.Text style={{ fontSize: 13, color: '#bbb', display: 'block', marginBottom: 12 }}>未使用</Typography.Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                {unused.map(c => (
                  <div key={c.id} onClick={() => { setSelectedCoupon(c); setPreviewOpen(true); }}
                    style={{ background: c.color + '22', border: `2px solid ${c.color}44`, borderRadius: 16, padding: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🎫</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: c.color }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{c.subtitle}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {used.length > 0 && (
            <>
              <Typography.Text style={{ fontSize: 13, color: '#bbb', display: 'block', marginBottom: 12 }}>已使用</Typography.Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {used.map(c => (
                  <div key={c.id} style={{ background: '#f5f5f5', border: '2px dashed #ddd', borderRadius: 16, padding: '16px', opacity: 0.6 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#bbb', textDecoration: 'line-through' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>已使用</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* 创建优惠券 */}
      <Modal open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} title={<span style={{ color: '#ff6b9d' }}>🎫 创建优惠券</span>} centered>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="template" label="选择券模板">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {COUPON_TEMPLATES.map((t, i) => (
                <div key={i} onClick={() => form.setFieldsValue({ template: t.title })}
                  style={{ background: t.color + '22', border: `2px solid ${t.color}44`, borderRadius: 12, padding: '12px 10px', cursor: 'pointer' }}>
                  <div style={{ fontSize: 20 }}>🎫</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{t.subtitle}</div>
                </div>
              ))}
            </div>
          </Form.Item>
          <Button type="primary" htmlType="submit" block style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 44 }}>
            🎫 创建优惠券
          </Button>
        </Form>
      </Modal>

      {/* 预览 & 使用 */}
      <Modal open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} centered width={360}>
        {selectedCoupon && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ background: selectedCoupon.color + '22', border: `3px solid ${selectedCoupon.color}`, borderRadius: 20, padding: '28px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎫</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: selectedCoupon.color }}>{selectedCoupon.title}</div>
              <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>{selectedCoupon.subtitle}</div>
              <div style={{ fontSize: 12, color: '#bbb', marginTop: 12 }}>有效期：永久有效</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {!selectedCoupon.is_used ? (
                <Button type="primary" onClick={() => handleUse(selectedCoupon.id)} style={{ flex: 1, background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 44 }}>
                  💕 我要使用
                </Button>
              ) : (
                <div style={{ flex: 1, textAlign: 'center', color: '#52c41a', fontSize: 14 }}>✅ 已使用</div>
              )}
              <Popconfirm title="删除优惠券？" onConfirm={() => { handleDelete(selectedCoupon.id); setPreviewOpen(false); }}>
                <Button danger style={{ borderRadius: 12 }}>删除</Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================================================================
   Tab 2: 愿望打卡
   ================================================================ */
function WishTab() {
  const [wishes, setWishes] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const loadWishes = async () => {
    try {
      const res = await apiFetch('/wishes');
      if (res.code === 1) setWishes(res.data.wishes || []);
    } catch {}
  };

  useEffect(() => { loadWishes(); }, []);

  const handleCreate = async (values: any) => {
    try {
      const res = await apiFetch('/wishes', { method: 'POST', body: JSON.stringify(values) });
      if (res.code === 1) loadWishes();
      message.success('愿望已添加 ✨');
      setCreateOpen(false);
      form.resetFields();
    } catch { message.error('添加失败'); }
  };

  const handleComplete = async (id: number) => {
    await apiFetch(`/wishes/${id}/complete`, { method: 'POST' });
    setWishes(prev => prev.map(w => w.id === id ? { ...w, is_completed: 1 } : w));
    message.success('🎉 愿望达成！');
  };

  const pending = wishes.filter(w => !w.is_completed);
  const done = wishes.filter(w => w.is_completed);

  return (
    <div>
      {pending.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Typography.Title level={5} style={{ marginBottom: 12 }}>🚀 进行中 ({pending.length})</Typography.Title>
          <Progress
            percent={Math.round((done.length / Math.max(wishes.length, 1)) * 100)}
            strokeColor="#ff6b9d"
            showInfo={false}
            style={{ marginBottom: 16 }}
          />
          {pending.map(w => (
            <Card key={w.id} className="love-card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Checkbox onChange={() => handleComplete(w.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#333' }}>{w.title}</div>
                  {w.description && <div style={{ fontSize: 12, color: '#bbb' }}>{w.description}</div>}
                </div>
                <Popconfirm title="删除愿望？" onConfirm={async () => {
                  await apiFetch(`/wishes/${w.id}`, { method: 'DELETE' });
                  setWishes(prev => prev.filter(x => x.id !== w.id));
                }}>
                  <button style={{ border: 'none', background: 'rgba(255,0,0,0.06)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                </Popconfirm>
              </div>
            </Card>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <Typography.Title level={5} style={{ marginBottom: 12, color: '#52c41a' }}>✅ 已完成 ({done.length})</Typography.Title>
          {done.map(w => (
            <Card key={w.id} className="love-card" style={{ marginBottom: 8, opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 18 }} />
                <div style={{ flex: 1, textDecoration: 'line-through', color: '#bbb' }}>{w.title}</div>
                <div style={{ fontSize: 11, color: '#bbb' }}>{w.completed_at ? dayjs(w.completed_at).format('MM-DD') : ''}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {wishes.length === 0 && (
        <Empty description={<span style={{ color: '#bbb' }}>还没有愿望，写下你们的小目标吧 ✨</span>} style={{ margin: '40px 0' }} />
      )}

      <Button type="primary" onClick={() => setCreateOpen(true)} block style={{ marginTop: 20, background: 'var(--gradient-love)', border: 'none', borderRadius: 20, height: 44 }}>
        ✨ 添加愿望
      </Button>

      <Modal open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} title={<span style={{ color: '#ff6b9d' }}>✨ 写下愿望</span>} centered>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="愿望" rules={[{ required: true, message: '写下愿望吧' }]}>
            <Input placeholder="比如：一起去看海" />
          </Form.Item>
          <Form.Item name="description" label="备注（选填）">
            <Input.TextArea rows={2} placeholder="补充说明..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 44 }}>
            ✨ 添加愿望
          </Button>
        </Form>
      </Modal>
    </div>
  );
}

/* ================================================================
   Tab 3: 每日一问
   ================================================================ */
function DailyQuestionTab() {
  const [question, setQuestion] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/questions/today');
        if (res.code === 1) setQuestion(res.data);
      } catch {}
    })();
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch('/questions/answer', {
        method: 'POST',
        body: JSON.stringify({ question_id: question.id, answer }),
      });
      message.success('回答已保存 💕');
      setAnswerOpen(false);
      setAnswer('');
      const res = await apiFetch('/questions/today');
      if (res.code === 1) setQuestion(res.data);
    } catch { message.error('保存失败'); }
    setSubmitting(false);
  };

  return (
    <div>
      {question ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'heartBeat 2s ease-in-out infinite' }}>💡</div>
          <div style={{ fontSize: 13, color: '#bbb', marginBottom: 16 }}>今日问题 · {dayjs().format('MM月DD日')}</div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,107,157,0.1), rgba(255,138,128,0.05))',
            border: '1px solid rgba(255,107,157,0.2)',
            borderRadius: 20, padding: '28px 24px', marginBottom: 20,
          }}>
            <Typography.Title level={3} style={{ color: '#fff', margin: '8px 0 20px' }}>
              {question.content}
            </Typography.Title>
          </div>

          {question.answers && question.answers.length > 0 ? (
            <div style={{ textAlign: 'left' }}>
              {question.answers.map((a: any) => (
                <div key={a.id} style={{ background: 'rgba(255,240,248,0.8)', borderRadius: 12, padding: '12px 16px', marginBottom: 8, border: '1px solid rgba(255,107,157,0.1)' }}>
                  <div style={{ fontSize: 12, color: '#ff6b9d', fontWeight: 600 }}>{a.nickname || '匿名'}</div>
                  <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>{a.answer}</div>
                </div>
              ))}
            </div>
          ) : question.myAnswer ? (
            <div style={{ color: '#52c41a', fontSize: 14 }}>✅ 你的回答：{question.myAnswer}</div>
          ) : (
            <Button type="primary" onClick={() => setAnswerOpen(true)} style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 20 }}>
              💬 回答这个问题
            </Button>
          )}

          <div style={{ marginTop: 16 }}>
            <Button onClick={async () => {
              const res = await apiFetch('/questions/history');
              if (res.code === 1) setHistory(res.data);
            }} style={{ borderRadius: 20, marginRight: 8 }}>📜 历史问题</Button>
            {!question.myAnswer && (
              <Button type="primary" onClick={() => setAnswerOpen(true)} style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 20 }}>
                💬 写回答
              </Button>
            )}
          </div>

          {history.length > 0 && (
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              {history.map((h: any) => (
                <Card key={h.id} className="love-card" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: '#bbb', marginBottom: 6 }}>{dayjs(h.date).format('MM-DD')}</div>
                  <div style={{ fontSize: 14, color: '#555' }}>{h.content}</div>
                  {h.answers && h.answers[0] && (
                    <div style={{ fontSize: 12, color: '#52c41a', marginTop: 6 }}>✅ {h.answers[0].answer}</div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Empty description={<span style={{ color: '#bbb' }}>今天的问题正在准备中 💡</span>} style={{ margin: '40px 0' }} />
      )}

      <Modal open={answerOpen} onCancel={() => setAnswerOpen(false)} footer={null} title={<span style={{ color: '#ff6b9d' }}>💬 回答今日问题</span>} centered>
        <Form form={form} layout="vertical">
          <Form.Item>
            <Input.TextArea rows={4} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="写下你的回答..." />
          </Form.Item>
          <Button type="primary" onClick={handleSubmit} loading={submitting} block style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 44 }}>
            💕 提交回答
          </Button>
        </Form>
      </Modal>
    </div>
  );
}

/* ================================================================
   Tab 4: 默契考验
   ================================================================ */
function QuizTab() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/quizzes/random?limit=5');
      if (res.code === 1) setQuizzes(res.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadQuizzes(); }, []);

  const handleAnswer = (option: string) => {
    if (!quizzes[currentIndex]) return;
    const quiz = quizzes[currentIndex];
    const isCorrect = option === quiz.correct_answer;
    setAnswers(prev => ({ ...prev, [quiz.id]: option }));
    setResults(prev => ({ ...prev, [quiz.id]: isCorrect }));
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) setCurrentIndex(prev => prev + 1);
    else setFinished(true);
  };

  const score = Object.values(results).filter(Boolean).length;
  const pct = quizzes.length > 0 ? Math.round((score / quizzes.length) * 100) : 0;

  if (finished) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>{pct >= 80 ? '🎉' : pct >= 60 ? '💖' : '🌸'}</div>
        <Typography.Title level={2} style={{ color: '#ff6b9d', margin: 0 }}>
          {score}/{quizzes.length} 题正确
        </Typography.Title>
        <Progress percent={pct} strokeColor="#ff6b9d" style={{ margin: '20px 0' }} />
        <div style={{ fontSize: 16, color: '#555', marginBottom: 24 }}>
          {pct >= 80 ? '💕 太有默契了！我们心有灵犀！' : pct >= 60 ? '🌸 默契还不错，继续加油！' : '🌷 默契需要慢慢培养~'}
        </div>
        <Button type="primary" onClick={() => { setAnswers({}); setResults({}); setCurrentIndex(0); setFinished(false); loadQuizzes(); }}
          style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 20 }}>
          🔄 再来一次
        </Button>
      </div>
    );
  }

  const current = quizzes[currentIndex];
  if (loading) return <Empty description="加载中..." style={{ margin: '60px 0' }} />;
  if (!current) return <Empty description="加载失败" style={{ margin: '60px 0' }} />;

  const options = ['A', 'B', 'C', 'D'].map(k => current[`option_${k.toLowerCase()}`]).filter(Boolean);

  return (
    <div>
      <Progress percent={Math.round(((currentIndex + 1) / quizzes.length) * 100)} strokeColor="#ff6b9d" showInfo={false} style={{ marginBottom: 24 }} />
      <div style={{ fontSize: 13, color: '#bbb', marginBottom: 8 }}>第 {currentIndex + 1}/{quizzes.length} 题</div>
      <Card className="love-card" style={{ marginBottom: 20, textAlign: 'center', padding: '20px' }}>
        <Typography.Title level={4} style={{ color: '#ff6b9d', margin: 0 }}>{current.content}</Typography.Title>
      </Card>
      <div style={{ display: 'grid', gap: 10 }}>
        {options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i);
          const isSelected = answers[current.id] === letter;
          const isCorrect = results[current.id] !== undefined && letter === current.correct_answer;
          const isWrong = results[current.id] === true && isSelected && !isCorrect;
          return (
            <button
              key={i}
              onClick={() => handleAnswer(letter)}
              disabled={answers[current.id] !== undefined}
              style={{
                padding: '14px 18px', borderRadius: 14, border: 'none', cursor: 'pointer',
                fontSize: 14, textAlign: 'left',
                background: isWrong ? 'rgba(255,0,0,0.1)' : isSelected && isCorrect ? 'rgba(82,196,26,0.1)' : isSelected ? 'rgba(255,107,157,0.15)' : 'rgba(255,240,248,0.8)',
                color: isWrong ? '#ff4d4f' : isSelected && isCorrect ? '#52c41a' : isSelected ? '#ff6b9d' : '#555',
                fontWeight: isSelected ? 700 : 400,
                borderLeft: `4px solid ${isWrong ? '#ff4d4f' : isSelected && isCorrect ? '#52c41a' : isSelected ? '#ff6b9d' : '#eee'}`,
                transition: 'all 0.2s',
              }}
            >
              {letter}. {opt}
              {isCorrect && ' ✅'}
              {isWrong && ' ❌'}
            </button>
          );
        })}
      </div>
      {answers[current.id] !== undefined && (
        <Button type="primary" onClick={handleNext} block style={{ marginTop: 20, background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 44 }}>
          {currentIndex < quizzes.length - 1 ? '下一题 →' : '查看结果 🎉'}
        </Button>
      )}
    </div>
  );
}

/* ================================================================
   主页面 — 趣味时光
   ================================================================ */
export default function FunTimePage() {
  return (
    <div className="page-enter">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 8, animation: 'heartBeat 2s ease-in-out infinite' }}>🎯</div>
        <Typography.Title level={2} style={{
          margin: 0,
          background: 'var(--gradient-love)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          趣味时光
        </Typography.Title>
        <div style={{ color: '#bbb', fontSize: 14, marginTop: 4 }}>
          优惠券 · 愿望打卡 · 每日问答 · 默契考验
        </div>
      </div>

      <Tabs
        defaultActiveKey="coupon"
        size="small"
        items={[
          { key: 'coupon', label: '🎫 优惠券', children: <CouponTab /> },
          { key: 'wish', label: '✨ 愿望打卡', children: <WishTab /> },
          { key: 'question', label: '💡 每日问答', children: <DailyQuestionTab /> },
          { key: 'quiz', label: '🎯 默契考验', children: <QuizTab /> },
        ]}
      />
    </div>
  );
}
