/*  AI Sieze

Author: Anarch16Sync

Overview:
This plugin allows to create a custom skill that makes AI Units move and trigger SIEZE Events, with this one can automate the trigger of special events,
like enemies capturing secondary castles.

For better results use different pages for the event based on the Army that visits it. 
For example: 	Page 1: Active | Player;
				Page 2: Active | Enemy;
				Page 3: Active | Ally


To make an AI unit capable of triggerin SIEZE Events create a skill of type CUSTOM and set the keyword to SIEGER.

Custom Skill Keyword:
SIEGER

Changelog:

ver 1.0 (14/03/2023)
Created


Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.
*/

(function() {

//Function alias
var aliasCombinationCollector02 = CombinationCollector.Skill._setCombination;

//Adds the check for the SIEGER skill to create a proper combination
CombinationCollector.Skill._setCombination = function(misc) {
		var skillType = misc.skill.getSkillType();
		if (skillType === SkillType.CUSTOM && misc.skill.getCustomKeyword() === 'SIEGER') {
			this._setSiegerCombination(misc)
		} else {
			aliasCombinationCollector02.call(this,misc)
		}
	};

//Combiantion for the Siegers, makes them go to Sieze Place Events	
CombinationCollector.Skill._setSiegerCombination = function(misc){
	var rangeMetrics;
	rangeMetrics = StructureBuilder.buildRangeMetrics();
	rangeMetrics.endRange = 0;
	rangeMetrics.rangeType = SelectionRangeType.SELFONLY;
	this._setPlaceRangeCombination(misc, PlaceEventFilterFlag.OCCUPATION, rangeMetrics);
};

//Function alias
var aliasSkillAutoActionMSU02 = SkillAutoAction._moveSkillUse;
var aliasSkillAutoActionESU02 = SkillAutoAction._enterSkillUse;

//I have no idea what this does, but it had checks for other skills so now it has for SIEGER
SkillAutoAction._moveSkillUse = function() {
		var result = aliasSkillAutoActionMSU02.call(this)
		var skillType = this._skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'SIEGER') {
			result = this._capsuleEvent.moveCapsuleEvent();	
		}
		return result
	};

//This is the part that makes the AI choose what skill to use, so the check for SIEGER needs to be added
SkillAutoAction._enterSkillUse = function() {
		var result = aliasSkillAutoActionESU02.call(this)
		var skillType = this._skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'SIEGER') {
			result = this._enterSiege();	
		}

		return result
		
	};

//and this is the actual triggering of the event... well, enterCapsuleEvent does event triggering, this just creates a capsuleEvent and calls it.
SkillAutoAction._enterSiege = function() {
		var event = PosChecker.getPlaceEventFromPos(PlaceEventType.OCCUPATION,this._targetPos.x, this._targetPos.y);
		this._capsuleEvent = createObject(CapsuleEvent);
		
		return this._capsuleEvent.enterCapsuleEvent(event, true);
	};

	var aliasAIScorerSkillGAO = AIScorer.Skill._getAIObject;
	AIScorer.Skill._getAIObject = function(unit, combination) {
		var obj = aliasAIScorerSkillGAO.call(this, unit, combination)
		var skillType = combination.skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && combination.skill.getCustomKeyword() === 'SIEGER') {
			obj = SiezeItemAI;
		}
		
		return createObject(obj);
	}


	SiezeItemAI = defineObject(BaseItemAI,
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