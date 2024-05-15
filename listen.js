document.addEventListener("DOMContentLoaded", function() {
    const textInput = document.getElementById('textbox_id_1');
    const readButton = document.getElementById('btn_14');

    // Function to read text using Web Speech API
    function readText() {
        const text = textInput.value;
        if (text !== '') {
            const speech = new SpeechSynthesisUtterance(text);
            speech.lang = 'ar-SA'; // Set language to Arabic (Saudi Arabia)
            window.speechSynthesis.speak(speech);
        }
    }

    // Attach click event listener to the read button
    readButton.addEventListener('click', readText);
});
