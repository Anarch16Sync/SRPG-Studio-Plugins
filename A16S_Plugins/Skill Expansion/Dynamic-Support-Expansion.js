/*
Dynamic-Support-Expansion
Author: Anarch16sync

This Plugin adds the ability to set dynamic support bonus on Skills.
these dynamic bonus is created by using a function(unit,targetunit, skill) in the corresponding custom parameter object.

A Full Example is provided bellow:
{
	supportRange: function(unit,skill){
		return unit.getLv()
	},
	supportFilter: UnitFilterFlag.PLAYER | UnitFilterFlag.ALLY | UnitFilterFlag.ENEMY,
	supportStatus:{
		getPower:function(unit,targetUnit,skill){
			return 0;
		},
		getDefense:function(unit,targetUnit,skill){
			return 0;
		},
		getHit:function(unit,targetUnit,skill){
			return 0;
		},
		getAvoid:function(unit,targetUnit,skill){
			return 0;
		},
		getCritical:function(unit,targetUnit,skill){
			return 0;
		},
		getCriticalAvoid:function(unit,targetUnit,skill){
			return 0;
		},
		getAgility:function(unit,targetUnit,skill){
			return 0;
		},
		getMove:function(unit,targetUnit,skill){
			return 0;
		}
	}	
}

supportRange: allows to set a dynamic range for the support skill, in this example the range increases with the unit level.
supportFilter: This allows to expand the targets of the support skills, this follow the convention of items, so PLAYER means in the same army, ENEMY means in the opposing army, and ALLY means green units.

supportStatus: this is the object that allows to set dynamic bonus on the support values, appart from the default values, funcionality for Agility and Move effects has been added, so a support skill that gives +2 Agi or +1 Mv is possible.

**NOTICE BE CAREFUL WITH YOUR FUNCTIONS**
There is a lot of things that can cause recursive errors and infinite loops,
this tend to crash with out of memory or out of stack errors.

Also this modifies how rounds are calculated in various places to better use avalible totalStatus objects and avoid creating them extra times, so compatibility with plugins that affect Round count is low.
*/

//New SupportSkillControl object to handle default and custom behavior
var SupportSkillControl ={
	getRange: function(unit,skill){
		var supportRange;
		if (typeof skill.custom.supportRange !== 'undefined'){
			supportRange = skill.custom.supportRange
			if(typeof supportRange == "number"){
				return supportRange;
			}
			if(typeof supportRange == "function"){
				return supportRange(unit,skill);
			}
		}
		return skill.getRangeValue()
	},

	getSupportSkillStatus: function(unit,targetUnit,skill){
		var supportCustomSkillStatus;
		var supportStatus = skill.getSupportStatus();
		if (typeof skill.custom.supportStatus !== 'undefined'){
			supportCustomSkillStatus = skill.custom.supportStatus;
			return this._getSkillCustomStatusInternal(unit,targetUnit,skill,supportStatus,supportCustomSkillStatus)
		}
		return this._getSkillStatusInternal(supportStatus)
	},

	_getSkillStatusInternal: function(supportStatus){
		var supportSkillStatus = {}
		supportSkillStatus.power = supportStatus.getPower();
		supportSkillStatus.defense = supportStatus.getDefense();
		supportSkillStatus.hit = supportStatus.getHit();
		supportSkillStatus.avoid = supportStatus.getAvoid();
		supportSkillStatus.critical = supportStatus.getCritical();
		supportSkillStatus.criticalAvoid = supportStatus.getCriticalAvoid();
		supportSkillStatus.agility = 0;
		supportSkillStatus.move = 0;
		return supportSkillStatus
	},

	_getSkillCustomStatusInternal: function(unit,targetUnit,skill,supportStatus,supportCustomSkillStatus){
		var supportSkillStatus = {}
		if(typeof supportCustomSkillStatus.getPower == 'undefined'){
			supportSkillStatus.power = supportStatus.getPower();
		}else{
			supportSkillStatus.power = supportCustomSkillStatus.getPower(unit,targetUnit,skill);
		}

		if(typeof supportCustomSkillStatus.getDefense == 'undefined'){
			supportSkillStatus.defense = supportStatus.getDefense();
		}else{
			supportSkillStatus.defense = supportCustomSkillStatus.getDefense(unit,targetUnit,skill);
		}

		if(typeof supportCustomSkillStatus.getHit == 'undefined'){
			supportSkillStatus.hit = supportStatus.getHit();
		}else{
			supportSkillStatus.hit = supportCustomSkillStatus.getHit(unit,targetUnit,skill);
		}

		if(typeof supportCustomSkillStatus.getAvoid == 'undefined'){
			supportSkillStatus.avoid = supportStatus.getAvoid();
		}else{
			supportSkillStatus.avoid = supportCustomSkillStatus.getAvoid(unit,targetUnit,skill);
		}

		if(typeof supportCustomSkillStatus.getCritical == 'undefined'){
			supportSkillStatus.critical = supportStatus.getCritical();
		}else{
			supportSkillStatus.critical = supportCustomSkillStatus.getCritical(unit,targetUnit,skill);
		}

		if(typeof supportCustomSkillStatus.getCriticalAvoid == 'undefined'){
			supportSkillStatus.criticalAvoid = supportStatus.getCriticalAvoid();
		}else{
			supportSkillStatus.criticalAvoid = supportCustomSkillStatus.getCriticalAvoid(unit,targetUnit,skill);
		}
		
		if(typeof supportCustomSkillStatus.getAgility == 'undefined'){
			supportSkillStatus.agility = 0;
		}else{
			supportSkillStatus.agility = supportCustomSkillStatus.getAgility(unit,targetUnit,skill);
		}
		
		if(typeof supportCustomSkillStatus.getMove == 'undefined'){
			supportSkillStatus.move = 0;
		}else{
			supportSkillStatus.move = supportCustomSkillStatus.getMove(unit,targetUnit,skill);
		}
		
		return supportSkillStatus
	}
}

