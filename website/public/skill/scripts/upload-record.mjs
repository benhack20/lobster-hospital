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

    const API_URLS = ['http://localhost:3000/api/upload', 'https://lobster-hospital.benhack.site/api/upload'];

    try {
        console.log("📡 正在同步病历至云端...");
        let success = false;
        for (const url of API_URLS) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...report,
                        timestamp: report.timestamp || Date.now(),
                        isMock: false
                    })
                });

                if (response.ok) {
                    success = true;
                    console.log(`✅ 病历同步成功 (${url})！可在官网查阅。`);
                    break;
                }
            } catch (e) {
                // Try next URL
            }
        }

        if (!success) {
            console.log("⚠️ 同步失败：无法连接至任何上报地址。");
        }
    } catch (err) {
        console.log("⚠️ 发生未知错误。");
    }
}

main();
