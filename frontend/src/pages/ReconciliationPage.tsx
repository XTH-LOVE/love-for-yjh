import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Empty, message, Tag, Timeline, Select } from 'antd';
import { 
  PlusOutlined, HeartOutlined, SmileOutlined, MessageOutlined, 
  CheckOutlined, UndoOutlined, DeleteOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface Reconciliation {
  id: number;
  type: 'conflict' | 'apology' | 'resolution';
  title: string;
  content: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  createdAt: string;
  mood?: string;
}

const APOLOGY_TEMPLATES = [
  '对不起，我刚才太冲动了...',
  '我知道我错了，让你伤心了',
  '我应该更理解你的感受',
  '对不起，让你难过了',
];

const RESOLUTION_TEMPLATES = [
  '冷静下来后，我们好好谈了谈',
  '我们都愿意为对方改变一点点',
  '原来只是误会，说开了就好',
  '以后遇到问题，我们好好沟通',
];

const MOODS = [
  { value: 'sad', label: '😢 难过', color: '#6366f1' },
  { value: 'angry', label: '😠 生气', color: '#ef4444' },
  { value: 'anxious', label: '😰 焦虑', color: '#f59e0b' },
  { value: 'confused', label: '😕 困惑', color: '#8b5cf6' },
  { value: 'calm', label: '😌 平静', color: '#1D9E75' },
];

const ReconciliationPage: React.FC = () => {
  const [records, setRecords] = useState<Reconciliation[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showResolve, setShowResolve] = useState<Reconciliation | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const stored = localStorage.getItem('love_reconciliation');
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  };

  const saveRecords = (data: Reconciliation[]) => {
    localStorage.setItem('love_reconciliation', JSON.stringify(data));
    setRecords(data);
  };

  const handleAdd = (values: any) => {
    const newRecord: Reconciliation = {
      id: Date.now(),
      type: values.type || 'conflict',
      title: values.title,
      content: values.content,
      status: 'active',
      mood: values.mood,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    };
    saveRecords([...records, newRecord]);
    message.success('💕 记录已保存');
    setShowAdd(false);
    form.resetFields();
  };

  const handleResolve = (id: number, resolution: string) => {
    const updated = records.map(r =>
      r.id === id
        ? { ...r, status: 'resolved' as const, resolvedAt: dayjs().format('YYYY-MM-DD HH:mm'), content: r.content + '\n\n--- 和解 ---\n' + resolution }
        : r
    );
    saveRecords(updated);
    message.success('🎉 已和解！愿你们永远幸福');
    setShowResolve(null);
  };

  const handleDelete = (id: number) => {
    saveRecords(records.filter(r => r.id !== id));
    message.success('已删除');
  };

  const activeRecords = records.filter(r => r.status === 'active');
  const resolvedRecords = records.filter(r => r.status === 'resolved');

  const getMoodInfo = (mood?: string) => {
    return MOODS.find(m => m.value === mood) || MOODS[4];
  };

  return (
    <div className="page-enter" style={{ padding: '16px' }}>
      <Card
        title={
          <span style={{ fontSize: 20, fontWeight: 700, color: '#e91e63' }}>
            💔 → 💕 争吵和解区
          </span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAdd(true)}>
            记录心情
          </Button>
        }
        style={{ borderRadius: 20 }}
      >
        {/* 说明 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(244,63,94,0.05), rgba(255,107,157,0.05))',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          textAlign: 'center',
          border: '1px solid rgba(244,63,94,0.15)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💕</div>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.8 }}>
            每对情侣都会有争吵，这很正常<br />
            重要的是我们如何面对和解决<br />
            <strong style={{ color: '#e91e63' }}>相爱容易，相处不易，且行且珍惜</strong>
          </p>
        </div>

        {/* 统计数据 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 24
        }}>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{records.length}</div>
            <div style={{ fontSize: 11, color: '#999' }}>总记录</div>
          </div>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{activeRecords.length}</div>
            <div style={{ fontSize: 11, color: '#999' }}>进行中</div>
          </div>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1D9E75' }}>{resolvedRecords.length}</div>
            <div style={{ fontSize: 11, color: '#999' }}>已和解</div>
          </div>
        </div>

        {/* 进行中的记录 */}
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ color: '#f59e0b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageOutlined /> 需要和解 ({activeRecords.length})
          </h4>
          
          {activeRecords.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="没有待解决的记录 💕"
            />
          ) : (
            <div>
              {activeRecords.map(record => {
                const moodInfo = getMoodInfo(record.mood);
                return (
                  <div key={record.id} className="reconcile-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <Tag color={moodInfo.color}>{moodInfo.label}</Tag>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>
                          {record.title}
                        </h3>
                        <p style={{ fontSize: 13, color: '#666' }}>{record.createdAt}</p>
                      </div>
                      <Button
                        type="primary"
                        icon={<HeartOutlined />}
                        onClick={() => setShowResolve(record)}
                        style={{ background: 'linear-gradient(135deg, #1D9E75, #10B981)' }}
                      >
                        和解
                      </Button>
                    </div>
                    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {record.content}
                    </p>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(record.id)}
                      style={{ marginTop: 12 }}
                    >
                      删除记录
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 已和解记录 */}
        {resolvedRecords.length > 0 && (
          <div>
            <h4 style={{ color: '#1D9E75', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckOutlined /> 已和解 ({resolvedRecords.length})
            </h4>
            
            <Timeline
              items={resolvedRecords.slice(0, 10).map(record => ({
                color: 'green',
                children: (
                  <div key={record.id} className="reconcile-card resolved">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                          {record.title}
                        </h3>
                        <p style={{ fontSize: 12, color: '#999' }}>
                          {record.createdAt} → 已和解
                        </p>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                      />
                    </div>
                    <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {record.content}
                    </p>
                  </div>
                )
              }))}
            />
          </div>
        )}
      </Card>

      {/* 添加记录弹窗 */}
      <Modal
        title={<span style={{ color: '#f59e0b', fontWeight: 700 }}>📝 记录心情</span>}
        open={showAdd}
        onCancel={() => setShowAdd(false)}
        footer={null}
        centered
      >
        <Form form={form} onFinish={handleAdd} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="mood" label="现在的心情">
            <Select placeholder="选择心情">
              {MOODS.map(m => (
                <Select.Option key={m.value} value={m.value}>
                  {m.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="title" label="简短描述" rules={[{ required: true, message: '描述一下这件事' }]}>
            <Input placeholder="例如：因为什么事情争吵" />
          </Form.Item>

          <Form.Item name="content" label="详细说明">
            <Input.TextArea rows={4} placeholder="写下你的想法和感受..." />
          </Form.Item>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 12, color: '#999' }}>快速添加：</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {APOLOGY_TEMPLATES.map(t => (
                <Button
                  key={t}
                  size="small"
                  onClick={() => {
                    form.setFieldValue('title', '吵架记录');
                    form.setFieldValue('content', t);
                  }}
                  style={{ borderRadius: 16, fontSize: 11 }}
                >
                  {t.slice(0, 8)}...
                </Button>
              ))}
            </div>
          </div>

          <Button type="primary" htmlType="submit" block style={{ height: 46, borderRadius: 23, marginTop: 16 }}>
            💾 保存记录
          </Button>
        </Form>
      </Modal>

      {/* 和解弹窗 */}
      <Modal
        title={<span style={{ color: '#1D9E75', fontWeight: 700 }}>🎉 达成和解</span>}
        open={!!showResolve}
        onCancel={() => setShowResolve(null)}
        footer={null}
        centered
      >
        {showResolve && (
          <div style={{ marginTop: 20 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(29,158,117,0.1), rgba(16,185,129,0.1))',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💕</div>
              <p style={{ fontSize: 15, color: '#333', fontWeight: 500 }}>
                恭喜你们选择和解！<br />
                没有什么是沟通解决不了的
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>和解方式：</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RESOLUTION_TEMPLATES.map((t, i) => (
                  <Button
                    key={i}
                    block
                    onClick={() => handleResolve(showResolve.id, t)}
                    style={{ 
                      height: 48,
                      textAlign: 'left',
                      borderRadius: 12,
                      borderColor: '#1D9E75'
                    }}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="link" onClick={() => setShowResolve(null)} block>
              还没想好，先关闭
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReconciliationPage;
