let cells = [];
let globalMap = true;
let infoIsOpened = false;
let menuIsOpened = false;
let player;
let isRunning = false;
let terminate = false;
let hasAlreadyFired = false;
let enemiesForThisLevel;
let playerDead = false;

function loadGameState() {
    let gameState;
    let playerParams = JSON.parse(localStorage.getItem('playerStats'));
    if (!localStorage.getItem('gameState')){
        let playerInventory = [
            new Item('rusty dagger', '〆', 'weapon', 'weapon', {
                'strength' : '+1',
                'max_health' : '+20',
                'damage' : '+10'
            }, {
                'strength' : 3,
                'level' : 1
            }, 'Very old and rusty dagger, filled with magic.'),
            new Item('leather armor', '▒', 'body', 'armor', {
                'agility' : '+1',
                'dodgeChance' : '+1.5'
            }, {
                'agility' : 1
            }, 'A simple light armor.'),
            new Item('rusty iron armor', '▓', 'body', 'armor', {
                'agility' : '-1',
                'resistance' : '+5'
            }, {
                'endurance' : 5
            }, 'Old and rusty iron armor.'),
            new Item('ring of regeneration', '◎', 'finger', 'armor', {
                'regen' : '+5'
            }, {
                'endurance' : 2
            }, 'This ring slowly heals wounds over time.'),
            new Item('weak potion of health', '✛', 'none', 'help', {
                'current_health' : '+30'
            }, {
                'level' : 1
            }, 'This potion can heal minor wounds.'),
            new Item('medium potion of health', '✚', 'none', 'help', {
                'current_health' : '+60'
            }, {
                'level' : 1
            }, 'This potion can heal medium wounds.')
        ];

        enemiesForThisLevel = enemiesSession.find((link) => {
            return link.levelName === levels[0].name;
        });

        enemiesForThisLevel = enemiesForThisLevel.enemies;

        gameState = {
            map: levels[0],
            entryPoint : {
                y: 140,
                x: 200
            },
            player: new Player(playerParams, playerInventory),
            enemies: enemiesForThisLevel
        };

        let enemiesRaw = gameState.enemies;
        gameState.enemies.forEach((enemy, index, array) => {
            if (enemiesRaw[index].inventory) {
                let inventoryRaw = enemiesRaw[index].inventory;
                let inventoryFinal = [];
                inventoryRaw.forEach((item) => {
                    inventoryFinal.push(new Item(
                        item.name,
                        item.icon,
                        item.slot,
                        item.type,
                        item.parameters,
                        item.requirements,
                        item.description
                        )
                    );
                });
                enemiesRaw[index].inventory = inventoryFinal;
            }
            array[index] = new Enemy(
                enemiesRaw[index].startTop,
                enemiesRaw[index].startLeft,
                enemiesRaw[index].name,
                {
                    strength: enemiesRaw[index].strength,
                    agility: enemiesRaw[index].agility,
                    speed: enemiesRaw[index].speed,
                    endurance: enemiesRaw[index].endurance
                },
                enemiesRaw[index].path,
                enemiesRaw[index].direction,
                enemiesRaw[index].exp,
                enemiesRaw[index].inventory
            );
        });
        enemiesForThisLevel = gameState.enemies.slice(0);
        localStorage.setItem('gameState', JSON.stringify(gameState));
    } else {
        gameState = JSON.parse(localStorage.getItem('gameState'));
        let inventoryRaw = gameState.player.inventory;
        let inventoryFinal = [];
        if (inventoryRaw.length > 0) {
            inventoryRaw.forEach((elem, index) => {
                inventoryFinal.push(new Item(
                    elem.name,
                    elem.icon,
                    elem.slot,
                    elem.type,
                    elem.parameters,
                    elem.requirements,
                    elem.description
                ));
                inventoryFinal[index].equipped = elem.equipped;
            });
        }
        let playerRaw = gameState.player;
        gameState.player = new Player({
            name: playerRaw.name,
            strength : playerRaw.strength,
            agility : playerRaw.agility,
            speed : playerRaw.speed,
            endurance : playerRaw.endurance
        }, inventoryFinal);
        let attributesMain = ['strength', 'agility', 'speed', 'endurance'];
        let attributesSecondary = ['damageModifier', 'initiativeModifier', 'max_healthModifier',
                                    'critChanceModifier', 'dodgeChanceModifier', 'resistanceModifier', 'regenModifier',
                                    'exp', 'level', 'lp', 'expToNextLevel'];

        attributesSecondary.forEach((attrName) => {
            gameState.player.updateSelf('secondary', attrName, playerRaw[attrName]);
        });
        attributesMain.forEach((attrName) => {
            gameState.player.updateSelf('main', attrName, playerRaw[attrName]);
        });
        gameState.player.current_health = playerRaw.current_health;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        let enemiesRaw = gameState.enemies;
        gameState.enemies.forEach((enemy, index, array) => {
            if (enemiesRaw[index].inventory) {
                inventoryRaw = enemiesRaw[index].inventory;
                let inventoryFinal = [];
                inventoryRaw.forEach((item, index) => {
                    inventoryFinal.push(new Item(
                            item.name,
                            item.icon,
                            item.slot,
                            item.type,
                            item.parameters,
                            item.requirements,
                            item.description
                        )
                    );
                });
                enemiesRaw[index].inventory = inventoryFinal;
            }
            array[index] = new Enemy(
                enemiesRaw[index].startTop,
                enemiesRaw[index].startLeft,
                enemiesRaw[index].name,
                {
                    strength: enemiesRaw[index].strength,
                    agility: enemiesRaw[index].agility,
                    speed: enemiesRaw[index].speed,
                    endurance: enemiesRaw[index].endurance
                },
                enemiesRaw[index].path,
                enemiesRaw[index].direction,
                enemiesRaw[index].exp,
                enemiesRaw[index].inventory
            );
        });
        enemiesForThisLevel = gameState.enemies.slice(0);
    }
    return gameState;
}

