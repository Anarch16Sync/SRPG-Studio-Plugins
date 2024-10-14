/* 
Dynamic-Compatibility-Expansion
Author: Anarch16sync

This Plugin adds the ability to set dynamic Compatibility bonus to WeaponTypes and the creation of Compatibility Skills.
These dynamic bonus is created by using a function(active, passive, weapon) in the corresponding custom parameter object,
where active is the attacking unit, passive is the defending unit, and weapons is the weapon equipped by the active unit.

The following custom parameter serves to define the Compatibility Bonus, this bonus is additive, meaning you can get the bonus
of multiple skills + the custom weapon type bonus + the default weaponType compatibility bonus.
{
compatibleStatus:{
    getPower:function(active, passive, weapon){
        return 0;
    },
    getDefense:function(active, passive, weapon){
        return 0;
    },
    getHit:function(active, passive, weapon){
        return 0;
    },
    getAvoid:function(active, passive, weapon){
        return 0;
    },
    getCritical:function(active, passive, weapon){
        return 0;
    },
    getCriticalAvoid:function(active, passive, weapon){
        return 0;
    },
    getAgility:function(active, passive, weapon){
        return 0;
    }
}
}

As with the default compatibility bonus, this values are already calculated into the combat preview.

For Compatibility Skill, you can define effective targets, but not the trigger rate, the skill will always be in effect if the target condition is met.
The Skill keyword is defined below in CompatibleSkill, by default is A16S-Compatible but can be changed easily.
*/


//Skill Keyword
var CompatibleSkill = 'A16S-Compatible'


CompatibleCalculator.getPower = function(active, passive, weapon) {
		var pow = 0;

		var compatibleArray = this._getSkillCompatibleArray(active, passive, weapon);
		var count = compatibleArray.length;
		for (i = 0; i < count; i++) {
			if(typeof compatibleArray[i].getPower !== 'undefined'){
				pow += compatibleArray[i].getPower(active, passive, weapon);
			}
		}

		var customCompatible = this._getCustomCompatible(active, passive, weapon);
		if (customCompatible !== null) {
			if(typeof customCompatible.getPower !== 'undefined'){
				pow += customCompatible.getPower(active, passive, weapon);
			}
		}

		var compatible = this._getCompatible(active, passive, weapon);
		if (compatible !== null) {
			pow += compatible.getPower();
		}
		
		return pow
	};

CompatibleCalculator.getDefense = function(active, passive, weapon) {
		var def = 0;

		var compatibleArray = this._getSkillCompatibleArray(active, passive, weapon);
		var count = compatibleArray.length;
		for (i = 0; i < count; i++) {
			if(typeof compatibleArray[i].getDefense !== 'undefined'){
				def += compatibleArray[i].getDefense(active, passive, weapon);
			}
		}

		var customCompatible = this._getCustomCompatible(active, passive, weapon);
		if (customCompatible !== null) {
			if(typeof customCompatible.getDefense !== 'undefined'){
				def += customCompatible.getDefense(active, passive, weapon);
			}
		}

		var compatible = this._getCompatible(active, passive, weapon);
		if (compatible !== null) {
			def += compatible.getDefense();
		}
		
		return def
	};

CompatibleCalculator.getHit = function(active, passive, weapon) {
		var hit = 0;

		var compatibleArray = this._getSkillCompatibleArray(active, passive, weapon);
		var count = compatibleArray.length;
		for (i = 0; i < count; i++) {
			if(typeof compatibleArray[i].getHit !== 'undefined'){
				hit += compatibleArray[i].getHit(active, passive, weapon);
			}
		}

		var customCompatible = this._getCustomCompatible(active, passive, weapon);
		if (customCompatible !== null) {
			if(typeof customCompatible.getHit !== 'undefined'){
				hit += customCompatible.getHit(active, passive, weapon);
			}
		}

		var compatible = this._getCompatible(active, passive, weapon);
		if (compatible !== null) {
			hit += compatible.getHit();
		}
		
		return hit
	};

