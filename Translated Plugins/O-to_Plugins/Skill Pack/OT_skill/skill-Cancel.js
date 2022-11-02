
/*--------------------------------------------------------------------------
  
Skill "Cancel+"
   Reduces the opponent's number of rounds when the skill is activated.

   how to use:
   Select Custom in Skills and set [OT_Cancel] in Keywords.
  
   custom parameter
   {
     CancelCount: (number) //Set how many rounds to reduce
   }

   If CancelCount is unset, decrements all rounds.
  
   Author:
   o-to
  
   Change log:
   2015/4/19: Posted a prototype on a certain thread
   2016/6/13: Reworked what was posted in a certain thread
  
--------------------------------------------------------------------------*/


(function() {

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// critical attack
	if (keyword === 'OT_Cancel') {
		// If it's not trigger type, simply return true
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// damage settings
var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, attackEntry) {

	// If the skill is activated, cancel the opponent's action
	if (SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, attackEntry, true, 'OT_Cancel') !== null)
	{
		var skill = SkillControl.getPossessionCustomSkill(virtualActive.unitSelf, 'OT_Cancel');
		if(skill != null)
		{
			var custom = skill.custom;
			var count = custom.CancelCount;

			// When setting the number of times to decrease, decrease by that amount
			if( typeof count === 'number' )
			{
				virtualPassive.roundCount -= count;
			}
			else
			{
				virtualPassive.roundCount = 0;
			}
			
			if( virtualPassive.roundCount < 0 )
			{
				virtualPassive.roundCount = 0;
			}
		}
	}

	return alias2.call(this, virtualActive, virtualPassive, attackEntry);
};

})();

