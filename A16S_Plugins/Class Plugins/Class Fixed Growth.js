/* This plugin adds the Fixed Class growths that is set on the class prototype info as fixed stat increases on a player unit level up. 
This extra level up points are added to the normal level ups and to level ups that happen at the base.

How to use: Add into your plugin folder, set the desired Growth Settings under prototype info on the Class tab. 
Now player characters will gain the same stats as a enemy unit when level up plus their own personal growths.

Author: Anarch16Sync

Updates
2024-07-17: Added Support for O-to's EP & FP plugin, check that plugin readme for information on setting the class fixed growth custom paramters. 
*/
ExperienceControl._createClassGrowthArray = function(unit){
    var baseClassGrowth = unit.getClass().getPrototypeInfo().getGrowthArray(unit.getLv())
    var growthArray = [];
    growthArray = this._appendCustomClassGrowth(unit,baseClassGrowth)

    return growthArray
}

ExperienceControl._appendCustomClassGrowth = function(unit,growthArray){

    if(typeof UnitParameter.MEP !== 'undefined') {
        var plus = 0
        var aryPlusVal = OT_GetEPCustom(unit.getClass(), 'PrototypeGrowth');
        if(aryPlusVal !== null) {
            var nextLv = unit.getLv();
            if(typeof aryPlusVal[nextLv] === 'number') {
                plus = aryPlusVal[nextLv];
            }
        }
        growthArray.splice(ParamGroup.getParameterIndexFromType(ParamType.MEP), 0, plus);
    }

    if(typeof UnitParameter.MFP !== 'undefined') {
            var plus = 0
			var aryPlusVal = OT_GetFPCustom(unit.getClass(), 'PrototypeGrowth');
			if(aryPlusVal !== null) {
				var nextLv = unit.getLv();
				if(typeof aryPlusVal[nextLv] == 'number') {
					plus = aryPlusVal[nextLv];
				}
			}
			growthArray.splice(ParamGroup.getParameterIndexFromType(ParamType.MFP), 0, plus)
    }

    return growthArray
}

ExperienceControl._createGrowthArray = function(unit) {
    var i, n;
    var count = ParamGroup.getParameterCount();
    var growthArray = [];
    var weapon = ItemControl.getEquippedWeapon(unit);
    var classGrowth = this._createClassGrowthArray(unit);
    
    for (i = 0; i < count; i++) {
        // Calculate the growth value (or the growth rate).
        n = ParamGroup.getGrowthBonus(unit, i) + ParamGroup.getUnitTotalGrowthBonus(unit, i, weapon);
        
        // Set the rise value.
        growthArray[i] = this._getGrowthValue(n) + classGrowth[i];
    }
    
    return growthArray;
};

RestrictedExperienceControl.obtainExperience = function(unit, getExp) {
    var i, count, objectArray;
    var sum = 0;
    var growthArray = [];
    
    if (!ExperienceControl._addExperience(unit, getExp)) {
        return null;
    }

    var classGrowth = this._createClassGrowthArray(unit);
    
    objectArray = this._createObjectArray(unit);
    count = objectArray.length;
    for (i = 0; i < count; i++) {
        if (objectArray[i].value !== 0) {
            // Count the number of grown parameters.
            sum++;
        }
    }
    
    objectArray = this._sortObjectArray(objectArray, sum, unit);
    
    var BasegrowthArray = this._getGrowthArray(objectArray);
    
    count = ParamGroup.getParameterCount();
    for (i = 0; i < count; i++) {
        growthArray[i] = BasegrowthArray[i] + classGrowth[i]
    
    }

    return growthArray;
};