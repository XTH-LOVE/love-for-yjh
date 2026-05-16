import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Progress, message, Empty } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';
dayjs.extend(relativeTime);

interface Achievement {
  id: number;
  key: string;
  title: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  unlocked: boolean;
  unlocked_at: string | null;
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

// 进度计算（估算）
const getProgress = (a: Achievement): number => {
  if (a.unlocked) return 100;
  switch (a.condition_type) {
    case 'days_together': {
      const start = dayjs('2026-01-14');
      const days = Math.floor(dayjs().diff(start, 'day', true));
      return Math.min(100, Math.round(days / a.condition_value * 100));
    }
    case 'diary_count': return Math.min(100, Math.round(2 / a.condition_value * 100));
    case 'photo_count': return Math.min(100, Math.round(1 / a.condition_value * 100));
    case 'whisper_sent': return Math.min(100, Math.round(1 / a.condition_value * 100));
    case 'anniversary_count': return Math.min(100, Math.round(1 / a.condition_value * 100));
    default: return 0;
  }
};

export default function AchievementPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/achievements');
      if (res.code === 200) setAchievements(res.data || []);
    } catch {
      message.error('加载成就失败');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAchievements();
    // 每次进入页面检查是否有新成就解锁
    setChecking(true);
    apiFetch('/achievements/check', { method: 'POST' })
      .then(res => {
        if (res.code === 200 && res.data?.length > 0) {
          const names = res.data.map((a: Achievement) => `${a.icon} ${a.title}`).join('、');
          message.success(`🎉 解锁新成就：${names}`);
        }
      })
      .finally(() => setChecking(false));
  }, [loadAchievements]);

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="page-enter" style={{ padding: '0 0 40px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, background: 'var(--gradient-love)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 24 }}>🏆 爱情成就</h2>
        <p style={{ color: '#999', margin: '4px 0 0', fontSize: 13 }}>记录我们一起走过的每一步</p>
      </div>

      {/* 统计卡片 */}
      <Card className="love-card" style={{ marginBottom: 20, textAlign: 'center' }} bodyStyle={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 48 }}>🏆</span>
          <div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#ff6b9d', lineHeight: 1 }}>
              {unlocked.length} / {achievements.length}
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>已解锁成就</div>
          </div>
        </div>
        <Progress
          percent={achievements.length > 0 ? Math.round(unlocked.length / achievements.length * 100) : 0}
          showInfo={false}
          strokeColor={{ '0%': '#ff6b9d', '100%': '#ff8a80' }}
          trailColor="rgba(255,107,157,0.1)"
          style={{ marginTop: 16 }}
        />
        <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>
          {achievements.length > 0 ? Math.round(unlocked.length / achievements.length * 100) : 0}% 完成，继续加油！💪
        </div>
      </Card>

      {unlocked.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12, color: '#ff6b9d', fontSize: 16 }}>
            ✨ 已解锁 ({unlocked.length})
          </h3>
          <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
            {unlocked.map((a, idx) => (
              <Col xs={24} sm={12} md={8} key={a.key}>
                <Card
                  className="love-card"
                  style={{
                    animation: `fadeInUp ${0.3 + idx * 0.08}s ease`,
                    border: '2px solid rgba(255,107,157,0.3)',
                    background: 'linear-gradient(135deg, rgba(255,107,157,0.08), rgba(255,138,128,0.04))',
                  }}
                  bodyStyle={{ padding: '16px', textAlign: 'center' }}
                >
                  <div style={{ fontSize: 40, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#ff6b9d', marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{a.description}</div>
                  {a.unlocked_at && (
                    <div style={{ fontSize: 11, color: '#bbb' }}>
                      {dayjs(a.unlocked_at).format('YYYY-MM-DD')} 解锁
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ background: 'rgba(82,196,26,0.15)', color: '#52c41a', borderRadius: 8, padding: '2px 10px', fontSize: 12 }}>
                      ✓ 已解锁
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {locked.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12, color: '#999', fontSize: 16 }}>
            🔒 即将解锁 ({locked.length})
          </h3>
          <Row gutter={[12, 12]}>
            {locked.map((a, idx) => {
              const progress = getProgress(a);
              return (
                <Col xs={24} sm={12} md={8} key={a.key}>
                  <Card
                    className="love-card"
                    style={{
                      animation: `fadeInUp ${0.3 + (unlocked.length + idx) * 0.08}s ease`,
                      opacity: 0.85,
                    }}
                    bodyStyle={{ padding: '16px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 8, filter: 'grayscale(0.5)', opacity: 0.6 }}>{a.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#888', marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#bbb', marginBottom: 10 }}>{a.description}</div>
                    <Progress
                      percent={progress}
                      size="small"
                      showInfo
                      strokeColor="#ff6b9d"
                      trailColor="rgba(255,107,157,0.15)"
                      format={(p) => `${p}%`}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
}
