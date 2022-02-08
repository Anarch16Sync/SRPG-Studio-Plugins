
/*--------------------------------------------------------------------------------------------------
  
Script to set the number of uses for commands such as stealing and action recovery

   how to use:
   Set the skill's custom parameters to {EC_TriggerCountMap: [3,'COMMAND']}.
  
   Author:
   o-to
  
   Change log:
   2018/05/01:
   Create New

   2019/11/19:
   With "transformation and" fusion "skills
   EC_TriggerCountMap: [(number of uses),'COMMAND']
   Added a setting so that the upper limit of the number of times of use in 1MAP can be specified by specifying
   With "re-action" and "weapon usage does not decrease" skills
   Fixed to be able to activate from command skill Some activation conditions can be set with modification 
  
--------------------------------------------------------------------------------------------------*/

(function() {
//=== steal  ==========================
var alias101 = UnitCommand.Steal._moveTrade;
UnitCommand.Steal._moveTrade = function() {
	var result = alias101.call(this);
	var unit = this.getCommandTarget();
	var skill = SkillControl.getBestPossessionSkill(unit, SkillType.STEAL);
	if (skill !== null) {
		resultCode = this._unitItemStealScreen.getScreenResult();
		if (resultCode === UnitItemTradeResult.TRADEEND) {
			unit.custom.tmpCommandSkillID = skill.getId();
			EC_SkillCheck.setCoolTime(unit, skill);
			EC_SkillCheck.UseSkillCommandExpendData(unit, skill);
		}
	}
	return result;
};

var alias102 = UnitCommand.Steal.isCommandDisplayable;
UnitCommand.Steal.isCommandDisplayable = function() {
	var result = alias102.call(this);
	var unit = this.getCommandTarget();
	var skill = SkillControl.getBestPossessionSkill(unit, SkillType.STEAL);
	if( !EC_SkillCheck.isSkillCheckEnable(unit, skill) ) {
		result = false;
	}
	
	return result;
};

//=== Behavior recovery  ==========================
var alias201 = UnitCommand.Quick._moveQuick;
UnitCommand.Quick._moveQuick = function() {
	var result = alias201.call(this);
	var unit = this.getCommandTarget();
	var skill = SkillControl.getBestPossessionSkill(unit, SkillType.QUICK);

	if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
		unit.custom.tmpCommandSkillID = skill.getId();
		EC_SkillCheck.setCoolTime(unit, skill);
		EC_SkillCheck.UseSkillCommandExpendData(unit, skill);
	}
	return result;
};

var alias202 = UnitCommand.Quick._moveDirect;
UnitCommand.Quick._moveDirect = function() {
	var result = alias202.call(this);
	var unit = this.getCommandTarget();
	var skill = SkillControl.getBestPossessionSkill(unit, SkillType.QUICK);
	if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
		unit.custom.tmpCommandSkillID = skill.getId();
		EC_SkillCheck.setCoolTime(unit, skill);
		EC_SkillCheck.UseSkillCommandExpendData(unit, skill);
	}
	
	return result;
};

var alias203 = UnitCommand.Quick.isCommandDisplayable;
UnitCommand.Quick.isCommandDisplayable = function() {
	var result = alias203.call(this);
	var unit = this.getCommandTarget();
	var skill = SkillControl.getBestPossessionSkill(unit, SkillType.QUICK);
	if( !EC_SkillCheck.isSkillCheckEnable(unit, skill) ) {
		result = false;
	}
	
	return result;
};

//=== Unlocking (door) ==========================
var alias301 = UnitCommand.Gate.moveCommand;
UnitCommand.Gate.moveCommand = function() {
	var result = alias301.call(this);
	var unit = this.getCommandTarget();
	if (this._keyNavigator.moveKeyNavigator() !== MoveResult.CONTINUE) {
		if (this._keyData.skill !== null) {
			var skill = this._keyData.skill;
			unit.custom.tmpCommandSkillID = skill.getId();
			EC_SkillCheck.setCoolTime(unit, skill);
			EC_SkillCheck.UseSkillCommandExpendData(unit, skill);
		}
	}
	return result;
};

var alias302 = UnitCommand.Gate.isCommandDisplayable;
UnitCommand.Gate.isCommandDisplayable = function() {
	var result = alias302.call(this);
	var unit = this.getCommandTarget();
	
	if (this._keyData !== null && this._keyData.skill !== null) {
		var skill = this._keyData.skill;
		if( !EC_SkillCheck.isSkillCheckEnable(unit, skill) ) {
			result = false;
		}
	}
	return result;
};

//=== Unlocking (treasure chest)  ==========================
var alias401 = UnitCommand.Treasure.moveCommand;
UnitCommand.Treasure.moveCommand = function() {
	var result = alias401.call(this);
	var unit = this.getCommandTarget();
	if (this._keyNavigator.moveKeyNavigator() !== MoveResult.CONTINUE) {
		if (this._keyData.skill !== null) {
			var skill = this._keyData.skill;
			unit.custom.tmpCommandSkillID = skill.getId();
			EC_SkillCheck.setCoolTime(unit, skill);
			EC_SkillCheck.UseSkillCommandExpendData(unit, skill);
		}
	}
	return result;
};

var alias402 = UnitCommand.Treasure.isCommandDisplayable;
UnitCommand.Treasure.isCommandDisplayable = function() {
	var result = alias402.call(this);
	var unit = this.getCommandTarget();
	
	if (this._keyData !== null && this._keyData.skill !== null) {
		var skill = this._keyData.skill;
		if( !EC_SkillCheck.isSkillCheckEnable(unit, skill) ) {
			result = false;
		}
	}
	return result;
};

