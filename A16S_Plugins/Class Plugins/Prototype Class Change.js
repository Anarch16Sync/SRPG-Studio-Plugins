/*---------------------------------------------------------------------------------
 Prototype Class change

By using this plugin the stat increase that occurs during class change is determined by the Class Initial Settings, each stat that is below
the class initial value is raised to that value. 

Any Parameter Bonus of the class is added on top of this initial value correction.

To configure the inital stats of a class one first has to go to
Tools -> Options -> Data Tab
and check Enable Enemy Balance Adjustments

This doesn't affect class change by transformation.


Author: Anarch16Sync
2024-03-13 - I had a bad day so I created this plugin.
---------------------------------------------------------------------------------*/



ClassChangeEventCommand.mainEventCommand = function() {
    var count
    var mhpPrev = ParamBonus.getMhp(this._targetUnit);
    var prototypeArray = this._targetClass.getPrototypeInfo().getInitialArray();
    var paramcount = ParamGroup.getParameterCount();
    
    for (var index = 0; index < paramcount; index++) {
        if (this._targetUnit.getParamValue(index) < prototypeArray[index]) {
            this._targetUnit.setParamValue(index, prototypeArray[index]);
        }
    }

    Miscellaneous.changeClass(this._targetUnit, this._targetClass);
    Miscellaneous.changeHpBonus(this._targetUnit, mhpPrev);

    // Increase the number of class changed.
    count = this._targetUnit.getClassUpCount();
    this._targetUnit.setClassUpCount(count + 1);
};

MultiClassInfoWindow.setClass = function(classEntry) {
    if (this._animeRenderParam !== null) {
        this._animeRenderParam.alpha = 255;
    }
    else {
        this._unitRenderParam.alpha = 255;
    }

    var prototypeArray = classEntry.cls.getPrototypeInfo().getInitialArray();
    var paramcount = ParamGroup.getParameterCount();
    
    for (var index = 0; index < paramcount; index++) {
        if (this._unit.getParamValue(index) < prototypeArray[index]) {
            this._unit.setParamValue(index, prototypeArray[index]);
        }
    }
    
    Miscellaneous.changeClass(this._unit, classEntry.cls);
    this._unit.setHp(ParamBonus.getMhp(this._unit));
};

MultiClassParameterWindow.setBonusStatus = function(unit, targetClassEntry) {
    var i, bonusArray, bonusArrayTarget;
    var newBonusArray = [];
    var count = ParamGroup.getParameterCount();
    var prototypeArray = targetClassEntry.cls.getPrototypeInfo().getInitialArray();

    if (targetClassEntry.isChange) {
        bonusArray = this.getClassBonusArray(unit.getClass());
        bonusArrayTarget = this.getClassBonusArray(targetClassEntry.cls);
        for (i = 0; i < count; i++) {
            newBonusArray[i] = bonusArrayTarget[i] - bonusArray[i];
            if (unit.getParamValue(i) < prototypeArray[i]) {
                newBonusArray[i] += prototypeArray[i] - unit.getParamValue(i);
            }
        }
    }
    else {
        for (i = 0; i < count; i++) {
            newBonusArray[i] = 0;
        }
    }
    
    this._scrollbar.setStatusBonus(newBonusArray);
};

MetamorphozeScreen._prepareScreenMemberData = function(screenParam) {
    this._unit = screenParam.unit;
    this._isMapCall = screenParam.isMapCall;
    this._classInfoWindow = createWindowObject(MultiClassInfoWindow, this);
    this._classParameterWindow = createWindowObject(MetamorphozeClassParameterWindow, this);
    this._classSelectWindow = createWindowObject(MultiClassSelectWindow, this);
    this._infoWindow = createWindowObject(InfoWindow, this);
    this._questionWindow = createWindowObject(QuestionWindow, this);
    this._dynamicAnime = createObject(DynamicAnime);
    this._classEntryArray = null;
    this._currentIndex = 0;
    this._returnData = null;
};

var MetamorphozeClassParameterWindow = defineObject(MultiClassParameterWindow,
{
    setBonusStatus: function(unit, targetClassEntry) {
		var i, bonusArray, bonusArrayTarget;
		var newBonusArray = [];
		var count = ParamGroup.getParameterCount();
		
		if (targetClassEntry.isChange) {
			bonusArray = this.getClassBonusArray(unit.getClass());
			bonusArrayTarget = this.getClassBonusArray(targetClassEntry.cls);
			for (i = 0; i < count; i++) {
				newBonusArray[i] = bonusArrayTarget[i] - bonusArray[i];
			}
		}
		else {
			for (i = 0; i < count; i++) {
				newBonusArray[i] = 0;
			}
		}
		
		this._scrollbar.setStatusBonus(newBonusArray);
	}
}
);

