
/*--------------------------------------------------------------------------
  
  This is a script for activating a skill from a command.
  It creates an element in the skill list window from the "Command Skills" section.
  
  How to use :
  Set the skill's custom parameter as {EC_Command:'ATTACK'}.
  
  Created by :
  o-to
  
  Update history:
  06/12/2015: New
  
--------------------------------------------------------------------------*/

var OT_SkillListWindow = defineObject(BaseWindow,
{
	_scrollbar: null,
	
	initialize: function() {
		this._scrollbar = createScrollbarObject(OT_SkillListScrollbar, this);
	},
	
	moveWindowContent: function() {
		return this._scrollbar.moveInput();
	},
	
	drawWindowContent: function(x, y) {
		this._scrollbar.drawScrollbar(x, y);
	},
	
	getWindowWidth: function() {
		return this._scrollbar.getScrollbarWidth() + (this.getWindowXPadding() * 2);
	},
	
	getWindowHeight: function() {
		return this._scrollbar.getScrollbarHeight() + (this.getWindowXPadding() * 2);
	},
	
	setDefaultSkillFormation: function() {
		this.setSkillFormation(DataConfig.getMaxUnitItemCount());
	},
	
	setSkillFormation: function(count) {
		this._scrollbar.setScrollFormation(1, count);
	},
	
	setUnitMaxSkillFormation: function(unit) {
		this._scrollbar.setUnitMaxSkillFormation(unit);
	},
	
	setUnitSkillFormation: function(unit) {
		this._scrollbar.setUnitSkillFormation(unit);
	},
	
	setStockSkillFormation: function() {
		this._scrollbar.setStockSkillFormation();
	},
	
	setActive: function(isActive) {
		this._scrollbar.setActive(isActive);
	},
	
	setForceSelect: function(index) {
		this._scrollbar.setForceSelect(index);
	},
	
	enableSelectCursor: function(isActive) {
		this._scrollbar.enableSelectCursor(isActive);
	},
	
	enableWarningState: function(isEnabled) {
		this._scrollbar.enableWarningState(isEnabled);
	},
	
	getCurrentSkill: function() {
		return this._scrollbar.getObject();
	},
	
	getSkillIndex: function() {
		return this._scrollbar.getIndex();
	},
	
	setSkillIndex: function(index) {
		return this._scrollbar.setIndex(index);
	},
	
	resetSkillList: function() {
		this._scrollbar.resetScrollData();
	},
	
	getSkillFromIndex: function(index) {
		return this._scrollbar.getObjectFromIndex(index);
	},
	
	getSkillScrollbar: function() {
		return this._scrollbar;
	}
}
);

var OT_SkillListScrollbar = defineObject(BaseScrollbar,
{
	_unit: null,
	_isWarningAllowed: false,
	_arrAvailable: null,
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var isAvailable, color;
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var skill = object.skill;
		
		if (object === null) {
			return;
		}
		
		if (this._arrAvailable !== null) {
			isAvailable = this._arrAvailable[index];
		}
		else {
			isAvailable = true;
		}
		color = this._getTextColor(skill, isSelect, index);
		
		//root.log('test0');
		if (isAvailable) {
			SkillRenderer.OT_drawSkill(x, y, skill, color, font, this._unit, true);
		}
	},
	
	playOptionSound: function() {
		MediaControl.soundDirect('commandselect');
	},
	
	getObjectWidth: function() {
		return ItemRenderer.getItemWidth();
	},
	
	getObjectHeight: function() {
		return ItemRenderer.getItemHeight();
	},
	
	enableWarningState: function(isEnabled) {
		this._isWarningAllowed = isEnabled;
	},
	
	setUnitSkillFormation: function(unit) {
		this._unit = unit;
	},
	
	resetAvailableData: function() {
		var i, skill;
		var length = this._objectArray.length;
		
		this._arrAvailable = [];
		
		for (i = 0; i < length; i++) {
			skill = this._objectArray[i];
			if (skill !== null) {
				this._arrAvailable.push(this._isAvailable(skill, false, i));
			}
		}
	},
	
	_isAvailable: function(object, isSelect, index) {
		var isAvailable;

		//isAvailable = AttackChecker.isUnitAttackable(this._unit);
		return isAvailable;
	},
	
	_getTextColor: function(object, isSelect, index) {
		var textui = this.getParentTextUI();
		var color = textui.getColor();
		
		if (this._isWarningSkill(object)) {
			color = ColorValue.KEYWORD;
		}
		
		return color;
	},
	
	_isWarningSkill: function(object) {
		return this._isWarningAllowed && Miscellaneous.isTradeDisabled(this._unit, object);
	}
}
);


// Drawing skills
SkillRenderer.OT_drawSkill = function(x, y, skill, color, font, unit, isDrawLimit)
{
	var handle = skill.getIconResourceHandle();
	var length = this._getTextLength();
	var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
	var interval = ItemRenderer._getItemNumberInterval();
	var id = skill.getId();
	var cnt = 0;
	var limit = 0;

	if( unit.custom.tmpSkillTriggerCount != null )
	{
		if( unit.custom.tmpSkillTriggerCount[id] != null )
		{
			cnt = parseInt(unit.custom.tmpSkillTriggerCount[id].MAP);
		}
	}
	
	GraphicsRenderer.drawImage(x, y, handle, GraphicsType.ICON);
	
	TextRenderer.drawKeywordText(x + iconWidth, y, skill.getName(), length, color, font);

	if (isDrawLimit) {
		x = x + iconWidth + interval;
		if (skill.custom.EC_TriggerCountMap != null) {
			limit = parseInt(skill.custom.EC_TriggerCountMap[0]);

			NumberRenderer.drawNumber(x, y, (limit - cnt));
		}
		else {
			// If the skill has no limit to the number of times it can be used
			TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
		}
	}
};
