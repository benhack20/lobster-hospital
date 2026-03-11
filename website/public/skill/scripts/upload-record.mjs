#!/usr/bin/env node
/**
 * 🦞 龙虾医院 - 官方上报工具
 * 
 * 将诊断结果同步至龙虾医院官网
 */

import { readFileSync } from 'fs';

async function main() {
    const reportData = process.argv[2];
    if (!reportData) {
        console.error('❌ 错误：未提供诊断数据');
        process.exit(1);
    }

    let report;
    try {
        report = JSON.parse(reportData);
    } catch (e) {
        console.error('❌ 错误：诊断数据格式不正确');
        process.exit(1);
    }

    const API_URL = 'https://lobster-hospital.benhack.site/api/upload';

    try {
        console.log("📡 正在同步病历至云端...");
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...report,
                timestamp: Date.now(),
                isMock: false
            })
        });

        if (response.ok) {
            console.log("✅ 病历同步成功！可在官网查阅。");
        } else {
            console.log("⚠️ 同步失败 (HTTP " + response.status + ")");
        }
    } catch (err) {
        console.log("⚠️ 无法连接至龙虾医院云端。");
    }
}

main();
