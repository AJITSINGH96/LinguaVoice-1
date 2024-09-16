document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'AIzaSyA3K2WZJ2_J_023R5UXR9Dy3KORVVWPcYU';
    const apiEndpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  
    // Get elements
    const upload = document.getElementById('upload');
    const resultDiv = document.getElementById('result');
    const uploadedImage = document.getElementById('uploaded-image');
    const noFileText = document.getElementById('no-file-text');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const copyButton = document.getElementById('copy-button');
    const copiedMessage = document.getElementById('copied-message');
  
    if (!upload || !resultDiv || !uploadedImage || !noFileText || !zoomInButton || !zoomOutButton) {
      console.error('Required elements not found.');
      return;
    }
  
    let scale = 1; // Initial scale
  
    // Handle image upload
    upload.addEventListener('change', (event) => {
      const file = event.target.files[0];
  
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          uploadedImage.src = e.target.result;
          uploadedImage.style.display = 'block'; // Show the image
          noFileText.style.display = 'none'; // Hide "No file chosen"
  
          const imgData = e.target.result.split(',')[1]; // Remove the data URL prefix
  
          fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              requests: [
                {
                  image: {
                    content: imgData
                  },
                  features: [
                    {
                      type: 'TEXT_DETECTION'
                    }
                  ]
                }
              ]
            })
          })
          .then(response => response.json())
          .then(data => {
            const text = data.responses[0].fullTextAnnotation ? data.responses[0].fullTextAnnotation.text : 'No text detected';
            resultDiv.textContent = text;
          })
          .catch(error => {
            console.error("OCR Error:", error);
            resultDiv.textContent = 'Error: Could not extract text';
          });
        };
        reader.readAsDataURL(file); // Read the uploaded image file
      } else {
        uploadedImage.style.display = 'none'; // Hide the image
        noFileText.style.display = 'block'; // Show "No file chosen"
        resultDiv.textContent = 'No file selected';
      }
    });
  
    // Zoom In functionality
    zoomInButton.addEventListener('click', () => {
      scale += 0.1;
      uploadedImage.style.transform = `scale(${scale})`;
    });
  
    // Zoom Out functionality
    zoomOutButton.addEventListener('click', () => {
      scale = Math.max(0.1, scale - 0.1); // Ensure scale does not go below 0.1
      uploadedImage.style.transform = `scale(${scale})`;
    });
  // Copy text functionality
  copyButton.addEventListener('click', () => {
    const text = resultDiv.textContent;
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('Text copied to clipboard');
          copiedMessage.style.display = 'block'; // Show the message
          setTimeout(() => {
            copiedMessage.style.display = 'none'; // Hide after 1 second
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    } else {
      console.log('No text to copy');
    }
  });
});


  