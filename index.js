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
// Overall card element for the story part
function createCardElement(storyPart, stepCounter) {
    const card = document.createElement('div');
    //    card.className = "card";
    const cardHeader = document.createElement('header');
    cardHeader.className = "card-header";
    const cardTitle = document.createElement('p');
    cardTitle.className = "card-header-title";
    cardTitle.innerText = "Step " + stepCounter;
    cardHeader.appendChild(cardTitle);
    const content = document.createElement('div');
    content.className = "card-content";
    content.innerText = storyPart.text;
    card.appendChild(cardHeader);
    card.appendChild(content);
    return card;
}
// Next step choice buttons
function createChoicesElement(storyPart, button) {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = "buttons is-centered";
    storyPart.choices.forEach((choice) => {
        const choiceButton = document.createElement('button');
        choiceButton.innerText = choice.text;
        choiceButton.className = "button is-link is-large";
        choiceButton.addEventListener('click', () => {
            currentStoryPart = choice.next;
            button.click(); // Trigger the next part of the story
        });
        buttonWrapper.appendChild(choiceButton);
    });
    return buttonWrapper;
}
function createFinalModalElement(storyPart, userChoices) {
    const modal = document.createElement('div');
    modal.className = "modal is-active";
    const modalBackground = document.createElement('div');
    modalBackground.className = "modal-background";
    modal.appendChild(modalBackground);
    const modalContent = document.createElement('div');
    modalContent.className = "modal-content";
    const content = document.createElement('div');
    content.className = "box";
    const title = document.createElement('h1');
    title.className = "title is-2x";
    title.innerText = "Summary";
    content.appendChild(title);
    const text = document.createElement('p');
    text.innerText = storyPart.text;
    content.appendChild(text);
    const dataTitle = document.createElement('h1');
    dataTitle.className = "title is-4 mt-6";
    dataTitle.innerText = "Your choices:";
    content.appendChild(dataTitle);
    // display user choices as a table with 1 row and 11 columns
    // where the user's choices are displayed as grey or white
    const table = document.createElement('table');
    table.className = "table is-hoverable is-bordered is-fullwidth";
    const tableRow = document.createElement('tr');
    userChoices.forEach((choice) => {
        const tableData = document.createElement('td');
        tableData.innerText = choice ? "Yes" : "No";
        tableData.style.backgroundColor = choice ? "hsl(48, 100%, 67%)" : "hsl(348, 100%, 61%)";
        tableRow.appendChild(tableData);
    });
    table.appendChild(tableRow);
    content.appendChild(table);
    modalContent.appendChild(content);
    modal.appendChild(modalContent);
    const modalClose = document.createElement('button');
    modalClose.className = "modal-close is-large";
    modalClose.setAttribute('aria-label', 'close');
    modalClose.addEventListener('click', () => {
        modal.remove();
    });
    modal.appendChild(modalClose);
    // restart button
    const restartButton = document.createElement('button');
    restartButton.className = "button is-danger is-rounded is-large";
    restartButton.innerText = "Restart";
    restartButton.addEventListener('click', () => {
        currentStoryPart = 'start';
        modal.remove();
        window.location.reload();
    });
    modalContent.appendChild(restartButton);
    return modal;
}
let currentStoryPart = 'start';
// TODO: Change this, this is ugly and hard-coded and will not work in the long run!!!
// create an array of 11 elements (boolean) to store the user's choices and fill it 
// with random values for now
let userChoices = [];
for (let i = 0; i < 11; i++) {
    userChoices.push(Math.random() >= 0.5);
}
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    const button = document.getElementById('changeTextButton');
    const dataElement = document.getElementById('dataDisplay');
    const restartButton = document.getElementById('restartButton');
    if (button && dataElement && restartButton) {
        // Add Bulma classes to the button
        button.className = "button is-primary";
        restartButton.className = "button is-rounded is-large is-white";
        let stepCounter = 1;
        button.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Fetch the story data, currently from a local JSON file
                // TODO: from a public GitHub repository
                const data = yield fetchStory();
                // Display the current part of the story
                const storyPart = data.story[currentStoryPart];
                if (currentStoryPart === 'end') {
                    // display a modal
                    const modal = createFinalModalElement(storyPart, userChoices);
                    document.body.appendChild(modal);
                }
                else {
                    dataElement.innerHTML = ''; // clear previous content 
                    const card = createCardElement(storyPart, stepCounter);
                    dataElement.appendChild(card);
                    stepCounter++;
                    // Create buttons for the choices
                    const choicesElement = document.getElementById('choices');
                    if (choicesElement) {
                        choicesElement.innerHTML = ''; // Clear previous choices
                        const buttonWrapper = createChoicesElement(storyPart, button);
                        choicesElement.appendChild(buttonWrapper);
                    }
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