//Now takes support Agility into account and totalStatus as input
Calculator.calculateRoundCount = function(active, passive, weapon,activeTotalStatus,passiveTotalStatus) {
		var activeAgi;
		var passiveAgi;
		var value;
		
		if (!this.isRoundAttackAllowed(active, passive)) {
			return 1;
		}
		
		activeAgi = AbilityCalculator.getAgility(active, weapon) + this.getAgilityPlus(active, passive, weapon, activeTotalStatus);
		passiveAgi = AbilityCalculator.getAgility(passive, ItemControl.getEquippedWeapon(passive)) + this.getAgilityPlus(passive, active, ItemControl.getEquippedWeapon(passive), passiveTotalStatus);
		value = this.getDifference();
		
		return (activeAgi - passiveAgi) >= value ? 2 : 1;
};

//AI takes Agi supports into account
AIScorer.Weapon._getDamage = function(unit, combination) {
	var damage, roundAttackCount;
	var option = combination.item.getWeaponOption();
	
	if (option === WeaponOption.HPMINIMUM) {
		return combination.targetUnit.getHp() - 1;
	}
	
	damage = DamageCalculator.calculateDamage(unit, combination.targetUnit, combination.item, false, this._getSupportStatus(unit), this._getTargetSupportStatus(combination.targetUnit), 0);
	
	roundAttackCount = Calculator.calculateRoundCount(unit, combination.targetUnit, combination.item, this._getSupportStatus(unit), this._getTargetSupportStatus(combination.targetUnit));
	roundAttackCount *= Calculator.calculateAttackCount(unit, combination.targetUnit, combination.item, this._getSupportStatus(unit), this._getTargetSupportStatus(combination.targetUnit));
	damage *= roundAttackCount;
	
	return damage;
};

//Virtual attack now takes support Agi into account.
VirtualAttackControl._calculateAttackAndRoundCount = function(virtualAttackUnit, isAttack, targetUnit){
	
	if (isAttack) {
		weapon = virtualAttackUnit.weapon;
		
		// Get the number of attacks at the 1st round.
		// Normally it's 1, but returns 2 depending on the skill, and also can attack 2 times in a row.
		virtualAttackUnit.attackCount = Calculator.calculateAttackCount(virtualAttackUnit.unitSelf, targetUnit, weapon);

		targetTotalStatus = SupportCalculator.createTotalStatus(targetUnit);
		virtualAttackUnit.roundCount = Calculator.calculateRoundCount(virtualAttackUnit.unitSelf, targetUnit, weapon,virtualAttackUnit.totalStatus,targetTotalStatus);
	}
	else {
		virtualAttackUnit.attackCount = 0;
		virtualAttackUnit.roundCount = 0;
	}
};

