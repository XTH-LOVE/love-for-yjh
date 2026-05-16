import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Input, message, Select } from 'antd';
import { CloudOutlined, WarningOutlined } from '@ant-design/icons';
import '../styles/global.css';

const { Text, Title } = Typography;

const CITIES = [
  { label: '北京', value: '101010100' },
  { label: '上海', value: '101020100' },
  { label: '广州', value: '101280101' },
  { label: '深圳', value: '101280601' },
  { label: '成都', value: '101270101' },
  { label: '杭州', value: '101210101' },
  { label: '武汉', value: '101200101' },
  { label: '西安', value: '101110101' },
  { label: '南京', value: '101190101' },
  { label: '重庆', value: '101040100' },
  { label: '天津', value: '101030100' },
  { label: '苏州', value: '101190401' },
  { label: '长沙', value: '101250101' },
  { label: '郑州', value: '101180101' },
  { label: '沈阳', value: '101070101' },
];

const HEART_MESSAGES: Record<string, string[]> = {
  sunny: ['阳光正好，就像你的笑容 🌞', '今天天气超棒，约 TA 出去走走吧！☀️', '阳光温暖，适合牵手散步 💕'],
  cloudy: ['阴天也别有氛围，在家窝着也很甜 ☁️', '天空有点灰，但有你在就是晴天 💗'],
  rainy: ['窗外细雨绵绵，想和你一起听雨 🌧️', '下雨天，最适合抱在一起看剧 🍿', '雨中漫步？浪漫到犯规 💕'],
  snowy: ['下雪啦！一起去看雪吧 ❄️', '和你一起，雪天也变得温暖 ☃️'],
  default: ['不管什么天气，有你就是好天气 💕', 'TA 在想你哦 📱'],
};

function getWeatherEmoji(code: number): string {
  if (code === 100 || code === 101) return '☀️';
  if (code === 102 || code === 103) return '⛅';
  if (code >= 104 && code <= 108) return '☁️';
  if (code >= 200 && code <= 213) return '🌩️';
  if (code >= 300 && code <= 315) return '🌧️';
  if (code >= 400 && code <= 426) return '❄️';
  if (code >= 500 && code <= 515) return '🌫️';
  return '🌤️';
}

function getHeartMessage(type: string): string {
  const msgs = HEART_MESSAGES[type] || HEART_MESSAGES['default'];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

interface WeatherData {
  city: string;
  temp: number;
  text: string;
  code: number;
  humidity: number;
  wind: string;
  type: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState('101280101');
  const [loading, setLoading] = useState(false);
  const [savedCity, setSavedCity] = useState(localStorage.getItem('partner_city') || '101280101');

  const fetchWeather = async (cityCode: string, isInit = false) => {
    setLoading(true);
    try {
      // 使用 wttr.in API（免费无需key）
      const res = await fetch(`https://wttr.in/${encodeURIComponent(CITIES.find(c => c.value === cityCode)?.label || 'Shenzhen')}?format=j1`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      const current = data.current_condition?.[0];

      const temp = parseInt(current?.temp_C || '0');
      const weatherCode = parseInt(current?.weatherCode || '0');
      const text = current?.weatherDesc?.[0]?.value || '未知';
      const humidity = parseInt(current?.humidity || '0');
      const wind = `${current?.windspeedKmph || '0'}km/h`;

      let type = 'default';
      if (weatherCode >= 400 && weatherCode <= 426) type = 'snowy';
      else if (weatherCode >= 300 && weatherCode <= 315) type = 'rainy';
      else if (weatherCode >= 104 && weatherCode <= 108) type = 'cloudy';
      else if (weatherCode === 100 || weatherCode === 101) type = 'sunny';

      const cityName = CITIES.find(c => c.value === cityCode)?.label || '未知';

      setWeather({ city: cityName, temp, text, code: weatherCode, humidity, wind, type });
      if (isInit) {
        localStorage.setItem('partner_city', cityCode);
        setSavedCity(cityCode);
      }
    } catch (e) {
      // 离线模式使用假数据
      setWeather({
        city: CITIES.find(c => c.value === cityCode)?.label || '未知',
        temp: 25,
        text: '晴',
        code: 100,
        humidity: 60,
        wind: '10km/h',
        type: 'sunny',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(savedCity, true);
  }, []);

  const handleCityChange = (val: string) => {
    setCity(val);
    fetchWeather(val, true);
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        color: '#fff',
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 36 }}>{weather ? getWeatherEmoji(weather.code) : '🌤️'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <Spin size="small" /> : <span style={{ fontSize: 20, fontWeight: 700 }}>{weather?.temp || '--'}°</span>}
            <span style={{ fontSize: 14, opacity: 0.8 }}>{weather?.city || ''}</span>
          </div>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{weather?.text || '加载中...'}</Text>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>
          {weather && (
            <>
              <div>💧 {weather.humidity}%</div>
              <div>🌬️ {weather.wind}</div>
            </>
          )}
        </div>
      </div>

      {weather && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 10 }}>
          <Text style={{ color: '#fff', fontSize: 13 }}>{getHeartMessage(weather.type)}</Text>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <Select
          value={city}
          onChange={handleCityChange}
          style={{ width: '100%' }}
          options={CITIES.map(c => ({ label: `🌆 ${c.label}`, value: c.value }))}
          size="small"
          popupMatchSelectWidth={false}
        />
      </div>
    </Card>
  );
}
