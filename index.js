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
// Initialise values
let userData = {};
let userCollectedData = {};
let currentStoryPart = 'start';
// TODO: Change this, this is ugly and hard-coded and will not work in the long run!!!
// create an array of 11 elements (boolean) to store the user's choices and fill it 
// with random values for now
let userChoices = [];
for (let i = 0; i < 11; i++) {
    userChoices.push(Math.random() >= 0.5);
}
function fetchStory() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('data/demo_scenarios_pokemon.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return yield response.json();
    });
}
function createBloodPressureElement() {
    const progress = document.createElement('progress');
    progress.className = "nes-progress";
    progress.value = 140;
    progress.max = 200;
    let direction = 1;
    let value = 140;
    let animate = setInterval(function () {
        if (value >= 200)
            direction = -2;
        if (value <= 140)
            direction = 2;
        value += direction;
        progress.value = value;
    }, 1);
    const button = document.createElement('button');
    button.className = "nes-btn is-warning";
    button.innerText = "Take measurement";
    button.addEventListener('click', () => {
        clearInterval(animate);
        const dialog = document.createElement('dialog');
        dialog.className = "nes-dialog";
        dialog.id = "dialog-default";
        const form = document.createElement('form');
        form.method = "dialog";
        const title = document.createElement('p');
        title.className = "title";
        title.innerText = "Your blood pressure is: " + progress.value;
        form.appendChild(title);
        const menu = document.createElement('menu');
        menu.className = "dialog-menu";
        const cancelButton = document.createElement('button');
        cancelButton.className = "nes-btn is-error";
        cancelButton.innerText = "Oh no!";
        cancelButton.addEventListener('click', () => {
            dialog.close();
        });
        menu.appendChild(cancelButton);
        form.appendChild(menu);
        dialog.appendChild(form);
        document.body.appendChild(dialog);
        dialog.showModal();
        console.log("Blood pressure measurement: " + progress.value);
    });
    const wrapper = document.createElement('div');
    wrapper.appendChild(progress);
    wrapper.appendChild(button);
    return wrapper;
}
// Overall card element for the story part
function createCardElement(storyPart, stepCounter) {
    const card = document.createElement('div');
    const cardTitle = document.createElement('p');
    cardTitle.className = "title";
    cardTitle.innerText = "Step " + stepCounter;
    card.appendChild(cardTitle);
    const content = document.createElement('p');
    content.innerText = storyPart.text;
    if (storyPart.variable && storyPart.variable == "blood_pressure") {
        // create an animated slider for blood pressure measurement
        const bloodPressureElement = createBloodPressureElement();
        content.appendChild(bloodPressureElement);
    }
    card.appendChild(content);
    // if storyPart.text contains "Flip a coin", add a coin icon
    if (storyPart.text.includes("Flip a coin")) {
        const coinWrapper = document.createElement('div');
        coinWrapper.className = "columns is-centered";
        const coin = document.createElement('i');
        coin.className = "nes-icon coin is-large";
        coinWrapper.appendChild(coin);
        card.appendChild(coinWrapper);
    }
    return card;
}
// Next step choice buttons
function createChoicesElement(storyPart, button) {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = "buttons is-centered";
    storyPart.choices.forEach((choice) => {
        const choiceButton = document.createElement('button');
        choiceButton.innerText = choice.text;
        choiceButton.className = "nes-btn is-primary";
        choiceButton.addEventListener('click', () => {
            currentStoryPart = choice.next;
            button.click(); // Trigger the next part of the story
        });
        buttonWrapper.appendChild(choiceButton);
    });
    return buttonWrapper;
}
function createAvatars(storyPart, button) {
    const avatarWrapper = document.createElement('div');
    const avatars = ["bulbasaur", "charmander", "kirby"];
    avatars.forEach((avatar) => {
        const avatarElement = document.createElement('i');
        avatarElement.className = "nes-" + avatar;
        avatarElement.style.fontSize = "3em";
        avatarElement.style.cursor = "pointer";
        avatarElement.style.margin = "0.3em";
        avatarElement.addEventListener('click', () => {
            currentStoryPart = storyPart.choices[avatars.indexOf(avatar)].next;
            button.click(); // Trigger the next part of the story
        });
        avatarWrapper.appendChild(avatarElement);
    });
    return avatarWrapper;
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
    restartButton.className = "nes-btn";
    restartButton.type = "button";
    restartButton.innerText = "Restart";
    restartButton.addEventListener('click', () => {
        currentStoryPart = 'start';
        modal.remove();
        window.location.reload();
    });
    modalContent.appendChild(restartButton);
    return modal;
}
function createInfoButton(storyPart) {
    // Create a button to display the info box
    // the button will be placed in the corner of the card
    const infoButton = document.createElement('button');
    infoButton.className = "nes-btn is-warning";
    infoButton.innerText = "info";
    infoButton.style.position = "absolute";
    infoButton.style.top = "0";
    infoButton.style.right = "0";
    infoButton.style.margin = "0.5em";
    infoButton.style.fontSize = "1em";
    infoButton.style.cursor = "pointer";
    infoButton.addEventListener('click', () => {
        const dialog = document.createElement('dialog');
        dialog.className = "nes-dialog";
        dialog.style.fontFamily = "Helvetica, sans-serif";
        dialog.id = "dialog-default";
        const form = document.createElement('form');
        form.method = "dialog";
        const title = document.createElement('p');
        title.className = "title";
        title.innerText = "Info";
        form.appendChild(title);
        const info = document.createElement('p');
        info.innerText = (storyPart.info) ? storyPart.info : "No info available";
        info.style.fontSize = "1.2em";
        form.appendChild(info);
        const menu = document.createElement('menu');
        menu.className = "dialog-menu";
        const cancelButton = document.createElement('button');
        cancelButton.className = "button is-warning";
        cancelButton.innerText = "Close";
        cancelButton.addEventListener('click', () => {
            dialog.close();
        });
        menu.appendChild(cancelButton);
        form.appendChild(menu);
        dialog.appendChild(form);
        document.body.appendChild(dialog);
        dialog.showModal();
    });
    return infoButton;
}
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hello, world!");
    const button = document.getElementById('changeTextButton');
    const dataElement = document.getElementById('dataDisplay');
    const restartButton = document.getElementById('restartButton');
    if (button && dataElement && restartButton) {
        // Add Bulma classes to the button
        //button.className = "nes-btn is-primary"
        //restartButton.className = "nes-btn is-error";
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
                else if (currentStoryPart === 'start') {
                    dataElement.innerHTML = ''; // clear previous content 
                    const card = createCardElement(storyPart, stepCounter);
                    dataElement.appendChild(card);
                    stepCounter++;
                    // Create buttons for the choices
                    const avatars = createAvatars(storyPart, button);
                    dataElement.appendChild(avatars);
                    const choicesElement = document.getElementById('choices');
                    if (choicesElement) {
                        choicesElement.innerHTML = ''; // Clear previous choices
                    }
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
                    if (storyPart.info) {
                        const infoButton = createInfoButton(storyPart);
                        dataElement.appendChild(infoButton);
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
