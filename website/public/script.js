let currentPage = 1;
const limit = 6;
let currentFilter = '';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadRecords(1);
    
    // 绑定事件
    document.getElementById('filter-health').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        loadRecords(1);
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
        if (currentPage > 1) loadRecords(currentPage - 1);
    });

    document.getElementById('btn-next').addEventListener('click', () => {
        loadRecords(currentPage + 1);
    });

    // 复制功能
    document.querySelector('.copy-btn').addEventListener('click', () => {
        const cmd = document.querySelector('.command-box code').innerText;
        navigator.clipboard.writeText(cmd).then(() => {
            alert('命令已复制到剪贴板！');
        });
    });
});

// 加载统计信息
async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        animateValue('stat-visits', 0, data.visits, 1000);
        animateValue('stat-score', 0, data.avgHealthScore, 1000);
    } catch (err) {
        console.error('加载统计失败', err);
    }
}

// 加载病历列表
async function loadRecords(page) {
    try {
        const container = document.getElementById('records-container');
        // 只有第一次或显式刷新时显示加载态，避免翻页闪烁
        if (page === 1) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;">正在呼叫医生...</div>';

        const url = `/api/records?page=${page}&limit=${limit}&filter=${currentFilter}`;
        const res = await fetch(url);
        const data = await res.json();

        renderRecords(data.records);
        updatePagination(data.page, data.total);
        updateMarquee(data.records);
        
        currentPage = data.page;
    } catch (err) {
        console.error('加载病历失败', err);
    }
}

// 渲染病历卡片
function renderRecords(records) {
    const container = document.getElementById('records-container');
    
    if (records.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #999;">暂无相关病历记录</div>';
        return;
    }

    const html = records.map((record, index) => {
        const timeStr = new Date(record.timestamp).toLocaleString('zh-CN');
        const healthClass = `health-${record.overallHealth}`;
        const scoreClass = `score-${record.overallHealth}`;
        const healthText = {
            excellent: '健康优秀',
            fair: '健康良好',
            poor: '健康一般',
            critical: '状况危急'
        }[record.overallHealth];

        // 模拟健康分 (80-100, 60-79, 40-59, 0-39)
        const scoreMap = { excellent: 95, fair: 75, poor: 50, critical: 25 };
        const baseScore = scoreMap[record.overallHealth] || 80;
        const displayScore = baseScore + Math.floor(Math.random() * 5);

        // 生成诊断标签
        const diagnosis = record.findings && record.findings.length > 0 
            ? record.findings[0].message.split(/[，。！]/)[0]
            : '日常健康体检';

        return `
            <div class="record-card ${record.isMock ? 'mock' : ''}" style="animation-delay: ${index * 0.1}s">
                <div class="record-header">
                    <div class="record-avatar">${getAvatar(record.timestamp.toString())}</div>
                    <div class="record-info">
                        <span class="record-title">小龙虾患者 ${record.isMock ? '(MOCK)' : ''}</span>
                        <span class="record-time">${timeStr}</span>
                    </div>
                    <span class="health-badge">${healthText}</span>
                </div>
                <div class="record-body">
                    <span class="diagnosis-tag">诊断：${diagnosis}</span>
                    <div class="record-summary-stats">
                        <span class="stat-item" title="危急">🚨 ${record.summary.critical}</span>
                        <span class="stat-item" title="警告">⚡ ${record.summary.warning}</span>
                        <span class="stat-item" title="健康">✅ ${record.summary.healthy}</span>
                    </div>
                    <div class="record-details">
                        ${(record.findings || []).slice(0, 2).map(f => `
                            <div class="finding-item">
                                <span class="finding-icon">${f.level === 'critical' ? '🔴' : f.level === 'warning' ? '🟡' : '🟢'}</span>
                                <p class="finding-msg">${f.message}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="record-footer">
                        <div class="health-score-pill ${scoreClass}">
                            ❤️ ${displayScore}分
                        </div>
                        <div class="discharge-stamp">已出院</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// 根据标识符生成 Emoji 头像
function getAvatar(id) {
    const emojis = ['🦞', '🦀', '🦑', '🐙', '🐡', '🐠', '🐟', '🐬', '🦈', '🐳'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return emojis[Math.abs(hash) % emojis.length];
}

// 更新分页状态
function updatePagination(page, total) {
    const totalPages = Math.ceil(total / limit);
    document.getElementById('page-info').innerText = `第 ${page} / ${totalPages || 1} 页`;
    document.getElementById('btn-prev').disabled = page <= 1;
    document.getElementById('btn-next').disabled = page >= totalPages;
}

// 更新跑马灯
function updateMarquee(records) {
    const marquee = document.getElementById('marquee-content');
    const highlights = records
        .filter(r => r.overallHealth === 'critical' || r.overallHealth === 'poor')
        .map(r => `[⚠️ 紧急诊断通知] 发现一只小龙虾处于${r.overallHealth === 'critical' ? '危急' : '不佳'}状态，请主人立即查看！`)
        .slice(0, 3);
    
    if (highlights.length > 0) {
        marquee.innerText = highlights.join(' | ') + ' | ' + marquee.innerText;
    } else {
        marquee.innerText = "🏥 龙虾医院提醒您：定期体检，让您的小龙虾更健康！ | 实时上报系统已启动 | 官网部署成功 🎉";
    }
}

// 数值滚动动画
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