const renderMap = (map, startX, startY) => {
    let cells = [];
    let screen = document.querySelector('.screen__level-rendered');
    screen.innerHTML = '';
    [].forEach.call(map, (item) => {
        let cell;
        switch (item){
            case '=' :
                cell = new Cell('ground');
                break;
            case '⚍' :
                cell = new Cell('road');
                break;
            case '/' :
                cell = new Cell('grass');
                break;
            case '~' :
                cell = new Cell('water');
                break;
            case '_' :
                cell = new Cell('lava');
                break;
            case '^' : {
                cell = new Cell('rock');
                break;
            }
            case '⚶' : {
                cell = new Cell('tree');
                break;
            }
            case 'ᐱ' :
                cell = new Cell('roof');
                break;
            case '|' :
                cell = new Cell('wall');
                break;
            case '-' :
                cell = new Cell('house');
                break;
            case '+' :
                cell = new Cell('window');
                break;
            case '▊' :
                cell = new Cell('door');
                break;
            case 'o' :
                cell = new Cell('portal');
                break;
            default :
                break;
        }
        cell.renderSelf(startX, startY);
        cells.push(cell);
        if (startX < (parseInt(window.getComputedStyle(screen).getPropertyValue('width')) - enums.WIDTH)) {
            startX += enums.WIDTH;
        } else {
            startX = 0;
            if (startY < parseInt(window.getComputedStyle(screen).getPropertyValue('height')) - enums.HEIGHT) {
                startY += enums.HEIGHT;
            }
        }
    });
    return cells;
};

