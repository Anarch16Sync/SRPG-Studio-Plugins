
/*-----------------------------------------------------------------------------------------------
  
Implement items that perform ranged attacks.
    
  how to use:
  Select custom in item, set OT_ItemEffectRange in keyword,
  Set each parameter in the item's custom parameters. (see readme)

  ・Custom parameters that can be passed
  See readme
  
  Author:
  o-to
  
  Change log:
  2015/10/11: Create a new range attack item (prototype)
  2015/10/13: Added various elements such as range designation and additional status
  2015/10/16: Fixed to correspond to official update 1.035
  2015/10/31: Responding to skill status ailments, improving enemy AI
              Added damage value display, fixed to play damage effect and unit disappearance at the same time
              Fixed the animation when adding a state to depend on the state's map animation
              Add map terrain change effect
Changed the damage when used to be done with the enemy's damage
  2015/12/04: Fixed because it ends with an error in the latest version
              Supports animation playback on the tool side
  2016/02/28:
  1.060 correspondence, fixed because it ends with an error when the enemy is surrounded by blocks or allies
  2016/03/23:
  First aid for 1.067 error
  2016/04/25:
  Fixed a bug that prevented enemies from using auxiliary-only range items
  2016/05/03:
  Corrected so that damage display and HP recovery amount display are omitted when auxiliary only (fixed damage or fixed recovery amount is 0)
  It is now possible to set a multiplier for the score used to determine the action of the enemy AI.
  Corrected to recover HP when specifying negative damage when using
  Ability to set the HP absorption rate of the damage dealt
  2016/07/31:
  1.086 compatible, fixed to end with an error when using

  2016/10/17:
Modified so that the value of each status can be set to affect the correction of power
  Added a setting to multiply the final attack power by a correction value
  Fixed some typos

  2017/01/16:
  Error handling when adding states in Ver 1.109

  2017/01/29:
  Fixed a problem that caused an error when the enemy performed a ranged attack that added a state.

  2017/02/05:
  Fixed the place where the declaration of the variable used for the for loop was forgotten
  *If there is another script that forgets to declare in the same way, unintended behavior will occur.

  2017/12/16:
  Fixed an issue that stopped with an error when hovering over a unit when selecting the activation position of a range attack item

  2018/05/01:
  Fixed a bug that caused an error when destroying an enemy with a ranged attack.

  2019/10/06:
  When OT_UnitReflection is set to true and unit ability is reflected in power,
  Fixed so that the correction value of the attack by "support effect" is referenced.
Corrected so that the correction value of defense by "support effect" is referred to when the damage type is physical or magic.
  Fixed whether or not to be affected by the attack, defense, hit, and evasion of the support effect can be set with Kaspara (each default is true).

  2020/02/23:
  If the user is included in the target when recovering the range with OT_Recovery set to true,
  Fixed an issue where the user was being healed twice.

  2020/04/28:
  Added a custom parameter called IER_HitMark as a mandatory setting.
  
  Fixed so that the effect range becomes "whole area" when 99 is set to IER_EffectRangeType.
  If the range of effect is the entire area, the range type specification is invalid and can be activated anywhere.
  Also added a square type to the area effect type.
  
  Added a custom parameter called IER_SoundDuplicate to prevent duplication of hit sounds.
  
  Fixed an issue where if the area of ​​effect is Breath type, moving the cursor diagonally to the user would cause an extreme drop in processing.
Fixed the variable name that was likely to be the source of the problem (IndexArray → indexArray)
  Also, when the effect range type is breath type, the range type is now forced to be a cross type.
  
  Added box type to area of ​​effect type.
  
  The description of the item is divided, and the display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).
  
  Fixed the window so that the damage and hit rate for characters within the effect range are displayed.
  The display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).
  
  Greatly modified AI processing when enemies use range attack items. Greatly improved processing speed.
  
  Reviewed default values ​​to work with minimum custom parameters (power, range).
  Create a file EffectRangeItemDefault.js that defines default values.
  
  About IER_HitReflection (adding unit skill to hit rate, adding weapon hit value to hit rate)
Split parameters into IER_HitReflectionUnit, IER_HitReflectionWeapon.
  (It is possible to specify either the old model or the new method)

  2020/05/04:
  Fixed AI processing when enemies use area attack items.
  When using area recovery or indiscriminate type, if the total number of enemies was large, the score check was heavy,
  Reduced processing so as not to check the predicted range and check the score of units that are sure to be out of range.
  When indiscriminate, if there are enemies and allies around, range attack items may not be used.
  Fixed range attack check processing.
  Fixed because the log for debug confirmation was output.

  2020/05/06:
  Due to reported errors attributed to script conflicts,
  Corrected variable name in reported part.
  Because it affects when BaseCombinationCollector._getTargetListArray is modified
Modified to do the same processing as BaseCombinationCollector._getTargetListArray that has not been modified with a dedicated function.
  The checkTime for debugging is not output to the console in Omoto, but just in case, it is commented out

  2020/09/06:
  By playing the effect animation specified by Caspara (OT_EffectAnime)
  I was using animationPlay of DynamicEvent
  Even if the effect finishes playing, it will not proceed to the next process unless the skip key is pressed to skip.
  Modified processing to play back with DynamicAnime because there was a possibility of malfunction

-----------------------------------------------------------------------------------------------*/

(function() {


var alias1 = ItemPackageControl.getCustomItemSelectionObject;
ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
	var result = alias1.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeSelection;
	}
	
	return result;
};

var alias2 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword) {
	var result = alias2.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeUse;
	}
	
	return result;
};

var alias3 = ItemPackageControl.getCustomItemInfoObject;
ItemPackageControl.getCustomItemInfoObject = function(item, keyword) {
	var result = alias3.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeInfo;
	}
	
	return result;
};

var alias4 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword) {
	var result = alias4.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeAvailability;
	}
	
	return result;
};

var alias5 = ItemPackageControl.getCustomItemAIObject;
ItemPackageControl.getCustomItemAIObject = function(item, keyword) {
	var result = alias5.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeAI;
	}
	
	return result;
};

// Get experience
var alias6 = ItemExpFlowEntry._getItemExperience;
ItemExpFlowEntry._getItemExperience = function(itemUseParent) {
	var exp = alias6.call(this, itemUseParent);

	if( itemUseParent.OT_SetExp != null )
	{
		exp += itemUseParent.OT_SetExp;
	}
	
	if (exp > 100) {
		exp = 100;
	}
	else if (exp < 0) {
		exp = 0;
	}

	return exp;
};

//Displayed when the cursor is aligned with the opponent when selecting the item activation position
//set mini window information object
var alias7 = ItemPackageControl.getCustomItemPotencyObject;
ItemPackageControl.getCustomItemPotencyObject = function(item, keyword) {
	var result = alias7.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return createObject(BaseItemPotency);
	}
	
	return result;
};

// Displayed when hovering the cursor over the opponent when selecting the item activation position
// Configuring the miniwindow information object
//var alias8 = PosItemWindow.setPosTarget;
//PosItemWindow.setPosTarget = function(unit, item, targetUnit, targetItem, isSrc) {
//	if (item !== null && !item.isWeapon()) {
//		root.log(item.getCustomKeyword());
//		if(item.getCustomKeyword() == OT_ItemEffectRange_getCustomKeyword()) {
//			
//			return;
//		}
//	}
//	
//	//alias8.call(unit, item, targetUnit, targetItem, isSrc);
//};

var OT_ItemEffectRangeSelection = defineObject(BaseItemSelection,
{
	enterItemSelectionCycle: function(unit, item) {
		this._unit = unit;
		this._item = item;
		this._targetUnit = this._unit;
		this._targetPos = createPos(this._unit.getMapX(), this._unit.getMapY());
		this._targetClass = null;
		this._targetItem = null;
		this._isSelection = false;
		this._posSelector = createObject(OT_EffectRangePosSelector);
		
		return this.setInitialSelection();
	},
	setInitialSelection: function() {
		this.setPosSelection();
		
		return EnterResult.OK;
	},

	// Called when the item is used for a specific position
	setPosSelection: function() {
		var filter = this.getUnitFilter();
		var indexArray = OT_EffectRangeIndexArray.createIndexArray(this._unit.getMapX(), this._unit.getMapY(), this._item);
		
		this._posSelector.setUnitOnly(this._unit, this._item, indexArray, PosMenuType.Item, filter);
		
		this.setFirstPos();
	},

	// Check if you are within range when using an item
	isPosSelectable: function() {
		this._targetPos = this._posSelector.getSelectorPos(true);
		return this._targetPos !== null;
	},
			
	getUnitFilter: function() {
		var indifference = false;
		return UnitFilterFlag.PLAYER;
	}

}
);

var OT_ItemEffectRangeUseMode = {
	  START          : 0
	, ANIME          : 1
	, DAMAGE         : 2
	, ERASE          : 3
	, FLOWENTRY      : 4
	, FLOW           : 5
	, STATEENTRY     : 6
	, STATE          : 7
	, USEAFTER       : 8
	, END            : 9
};

var OT_ItemEffectRangeAnimeID = {
	  DAMAGE         : 10000
};

