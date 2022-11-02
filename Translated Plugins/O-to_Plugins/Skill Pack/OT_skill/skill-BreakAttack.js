
/*--------------------------------------------------------------------------
  
Skill "Armor Break"
   Ignores defense when the skill is activated.
   "Luna" skill in FE

   How to use:
   Select Custom in Skills and set [OT_BreakAttack] in Keywords.

   custom parameter
   {
     BreakPercent: (number) //Set what percentage of the opponent's defense power to ignore
   }

   If BreakPercent is not set, 100% of the opponent's defense will be ignored.
  
   Author:
   o-to
  
   Change log:
   2015/5/31: Create new
   2015/6/14: Fixed to alias3.call before skill activation
   2017/4/23: Fixed because the defense ignore option of the sure hit skill did not work when using this script

--------------------------------------------------------------------------*/


(function() {

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// Armor Break
	if (keyword === 'OT_BreakAttack') {
		// If it's not trigger type, simply return true
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// damage settings
var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, attackEntry) {
	var active = virtualActive.unitSelf;
	var passive = virtualPassive.unitSelf;

	// Armor Break
	if (SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, attackEntry, true, 'OT_BreakAttack') !== null) {
		virtualActive.unitSelf.custom.tmpBreakCheck = true;
	}

	return alias2.call(this, virtualActive, virtualPassive, attackEntry);
};

// Setting of the side receiving damage
var alias3 = DamageCalculator.calculateDefense;
DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {

	var def = alias3.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
	var BreakCheck = active.custom.tmpBreakCheck;
	delete active.custom.tmpBreakCheck;

	// Ignores defense when skill is activated
	if (BreakCheck == true) {
		var skill = SkillControl.getPossessionCustomSkill(active, 'OT_BreakAttack');
		var custom = skill.custom;
		var percent = 0;
		
		if( custom.BreakPercent != null )
		{
			percent = (100 - custom.BreakPercent) / 100;
		}

		def = Math.floor(def * percent);
	}
	
	return def;
}

})();

