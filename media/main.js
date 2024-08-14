(function() {
    const vscode = acquireVsCodeApi();

    document.getElementById('send-button').addEventListener('click', () => {
        const input = document.getElementById('chat-input').value;
        vscode.postMessage({
            command: 'query',
            text: input
        });
    });
    function addChatBubble(text, className) {
        const chatMessages = document.getElementById('chat-messages');
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${className}`;
        bubble.textContent = text;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    document.getElementById('send-button').addEventListener('click', () => {
        const input = document.getElementById('chat-input').value;
        if (input.trim()) {
            addChatBubble(input, 'user');
            vscode.postMessage({
                command: 'query',
                text: input
            });
            document.getElementById('chat-input').value = '';
        }
    });

    window.addEventListener('message', event => {
        const message = event.data;

        switch (message.command) {
            case 'response':
                addChatBubble(message.text, 'assistant');
                break;
        }
        const message = event.data;

        switch (message.command) {
            case 'response':
                alert(message.text);
                break;
        }
    });
})();
