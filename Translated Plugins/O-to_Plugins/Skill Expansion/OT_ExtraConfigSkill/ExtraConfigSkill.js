
/*--------------------------------------------------------------------------
  
  You will now be able to set more detailed conditions for the activation of skills.

  How to use:
  Set the skill's custom parameter as {EC_NowHP:'0-50%'}.
  (See the Appendix for more details)
  Please make sure you include this with TemporaryDataVirtualAttack.js.
  
  Created by :
  o-to
  
  Update history:
  30/05/2015: Newly created
  15/06/2015: Added triggering condition for this script.
             modified to call official function if custom parameter is not set
  2015/11/09:Fixed undefined display due to removal of official definition
  2015/12/06: Added command skills, created conditions to limit the number of times a skill can be used.
  2016/01/11:
  The return value of EC_SkillCheck.isCheckTriggerCount is now true if the trigger count limit is not tripped, and false if it is.
  If it is, it is false.
  Added the ability to judge the current value of EP and FP, and to set the EP and FP consumed.
  Added EP, FP and number of turns to command skill display conditions.
  Some parts are not working with official 1.048.
  Changed the algorithm of EC_OverStatus and EC_UnderStatus, since proficiency and physique are now included in the formula.
  Added EC_NowStatus and EC_OpponentNowStatus settings for range conditions on parameters other than HP.
  EC_NowHP will eventually be obsolete, so please set it to EC_NowStatus in the future.

  In the future, if a parameter is added, it will be possible to add a new parameter, except for the maximum value and the current value that exist separately, such as HP and MP.
  Unless there are exceptions, such as different naming conventions
  EC_NowStatus, EC_OpponentNowStatus
  EC_OverStatus and EC_UnderStatus without having to modify this script.

  24/04/2016:
  Moved most of the processing to ExtraConfigBase.js

  2016/08/29:
  Settings related to activation rate and disabling opponent's lookout skill
  Fixed a bug that caused the editor to ignore valid opponent settings.

  2017/02/05:
  Fixed a bug where you forgot to declare a variable used for the for loop.
  Fixed a bug that caused unintended behavior when another script forgot to declare the same variable.

  2017/05/15:
  Fixed the display of command skills attached to non-equipped weapons when selecting a command skill.
  After selecting a command skill attached to a weapon, the weapon selection screen now only shows the weapon with the relevant skill.
  Fixed a bug where the number of times you used a command skill was not counted correctly when re-activating

  01/05/2018:
  Fixed script details
  
  30/05/2018:
  When a weapon with a command skill is not selectable
  Fixed an issue where a weapon with a command skill could be selected
  Fixed a bug that when you select a weapon with an offensive command skill, you can't select an opponent that the skill doesn't work on (only in some conditions).
  
  19/11/2019:
  Added duration and cool time settings in command skills.
  EC_SkillCheck.isCheckTriggerCount function fixed.
  EC_SkillCheck.isCheckTriggerCountCommand function added and
  Fixed the count check process when the limit of the number of times a skill can be triggered in one map is set to command type.
  
  09/12/2019:
  Fixed the weapon selection list for offensive command skills that do not match the distance of the trigger condition and the range of the weapon.
  (Optimised isCommandSkillAttackable function)

  2020/01/01
  Added Custom Parameter to add the specified parameter to the activation rate.
  
  2020/03/29
  Fixed the possibility to set the cool time even if it is not a command skill.
  
--------------------------------------------------------------------------*/

