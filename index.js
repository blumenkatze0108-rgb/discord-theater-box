// ========== 可视化探针：如果代码运行，页面标题会变 ==========
document.title = '✅ 小剧场插件已运行';

// 在扩展设置区域强行写一条红字（只要能看见就说明脚本执行了）
function showDebug(msg) {
    const target = document.getElementById('extensions_settings');
    if (target) {
        const div = document.createElement('div');
        div.style.cssText = 'padding:10px; background:red; color:white; font-weight:bold; margin:5px 0;';
        div.textContent = msg;
        target.prepend(div);
    }
}

showDebug('🚨 JS脚本执行成功');

// ========== 测试 registerExtension 是否存在 ==========
if (typeof registerExtension === 'function') {
    showDebug('✅ registerExtension 函数存在');

    // 用 settingsHtml 直接返回一段 HTML
    registerExtension({
        settingsHtml: '<div style="padding:10px; background:lightgreen;">这是插件设置区</div>'
    });
} else {
    showDebug('❌ registerExtension 不存在！');
}
