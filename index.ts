

interface IData {
    variable: string;
    value: boolean;
}

interface IChoice {
    text: string;
    next: string;
    data?: IData[];
}

interface IPaper {
    name: string;
    qr : string;
}

interface IStoryPart {
    variable?: string;
    text: string;
    choices?: IChoice[];
    info?: string; // contents of the info box
    style?: string; // summary or game
    title?: string;
    image?: string;
    papers?: IPaper[];
}

interface IStory {
    [key: string]: IStoryPart;
}

interface IVariable {
    id : string,
    name: string,
    display: boolean
}

interface IStoryData {
    story: IStory;
    variables: IVariable[]; // names of variables to be collected
}

// To store user data - can be indexed by a string (name of variable)
interface IUserCollectedData {
    [key: string]: boolean ;
}

// Initialise values
let userCollectedData: IUserCollectedData = {};
let currentStoryPart = 'diabetes';
let coinToss = 'heads';

// TODO: Change this, this is ugly and hard-coded and will not work in the long run!!!
// create an array of 11 elements (boolean) to store the user's choices and fill it 
// with random values for now
let userChoices: boolean[] = [];
for (let i = 0; i < 11; i++) {
    userChoices.push(Math.random() >= 0.5);
}



async function fetchStory(): Promise<IStoryData> {
    const response = await fetch('data/demo_scenarios_pokemon.json');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

function createBloodPressureElement(storyPart: IStoryPart, button: HTMLElement): HTMLElement {
    const progress = document.createElement('progress');
    progress.className = "nes-progress";
    progress.value = 140;
    progress.max = 200;

    let direction = 1;
    let value = 140;
    let animate = setInterval(function() {
        if (value >= 200) direction = -2;
        if (value <= 140) direction = 2;
        value += direction;
        progress.value = value;
      }, 1);

    const measureButton = document.createElement('button');
    measureButton.className = "nes-btn is-warning";
    measureButton.innerText = "Take measurement";
    measureButton.addEventListener('click', () => {
        clearInterval(animate);

        const dialog = document.createElement('dialog');
        dialog.className = "nes-dialog";
        dialog.id = "dialog-default";
        const form = document.createElement('form');
        form.method = "dialog";
        const title = document.createElement('p');
        title.className = "title";
        title.innerText = "Your systolic blood pressure is: " + progress.value;
        form.appendChild(title);
        const menu = document.createElement('menu');
        menu.className = "dialog-menu";
        const cancelButton = document.createElement('button');
        cancelButton.className = "nes-btn is-error";
        cancelButton.innerText = "Oh no!";
        cancelButton.addEventListener('click', () => {
            dialog.close();
            if (storyPart.choices) {
                                
                // Save user choices, if present
                if (storyPart.choices[0].data) {
                    storyPart.choices[0].data.forEach((data: IData) => {
                        userCollectedData[data.variable] = data.value;
                    });
                }
                currentStoryPart = storyPart.choices[0].next;
                button.click(); // Trigger the next part of the story

            }
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
    wrapper.appendChild(measureButton);

    return wrapper;

}



// Overall card element for the story part
function createCardElement(storyPart: IStoryPart, stepCounter: number, button: HTMLElement): HTMLElement {
    const card = document.createElement('div');

    const cardTitle = document.createElement('p');
    cardTitle.className = "title";
    if (storyPart.title) {
        cardTitle.innerText = storyPart.title;
    } else {
        cardTitle.innerText = "Step " + stepCounter;
    }
    card.appendChild(cardTitle);

    const content = document.createElement('p');
    content.innerText = storyPart.text;

    if (storyPart.variable && storyPart.variable == "blood_pressure") {
        // create an animated slider for blood pressure measurement
        const bloodPressureElement = createBloodPressureElement(storyPart, button);
        content.appendChild(bloodPressureElement);   
    }

    if (storyPart.image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.style.display = 'flex';
        imageWrapper.style.justifyContent = 'center';
        imageWrapper.style.alignItems = 'center';
    
        const image = document.createElement('img');
        image.src = storyPart.image;
        image.style.width = "200px";
        image.style.height = "auto";
    
        imageWrapper.appendChild(image);
        content.appendChild(imageWrapper);
    }

    card.appendChild(content);


    if (storyPart.variable && storyPart.variable.startsWith("coin")) {
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
function createChoicesElement(storyPart: IStoryPart, button: HTMLElement): HTMLElement {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = "buttons is-centered";

    if (storyPart.variable && storyPart.variable.startsWith("coin_flip")) {
        const coinButton = document.createElement('button');
        coinButton.innerText = "Toss a coin";
        coinButton.className = "nes-btn is-primary";
        coinButton.addEventListener('click', () => {

            // Create a modal showing result of a coin toss
            const coinModal = document.createElement('dialog');
            coinModal.className = "nes-dialog";
            coinModal.id = "dialog-default";
            const form = document.createElement('form');
            form.method = "dialog";
            const title = document.createElement('p');
            title.className = "title";
            title.innerText = "Coin toss";
            form.appendChild(title);

            // add a coin icon 
            const coin = document.createElement('i');
            coin.className = "nes-icon coin is-large is-centered";
            form.appendChild(coin);
            const info = document.createElement('p');

            // choose different probability for diabetes coin flip
            const probability = (storyPart.variable == 'coin_flip_diabetes')? 0.9 : 0.5;
            coinToss = (Math.random() >= probability) ? 'HEADS' : 'TAILS';

            let outcome = '';
            if (storyPart.variable == 'coin_flip_diabetes') {
                outcome = (coinToss == 'HEADS') ? 'diabetes' : 'no diabetes';
            } else if (storyPart.variable == 'coin_flip_organ_damage') {
                outcome = (coinToss == 'HEADS') ? 'organ damage' : 'no organ damage';
                
            }
            info.innerText = "The coin landed on: " + coinToss + " (" + outcome + ")";
            form.appendChild(info);

            const menu = document.createElement('menu');
            menu.className = "dialog-menu";
            const cancelButton = document.createElement('button');
            cancelButton.className = "nes-btn is-primary";
            cancelButton.innerText = "Next";
            cancelButton.addEventListener('click', () => {
                coinModal.close();
                if (storyPart.choices) {
                    currentStoryPart = storyPart.choices[coinToss == 'HEADS' ? 0 : 1].next;
                    button.click(); // Trigger the next part of the story
                }
            });
            menu.appendChild(cancelButton);
            form.appendChild(menu);
            coinModal.appendChild(form);
            document.body.appendChild(coinModal);
            coinModal.showModal();


            // coinToss = (Math.random() >= 0.9) ? 'heads' : 'tails';
            // currentStoryPart = storyPart.choices ? storyPart.choices[coinToss == 'heads' ? 0 : 1].next : "symptoms";
            // button.click(); // Trigger the next part of the story
        });
        buttonWrapper.appendChild(coinButton);

    } else if (storyPart.variable && storyPart.variable == "blood_pressure") {
        // do nothing
    } else {
        if (storyPart.choices) {
            storyPart.choices.forEach((choice: IChoice) => {
                const choiceButton = document.createElement('button');
                choiceButton.innerText = choice.text;
                if (storyPart.style && storyPart.style == "summary") {
                    choiceButton.className = "button is-primary";
                } else {
                    choiceButton.className = "nes-btn is-primary";
                }
                choiceButton.addEventListener('click', () => {

                    // Save user choices, if present
                    if (choice.data) {
                        choice.data.forEach((data: IData) => {
                            userCollectedData[data.variable] = data.value;
                        });
                    }

                    currentStoryPart = choice.next;
                    button.click(); // Trigger the next part of the story
                });
                buttonWrapper.appendChild(choiceButton);
            });
        }
    }

    // ugly and hacked together, but it should work for now
    if (storyPart.variable && storyPart.variable == "age") {
        // skip and go to the next part of the story directly
        if (userCollectedData["old"] ) {
            currentStoryPart = "age_over_40";
            button.click();
        } else {
            currentStoryPart = "age_under_40";
            button.click();
        }
    }
    return buttonWrapper;
}

function createAvatars(storyPart: IStoryPart, button:HTMLElement): HTMLElement {
    const avatarWrapper = document.createElement('div');

    const avatars = ["bulbasaur", "charmander", "squirtle"];
    avatars.forEach((avatar: string) => {
        const avatarElement = document.createElement('i');
        avatarElement.className = "nes-" + avatar;
        avatarElement.style.fontSize = "3em";
        avatarElement.style.margin = "0.3em";
        avatarElement.addEventListener('click', () => {
            currentStoryPart = storyPart.choices ? storyPart.choices[avatars.indexOf(avatar)].next : "symptoms";
            button.click(); // Trigger the next part of the story
        });
        avatarWrapper.appendChild(avatarElement);
    });

    return avatarWrapper;
}

function summariseCollectedData(variables: IVariable[], userCollectedData: IUserCollectedData): HTMLElement {   
    // create a bulma table with elements coloured black and red based on true/false
    const table = document.createElement('table');
    table.className = "table is-bordered is-striped is-narrow is-hoverable is-fullwidth";
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const th1 = document.createElement('th');
    th1.innerText = "Variable";
    const th2 = document.createElement('th');
    th2.innerText = "Value";
    tr.appendChild(th1);
    tr.appendChild(th2);
    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    variables.forEach((x: IVariable) => {
        if (x.display) {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.innerText = x.name;
            const td2 = document.createElement('td');
            if (userCollectedData[x.id] === undefined) {
                userCollectedData[x.id] = false;
            }            
            //td2.innerText = userCollectedData[x.id].toString();
            td2.innerText = (userCollectedData[x.id]) ? "✅" : "❌";
            // if (userCollectedData[x.id]) {
            //     td2.style.color = "black";
            // } else {
            //     td2.style.color = "red";
            // }
            tr.appendChild(td1);
            tr.appendChild(td2);
            tbody.appendChild(tr);
        }
    });

    table.appendChild(tbody);

    return table;
}

function createModalElement(variables: IVariable[], storyPart: IStoryPart, button: HTMLElement): HTMLElement {
    const modal = document.createElement('div');
    modal.className = "modal is-active is-large";
    modal.style.fontFamily = "Helvetica, sans-serif";

    const modalBackground = document.createElement('div');
    modalBackground.className = "modal-background";
    modal.appendChild(modalBackground);

    const modalContent = document.createElement('div');
    modalContent.className = "modal-content is-large";
    modalContent.style.width = "800px";

    const content = document.createElement('div');
    content.className = "box";

    const title = document.createElement('h1');
    title.className = "title is-2x";
    title.innerText = "Summary";
    content.appendChild(title);

    const text = document.createElement('p');
    text.innerText = storyPart.text;
    content.appendChild(text);

    modalContent.appendChild(content);
    modal.appendChild(modalContent);

    if (storyPart.variable && storyPart.variable == "collected_data") {
        const dataTable = summariseCollectedData(variables, userCollectedData);
        content.appendChild(dataTable);
    }

    if (storyPart.image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.style.display = 'flex';
        imageWrapper.style.justifyContent = 'center';
        imageWrapper.style.alignItems = 'center';
    
        const image = document.createElement('img');
        image.src = storyPart.image;
        image.style.width = "640px";
        image.style.height = "auto";
    
        imageWrapper.appendChild(image);
        content.appendChild(imageWrapper);
    }

    if (storyPart.papers) {
        const paperWrapper = document.createElement('div');

        storyPart.papers.forEach((paper : IPaper) => {
            const qr = document.createElement('img');
            qr.src = paper.qr;
            qr.style.width = "auto";
            qr.style.height = "auto";

            const name = document.createElement('h3');
            name.innerText = paper.name;

            paperWrapper.appendChild(name);
            paperWrapper.appendChild(qr);
        })

        content.appendChild(paperWrapper);
    }


    // Buttons for next steps
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = "buttons is-centered";
    
    if (storyPart.choices) {
        storyPart.choices.forEach((choice: { text: string, next: string }) => {
            const choiceButton = document.createElement('button');
            choiceButton.innerText = choice.text;
            if (storyPart.style && storyPart.style == "summary") {
                choiceButton.className = "button is-primary is-large";
            } else {
                choiceButton.className = "nes-btn is-primary";
            }
            choiceButton.addEventListener('click', () => {
                currentStoryPart = choice.next;
                button.click(); // Trigger the next part of the story
            });
            buttonWrapper.appendChild(choiceButton);
        });
    } else {
        // restart button
        const restartButton = document.createElement('button');
        restartButton.className = "button is-danger is-large";
        restartButton.type = "button";
        restartButton.innerText = "Restart";
        restartButton.addEventListener('click', () => {
            currentStoryPart = 'start';
            userCollectedData = {};
            modal.remove();
            window.location.reload();

        });
        buttonWrapper.appendChild(restartButton);
    }

    content.appendChild(buttonWrapper);
    
    const modalClose = document.createElement('button');
    modalClose.className = "modal-close is-large";
    modalClose.setAttribute('aria-label', 'close');
    modalClose.addEventListener('click', () => {
            currentStoryPart = 'start';
            userCollectedData = {};
            modal.remove();
            window.location.reload();
    });
    modal.appendChild(modalClose);

    return modal;
}

function createInfoButton(storyPart: IStoryPart): HTMLElement {
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


window.onload = async () => {
    
    console.log("Hello, world!");
    const button = document.getElementById('changeTextButton');
    const dataElement = document.getElementById('dataDisplay');
    const restartButton = document.getElementById('restartButton');

    if (button && dataElement && restartButton) {
        // Add Bulma classes to the button
        //button.className = "nes-btn is-primary"
        //restartButton.className = "nes-btn is-error";

        let stepCounter = 1;

        button.addEventListener('click', async () => {
            try {
                // Fetch the story data, currently from a local JSON file
                // TODO: from a public GitHub repository
                const data = await fetchStory();



                // Display the current part of the story
                const storyPart: IStoryPart = data.story[currentStoryPart];


                if (currentStoryPart === 'start') {
                    dataElement.innerHTML = ''; // clear previous content 

                    const card = createCardElement(storyPart, stepCounter, button);
                    dataElement.appendChild(card);

                    stepCounter++;

                    // Create buttons for the choices
                    const avatars = createAvatars(storyPart, button);         
                    dataElement.appendChild(avatars);

                    const choicesElement = document.getElementById('choices');
                    if (choicesElement) {
                        choicesElement.innerHTML = ''; // Clear previous choices
                    }

                } else {
                    
                    dataElement.innerHTML = ''; // clear previous content 

                    if (storyPart.style && storyPart.style == "summary") {
                        // serious style
                        const modal = createModalElement(data.variables, storyPart, button);
                        dataElement.appendChild(modal);
                    } else {

                        const card = createCardElement(storyPart, stepCounter, button);
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
            } catch (error) {
                console.error('An error occurred while attempting to fetch the JSON file:', error);
            }
    });

        restartButton.addEventListener('click', () => {
            currentStoryPart = 'start';
            userCollectedData = {};
            stepCounter = 1;
            button.click(); // Trigger the start of the story
        });

        // Trigger the start of the story
        button.click();
    }
};