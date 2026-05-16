import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Progress, Typography, Space, Empty, message, Result, Modal } from 'antd';
import { RocketOutlined, CheckCircleFilled, CloseCircleFilled, TrophyFilled, ReloadOutlined } from '@ant-design/icons';
import '../styles/global.css';

const { Text } = Typography;

interface QuizItem {
  id: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<{ total: number; correct: number }>({ total: 0, correct: 0 });

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quizzes/random?limit=5', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) setQuizzes(json.data || []);
    } catch (e) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/quizzes/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) setStats(json.data);
    } catch (e) {}
  };

  useEffect(() => { loadQuizzes(); loadStats(); }, []);

  const current = quizzes[currentIndex];

  const handleAnswer = async (option: string) => {
    if (!current) return;
    setSubmitting(true);
    const newAnswers = { ...answers, [current.id]: option };
    setAnswers(newAnswers);

    try {
      const res = await fetch('/api/quizzes/answer', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: current.id, answer: option }),
      });
      const json = await res.json();
      if (json.code === 1) {
        setResults(prev => ({ ...prev, [current.id]: json.data.isCorrect }));
      }
    } catch (e) {}
    setSubmitting(false);
  };

  const nextQuestion = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
      loadStats();
    }
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const percent = quizzes.length > 0 ? Math.round((correctCount / quizzes.length) * 100) : 0;

  const getResultTitle = () => {
    if (percent >= 80) return '默契满分！💯';
    if (percent >= 60) return '默契不错！😊';
    if (percent >= 40) return '还需努力了解彼此 🤔';
    return '快去多了解 TA 吧！💕';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Text>加载中...</Text></div>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title level={2} style={{ color: '#ff6b9d', margin: 0 }}>🎯 默契考验</Typography.Title>
        <Text type="secondary">测一测你们有多了解彼此 💕</Text>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>历史战绩：{stats.correct} / {stats.total} 题正确</Text>
        </div>
      </div>

      {!finished ? (
        <>
          {/* 进度 */}
          <Progress
            percent={Math.round(((currentIndex + 1) / quizzes.length) * 100)}
            format={() => `${currentIndex + 1} / ${quizzes.length}`}
            strokeColor="#ff6b9d"
            style={{ marginBottom: 20 }}
          />

          {current && (
            <Card style={{ borderRadius: 16, marginBottom: 16 }} styles={{ body: { padding: 24 } }}>
              <div style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 24 }}>
                {current.content}
              </div>

              <Radio.Group
                value={answers[current.id]}
                onChange={e => handleAnswer(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const val = current[`option_${opt.toLowerCase()}` as keyof QuizItem];
                    if (!val) return null;
                    const isSelected = answers[current.id] === opt;
                    const isCorrect = results[current.id] !== undefined && answers[current.id] === opt;
                    const isWrong = results[current.id] !== undefined && isSelected && !results[current.id];

                    let bg = '#f5f5f5';
                    if (isCorrect) bg = '#f6ffed';
                    if (isWrong) bg = '#fff2f0';

                    return (
                      <Radio
                        key={opt}
                        value={opt}
                        disabled={results[current.id] !== undefined}
                        style={{
                          width: '100%',
                          background: bg,
                          borderRadius: 12,
                          padding: '14px 16px',
                          border: `2px solid ${isCorrect ? '#52c41a' : isWrong ? '#ff4d4f' : 'transparent'}`,
                        }}
                      >
                        <span style={{ fontWeight: 700, marginRight: 8 }}>{opt}.</span>
                        {val}
                        {isCorrect && <CheckCircleFilled style={{ color: '#52c41a', marginLeft: 8 }} />}
                        {isWrong && <CloseCircleFilled style={{ color: '#ff4d4f', marginLeft: 8 }} />}
                      </Radio>
                    );
                  })}
                </Space>
              </Radio.Group>

              {results[current.id] !== undefined && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <Text style={{ color: results[current.id] ? '#52c41a' : '#ff4d4f', fontSize: 16 }}>
                    {results[current.id] ? '🎉 回答正确！' : '😅 回答错误，继续加油！'}
                  </Text>
                  <br />
                  <Button type="primary" onClick={nextQuestion} style={{ marginTop: 12, borderRadius: 20, background: '#ff6b9d', border: 'none' }}>
                    {currentIndex < quizzes.length - 1 ? '下一题 →' : '查看结果 🎯'}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </>
      ) : (
        /* 结果页 */
        <Card style={{ borderRadius: 16, textAlign: 'center', background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)', border: 'none' }} styles={{ body: { padding: 32 } }}>
          <TrophyFilled style={{ fontSize: 56, color: '#fff', marginBottom: 16 }} />
          <Typography.Title level={2} style={{ color: '#fff', margin: 0 }}>{getResultTitle()}</Typography.Title>
          <div style={{ fontSize: 56, fontWeight: 700, color: '#fff', margin: '16px 0' }}>{percent}%</div>
          <Text style={{ color: 'rgba(255,255,255,0.9)' }}>答对 {correctCount} / {quizzes.length} 题</Text>
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="#fff"
            trailColor="rgba(255,255,255,0.3)"
            style={{ marginTop: 16 }}
          />
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              type="primary"
              ghost
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => { setFinished(false); setCurrentIndex(0); setAnswers({}); setResults({}); loadQuizzes(); }}
              style={{ borderColor: '#fff', color: '#fff', borderRadius: 20 }}
            >
              再来一轮
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
