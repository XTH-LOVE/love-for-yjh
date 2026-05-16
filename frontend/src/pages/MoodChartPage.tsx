import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Space, Empty, Spin, DatePicker } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';
dayjs.extend(relativeTime);

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface MoodEntry {
  id: number;
  mood: string;
  content: string;
  created_at: string;
  nickname?: string;
}

const MOOD_COLOR: Record<string, string> = {
  happy: '#52c41a',
  excited: '#fa8c16',
  peaceful: '#1890ff',
  worried: '#faad14',
  sad: '#f5222d',
};

const MOOD_VALUE: Record<string, number> = {
  happy: 5, excited: 4, peaceful: 3, worried: 2, sad: 1,
};

const MOOD_LABEL: Record<string, string> = {
  happy: '😊', excited: '🤩', peaceful: '😌', worried: '😟', sad: '😢',
};

export default function MoodChartPage() {
  const [diaries, setDiaries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchDiaries();
  }, []);

  useEffect(() => {
    if (!loading && diaries.length > 0) {
      drawChart();
    }
  }, [loading, diaries, dateRange]);

  const fetchDiaries = async () => {
    try {
      const res = await fetch('/api/diaries', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) setDiaries(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiaries = dateRange
    ? diaries.filter(d => {
        const date = dayjs(d.created_at);
        return date.isAfter(dateRange[0].startOf('day')) && date.isBefore(dateRange[1].endOf('day'));
      })
    : diaries;

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const sorted = [...filteredDiaries].sort((a, b) =>
      dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf()
    );

    if (sorted.length === 0) {
      ctx.fillStyle = '#ccc';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无心情数据', W / 2, H / 2);
      return;
    }

    const padding = { top: 20, right: 20, bottom: 50, left: 40 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    // Y轴
    const moods = ['😢', '😟', '😌', '🤩', '😊'];
    const moodVals = [1, 2, 3, 4, 5];
    const yStep = chartH / 4;

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + i * yStep;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = MOOD_COLOR[['sad', 'worried', 'peaceful', 'excited', 'happy'][i]];
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(moods[i], padding.left - 6, y + 4);
    }

    // 绘制连线
    if (sorted.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = '#ff6b9d';
      ctx.lineWidth = 2;
      for (let i = 0; i < sorted.length; i++) {
        const x = padding.left + (i / Math.max(sorted.length - 1, 1)) * chartW;
        const val = MOOD_VALUE[sorted[i].mood] || 3;
        const y = padding.top + (1 - (val - 1) / 4) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 绘制点和标签
    for (let i = 0; i < sorted.length; i++) {
      const x = padding.left + (sorted.length === 1 ? chartW / 2 : (i / Math.max(sorted.length - 1, 1)) * chartW);
      const val = MOOD_VALUE[sorted[i].mood] || 3;
      const y = padding.top + (1 - (val - 1) / 4) * chartH;
      const color = MOOD_COLOR[sorted[i].mood] || '#999';

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // X轴日期标签
      const date = dayjs(sorted[i].created_at);
      ctx.fillStyle = '#999';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const label = sorted.length > 7 ? date.format('MM/DD') : date.format('MM/DD');
      ctx.fillText(label, x, H - padding.bottom + 16);
    }

    // 平均值线
    const avg = sorted.reduce((sum, d) => sum + (MOOD_VALUE[d.mood] || 3), 0) / sorted.length;
    const avgY = padding.top + (1 - (avg - 1) / 4) * chartH;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#ff6b9d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, avgY);
    ctx.lineTo(W - padding.right, avgY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff6b9d';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`平均: ${avg.toFixed(1)}`, W - padding.right + 4, avgY + 4);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Typography.Title level={2} style={{ color: '#ff6b9d', margin: 0 }}>
            📈 心情日记
          </Typography.Title>
        <Text type="secondary">记录心情，绘制我们的幸福曲线 💕</Text>
      </div>

      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space>
            {Object.entries(MOOD_LABEL).map(([k, v]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: MOOD_COLOR[k], display: 'inline-block' }} />
                <Text style={{ fontSize: 13 }}>{v}</Text>
              </span>
            ))}
          </Space>
          <RangePicker
            onChange={(vals) => setDateRange(vals as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['开始日期', '结束日期']}
          />
        </div>
      </Card>

      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        {filteredDiaries.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Empty description="该时间段内暂无日记记录" />
          </div>
        )}
      </Card>

      {filteredDiaries.length > 0 && (
        <Card style={{ borderRadius: 16 }}>
          <Typography.Title level={5}>📖 最近心情记录</Typography.Title>
          {filteredDiaries.slice().reverse().slice(0, 10).map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < 9 ? '1px solid #f5f5f5' : 'none' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{MOOD_LABEL[d.mood] || '😌'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#999' }}>{dayjs(d.created_at).format('YYYY-MM-DD HH:mm')}</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>{d.content?.slice(0, 60)}{d.content?.length > 60 ? '...' : ''}</div>
              </div>
              <span style={{ background: MOOD_COLOR[d.mood] + '33', color: MOOD_COLOR[d.mood], borderRadius: 12, padding: '2px 10px', fontSize: 12, flexShrink: 0 }}>
                {MOOD_LABEL[d.mood]}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
