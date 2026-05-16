import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, List, Progress, Empty, message, Popconfirm, Typography, Checkbox, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleFilled, RocketOutlined, FireFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';
dayjs.extend(relativeTime);

const { Text } = Typography;
const { TextArea } = Input;

interface Wish {
  id: number;
  title: string;
  description: string;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  completed: number;
}

export default function WishPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0 });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  const loadWishes = async () => {
    try {
      const res = await fetch('/api/wishes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) {
        setWishes(json.data.wishes || []);
        setStats(json.data.stats || { total: 0, completed: 0 });
      }
    } catch (e) {
      message.error('加载愿望失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWishes(); }, []);

  const handleCreate = async (values: any) => {
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 1) {
        message.success('愿望已记录 ✨');
        setCreateModalOpen(false);
        form.resetFields();
        loadWishes();
      } else {
        message.error(json.message);
      }
    } catch (e) {
      message.error('创建失败');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const res = await fetch(`/api/wishes/${id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) {
        message.success('🎉 太棒了！愿望完成了！');
        loadWishes();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/wishes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) {
        message.success('已删除');
        loadWishes();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const completed = wishes.filter(w => w.is_completed);
  const pending = wishes.filter(w => !w.is_completed);
  const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Typography.Title level={2} style={{ color: '#ff6b9d', margin: 0 }}>✨ 愿望打卡</Typography.Title>
        <Text type="secondary">一起许愿，一起实现，记录我们的梦想 💕</Text>
      </div>

      {/* 统计卡片 */}
      <Card style={{ borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 48, fontWeight: 700 }}>{stats.completed}<span style={{ fontSize: 20, opacity: 0.8 }}> / {stats.total}</span></div>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>愿望已完成</Text>
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="#fff"
            trailColor="rgba(255,255,255,0.3)"
            style={{ marginTop: 12 }}
          />
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>完成度 {percent}%</Text>
        </div>
      </Card>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)} style={{ borderRadius: 24, height: 44, background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}>
          许下愿望
        </Button>
      </div>

      {/* 进行中的愿望 */}
      <Typography.Title level={5} style={{ marginBottom: 12 }}>🚀 进行中 ({pending.length})</Typography.Title>
      {pending.length === 0 ? (
        <Card style={{ textAlign: 'center', borderRadius: 16, padding: 32, marginBottom: 16 }}>
          <Empty description="没有进行中的愿望，快许一个吧！" />
        </Card>
      ) : (
        <div style={{ marginBottom: 24 }}>
          {pending.map(w => (
            <Card key={w.id} style={{ borderRadius: 14, marginBottom: 10, borderLeft: '4px solid #667eea' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <RocketOutlined style={{ fontSize: 20, color: '#667eea', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{w.title}</div>
                  {w.description && <Text type="secondary" style={{ fontSize: 13 }}>{w.description}</Text>}
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>许下于 {dayjs(w.created_at).format('YYYY-MM-DD')}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="primary" size="small" style={{ background: '#667eea', border: 'none', borderRadius: 12 }} onClick={() => handleComplete(w.id)}>
                    ✅ 完成
                  </Button>
                  <Popconfirm title="确定删除？" onConfirm={() => handleDelete(w.id)}>
                    <Button size="small" danger type="text">
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 已完成的愿望 */}
      {completed.length > 0 && (
        <>
          <Typography.Title level={5} style={{ marginBottom: 12 }}>🎉 已完成 ({completed.length})</Typography.Title>
          {completed.map(w => (
            <Card key={w.id} style={{ borderRadius: 14, marginBottom: 10, opacity: 0.75, borderLeft: '4px solid #52c41a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircleFilled style={{ fontSize: 20, color: '#52c41a', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, textDecoration: 'line-through', color: '#999' }}>{w.title}</div>
                  {w.completed_at && <Text type="secondary" style={{ fontSize: 12 }}>完成于 {dayjs(w.completed_at).format('YYYY-MM-DD')}</Text>}
                </div>
                <Popconfirm title="确定删除？" onConfirm={() => handleDelete(w.id)}>
                  <Button size="small" danger type="text"><DeleteOutlined /></Button>
                </Popconfirm>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* 创建弹窗 */}
      <Modal
        title="✨ 许下愿望"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="title" label="愿望" rules={[{ required: true, message: '请写下你的愿望' }]}>
            <Input placeholder="如：一起去看极光" maxLength={100} />
          </Form.Item>
          <Form.Item name="description" label="备注（可选）">
            <TextArea rows={2} placeholder="补充描述..." maxLength={200} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}>
            记录愿望 ✨
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
