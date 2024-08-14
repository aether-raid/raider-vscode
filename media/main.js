(function() {
    const vscode = acquireVsCodeApi();

    document.getElementById('send-button').addEventListener('click', () => {
        const input = document.getElementById('chat-input').value;
        vscode.postMessage({
            command: 'query',
            text: input
        });
    });
})();
