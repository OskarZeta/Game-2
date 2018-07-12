let newGameBtn = document.querySelector('.new-game');
let loadGameBtn = document.querySelector('.load-game');
let nextBtn = document.querySelector('.next');
let instructionsBtn = document.querySelector('.instructions-btn');
let toMenuBtn = document.querySelector('.back-to-menu');
let parametersDiv = document.querySelector('.parameters');
let gameState;
let enemiesSession;
const showCharacterList = () => {
    let characterList = document.querySelector('.character-list');
    characterList.classList.remove('hidden');
    characterList.style.display = 'flex';
    characterList.style.marginLeft = -parseInt(window.getComputedStyle(characterList).getPropertyValue('width'))/2;
    characterList.style.marginTop = -parseInt(window.getComputedStyle(characterList).getPropertyValue('height'))/2;
};
const closeCharacterList = () => {
    let characterList = document.querySelector('.character-list');
    characterList.classList.add('hidden');
    characterList.style.display = 'none';
};
const closeInstructions = (e) => {
    if (e.which == 27) {
        let instructions = document.querySelector('.instructions');
        instructions.classList.add('hidden');
        instructions.style.display = 'none';
        document.removeEventListener('keydown', closeInstructions);
    }
};
const showInstructions = () => {
    let instructions = document.querySelector('.instructions');
    instructions.classList.remove('hidden');
    instructions.style.display = 'flex';
    instructions.style.marginLeft = - parseInt(window.getComputedStyle(instructions).getPropertyValue('width'))/2;
    instructions.style.marginTop = - parseInt(window.getComputedStyle(instructions).getPropertyValue('height'))/2;
    document.addEventListener('keydown', closeInstructions);
};

newGameBtn.addEventListener('click', showCharacterList);
toMenuBtn.addEventListener('click', closeCharacterList);
instructionsBtn.addEventListener('click', showInstructions);

function attributeChange (e) {
    let btnRise = this.querySelector('.parameter__increase');
    let btnLower = this.querySelector('.parameter__decrease');
    let attrField = this.querySelector('.parameter__index');
    let attrIndex = parseInt(attrField.innerHTML);
    let attrEmount = document.querySelector('.points');
    let attrPoints = parseInt(attrEmount.innerHTML);
    switch (e.target) {
        case btnRise : {
            if (attrPoints < 1) {
                break;
            }
            attrIndex++;
            attrPoints--;
            break;
        }
        case btnLower : {
            if (attrIndex < 2) {
                break;
            }
            attrIndex--;
            attrPoints++;
            break;
        }
    }
    attrField.innerHTML = attrIndex;
    attrEmount.innerHTML = attrPoints;
}

[].forEach.call(parametersDiv.childNodes, (elem) => {
    elem.addEventListener('click', attributeChange);
});

const characterCreation = (name, strength, agility, speed, endurance) => {
    let playerStats = {
        name: name,
        strength : strength,
        agility : agility,
        speed : speed,
        endurance : endurance
    };
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
};
const closeMenuAndRenderGame = () => {
    document.querySelector('body').classList.remove('.body--main-menu');
    document.querySelector('.main-menu').classList.add('hidden');
    document.querySelector('.screen').classList.remove('hidden');
    enemiesSession = enemiesGlobal.slice(0);
    gameState = loadGameState();
    renderEverything(gameState);
    nextBtn.removeEventListener('click', newGame);
    loadGameBtn.removeEventListener('click', loadGame);
    newGameBtn.removeEventListener('click', showCharacterList);
    toMenuBtn.removeEventListener('click', closeCharacterList);
};
const newGame = (e) => {
    let name = document.querySelector('.name-input').value.trim();
    let strength = parseInt(document.querySelector('.strength').innerHTML);
    let agility = parseInt(document.querySelector('.agility').innerHTML);
    let speed = parseInt(document.querySelector('.speed').innerHTML);
    let endurance = parseInt(document.querySelector('.endurance').innerHTML);
    let points = parseInt(document.querySelector('.points').innerHTML);
    if (points != 0) {
        e.preventDefault();
        alert('You must use all remaining points to proceed');
        return;
    }
    if (name.length < 1) {
        e.preventDefault();
        alert('You must name your character');
        return;
    }
    characterCreation(name, strength, agility, speed, endurance);
    localStorage.removeItem('gameState');
    localStorage.removeItem('enemiesOnLevels');
    enemiesGlobal = setAllEnemies();
    closeMenuAndRenderGame();
    let intro = document.querySelector('.intro');
    intro.classList.remove('hidden');
    intro.style.display = 'flex';
    intro.style.marginLeft = - parseInt(window.getComputedStyle(intro).getPropertyValue('width'))/2;
    intro.style.marginTop = - parseInt(window.getComputedStyle(intro).getPropertyValue('height'))/2;
};
nextBtn.addEventListener('click', newGame);

const loadGame = () => {
    if (localStorage.getItem('gameState')) {
        closeMenuAndRenderGame();
        document.addEventListener('keydown', playerMovement);
    } else {
        alert('No save game available!');
    }
};
loadGameBtn.addEventListener('click', loadGame);