import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Form, Input, message, Empty, Tabs, Badge } from 'antd';
import { SendOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';
dayjs.extend(relativeTime);

interface Whisper {
  id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  from_user_id?: number;
  from_nickname?: string;
  to_user_id?: number;
  to_nickname?: string;
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

export default function WhisperPage() {
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState<Whisper[]>([]);
  const [sent, setSent] = useState<Whisper[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [preview, setPreview] = useState<Whisper | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recvRes, sentRes, countRes] = await Promise.all([
        apiFetch('/whispers/received'),
        apiFetch('/whispers/sent'),
        apiFetch('/whispers/unread-count'),
      ]);
      if (recvRes.code === 200) setReceived(recvRes.data || []);
      if (sentRes.code === 200) setSent(sentRes.data || []);
      if (countRes.code === 200) setUnreadCount(countRes.data?.count || 0);
    } catch {
      message.error('加载失败');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const markRead = async (id: number) => {
    await apiFetch(`/whispers/${id}/read`, { method: 'PUT' });
    setReceived(prev => prev.map(w => w.id === id ? { ...w, is_read: true } : w));
    setUnreadCount(prev => Math.max(0, prev - 1));
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
      // 检查成就
      apiFetch('/achievements/check', { method: 'POST' });
    } catch (e: any) {
      message.error(e?.message || '发送失败');
    }
    setSaving(false);
  };

  const renderWhisper = (w: Whisper, isReceived: boolean) => (
    <Card
      key={w.id}
      className="love-card"
      style={{
        marginBottom: 12,
        borderLeft: isReceived && !w.is_read ? '4px solid #ff6b9d' : '4px solid #eee',
        background: isReceived && !w.is_read ? 'rgba(255,107,157,0.05)' : undefined,
      }}
      bodyStyle={{ padding: '14px 18px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {isReceived ? (
              <>
                <span style={{ fontSize: 18 }}>💌</span>
                <span style={{ fontSize: 12, color: '#999' }}>来自 {w.from_nickname || 'TA'} 的悄悄话</span>
                {!w.is_read && <Badge status="error" text={<span style={{ fontSize: 11, color: '#ff6b9d' }}>未读</span>} />}
              </>
            ) : (
              <>
                <span style={{ fontSize: 18 }}>📤</span>
                <span style={{ fontSize: 12, color: '#999' }}>发给 {w.to_nickname || 'TA'} 的悄悄话</span>
                {w.is_read ? (
                  <span style={{ fontSize: 11, color: '#52c41a' }}>✓ 已读</span>
                ) : (
                  <span style={{ fontSize: 11, color: '#bbb' }}>○ 未读</span>
                )}
              </>
            )}
          </div>
          <div
            style={{
              fontSize: 15, lineHeight: 1.9, color: '#444',
              cursor: 'pointer',
              filter: isReceived && !w.is_read ? 'blur(0px)' : undefined,
            }}
            onClick={() => {
              if (isReceived && !w.is_read) markRead(w.id);
              setPreview(w);
            }}
          >
            {isReceived && !w.is_read ? (
              <span style={{ background: 'rgba(255,107,157,0.08)', padding: '2px 8px', borderRadius: 8, color: '#ff6b9d', fontSize: 12 }}>
                点击查看内容 💕
              </span>
            ) : (
              w.content
            )}
          </div>
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
            {dayjs(w.created_at).format('YYYY-MM-DD HH:mm')} ({dayjs(w.created_at).fromNow()})
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="page-enter" style={{ padding: '0 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 24 }}>💭 悄悄话墙</h2>
          <p style={{ color: '#999', margin: '4px 0 0', fontSize: 13 }}>只属于你们的秘密空间</p>
        </div>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => setSendOpen(true)}
          style={{ background: 'linear-gradient(135deg, #ff6b9d, #ff8a80)', border: 'none', borderRadius: 20 }}
        >
          发送悄悄话
        </Button>
      </div>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: 'received',
            label: <span>收到的悄悄话 {unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: '#ff6b9d' }} />}</span>,
          },
          { key: 'sent', label: '发出的悄悄话' },
        ]}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#ccc' }}>加载中...</div>
      ) : (
        <>
          {tab === 'received' && (
            received.length === 0 ? (
              <Empty description="还没有收到悄悄话，等着 TA 的告白吧 💕" style={{ marginTop: 40 }} />
            ) : (
              received.map(w => renderWhisper(w, true))
            )
          )}
          {tab === 'sent' && (
            sent.length === 0 ? (
              <Empty description="还没有发出悄悄话，把心里话说给 TA 听 💌" style={{ marginTop: 40 }} />
            ) : (
              sent.map(w => renderWhisper(w, false))
            )
          )}
        </>
      )}

      {/* 发送 Modal */}
      <Modal
        open={sendOpen}
        title={<span style={{ background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>发送悄悄话</span>}
        onCancel={() => { setSendOpen(false); form.resetFields(); }}
        footer={null}
        centered
      >
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(255,107,157,0.08)', borderRadius: 8, fontSize: 13, color: '#999' }}>
          💡 悄悄话只有对方能看到，会员标记为未读/已读状态
        </div>
        <Form form={form} layout="vertical" onFinish={handleSend}>
          <Form.Item name="toUsername" label="发给谁" rules={[{ required: true, message: '请输入对方用户名' }]}>
            <Input placeholder="输入对方用户名，如：yjh" />
          </Form.Item>
          <Form.Item name="content" label="悄悄话内容" rules={[{ required: true, message: '请输入悄悄话内容' }]}>
            <Input.TextArea rows={4} placeholder="写下你想对 TA 说的话..." showCount maxLength={500} />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setSendOpen(false)} style={{ marginRight: 8 }}>取消</Button>
            <Button type="primary" htmlType="submit" loading={saving}
              style={{ background: 'linear-gradient(135deg, #ff6b9d, #ff8a80)', border: 'none', borderRadius: 20 }}>
              {saving ? '发送中...' : '💕 发送悄悄话'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 预览 Modal */}
      <Modal
        open={!!preview}
        title="💌 悄悄话"
        onCancel={() => setPreview(null)}
        footer={<Button type="primary" onClick={() => setPreview(null)}>我知道了 💕</Button>}
        centered
        bodyStyle={{ padding: '20px 24px', textAlign: 'center' }}
      >
        {preview && (
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💌</div>
            <div style={{ fontSize: 17, lineHeight: 2, color: '#444', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {preview.content}
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#bbb' }}>
              来自 {preview.from_nickname || 'TA'} · {dayjs(preview.created_at).format('YYYY-MM-DD HH:mm')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
