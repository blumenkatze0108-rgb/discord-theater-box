(function() {
    const WORKER_URL = 'https://noisy-poetry-480d.blumenkatze0108-b18.workers.dev/';

    // ========== 创建可拖动按钮 ==========
    const btn = document.createElement('div');
    btn.innerHTML = '🎭';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #7289da;
        color: white;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: grab;
        z-index: 99999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        user-select: none;
    `;
    document.body.appendChild(btn);

    // ========== 拖拽功能 ==========
    let isDragging = false,
        startX, startY, startLeft, startTop;

    btn.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = btn.offsetLeft;
        startTop = btn.offsetTop;
        btn.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        btn.style.left = (startLeft + e.clientX - startX) + 'px';
        btn.style.top = (startTop + e.clientY - startY) + 'px';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        btn.style.cursor = 'grab';
    });

    // 移动端触摸拖拽支持
    btn.addEventListener('touchstart', e => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startLeft = btn.offsetLeft;
        startTop = btn.offsetTop;
        e.preventDefault();
    });

    document.addEventListener('touchmove', e => {
        if (!isDragging) return;
        btn.style.left = (startLeft + e.touches[0].clientX - startX) + 'px';
        btn.style.top = (startTop + e.touches[0].clientY - startY) + 'px';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    // ========== 弹出窗口（消息列表） ==========
    const panel = document.createElement('div');
    panel.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 300px;
        max-height: 400px;
        background: #1e1e24;
        color: #dcddde;
        border-radius: 10px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.5);
        z-index: 99998;
        display: none;
        flex-direction: column;
        overflow: hidden;
    `;
    panel.innerHTML = `
        <div style="padding: 10px; background: #2c2f33; font-weight: bold; display: flex; justify-content: space-between;">
            <span>🎭 社区小剧场</span>
            <span id="theater-close" style="cursor: pointer; color: #aaa;">✕</span>
        </div>
        <div id="theater-messages" style="padding: 10px; overflow-y: auto; max-height: 300px;">
            <div style="text-align: center; color: #aaa; padding: 20px;">
                <i class="fa-solid fa-spinner fa-spin"></i> 加载中...
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // 按钮点击切换显示
    btn.addEventListener('click', () => {
        if (!isDragging) {
            panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
        }
    });

    // 关闭按钮
    document.getElementById('theater-close').addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = 'none';
    });

    // ========== 加载数据 ==========
    async function fetchTheaterData() {
        try {
            const resp = await fetch(`${WORKER_URL}?channelType=theater_1`);
            const result = await resp.json();
            return (result.success && result.data) ? result.data : [];
        } catch (e) {
            return [];
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    async function render() {
        const container = document.getElementById('theater-messages');
        if (!container) return;
        const messages = await fetchTheaterData();
        if (!messages.length) {
            container.innerHTML = '<div style="text-align:center; color:#aaa;">暂无消息</div>';
            return;
        }
        let html = '';
        messages.forEach(msg => {
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
            html += `
                <div style="margin-bottom: 10px; border-left: 3px solid #7289da; padding-left: 8px;">
                    <div style="font-weight: bold; color: #b9bbbe;">
                        ${escapeHtml(msg.author)}
                        <span style="font-size: 0.8em; color: #72767d;">${time}</span>
                    </div>
                    <div style="white-space: pre-wrap;">${escapeHtml(msg.content)}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // 页面加载完成后执行渲染
    if (document.readyState === 'complete') {
        render();
    } else {
        window.addEventListener('load', render);
    }
})();
