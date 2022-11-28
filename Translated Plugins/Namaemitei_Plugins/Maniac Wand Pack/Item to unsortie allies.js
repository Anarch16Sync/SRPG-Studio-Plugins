
/*----------------------------------------------------------------------
  
　A script that creates an item (cane) that repatriates allies

■Overview
　You can make an item to repatriate your friends who are sortieing

■ How to use
　Put this script in the plugin folder,
　Type: Create a rescue item (cane) and put {_unsummon:1} in the custom parameter,
　The item will be an item that can repatriate the specified target.

■ Customization
　1. I want to display the "repatriate" command in the unit command
　　　→ Set false to true in "var useUnSummonCommand = false;"
　　　　*All of the following conditions must be met to display the repatriation command.
　　　　　・You have a repatriation item and can use it.
　　　　　・There are units that can be repatriated within the range of the repatriation item.

　　　　　Also, if you have only one repatriation item, you will be transferred directly to the summon screen,
　　　　　If you have two or more repatriation items, select the repatriation item and then transition to the summon screen.

　2. I want to prevent the repatriation wand from being sent to the wand command
　　　→ Set false to true in "var isUnSummonWandDelete = false;"
　　　　*Valid only when the "Summon" command is displayed.

■ Precautions
　Filter items for repatriation to your own army only.
　Enabling allies and enemy forces has no effect (it becomes an item that only acquires experience points)


16/12/14 new
21/11/29 Fixed a bug where waiting units would be summoned in a standby state when resummoned after sending them back.
22/03/19 Add repatriation command (can be used by setting useUnSummonCommand = true)
22/03/21 Made the repatriation command correspond to the wand master. Fixed a bug that sometimes caused a block sound when selecting the repatriate command.


■ Correspondence version
　SRPG Studio Version:1.254


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credits OK
・ Redistribution, reprint OK
・Please comply with the SRPG Studio Terms of Use.
  
----------------------------------------------------------------------*/

(function() {

//--------------------------------------------
// setting
//--------------------------------------------
var useUnSummonCommand  = false; 				// Whether to use the repatriation command (true: use false: not use)
var isUnSummonWandDelete = false;				// Whether to erase the repatriation wand from the wand command (true: erase false: not erase) *Valid only when useUnSummonCommand is true
var UnSummonCommandIndex = 6;					// Registered position of repatriation command (nth from the top)
var UnSummonCommandName  = 'Unsortie';		    // repatriation command name




//--------------------------------------------
// Program below
//--------------------------------------------

//----------------------------------------
// RescueItemUse class
//----------------------------------------
var alias1 = RescueItemUse.enterMainUseCycle;
RescueItemUse.enterMainUseCycle= function(itemUseParent) {
		var result = alias1.call(this, itemUseParent);

		// Evacuate target item
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		this._item = itemTargetInfo.item;

		return result;
}


var alias2 = RescueItemUse._moveSrcAnime;
RescueItemUse._moveSrcAnime= function() {
		// If the item has a custom parameter {unsummon:1}, transition to end processing when the warp animation of the rescue source ends.
		if( typeof this._item.custom._unsummon === 'number' ) {
			if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
				this.changeCycleMode(ItemRescueUseMode.END);
			}
			return MoveResult.CONTINUE;
		}

		// Normal processing if item does not have custom parameter { unsummon:1}
		return alias2.call(this);
}


var alias3 = RescueItemUse.mainAction;
RescueItemUse.mainAction= function() {
		// Retract target unit if item has custom parameter {unsummon:1}
		if( typeof this._item.custom._unsummon === 'number' ) {
			// Retract target unit
			if( this._targetUnit.getUnitType() == UnitType.PLAYER ){
				this._targetUnit.setSortieState(SortieType.UNSORTIE);
				this._targetUnit.setWait(false);
			}
			return;
		}

		// Normal processing if item does not have custom parameter { unsummon:1}
		alias3.call(this);
}




//----------------------------------------
// RescueItemInfo class
//----------------------------------------
RescueItemInfo.drawItemInfoCycle= function(x, y) {
		// usually
		if( typeof this._item.custom._unsummon !== 'number' ) {
			ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Rescue));
		}
		// Items for repatriation
		else {
			ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName('送還'));
		}
		y += ItemInfoRenderer.getSpaceY();
		
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
}