var OT_ItemEffectRangeUse = defineObject(BaseItemUse,
{
	_dynamicEvent: null,
	_targetPos: null,
	_itemTargetInfo: null,
	_itemUseParent: null,

	_dynamicAnime: Array(),
	_HitUnit: Array(),
	_AvoidUnit: Array(),
	_deadUnit: Array(),
	_HitDamage: Array(),
	_damageHitFlow: Array(),

	_eraseCounter: 0,
	_dynamicUseAnime: null,
	_FrameCount: 0,
	
	_soundDuplicate:true,
	_soundArray: Array(),
	_soundIdArray: Array(),

	_prepareData: function() {
		this._dynamicAnime = Array();
		this._HitUnit = Array();
		this._AvoidUnit = Array();
		this._deadUnit = Array();
		
		this._HitDamage = Array();
		this._FrameCount = 0;
		this._eraseCounter = createObject(EraseCounter);
		this._damageHitFlow = null;
	},
	
	enterMainUseCycle: function(itemUseParent) {
		this._prepareData();
		
		var generator;
		this._itemUseParent = itemUseParent;
		this._itemTargetInfo = itemUseParent.getItemTargetInfo();
		this._targetPos = this._itemTargetInfo.targetPos;
		var type = this._itemTargetInfo.item.getRangeType();
		var unit = this._itemTargetInfo.targetUnit;
		this._itemUseParent.OT_SetExp = 0;

		// When using items with Ai, the position may not be initialized
		if (this._targetPos === null) {
			this._targetPos = createPos(unit.getMapX(), unit.getMapY());
		}
		
		this._dynamicEvent = createObject(DynamicEvent);
		generator = this._dynamicEvent.acquireEventGenerator();

		// Change camera position
		if (type !== SelectionRangeType.SELFONLY) {
			generator.locationFocus(this._targetPos.x, this._targetPos.y, true);
		}

		this._soundInit();
		this._soundDuplicate = OT_getCustomItemSoundDuplicate(this._itemTargetInfo.item);
		
		this.changeCycleMode(OT_ItemEffectRangeUseMode.START);
		this._dynamicEvent.executeDynamicEvent();
		
		return EnterResult.OK;
	},
	
	_drawFlow: function() {
		this._damageHitFlow.drawDamageHitFlowCycle();
	},
	
	_isLosted: function(unit) {
		return unit.getHp() <= 0;
	},
	
	_setDamage: function(unit, damage) {
		var hp;
		
		if (damage < 1) {
			return;
		}
		
		// Reduce the HP of the unit by the amount of damage
		hp = unit.getHp() - damage;
		if (hp <= 0) {
			// If the unit is invulnerable, it stays at 1 hp
			if (unit.isImmortal()) {
				unit.setHp(1);
			}
			else {
				unit.setHp(0);
				// change state to dead
				DamageControl.setDeathState(unit);
			}
		}
		else {
			unit.setHp(hp);
		}
	},
	
	_getDamageValue: function() {
		var eventCommandData = root.getEventCommandObject();
		var unit = eventCommandData.getTargetUnit();
		var damage = eventCommandData.getDamageValue();
		var type = eventCommandData.getDamageType();
		
		return Calculator.calculateDamageValue(unit, damage, type, 0);
	},

	moveUseAfter: function() {
		if(this._dynamicEvent.moveDynamicEvent() == MoveResult.END)
		{
			this.changeCycleMode(OT_ItemEffectRangeUseMode.END);
		}
		
		return MoveResult.CONTINUE;
	},

	_soundInit: function() {
		this._soundArray = [];
		this._soundIdArray = [];
	},
	
	_soundStock: function(soundHandle) {
		var soundId = soundHandle.getResourceId();
		if(this._soundDuplicate == true || this._soundIdArray.indexOf(soundId) == -1) {
			this._soundIdArray.push(soundId);
			this._soundArray.push(soundHandle);
		}
	},

	_soundPlay: function() {
		for ( i=0; i < this._soundArray.length; i++ ) {
			MediaControl.soundPlay(this._soundArray[i]);
		}
		
		this._soundArray = [];
		this._soundIdArray = [];
	},

	moveMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;

		//root.log('test');
		if (mode === OT_ItemEffectRangeUseMode.START) {
			result = this.moveEvent();
			//root.log('start');
		}
		else if (mode === OT_ItemEffectRangeUseMode.ANIME) {
			//result = MoveResult.END;
			result = this.moveAnime();
			//root.log('anime');
		}
		else if (mode === OT_ItemEffectRangeUseMode.DAMAGE) {
			//result = MoveResult.END;
			result = this.moveDamage();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.ERASE) {
			//result = MoveResult.END;
			result = this.moveErase();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.FLOWENTRY) {
			//result = MoveResult.END;
			result = this.moveFlowEntry();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.FLOW) {
			//result = MoveResult.END;
			result = this.moveFlow();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.STATEENTRY) {
			//result = MoveResult.END;
			result = this.moveStateEntry();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.STATE) {
			//result = MoveResult.END;
			result = this.moveState();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.USEAFTER) {
			result = MoveResult.END;
			//result = this.moveUseAfter();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.END) {
			result = MoveResult.END;
			//root.log('end');
		}

		return result;
	},

	drawMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;

		//root.log('test');
		if (mode === OT_ItemEffectRangeUseMode.ANIME) {
			//this.drawTest();
			this._drawAnime();
			//root.log('start');
		}
		else if (mode === OT_ItemEffectRangeUseMode.DAMAGE) {
			this.drawDamage();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.ERASE) {
			this.drawErase();
		}
		else if (mode === OT_ItemEffectRangeUseMode.FLOW) {
			this.drawFlow();
		}
		else if (mode === OT_ItemEffectRangeUseMode.STATE) {
			this.drawState();
		}
		
	},

	moveEvent: function() {
		var item = this._itemTargetInfo.item;

		if(this._dynamicEvent.moveDynamicEvent() == MoveResult.END)
		{
			// I didn't reproduce it in my environment.
			// Even if playback ends when playing animation of generator.animationPlay
			// Because there was a report that there was a bug that it did not skip to the next process unless it was skipped
			// Play animation by processing with DynamicAnime
			//var generator = this._dynamicEvent.acquireEventGenerator();
			
			// animation run
			var x = LayoutControl.getPixelX(this._targetPos.x);
			var y = LayoutControl.getPixelY(this._targetPos.y);
			var anime = OT_getCustomItemAnimeData(item);
			var pos = LayoutControl.getMapAnimationPos(x, y, anime);
	
			this._dynamicUseAnime = createObject(DynamicAnime);
			if( anime !== null ) {
				//generator.animationPlay(anime, pos.x, pos.y, false, AnimePlayType.SYNC, 9999);
				this._dynamicUseAnime.startDynamicAnime(anime, pos.x, pos.y);
			}
			
			this.changeCycleMode(OT_ItemEffectRangeUseMode.ANIME);
			//this._dynamicEvent.executeDynamicEvent();
		}
		
		return MoveResult.CONTINUE;
	},
	
	moveAnime: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		
		if(this._dynamicUseAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
			// Sound duplication invalidation processing
			if(this._soundDuplicate == false) {
				OT_EffectRangeUseSoundModeEnable();
			}
			var generator = this._dynamicEvent.acquireEventGenerator();
			var indexArray = OT_EffectRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, item, this._itemTargetInfo.unit);

			// Prepare for damage assessment
			var i, index, px, py, targetUnit;
			var length = indexArray.length;
			var damage = OT_getCustomItemFinalDamage(unit, item);
			var damageType  = OT_getCustomItemType(item);
			var damagePoint = 0;
			var totalPoint  = 0;
			//var plus = OT_getCustomItemPlus(this._itemTargetInfo.unit, item);
			var indifference = OT_getCustomItemIndifference(item);
			var ExpMagnification = OT_getCustomItemEXPMagnification(item);
			var isRecovery = OT_getCustomItemRecovery(item);
			var noDamage = OT_getNoDamegeAttack(item);

			// state to be released
			var delState = OT_getCustomItemDelState(item);

			// State to be added
			var addState = OT_getCustomItemAddState(item);
			
			// Map chip after change
			var changeChip = OT_getCustomItemMapChipChangeDate(item);
			
			// Overlapping sound effects
			var soundDuplicate = false;
			var soundArray = [];
			var soundIdArray = [];
			
			// Animation execution preparation
			var x, y, pos, i;
			
			for (i = 0; i < length; i++) {
				index = indexArray[i];
				px = CurrentMap.getX(index);
				py = CurrentMap.getY(index);
				targetUnit = PosChecker.getUnitFromPos(px, py);

				var terrain = PosChecker.getTerrainFromPos(px, py);
				//var terrainBack = root.getCurrentSession().getTerrainFromPos(px, py, false);
				//var img = terrainBack.getMapChipImage();
				//var terrainID = terrain.getId();
				//var imgID = img.getId();
				//var imgRuntime = img.isRuntime();
				
				//root.log(terrainBack.getName() + ':' + terrainBack.getId() + ':' + img.getId() + ':' + img.isRuntime() + ':' + terrainBack.custom.test);
				//root.log(terrain.getName() + ':' + terrain.getId() + ':' + img.getId() + ':' + img.isRuntime() + ':' + terrainBack.custom.test);
				//root.log(terrain.getName() + ':' + terrain.getId() + ':' + terrain.custom.IER_MapChipChangeGroup[0]);

				if( changeChip != null )
				{
					ChipLength = changeChip.length;
					for( j=0 ; j<ChipLength ; j++ )
					{
						chip = changeChip[j];
						
						if( chip[1] == false && targetUnit != null ) continue;
						
						if( OT_isCustomItemMapChipChange(chip, terrain) )
						{
							var handle2 = root.getCurrentSession().getMapChipGraphicsHandle(px, py, false);
							generator.mapChipChange(px, py, false, handle2);
							if(chip[2].length == 4)
							{
								var handle = root.createResourceHandle(chip[2][0], chip[2][1], 0, chip[2][2], chip[2][3]);
								generator.mapChipChange(px, py, true, handle);
							}
						}
					}
				}
				
				//root.log('x:' + px + ' y:' + py);
				if(targetUnit !== null) {
					// Don't hit allies unless it's an indiscriminate attack
					if(indifference == false)
					{
						if( this.getUnitTypeAllowed(this._itemTargetInfo.unit, targetUnit, isRecovery) === true ) {
							continue;
						}
					}
					//_targetUnit.push(targetUnit);

					// Check hit detection
					if( OT_getCustomItemHitCheck(this._itemTargetInfo.unit, targetUnit, item) === false )
					{
						// successfully evaded
						var pushData = [targetUnit, false];
						var anime = OT_getCustomItemMissAnimeData(item);
						
						if( anime != null )
						{
							// Get position of unit
							x = LayoutControl.getPixelX( px );
							y = LayoutControl.getPixelY( py );
							pos = LayoutControl.getMapAnimationPos(x, y, anime);

							// anime play
							var dynamicAnime = createObject(DynamicAnime);
							dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
							this._dynamicAnime.push(dynamicAnime);
							
							pushData[1] = true;
						}
						this._AvoidUnit.push(pushData);
						continue;
					}
					
					this._HitUnit.push(targetUnit);
				}
				
			}
			
			var hitLength = this._HitUnit.length;
			var avoidLength = this._AvoidUnit.length;
			var useDamage = 0;

			// Embed the processing of hit characters and evaded characters
			for ( i = 0; i < hitLength; i++ ) {
				targetUnit = this._HitUnit[i];
				
				x = LayoutControl.getPixelX( targetUnit.getMapX() );
				y = LayoutControl.getPixelY( targetUnit.getMapY() );

				if(!noDamage)
				{
					if(isRecovery)
					{
						// unit recovery
						var anime = root.queryAnime('easyrecovery');
						damagePoint = Calculator.calculateRecoveryValue(targetUnit, damage, RecoveryType.SPECIFY, 0) * -1;
						
						if( unit === targetUnit ) {
							useDamage = damagePoint;
						} else {
							// sound effect playback
							var soundHandle = root.querySoundHandle('gaugechange');
							this._soundStock(soundHandle);
							
							generator.hpRecovery( targetUnit, anime, damage, RecoveryType.SPECIFY, true );
							this._HitDamage.push( {unit:targetUnit, value:damagePoint, x:x, y:y} );
						}
						totalPoint += damagePoint;
					}
					else
					{
						// Get damage value
						//damagePoint = Calculator.calculateDamageValue(targetUnit, damage, damageType, 0);
						damagePoint = OT_getCalculateDamageValue(item, targetUnit, damage, damageType, 0);
						
						if( unit === targetUnit )
						{
							useDamage = damagePoint;
						}
						else
						{
							var anime = OT_getCustomItemHitAnimeData(item);
							
							if(anime == null)
							{
								// sound effect playback
								var soundHandle = root.querySoundHandle('damage');
								this._soundStock(soundHandle);
								
								anime = root.queryAnime('easydamage');
							}
							pos = LayoutControl.getMapAnimationPos(x, y, anime);
		
							// anime play
							var dynamicAnime = createObject(DynamicAnime);
							dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
							this._dynamicAnime.push(dynamicAnime);
	
							this._HitDamage.push( {unit:targetUnit, value:damagePoint, x:x, y:y} );
						}
						
						totalPoint += damagePoint;
					}
				}
				
				var data = StructureBuilder.buildAttackExperience();
				data.active = this._itemTargetInfo.unit;
				data.activeHp = 0;
				data.activeDamageTotal = 0;
				data.passive = targetUnit;
				data.passiveHp = targetUnit.getHP() - damagePoint;
				data.passiveDamageTotal = damagePoint;
				
				this._itemUseParent.OT_SetExp += Math.floor( ExperienceCalculator.calculateExperience(data) * ExpMagnification );
				//this._itemUseParent.OT_SetExp += Math.floor( ExperienceValueControl.calculateExperience(this._itemTargetInfo.unit, 0, 0, targetUnit, targetUnit.getHP() - damagePoint, damagePoint) * Magnification );
			}
			
			this._itemUseParent.OT_SetExp += OT_getCustomItemGetEXP(item);

			// If the user is involved, temporarily save the damage amount
			var userPoint = useDamage;

			// Add recoil damage after use
			useDamage += OT_getCustomItemUseDamage(item, unit);
			
			// absorb damage
			useDamage -= OT_getAbsorptionRateValue(item, totalPoint);
			//root.log(userPoint);
			//root.log(useDamage);

			// Recoil system treatment
			if( useDamage > 0 ) {
				// Get position of unit
				x = LayoutControl.getPixelX( unit.getMapX() );
				y = LayoutControl.getPixelY( unit.getMapY() );

				var anime = OT_getCustomItemUseDamageAnimeData(item);

				if(anime == null)
				{
					// sound effect playback
					var soundHandle = root.querySoundHandle('damage');
					this._soundStock(soundHandle);
					
					anime = root.queryAnime('easydamage');
				}
				pos = LayoutControl.getMapAnimationPos(x, y, anime);

				// anime play
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);

				if( OT_getUseDamageDeath(item) == false )
				{
					var hp = unit.getHp() - useDamage;
					if (hp <= 0) {
						useDamage = unit.getHp() - 1;
						useDamage += userPoint; // Receive the amount of damage caused by yourself
					}
				}

				this._HitDamage.push( {unit:unit, value:useDamage, x:x, y:y} );
			} else if( useDamage < 0 ) {
				// Get position of unit
				x = LayoutControl.getPixelX( unit.getMapX() );
				y = LayoutControl.getPixelY( unit.getMapY() );
				//pos = LayoutControl.getMapAnimationPos(x, y);

				// ユニットの回復
				var anime = root.queryAnime('easyrecovery');
				generator.hpRecovery( unit, anime, (useDamage * -1), RecoveryType.SPECIFY, true );

				// sound effect playback
				var soundHandle = root.querySoundHandle('gaugechange');
				this._soundStock(soundHandle);
				
				this._HitDamage.push( {unit:unit, value:useDamage, x:x, y:y} );
			}

			if( this._HitDamage.length == 0 && avoidLength == 0 )
			{
				this.changeCycleMode(OT_ItemEffectRangeUseMode.STATEENTRY);
			}
			else
			{
				this.changeCycleMode(OT_ItemEffectRangeUseMode.DAMAGE);
			}
			
			for ( i=0; i < soundArray.length; i++ ) {
				//root.log(soundArray[i].getResourceId());
				//MediaControl.soundPlay(soundArray[i]);
			}
				
			this._soundPlay();
			this._dynamicEvent.executeDynamicEvent();
		}
		
		return MoveResult.CONTINUE;
	},

	// damage handling
	moveDamage: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var length = this._dynamicAnime.length;
		var hitLength = this._HitDamage.length;
		var avoidLength = this._AvoidUnit.length;
		var isEnd = true;
		var noDamage = OT_getNoDamegeAttack(item);

		for ( var i = 0; i < length; i++ ) {
			if (this._dynamicAnime[i].moveDynamicAnime() == MoveResult.CONTINUE) {
				isEnd = false;
			}
			else
			{
				this._dynamicAnime[i].endEffect();
			}
		}

		if(isEnd)
		{
			// wait 50 frames
			if( this._FrameCount > 50 )
			{
				this.changeCycleMode(OT_ItemEffectRangeUseMode.STATEENTRY);
				for ( var i = 0; i < hitLength; i++ ) {
					var hit = this._HitDamage[i];

					// Deal damage. Here the target's HP changes
					this._setDamage( hit['unit'], hit['value'] );
					
					// If the subject dies
					if( this._isLosted( hit['unit'] ) ) {
						// Disable default drawing in order to explicitly draw units in the unit erase process
						hit['unit'].setInvisible(true);
						this._deadUnit.push( hit['unit'] );
						this.changeCycleMode(OT_ItemEffectRangeUseMode.ERASE);
					}
				}
				this._FrameCount = 0;
			}
			else
			{
				this._FrameCount++;
			}
		}
		
		return MoveResult.CONTINUE;
	},

	// Disappearance of dead characters
	moveErase: function() {
		if (this._eraseCounter.moveEraseCounter() !== MoveResult.CONTINUE) {
			this.changeCycleMode(OT_ItemEffectRangeUseMode.FLOWENTRY);
		}

		return MoveResult.CONTINUE;
	},

	// Item drop of dead character and start processing of event
	moveFlowEntry: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var targetUnit = this._deadUnit.shift();

		// After all dead characters have been processed, apply status ailments.
		if( targetUnit == null ) 
		{
			this.changeCycleMode(OT_ItemEffectRangeUseMode.STATEENTRY);
			return MoveResult.CONTINUE;
		}
		
		this._damageHitFlow = createObject(DamageHitFlow);
		if (this._damageHitFlow.enterDamageHitFlowCycle(unit, targetUnit) === EnterResult.NOTENTER)
		{
			return MoveResult.CONTINUE;
		}
		this.changeCycleMode(OT_ItemEffectRangeUseMode.FLOW);

		return MoveResult.CONTINUE;
	},

	moveStateEntry: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var hitLength = this._HitUnit.length;
		this._dynamicAnime = Array();
		var addState, delState, list, isGood, isBad, result1, result2;
		var x, y, pos;
		list = root.getBaseData().getEffectAnimationList(true);

		if( unit.getHP() > 0 )
		{
			x = LayoutControl.getPixelX( unit.getMapX() );
			y = LayoutControl.getPixelY( unit.getMapY() );
	
			// State added when used
			addState = OT_getCustomItemUseAddState(item);
	
			// State released when used
			delState = OT_getCustomItemUseDelState(item);
	
			// Add State
			for( var j=0 ; j<addState.length ; j++)
			{
				if( Probability.getProbability( addState[j][1] ) && StateControl.getTurnState( unit, addState[j][0] ) === null )
				{
					// Check resistance state
					if (StateControl.isStateBlocked(unit, unit, addState[j][0])) {
						// The state is an invalid target, so it does not activate
						continue;
					}
						
					StateControl.arrangeState(unit, addState[j][0], IncreaseType.INCREASE);
					
					// anime play
					var anime = addState[j][0].getEasyAnime();
					pos = LayoutControl.getMapAnimationPos(x, y, anime);
					var dynamicAnime = createObject(DynamicAnime);
					dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
					this._dynamicAnime.push(dynamicAnime);
				}
			}

			// release state
			result = OT_setCustomItemDelState(unit, delState);
	
			if( result & 0x01 )
			{
				// anime play
				var anime = OT_getCustomItemUseDeleteBadAnimeData(item);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			} 
			
			if( result & 0x02 )
			{
				var anime = OT_getCustomItemUseDeleteGoodAnimeData(item);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			}
		}
			
		// Embed status abnormality processing in the hit character
		for ( var i = 0; i < hitLength; i++ ) {
			var targetUnit = this._HitUnit[i]
			
			if( targetUnit.getHP() <= 0 ) continue;
			
			x = LayoutControl.getPixelX( targetUnit.getMapX() );
			y = LayoutControl.getPixelY( targetUnit.getMapY() );

			// state to be released
			delState = OT_getCustomItemDelState(item);

			// State to be added
			addState = OT_getCustomItemAddState(item);

			// Add State
			for( var j=0 ; j<addState.length ; j++)
			{
				if( Probability.getProbability( addState[j][1] ) && StateControl.getTurnState( targetUnit, addState[j][0] ) === null )
				{
					// Check resistance state
					if (StateControl.isStateBlocked(targetUnit, unit, addState[j][0])) {
						// The state is an invalid target, so it does not activate
						continue;
					}
						
					StateControl.arrangeState(targetUnit, addState[j][0], IncreaseType.INCREASE);
					
					// anime play
					var anime = addState[j][0].getEasyAnime();
					pos = LayoutControl.getMapAnimationPos(x, y, anime);
					var dynamicAnime = createObject(DynamicAnime);
					dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
					this._dynamicAnime.push(dynamicAnime);
				}
			}

			// release state
			result = OT_setCustomItemDelState(targetUnit, delState);
	
			if( result & 0x01 )
			{
				// anime play
				var anime = OT_getCustomItemDeleteBadAnimeData(item);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			} 
			
			if( result & 0x02 )
			{
				var anime = OT_getCustomItemDeleteGoodAnimeData(item);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			}
		}
		
		// Sound duplication invalidation processing
		if(this._soundDuplicate == false) {
			OT_EffectRangeUseSoundModeEnable();
		}
		
		this.changeCycleMode(OT_ItemEffectRangeUseMode.STATE);
		return MoveResult.CONTINUE;
	},

	// animation with state
	moveState: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var length = this._dynamicAnime.length;
		var isEnd = true;

		for ( var i = 0; i < length; i++ ) {
			if (this._dynamicAnime[i].moveDynamicAnime() == MoveResult.CONTINUE) {
				isEnd = false;
			}
			else
			{
				this._dynamicAnime[i].endEffect();
			}
		}

		if(isEnd)
		{
			OT_EffectRangeUseSoundModeDisable();
			return MoveResult.END;
		}

		return MoveResult.CONTINUE;
	},
		
	moveFlow: function() {
		if( this._damageHitFlow.moveDamageHitFlowCycle() === MoveResult.END )
		{
			this.changeCycleMode(OT_ItemEffectRangeUseMode.FLOWENTRY);
		}

		return MoveResult.CONTINUE;
	},

	_drawAnime: function() {
		this._dynamicUseAnime.drawDynamicAnime();
	},

	drawDamage: function() {
		var item = this._itemTargetInfo.item;
		var isRecovery = OT_getCustomItemRecovery(item);
		var length = this._dynamicAnime.length;
		var hitLength = this._HitDamage.length;
		var avoidLength = this._AvoidUnit.length;

		for ( var i = 0; i < length; i++ ) {
			this._dynamicAnime[i].drawDynamicAnime();
		}

		// Depicting damage values
		for ( var i = 0; i < hitLength; i++ ) {
			var hit = this._HitDamage[i];
			
			if( hit['value'] < 0 )
			{
				TextRenderer.drawText(hit['x']+1, hit['y']+1, -hit['value'], -1, 0x101010, TextRenderer.getDefaultFont() );
				TextRenderer.drawText(hit['x'], hit['y'], -hit['value'], -1, 0x50ff50, TextRenderer.getDefaultFont() );
			}
			else
			{
				TextRenderer.drawText(hit['x']+1, hit['y']+1, hit['value'], -1, 0x101010, TextRenderer.getDefaultFont() );
				TextRenderer.drawText(hit['x'], hit['y'], hit['value'], -1, ColorValue.DEFAULT, TextRenderer.getDefaultFont() );
			}
		}

		// description of error
		for ( var i = 0; i < avoidLength; i++ ) {
			if(this._AvoidUnit[i][1]) continue;
			
			var targetUnit = this._AvoidUnit[i][0];
			var x = LayoutControl.getPixelX( targetUnit.getMapX() );
			var y = LayoutControl.getPixelY( targetUnit.getMapY() );
			
			TextRenderer.drawText(x+1, y+1, 'MISS', -1, 0x101010, TextRenderer.getDefaultFont() );
			TextRenderer.drawText(x, y, 'MISS', -1, 0x5050ff, TextRenderer.getDefaultFont() );
		}
	},

	drawErase: function() {
		var length = this._deadUnit.length;

		// Depiction of extinction
		for ( var i = 0; i < length; i++ ) {
			var unit = this._deadUnit[i];
			var x = LayoutControl.getPixelX(unit.getMapX());
			var y = LayoutControl.getPixelY(unit.getMapY());
			var alpha = this._eraseCounter.getEraseAlpha();
			var unitRenderParam = StructureBuilder.buildUnitRenderParam();
			var colorIndex = unit.getUnitType();
			var animationIndex = MapLayer.getAnimationIndexFromUnit(unit);
			
			if (unit.isWait()) {
				colorIndex = 3;
			}
			
			if (unit.isActionStop()) {
				animationIndex = 1;
			}
			
			unitRenderParam.colorIndex = colorIndex;
			unitRenderParam.animationIndex = animationIndex;
			unitRenderParam.alpha = alpha;
			UnitRenderer.drawScrollUnit(unit, x, y, unitRenderParam);
		}
	},
	
	drawFlow: function() {
		if( this._damageHitFlow != null)
			this._damageHitFlow.drawDamageHitFlowCycle();
	},
	
	drawState: function() {
		var length = this._dynamicAnime.length;

		for ( var i = 0; i < length; i++ ) {
			this._dynamicAnime[i].drawDynamicAnime();
		}
	},

	// for test
	drawTest: function() {
		NumberRenderer.drawNumber(200, 200, 1000);
		TextRenderer.drawText(200, 250, 'MISS', -1, ColorValue.DEFAULT, TextRenderer.getDefaultFont() );
		
	},

	getUnitTypeAllowed: function(unit, targetUnit, isRecovery) {

		if( isRecovery )
		{
			if( FilterControl.isReverseUnitTypeAllowed(unit, targetUnit) === true )
			{
				return true;
			}
		}
		else
		{
			if( FilterControl.isReverseUnitTypeAllowed(unit, targetUnit) === false )
			{
				return true;
			}
		}

		return false;
	},
	
	// Play animation on tool side
	getItemAnimePos: function(itemUseParent, animeData) {
		var targetPos = itemUseParent.getItemTargetInfo().targetPos;
		var unit = itemUseParent.getItemTargetInfo().targetUnit;
		
		// When using items with Ai, the position may not be initialized
		if (targetPos === null) {
			targetPos = createPos(unit.getMapX(), unit.getMapY());
		}
		
		var x = LayoutControl.getPixelX(targetPos.x);
		var y = LayoutControl.getPixelY(targetPos.y);
		
		return LayoutControl.getMapAnimationPos(x, y, animeData);
	}	
}
);

