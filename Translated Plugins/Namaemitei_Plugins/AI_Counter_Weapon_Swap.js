
/*--------------------------------------------------------------------------
  
A script that switches the enemy to a weapon that can counterattack when your army attacks

■Overview
When your unit attacks an enemy, automatically select a weapon that can counterattack from the weapons possessed by the enemy.
(Uses the weapon that is detected first among the weapons that can counterattack. Currently, it is not considered whether the power or accuracy is optimal.)

■ Customization
1. I want allied units to automatically select weapons that can counterattack.
　　　→Rewrite false to true in "var IS_ATTACKABLE_ALLY_ENABLE = false;"

2. I want to automatically select a weapon that can counterattack only a part of the enemy (and allied units if IS_ATTACKABLE_ALLY_ENABLE=true)
　　　→Replace true in "var IS_ATTACKABLE_AUTO_ENABLE = true;" to false
On top of that, give the enemy (alliance) unit a custom skill with 'sokuou' as the keyword.
(Both class skills and unit skills are fine)

3. I want to change the custom skill keyword
　　　→Please change the sokuou part of "var ATTACKABLE_SKILL_KEYWORD = 'sokuou';" to a different keyword

4. When selecting a counterattack weapon, I want to select the weapon with the best score among those that can counterattack
　　　→Replace false in "var IS_CALCULATE_SCORE = false;" to true



16/11/06 New
16/11/07 added some settings
17/04/15 Added a setting to select the weapon with the best score among those that can counterattack when selecting a counterattack weapon (weapon with the best AIScorer.Weapon.getScore() value)
17/11/29 1.164 compatible
18/01/16 Fixed a bug that caused the effect of "Enemy counterattack weapon selection" to own units due to a description error.
          (If the enemy moves one step and attacks, it will occur if you are equipped with a sword and have a hand spear.)
19/04/05 Implementation of conflict measures with superbow1.2 modified .txt
19/10/29 Fixed not to select the counterattack weapon when in an incapacitated state


■ Correspondence version
　SRPG Studio Version: 1.206


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. It's free.
・There is no problem with processing. Please keep remodeling.
・ No credit stated OK
・ Redistribution, reprint OK
・Please comply with the SRPG Studio Terms of Use.
  
--------------------------------------------------------------------------*/


