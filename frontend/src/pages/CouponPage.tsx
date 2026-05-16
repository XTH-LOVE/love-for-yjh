import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, List, Tag, Empty, message, Popconfirm, Typography, Select, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleFilled, GiftFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';
dayjs.extend(relativeTime);

const { Paragraph, Text } = Typography;

const COUPON_COLORS = [
  { value: '#ff6b9d', label: '💖 粉红' },
  { value: '#ff9a44', label: '🧡 橙色' },
  { value: '#feca57', label: '💛 黄色' },
  { value: '#48dbfb', label: '💙 蓝色' },
  { value: '#ff6b6b', label: '❤️ 红色' },
  { value: '#a55eea', label: '💜 紫色' },
  { value: '#26de81', label: '💚 绿色' },
];

const COUPON_TEMPLATES = [
  { title: '拥抱券', subtitle: '随时可用，不限次数 💕', color: '#ff6b9d' },
  { title: '做饭券', subtitle: '想吃 TA 做的饭吗？🍳', color: '#ff9a44' },
  { title: '按摩券', subtitle: '累了一天，躺下享受吧 💆', color: '#feca57' },
  { title: '电影券', subtitle: '选一部电影，一起看 🎬', color: '#48dbfb' },
  { title: '撒娇券', subtitle: '今天可以随便撒娇 😊', color: '#a55eea' },
  { title: '火锅券', subtitle: '走，带你去吃火锅 🍲', color: '#ff6b6b' },
  { title: '不生气券', subtitle: '这张券永远有效 😘', color: '#26de81' },
  { title: '牵手券', subtitle: '出门必须牵手 👫', color: '#ff6b9d' },
];

interface Coupon {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  is_used: number;
  used_at: string | null;
  creator_name: string;
  created_at: string;
}

export default function CouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/coupons/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) setCoupons(json.data || []);
    } catch (e) {
      message.error('加载优惠券失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleCreate = async (values: any) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 1) {
        message.success('优惠券创建成功 🎉');
        setCreateModalOpen(false);
        form.resetFields();
        loadCoupons();
      } else {
        message.error(json.message);
      }
    } catch (e) {
      message.error('创建失败');
    }
  };

  const handleUse = async (id: number) => {
    try {
      const res = await fetch(`/api/coupons/${id}/use`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) {
        message.success('优惠券已使用 💕');
        loadCoupons();
      }
    } catch (e) {
      message.error('使用失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.code === 1) {
        message.success('已删除');
        loadCoupons();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const openPreview = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setPreviewModalOpen(true);
  };

  const printCoupon = () => {
    const printContent = document.getElementById('coupon-print');
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>恋爱优惠券</title><style>
      body { font-family: 'PingFang SC', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0f0f0; }
      .coupon { width: 380px; padding: 32px 24px; border-radius: 16px; color: white; text-align: center; page-break-inside: avoid; }
      .coupon h2 { font-size: 28px; margin: 0 0 8px; }
      .coupon p { font-size: 16px; margin: 8px 0; opacity: 0.9; }
      .coupon .heart { font-size: 48px; margin: 16px 0; }
      .coupon .footer { font-size: 12px; opacity: 0.7; margin-top: 16px; border-top: 1px dashed rgba(255,255,255,0.5); padding-top: 12px; }
      @media print { body { background: white; } }
    </style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  const availableCoupons = coupons.filter(c => !c.is_used);
  const usedCoupons = coupons.filter(c => c.is_used);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title level={2} style={{ color: '#ff6b9d', margin: 0 }}>🎫 恋爱优惠券</Typography.Title>
        <Text type="secondary">制作专属优惠券，让爱更有仪式感 💕</Text>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)} style={{ borderRadius: 24, height: 44, background: 'linear-gradient(135deg, #ff6b9d, #c44569)' }}>
          创建优惠券
        </Button>
      </div>

      {/* 可用优惠券 */}
      <Typography.Title level={5} style={{ marginBottom: 12 }}>✨ 可用优惠券 ({availableCoupons.length})</Typography.Title>
      {availableCoupons.length === 0 ? (
        <Card style={{ textAlign: 'center', borderRadius: 16, padding: 32 }}>
          <Empty description="还没有优惠券，快创建一个吧！" />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
          {availableCoupons.map(c => (
            <div
              key={c.id}
              style={{ background: c.color, borderRadius: 16, padding: '20px 16px', color: '#fff', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              onClick={() => openPreview(c)}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎫</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{c.title}</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{c.subtitle}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>来自 {c.creator_name}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button size="small" ghost style={{ borderColor: '#fff', color: '#fff' }} onClick={e => { e.stopPropagation(); handleUse(c.id); }}>
                  使用
                </Button>
                <Popconfirm title="确定删除？" onConfirm={e => { e?.stopPropagation(); handleDelete(c.id); }} onCancel={e => e?.stopPropagation()}>
                  <Button size="small" ghost danger style={{ borderColor: 'rgba(255,255,255,0.5)' }} onClick={e => e.stopPropagation()}>
                    删除
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 已使用 */}
      {usedCoupons.length > 0 && (
        <>
          <Typography.Title level={5} style={{ marginBottom: 12 }}>✅ 已使用 ({usedCoupons.length})</Typography.Title>
          <List
            dataSource={usedCoupons}
            renderItem={item => (
              <List.Item style={{ opacity: 0.6, padding: '10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                  <Text delete>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.used_at).format('YYYY-MM-DD')} 使用</Text>
                </div>
              </List.Item>
            )}
          />
        </>
      )}

      {/* 创建弹窗 */}
      <Modal
        title="🎫 创建优惠券"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        centered
        width={480}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">快速模板：</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {COUPON_TEMPLATES.map(t => (
              <Tag
                key={t.title}
                style={{ cursor: 'pointer', borderRadius: 12, padding: '4px 12px' }}
                color={t.color}
                onClick={() => form.setFieldsValue({ title: t.title, subtitle: t.subtitle, color: t.color })}
              >
                {t.title}
              </Tag>
            ))}
          </div>
        </div>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="title" label="优惠券名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：拥抱券、做饭券" />
          </Form.Item>
          <Form.Item name="subtitle" label="副标题">
            <Input placeholder="简短描述" />
          </Form.Item>
          <Form.Item name="color" label="颜色" initialValue="#ff6b9d">
            <Select>
              {COUPON_COLORS.map(c => (
                <Select.Option key={c.value} value={c.value}>{c.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: 12, background: 'linear-gradient(135deg, #ff6b9d, #c44569)', border: 'none' }}>
            创建优惠券 🎉
          </Button>
        </Form>
      </Modal>

      {/* 预览/打印弹窗 */}
      <Modal
        title="🎫 优惠券预览"
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        onOk={printCoupon}
        okText="🖨️ 打印优惠券"
        centered
        width={420}
      >
        {selectedCoupon && (
          <div style={{ textAlign: 'center' }}>
            <div
              id="coupon-print"
              style={{ background: selectedCoupon.color, borderRadius: 16, padding: '32px 24px', color: '#fff' }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎫</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{selectedCoupon.title}</div>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>{selectedCoupon.subtitle}</div>
              <div style={{ fontSize: 28, margin: '16px 0' }}>💕</div>
              <div style={{ fontSize: 12, opacity: 0.7, borderTop: '1px dashed rgba(255,255,255,0.5)', paddingTop: 12 }}>
                Love For YJH · 专属优惠券<br />
                有效期：永久有效
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
