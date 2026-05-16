import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Empty, Tag, Popconfirm, Tabs, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Line } from '@ant-design/charts';
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
   日记 Tab
   ================================================================ */
const MOOD_OPTIONS = [
  { value: 'happy', label: '😊 超幸福', color: '#52c41a' },
  { value: 'excited', label: '🤩 好兴奋', color: '#fa8c16' },
  { value: 'peaceful', label: '😌 很平静', color: '#1890ff' },
  { value: 'worried', label: '😟 有点担心', color: '#faad14' },
  { value: 'sad', label: '😢 心情不好', color: '#f5222d' },
];
const MOOD_EMOJI: Record<string, string> = { happy: '😊', excited: '🤩', peaceful: '😌', worried: '😟', sad: '😢' };
const MOOD_SCORE: Record<string, number> = { happy: 5, excited: 4, peaceful: 3, worried: 2, sad: 1 };

interface Diary {
  id: number;
  content: string;
  mood: string;
  created_at: string;
}

function DiaryTab() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDiary, setEditDiary] = useState<Diary | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [filterMood, setFilterMood] = useState<string>('all');

  const loadDiaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/diaries');
      if (res.code === 200) setDiaries(res.data || []);
    } catch { message.error('加载日记失败'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadDiaries(); }, [loadDiaries]);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      if (editDiary) {
        await apiFetch(`/diaries/${editDiary.id}`, {
          method: 'PUT',
          body: JSON.stringify({ content: values.content, mood: values.mood }),
        });
        setDiaries(prev => prev.map(d => d.id === editDiary.id ? { ...d, ...values } : d));
        message.success('日记已更新 💕');
      } else {
        const res = await apiFetch('/diaries', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        if (res.code === 200 || res.code === 201) {
          setDiaries(prev => [{ id: res.data?.id || Date.now(), ...values, created_at: new Date().toISOString() }, ...prev]);
          message.success('日记已保存 📔');
        }
      }
      setModalOpen(false);
      form.resetFields();
      setEditDiary(null);
    } catch { message.error('保存失败'); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/diaries/${id}`, { method: 'DELETE' });
    setDiaries(prev => prev.filter(d => d.id !== id));
    message.success('已删除');
  };

  const filtered = filterMood === 'all' ? diaries : diaries.filter(d => d.mood === filterMood);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[{ value: 'all', label: '全部' }, ...MOOD_OPTIONS].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterMood(opt.value)}
              style={{
                padding: '3px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 12,
                background: filterMood === opt.value ? 'var(--gradient-love)' : 'rgba(255,107,157,0.08)',
                color: filterMood === opt.value ? '#fff' : '#999',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button type="primary" onClick={() => { setEditDiary(null); form.resetFields(); setModalOpen(true); }}
          style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 20 }}>
          ✍️ 写日记
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Empty description={<span style={{ color: '#bbb' }}>还没有日记，记录下今天的心情吧 📝</span>} style={{ margin: '40px 0' }} />
      ) : (
        filtered.map(diary => (
          <Card key={diary.id} className="love-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.2)', color: '#ff6b9d', borderRadius: 12 }}>
                    {MOOD_EMOJI[diary.mood] || '😊'} {MOOD_OPTIONS.find(m => m.value === diary.mood)?.label?.slice(2) || diary.mood}
                  </Tag>
                  <span style={{ fontSize: 12, color: '#bbb' }}>{dayjs(diary.created_at).format('MM-DD HH:mm')}</span>
                </div>
                <div style={{ fontSize: 15, color: '#555', lineHeight: 1.9 }}>{diary.content}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
                <button onClick={() => { setEditDiary(diary); form.setFieldsValue({ content: diary.content, mood: diary.mood }); setModalOpen(true); }}
                  style={{ border: 'none', background: 'rgba(255,107,157,0.06)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>✏️</button>
                <Popconfirm title="确定删除？" onConfirm={() => handleDelete(diary.id)}>
                  <button style={{ border: 'none', background: 'rgba(255,0,0,0.06)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>🗑️</button>
                </Popconfirm>
              </div>
            </div>
          </Card>
        ))
      )}

      <Modal open={modalOpen} onCancel={() => { setModalOpen(false); setEditDiary(null); form.resetFields(); }}
        footer={null} title={<span style={{ color: '#ff6b9d' }}>{editDiary ? '✏️ 编辑日记' : '✍️ 写日记'}</span>} centered>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="mood" label="今日心情" rules={[{ required: true, message: '选个心情吧' }]}>
            <Select placeholder="选择今天的心情">
              {MOOD_OPTIONS.map(m => <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="content" label="日记内容" rules={[{ required: true, message: '写点什么吧' }]}>
            <Input.TextArea rows={5} placeholder="今天发生了什么..." style={{ borderRadius: 12 }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} block style={{ background: 'var(--gradient-love)', border: 'none', borderRadius: 12, height: 44 }}>
            💾 {editDiary ? '保存修改' : '保存日记'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}

/* ================================================================
   心情图表 Tab
   ================================================================ */
function MoodChartTab() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/moods/stats');
        if (res.code === 200) setStats(res.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const chartData = stats.map(s => ({
    date: dayjs(s.date).format('MM-DD'),
    mood: MOOD_SCORE[s.mood] || 3,
    label: MOOD_EMOJI[s.mood] || '😊',
  }));

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'mood',
    smooth: true,
    color: '#ff6b9d',
    point: { size: 5, shape: 'circle', style: { fill: 'white', stroke: '#ff6b9d', lineWidth: 2 } },
    lineStyle: { lineWidth: 3 },
    yAxis: {
      min: 0, max: 6,
      label: { formatter: (v: string) => ({ 1: '😢', 2: '😟', 3: '😌', 4: '🤩', 5: '😊' }[Number(v)] || '') },
    },
    tooltip: { formatter: (datum: any) => ({ name: '心情', value: `${datum.label} ${dayjs(datum.date).format('MM-DD')}` }) },
  };

  return (
    <div>
      {chartData.length < 2 ? (
        <Empty description={<span style={{ color: '#bbb' }}>心情图表需要至少2条记录才能显示 📈<br/>先去"写日记"记录几次心情吧</span>} style={{ margin: '60px 0' }} />
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: '20px 16px 16px', border: '1px solid rgba(255,107,157,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Typography.Text style={{ fontSize: 14, color: '#999' }}>📈 心情曲线 · 近30天</Typography.Text>
          </div>
          <Line {...config} height={260} />
        </div>
      )}

      {/* 心情统计 */}
      {stats.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Typography.Text style={{ fontSize: 14, color: '#999', display: 'block', marginBottom: 12 }}>📊 心情统计</Typography.Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {MOOD_OPTIONS.map(m => {
              const count = stats.filter(s => s.mood === m.value).length;
              const pct = stats.length > 0 ? Math.round((count / stats.length) * 100) : 0;
              return (
                <div key={m.value} style={{ background: 'rgba(255,240,248,0.8)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', border: '1px solid rgba(255,107,157,0.1)' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{count}次</div>
                  <div style={{ fontSize: 11, color: '#bbb' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   主页面 — 记录时光
   ================================================================ */
export default function RecordTimePage() {
  return (
    <div className="page-enter">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 8, animation: 'heartBeat 2s ease-in-out infinite' }}>📖</div>
        <Typography.Title level={2} style={{
          margin: 0,
          background: 'var(--gradient-love)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          记录时光
        </Typography.Title>
        <div style={{ color: '#bbb', fontSize: 14, marginTop: 4 }}>
          日记 · 心情曲线，留住每一天的温度
        </div>
      </div>

      <Tabs
        defaultActiveKey="diary"
        items={[
          { key: 'diary', label: '📔 日记本', children: <DiaryTab /> },
          { key: 'chart', label: '📈 心情曲线', children: <MoodChartTab /> },
        ]}
      />
    </div>
  );
}
