
let notificationTimeout;

function openNotification(msg, timer) {
    const message = document.querySelector('.message');
    if (msg) {
        message.textContent = msg;
    } else {
        message.textContent = "invalid msg";
    }
    const notification = document.getElementById('notification');
    notification.classList.add('open');
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        closeNotification();
    }, timer);
}

function closeNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('open');
}