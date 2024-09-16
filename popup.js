let speechData = {
    text: '',
    utteranceId: '' // ID to identify the utterance if needed
};

// Function to disable all buttons
function disableButtons() {
    document.getElementById('translate-button').disabled = true;
    document.getElementById('speak-button').disabled = true;
    document.getElementById('speak-translation').disabled = true;
    document.getElementById('wikipedia-input').disabled = true;
    document.getElementById('wikipedia-output').disabled = true;
    document.getElementById('askChatGPT_input').disabled = true;
    document.getElementById('askChatGPT_output').disabled = true;    
    document.getElementById('save-input').disabled = true;
    document.getElementById('save-pdf').disabled = true;
    document.getElementById('clear_btn').disabled = true;
    
    
    document.getElementById('stop-button').disabled = false; // Allow stopping the speech
}

// Function to enable all buttons
function enableButtons() {
    document.getElementById('translate-button').disabled = false;
    document.getElementById('speak-button').disabled = false;
    document.getElementById('speak-translation').disabled = false;
    document.getElementById('wikipedia-input').disabled = false;
    document.getElementById('wikipedia-output').disabled = false;    
    document.getElementById('askChatGPT_input').disabled = false;
    document.getElementById('askChatGPT_output').disabled = false;
    document.getElementById('save-input').disabled = false;
    document.getElementById('save-pdf').disabled = false;
    document.getElementById('clear_btn').disabled = false;
    document.getElementById('stop-button').disabled = false; // Allow stopping the speech
}

// Function to stop ongoing speech
function stopSpeech() {
    chrome.tts.stop(); // Stop any ongoing speech
    speechData.utteranceId = ''; // Clear the utterance ID
}


//works same as detectLanguage() in langugageoption.js,just written here also to set input language of user's text  
async function setinputLanguage(text) {
    const apiKey = 'dhjfgbhjdfg'; // Replace with your Google Cloud Translation API key
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
        return data.data.detections[0][0].language; // Return the detected language code
    } catch (error) {
        console.error('Error detecting language:', error.message);
        throw error; // Re-throw the error to be handled by the caller
    }
}
// Handle the 'translate-button' click event
document.getElementById('translate-button').addEventListener('click', async () => {
    //detect language of user's input text
    const currentSelection = document.getElementById('input-language').value;
    const textToTranslate = document.getElementById('text-to-translate').value;
    try {
        const detectedLanguage = await setinputLanguage(textToTranslate);
        document.getElementById('input-language').value = detectedLanguage;
    } catch (error) {
        // Handle errors here if needed
        console.error('Error setting detected language:', error.message);
        document.getElementById('input-language').value=currentSelection;
    }
    
    const targetLanguage = document.getElementById('target-language').value;
    const apiKey = 'jfgjsdffbsdjgb';  // Replace with your actual API key

    // Stop any ongoing speech before translating
    stopSpeech();

    // Disable buttons while translation is in progress
    disableButtons();

    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: textToTranslate,
                target: targetLanguage
            })
        });

        const data = await response.json();

        if (data.data && data.data.translations) {
            const translatedText = data.data.translations[0].translatedText;
            document.getElementById('translated-text').value = translatedText;

            // Set up speech data
            speechData.text = translatedText;
            speechData.utteranceId = 'speech-' + Date.now(); // Generate a unique ID

        } else {
            document.getElementById('translated-text').textContent = 'Error: Translation not found.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('translated-text').value = 'Error: Unable to translate text.';
    } finally {
        // Re-enable buttons after translation is done
        enableButtons();
    }
});


