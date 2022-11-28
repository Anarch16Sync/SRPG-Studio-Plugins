
/*--------------------------------------------------------------------------
  
The activation conditions are displayed in the skill description column.

  how to use:
  Set the skill's custom parameters to {EC_NowHP: '0-50%'}.
  (Refer to the attached sheet for details)
  * Please be sure to put it as a set with TemporaryDataVirtualAttack.js.
  
  Author: o-to
  
  Change log:
  2015/05/30: Newly created
  2015/06/13: Automatically adjust the height of the window according to the number of settings
  2015/11/09: Fixed the part where the display was undefined due to the deletion of the official definition
  2015/12/06: Create conditions such as adding command skills and limiting the number of times skills can be activated
  2016/01/11:
  Supports "MP & Special Gauge Addition" script
  Modified so that skill and physique can be included in the judgment
  2016/04/24:
  Fixed most of the processing
  Fixed a bug that an error occurs when setting the remaining HP reduction rate in the activation rate on the editor side
  Fixed a bug that the description is incurred when setting a valid partner on the editor side.
  2016/05/03:
  Fixed a problem with the display of skill information when setting activation depending on whether the opponent is physical or magic.

  2017/02/05:
  Fixed the forgotten part of the variable declaration used for the for loop
  * In the same way, if there is another script that you forgot to declare, unintended behavior will occur.

  2019/11/19:
  Added definition of duration and cool time

  2020/01/01
  When setting Custom Parameters that adds the parameter specified for the activation rate to the activation rate
  Fixed the information to be displayed in the window.

  2020/03/29
  During the cool time after using a skill for which a cool time is set
  The skill icon on the unit's status screen will be dimmed and
  Fixed so that the number of turns until reuse is displayed at the bottom of the skill icon and in the skill window.
  
  When using a command skill with a set number of continuous turns
  Fixed the skill icon on the unit status screen blinking and displaying the number of continuous turns at the top of the icon.

--------------------------------------------------------------------------*/

var ViewTest = 0;
var ViewSkill = 0;


(function() {

// Function for referencing unit data
SkillInteraction._SetUnit = function(unit) {
	this._unit = unit;
	this._window._SetUnit(unit);
	this._scrollbar._unit = unit;
};

SkillInfoWindow._SetUnit = function(unit) {
	this._unit = unit;
	//root.log('OK');
};

GraphicsRenderer.OT_drawImageParamSkill = function(xDest, yDest, handle, graphicsType, graphicsRenderParam, color, alpha) {
	var pic = this.getGraphics(handle, graphicsType);
	var xSrc = handle.getSrcX();
	var ySrc = handle.getSrcY();
	var size = this.getGraphicsSize(graphicsType, pic);
	var width = size.width;
	var height = size.height;
	
	if (pic !== null) {
		if (graphicsRenderParam !== null) {
			if (graphicsRenderParam.alpha !== 255) {
				pic.setAlpha(graphicsRenderParam.alpha);
			}
			
			if (graphicsRenderParam.isReverse) {
				pic.setReverse(graphicsRenderParam.isReverse);
			}
			
			if (graphicsRenderParam.degree !== 0) {
				pic.setDegree(graphicsRenderParam.degree);
			}
			
			pic.setColor(color, alpha);
		}
		
		pic.drawStretchParts(xDest, yDest, width, height, xSrc * width, ySrc * height, width, height);
	}
};


var alias100 = UnitMenuBottomWindow._setSkillData;
UnitMenuBottomWindow._setSkillData = function(unit) {
	alias100.call(this, unit);
	this._skillInteraction._SetUnit(unit);
};

var alias1 = SkillInfoWindow._drawInvocationValue;
SkillInfoWindow._drawInvocationValue = function(x, y, skill, length, color, font) {
	//root.log('OK2:' + this._unit.getName());
	var text, text2='';
	var value = skill.getInvocationValue();
	var type = skill.getInvocationType();
	var DefaultPercent = 0;

	// If there is no activation rate setting, the official function will be used for processing.
	if( OT_SkillInfoExtraWindow.GetExtraConfigPercentSettingSum(skill) == 0 )
	{
		alias1.call(this, x, y, skill, length, color, font);
		return;
	}
	
	TextRenderer.drawKeywordText(x, y, StringTable.SkillWord_Invocation, length, ColorValue.KEYWORD, font);
	x += ItemInfoRenderer.getSpaceX();
	
	if (type === InvocationType.HPDOWN) {
		text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(ParamType.MHP)) + value + StringTable.SkillWord_Less;
	}
	else if (type === InvocationType.ABSOLUTE) {
		text = value + StringTable.SignWord_Percent;
	}
	else
	{
		if (type === InvocationType.LV) {
			text = StringTable.Status_Level;
		}
		else {
			text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(type));
		}
	
		//Default probability
		if( skill.custom.EC_DefaultPercent != null )
		{
			DefaultPercent = skill.custom.EC_DefaultPercent;
			text2 = DefaultPercent + '＋';
		}
		
		// Correction value
		if( skill.custom.EC_Correction != null )
		{
			value = value * skill.custom.EC_Correction;
		}
		
		text = '(' + text;
		if (value > 1 || 1 > value) {
			text += '' + StringTable.SignWord_Multiple + '' + value;
		}
		text += ')';
		
		text += StringTable.SignWord_Percent;
	}
	
	text = text2 + text;
	TextRenderer.drawKeywordText(x, y, text, -1, color, font);
}