(function() {

// Type of Fusion type limitation
OT_SkillFusionType = {
	  NORMAL: 'NORMAL'
	, ATTACK: 'ATTACK'
	, ALL   : 'ALL'
};

// Limited number of skills
OT_SkillTriggerCountType = {
	  BATTLE :'BATTLE'
	, TURN   :'TURN'
	, MAP    :'MAP'
	, ALL    :'ALL'
};

// Type of command skill
OT_SkillCommandType = {
	  ATTACK: 'ATTACK'
	, WAIT  : 'WAIT'
};

// Type of map type frequency limitation
OT_SkillTriggerMapType = {
	  MAP      : 'MAP'
	, COMMAND  : 'COMMAND'
};

// Set of command skill times
OT_CommandSkillSet = function() {
	return {
		  BATTLE : 0
		, TURN   : 0
		, MAP    : 0
	};
};

var alias1 = SkillRandomizer._isSkillInvokedInternal;
SkillRandomizer._isSkillInvokedInternal = function(active, passive, skill)
{
	// Show skill names
	EC_Putlog('Skill Name:'+skill.getName(), skill);
	
	// Once the data has been passed, it is checked for errors in the official functions.
	var result = alias1.call(this, active, passive, skill);

	var Percent = 0;
	var type = skill.getInvocationType();
	var value = skill.getInvocationValue();
	var DefaultPercent = 0;
	var Param = 0;

	// Check if the skill is a command skill, and if it is, check that it is selected from the command list.
	if( EC_SkillCheck.SkillCheckCommand(active, skill) == false )
	{
		return false;
	}

	// Check that you meet the skill activation requirements
	if( EC_EnableManager.SkillCheckActivity(active, passive, skill) == false )
	{
		return false;
	}
	
	//---Correction of the activation rate from the following---------------------------------------

	//--- If you have not made any settings regarding the correction of the rate of activation and the cut-off
	//--- Returns the result of a call to a formula function as is
	if(    skill.custom.EC_DefaultPercent == null
		&& skill.custom.EC_Correction == null
		&& skill.custom.EC_ScopePercent == null
		&& skill.custom.EC_isAbandonIgnore == null
		&& skill.custom.EC_AddTriggerRate == null
	)
	{
		EC_Putlog('No compensation for the rate of activation', skill);

		//Get probabilities for logging
		Percent = Probability.getInvocationPercent(active, type, value);
		
		EC_Putlog('Trigger Rate:' + Percent + '%', skill);
	}
	else
	{
		// If the setting is around the rate of activation, it will be corrected.

		// Valid partner check
		if (!skill.getTargetAggregation().isCondition(passive)) {
			EC_Putlog('Cannot be activated for non-effective opponents', skill);
			return false;
		}
		
		//--- Make sure your skills are of the dismissal type
		if( skill.custom.EC_isAbandonIgnore == null || skill.custom.EC_isAbandonIgnore == false )
		{
			// If the opponent can nullify the skill, the skill will not be activated.
			if (SkillControl.getBattleSkillFromFlag(passive, active, SkillType.INVALID, InvalidFlag.SKILL) !== null) {
				EC_Putlog('Cannot be triggered because the opponent has a cut-off', skill);
				return false;
			}
		}
		else
		{
			EC_Putlog('Skill to disable opponents disorientation', skill);
		}
		
		// Default probability
		if( skill.custom.EC_DefaultPercent != null )
		{
			DefaultPercent = skill.custom.EC_DefaultPercent;
			EC_Putlog('Default Trigger Rate:'+DefaultPercent, skill);
		}
		
		// Correction value
		if( skill.custom.EC_Correction != null )
		{
			//Actual skill activation rates are rounded down to the nearest whole number.
			value = value * skill.custom.EC_Correction;
			EC_Putlog('Correction value:'+skill.custom.EC_Correction, skill);
			EC_Putlog('Corrected coefficient:'+value, skill);
		}
	
		// Get probabilities from parameters
		// A function is now provided for calculating the activation probability, so that it can be corrected.
		Percent = Probability.getInvocationPercent(active, type, value);
		EC_Putlog('Parameter Trigger Bonus:'+Percent, skill);
		Percent += DefaultPercent;
		
		// Activation rate reflects status value
		Percent += OT_GetECAddTriggerRate(active, skill);

		// Probability range
		if( skill.custom.EC_ScopePercent != null )
		{
			var str = skill.custom.EC_ScopePercent;
			
			EC_Putlog('Probability range:' + skill.custom.EC_ScopePercent, skill);
			var regex = /^([0-9]+)\-([0-9]+)\%$/;
			if (str.match(regex))
			{
				var min = parseInt(RegExp.$1);
				var max = parseInt(RegExp.$2);
				if(Percent < min)
				{
					Percent = min;
				}
	
				if(Percent > max)
				{
					Percent = max;
				}
			}
		}
		EC_Putlog('Trigger Rate (rounded):' + Math.round( Percent ) + '%', skill);
		result = Probability.getProbability(Percent);
	}

	if( result == true ) {
		EC_SkillCheck.TriggerCountUp(active, skill);
		EC_SkillCheck.UseSkillExpendData(active, skill);

		// If it is not a command type
		// If cool time is set, set cool time.
		if( OT_isCommandSkill(skill) == false ) {
			EC_SkillCheck.setCoolTime(active, skill);
		}
		
		//EC_SkillCheck.setExtraEnableSkill(active, skill);
		
		// For processing in another script
		switch(skill.getSkillType()) {
			case SkillType.FASTATTACK:
				active.custom.tmpActivateFastAttack = true;
				break;
		}
	}
	
	EC_Putlog('Skill activation:' + result, skill);
	return result;
};

EC_SkillCheck = {

	// Count the number of times the skill is activated
	TriggerCountUp: function(active, skill) {
		var id = skill.getId();

		if( skill.custom.EC_TriggerCountBattle == null && skill.custom.EC_TriggerCountTurn == null && skill.custom.EC_TriggerCountMap == null )
		{
			return false;
		}

		// Initialisation of the number of activations
		if( active.custom.tmpSkillTriggerCount == null )
		{
			active.custom.tmpSkillTriggerCount = Array();
		}
		
		if( active.custom.tmpSkillTriggerCount[id] == null )
		{
			active.custom.tmpSkillTriggerCount[id] = OT_CommandSkillSet();
		}
		
		// Count of activations
		active.custom.tmpSkillTriggerCount[id].BATTLE++;
		active.custom.tmpSkillTriggerCount[id].TURN++;

		// If the map type frequency limit is the type where the frequency is reduced when the skill is activated
		if( skill.custom.EC_TriggerCountMap != null )
		{
			if( skill.custom.EC_TriggerCountMap[1] == OT_SkillTriggerMapType.MAP )
			{
				active.custom.tmpSkillTriggerCount[id].MAP++;
			}
		}
	},

	// Count the number of times the skill is activated (for commands)
	TriggerCountUpCommand: function(active, id) {
		var list = DataVariable.Sdb.getList();
		
		if( id == null ) {
			return ;
		}

		var skill = list.getDataFromId(id);

		if( skill.custom.EC_TriggerCountMap != null )
		{
			if( skill.custom.EC_TriggerCountMap[1] == OT_SkillTriggerMapType.COMMAND )
			{
				// Initialisation of the number of activations
				if( active.custom.tmpSkillTriggerCount == null )
				{
					active.custom.tmpSkillTriggerCount = Array();
				}
				
				if( active.custom.tmpSkillTriggerCount[id] == null )
				{
					active.custom.tmpSkillTriggerCount[id] = OT_CommandSkillSet();
				}

				active.custom.tmpSkillTriggerCount[id].MAP++;
			}
		}
	},

	// Check that the number of times you have used the skill has not exceeded the number of times it can be used.
	isCheckTriggerCount: function(active, skill) {
		var id = skill.getId();
		
		if( skill.custom.EC_TriggerCountBattle == null && skill.custom.EC_TriggerCountTurn == null && skill.custom.EC_TriggerCountMap == null )
		{
			return true;
		}

		// Debug message composition 
		var msg = 'Number of times it can be activated';

		// Combat
		if( skill.custom.EC_TriggerCountBattle != null )
		{
			msg += ' Combat:' + skill.custom.EC_TriggerCountBattle;
		}

		// Turn
		if( skill.custom.EC_TriggerCountTurn != null )
		{
			msg += ' TURN:' + skill.custom.EC_TriggerCountTurn;
		}

		// Maps
		if( skill.custom.EC_TriggerCountMap != null )
		{
			msg += ' MAP:' + skill.custom.EC_TriggerCountMap[0];
		}
		
		// Check activation conditions from here
		EC_Putlog(msg, skill);
		if( active.custom.tmpSkillTriggerCount == null )
		{
			EC_Putlog('Number of activations Combat:0 TURN:0 MAP:0', skill);
			return true;
		}

		if( active.custom.tmpSkillTriggerCount[id] == null )
		{
			EC_Putlog('Number of activations Combat:0 TURN:0 MAP:0', skill);
			return true;
		}

		var tmp = active.custom.tmpSkillTriggerCount[id];
		EC_Putlog('Number of activations Combat:' + tmp.BATTLE + ' TURN:' + tmp.TURN + ' MAP:' + tmp.MAP, skill);
		
		// Combat
		if( skill.custom.EC_TriggerCountBattle != null )
		{
			if( skill.custom.EC_TriggerCountBattle <= tmp.BATTLE )
			{
				return false;
			}
		}

		// turn 
		if( skill.custom.EC_TriggerCountTurn != null )
		{
			if( skill.custom.EC_TriggerCountTurn <= tmp.TURN )
			{
				return false;
			}
		}

		// map
		if( skill.custom.EC_TriggerCountMap != null )
		{
			if( skill.custom.EC_TriggerCountMap[1] == OT_SkillTriggerMapType.MAP) {
				if( skill.custom.EC_TriggerCountMap[0] <= tmp.MAP ) {
					return false;
				}
			}
		}

		return true;
	},

	// Check that the number of skill activations does not exceed the number of activations (for commands) 
	isCheckTriggerCountCommand: function(active, skill, isAfterCheck) {
		var id = skill.getId();
		
		if( skill.custom.EC_TriggerCountBattle == null && skill.custom.EC_TriggerCountTurn == null && skill.custom.EC_TriggerCountMap == null )
		{
			return true;
		}

		if(typeof isAfterCheck == 'undefined') {
			isAfterCheck = false;
		}
		
		//Debug message composition
		var msg = 'Number of times it can be activated ';
		var msg2 = '';

		// Combat
		if( skill.custom.EC_TriggerCountBattle != null )
		{
			msg += ' Combat:' + skill.custom.EC_TriggerCountBattle;
		}

		// turn
		if( skill.custom.EC_TriggerCountTurn != null )
		{
			msg += 'TURN:' + skill.custom.EC_TriggerCountTurn;
		}

		// map
		if( skill.custom.EC_TriggerCountMap != null && !isAfterCheck)
		{
			msg += ' MAP:' + skill.custom.EC_TriggerCountMap[0];
		}
		
		// Check the activation conditions from here
		EC_Putlog(msg, skill);
		if( active.custom.tmpSkillTriggerCount == null )
		{
			EC_Putlog('Number of activations Combat:0 TURN:0 Command:0', skill);
			return true;
		}

		if( active.custom.tmpSkillTriggerCount[id] == null )
		{
			EC_Putlog('Number of activations Combat:0 TURN:0 Command:0', skill);
			return true;
		}

		var tmp = active.custom.tmpSkillTriggerCount[id];
		EC_Putlog('Number of activations Combat:' + tmp.BATTLE + ' TURN:' + tmp.TURN + ' Command:' + tmp.MAP, skill);
		
		// Combat
		if( skill.custom.EC_TriggerCountBattle != null )
		{
			if( skill.custom.EC_TriggerCountBattle <= tmp.BATTLE )
			{
				return false;
			}
		}

		// Turn
		if( skill.custom.EC_TriggerCountTurn != null )
		{
			if( skill.custom.EC_TriggerCountTurn <= tmp.TURN )
			{
				return false;
			}
		}
		
		// Map
		if( skill.custom.EC_TriggerCountMap != null && !isAfterCheck)
		{
			if( skill.custom.EC_TriggerCountMap[0] <= tmp.MAP ) {
				return false;
			}
		}
		
		return true;
	},

	// Reset the number of skill activations
	ResetTriggerCount: function(unit, type) {
		var length = 0;
		var i = 0;
	
		if( unit.custom.tmpSkillTriggerCount != null )
		{
			// Reset all times at the end of the map
			if( type == OT_SkillTriggerCountType.ALL )
			{
				delete unit.custom.tmpSkillTriggerCount;
				//root.log(unit.getName() + 'Reset the number of skill activations');
				return;
			}

			length = unit.custom.tmpSkillTriggerCount.length;
			
			for( i=0 ; i<length ; i++ )
			{
				if( unit.custom.tmpSkillTriggerCount[i] != null )
				{
					switch(type)
					{
						case OT_SkillTriggerCountType.TURN :
							unit.custom.tmpSkillTriggerCount[i].TURN = 0;

						case OT_SkillTriggerCountType.BATTLE :
							unit.custom.tmpSkillTriggerCount[i].BATTLE = 0;
							break;
					}
				}
			}
		}
	},
	
	// Check if you selected the skill from the command
	SkillCheckCommand: function(active, skill, dbgMsg) {
		if(typeof dbgMsg == 'undefined') {
			dbgMsg = true;
		}
		
		// If it is not a command type, it will pass through
		if( OT_isCommandSkill(skill) == false )
		{
			return true;
		}
		
		if(dbgMsg) {
			if(active.custom.tmpCommandSkillID) {
				EC_Putlog('Triggered from a command:' + active.custom.tmpCommandSkillID, skill);
			} else {
				EC_Putlog('Triggered from a command', skill);
			}
		}

		if( active.custom.tmpCommandSkillID == skill.getId() ) {
			return true;
		} else {
			var duration = EC_GetCommandDuration(skill);
			if( duration != OT_CommandDurationUndefined) {
				return EC_SkillCheck.isDuration(active, skill.getId());
			}
		}
		
		return false;
	},

	// Judgment of availability from the current state when using command skills
	isSkillCheckEnable: function(unit, skill, isAfterCheck) {
		if( unit == null || skill == null )
		{
			return false;
		}
		
		if(typeof isAfterCheck == 'undefined') {
			isAfterCheck = false;
		}
		
		// Display skill name
		EC_Putlog('Skill name:'+skill.getName(), skill);

		// Confirm that the number of commands is not caught in the limit
		if( !this.isCheckTriggerCountCommand(unit, skill, isAfterCheck) ) return false;
		
		if(!isAfterCheck) {
			// Check if it's in cool time
			if( this.getCoolTime(unit, skill.getId()) > 0 ) return false;

			// Confirm that EP has a certain value before use
			if( !this.isUseEP(unit, skill, skill.custom.EC_UseEP) ) return false;
	
			// Confirm that FP has a certain value before use
			if( !this.isUseFP(unit, skill, skill.custom.EC_UseFP) ) return false;
		}
		
		//Check if the status is within a certain range
		if( !this.isNowStatusInRange(unit, null, skill) ) return false;
		
		// Check if it can be activated by the number of turns
		if( !EC_SituationCheck.isEnableTurn(skill) ) return false;
		
		return true;
	},

	// Judgment that it can be used from the current state when using the attack type command skill
	isSkillCheckEnableTypeAttack: function(unit, targetUnit, skill, isAfterCheck) {
		if( unit == null || skill == null )
		{
			return false;
		}

		if(typeof isAfterCheck == 'undefined') {
			isAfterCheck = false;
		}
		
		//Display skill name
		EC_Putlog('スキル名:'+skill.getName(), skill);

		// Confirm that the number of commands is not caught in the limit
		if( !this.isCheckTriggerCountCommand(unit, skill, isAfterCheck) ) return false;
		
		if(!isAfterCheck) {
			// Check if it's in cool time
			if( this.getCoolTime(unit, skill.getId()) > 0 ) return false;
			
			// Confirm that EP has a certain value before use
			if( !this.isUseEP(unit, skill, skill.custom.EC_UseEP) ) return false;
	
			// Confirm that FP has a certain value before use
			if( !this.isUseFP(unit, skill, skill.custom.EC_UseFP) ) return false;
		}
		
		// Check if the status is within a certain range
		if( !this.isNowStatusInRange(unit, targetUnit, skill) ) return false;
		
		//Activated at a distance from the opponent
		if( !EC_SituationCheck.isRangeEnable(unit, targetUnit, skill) ) return false;
		
		// Check if it can be activated by the number of turns
		if( !EC_SituationCheck.isEnableTurn(skill) ) return false;

		return true;
	},
	
	// In the case of attack type, is there an enemy within range?
	// If the weapon type is set to physical or magic in the skill activation condition, do you have the corresponding weapon?
	// Check if the command skill attached to the weapon can attack with the set weapon
	isCommandSkillAttackable: function(unit, skill, objecttype) {
		var i, j, k, item, indexArray;
		var count = UnitItemControl.getPossessionItemCount(unit);
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if(this.isCommandSkillAttackableWeapon(unit, skill, item, objecttype)) {
				return true;
				}
		}
		return false;
	},

	// Check if the weapon can attack according to the conditions of the command skill
	isCommandSkillAttackableWeapon: function(unit, skill, item, objecttype) {
		var i, j, k, item, indexArray;
		if (ItemControl.isWeaponAvailable(unit, item)) {
				// If you want to check if the weapon is physical or magic
				// Do you have a matching weapon with your own weapon?
				if( typeof skill.custom.EC_isPhysics == 'boolean' ) {
					var isPhysics = Miscellaneous.isPhysicsBattle(item);
					if( isPhysics != skill.custom.EC_isPhysics ) {
					return false;
					}
				}
				
				// If the skill is given to a weapon, check if you can attack with that weapon.
				if(objecttype === ObjectType.WEAPON) {
				var bNG = true;
					var list = item.getSkillReferenceList();
					var count2 = list.getTypeCount();
					for (j = 0; j < count2; j++) {
						if(skill == list.getTypeData(j)) {
						bNG = false;
						break;
					}
				}
				
				if(bNG) return false;
			}
			
			if( skill.custom.EC_Command == OT_SkillCommandType.ATTACK ) {
				// In the case of attack type, check if the skill can be activated against enemies within range
				indexArray = AttackChecker.getAttackIndexArray(unit, item, false);
				if (indexArray.length == 0) {
					return false;
				}
				
							var count3 = indexArray.length;
							for (k = 0; k < count3; k++) {
								var index = indexArray[k];
								var x = CurrentMap.getX(index);
								var y = CurrentMap.getY(index);
								var targetUnit = PosChecker.getUnitFromPos(x, y);
								if (targetUnit !== null && unit !== targetUnit) {
									// Check if the skill activation conditions are met
									if( this.isSkillCheckEnableTypeAttack(unit, targetUnit, skill) == true ) {
										return true;
									}
								}
							}
				} else {
				// In the case of standby type, it does not check against enemies within range
					return true;
				}
			}
		return false;
	},

	// When the weapon condition is set in the activation condition of the corresponding skill, check if it can be activated with the owned weapon
	isCommandSkillEnableWeaponCheck: function(unit, skill) {
		var i, j, k, item, indexArray;
		var count = UnitItemControl.getPossessionItemCount(unit);
		var err = true;
		
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (ItemControl.isWeaponAvailable(unit, item)) {
				// When checking whether the attack type is physical or magic,
				// Do you have a matching weapon with your own weapon?
				if( typeof skill.custom.EC_isPhysics == 'boolean' ) {
					var isPhysics = Miscellaneous.isPhysicsBattle(item);
					if( isPhysics == skill.custom.EC_isPhysics ) {
						return true;
					}
				} else {
					return true;
				}
			}
		}
		
		// If you do not have a weapon, make it unselectable if the skill has a weapon-related activation condition.
		if(count == 0) {
			if( typeof skill.custom.EC_isPhysics == 'boolean' ) {
				return false;
			}
			return true;
		}
		
		return false;
	},
		
	// Confirm that the specified status is within the range
	isNowStatusInRange: function(active, passive, skill) {
		var now         = skill.custom.EC_NowStatus;
		var opponentNow = skill.custom.EC_OpponentNowStatus;

		if( now != null && active != null )
		{
			EC_Putlog('Check the status range of the invoker', skill);
			for( var key in now )
			{
				if( !this.isParamInRange(active, skill, key, now[key]) )
				{
					return false;
				}
			}
		}
		
		if( opponentNow != null && passive != null )
		{
			EC_Putlog('Check the status range of the other party', skill);
			for( var key in opponentNow )
			{
				if( !this.isParamInRange(passive, skill, key, opponentNow[key]) )
				{
					return false;
				}
			}
		}
		
		return true;
	},

	// Check if the parameter is within range
	isParamInRange: function(unit, skill, type, strRange) {
		// No parameters declared
		if(UnitParameter[type] == 'undefined')
		{
			root.log(type + 'Is an undeclared parameter.');
			return 0;
		}
		
		var now = 0;
		var max = 0;
		var paramName = type;
		
		switch(type)
		{
			// HP, EP, FP get the current value and the maximum value respectively
			case 'HP':
				if(typeof unit.custom.tmpNowVirtualAttack == 'undefined')
				{
					now = unit.getHp();;
				}
				else
				{
					now = unit.custom.tmpNowVirtualAttack.hp;
				}

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

			// For parameters other than HP, EP, and FP, the maximum value is set as the growth limit value.
			case 'LV':
				now = unit.getLv();
				max = Miscellaneous.getMaxLv(unit);
				break;

			default:
				now = ParamBonus.getBonus(unit, ParamType[type]);
				max = UnitParameter[type].getMaxValue(unit);
				paramName = UnitParameter[type].getParameterName();

				break;
		}
		
		return this.isValueInRange(skill, now, max, strRange, paramName);
	},

	// Check if the value is within range
	isValueInRange: function(skill, nowValue, maxValue, str, paramName) {
		if( str == null )
		{
			return true;
		}
		
		var regex = /^([0-9]+)\-([0-9]+)\%$/;
		var regexNum = /^([0-9]+)\-([0-9]+)$/;
		//EC_Putlog(paramName + ':' + nowValue, skill);
		if (str.match(regex))
		{
			var min = parseInt(RegExp.$1);
			var max = parseInt(RegExp.$2);
			var MinPercent = Math.floor( maxValue * (min / 100) );
			var MaxPercent = Math.floor( maxValue * (max / 100) );

			EC_Putlog(paramName +  ':' + nowValue +' Activation range:' + MinPercent + ' to ' + MaxPercent + '(' + str + ')', skill);

			if( nowValue < MinPercent || MaxPercent < nowValue )
			{
				return false;
			}
		}
		else if(str.match(regexNum))
		{
			var min = parseInt(RegExp.$1);
			var max = parseInt(RegExp.$2);
			EC_Putlog(paramName +  ':' + nowValue +' Activation range:' + min + ' to ' + max, skill);

			if( nowValue < min || max < nowValue )
			{
				return false;
			}
		}
		
		return true;
	},

	// Check if the consumption EP is enough
	isUseEP: function(unit, skill, value) {
		if( unit == null || skill == null )
		{
			return false;
		}
		
		// Check consumption EP
		// If you can only attack or activate the skill, give priority to the attack
		if( value != null )
		{
			if(typeof OT_GetUseEP === 'undefined')
			{
				root.log('EP use: EP system not installed');
			}
			else
			{
				var weapon = ItemControl.getEquippedWeapon(unit);

				var nowEP = OT_GetNowEP(unit);
				if(typeof unit.custom.tmpUseEP == 'number') {
					nowEP -= unit.custom.tmpUseEP;
				}
				
				var useEP = OT_GetUseEP(unit, value);
				if( OT_BeforeAttackSkill ) {
					useEP += OT_GetItemUseEP(unit, weapon);
				}
				
				EC_Putlog('Current EP:' + nowEP + ' EP consumed:' + useEP, skill)
				if( nowEP < useEP )
				{
					return false;
				}
			}
		}
		
		return true;
	},

	// Check if the consumption FP is enough
	isUseFP: function(unit, skill, value) {
		if( unit == null || skill == null )
		{
			return false;
		}

		// Check consumption FP
		// If you can only attack or activate the skill, give priority to the attack
		if( value != null )
		{
			if(typeof OT_GetUseFP === 'undefined')
			{
				root.log('Using FP: FP system is not installed');
			}
			else
			{
				var weapon = ItemControl.getEquippedWeapon(unit);

				var nowFP = OT_GetNowFP(unit);
				if(typeof unit.custom.tmpUseFP == 'number') {
					nowFP -= unit.custom.tmpUseFP;
				}
				
				var useFP = OT_GetUseFP(unit, value);
				if( OT_BeforeAttackSkill ) {
					useFP += OT_GetItemUseFP(unit, weapon);
				}
				
				EC_Putlog('Current FP:' + nowFP + ' Consumed FP:' + useFP, skill)
				if( nowFP < useFP )
				{
					return false;
				}
			}
		}
		
		return true;
	},

	// EP and FP consumption when using skills
	UseSkillExpendData: function(unit, skill) {
		// Consume EP
		if( skill.custom.EC_UseEP != null )
		{
			if(typeof OT_GetUseEP === 'undefined')
			{
				root.log('EP use: EP system not installed');
			}
			else
			{
				unit.custom.tmpUseEP += OT_GetUseEP(unit, skill.custom.EC_UseEP);
			}
		}

		// Consume FP
		if( skill.custom.EC_UseFP != null )
		{
			if(typeof OT_GetUseFP === 'undefined')
			{
				root.log('Using FP: FP system is not installed');
			}
			else
			{
				unit.custom.tmpUseFP += OT_GetUseFP(unit, skill.custom.EC_UseFP);
			}
		}
	},

	// Immediate consumption of EP and FP when using skills (for commands)
	UseSkillCommandExpendData: function(unit, skill) {
		// Consume EP
		if( skill.custom.EC_UseEP != null ) {
			if(typeof OT_GetUseEP === 'undefined') {
				root.log('EP use: EP system not installed');
			} else {
				OT_UseNowEP( unit, OT_GetUseEP(unit, skill.custom.EC_UseEP) );
			}
		}

		//Consume FP
		if( skill.custom.EC_UseFP != null ) {
			if(typeof OT_GetUseFP === 'undefined') {
				root.log('Using FP: FP system is not installed');
			} else {
				OT_UseNowFP( unit, OT_GetUseFP(unit, skill.custom.EC_UseFP) );
			}
		}
	},
	
	//Make sure you meet the requirements for fusion skills
	isFusionSkill: function(active, passive, skill) {
		// Check your fusion ID
		if( !this.isSkillFusionID(active, skill, skill.custom.EC_FusionID) )
		{
			return false;
		}
		
		// Check the fusion ID of the other party
		if( !this.isSkillFusionID(passive, skill, skill.custom.EC_OpponentFusionID) )
		{
			return false;
		}
		
		return true;
	},

	// Check if the fusion type is specified
	isSkillFusionID: function(unit, skill, id) {

		if(unit == null || id == null)
		{
			return true;
		}
		
		var data = FusionControl.getFusionData(unit);
		var msg  = unit.getName();
		
		// False if not fused
		if( data == null )
		{
			EC_Putlog(msg + 'Cannot be activated because it is not fused', skill);
			return false;
		}

		var dataID = data.getId();
		EC_Putlog(msg + 'Fusion ID', skill);
		EC_Putlog('Activate if you include either:' + id, skill);
		
		for( var key in id )
		{
			if(typeof id[key] !== 'number') continue;

			if(id[key] === dataID) 
			{
				return true;
			}
		}
		
		return false;
	},

	// Set skill duration
	insertDuration: function(unit, skill) {
		var id = skill.getId()
		var duration = EC_GetCommandDuration(skill);
		//root.log("OK2:"+ id);
		EC_Putlog('Skill connection time：'+duration, skill);
		
		if( duration > 0 ) {
			// Initialization of the number of activations
			if( unit.custom.tmpECSkillDuration == null ) {
				unit.custom.tmpECSkillDuration = Array();
			}
			unit.custom.tmpECSkillDuration[id] = duration;
		}
	},

	// Check if the skill is ongoing
	isDuration: function(unit, id) {
		if( unit.custom.tmpECSkillDuration == null ) {
			return false;
		}
		
		if( typeof unit.custom.tmpECSkillDuration[id] == 'number' ) {
			if( unit.custom.tmpECSkillDuration[id] > 0 ) {
				return true;
			}
		}
		
		return false;
	},

	// Get skill duration
	getDuration: function(unit, id) {
		if( unit.custom.tmpECSkillDuration == null ) {
			return 0;
		}
		
		if( typeof unit.custom.tmpECSkillDuration[id] == 'number' ) {
			if( unit.custom.tmpECSkillDuration[id] > 0 ) {
				return unit.custom.tmpECSkillDuration[id];
			}
		}
		
		return 0;
	},

	// Reduced skill duration
	countDuration: function(unit, time) {
		if( typeof unit.custom.tmpECSkillDuration != 'undefined' ) {
			for( var key in unit.custom.tmpECSkillDuration ) {
				if( typeof unit.custom.tmpECSkillDuration[key] == 'number' ) {
					unit.custom.tmpECSkillDuration[key] -= time;
					//root.log(key + ':' + unit.custom.tmpECSkillDuration[key]);
				}
			}
		}
	},
	
	// Reset skill duration
	resetDuration: function(unit) {
		delete unit.custom.tmpECSkillDuration;
	},

	// Set reusable turns for skills
	setCoolTime: function(unit, skill) {
		var id = skill.getId()
		var coolTime = EC_GetCommandCoolTime(skill);
		
		//root.log("OK2:"+ id);
		
		if( coolTime > 0 ) {
			EC_Putlog('Number of turns required to reuse skills：' + coolTime, skill);
			// Initialization of the number of activations
			if( unit.custom.tmpECSkillCoolTime == null ) {
				unit.custom.tmpECSkillCoolTime = Array();
			}
			unit.custom.tmpECSkillCoolTime[id] = coolTime;
		}
	},

	// Check if there is a cool time for the skill
	getCoolTime: function(unit, id) {
		if( unit.custom.tmpECSkillCoolTime == null ) {
			return 0;
		}
		
		if( typeof unit.custom.tmpECSkillCoolTime[id] == 'number' ) {
			if( unit.custom.tmpECSkillCoolTime[id] > 0 ) {
				EC_PutlogDebug('Number of turns required to reuse skills：' + unit.custom.tmpECSkillCoolTime[id], id);
				return unit.custom.tmpECSkillCoolTime[id];
			}
		}
		
		return 0;
	},

	// Reduced skill reusable turns
	countCoolTime: function(unit, time) {
		if( typeof unit.custom.tmpECSkillCoolTime != 'undefined' ) {
			for( var key in unit.custom.tmpECSkillCoolTime ) {
				if( typeof unit.custom.tmpECSkillCoolTime[key] == 'number' ) {
					unit.custom.tmpECSkillCoolTime[key] -= time;
					//root.log(key + ':' + unit.custom.tmpECSkillCoolTime[key]);
				}
			}
		}
	},

	// Reset skill reusable turns
	resetCoolTime: function(unit) {
		delete unit.custom.tmpECSkillCoolTime;
	}

	//// Reset skill reusable turns
	//setExtraEnableSkill: function(unit, skill) {
	//	if( (skill.custom.EC_ExtraEnableSkill instanceof Array) == false ) {
	//		return;
	//	}
	//	
	//	if( unit.custom.tmpExtraEnableSkill == null ) {
	//		unit.custom.tmpExtraEnableSkill = Array();
	//	}
	//	
	//	var tmpArray = skill.custom.EC_ExtraEnableSkill;
	//	for(var i=0 ; i<tmpArray.length ; i++) {
	//		unit.custom.tmpExtraEnableSkill[] = tmpArray[i];
	//	}
	//},

	//// Reset skill reusable turns
	//getExtraEnableSkill: function(unit, skill) {
	//	if( (unit.custom.tmpExtraEnableSkill instanceof Array) == false ) {
	//		return false;
	//	}
	//	
	//	var result = unit.custom.tmpExtraEnableSkill.indexOf( skill.getId() );
	//	
	//	if( retult == -1 ) return false;
	//	
	//	return true;
	//}
};