//save input to pdf
document.getElementById('save-input').addEventListener('click', () => {
    // Get the translated text
    const inputText= document.getElementById('text-to-translate').value;

    // Check if there's any translated text to save
    if (inputText ) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

// Check if jsPDF is correctly loaded
        if (typeof jsPDF === 'undefined') {
            console.error('jsPDF is not loaded');       
            } else {
            // Create and save a PDF document
            // Define margins
            const leftMargin = 20;  // Space from the left edge (in units)
            const rightMargin = 20; // Space from the right edge (in units)

            // Get the page width and height
            const pageWidth = doc.internal.pageSize.width;
            //const pageHeight = doc.internal.pageSize.height;

            // Calculate X coordinates for text placement
            const xStart = leftMargin;
            const xEnd = pageWidth - rightMargin;

            // Define Y coordinate (distance from top)
            const yCoordinate = 10; // Adjust as needed


            // Add text to the PDF with left and right margins
            doc.text(inputText, xStart, yCoordinate, { maxWidth: xEnd - xStart });
            doc.save('Inputdocument.pdf');
            shownotification();

        }
    } 
    else {
        alert('NO INPUT TO GENERATE PDF.');
    }
});


//save translation result  to pdf
document.getElementById('save-pdf').addEventListener('click', () => {
    // Get the translated text
    const translatedText = document.getElementById('translated-text').value;

    // Check if there's any translated text to save
    if (translatedText && translatedText !== 'Error: Translation not found.' && translatedText !== 'Error: Unable to translate text.') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

// Check if jsPDF is correctly loaded
        if (typeof jsPDF === 'undefined') {
            console.error('jsPDF is not loaded');       
            } else {
        // Create and save a PDF document
         // Create and save a PDF document
            // Define margins
            const leftMargin = 20;  // Space from the left edge (in units)
            const rightMargin = 20; // Space from the right edge (in units)

            // Get the page width and height
            const pageWidth = doc.internal.pageSize.width;
            //const pageHeight = doc.internal.pageSize.height;

            // Calculate X coordinates for text placement
            const xStart = leftMargin;
            const xEnd = pageWidth - rightMargin;

            // Define Y coordinate (distance from top)
            const yCoordinate = 10; // Adjust as needed


            // Add text to the PDF with left and right margins
            doc.text(translatedText, xStart, yCoordinate, { maxWidth: xEnd - xStart });
            doc.save('TranslatedDocument.pdf');
            shownotification();
    }
    } else {
        alert('No translation available to save.');
    }
});


// Handle the 'input speak-button' click event
function speakinput(){
    const textToSpeakTranslation = document.getElementById('text-to-translate').value;
    const inputLanguage = document.getElementById('input-language').value;
    const volumeControl = document.getElementById('volume-control').value;
   

    if (textToSpeakTranslation) {
        // Stop any ongoing speech before speaking new text
        stopSpeech();

        // Disable buttons while speaking
        disableButtons();

         // Adjust speech rate based on volume control slider (volumeControl value)
         const speechRate = Math.max(0.1, Math.min(volumeControl, 10)); // Ensure rate is between 0.1 and 10
     
        // Speak the text in the selected language
        chrome.tts.speak(textToSpeakTranslation, {
            rate: speechRate, // Adjusted rate based on slider value
            lang: inputLanguage,
         
            onEvent: (event) => {
                if (event.type === 'end' || event.type === 'interrupted') {
                    // Speech ended or interrupted
                    enableButtons(); // Re-enable buttons
                    speechData.utteranceId = ''; // Clear the utterance ID
                }
            }
        });
    } else {
        alert('No Translated value.');
    }
};
//speak translated output
function speaktranslated(){
   
    const voiceinputoutputbtn = document.getElementById('voice-input-btn');
     // Change the border color
     voiceinputoutputbtn.style.border = '2px solid red';
     //reset the border color
     setTimeout(() => {
        voiceinputoutputbtn.style.border = ''; // Resets to default
    }, 3000); // Change the timeout duration as needed
    const translatedText = document.getElementById('translated-text').value;
    const targetLanguage = document.getElementById('target-language').value;
    const volumeControls = document.getElementById('volume-control').value;
    if (translatedText) {
        // Stop any ongoing speech before speaking new text
        stopSpeech();
    
        // Disable buttons while speaking
        disableButtons();
        
         // Adjust speech rate based on volume control slider (volumeControl value)
         const speechRates = Math.max(0.1, Math.min(volumeControls, 10)); // Ensure rate is between 0.1 and 10
         
    
        // Speak the translated text in the selected language
        chrome.tts.speak(translatedText, {
            rate: speechRates,
            
            lang: targetLanguage,  // Use the language code for speaking
            onEvent: (event) => {
                if (event.type === 'end' || event.type === 'interrupted') {
                    // Speech ended or interrupted
                    enableButtons(); // Re-enable buttons
                    speechData.utteranceId = ''; // Clear the utterance ID
                }
            }
        });
    } else {
        alert('No translation available to speak.');
    }
    
    };
