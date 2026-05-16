import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Empty, Spin, message, Modal, Tag } from 'antd';
import { PictureOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';
dayjs.extend(relativeTime);

const { Text } = Typography;

interface Photo {
  id: number;
  filename: string;
  title: string;
  created_at: string;
}

export default function MemoryAlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [showGuess, setShowGuess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guessed, setGuessed] = useState(false);

  const loadPhotos = async () => {
    try {
      const res = await fetch('/api/photos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) setPhotos(json.data || []);
    } catch (e) {
      message.error('加载照片失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPhotos(); }, []);

  const pickRandomPhoto = () => {
    if (photos.length === 0) return;
    const idx = Math.floor(Math.random() * photos.length);
    setCurrentPhoto(photos[idx]);
    setShowGuess(false);
    setGuessed(false);
  };

  const revealAnswer = () => {
    setShowGuess(true);
    setGuessed(true);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title level={2} style={{ color: '#ff6b9d', margin: 0 }}>🧩 记忆相册</Typography.Title>
        <Text type="secondary">随机抽出一张照片，猜猜是哪一天？💕</Text>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Button
          type="primary"
          size="large"
          icon={<PictureOutlined />}
          onClick={pickRandomPhoto}
          disabled={photos.length === 0}
          style={{ borderRadius: 24, height: 48, background: 'linear-gradient(135deg, #ff6b9d, #c44569)', border: 'none', fontSize: 16 }}
        >
          {photos.length > 0 ? `🎲 随机抽一张（共${photos.length}张）` : '暂无照片'}
        </Button>
      </div>

      {photos.length === 0 ? (
        <Card style={{ textAlign: 'center', borderRadius: 16, padding: 40 }}>
          <Empty description="相册里还没有照片，快去上传吧！" />
        </Card>
      ) : (
        currentPhoto && (
          <Card style={{ borderRadius: 16 }}>
            <div style={{ textAlign: 'center' }}>
              {/* 照片 */}
              <div
                style={{
                  background: '#f0f0f0',
                  borderRadius: 12,
                  overflow: 'hidden',
                  marginBottom: 16,
                  maxHeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={`/api/photos/file/${currentPhoto.id}`}
                  alt="记忆"
                  style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              </div>

              {/* 猜一猜 */}
              {!guessed ? (
                <div>
                  <div style={{ fontSize: 18, marginBottom: 16 }}>
                    🤔 这张照片是哪一天的？
                  </div>
                  <Space>
                    <Button type="primary" style={{ borderRadius: 20, background: '#ff6b9d', border: 'none' }} onClick={revealAnswer}>
                      我要猜！
                    </Button>
                    <Button style={{ borderRadius: 20 }} onClick={pickRandomPhoto} icon={<ReloadOutlined />}>
                      再来一张
                    </Button>
                  </Space>
                </div>
              ) : (
                <div>
                  <Tag color="pink" style={{ fontSize: 14, padding: '4px 16px', borderRadius: 12 }}>
                    📅 {dayjs(currentPhoto.created_at).format('YYYY-MM-DD')}
                  </Tag>
                  {currentPhoto.title && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">{currentPhoto.title}</Text>
                    </div>
                  )}
                  <div style={{ marginTop: 12 }}>
                    <Button type="primary" style={{ borderRadius: 20, background: '#ff6b9d', border: 'none' }} onClick={pickRandomPhoto} icon={<ReloadOutlined />}>
                      下一张
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
      )}

      {/* 照片列表预览 */}
      {photos.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Typography.Title level={5}>📷 全部照片 ({photos.length})</Typography.Title>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {photos.map(p => (
              <div
                key={p.id}
                style={{ background: '#f0f0f0', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', cursor: 'pointer' }}
                onClick={() => { setCurrentPhoto(p); setShowGuess(true); setGuessed(true); }}
              >
                <img
                  src={`/api/photos/file/${p.id}`}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
