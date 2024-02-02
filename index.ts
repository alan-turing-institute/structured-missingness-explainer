interface IChoice {
    text: string;
    next: string;
}

interface IStoryPart {
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


function createChoicesElement(storyPart: IStoryPart, button: HTMLElement): HTMLElement {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = "buttons";

    storyPart.choices.forEach((choice: { text: string, next: string }) => {
        const choiceButton = document.createElement('button');
        choiceButton.innerText = choice.text;
        choiceButton.className = "button is-link";
        choiceButton.addEventListener('click', () => {
            currentStoryPart = choice.next;
            button.click(); // Trigger the next part of the story
        });
        buttonWrapper.appendChild(choiceButton);
    });

    return buttonWrapper;
}


let currentStoryPart = 'start';


window.onload = async () => {
    
    const button = document.getElementById('changeTextButton');
    const dataElement = document.getElementById('dataDisplay');
    const restartButton = document.getElementById('restartButton');

    if (button && dataElement && restartButton) {
        // Add Bulma classes to the button
        button.className = "button is-primary"
        restartButton.className = "button is-danger is-rounded";

        let stepCounter = 1;

        button.addEventListener('click', async () => {
            try {
                // Fetch the story data, currently from a local JSON file
                // TODO: from a public GitHub repository
                const data = await fetchStory();

                // Display the current part of the story
                const storyPart: IStoryPart = data.story[currentStoryPart];

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

                stepCounter++;

                // Create buttons for the choices
                const choicesElement = document.getElementById('choices');
                if (choicesElement) {
                    choicesElement.innerHTML = ''; // Clear previous choices
            
                    const buttonWrapper = createChoicesElement(storyPart, button);
                    choicesElement.appendChild(buttonWrapper);
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