document.getElementById('speak-button').addEventListener('click', () => {
    speakinput();
});


// //speak in translated-result language
// document.getElementById('speak-translation').addEventListener('click', () => {
//     // Retrieve the translated text
//     const translatedText = document.getElementById('translated-text').value;
//     const targetLanguage = document.getElementById('target-language').value;
//     const volumeControls = document.getElementById('volume-control').value;
    

//     if (translatedText) {
//         // Stop any ongoing speech before speaking new text
//         stopSpeech();

//         // Disable buttons while speaking
//         disableButtons();
        
//          // Adjust speech rate based on volume control slider (volumeControl value)
//          const speechRates = Math.max(0.1, Math.min(volumeControls, 10)); // Ensure rate is between 0.1 and 10
         

//         //Speak the translated text in the selected language
//         chrome.tts.speak(translatedText, {
//             rate: speechRates,
            
//             lang: targetLanguage,  // Use the language code for speaking
//             onEvent: (event) => {
//                 if (event.type === 'end' || event.type === 'interrupted') {
//                     // Speech ended or interrupted
//                     enableButtons(); // Re-enable buttons
//                     speechData.utteranceId = ''; // Clear the utterance ID
//                 }
//             }
//         });
//     } else {
//         alert('No translation available to speak.');
//     }
//     //speaktranslated();
// });
document.getElementById('speak-translation').addEventListener('click', () => {
    const translatedText = document.getElementById('translated-text').value;
    const targetLanguage = document.getElementById('target-language').value;
    const volumeControls = document.getElementById('volume-control').value;

    if (translatedText) {
        stopSpeech();
        disableButtons();

        const speechRate = Math.max(0.1, Math.min(volumeControls, 10));
        const cleanedText = translatedText.trim();

        // Use a slight delay before starting the speech
        setTimeout(() => {
            chrome.tts.speak(cleanedText, {
                rate: speechRate,
                lang: targetLanguage,
                onEvent: (event) => {
                    if (event.type === 'end' || event.type === 'interrupted') {
                        enableButtons();
                        speechData.utteranceId = '';
                    }
                }
            });
        }, 300);  // Adjust delay time as needed
    } else {
        alert('No translation available to speak.');
    }
});



// Handle the 'wikipedia-input_button' click event
document.getElementById('wikipedia-input').addEventListener('click', () => {
    const textToSearch = document.getElementById('text-to-translate').value.trim();

    if (textToSearch) {
        // Create Wikipedia search URL
        const wikipediaLink = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(textToSearch)}`;
        
        // Open the Wikipedia search link in a new tab
        chrome.tabs.create({ url: wikipediaLink });
    } else {
        alert('Please enter text to search.');
    }
});
// Handle the 'wikipedia-output_button' click event
document.getElementById('wikipedia-output').addEventListener('click', () => {
    const textToSearch = document.getElementById('translated-text').value.trim();

    if (textToSearch) {
        // Create Wikipedia search URL
        const wikipediaLink = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(textToSearch)}`;
        
        // Open the Wikipedia search link in a new tab
        chrome.tabs.create({ url: wikipediaLink });
    } else {
        alert('Please enter text to search.');
    }
});

// Handle the 'stop-button' click event
document.getElementById('stop-button').addEventListener('click', () => {
    stopSpeech();  // Stop any ongoing speech
});
//clear input and output both
function clearall(){
    document.getElementById('text-to-translate').value="";
    document.getElementById('translated-text').value="";
    isListening = false;  // Update state
}
// clear button listener
document.getElementById('clear_btn').addEventListener('click', () => {
    clearall();
});

