(function() {
    'use strict';

    // ========== 你的 Worker 地址 ==========
    const WORKER_URL = 'https://noisy-poetry-480d.blumenkatze0108-b18.workers.dev/';

    // ========== 工具函数 ==========
    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ========== 创建界面 ==========
    function createUI() {
        // 尝试多个可能的扩展容器
        const container = document.getElementById('extensions_settings') ||
                         document.getElementById('extensions-list') ||
                         document.querySelector('.extension-list') ||
                         document.querySelector('.extensions_block');

        if (!container) {
            // 如果找不到标准容器，就在 body 顶部插入
            const fallback = document.createElement('div');
            fallback.id = 'theater-fallback';
            document.body.prepend(fallback);
            buildPanel(fallback);
            return;
        }

        // 在扩展容器最前面插入我们的面板
        const wrapper = document.createElement('div');
        wrapper.id = 'theater-wrapper';
        container.prepend(wrapper);
        buildPanel(wrapper);
    }

    function buildPanel(parent) {
        parent.innerHTML = `
            <div class="extension-settings inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header" style="cursor:pointer; padding:10px; background:#1e1e24; border-radius:8px; margin:5px 0;">
                    <b style="color:#e0e0e0;">🎭 Discord 社区小剧场</b>
                    <span class="inline-drawer-icon fa-solid fa-circle-chevron-down" style="float:right; color:#aaa;"></span>
                </div>
                <div class="inline-drawer-content" style="max-height:400px; overflow-y:auto; padding:10px; background:#16161c; border-radius:0 0 8px 8px; display:none;">
                    <div id="theater-status" style="text-align:center; padding:20px; color:#aaa;">
                        <i class="fa-solid fa-spinner fa-spin"></i> 加载剧场中...
                    </div>
                </div>
            </div>
        `;

        // 点击标题展开/折叠
        parent.querySelector('.inline-drawer-header').addEventListener('click', function() {
            const content = parent.querySelector('.inline-drawer-content');
            const icon = parent.querySelector('.inline-drawer-icon');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.classList.remove('fa-circle-chevron-down');
                icon.classList.add('fa-circle-chevron-up');
            } else {
                content.style.display = 'none';
                icon.classList.remove('fa-circle-chevron-up');
                icon.classList.add('fa-circle-chevron-down');
            }
        });

        // 加载数据
        fetchAndRender();
    }

    // ========== 拉取 Worker 数据 ==========
    async function fetchAndRender(channelType = 'theater_1') {
        const statusDiv = document.getElementById('theater-status');
        if (!statusDiv) return;

        try {
            const resp = await fetch(`${WORKER_URL}?channelType=${channelType}`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const result = await resp.json();

            if (result.success && Array.isArray(result.data)) {
                renderMessages(result.data);
            } else {
                statusDiv.innerHTML = '⚠️ 暂无消息或数据格式异常';
                statusDiv.style.color = '#ffaa00';
            }
        } catch (err) {
            statusDiv.innerHTML = `❌ 加载失败: ${escapeHtml(err.message)}`;
            statusDiv.style.color = '#ff6666';
            console.error('[小剧场] 错误:', err);
        }
    }

    function renderMessages(messages) {
        const statusDiv = document.getElementById('theater-status');
        if (!statusDiv) return;

        if (messages.length === 0) {
            statusDiv.innerHTML = '📭 该频道暂无消息';
            statusDiv.style.color = '#aaa';
            return;
        }

        let html = '';
        messages.forEach(msg => {
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
            html += `
                <div style="margin-bottom:12px; border-left:3px solid #7289da; padding-left:8px;">
                    <div style="font-weight:bold; color:#b9bbbe;">
                        ${escapeHtml(msg.author)}
                        <span style="font-size:0.8em; color:#72767d;">${time}</span>
                    </div>
                    <div style="color:#dcddde; white-space:pre-wrap;">${escapeHtml(msg.content)}</div>
                </div>
            `;
        });

        statusDiv.innerHTML = html;
    }

    // ========== 启动：页面加载完成后执行 ==========
    if (document.readyState === 'complete') {
        createUI();
    } else {
        window.addEventListener('load', createUI);
    }
})();
