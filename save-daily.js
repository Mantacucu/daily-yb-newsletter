// save-daily.js — 每日存档脚本
// 用法: node save-daily.js "YYYY-MM-DD"

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const ARCHIVE_DIR = path.join(BASE_DIR, 'archive');
const DATA_DIR = path.join(BASE_DIR, 'data');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadArchiveJson() {
  const p = path.join(DATA_DIR, 'archive.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch(e) {
    return { version: '1.0', entries: {} };
  }
}

function saveArchiveJson(data) {
  ensureDir(DATA_DIR);
  fs.writeFileSync(path.join(DATA_DIR, 'archive.json'), JSON.stringify(data, null, 2));
}

function generateArchiveHtml(date, entry) {
  const channelsHtml = (entry.channels || []).map(c => `
    <div class="card">
      <div class="card-tag">${c.category}</div>
      <h3>${c.channel}: ${c.title}</h3>
      <ul class="bullet-list">
        ${(c.points || []).map(p => `<li>${p}</li>`).join('')}
      </ul>
      <a href="${c.url}" target="_blank">观看视频</a>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${date} | YB日报</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --bg: #ffffff;
    --surface: #fafafa;
    --text: #1d1d1f;
    --muted: #86868b;
    --light: #d2d2d7;
    --accent: #0071e3;
    --radius: 12px;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  header {
    padding: 32px;
    text-align: center;
    border-bottom: 1px solid var(--light);
  }
  .logo { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
  .date { font-size: 13px; color: var(--muted); margin-top: 4px; }
  .back {
    display: inline-block;
    margin-top: 12px;
    font-size: 13px;
    color: var(--accent);
    text-decoration: none;
  }
  main {
    max-width: 680px;
    margin: 0 auto;
    padding: 40px 32px 80px;
  }
  .section { margin-bottom: 48px; }
  .section-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--light);
  }
  .section-title { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
  .section-sub { font-size: 13px; color: var(--muted); }
  .featured {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 28px;
  }
  .featured-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--accent);
    margin-bottom: 12px;
  }
  .featured h2 {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 12px;
  }
  .featured .summary {
    font-size: 15px;
    color: var(--muted);
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .featured a {
    color: var(--accent);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }
  .bullet-list {
    list-style: none;
    margin-top: 20px;
  }
  .bullet-list li {
    padding: 10px 0;
    padding-left: 16px;
    position: relative;
    font-size: 14px;
    line-height: 1.7;
    border-bottom: 1px solid rgba(0,0,0,0.04);
  }
  .bullet-list li:last-child { border-bottom: none; }
  .bullet-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 18px;
    width: 5px;
    height: 5px;
    background: var(--text);
    border-radius: 50%;
  }
  .card {
    padding: 24px 0;
    border-bottom: 1px solid var(--light);
  }
  .card:last-child { border-bottom: none; }
  .card-tag {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .card h3 {
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 12px;
    line-height: 1.4;
  }
  .card a {
    font-size: 14px;
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }
  .insight {
    margin-top: 20px;
    padding: 16px;
    background: var(--bg);
    border: 1px solid var(--light);
    border-radius: 8px;
  }
  .insight h4 {
    font-size: 11px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .insight p {
    font-size: 14px;
    line-height: 1.6;
  }
  @media (max-width: 768px) {
    main { padding: 24px 20px 60px; }
  }
</style>
</head>
<body>

<header>
  <div class="logo">YB日报</div>
  <div class="date">${date}</div>
  <a class="back" href="../index.html">返回今日</a>
</header>

<main>

<div class="section">
  <div class="section-head">
    <div class="section-title">今日精选</div>
    <div class="section-sub">${entry.theme}</div>
  </div>
  <div class="featured">
    <div class="featured-label">Editor's Pick</div>
    <h2>${entry.featured?.title || entry.theme}</h2>
    <div class="summary">${entry.featured?.summary || ''}</div>
    <a href="${entry.featured?.url || '#'}" target="_blank">观看视频</a>
    <ul class="bullet-list">
      ${(entry.featured?.takeaways || []).map(t => `<li>${t}</li>`).join('')}
    </ul>
    ${entry.featured?.insight ? `
    <div class="insight">
      <h4>延伸思考</h4>
      <p>${entry.featured.insight}</p>
    </div>` : ''}
  </div>
</div>

<div class="section">
  <div class="section-head">
    <div class="section-title">频道精选</div>
    <div class="section-sub">${entry.channels?.length || 0} 个频道</div>
  </div>
  ${channelsHtml}
</div>

${entry.aiTips ? `
<div class="section">
  <div class="section-head">
    <div class="section-title">AI / Coding Tips</div>
  </div>
  <div class="featured">
    <ul class="bullet-list">
      ${entry.aiTips.map(t => `<li>${t}</li>`).join('')}
    </ul>
  </div>
</div>` : ''}

</main>

</body>
</html>`;
}

function saveDaily(date, entry) {
  ensureDir(ARCHIVE_DIR);
  ensureDir(DATA_DIR);
  
  // 1. Save HTML archive
  const html = generateArchiveHtml(date, entry);
  fs.writeFileSync(path.join(ARCHIVE_DIR, `${date}.html`), html);
  console.log(`Saved archive/${date}.html`);
  
  // 2. Append to archive.json
  const archiveJson = loadArchiveJson();
  archiveJson.entries[date] = entry;
  saveArchiveJson(archiveJson);
  console.log(`Updated data/archive.json`);
}

// CLI usage
const date = process.argv[2];
if (!date) {
  console.error('Usage: node save-daily.js YYYY-MM-DD');
  process.exit(1);
}

// Read entry from stdin or file
const entryPath = process.argv[3];
if (entryPath) {
  const entry = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
  saveDaily(date, entry);
} else {
  // Read from stdin
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => {
    const entry = JSON.parse(data);
    saveDaily(date, entry);
  });
}
