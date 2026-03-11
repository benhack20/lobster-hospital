const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'records.json');

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static('public'));

// 路由: /skill -> 返回 SKILL.md 内容
app.get('/skill', (req, res) => {
    const skillPath = path.join(__dirname, 'public', 'skill', 'SKILL.md');
    if (fs.existsSync(skillPath)) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.sendFile(skillPath);
    } else {
        res.status(404).send('Skill description not found.');
    }
});

// 确保数据目录存在
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// 获取所有病历（支持分页）
app.get('/api/records', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filter = req.query.filter; // excellent, fair, poor, critical

        let filteredData = data;
        if (filter) {
            filteredData = data.filter(r => r.overallHealth === filter);
        }

        // 按时间倒序
        filteredData.sort((a, b) => b.timestamp - a.timestamp);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = filteredData.slice(startIndex, endIndex);

        res.json({
            total: filteredData.length,
            page,
            limit,
            records: results
        });
    } catch (err) {
        res.status(500).json({ error: '无法读取病历数据' });
    }
});

// 上传新病历
app.post('/api/upload', (req, res) => {
    try {
        const newRecord = req.body;
        if (!newRecord.timestamp) {
            newRecord.timestamp = Date.now();
        }
        newRecord.isMock = false; // 明确标记为真实数据

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.push(newRecord);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        res.status(201).json({ message: '病历上传成功', id: newRecord.timestamp });
    } catch (err) {
        res.status(500).json({ error: '无法保存病历' });
    }
});

// 获取统计数据
app.get('/api/stats', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        // 总诊疗次数
        const totalVisits = data.length;
        
        // 已诊治患者 (目前按 1:1 统计，若数据中有 patientId 则按唯一 ID 统计)
        const uniquePatients = new Set(data.map(r => r.patientId || Math.random())).size;

        // 平均健康分计算
        const scoreMap = { 'excellent': 100, 'fair': 85, 'poor': 60, 'critical': 40 };
        const totalScore = data.reduce((sum, r) => sum + (scoreMap[r.overallHealth] || 70), 0);
        const avgScore = totalVisits > 0 ? Math.round(totalScore / totalVisits) : 0;

        res.json({
            patients: totalVisits, // 遵循用户反馈：简单认为提交一次即一名患者
            visits: totalVisits,
            avgHealthScore: avgScore
        });
    } catch (err) {
        res.status(500).json({ error: '无法获取统计信息' });
    }
});

app.listen(PORT, () => {
    console.log(`🦞 龙虾医院后端启动于 http://localhost:${PORT}`);
});