CompatibleCalculator.getAvoid = function(active, passive, weapon) {
		var avo = 0;

		var compatibleArray = this._getSkillCompatibleArray(active, passive, weapon);
		var count = compatibleArray.length;
		for (i = 0; i < count; i++) {
			if(typeof compatibleArray[i].getAvoid !== 'undefined'){
				avo += compatibleArray[i].getAvoid(active, passive, weapon);
			}
		}

		var customCompatible = this._getCustomCompatible(active, passive, weapon);
		if (customCompatible !== null) {
			if(typeof customCompatible.getAvoid !== 'undefined'){
				avo += customCompatible.getAvoid(active, passive, weapon);
			}
		}

		var compatible = this._getCompatible(active, passive, weapon);
		if (compatible !== null) {
			avo += compatible.getAvoid();
		}
		
		return avo
	};

CompatibleCalculator.getCritical = function(active, passive, weapon) {
		var crit = 0;

		var compatibleArray = this._getSkillCompatibleArray(active, passive, weapon);
		var count = compatibleArray.length;
		for (i = 0; i < count; i++) {
			if(typeof compatibleArray[i].getCritical !== 'undefined'){
				crit += compatibleArray[i].getCritical(active, passive, weapon);
			}
		}

		var customCompatible = this._getCustomCompatible(active, passive, weapon);
		if (customCompatible !== null) {
			if(typeof customCompatible.getCritical !== 'undefined'){
				crit += customCompatible.getCritical(active, passive, weapon);
			}
		}

		var compatible = this._getCompatible(active, passive, weapon);
		if (compatible !== null) {
			crit += compatible.getCritical();
		}
		
		return crit
	};

CompatibleCalculator.getCriticalAvoid = function(active, passive, weapon) {
		var cavo = 0;

		var compatibleArray = this._getSkillCompatibleArray(active, passive, weapon);
		var count = compatibleArray.length;
		for (i = 0; i < count; i++) {
			if(typeof compatibleArray[i].getCriticalAvoid !== 'undefined'){
				cavo += compatibleArray[i].getCriticalAvoid(active, passive, weapon);
			}
		}

		var customCompatible = this._getCustomCompatible(active, passive, weapon);
		if (customCompatible !== null) {
			if(typeof customCompatible.getCriticalAvoid !== 'undefined'){
				cavo += customCompatible.getCriticalAvoid(active, passive, weapon);
			}
		}

		var compatible = this._getCompatible(active, passive, weapon);
		if (compatible !== null) {
			cavo += compatible.getCriticalAvoid();
		}
		
		return cavo
	},

CompatibleCalculator.getAgility = function(active, passive, weapon) {
		var agi = 0;

		var compatibleArray = this._getSkillCompatibleArray(active, passive, weapon);
		var count = compatibleArray.length;
		for (i = 0; i < count; i++) {
			if(typeof compatibleArray[i].getAgility !== 'undefined'){
				agi += compatibleArray[i].getAgility(active, passive, weapon);
			}
		}

		var customCompatible = this._getCustomCompatible(active, passive, weapon);
		if (customCompatible !== null) {
			if(typeof customCompatible.getAgility !== 'undefined'){
				agi += customCompatible.getAgility(active, passive, weapon);
			}
		}

		var compatible = this._getCompatible(active, passive, weapon);
		if (compatible !== null) {
			agi += compatible.getAgility();
		}
		
		return agi
	};

CompatibleCalculator._getCustomCompatible = function(active, passive, weapon) {
	
		if (weapon === null) {
			return null;
		}
		
		var weaponTypeActive = weapon.getWeaponType();

		if (weaponTypeActive.custom.compatibleStatus == null) {
			return null;
		}
		
		return weaponTypeActive.custom.compatibleStatus;
	},

CompatibleCalculator._getSkillCompatibleArray = function (active,passive,weapon){
		var arr, count;
		var compatibleArray = []

		arr = SkillControl.getDirectSkillArray(active, SkillType.CUSTOM, CompatibleSkill)

		count = arr.length;
		for (i = 0; i < count; i++) {
			skill = arr[i].skill;
			
			// Check if the target is valid
			if (!skill.getTargetAggregation().isCondition(passive)) {
				continue;
			}
			
			compatibleArray.push(skill.custom.compatibleStatus);
		}
		
		return compatibleArray;
};