var EffectRangeInfoType = 0;

var OT_ItemEffectRangeInfo = defineObject(BaseItemInfo,
{
	_nowDrawInfo:null,
	_drawInfoArray:[],
	
	_isAddGoodState:false,
	_isDelGoodState:false,
	_isAddBadState:false,
	_isDelBadState:false,
	_isUseAddGoodState:false,
	_isUseDelGoodState:false,
	_isUseAddBadState:false,
	_isUseDelBadState:false,
	_infoType:0,
	_scrollCount:0,
	_panelSize:16,
	_indexRangeArray:[],
	_indexScopeArray:[],
	_indexWidthSize:1000,
	
	_startRange:0,
	_endRange:0,
	_startEffectRange:0,
	_endEffectRange:0,
	_rangeType:0,
	_effectRangeType:0,
	_addState   :[],
	_delState   :[],
	_useAddState:[],
	_useDelState:[],
	_delAllState   :[],
	_useDelAllState:[],
	_useDamageSign:0,

	_isRecovery           :false,
	_isIndifference       :false,
	_isHitMark            :false,
	_isHitReflectionUnit  :false,
	_isHitReflectionWeapon:false,
	_isHitAvoid           :false,
	_powerMagnification   :1.0,
	_absorptionRate       :0.0,

	setInfoItem: function(item) {
		this._item = item;
		this._startRange       = OT_getCustomItemRangeMin(item);
		this._endRange         = OT_getCustomItemRangeMax(item);
		this._startEffectRange = OT_getCustomItemEffectRangeMin(item);
		this._endEffectRange   = OT_getCustomItemEffectRangeMax(item);

		this._rangeType = OT_getCustomItemRangeType(item);
		this._effectRangeType = OT_getCustomItemEffectRangeType(item);
		this._indexRangeArray = this._GetNormalizeRangeIndexData();
		this._indexScopeArray = this._GetNormalizeScopeIndexData();

		this._addState    = OT_getCustomItemAddState(item);
		this._delState    = OT_getCustomItemDelState(item);
		this._useAddState = OT_getCustomItemUseAddState(item);
		this._useDelState = OT_getCustomItemUseDelState(item);
		
		this._delAllState    = OT_getCustomItemDelAllState(item);
		this._useDelAllState = OT_getCustomItemUseDelAllState(item);
		
		this._infoType = EffectRangeInfoType;
		
		this._drawInfoArray = [];
		this._drawInfoArray.push(this._drawInfoTypeNormal);
		this._drawInfoArray.push(this._drawInfoTypeRange);

		switch(this._effectRangeType) {
			case OT_EffectRangeType.LINE:
			case OT_EffectRangeType.HORIZONTALLINE:
				this._drawInfoArray.push(this._drawInfoTypeEffectRange);
				switch( this._rangeType ) {
					// Those that can shoot diagonally in a straight line or a single character
					case OT_EffectRangeType.NORMAL:
					case OT_EffectRangeType.XCROSS:
					case OT_EffectRangeType.DOUBLECROSS:
						this._indexScopeSlantingArray = this._GetNormalizeScopeSlantingIndexData();
						this._drawInfoArray.push(this._drawInfoTypeEffectRangeSlanting);
						
						break;
				}
				
				break;
				
			default:
				this._drawInfoArray.push(this._drawInfoTypeEffectRange);
				break;
		}

		if(this._addState.length > 0 || this._delState.length > 0) {
			this._drawInfoArray.push(this._drawInfoTypeAddDelState);
		}
		
		if(this._useAddState.length > 0 || this._useDelState.length > 0) {
			this._drawInfoArray.push(this._drawInfoTypeUseAddDelState);
		}
		
		
		this._isRecovery            = OT_getCustomItemRecovery(item);
		this._isIndifference        = OT_getCustomItemIndifference(item);
		this._useDamageSign         = OT_getCustomItemisUseDamageSign(item);
		this._isHitMark             = OT_getCustomItemHitMark(item);
		this._isHitReflectionUnit   = OT_getCustomItemHITReflectionUnit(item);
		this._isHitReflectionWeapon = OT_getCustomItemHITReflectionWeapon(item);
		this._isHitAvoid            = OT_getCustomItemHitAvoid(item);
		this._powerMagnification    = OT_getCustomItemDamageMagnification(item);
		this._absorptionRate        = OT_getAbsorptionRate(item);
		
		this.setInfoType();
	},

	setInfoType: function() {
		if(this._drawInfoArray.length <= this._infoType) {
			this._infoType = this._drawInfoArray.length - 1;
		}
		EffectRangeInfoType = this._infoType;
	},

	changeInfoType: function() {
		this._infoType += 1;
		if(this._drawInfoArray.length <= this._infoType) {
			this._infoType = 0;
		}
		EffectRangeInfoType = this._infoType;
	},

	// Input processing here because Move item info cycle does not respond
	drawItemInfoCycle: function(x, y) {
		var functionTmp;
		if(InputControl.isInputAction(InputType.BTN4)) {
			MediaControl.soundDirect('menutargetchange');
			this.changeInfoType();
		}

		var i = this._infoType;
		this._drawInfoArray[i].call(this, x, y);

		// Display switching part with left shift
		var textui = root.queryTextUI('single_window');
		var pic  = textui.getUIImage();
		var width = 200;
		var height = 24;
		//var px = LayoutControl.getCenterX(-1, width);
		//var py = LayoutControl.getCenterY(-1, height);

		y -= 30;
		WindowRenderer.drawStretchWindow(x-15, y, width, height, pic);
		ItemInfoRenderer.drawKeyword(x, y, 'Page [' + (this._infoType + 1) + '/' + this._drawInfoArray.length + ']');
	},
	
	// background window size
	getInfoPartsCount: function() {
		var count = 7;
		return count;
	},
	
	_drawTitle: function(x, y) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		var item = this._item;
		var text = '';
		
		if( this._isRecovery )
		{
			text += 'Special Recovery';
		}
		else
		{
			text += 'Special Attack';
		}

		if( this._isIndifference )
		{
			text += ' (Indiscriminate)';
		}
		//text += '[Left Shift to toggle display]';

		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();
		x += 40;
	},

	_drawValue: function(x, y) {
		var item = this._item;
		var damage = OT_getCustomItemDamage(item);
		
		ItemInfoRenderer.drawKeyword(x, y, StringTable.Damage_Pow);
		x += ItemInfoRenderer.getSpaceX();

		NumberRenderer.drawRightNumber(x, y, damage);
		x += 40;

		this._drawInfo(x, y);
	},

	_drawInfo: function(x, y) {
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		if (damageType === DamageType.FIXED) {
			text = StringTable.DamageType_Fixed;
		}
		else if (damageType === DamageType.PHYSICS) {
			text = StringTable.DamageType_Physics;
		}
		else {
			text = StringTable.DamageType_Magic;
		}
			
		ItemInfoRenderer.drawKeyword(x, y, StringTable.DamageType_Name);
		x += ItemInfoRenderer.getSpaceX();
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
		x += 40;
	},

	drawRange: function(x, y, rangeValue, rangeType) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var minRange = OT_getCustomItemRangeMin(this._item);
		var text = '';
		
		ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('range_capacity'));
		x += ItemInfoRenderer.getSpaceX();
		
		if (rangeType === SelectionRangeType.SELFONLY) {
			TextRenderer.drawKeywordText(x-30, y, StringTable.Range_Self, -1, color, font);
		}
		else if (rangeType === SelectionRangeType.MULTI) {
			text =  minRange + ' - ' + rangeValue + '(' + OT_getCustomItemRangeSpread(this._item) + ')';
			TextRenderer.drawKeywordText(x-30, y, text, -1, color, font);
		}
		else if (rangeType === SelectionRangeType.ALL) {
			text =  minRange + ' - ' + '(' + OT_getCustomItemRangeSpread(this._item) + ')';
			TextRenderer.drawKeywordText(x-30, y, text, -1, color, font);
		}
		x += 40;

		var type = OT_getCustomItemRangeType(this._item);
		ItemInfoRenderer.drawKeyword(x, y, 'range type');
		x += ItemInfoRenderer.getSpaceX();

		switch( type )
		{
			case OT_EffectRangeType.CROSS:
				text = 'cross';
				break;
			
			case OT_EffectRangeType.XCROSS:
				text = 'Type X';

			case OT_EffectRangeType.DOUBLECROSS:
				text = 'Double Cross';
				break;
			
			default:
				text = 'usually';
				break;
		}

		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},

	drawEffectRange: function(x, y) {
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		ItemInfoRenderer.drawKeyword(x, y, 'Area of Effect');
		x += ItemInfoRenderer.getSpaceX();

		var min = OT_getCustomItemEffectRangeMin(this._item);
		var max = OT_getCustomItemEffectRangeMax(this._item);
		text = min + ' - ' + max + '(' + OT_getCustomItemEffectSpread(this._item) + ')';
		TextRenderer.drawKeywordText(x-30, y, text, -1, color, font);
		x += 40;

		var type = OT_getCustomItemEffectRangeType(this._item);
		ItemInfoRenderer.drawKeyword(x, y, 'Range type');
		x += ItemInfoRenderer.getSpaceX();

		switch( type )
		{
			case OT_EffectRangeType.CROSS:
				text = 'cross';
				break;
			
			case OT_EffectRangeType.XCROSS:
				text = 'Type X';

			case OT_EffectRangeType.DOUBLECROSS:
				text = 'Double Cross';
				break;
			
			case OT_EffectRangeType.LINE:
				text = 'laser';
				break;

			case OT_EffectRangeType.HORIZONTALLINE:
				text = 'side';
				break;

			case OT_EffectRangeType.BREATH:
				text = 'Bless';
				break;

			default:
				text = 'usually';
				break;
		}

		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},

	_drawHit: function(x, y) {
		var px = x, py = y;
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = root.queryCommand('hit_capacity');;

		// If there is a mandatory setting
		if(this._isHitMark) {
			ItemInfoRenderer.drawKeyword(x, y, text);
			x += ItemInfoRenderer.getSpaceX();
			TextRenderer.drawKeywordText(x, y, 'Will be in', -1, color, font);
			return;
		}

		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX() - 25;

		var text = OT_getCustomItemHitValue(this._item);
		
		if( this._isHitReflectionUnit )
		{
			text += ' + ' + root.queryCommand('ski_param')+' x3';
		}

		if( this._isHitReflectionWeapon )
		{
			text += ' + Wpn Hit';
		}
		
		if( !this._isHitAvoid  ) {
			text += ' (Ignores Avo)';
		}
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},

	_drawHitBefore: function(x, y) {
		var px = x, py = y;
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = root.queryCommand('hit_capacity');;

		ItemInfoRenderer.drawKeyword(x, y, text);
	},

	_drawHitAfter: function(x, y) {
		var px = x, py = y;
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '';

		var text = OT_getCustomItemHitValue(this._item);
		
		if( this._isHitReflectionUnit )
		{
			//text += '+Technique x 3';
			text +=' + ' + root.queryCommand('ski_param')+' x3'
		}

		if( this._isHitReflectionWeapon )
		{
			text += ' + Wpn Hit';
		}
		
		if( !this._isHitAvoid  ) {
			text += ' (Ignores Avo)';
		}
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},
	
	_drawReflection: function(x, y) {
		var item = this._item;
		var damage = OT_getCustomItemDamage(item);
		var damageType = OT_getCustomItemType(item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var reflection = OT_getCustomItemUnitReflection(item);
		var weaponReflection = OT_getCustomItemWeaponReflection(item);
		var StatueReflection = item.custom.OT_StatueReflection;
		var text = '';

		ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('attack_capacity'));
		x += ItemInfoRenderer.getSpaceX() - 25;

		if( reflection == true )
		{
			if(damage != 0) {
				text = damage;
			}
			
			if(StatueReflection == null)
			{
				if(text !== '') text += ' + ';

				//root.log('OT_StatueReflection not set');
				if (damageType === DamageType.PHYSICS) {
					text += OT_getParamName('POW');
					//text += root.queryCommand('attack_capacity')
					if(OT_getCustomItemCheckSupportAtk(item)) {
						text += ' + Supp Bonus';
					}
				} else if (damageType === DamageType.MAGIC) {
					text += OT_getParamName('MAG');
					//text += root.queryCommand('attack_capacity')
					if(OT_getCustomItemCheckSupportAtk(item)) {
						text += ' + Supp Bonus';
					}
				} else {
					text = damage;
				}
			}
			else
			{
				//root.log('OT_StatueReflection Configured');
				for( var key in StatueReflection )
				{
					if( typeof StatueReflection[key] === 'number' )
					{
						if(text !== '') text += ' + ';
						text += OT_getParamName(key);
						if(StatueReflection[key] != 1.00)
						{
							text += '*' + StatueReflection[key];
						}
					}
				}
			}
		} else {
			text = damage;
		}
		
		if( weaponReflection == true ) {
			if(text !== '') text += '+';
			text += 'Wpn';
		}

		if(this._powerMagnification != 1.00) {
			text = '(' + text + ')*' + this._powerMagnification;
		}
	
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},
	
	_drawState: function(x, y) {
		var px = x, py = y;
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = 'Status Effect';

		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();
		text = '';

		if( this._isAddGoodState || this._isDelGoodState )
		{
			text += 'GOOD';
			if( this._isAddGoodState )
			{
				text += 'addition ';
			}
	
			if( this._isDelGoodState )
			{
				text += 'wipe out ';
			}
		}

		if( this._isAddBadState || this._isDelBadState )
		{
			text += 'abnormal';
			
			if( this._isAddBadState )
			{
				text += 'addition ';
			}
			if( this._isDelBadState )
			{
				text += 'Cure ';
			}
		}
		
		TextRenderer.drawKeywordText(x, y, text, 200, color, font);
	},

	_drawRecoil: function(x, y) {
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		var text = '';
		if(this._useDamageSign > 0) {
			text = 'HP Cost';
		} else if(this._useDamageSign < 0) {
			text = 'HP Regen';
		}
		;
		ItemInfoRenderer.drawKeyword(x, y, text);

		x += (ItemInfoRenderer.getSpaceX());
		text = OT_getCustomItemUseDamageText(this._item);
		TextRenderer.drawKeywordText(x, y, text, 230, color, font);
	},

	_drawAbsorption: function(x, y) {
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		var text = '';
		var percentText = Math.floor(this._absorptionRate * 100);
		
		if(this._isRecovery) {
			if( percentText > 0 ) {
				text = percentText + '% HP Sacrifice';
			} else {
				text = percentText + '% Self Heal';
			}
		} else {
			if( percentText > 0 ) {
				text =  percentText + '% HP Absortion';
			} else {
				text =  percentText + '% Self Damage';
			}
		}
		
		ItemInfoRenderer.drawKeyword(x, y, text);
	},
	
	_drawInfoTypeNormal: function(x, y) {
		var px=x, py=y;
		
		this._drawTitle(x, y);
		y += ItemInfoRenderer.getSpaceY();
		
		this._drawInfo(x, y);
		y += ItemInfoRenderer.getSpaceY();
		
		//this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
		//y += ItemInfoRenderer.getSpaceY();

		//this.drawEffectRange(x, y);
		//y += ItemInfoRenderer.getSpaceY();

		this._drawReflection(x, y);
		y += ItemInfoRenderer.getSpaceY();

		if(    !this._isHitMark
			&&  this._isHitReflectionUnit 
			&&  this._isHitReflectionWeapon
			&& !this._isHitAvoid )
		{
			this._drawHitBefore(x, y);
			y += ItemInfoRenderer.getSpaceY();
			this._drawHitAfter(x, y);
			
		} else {
			this._drawHit(x, y);
		}
		y += ItemInfoRenderer.getSpaceY();

		if( this._useDamageSign != 0 ) {
			this._drawRecoil(x, y);
			y += ItemInfoRenderer.getSpaceY();
		}
		
		if( this._absorptionRate != 0.0) {
			this._drawAbsorption(x, y);
			y += ItemInfoRenderer.getSpaceY();
		}
	},
	
	_drawInfoTypeRange: function(x, y) {
		var i, j, picx, picy, index, value, point;
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('range_capacity'));

		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picIcon = list.getCollectionDataFromId(0, 0);
		var picArea = root.queryUI('move_panel');

		if( this._rangeType == OT_EffectRangeType.ALL) {
			this._drawAllPanelInfo(x, y, picArea, picIcon, 3, 9);
			y += 20;
			TextRenderer.drawKeywordText(x, y, '(ALL)', -1, color, font);
		} else {
			this._drawPanelInfo(x, y, this._indexRangeArray, picArea, picIcon, 3, 9);
			y += 20;
			
			var rangeType = this._item.getRangeType();
			var tmpEnd    = this._endRange;
			if (rangeType === SelectionRangeType.ALL) {
				tmpEnd = '\u221E';
			}
			
			var text = '(' + this._startRange + ' - ' + tmpEnd + ')';
			TextRenderer.drawKeywordText(x, y, text, -1, color, font);
		}
	},

	_drawInfoTypeEffectRange: function(x, y) {
		var i, picx, picy, point, index, value;
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picIcon = list.getCollectionDataFromId(0, 0);
		var picArea = root.queryUI('range_panel');
		
		ItemInfoRenderer.drawKeyword(x, y, 'Area of Effect');
		
		if( this._effectRangeType == OT_EffectRangeType.ALL ) {
			if(this._isRecovery) {
				this._drawAllPanelInfo(x, y, picArea, picIcon, 4, 9);
			} else {
				this._drawAllPanelInfo(x, y, picArea, picIcon, 5, 5);
			}
			y += 20;
			TextRenderer.drawKeywordText(x, y, '(ALL)', -1, color, font);
		} else {
			if(this._isRecovery) {
				this._drawPanelInfo(x, y, this._indexScopeArray, picArea, picIcon, 4, 9);
			} else {
				this._drawPanelInfo(x, y, this._indexScopeArray, picArea, picIcon, 5, 5);
			}
			y += 20;

			var text = '(' + this._startEffectRange + ' - ' + this._endEffectRange + ')';
			TextRenderer.drawKeywordText(x, y, text, -1, color, font);
			y += 20;
			
			switch(this._effectRangeType) {
				case OT_EffectRangeType.LINE:
				case OT_EffectRangeType.HORIZONTALLINE:
					text = '(Straight Line)';
					TextRenderer.drawKeywordText(x, y, text, -1, color, font);
					break;
			}
		}
	},

	_drawInfoTypeEffectRangeSlanting: function(x, y) {
		var i, picx, picy, point, index, value;
		var picArea = root.queryUI('range_panel');
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picIcon = list.getCollectionDataFromId(0, 0);
		var text = '';

		ItemInfoRenderer.drawKeyword(x, y, 'Area of Effect');
		
		if( this._effectRangeType == OT_EffectRangeType.ALL ) {
			this._drawAllPanelInfo(x, y, picArea, picIcon, 5, 5);
			y += 20;
			ItemInfoRenderer.drawKeywordText(x, y, '(ALL)', -1, color, font);
		} else {
			this._drawPanelInfo(x, y, this._indexScopeSlantingArray, picArea, picIcon, 5, 5);
			y += 20;
			text = '(' + this._startEffectRange + ' - ' + this._endEffectRange + ')';
			TextRenderer.drawKeywordText(x, y, text, -1, color, font);
			y += 20;
			text = '(Diagonal Line)';
			TextRenderer.drawKeywordText(x, y, text, -1, color, font);
		}
	},
	
	_SetPanelSize: function(point) {
		if(point < 3) {
			this._panelSize = 24;
		} else if(point < 6) {
			this._panelSize = 14;
		} else if(point < 10) {
			this._panelSize = 8;
		} else if(point < 15) {
			this._panelSize = 6;
		} else {
			this._panelSize = 4;
		}
	},

	_drawInfoTypeAddDelState: function(x, y) {
		var text = '';
		var state = null;

		//if( OT_getCustomItemisGoodState(delState) ) this._isDelGoodState = true;
		//if( OT_getCustomItemisBadState(delState) ) this._isDelBadState = true;
		
		text = 'Status Effect';
		ItemInfoRenderer.drawKeyword(x, y, text);
		y += ItemInfoRenderer.getSpaceY();
		
		y = this._drawAddStateName(x, y, this._addState, 'Buff:', 'Debuff:');
		this._drawDelStateName(x, y, this._delState, this._delAllState, 'Release:', 'Cure:');
	},
	
	_drawInfoTypeUseAddDelState: function(x, y) {
		var text = '';
		var state = null;

		//if( OT_getCustomItemisGoodState(delState) ) this._isDelGoodState = true;
		//if( OT_getCustomItemisBadState(delState) ) this._isDelBadState = true;
		
		text = 'Status Effect (Self)';
		ItemInfoRenderer.drawKeyword(x, y, text);
		y += ItemInfoRenderer.getSpaceY();
		
		y = this._drawAddStateName(x, y, this._useAddState, 'Buff:', 'Debuff:');
		this._drawDelStateName(x, y, this._useDelState, this._useDelAllState, 'Release:', 'Cure:');
	},
	
	_drawAddStateName: function(x, y, stateArrayTmp, buffText, debuffText) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '';
		var state = null;
		var hit   = 0;
		
		if( stateArrayTmp.length ) {
			// Add Good State
			for( var i=0 ; i<stateArrayTmp.length ; i++ ) {
				state = stateArrayTmp[i][0];
				hit   = stateArrayTmp[i][1];
				
				if( !state.isBadState() ) {
					// buff
					text = buffText;
					TextRenderer.drawKeywordText(x, y, text, 200, color, font);
					text = state.getName() + '(' + hit + '%)';
					TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
					y += ItemInfoRenderer.getSpaceY();
				}
			}

			for( var i=0 ; i<stateArrayTmp.length ; i++ ) {
				state = stateArrayTmp[i][0];
				hit   = stateArrayTmp[i][1];
				
				if( state.isBadState() ) {
					// Abnormal status
					text = debuffText;
					TextRenderer.drawKeywordText(x, y, text, 200, color, font);
					text = state.getName() + '(' + hit + '%)';
					TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
					y += ItemInfoRenderer.getSpaceY();
				}
			}
		}
		return y;
	},

	_drawDelStateName: function(x, y, stateArrayTmp, allStateType, buffText, debuffText) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '';
		var state = null;
		var hit   = 0;
		

		//if( k == 'BadState' || k == 'GoodState' || k == 'AllState') {
		
		if( stateArrayTmp.length ) {
			// good state
			if(typeof allStateType['GoodState'] != 'undefined') {
				hit   = allStateType['GoodState'];
				text = buffText;
				TextRenderer.drawKeywordText(x, y, text, 200, color, font);
				text = 'all buffs(' + hit + '%)';
				TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
				y += ItemInfoRenderer.getSpaceY();
			} else {
				for( var i=0 ; i<stateArrayTmp.length ; i++ ) {
					state = stateArrayTmp[i][0];
					hit   = stateArrayTmp[i][1];
					
					if( !state.isBadState() ) {
						// buff
						text = buffText;
						TextRenderer.drawKeywordText(x, y, text, 200, color, font);
						text = state.getName() + '(' + hit + '%)';
						TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
						y += ItemInfoRenderer.getSpaceY();
					}
				}
			}

			// bad state
			if(typeof allStateType['BadState'] != 'undefined') {
				hit   = allStateType['BadState'];
				text = debuffText;
				TextRenderer.drawKeywordText(x, y, text, 200, color, font);
				text = 'All Bad State (' + hit + '%)';
				TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
				y += ItemInfoRenderer.getSpaceY();
				
			} else {
				for( var i=0 ; i<stateArrayTmp.length ; i++ ) {
					state = stateArrayTmp[i][0];
					hit   = stateArrayTmp[i][1];
					
					if( state.isBadState() ) {
						// Abnormal status
						text = debuffText;
						TextRenderer.drawKeywordText(x, y, text, 200, color, font);
						text = state.getName() + '(' + hit + '%)';
						TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
						y += ItemInfoRenderer.getSpaceY();
					}
				}
			}
		}
		return y;
	},
	
	_drawPanelInfo: function(x, y, rangeArray, picArea, picIcon, ix, iy) {
		var i, j, picx, picy, index, value;
		
		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picAreaIcon = list.getCollectionDataFromId(0, 0);
		var point = 0;
		for (i = 0; i < rangeArray.length; i++) {
			index = rangeArray[i];
			picx = this._drawPanelGetX(index) - this._indexWidthSize/2;
			picy = this._drawPanelGetY(index);
			
			point = Math.max(point, Math.abs(picx), Math.abs(picy));
		}
		this._SetPanelSize(point);
		
		x += ItemRenderer.getItemWindowWidth() / 2 - this._panelSize/2;
		y += (this.getInfoPartsCount() * ItemInfoRenderer.getSpaceY()) / 2- this._panelSize/2;
		
		for (i = 0; i < rangeArray.length; i++) {
			index = rangeArray[i];
			value = this._drawPanelGetX(index);
			picx = ((value - this._indexWidthSize/2) * this._panelSize) + x;

			value = this._drawPanelGetY(index);
			picy = (value * this._panelSize) + y;

			this._drawIconData(picx, picy, picAreaIcon, 5, 8);
			this._drawPanelData(picx, picy, picArea);
		}
		
		this._drawIconData(x, y, picIcon, ix, iy);
	},

	_drawAllPanelInfo: function(x, y, picArea, picIcon, ix, iy) {
		var i, j, picx, picy, index, value;
		
		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picAreaIcon = list.getCollectionDataFromId(0, 0);
		this._SetPanelSize(5);
		
		x += ItemRenderer.getItemWindowWidth() / 2 - this._panelSize/2;
		y += (this.getInfoPartsCount() * ItemInfoRenderer.getSpaceY()) / 2- this._panelSize/2;
		
		//for (i = 0; i < rangeArray.length; i++) {
		//	index = rangeArray[i];
		//	value = this._drawPanelGetX(index);
		//	picx = ((value - this._indexWidthSize/2) * this._panelSize) + x;

		//	value = this._drawPanelGetY(index);
		//	picy = (value * this._panelSize) + y;

		//	this._drawIconData(picx, picy, picAreaIcon, 5, 8);
		//	this._drawPanelData(picx, picy, picArea);
		//}
		
		var size = 64;
		var pSize = Math.floor(this._panelSize / 2);
		var picx = x - size + pSize;
		var picy = y - size + pSize;
		this._drawAllIconData(picx, picy, (size*2), picAreaIcon, 5, 8);
		this._drawAllPanelData(picx, picy, (size*2), picArea);
		
		this._drawIconData(x, y, picIcon, ix, iy);
	},
	
	_drawPanelData: function(x, y, pic) {
		var xDest = x;
		var yDest = y;
		var xSrc = 0;
		var ySrc = 0;
		var graphicsSize = GraphicsRenderer.getGraphicsSize(GraphicsType.MAPCHIP, pic);
		var width = graphicsSize.width;
		var height = graphicsSize.height;
		
		if (pic === null) {
			return;
		}
		
		pic.drawStretchParts(xDest, yDest, this._panelSize, this._panelSize, xSrc, ySrc, width, height);
	},

	_drawIconData: function(x, y, pic, cx, cy) {
		var xDest = x;
		var yDest = y;
		var xSrc = cx * GraphicsFormat.ICON_WIDTH;
		var ySrc = cy * GraphicsFormat.ICON_HEIGHT;
		var graphicsSize = GraphicsRenderer.getGraphicsSize(GraphicsType.ICON, pic);
		var width = graphicsSize.width;
		var height = graphicsSize.height;
		
		if (pic === null) {
			return;
		}
		
		pic.drawStretchParts(xDest, yDest, this._panelSize, this._panelSize, xSrc, ySrc, width, height);
	},

	_drawAllPanelData: function(x, y, size, pic) {
		var xDest = x;
		var yDest = y;
		var xSrc = 0;
		var ySrc = 0;
		var graphicsSize = GraphicsRenderer.getGraphicsSize(GraphicsType.MAPCHIP, pic);
		var width = graphicsSize.width;
		var height = graphicsSize.height;
		
		if (pic === null) {
			return;
		}
		
		pic.drawStretchParts(xDest, yDest, size, size, xSrc, ySrc, width, height);
	},

	_drawAllIconData: function(x, y, size, pic, cx, cy) {
		var xDest = x;
		var yDest = y;
		var xSrc = cx * GraphicsFormat.ICON_WIDTH;
		var ySrc = cy * GraphicsFormat.ICON_HEIGHT;
		var graphicsSize = GraphicsRenderer.getGraphicsSize(GraphicsType.ICON, pic);
		var width = graphicsSize.width;
		var height = graphicsSize.height;
		
		if (pic === null) {
			return;
		}
		
		pic.drawStretchParts(xDest, yDest, size, size, xSrc, ySrc, width, height);
	},

	_GetNormalizeRangeIndexData: function() {
		var arrayTmp = OT_EffectRangeIndexArray.getRangeItemIndexArrayInfo(0, 0, this._item, true);
		return this._GetNormalizeIndexData(arrayTmp);
	},
	
	_GetNormalizeScopeIndexData: function() {
		var arrayTmp = OT_EffectRangeIndexArray.getEffectRangeItemIndexArrayPosInfo(0, 0, this._item, -1, 0, true);
		return this._GetNormalizeIndexData(arrayTmp);
	},

	_GetNormalizeScopeSlantingIndexData: function() {
		var arrayTmp = OT_EffectRangeIndexArray.getEffectRangeItemIndexArrayPosInfo(0, 0, this._item, -1, 1, true);
		return this._GetNormalizeIndexData(arrayTmp);
	},

	_GetNormalizeIndexData: function(arrayTmp) {
		var array = [];
		var arrayT = [];
		var index = 0;
		var tmpX, tmpY;
		//root.log('start:');
		for( var i=0 ; i<arrayTmp.length ; i++ ) {
			tmpX = arrayTmp[i][0];
			tmpY = arrayTmp[i][1];
			index = (Math.abs(tmpY) * this._indexWidthSize) + tmpX;
			if(tmpY < 0) {
				index *= -1;
			}
			index += this._indexWidthSize/2;
			array.push(index);
		}
		
		return unique(array);
	},
	
	_drawPanelGetX: function(index) {
		var value = Math.floor(Math.abs(index) % this._indexWidthSize);
		return value;
	},

	_drawPanelGetY: function(index) {
		var value = Math.floor(index / this._indexWidthSize);
		
		return value;
	}
}
);

