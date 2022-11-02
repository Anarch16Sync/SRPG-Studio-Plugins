
/*--------------------------------------------------------------------------
  
Skill "Battle Continuation"
  When the skill activates, the battle continues. "Assault" in FE
  However, it does not activate in situations where the skill owner is attacked unilaterally.
  (Can be activated if the skill owner can attack unilaterally, can be turned off with Custom Parameter)

  how to use:
  Select Custom in Skills and set [OT_Assault] in Keywords.
  
  custom parameter
  {
      AS_Max: (number) //Maximum number of activations (50 if not specified)
    , AS_OneSide: (Boolean value) // Will it be triggered in situations where it is possible to attack unilaterally (true if not specified)
    , AS_AbortCheck: (logical value) //If the opponent is an immortal unit, suppress the activation when the immortal unit is dying (false if not specified)
  }
  
  The default value when AS_Max is not specified is defined in AS_MaxActivate of this script.
  
  If AS_AbortCheck is set to true, for characters who have become immortal in the event settings
  When executing a forced evasion that occurs when you attack with a skill or critical hit that reduces HP to 0,
  It will no longer activate when the amount of normal attack damage exceeds HP.
  Alleviates the situation where the caster is attacked unilaterally and is at a disadvantage.
  
  Author:
  o-to
  
  Change log:
  2015/6/20: Create new
  2015/9/6: Fixed due to deletion of official functions
  2015/10/31: Corrected due to renaming of official functions
  2019/05/25:
  If the opponent is invincible, the attack does not hit, or the HP is absorbed, the battle will go on and on.
  Unless you set the skill count limit using the skill activation condition addition script,
  Fixed to limit the number of activations by default in the script of this skill because there was a problem with freezing.
  
  Fixed so that it can be set in Custom Parameter so that it does not activate in situations where it can be attacked unilaterally.
  
  If the opponent is a character who has become immortal in the event settings, the invoker will be at a disadvantage.
  Added Caspara to mitigate it.
  
  After both battles are over, the activation display of the skill is
  Fixed to be displayed in the first attack and defense.
  
--------------------------------------------------------------------------*/