//If the activation count limit type is battle, reset the activation count after battle
var alias2 = NormalAttackOrderBuilder._endVirtualAttack;
NormalAttackOrderBuilder._endVirtualAttack = function(virtualActive, virtualPassive)
{
	alias2.call(this, virtualActive, virtualPassive);

	var active  = virtualActive.unitSelf;
	var passive = virtualPassive.unitSelf;
	
	EC_SkillCheck.ResetTriggerCount(active, OT_SkillTriggerCountType.BATTLE);
	EC_SkillCheck.ResetTriggerCount(passive, OT_SkillTriggerCountType.BATTLE);
};

// If the activation count limit type is a turn, reset the activation count at the beginning of your army turn.
var alias3 = TurnMarkFlowEntry.doMainAction;
TurnMarkFlowEntry.doMainAction = function(isMusic)
{
	alias3.call(this, isMusic);

	// Reset when your turn begins
	if (root.getCurrentSession().getTurnType() === TurnType.PLAYER) {
		OT_ResetComandSkill(PlayerList.getMainList());
		OT_ResetComandSkill(EnemyList.getMainList() );
		OT_ResetComandSkill(AllyList.getMainList()  );

		OT_ResetTriggerCountList(PlayerList.getMainList(), OT_SkillTriggerCountType.TURN);
		OT_ResetTriggerCountList(EnemyList.getMainList() , OT_SkillTriggerCountType.TURN);
		OT_ResetTriggerCountList(AllyList.getMainList()  , OT_SkillTriggerCountType.TURN);
		
		// Countdown if there is a skill duration
		OT_ComandSkillCountDown(PlayerList.getMainList());
		OT_ComandSkillCountDown(EnemyList.getMainList());
		OT_ComandSkillCountDown(AllyList.getMainList());
	}
};