//Expanding the AttackChecker Array doesn't affect the UI since is hardcoded to draw the first 3 values in posMenu and RealBattle.
AttackChecker.getNonStatus = function() {
	return [-1, -1, -1, 0];
};

//Moving Rounds calculation here to use the already created totalStatus
AttackChecker.getAttackStatusInternal = function(unit, weapon, targetUnit) {
	var activeTotalStatus, passiveTotalStatus;
	var arr = [,,,];
	
	if (weapon === null) {
		return this.getNonStatus();
	}
	
	activeTotalStatus = SupportCalculator.createTotalStatus(unit);
	passiveTotalStatus = SupportCalculator.createTotalStatus(targetUnit);
	
	arr[0] = DamageCalculator.calculateDamage(unit, targetUnit, weapon, false, activeTotalStatus, passiveTotalStatus, 0);
	arr[1] = HitCalculator.calculateHit(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);
	arr[2] = CriticalCalculator.calculateCritical(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);
	arr[3] = Calculator.calculateRoundCount(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);
	arr[3] *= Calculator.calculateAttackCount(unit, targetUnit, weapon);

	return arr;
};

//And we remove the round calculation from here to use the expanded value in the attack checker array, since it saves into the internal count is all we need to do.
PosAttackWindow.setPosTarget = function(unit, item, targetUnit, targetItem, isSrc) {
	var isCalculation = false;
	
	if (item !== null && item.isWeapon()) {
		if (isSrc) {
			// If the player has launched an attack, the status can be obtained without conditions.
			this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
			isCalculation = true;
		}
		else {
			if (AttackChecker.isCounterattack(targetUnit, unit)) {
				this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
				isCalculation = true;
			}
			else {
				this._statusArray = AttackChecker.getNonStatus();	
			}
		}
	}
	else {
		this._statusArray = AttackChecker.getNonStatus();
	}

	this._roundAttackCount = this._statusArray[3];

	
	this.setPosInfo(unit, item, isSrc);		
};

//Now takes Support Agility into account
Calculator.getAgilityPlus = function(active, passive, weapon, totalStatus) {
		return CompatibleCalculator.getAgility(active, passive, weapon) + SupportCalculator.getAgility(totalStatus);
};

//New settings for createTotalStatus
SupportCalculator.createTotalStatus = function(unit) {
		var i, x, y, index, targetUnit, indexArray, count;
		var totalStatus = {};
		//Added Agility
		totalStatus.powerTotal = 0;
		totalStatus.defenseTotal = 0;
		totalStatus.hitTotal = 0;
		totalStatus.avoidTotal = 0;
		totalStatus.criticalTotal = 0;
		totalStatus.criticalAvoidTotal = 0;
		totalStatus.agilityTotal = 0;
		//Added Move
    	totalStatus.moveTotal = 0;


		
		if (unit === null || this._isStatusDisabled()) {
			return totalStatus;
		}
		
		indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, this._getSupportRange());
		count = indexArray.length;
		
		// Search unit2 within a certain range of targetUnit (default 3 tiles).
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if (targetUnit !== null) {
				// If targetUnit is found, add support data into totalStatus.
				this._collectStatus(unit, targetUnit, totalStatus);
			}
		}
		
		this._collectSkillStatus(unit, totalStatus);

		return totalStatus;
};



//New getAgility function
SupportCalculator.getAgility = function(totalStatus) {
		if (totalStatus === null) {
			return 0;
		}
		
		return totalStatus.agilityTotal;
};

//New getMove function
SupportCalculator.getMove = function(totalStatus) {
		if (totalStatus === null) {
			return 0;
		}
		
		return totalStatus.moveTotal;
};
	
