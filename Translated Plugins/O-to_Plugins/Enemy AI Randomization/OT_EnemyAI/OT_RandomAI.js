
/*--------------------------------------------------------------------------
  
Instead of choosing from the highest score obtained by simulating the enemy's behavior
Pick up multiple ones with high scores and randomly select from among them.

Be aware of conflicts with plugins that modify AI.

	how to use:
Put the OT_EnemyAI folder into "Plugin".
If you want to adjust the overall AI, iRandomActionType and iRandomMoveType of OT_RandomAI.js,
Adjust the iActionPickUp and iMovePickUp values.
Set custom parameters if you want to randomize the behavior of specific units or classes

・Unit
{
OT_RandomAI : { ActionType:1, MoveType:1, ActionPickUp:10, MovePickUp:999 }
}
ActionType : Action selection pattern
MoveType : The pattern of the movement destination at the time of action
 ActionPickUp : Number of actions to pick up when doing random action
 MovePickUp : Number of destinations to pick up by randomization at action

	·class
{
OT_RandomAI : { ActionType:1, MoveType:1, ActionPickUp:10, MovePickUp:999 }
}
ActionType : Action selection pattern
MoveType : The pattern of the movement destination at the time of action
 ActionPickUp : Number of actions to pick up when doing random action
 MovePickUp : Number of destinations to pick up by randomization at action

■ Behavior patterns based on ActionType settings
When set to 1 or more, the action with the highest score for whether the action is optimal will be picked up by the number of ActionPickUps.
It will act randomly from among them

0: No behavior randomization (same behavior as plug-in not installed)
1: The higher the score, the higher the probability of being selected.
2: Actions with lower scores are more likely to be selected
3: No change in probability due to high or low score

■ Behavior patterns based on MoveType settings
When set to 1 or more, actions with the highest score for the best destination are picked up by the number of MovePickUps.
It will act randomly from among them

0: No destination random (same behavior as plug-in not installed)
1: Randomly select a destination only when there are multiple optimal locations
2: Mostly move to the optimal location, but also move randomly to non-optimal locations (may move to locations where terrain effects cannot be obtained when attacking, or attack in positions where counterattacks are received)
3: Random movement regardless of terrain effects or counterattacks
4: High probability of moving to non-optimal locations (perfect for idiot AI, bandits, etc.)
5: Move to the least optimal place with top priority (Licking AI)
6: Move to the least optimal location with highest priority. Randomly choose a destination if there are multiple least optimal locations

If Kaspara is set for both the unit and class, the unit setting will take precedence.
The value of OT_RandomAI.js is used for Kaspara items that are not set.
For example, set ActionType and MoveType in the class,
If you set ActionType and ActionPickUp in the unit, ActionType takes precedence over the unit settings,
MovePickUp is not set for both unit and class, so the OT_RandomAI.js setting is used.

Also from "Run Code" in "Run Script"
You can change the AI ​​settings of your units during the game.

After selecting the unit whose AI you want to change in "Unit" on the "Original Data" tab,
Check "Execute code" in "Execute script" of the event command,
in the text area
OT_RandomAI_SetUnitAI(
{ ActionType:1, MoveType:1, ActionPickUp:10, MovePickUp:999 }
);
Write like this:

Specify the item you want to set in the description inside {}.
For example, if you want to change only the ActionType and MoveType of the unit
OT_RandomAI_SetUnitAI(
{ ActionType:1, MoveType:2 }
);
Write like this:

If you want to delete the AI ​​setting of the unit, set [item name]:-1.
For example, if you want to delete the unit's ActionType and ActionPickUp settings
OT_RandomAI_SetUnitAI(
{ ActionType:-1, ActionPickUp:-1 }
);
Write like this:
If the AI ​​after deleting the setting has a setting value in the class, it will act according to the setting value of the class,
If there is no set value in the class, it will act according to the value set in OT_RandomAI.js.

	Author:
o-to

	Change log:
2022/10/23: New

--------------------------------------------------------------------------*/
(function() {
// If iRandomActionType is set to 1 or more, the action with the highest score of whether the action is optimal
// It will pick up the number of iActionPickUp and act randomly from among them
//
// 0: No behavior randomization (same as plug-in not installed)
// 1: The higher the score, the higher the probability of being selected
// 2: Actions with lower scores are more likely to be selected
// 3: No probability change due to high or low score
var iRandomActionType = 1; 
var iActionPickUp = 100; // Maximum number of pickups

// If iRandomMoveType is set to 1 or more, the action with the highest score of whether the destination is optimal
// It will pick up the number of iMovePickUp and act randomly from among them
//
// Whether to enable randomization of the movement destination at the time of action
// 0: No destination random (same as plug-in not installed)
// 1: Select a destination randomly only when there are multiple optimal locations
// 2: Mostly move to the optimal location, but also move randomly to non-optimal locations (may move to locations where terrain effects cannot be obtained when attacking, or attack in positions where counterattacks are received)
// 3: Random movement regardless of terrain effects and counterattack presence/absence
// 4: High probability to move to non-optimal locations (perfect for idiot AI, bandits, etc.)
// 5: Move to the least optimal place with top priority (Licking AI)
// 6: move to the least optimal location with highest priority. Randomly choose a destination if there are multiple least optimal locations
var iRandomMoveType = 1; 
var iMovePickUp = 9999; // Destination candidate upper limit

//The following is for motion control and cannot be edited ---------------
var _bNowEnable = false;			// Plugin processing startup flag, so that it is not processed without passing through a specific function
var _bBestCostCheck = false;		// Flag for action selection or destination selection
var _iPickUp = 30;					// Temporarily save the number of pickups
//var _iPickUpType = 0;				// 0: Normal pick up 1: Pick up from the lower score
var _iScoreLotteryType = 0;			// 0: High score increases selection probability, 1: Low score increases selection probability, 2: No change in probability due to score difference
var _bMaxScoreRandomSelect = true;	// Random selection from multiple maximum score actions
var _bMinScoreRandomSelect = true;	// Random selection from multiple lowest scoring actions
var _bMinScoreSelect = false;		// Select Action with Lowest Score
//---------------------------------------------

function getRandomAIData(unit) {
	var aryData = {};
	var unitClass = unit.getClass();

	if(unitClass.custom.OT_RandomAI) {
		var randomAI = unitClass.custom.OT_RandomAI;
		if(typeof randomAI.ActionType === 'number') {
			aryData.ActionType = randomAI.ActionType;
		}
		if(typeof randomAI.ActionPickUp === 'number') {
			aryData.ActionPickUp = randomAI.ActionPickUp;
		}
		if(typeof randomAI.MoveType === 'number') {
			aryData.MoveType = randomAI.MoveType;
		}
		if(typeof randomAI.MovePickUp === 'number') {
			aryData.MovePickUp = randomAI.MovePickUp;
		}
	}
	
	if(unit.custom.OT_RandomAI) {
		var randomAI = unit.custom.OT_RandomAI;
		if(typeof randomAI.ActionType === 'number') {
			aryData.ActionType = randomAI.ActionType;
		}
		if(typeof randomAI.ActionPickUp === 'number') {
			aryData.ActionPickUp = randomAI.ActionPickUp;
		}
		if(typeof randomAI.MoveType === 'number') {
			aryData.MoveType = randomAI.MoveType;
		}
		if(typeof randomAI.MovePickUp === 'number') {
			aryData.MovePickUp = randomAI.MovePickUp;
		}
	}
	
	return aryData;
	//return unit.custom.OT_RandomAI;
};

function getRandomAIValue(obj, valName) {
	if(obj == null) {
		return -1;
	}
	
	if(typeof obj[valName] == 'undefined') {
		return -1;
	}
	
	return obj[valName];
};

var alias = CombinationSelector._getBestIndexFromScore;
CombinationSelector._getBestIndexFromScore = function(scoreArray) {
	var index = alias.call(this, scoreArray);
	if(!_bNowEnable) {
		return index;
	}

	var count = scoreArray.length;
	if(index != -1 && count > 1) {
		var i;
		var scoreTmp = [];
		var scoreTmp2 = [];
		var totalPoint = 0;
		var maxScore = scoreArray[index];
		var minScore = scoreArray[index];
		var minIndex = index;
		
		for (i = 0; i < count; i++) {
			if( scoreArray[i] >= 0 ) {
				if( scoreArray[i] < minScore ) {
					minIndex = i;
					minScore = scoreArray[i];
				}
				
				scoreTmp.push({index:i, score:scoreArray[i]});
			}
		}
		
		if(_bMinScoreSelect) {
			return minIndex;
		}
		
		scoreTmp.sort(
			function(a, b) {
				return b.score - a.score;
			}
		);
		
		// Pick up the top scores
		var max = -1;
		var setScore = 0;
		count = scoreTmp.length;
		for (i = 0; i < count ; i++) {
			if(i >= _iPickUp) {
				break
			}
			
			if(_bMaxScoreRandomSelect) {
				if(scoreTmp[i].score < maxScore) {
					break;
				}
			}

			if(_bMinScoreRandomSelect) {
				if(scoreTmp[i].score > minScore) {
					continue;
				}
			}
			
			//root.log('score:' + scoreTmp[i].score);
			if(_iScoreLotteryType == 0) {
				setScore = scoreTmp[i].score + 1;
			} else if(_iScoreLotteryType == 1) {
				setScore = (maxScore + 1) - scoreTmp[i].score;
			} else if(_iScoreLotteryType == 2) {
				setScore = 1;
			}
			scoreTmp2.push({index:scoreTmp[i].index, score:setScore});
			totalPoint += setScore;
		}

		//root.log('totalPoint' + totalPoint);
		var point = root.getRandomNumber() % totalPoint;
		
		totalPoint = 0;
		count = scoreTmp2.length;

		//root.log('ChkPoint:' + point);
		for (i = 0; i < count ; i++) {
			totalPoint += scoreTmp2[i].score;
			//root.log('score2:' + scoreTmp2[i].score);
			if(point < totalPoint) {
				//root.log('SetIndex:' + i);
				index = scoreTmp2[i].index;
				break;
			}
		}

	}
	
	return index;
};

var alias2 = CombinationSelector._getBestCombinationIndex;
CombinationSelector._getBestCombinationIndex = function(unit, combinationArray) {
	var tmpType = iRandomActionType;
	_iPickUp = iActionPickUp;
	
	var randomAI = getRandomAIData(unit);
	//var cSession = root.getCurrentSession();
	//var mapInfo = null;
	//if("getCurrentMapInfo" in cSession) {
	//	mapInfo = cSession.getCurrentMapInfo();
	//}
	
	//if(!randomAI) {
	//	randomAI = getRandomAIData(unit.getClass());
	//}

	//if(!randomAI && mapInfo) {
	//	randomAI = getRandomAIData(mapInfo);
	//}

	if(randomAI) {
		var val = getRandomAIValue(randomAI, 'ActionType');
		if(val > -1) {
			//root.log('ActionType:' + val);
			tmpType = val;
		}

		val = getRandomAIValue(randomAI, 'ActionPickUp');
		if(val > -1) {
			//root.log('ActionPickUp:' + val);
			_iPickUp = val;
		}
	}
	//root.log('ActionType:' + tmpType);
	//root.log('ActionPickUp:' + _iPickUp);
	
	if(tmpType == 0) {
		_bNowEnable = false;
	} else {
		_bNowEnable = true;
		_bBestCostCheck = false;
		_bMinScoreSelect = false;
		_bMaxScoreRandomSelect = false;
		_bMinScoreRandomSelect = false;
		_iScoreLotteryType = 0;
		
		if(tmpType == 2) {
			_iScoreLotteryType = 1;
		} else if(tmpType == 3) {
			_iScoreLotteryType = 2;
		}
	}
	
	var result = alias2.call(this, unit, combinationArray);
	_bNowEnable = false;
	return result;
};

var alias3 = CombinationSelector._getBestCostIndex;
CombinationSelector._getBestCostIndex = function(unit, combination) {
	var tmpType = iRandomMoveType;
	_iPickUp = iMovePickUp;
	
	var randomAI = getRandomAIData(unit);
	//if(!randomAI) {
	//	randomAI = getRandomAIData(unit.getClass());
	//}
	
	if(randomAI) {
		var val = getRandomAIValue(randomAI, 'MoveType');
		if(val > -1) {
			//root.log('MoveType:' + val);
			tmpType = val;
		}

		val = getRandomAIValue(randomAI, 'MovePickUp');
		if(val > -1) {
			//root.log('MovePickUp:' + val);
			_iPickUp = val;
		}
	}

	//root.log('MoveType:' + tmpType);
	//root.log('MovePickUp:' + _iPickUp);
	
	if(tmpType == 0) {
		_bNowEnable = false;
	} else {
		_bNowEnable = true;
		_bBestCostCheck = true;
		_bMinScoreSelect = false;
		_bMaxScoreRandomSelect = false;
		_bMinScoreRandomSelect = false;
		_iScoreLotteryType = 0;
		
		if(tmpType == 1) {
			_bMaxScoreRandomSelect = true;
		} else if(tmpType == 3) {
			_iScoreLotteryType = 2;
		} else if(tmpType == 4) {
			_iScoreLotteryType = 1;
		} else if(tmpType == 5) {
			_bMinScoreSelect = true
		} else if(tmpType == 6) {
			_bMinScoreRandomSelect = true
		} 
	}
	var result = alias3.call(this, unit, combination);
	_bNowEnable = false;
	return result;
};

})();