(function() {

//-----------------------------------
// setting
//-----------------------------------

// Do Allied Units Have Automatic Counterattack Weapon Selection?
var IS_ATTACKABLE_ALLY_ENABLE = false;		// true: Perform automatic counterattack weapon selection, false: Do not perform

// Enemy units (and allied units if IS_ATTACKABLE_ALLY_ENABLE=true) have automatic counterattack weapon selection without custom skills
var IS_ATTACKABLE_AUTO_ENABLE = true;		// true: automatic counterattack weapon can be selected without custom skill, false: automatic counterattack weapon cannot be selected without custom skill

// When selecting a counterattack weapon, whether to select the weapon with the best score among those that can counterattack
var IS_CALCULATE_SCORE 		  = false;		// true: select the one with the best score, false: select the top weapon that can counterattack

// Custom skill keywords
var ATTACKABLE_SKILL_KEYWORD  = 'sokuou';	// If IS_ATTACKABLE_AUTO_ENABLE = false, automatic counterattack weapon selection cannot be performed unless you have the custom skill for this keyword.




//-------------------------------------
// PosMenu class
//-------------------------------------
PosMenu.changePosTarget= function(targetUnit) {
		var targetItem, isLeft;
		
		if (this._unit === null || !this._isTargetAllowed(targetUnit)) {
			this._currentTarget = null;
			return;
		}
		
		this._currentTarget = targetUnit;

		// If the attack target is not a player unit, automatically select a weapon that can counterattack.
		if( ItemControl.isAttackableWeapon(targetUnit) == true ) {
			targetItem = ItemControl.getAttackableWeapon(targetUnit, this._unit);

			if( targetItem != null  ) {
				ItemControl.setEquippedWeapon(targetUnit, targetItem);
			}
		}
		targetItem = ItemControl.getEquippedWeapon(targetUnit);
		
		// Src shall always be displayed on the left
		isLeft = Miscellaneous.isUnitSrcPriority(this._unit, targetUnit);
		
		// Prioritize displaying your army on the left side (judging that the left side is easier to see)
		// For this reason, if your army sets it, it will naturally be displayed on the left side,
		// It will be displayed on the left even if your army is set up.
		// If both are in your army, the one who set it is displayed on the left.
		if (isLeft) {
			// Since it was your own army that set it up, specify this as pos window left
			this._posWindowLeft.setPosTarget(this._unit, this._item, targetUnit, targetItem, true);
			this._posWindowRight.setPosTarget(targetUnit, targetItem, this._unit, this._item, false);
		}
		else {
			// It wasn't my own army that set it up.
			// In this case, the targetUnit is your army, so specify it as _posWindowLeft.
			this._posWindowLeft.setPosTarget(targetUnit, targetItem, this._unit, this._item, true);
			this._posWindowRight.setPosTarget(this._unit, this._item, targetUnit, targetItem, false);
		}
}




//-------------------------------------
// ItemControl class
//-------------------------------------
// Determining whether the attacked side can automatically counterattack the attacker
ItemControl.isAttackableWeapon= function(unit) {
		// Automatic counterattack weapon selection is not performed for friendly units.
		if( unit.getUnitType() == UnitType.PLAYER ) {
			return false;
		}
		
		// For allied units, no automatic counterattack weapon selection unless is attackable ally enable is true
		if( unit.getUnitType() == UnitType.ALLY && IS_ATTACKABLE_ALLY_ENABLE == false ) {
			return false;
		}
		
		// Automatic counterattack weapon selection flag (IS_ATTACKABLE_AUTO_ENABLE) is false, and
		// Automatic counterattack weapon selection is not performed if the custom skill of the keyword (ATTACKABLE_SKILL_KEYWORD) is not possessed.
		if( IS_ATTACKABLE_AUTO_ENABLE == false && !SkillControl.getPossessionCustomSkill(unit, ATTACKABLE_SKILL_KEYWORD) ) {
			return false;
		}
		
		// Returns false if incapacitated
		if (StateControl.isBadStateOption(unit, BadStateOption.NOACTION)) {
			return false;
		}
		
		// Automatic counterattack weapon selection flag (IS_ATTACKABLE_AUTO_ENABLE) is true, or
		// If the unit possesses the skill with the custom skill name (ATTACKABLE_SKILL_NAME), it will automatically select a counterattack weapon.
		return true;
}


// On the attacked side, find and acquire a weapon that can counterattack the attacker.
// When using the top weapon that can counterattack
if( IS_CALCULATE_SCORE == false ) {
	ItemControl.getAttackableWeapon= function(targetUnit, unit) {
		var indexArray;
		var weapon;
		var count;
		var i;
		var targetweapon;
		var result;
		
		// If the counterattack is not permitted, the process ends.
		if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
			return null;
		}
		
		weapon = ItemControl.getEquippedWeapon(unit);
		if (weapon !== null && weapon.isOneSide()) {
			// If the attacking side is equipped with a "one-way" weapon, the process ends because it cannot counterattack.
			return null;
		}
		
		count = UnitItemControl.getPossessionItemCount(targetUnit);
		// Search for a weapon that can counterattack from the weapons you have
		for (i = 0; i < count; i++) {
			targetweapon = UnitItemControl.getItem(targetUnit, i);
			if (targetweapon !== null && this.isWeaponAvailable(targetUnit, targetweapon)) {
				// "One-way" weapons cannot counterattack
				if (targetweapon.isOneSide()) {
					continue;
				}
				
				// Click here if there is no Superbow1.2 Kai.txt
				if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
					indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon);
				}
				// If Superbow1.2 Kai.txt is included, add a strong bow etc.
				else {
					skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
					skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
					indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon, skill_superbow, skill_proximity);
				}
				
				// If the attacking side's coordinates can be attacked with the counterattacking side's weapon, the weapon is returned.
				// Returning the first weapon detected that can counterattack (not taking out the best weapon)
				result = IndexArray.findPos(indexArray, unit.getMapX(), unit.getMapY());
				if( result == true ) {
					return targetweapon;
				}
			}
		}
		
		return null;
	};
}
// When using the one with the best score
else {
	ItemControl.getAttackableWeapon= function(targetUnit, unit) {
		var indexArray;
		var weapon;
		var count;
		var i;
		var targetweapon;
		var result;
		var skill_superbow;
		var skill_proximity;
		var maxWeapon = null;
		var max_score = 0;
		var score = 0;
		var combination = {};
		combination.targetUnit = unit;
		combination.plusScore  = 0;
		
		// If the counterattack is not permitted, the process ends.
		if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
			return null;
		}
		
		weapon = ItemControl.getEquippedWeapon(unit);
		if (weapon !== null && weapon.isOneSide()) {
			// If the attacking side is equipped with a "one-way" weapon, the process ends because it cannot counterattack.
			return null;
		}
		
		count = UnitItemControl.getPossessionItemCount(targetUnit);
		// Search for a weapon that can counterattack from the weapons you have
		for (i = 0; i < count; i++) {
			targetweapon = UnitItemControl.getItem(targetUnit, i);
			if (targetweapon !== null && this.isWeaponAvailable(targetUnit, targetweapon)) {
				// "One-way" weapons cannot counterattack
				if (targetweapon.isOneSide()) {
					continue;
				}
				
				// Click here if there is no Superbow1.2 Kai.txt
				if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
					indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon);
				}
				// If Superbow1.2 Kai.txt is included, add a strong bow etc.
				else {
					skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
					skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
					indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon, skill_superbow, skill_proximity);
				}
				
				// If the attacking side's coordinates can be attacked with the counterattacking side's weapon, the score of that weapon is calculated.
				// Return the weapon with the highest score
				result = IndexArray.findPos(indexArray, unit.getMapX(), unit.getMapY());
				if( result == true ) {
					combination.item = targetweapon;
					score = AIScorer.Weapon.getScore(targetUnit, combination);
// Score of counterattackable weapons (for debugging)
//root.log(targetweapon.getName()+':'+score);
					if( score > max_score ) {
						max_score = score;
						maxWeapon = targetweapon;
					}
				}
			}
		}
		