const checkCell = (direction, actor, actorEnvironment) => {
    let cell;
    switch (direction) {
        case 'left' :
            cell = actorEnvironment.find((elem) => {
                if (actor.getTop() - elem.getTop() == 0 &&
                    actor.getLeft() - elem.getLeft() == actor.getStep()) {
                    return true;
                }
            });
            break;
        case 'up' :
            cell = actorEnvironment.find((elem) => {
                if (actor.getTop() - elem.getTop() == actor.getStep() &&
                    actor.getLeft() - elem.getLeft() == 0) {
                    return true;
                }
            });
            break;
        case 'right' :
            cell = actorEnvironment.find((elem) => {
                if (actor.getTop() - elem.getTop() == 0 &&
                    actor.getLeft() - elem.getLeft() == -actor.getStep()) {
                    return true;
                }
            });
            break;
        case 'down' :
            cell = actorEnvironment.find((elem) => {
                if (actor.getTop() - elem.getTop() == -actor.getStep() &&
                    actor.getLeft() - elem.getLeft() == 0) {
                    return true;
                }
            });
            break;
        case 'self' :
            cell = actorEnvironment.find((elem) => {
                if (actor.getTop() - elem.getTop() == 0 &&
                    actor.getLeft() - elem.getLeft() == 0) {
                    return true;
                }
            });
            break;
    }
    return cell;
};

const showDefeatScreen = () => {
    document.removeEventListener('keydown', playerMovement);
    document.removeEventListener('keydown', toggleInfo);
    let screen = document.querySelector('.screen');
    screen.innerHTML = '';
    screen.innerHTML = '<video width="800" height="600" autoplay><source src="you_dead.mp4" type="video/mp4"></video>';
    setTimeout(() => {
        location.reload();
    }, 10000);
};
const showVictoryScreen = () => {
    document.removeEventListener('keydown', playerMovement);
    document.removeEventListener('keydown', toggleInfo);
    let victoryScreen = document.querySelector('.victory');
    victoryScreen.classList.remove('hidden');
    victoryScreen.style.display = 'flex';
    victoryScreen.style.marginLeft = - parseInt(window.getComputedStyle(victoryScreen).getPropertyValue('width'))/2;
    victoryScreen.style.marginTop = - parseInt(window.getComputedStyle(victoryScreen).getPropertyValue('height'))/2;
    document.addEventListener('keydown', (e) => {
        if (e.which == 65) {
            location.reload();
        }
    });
};