(function() {
AS_MaxActivate = 50;
var tmpASRound = 0;

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// continue fighting
	if (keyword === 'OT_Assault') {
		if(typeof skill.custom.AS_AbortCheck != "undefined") {
			tmpASAbortCheck = skill.custom.AS_AbortCheck;
		}

		// If it's not trigger type, simply return true
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// Skill activation judgment when attack count is obtained
// Between the isRound function and this function when the number of battles is reduced, the determination of whether the number of battles between the first and second attacks is 0 is not functioned
// It is only after the original processing of this function that you can safely tweak both the number of battles for the first attack and the second attack
// Here we are adding the number of battles
var alias2 = NormalAttackOrderBuilder._getAttackCount;
NormalAttackOrderBuilder._getAttackCount = function(virtualActive, virtualPassive) {
	var result = alias2.call(this, virtualActive, virtualPassive);

	// We are adjusting the display of skill activation.
	if(virtualActive.tmpAssault != null ) {
		virtualActive.tmpPushAssault = virtualActive.tmpAssault;
		virtualActive.tmpAssault = null;
	} 
	if(virtualPassive.tmpAssault != null ) {
		virtualPassive.tmpPushAssault = virtualPassive.tmpAssault;
		virtualPassive.tmpAssault = null;
	}

	if( virtualActive.roundCount === 0 && virtualPassive.roundCount === 0 )
	{
		var skill1 = SkillControl.getPossessionCustomSkill(virtualActive.unitSelf, 'OT_Assault');
		var skill2 = SkillControl.getPossessionCustomSkill(virtualPassive.unitSelf, 'OT_Assault');
		var ActiveWeapon  = virtualActive.weapon;
		var PassiveWeapon = virtualPassive.weapon;
		
		if( skill1 != null && SkillRandomizer.isCustomSkillInvokedInternal(virtualActive.unitSelf, virtualPassive.unitSelf, skill1, 'OT_Assault') )
		{
			// After checking the activation judgment, check if it is possible to attack
			// Not activated if you can't attack with a weapon that blocks attacks
			if( NormalAttackOrderBuilder._isAttackContinue(virtualActive, virtualPassive) && tmpASRound < virtualActive.tmpASMaxActivate && !virtualActive.tmpASAbort)
			{
				// in a situation where we can attack unilaterally
				// No activation if AS_OneSide is false in Custom Parameter
				if( !virtualPassive.isCounterattack && !virtualActive.tmpASOneSide ) {
					//root.log("One-sided attacks are prohibited, so ``continue battle'' is suspended.");
					return result;
				}
				
				tmpASRound++;
				virtualActive.tmpAssault = skill1;
				virtualActive.roundCount = Calculator.calculateRoundCount(virtualActive.unitSelf, virtualPassive.unitSelf, ActiveWeapon);

				// If the opponent can counterattack, change the opponent's round
				// If you can attack unilaterally, do not change the opponent's round
				if( virtualPassive.isCounterattack )
				{
					virtualPassive.roundCount = Calculator.calculateRoundCount(virtualPassive.unitSelf, virtualActive.unitSelf, PassiveWeapon);
					virtualPassive.tmpAssaultPassive = true;
				}
			}
		}
		
		if( skill2 != null && SkillRandomizer.isCustomSkillInvokedInternal(virtualPassive.unitSelf, virtualActive.unitSelf, skill2, 'OT_Assault') )
		{
			// If the skill invoker cannot attack with a weapon that blocks attacks, it will not be activated.
			if( NormalAttackOrderBuilder._isAttackContinue(virtualPassive, virtualActive) && tmpASRound < virtualPassive.tmpASMaxActivate && !virtualPassive.tmpASAbort)
			{
				// Does not activate if the skill invoker is attacked unilaterally
				if( virtualPassive.isCounterattack )
				{
					virtualPassive.tmpAssault = skill2;
					virtualPassive.tmpAssaultEnable = true;
					
					// Only if the attacker has not activated the skill
					// Correct the number of battles
					if(virtualActive.tmpAssault == null) {
						tmpASRound++;
						virtualActive.roundCount  = Calculator.calculateRoundCount(virtualActive.unitSelf, virtualPassive.unitSelf, ActiveWeapon);
						virtualPassive.roundCount = Calculator.calculateRoundCount(virtualPassive.unitSelf, virtualActive.unitSelf, PassiveWeapon);
						virtualPassive.tmpAssaultPassive = true;
					}
				}
			}
		}
	}
	return result;

};

// Processing at the stage when attackEntry is created
// After both attacks are completed, the skill activation display will be displayed at the timing of the first attack of either of the continued battles.
var alias3 = NormalAttackOrderBuilder._setInitialSkill;
NormalAttackOrderBuilder._setInitialSkill = function(virtualActive, virtualPassive, attackEntry) {
	alias3.call(this, virtualActive, virtualPassive, attackEntry);
	
	if(virtualActive.tmpPushAssault != null ) {
		if (virtualActive.tmpPushAssault.isSkillDisplayable()) {
			attackEntry.skillArrayActive.push(virtualActive.tmpPushAssault);
		}
		virtualActive.tmpPushAssault = null;
	} 
	if(virtualPassive.tmpPushAssault != null ) {
		if (virtualPassive.tmpPushAssault.isSkillDisplayable()) {
			attackEntry.skillArrayPassive.push(virtualPassive.tmpPushAssault);
		}
		virtualPassive.tmpPushAssault = null;
	}
};

// After activating the attacking side's skill
// If it is left as it is, the opponent will attack immediately, so the side receiving the attack will skip once.
var alias4 = VirtualAttackControl.isRound;
VirtualAttackControl.isRound = function(virtualAttackUnit) {
	var result = alias4.call(this, virtualAttackUnit);
	
	if( result == true && virtualAttackUnit.tmpAssaultPassive == true && virtualAttackUnit.isSrc == false )
	{
		virtualAttackUnit.tmpAssaultPassive = false;
		result = false;
	}
	
	return result;
};

// Reset the number of activations before the battle starts
var alias5 = NormalAttackOrderBuilder._startVirtualAttack;
NormalAttackOrderBuilder._startVirtualAttack = function() {
	tmpASRound = 0;
	//tmpASMaxActivate = AS_MaxActivate;
	//tmpASAbort = false;
	//tmpASAbortCheck = false;
	return alias5.call(this);
};

// If the immortal opponent is dying at the time of attack, set the skill interruption flag
var alias6 = AttackEvaluator.PassiveAction.evaluateAttackEntry;
AttackEvaluator.PassiveAction.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	// Check if "current HP - damage after correction of skills and critical hits" is 0 or less
	// Since the damage value becomes 0 by avoiding by immortality, acquire the internal value before that
	var tmpHp = virtualPassive.hp - attackEntry.damagePassive;
	alias6.call(this, virtualActive, virtualPassive, attackEntry);
	
	// Check if there is a suspension confirmation flag
	if( virtualActive.tmpASAbortCheck ) {
		// Check if "current HP - damage for one normal attack" becomes 0 or less in the next attack
		var tmpDmg = DamageCalculator.calculateDamage(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, false, virtualActive.totalStatus, virtualPassive.totalStatus, 0);
		var tmpSimulateHP = virtualPassive.hp - tmpDmg - attackEntry.damagePassive;
		
		var passive = virtualPassive.unitSelf;
		if(passive.isImmortal()) {
			if(tmpHp <= 0 || tmpSimulateHP <= 0) {
				// Suspended because it is weak enough to be defeated by the next blow unless it is immortal
				virtualActive.tmpASAbort = true;
				//root.log(""Continue battle" is interrupted because the immortal character is dying");
				
				// If tmpAssault is null, the number of battles is not changed, so do not change the number of battles.
				// If tmpAssault is not null, the skill is activated and the number of battles is changed, so it is corrected to 0
				// As a rare case, if the immortal character has the skill and is activating the skill, it will not change
				if(virtualActive.tmpAssault) {
					if(virtualPassive.tmpAssault == null) {
						virtualActive.tmpAssault = null;
						virtualActive.roundCount = 0;
						virtualPassive.roundCount = 0;
					}
				}
			}
		}
	}
};

//// Added initial value for skill settings to virtualAttackUnit
//var alias100 = StructureBuilder.buildVirtualAttackUnit;
//StructureBuilder.buildVirtualAttackUnit = function() {
//	var virtualAttackUnit = alias100.call(this);
//	virtualAttackUnit.tmpAssaultEnable = false;
//	virtualAttackUnit.tmpAssault = null;
//	virtualAttackUnit.tmpPushAssault = null;
//	virtualAttackUnit.tmpASMaxActivate = AS_MaxActivate;
//	virtualAttackUnit.tmpASAbort = false;
//	virtualAttackUnit.tmpASAbortCheck = false;
//	virtualAttackUnit.tmpASOneSide = true;
//	return virtualAttackUnit;
//};

// Add initial value for skill setting when creating virtualAttackUnit
var alias100 = VirtualAttackControl.createVirtualAttackUnit;
VirtualAttackControl.createVirtualAttackUnit = function(unitSelf, targetUnit, isSrc, attackInfo) {
	var virtualAttackUnit = alias100.call(this, unitSelf, targetUnit, isSrc, attackInfo);
	virtualAttackUnit.tmpAssaultEnable = false;
	virtualAttackUnit.tmpAssault = null;
	virtualAttackUnit.tmpPushAssault = null;
	virtualAttackUnit.tmpASMaxActivate = AS_MaxActivate;
	virtualAttackUnit.tmpASAbort = false;
	virtualAttackUnit.tmpASAbortCheck = false;
	virtualAttackUnit.tmpASOneSide = true;

	// Skill settings
	OT_AssaultCheckData(virtualAttackUnit);
	return virtualAttackUnit;
};

// Inserts Custom Parameter set in the skill into virtualAttackUnit when the skill is activated
OT_AssaultCheckData = function(virtualAttackUnit) {
	var skill = SkillControl.getPossessionCustomSkill(virtualAttackUnit.unitSelf, 'OT_Assault');
	if( skill == null ) {
		return;
	}
		
	// If AS_Max is set, set max triggers to it
	if( typeof skill.custom.AS_Max !== 'undefined' ) {
		virtualAttackUnit.tmpASMaxActivate = skill.custom.AS_Max;
	}
	//if( typeof EC_EnableManager !== 'undefined' ) {
	//	// Processing for people using the skill activation condition addition script
	//	// If EC_TriggerCountBattle is set
	//	// Because the number of skill activations in one battle is controlled by the skill activation condition addition script
	//	// Match the value of tmpASMaxActivate to EC_TriggerCountBattle
	//	if( skill.custom.EC_TriggerCountBattle != null ) {
	//		virtualAttackUnit.tmpASMaxActivate = skill.custom.EC_TriggerCountBattle;
	//	}
	//}
	
	if( typeof skill.custom.AS_AbortCheck !== 'undefined' ) {
		virtualAttackUnit.tmpASAbortCheck = skill.custom.AS_AbortCheck;
	}

	if( typeof skill.custom.AS_OneSide !== 'undefined' ) {
		virtualAttackUnit.tmpASOneSide = skill.custom.AS_OneSide;
	}
};

})();

