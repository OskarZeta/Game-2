class Item {
    constructor (name, icon, slot, type, parameters, requirements, description) {
        this.name = name;
        this.icon = icon;
        this.slot = slot;
        this.type = type;
        this.parameters = parameters;
        this.requirements = requirements;
        this.equipped = false;
        this.description = description;
    }
    renderSelf () {
        let item = document.createElement('div');
        item.innerHTML = this.icon;
        item.classList.add('info__inventory-item');
        this.item = item;
        return this.item;
    }
    setEquipped (state) {
        this.equipped = state;
    }
    isEquipped () {
        return this.equipped;
    }
    describeSelf () {
        let requirements = JSON.stringify(this.requirements);
        let parameters = JSON.stringify(this.parameters);
        const stringParsing = (target) => {
            target = target.slice(1, target.length-1);
            let regExpQuotes = new RegExp('"', 'g');
            let regExpColons = new RegExp(':', 'g');
            target = target.replace(regExpQuotes, ' ');
            target = target.replace(regExpColons, ' ');
            target = target.replace('max_health', 'maximum health');
            target = target.replace('dodgeChance', 'dodge chance');
            target = target.replace('critChance', 'critical chance');
            target = target.replace('current_health', 'current health');
            return target;
        };
        return `<strong>${this.name}</strong> <br> ${this.description} <br> requires: ${stringParsing(requirements)} <br> gives: ${stringParsing(parameters)}`;
    }
}
window.Item = Item;