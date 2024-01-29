"use strict";
let currentStoryPart = 'start';
window.onload = () => {
    const button = document.getElementById('changeTextButton');
    const dataElement = document.getElementById('dataDisplay');
    const restartButton = document.getElementById('restartButton');
    if (button && dataElement && restartButton) {
        // Add Bulma classes to the button
        button.className = "button is-primary";
        restartButton.className = "button is-danger is-rounded";
        button.addEventListener('click', () => {
            fetch('data/demo.json')
                .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then(data => {
                // Display the current part of the story
                const storyPart = data.story[currentStoryPart];
                dataElement.innerText = storyPart.text;
                // Create buttons for the choices
                const choicesElement = document.getElementById('choices');
                if (choicesElement) {
                    choicesElement.innerHTML = ''; // Clear previous choices
                    const buttonWrapper = document.createElement('div');
                    buttonWrapper.className = "buttons";
                    choicesElement.appendChild(buttonWrapper);
                    storyPart.choices.forEach((choice) => {
                        const choiceButton = document.createElement('button');
                        choiceButton.innerText = choice.text;
                        choiceButton.className = "button is-link";
                        choiceButton.addEventListener('click', () => {
                            currentStoryPart = choice.next;
                            button.click(); // Trigger the next part of the story
                        });
                        buttonWrapper.appendChild(choiceButton);
                    });
                }
            })
                .catch(error => {
                console.error('An error occurred while attempting to fetch the JSON file:', error);
            });
        });
        restartButton.addEventListener('click', () => {
            currentStoryPart = 'start';
            button.click(); // Trigger the start of the story
        });
        // Trigger the start of the story
        button.click();
    }
};
