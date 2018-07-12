class Enemy {
    constructor (top, left, name, parameters, path, direction, exp, inventory) {
        this.step = enums.WIDTH;
        this.name = name;
        this.startTop = top;
        this.startLeft = left;
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
        this.path = path;
        this.direction = direction;
        this.exp = exp;
        this.inventory = inventory;
    }
    renderSelf () {
        let screen = document.querySelector('.screen__wrapper');
        let enemy = document.createElement('div');
        this.enemy = enemy;
        enemy.classList.add('enemy');
        switch (this.name) {
            case 'waterlord' :  {
                enemy.classList.add('waterlord');
                enemy.innerHTML = '✧';
                break;
            }
            case 'firelord' :  {
                enemy.classList.add('firelord');
                enemy.innerHTML = '☀';
                break;
            }
            case 'dirtlord' :  {
                enemy.classList.add('dirtlord');
                enemy.innerHTML = '⟱';
                break;
            }
            case 'stonelord' :  {
                enemy.classList.add('stonelord');
                enemy.innerHTML = '❒';
                break;
            }
            default : {
                enemy.innerHTML = 'ꑻ';
            }
        }
        enemy.style.width = enums.WIDTH;
        enemy.style.height = enums.HEIGHT;
        enemy.style.left = this.startLeft;
        enemy.style.top = this.startTop;
        screen.appendChild(enemy);
        this.left = enemy.offsetLeft;
        this.top = enemy.offsetTop;
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
        let vertical = parseInt(this.enemy.style.top);
        let horizontal = parseInt(this.enemy.style.left);
        switch (direction) {
            case 'up':
                if (vertical > 0) {
                    vertical -= this.step;
                    this.enemy.style.top = vertical;
                }
                break;
            case 'down':
                if (vertical < screenHeight - this.step) {
                    vertical += this.step;
                    this.enemy.style.top = vertical;
                }
                break;
            case 'left':
                if (horizontal > 0) {
                    horizontal -= this.step;
                    this.enemy.style.left = horizontal;
                }
                break;
            case 'right':
                if (horizontal < screenWidth - this.step) {
                    horizontal += this.step;
                    this.enemy.style.left = horizontal;
                }
                break;
        }
        this.left = this.enemy.offsetLeft;
        this.top = this.enemy.offsetTop;
    }
    killSelf () {
        this.enemy.remove();
    }
    getAttributes () {
        return {
            'max_health' : this.max_health,
            'initiative' : this.initiative,
            'damage' : this.damage,
            'crit_chance' : this.crit_chance,
            'dodge_chance' : this.dodge_chance,
            'resistance' : this.resistance
        };
    }
    getHealth () {
        return this.current_health;
    }
    setHealth (health) {
        this.current_health = health;
    }
    setFighting (state) {
        this.fighting = state;
    }
    getFighting () {
        return this.fighting;
    }
}

window.Enemy = Enemy;