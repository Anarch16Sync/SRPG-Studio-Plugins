/* This plugin adds the Fixed Class growths as fixed stat increases on a player unit level up. 

Author: Anarch16Sync
*/

ExperienceControl._createGrowthArray = function(unit) {
    var i, n;
    var count = ParamGroup.getParameterCount();
    var growthArray = [];
    var weapon = ItemControl.getEquippedWeapon(unit);
    
    for (i = 0; i < count; i++) {
        // Calculate the growth value (or the growth rate).
        n = ParamGroup.getGrowthBonus(unit, i) + ParamGroup.getUnitTotalGrowthBonus(unit, i, weapon);
        
        // Set the rise value.
        growthArray[i] = this._getGrowthValue(n) + unit.getClass().getPrototypeInfo().getGrowthArray(unit.getLv());
    }
    
    return growthArray;
};