var OT_ItemEffectRangeAvailability = defineObject(BaseItemAvailability,
{
	isUnitTypeAllowed: function(unit, targetUnit) {
		return FilterControl.isReverseUnitTypeAllowed(unit, targetUnit);
	},

	// "Use" can be selected at any time in the menu
	isItemAvailableCondition: function(unit, item) {
		return true;
	}
}
);

// Enemy AI for range attack
ActionTargetType.OT_EFFECT_RANGE = 100;
var OT_ItemEffectRangeAI = defineObject(BaseItemAI,
{
	getItemScore: function(unit, combination) {
		if( combination.OT_EffectFlag != true )
		{
			return 15;
		}
		
		var item = combination.item;
		var score = combination.addScore * OT_getAIScoreRate(item);
		return score;
	},

	_getTotalScore: function(unit, combination) {
		var n;
		var score = 0;
		var item = combination.item;
		var targetUnit = null;
		
		for(var i=0 ; i<combination.hitUnit.length ; i++) {
			targetUnit = combination.hitUnit[i];
			//root.msg('test1:' + targetUnit.getId());
			n = this._getDamageScore(unit, targetUnit, item);
			if (n === 0 && !DataConfig.isAIDamageZeroAllowed()) {
				continue;
			}
			score += n;
			
			//root.msg('test2');
			n = this._getHitScore(unit, targetUnit, item);
			if (n === 0 && !DataConfig.isAIHitZeroAllowed()) {
				continue;
			}
			score += n;
			
			//score += this._getCriticalScore(unit, combination);
			//root.msg('test3');
			score += this._getStateScore(unit, targetUnit, item);
		}
		
		if( score == 0 ) {
			score = -1;
		}
		
		// If the damage dealt is 7, the hit rate is 80, and the critical probability is 10,
		// 42 (7 *6) 6 is Miscellaneous.convertAIValue
		// 16 (80/5)
		// 2 (10/5)
		// Get a total score of 60
		
		return score;
	},
		
	getUnitFilter: function(unit, item) {
		var unitType = unit.getUnitType();
		
		if( OT_getCustomItemRecovery(item) ) {
			return FilterControl.getNormalFilter(unitType);
		}
		
		return FilterControl.getReverseFilter(unitType);
	},

	_getDamageScore: function(unit, targetUnit, item) {
		var damage = OT_getCustomItemFinalDamage(unit, item);
		var damageType = OT_getCustomItemType(item);

		if(OT_getCustomItemRecovery(item)) {
			return Calculator.calculateRecoveryValue(targetUnit, damage, RecoveryType.SPECIFY, 0);
		}
		
		return OT_getCalculateDamageValue(item, targetUnit, damage, damageType, 0);
	},

	_getValue: function(unit, item, targetUnit) {
		var damage = OT_getCustomItemFinalDamage(unit, item);
		var damageType = OT_getCustomItemType(item);

		if(OT_getCustomItemRecovery(item)) {
			return Calculator.calculateRecoveryValue(targetUnit, damage, RecoveryType.SPECIFY, 0);
		}
		
		return OT_getCalculateDamageValue(item, targetUnit, damage, damageType, 0);
	},

	_getHitScore: function(unit, targetUnit, item) {
		var hit = OT_getCustomItemHitPercent(unit, targetUnit, item);
		
		//root.log(hit);
		// Decrease the value to prioritize accuracy.
		return Math.floor(hit / 5);
	},
	
	_getStateScore: function(unit, targetUnit, item) {
		var point;
		var score = 0;

		// state to be released
		var delState = OT_getCustomItemDelState(item);

		// State to be added
		var addState = OT_getCustomItemAddState(item);

		// Add State
		for( var i=0 ; i<addState.length ; i++ )
		{
			var state = addState[i][0];
			// If there is something that causes the adversary to grant a good state
			if( !state.isBadState() )
			{
				//root.log('■1');
				continue;
			}

			point = StateScoreChecker.getScore(unit, targetUnit, state);
			
			if( point > -1 )
			{
				//root.log('■2');
				score += point;
			}
		}

		// release state
		for( var i=0 ; i<delState.length ; i++ )
		{
			var state = delState[i][0];

			// If there is something to cancel the bad state of the enemy
			if( state.isBadState() )
			{
				//root.log('■3');
				continue;
			}
			
			if(StateControl.getTurnState( targetUnit, state ) !== null )
			{
				//root.log('■4');
				score += 20 + targetUnit.getLv();
			}
		}
		
		return score;
	},

	_getStateScoreModeRecovery: function(unit, targetUnit, item) {
		var point;
		var score = 0;

		// state to be released
		var delState = OT_getCustomItemDelState(item);

		// State to be added
		var addState = OT_getCustomItemAddState(item);

		// Add State
		for( var i=0 ; i<addState.length ; i++ )
		{
			var state = addState[i][0];
			
			// If there is something like giving a bad state to an ally
			if( state.isBadState() )
			{
				//root.log('■');
			}

			// Do not use the item if the opponent has already been given that state
			if (StateControl.getTurnState(targetUnit, state) !== null) {
				continue;
			}
			
			point = StateScoreChecker.getScore(unit, targetUnit, state);

			if( point > -1 )
			{
				//root.log('■1');
				score += point;
			}
		}

		// release state
		for( var i=0 ; i<delState.length ; i++ )
		{
			var state = delState[i][0];

			// If there is something that cancels the good state of an ally
			if( !state.isBadState() )
			{
				//root.log('■2');
				continue;
			}
			
			if(StateControl.getTurnState( targetUnit, state ) !== null )
			{
				//root.log('■3');
				score += 20 + targetUnit.getLv();
			}
		}
		
		return score;
	},
		
	_checkFilter: function(unit, filter) {
		var type = unit.getUnitType();
		
		if (filter & UnitFilterFlag.PLAYER) {
			if (type === UnitType.PLAYER) {
				return true;
			}
		}
		
		if (filter & UnitFilterFlag.ENEMY) {
			if (type === UnitType.ENEMY) {
				return true;
			}
		}
		
		if (filter & UnitFilterFlag.ALLY) {
			if (type === UnitType.ALLY) {
				return true;
			}
		}
		
		return false;
	},
		
	getActionTargetType: function(unit, item) {
		return ActionTargetType.OT_EFFECT_RANGE;
	}
}
);