// Reset the skill activation count of all units when clearing the map
var alias4 = MapVictoryFlowEntry._completeMemberData;
MapVictoryFlowEntry._completeMemberData = function(battleResultScreen)
{
	OT_ResetComandSkill(PlayerList.getMainList());
	OT_ResetComandSkill(EnemyList.getMainList() );
	OT_ResetComandSkill(AllyList.getMainList()  );

	OT_ResetTriggerCountList(PlayerList.getMainList(), OT_SkillTriggerCountType.ALL);
	OT_ResetTriggerCountList(EnemyList.getMainList(), OT_SkillTriggerCountType.ALL);
	OT_ResetTriggerCountList(AllyList.getMainList(), OT_SkillTriggerCountType.ALL);
	
	//Skill duration reset
	OT_ComandSkillReset(PlayerList.getMainList());
	OT_ComandSkillReset(EnemyList.getMainList());
	OT_ComandSkillReset(AllyList.getMainList());

	return alias4.call(this, battleResultScreen);
};

// Reset the number of times the character is activated
OT_ResetTriggerCountList = function(list, type)
{
	var count = list.getCount();
	var unit;

	for ( var i=0 ; i<count ; i++ )
	{
		unit = list.getData(i);
		EC_SkillCheck.ResetTriggerCount(unit, type);
	}
};

