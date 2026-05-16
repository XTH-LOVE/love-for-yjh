import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Empty, Tag, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, HeartFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';
dayjs.extend(relativeTime);

const { TextArea } = Input;

const MOOD_OPTIONS = [
  { value: 'happy', label: '😊 超幸福', color: '#52c41a' },
  { value: 'excited', label: '🤩 好兴奋', color: '#fa8c16' },
  { value: 'peaceful', label: '😌 很平静', color: '#1890ff' },
  { value: 'worried', label: '😟 有点担心', color: '#faad14' },
  { value: 'sad', label: '😢 心情不好', color: '#f5222d' },
];

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', excited: '🤩', peaceful: '😌', worried: '😟', sad: '😢',
};

const MOOD_COLOR: Record<string, string> = {
  happy: '#52c41a', excited: '#fa8c16', peaceful: '#1890ff', worried: '#faad14', sad: '#f5222d',
};

interface Diary {
  id: number;
  content: string;
  mood: string;
  created_at: string;
}

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

export default function DiaryPage() {
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
    } catch {
      message.error('加载日记失败');
    }
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
        message.success('日记已更新 💕');
      } else {
        await apiFetch('/diaries', {
          method: 'POST',
          body: JSON.stringify({ content: values.content, mood: values.mood }),
        });
        message.success('日记已保存 💕');
        // 检查成就
        apiFetch('/achievements/check', { method: 'POST' });
      }
      setModalOpen(false);
      setEditDiary(null);
      form.resetFields();
      loadDiaries();
    } catch {
      message.error('保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/diaries/${id}`, { method: 'DELETE' });
      message.success('已删除');
      loadDiaries();
    } catch {
      message.error('删除失败');
    }
  };

  const openEdit = (diary: Diary) => {
    setEditDiary(diary);
    form.setFieldsValue({ content: diary.content, mood: diary.mood });
    setModalOpen(true);
  };

  const openNew = () => {
    setEditDiary(null);
    form.resetFields();
    setModalOpen(true);
  };

  const filtered = filterMood === 'all' ? diaries : diaries.filter(d => d.mood === filterMood);

  return (
    <div className="page-enter" style={{ padding: '0 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 24 }}>📔 情侣日记</h2>
          <p style={{ color: '#999', margin: '4px 0 0', fontSize: 13 }}>记录我们在一起的每一天</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew} style={{ borderRadius: 20 }}>
          写日记
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Tag
          onClick={() => setFilterMood('all')}
          style={{ cursor: 'pointer', borderRadius: 12, padding: '4px 12px', fontSize: 13 }}
          color={filterMood === 'all' ? 'pink' : 'default'}
        >全部</Tag>
        {MOOD_OPTIONS.map(m => (
          <Tag
            key={m.value}
            onClick={() => setFilterMood(m.value)}
            style={{ cursor: 'pointer', borderRadius: 12, padding: '4px 12px', fontSize: 13 }}
            color={filterMood === m.value ? 'pink' : 'default'}
          >
            {m.label}
          </Tag>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#ccc' }}>加载中...</div>
      ) : filtered.length === 0 ? (
        <Empty description="还没有日记，快写下第一篇吧！" style={{ marginTop: 60 }}>
          <Button type="primary" onClick={openNew} icon={<PlusOutlined />}>写日记</Button>
        </Empty>
      ) : (
        <div>
          {filtered.map((diary, idx) => {
            const moodInfo = MOOD_OPTIONS.find(m => m.value === diary.mood) || MOOD_OPTIONS[0];
            return (
              <Card
                key={diary.id}
                className="love-card"
                style={{
                  marginBottom: 16,
                  animation: `fadeInUp ${0.3 + idx * 0.08}s ease`,
                  borderLeft: `4px solid ${moodInfo.color}`,
                }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 22 }}>{MOOD_EMOJI[diary.mood] || '😊'}</span>
                      <span style={{ fontSize: 13, color: moodInfo.color, fontWeight: 600 }}>{moodInfo.label}</span>
                      <span style={{ fontSize: 12, color: '#bbb', marginLeft: 4 }}>
                        {dayjs(diary.created_at).format('YYYY-MM-DD HH:mm')}
                      </span>
                      <span style={{ fontSize: 12, color: '#ddd' }}>
                        ({dayjs(diary.created_at).fromNow()})
                      </span>
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.9, color: '#444', whiteSpace: 'pre-wrap' }}>
                      {diary.content}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(diary)} />
                    <Popconfirm title="确定删除这篇日记？" onConfirm={() => handleDelete(diary.id)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={<span style={{ background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {editDiary ? '编辑日记' : '写日记'}
        </span>}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
        bodyStyle={{ paddingTop: 8 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="mood" label="今日心情" rules={[{ required: true }]}>
            <Select placeholder="选择今天的心情">
              {MOOD_OPTIONS.map(m => (
                <Select.Option key={m.value} value={m.value}>
                  {m.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="content" label="日记内容" rules={[{ required: true, message: '请写下今天的日记' }]}>
            <TextArea
              rows={6}
              placeholder="今天发生了什么呢？写下你的心情和故事..."
              showCount
              maxLength={2000}
              style={{ fontSize: 15, lineHeight: 1.8 }}
            />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>取消</Button>
            <Button type="primary" htmlType="submit" loading={saving}
              style={{ background: 'linear-gradient(135deg, #ff6b9d, #ff8a80)', border: 'none', borderRadius: 20 }}>
              {saving ? '保存中...' : '💕 保存日记'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
