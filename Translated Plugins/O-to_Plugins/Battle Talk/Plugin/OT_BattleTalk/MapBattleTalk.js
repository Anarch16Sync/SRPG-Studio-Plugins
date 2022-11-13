
/*----------------------------------------------------------------------
  
  Mini dialogue will flow during battle. (for simple combat)
  Be sure to install it together with BattleTalk.js.

  how to use:
  "Plugin" and "Material" in the folder
  Please overwrite the "Plugin" and "Material" of the project.
  
  Author:
  o-to
  
  Change log:
  2015/10/5: Create new
  
----------------------------------------------------------------------*/



(function() {

var TalkAdjustX = -32;					//Talk window x coordinate position adjustment
var TalkAdjustY = 10;					//Talk window y-coordinate position adjustment
var FaceAdjustX = 4;					//face window x coordinate adjustment
var FaceAdjustY = -14;					//Face window y-coordinate adjustment
var FaceFrameUI = 'graphicsshow_frame';	//face window frame

var alias1 = EasyAttackMenu.drawWindowManager;
EasyAttackMenu.drawWindowManager = function()
{
	alias1.call(this);
	
	var isLeft = Miscellaneous.isUnitSrcPriority(this._unit, this._currentTarget);

	// battle talk drawing
	this.BT_drawWindowBattleTalk();
	this.BT_drawBattleTalk(this._unit, isLeft);
	this.BT_drawBattleTalk(this._currentTarget, !isLeft);

	this.OT_drawFaceAreaMap(this._unit, isLeft);
	this.OT_drawFaceAreaMap(this._currentTarget, !isLeft);
};

// window drawing
EasyAttackMenu.BT_drawWindowBattleTalk = function()
{
	var x, y;
	var dx = 0;
	var yCeneter = root.getGameAreaHeight() / 2;
	var pic   = OT_BattleTalkData.WindowPic;

	var count = OT_BattleTalkData.TalkWidth;
	var width = TitleRenderer.getTitlePartsWidth();
	var height = TitleRenderer.getTitlePartsHeight();
	var picWidth = (width * count) + width * 2;

	if( yCeneter <= this.getPositionWindowY() )
	{
		y = this.getPositionWindowY() + this._leftWindow.getWindowHeight() - TalkAdjustY;
	}
	else
	{
		y = this.getPositionWindowY() - height + TalkAdjustY;
	}

	// left window
	x = this.getPositionWindowX() - ( picWidth - this._leftWindow.getWindowWidth() ) + TalkAdjustX;
	TitleRenderer.drawTitle(pic, x, y, width, height, count);
	
	// right window
	x = this.getPositionWindowX() + this._leftWindow.getWindowWidth() - TalkAdjustX + 2;
	TitleRenderer.drawTitle(pic, x, y, width, height, count);
};

// drawing text
EasyAttackMenu.BT_drawBattleTalk = function(unit, isLeft)
{
	var x, y;
	var width = TitleRenderer.getTitlePartsWidth();
	var height = TitleRenderer.getTitlePartsHeight();
	var yCeneter = root.getGameAreaHeight() / 2;

	var color = OT_BattleTalkData.MessageColor;
	var font  = OT_BattleTalkData.MessageFont;
	var text  = OT_BattleTalkData.GetTalk( unit, isLeft );

	var count = OT_BattleTalkData.TalkWidth;
	var picWidth = (width * count) + width * 2;
	var textWidth = root.getGraphicsManager().getTextWidth(text, font);
	var areaWidth = width * count;
	
	if(isLeft)
	{
		// left window
		x = this.getPositionWindowX() - ( picWidth - this._leftWindow.getWindowWidth() ) + TalkAdjustX;
	}
	else
	{
		// right window
		x = this.getPositionWindowX() + this._leftWindow.getWindowWidth() - TalkAdjustX;
	}
	

	if( yCeneter <= this.getPositionWindowY() )
	{
		y = this.getPositionWindowY() + this._leftWindow.getWindowHeight() - TalkAdjustY;
	}
	else
	{
		y = this.getPositionWindowY() - height + TalkAdjustY;
	}

	// If the text is more than one line, align it to the left
	if( textWidth > areaWidth )
	{
		TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.LEFT, null, count);
	}
	else
	{
		TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.CENTER, null, count);
	}
};

