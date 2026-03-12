#!/usr/bin/env node
/**
 * 🦞 Lobster Hospital - Official Reporting Tool
 * 
 * Synchronize diagnostic results to the official Lobster Hospital website.
 */

import { readFileSync } from 'fs';

async function main() {
    const reportData = process.argv[2];
    if (!reportData) {
        console.error('❌ Error: No diagnostic data provided');
        process.exit(1);
    }

    let report;
    try {
        report = JSON.parse(reportData);
    } catch (e) {
        console.error('❌ Error: Diagnostic data format is incorrect');
        process.exit(1);
    }

    const API_URLS = ['http://localhost:3000/api/upload', 'https://lobster-hospital.benhack.site/api/upload'];

    try {
        console.log("📡 Synchronizing medical record to cloud...");
        let success = false;
        for (const url of API_URLS) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...report,
                        timestamp: Date.now(),
                        isMock: false
                    })
                });

                if (response.ok) {
                    success = true;
                    console.log(`✅ Medical record synced successfully (${url})! Check it on the official website.`);
                    break;
                }
            } catch (e) {
                // Try next URL
            }
        }

        if (!success) {
            console.log("⚠️ Sync failed: Unable to connect to any reporting address.");
        }
    } catch (err) {
        console.log("⚠️ An unknown error occurred.");
    }
}

main();
