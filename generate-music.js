/**
 * 生成优美的背景音乐 MP3/WAV 文件
 * 纯 JavaScript，无需外部依赖
 * 使用 Web Audio API 原理的离线渲染
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const outDir = path.join(__dirname, 'backend', 'public', 'music');

// 音符频率
const N = {
  'C3':130.81,'D3':146.83,'E3':164.81,'F3':174.61,'G3':196.00,'A3':220.00,'B3':246.94,
  'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'G4':392.00,'A4':440.00,'B4':493.88,
  'C5':523.25,'D5':587.33,'E5':659.26,'F5':698.46,'G5':783.99,'A5':880.00,'B5':987.77,
  'C6':1046.50,
};

// 生成正弦波
function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

// 钢琴包络 (ADSR)
function pianoEnvelope(t, duration) {
  const attack = 0.01;
  const decay = 0.15;
  const sustain = 0.4;
  const release = Math.min(0.3, duration * 0.3);
  const sustainEnd = duration - release;

  if (t < attack) return t / attack;
  if (t < attack + decay) return 1.0 - (1.0 - sustain) * ((t - attack) / decay);
  if (t < sustainEnd) return sustain;
  return sustain * (1.0 - (t - sustainEnd) / release);
}

// 钢琴音色（基频 + 泛音）
function pianoNote(freq, t, duration) {
  const env = pianoEnvelope(t, duration);
  const v = sine(freq, t) * 0.5
    + sine(freq * 2, t) * 0.2
    + sine(freq * 3, t) * 0.08
    + sine(freq * 4, t) * 0.03
    + sine(freq * 0.999, t) * 0.05  // 轻微失谐增加丰富度
    + sine(freq * 2.001, t) * 0.03;
  return v * env;
}

// 和弦
function chord(freqs, t, duration, vol = 0.3) {
  return freqs.reduce((sum, f) => sum + pianoNote(f, t, duration), 0) * vol;
}

// 柔和的低音
function softBass(freq, t, duration) {
  const env = pianoEnvelope(t, duration) * 0.6;
  return (sine(freq, t) * 0.7 + sine(freq * 2, t) * 0.3) * env;
}

// 编码为 WAV
function writeWav(samples, filename) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  const view = buffer;

  // RIFF header
  view.write('RIFF', 0);
  view.writeUInt32LE(36 + numSamples * 2, 4);
  view.write('WAVE', 8);
  // fmt chunk
  view.write('fmt ', 12);
  view.writeUInt32LE(16, 16); // chunk size
  view.writeUInt16LE(1, 20);  // PCM
  view.writeUInt16LE(1, 22);  // mono
  view.writeUInt32LE(SAMPLE_RATE, 24);
  view.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  view.writeUInt16LE(2, 32);  // block align
  view.writeUInt16LE(16, 34); // bits per sample
  // data chunk
  view.write('data', 36);
  view.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }

  fs.writeFileSync(filename, buffer);
  const mb = (buffer.length / 1024 / 1024).toFixed(1);
  console.log(`  ${path.basename(filename)}: ${mb} MB`);
}

// ======================== 曲目定义 ========================

const songs = [
  {
    name: '遇见',
    bpm: 72,
    // [note, duration_in_beats]
    melody: [
      ['E4',2],['G4',1],['A4',1],['G4',1],['E4',1],['D4',1],['C4',2],
      ['D4',1],['E4',1],['G4',2],['E4',1],['D4',1],['C4',2],
      ['C4',1],['E4',1],['G4',1],['A4',2],['G4',1],['E4',1],
      ['D4',2],['E4',1],['D4',1],['C4',2],['E4',2],
      // 重复变化
      ['A4',2],['G4',1],['E4',1],['D4',1],['E4',1],['G4',2],
      ['A4',1],['G4',1],['E4',1],['D4',2],['C4',2],
      ['G4',1],['A4',1],['G4',2],['E4',1],['D4',1],['C4',2],
      ['E4',1],['D4',1],['C4',2],['D4',1],['E4',1],['C4',2],
    ],
    bass: [
      ['C3',4],['G3',4],['A3',4],['E3',4],
      ['F3',4],['C3',4],['G3',4],['C3',4],
      ['A3',4],['E3',4],['F3',4],['G3',4],
      ['C3',4],['F3',4],['G3',4],['C3',4],
    ],
  },
  {
    name: '月光',
    bpm: 60,
    melody: [
      ['E4',3],['G4',2],['A4',2],['B4',3],['A4',2],['G4',2],
      ['E4',3],['D4',2],['C4',2],['D4',3],['E4',3],
      ['G4',3],['A4',2],['B4',2],['C5',3],['B4',2],['A4',2],
      ['G4',3],['E4',2],['D4',2],['C4',3],['E4',3],
      ['A4',3],['G4',2],['E4',2],['D4',3],['E4',2],['G4',2],
      ['A4',3],['G4',2],['E4',2],['D4',3],['C4',3],
    ],
    bass: [
      ['C3',6],['G3',6],['A3',6],['C3',6],
      ['E3',6],['C3',6],['G3',6],['C3',6],
      ['A3',6],['E3',6],['F3',6],['C3',6],
    ],
  },
  {
    name: '初恋',
    bpm: 80,
    melody: [
      ['C5',1],['B4',0.5],['A4',0.5],['G4',1],['E4',1],
      ['G4',1],['A4',1],['B4',2],['A4',1],['G4',0.5],['E4',0.5],
      ['D4',1],['E4',1],['C4',2],
      ['E4',1],['G4',1],['A4',1],['B4',1],['C5',2],['B4',1],['A4',1],
      ['G4',1.5],['A4',0.5],['G4',1],['E4',1],['D4',2],['E4',2],
      ['C4',1],['E4',1],['G4',1],['C5',1],['B4',2],['G4',2],
      ['A4',1],['G4',1],['E4',1],['D4',1],['C4',2],['C4',2],
    ],
    bass: [
      ['C3',4],['G3',4],['A3',4],['E3',4],
      ['C3',4],['F3',4],['G3',4],['C3',4],
      ['A3',4],['E3',4],['F3',4],['C3',4],
    ],
  },
  {
    name: '思念',
    bpm: 66,
    melody: [
      ['A4',3],['G4',1.5],['E4',1.5],['D4',3],['C4',1.5],['D4',1.5],
      ['E4',4],['G4',2],['A4',3],['B4',3],
      ['C5',3],['B4',1.5],['A4',1.5],['G4',3],['E4',1.5],['G4',1.5],
      ['A4',6],
      ['E4',3],['D4',1.5],['C4',1.5],['D4',3],['E4',1.5],['D4',1.5],
      ['C4',4],['D4',2],['E4',3],['G4',3],
      ['A4',3],['G4',1.5],['E4',1.5],['D4',3],['C4',3],
      ['C4',6],
    ],
    bass: [
      ['A3',6],['D3',6],['E3',6],['A3',6],
      ['E3',6],['C3',6],['D3',6],['A3',6],
      ['A3',6],['G3',6],['F3',6],['C3',6],
    ],
  },
  {
    name: '星河',
    bpm: 68,
    melody: [
      ['G4',1],['A4',1],['B4',1],['D5',1],['C5',2],['B4',1],['A4',1],
      ['G4',1],['A4',1],['B4',1],['A4',1],['G4',2],['E4',2],
      ['A4',1],['B4',1],['C5',1],['D5',1],['E5',2],['D5',1],['C5',1],
      ['B4',1],['A4',1],['G4',1],['A4',1],['G4',2],['G4',2],
      ['E4',1],['G4',1],['A4',1],['B4',1],['C5',2],['A4',1],['G4',1],
      ['A4',1],['B4',1],['A4',1],['G4',1],['E4',2],['D4',2],
      ['C4',1],['E4',1],['G4',1],['C5',1],['B4',2],['A4',1],['G4',1],
      ['A4',4],
    ],
    bass: [
      ['G3',4],['E3',4],['A3',4],['G3',4],
      ['A3',4],['E3',4],['G3',4],['C3',4],
      ['E3',4],['A3',4],['G3',4],['D3',4],
    ],
  },
];

// ======================== 渲染 ========================

function renderSong(song, durationSec = 90) {
  const beatDur = 60 / song.bpm;
  const totalBeats = durationSec / beatDur;
  const totalSamples = Math.floor(totalBeats * beatDur * SAMPLE_RATE);
  const samples = new Float32Array(totalSamples);

  // 渲染旋律
  let beatPos = 0;
  let loopCount = 0;
  while (beatPos < totalBeats) {
    for (const [note, beats] of song.melody) {
      if (beatPos >= totalBeats) break;
      const freq = N[note];
      if (!freq) { beatPos += beats; continue; }
      const startSample = Math.floor(beatPos * beatDur * SAMPLE_RATE);
      const durSamples = Math.floor(beats * beatDur * SAMPLE_RATE);
      for (let i = 0; i < durSamples && (startSample + i) < totalSamples; i++) {
        const t = i / SAMPLE_RATE;
        samples[startSample + i] += pianoNote(freq, t, beats * beatDur) * 0.35;
      }
      beatPos += beats;
    }
    loopCount++;
  }

  // 渲染低音伴奏
  beatPos = 0;
  while (beatPos < totalBeats) {
    for (const [note, beats] of song.bass) {
      if (beatPos >= totalBeats) break;
      const freq = N[note];
      if (!freq) { beatPos += beats; continue; }
      const startSample = Math.floor(beatPos * beatDur * SAMPLE_RATE);
      const durSamples = Math.floor(beats * beatDur * SAMPLE_RATE);
      for (let i = 0; i < durSamples && (startSample + i) < totalSamples; i++) {
        const t = i / SAMPLE_RATE;
        samples[startSample + i] += softBass(freq, t, beats * beatDur) * 0.2;
      }
      beatPos += beats;
    }
  }

  // 渲染和弦垫音（柔和的氛围音）
  const chordProgressions = [
    [N.C4, N.E4, N.G4],
    [N.A3, N.C4, N.E4],
    [N.F3, N.A3, N.C4],
    [N.G3, N.B3, N.D4],
  ];
  beatPos = 0;
  while (beatPos < totalBeats) {
    for (const freqs of chordProgressions) {
      if (beatPos >= totalBeats) break;
      const startSample = Math.floor(beatPos * beatDur * SAMPLE_RATE);
      const durSamples = Math.floor(4 * beatDur * SAMPLE_RATE);
      for (let i = 0; i < durSamples && (startSample + i) < totalSamples; i++) {
        const t = i / SAMPLE_RATE;
        const env = Math.min(1, t / 0.5) * Math.min(1, (durSamples / SAMPLE_RATE - t) / 0.5) * 0.08;
        for (const f of freqs) {
          samples[startSample + i] += sine(f * 0.5, t) * env; // 低一个八度
        }
      }
      beatPos += 4;
    }
  }

  // 淡入淡出
  const fadeSamples = SAMPLE_RATE * 2;
  for (let i = 0; i < fadeSamples; i++) {
    samples[i] *= i / fadeSamples;
    samples[totalSamples - 1 - i] *= i / fadeSamples;
  }

  return samples;
}

// 主程序
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('🎵 Generating music files...');
for (const song of songs) {
  console.log(`  Rendering: ${song.name} (${song.bpm} BPM)...`);
  const samples = renderSong(song, 75); // 75秒
  const filename = path.join(outDir, `${song.name}.wav`);
  writeWav(samples, filename);
}

console.log('✅ All music files generated!');
