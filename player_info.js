const renderInventoryItem = (e) => {
    let target = e.target;
    const renderBodyPart = (bodyPart, inventoryItem, state) => {
        let cellName = '.info__player-item--' + bodyPart;
        let cell = document.querySelector(cellName);
        let itemWrapper = inventoryItem.parentNode;
        if (bodyPart == 'none') {
            let equippedItem = player.inventory.find((elem) => {
                return inventoryItem.isSameNode(elem.item);
            });
            player.interactWithItem(player.operateItem(equippedItem, 'equip'), 'drop');
            itemWrapper.remove();
            return;
        }
        if (state == 'equip') {
            if (cell.children.length > 0) {
                let equippedItem = player.inventory.find((elem) => {
                    return cell.children[0].isSameNode(elem.item);
                });
                player.operateItem(equippedItem, 'unequip');
                renderBodyPart(bodyPart, equippedItem.item, 'unequip');
            }
            itemWrapper.remove();
            cell.appendChild(inventoryItem);
        } else if (state == 'unequip') {
            let equippedItem = player.inventory.find((elem) => {
                return cell.children[0].isSameNode(elem.item);
            });
            inventoryItem.classList.remove('info__inventory-item--equipped');
            cell.removeChild(inventoryItem);
            let li = document.createElement('li');
            li.appendChild(inventoryItem);
            let inventoryList = document.querySelector('.info__inventory-list--'+equippedItem.type);
            inventoryList.appendChild(li);
        }
    };
    if (target.classList.contains('info__inventory-item')){
        let playerItem = player.inventory.find((elem) => {
            return target.isSameNode(elem.item);
        });
        if (playerItem.isEquipped()){
            player.operateItem(playerItem, 'unequip');
            renderBodyPart(playerItem.slot, playerItem.item, 'unequip');
        } else {
            let result = player.operateItem(playerItem, 'equip');
            if (typeof result == 'boolean'){
                target.style.backgroundColor = 'red';
                let fadeOutTime = 100;
                let colorTimeOut = setTimeout(() => {
                    target.style.backgroundColor = 'initial';
                    clearTimeout(colorTimeOut);
                }, fadeOutTime);
            } else if (typeof result == 'object'){
                renderBodyPart(playerItem.slot, playerItem.item, 'equip');
            }
            else {
                target.classList.add('info__inventory-item--equipped');
                renderBodyPart(playerItem.slot, playerItem.item, 'equip');
            }
        }
        renderInfo(false);
    }
};

const renderDescription = (e) => {
    let target = e.target;
    let descriptionNode = document.querySelector('.info__upper-item-description');
    if (e.type == 'mouseover') {
        if (target.classList.contains('info__inventory-item') ||
            (target.classList.contains('info__player-item')) && target.innerHTML !== '') {
            let inventoryItem = player.inventory.find((elem) => {
                return target.isSameNode(elem.item);
            });
            if (inventoryItem) {
                descriptionNode.innerHTML = inventoryItem.describeSelf();
            }
        }
        if (target.classList.contains('info__player-item') && target.innerHTML == ''){
            descriptionNode.innerHTML = `${target.classList[1].split('--')[1]} section`;
        }
        if (target.classList.contains('info__inventory-category')){
            target.classList.forEach((elem) => {
                let newElem = elem.split('--');
                if (newElem.length > 1) {
                    if (newElem[1] !== 'active'){
                        descriptionNode.innerHTML = `${newElem[1]} category`;
                    }
                }
            });
        }
    } else if (e.type == 'mouseout') {
        descriptionNode.innerHTML = '';
    }
};

document.querySelector('.info__upper').addEventListener('mouseover', renderDescription);
document.querySelector('.info__upper').addEventListener('mouseout', renderDescription);

const attrAdd = (e) => {
    let points = parseInt(document.querySelector('.info__points-number').innerHTML);
    if (e.target.classList.contains('info__attr-add') && points > 0){
        let number;
        let target = e.target;
        let attrName = [].find.call(target.classList, (className) => {
            return className.split('--').length > 1;
        });
        attrName = attrName.split('--')[1];
        number = parseInt(target.parentNode.querySelector('.info__attr-number').innerHTML);
        number++;
        player.removeLp(multipliers.LP_PER_LVL);
        player.updateSelf('main', attrName, number);
        renderInfo(false);
    }
};