const battleInit = (player, enemy) => {
    globalMap = false;
    if (infoIsOpened) {
        closeInfoWhileInBattle();
    }
    enemy.setFighting(true);
    cells.forEach((cell) => {
        if (cell.getOccupied()) {
            cell.setUnoccupied();
        }
    });
    let playerVictory = false;

    let playerTurn = false;
    let battleScreen = document.querySelector('.screen__battle');
    let battleLog = document.querySelector('.screen__battle-log');
    let playerName = document.querySelector('.player-name');
    let enemyName = document.querySelector('.enemy-name');
    playerName.innerHTML = player.name;
    enemyName.innerHTML = enemy.name;
    let playerVisible = {
        attack: document.querySelector('.player-attack'),
        retreat: document.querySelector('.player-retreat'),
        celebrate_victory: document.querySelector('.player-win')
    };
    let enemyVisible = document.querySelector('.enemy-attack');
    let attacker;
    let defender;
    battleScreen.classList.remove('hidden');
    battleScreen.style.marginLeft = - parseInt(window.getComputedStyle(battleScreen).getPropertyValue('width'))/2;
    battleScreen.style.marginTop = - parseInt(window.getComputedStyle(battleScreen).getPropertyValue('height'))/2;
    battleLog.innerHTML = '';

    const showInterface = (state) => {
        if (state == 'player') {
            playerVisible.attack.classList.remove('hidden');
            playerVisible.retreat.classList.remove('hidden');
            playerVisible.celebrate_victory.classList.add('hidden');
            enemyVisible.classList.add('hidden');
            playerTurn = true;
        } else if (state == 'enemy') {
            playerVisible.attack.classList.add('hidden');
            playerVisible.retreat.classList.add('hidden');
            playerVisible.celebrate_victory.classList.add('hidden');
            enemyVisible.classList.remove('hidden');
            playerTurn = false;
        } else if (state == 'player_won') {
            playerVisible.attack.classList.add('hidden');
            playerVisible.retreat.classList.add('hidden');
            enemyVisible.classList.add('hidden');
            playerVisible.celebrate_victory.classList.remove('hidden');
            playerTurn = false;
        }
    };
    const renderHealth = (target) => {
        let healthBarOld;
        let healthBarNew;
        if (target instanceof Player) {
            healthBarOld = document.querySelector('.player-health');
            healthBarNew = document.querySelector('.player-health-current');
        } else if (target instanceof Enemy) {
            healthBarOld = document.querySelector('.enemy-health');
            healthBarNew = document.querySelector('.enemy-health-current');
        } else throw new Error('Wrong rendering target');
        let length = parseInt(window.getComputedStyle(healthBarOld).getPropertyValue('height'));
        length *= target.getHealth()/target.max_health;
        healthBarNew.style.height = length;
    };

    const scrollDown = (elem) => {
        elem.scrollTop = elem.scrollHeight;
    };

    const calculateDamage = (attacker, defender) => {
        let healthOld = defender.getHealth();
        let healthNew = healthOld;
        let damageTotal;
        if (Math.random() * 100 <= defender.dodgeChance) {
            battleLog.innerHTML = battleLog.innerHTML + `<div>${defender.name} избежал урона!</div>`;
            return;
        }
        if (Math.random() * 100 <= attacker.critChance) {
            damageTotal = parseInt(attacker.damage * enums.CRIT_MODIFIER - (attacker.damage * enums.CRIT_MODIFIER * defender.resistance)/100);
            healthNew = healthOld - damageTotal;
        } else {
            damageTotal = parseInt(attacker.damage - (attacker.damage * defender.resistance)/100);
            healthNew = healthOld - damageTotal;
        }
        defender.setHealth(healthNew);
        if (defender.getHealth() < 0) {
            defender.setHealth(0);
        }
        battleLog.innerHTML = battleLog.innerHTML + `<div>${attacker.name} нанёс ${damageTotal} урона! 
            У ${defender.name} осталось ${defender.getHealth()} HP.</div>`;
        renderHealth(defender);
    };
    renderHealth(player);
    renderHealth(enemy);
    if (player.initiative < enemy.initiative) {
        attacker = enemy;
        defender = player;
        calculateDamage(attacker, defender);
        if (player.getHealth() <= 0){
            playerDead = true;
            showDefeatScreen();
            return;
        }
        attacker = player;
        defender = enemy;
        showInterface('player');
    } else {
        attacker = player;
        defender = enemy;
        calculateDamage(attacker, defender);
        attacker = enemy;
        defender = player;
        showInterface('enemy');
        if (enemy.getHealth() <= 0){
            showInterface('player_won');
            playerVictory = true;
        }
    }
    const playerActions = (e) => {
        switch (e.which) {
            case 65 : {
                if (player.getHealth() > 0 && enemy.getHealth() > 0 && !playerVictory) {
                    if (attacker == player) {
                        showInterface('enemy');
                        calculateDamage(attacker, defender);
                        attacker = enemy;
                        defender = player;
                    } else {
                        showInterface('player');
                        calculateDamage(attacker, defender);
                        if (player.getHealth() <= 0) {
                            playerDead = true;
                            showDefeatScreen();
                        }
                        attacker = player;
                        defender = enemy;
                    }
                    if (enemy.getHealth() <= 0) {
                        showInterface('player_won');
                        playerVictory = true;
                    }
                    scrollDown(battleLog);
                }
                break;
            }
            case 86 : {
                if (playerVictory) {
                    battleScreen.classList.add('hidden');
                    player.addExp(enemy.exp);
                    if (enemy.inventory){
                        showLootScreen(enemy.inventory);
                    } else {
                        globalMap = true;
                        hasAlreadyFired = false;
                        regenActivate(player);
                    }
                    let enemyToRemove = enemiesForThisLevel.find((elem) => {
                        return elem === enemy;
                    });
                    enemiesForThisLevel.splice(enemiesForThisLevel.indexOf(enemyToRemove), 1);
                    let link = enemiesSession.find((link) => {
                        return link.levelName == gameState.map.name;
                    });
                    enemiesSession[enemiesSession.indexOf(link)].enemies = enemiesForThisLevel;
                    enemy.killSelf();
                    enemy = undefined;
                    document.removeEventListener('keydown', playerActions);
                    return;
                }
                break;
            }
            case 82 : {
                if (playerTurn && !playerVictory) {
                    globalMap = true;
                    battleScreen.classList.add('hidden');
                    player.killSelf();
                    player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
                    enemy.setFighting(false);
                    enemy.killSelf();
                    enemy.renderSelf();
                    enemyMovement(enemy, enemy.path, enemy.direction);
                    document.removeEventListener('keydown', playerActions);
                    hasAlreadyFired = false;
                    regenActivate(player);
                    return;
                }
                break;
            }
        }
    };
    document.addEventListener('keydown', playerActions);
};

