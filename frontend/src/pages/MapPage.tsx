import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Form, Input, message, Empty, List, Tag, DatePicker } from 'antd';
import { PlusOutlined, EnvironmentOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Footprint {
  id: number;
  place: string;
  description: string;
  date: string;
  lat?: number;
  lng?: number;
  emoji: string;
}

const EMOJIS = ['📍', '🏠', '💕', '🌅', '🌄', '🏖️', '⛺', '🎢', '🎡', '🏰'];

const MapPage: React.FC = () => {
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form] = Form.useForm();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    loadFootprints();
    initMap();
  }, []);

  const loadFootprints = () => {
    const stored = localStorage.getItem('love_footprints');
    if (stored) {
      setFootprints(JSON.parse(stored));
    }
  };

  const saveFootprints = (data: Footprint[]) => {
    localStorage.setItem('love_footprints', JSON.stringify(data));
    setFootprints(data);
  };

  const initMap = async () => {
    // 使用高德地图或显示静态地图
    setMapLoaded(true);
  };

  const handleAdd = (values: any) => {
    const newFootprint: Footprint = {
      id: Date.now(),
      place: values.place,
      description: values.description || '',
      date: values.date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
      emoji: values.emoji || '📍',
    };
    saveFootprints([...footprints, newFootprint]);
    message.success('足迹添加成功！');
    setShowAdd(false);
    form.resetFields();
  };

  const handleDelete = (id: number) => {
    saveFootprints(footprints.filter(f => f.id !== id));
    message.success('足迹已删除');
  };

  const getMapUrl = () => {
    if (footprints.length === 0) {
      return `https://restapi.amap.com/v3/staticmap?location=116.397428,39.90923&zoom=10&size=750*400&markers=mid,,A:116.397428,39.90923&key=demo`;
    }
    const center = footprints[0];
    const markers = footprints.map((f, i) => `mid,,${String.fromCharCode(65 + i)}:${116.397428 + i * 0.01},${39.90923 + i * 0.01}`).join('&');
    return `https://restapi.amap.com/v3/staticmap?location=116.397428,39.90923&zoom=8&size=750*400&markers=${markers}&key=demo`;
  };

  return (
    <div className="page-enter" style={{ padding: '16px' }}>
      <Card
        title={
          <span style={{ fontSize: 20, fontWeight: 700, color: '#e91e63' }}>
            🗺️ 我们的足迹
          </span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAdd(true)}>
            添加足迹
          </Button>
        }
        style={{ borderRadius: 20 }}
      >
        {/* 地图展示区 */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255,240,246,0.8), rgba(255,220,235,0.5))',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          minHeight: 300,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {footprints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
              <p style={{ fontSize: 16 }}>还没有记录任何足迹</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>点击右上角添加你们一起去过的地方</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* 简化的地图可视化 */}
              <div style={{
                background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%)',
                borderRadius: 16,
                height: 250,
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid rgba(255,107,157,0.2)'
              }}>
                {/* 地图装饰 */}
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  right: 10,
                  bottom: 10,
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(0,100,0,0.1) 30px, rgba(0,100,0,0.1) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0,100,0,0.1) 30px, rgba(0,100,0,0.1) 31px)',
                  borderRadius: 12
                }} />
                
                {/* 足迹标记 */}
                {footprints.map((f, i) => {
                  const x = 15 + (i % 4) * 22;
                  const y = 20 + Math.floor(i / 4) * 35;
                  return (
                    <div
                      key={f.id}
                      style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -100%)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        animation: 'bounce 2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`
                      }}
                      title={f.place}
                    >
                      <div style={{
                        fontSize: 28,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }}>
                        {f.emoji}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: '#333',
                        background: 'rgba(255,255,255,0.9)',
                        padding: '2px 6px',
                        borderRadius: 8,
                        marginTop: 2,
                        whiteSpace: 'nowrap'
                      }}>
                        {f.place}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 连接线 */}
              {footprints.length > 1 && (
                <svg style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  right: 20,
                  bottom: 20,
                  width: 'calc(100% - 40px)',
                  height: 'calc(100% - 40px)',
                  pointerEvents: 'none'
                }}>
                  <polyline
                    points={footprints.map((f, i) => {
                      const x = (15 + (i % 4) * 22) / 100 * (mapRef.current?.clientWidth || 300);
                      const y = (20 + Math.floor(i / 4) * 35) / 100 * 210;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgba(255,107,157,0.4)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* 足迹列表 */}
        <div style={{ marginTop: 20 }}>
          <h4 style={{ color: '#e91e63', marginBottom: 16, fontWeight: 600 }}>
            📋 足迹记录 ({footprints.length})
          </h4>
          
          {footprints.length === 0 ? (
            <Empty description="还没有足迹记录" />
          ) : (
            <List
              dataSource={[...footprints].reverse()}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                      key="delete"
                    />
                  ]}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(255,107,157,0.1)'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(168,85,247,0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24
                      }}>
                        {item.emoji}
                      </div>
                    }
                    title={<span style={{ fontWeight: 600 }}>{item.place}</span>}
                    description={
                      <div>
                        {item.description && (
                          <p style={{ margin: '4px 0', color: '#666' }}>{item.description}</p>
                        )}
                        <Tag icon={<CalendarOutlined />} style={{ marginTop: 4 }}>
                          {item.date}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Card>

      {/* 添加足迹弹窗 */}
      <Modal
        title={<span style={{ color: '#e91e63', fontWeight: 700 }}>🗺️ 添加足迹</span>}
        open={showAdd}
        onCancel={() => setShowAdd(false)}
        footer={null}
        centered
      >
        <Form form={form} onFinish={handleAdd} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="emoji"
            label="图标"
            initialValue="📍"
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EMOJIS.map(e => (
                <span
                  key={e}
                  onClick={() => form.setFieldValue('emoji', e)}
                  style={{
                    fontSize: 24,
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 8,
                    background: form.getFieldValue('emoji') === e ? 'rgba(255,107,157,0.2)' : 'transparent',
                    border: form.getFieldValue('emoji') === e ? '2px solid #e91e63' : '2px solid transparent'
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </Form.Item>

          <Form.Item name="place" label="地点名称" rules={[{ required: true, message: '请输入地点名称' }]}>
            <Input placeholder="例如：厦门鼓浪屿" />
          </Form.Item>

          <Form.Item name="description" label="备注">
            <Input.TextArea rows={2} placeholder="这个地方的特别回忆..." />
          </Form.Item>

          <Form.Item name="date" label="日期" initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block style={{ height: 46, borderRadius: 23 }}>
            💕 添加足迹
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default MapPage;
