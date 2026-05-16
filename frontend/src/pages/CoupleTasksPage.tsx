import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Checkbox, Empty, message, Progress, Tag, Radio } from 'antd';
import { PlusOutlined, CheckOutlined, TrophyOutlined, DeleteOutlined, FireOutlined } from '@ant-design/icons';

interface Task {
  id: number;
  title: string;
  description?: string;
  reward: number;
  completed: boolean;
  myCheck: boolean;
  partnerCheck: boolean;
  createdAt: string;
  completedAt?: string;
  emoji: string;
}

const EMOJIS = ['🤝', '💕', '🌟', '✨', '🎯', '💪', '🎉', '❤️'];

const TASK_SUGGESTIONS = [
  { title: '一起做饭', emoji: '🍳', reward: 10 },
  { title: '看一场电影', emoji: '🎬', reward: 15 },
  { title: '散步聊天', emoji: '🚶', reward: 5 },
  { title: '给对方写一封信', emoji: '💌', reward: 20 },
  { title: '一起运动30分钟', emoji: '🏃', reward: 10 },
  { title: '拍摄情侣照片', emoji: '📸', reward: 15 },
  { title: '一起做家务', emoji: '🧹', reward: 10 },
  { title: '分享今天的趣事', emoji: '💬', reward: 5 },
];

const CoupleTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const stored = localStorage.getItem('love_tasks');
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  };

  const saveTasks = (data: Task[]) => {
    localStorage.setItem('love_tasks', JSON.stringify(data));
    setTasks(data);
  };

  const handleAdd = (values: any) => {
    const newTask: Task = {
      id: Date.now(),
      title: values.title,
      description: values.description,
      reward: values.reward || 10,
      completed: false,
      myCheck: false,
      partnerCheck: false,
      createdAt: new Date().toISOString(),
      emoji: values.emoji || '🤝',
    };
    saveTasks([...tasks, newTask]);
    message.success('💕 新任务已添加');
    setShowAdd(false);
    form.resetFields();
  };

  const toggleMyCheck = (id: number) => {
    const updated = tasks.map(task =>
      task.id === id
        ? { ...task, myCheck: !task.myCheck }
        : task
    );
    checkCompletion(updated);
  };

  const togglePartnerCheck = (id: number) => {
    const updated = tasks.map(task =>
      task.id === id
        ? { ...task, partnerCheck: !task.partnerCheck }
        : task
    );
    checkCompletion(updated);
  };

  const checkCompletion = (taskList: Task[]) => {
    const updated = taskList.map(task => {
      if (task.myCheck && task.partnerCheck && !task.completed) {
        message.success(`🎉 任务完成：${task.title}！获得 ${task.reward} 积分`);
        return { ...task, completed: true, completedAt: new Date().toISOString() };
      }
      return task;
    });
    saveTasks(updated);
  };

  const handleDelete = (id: number) => {
    saveTasks(tasks.filter(task => task.id !== id));
    message.success('任务已删除');
  };

  const getTotalPoints = () => {
    return tasks.filter(t => t.completed).reduce((sum, t) => sum + t.reward, 0);
  };

  const getProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="page-enter" style={{ padding: '16px' }}>
      <Card
        title={
          <span style={{ fontSize: 20, fontWeight: 700, color: '#e91e63' }}>
            🤝 情侣任务
          </span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAdd(true)}>
            添加任务
          </Button>
        }
        style={{ borderRadius: 20 }}
      >
        {/* 统计卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24
        }}>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#e91e63' }}>{tasks.length}</div>
            <div style={{ fontSize: 11, color: '#999' }}>总任务</div>
          </div>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1D9E75' }}>{completedTasks.length}</div>
            <div style={{ fontSize: 11, color: '#999' }}>已完成</div>
          </div>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>
              <TrophyOutlined /> {getTotalPoints()}
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>积分</div>
          </div>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#a855f7' }}>{getProgress()}%</div>
            <div style={{ fontSize: 11, color: '#999' }}>进度</div>
          </div>
        </div>

        {/* 进度条 */}
        <div style={{ marginBottom: 24 }}>
          <div className="task-progress">
            <div className="task-progress-bar" style={{ width: `${getProgress()}%` }} />
          </div>
        </div>

        {/* 进行中任务 */}
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ color: '#e91e63', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FireOutlined /> 进行中的任务 ({activeTasks.length})
          </h4>
          
          {activeTasks.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="所有任务都完成啦！🎉"
            />
          ) : (
            <div>
              {activeTasks.map(task => (
                <div key={task.id} className="task-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 32 }}>{task.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                          {task.description}
                        </div>
                      )}
                      <Tag color="gold" style={{ marginBottom: 12 }}>
                        +{task.reward} 积分
                      </Tag>
                      
                      {/* 双方确认 */}
                      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                        <Checkbox
                          checked={task.myCheck}
                          onChange={() => toggleMyCheck(task.id)}
                        >
                          <span style={{ fontSize: 14 }}>我完成了 ✓</span>
                        </Checkbox>
                        <Checkbox
                          checked={task.partnerCheck}
                          onChange={() => togglePartnerCheck(task.id)}
                        >
                          <span style={{ fontSize: 14 }}>TA完成了 ✓</span>
                        </Checkbox>
                      </div>
                    </div>
                    
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(task.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 已完成任务 */}
        {completedTasks.length > 0 && (
          <div>
            <h4 style={{ color: '#1D9E75', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckOutlined /> 已完成任务 ({completedTasks.length})
            </h4>
            
            <div>
              {completedTasks.map(task => (
                <div key={task.id} className="task-card completed">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28, opacity: 0.6 }}>{task.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: '#999', textDecoration: 'line-through' }}>
                        {task.title}
                      </div>
                    </div>
                    <Tag color="success">+{task.reward}</Tag>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(task.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 添加任务弹窗 */}
      <Modal
        title={<span style={{ color: '#e91e63', fontWeight: 700 }}>➕ 添加新任务</span>}
        open={showAdd}
        onCancel={() => setShowAdd(false)}
        footer={null}
        centered
        width={450}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="emoji"
            label="任务图标"
            initialValue="🤝"
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EMOJIS.map(e => (
                <span
                  key={e}
                  onClick={() => form.setFieldValue('emoji', e)}
                  style={{
                    fontSize: 28,
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 12,
                    background: form.getFieldValue('emoji') === e ? 'rgba(255,107,157,0.2)' : 'transparent',
                    border: form.getFieldValue('emoji') === e ? '2px solid #e91e63' : '2px solid transparent'
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </Form.Item>

          <Form.Item name="title" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
            <Input placeholder="例如：一起看日落" />
          </Form.Item>

          <Form.Item name="description" label="任务描述（可选）">
            <Input.TextArea rows={2} placeholder="任务的详细描述..." />
          </Form.Item>

          <Form.Item name="reward" label="奖励积分" initialValue={10}>
            <Radio.Group>
              {[5, 10, 15, 20, 30].map(v => (
                <Radio.Button key={v} value={v}>{v}分</Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          {/* 快捷添加 */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>快捷添加：</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TASK_SUGGESTIONS.slice(0, 4).map(s => (
                <Button
                  key={s.title}
                  size="small"
                  onClick={() => {
                    form.setFieldValue('title', s.title);
                    form.setFieldValue('emoji', s.emoji);
                    form.setFieldValue('reward', s.reward);
                  }}
                  style={{ borderRadius: 16 }}
                >
                  {s.emoji} {s.title}
                </Button>
              ))}
            </div>
          </div>

          <Button type="primary" htmlType="submit" block style={{ height: 46, borderRadius: 23 }}>
            🤝 添加任务
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default CoupleTasksPage;