var alias2 = SkillInfoWindow.getWindowHeight;
SkillInfoWindow.getWindowHeight = function() {
	var count = 0;
	var y = alias2.call(this);

	if (this._skill === null) {
		return y;
	}

	//When setting the activation condition
	count += OT_SkillInfoExtraWindow.GetExtraConfigConditionSettingSum( this._skill );
	if(count > 0) count++;

	//When setting other settings
	count += OT_SkillInfoExtraWindow.GetExtraConfigOtherSettingSum( this._skill );

	//Whether or not there are turns until reuse
	if(this._unit != null) {
		var cool = EC_SkillCheck.getCoolTime(this._unit, this._skill.getId())
		if(cool > 0) count++;
	}
	
	return y + (count * OT_SkillInfoExtraWindow.getSpaceY());
}

var alias3 = SkillInfoWindow.drawWindowContent;
SkillInfoWindow.drawWindowContent = function(x, y) {
	var text, skillText;
	var length = this._getTextLength();
	var textui = this.getWindowTextUI();
	var color = textui.getColor();
	var font = textui.getFont();
	var skill = null;
	var msg = '';
	var skill = this._skill;
	
	alias3.call(this, x, y);
		
	if (skill === null) {
		return;
	}
	
	y += alias2.call(this) - OT_SkillInfoExtraWindow.getSpaceY();

	var objRendererPos = [x, y];
	var ary = [];

	// Refer to another status for activation rate
	var now = skill.custom.EC_AddTriggerRate;
	if( now != null ) {
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_DefineString.AddTriggerRateMsg, length, ColorValue.KEYWORD, font);
		
		msg = EC_SituationRenderer.getArrayAddTriggerRateMessage(now, 22);
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, msg, length, color, font);

		//for( var key in now ) {
		//	OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, key, length, color, font);
		//}
	}

	
	//Number of turns until reuse
	if(this._unit != null) {
		var cool = EC_SkillCheck.getCoolTime(this._unit, skill.getId())
		if(cool > 0) {
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getNowCommandCoolTimeMessage(cool), length, ColorValue.KEYWORD, font);
		}
	}

	//Command skills
	OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getCommandSkillMessage(skill.custom.EC_Command), length, ColorValue.KEYWORD, font);

	if( skill.custom.EC_Command != null) {
		// Confirmation of continuous turn
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getCommandDurationMessage(skill.custom.EC_CommandDuration), length, color, font);
	}

	//Cool time
	OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getCommandCoolTimeMessage(EC_GetCommandCoolTime(skill)), length, color, font);

	//When the lower and upper limits of the activation rate are set
	OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getScopePercentMessage(skill.custom.EC_ScopePercent), length, ColorValue.KEYWORD, font);

	//When the number of activations is fixed
	OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getTriggerCountMessage(skill.custom.EC_TriggerCountMap, skill.custom.EC_TriggerCountTurn, skill.custom.EC_TriggerCountBattle), length, ColorValue.KEYWORD, font);

	//Skills of ignoring closeouts
	OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getAbandonIgnoreMessage(skill.custom.EC_isAbandonIgnore), length, ColorValue.KEYWORD, font);

	//There are settings for consumption EP and consumption FP
	OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getUsePointMessage(skill.custom.EC_UseEP, skill.custom.EC_UseFP), length, ColorValue.KEYWORD, font);

	if( OT_SkillInfoExtraWindow.GetExtraConfigConditionSettingSum( skill ) > 0 )
	{
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, 'Trigger condition', length, ColorValue.KEYWORD, font);
		
		//---Old setting---------------------------------------

		// Can be activated if the current HP is within the set range
		// For old settings
		if( skill.custom.EC_NowHP != null )
		{
			msg = EC_SituationRenderer.getParamRangeMessage(EC_DefineStatus.HP, skill.custom.EC_NowHP);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, msg, length, color, font);
		}

		// Can be activated if the opponent's current HP is within the set range
		// For old settings
		if( skill.custom.EC_OpponentNowHP != null )
		{
			msg = EC_DefineString.Opponent + EC_SituationRenderer.getParamRangeMessage(EC_DefineStatus.HP, skill.custom.EC_OpponentNowHP);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, msg, length, color, font);
		}

		// Triggered by proximity or indirect
		// For old settings
		if( skill.custom.EC_isDirectAttack != null )
		{
			msg = '';

			if( skill.custom.EC_isDirectAttack )
			{
				msg = 'The other party is adjacent';
			}
			else
			{
				msg = 'The other party is not adjacent';
			}
	
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, msg, length, color, font);
		}
		
		// Activation judgment by physical or magic
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getPhysicsMessage(skill.custom.EC_isPhysics), length, color, font);

		// Activation judgment depending on whether the opponent is physical or magic
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getPhysicsMessage(skill.custom.EC_isOpponentPhysics, true), length, color, font);
		
		//---Setting whether it can be activated according to the situation at the time of battle---------------------------------------
        // Can be activated on specific turns
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getTurnMessage(skill.custom.EC_StartTurn, skill.custom.EC_EndTurn, skill.custom.EC_TimesTurn), length, color, font);
		
		// Can be activated by first attack or second attack
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getSrcMessage(skill.custom.EC_isSrc), length, color, font);

		// Activates after a certain number of attacks until the skill is activated
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getAttackCountMessage(skill.custom.EC_AttackCount), length, color, font);

		// Activates when the number of attacks of the opponent until the skill is activated is a certain number of times
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getAttackCountMessage(skill.custom.EC_OpponentAttackCount, true), length, color, font);
		
		// Activation judgment based on the distance to the opponent
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getRangeMessage(skill.custom.EC_Range), length, color, font);

		// Can be activated if the bank is within the set range
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getFusionMessage(skill.custom.EC_FusionID), length, color, font);

		// Can be activated if the other party's accompaniment is within the set range
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getFusionMessage(skill.custom.EC_OpponentFusionID, true), length, color, font);

		// Can be activated if the type of troops is within the set range
		//OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getClassTypeMessage(skill.custom.EC_ClassType), length, color, font);

		// 相Can be activated if the type of hand is within the set range
		//OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getClassTypeMessage(skill.custom.EC_OpponentClassType, true), length, color, font);

		// Can be activated if the state is within the set range
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getStateMessage(skill.custom.EC_StateID), length, color, font);

		// Can be activated if the opponent's state is within the set range
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getStateMessage(skill.custom.EC_OpponentStateID, true), length, color, font);

		// Can be activated if the weapon type is within the set range
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getWeaponTypeMessage(skill.custom.EC_WeaponType), length, color, font);

		// Can be activated if the opponent's weapon type is within the set range
		OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, EC_SituationRenderer.getWeaponTypeMessage(skill.custom.EC_OpponentWeaponType, true), length, color, font);

		// Can be activated if the status is within the set range
		if(skill.custom.EC_NowStatus != null)
		{
			msg = EC_DefineString.NowStatus;
			ary = EC_SituationRenderer.getArrayParamMessage(skill.custom.EC_NowStatus, 22);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, msg, length, color, font);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, ary, length, ColorValue.LIGHT, font);
		}

		// Can be activated if the opponent's status is within the set range
		if(skill.custom.EC_OpponentNowStatus != null)
		{
			msg = EC_DefineString.Opponent + EC_DefineString.NowStatus;
			ary = EC_SituationRenderer.getArrayParamMessage(skill.custom.EC_OpponentNowStatus, 22);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, msg, length, color, font);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, ary, length, ColorValue.LIGHT, font);
		}

		//---Activated if above the opponent's status
		if(skill.custom.EC_OverStatus != null)
		{
			msg = EC_DefineString.OverStatus;
			ary = EC_SituationRenderer.getArrayParamMessage(skill.custom.EC_OverStatus, 22);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, msg, length, color, font);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, ary, length, ColorValue.LIGHT, font);
		}

		//---Activated if below the opponent's status
		if(skill.custom.EC_UnderStatus != null)
		{
			msg = EC_DefineString.UnderStatus;
			ary = EC_SituationRenderer.getArrayParamMessage(skill.custom.EC_UnderStatus, 22);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, msg, length, color, font);
			OT_SkillInfoExtraWindow.rendererMessage(objRendererPos, ary, length, ColorValue.LIGHT, font);
		}
	}
	
}

