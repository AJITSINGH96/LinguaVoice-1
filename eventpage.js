

// Create context menu items for different languages
// List of languages and their names
const languages = {
    heading: 'SELECT YOUR DIALECT TO SPEAK',
    
    'en': 'English',
    'fr': 'French',
    'es': 'Spanish',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'nl': 'Dutch',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'th': 'Thai',
    'vi': 'Vietnamese'
};

// Function to remove existing context menu items
function removeExistingMenuItems() {
  chrome.contextMenus.removeAll(() => {
      // After removal, create new context menu items
      createContextMenuItems();
  });
}
// Create context menu items for each language
function createContextMenuItems() {
  for (const [code, name] of Object.entries(languages)) {
      chrome.contextMenus.create({
          id: `speak-${code}`,
          title: name,
          contexts: ["selection"]
      });
  }
}

// Initialize context menus
removeExistingMenuItems();
// Add a listener for when the context menu item is clicked
chrome.contextMenus.onClicked.addListener((info) => {
    const langMatch = info.menuItemId.match(/^speak-(.+)$/);
    if (langMatch && info.selectionText) {
        const lang = langMatch[1]; // Extract language code
        chrome.tts.speak(info.selectionText, { rate: 1.0, lang: lang });
    }
});


//to open the extension in separate floating window
// chrome.action.onClicked.addListener(() => {
//     chrome.windows.create({
//       url: chrome.runtime.getURL("index.html"),
//       type: "popup",
//       width: 490,   // Adjust width as needed
//       height: 780,  // Adjust height as needed
//       left: 100,    // Optional: X position of the window
//       top: 100      // Optional: Y position of the window
//     });
//   });
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("index.html")
    });
  });
//To open dictionary result in separate window Dictionary 
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "openResultWindow") {
      chrome.windows.create({
        url: chrome.runtime.getURL("DictionaryResult.html"),
        type: "popup",
        width: 400,
        height: 400
      });
    }
  });

  //drive work
  
  
  
  