const saveGame = () => {
    gameState.player = player;
    gameState.player.inventory = player.inventory;
    gameState.enemies = enemiesForThisLevel;
    enemiesGlobal = enemiesSession.slice(0);
    localStorage.setItem('gameState', JSON.stringify(gameState));
    localStorage.setItem('enemiesOnLevels', JSON.stringify(enemiesGlobal));
};

const quitGame = () => {
    location.reload();
};

const playerMovement = (e) => {
    if (!globalMap) {
        return;
    }
    let playerEnvironment = [].filter.call(cells, (elem) => {
        if ((Math.abs(player.getTop() - elem.getTop()) == player.getStep() ||
            Math.abs(player.getTop() - elem.getTop()) == 0) &&
            (Math.abs(player.getLeft() - elem.getLeft()) == player.getStep() ||
            Math.abs(player.getLeft() - elem.getLeft()) == 0)) {
                return true;
        }
    });
    let cell;
    let direction;
    switch (e.which) {
        case 37:
            cell = checkCell('left', player, playerEnvironment);
            direction = 'left';
            break;
        case 38:
            cell = checkCell('up', player, playerEnvironment);
            direction = 'up';
            break;
        case 39:
            cell = checkCell('right', player, playerEnvironment);
            direction = 'right';
            break;
        case 40:
            cell = checkCell('down', player, playerEnvironment);
            direction = 'down';
            break;
    }
    if (cell) {
        const changePlayerLocation = (cell, direction) => {
            let entries = cell.redirectLocation.exits;
            //console.log(entries);
            let mapToExit = gameState.map.name;
            let mapName = Object.keys(entries).find((property) => {
                return property === mapToExit
            });
            let cellEntered = cells[entries[mapName]];
            if (enemiesForThisLevel.length > 0) {
                enemiesForThisLevel.forEach((enemy) => {
                    enemy.killSelf();
                });
            }
            gameState.entryPoint.y = cellEntered.top;
            gameState.entryPoint.x = cellEntered.left;
            gameState.map = direction;

            enemiesForThisLevel = enemiesSession.find((link) => {
                return link.levelName === gameState.map.name;
            });

            enemiesForThisLevel = enemiesForThisLevel.enemies;
            gameState.enemies = enemiesForThisLevel;

            let enemiesRaw = gameState.enemies;
            let inventoryRaw = gameState.player.inventory;
            gameState.enemies.forEach((enemy, index, array) => {
                if (enemiesRaw[index].inventory) {
                    inventoryRaw = enemiesRaw[index].inventory;
                    let inventoryFinal = [];
                    inventoryRaw.forEach((item) => {
                        inventoryFinal.push(new Item(
                            item.name,
                            item.icon,
                            item.slot,
                            item.type,
                            item.parameters,
                            item.requirements,
                            item.description
                            )
                        );
                    });
                    enemiesRaw[index].inventory = inventoryFinal;
                }
                array[index] = new Enemy(
                    enemiesRaw[index].startTop,
                    enemiesRaw[index].startLeft,
                    enemiesRaw[index].name,
                    {
                        strength: enemiesRaw[index].strength,
                        agility: enemiesRaw[index].agility,
                        speed: enemiesRaw[index].speed,
                        endurance: enemiesRaw[index].endurance
                    },
                    enemiesRaw[index].path,
                    enemiesRaw[index].direction,
                    enemiesRaw[index].exp,
                    enemiesRaw[index].inventory
                );
            });
            renderEverything(gameState);
        };
        if (cell.redirectLocation){
            changePlayerLocation(cell, cell.redirectLocation);
            return;
        }
    }
    if (cell && cell.crossable) {
        let enemy = cell.getOccupied();
        if (enemy) {
            battleInit(player, enemy);
            return;
        }
        cell = checkCell('self', player, playerEnvironment);
        cell.setUnoccupied();
        player.move(direction);
        cell = checkCell('self', player, playerEnvironment);
        cell.setOccupied(player);
    }
};