// Skill window drawing
var alias4 = SkillInfoWindow.drawWindow;
SkillInfoWindow.drawWindow = function(x, y) {
	var width = this.getWindowWidth();
	var height = this.getWindowHeight();
	var textui = this.getWindowTextUI();
	var pic = textui.getUIImage();

	//Shift the position of the window so that it does not overlap with the description at the bottom of the screen
	if( (y+height) > ( root.getGameAreaHeight() - UIFormat.SCREENFRAME_HEIGHT ) )
	{
		y = ( root.getGameAreaHeight() - UIFormat.SCREENFRAME_HEIGHT ) - (height);
		
		// Adjust so that it does not protrude from the screen
		if( y < 0 ) y = 0;
	}

	alias4.call(this, x, y)
}


var OT_SkillInfoExtraWindow = {
	//Get the number of trigger rate settings
	GetExtraConfigPercentSettingSum: function( skill )
	{
		var count = 0;
	
		if( skill.custom.EC_DefaultPercent    != null ) count++;
		if( skill.custom.EC_Correction        != null ) count++;
		if( skill.custom.EC_ScopePercent      != null ) count++;
		
		return count;
	},
	
	//Get the number of trigger condition settings
	GetExtraConfigConditionSettingSum: function( skill )
	{
		var count = 0;
		var ary = [];
		
		if( skill.custom.EC_NowHP               != null ) count++;
		if( skill.custom.EC_OpponentNowHP       != null ) count++;
		if( skill.custom.EC_isDirectAttack      != null ) count++;

		if( skill.custom.EC_isSrc               != null ) count++;
		if( skill.custom.EC_isPhysics           != null ) count++;
		if( skill.custom.EC_isOpponentPhysics   != null ) count++;
		if( skill.custom.EC_StartTurn != null || skill.custom.EC_EndTurn != null || skill.custom.EC_TimesTurn != null) count++;
		if( skill.custom.EC_AttackCount         != null ) count++;
		if( skill.custom.EC_OpponentAttackCount != null ) count++;
		if( skill.custom.EC_Range               != null ) count++;

		if( skill.custom.EC_FusionID            != null ) count++;
		if( skill.custom.EC_OpponentFusionID    != null ) count++;
		//if( skill.custom.EC_ClassType           != null ) count++;
		//if( skill.custom.EC_OpponentClassType   != null ) count++;
		if( skill.custom.EC_StateID             != null ) count++;
		if( skill.custom.EC_OpponentStateID     != null ) count++;
		if( skill.custom.EC_WeaponType          != null ) count++;
		if( skill.custom.EC_OpponentWeaponType  != null ) count++;
	
		//---Status is in a certain range
		ary = EC_SituationRenderer.getArrayParamMessage(skill.custom.EC_NowStatus, 22);
		if(ary.length > 0)
		{
			count += ary.length + 1;
		}

		//---The status of the other party is in a certain range
		ary = EC_SituationRenderer.getArrayParamMessage(skill.custom.EC_OpponentNowStatus, 22);
		if(ary.length > 0)
		{
			count += ary.length + 1;
		}

		//---Above the opponent's status
		ary = EC_SituationRenderer.getArrayParamMessage(skill.custom.EC_OverStatus, 22);
		if(ary.length > 0)
		{
			count += ary.length + 1;
		}

		//---Below the opponent's status
		ary = EC_SituationRenderer.getArrayParamMessage(skill.custom.EC_UnderStatus, 22);
		if(ary.length > 0)
		{
			count += ary.length + 1;
		}

		return count;
	},

	//Get the number of other settings
	GetExtraConfigOtherSettingSum: function( skill )
	{
		var count = 0;
	
		//When the lower and upper limits of the activation rate are set
		if( skill.custom.EC_ScopePercent != null ) count++;
	
		//For skills that ignore closeouts
		if( skill.custom.EC_isAbandonIgnore != null && skill.custom.EC_isAbandonIgnore == true ) count++;
	
		//When the number of activations is fixed
		if( skill.custom.EC_TriggerCountMap != null || skill.custom.EC_TriggerCountTurn != null || skill.custom.EC_TriggerCountBattle != null ) count++;
		
		//There are settings for consumption EP and consumption FP
		if( skill.custom.EC_UseEP != null || skill.custom.EC_UseFP != null ) count++;
		
		//Command trigger type
		if( OT_isCommandSkill(skill) ) count += 2;
		
		//Cool time
		if( EC_GetCommandCoolTime(skill) > 0 ) count++;

		//Status value reflected in activation rate
		ary = EC_SituationRenderer.getArrayAddTriggerRateMessage(skill.custom.EC_AddTriggerRate, 22);
		if(ary.length > 0)
		{
			count += ary.length + 1;
		}
	
		return count;
	},
	
	rendererMessage: function(obj, msg, length, color, font) {
		if( msg != '' )
		{
			EC_SituationRenderer.rendererMessage(obj, msg, length, color, font, [0, OT_SkillInfoExtraWindow.getSpaceY()]);
		}
	},

	rendererDoubleMessage: function(obj, msg, msg2, length) {
		if( msg != '' )
		{
			var textui = this.getWindowTextUI();
			var color = textui.getColor();
			var font = textui.getFont();
			
			EC_SituationRenderer.rendererMessage(obj, msg, length, color, font, [0, OT_SkillInfoExtraWindow.getSpaceY()]);
			EC_SituationRenderer.rendererMessage(obj, msg2, length, ColorValue.LIGHT, font, [0, OT_SkillInfoExtraWindow.getSpaceY()]);
		}
	},

	getSpaceY : function( skill )
	{
		//25
		return ItemInfoRenderer.getSpaceY();
	}

};