function shownotification() {
    console.log('Notification function called'); // Debugging line
    var notifObject = {
        type: 'basic',
        iconUrl: 'icons/icon_48.png', // Ensure this file exists and is accessible
        title: 'Download Completed',
        message: "Your PDF is downloaded successfully."
    };

    chrome.notifications.create('downloadnotif', notifObject, function(notificationId) {
        if (chrome.runtime.lastError) {
            console.error('Error creating notification:', chrome.runtime.lastError);
        } else {
            console.log('Notification created successfully:', notificationId); // Debugging line
        }
    });
}



let recognition = null;
let isListening = false;
let speechEndTimer = null;
let translationTriggered = false;

function speak_input_output_voice() {
    clearTimeout(speechEndTimer); // Clear any existing timers

    if (isListening) {
        // Stop the current recognition if it's active
        if (recognition) {
            recognition.stop();
            console.log('Recognition manually stopped.');
        }
        isListening = false; // Update state

        // Trigger the speak-translation function immediately
        speaktranslated();
        
        translationTriggered = true; // Ensure that translation is triggered
    } else {
        try {
            recognition = new webkitSpeechRecognition();
            // recognition.lang = 'en-US'; // Set to the language of expected input
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = true; // Allow continuous listening

            recognition.start();
            isListening = true; // Update state

            // Change the border color
            const voiceinputoutputbtn = document.getElementById('voice-input-btn');
            voiceinputoutputbtn.style.border = '2px solid green';
            // Reset the border color after 3 seconds
            setTimeout(() => {
                voiceinputoutputbtn.style.border = ''; // Resets to default
            }, 3000);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Recognized Text:', transcript); // Log recognized text
                document.getElementById('text-to-translate').value = transcript;
                translatevoiceText(); // Call the translate function
                

            };

            recognition.onspeechend = () => {
                console.log('Speech has stopped being detected.');
                if (!translationTriggered) {
                    // Set a timer to wait for 3 seconds before calling speaktranslated()
                    speechEndTimer = setTimeout(() => {
                        speaktranslated();
                        //document.getElementById('voice-input-btn').textContent="Speak";
                        translationTriggered = true; // Ensure that translation is triggered
                    }, 3000);
                }
            };

            recognition.onerror = (event) => {
                showErrorPopup(`Error occurred in recognition: ${event.error}`);
            };

            recognition.onend = () => {
                console.log('Speech recognition service disconnected.');
                isListening = false; // Update state
            };
        } catch (error) {
            showErrorPopup(`Speech Recognition setup failed: ${error.message}`);
        }
    }
};

//speach input
// let recognition = null;
// let isListening = false;

// function speak_input_output_voice(){
//     clearInterval()
//     if (isListening) {
//         // Stop the current recognition if it's active
//         if (recognition) {
//             recognition.stop();
//             console.log('Recognition manually stopped.');
//         }
//         isListening = false;  // Update state

//         // Call speak-translation function after stopping recognition
//         speaktranslated(); // Trigger the speak-translation button click
//         // const voiceinputoutputbtns = document.getElementById('voice-input-btn');//change color back to default after spekaing is done
//         // voiceinputoutputbtns.style.border = ''; // Resets to default
//     } else {
//         try {
//             recognition = new webkitSpeechRecognition();

//             //TO DO:
//             recognition.lang = 'en-US';  // Set to the language of expected input
//             //
//             recognition.interimResults = false;
//             recognition.maxAlternatives = 1;
//             recognition.continuous = true; // Allow continuous listening

//             recognition.start();
//             const voiceinputoutputbtn = document.getElementById('voice-input-btn');
//             // Change the border color
//             voiceinputoutputbtn.style.border = '2px solid green';
//             //reset the border color
//             setTimeout(() => {
//             voiceinputoutputbtn.style.border = ''; // Resets to default
//             }, 3000); // Change the timeout duration as needed

//             isListening = true;  // Update state