function OT_RandomAI_SetUnitAI(aryData) {
	var content = root.getEventCommandObject().getOriginalContent();
	var unit = content.getUnit();
	
	if (unit === null) {
		return;
	}
	
	//root.log('SetUnitAI');
	
	if(aryData) {
		if(unit.custom.OT_RandomAI == null) {
			unit.custom.OT_RandomAI ={};
		}
		
		if(typeof aryData.ActionType === 'number') {
			if(aryData.ActionType < 0) {
				delete unit.custom.OT_RandomAI.ActionType;
			} else {
				unit.custom.OT_RandomAI.ActionType = aryData.ActionType;
			}
		}

		if(typeof aryData.ActionPickUp === 'number') {
			if(aryData.ActionPickUp < 0) {
				delete unit.custom.OT_RandomAI.ActionPickUp;
			} else {
				unit.custom.OT_RandomAI.ActionPickUp = aryData.ActionPickUp;
			}
		}

		if(typeof aryData.MoveType === 'number') {
			if(aryData.MoveType < 0) {
				delete unit.custom.OT_RandomAI.MoveType;
			} else {
				unit.custom.OT_RandomAI.MoveType = aryData.MoveType;
			}
		}

		if(typeof aryData.MovePickUp === 'number') {
			if(aryData.MovePickUp < 0) {
				delete unit.custom.OT_RandomAI.MovePickUp;
			} else {
				unit.custom.OT_RandomAI.MovePickUp = aryData.MovePickUp;
			}
		}
	}
}