SupportCalculator._checkSkillStatus = function(unit, targetUnit, isSelf, totalStatus) {
		var i, skill, isSet, indexArray;
		var arr = SkillControl.getDirectSkillArray(unit, SkillType.SUPPORT, '');
		var count = arr.length;
		
		for (i = 0; i < count; i++) {
			skill = arr[i].skill;
			isSet = false;
			
			if (isSelf) {
				if (skill.getRangeType() === SelectionRangeType.SELFONLY) {
					isSet = true;
				}
			}
			else {
				if (skill.getRangeType() === SelectionRangeType.ALL) {
					// If it's "All", always enable to support.
					isSet = true;
				}
				else if (skill.getRangeType() === SelectionRangeType.MULTI) {
					//Replaced bestIndexArray and FindUnit for a simple Distance comparition for better performance.
					distance = Math.abs(unit.getMapX()-targetUnit.getMapX())+Math.abs(unit.getMapY()-targetUnit.getMapY())
					isSet = (SupportSkillControl.getRange(unit,skill) >= distance)
				}
			}
			
			//Changed to use _addSkillStatus
			if (isSet && this._isSupportable(unit, targetUnit, skill)) {
				this._addSkillStatus(totalStatus, SupportSkillControl.getSupportSkillStatus(unit,targetUnit,skill));
			}
		}
};

//New function for skills
SupportCalculator._addSkillStatus = function(totalStatus, supportSkillStatus) {
		totalStatus.powerTotal += supportSkillStatus.power
		totalStatus.defenseTotal += supportSkillStatus.defense
		totalStatus.hitTotal += supportSkillStatus.hit;
		totalStatus.avoidTotal += supportSkillStatus.avoid;
		totalStatus.criticalTotal += supportSkillStatus.critical;
		totalStatus.criticalAvoidTotal += supportSkillStatus.criticalAvoid;
		totalStatus.agilityTotal += supportSkillStatus.agility;
		totalStatus.moveTotal += supportSkillStatus.move
};
	
SupportCalculator._isSupportable = function(unit, targetUnit, skill) {
		if (targetUnit === null) {
			targetUnit = unit;
		}
		if(typeof skill.custom.supportFilter !== 'undefined'){
			filter = skill.custom.supportFilter;
		}else{
			filter = UnitFilterFlag.PLAYER;
		}


		if (FilterControl.isBestUnitTypeAllowed(unit.getUnitType(), targetUnit.getUnitType(), filter)){
			return skill.getTargetAggregation().isCondition(targetUnit)
		}
		return false
};
	
SupportCalculator._getSupportFilterFlag = function(unit) {
		//The filter now returns all kind of units, so a support works on everyone by default.
		var filter;
		filter = UnitFilterFlag.PLAYER | UnitFilterFlag.ALLY | UnitFilterFlag.ENEMY
		return filter;
};

//UnitSentece edit
UnitSentence.Agility = defineObject(BaseUnitSentence,
	{
		_value: 0,
		
		setCalculatorValue: function(unit, weapon, totalStatus) {
			if (weapon !== null) {
				this._value = AbilityCalculator.getAgility(unit, weapon) + totalStatus.agilityTotal;
			}
		},
		
		drawUnitSentence: function(x, y, unit, weapon, totalStatus) {
			var value = 0;
			var isValid = false;
			
			if (weapon !== null) {
				value = this._value;
				isValid = true;
			}
			
			this.drawAbilityText(x, y, root.queryCommand('agility_capacity'), value, isValid);
		}
	}
);

//New UnitSentece for Move
UnitSentence.Move = defineObject(BaseUnitSentence,
	{
		_value: 0,
		
		setCalculatorValue: function(unit, weapon, totalStatus) {
				this._value = ParamBonus.getBonus(unit, ParamType.MOV) + totalStatus.moveTotal;
		},
		
		drawUnitSentence: function(x, y, unit, weapon, totalStatus) {
			var value = this._value;
			var isValid = true;
			
			this.drawAbilityText(x, y, root.queryCommand('mov_param'), value, isValid);
		}
	}
);

ParamBonus.getMov = function(unit) {
	return this.getBonus(unit, ParamType.MOV) + SupportCalculator.getMove(SupportCalculator.createTotalStatus(unit));
};

(function() {
var aliasUSW_cS = UnitSentenceWindow._configureSentence;
UnitSentenceWindow._configureSentence = function(groupArray) {
	aliasUSW_cS.call(this,groupArray)
	if (DataConfig.isItemWeightDisplayable()) {
		groupArray.insertObject(UnitSentence.Move,6);
	}else{
		groupArray.insertObject(UnitSentence.Move,5)
	}
}
})();