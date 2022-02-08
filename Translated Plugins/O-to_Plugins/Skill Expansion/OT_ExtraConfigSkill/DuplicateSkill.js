
/*--------------------------------------------------------------------------------------------------
  
If you have multiple skills of the same type in the official script, only the one with the highest activation rate will be activated and checked.
  Priority is given to the one specified in Kaspara to check the activation.
  Also, for some skills, if you have multiple skills of the same type, it will be checked to activate in order of priority.

  If you have two or more similar skills in the processing of the official script,
  Even if only the skill with the higher activation rate is checked for activation and cannot be activated
  Since the activation check of other skills is passed through, the skill cannot be activated.
  As an example, let's say you have two types of continuous attacks (2 attacks, 3 attacks) that are activated by command skills.
  Even if one skill is selected by command skill, it will never be activated
  To prevent this from happening.
  
  Skills that activate the activation check in order of priority when you have multiple skills of the same type
  First strike, continuous attack, damage absorption, attack always hits, critical at counterattack, damage guard (originally checked by ID order), immortal
  Custom skill with SkillControl.checkAndPushCustomSkill to check activation

  how to use:
  Set the skill's custom parameters to something like {EC_Priority: 100}. If you have multiple skills of the same type
  Skills with high EC_Priority > Skills with low EC_Priority > Skills with no EC_Priority set and a high activation rate
  The activation check will be performed, and the effect of the skill for which the activation check was successful first will be activated.
  
  Author:
  o-to
  
  Change log:
  2020/01/01: Newly created
  
--------------------------------------------------------------------------------------------------*/

