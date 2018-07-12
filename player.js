class Player {
    constructor (parameters, inventory) {
        this.step = enums.WIDTH;
        this.name = parameters.name;
        this.strength = parameters.strength;
        this.agility = parameters.agility;
        this.speed = parameters.speed;
        this.endurance = parameters.endurance;
        this.damage = this.strength * multipliers.STR_TO_DAM + this.agility * multipliers.AGI_TO_DAM;
        this.initiative = this.agility * multipliers.AGI_TO_INIT + this.speed * multipliers.SPD_TO_INIT;
        this.max_health = this.strength * multipliers.SRT_TO_HP + this.endurance * multipliers.END_TO_HP;
        this.current_health = this.max_health;
        this.critChance = this.agility * multipliers.AGI_TO_CRIT;
        this.dodgeChance = this.speed * multipliers.SPD_TO_DODGE;
        this.resistance = this.endurance * multipliers.END_TO_DEF;
        this.regen = this.endurance;
        this.damageModifier = 0;
        this.initiativeModifier = 0;
        this.max_healthModifier = 0;
        this.critChanceModifier = 0;
        this.dodgeChanceModifier = 0;
        this.resistanceModifier = 0;
        this.regenModifier = 0;
        this.exp = 0;
        this.level = 1;
        this.lp = 0;
        this.expToNextLevel = enums.LEVEL_UP_BASE + (enums.LEVEL_UP_BASE * (this.level - 1) * (this.level * 1.5));
        if (Array.isArray(inventory)) {
            this.inventory = inventory;
        } else this.inventory = [];
    }
    renderSelf (top, left) {
        let screen = document.querySelector('.screen__wrapper');
        let player = document.createElement('div');
        this.player = player;
        player.classList.add('player');
        player.innerHTML = '〠';
        player.style.width = enums.WIDTH;
        player.style.height = enums.HEIGHT;
        this.startTop = top;
        this.startLeft = left;
        player.style.left = this.startLeft;
        player.style.top = this.startTop;
        screen.appendChild(player);
        this.left = player.offsetLeft;
        this.top = player.offsetTop;
    }
    updateSelf (attributesType, parameterName, parameterValue) {
        if (attributesType == 'main') {
            // this.damage = this.strength * multipliers.STR_TO_DAM + this.agility * multipliers.AGI_TO_DAM;
            // this.initiative = this.agility * multipliers.AGI_TO_INIT + this.speed * multipliers.SPD_TO_INIT;
            // this.max_health = this.strength * multipliers.SRT_TO_HP + this.endurance * multipliers.END_TO_HP;
            // //this.current_health = this.max_health;
            // this.critChance = this.agility * multipliers.AGI_TO_CRIT;
            // this.dodgeChance = this.speed * multipliers.SPD_TO_DODGE;
            // this.resistance = this.endurance * multipliers.END_TO_DEF;
            this[parameterName] = parameterValue;
            switch (parameterName) {
                case 'strength' : {
                    this.damage = this.strength * multipliers.STR_TO_DAM + this.agility * multipliers.AGI_TO_DAM + this.damageModifier;
                    this.max_health = this.strength * multipliers.SRT_TO_HP + this.endurance * multipliers.END_TO_HP + this.max_healthModifier;
                    break;
                }
                case 'agility' : {
                    this.damage = this.strength * multipliers.STR_TO_DAM + this.agility * multipliers.AGI_TO_DAM + this.damageModifier;
                    this.initiative = this.agility * multipliers.AGI_TO_INIT + this.speed * multipliers.SPD_TO_INIT + this.initiativeModifier;
                    this.critChance = this.agility * multipliers.AGI_TO_CRIT + this.critChanceModifier;
                    break;
                }
                case 'speed' : {
                    this.initiative = this.agility * multipliers.AGI_TO_INIT + this.speed * multipliers.SPD_TO_INIT + this.initiativeModifier;
                    this.dodgeChance = this.speed * multipliers.SPD_TO_DODGE + this.dodgeChanceModifier;
                    break;
                }
                case 'endurance' : {
                    this.max_health = this.strength * multipliers.SRT_TO_HP + this.endurance * multipliers.END_TO_HP + this.max_healthModifier;
                    this.resistance = this.endurance * multipliers.END_TO_DEF + this.resistanceModifier;
                    this.regen = this.endurance + this.regenModifier;
                }
            }
        } else if (attributesType == 'secondary') {
            this[parameterName] = parameterValue;
        }
        if (this.current_health > this.max_health) {
           this.current_health = this.max_health;
        }
    }
    operateItem (item, state) {
        let parameters = item.parameters;
        let value;
        let keys = Object.keys(parameters);
        if (item.type != 'help'){
            if (state == 'equip' && !item.isEquipped()) {
                let keys = Object.keys(item.requirements);
                let parameterName;
                let filteredKeys = keys.filter((parameter) => {
                    parameterName = parameter;
                    return (this[parameter] < item.requirements[parameter]); //{
                });
                if (filteredKeys.length > 0) {
                    console.log(`not enough ${parameterName}!`);
                    return true;
                } else {
                    item.setEquipped(true);
                }
            } else if (state == 'unequip' && item.equipped) {
                item.setEquipped(false);
                keys = keys.reverse();
            }
            keys.forEach((parameter) => {
                if (state == 'equip') {
                    value = parameters[parameter];
                } else if (state == 'unequip') {
                    if (parameters[parameter].split('+').length < 2) {
                        value = '+' + parameters[parameter].split('-')[1];
                    } else {
                        value = '-' + parameters[parameter].split('+')[1];
                    }
                }
                let parameterEvaluated;
                if (parameter == 'strength' ||
                    parameter == 'agility' ||
                    parameter == 'speed' ||
                    parameter == 'endurance') {
                    parameterEvaluated = eval(this[parameter].toString() + value);
                    this.updateSelf('main', parameter, parameterEvaluated);
                } else if (parameter == 'damage' ||
                    parameter == 'initiative' ||
                    parameter == 'max_health' ||
                    //parameter == 'current_health' ||
                    parameter == 'critChance' ||
                    parameter == 'dodgeChance' ||
                    parameter == 'resistance' ||
                    parameter == 'regen') {
                    let modifier = parameter + 'Modifier';
                    parameterEvaluated = eval(this[parameter].toString() + value);
                    this[modifier] = eval(this[modifier] + value);
                    this.updateSelf('secondary', parameter, parameterEvaluated);
                }
                //else if (parameter == 'current_health') {
                //     this.setHealth(eval(this[parameter].toString() + value));
                //     item = undefined;
                // }
            });
        } else {
            if (state == 'equip') {
                if (keys[0] == 'current_health') {
                    value = parameters[keys[0]];
                    this.setHealth(eval(this.current_health.toString() + value));
                    //item = undefined;
                    return item;
                }
            }
        }
    }
    interactWithItem (item, state) {
        if (state == 'pick') {
            this.inventory.push(item);
        } else if (state == 'drop') {
            let itemToDrop = this.inventory.find((playerItem) => {
                return playerItem === item;
            });
            let index = this.inventory.indexOf(itemToDrop);
            this.inventory.splice(index, 1);
        }
    }
    getMaxHealth () {
        return this.max_health;
    }
    killSelf () {
        this.player.remove();
    }
    getLeft () {
        return this.left;
    }
    getTop () {
        return this.top;
    }
    getStep () {
        return this.step;
    }
    move (direction) {
        let screen = document.querySelector('.screen__wrapper');
        let screenWidth = parseInt(window.getComputedStyle(screen).getPropertyValue('width'));
        let screenHeight = parseInt(window.getComputedStyle(screen).getPropertyValue('height'));
        let playerVertical = parseInt(this.player.style.top);
        let playerHorizontal = parseInt(this.player.style.left);
        switch (direction) {
            case 'up':
                if (playerVertical > 0) {
                    playerVertical -= this.step;
                    this.player.style.top = playerVertical;
                }
                break;
            case 'down':
                if (playerVertical < screenHeight - this.step) {
                    playerVertical += this.step;
                    this.player.style.top = playerVertical;
                }
                break;
            case 'left':
                if (playerHorizontal > 0) {
                    playerHorizontal -= this.step;
                    this.player.style.left = playerHorizontal;
                }
                break;
            case 'right':
                if (playerHorizontal < screenWidth - this.step) {
                    playerHorizontal += this.step;
                    this.player.style.left = playerHorizontal;
                }
                break;
        }
        this.left = this.player.offsetLeft;
        this.top = this.player.offsetTop;
    }
    getAttributes () {
        return {
            'max_health' : this.max_health,
            'initiative' : this.initiative,
            'damage' : this.damage,
            'crit_chance' : this.crit_chance,
            'dodge_chance' : this.dodge_chance,
            'resistance' : this.resistance,
            'regen' :this.regen
        };
    }
    getHealth () {
        return this.current_health;
    }
    setHealth (health) {
        if (health > this.max_health){
            this.current_health = this.max_health;
        } else {
            this.current_health = health;
        }
    }
    regenerationCycle () {
        if (!(this.current_health == this.max_health)){
            this.setHealth(this.getHealth() + this.regen);
        }
    }
    addExp (exp) {
        this.exp += exp;
        if (this.exp >= this.expToNextLevel){
            this.level++;
            this.addLp(multipliers.LP_PER_LVL);
        }
        this.expToNextLevel = enums.LEVEL_UP_BASE + (enums.LEVEL_UP_BASE * (this.level - 1) * (this.level * 1.5));
    }
    addLp (lp) {
        this.lp += lp;
    }
    removeLp (lp) {
        if (this.lp == 0) {
            return;
        }
        this.lp -= lp;
    }
}

window.Player = Player;