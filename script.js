let isPlaying = false;
let playPauseBtn;
let resetBtn;

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const initialContent = document.getElementById('initial-content');
    const simulationContent = document.getElementById('simulation-content');
    const promptText = document.getElementById('prompt-text');

     // global state for play/pause

    // Function to handle search submission
    function handleSearch() {
        const prompt = searchInput.value.trim();

        if (prompt) {
            // Display the prompt in the simulation view
            promptText.textContent = prompt;

            // Save prompt to text file
            //savePromptToFile(prompt);

            // Switch from initial view to simulation view
            initialContent.classList.add('hidden');
            simulationContent.classList.remove('hidden');

            // Attach play/pause + reset functionality
            playPauseBtn = document.getElementById("playPauseBtn");
            resetBtn = document.getElementById("resetBtn");

            playPauseBtn.addEventListener("click", function() {
                isPlaying = !isPlaying;

                if (isPlaying) {
                    Runner.run(runner, engine);
                    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    console.log("Simulation playing");
                    // start/resume simulation here
                } else {
                    Runner.stop(runner);
                    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                    console.log("Simulation paused");
                    // pause simulation here
                }
            });

            resetBtn.addEventListener("click", function() {
                
                
                isPlaying=false;
                playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                console.log("Simulation reset");
                resetScene();
                
                // reset simulation logic here
            });
        }
    }

    // Function to save prompt to a text file
    function savePromptToFile(prompt) {
        const blob = new Blob([prompt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'simulation_prompt.txt';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    // Event listeners
    searchButton.addEventListener('click', handleSearch);

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // New chat button functionality to reset the interface
    const newChatButton = document.querySelector('.new-chat');
    newChatButton.addEventListener('click', function() {
        searchInput.value = '';
        simulationContent.classList.add('hidden');
        initialContent.classList.remove('hidden');
    });
});