// Score of selected counterattackable weapon (for debugging)
//if( maxWeapon != null) {
//	root.log('result '+maxWeapon.getName()+':'+max_score);
//}
//else{
//	root.log('result maxWeapon null');
//}
		return maxWeapon;
	};
}



//-------------------------------------
// AttackChecker class
//-------------------------------------
// Check if it is possible to counterattack (coordinate unit)
AttackChecker.isCounterattackPos= function(unit, targetUnit, x, y) {
		var indexArray;
		var weapon;
		
		// If the enemy or allied unit can counterattack automatically, switch to a weapon that can counterattack.
		if( ItemControl.isAttackableWeapon(targetUnit) == true ) {
			weapon = ItemControl.getAttackableWeapon(targetUnit, unit);
			if (weapon === null) {
				return false;
			}
			ItemControl.setEquippedWeapon(targetUnit, weapon);
		}
		// If the enemy and allied units are not capable of automatic counterattack, it will be normal
		else {
			weapon = ItemControl.getEquippedWeapon(targetUnit);
			if (weapon === null) {
				return false;
			}
		}
		
		// Click here if there is no Superbow1.2 Kai.txt
		if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
			indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), weapon);
		}
		// If Superbow1.2 Kai.txt is included, add a strong bow etc.
		else {
			var skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
			var skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
			indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), weapon, skill_superbow, skill_proximity);
		}
		
		return IndexArray.findPos(indexArray, x, y);
}


})();