//=== Re-action  ==========================
var alias501 = Probability.getInvocationProbabilityFromSkill;
Probability.getInvocationProbabilityFromSkill = function(unit, skill) {
	switch(skill.getSkillType()) {
		case SkillType.REACTION:
			// In the case of command skill, if it is not activated, it will not be activated
			if(OT_isCommandSkill(skill)) {
				if(!EC_SkillCheck.SkillCheckCommand(unit, skill)) {
					return false;
				}
			}
			
			// Check the triggering conditions
			if(!EC_SkillCheck.isSkillCheckEnable(unit, skill, true)) {
				return false;
			}
			break;
	}
	
	return alias501.call(this, unit, skill);
};

//var alias502 = ReactionFlowEntry.moveFlowEntry;
//ReactionFlowEntry.moveFlowEntry = function() {
//	var result = alias502.call(this);
//	if( result == MoveResult.END ) {
//		if( this._skill != null ) {
//			EC_SkillCheck.TriggerCountUp(this._targetUnit, this._skill);
//		}
//	}
//	return result;
//};

//=== Weapon usage does not decrease  ==========================
var alias601 = SkillControl.getBattleSkill;
SkillControl.getBattleSkill = function(active, passive, skilltype) {
	var skill = alias601.call(this, active, passive, skilltype);
	
	if(skill != null) {
		switch(skill.getSkillType()) {
			case SkillType.NOWEAPONDECREMENT:
				// In the case of command skill, if it is not activated, it will not be activated 
				if(OT_isCommandSkill(skill)) {
					if(!EC_SkillCheck.SkillCheckCommand(active, skill)) {
						return null;
					}
				}
				// Check the triggering conditions
				if(!EC_SkillCheck.isSkillCheckEnableTypeAttack(active, passive, skill, true)) {
					return null;
				}
				break;
		}
	}
	return skill;
};

//=== Fusion ==========================
var alias701 = SkillControl.getSkillMixArray;
var tmpECFusion = [];
SkillControl.getSkillMixArray = function(unit, weapon, skilltype, keyword) {
	var skillArray = alias701.call(this, unit, weapon, skilltype, keyword);
	var resultArray = [];
	
	switch(skilltype) {
		case SkillType.FUSION:
			tmpECFusion = [];
			var count = skillArray.length;
			for (var i = 0; i < count; i++) {
				var skill = skillArray[i].skill;
				
				// Add to the list those that meet the triggering conditions 
				if(EC_SkillCheck.isSkillCheckEnable(unit, skill)) {
					resultArray.push(skillArray[i]);
					tmpECFusion.push(skill);
				}
			}
			
			return resultArray;
			break;
	}
	
	return skillArray;
};

var alias702 = UnitCommand.FusionCatch._addFusionEvent;
UnitCommand.FusionCatch._addFusionEvent = function(generator) {
	var count = tmpECFusion.length;
	var list = root.getBaseData().getFusionList();
	
	for (var i = 0; i < count; i++) {
		var skill = tmpECFusion[i];
		var fusionData = list.getDataFromId(skill.getSkillValue());
		if(this._fusionData.getId() == fusionData.getId()) {
			var unit = this.getCommandTarget();
			unit.custom.tmpCommandSkillID = skill.getId();
			EC_SkillCheck.setCoolTime(unit, skill);
			EC_SkillCheck.UseSkillCommandExpendData(unit, skill);
		}
	}
	tmpECFusion = [];
	
	alias702.call(this, generator);
};

var alias703 = UnitCommand.FusionAttack._moveResult;
UnitCommand.FusionAttack._moveResult = function() {
	var result = alias703.call(this);
	if (result === MoveResult.END) {
		var count = tmpECFusion.length;
		var list = root.getBaseData().getFusionList();
		
		for (var i = 0; i < count; i++) {
			var skill = tmpECFusion[i];
			var fusionData = list.getDataFromId(skill.getSkillValue());
			if(this._fusionData.getId() == fusionData.getId()) {
				var unit = this.getCommandTarget();
				unit.custom.tmpCommandSkillID = skill.getId();
				EC_SkillCheck.setCoolTime(unit, skill);
				EC_SkillCheck.UseSkillCommandExpendData(unit, skill);
			}
		}
		tmpECFusion = [];
	}
	return result;
};

//=== Transform ==========================
var alias801 = SkillControl.getDirectSkillArray;
SkillControl.getDirectSkillArray = function(unit, skilltype, keyword) {
	var skillArray = alias801.call(this, unit, skilltype, keyword);
	var resultArray = [];
	switch(skilltype) {
		case SkillType.METAMORPHOZE:
			var count = skillArray.length;
			for (var i = 0; i < count; i++) {
				var skill = skillArray[i].skill;
				
				// Add to the list those that meet the triggering conditions 
				if(EC_SkillCheck.isSkillCheckEnable(unit, skill)) {
					resultArray.push(skillArray[i]);
				}
			}
			
			return resultArray;
			break;
	}
	return skillArray;
};

var alias802 = UnitCommand.Metamorphoze._moveEvent;
UnitCommand.Metamorphoze._moveEvent = function() {
	var result = alias802.call(this);
	if (result === MoveResult.END) {
		if (this._skill !== null) {
			var unit = this.getCommandTarget();
			unit.custom.tmpCommandSkillID = this._skill.getId();
			EC_SkillCheck.setCoolTime(unit, this._skill);
			EC_SkillCheck.UseSkillCommandExpendData(unit, this._skill);
		}
	}
	return result;
};

})();

