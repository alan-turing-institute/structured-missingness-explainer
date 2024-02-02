"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function fetchStory() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('data/demo_scenarios.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return yield response.json();
    });
}
let currentStoryPart = 'start';
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    const button = document.getElementById('changeTextButton');
    const dataElement = document.getElementById('dataDisplay');
    const restartButton = document.getElementById('restartButton');
    if (button && dataElement && restartButton) {
        // Add Bulma classes to the button
        button.className = "button is-primary";
        restartButton.className = "button is-danger is-rounded";
        let stepCounter = 1;
        button.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const data = yield fetchStory();
                // Display the current part of the story
                const storyPart = data.story[currentStoryPart];
                dataElement.innerHTML = ''; // clear previous content 
                const cardHeader = document.createElement('header');
                cardHeader.className = "card-header";
                const cardTitle = document.createElement('p');
                cardTitle.className = "card-header-title";
                cardTitle.innerText = "Step " + stepCounter;
                cardHeader.appendChild(cardTitle);
                dataElement.appendChild(cardHeader);
                const content = document.createElement('div');
                content.className = "card-content";
                content.innerText = storyPart.text;
                dataElement.appendChild(content);
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
                            stepCounter++;
                            button.click(); // Trigger the next part of the story
                        });
                        buttonWrapper.appendChild(choiceButton);
                    });
                }
            }
            catch (error) {
                console.error('An error occurred while attempting to fetch the JSON file:', error);
            }
        }));
        restartButton.addEventListener('click', () => {
            currentStoryPart = 'start';
            stepCounter = 1;
            button.click(); // Trigger the start of the story
        });
        // Trigger the start of the story
        button.click();
    }
});