function OT_ItemEffectRange_getCustomKeyword() {
	return 'OT_ItemEffectRange';
};


//----------------------------------------------------------
// Enemy exclusive range judgment
//----------------------------------------------------------
var alias101 = CombinationCollector.Item._setCombination;
CombinationCollector.Item._setCombination = function(misc) {
	alias101.call(this, misc);

	var actionTargetType = misc.actionTargetType;
	
	if (actionTargetType === ActionTargetType.OT_EFFECT_RANGE) {
		CombinationCollector.Item.OT_setEffectRangeCombination(misc);
	}
};

CombinationCollector.Item.OT_setEffectRangeCombination = function(misc) {
	var i, j, k, l, x, y, index, indexArray, list, obj, targetUnit, targetCount, combination;
	var direction;
	var unit = misc.unit;
	var item = misc.item;
	obj = ItemPackageControl.getItemAIObject(item);
	if (obj === null) {
		return;
	}
	
	// Because the most important thing is where and where to shoot
	// Avoid re-searching nearby locations
	if(misc.isForce == true) {
		return;
	}

	// Search for the closest partner when only moving
	if( misc.isEffectRangeMove ) {
		//Search for the nearest enemy only when the enemy moves
		//root.log('Search range is the whole map 2');
		//misc.actionTargetType = ActionTargetType.UNIT;
		this._setUnitCombination(misc);
		return;
	}
	var nearTargetCount, distantTargetCount, outRangeTargetCount;
	var isIndifference = OT_getCustomItemIndifference(item); // Is it non-discriminatory?
	var nearMovePoint, distantMovePoint;

	var startRange = OT_getCustomItemRangeMin(item);
	var endRange = OT_getCustomItemRangeMax(item);
	var startEffectRange = OT_getCustomItemEffectRangeMin(item);
	var endEffectRange = OT_getCustomItemEffectRangeMax(item);
	var rangeType = OT_getCustomItemRangeType(item);
	var effectRangeType = OT_getCustomItemEffectRangeType(item);
	var moveCount = ParamBonus.getMov(unit);  // Mobility

	var avoidScoreArray = [];
	
	var numEndRange = endRange + endEffectRange;
	var count = 0;

	var simulator = root.getCurrentSession().createMapSimulator();
	simulator.startSimulation(unit, moveCount);
	
	// Stores the location where the enemy can move, the required movement power to get there, and the distance in an array
	// In addition, record the maximum amount of movement power consumed and the number of squares that can be moved the most.
	var myX = unit.getMapX();
	var myY = unit.getMapY();

	var unitMapPosArray = []; 
	var unitMapMovePointArray = [];
	var unitPointDistanceArray = [];
	var maxMove = 0;
	var maxDistance = 0;
	var tmpMovePoint = 0;
	var point = 0;
	
	// simulator.getSimulationIndexArray can detect the impossibility of movement with enemy units and obstacles
	// Unable to move due to the presence of a unit on your own side cannot be detected.
	// Use this._createCostArray to search for locations that cannot be moved and store them in an array
	misc.targetUnit = null;
	misc.indexArray = misc.simulator.getSimulationIndexArray();
	misc.costArray = this._createCostArray(misc);

	//root.log('Move possible position confirmation:' + misc.costArray.length);
	for(i=0 ; i<misc.costArray.length ; i++) {
		index = misc.costArray[i].posIndex;
		x = CurrentMap.getX(index);
		y = CurrentMap.getY(index);
		
		unitMapPosArray.push(index);
		
		tmpMovePoint = misc.costArray[i].movePoint;
		unitMapMovePointArray[index] = tmpMovePoint;  // Movement force required to reach a movable location

		point = Math.abs(myX - x) + Math.abs(myY - y);  
		unitPointDistanceArray[index] = point;  // Number of squares to moveable place
		
		maxMove = Math.max(maxMove, tmpMovePoint);   // Maximum usable movement
		maxDistance = Math.max(maxDistance, point);  // Maximum number of moveable squares

		//root.log('index:' + index + ' tmpMovePoint:' + tmpMovePoint + ' tmpPoint:' + point);
	}

	//checkTime('check time0: ');
	
	var predictedRangeArray = [];	// Expected range
	var entryUnitArray = [];		// Unit information that is likely to reach the predicted range
	var unitScoreArray = [];		// ユニットごとのスコア情報
	var unitIndexScoreArray = [];	// ユニットの位置をキーとしてスコアを格納
	var score = 0;
	//var score = this._checkTargetScore(unit, targetUnit);

	// of units that can be targeted
	var filter = OT_EffectRangeGetFilter(unit, item);
	var listArrayOT = this._getTargetListArrayERD(filter, misc);
	var listCountOT = listArrayOT.length;
	
	nearTargetCount = 0;
	distantTargetCount = 0;
	outRangeTargetCount = 0;

	////Check if the majority of enemy units are near or far
	var distantTargetRange = Math.floor((numEndRange) / 2);

	nearMovePoint = 999;    // Movement required for closest opponent
	distantMovePoint = 0; // Distance required for furthest opponent

	//root.log('Checking behavior:' + unit.getName());
	if(effectRangeType != OT_EffectRangeType.ALL) {
		
		// First, calculate a rough prediction range from the user's position
		// It is unclear whether the units in the predicted range are really within range if they are farther away.
		// The closer to the user's center, the higher the probability that they will be within range, whereas
		// Units that do not even get caught in the prediction range are definitely out of range
		// Judgment for that unit will be wasteful (load) as much as it is performed
		// Perform processing to determine only units that may be targeted
		predictedRangeArray = OT_GetPredictedRangeArray(myX, myY, maxDistance, item);
		for (i = 0; i < listCountOT; i++) {
			list = listArrayOT[i];
			targetCount = list.getCount();
			for (j = 0; j < targetCount; j++) {
				targetUnit = list.getData(j);
				x = targetUnit.getMapX();
				y = targetUnit.getMapY();
				index = CurrentMap.getIndex(x, y);
				
				if(predictedRangeArray.indexOf(index) == -1) {
					continue;
				}
				
				//point = Math.abs(myX - x) + Math.abs(myY - y);
				//if(point <= ParamBonus.getMov(unit)) {
				//	// Counts as a nearby enemy if it's less than half the sum of max range and max range
				//	nearTargetCount++;
				//} else if( point > ParamBonus.getMov(unit) && point <= (numEndRange)) {
				//	// Anything above half the sum of max range and max range counts as a distant enemy
				//	distantTargetCount++;
				//} else {
				//	// If it is above the sum of the maximum range and maximum range, it counts as ineligible.
				//	outRangeTargetCount++;
				//}
				//nearMovePoint = Math.min(nearMovePoint, point);
				//distantMovePoint = Math.max(distantMovePoint, point);
		
				score = OT_EffectRangeAIScoreCalculation._getTotalScore(unit, targetUnit, item);
				unitScoreArray[targetUnit.getId()] = score;
				
				if(unit == targetUnit) {
					//root.log('user');
					continue;
				}
				
				unitIndexScoreArray[index] = score;
				entryUnitArray.push(targetUnit);
			}
		}

		
		//checkTime('check time1: ');
		//return;
		//root.log('nearMovePoint:' + nearMovePoint + ' distantMovePoint:' + distantMovePoint);

		
		var chkResultArray = [];
		var targetIndex;
		// Based on the current position of the targetUnit (other party, not yourself),
		// Search for potential locations for item range and area of ​​effect after moving
		
		
		for (i = 0; i < entryUnitArray.length ; i++) {
			targetUnit = entryUnitArray[i];

			if(unit == targetUnit) continue;
			
			//root.log('test:' + targetUnit.getName());

			x = targetUnit.getMapX();
			y = targetUnit.getMapY();
			targetIndex = CurrentMap.getIndex(x, y);
			point = Math.abs(myX - x) + Math.abs(myY - y);  // Distance between enemy and target
			var moveAfterNearPoint = point - maxDistance;
			var moveAfterDistantPoint = point + maxDistance;
			
			//var tmpEndRange = endRange;
			var tmpEndRange = endRange + endEffectRange;
			var tmpStartRange = startRange;

			//if(moveAfterNearPoint > tmpStartRange) {
			//	tmpStartRange = moveAfterNearPoint;
			//}

			//if(moveAfterDistantPoint < tmpEndRange) {
			//	tmpEndRange = moveAfterDistantPoint;
			//}

			if(tmpStartRange > tmpEndRange) {
				continue;
			} else if( tmpStartRange <= 0 ) {
				tmpStartRange = 1;
			}
			
			var indexSearchNormal = false;
			var indexSearchBox = false;
			
			switch( rangeType ) {
				case OT_EffectRangeType.XCROSS:
					indexSearchBox = true;
					break;
					
				case OT_EffectRangeType.DOUBLECROSS:
					indexSearchNormal = true;
					indexSearchBox = true;
					break;

				default:
					indexSearchNormal = true;
					break;
			}
			
			switch( effectRangeType ) {
				case OT_EffectRangeType.XCROSS:
				case OT_EffectRangeType.DOUBLECROSS:
				case OT_EffectRangeType.LINE:
				case OT_EffectRangeType.BOX:
				case OT_EffectRangeType.BREATH:
				case OT_EffectRangeType.HORIZONTALLINE:
					indexSearchBox = true;
					break;
			}
			if(indexSearchNormal && indexSearchBox) {
				indexArray = OT_getBoxIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), tmpStartRange, tmpEndRange);
				Array.prototype.push.apply( indexArray, IndexArray.getBestIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), tmpStartRange, tmpEndRange) );
				unique(indexArray);
			} else if(indexSearchBox) {
				indexArray = OT_getBoxIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), tmpStartRange, tmpEndRange);
			} else {
				indexArray = IndexArray.getBestIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), tmpStartRange, tmpEndRange);
			}
			
			// 
			//checkTime('check time1-1: ');
			var posArray = ArrayOverlap(unitMapPosArray, indexArray);

			
			// Confirm that you can move to a position where range attacks may reach around the enemy,
			// Retain location information if it is possible to move
			score = 0;
			if( unitScoreArray[targetUnit.getId()] != null ) {
				score = unitScoreArray[targetUnit.getId()];
			} else {
				//root.log('error:' + targetUnit.getId() + '/' + targetUnit.getName());
			}

			//checkTime('check time1-Start: ');
			for (k = 0; k < posArray.length; k++) {
				index = posArray[k];
				x = CurrentMap.getX(index);
				y = CurrentMap.getY(index);

				direction = 0;

				// If the area of ​​effect changes depending on the orientation, the orientation information should also be recorded.
				switch( effectRangeType ) {
					case OT_EffectRangeType.HORIZONTALLINE:
					case OT_EffectRangeType.LINE:
					case OT_EffectRangeType.BREATH:
						direction = OT_getUnitDirection(x, y, targetUnit.getMapX(), targetUnit.getMapY());
						direction = OT_getUnitDirectionIndex(direction);
						break;
				}

				// 0: Position index of the unit when using the item
				// 1: Direction when used (data for types that change the effect range depending on the direction, such as breath system,
				//   0: Left 1: Top 2: Right 3: Bottom 4: Top left 5: Top right 6: Bottom right 7: Bottom left Stores 0 for unchanged types)
				// 2: Position index array of the target unit
				// 3: Number of target units (provisional maximum number of involved)
				// 4: Provisional maximum score when all target units are involved
				// 5: Additional scores such as terrain effects
				var emptyChk = true;
				for (l = 0; l < chkResultArray.length; l++) {
					if(chkResultArray[l][0] == index && chkResultArray[l][1] == direction) {
						chkResultArray[l][2].push(targetIndex);
						chkResultArray[l][3] += 1;
						chkResultArray[l][4] += score;
						emptyChk = false;
						break;
					}
				}
				
				if(emptyChk) {
					var insertArray = [index, direction, [targetIndex],  1, score, 0];
					chkResultArray.push(insertArray);
				}
			}
		}		
		
		//checkTime('check time2: ');

		if(chkResultArray.length > 0) {
			//root.log('numArray:'+chkResultArray.length);
			
			//for (i = 0; i < entryUnitArray.length; i++) {
			//	// record score
			//	//checkTime('check time2-1: ');
			//	var targetUnit = entryUnitArray[i];
			//	score = OT_EffectRangeAIScoreCalculation._getTotalScore(unit, targetUnit, item);
			//	unitScoreArray[targetUnit.getId()] = score;
			//	//checkTime('check time2-2: ');
			//}
			//checkTime('check time3: ');
			
			var myScore = 0;
			var tmpScore;
			var tmpX = 0;
			var tmpY = 0;

			// If you may become a target
			// Put the score when you become a target in the provisional maximum score
			if(OT_EffectRangeCheckFilter(unit, filter)) {
				myScore = unitScoreArray[unit.getId()];
			}
			
			for (i = 0; i < chkResultArray.length; i++) {
				index    = chkResultArray[i][0];
				x = CurrentMap.getX(index);
				y = CurrentMap.getY(index);
				
				tmpX = unit.getMapX();
				tmpY = unit.getMapY();
				
				unit.setMapX(x);
				unit.setMapY(y);
				// Get the avoidance value of the unit position at the time of activation
				tmpScore = AbilityCalculator.getAvoid(unit);
				unit.setMapX(tmpX);
				unit.setMapY(tmpY);
				
				chkResultArray[i][4] += myScore;
				chkResultArray[i][5] = tmpScore;
			}

			//checkTime('check time4: ');

			// Descending sort to check in order of score
			chkResultArray.sort(function(a,b){ 
				if(b[4] > a[4]) return 1;
				if(b[4] < a[4]) return -1;
				if(b[5] > a[5]) return 1;
				if(b[5] < a[5]) return -1;
				return 0;
			});
			
			count = 0;
			var tmpChkArray;
			var tmpResult;
			var tmpArray;
			var tmpIndex;
			var tmpCount;
			var maxScore = -9999;
			var maxAddScore = 0;
			var isInvolved = false;
			var isReCheck  = false;

			var isFirstCheck  = true;
			for (i = 0; i < chkResultArray.length; i++) {
				var tmpAddScore = chkResultArray[i][5];
				
				//root.log('moving position:' + chkResultArray[i][0] + ' direction:' + chkResultArray[i][1] + ' sc:' + chkResultArray[i][4] + ' addsc:' + tmpAddScore);
				//root.log('Target unit position:');
				//root.log(chkResultArray[i][2]);
				
				// If the range and range are large and one range is a diagonal mass type
				// There is a high possibility that the predicted score will be negative when your army is densely packed around
				// Therefore, try to judge only once
				if(isFirstCheck == false) {
					// 0 for no effect,
					// If their damage is likely to increase due to the involvement system, it will be 0 or less
					// do not check at this time
					if(chkResultArray[i][4] <= myScore) {
						//root.log('no effect');
						continue;
					}
	
					// If the provisional maximum score is lower than the actual maximum score
					// when the provisional maximum score is equal to the actual maximum score
					// Do not process if the extra score does not exceed the maximum recorded extra score
					if(chkResultArray[i][4] < maxScore || (chkResultArray[i][4] == maxScore && tmpAddScore <= maxAddScore) ) {
						//root.log('out of score');
						continue;
					}
				}
				isFirstCheck = false;

				index = chkResultArray[i][0];	// User movement position
				x = CurrentMap.getX(index);
				y = CurrentMap.getY(index);
				
				tmpChkArray = {};
				tmpResult = [];
				tmpReverseDirection = OT_getUnitDirectionIndexReverse(chkResultArray[i][1]);
				var singleFlag = 0;
				for (j = 0 ; j < chkResultArray[i][2].length ; j++) {
					targetIndex = chkResultArray[i][2][j];	// Target unit position
					tmpX = CurrentMap.getX(targetIndex);
					tmpY = CurrentMap.getY(targetIndex);
					
					//var tmpArray = OT_EffectRangeIndexArray.getRangeItemIndexArray(tmpX, tmpY, item);
					tmpArray = OT_EffectRangeIndexArray.getAIEffectRangeItemIndexArray(tmpX, tmpY, item, tmpReverseDirection);
					
					for (k = 0 ; k < tmpArray.length ; k++) {
						tmpIndex = tmpArray[k];
						if(tmpChkArray[tmpIndex] == null) {
							tmpChkArray[tmpIndex] = [];		// Index information of the activation position of the item in the key
							tmpChkArray[tmpIndex][0] = 0;	// Number of units that can actually be involved
							tmpChkArray[tmpIndex][1] = 0;	// total score
						}
						tmpChkArray[tmpIndex][0] += 1;
						tmpChkArray[tmpIndex][1] += unitIndexScoreArray[targetIndex];
					}
				}
				
				// key: index, value: count
				tmpArray = [];
				var tmpMaxScore = 0;
				for(var key in tmpChkArray) {
					tmpIndex = parseInt(key); // Associative array keys are treated as strings, so convert them to numbers
					tmpCount = tmpChkArray[key][0]; // Number of units that can actually be involved
					tmpScore = tmpChkArray[key][1]; // total score
					
					tmpMaxScore = Math.max(tmpMaxScore, tmpScore);
					if(tmpScore < maxScore || (tmpScore == maxScore && tmpAddScore <= maxAddScore)) {
						continue;
					}
					
					if(tmpArray.indexOf(tmpChkArray[key][0]) == -1) {
						tmpArray.push([tmpCount, tmpScore, tmpIndex]);
					}
				}
				
				if(tmpArray.length == 0) {
					//root.log('No more than maximum score:' + tmpMaxScore);
					continue;
				}
				
				tmpArray.sort(function (a,b){
					return b[1] - a[1];
				});
				
				var tmpSearchArray = [];
				
				// Range measurement centered on moving position
				tmpSearchArray = OT_EffectRangeIndexArray.getRangeItemIndexArray(x, y, item, false);
				for (j = 0 ; j < tmpArray.length ; j++) {
					tmpCount = tmpArray[j][0];
					tmpScore = tmpArray[j][1]; // total score
					targetIndex = tmpArray[j][2]; // Item use position index
					//root.log('count/score/target:');
					//root.log(tmpArray[j]);

					//DebugPrint('move position index:' + index + ' place of use:' + targetIndex + ' sc:' + tmpScore + '/' + maxScore );
					// Suspend if the score is not likely to increase
					if(tmpScore < maxScore || (tmpScore == maxScore && tmpAddScore <= maxAddScore)) {
						continue;
					}
					
					// If the range from the movement position reaches the target, perform processing
					tmpResult = ArrayOverlap([targetIndex], tmpSearchArray);
					if(tmpResult.indexOf(targetIndex) != -1) {
						tmpX = CurrentMap.getX(targetIndex);
						tmpY = CurrentMap.getY(targetIndex);
						
						// If you were also a target
						isInvolved = false;
						if(OT_EffectRangeCheckFilter(unit, filter)) {
							//root.log('You may also be a target:' + index + ':' + targetIndex);
							var indifferenceArray = OT_EffectRangeIndexArray.getEffectRangeItemIndexArrayPosInfo(tmpX, tmpY, item, x, y);
							var chk = ArrayOverlap([index], indifferenceArray);
							if(chk.length > 0) {
								tmpScore += myScore;
								//root.log('Score recalculation because I was involved:' + tmpScore + '/' + maxScore );
								
								// Reconfirm the position not to get caught
								if(myScore < 0) {
									isInvolved = true;
									//isReCheck  = true;
								}

								// Suspend if the score is not likely to increase
								if(tmpScore <= 0 || tmpScore < maxScore || (tmpScore == maxScore && tmpAddScore <= maxAddScore)) {
									continue;
								}
							}
						}
						
						// Create travel information
						misc.targetUnit = null;
						misc.indexArray = [index]; // where to move
						misc.rangeMetrics = StructureBuilder.buildRangeMetrics();
						misc.costArray = this._createCostArray(misc);
						
						// Make sure that the unit can move to a place where it can be activated at the activation position.
						// If you do not check this and include it in the action pattern, you may shoot from outside the range.
						if (misc.costArray.length !== 0) {
							combination = this._createAndPushCombination(misc);
							combination.targetPos = createPos(tmpX, tmpY); // Item use position
							combination.single = false;
							combination.OT_EffectFlag = true;
							combination.addScore = tmpScore + tmpAddScore; // extra score
							
							maxScore = tmpScore;
							maxAddScore = tmpAddScore;
							
							//DebugPrint('maximum score:' + maxScore +'/' + maxAddScore);
							
							// If you get caught, search again
							if(!isInvolved) {
								break;
							}
						}
					}
				}
			}
		}
		//checkTime('check time5: ');

		
	} else {
		// If the effect range is the whole, it will hit the whole no matter where you shoot
		// avoid unnecessary searches
		
		var tmpScore = 0;
		for (i = 0; i < listCountOT; i++) {
			list = listArrayOT[i];
			targetCount = list.getCount();
			for (j = 0; j < targetCount; j++) {
				targetUnit = list.getData(j);
				score = OT_EffectRangeAIScoreCalculation._getTotalScore(unit, targetUnit, item);
				tmpScore += score;
			}
		}

		misc.targetUnit = null;
		if (misc.costArray.length !== 0) {
			//root.log(unit.getName());
			//create a combination
			combination = this._createAndPushCombination(misc);
			combination.targetUnit = unit;
			combination.single = false;
			combination.OT_EffectFlag = true;
			combination.addScore = tmpScore; // extra score
		}
	}

	//root.log('==END==');

	//root.log(cnt);

};