(function() {
// If you have the same skill as the specified skill
// Return the same skill group excluding the specified skill
OT_getPossessionSameSkill = function(unit, skillId, skilltype, keyword) {
	var arr = [];
	var count = 0;
	
	if(skilltype == SkillType.CUSTOM) {
		arr = SkillControl.getDirectSkillArray(unit, skilltype, keyword);
	} else {
		arr = SkillControl.getDirectSkillArray(unit, skilltype, '');
	}
	
	count = arr.length;
	if(count == 0) {
		return arr;
	}
	
	//root.log('Before checking skills: ' + skilltype);
	//for (var i = 0; i < count; i++) {
	//	root.log(arr[i].skill.getName());
	//}

	// Exclude designated skills
	count = arr.length;
	for (var i = 0; i < count; i++) {
		if(arr[i].skill.getId() === skillId) {
			arr.splice(i, 1);
			break;
		}
	}
	
	//arr.sort(function(a, b) {
	//	if( typeof a.skill.custom.EC_Priority == 'number' ) {
	//		if( typeof b.skill.custom.EC_Priority == 'number' ) {
	//			if(a.skill.custom.EC_Priority < b.skill.custom.EC_Priority) {
	//				return 1;
	//			} else {
	//				return -1;
	//			}
	//		} else {
	//			return -1;
	//		}
	//	} else {
	//		if( typeof b.skill.custom.EC_Priority == 'number' ) {
	//			return 1;
	//		}
	//		
	//		if (a.skill.getInvocationValue() < b.skill.getInvocationValue()) {
	//			return 1;
	//		} else {
	//			return -1;
	//		}
	//	}
	//})
	
	//root.log('After checking the skill group ');
	//count = arr.length;
	//for (var i = 0; i < count; i++) {
	//	root.log(arr[i].skill.getName());
	//}
	
	return arr;
};

// If you have the same skill as the specified skill
// Check the activation of similar skills excluding the specified skill and return the skill that was activated successfully 
OT_isArraySkillInvoked = function(unit, targetUnit, checkSkill, skilltype, keyword) {
	//if(checkSkill != null) {
	//	if(typeof checkSkill.custom.EC_CheckOnce == 'boolean') {
	//		if(checkSkill.custom.EC_CheckOnce == true) {
	//			EC_Putlog('Check stop flag:' + checkSkill.getName(), checkSkill);
	//			return null;
	//		}
	//	}
	//}
	
	//switch(skilltype) {
	//	case SkillType.CUSTOM :
	//		
	//		break;
	//		
	//	default :
	//		var arrSkill = OT_getPossessionSameSkill(unit, checkSkill.getId(), skilltype, '');
	//		var count = arrSkill.length;
	//		
	//		for (var i = 0; i < count; i++) {
	//			var skill = arrSkill[i].skill;
	//			result = SkillRandomizer.isSkillInvoked(unit, targetUnit, skill);
	//			if(result) {
	//				return skill;
	//			}
	//			
	//			if(typeof skill.custom.EC_CheckOnce == 'boolean') {
	//				if(skill.custom.EC_CheckOnce == true) {
	//					return null;
	//				}
	//			}
	//		}
	//		break;
	//}

	var arrSkill = OT_getPossessionSameSkill(unit, checkSkill.getId(), skilltype, keyword);
	var count = arrSkill.length;
	
	for (var i = 0; i < count; i++) {
		var skill = arrSkill[i].skill;
		result = SkillRandomizer.isSkillInvoked(unit, targetUnit, skill);
		if(result) {
			return skill;
		}
		
		//if(typeof skill.custom.EC_CheckOnce == 'boolean') {
		//	if(skill.custom.EC_CheckOnce == true) {
		//		EC_Putlog('Check stop flag: ' + skill.getName(), skill);
		//		return null;
		//	}
		//}
	}
	
	return null;
};

// If you have multiple continuous attack skills
// Check the activation of all possessed skills and execute the first successful skill to activate 
NormalAttackOrderBuilder.checkArrayAttackCount = function(virtualActive, virtualPassive, attackCount) {
	// Unless you have introduced a custom script that has significantly modified the processing inside the SkillControl.getBattleSkill function
    // You can acquire the skill that failed to activate in the processing of the official script 
	
	if (virtualActive.skillContinuousAttack === null) {
		var checkSkill = SkillControl.getBattleSkill(virtualActive.unitSelf, virtualPassive.unitSelf, SkillType.CONTINUOUSATTACK);
		if(checkSkill != null) {
			var skill = OT_isArraySkillInvoked(virtualActive.unitSelf, virtualPassive.unitSelf, checkSkill, SkillType.CONTINUOUSATTACK, '');
			if(skill !== null) {
				// The number of attacks is doubled by the skill of continuous attack 
				attackCount *= skill.getSkillValue();
				
				// Since there is no attackEntry, no additional processing is possible at this time.
				// Save it for later addition. 
				virtualActive.skillContinuousAttack = skill;
			}
		}
	}
	
	return attackCount;
};

// Processing with multiple consecutive attacks is performed in a unique function to make it easier to adjust compatibility with other plugins. 
var alias1 = NormalAttackOrderBuilder._getAttackCount;
NormalAttackOrderBuilder._getAttackCount = function(virtualActive, virtualPassive) {
	var attackCount = alias1.call(this, virtualActive, virtualPassive);
	
	return this.checkArrayAttackCount(virtualActive, virtualPassive, attackCount);
};

var alias2 = NormalAttackOrderBuilder._isDefaultPriority;
NormalAttackOrderBuilder._isDefaultPriority = function(virtualActive, virtualPassive) {
	var result = alias2.call(this, virtualActive, virtualPassive);
	var active = virtualActive.unitSelf;
	var passive = virtualPassive.unitSelf;
	var skilltype = SkillType.FASTATTACK;
	var skill, checkSkill;
	
	// When the defender's skill is activated
	// Check if you have multiple first strike skills of your allies 
	if(result == false) {
		checkSkill = SkillControl.getPossessionSkill(active, skilltype);
		if(checkSkill != null) {
			var skill = OT_isArraySkillInvoked(active, passive, checkSkill, skilltype, '');
			if(skill !== null) {
				delete active.custom.tmpActivateFastAttack;
				delete passive.custom.tmpActivateFastAttack;
				virtualPassive.skillFastAttack = null;
				return true;
			}
		}
	} else {
		// If true is returned, has the attacking skill been activated?
		// Either both skills have not been activated and have been processed
		// If the skill is activated by another script, tmpActivateFastAttack should be stored.
		// Check both first strike skills if not stored 
		if(typeof active.custom.tmpActivateFastAttack == 'undefined') {
			// Skill confirmation on the attacking side 
			checkSkill = SkillControl.getPossessionSkill(active, skilltype);
			if(checkSkill != null) {
				var skill = OT_isArraySkillInvoked(active, passive, checkSkill, skilltype, '');
				if(skill !== null) {
					delete active.custom.tmpActivateFastAttack;
					delete passive.custom.tmpActivateFastAttack;
					return true;
				}
			}
			
			// Defender skill confirmation
			checkSkill = SkillControl.getPossessionSkill(passive, skilltype);
			if(checkSkill != null) {
				var skill = OT_isArraySkillInvoked(passive, active, checkSkill, skilltype, '');
				if(skill !== null) {
					delete active.custom.tmpActivateFastAttack;
					delete passive.custom.tmpActivateFastAttack;
					virtualPassive.skillFastAttack = skill;
					return false;
				}
			}
		}
	}
	
	delete active.custom.tmpActivateFastAttack;
	delete passive.custom.tmpActivateFastAttack;
	return result;
};

// If you have more than one specified skill type
// Return any priority that has been set 
var alias100 = SkillControl._returnSkill;
SkillControl._returnSkill = function(skilltype, arr) {
	var result = alias100.call(this, skilltype, arr);
	var i;
	var count = arr.length;
	var max = -1000;
	var index = -1;
	
// Find the skill type and matching skill in arr.
// If there are multiple skills of the same type and there is a skill with a priority set
// Try to return high priority skills
// If the priority is not set, the processing result of the official script is returned. 
	for (i = 0; i < count; i++) {
		if( typeof arr[i].skill.custom.EC_Priority == 'number' ) {
			if (arr[i].skill.getSkillType() === skilltype && arr[i].skill.custom.EC_Priority > max) {
				max = arr[i].skill.custom.EC_Priority;
				index = i;
				EC_Putlog('Priority check: '+arr[i].skill.getName()+'['+arr[i].skill.custom.EC_Priority+']', arr[i].skill);
			}
		}
	}
	
	if (index === -1) {
		return result;
	}
	
	return arr[index].skill;
};

// Skills that are checked for activation with checkAndPushSkill are handled here.
// (Absorbs damage, attacks always hit, critical on counterattack, invulnerable)
var alias101 = SkillControl.checkAndPushSkill;
SkillControl.checkAndPushSkill = function(active, passive, attackEntry, isActive, skilltype) {
	var result = alias101.call(this, active, passive, attackEntry, isActive, skilltype);
	
	if(result == null) {
		var checkSkill = this.getPossessionSkill(active, skilltype);
		if(checkSkill != null) {
			var skill = OT_isArraySkillInvoked(active, passive, checkSkill, skilltype, '');
			if(skill !== null) {
				// Check if the skill is set to 'Show on activation'.
				if (skill.isSkillDisplayable()) {
					// If displayed, the skill should be saved so that it can be referenced when drawing
					if (isActive) {
						attackEntry.skillArrayActive.push(skill);
					}
					else {
						attackEntry.skillArrayPassive.push(skill);
					}
				}
				return skill;
			}
			return null;
		}
	}

	return result;
};

// Skills that are checked for activation with checkAndPushCustomSkill are processed here.
var alias102 = SkillControl.checkAndPushCustomSkill;
SkillControl.checkAndPushCustomSkill = function(active, passive, attackEntry, isActive, keyword) {
	var result = alias102.call(this, active, passive, attackEntry, isActive, keyword);
	
	if(result == null) {
		var checkSkill = this.getPossessionCustomSkill(active, keyword);
		if(checkSkill != null) {
			var skill = OT_isArraySkillInvoked(active, passive, checkSkill, SkillType.CUSTOM, keyword);
			if(skill !== null) {
				// Check if the skill is set to 'Show on activation'.
				if (skill.isSkillDisplayable()) {
					// If displayed, the skill should be saved so that it can be referenced when drawing
					if (isActive) {
						attackEntry.skillArrayActive.push(skill);
					}
					else {
						attackEntry.skillArrayPassive.push(skill);
					}
				}
				return skill;
			}
			return null;
		}
	}

	return result;
};

// Damage protection is checked for activation in ID order when the same type of skill is held, so
// Sort to check in order of priority
var alias103 = SkillControl.getDirectSkillArray;
SkillControl.getDirectSkillArray = function(unit, skilltype, keyword) {
	var result = alias103.call(this, unit, skilltype, keyword);
	
	// Sort by skill group
	// skills with priority > skills with no priority
	// If skills have no priority set, the one with the highest activation rate is preferred
	result.sort(function(a, b) {
		if( typeof a.skill.custom.EC_Priority == 'number' ) {
			if( typeof b.skill.custom.EC_Priority == 'number' ) {
				if(a.skill.custom.EC_Priority < b.skill.custom.EC_Priority) {
					return 1;
				} else {
					return -1;
				}
			} else {
				return -1;
			}
		} else {
			if( typeof b.skill.custom.EC_Priority == 'number' ) {
				return 1;
			}
			
			if (a.skill.getInvocationValue() < b.skill.getInvocationValue()) {
				return 1;
			} else {
				return -1;
			}
		}
	})

	return result;
};
})();

