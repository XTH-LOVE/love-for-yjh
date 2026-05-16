import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Tabs, Empty, message, Checkbox, Tag, Radio } from 'antd';
import { PlusOutlined, CheckOutlined, DeleteOutlined, PlayCircleOutlined, CoffeeOutlined } from '@ant-design/icons';

interface WishItem {
  id: number;
  title: string;
  category: 'movie' | 'food';
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  note?: string;
}

const WishListPage: React.FC = () => {
  const [items, setItems] = useState<WishItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState<'movie' | 'food'>('movie');
  const [form] = Form.useForm();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const stored = localStorage.getItem('love_wishlist');
    if (stored) {
      setItems(JSON.parse(stored));
    }
  };

  const saveItems = (data: WishItem[]) => {
    localStorage.setItem('love_wishlist', JSON.stringify(data));
    setItems(data);
  };

  const handleAdd = (values: any) => {
    const newItem: WishItem = {
      id: Date.now(),
      title: values.title,
      category: category,
      completed: false,
      createdAt: new Date().toISOString(),
      note: values.note,
    };
    saveItems([...items, newItem]);
    message.success(`${category === 'movie' ? '🎬' : '🍜'} 已添加到清单`);
    setShowAdd(false);
    form.resetFields();
  };

  const toggleComplete = (id: number) => {
    const updated = items.map(item =>
      item.id === id
        ? {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? new Date().toISOString() : undefined
          }
        : item
    );
    saveItems(updated);
    
    const item = items.find(i => i.id === id);
    if (item && !item.completed) {
      message.success(`🎉 完成：${item.title}`);
    }
  };

  const handleDelete = (id: number) => {
    saveItems(items.filter(item => item.id !== id));
    message.success('已删除');
  };

  const movieItems = items.filter(i => i.category === 'movie');
  const foodItems = items.filter(i => i.category === 'food');
  const completedCount = items.filter(i => i.completed).length;

  const renderList = (itemList: WishItem[]) => (
    <div>
      {itemList.length === 0 ? (
        <Empty
          description={`还没有${category === 'movie' ? '想看的电影' : '想吃的美食'}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div>
          {itemList.map(item => (
            <div
              key={item.id}
              className={`wishlist-card ${item.completed ? 'completed' : ''}`}
              onClick={() => toggleComplete(item.id)}
            >
              <Checkbox
                checked={item.completed}
                onChange={() => toggleComplete(item.id)}
                style={{ flexShrink: 0 }}
              />
              
              <div className={`wishlist-icon ${item.completed ? 'completed' : ''}`}>
                {category === 'movie' ? '🎬' : '🍜'}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: item.completed ? '#999' : '#333',
                  textDecoration: item.completed ? 'line-through' : 'none'
                }}>
                  {item.title}
                </div>
                {item.note && (
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    {item.note}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                  添加于 {new Date(item.createdAt).toLocaleDateString()}
                  {item.completedAt && ` · 完成于 ${new Date(item.completedAt).toLocaleDateString()}`}
                </div>
              </div>
              
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-enter" style={{ padding: '16px' }}>
      <Card
        title={
          <span style={{ fontSize: 20, fontWeight: 700, color: '#e91e63' }}>
            🎯 愿望清单
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setShowAdd(true);
              form.resetFields();
            }}
          >
            添加愿望
          </Button>
        }
        style={{ borderRadius: 20 }}
      >
        {/* 统计 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 24
        }}>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#e91e63' }}>{items.length}</div>
            <div style={{ fontSize: 12, color: '#999' }}>总愿望</div>
          </div>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1D9E75' }}>{completedCount}</div>
            <div style={{ fontSize: 12, color: '#999' }}>已完成</div>
          </div>
          <div className="stat-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#a855f7' }}>{items.length - completedCount}</div>
            <div style={{ fontSize: 12, color: '#999' }}>进行中</div>
          </div>
        </div>

        {/* Tab切换 */}
        <Tabs
          defaultActiveKey="movie"
          onChange={(key) => setCategory(key as 'movie' | 'food')}
          items={[
            {
              key: 'movie',
              label: (
                <span>
                  <PlayCircleOutlined /> 电影清单 ({movieItems.length})
                </span>
              ),
              children: renderList(movieItems),
            },
            {
              key: 'food',
              label: (
                <span>
                  <CoffeeOutlined /> 美食清单 ({foodItems.length})
                </span>
              ),
              children: renderList(foodItems),
            },
          ]}
        />
      </Card>

      {/* 添加弹窗 */}
      <Modal
        title={
          <span style={{ color: '#e91e63', fontWeight: 700 }}>
            {category === 'movie' ? '🎬 添加电影' : '🍜 添加美食'}
          </span>
        }
        open={showAdd}
        onCancel={() => setShowAdd(false)}
        footer={null}
        centered
      >
        <Form form={form} onFinish={handleAdd} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="title" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder={category === 'movie' ? '例如：千与千寻' : '例如：火锅'} />
          </Form.Item>

          <Form.Item name="note" label="备注（可选）">
            <Input.TextArea rows={2} placeholder={category === 'movie' ? '为什么想看这部电影？' : '为什么想吃这个？'} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block style={{ height: 46, borderRadius: 23 }}>
            {category === 'movie' ? '🎬 添加到电影清单' : '🍜 添加到美食清单'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default WishListPage;
