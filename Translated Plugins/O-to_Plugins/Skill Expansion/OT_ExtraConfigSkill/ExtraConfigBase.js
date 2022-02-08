
/*--------------------------------------------------------------------------
  
  You will be able to set more detailed activation conditions.

  How to use:
  Set the skill's custom parameter to {EC_NowHP:'0-50%'}.
  (See the Appendix for more details)
  Please make sure you include this with TemporaryDataVirtualAttack.js.
  
  Created by :
  o-to
  
  Update history:
  24/04/2016:
  Moved most of the processing from ExtraConfigSkill.js
  Fusion, weapon type, and state can now be set as conditions for activating skills.
  2016/05/03:
  Fixed a bug where setting the number of attacks (triggerer, opponent) and distance from the opponent did not work correctly.
  Fixed the display in the skill information when setting the number of attacks (initiator, opponent) and the distance to the opponent

  2016/10/03:
  Fixed a bug that caused an error when setting FP usage

  2017/02/05:
  Fixed a bug where you forgot to declare the variable used for the for loop.
  If there is another script that forgot to declare it as well, it will cause unintended behavior.
  
  2018/05/01:
  EC_NowHP, EC_OpponentNowHP and EC_isDirectAttack have been removed.
  If you want to use them, please uncomment the SkillCheckActivity function.

  19/11/2019:
  Added definition of duration and cool time

  2019/12/09:
  After the update on 19/11/2019, if the initial members have skills with parameter bonuses, they will not be able to use them when selecting difficulty at the start of the game or in the base.
  Fixed an error when checking the details of a character with a parameter bonus skill in the base.

  2020/01/07:
  Fixed an issue that prevented the activation of skills during forced combat in events.
  When checking if a skill can be activated by the number of turns (isEnableTurn function).
  If the number of turns is not available, it will be treated as the first turn.

  2020/03/29
  Fixed the ability to set the cool time for non-command skills.
  
--------------------------------------------------------------------------*/