// Add a flag to reduce processing when outside range attack range
var alias102 = CombinationBuilder.createMoveCombinationArray;
CombinationBuilder.createMoveCombinationArray = function(misc) {
	misc.isEffectRangeMove = true;
	return alias102.call(this, misc);
};

// BaseCombinationCollector._getTargetListArray is affected if the is modified
// Processed by a dedicated function
CombinationCollector.Item._getTargetListArrayERD = function(filter, misc) {
	var i, unit, arr, count, flag, list;
	
	if (misc.blockList === null) {
		return FilterControl.getListArray(filter);
	}
	
	arr = [];
	count = misc.blockList.getCount();
	for (i = 0; i < count; i++) {
		unit = misc.blockList.getData(i);
		flag = FilterControl.getNormalFilter(unit.getUnitType());
		if (flag & filter) {
			arr.push(unit);
		}
	}
	
	list = StructureBuilder.buildDataList();
	list.setDataArray(arr);
	
	return [list];
};

//----------------------------------------------------------
// Sound duplication support
//----------------------------------------------------------
var alias200 = AnimeMotion._checkSound;
AnimeMotion._checkSound = function() {
	if(OT_EffectRangeUseSoundMode) {
		var soundHandle;
		if (!this._isLockSound && this._animeData.isSoundFrame(this._motionId, this._frameIndex)) {
			var id = this._animeData.getId();
			var frameNo = this._frameIndex;
			
			//root.log('id:' + id + ' indexOf:'+OT_EffectRangeUseSoundModeArray.indexOf(id));
			
			
			for ( var i=0; i<OT_EffectRangeUseSoundModeArray.length; i++) {
				if(OT_EffectRangeUseSoundModeArray[i][0] == id && OT_EffectRangeUseSoundModeArray[i][1] == frameNo) {
					return;
				}
			}
			
			OT_EffectRangeUseSoundModeArray.push([id, frameNo]);
			
			//root.log('id:' + id + ' add');
			OT_EffectRangeUseSoundModeArray.push(id);

			soundHandle = this._animeData.getSoundHandle(this._motionId, this._frameIndex);
			MediaControl.soundPlay(soundHandle);
		}
		return;
	}
	
	alias200.call(this);
};

