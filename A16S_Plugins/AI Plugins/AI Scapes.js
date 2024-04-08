/*  AI Scapes

Author: Anarch16Sync

Overview:
This plugin allows to create a custom skill that makes AI Units move to Wait Events that it can trigger, with this one can automate the trigger of special events,
like enemies scaping the map.

For better results use different pages for the event based on the Army that visits it. 
For example: 	Page 1: Active | Player;
				Page 2: Active | Enemy | "Custom Skill: SCAPE";
				Page 3: Active | Ally | "Custom Skill: SCAPE";

Adding the custom skill created as part of the condition makes sure that the wait event is not triggered by mistake by other AI units.

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
		var result = aliasSkillAutoActionMSU02.call(this)
		var skillType = this._skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'SCAPE') {
			result = this._capsuleEvent.moveCapsuleEvent();
		}
		return result
	};

//This is the part that makes the AI choose what skill to use, so the check for SCAPE needs to be added
SkillAutoAction._enterSkillUse = function() {
		var result = aliasSkillAutoActionESU02.call(this)
		var skillType = this._skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'SCAPE') {
			result = this._enterScape();	
		}

		return result
		
	};

//and this is the actual triggering of the event... well, enterCapsuleEvent does event triggering, this just creates a capsuleEvent and calls it.
SkillAutoAction._enterScape = function() {
		var event = PosChecker.getPlaceEventFromPos(PlaceEventType.WAIT,this._targetPos.x, this._targetPos.y);
		this._capsuleEvent = createObject(CapsuleEvent);
		
		return this._capsuleEvent.enterCapsuleEvent(event, true);
	};

	var aliasAIScorerSkillGAO = AIScorer.Skill._getAIObject;
	AIScorer.Skill._getAIObject = function(unit, combination) {
		var obj = aliasAIScorerSkillGAO.call(this, unit, combination)
		var skillType = combination.skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && combination.skill.getCustomKeyword() === 'SCAPE') {
			obj = ScapeItemAI;
		}
		
		return createObject(obj);
	}


	ScapeItemAI = defineObject(BaseItemAI,
			{
				getItemScore: function(unit, combination) {
					// Return high value to prioritize raiding.
					return 300;
				},
				
				getActionTargetType: function(unit, item) {
					return ActionTargetType.SINGLE;
				}
			}
			)

})();