//             recognition.onresult = (event) => {
//                 const transcript = event.results[0][0].transcript;
//                 console.log('Recognized Text:', transcript); // Log recognized text
//                 document.getElementById('text-to-translate').value = transcript;
//                 translateText(transcript);  // Call the translate function
//             };

//             recognition.onspeechend = () => {
//                 console.log('Speech has stopped being detected.');

//                 // recognition.stop();
//                 // Optionally stop recognition here if needed
//             };

//             recognition.onerror = (event) => {
//                 showErrorPopup(`Error occurred in recognition: ${event.error}`);
//             };

//             recognition.onend = () => {
//                 console.log('Speech recognition service disconnected.');
//                 isListening = false;  // Update state
//             };
//         } catch (error) {
//             showErrorPopup(`Speech Recognition setup failed: ${error.message}`);
//         }
//     }
// };

// Add event listener for the input/output voice button
document.getElementById('voice-input-btn').addEventListener('click', () => {
    speak_input_output_voice();    
    
   
});

//TO DO:FIX SPACE BAR FUNCTIONALITY LATER
//Add event listener for the Spacebar key
// document.addEventListener('keydown', (event) => {
//     if (event.code === 'Space') {
//         event.preventDefault(); // Prevent default Spacebar behavior (e.g., scrolling)
//         speak_input_output_voice();  // Call the speak-translation function
//     }
// });

// Translation function

