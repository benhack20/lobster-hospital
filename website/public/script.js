let currentPage = 1;
const limit = 6;
let currentFilter = '';

// 全局变量存储当前页面病历数据，方便模态框读取
let currentRecords = [];

// 复制功能
function copyCommand() {
    const cmd = document.getElementById('install-command').innerText;
    const btn = document.querySelector('.copy-btn');
    
    navigator.clipboard.writeText(cmd).then(() => {
        const originalText = btn.innerText;
        btn.innerText = '✅ 已复制';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('复制失败', err);
        alert('复制失败，请手动选择文字复制。');
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadRecords(1);
    
    // 移动端菜单切换
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // 点击链接后自动关闭菜单
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

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

        // 动态状态印章
        const stampMap = {
            excellent: '已康复',
            fair: '准予出院',
            poor: '留院观察',
            critical: '抢救中'
        };
        const stampText = stampMap[record.healthStatus] || '处理中';
        const stampClass = `stamp-${record.healthStatus}`;

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
                        <div class="discharge-stamp ${stampClass}">${stampText}</div>
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
    `;

    modal.classList.add('active');
}

// 根据标识符生成 Emoji 头像
function getAvatar(id) {
    const emojis = ['🦞', '🦀', '🦑', '🐙', '🐡', '🐠', '🐟', '🐬', '🦈', '🐳'];
    const s = String(id || '');
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return emojis[Math.abs(hash) % emojis.length];
}

// 更新分页状态
function updatePagination(page, total) {
    const totalPages = Math.ceil(total / limit);
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) pageInfo.innerText = `第 ${page} / ${totalPages || 1} 页`;
    
    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.disabled = page <= 1;
    
    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.disabled = page >= totalPages;
}

// 更新跑马灯
function updateMarquee(records) {
    const marquee = document.getElementById('marquee-content');
    if (!marquee) return;

    // 1. 扩充基础氛围内容池 (技术梗 + 医院日常)
    const atmosphereMessages = [
        "🏥 龙虾医院提醒您：定期检查 node_modules，防止小龙虾“过载”。",
        "🚑 紧急通知：深海区域发现多起未捕获的异常错误，请相关开发者迅速定位！",
        "🌡️ 今日水温：25.6℃ (适合 Node.js v20 以上的小龙虾生存)。",
        "🧪 龙虾药房：最新补丁 `npm audit fix` 已上架，欢迎按需取用。",
        "📢 预警：近期海域出现 Promise 内存泄漏，请主人加强 async/await 防护。",
        "🌟 龙虾医院使命：让每一只代码小龙虾都活蹦乱跳，永不宕机！",
        "🦀 小知识：适量的 `console.log` 有助于小龙虾排毒，但过多会导致“吐沫”过多。",
        "🧬 基因工程：发现一只变异的 Bun 龙虾，运行速度提升了 300%！",
        "🚿 卫生习惯：勤洗代码（Refactor），减少技术债务，小龙虾更长寿。",
        "🛰️ 卫星监测：全球小龙虾健康指数正在稳步回升。",
        "🛡️ 安全提示：发现非法 SQL 注入攻击海域，请加强防火墙围栏！",
        "📊 实时播报：龙虾医院“在线问诊”功能已全面覆盖深海 5000 米区域。"
    ];

    const messages = [];

    // 2. 紧急预警 (只取一条最紧急的)
    const critical = records.find(r => r.healthStatus === 'critical' || r.healthStatus === 'poor');
    if (critical) {
        const name = critical.patientName || '神秘小龙虾';
        const statusText = critical.healthStatus === 'critical' ? '危急' : '不佳';
        messages.push(`[⚠️ 紧急预警] 发现“${name}”处于${statusText}状态，医疗组已介入！`);
    }

    // 3. 康复喜报 (随机取一条健康优秀的记录)
    const healthyOnes = records.filter(r => r.healthStatus === 'excellent');
    if (healthyOnes.length > 0) {
        const luckyOne = healthyOnes[Math.floor(Math.random() * healthyOnes.length)];
        messages.push(`[🎉 康复喜报] “${luckyOne.patientName || '小龙虾'}”各项指标恢复正常，准予出院！`);
    }

    // 4. 实时统计 (模拟)
    const totalVisits = records.length;
    messages.push(`[📈 实时简报] 本诊疗中心当前挂号数：${totalVisits} | 专家门诊排队中...`);

    // 5. 随机抽取氛围内容
    const randomBase = atmosphereMessages.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // 最终组合 (去重并组合)
    const finalContent = [...messages, ...randomBase];

    if (finalContent.length === 0) {
        marquee.innerText = "🏥 龙虾医院：守护代码海洋，守护每一只小龙虾的健康。 | 系统运行正常 🎉";
    } else {
        marquee.innerText = finalContent.join(' | ');
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
