import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Empty, message, Progress, Tag } from 'antd';
import { PlusOutlined, LockOutlined, UnlockOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Capsule {
  id: number;
  title: string;
  content: string;
  unlockDate: string;
  createdAt: string;
  emoji: string;
  unlocked: boolean;
}

const EMOJIS = ['🎁', '💌', '✨', '🌟', '💫', '🎀', '💝', '🌈'];

const TimeCapsulePage: React.FC = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCapsules();
  }, []);

  const loadCapsules = () => {
    const stored = localStorage.getItem('love_time_capsules');
    if (stored) {
      const data = JSON.parse(stored) as Capsule[];
      // 检查哪些胶囊可以解锁
      const updated = data.map(capsule => ({
        ...capsule,
        unlocked: dayjs().isAfter(dayjs(capsule.unlockDate)) || false
      }));
      setCapsules(updated);
    }
  };

  const saveCapsules = (data: Capsule[]) => {
    localStorage.setItem('love_time_capsules', JSON.stringify(data));
    setCapsules(data);
  };

  const handleAdd = (values: any) => {
    const newCapsule: Capsule = {
      id: Date.now(),
      title: values.title,
      content: values.content,
      unlockDate: values.date.format('YYYY-MM-DD'),
      createdAt: dayjs().format('YYYY-MM-DD'),
      emoji: values.emoji || '🎁',
      unlocked: false,
    };
    saveCapsules([...capsules, newCapsule]);
    message.success('时光胶囊已封存，等待未来开启～');
    setShowAdd(false);
    form.resetFields();
  };

  const getDaysUntilUnlock = (date: string) => {
    const now = dayjs();
    const target = dayjs(date);
    const diff = target.diff(now, 'day');
    return diff;
  };

  const getProgress = (createdAt: string, unlockDate: string) => {
    const total = dayjs(unlockDate).diff(dayjs(createdAt), 'day');
    const elapsed = dayjs().diff(dayjs(createdAt), 'day');
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const lockedCapsules = capsules.filter(c => !c.unlocked);
  const unlockedCapsules = capsules.filter(c => c.unlocked);

  return (
    <div className="page-enter" style={{ padding: '16px' }}>
      <Card
        title={
          <span style={{ fontSize: 20, fontWeight: 700, color: '#e91e63' }}>
            ⏳ 时光胶囊
          </span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAdd(true)}>
            创建胶囊
          </Button>
        }
        style={{ borderRadius: 20 }}
      >
        {/* 说明 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(255,107,157,0.1))',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          textAlign: 'center',
          border: '2px dashed rgba(168,85,247,0.3)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 8 }}>
            写给未来的我们
          </p>
          <p style={{ fontSize: 14, color: '#666' }}>
            写下想对 TA 说的话，选择一个特殊的日子<br />
            在那一天，胶囊会自动解锁，带来惊喜！
          </p>
        </div>

        {/* 未解锁的胶囊 */}
        {lockedCapsules.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ color: '#a855f7', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LockOutlined /> 待解锁胶囊 ({lockedCapsules.length})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {lockedCapsules.map(capsule => {
                const daysLeft = getDaysUntilUnlock(capsule.unlockDate);
                const progress = getProgress(capsule.createdAt, capsule.unlockDate);
                
                return (
                  <div
                    key={capsule.id}
                    className="time-capsule"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCapsule(capsule)}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{capsule.emoji}</div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#333' }}>
                      {capsule.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
                      解锁日期：{capsule.unlockDate}
                    </p>
                    
                    <Progress
                      percent={progress}
                      size="small"
                      strokeColor="linear-gradient(90deg, #a855f7, #e91e63)"
                      format={() => `${daysLeft}天后`}
                    />
                    
                    {daysLeft <= 7 && daysLeft > 0 && (
                      <Tag color="purple" style={{ marginTop: 12 }}>
                        🎉 即将解锁！
                      </Tag>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 已解锁的胶囊 */}
        {unlockedCapsules.length > 0 && (
          <div>
            <h4 style={{ color: '#1D9E75', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UnlockOutlined /> 已解锁胶囊 ({unlockedCapsules.length})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {unlockedCapsules.map(capsule => (
                <div
                  key={capsule.id}
                  className="time-capsule unlocked"
                  style={{ cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => setSelectedCapsule({ ...capsule, unlocked: true })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 40 }}>{capsule.emoji}</div>
                    <Tag color="green">🎁 已解锁</Tag>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 12, marginBottom: 8, color: '#333' }}>
                    {capsule.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#666' }}>
                    创建于 {capsule.createdAt}
                  </p>
                  <div style={{
                    marginTop: 12,
                    padding: 12,
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: 12,
                    fontSize: 14,
                    color: '#555'
                  }}>
                    点击查看内容...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {capsules.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: '#999' }}>
                还没有时光胶囊<br />
                点击右上角创建第一个吧！
              </span>
            }
          />
        )}
      </Card>

      {/* 创建胶囊弹窗 */}
      <Modal
        title={<span style={{ color: '#a855f7', fontWeight: 700 }}>🎁 创建时光胶囊</span>}
        open={showAdd}
        onCancel={() => setShowAdd(false)}
        footer={null}
        centered
      >
        <Form form={form} onFinish={handleAdd} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="emoji"
            label="胶囊图标"
            initialValue="🎁"
          >
            <div style={{ display: 'flex', gap: 8 }}>
              {EMOJIS.map(e => (
                <span
                  key={e}
                  onClick={() => form.setFieldValue('emoji', e)}
                  style={{
                    fontSize: 28,
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 12,
                    background: form.getFieldValue('emoji') === e ? 'rgba(168,85,247,0.2)' : 'transparent',
                    border: form.getFieldValue('emoji') === e ? '2px solid #a855f7' : '2px solid transparent'
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </Form.Item>

          <Form.Item name="title" label="标题" rules={[{ required: true, message: '给胶囊起个名字吧' }]}>
            <Input placeholder="写给未来的一封信" />
          </Form.Item>

          <Form.Item name="content" label="内容" rules={[{ required: true, message: '写下想说的话' }]}>
            <Input.TextArea rows={4} placeholder="我想对未来的你说..." />
          </Form.Item>

          <Form.Item
            name="date"
            label="解锁日期"
            rules={[{ required: true, message: '选择胶囊解锁日期' }]}
            extra="胶囊将在这一天自动解锁"
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().endOf('day')}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ height: 46, borderRadius: 23, background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
          >
            ⏳ 封存时光胶囊
          </Button>
        </Form>
      </Modal>

      {/* 查看胶囊弹窗 */}
      <Modal
        title={null}
        open={!!selectedCapsule}
        onCancel={() => setSelectedCapsule(null)}
        footer={null}
        centered
        width={400}
      >
        {selectedCapsule && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {selectedCapsule.unlocked ? '🎁' : '🔒'}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e91e63', marginBottom: 8 }}>
              {selectedCapsule.title}
            </h3>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
              {selectedCapsule.unlocked
                ? `于 ${selectedCapsule.unlockDate} 解锁`
                : `将于 ${selectedCapsule.unlockDate} 解锁`
              }
            </p>

            {selectedCapsule.unlocked ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,107,157,0.1))',
                borderRadius: 16,
                padding: 24,
                textAlign: 'left',
                border: '1px solid rgba(255,215,0,0.3)'
              }}>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
                  {selectedCapsule.content}
                </p>
              </div>
            ) : (
              <div style={{ color: '#666' }}>
                <p>📅 还剩 <strong style={{ color: '#a855f7' }}>{getDaysUntilUnlock(selectedCapsule.unlockDate)}</strong> 天解锁</p>
                <p style={{ marginTop: 12, fontSize: 14 }}>
                  当时光胶囊解锁时，你会看到这段话<br />
                  那是曾经的你们，给未来的礼物
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TimeCapsulePage;
