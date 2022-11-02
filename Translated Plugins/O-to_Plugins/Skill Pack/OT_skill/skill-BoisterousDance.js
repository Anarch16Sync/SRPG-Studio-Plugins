
/*--------------------------------------------------------------------------
  
Skill "Rumble"
  While possessing the skill, damage is halved, but attacks are performed 2-5 times.
  Attack count and damage rate can be changed with custom parameters

  how to use:
  Select Custom in Skills and set [OT_BoisterousDance] in Keywords.
  You can set the details of your skill by passing custom parameters.

  custom parameter
  {
      DamageRate : (number) //Set how much damage will be done
    , MaxAttackCount : (Number) //Maximum number of attacks
    , MinAttackCount : (Number) //Minimum number of attacks
    , isRateChange : (number) // 0 changes the damage rate just by having the skill, 1 changes the damage rate only when the skill is activated
    , isNoReattack : (number) //Set whether to be affected by integrated CalA's noreattack, 1 to receive, 0 to not
  }

  50 if DamageRate is not set
  If MaxAttackCount is not set, it will be 5.
  If MinAttackCount is not set, it will be 2.
  Will be 0 if isRateChange is not set.
  isNoReattack will be 1 if unset.
  
  Author:
  o-to
  
  Change log:
  2015/5/31: Create new
  2015/9/13:1-239 Correspond to noreattack of Integrated CalA
  2015/10/31: Corrected due to renaming of official functions

--------------------------------------------------------------------------*/


(function() {

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// boisterous dance
	if (keyword === 'OT_BoisterousDance') {
		// If it's not trigger type, simply return true
		
		// If 1-239's noreattack is set, it will not be activated
		if( skill.custom.isNoReattack == null || skill.custom.isNoReattack == 1 )
		{
			var weapon = active.getItem(0); 
			var wpt = weapon.isWeapon(); 
			if (wpt == true){ 
				if(weapon.custom.noreattack == 1){ 
					return false;
				}
			}
		}

		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// damage settings
var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, attackEntry) {
	var active = virtualActive.unitSelf;
	var passive = virtualPassive.unitSelf;
	var damage = alias2.call(this, virtualActive, virtualPassive, attackEntry);
	var skill = SkillControl.getPossessionCustomSkill(active, 'OT_BoisterousDance');
	
	if(skill != null)
	{
		if( skill.custom.isRateChange == 1 && virtualActive.tmpBoisterousDanceOn == false )
		{
			return damage;
		}
		
		var damage2;
		var custom = skill.custom;
		var percent = 0.5;
		
		if( custom.DamageRate != null )
		{
			percent = custom.DamageRate / 100;
		}

		damage2 = Math.floor(damage * percent);
		
		//If the damage caused by not possessing Ranbu is other than 0 and the damage due to Ranbu is below the decimal point, set the damage to 1
		if( damage != 0 && damage2 == 0 )
		{
			if(damage >= 0)
			{
				damage = 1;
			}
			else
			{
				damage = -1;
			}
		}
		else
		{
			damage = damage2;
		}
	}

	return damage;
};

// Processing before battle starts
var alias5 = NormalAttackOrderBuilder._getAttackCount;
NormalAttackOrderBuilder._getAttackCount = function(virtualActive, virtualPassive) {
	var skill;
	var attackCount = alias5.call(this, virtualActive, virtualPassive);
	
	skill = SkillControl.getPossessionCustomSkill(virtualActive.unitSelf, 'OT_BoisterousDance');
	
	if( skill != null )
	{
		//Initialize tmpBoisterousDanceOn here
		virtualActive.tmpBoisterousDanceOn = false;
		if ( SkillRandomizer.isCustomSkillInvokedInternal(virtualActive.unitSelf, virtualPassive.unitSelf, skill, 'OT_BoisterousDance') ) {
			var custom = skill.custom;
			var min = 2;
			var max = 5;

			if(custom.MinAttackCount != null)
			{
				min = custom.MinAttackCount;
			}
	
			if(custom.MaxAttackCount != null)
			{
				max = custom.MaxAttackCount;
			}
			
			n = min + root.getRandomNumber() % (max - min + 1);

			// The number of attacks is doubled by the skill of wild dance
			attackCount *= n;
			
			// Since there is no attackEntry, additional processing cannot be performed at this time.
			// Save to add later.
			virtualActive.tmpBoisterousDance = skill;
			virtualActive.tmpBoisterousDanceOn = true;
		}
	}
	
	return attackCount;
};

// Processing at the stage when attackEntry is created
var alias6 = NormalAttackOrderBuilder._setInitialSkill;
NormalAttackOrderBuilder._setInitialSkill = function(virtualActive, virtualPassive, attackEntry) {
	
	alias6.call(this, virtualActive, virtualPassive, attackEntry);
	
	if (virtualActive.tmpBoisterousDance != null) {
		if (virtualActive.tmpBoisterousDance.isSkillDisplayable()) {
			attackEntry.skillArrayActive.push(virtualActive.tmpBoisterousDance);
		}
		virtualActive.tmpBoisterousDance = null;
	}
};


})();

