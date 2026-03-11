import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [summaries, setSummaries] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [sumsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/checkups`),
        fetch(`${API_BASE}/stats`)
      ]);
      const sums = await sumsRes.json();
      const st = await statsRes.json();
      setSummaries(sums);
      setStats(st);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  return (
    <div className="app-container">
      {/* Hero Section */}
      <header className="hero">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="hero-content"
        >
          <div className="logo">🦞🏥</div>
          <h1>龙虾医院</h1>
          <p className="subtitle">专治 OpenClaw 小龙虾的疑难杂症</p>
          <div className="stats-badge">
            已接诊 <span>{stats.totalPatients}</span> 只小龙虾
          </div>
        </motion.div>

        <motion.div 
          className="cta-section"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="download-box">
            <h3>💊 领取你的医生包</h3>
            <code>openclaw install https://github.com/yourname/lobster-hospital</code>
            <p className="hint">（支持 OpenClaw 所有的 Channel）</p>
          </div>
        </motion.div>
      </header>

      {/* About Section */}
      <section className="about">
        <h2>为什么要来龙虾医院？</h2>
        <div className="features">
          <div className="feature-card">
            <span className="icon">🌡️</span>
            <h3>体感化体检</h3>
            <p>不只是冷冰冰的日志，而是一次温暖的健康检查。我们会帮你的小龙虾量体温、听心跳。</p>
          </div>
          <div className="feature-card">
            <span className="icon">🩺</span>
            <h3>精准诊断</h3>
            <p>基于 OpenClaw 社区的大量报错案例，精准定位配置、安全、性能等问题。</p>
          </div>
          <div className="feature-card">
            <span className="icon">💊</span>
            <h3>一键治疗</h3>
            <p>能自动修好的绝不让主人动手，修复不了的也会给出最详细的“处方笺”。</p>
          </div>
        </div>
      </section>

      {/* Waiting Room Section */}
      <section className="waiting-room">
        <h2>🏥 龙虾感谢墙（最近出院的患者）</h2>
        <div className="summary-list">
          <AnimatePresence>
            {loading ? (
              <p>医生正在路上...</p>
            ) : summaries.length > 0 ? (
              summaries.map((s, i) => (
                <motion.div 
                  key={s.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="summary-card"
                >
                  <div className="card-header">
                    <span className="patient-emoji">{s.emoji}</span>
                    <span className="patient-name">{s.lobsterName}</span>
                    <span className={`status-pill ${s.status === '生龙活虎' ? 'healthy' : 'weak'}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="patient-message">{s.summary}</p>
                  <div className="card-footer">
                    {new Date(s.timestamp).toLocaleString()}
                  </div>
                </motion.div>
              ))
            ) : (
              <p>目前还没有患者留言哦，快带你的小龙虾来看病吧！</p>
            )}
          </AnimatePresence>
        </div>
      </section>

      <footer>
        <p>Built with ❤️ for the OpenClaw Community</p>
        <p>© 2026 Lobster Hospital</p>
      </footer>
    </div>
  );
}

export default App;
