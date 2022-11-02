
/*--------------------------------------------------------------------------
  
Skill "Damage absorption"
   Nullifies the opponent's damage when the skill is activated, absorbs the damage and recovers HP

   how to use:
   Select Custom in Skills and set OT_AbsorptionDamage in Keywords.

   custom parameter
   {
     AbsorptionPercent: (number) //Set what percentage of damage to absorb
   }

   If AbsorptionPercent is not set, it will be 100.

   Author:
   o-to
  
   Change log:
   2015/5/31: Create new
  
--------------------------------------------------------------------------*/


(function() {

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// absorption
	if (keyword === 'OT_AbsorptionDamage') {
		// If it's not trigger type, simply return true
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// Skill activation judgment after damage setting is completed
var alias2 = AttackEvaluator.HitCritical.evaluateAttackEntry;
AttackEvaluator.HitCritical.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	alias2.call(this, virtualActive, virtualPassive, attackEntry);

	if (attackEntry.isHit) {
		if ( SkillControl.checkAndPushCustomSkill(virtualPassive.unitSelf, virtualActive.unitSelf, attackEntry, false, 'OT_AbsorptionDamage') ) {
			var skill = SkillControl.getPossessionCustomSkill(virtualPassive.unitSelf, 'OT_AbsorptionDamage');
			var custom = skill.custom;
			var percent = -1;
			
			if( custom.AbsorptionPercent != null )
			{
				percent = -(custom.AbsorptionPercent / 100);
			}
			attackEntry.damagePassive = Math.floor(attackEntry.damagePassive * percent);
		}
	}
};

})();

