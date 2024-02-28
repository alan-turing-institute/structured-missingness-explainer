interface IChoice {
    text: string;
    next: string;
}

interface IStoryPart {
    variable?: string;
    text: string;
    choices: IChoice[];
}

interface IStory {
    [key: string]: IStoryPart;
}

interface IStoryData {
    story: IStory;
    // Include other properties of the JSON document as needed
}

async function fetchStory(): Promise<IStoryData> {
    const response = await fetch('data/demo_scenarios.json');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

function createBloodPressureElement(): HTMLElement {
    const slider = document.createElement('input');
    slider.type = "range";
    slider.min = "100";
    slider.max = "200";
    slider.value = "120";
    slider.className = "slider is-fullwidth is-large";

    let direction = 1;
    let value = 120;
    let animate = setInterval(function() {
        if (value >= 200) direction = -2;
        if (value <= 100) direction = 2;
        value += direction;
        slider.value = value.toString();
      }, 1);
    
    const button = document.createElement('button');
    button.className = "button is-primary is-large is-rounded"
    button.innerText = "Take measurement";
    button.addEventListener('click', () => {
        clearInterval(animate);
        console.log("Blood pressure measurement: " + slider.value);
    });

    const wrapper = document.createElement('div');
    wrapper.appendChild(slider);
    wrapper.appendChild(document.createElement('br'));
    wrapper.appendChild(button);

    return wrapper;
}



// Overall card element for the story part
function createCardElement(storyPart: IStoryPart, stepCounter: number): HTMLElement {
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

    if (storyPart.variable && storyPart.variable == "blood_pressure") {
        // create an animated slider for blood pressure measurement
        const bloodPressureElement = createBloodPressureElement();
        content.appendChild(bloodPressureElement);   
    }

    card.appendChild(cardHeader);
    card.appendChild(content);

    return card;
}

// Next step choice buttons
function createChoicesElement(storyPart: IStoryPart, button: HTMLElement): HTMLElement {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = "buttons is-centered";

    storyPart.choices.forEach((choice: { text: string, next: string }) => {
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

function createFinalModalElement(storyPart: IStoryPart, userChoices: boolean[]): HTMLElement {
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
    userChoices.forEach((choice: boolean) => {
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
let userChoices: boolean[] = [];
for (let i = 0; i < 11; i++) {
    userChoices.push(Math.random() >= 0.5);
}



window.onload = async () => {
    
    const button = document.getElementById('changeTextButton');
    const dataElement = document.getElementById('dataDisplay');
    const restartButton = document.getElementById('restartButton');

    if (button && dataElement && restartButton) {
        // Add Bulma classes to the button
        button.className = "button is-primary"
        restartButton.className = "button is-rounded is-large is-white";

        let stepCounter = 1;

        button.addEventListener('click', async () => {
            try {
                // Fetch the story data, currently from a local JSON file
                // TODO: from a public GitHub repository
                const data = await fetchStory();

                // Display the current part of the story
                const storyPart: IStoryPart = data.story[currentStoryPart];

                if (currentStoryPart === 'end') {
                    // display a modal
                    const modal = createFinalModalElement(storyPart, userChoices);
                    document.body.appendChild(modal);
                } else {

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
            } catch (error) {
                console.error('An error occurred while attempting to fetch the JSON file:', error);
            }
    });

        restartButton.addEventListener('click', () => {
            currentStoryPart = 'start';
            stepCounter = 1;
            button.click(); // Trigger the start of the story
        });

        // Trigger the start of the story
        button.click();
    }
};