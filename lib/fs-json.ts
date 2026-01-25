import { promises as fs } from 'fs';
import * as path from 'path';

export async function readJson<T>(relativePath: string): Promise<T> {
    const absPath = path.join(process.cwd(), relativePath);
    const content = await fs.readFile(absPath, 'utf8');
    return JSON.parse(content) as T;
}

export async function writeJson<T>(relativePath: string, data: T): Promise<void> {
    const absPath = path.join(process.cwd(), relativePath);
    const dir = path.dirname(absPath);
    await fs.mkdir(dir, { recursive: true });
    const json = JSON.stringify(data, null, 2);
    // Atomic write to avoid Windows lock issues: write temp then rename
    const tempPath = absPath + ".tmp";
    // Retry a few times in case another process has the file open
    const maxRetries = 5;
    const timeout = 5000; // 5 seconds timeout per attempt
    let lastErr: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // ใช้ Promise.race เพื่อเพิ่ม timeout
            await Promise.race([
                (async () => {
                    await fs.writeFile(tempPath, json, 'utf8');
                    // On Windows, rename can fail if target exists; remove then rename
                    try {
                        await fs.rename(tempPath, absPath);
                    } catch {
                        try { await fs.unlink(absPath); } catch { }
                        await fs.rename(tempPath, absPath);
                    }
                })(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Write timeout after ${timeout}ms`)), timeout)
                )
            ]);
            return;
        } catch (err: any) {
            lastErr = err;
            // ถ้าเป็น timeout error ให้ throw ทันที
            if (err?.message?.includes('timeout')) {
                throw new Error(`Failed to write file after ${maxRetries} attempts: ${err.message}`);
            }
            // small backoff - เพิ่มเวลา retry ตามจำนวนครั้ง
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 100 * attempt));
            }
        } finally {
            // Ensure temp file is cleaned if something went wrong
            try { await fs.unlink(tempPath); } catch { }
        }
    }
    throw new Error(`Failed to write file after ${maxRetries} attempts: ${lastErr?.message || lastErr}`);
}

export async function backupFile(relativePath: string): Promise<string> {
    const absPath = path.join(process.cwd(), relativePath);
    const dir = path.dirname(absPath);
    const ext = path.extname(absPath);
    const base = path.basename(absPath, ext);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${base}_backup-${timestamp}${ext}`;
    const backupPath = path.join(dir, backupName);
    await fs.copyFile(absPath, backupPath);
    return path.relative(process.cwd(), backupPath).replace(/\\/g, '/');
}
