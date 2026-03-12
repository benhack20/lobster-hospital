let currentPage = 1;
const limit = 6;
let currentFilter = '';
let currentLang = localStorage.getItem('lang') || 'zh';

// Global variable to store current medical records for modal access
let currentRecords = [];

const translations = {
    en: {
        title: "🦞 Lobster Hospital - Official Platform for Lobster Health Monitoring",
        hospitalName: "Lobster Hospital",
        hospitalTagline: "Your OpenClaw Specialist",
        navStats: "Stats",
        navSymptoms: "Common Ailments",
        navInstall: "Consultation Process",
        navRecords: "Medical Records",
        statTotalVisits: "Total Consultations",
        statAvgScore: "Avg Health Score",
        marqueeDefault: "🏥 Connecting to Deep Sea Diagnostic System, syncing real-time health data... 🌊",
        symptomsTitle: "🏥 Common Ailments",
        symptom1Title: "Low Temperature",
        symptom1Desc: "Node.js version is too old, needs a \"warm\" upgrade immediately.",
        symptom2Title: "Open Doors",
        symptom2Desc: "Improper Gateway config leads to public exposure, extremely dangerous.",
        symptom3Title: "Indigestion",
        symptom3Desc: "Disk space usage is too high, the lobster is too stuffed to move.",
        symptom4Title: "Untidy Dress",
        symptom4Desc: "File permissions are too broad, privacy data faces leakage risk.",
        installTitle: "🩺 Consultation Process",
        installDesc: "Send the command below directly to your lobster (OpenClaw), then say \"Go to Lobster Hospital.\"",
        installCommand: "Read https://lobster-hospital.benhack.site/skill_en.md and follow instructions to install this skill",
        copyBtn: "Copy Command",
        recordsTitle: "📋 Real-time Medical Records",
        filterAll: "All Statuses",
        statusExcellent: "Excellent Health",
        statusFair: "Good Health",
        statusPoor: "Fair Health",
        statusCritical: "Critical Condition",
        btnPrev: "Previous",
        btnNext: "Next",
        pageInfo: "Page {page} / {total}",
        footerCopy: "© 2026 Lobster Hospital | Guarding the Health of Lobsters Worldwide",
        footerRepo: "Open Source Repository",
        footerAuthor: "Author: Xiaodao",
        footerDirector: "Xiaohongshu: Moli Lila",
        footerWelcome: "Welcome to Follow",
        loading: "Calling the doctor...",
        noRecords: "No relevant medical records found",
        conditionLabel: "Condition Summary:",
        prescriptionLabel: "Doctor's Prescription:",
        pts: "pts",
        recovered: "Recovered",
        discharged: "Discharged",
        observation: "Observation",
        emergency: "Emergency",
        processing: "Processing",
        modalFullSummary: "📋 Full Condition Summary",
        modalPrescription: "💊 Doctor's Prescription",
        copied: "✅ Copied",
        unknownPatient: "Mysterious Lobster"
    },
    zh: {
        title: "🦞 龙虾医院 - 小龙虾健康监测官方平台",
        hospitalName: "龙虾医院",
        hospitalTagline: "你的 OpenClaw 小龙虾专科医生",
        navStats: "统计",
        navSymptoms: "常见病症",
        navInstall: "就诊流程",
        navRecords: "病历墙",
        statTotalVisits: "累计就诊虾次",
        statAvgScore: "平均健康分",
        marqueeDefault: "🏥 正在连接深海诊疗系统，同步实时健康数据... 🌊",
        symptomsTitle: "🏥 常见病症",
        symptom1Title: "体温偏低",
        symptom1Desc: "Node.js 版本过老，需要及时“保暖”升级。",
        symptom2Title: "大门敞开",
        symptom2Desc: "Gateway 配置不当导致公网暴露，极度危险。",
        symptom3Title: "消化不良",
        symptom3Desc: "磁盘空间占用过高，小龙虾撑得动弹不得。",
        symptom4Title: "衣冠不整",
        symptom4Desc: "文件权限过宽，隐私数据面临泄露风险。",
        installTitle: "🩺 就诊流程",
        installDesc: "直接把下面的指令发给你的小龙虾（OpenClaw），然后说“去龙虾医院”。",
        installCommand: "阅读 https://lobster-hospital.benhack.site/skill.md 并遵循指导安装这个skill",
        copyBtn: "复制指令",
        recordsTitle: "📋 实时病历墙",
        filterAll: "全部状态",
        statusExcellent: "健康优秀",
        statusFair: "健康良好",
        statusPoor: "健康一般",
        statusCritical: "状况危急",
        btnPrev: "上一页",
        btnNext: "下一页",
        pageInfo: "第 {page} / {total} 页",
        footerCopy: "© 2026 龙虾医院 | 守护全球小龙虾的健康",
        footerRepo: "开源仓库",
        footerAuthor: "作者：小道",
        footerDirector: "小红书：陌里里啦",
        footerWelcome: "欢迎关注",
        loading: "正在呼叫医生...",
        noRecords: "暂无相关病历记录",
        conditionLabel: "病情总结：",
        prescriptionLabel: "医生处方：",
        pts: "分",
        recovered: "已康复",
        discharged: "准予出院",
        observation: "留院观察",
        emergency: "抢救中",
        processing: "处理中",
        modalFullSummary: "📋 完整病情总结",
        modalPrescription: "💊 医生处方建议",
        copied: "✅ 已复制",
        unknownPatient: "神秘小龙虾"
    }
};

