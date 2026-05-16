import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, List, Avatar, Tag, Empty, message, Space, Typography } from 'antd';
import { HeartFilled, SendOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';
dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text } = Typography;

const MOOD_COLORS: Record<string, string> = {
  happy: '#52c41a', excited: '#fa8c16', peaceful: '#1890ff', worried: '#faad14', sad: '#f5222d',
};

const MOOD_LABELS: Record<string, string> = {
  happy: '😊 幸福', excited: '🤩 兴奋', peaceful: '😌 平静', worried: '😟 担心', sad: '😢 难过',
};

interface Question {
  id: number;
  content: string;
  answers: Array<{ id: number; user_id: number; nickname: string; answer: string; created_at: string }>;
  myAnswer: string | null;
}

export default function DailyQuestionPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  const loadToday = async () => {
    try {
      const res = await fetch('/api/questions/today', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) setQuestion(json.data);
    } catch (e) {
      message.error('加载今日问题失败');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/questions/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) setHistory(json.data);
    } catch (e) {
      message.error('加载历史记录失败');
    }
  };

  useEffect(() => {
    loadToday();
    loadHistory();
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/questions/answer', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question?.id, answer: answer.trim() }),
      });
      const json = await res.json();
      if (json.code === 1) {
        message.success('回答已提交 💕');
        setAnswerModalOpen(false);
        setAnswer('');
        loadToday();
        loadHistory();
      } else {
        message.error(json.message);
      }
    } catch (e) {
      message.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const refreshQuestion = async () => {
    setLoading(true);
    await loadToday();
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Typography.Title level={2} style={{ color: '#ff6b9d', margin: 0 }}>
            💬 每日一问
          </Typography.Title>
        <Text type="secondary">每天一个问题，增进彼此的了解 💕</Text>
      </div>

      {/* 今日问题卡片 */}
      {loading ? null : question ? (
        <Card
          style={{
            background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            marginBottom: 16,
          }}
          styles={{ body: { padding: 24 } }}
        >
          <div style={{ textAlign: 'center' }}>
            <CalendarOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>今日问题</div>
            <Typography.Title level={3} style={{ color: '#fff', margin: '8px 0 20px' }}>
              {question.content}
            </Typography.Title>

            {question.myAnswer ? (
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 16px', textAlign: 'left' }}>
                <Text style={{ color: '#fff', fontSize: 13, opacity: 0.9 }}>我的回答：</Text>
                <div style={{ color: '#fff', fontSize: 16, marginTop: 4 }}>{question.myAnswer}</div>
              </div>
            ) : (
              <Button
                type="primary"
                ghost
                size="large"
                icon={<SendOutlined />}
                onClick={() => setAnswerModalOpen(true)}
                style={{ borderColor: '#fff', color: '#fff', borderRadius: 24, height: 44 }}
              >
                回答这个问题
              </Button>
            )}
          </div>

          {question.answers && question.answers.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <Text style={{ color: '#fff', fontSize: 13, opacity: 0.9 }}>
                💡 共 {question.answers.length} 条回答
              </Text>
              <div style={{ marginTop: 12 }}>
                {question.answers.map((a, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Avatar size={28} style={{ background: '#fff', color: '#c44569', flexShrink: 0 }}>{a.nickname?.[0] || '?'}</Avatar>
                    <div>
                      <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8 }}>{a.nickname}</Text>
                      <div style={{ color: '#fff', fontSize: 14, marginTop: 2 }}>{a.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', borderRadius: 16, padding: 40 }}>
          <Empty description="今日暂无问题" />
          <Button onClick={refreshQuestion} style={{ marginTop: 16 }}>刷新试试</Button>
        </Card>
      )}

      {/* 历史记录按钮 */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button type="link" onClick={() => { loadHistory(); setHistoryModalOpen(true); }}>
          📋 查看历史问答
        </Button>
        <Button type="link" onClick={refreshQuestion}>
          🔄 换一个问题
        </Button>
      </div>

      {/* 回答弹窗 */}
      <Modal
        title="💬 回答今日问题"
        open={answerModalOpen}
        onCancel={() => setAnswerModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="提交回答"
        centered
      >
        {question && (
          <div style={{ background: '#fff5f8', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <Text type="secondary">问题：</Text>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, color: '#c44569' }}>{question.content}</div>
          </div>
        )}
        <TextArea
          rows={4}
          placeholder="在这里写下你的答案..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          maxLength={300}
          showCount
        />
      </Modal>

      {/* 历史记录弹窗 */}
      <Modal
        title="📋 历史问答"
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        footer={null}
        width={560}
        centered
      >
        {history.length === 0 ? (
          <Empty description="暂无历史记录" />
        ) : (
          <List
            dataSource={history}
            renderItem={(item: any) => (
              <List.Item style={{ padding: '12px 0' }}>
                <div style={{ width: '100%' }}>
                  <Tag color="pink" style={{ marginBottom: 6 }}>问题</Tag>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>{item.content}</div>
                  {item.my_answer ? (
                    <div style={{ background: '#fff5f8', borderRadius: 8, padding: '8px 12px' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>我的回答：</Text>
                      <div style={{ fontSize: 14, color: '#c44569' }}>{item.my_answer}</div>
                      <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(item.answered_at).fromNow()}</Text>
                    </div>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>未回答</Text>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
}