const enemyMovement = (actor, range, course) => {
    if (playerDead) {
        return;
    }
    isRunning = true;
    let enemyEnvironment;
    let counter = 0;
    let cell;
    let direction;
    range *= 2;
    let interval = setInterval(() => {
        if (actor.getFighting() || terminate || playerDead){
            clearInterval(interval);
            return;
        }
        enemyEnvironment = [].filter.call(cells, (elem) => {
            if ((Math.abs(actor.getTop() - elem.getTop()) == actor.getStep() ||
                Math.abs(actor.getTop() - elem.getTop()) == 0) &&
                (Math.abs(actor.getLeft() - elem.getLeft()) == actor.getStep() ||
                Math.abs(actor.getLeft() - elem.getLeft()) == 0)) {
                return true;
            }
        });
        cell = checkCell('self', actor, enemyEnvironment);
        cell.setOccupied(actor);
        if (range == 0) {
            clearInterval(interval);
            return;
        }
        switch (course) {
            case 'ver' : {
                if (counter < range/2) {
                    direction = 'up';
                    counter++;
                } else if (counter >= range/2 && counter < range) {
                    direction = 'down';
                    counter++;
                } else {
                    counter = 0;
                    return;
                }
                break;
            }
            case 'hor' : {
                if (counter < range/2) {
                    direction = 'left';
                    counter++;
                } else if (counter >= range/2 && counter < range) {
                    direction = 'right';
                    counter++;
                } else {
                    counter = 0;
                    return;
                }
                break;
            }
        }
        cell = checkCell('self', actor, enemyEnvironment);
        cell.setUnoccupied();
        cell = checkCell(direction, actor, enemyEnvironment);
        if (cell && cell.crossable) {
            let player = cell.getOccupied();
            if (player) {
                battleInit(player, actor);
                return;
            }
            actor.move(direction);
            cell = checkCell('self', actor, enemyEnvironment);
            cell.setOccupied(actor);
        }
    }, enums.ENEMY_SPEED);
};

const regenActivate = (player) => {
    if (hasAlreadyFired || playerDead){
        return;
    } else {
        hasAlreadyFired = true;
    }
    let interval = setInterval(() => {
        if (!globalMap || playerDead){
            clearInterval(interval);
        } else {
            player.regenerationCycle();
        }
    }, multipliers.REGEN_SPEED);
};