function translatevoiceText() {
    const inputText = document.getElementById('text-to-translate').value;
    const targetLanguage = document.getElementById('target-language').value;
    const textToTranslate = document.getElementById('text-to-translate').value;
    //first detect the source language of user
    detectLanguage(textToTranslate).then(sourceLanguage => {
        // Update the select box value with the detected language
        const languageSelect = document.getElementById('input-language');
        languageSelect.value = sourceLanguage; // Set the detected language code as the value
        console.log('Detected Source Language:', sourceLanguage);

        // Construct the API URL with the correct language pair format
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${sourceLanguage}|${targetLanguage}`;

        // Fetch translation
        return fetch(apiUrl);
    })
    .then(response => response.json())
    .then(data => {
        const translatedText = data.responseData.translatedText;
        console.log('Translated Text:', translatedText); // Log translated text
        document.getElementById('translated-text').value = translatedText;
    })
    .catch(error => {
        showErrorPopup(`Translation error: ${error.message}`);
    });
}
// function translateText(text) {
//     const targetLanguage = document.getElementById('target-language').value;
//     const sourceLanguage = 'en'; // Assuming source language is always English
//      // Construct the API URL with the correct language pair format
//      const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`;

//      // Fetch translation
//      fetch(apiUrl)
//          .then(response => response.json())
//          .then(data => {
//              const translatedText = data.responseData.translatedText;
//              console.log('Translated Text:', translatedText); // Log translated text
//              document.getElementById('translated-text').value = translatedText;
//          })
//          .catch(error => {
//              showErrorPopup(`Translation error: ${error.message}`);
//          });
// }

// Function to display error messages in the popup
function showErrorPopup(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.backgroundColor = '#f44336';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.innerText = message;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000); // Removes the error message after 5 seconds
}

//redirect to chatgpt from input
document.getElementById('askChatGPT_input').addEventListener('click', () => {
    const inputText = document.getElementById('text-to-translate').value.trim();

    if (inputText) {
        const chatGPTUrl = `https://chat.openai.com/chat?q=${encodeURIComponent(inputText)}`;
        chrome.tabs.create({ url: chatGPTUrl });
    } else {
        alert("Please enter some text.");
    }
});
//redirect to chatgpt from output
document.getElementById('askChatGPT_output').addEventListener('click', () => {
    const inputText = document.getElementById('translated-text').value;

    if (inputText) {
        const chatGPTUrl = `https://chat.openai.com/chat?q=${encodeURIComponent(inputText)}`;
        chrome.tabs.create({ url: chatGPTUrl });
    } else {
        alert("Please enter some text.");
    }
});


//***search songs****////
// document.getElementById('showInputs').addEventListener('click', () => {
//     const inputContainer = document.getElementById('inputContainer');
//     const modal = document.getElementById('modal');
    
//     // Show the modal and input fields
//     modal.style.display = 'block';
//     inputContainer.style.display = 'block';
// });
document.getElementById('showInputs').addEventListener('click', () => {
    // Open a new window for input fields
    const inputWindow = window.open('', 'InputWindow', 'width=400,height=300,scrollbars=yes');

    // Define the content for the new window
    const inputWindowContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enter Song Information</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                input, button {
                    width: 100%;
                    margin-bottom: 10px;
                    padding: 5px;
                }
                button {
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <h3>Enter Song Information</h3>
            <input type="text" id="songName" placeholder="Enter song name,Ex:shape of you">
            <input type="text" id="artistName" placeholder="Enter artist name,Ex:Ed Sheeran">
            <button id="fetchLyrics">Submit</button>
            <script src="inputWindow.js"></script>
        </body>
        </html>
    `;

    // Write content to the new window
    inputWindow.document.open();
    inputWindow.document.write(inputWindowContent);
    inputWindow.document.close();
});
//Dictionary button
document.getElementById('Dictionary_input').addEventListener('click', function() {
    const word = document.getElementById('text-to-translate').value;
    if (word) {
        // Send word to background.js to open floating window
        chrome.runtime.sendMessage({ type: "openResultWindow", word: word });

        // Save the word to local storage to pass it to the result window
        chrome.storage.local.set({ searchWord: word });
    }
});

document.getElementById('Dictionary_output').addEventListener('click', function() {
    const word = document.getElementById('translated-text').value;
    if (word) {
        // Send word to background.js to open floating window
        chrome.runtime.sendMessage({ type: "openResultWindow", word: word });

        // Save the word to local storage to pass it to the result window
        chrome.storage.local.set({ searchWord: word });
    }
});
//image processing
document.getElementById('start-button').addEventListener('click', () => {
    chrome.windows.create({
      url: chrome.runtime.getURL('imageprocess.html'),
      type: 'popup',
      width: 600,
      height: 400,
      focused: true
    });
  });

//sliding bar for profile
   
    const profileIcon = document.getElementById('profile-icon');
    const tophead = document.getElementById('tophead');

    // Add click event listener to the profile icon
    profileIcon.addEventListener('click', function() {
        if (tophead.style.left === '0px') {
            tophead.style.left = '-25vw'; // Hide panel
        } else {
            tophead.style.left = '0px'; // Show panel
        }
    });


    
    // Sign-In Button Click Event
    document.getElementById('signup-btn').addEventListener('click', function() {
        // First, check if the user is already authenticated
        chrome.identity.getAuthToken({interactive: false}, function(token) {
            if (chrome.runtime.lastError || !token) {
                console.log('No token found or error occurred, signing in...');
                chrome.identity.getAuthToken({interactive: true}, function(token) {
                    if (chrome.runtime.lastError) {
                        if (chrome.runtime.lastError.message === "The user did not approve access.") {
                            // User canceled the sign-in process, exit gracefully
                            alert('You canceled the sign-in process.');
                        } else {
                            // Other errors
                            alert('Sign-in failed: ' + chrome.runtime.lastError.message);
                        }
                        return;
                    }
                    fetchUserProfile(token);  // Fetch profile after successful login
                });
            } else {
                // Token exists, user is already signed in
                alert('You are already signed in.');
            }
        });
    });

// // Sign-Out Button Click Event
// document.getElementById('logout-btn').addEventListener('click', function() {
//     chrome.identity.getAuthToken({interactive: false}, function(token) {
//         if (chrome.runtime.lastError || !token) {
//             console.error('Error obtaining auth token for sign-out:', chrome.runtime.lastError.message);
//             alert('Logout failed: ' + chrome.runtime.lastError.message);
//             return;
//         }
        
//         // Step 1: Remove cached token
//         chrome.identity.removeCachedAuthToken({token: token}, function() {
//             if (chrome.runtime.lastError) {
//                 console.error('Error removing cached auth token:', chrome.runtime.lastError.message);
//                 alert('Logout failed: ' + chrome.runtime.lastError.message);
//                 return;
//             }
            
//             console.log('Cached token removed.');

//             // Step 2: Revoke token to fully log out
//             fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
//             .then(response => {
//                 if (response.ok) {
//                     console.log('Token revoked, user signed out.');
//                     alert('You have been logged out. Please sign in again.');
//                 } else {
//                     console.error('Error revoking token:', response);
//                     alert('Logout failed. Please try again.');
//                 }
//             })
//             .catch(error => console.error('Error revoking token:', error));
//         });
//     });
// });
document.getElementById('logout-btn').addEventListener('click', function() {
    // Step 1: Sign out from regular authentication
    chrome.identity.getAuthToken({interactive: false}, function(token) {
        if (chrome.runtime.lastError || !token) {
            //console.error('Error obtaining auth token for sign-out:', chrome.runtime.lastError.message);
             //alert('Logout failed: ' + chrome.runtime.lastError.message);
             alert('You are Scuccessfully Logged Out');
            return;
        }

        // Remove cached token for regular sign-in
        chrome.identity.removeCachedAuthToken({token: token}, function() {
            if (chrome.runtime.lastError) {
                // console.error('Error removing cached auth token:', chrome.runtime.lastError.message);
                // alert('Logout failed: ' + chrome.runtime.lastError.message);
                return;
            }

            // Revoke regular authentication token
            fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
            .then(response => {
                if (response.ok) {
                    console.log('Regular token revoked, user signed out.');
                    alert('You have been logged out from regular sign-in.');
                } else {
                   
                    alert('Logout failed. Please try again.');
                }
            })
            .catch(error => console.error('Error revoking regular token:', error));
        });
    });

    // Step 2: Sign out from Google Drive
    chrome.identity.getAuthToken({interactive: false, scopes: ['https://www.googleapis.com/auth/drive.readonly']}, function(driveToken) {
       

        // Remove cached Drive token
        chrome.identity.removeCachedAuthToken({token: driveToken}, function() {
            if (chrome.runtime.lastError) {
                console.error('Error removing cached Drive token:', chrome.runtime.lastError.message);
                return;
            }

            // Revoke Google Drive token
            fetch(`https://accounts.google.com/o/oauth2/revoke?token=${driveToken}`)
            .then(response => {
                if (response.ok) {
                    console.log('Google Drive token revoked.');
                } else {
                    console.error('Error revoking Drive token:', response);
                }
            })
            .catch(error => console.error('Error revoking Drive token:', error));
        });
    });
});

