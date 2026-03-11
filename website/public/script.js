let currentPage = 1;
const limit = 6;
let currentFilter = '';

// 全局变量存储当前页面病历数据，方便模态框读取
let currentRecords = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadRecords(1);
    
    // 绑定模态框关闭事件
    const modal = document.getElementById('record-modal');
    document.querySelector('.modal-close').onclick = () => modal.classList.remove('active');
    window.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
    
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

        currentRecords = data.records; // 存入全局变量
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
        const timeStr = new Date(record.time).toLocaleString('zh-CN');
        const healthClass = `health-${record.healthStatus}`;
        const scoreClass = `score-${record.healthStatus}`;
        const healthText = {
            excellent: '健康优秀',
            fair: '健康良好',
            poor: '健康一般',
            critical: '状况危急'
        }[record.healthStatus] || '未知状态';

        // 模拟健康分 (80-100, 60-79, 40-59, 0-39)
        const scoreMap = { excellent: 95, fair: 75, poor: 50, critical: 25 };
        const baseScore = scoreMap[record.healthStatus] || 80;
        const displayScore = baseScore + Math.floor(Math.random() * 5);

        const patientName = record.patientName || '神秘小龙虾';
        const avatarSeed = record.patientName || record.time.toString();

        return `
            <div class="record-card ${record.isMock ? 'mock' : ''}" style="animation-delay: ${index * 0.1}s" onclick="showModal(${index})">
                <div class="record-header">
                    <div class="record-avatar">${getAvatar(avatarSeed)}</div>
                    <div class="record-info">
                        <span class="record-title">${patientName}</span>
                        <span class="record-time">${timeStr}</span>
                    </div>
                    <span class="health-badge ${healthClass}">${healthText}</span>
                </div>
                <div class="record-body">
                    <div class="report-section">
                        <label>病情总结：</label>
                        <p class="condition-msg">${record.conditionSummary || '暂无详细总结。'}</p>
                    </div>
                    <div class="report-section prescription-section">
                        <label>医生处方：</label>
                        <p class="prescription-msg">${record.prescription || '继续观察。'}</p>
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

// 显示病历详情模态框
function showModal(index) {
    const record = currentRecords[index];
    if (!record) return;

    const modal = document.getElementById('record-modal');
    const body = document.getElementById('modal-body');
    const timeStr = new Date(record.time).toLocaleString('zh-CN');
    const healthText = {
        excellent: '健康优秀',
        fair: '健康良好',
        poor: '健康一般',
        critical: '状况危急'
    }[record.healthStatus] || '未知状态';

    body.innerHTML = `
        <div class="modal-record-header">
            <div class="modal-avatar-large">${getAvatar(record.patientName || record.time)}</div>
            <div class="modal-header-info">
                <h2>${record.patientName || '神秘小龙虾'}</h2>
                <p>${timeStr} · <span class="modal-health-text status-${record.healthStatus}">${healthText}</span></p>
            </div>
        </div>
        <div class="modal-divider"></div>
        <div class="modal-section">
            <h3>📋 完整病情总结</h3>
            <div class="modal-text-content">${record.conditionSummary || '暂无详细总结。'}</div>
        </div>
        <div class="modal-section">
            <h3>💊 医生处方建议</h3>
            <div class="modal-text-content prescription-highlight">${record.prescription || '继续观察。'}</div>
        </div>
        <div class="modal-footer-stats">
            <div class="stat-pill">系统版本：Node.js v22.0.0 (模拟)</div>
            <div class="stat-pill">上报来源：OpenClaw Doctor</div>
        </div>
    `;

    modal.classList.add('active');
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
        .filter(r => r.healthStatus === 'critical' || r.healthStatus === 'poor')
        .map(r => `[⚠️ 紧急诊断通知] 发现一只小龙虾处于${r.healthStatus === 'critical' ? '危急' : '不佳'}状态，请主人立即查看！`)
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
