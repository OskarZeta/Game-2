class Cell {
    constructor (type) {
        this.type = type;
    }
    setRedirect (redirect) {
        this.redirectLocation = redirect;
    }
    renderSelf (leftPos, topPos) {
        let screen = document.querySelector('.screen__level-rendered');
        let cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.width = enums.WIDTH;
        cell.style.height = enums.HEIGHT;
        cell.style.left = leftPos;
        cell.style.top = topPos;
        switch (this.type){
            case 'ground':
                cell.innerHTML = '<span>=</span>';
                cell.classList.add('ground');
                this.crossable = true;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'road':
                cell.innerHTML = '<span>⚍</span>';
                cell.classList.add('road');
                this.crossable = true;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'grass':
                cell.innerHTML = '<span>///</span>';
                cell.classList.add('grass');
                this.crossable = true;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'water':
                cell.innerHTML = '~';
                cell.classList.add('water');
                this.crossable = false;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'lava':
                cell.innerHTML = '~';
                cell.classList.add('lava');
                this.crossable = false;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'rock':
                cell.innerHTML = '^';
                cell.classList.add('rock');
                this.crossable = false;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'tree':
                cell.innerHTML = '⚶';
                cell.classList.add('tree');
                this.crossable = true;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'roof':
                cell.innerHTML = 'ᐱ';
                cell.classList.add('roof');
                this.crossable = false;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'wall':
                cell.innerHTML = '|';
                cell.classList.add('wall');
                this.crossable = false;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'house':
                cell.innerHTML = '-';
                cell.classList.add('house');
                this.crossable = false;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'window':
                cell.innerHTML = '+';
                cell.classList.add('window');
                this.crossable = false;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'door':
                cell.innerHTML = '▊';
                cell.classList.add('door');
                this.crossable = false;
                screen.appendChild(cell.cloneNode(true));
                break;
            case 'portal':
                cell.innerHTML = 'o';
                cell.classList.add('portal');
                this.crossable = true;
                screen.appendChild(cell.cloneNode(true));
                break;
            default: console.log('wrong cell type!');
        }
        this.left = leftPos;
        this.top = topPos;
        this.occupied = false;
        this.display = cell;
    }
    getLeft () {
        return this.left;
    }
    getTop () {
        return this.top;
    }
    checkCrossable () {
        return this.crossable;
    }
    getOccupied () {
        if (this.occupied) {
            return this.occupant;
        }
        return false;
    }
    setOccupied (actor) {
        this.occupied = true;
        this.occupant = actor;
    }
    setUnoccupied () {
        this.occupied = false;
        this.occupant = undefined;
    }
}

window.Cell = Cell;