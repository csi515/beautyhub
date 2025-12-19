const fs = require('fs');
const path = require('path');

const repoDir = path.join(process.cwd(), 'app/lib/repositories');
const files = fs.readdirSync(repoDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(repoDir, file);
    console.log(`Processing ${file}...`);
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace any in constructor
        if (content.includes('constructor(userId: string, supabase: any)')) {
            content = content.replace('constructor(userId: string, supabase: any)', 'constructor(userId: string, supabase: SupabaseClient)');
            console.log(`  Adjusted constructor in ${file}`);
        }

        // Ensure import exists
        if (!content.includes('import { SupabaseClient }')) {
            // Check if there are existing imports to append to, or prepend
            if (content.startsWith('import')) {
                content = "import { SupabaseClient } from '@supabase/supabase-js'\n" + content;
            } else {
                // Maybe comments at top?
                content = "import { SupabaseClient } from '@supabase/supabase-js'\n" + content;
            }
            console.log(`  Added import to ${file}`);
        }

        // Fix points.repository.ts specific error: any
        if (file === 'points.repository.ts' && content.includes('handleSupabaseError(error: any)')) {
            content = content.replace('handleSupabaseError(error: any)', 'handleSupabaseError(error: unknown)');
            // Note: Full body replacement is hard with simple replace, but at least changing signature helps.
            // We relying on previous manual fix or subsequent fix if needed.
            // Actually, let's try to fix the body if possible, or just the signature to pass basic "no any" check.
            // But invalid body (accessing error.code on unknown) will fail TS.
            // So for points.repository.ts, if we see the old body structure, we might want to replace it.
            // But doing it robustly in regex is hard.
            // Let's assume I fixed points.repository.ts manually already? 
            // Wait, git checkout restore it to HEAD (with any).
            // So I DO need to fix it.
            // I will replace the signature and insert the cast.
            content = content.replace(
                /private handleSupabaseError\(error: any\): never \{/g,
                `private handleSupabaseError(error: unknown): never {
    console.error(\`[PointsRepository] Supabase Error:\`, error)
    const err = error as { code?: string; message?: string; status?: number }`
            );
            // We also need to replace usages of 'error' with 'err' inside the method?
            // The original code used 'error.code'.
            // Simple replaceAll in that block?
            // It's risky.
            // But since I'm overwriting, I can just use replace for specific known patterns in that function.
            content = content.replace(/if \(\s*error\.code/g, 'if (err.code');
            content = content.replace(/error\.message/g, 'err.message');
            content = content.replace(/error\.status/g, 'err.status');
            console.log(`  Adjusted points repository error handler`);
        }

        // Fix base.repository.ts specific error: any
        if (file === 'base.repository.ts' && content.includes('handleSupabaseError(error: any)')) {
            content = content.replace(
                /protected handleSupabaseError\(error: any\): never \{/g,
                `protected handleSupabaseError(error: unknown): never {
    console.error(\`[\${this.tableName}] Supabase Error:\`, error)
    const err = error as { code?: string; message?: string; status?: number }`
            );
            content = content.replace(/if \(\s*error\.code/g, 'if (err.code');
            content = content.replace(/error\.message/g, 'err.message');
            content = content.replace(/error\.status/g, 'err.status');
            console.log(`  Adjusted base repository error handler`);
        }

        fs.writeFileSync(filePath, content, 'utf8');
    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
});
