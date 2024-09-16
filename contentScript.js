console.log("Content script is running");
// Function to trigger speech (Text-to-Speech) for ChatGPT's response
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// Monitor the DOM for changes to detect new ChatGPT responses
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
                // Assuming responses also appear within nodes under the chat container
                // You may need to refine this selector based on the structure of the response elements
                if (node.nodeType === Node.ELEMENT_NODE && node.matches('.response-class')) {
                    const chatGPTResponse = node.innerText;
                    speakText(chatGPTResponse); // Speak only the ChatGPT response
                }
            });
        }
    });
});

// Start observing the chat container for new messages
observer.observe(document.querySelector('.overflow-y-auto.p-4'), { 
    childList: true, 
    subtree: true 
});