document.querySelector('.info__attr-wrapper').addEventListener('click', attrAdd);

const renderInfo = (rerender) => {
    if (playerDead) {
        return;
    }
    let name = document.querySelector('.info__name');
    let strength = document.querySelector('.info__attr--strength .info__attr-number');
    let agility = document.querySelector('.info__attr--agility .info__attr-number');
    let speed = document.querySelector('.info__attr--speed .info__attr-number');
    let endurance = document.querySelector('.info__attr--endurance .info__attr-number');
    let exp = document.querySelector('.info__player-exp-number');
    let level = document.querySelector('.info__player-level-number');
    let hpCurrent = document.querySelector('.info__hp-current-number');
    let hpMax = document.querySelector('.info__hp-max-number');
    let hpMax2 = document.querySelector('.info__secondary-attr--max-health span');
    let initiative = document.querySelector('.info__secondary-attr--initiative span');
    let damage = document.querySelector('.info__secondary-attr--damage span');
    let crit = document.querySelector('.info__secondary-attr--crit span');
    let dodge = document.querySelector('.info__secondary-attr--dodge span');
    let resist = document.querySelector('.info__secondary-attr--resist span');
    let points = document.querySelector('.info__points-number');
    let attrAddBtns = document.querySelectorAll('.info__attr-add');
    name.innerHTML = player.name;
    strength.innerHTML = player.strength;
    agility.innerHTML = player.agility;
    speed.innerHTML = player.speed;
    endurance.innerHTML = player.endurance;
    points.innerHTML = player.lp;
    exp.innerHTML = `${player.exp}/${player.expToNextLevel}`;
    level.innerHTML = player.level;
    hpMax.innerHTML = player.max_health;
    hpMax2.innerHTML = player.max_health;
    initiative.innerHTML = player.initiative;
    damage.innerHTML = player.damage;
    crit.innerHTML = `${player.critChance} %`;
    dodge.innerHTML = `${player.dodgeChance} %`;
    resist.innerHTML = `${player.resistance} %`;
    if (player.lp > 0) {
        [].forEach.call(attrAddBtns, (btn) => {
            btn.classList.remove('hidden');
        });
    } else {
        [].forEach.call(attrAddBtns, (btn) => {
            btn.classList.add('hidden');
        });
    }
    function renderHealth() {
        if (playerDead) {
            return;
        }
        let healthBarOld = document.querySelector('.info__hp');
        let healthBarNew = document.querySelector('.info__hp-current');
        let length = parseInt(window.getComputedStyle(healthBarOld).getPropertyValue('height'));
        length *= player.getHealth()/player.max_health;
        healthBarNew.style.height = length;
        hpCurrent.innerHTML = player.getHealth();
    }
    renderHealth();
    let intervalHealth = setInterval(() => {
        renderHealth();
    }, multipliers.REGEN_SPEED);
    if (playerDead) {
        clearInterval(intervalHealth);
    }
    (function renderInventory() {
        if (!rerender) {
            return;
        }
        let inventory = document.querySelector('.info__inventory');
        let categoryWeapon = inventory.querySelector('.info__inventory-category--weapon');
        let categoryArmor = inventory.querySelector('.info__inventory-category--armor');
        let categoryHelp = inventory.querySelector('.info__inventory-category--help');
        let categoryActive = inventory.querySelector('.info__inventory-category--active');
        let categoryList;
        if (categoryWeapon.classList.contains('info__inventory-category--active')) {
            categoryList = inventory.querySelector('.info__inventory-list--weapon');
            categoryList.innerHTML = "";
        } else if (categoryArmor.classList.contains('info__inventory-category--active')) {
            categoryList = inventory.querySelector('.info__inventory-list--armor');
            categoryList.innerHTML = "";
        } else if (categoryHelp.classList.contains('info__inventory-category--active')) {
            categoryList = inventory.querySelector('.info__inventory-list--help');
            categoryList.innerHTML = "";
        }
        player.inventory.forEach((item) => {
            let categoryActiveName;
            let div = item.renderSelf();
            categoryActive.classList.forEach((className) => {
                let newElem = className.split('--');
                if (newElem.length > 1) {
                    if (newElem[1] !== 'active'){
                        categoryActiveName = newElem[1];
                    }
                }
            });
            if (item.isEquipped()){
                div.classList.add('info__inventory-item--equipped');
                let cellName = '.info__player-item--' + item.slot;
                let cell = document.querySelector(cellName);
                cell.innerHTML = "";
                cell.appendChild(div);
                return;
            }
            if (item.type == categoryActiveName){
                let li = document.createElement('li');
                li.appendChild(div);
                categoryList.appendChild(li).cloneNode();
            }
        });
    })();
    let container = document.querySelector('.info__upper-container');
    container.addEventListener('click', renderInventoryItem);
};