// Below is the definition for the repatriate command
if( useUnSummonCommand === true ) {
	//----------------------------------
    // UnitCommand class
    //----------------------------------
	var alias100 = UnitCommand.configureCommands;
	UnitCommand.configureCommands= function(groupArray) {
		alias100.call(this, groupArray);
		
		var unsummon_command_index = UnSummonCommandIndex;
		if( unsummon_command_index > groupArray.length ) {
			unsummon_command_index = groupArray.length;
		}
		
		// Register the nth command from the top
		groupArray.insertObject(UnitCommand.UnSummon, unsummon_command_index);
	}




	//----------------------------------
    // WandSelectMenu class
    //----------------------------------
	var alias110 = WandSelectMenu._isWandAllowed;
	WandSelectMenu._isWandAllowed= function(unit, item) {
		var result = alias110.call(this, unit, item);
		
		// If Is un summon wand delete is true, remove the repatriate wand from wand commands
		if( isUnSummonWandDelete === true ) {
			if( result !== true ) {
				return result;
			}
			
			if( typeof item.custom._unsummon !== 'undefined' ) {
				return false;
			}
		}
		
		return result;
	}




	//----------------------------------
    // UnitCommand. Wand Class
    //----------------------------------
	var alias120 = UnitCommand.Wand.isCommandDisplayable;
	UnitCommand.Wand.isCommandDisplayable= function() {
		var result = alias120.call(this);
		
		if( isUnSummonWandDelete === true ) {
			if( result !== true ) {
				return result;
			}
			
			return this._getNotUnSummonWandCnt() > 0;
		}
		
		return result;
	}


	UnitCommand.Wand._getNotUnSummonWandCnt= function() {
		var i, item;
		var unit = this.getCommandTarget();
		var count = UnitItemControl.getPossessionItemCount(unit);
		var noUnSummonWandCnt = 0;
		
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null) {
				if (WandChecker.isWandUsableInternal(unit, item)) {
					if( typeof item.custom._unsummon === 'undefined' ) {
						noUnSummonWandCnt++;
					}
				}
			}
		}
		
		return noUnSummonWandCnt;
	}




	//----------------------------------
    // UnitCommand.UnSummon Class
    //----------------------------------
	UnitCommand.UnSummon = defineObject(UnitCommand.Item,
	{
		_unSummonItem: null,
		_wandMasterSkill: null,
		
		isCommandDisplayable: function() {
			var unsummonCnt = this._getUnSummonItemCount();
			var isDisplay = false;
			
			// false if there are no summonable items or staffs
			if( unsummonCnt < 1 ) {
				return false;
			}
			
			// If there are summonable items and staffs, check the number of uses by the staff master and item master.
			var i, item;
			var maxCount = DataConfig.getMaxUnitItemCount();
			var unit = this.getCommandTarget();
			
			for (i = 0; i < maxCount; i++) {
				item = UnitItemControl.getItem(unit, i);
				if ( this._isUnSummonItem(unit, item) === true ) {
					// for items
					if( item.isWand() !== true ) {
						// Visible if item is not used
						if( typeof this.isItemUsed === 'undefined' || this.isItemUsed() ) {
							isDisplay = true;
							break;
						}
					}
					// for cane
					else {
						// Can be displayed if the staff has not been used
						if( typeof this.isWandUsed === 'undefined' || this.isWandUsed() !== true ) {
							isDisplay = true;
							break;
						}
					}
				}
			}
			
			return isDisplay;
		},
		
		_getUnSummonItemCount: function() {
			var i, item;
			var maxCount = DataConfig.getMaxUnitItemCount();
			var unit = this.getCommandTarget();
			var UnSummonItemCnt = 0;
			
			for (i = 0; i < maxCount; i++) {
				item = UnitItemControl.getItem(unit, i);
				if ( this._isUnSummonItem(unit, item) === true ) {
					UnSummonItemCnt++;
				}
			}
			
			return UnSummonItemCnt;
		},
		
		_isUnSummonItem: function(unit, item) {
			if( item == null || unit == null ) {
				return false;
			}
			
			if( typeof item.custom._unsummon !== 'number' ) {
				return false;
			}
			
			// This. false if the unit cannot be used (the item cannot be used)
			if (!ItemControl.isItemUsable(unit, item)) {
				return false;
			}
			
			obj = ItemPackageControl.getItemAvailabilityObject(item);
			if (obj === null) {
				return false;
			}
			
			return obj.isItemAvailableCondition(unit, item);
		},
		
		getCommandName: function() {
			return UnSummonCommandName;
		},
		
		_prepareCommandMemberData: function() {
			this._itemUse = null;
			this._itemSelection = null;
			this._itemSelectMenu = createObject(UnSummonItemSelectMenu);
		},
		
		_completeCommandMemberData: function() {
			UnitCommand.Item._completeCommandMemberData.call(this);
			
			// *Skill: Item master processing is done automatically (because it is a derived class of unit command.item)
			
			if( typeof SKILL_WAND_MASTER_NAME !== 'undefined' ) {
				// Skill: Acquire Cane Master in advance
				this._wandMasterSkill = SkillControl.getPossessionCustomSkill(this.getCommandTarget(), SKILL_WAND_MASTER_NAME);
			}
		},
		
		_moveSelection: function() {
			if (this._itemSelection.moveItemSelectionCycle() !== MoveResult.CONTINUE) {
				if (this._itemSelection.isSelection()) {
					this._useItem();
					this.changeCycleMode(ItemCommandMode.USE);
				}
				else {
					// If you have multiple summon items, go to item command mode.top
					if( this._getUnSummonItemCount() > 1 ) {
						this._itemSelectMenu.setMenuTarget(this.getCommandTarget());
						this.changeCycleMode(ItemCommandMode.TOP);
					}
					// Ends if you have one summon item
					else {
						// Rebuild the command because the equipped weapon may have changed, or the item may have been discarded.
						this.rebuildCommand();
						
						// Abandoning an item is considered an action.
						if (this._itemSelectMenu.isDiscardAction()) {
							this.endCommandAction();
						}
						
						return MoveResult.END;
					}
				}
			}
			
			return MoveResult.CONTINUE;
		},
		
		_moveUse: function() {
			// Check summon items
			var item = this._unSummonItem;
			
			// If the item for summoning is a tool (with the effect of item master)
			if( item.isWand() !== true ) {
				return UnitCommand.Item._moveUse.call(this);
			}
			// If the item for summoning is a cane (with the effect of a cane master)
			else {
				return UnitCommand.Wand._moveUse.call(this);
			}
		},
		
		_useItem: function() {
			UnitCommand.Item._useItem.call(this);
			
			// keep summon items
			this._unSummonItem =  this._itemSelection._item;
		}
	}
	);




	//----------------------------------
    // UnSummonItemSelectMenu class
    //----------------------------------
	var UnSummonItemSelectMenu = defineObject(ItemSelectMenu,
	{
		setMenuTarget: function(unit) {
			this._unit = unit;
			
			this._itemListWindow = createWindowObject(UnSummonItemListWindow, this);
			this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
			this._itemWorkWindow = createWindowObject(ItemWorkWindow, this);
			this._discardManager = createObject(DiscardManager);
			
			this._itemWorkWindow.setupItemWorkWindow();
			
			this._resetItemList();
			
			if( this._itemListWindow.getItemScrollbar().getObjectCount() > 1 ) {
				this._processMode(ItemSelectMenuMode.ITEMSELECT);
			}
			else {
				this._processMode(ItemSelectMenuMode.DISCARD);
			}
		},
		
		moveWindowManager: function() {
			var mode = this.getCycleMode();
			var result = ItemSelectMenuResult.NONE;
			
			if (mode === ItemSelectMenuMode.ITEMSELECT) {
				result = this._moveItemSelect();
			}
			else if (mode === ItemSelectMenuMode.WORK) {
				result = this._moveWork();
			}
			else if (mode === ItemSelectMenuMode.DISCARD) {
				result = this._moveDiscard();
			}
			
			return result;
		},
		
		drawWindowManager: function() {
			var x = this.getPositionWindowX();
			var y = this.getPositionWindowY();
			var height = this._itemListWindow.getWindowHeight();
			
			if (this.getCycleMode() !== ItemSelectMenuMode.DISCARD) {
				this._itemListWindow.drawWindow(x, y);

				this._itemInfoWindow.drawWindow(x, y + height + this._getWindowInterval());
			}
		},
		
		getSelectWand: function() {
			return this._itemListWindow.getCurrentItem();
		},
		
		_moveItemSelect: function() {
			var input = this._itemListWindow.moveWindow();
			var result = ItemSelectMenuResult.NONE;
			
			if (input === ScrollbarInput.SELECT) {
	//			this._itemWorkWindow.setItemWorkData(this._itemListWindow.getCurrentItem());
	//			this._processMode(ItemSelectMenuMode.WORK);
				result = ItemSelectMenuResult.USE;
			}
			else if (input === ScrollbarInput.CANCEL) {
				ItemControl.updatePossessionItem(this._unit);
				result = ItemSelectMenuResult.CANCEL;
			}
			else {
				if (this._itemListWindow.isIndexChanged()) {
					this._itemInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
				}
			}
			
			return result;
		},
		
		// Originally, the item is discarded, but it is used to automatically use it when there is only one summoned item.
		_moveDiscard: function() {
			var result = ItemSelectMenuResult.USE;
			
			return result;
		},
		
		_processMode: function(mode) {
			if (mode === ItemSelectMenuMode.ITEMSELECT) {
				this._forceSelectIndex = -1;
				this._itemListWindow.enableSelectCursor(true);
			}
			else if (mode === ItemSelectMenuMode.WORK) {
				this._itemListWindow.enableSelectCursor(false);
			
				this._itemWorkWindow.setWorkIndex(0);
				this._itemWorkWindow.enableSelectCursor(true);
			}
			else if (mode === ItemSelectMenuMode.DISCARD) {
//				this._discardManager.setDiscardItem(this._itemListWindow.getCurrentItem());
			}
			
			this.changeCycleMode(mode);
		}
	}
	);




	//----------------------------------
    // UnSummonItemListWindow class
    //----------------------------------
	var UnSummonItemListWindow = defineObject(ItemListWindow,
	{
		initialize: function() {
			this._scrollbar = createScrollbarObject(UnSummonItemListScrollbar, this);
		}
	}
	);




	//----------------------------------
    // UnSummonItemListScrollbar class
    //----------------------------------
	var UnSummonItemListScrollbar = defineObject(ItemListScrollbar,
	{
		setUnitItemFormation: function(unit) {
			var i, item;
			var maxCount = DataConfig.getMaxUnitItemCount();
			
			this._unit = unit;
			
			this.resetScrollData();
			
			for (i = 0; i < maxCount; i++) {
				item = UnitItemControl.getItem(unit, i);
				if ( this._isUnSummonItem(item) === true ) {
					this.objectSet(item);
				}
			}
			
			this.objectSetEnd();
			
			this.resetAvailableData();
		},
		
		_isUnSummonItem: function(item) {
			if( item == null ) {
				return false;
			}
			
			if( typeof item.custom._unsummon !== 'number' ) {
				return false;
			}
			
			// This. false if the unit cannot be used (the item cannot be used)
			if (!ItemControl.isItemUsable(this._unit, item)) {
				return false;
			}
			
			obj = ItemPackageControl.getItemAvailabilityObject(item);
			if (obj === null) {
				return false;
			}
			
			return obj.isItemAvailableCondition(this._unit, item);
		}
	}
	);
}


})();