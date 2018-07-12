//const renderLootDescription = (e) => {
    //if (target.classList.contains('info__inventory-item') ||
        //(target.classList.contains('info__player-item')) && target.innerHTML !== '') {
        //let inventoryItem = player.inventory.find((elem) => {
        //    return target.isSameNode(elem.item);
        //});
        //if (inventoryItem) {
        //    descriptionNode.innerHTML = inventoryItem.describeSelf();
        //}
    //}
    //if (target.classList.contains('info__player-item') && target.innerHTML == ''){
       //descriptionNode.innerHTML = `${target.classList[1].split('--')[1]} section`;
    //}
//};
const renderLoot = (inventory) => {
    let lootContainer = document.querySelector('.loot__container');
    let itemDisplay;
    let pickBtn = document.querySelector('.loot__pick-btn');
    let viewBtn = document.querySelector('.loot__view-btn');
    let description = document.querySelector('.loot__description');
    const clickLootItem = (that, item) => {
        description.innerHTML = item.describeSelf();
        pickBtn.classList.remove('hidden');
        viewBtn.classList.add('hidden');
        itemDisplay = that.querySelector('.info__inventory-item');
        let allItems = that.parentNode.querySelectorAll('li');
        [].forEach.call(allItems, (item) => {
            let activeItem = item.querySelector('.loot__item--active');
            if (activeItem) {
                activeItem.classList.remove('loot__item--active');
            }
        });
        itemDisplay.classList.add('loot__item--active');
    };
    inventory.forEach((item) => {
        let li = document.createElement('li');
        li.appendChild(item.renderSelf());
        li.addEventListener('click', function() {
            return clickLootItem(this, item);
        });
        lootContainer.appendChild(li).cloneNode();
    });
    const lootInteractions = (e) => {
        switch (e.which) {
            case 65 : {
                let itemToInteract = inventory.find((item) => {
                    return item.item.isSameNode(itemDisplay);
                });
                if (!itemToInteract){
                    return;
                }
                itemDisplay = undefined;
                description.innerHTML = '';
                pickBtn.classList.add('hidden');
                viewBtn.classList.remove('hidden');
                if (lootContainer.children.length < 2) {
                    pickBtn.classList.add('hidden');
                    viewBtn.classList.add('hidden');
                }
                player.interactWithItem(itemToInteract, 'pick');
                lootContainer.removeChild(itemToInteract.item.parentNode);
                break;
            }
            case 86 : {
                globalMap = true;
                hasAlreadyFired = false;
                regenActivate(player);
                let loot = document.querySelector('.loot');
                loot.classList.add('hidden');
                loot.style.display = 'none';
                document.removeEventListener('keydown', lootInteractions);
                break;
            }
        }
    };
    document.addEventListener('keydown', lootInteractions);
};
const showLootScreen = (inventory) => {
    let loot = document.querySelector('.loot');
    loot.classList.remove('hidden');
    loot.style.display = 'flex';
    renderLoot(inventory);
    loot.style.marginLeft = - parseInt(window.getComputedStyle(loot).getPropertyValue('width'))/2;
    loot.style.marginTop = - parseInt(window.getComputedStyle(loot).getPropertyValue('height'))/2;
};