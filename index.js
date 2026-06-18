// 直接使用酒馆全局暴露的注册函数，无需任何 import
const extensionSettings = {
    settingsHtml: null, // 让酒馆自动加载同目录下的 index.html
};

// 注册扩展（这一步就是向酒馆“报到”）
if (typeof registerExtension === 'function') {
    registerExtension(extensionSettings);
} else {
    console.error('[小剧场] registerExtension 不存在，请确认酒馆版本');
}

// ========== Worker 数据交互 ==========
const WORKER_BASE_URL = 'https://noisy-poetry-480d.blumenkatze0108-b18.workers.dev'; // ← 改这里！

async function fetchTheaterData(channelType = 'theater_1') {
    try {
        const resp = await fetch(`${WORKER_BASE_URL}?channelType=${channelType}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.json();
    } catch (e) {
        console.error('[小剧场] 拉取失败：', e);
        return null;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, c => map[c]);
}

function renderMessages(messages) {
    const container = document.getElementById('theater-content');
    const loading = document.getElementById('theater-loading');
    if (!container) return;

    if (!messages || messages.length === 0) {
        container.innerHTML = '<div style="padding:10px; color: #aaa;">暂无消息</div>';
        if (loading) loading.style.display = 'none';
        return;
    }

    let html = '';
    messages.forEach(msg => {
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
        html += `
            <div style="margin-bottom: 12px; border-left: 3px solid #7289da; padding-left: 8px;">
                <div style="font-weight: bold; color: #b9bbbe;">
                    ${escapeHtml(msg.author)}
                    <span style="font-size: 0.8em; color: #72767d;">${time}</span>
                </div>
                <div style="color: #dcddde; white-space: pre-wrap;">${escapeHtml(msg.content)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (loading) loading.style.display = 'none';
}

// 页面加载完成后立刻请求数据
function initPlugin() {
    fetchTheaterData('theater_1').then(renderMessages);
}

if (document.readyState === 'complete') {
    initPlugin();
} else {
    window.addEventListener('load', initPlugin);
}
