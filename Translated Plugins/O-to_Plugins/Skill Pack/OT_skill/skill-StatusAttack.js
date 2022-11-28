
/*--------------------------------------------------------------------------
  
Skill "Stat Dependent Attack"
  The attack power of the skill owner and the defense power of the attack target were specified with custom parameters.
  It will be status dependent.
  
  Basically set the skill to the weapon,
  If you want to give it to a unit, it is recommended to make it a command skill.
  You can also use (strength/2 + technique/2) as attack power like the bow of Disgaea.
  
  Also, if you have both a non-command skill and a command skill,
  Normally, non-command skills are activated, and command skills are activated when command skills are activated.

  how to use:
  Select Custom in Skills and set [OT_StatusAttack] in Keywords.
  If SA_AttackValue is omitted, it depends on power for physical weapons and magic power for magic weapons.
  If you omit SA_DefenceValue, if the attacker's weapon is physical, it will be defense, and if it is magic, it will depend on magic defense.

  Custom parameter (each value can be omitted)
  
  {
      SA_AttackValue:
      {
          Level: 0.0
        , HP: 0.0
        , EP:0.0
        , FP: 0.0
        , POW:1.0
        , MAG: 0.0
        , SKI: 0.0
        , SPD: 0.0
        , LUK: 0.0
        , DEF: 0.0
        , MDF: 0.0
        , MOV: 0.0
        , WLV: 0.0
        , BLD: 0.0
        , WPN:1.0 //(default 1.0 when not specified)
      }
      ,
      SA_DefenceValue:
      {
          Level: 0.0
        , HP: 0.0
        , EP:0.0
        , FP: 0.0
        , POW: 0.0
        , MAG: 0.0
        , SKI: 0.0
        , SPD: 0.0
        , LUK: 0.0
        , DEF: 1.0
        , MDF: 0.0
        , MOV: 0.0
        , WLV: 0.0
        , BLD: 0.0
      }
  }
  
  Author:
  o-to
  
  Change log:
  2020/01/01: New
  
--------------------------------------------------------------------------*/