const toggleCategory = (e) => {
    let target = e.target;
    if (target.classList.contains('info__inventory-category') &&
        !target.classList.contains('info__inventory-category--active')){
        let categoryNames = target.parentNode.children;
        let inventoryNames = target.parentNode.parentNode.children;
        [].forEach.call(categoryNames, (child) => {
            child.classList.remove('info__inventory-category--active');
        });
        target.classList.add('info__inventory-category--active');
        [].forEach.call(inventoryNames, (child) => {
            if (child.classList.contains('info__inventory-list')){
                child.classList.remove('info__inventory-list--active');
                let name = [].find.call(target.classList, (className) => {
                    let classList = className.split('--');
                    if (classList.length > 1) {
                        if (classList[1] !== 'active'){
                            return classList[1];
                        }
                    }
                });
                name = 'info__inventory-list--' + name.split('--')[1];
                if (child.classList.contains(name)){
                    child.classList.add('info__inventory-list--active');
                }
            }
        });
        renderInfo(true);
    }
};

document.querySelector('.info__upper').addEventListener('click', toggleCategory);

const toggleInfo = (e) => {
    let info = document.querySelector('.info');
    let menu = document.querySelector('.main-menu-ingame');
    let interfaceBtn = document.querySelector('.interface__player');
    let menuBtn = document.querySelector('.interface__menu');
    let saveBtn = document.querySelector('.save-game');
    let quitBtn = document.querySelector('.quit-game');
    let intro = document.querySelector('.intro');
    if (e.which == 67 && !infoIsOpened && globalMap) {
        if (menuIsOpened){
            menuIsOpened = false;
            menu.classList.add('hidden');
            menu.style.display = 'none';
            menuBtn.classList.remove('interface--active');
            saveBtn.removeEventListener('click', saveGame);
            quitBtn.removeEventListener('click', quitGame);
        }
        infoIsOpened = true;
        info.classList.remove('hidden');
        info.style.display = 'flex';
        interfaceBtn.classList.add('interface--active');
        renderInfo(true);
    } else if (e.which == 67 && infoIsOpened && globalMap) {
        infoIsOpened = false;
        info.classList.add('hidden');
        info.style.display = 'none';
        interfaceBtn.classList.remove('interface--active');
    }
    if (e.which == 27 && !menuIsOpened && globalMap) {
        if (infoIsOpened){
            infoIsOpened = false;
            info.classList.add('hidden');
            info.style.display = 'none';
            interfaceBtn.classList.remove('interface--active');
        }
        menuIsOpened = true;
        menu.classList.remove('hidden');
        menu.style.display = 'flex';
        menuBtn.classList.add('interface--active');
        saveBtn.addEventListener('click', saveGame);
        quitBtn.addEventListener('click', quitGame);

    } else if (e.which == 27 && menuIsOpened && globalMap) {
        menuIsOpened = false;
        menu.classList.add('hidden');
        menu.style.display = 'none';
        menuBtn.classList.remove('interface--active');
        saveBtn.removeEventListener('click', saveGame);
        quitBtn.removeEventListener('click', quitGame);
    }
    if (e.which == 65 && !intro.classList.contains('hidden')) {
        intro.classList.add('hidden');
        intro.style.display = 'none';
        document.addEventListener('keydown', playerMovement);
    }
};

const closeInfoWhileInBattle = () => {
    let info = document.querySelector('.info');
    let interfaceBtn = document.querySelector('.interface__player');
    infoIsOpened = false;
    info.classList.add('hidden');
    info.style.display = 'none';
    interfaceBtn.classList.remove('interface--active');
};