
closeCashier = () => {
    ipcRenderer.send('close:cashier-window');
}