document.addEventListener('DOMContentLoaded', function () {
    // Get the word from local storage
    chrome.storage.local.get(['searchWord'], function(result) {
        const word = result.searchWord;

        if (word) {
            fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
                .then(response => response.json())
                .then(data => {
                    if (data.title === "No Definitions Found") {
                        showError("No definitions found for this word.");
                    } else {
                        const meaningElement = document.getElementById('meaning');
                        const phoneticsElement = document.getElementById('phonetics');
                        const synonymsElement = document.getElementById('synonyms');
                        const antonymsElement = document.getElementById('antonyms');
                        const exampleElement = document.getElementById('example');

                        const meaning = data[0].meanings[0].definitions[0].definition;
                        const phonetics = data[0].phonetics[0] ? data[0].phonetics[0].text : "Not available";
                        const synonyms = data[0].meanings[0].synonyms.length ? data[0].meanings[0].synonyms.join(", ") : "None";
                        const antonyms = data[0].meanings[0].antonyms.length ? data[0].meanings[0].antonyms.join(", ") : "None";
                        const example = data[0].meanings[0].definitions[0].example ? `"${data[0].meanings[0].definitions[0].example}"` : "Not available";

                        meaningElement.innerText = `Meaning: ${meaning}`;
                        phoneticsElement.innerText = `Phonetics: ${phonetics}`;
                        synonymsElement.innerText = `Synonyms: ${synonyms}`;
                        antonymsElement.innerText = `Antonyms: ${antonyms}`;
                        exampleElement.innerText = `Example: ${example}`;
                    }
                    // Clear the stored word after displaying result
                    chrome.storage.local.remove('searchWord');
                })
                .catch(error => {
                    showError("An error occurred while fetching the data.");
                });
        }
    });

    function showError(message) {
        const meaningElement = document.getElementById('meaning');
        meaningElement.innerHTML = `<span class="error">${message}</span>`;
        document.getElementById('phonetics').innerText = "";
        document.getElementById('synonyms').innerText = "";
        document.getElementById('antonyms').innerText = "";
        document.getElementById('example').innerText = "";
    }
});