// Function to fetch user profile using the token
function fetchUserProfile(token) {
    fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('User Profile:', data);
        // You can display the user's profile data here
    })
    .catch(error => console.error('Error fetching user profile:', error));
}


// // Drive Authentication Button Click Event
// document.getElementById('drive-access-btn').addEventListener('click', function() {
//     // Request an OAuth token with Google Drive scope
//     chrome.identity.getAuthToken({
//         interactive: true,
//         scopes: ['https://www.googleapis.com/auth/drive.readonly']  // Drive Read-only scope
//     }, function(token) {
//         if (chrome.runtime.lastError || !token) {
//             console.error('Drive access failed:', chrome.runtime.lastError.message);
//             alert('Drive access failed: ' + chrome.runtime.lastError.message);
//             return;
//         }

//         console.log('Drive access token:', token);
//         fetchDriveFiles(token);
//     });
// });

// // Function to fetch Google Drive files using the token
// function fetchDriveFiles(token) {
//     fetch('https://www.googleapis.com/drive/v3/files', {
//         headers: { 'Authorization': 'Bearer ' + token }
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Drive Files:', data);
//         // Display files or take further action with Drive data here
//     })
//     .catch(error => console.error('Error fetching Drive files:', error));
// }
// Load the Google API client library
// Function to dynamically load the Google API client library
// Button click event to initiate Drive access