(function() {
var debugLog = function(msg, obj) {
	if(typeof EC_Putlog != 'undefined') {
		EC_Putlog(msg, obj);
	}
};

OT_GetStatusAttackValue = function(unit, weapon, skill) {
	var now = skill.custom.SA_AttackValue;
	var result = 0;
	if( now != null && unit != null ) {
		debugLog('Status dependent attack (Attack):', skill);
		for( var key in now ) {
			result += OT_GetParameterValue(unit, skill, key, now[key], weapon);
		}
		
		if(typeof now['WPN'] == 'undefined') {
			result += weapon.getPow();
		}
		
	} else if(now == null) {
		return AbilityCalculator.getPower(unit, weapon);
	}
	return result;
};

OT_GetStatusAttackDefValue = function(unit, targetUnit, weapon) {
	var list = DataVariable.Sdb.getList();
	var skill = list.getDataFromId(unit.custom.tmpStatusAttackID);
	delete unit.custom.tmpStatusAttackID;
	
	var result = 0;
	if (Miscellaneous.isPhysicsBattle(weapon)) {
		// physical or projectile attack
		result = RealBonus.getDef(targetUnit);
	}
	else {
		// magic attack
		result = RealBonus.getMdf(targetUnit);
	}

	if(skill == null) {
		return result;
	}
	var now = skill.custom.SA_DefenceValue;
	if( now != null && targetUnit != null ) {
		debugLog('Status dependent attack (defense):', skill);
		result = 0;
		for( var key in now ) {
			result += OT_GetParameterValue(targetUnit, skill, key, now[key]);
		}
	}
	return result;
};

OT_GetParameterValue = function(unit, skill, type, value, weapon) {
	// parameter not declared
	if(UnitParameter[type] == 'undefined') {
		switch(type) {
			case 'WPN':
				break;
				
			default:
				root.log(type + 'is an undeclared parameter.');
				return 0;
				break;
		}
	}
	
	var now = 0;
	var max = 0;
	var paramName = type;
	
	switch(type) {
		// HP, EP, FP get current value and maximum value respectively
		case 'HP':
			now = unit.getHp();
			max = ParamBonus.getMhp(unit);
			break;

		case 'EP':
			now = OT_GetNowEP(unit) - unit.custom.tmpUseEP;
			max = ParamBonus.getEp(unit);
			break;

		case 'FP':
			now = OT_GetNowFP(unit) - unit.custom.tmpUseFP;
			max = ParamBonus.getFp(unit);
			break;

		// For parameters other than HP, EP, and FP, the maximum value is the growth limit value
		case 'LV':
			now = unit.getLv();
			max = Miscellaneous.getMaxLv(unit);
			break;

		case 'WPN':
			now = weapon.getPow();
			break;

		default:
			now = ParamBonus.getBonus(unit, ParamType[type]);
			max = UnitParameter[type].getMaxValue(unit);
			paramName = UnitParameter[type].getParameterName();

			break;
	}
	debugLog(paramName + '~' + value, skill);
	return Math.floor(now * value);
};

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	//critical attack
	if (keyword === 'OT_StatusAttack') {
		// If it's not trigger type, simply return true
		return true;
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// Acquiring attack power
var alias2 = AbilityCalculator.getPower;
AbilityCalculator.getPower = function(unit, weapon) {
	var skill = SkillControl.getPossessionCustomSkill(unit, 'OT_StatusAttack');

	delete unit.custom.tmpStatusAttackID;
	if(skill != null) {
		var pow = OT_GetStatusAttackValue(unit, weapon, skill);
		unit.custom.tmpStatusAttackID = skill.getId();
		
		// If there is another script that overrides AbilityCalculator.getPower
		// Add 0 to the beginning of the OT_skill folder name to make this script the first in the loading order
		// merging descriptions
		
		return pow;
	}
	
	return alias2.call(this, unit, weapon);
};

// Setting of the side receiving damage
// If there is another script that overrides DamageCalculator.calculateDefense
// Add 0 to the beginning of the OT_skill folder name to make this script the first in the loading order
// merging descriptions
var alias3 = DamageCalculator.calculateDefense;
DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
	var def = 0;
	if(active.custom.tmpStatusAttackID != null) {
		def = OT_GetStatusAttackDefValue(active, passive, weapon);
		if (this.isNoGuard(active, passive, weapon, isCritical, trueHitValue)) {
			if( def > 0 ) {
				def = 0;
			}
			return def;
		}
		def += CompatibleCalculator.getDefense(passive, active, ItemControl.getEquippedWeapon(passive)) + SupportCalculator.getDefense(totalStatus);
		
	} else {
		def = alias3.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
	}
	
	return def;
};

// Type activated by command skill
var alias100 = SkillControl.getDirectSkillArray;
SkillControl.getDirectSkillArray = function(unit, skilltype, keyword) {
	var skillArray = alias100.call(this, unit, skilltype, keyword);
	
	if( typeof EC_DefineString != 'undefined' ) {
		if(skilltype == SkillType.CUSTOM && keyword == 'OT_StatusAttack') {
			var count = skillArray.length;
			var commandArray = [];
			var normalArray = [];
			for (var i = 0; i < count; i++) {
				var skill = skillArray[i].skill;
				
				if(OT_isCommandSkill(skill)) {
					if(EC_SkillCheck.SkillCheckCommand(unit, skill)) {
						// Add items that meet the activation conditions to the list
						if(EC_SkillCheck.isSkillCheckEnable(unit, skill, true)) {
							commandArray.push(skillArray[i]);
						}
					}
				} else {
					// Add items that meet the activation conditions to the list
					if(EC_SkillCheck.isSkillCheckEnable(unit, skill, true)) {
						normalArray.push(skillArray[i]);
					}
				}
			}
			
			// Commands that satisfy the conditions are returned with priority
			if(commandArray.length > 0) return commandArray;
			
			return normalArray;
		}
	}
	return skillArray;
};


})();