//Reset command skills
OT_ResetComandSkill = function(list)
{
	var count = list.getCount();
	var unit;

	for ( var i=0 ; i<count ; i++ )
	{
		unit = list.getData(i);
		
		EC_SkillCheck.TriggerCountUpCommand(unit, unit.custom.tmpCommandSkillID);
		
		delete unit.custom.tmpCommandSkillID;
	}
	//root.log('reset');
};

// Reduced skill duration and cool time
OT_ComandSkillCountDown = function(list)
{
	var count = list.getCount();
	var unit;

	for ( var i=0 ; i<count ; i++ ) {
		unit = list.getData(i);
		EC_SkillCheck.countDuration(unit, 1);
		EC_SkillCheck.countCoolTime(unit, 1);
	}
};

// Reset skill duration and cool time
OT_ComandSkillReset = function(list)
{
	var count = list.getCount();
	var unit;

	for ( var i=0 ; i<count ; i++ ) {
		unit = list.getData(i);
		EC_SkillCheck.resetDuration(unit);
		EC_SkillCheck.resetCoolTime(unit);
	}
};

// Acquire all skills, including unequipped weapons you currently have
OT_getDirectSkillArrayAll = function(unit, skilltype, keyword) {
	// Acquire skills other than weapons
	var arr = SkillControl.getSkillMixArray(unit, null, skilltype, keyword);

	// Acquire the skills of weapons that can be equipped
	var objectFlag = ObjectFlag.UNIT | ObjectFlag.CLASS | ObjectFlag.WEAPON | ObjectFlag.ITEM | ObjectFlag.STATE | ObjectFlag.FUSION;
	if (objectFlag & ObjectFlag.WEAPON) {
		var count = UnitItemControl.getPossessionItemCount(unit);
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null && ItemControl.isWeaponAvailable(unit, item)) {
				// Add skills if items are available
				SkillControl._pushSkillValue(item, ObjectType.WEAPON, arr, skilltype, keyword);
			}
		}
	}

	return SkillControl._getValidSkillArray(arr);
};

