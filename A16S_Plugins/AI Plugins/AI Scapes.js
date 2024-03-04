/*  AI goes to wait

Author: Anarch16Sync

Overview:
This plugin allows to create a custom skill that makes AI Units move to Wait Events that it can trigger, with this one can automate the trigger of special events,
like enemies scaping the map.

For better results use different pages for the event based on the Army that visits it. 
For example: 	Page 1: Active | Player;
				Page 2: Active | Enemy;
				Page 3: Active | Ally


To make an AI unit capable of going to Wait Events create a skill of type CUSTOM and set the keyword to SCAPE.

Custom Skill Keyword:
SCAPE

Changelog:

ver 1.0 (14/03/2023)
Created


Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.
*/

(function() {

//Function alias
var aliasCombinationCollector02 = CombinationCollector.Skill._setCombination;

//Adds the check for the SCAPE skill to create a proper combination
CombinationCollector.Skill._setCombination = function(misc) {
		var skillType = misc.skill.getSkillType();
		if (skillType === SkillType.CUSTOM && misc.skill.getCustomKeyword() === 'SCAPE') {
			this._setSCAPECombination(misc)
		} else {
			aliasCombinationCollector02.call(this,misc)
		}
	};

//Combiantion for the SCAPEs, makes them go to Sieze Place Events	
CombinationCollector.Skill._setSCAPECombination = function(misc){
	var rangeMetrics;
	rangeMetrics = StructureBuilder.buildRangeMetrics();
	rangeMetrics.endRange = 0;
	rangeMetrics.rangeType = SelectionRangeType.SELFONLY;
	this._setPlaceRangeCombination(misc, PlaceEventFilterFlag.WAIT, rangeMetrics);
};

//Function alias
var aliasSkillAutoActionMSU02 = SkillAutoAction._moveSkillUse;
var aliasSkillAutoActionESU02 = SkillAutoAction._enterSkillUse;

//I have no idea what this does, but it had checks for other skills so now it has for SCAPE
SkillAutoAction._moveSkillUse = function() {
		var result = MoveResult.CONTINUE;
		var skillType = this._skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'SCAPE') {
			result = this._capsuleEvent.moveCapsuleEvent();	
		} else {
			return aliasSkillAutoActionMSU02.call(this)
		}
		return result
	};

//This is the part that makes the AI choose what skill to use, so the check for SCAPE needs to be added
SkillAutoAction._enterSkillUse = function() {
		var result = EnterResult.NOTENTER;
		var skillType = this._skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'SCAPE') {
			result = this._enterScape();	
		} else {
			return aliasSkillAutoActionESU02.call(this)
		}
		return result
		
	};

//and this is the actual triggering of the event... well, enterCapsuleEvent does event triggering, this just creates a capsuleEvent and calls it.
SkillAutoAction._enterScape = function() {
		var event = PosChecker.getPlaceEventFromPos(PlaceEventType.WAIT,this._targetPos.x, this._targetPos.y);
		this._capsuleEvent = createObject(CapsuleEvent);
		
		return this._capsuleEvent.enterCapsuleEvent(event, true);
	};

})();