// Processing when attacking on the map
var alias2 = EasyMapUnit.startMove;
EasyMapUnit.startMove = function(order, attackInfo) {
	alias2.call(this, order, attackInfo);

	var isLeft;
	var unit = this._unit;
	var isCritical = order.isCurrentCritical();
	var isFinish = order.isCurrentFinish();
	var active = order.getActiveUnit();
	var passive = order.getPassiveUnit();

	// Check left unit
	if (this._isSrc) {
		isLeft = Miscellaneous.isUnitSrcPriority(attackInfo.unitSrc, attackInfo.unitDest);
	}
	else {
		isLeft = Miscellaneous.isUnitSrcPriority(attackInfo.unitDest, attackInfo.unitSrc);
	}

	// Attack processing
	if (unit === active)
	{
		if(isFinish)
		{
			// Death line for those who died
			OT_BattleTalkData.SetTalk( passive, OT_BattleTalkType.DEAD, !isLeft );
		
			// The one who wins wins
			OT_BattleTalkData.SetVictoryTalk( active, isLeft );
		}
		else 
		{
			// Acquire the attacking side's equipped weapon
			weapon = ItemControl.getEquippedWeapon(active);
			if (weapon !== null)
			{
				if (weapon.getWeaponCategoryType() === WeaponCategoryType.MAGIC)
				{
					OT_BattleTalkData.SetAttackTalk(active, isLeft, this._isSrc, isCritical, MotionCategoryType.MAGIC);
				}
				else
				{
					OT_BattleTalkData.SetAttackTalk(active, isLeft, this._isSrc, isCritical, MotionCategoryType.ATTACK);
				}
			}

			// Defender settings
			if (order.isCurrentHit())
			{
				// Damage dialogue
				OT_BattleTalkData.SetDamageTalk( passive, !isLeft, order.getPassiveDamage() );
			}
			else
			{
				OT_BattleTalkData.SetTalk( passive, OT_BattleTalkType.AVOID, !isLeft );
			}
		}
	}
};


// drawing a face chart
EasyAttackMenu.OT_drawFaceAreaMap = function(unit, isLeft) {
	var FaceID = OT_BattleTalkData.GetFace(unit, isLeft);
	var x, y;
	var dx = 0;

	var count = OT_BattleTalkData.TalkWidth;
	var width = TitleRenderer.getTitlePartsWidth();
	var height = TitleRenderer.getTitlePartsHeight();
	var picWidth = (width * count) + width * 2;

	var isReverse = false;

	var picFrame = root.queryUI(FaceFrameUI);
	var xMargin = 16;
	var yMargin = 16;
	var frameWidth = Math.floor(UIFormat.FACEFRAME_WIDTH / 2);
	var frameHeight = UIFormat.FACEFRAME_HEIGHT;

	if(isLeft)
	{
		isReverse = true;
		x = this.getPositionWindowX() - frameWidth + FaceAdjustX;
	}
	else
	{
		x = this.getPositionWindowX() + (this._leftWindow.getWindowWidth() * 2) - FaceAdjustX;
	}
	
	y = this.getPositionWindowY() + FaceAdjustY;
	
	if (picFrame !== null) {
		picFrame.drawStretchParts(x, y, frameWidth, frameHeight, frameWidth, 0, frameWidth, frameHeight);
	}
	
	drawUnitFaceTalkCustom(x + xMargin, y + yMargin, unit, isReverse, 255, FaceID);
	
	if (picFrame !== null) {
		picFrame.drawStretchParts(x, y, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
	}

};

})();
