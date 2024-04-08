/*  AI Visits Villages

Author: Anarch16Sync

Overview: 
This plugin allows to create a custom skill that makes AI Units move and trigger VILLAGE Events, with this, one can automate the destruction
of villages or make Allies go to them, retrieve their rewards or trigger a special events.

For better results use different pages for the event based on the Army that visits it. 
For example: 	Page 1: Active | Player;
				Page 2: Active | Enemy;
				Page 3: Active | Ally


To make an AI unit capable of visiting VILLAGE create a skill of type CUSTOM and set the keyword to RAIDER.

Custom Skill Keyword:
RAIDER

Changelog:

ver 1.0 (25/04/2020)
Created


Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.
*/
(function() {
	//Function alias
	var aliasCombinationCollector = CombinationCollector.Skill._setCombination;
	
	//Adds the check for the RAIDER skill to create a proper combination
	CombinationCollector.Skill._setCombination = function(misc) {
			var skillType = misc.skill.getSkillType();
			if (skillType === SkillType.CUSTOM && misc.skill.getCustomKeyword() === 'RAIDER') {
				this._setRaiderCombination(misc)
			} else {
				aliasCombinationCollector.call(this,misc)
			}
		},
	
	//Combiantion for the Raiders, makes them go to Village Place Events	
	CombinationCollector.Skill._setRaiderCombination = function(misc){
		var rangeMetrics;
		rangeMetrics = StructureBuilder.buildRangeMetrics();
		rangeMetrics.endRange = 0;
		rangeMetrics.rangeType = SelectionRangeType.SELFONLY;
		this._setPlaceRangeCombination(misc, PlaceEventFilterFlag.VILLAGE, rangeMetrics);
	};
	
	//Function alias
	var aliasSkillAutoActionMSU = SkillAutoAction._moveSkillUse;
	var aliasSkillAutoActionESU = SkillAutoAction._enterSkillUse;
	var aliasSkillAutoActionDSU = SkillAutoAction._drawSkillUse;

	//I have no idea what this does, but it had checks for other skills so now it has for RAIDER
	SkillAutoAction._moveSkillUse = function() {
			var result = aliasSkillAutoActionMSU.call(this)
			var skillType = this._skill.getSkillType();
			
			if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'RAIDER') {
				result = this._eventTrophy.moveEventTrophyCycle();	
			}
			return result
		};

	SkillAutoAction._drawSkillUse = function() {
			var skillType = this._skill.getSkillType();
			if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'RAIDER') {
				this._eventTrophy.drawEventTrophyCycle();
			} else {
				aliasSkillAutoActionDSU.call(this)
			}
		};
	
	//This is the part that makes the AI choose what skill to use, so the check for RAIDER needs to be added
	SkillAutoAction._enterSkillUse = function() {
			var result = aliasSkillAutoActionESU.call(this)
			var skillType = this._skill.getSkillType();
			
			if (skillType === SkillType.CUSTOM && this._skill.getCustomKeyword() === 'RAIDER') {
				result = this._enterRaiding();
			}
			return result
			
		};
	
	//and this is the actual triggering of the event... well, enterEventTrohpyCycle does the heavy lifting, but I called it so I deserve some credit to.
	SkillAutoAction._enterRaiding = function() {
			var event = PosChecker.getPlaceEventFromPos(PlaceEventType.VILLAGE,this._targetPos.x, this._targetPos.y);
			
			this._eventTrophy = createObject(EventTrophy);
			
			return this._eventTrophy.enterEventTrophyCycle(this._unit, event);
		};
	
	var aliasAIScorerSkillGAO = AIScorer.Skill._getAIObject;
	AIScorer.Skill._getAIObject = function(unit, combination) {
		var obj = aliasAIScorerSkillGAO.call(this, unit, combination)
		var skillType = combination.skill.getSkillType();
		
		if (skillType === SkillType.CUSTOM && combination.skill.getCustomKeyword() === 'RAIDER') {
			obj = RaidItemAI;
		}
		
		return createObject(obj);
	}


	RaidItemAI = defineObject(BaseItemAI,
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