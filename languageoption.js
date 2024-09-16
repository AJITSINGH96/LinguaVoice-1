// List of languages
const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'nl', label: 'Dutch' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hi', label: 'Hindi' },
    { value: 'th', label: 'Thai' },
    { value: 'vi', label: 'Vietnamese' },
    // Add more languages as needed
];

// Function to populate select elements
function populateSelect(selectId) {
    const selectElement = document.getElementById(selectId);
    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language.value;
        option.textContent = language.label;
        selectElement.appendChild(option);
    });
}


// Save the default language
function saveDefaultLanguage(languageCode) {
    chrome.storage.sync.set({ defaultLanguage: languageCode }, function() {
        console.log('Default language saved:', languageCode);
    });
}

// Retrieve the default language
function getDefaultLanguage(callback) {
    chrome.storage.sync.get(['defaultLanguage'], function(result) {
        const defaultLanguage = result.defaultLanguage || 'en'; // Fallback to English if not set
        callback(defaultLanguage);
    });
}

// Save the default output language
function saveDefaultOutputLanguage(languageCode) {
    chrome.storage.sync.set({ defaultOutputLanguage: languageCode }, function() {
        console.log('Default output language saved:', languageCode);
    });
}


// Retrieve the default output language
function getDefaultOutputLanguage(callback) {
    chrome.storage.sync.get(['defaultOutputLanguage'], function(result) {
        const defaultOutputLanguage = result.defaultOutputLanguage || 'es'; // Fallback to Spanish if not set
        console.log('Default output language loaded:', defaultOutputLanguage);
        callback(defaultOutputLanguage);
    });
}
// Populate both select elements
document.addEventListener('DOMContentLoaded', () => {
    populateSelect('input-language');
    populateSelect('target-language');

    // Set the default language in the input language dropdown
    getDefaultLanguage((defaultLanguage) => {
        const inputLanguageSelect = document.getElementById('input-language');
        inputLanguageSelect.value = defaultLanguage; // Set the default input language as selected
    });

    getDefaultOutputLanguage((defaultOutputLanguage) => {
        const outputLanguageSelect = document.getElementById('target-language');
        outputLanguageSelect.value = defaultOutputLanguage; // Set the default output language as selected
    });

    // Save the selected language as the default when changed for input
    document.getElementById('input-language').addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;
        saveDefaultLanguage(selectedLanguage);
    });
    // Save the selected language as the default when changed for output
    document.getElementById('target-language').addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;
        saveDefaultOutputLanguage(selectedLanguage);
    });

    //set user name
    // updateHeaderWithUserName();
    // const icon = document.getElementById('icon');
    // const nameInput = document.getElementById('name-input');

    // // Show input field when the icon is clicked
    // icon.addEventListener('click', function() {
    //     nameInput.style.display = 'block'; // Show input field
    //     nameInput.focus(); // Focus on the input field
    // });

    // // Save user name when input loses focus or on Enter key press
    // nameInput.addEventListener('blur', function() {
    //     saveUserName();
    // });
    // // nameInput.addEventListener('click', function(event) {
    // //     if (event.key === 'Space') {
    // //         event.preventDefault(); // Prevent space from being added to input field
    // //     }
    // // });

    // nameInput.addEventListener('keydown', function(event) {
    //     if (event.key === 'Enter') {
    //         saveUserName();
    //     }
    // });

  
});

function saveUserName() {
    const userName = document.getElementById('name-input').value;
    if (userName.trim() !== '') {
        storeUserName(userName);
        updateHeaderWithUserName();
        document.getElementById('name-input').style.display = 'none'; // Hide input field after saving
    }
}

function storeUserName(name) {
    chrome.storage.local.set({ userName: name }, function() {
        console.log('User name saved:', name);
    });
}

function getUserName(callback) {
    chrome.storage.local.get(['userName'], function(result) {
        const userName = result.userName || ''; // Default to empty string if not set
        callback(userName);
    });
}

function updateHeaderWithUserName() {
    getUserName(function(userName) {
        const header = document.getElementById('header');
        if (userName) {
            header.textContent = `Welcome, ${userName}`; // Update heading with user name
        }
    });
}

//language input detection
//TO DO:
//detect language input
// Function to detect language using Google Cloud Translation API

async function detectLanguage(text) {
    const apiKey = 'jfdgsdfgvbj'; // Replace with your Google Cloud Translation API key
    const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: text }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.detections[0][0].language;
    } catch (error) {
        console.error('Error detecting language:', error.message);
        throw error;
    }
}




//document.getElementById('input-language').value=detectedLanguage;