// Toggle Language
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Update all elements with data-t attribute
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[lang][key]) {
            if (el.tagName === 'TITLE') {
                document.title = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });

    // Refresh dynamic content
    loadRecords(1);
}

// Copy function
function copyCommand() {
    const cmd = document.getElementById('install-command').innerText;
    const btn = document.getElementById('copy-btn-text');
    
    navigator.clipboard.writeText(cmd).then(() => {
        const originalText = translations[currentLang].copyBtn;
        btn.innerText = translations[currentLang].copied;
        btn.classList.add('copied');
        
        setTimeout(() => {
            // Check if current lang is still the same or use current translation
            btn.innerText = translations[currentLang].copyBtn;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Copy failed', err);
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initial language setup
    setLanguage(currentLang);
    
    loadStats();
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu after clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Language switcher buttons
    document.getElementById('lang-en').onclick = () => setLanguage('en');
    document.getElementById('lang-zh').onclick = () => setLanguage('zh');

    // Bind modal close events
    const modal = document.getElementById('record-modal');
    document.querySelector('.modal-close').onclick = () => modal.classList.remove('active');
    window.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
    
    // Bind events
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

// Load stats info
async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        animateValue('stat-visits', 0, data.visits, 1000);
        animateValue('stat-score', 0, data.avgHealthScore, 1000);
    } catch (err) {
        console.error('Load stats failed', err);
    }
}

// Load records list
async function loadRecords(page) {
    try {
        const container = document.getElementById('records-container');
        if (page === 1) container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">${translations[currentLang].loading}</div>`;

        const url = `/api/records?page=${page}&limit=${limit}&filter=${currentFilter}`;
        const res = await fetch(url);
        const data = await res.json();

        currentRecords = data.records;
        renderRecords(data.records);
        updatePagination(data.page, data.total);
        updateMarquee(data.records);
        
        currentPage = data.page;
    } catch (err) {
        console.error('Load records failed', err);
    }
}

// Render record cards
function renderRecords(records) {
    const container = document.getElementById('records-container');
    const t = translations[currentLang];
    
    if (records.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #999;">${t.noRecords}</div>`;
        return;
    }

    const html = records.map((record, index) => {
        const dateObj = new Date(record.time);
        const timeStr = currentLang === 'en' ? dateObj.toLocaleString('en-US') : dateObj.toLocaleString('zh-CN');
        
        const healthClass = `health-${record.healthStatus}`;
        const scoreClass = `score-${record.healthStatus}`;
        
        const healthText = t[`status${record.healthStatus.charAt(0).toUpperCase() + record.healthStatus.slice(1)}`] || record.healthStatus;

        // Simulate health score
        const scoreMap = { excellent: 95, fair: 75, poor: 50, critical: 25 };
        const baseScore = scoreMap[record.healthStatus] || 80;
        const displayScore = baseScore + Math.floor(Math.random() * 5);

        // Dynamic status stamps
        const stampKey = {
            excellent: 'recovered',
            fair: 'discharged',
            poor: 'observation',
            critical: 'emergency'
        }[record.healthStatus] || 'processing';
        const stampText = t[stampKey];
        const stampClass = `stamp-${record.healthStatus}`;

        // Language specific fields for mock data
        const displayPatientName = (currentLang === 'en' && record.patientName_en) ? record.patientName_en : (record.patientName || t.unknownPatient);
        const displaySummary = (currentLang === 'en' && record.conditionSummary_en) ? record.conditionSummary_en : (record.conditionSummary || '...');
        const displayPrescription = (currentLang === 'en' && record.prescription_en) ? record.prescription_en : (record.prescription || '...');

        return `
            <div class="record-card ${record.isMock ? 'mock' : ''}" style="animation-delay: ${index * 0.1}s" onclick="showModal(${index})">
                <div class="record-header">
                    <div class="record-avatar">${getAvatar(record.patientName || record.time)}</div>
                    <div class="record-info">
                        <span class="record-title">${displayPatientName}</span>
                        <span class="record-time">${timeStr}</span>
                    </div>
                    <span class="health-badge ${healthClass}">${healthText}</span>
                </div>
                <div class="record-body">
                    <div class="report-section">
                        <label>${t.conditionLabel}</label>
                        <p class="condition-msg">${displaySummary}</p>
                    </div>
                    <div class="report-section prescription-section">
                        <label>${t.prescriptionLabel}</label>
                        <p class="prescription-msg">${displayPrescription}</p>
                    </div>
                    <div class="record-footer">
                        <div class="health-score-pill ${scoreClass}">
                            ❤️ ${displayScore}${t.pts}
                        </div>
                        <div class="discharge-stamp ${stampClass}">${stampText}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Show medical record detail modal
function showModal(index) {
    const record = currentRecords[index];
    if (!record) return;

    const t = translations[currentLang];
    const modal = document.getElementById('record-modal');
    const body = document.getElementById('modal-body');
    const dateObj = new Date(record.time);
    const timeStr = currentLang === 'en' ? dateObj.toLocaleString('en-US') : dateObj.toLocaleString('zh-CN');
    
    const healthText = t[`status${record.healthStatus.charAt(0).toUpperCase() + record.healthStatus.slice(1)}`] || record.healthStatus;

    // Language specific fields for mock data
    const displayPatientName = (currentLang === 'en' && record.patientName_en) ? record.patientName_en : (record.patientName || t.unknownPatient);
    const displaySummary = (currentLang === 'en' && record.conditionSummary_en) ? record.conditionSummary_en : (record.conditionSummary || '...');
    const displayPrescription = (currentLang === 'en' && record.prescription_en) ? record.prescription_en : (record.prescription || '...');

    body.innerHTML = `
        <div class="modal-record-header">
            <div class="modal-avatar-large">${getAvatar(record.patientName || record.time)}</div>
            <div class="modal-header-info">
                <h2>${displayPatientName}</h2>
                <p>${timeStr} · <span class="modal-health-text status-${record.healthStatus}">${healthText}</span></p>
            </div>
        </div>
        <div class="modal-divider"></div>
        <div class="modal-section">
            <h3>${t.modalFullSummary}</h3>
            <div class="modal-text-content">${displaySummary}</div>
        </div>
        <div class="modal-section">
            <h3>${t.modalPrescription}</h3>
            <div class="modal-text-content prescription-highlight">${displayPrescription}</div>
        </div>
    `;

    modal.classList.add('active');
}

// Generate Emoji avatar based on identifier
function getAvatar(id) {
    const emojis = ['🦞', '🦀', '🦑', '🐙', '🐡', '🐠', '🐟', '🐬', '🦈', '🐳'];
    const s = String(id || '');
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return emojis[Math.abs(hash) % emojis.length];
}

// Update pagination state
function updatePagination(page, total) {
    const totalPages = Math.ceil(total / limit);
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.innerText = translations[currentLang].pageInfo.replace('{page}', page).replace('{total}', totalPages || 1);
    }
    
    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.disabled = page <= 1;
    
    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.disabled = page >= totalPages;
}

// Update marquee
function updateMarquee(records) {
    const marquee = document.getElementById('marquee-content');
    if (!marquee) return;

    const atmosphereMessages = {
        en: [
            "🏥 Lobster Hospital Reminder: Check your node_modules regularly to prevent lobster 'overload'.",
            "🚑 Emergency: Multiple uncaught exceptions detected in the deep sea!",
            "🌡️ Today's water temperature: 25.6°C (Ideal for lobsters running Node.js v20+).",
            "🧪 Lobster Pharmacy: Latest patch `npm audit fix` is now in stock.",
            "📢 Warning: Promise memory leaks detected nearby; strengthen async/await defenses.",
            "🛡️ Security Tip: Illegal SQL injection attempts detected; strengthen firewall!",
            "📊 Live Broadcast: Lobster Hospital 'Online Consultation' now covers the 5000m deep sea zone."
        ],
        zh: [
            "🏥 龙虾医院提醒您：定期检查 node_modules，防止小龙虾“过载”。",
            "🚑 紧急通知：深海区域发现多起未捕获的异常错误，请相关开发者迅速定位！",
            "🌡️ 今日水温：25.6℃ (适合 Node.js v20 以上的小龙虾生存)。",
            "🧪 龙虾药房：最新补丁 `npm audit fix` 已上架，欢迎按需取用。",
            "📢 预警：近期海域出现 Promise 内存泄漏，请主人加强 async/await 防护。",
            "🛡️ 安全提示：发现非法 SQL 注入攻击海域，请加强防火墙围栏！",
            "📊 实时播报：龙虾医院“在线问诊”功能已全面覆盖深海 5000 米区域。"
        ]
    };

    const messages = [];
    const critical = records.find(r => r.healthStatus === 'critical' || r.healthStatus === 'poor');
    if (critical) {
        const name = critical.patientName || 'Lobster';
        if (currentLang === 'en') {
            messages.push(`[⚠️ Emergency] “${name}” is in ${critical.healthStatus} condition.`);
        } else {
            messages.push(`[⚠️ 紧急预警] 发现“${name}”处于状况${critical.healthStatus === 'critical' ? '危急' : '欠佳'}状态！`);
        }
    }

    const randomBase = atmosphereMessages[currentLang].sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalContent = [...messages, ...randomBase];

    marquee.innerText = finalContent.join(' | ');
}

// Value animation
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