const renderEverything = (gameState) => {
    cells = renderMap(gameState.map.content, 0, 0);
    player = gameState.player;
    regenActivate(player);
    if (player.player) {
        player.killSelf();
    }
    switch (gameState.map.name) {
        case 'map01' : {
            let toCaveEntrance = cells[gameState.map.exits.map02];//cells[359];
            toCaveEntrance.setRedirect(levels[1]);
            let toMountainsEntrance = cells[gameState.map.exits.map04];
            toMountainsEntrance.setRedirect(levels[3]);
            let toForest = cells[gameState.map.exits.map05];
            toForest.setRedirect(levels[4]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map02' : {
            let toHomeEntrance = cells[gameState.map.exits.map01];//cells[320];
            toHomeEntrance.setRedirect(levels[0]);
            let toShipEntrance = cells[gameState.map.exits.map03];
            toShipEntrance.setRedirect(levels[2]);
            let toDirtLord = cells[gameState.map.exits.map11];
            toDirtLord.setRedirect(levels[10]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map03' : {
            let toCaveEntrance = cells[gameState.map.exits.map02];
            toCaveEntrance.setRedirect(levels[1]);
            let toWaterLordEntrance = cells[gameState.map.exits.map06];
            toWaterLordEntrance.setRedirect(levels[5]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map04' : {
            let toHomeEntrance = cells[gameState.map.exits.map01];//cells[319];
            toHomeEntrance.setRedirect(levels[0]);
            let toStoneLordEntrance = cells[gameState.map.exits.map07];
            toStoneLordEntrance.setRedirect(levels[6]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map05' : {
            let toHomeEntrance = cells[gameState.map.exits.map01];//cells[319];
            toHomeEntrance.setRedirect(levels[0]);
            let toLavaEntrance = cells[gameState.map.exits.map08];
            toLavaEntrance.setRedirect(levels[7]);
            let toPortal = cells[gameState.map.exits.map10];
            toPortal.setRedirect(levels[9]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map06' : {
            let toShipEntrance = cells[gameState.map.exits.map03];
            toShipEntrance.setRedirect(levels[2]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map07' : {
            let toMountainsEntrance = cells[gameState.map.exits.map04];
            toMountainsEntrance.setRedirect(levels[3]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map08' : {
            let toForest = cells[gameState.map.exits.map05];
            toForest.setRedirect(levels[4]);
            let toFireLordEntrance = cells[gameState.map.exits.map09];
            toFireLordEntrance.setRedirect(levels[8]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map09' : {
            let toLavaEntrance = cells[gameState.map.exits.map08];
            toLavaEntrance.setRedirect(levels[7]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map10' : {
            let toForest = cells[gameState.map.exits.map05];
            toForest.setRedirect(levels[4]);
            const checkPortal = () => {
                let bossLeft = enemiesGlobal.map((link) => {
                    let boss = link.enemies.find((enemy) => {
                        return (enemy.name == 'waterlord' ||
                                enemy.name == 'firelord' ||
                                enemy.name == 'stonelord' ||
                                enemy.name == 'dirtlord');
                    });
                    if (boss) {
                        return boss;
                    }
                });
                bossLeft = bossLeft.filter((enemy) => {
                    return enemy !== undefined;
                });
                if (bossLeft.length > 0){
                    console.log('You must defeat all 4 elemental lords to open the portal!');
                } else {
                    let door = document.querySelector('.door');
                    let index = gameState.map.exits.portal_access;
                    door.classList.add('ground');
                    door.classList.remove('door');
                    door.innerHTML = '=';
                    cells[index].crossable = true;
                }
            };
            const checkVictory = () => {
                if (enemiesGlobal[enemiesGlobal.length-1].enemies.length == 0) {
                    showVictoryScreen();
                }
            };
            checkPortal();
            checkVictory();
            let toFinalBoss = cells[gameState.map.exits.map12];
            toFinalBoss.setRedirect(levels[11]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map11' : {
            let toCaveEntrance = cells[gameState.map.exits.map02];
            toCaveEntrance.setRedirect(levels[1]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
        case 'map12' : {
            let toPortal = cells[gameState.map.exits.map10];
            toPortal.setRedirect(levels[9]);
            player.renderSelf(gameState.entryPoint.y, gameState.entryPoint.x);
            break;
        }
    }
    document.addEventListener('keydown', toggleInfo);
    let enemies = eval(gameState.enemies);
    if (isRunning) {
        terminate = true;
        setTimeout(() => {
            terminate = false;
        }, 100);
    }
    if (enemies.length > 0){
        enemies.forEach((enemy) => {
            if (enemy.enemy) {
                enemy.killSelf();
            }
            enemy.renderSelf();
            enemyMovement(enemy, enemy.path, enemy.direction);
        });
    }
};