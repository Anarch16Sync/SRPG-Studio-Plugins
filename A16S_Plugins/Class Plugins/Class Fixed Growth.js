/* This plugin adds the Fixed Class growths that is set on the class prototype info as fixed stat increases on a player unit level up. 

How to use: Add into your plugin folder, set the desired Growth Settings under prototype info on the Class tab. 
Now player characters will gain the same stats as a enemy unit when level up plus their own personal growths.

Author: Anarch16Sync
*/

ExperienceControl._createGrowthArray = function(unit) {
    var i, n;
    var count = ParamGroup.getParameterCount();
    var growthArray = [];
    var weapon = ItemControl.getEquippedWeapon(unit);
    var classGrowth = unit.getClass().getPrototypeInfo().getGrowthArray(unit.getLv());
    
    for (i = 0; i < count; i++) {
        // Calculate the growth value (or the growth rate).
        n = ParamGroup.getGrowthBonus(unit, i) + ParamGroup.getUnitTotalGrowthBonus(unit, i, weapon);
        
        // Set the rise value.
        growthArray[i] = this._getGrowthValue(n) + classGrowth[i];
    }
    
    return growthArray;
};