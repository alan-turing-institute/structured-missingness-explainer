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
            fetch('data/demo_scenarios.json')
                .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then(data => {
                // Display the current part of the story
                const storyPart = data.story[currentStoryPart];
                dataElement.innerHTML = ''; // clear previous content 
                const cardHeader = document.createElement('header');
                cardHeader.className = "card-header";
                const cardTitle = document.createElement('p');
                cardTitle.className = "card-header-title";
                cardTitle.innerText = "Title";
                cardHeader.appendChild(cardTitle);
                dataElement.appendChild(cardHeader);
                const content = document.createElement('div');
                content.className = "card-content";
                content.innerText = storyPart.text;
                if (storyPart.imageUrl) {
                    setBackgroundImage(storyPart.imageUrl);
                }
                dataElement.appendChild(content);
                // Create buttons for the choices
                const choicesElement = document.getElementById('choices');
                if (choicesElement) {
                    choicesElement.innerHTML = ''; // Clear previous choices
                    const buttonWrapper = document.createElement('div');
                    buttonWrapper.className = "buttons is-centered"; // Add Bulma class for centering
                    choicesElement.appendChild(buttonWrapper);
                    storyPart.choices.forEach((choice) => {
                        const choiceButton = document.createElement('button');
                        if (choice.imageUrl) {
                            const image = document.createElement('img'); // Create an image element
                            image.src = choice.imageUrl; // Set the image source
                            image.alt = choice.text; // Set the alt attribute for accessibility
                            // Apply CSS styles to the image to make it small
                            image.style.width = '20px'; // Adjust the width as needed
                            image.style.height = '20px'; // Adjust the height as needed
                            choiceButton.appendChild(image); // Append the image to the button
                        }
                        choiceButton.innerHTML += choice.text; // Add text to the button
                        choiceButton.className = "button is-link";
                        choiceButton.addEventListener('click', () => {
                            currentStoryPart = choice.next;
                            if (choice.imageUrl) {
                                setBackgroundImage(choice.imageUrl);
                            }
                            else {
                                setBackgroundImage('');
                            }
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
// Define a function to set the background image of the card
function setBackgroundImage(imageUrl, size = 'cover') {
    const card = document.getElementById('dataDisplay');
    if (card) {
        card.style.backgroundImage = `url(${imageUrl})`;
        card.style.backgroundSize = size;
        card.style.backgroundPosition = 'right top';
    }
}