// Blinking setting
var bFlashingC = false;
var iFlashingRate = 255;
var iFlashingRatePlus = 10;

var alias10 = IconItemScrollbar.drawScrollbar;
IconItemScrollbar.drawScrollbar = function(xStart, yStart) {
	alias10.call(this, xStart, yStart);
	
	if(bFlashingC) {
		iFlashingRate += iFlashingRatePlus;
		if(iFlashingRate >= 255) {
			iFlashingRate = 255;
			bFlashingC = false;
		}
	} else {
		iFlashingRate -= iFlashingRatePlus;
		if(iFlashingRate <= 0) {
			iFlashingRate = 0;
			bFlashingC = true;
		}
	}
};

// Icon part
var alias11 = IconItemScrollbar.drawScrollContent;
IconItemScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
	
	//Processed to ignore when an error occurs in the existence check system just in case
	try {
		if(this._unit != null && object.skill != null) {
			var dx = 0;
			var dy = 0;
			var bEnable = false;
			var bDuration = false;
			
			// Display of continuous turns
			var duration = EC_SkillCheck.getDuration(this._unit, object.skill.getId());
			if(duration > 0) {
				dx = 8;
				dy = -18;
				NumberRenderer.drawRightNumberColor(x + dx, y + dy, duration, 1, 255);
				bEnable = true;
				bDuration = true;
			} else {
				var bEnable = false;
				if(this._unit.custom.tmpCommandSkillID != null) {
					if(this._unit.custom.tmpCommandSkillID == object.skill.getId()) {
						bEnable = true;
						bDuration = true;
					}
				} 
				
			}
	
			// Display of cool time time
			var cool = EC_SkillCheck.getCoolTime(this._unit, object.skill.getId());
			if(cool > 0) {
				dx = 8;
				dy = 18;
				NumberRenderer.drawRightNumberColor(x + dx, y + dy, cool, 3, 255);
				bEnable = true;
			}

			// If it is not during the effect time or cool time, it will be described by processing the official script.
			if(bEnable) {
				var handle = object.skill.getIconResourceHandle();
				var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();
				

				if(bDuration) {
					graphicsRenderParam.alpha = iFlashingRate;
					GraphicsRenderer.drawImageParam(x, y, handle, GraphicsType.ICON, graphicsRenderParam);
				} else {
					GraphicsRenderer.OT_drawImageParamSkill(x, y, handle, GraphicsType.ICON, graphicsRenderParam, 0x0, 192);
				}
				
			}else{
				alias11.call(this, x, y, object, isSelect, index);
			}
			return;
		}
	} catch(e) {
		root.log('----------');
		root.log('OT_ExtraConfigSkill\\window-skillinfoExtra.jsの');
		root.log('Error occurred in skill icon depiction');
		root.log(e.message);
		root.log('Switch icon depiction to official script processing');
		root.log('----------');
	}
	alias11.call(this, x, y, object, isSelect, index);
};

function GetStringLen(str) {
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
};

})();
