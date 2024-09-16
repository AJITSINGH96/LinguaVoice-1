//to get response from getapi in a separate window
//we first open the input windows for song and singer information
//then run this script from popup.js to fetch and show information in a separate file window here.
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fetchLyrics').addEventListener('click', async () => {
        const songName = document.getElementById('songName').value.trim();
        const artistName = document.getElementById('artistName').value.trim();

        if (songName && artistName) {
            try {
                const response = await fetch(`https://api.lyrics.ovh/v1/${artistName}/${songName}`);
                const data = await response.json();
                let lyricsContent;

                if (data.lyrics) {
                    lyricsContent = data.lyrics;
                    if (window.opener) {
                        window.opener.document.getElementById('text-to-translate').value = lyricsContent;
                    }
                } else {
                    lyricsContent = 'Lyrics not found.';
                }
                
                const lyricsWindow = window.open('', 'LyricsWindow', 'width=600,height=400');
                const lyricsWindowContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Lyrics</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 10px;
                            }
                            #lyrics {
                                white-space: pre-wrap;
                               
                                max-height: 90vh;
                            }
                            button {
                                margin-top: 10px;
                                padding: 5px;
                                cursor: pointer;
                            }
                        </style>
                    </head>
                    <body>
                        <h3>Lyrics</h3>
                        <div id="lyrics">${lyricsContent}</div>
                        <button onclick="window.close()">Close</button>
                    </body>
                    </html>
                `;
                lyricsWindow.document.open();
                lyricsWindow.document.write(lyricsWindowContent);
                lyricsWindow.document.close();
            } catch (error) {
                console.error("Error fetching lyrics:", error);
                const lyricsWindow = window.open('', 'LyricsWindow', 'width=600,height=400');
                const lyricsWindowContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Lyrics</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 10px;
                            }
                            #lyrics {
                                white-space: pre-wrap;
                                overflow: auto;
                                max-height: 90vh;
                            }
                            button {
                                margin-top: 10px;
                                padding: 5px;
                                cursor: pointer;
                            }
                        </style>
                    </head>
                    <body>
                        <h3>Lyrics</h3>
                        <div id="lyrics">An error occurred while fetching lyrics.</div>
                        <button onclick="window.close()">Close</button>
                    </body>
                    </html>
                `;
                lyricsWindow.document.open();
                lyricsWindow.document.write(lyricsWindowContent);
                lyricsWindow.document.close();
            }
        } else {
            alert("Please enter both song name and artist.");
        }
    });
});