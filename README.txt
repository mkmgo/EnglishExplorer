ENGLISH ADVENTURE — LESSON 1
Tizen-friendly offline HTML presentation

Files:
- index.html
- character.mp4

How to use:
1. Keep both files in the same folder.
2. Open index.html in a modern desktop browser to test.
3. For a Samsung Tizen TV, the simplest route is to host this folder on a web server and open the URL in the TV browser.
4. The lesson is designed for 16:9 full-screen use.
5. Use the on-screen NEXT/BACK buttons or a keyboard if testing on a computer.
6. The character video is the user-provided 2.23-second MP4 and is used on Screen 1.

Notes:
- No external JavaScript libraries or web fonts are used.
- Speech uses a layered engine: native Tizen TTS (tizen.tts) when available, otherwise the browser's Web Speech API, and finally a Web Audio "chime" so every interactive button is always audible on Tizen. If spoken words are required on a model without TTS, add pre-recorded MP3 clips (see the say() function in index.html).
- The lesson is intentionally teacher-led: the screen supports the tutor rather than replacing the tutor.
