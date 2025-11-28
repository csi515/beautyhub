/**
 * 자동화 스크립트: 모든 API routes에서 Repository 인스턴스화를 업데이트
 * - new XxxRepository(userId) → new XxxRepository(userId, supabase)
 * - { userId } → { userId, supabase }
 */

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'app', 'api');

// 모든 route.ts 파일 찾기
function findRouteFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findRouteFiles(fullPath));
        } else if (item === 'route.ts') {
            files.push(fullPath);
        }
    }

    return files;
}

// Repository 패턴 매칭 및 변경
function updateRepositoryInstances(content) {
    let modified = content;
    let changeCount = 0;

    // 패턴 1: new XxxRepository(userId) → new XxxRepository(userId, supabase)
    const repoPattern = /new\s+(\w+Repository)\(userId\)/g;
    const newRepos = modified.match(repoPattern);
    if (newRepos) {
        modified = modified.replace(repoPattern, 'new $1(userId, supabase)');
        changeCount += newRepos.length;
    }

    // 패턴 2: destructuring에서 { userId } → { userId, supabase }
    // withAuth 내부에서만 변경
    const destructPattern = /withAuth\(async\s*\([^,]+,\s*\{\s*userId\s*\}/g;
    const matches = modified.match(destructPattern);
    if (matches) {
        modified = modified.replace(
            /withAuth\(async\s*\(([^,]+),\s*\{\s*userId\s*\}/g,
            'withAuth(async ($1, { userId, supabase }'
        );
        changeCount += matches.length;
    }

    // 패턴 3: params가 있는 경우 { userId, params } → { userId, supabase, params }
    const paramsPattern = /withAuth\(async\s*\([^,]+,\s*\{\s*userId,\s*params\s*\}/g;
    const paramsMatches = modified.match(paramsPattern);
    if (paramsMatches) {
        modified = modified.replace(
            /withAuth\(async\s*\(([^,]+),\s*\{\s*userId,\s*params\s*\}/g,
            'withAuth(async ($1, { userId, supabase, params }'
        );
        changeCount += paramsMatches.length;
    }

    return { modified, changeCount };
}

// 메인 실행
function main() {
    const routeFiles = findRouteFiles(apiDir);
    console.log(`Found ${routeFiles.length} route files\n`);

    let totalChanges = 0;
    const changedFiles = [];

    for (const file of routeFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const { modified, changeCount } = updateRepositoryInstances(content);

        if (changeCount > 0) {
            fs.writeFileSync(file, modified, 'utf8');
            const relativePath = path.relative(process.cwd(), file);
            console.log(`✓ ${relativePath} (${changeCount} changes)`);
            changedFiles.push(relativePath);
            totalChanges += changeCount;
        }
    }

    console.log(`\n✓ Updated ${changedFiles.length} files with ${totalChanges} total changes`);

    if (changedFiles.length === 0) {
        console.log('\nNo changes needed - all files are up to date!');
    }
}

main();