var OT_EffectRangeUseSoundMode = false;
var OT_EffectRangeUseSoundModeArray = [];

OT_EffectRangeUseSoundModeEnable = function() {
	OT_EffectRangeUseSoundMode = true;
	OT_EffectRangeUseSoundModeArray = [];
	//root.log('enable');
};

OT_EffectRangeUseSoundModeDisable = function() {
	OT_EffectRangeUseSoundMode = false;
	OT_EffectRangeUseSoundModeArray = [];
	//root.log('disable');
};

//----------------------------------------------------------
// Useful functions
//----------------------------------------------------------
// Remove array duplicates
function unique(array) {
	var storage = {};
	var uniqueArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if (!(value in storage))
		{
			storage[value] = true;
			uniqueArray.push(value);
		}
	}
	return uniqueArray;
};

// Get array duplicates
function overlap(array) {
	var storage = {};
	var storage2 = {};
	var uniqueArray = [];
	var overlapArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if ( !(value in storage) )
		{
			storage[value] = true;
			//root.log(value);
		}
		else if( !(value in storage2) )
		{
			storage2[value] = true;
			overlapArray.push(value);
			//root.log(value);
		}
	}
	return overlapArray;
};

// Compare arrays to get duplicates
function ArrayOverlap(array, array2) {
	var storage = {};
	var storage2 = {};
	var uniqueArray = [];
	var overlapArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if( array2.indexOf(value) != -1 )
		{
			overlapArray.push(value);
		}
	}
	return overlapArray;
};

//var getArraysIntersect = (array01, array02) => {
//  return [Set(array01)].filter(value => array02.includes(value));
//}

debugIndexPrint = function(msg, IndexArray) {
	for(var i=0; i<IndexArray.length ; i++) {
		root.log(msg + ':' + IndexArray[i]);
	}
};

})();