(function() {
// Constants
EC_DefineString = {
	  Max                 : 'Maximum'
	, AND                 : '&'
	, OR                  : 'or'
	, Opponent            : 'Opponents'
	, Opponent2           : 'Opponent'
	, CommandSkillAttack  : 'Command skill (Offensive)'
	, CommandSkillWait    : 'Command skill (Standby)'
	, TriggerCountCommand : 'Commands:'
	, TriggerCountMap     : 'Per Chapter:'
	, TriggerCountTurn    : 'Per Turn:'
	, TriggerCountBattle  : 'Per Combat:'
	, UsePoint            : 'Consumption:'
	, NowStatus           : 'Stats in Range'
	, AbandonIgnore       : 'Can be activated without regard to the opponents foresight'
	, Physics             : 'Equipped with a physical weapon'
	, Magic               : 'Weapons equipped are magical'
	, SrcTrue             : 'When initiating combat'
	, SrcFalse            : 'When attacked'
	, AttackCount         : 'Number of attacks:'
	, NonAttack           : 'Not attacked'
	, Count               : 'Times'
	, Range               : 'Distance between you and your target:'
	, Adjacent            : 'Adjacent'
	, Mass                : 'Mass'
	, OverStatus          : 'Your stats are higher than that of your opponent'
	, UnderStatus         : 'Status below a certain level'
	, Fusion              : 'Accompanying:'
	, FusionALL           : 'I am accompanying someone'
	, FusionNON           : 'Not in the same state'
	, ClassType           : 'Class Type:'
	, State               : 'Status:'
	, StateALL            : 'All state additions'
	, StateGood           : 'Additional assistance'
	, StateBad            : 'You are in an abnormal state.'
	, StateNon            : 'No state added'
	, StateNonGood        : 'No assistance added'
	, StateNonBad         : 'Not in a state of distress'
	, StateNonID          : 'It is not'
	, WeaponType          : 'Weapons:'
	, WeaponTypePhysics   : 'Melee'
	, WeaponTypeShoot     : 'Ranged'
	, WeaponTypeMagic     : 'Magic'
	, WeaponTypeNon       : 'Except'
	, CommandDuration     : 'Duration:'
	, CommandDurationNon  : 'Until next action'
	, CommandDurationTime : 'Turn'
	, CommandCoolTime     : 'Cooldown:'
	, CommandCoolTimeTurn : 'Turn'
	, NowCommandCoolTimeOK : '(Available)'
	, NowCommandCoolTimeNG : '(Until reusable: %d turns)'
	, AddTriggerRateMsg   : 'The following Stats are added to the trigger rate'
};

EC_DefineSetting = {
	  ALL       : 'ALL'
	, GOOD      : 'GOOD'
	, BAD       : 'BAD'
	, PHYSICS   : 'PHYSICS'
	, SHOOT     : 'SHOOT'
	, MAGIC     : 'MAGIC'
	, NON       : 'NON'
	, NONGOOD   : 'NONGOOD'
	, NONBAD    : 'NONBAD'
	, OR        : 'OR'
	, UNDEFINED : -1
};

// Status Definition Constants
EC_DefineStatus = {
	  LV : 'LV'
	, HP : 'HP'
	, EP : 'EP'
	, FP : 'FP'
};

// String array of parameters with separate current and maximum values
EC_NowStatusMapping = {
	  MHP : 'HP'
	, MEP : 'EP'
	, MFP : 'FP'
};

// Output log
var beforeData;
EC_Putlog = function(msg, obj)
{	
	var chkData = msg + obj.getId();
	//if(beforeData != null) {
	//	if(chkData == beforeData) {
	//		return;
	//	}
	//}
	
	if(obj.custom.EC_Putlog == 1 && msg != ''){
		root.log(msg);
		beforeData = chkData;
	}
};

EC_PutlogDebug = function(msg, id)
{	
	var chkData = msg + id;
	if(beforeData != null) {
		if(chkData == beforeData) {
			return;
		}
	}
	
	if(msg != ''){
		root.log(msg);
		beforeData = chkData;
	}
};

// Output log
EC_PutlogSystem = function(msg)
{
	if(root.getMetaSession().global.EC_Putlog == true && msg != '')
	{
		root.log(msg);
	}
};

// Determining if a skill is a command skill
OT_isCommandSkill = function(skill) {
	var value = skill.custom.EC_Command;
	
	if( value != null )
	{
		switch(value)
		{
			case OT_SkillCommandType.ATTACK:
			case OT_SkillCommandType.WAIT:
				return true;
		}
	}
	
	return false;
};

// Check that the value is within the range
EC_isValueInRange = function(nowValue, maxValue, range)
{
	if( range == null )
	{
		return true;
	}
	
	var regex = /^([0-9]+)\-([0-9]+)\%$/;
	var regexNum = /^([0-9]+)\-([0-9]+)$/;

	if (range.match(regex))
	{
		var min = parseInt(RegExp.$1);
		var max = parseInt(RegExp.$2);
		var MinPercent = Math.floor( maxValue * (min / 100) );
		var MaxPercent = Math.floor( maxValue * (max / 100) );

		if( nowValue < MinPercent || MaxPercent < nowValue )
		{
			return false;
		}
	}
	else if(range.match(regexNum))
	{
		var min = parseInt(RegExp.$1);
		var max = parseInt(RegExp.$2);

		if( nowValue < min || max < nowValue )
		{
			return false;
		}
	}
	
	return true;
};

EC_EnableManager = {
	SkillCheckActivity: function(active, passive, skill) {
		if(skill == null)
		{
			return false;
		}
		
		var msg = '';
		var isSrc = active.custom.tmpNowVirtualAttack.isSrc;
		
		//---Determine if the skill can be activated by the state of the activator---------------------------------------
/*
		var nowHP          = active.custom.tmpNowVirtualAttack.hp;
		var Mhp            = ParamBonus.getMhp(active);
	
		var passive_nowHP          = passive.custom.tmpNowVirtualAttack.hp;
		var passive_Mhp            = ParamBonus.getMhp(passive);
	
		var direction = PosChecker.getSideDirection(active.getMapX(), active.getMapY(), passive.getMapX(), passive.getMapY());
		var isDirectAttack = direction !== DirectionType.NULL;
		
		// Can be triggered if the current HP is within the set range
		// Use EC_NowStatus as it may become obsolete.
		if( skill.custom.EC_NowHP != null )
		{
			var str = skill.custom.EC_NowHP;
			
			if( !EC_StatusCheck.isValueInRange(skill, nowHP, Mhp, str, 'HP') )
			{
				return false;
			}
		}

		// Can be triggered if the opponent's current HP is within the set range.
		// Use EC_OpponentNowStatus as it may be obsolete.
		if( skill.custom.EC_OpponentNowHP != null )
		{
			var str = skill.custom.EC_OpponentNowHP;
			
			if( !EC_StatusCheck.isValueInRange(skill, passive_nowHP, passive_Mhp, str, '相手HP') )
			{
				return false;
			}
		}

		// Triggered by proximity or indirectness
		// Use EC_Range as it may eventually be obsolete
		if( skill.custom.EC_isDirectAttack != null )
		{
			if( skill.custom.EC_isDirectAttack )
			{
				EC_Putlog('近接攻撃で発動', skill);
			}
			else
			{
				EC_Putlog('Activated by indirect attack', skill);
			}
	
			if( isDirectAttack != skill.custom.EC_isDirectAttack )
			{
				return false;
			}
		}
*/
		// If not a command type.
		// If a cool time is set, check the cool time.
		if( OT_isCommandSkill(skill) == false ) {
			if(EC_SkillCheck.getCoolTime(active, skill.getId()) > 0) return false;
		}

		//---Your own and your opponent's status will be activated if they are in range
		if( EC_StatusCheck.isNowStatusInRange(active , skill, false) == false ) return false;
		if( EC_StatusCheck.isNowStatusInRange(passive, skill, true ) == false ) return false;
	
		//---Activate if you are above your opponent's status
		if( EC_StatusCheck.CheckOverStatus(active, passive, skill) == false ) return false;
	
		//---Activate if lower than opponent's status
		if( EC_StatusCheck.CheckUnderStatus(active, passive, skill) == false ) return false;
		
		// Check your consumption EP
		if( EC_StatusCheck.isUseEP(active, skill, skill.custom.EC_UseEP) == false ) return false;

		// Check FP consumption
		if( EC_StatusCheck.isUseFP(active, skill, skill.custom.EC_UseFP) == false ) return false;
		
		// Activation decision based on physical or magical
		if( EC_SituationCheck.isPhysicsEnable(active , skill, false) == false ) return false;
		if( EC_SituationCheck.isPhysicsEnable(passive, skill, true ) == false ) return false;
	
		//---Activation depends on the situation in the battle---------------------------------------
		
		// Check if it can be activated in a state of fusion
		if( EC_SituationCheck.isEnableFusionID(active , skill, false) == false ) return false;
		if( EC_SituationCheck.isEnableFusionID(passive, skill, true ) == false ) return false;
		
		// Check if it can be activated in the state of the state
		if( EC_SituationCheck.isEnableStateID(active , skill, false) == false ) return false;
		if( EC_SituationCheck.isEnableStateID(passive, skill, true ) == false ) return false;
		
		// Check if it can be activated by weapon type
		if( EC_SituationCheck.isEnableWeaponType(active , skill, false) == false ) return false;
		if( EC_SituationCheck.isEnableWeaponType(passive, skill, true ) == false ) return false;
		
		// Check if it can be activated in a number of turns
		if( EC_SituationCheck.isEnableTurn(skill) == false ) return false;
		
		// Can be triggered by first or second attack
		if( EC_SituationCheck.isEnableSrc(skill, isSrc) == false ) return false;
	
		// Triggered by a certain number of attacks before the skill is activated.
		if( EC_SituationCheck.isAttackCountEnable(active , skill, false) == false ) return false;
		if( EC_SituationCheck.isAttackCountEnable(passive, skill, true ) == false ) return false;

		// Activated at a distance from the opponent
		if( EC_SituationCheck.isRangeEnable(active, passive, skill) == false ) return false;
		
		// Limitations on the number of times it can be activated in combat
		if( EC_SkillCheck.isCheckTriggerCount(active, skill) == false ) return false;
		
		return true;
	}
};

EC_StatusCheck = {
	// Check that parameters are defined
	isDefineParam: function(type) {
		// Levels are defined by constants in the script
		switch(type)
		{
			case EC_DefineStatus.LV:
				return true;
		}

		// Parameters with separate current and maximum values
		for( var key in EC_NowStatusMapping )
		{
			if( type == EC_NowStatusMapping[key] )
			{
				if(typeof UnitParameter[key] == 'undefined')
				{
					//root.log(type + 'is an undeclared parameter.');
					return false;
				}
				return true;
			}
		}

		// Parameter not declared
		if(typeof UnitParameter[type] == 'undefined')
		{
			//root.log(type + 'is an undeclared parameter.');
			return false;
		}
		
		return true;
	},

	// Check that the specified status is within the range
	isNowStatusInRange: function(unit, obj, opponent) {
		var now    = obj.custom.EC_NowStatus;
		var result = EC_DefineSetting.UNDEFINED;
		var msg = 'Status range check';

		if( opponent )
		{
			now = obj.custom.EC_OpponentNowStatus;
			msg = 'The other party' + msg;
		}
		else
		{
			now = obj.custom.EC_NowStatus;
		}

		if( now != null && unit != null )
		{
			EC_Putlog(msg, obj);
			for( var key in now )
			{
				if( !this.isParamInRange(unit, obj, key, now[key]) )
				{
					return false;
				}
			}
			result = true;
		}
		
		return result;
	},
	
	// Check that parameters are within range
	isParamInRange: function(unit, obj, type, strRange) {
		// Check that the parameters are declared
		if(!this.isDefineParam(type))
		{
			root.log(type + 'は未宣言のパラメータです。');
			return 0;
		}

		var now = 0;
		var max = 0;
		var paramName = type;
		
		switch(type)
		{
			// The current HP, EP and FP values are taken as the current and maximum values respectively.
			case EC_DefineStatus.HP:
				if(typeof unit.custom.tmpNowVirtualAttack == 'undefined')
				{
					now = unit.getHp();
				}
				else
				{
					now = unit.custom.tmpNowVirtualAttack.hp;
				}

				max = ParamBonus.getMhp(unit);
				break;

			case EC_DefineStatus.EP:
				now = OT_GetNowEP(unit) - unit.custom.tmpUseEP;
				max = ParamBonus.getEp(unit);
				break;

			case EC_DefineStatus.FP:
				now = OT_GetNowFP(unit) - unit.custom.tmpUseFP;
				max = ParamBonus.getFp(unit);
				break;

			// For all other parameters, the maximum value is the growth limit.
			case EC_DefineStatus.LV:
				now = unit.getLv();
				max = Miscellaneous.getMaxLv(unit);
				break;

			default:
				now = ParamBonus.getBonus(unit, ParamType[type]);
				max = UnitParameter[type].getMaxValue(unit);
				paramName = UnitParameter[type].getParameterName();

				break;
		}
		
		return this.isValueInRange(obj, now, max, strRange, paramName);
	},

	// Check that the value is within the range
	isValueInRange: function(obj, nowValue, maxValue, str, paramName) {
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

			EC_Putlog(paramName +  ':' + nowValue +' Activation range:' + MinPercent + ' to ' + MaxPercent + '(' + str + ')', obj);

			if( nowValue < MinPercent || MaxPercent < nowValue )
			{
				return false;
			}
		}
		else if(str.match(regexNum))
		{
			var min = parseInt(RegExp.$1);
			var max = parseInt(RegExp.$2);
			EC_Putlog(paramName +  ':' + nowValue +' Activation range:' + min + ' to ' + max, obj);

			if( nowValue < min || max < nowValue )
			{
				return false;
			}
		}
		
		return true;
	},

	// Check if the consumption EP is sufficient
	isUseEP: function(unit, obj) {
		var value = null;
		if( unit == null || obj == null )
		{
			return false;
		}
		
		if( typeof obj.custom.EC_UseEP != 'undefined' )
		{
			value = obj.custom.EC_UseEP;
		}
		else if( typeof obj.custom.OT_EP != 'undefined' )
		{
			value = obj.custom.OT_EP.Use;
		}
				
		// Check the EP consumption
		// If you can only attack or activate a skill, make sure you prioritise the attack
		if( value != null )
		{
			if(typeof UnitParameter.MEP === 'undefined')
			{
				root.log('EP use: EP system not yet in place');
			}
			else
			{
				var weapon = ItemControl.getEquippedWeapon(unit);

				var nowEP = OT_GetNowEP(unit);
				if(typeof unit.custom.tmpUseEP == 'number') {
					nowEP -= unit.custom.tmpUseEP;
				}
				
				var useEP = OT_GetUseEP(unit, value);
				useEP += OT_GetItemUseEP(unit, weapon);
				
				EC_Putlog('Current EP:' + nowEP + ' Consumption EP:' + useEP, obj)
				if( nowEP < useEP )
				{
					return false;
				}
			}
		}
		else
		{
			return EC_DefineSetting.UNDEFINED;
		}
		
		return true;
	},

	// Check if you have enough FP for consumption
	isUseFP: function(unit, obj) {
		var value = null;
		if( unit == null || obj == null )
		{
			return false;
		}
		
		if( typeof obj.custom.EC_UseFP != 'undefined' )
		{
			value = obj.custom.EC_UseFP;
		}
		else if( typeof obj.custom.OT_FP != 'undefined' )
		{
			value = obj.custom.OT_FP.Use;
		}

		// Check the FP consumption
		// If you can only attack or activate a skill, make sure to prioritize the attack
		if( value != null )
		{
			if(typeof UnitParameter.MFP === 'undefined')
			{
				root.log('Use of FP: FP system is not yet in place');
			}
			else
			{
				var weapon = ItemControl.getEquippedWeapon(unit);

				var nowFP = OT_GetNowFP(unit);
				if(typeof unit.custom.tmpUseFP == 'number') {
					nowFP -= unit.custom.tmpUseFP;
				}
				
				var useFP = OT_GetUseFP(unit, value);
				useFP += OT_GetItemUseFP(unit, weapon);
				
				EC_Putlog('Current FP:' + nowFP + ' Consumption FP:' + useFP, obj)
				if( nowFP < useFP )
				{
					return false;
				}
			}
		}
		else
		{
			return EC_DefineSetting.UNDEFINED;
		}
		
		return true;
	},

	// Check if your status is higher than your partner's
	CheckOverStatus: function(active, passive, obj) {
		var over = obj.custom.EC_OverStatus;
		var isTrue  = false;
		var isFalse = false;
		var isOR    = false;
		var msg = '';
		var strTmp = '';
		
		for( var key in over )
		{
			if( key == 'TYPE' )
			{
				if( over[key] == EC_DefineSetting.OR ) isOR = true;
				continue;
			}
			
			var value = parseInt(over[key]);
			
			strTmp = EC_SituationRenderer.getParamName( key );
			if(strTmp != '') msg += strTmp + ':' + value + ' ';

			if( this.CheckStatusDiff(active, passive, key, -value) < 0 )
			{
				isFalse = true;
			}
			else
			{
				isTrue  = true;
			}
		}

		if(msg != '')
		{
			EC_Putlog('Activate if the following are greater than the specified value', obj)
			EC_Putlog(msg, obj);
		}
		
		if( isOR == false && isFalse == true  ) return false;
		if( isOR == true  && isTrue  == false ) return false;
		if( isTrue == true ) return true;

		return EC_DefineSetting.UNDEFINED;
	},

	// Check if your status is lower than your partner's
	CheckUnderStatus: function(active, passive, obj) {
		var under = obj.custom.EC_UnderStatus;
		var isTrue  = false;
		var isFalse = false;
		var isOR    = false;
		var msg = '';
		var strTmp = '';

		for( var key in under )
		{
			if( key == 'TYPE' )
			{
				if( under[key] == EC_DefineSetting.OR ) isOR = true;
				continue;
			}

			var value = parseInt(under[key]);
			
			strTmp = EC_SituationRenderer.getParamName( key );
			if(strTmp != '') msg += strTmp + ':' + value + ' ';
			
			if( this.CheckStatusDiff(active, passive, key, value) > 0 )
			{
				isFalse = true;
			}
			else
			{
				isTrue  = true;
			}
		}

		if(msg != '')
		{
			EC_Putlog('Activate if the following is less than the specified value', obj)
			EC_Putlog(msg, obj);
		}
		
		if( isOR == false && isFalse == true  ) return false;
		if( isOR == true  && isTrue  == false ) return false;
		if( isTrue == true ) return true;

		return EC_DefineSetting.UNDEFINED;
	},

	// Check the status difference between you and your opponent
	CheckStatusDiff: function(active, passive, type, value) {
		var diffValue = 0;
		var acValue = 0;
		var psValue = 0;
		
		// Check that the parameters are declared
		if(!this.isDefineParam(type))
		{
			return 0;
		}
		
		switch(type)
		{
			case EC_DefineStatus.LV:
				acValue = active.getLv();
				psValue = passive.getLv();
				diffValue = acValue + value - psValue;
				break;

			case EC_DefineStatus.HP:
				if(typeof active.custom.tmpNowVirtualAttack == 'undefined')
				{
					acValue = active.getHp();
					psValue = passive.getHp();
				}
				else
				{
					acValue = active.custom.tmpNowVirtualAttack.hp;
					psValue = passive.custom.tmpNowVirtualAttack.hp;
				}
				diffValue = acValue + value - psValue;
				break;

			case EC_DefineStatus.EP:
				acValue = OT_GetNowEP(active) - active.custom.tmpUseEP;
				psValue = OT_GetNowEP(passive) - passive.custom.tmpUseEP;
				diffValue = acValue + value - psValue;
				break;

			case EC_DefineStatus.FP:
				acValue = OT_GetNowFP(active) - active.custom.tmpUseFP;
				psValue = OT_GetNowFP(passive) - passive.custom.tmpUseFP;
				diffValue = acValue + value - psValue;
				break;

			default:
				acValue = ParamBonus.getBonus(active,  ParamType[type]);
				psValue = ParamBonus.getBonus(passive, ParamType[type]);
				diffValue = acValue + value - psValue;
				
				break;
		}
		
		return diffValue;
	}
};

EC_SituationCheck = {
	// Check whether it can be triggered by the first move or not.
	isEnableSrc: function(obj, isSrc) {
		if( obj == null ) return false;
		if( obj.custom.EC_isSrc == null ) return EC_DefineSetting.UNDEFINED;
		if( isSrc === null ) return true;

		var msg = '';

		if(obj.custom.EC_isSrc == true)
		{
			EC_Putlog('Triggered by first attack', obj);
		}
		else
		{
			EC_Putlog('Triggered by rear attack', obj);
		}

		if(isSrc == true)
		{
			EC_Putlog('Activator: first attack', obj);
		}
		else
		{
			EC_Putlog('Activator:Rear attack', obj);
		}
				
		if(isSrc != obj.custom.EC_isSrc)
		{
			return false;
		}
		
		return true;
	},
	
	// Check if it can be activated in a number of turns
	isEnableTurn: function(obj) {
		if( obj == null ) {
			return false;
		}
		
		// When one of the initial members has a parameter bonus system.
		// When the map is not open, such as at the start of the game
		// If the map is not open, or if the number of turns cannot be obtained
		// If the map is not open, or if the turn count is not available If the map is not open, or the number of turns is not available,
		// it should be treated as the first turn.
		var turn = 1;
		var cSession = root.getCurrentSession();
		
		if( cSession == null ) {
			//root.log('Map is not open :' + root.getCurrentScene());
			turn = 1;
		} else {
			// Because there is no function to determine whether the content obtained by root.getCurrentSession () is GameSession
			// Use to return an error when executing getTurnCount when it is not a GameSession,
			// When an error occurs, catch handles the number of turns as 1.
			try {
				turn = cSession.getTurnCount();
				
				// Fixed because the number of turns becomes 0 when forced battle occurs before the start of the map 
				if(turn < 1) {
					turn = 1;
				}
			} catch(e) {
				//root.log('Couldn't get turn: ' + root.getCurrentScene());
				turn = 1;
			}
		}

		var msg = '';
		var result = EC_DefineSetting.UNDEFINED;

		// Can be activated from the specified turn 
		if( obj.custom.EC_StartTurn != null )
		{
			msg = 'The number of turns' + obj.custom.EC_StartTurn + 'Can be activated with the above:' + 'Current' + turn + 'Turn ';
			EC_Putlog(msg, obj);
			if( !this.isMoreTurn(turn, obj.custom.EC_StartTurn) )
			{
				return false;
			}
			result = true;
		}
	
		// Can be activated up to the specified turn
		if( obj.custom.EC_EndTurn != null )
		{
			msg = 'The number of turns' + obj.custom.EC_EndTurn + 'Can be activated by: ' + 'Current' + turn + 'Turn ';
			EC_Putlog(msg, obj);
			if( !this.isMoreTurn(obj.custom.EC_EndTurn, turn) )
			{
				return false;
			}
			result = true;
		}
	
		// Can be activated if the turn is a specific multiple
		if( obj.custom.EC_TimesTurn != null )
		{
			msg = 'The number of turns' + obj.custom.EC_TimesTurn + 'Activated by multiples of :' + 'Current' + turn + 'Turn ';
			EC_Putlog(msg, obj);
			if( !this.isNotDiffMultTurn(turn, obj.custom.EC_TimesTurn) )
			{
				return false;
			}
			result = true;
		}
		
		return result;
	},
	
	// Check that the number of turns is higher than the one being compared
	isMoreTurn: function(turn, checkTurn) {
		if(typeof turn !== 'number' || typeof checkTurn !== 'number')
		{
			return false;
		}
		
		if( turn < checkTurn )
		{
			return false;
		}
		
		return true;
	},

	// Check if the turn is a specific multiple
	isNotDiffMultTurn: function(turn, checkTurn) {
		if(typeof turn !== 'number' || typeof checkTurn !== 'number')
		{
			return false;
		}
		
		var check = turn % checkTurn;

		if( check != 0 )
		{
			return false;
		}
		
		return true;
	},

	// Check if it can be activated by physical or magical means.
	isPhysicsEnable: function(unit, obj, opponent) {
		var conf = null;
		var weapon = ItemControl.getEquippedWeapon(unit);
		var msg = '';
		var isPhysics;
		
		if( opponent )
		{
			conf = obj.custom.EC_isOpponentPhysics;
		}
		else
		{
			conf = obj.custom.EC_isPhysics;
		}
		
		if( conf != null )
		{
			msg = EC_SituationRenderer.getPhysicsMessage(conf, opponent)
			EC_Putlog(msg, obj);

			if( weapon == null )
			{
				EC_Putlog('Not triggered due to lack of weapons', obj);
				return false;
			}
			isPhysics = Miscellaneous.isPhysicsBattle(weapon);
	
			if( isPhysics != conf )
			{
				return false;
			}
		}
		else
		{
			return EC_DefineSetting.UNDEFINED;
		}

		return true;
	},

	// Triggered by a certain number of attacks before the skill is activated.
	isAttackCountEnable: function(unit, obj, opponent) {
		var conf = null;
		var AttackCount = unit.custom.tmpNowVirtualAttack.motionAttackCount;
		var msg = '';
		
		if(AttackCount == null)
		{
			return true;
		}
		
		if( opponent )
		{
			conf = obj.custom.EC_OpponentAttackCount;
		}
		else
		{
			conf = obj.custom.EC_AttackCount;
		}
		
		if( conf != null )
		{
			msg = EC_SituationRenderer.getAttackCountMessage(conf, opponent)
			EC_Putlog(msg, obj);

			if( !EC_isValueInRange(AttackCount, AttackCount, conf) )
			{
				return false;
			}
		}
		else
		{
			return EC_DefineSetting.UNDEFINED;
		}

		return true;
	},

	// Activated at a distance from the opponent
	isRangeEnable: function(active, passive, obj) {
		if( active == null || passive == null )
		{
			return true;
		}

		var conf = obj.custom.EC_Range;
		var range = Math.abs(active.getMapX() - passive.getMapX()) + Math.abs(active.getMapY() - passive.getMapY());
		var msg = '';
		
		if( conf != null )
		{
			msg = EC_SituationRenderer.getRangeMessage(conf)
			EC_Putlog(msg, obj);

			if( !EC_isValueInRange(range, range, conf) )
			{
				return false;
			}
		}
		else
		{
			return EC_DefineSetting.UNDEFINED;
		}

		return true;
	},
	
	// Check that you meet the requirements for Fusion-specific skills.
	isEnableFusion: function(active, passive, obj) {
		// Check your Fusion ID
		if( !this.isEnableFusionID(active, obj, obj.custom.EC_FusionID) )
		{
			return false;
		}
		
		// Check the other person's Fusion ID
		if( !this.isEnableFusionID(passive, obj, obj.custom.EC_OpponentFusionID) )
		{
			return false;
		}
		
		return true;
	},

	// Check that the fusion type is the one specified
	isEnableFusionID: function(unit, obj, opponent) {
		var id;
		
		if( opponent )
		{
			id = obj.custom.EC_OpponentFusionID;
		}
		else
		{
			id = obj.custom.EC_FusionID;
		}
		
		if(unit == null || id == null)
		{
			return EC_DefineSetting.UNDEFINED;
		}
		
		var data = FusionControl.getFusionData(unit);
		var msg  = unit.getName();

		if( data == null )
		{
			EC_Putlog(msg + 'are not fused.', obj);
			if( id == EC_DefineSetting.NON )
			{
				return true;
			}
			
			return false;
		}
		else
		{
			EC_Putlog(msg + 'is in fusion', obj);
			// True if you have to have some kind of fusion.
			if( id == EC_DefineSetting.ALL )
			{
				EC_Putlog(msg + 'is activated by fusion', obj);
				return true;
			}
			else if( id == EC_DefineSetting.NON )
			{
				EC_Putlog(msg + 'cannot be triggered by fusion', obj);
				return false;
			}
		}

		var dataID = data.getId();
		EC_Putlog(msg + 'Fusion check of', obj);
		EC_Putlog('Activated if any of the following is included:' + id, obj);
		
		for( var i=0 ; i<id.length ; i++ )
		{
			if(typeof id[i] !== 'number') continue;

			if(id[i] === dataID) 
			{
				return true;
			}
		}
		
		return false;
	},

	// Check that the state type is the one specified
	isEnableStateID: function(unit, obj, opponent) {
		var id;
		
		if( opponent )
		{
			id = obj.custom.EC_OpponentStateID;
		}
		else
		{
			id = obj.custom.EC_StateID;
		}
		
		if(unit == null || id == null)
		{
			return EC_DefineSetting.UNDEFINED;
		}
		
		var list = unit.getTurnStateList();
		var count = list.getCount();
		var msg  = unit.getName();
		
		// If the state has not been granted
		if( count == 0 )
		{
			EC_Putlog(msg + 'is not state-attached', obj);

			if( typeof id == 'string' )
			{
				switch(id)
				{
					case EC_DefineSetting.NON:
					case EC_DefineSetting.NONGOOD:
					case EC_DefineSetting.NONBAD:
						EC_Putlog('Can be activated without state', obj);
						return true;
						break;
				}
			}
			return false;
		}
		else
		{
			// True if you have to state something.
			if( id == EC_DefineSetting.ALL )
			{
				return true;
			}
		}

		EC_Putlog(msg + 'State checks for', obj);
		EC_Putlog('Activated if any of the following is included:' + id, obj);
		
		var nonFlag = false;
		var hitCount = 0;
		
		for (var i = 0; i < count; i++) {
			var turnState = list.getData(i);
			var State = turnState.getState();
			var isBad = State.isBadState();
			var dataID = State.getId();
			
			if( typeof id == 'string' )
			{
				switch(id)
				{
					case EC_DefineSetting.GOOD:
						if( isBad == false ) return true;
						break;
	
					case EC_DefineSetting.BAD:
						if( isBad == true ) return true;
						break;
						
					case EC_DefineSetting.NONGOOD:
						EC_Putlog(isBad, obj);
						if( isBad == false ) return false;
						hitCount++;
						break;
	
					case EC_DefineSetting.NONBAD:
						if( isBad == true ) return false;
						hitCount++;
						break;
				}
			}
			else if(typeof id == 'object')
			{
				for( var j=0 ; j<id.length ; j++ )
				{
					if( typeof id[i] == 'string' )
					{
						if(id[i] == EC_DefineSetting.NON)
						{
							nonFlag = true;
						}
						continue;
					}
			
					if(typeof id[j] !== 'number') continue;
		
					if(id[j] === dataID) 
					{
						hitCount++;
					}
				}
			}
		}
		
		// Cannot be triggered if the state is trapped
		if(nonFlag == true)
		{
			if( hitCount > 0 )
			{
				return false;
			}
			else
			{
				return true;
			}
		}
		else
		{
			if( hitCount > 0 )
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		return false;
	},

	// Check that the weapon type is the specified one
	isEnableWeaponType: function(unit, obj, opponent) {
		var id;
		
		if( opponent )
		{
			id = obj.custom.EC_OpponentWeaponType;
		}
		else
		{
			id = obj.custom.EC_WeaponType;
		}
		
		if(unit == null || id == null)
		{
			return EC_DefineSetting.UNDEFINED;
		}

		var msg  = unit.getName();
		EC_Putlog(msg + 'Weapon type check for', obj);
		EC_Putlog('Activated if any of the following is included:', obj);
		EC_Putlog(EC_SituationRenderer.getWeaponTypeMessage(id, opponent), obj);
		
		var weapon = ItemControl.getEquippedWeapon(unit);
		var nonFlag = false;
		var hitCount = 0;

		// When weapon is not equipped
		if( weapon == null )
		{
			EC_Putlog('Unarmed', obj);
			
			if( typeof id == 'object' )
			{
				for( var key in id ) {
					switch(key)
					{
						case EC_DefineSetting.NON     :
							nonFlag = id[key];
					}
				}
			}
			
			return nonFlag;
		}

		var weaponType         = weapon.getWeaponType();
		var weaponCategoryType = weaponType.getWeaponCategoryType();
		var weaponID           = weaponType.getId();

		if( typeof id == 'object' )
		{
			for( var key in id ) {
				switch(key)
				{
					case EC_DefineSetting.PHYSICS :
						index = WeaponCategoryType.PHYSICS;
						break;

					case EC_DefineSetting.SHOOT   :
						index = WeaponCategoryType.SHOOT;
						break;

					case EC_DefineSetting.MAGIC   :
						index = WeaponCategoryType.MAGIC;
						break;

					case EC_DefineSetting.NON     :
						nonFlag = id[key];
						continue;
						
					default:
						index = -1;
						continue;
						break;
				}

				if(weaponCategoryType == index)
				{
					if(typeof id[key] == 'object')
					{
						for( var i=0 ; i<id[key].length ; i++ )
						{
							if( id[key][i] == weaponID)
							{
								hitCount++;
							}
						}
					}
					else if(id[key] == EC_DefineSetting.ALL)
					{
						hitCount++;
					}
				}
			}
		}
		
		// If it is stuck, it cannot be activated.
		if(nonFlag == true)
		{
			if( hitCount > 0 )
			{
				return false;
			}
			else
			{
				return true;
			}
		}
		else
		{
			if( hitCount > 0 )
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		return false;
	}
};

// Conditional drawing relationships around the triggering conditions
EC_SituationRenderer = {
	// Get parameter name
	getParamName: function( type )
	{
		// Check parameter definition
		if( !EC_StatusCheck.isDefineParam(type) )
		{
			return '';
		}

		// Returns a constant because the level is defined by a constant in the script
		switch(type)
		{
			case EC_DefineStatus.LV:
				return StringTable.Status_Level;
		}

		// Parameters with separate current and maximum values
		for( var key in EC_NowStatusMapping )
		{
			if( type == key )
			{
				return EC_DefineString.Max + UnitParameter[key].getParameterName();
			}
			
			if( type == EC_NowStatusMapping[key] )
			{
				return UnitParameter[key].getParameterName();
			}
		}
		
		return UnitParameter[type].getParameterName();
	},
	
	// For range
	getParamRangeMessage: function( type, msg ) {
		if( !EC_StatusCheck.isDefineParam(type) )
		{
			return '';
		}
		var name = this.getParamName(type);
		var str = name + ':' + msg.replace( /\-/g , " to " ) ;
		
		return str;
	},

	// Command skill messages
	getCommandSkillMessage: function(obj) {
		msg = '';
		
		switch(obj)
		{
			case OT_SkillCommandType.ATTACK:
				msg = EC_DefineString.CommandSkillAttack;
				break;

			case OT_SkillCommandType.WAIT:
				msg = EC_DefineString.CommandSkillWait;
				break;
		}

		return msg;
	},

	// Messages for setting lower and upper activation rates
	getScopePercentMessage: function(obj) {
		msg = '';
		
		//If you have set a lower or upper limit on the activation rate
		if( obj != null ) 
		{
			var str = obj;
			
			var regex = /^([0-9]+)\-([0-9]+)/;
			if (str.match(regex))
			{
				var min = parseInt(RegExp.$1);
				var max = parseInt(RegExp.$2);
				msg = 'Activation rate Lower limit:' + min + '％ Upper limit :' + max + '％';
			}
		}

		return msg;
	},

	//Activation frequency setting message
	getTriggerCountMessage: function(map, turn, battle) {
		msg = '';
		
		if( map != null ) 
		{
			if(map[1] == OT_SkillTriggerMapType.COMMAND)
			{
				msg += EC_DefineString.TriggerCountCommand + map[0] + ' times ';
			}
			else if(map[1] == OT_SkillTriggerMapType.MAP)
			{
				msg += EC_DefineString.TriggerCountMap + map[0] + ' times ';
			}
		}
	
		if( turn != null ) 
		{
			if( msg != '' ) msg += '/';
			msg += EC_DefineString.TriggerCountTurn + turn + ' times ';
		}
	
		if( battle != null ) 
		{
			if( msg != '' ) msg += '/';
			msg += EC_DefineString.TriggerCountBattle + battle + ' times ';
		}

		return msg;
	},

	//Message of the disregard setting
	getAbandonIgnoreMessage: function(obj) {
		msg = '';
		
		if( obj == true ) 
		{
			msg = EC_DefineString.AbandonIgnore;
		}

		return msg;
	},

	//Messages for consumption EP and consumption FP settings
	getUsePointMessage: function(ep, fp) {
		msg = '';
		
		if( ep != null || fp != null )
		{
			msg = EC_DefineString.UsePoint;
			var msg2 = '';
			
			if( ep != null )
				msg2 += this.getParamName(EC_DefineStatus.EP) + ':' + ep;
	
			if( msg2 != '' ) msg2 += ' ';
	
			if( fp != null )
				msg2 += this.getParamName(EC_DefineStatus.FP) + ':' + fp;
	
			msg = msg + msg2;
		}

		return msg;
	},
			
	//Physical or magical setting
	getPhysicsMessage: function(obj, opponent) {
		var add = '';
		var msg = '';
		if(opponent == true) add = EC_DefineString.Opponent;
		
		if( obj != null )
		{
			if( obj )
			{
				msg = EC_DefineString.Physics;
			}
			else
			{
				msg = EC_DefineString.Magic;
			}
			
			msg = add + msg;
		}

		return msg;
	},

	// Turn setting messages
	getTurnMessage: function(strat, end, times) {
		var msg = '';

		// When there is a set number of turns
		if( strat != null || end != null || times != null )
		{
			msg = 'Number of turns:';
		}

		// Can be activated from a specific turn
		if( strat != null || end != null )
		{
			if( strat != null && end != null )
			{
				if( strat == end )
				{
					msg += '' + 'Only on the turn ' + strat ;
				}
				else
				{
					msg += strat + ' to ' + end + ' ';
				}
			} 
			else if( strat != null )
			{
				// Can be activated from the specified turn 
				msg +=  'More than ' + strat ;
			}
			else if( end != null )
			{
				// Can be activated until the specified turn 
				msg +=  'Less than ' + end;
			}
		}

		// Can be activated if the turn is a specific multiple 
		if( times != null )
		{
			msg += 'Multiple of ' + times;
		}
		
		return msg;
	},
	
	// Message of first attack and second attack setting 
	getSrcMessage: function(obj) {
		var msg = '';

		if( obj != null )
		{
			if(obj == true)
			{
				msg = EC_DefineString.SrcTrue;
			}
			else
			{
				msg = EC_DefineString.SrcFalse;
			}
		}
		
		return msg;
	},

	// Attack count setting message 
	getAttackCountMessage: function(obj, opponent) {
		var add = '';
		var msg = '';
		var min = -1;
		var max = -1;

		if(opponent == true) add = EC_DefineString.Opponent;
		
		if( obj != null )
		{
			msg = add + EC_DefineString.AttackCount;
			var regex = /^([0-9]+)\-([0-9]+)/;
			if (obj.match(regex))
			{
				min = parseInt(RegExp.$1);
				max = parseInt(RegExp.$2);
			}

			if( min == 0 && max == 0 )
			{
				msg += EC_DefineString.NonAttack;
			}
			else if( min == max )
			{
				msg += min;
				msg += EC_DefineString.Count;
			}
			else
			{
				msg += obj;
				msg = msg.replace(/\-/g, ' to ');
				msg += EC_DefineString.Count;
			}
		}
		
		return msg;
	},
	
	// Message of activation setting at the distance from the other party 
	getRangeMessage: function(obj) {
		var add = '';
		var msg = '';
		var min = -1;
		var max = -1;

		if( obj != null )
		{
			msg = EC_DefineString.Range;
			var regex = /^([0-9]+)\-([0-9]+)/;
			if (obj.match(regex))
			{
				min = parseInt(RegExp.$1);
				max = parseInt(RegExp.$2);
			}

			if( min == 1 && max == 1 )
			{
				msg += EC_DefineString.Adjacent;
			}
			else if( min == max )
			{
				msg += min;
				msg += EC_DefineString.Mass;
			}
			else
			{
				msg += obj;
				msg = msg.replace(/\-/g, ' to ');
				msg += EC_DefineString.Mass;
			}
		}
		
		return msg;
	},

	// Fusion setting message 
	getFusionMessage: function(obj, opponent) {
		var add = '';
		var msg = '';
		if(opponent == true) add = EC_DefineString.Opponent;

		if( typeof obj == 'object' )
		{
			for( var i=0 ; i<obj.length ; i++ )
			{
				if(msg != '') msg += EC_DefineString.OR;
				msg += this.getFusionName( obj[i] );
			}
		}
		else if( obj == EC_DefineSetting.ALL )
		{
			msg += EC_DefineString.FusionALL;
		}
		else if( obj == EC_DefineSetting.NON )
		{
			msg += EC_DefineString.FusionNON;
		}

		if(msg != '')
		{
			msg = add + EC_DefineString.Fusion + msg;
		}
		
		return msg;
	},

	// Get fusion name 
	getFusionName: function( id )
	{
		//var list = root.getMetaSession().getDifficulty().getFusionReferenceList();
		var list = root.getBaseData().getFusionList();
		var data = list.getDataFromId(id);
		
		if(data != null)
		{
			return data.getName();
		}
		
		return '';
	},
	
	// Troop setting message
	getClassTypeMessage: function(obj, opponent) {
		var add = '';
		var msg = '';
		if(opponent == true) add = EC_DefineString.Opponent;

		if( typeof obj == 'object' )
		{
			for( var i=0 ; i<obj.length ; i++ )
			{
				if(msg != '') msg += EC_DefineString.OR;
				msg += this.getClassName( obj[i] );
			}
	
			if(msg != '')
			{
				msg = add + EC_DefineString.ClassType + msg;
			}
		}
		
		return msg;
	},

	// Acquisition of military name
	getClassName: function( id )
	{
		var list = root.getBaseData().getClassTypeList();
		var data = list.getDataFromId(id);
		
		if(data != null)
		{
			return data.getName();
		}
		
		return '';
	},

	// State setting messages
	getStateMessage: function(obj, opponent) {
		var add = '';
		var msg = '';
		var msg2 = '';
		if(opponent == true) add = EC_DefineString.Opponent;

		if( typeof obj == 'object' )
		{
			for( var i=0 ; i<obj.length ; i++ )
			{
				if(msg != '') msg += ' ';
				
				if(typeof obj[i] == 'string')
				{
					if(obj[i] == EC_DefineSetting.NON)
					{
						msg2 = EC_DefineString.StateNonID;
					}
					continue;
				}
				msg += this.getStateName( obj[i] );
			}
			
			msg += msg2;
		}
		else if( typeof obj == 'string' )
		{
			switch(obj)
			{
				case EC_DefineSetting.ALL:
					msg = EC_DefineString.StateALL;
					break;

				case EC_DefineSetting.GOOD:
					msg = EC_DefineString.StateGood;
					break;

				case EC_DefineSetting.BAD:
					msg = EC_DefineString.StateBad;
					break;
					
				case EC_DefineSetting.NON:
					msg = EC_DefineString.StateNon;
					break;

				case EC_DefineSetting.NONGOOD:
					msg = EC_DefineString.StateNonGood;
					break;

				case EC_DefineSetting.NONBAD:
					msg = EC_DefineString.StateNonBad;
					break;
			}
		}

		if(msg != '')
		{
			msg = add + EC_DefineString.State + msg;
		}
		
		return msg;
	},

	// Get state name
	getStateName: function( id )
	{
		//var list = root.getMetaSession().getDifficulty().getFusionReferenceList();
		var list = root.getBaseData().getStateList();
		var data = list.getDataFromId(id);
		
		if(data != null)
		{
			return data.getName();
		}
		
		return '';
	},
	
	// Get weapon type name
	getWeaponTypeMessage: function(obj, opponent) {
		var add = '';
		var msg = '';
		var msg2 = '';
		if(opponent == true) add = EC_DefineString.Opponent;

		var index = -1;

		if( typeof obj == 'object' )
		{
			for( var key in obj ) {
				switch(key)
				{
					case EC_DefineSetting.PHYSICS :
						index = WeaponCategoryType.PHYSICS;
						break;

					case EC_DefineSetting.SHOOT   :
						index = WeaponCategoryType.SHOOT;
						break;

					case EC_DefineSetting.MAGIC   :
						index = WeaponCategoryType.MAGIC;
						break;

					case EC_DefineSetting.NON     :
						msg2 = EC_DefineString.WeaponTypeNon;
						continue;
						
					default:
						index = -1;
						break;
				}

				if(typeof obj[key] == 'object')
				{
					for( var i=0 ; i<obj[key].length ; i++ )
					{
						if(index == -1) continue;
						
						if(msg != '') msg += ' ';
						msg += this.getWeaponTypeName( index, obj[key][i] );
					}
				}
				else if(obj[key] == EC_DefineSetting.ALL)
				{
					if(msg != '') msg += ' ';
					msg += this.getWeaponTypeName( index, EC_DefineSetting.ALL );
				}
			}
			
			if(msg != '')
			{
				msg = add + EC_DefineString.WeaponType + msg;
			}
		}
		
		return msg + msg2;
	},

	// Get weapon type name
	getWeaponTypeName: function(index, id)
	{
		if(id == EC_DefineSetting.ALL)
		{
			switch(index)
			{
				case WeaponCategoryType.PHYSICS :
					return EC_DefineString.WeaponTypePhysics;
					break;

				case WeaponCategoryType.SHOOT   :
					return EC_DefineString.WeaponTypeShoot;
					break;

				case WeaponCategoryType.MAGIC   :
					return EC_DefineString.WeaponTypeMagic;
					break;
			}
		}
		else
		{
			//var list = root.getMetaSession().getDifficulty().getFusionReferenceList();
			var list = root.getBaseData().getWeaponTypeList(index);
			var data = list.getDataFromId(id);
			
			if(data != null)
			{
				return data.getName();
			}
		}
		
		return '';
	},
	
	// Create a message when multiple parameters are specified
	getArrayParamMessage: function(obj, length) {
		var num = 0;

		for( var key in obj ) {
			num++;
		}

		var aryMsg = [];
		var strTmp = '';
		var returnMsg = [];
		
		for( var key in obj )
		{
			strTmp = this.getParamName( key );
			
			if(strTmp != '')
			{
				aryMsg.push( strTmp + ':' + obj[key] + ' ' );
			}
		}

		var msg = '';
		var i = 0;
		for(i = 0 ; i < aryMsg.length ; i++)
		{
			msg += aryMsg[i];
			
			len = this.getStringLen(msg);
			if( len > length )
			{
				returnMsg.push( msg );
				msg = '';
			}
		}

		if(msg != '') {
			returnMsg.push( msg );
		}
		
		return returnMsg;
	},

	// Create a message when multiple parameters are specified
	getArrayAddTriggerRateMessage: function(obj, length) {
		var num = 0;

		for( var key in obj ) {
			num++;
		}

		var aryMsg = [];
		var strTmp = '';
		var returnMsg = [];
		
		for( var key in obj )
		{
			strTmp = this.getParamName( key );
			
			if(strTmp != '')
			{
				aryMsg.push( strTmp + '×' + obj[key] + ' ' );
			}
		}

		var msg = '';
		var i = 0;
		for(i = 0 ; i < aryMsg.length ; i++)
		{
			msg += aryMsg[i];
			
			len = this.getStringLen(msg);
			if( len > length )
			{
				returnMsg.push( msg );
				msg = '';
			}
		}

		if(msg != '') {
			returnMsg.push( msg );
		}
		
		return returnMsg;
	},
	
	// Create message
	rendererMessage: function(obj, msg, length, color, font, space) {
		if(typeof msg == 'object')
		{
			var len = msg.length;
			for( var i = 0 ; i < len ; i++ )
			{
				TextRenderer.drawKeywordText(obj[0], obj[1], msg[i], length, color, font);
				obj[0] += space[0];
				obj[1] += space[1];
			}
		}
		else if( msg != '' )
		{
			if( typeof msg == 'string' && msg.match(/\r\n|\r|\n/) )
			{
				var ary = msg.split(/\r\n|\r|\n/);
				this.rendererMessage(obj, ary, length, color, font, space);
			}
			else
			{
				TextRenderer.drawKeywordText(obj[0], obj[1], msg, length, color, font);
				obj[0] += space[0];
				obj[1] += space[1];
			}
		}
	},

	// Sustained turn acquisition
	getCommandDurationMessage: function(obj) {
		var msg = EC_DefineString.CommandDuration;
		
		if( typeof obj != 'undefined' ) {
			msg += obj + EC_DefineString.CommandDurationTime;
		} else {
			msg += EC_DefineString.CommandDurationNon;
		}
		
		return msg;
	},

	// Get cool time
	getCommandCoolTimeMessage: function(time) {
		var msg = '';
		
		if(time > 0) {
			msg = EC_DefineString.CommandCoolTime + time + EC_DefineString.CommandCoolTimeTurn;
		}
		
		return msg;
	},

	// Number of reusable turns acquired
	getNowCommandCoolTimeMessage: function(time) {
		var msg = '';
		
		if(time > 0) {
			msg = EC_DefineString.NowCommandCoolTimeNG.replace("%d", time);
		}
		
		return msg;
	},
	
	// Get string length
	getStringLen: function(str) {
		var len = 0;
		var str = escape(str);
		for (var j = 0; j < str.length; j++, len++) {
			if (str.charAt(j) == "%") {
				if (str.charAt(++j) == "u") {
					j += 3;
					len++;
				}
				j++;
			}
		}
		
		return len;
	}
};

//var alias1 = SkillControl.getPossessionSkill;
//SkillControl.getPossessionSkill = function(unit, skilltype) {
//	
//	
//	return alias1.call(this, unit, skilltype);
//};

})();