// popup.js
document.getElementById('drive-access-btn').addEventListener('click', function() {
    // Request an OAuth token with Google Drive scope
    chrome.identity.getAuthToken({
        interactive: true,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']  // Drive Read-only scope
    }, function(token) {
        if (chrome.runtime.lastError || !token) {
            // console.error('Drive access failed:', chrome.runtime.lastError.message);
            alert('Drive access failed: ' + chrome.runtime.lastError.message);
            return;
        }

        console.log('Drive access token:', token);
        chrome.tabs.create({ url: 'https://drive.google.com' });
    });
});

//go to my linkedin
document.addEventListener('DOMContentLoaded', function() {
    var profileButton = document.getElementById('Developersprofile');
    if (profileButton) {
        profileButton.addEventListener('click', function() {
            window.open('https://www.linkedin.com/in/ajit-singh-04ba26194', '_blank');
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var contactButton = document.getElementById('contactbtn');

    if (contactButton) {
        contactButton.addEventListener('click', function() {
            var contactPopup = document.getElementById('contact-popup');
            if (contactPopup) {
                contactPopup.style.display = 'block'; // Show the pop-up
            }
        });
    }

    // Close the pop-up when the "close" button is clicked
    var closePopupButton = document.getElementById('close-popup');
    if (closePopupButton) {
        closePopupButton.addEventListener('click', function() {
            var contactPopup = document.getElementById('contact-popup');
            if (contactPopup) {
                contactPopup.style.display = 'none'; // Hide the pop-up
            }
        });
    }
});

//find countries by language
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('findcountrybtn').addEventListener('click', function () {
        // Open a new window
        const newWindow = window.open('', '', 'width=400,height=400');
      
        // Create the basic HTML structure in the new window
        newWindow.document.write(`
          <html>
            <head>
              <title>Countries Finder</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                input { padding: 5px; margin-bottom: 10px; width: 100%; }
                b button { 
                padding: 10px; 
                
                }
                button:hover { 
                color:#ccc;
                background-color: rgb(32, 32, 32); /* Optional: Change background color on hover */
                 cursor: pointer; /* Default cursor for button */
                }
                .country { margin-top: 10px; }
              </style>
            </head>
            <body>
              <h2>Find Countries by Language</h2>
              <input type="text" id="languageInputNewWindow" placeholder="Enter language name (e.g., Spanish)">
              <button id="findCountriesBtnNewWindow">Find Countries</button>
              <div id="resultsNewWindow"></div>
            </body>
          </html>
        `);
      
      
          const findCountriesBtnNewWindow = newWindow.document.getElementById('findCountriesBtnNewWindow');
          
          findCountriesBtnNewWindow.addEventListener('click', function () {
            const language = newWindow.document.getElementById('languageInputNewWindow').value.trim().toLowerCase();
      
            if (language === "") {
              alert("Please enter a language."); // Using alert for simplicity
              return;
            }
      
            // Fetch data from Restcountries API
            fetch(`https://restcountries.com/v3.1/lang/${language}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error("Language not found");
                }
                return response.json();
              })
              .then(data => {
                displayCountriesInNewWindow(data, newWindow);
              })
              .catch(error => {
                alert("Could not find countries for this language.");
              });
          });
        
      });
      
      // Function to display countries in the new window
      function displayCountriesInNewWindow(countries, newWindow) {
        const resultsDiv = newWindow.document.getElementById('resultsNewWindow');
        resultsDiv.innerHTML = ""; // Clear previous results
      
        if (countries.length === 0) {
          resultsDiv.innerHTML = "<p>No countries found for this language.</p>";
          return;
        }
      
        countries.forEach(country => {
          const countryName = country.name.common;
          const countryRegion = country.region;
          const countryFlag = country.flags.svg;
      
          const countryElement = `
            <div class="country">
              <img src="${countryFlag}" alt="Flag of ${countryName}" width="30">
              <p><strong>${countryName}</strong> - ${countryRegion}</p>
            </div>
          `;
      
          resultsDiv.innerHTML += countryElement;
        });
      }
      
});

  
  
  

  



  
  







      
          
