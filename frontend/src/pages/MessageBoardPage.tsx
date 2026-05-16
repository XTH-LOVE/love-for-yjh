import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Avatar, Empty, message } from 'antd';
import { SendOutlined, HeartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);

interface Message {
  id: number;
  content: string;
  fromMe: boolean;
  timestamp: string;
  emoji?: string;
}

const MessageBoardPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const stored = localStorage.getItem('love_messages');
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  };

  const saveMessages = (data: Message[]) => {
    localStorage.setItem('love_messages', JSON.stringify(data));
    setMessages(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      content: inputValue.trim(),
      fromMe: true,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
    };

    const updatedMessages = [...messages, newMessage];
    saveMessages(updatedMessages);
    setInputValue('');

    // 模拟对方回复（随机延迟）
    setTimeout(() => {
      const replies = [
        '收到啦～爱你 😘',
        '好甜啊～我也想你',
        '嘻嘻，我们最棒！',
        '太感动了 🥰',
        '我们一起加油 💪',
        '永远爱你 ❤️',
      ];
      const reply: Message = {
        id: Date.now() + 1,
        content: replies[Math.floor(Math.random() * replies.length)],
        fromMe: false,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
      };
      saveMessages([...updatedMessages, reply]);
    }, 2000 + Math.random() * 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return '☀️ 早安';
    if (hour < 18) return '🌤️ 午安';
    return '🌙 晚安';
  };

  const getPartnerAvatar = () => {
    // 从用户数据获取伴侣信息
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.partner_avatar || '💕';
  };

  return (
    <div className="page-enter" style={{ padding: '16px', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <Card
        title={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e91e63' }}>
              💌 我们的悄悄话
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {getGreeting()} · {messages.length} 条消息
            </div>
          </div>
        }
        style={{ 
          borderRadius: 20, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        bodyStyle={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* 消息列表 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          background: 'linear-gradient(180deg, rgba(255,240,246,0.3) 0%, rgba(255,220,235,0.1) 100%)'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>还没有消息</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>发送第一条消息，开启我们的对话吧</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, index) => {
                const showAvatar = index === 0 || messages[index - 1].fromMe !== msg.fromMe;
                
                return (
                  <div
                    key={msg.id}
                    className={msg.fromMe ? 'message-board-card from-me' : 'message-board-card from-partner'}
                    style={{
                      display: 'flex',
                      flexDirection: msg.fromMe ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      gap: 12,
                      animation: msg.fromMe ? 'slideInFromRight 0.3s ease' : 'slideInFromLeft 0.3s ease'
                    }}
                  >
                    {/* 头像 */}
                    {showAvatar ? (
                      <Avatar
                        size={40}
                        style={{
                          background: msg.fromMe 
                            ? 'linear-gradient(135deg, #ff6b9d, #e91e63)'
                            : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                          flexShrink: 0
                        }}
                      >
                        {msg.fromMe ? (currentUser.nickname?.[0] || '我') : 'TA'}
                      </Avatar>
                    ) : (
                      <div style={{ width: 40, flexShrink: 0 }} />
                    )}

                    {/* 消息气泡 */}
                    <div style={{
                      maxWidth: '70%',
                      minWidth: 80
                    }}>
                      <div style={{
                        background: msg.fromMe 
                          ? 'linear-gradient(135deg, #ff6b9d, #e91e63)'
                          : 'rgba(255, 255, 255, 0.95)',
                        color: msg.fromMe ? '#fff' : '#333',
                        padding: '12px 16px',
                        borderRadius: msg.fromMe 
                          ? '20px 20px 4px 20px'
                          : '20px 20px 20px 4px',
                        boxShadow: msg.fromMe 
                          ? '0 4px 16px rgba(255,45,120,0.3)'
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        wordBreak: 'break-word',
                        lineHeight: 1.6
                      }}>
                        {msg.content}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: '#999',
                        marginTop: 4,
                        textAlign: msg.fromMe ? 'right' : 'left'
                      }}>
                        {dayjs(msg.timestamp).fromNow()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderTop: '1px solid rgba(255,107,157,0.1)',
          borderRadius: '0 0 20px 20px'
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="说点什么..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ 
                borderRadius: 24,
                padding: '10px 16px',
                resize: 'none'
              }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              size="large"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={{
                width: 48,
                height: 48,
                background: inputValue.trim() 
                  ? 'linear-gradient(135deg, #ff6b9d, #e91e63)'
                  : '#ccc',
                border: 'none',
                boxShadow: inputValue.trim() 
                  ? '0 4px 16px rgba(255,45,120,0.4)'
                  : 'none'
              }}
            />
          </div>
          
          {/* 快捷语 */}
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            marginTop: 12,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {['爱你', '想你', '抱抱', '么么哒', '晚安', '早安'].map(emoji => (
              <Button
                key={emoji}
                size="small"
                onClick={() => setInputValue(prev => prev + emoji)}
                style={{
                  borderRadius: 16,
                  borderColor: 'rgba(255,107,157,0.3)',
                  color: '#e91e63',
                  fontSize: 12
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MessageBoardPage;
