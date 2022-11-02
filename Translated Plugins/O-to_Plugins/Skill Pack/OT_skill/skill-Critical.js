
/*--------------------------------------------------------------------------
  
Skill "Critical Attack"
   Critical will be activated when the skill is activated.

   how to use:
   Select Custom for the skill and set the keyword to [OT_Critical].
   * Used as a set with ExtraConfigSkill.js, the activation rate is 100%,
     If you set the custom parameter to {EC_NowHP: '0-50%'}
     You can reproduce FE's "anger" (always critical at HP 50% or less).
  
   Author:
   o-to
  
   Change log:
   2015/5/31: Newly created 
  
--------------------------------------------------------------------------*/


(function() {

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// Critical attack 
	if (keyword === 'OT_Critical') {
		// If it is not triggered, simply return true 
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// critical 
var alias2 = AttackEvaluator.HitCritical.isCritical;
AttackEvaluator.HitCritical.isCritical = function(virtualActive, virtualPassive, attackEntry) {
	if (SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, attackEntry, true, 'OT_Critical') !== null) {
		return true;
	}

	return alias2.call(this, virtualActive, virtualPassive, attackEntry);
};

})();