// Get the setting value of EC_AddTriggerRate
OT_GetECAddTriggerRate = function(unit, skill) {
	var now = skill.custom.EC_AddTriggerRate;
	var result = 0;
	if( now != null && unit != null ) {
		for( var key in now ) {
			result += OT_GetECAddTriggerRateValue(unit, skill, key, now[key]);
		}
	}
	return result;
};

OT_GetECAddTriggerRateValue = function(unit, skill, type, value) {
	// No parameters declared
	if(UnitParameter[type] == 'undefined') {
		root.log(type + 'Is an undeclared parameter.');
		return 0;
	}
	
	var now = 0;
	var max = 0;
	var paramName = type;
	
	switch(type) {
		// HP, EP, FP get the current value and the maximum value respectively
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

		// For parameters other than HP, EP, and FP, the maximum value is set as the growth limit value.
		case 'LV':
			now = unit.getLv();
			max = Miscellaneous.getMaxLv(unit);
			break;

		default:
			if (DataConfig.isSkillInvocationBonusEnabled()) {
				now = ParamBonus.getBonus(unit, ParamType[type]);
			}
			else {
				now = unit.getParamValue(ParamType[type]);
			}

			max = UnitParameter[type].getMaxValue(unit);
			paramName = UnitParameter[type].getParameterName();

			break;
	}
	var result = Math.floor(now * value);
	EC_Putlog('Addition activation rate:' + paramName + '(' + now + ')×' + value + '＝' + result, skill);
	return result;
};

})();

