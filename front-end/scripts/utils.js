export function showNotification(message, type = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            border-radius: 8px; color: white; font-weight: 500; z-index: 10000;
            animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);

        if (!document.getElementById('notificationStyle')) {
            const style = document.createElement('style');
            style.id = 'notificationStyle';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    const colors = { success: '#4caf50', error: '#f44336', warning: '#ff9800', info: '#2196f3' };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => { notification.style.display = 'none'; }, 3000);
}
