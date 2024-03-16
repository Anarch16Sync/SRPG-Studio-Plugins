/* 
Author: Anarch16Sync

Overview: 
This plugin allows an item type to have its own unit command and class requirment as staves do.

To use this plugin you need to add custom parameters to the weapon type and the class.

Also you need to replace the 'ExtraItem' string in ExtraItemA16SCommandName with the name you want for the command,
and replace the number in ExtraItemA16SWeaponTypeId = 2, with the id of the weapon type.

Custom Parameter:
Add {isExtraItemA16S:true} to the item type you want to have its own command

Add {UseExtraItemA16S: true} to the classes you want to be able to use the new item type

Changelog:

2024-03-15 ver 1.0 
Created


Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.

*/

(function() {
/*-------------------------------
 Config
 ------------------------------ */

var ExtraItemA16SCommandName = 'ExtraItem'; //String of the New Item Command
var ExtraItemA16SCommandPosition = 6; //Command position bigger makes it go lower, 0 puts it at the top of all commands.
var ExtraItemA16SWeaponTypeId = 2; //Id of the Item Type that has the isExtraItemA16S custom parameter

/* Aliased Functions */
var aliasItemUsable = ItemControl.isItemUsable;
ItemControl.isItemUsable= function(unit, item) {
		var result = aliasItemUsable.call(this, unit, item);
		
		if (!ExtraItemA16SChecker.isExtraItemA16S(item)) {
			return result;
		}
		
		if( !ExtraItemA16SChecker.isUnitUsableTargetExtraItemA16S(unit, item) == true ) {
			return false;
		}

		// false if ep is not enough
		if( this._isEpEnough(unit, item) !== true ) {
			return false;
		}
		
		// false if Fp is not enough
		if( this._isFpEnough(unit, item) !== true ) {
			return false;
		}
		
		// Check if an item is prohibited
		if (StateControl.isBadStateFlag(unit, BadStateFlag.ITEM)) {
			return false;
		}
		
		if (item.getItemType() === ItemType.KEY) {
			if (item.getKeyInfo().isAdvancedKey()) {
				// For "Private Key", the class must be able to use the key
				if (!(unit.getClass().getClassOption() & ClassOptionFlag.KEY)) {
					return false;
				}
			}
		}
		
		// Look up "private data"
		if (!this.isOnlyData(unit, item)) {
			return false;
		}
		
		return true;
};

var aliasConfigWindowExtraItemA16S = UnitCommand.configureCommands;

UnitCommand.configureCommands = function(groupArray) {
	aliasConfigWindowExtraItemA16S.call(this, groupArray);

    groupArray.insertObject(UnitCommand.ExtraItemA16S, ExtraItemA16SCommandPosition);
};

var aliascalculateRecoveryItemPlus = Calculator.calculateRecoveryItemPlus;
Calculator.calculateRecoveryItemPlus= function(unit, targetUnit, item) {
		var plus = aliascalculateRecoveryItemPlus.call(this, unit, targetUnit, item);
		var itemType = item.getItemType();
		
		if (itemType !== ItemType.RECOVERY && itemType !== ItemType.ENTIRERECOVERY) {
			return plus;
		}
		

		if (ExtraItemA16SChecker.isExtraItemA16S(item)) {
			plus = ParamBonus.getMag(unit);
		}
		
		return plus;
};


var aliascalculateDamageItemPlus = Calculator.calculateDamageItemPlus;
Calculator.calculateDamageItemPlus= function(unit, targetUnit, item) {
		var plus = aliascalculateDamageItemPlus.call(this, unit, targetUnit, item);

		var damageInfo, damageType;
		var itemType = item.getItemType();
		
		if (itemType !== ItemType.DAMAGE) {
			return plus;
		}

		damageInfo = item.getDamageInfo();
		damageType = damageInfo.getDamageType();

		if (ExtraItemA16SChecker.isExtraItemA16S(item)) {
			if (damageType === DamageType.MAGIC) {
				plus = ParamBonus.getMag(unit);
			}
		}
		
		return plus;
};

WeaponTypeRenderer.drawClassWeaponList = function(x, y, cls) {
    var i, data, handle;
		var refList = cls.getEquipmentWeaponTypeReferenceList();
		var count = refList.getTypeCount();
		
		for (i = 0; i < count; i++) {
			data = refList.getTypeData(i);
			handle = data.getIconResourceHandle();
			GraphicsRenderer.drawImage(x + (i * 30), y, handle, GraphicsType.ICON);
		}
		
		if (cls.getClassOption() & ClassOptionFlag.WAND) {
			handle = this._getWandIcon();
			GraphicsRenderer.drawImage(x + (i * 30), y, handle, GraphicsType.ICON)
            i+=1;
		}

        if (cls.custom.UseExtraItemA16S){
            handle = this._getExtraItemA16SIcon();
			GraphicsRenderer.drawImage(x + (i * 30), y, handle, GraphicsType.ICON)
        }
};




/* NEW Funcitons */

WeaponTypeRenderer._getExtraItemA16SIcon = function() {
    var list = root.getBaseData().getWeaponTypeList(3);
    
    return list.getDataFromId(ExtraItemA16SWeaponTypeId).getIconResourceHandle()
};

var ExtraItemA16SCommandMode = {
	TOP: 0,
	SELECTION: 1,
	USE: 2
};

UnitCommand.ExtraItemA16S = defineObject(UnitListCommand,
{
	_itemUse: null,
	_itemSelection: null,
	_itemSelectMenu: null,
	
	openCommand: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === ExtraItemA16SCommandMode.TOP) {
			result = this._moveTop();
		}
		else if (mode === ExtraItemA16SCommandMode.SELECTION) {
			result = this._moveSelection();
		}
		else if (mode === ExtraItemA16SCommandMode.USE) {
			result = this._moveUse();
		}
		
		return result;
	},
	
	drawCommand: function() {
		var mode = this.getCycleMode();
		
		if (mode === ExtraItemA16SCommandMode.TOP) {
			this._drawTop();
		}
		else if (mode === ExtraItemA16SCommandMode.SELECTION) {
			this._drawSelection();
		}
		else if (mode === ExtraItemA16SCommandMode.USE) {
			this._drawUse();
		}
	},
	
	isCommandDisplayable: function() {
		return ExtraItemA16SChecker.isExtraItemA16SUsable(this.getCommandTarget());
	},
	
	getCommandName: function() {
		return ExtraItemA16SCommandName;
	},
	
	isRepeatMoveAllowed: function() {
		return DataConfig.isUnitCommandMovable(RepeatMoveType.ITEM);
	},
	
	_prepareCommandMemberData: function() {
		this._itemUse = null;
		this._itemSelection = null;
		this._itemSelectMenu = createObject(ExtraItemA16SSelectMenu);
	},
	
	_completeCommandMemberData: function() {
		this._itemSelectMenu.setMenuTarget(this.getCommandTarget());
		this.changeCycleMode(ExtraItemA16SCommandMode.TOP);
	},
	
	_moveTop: function() {
		var item;
		var unit = this.getCommandTarget();
		var input = this._itemSelectMenu.moveWindowManager();
		
		if (input === ScrollbarInput.SELECT) {
			item = this._itemSelectMenu.getSelectExtraItemA16S();
			this._itemSelection = ItemPackageControl.getItemSelectionObject(item);
			if (this._itemSelection !== null) {
				if (this._itemSelection.enterItemSelectionCycle(unit, item) === EnterResult.NOTENTER) {
					this._useItem();
					this.changeCycleMode(ExtraItemA16SCommandMode.USE);
				}
				else {
					this.changeCycleMode(ExtraItemA16SCommandMode.SELECTION);
				}
			}
		}
		else if (input === ScrollbarInput.CANCEL) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveSelection: function() {
		if (this._itemSelection.moveItemSelectionCycle() !== MoveResult.CONTINUE) {
			if (this._itemSelection.isSelection()) {
				this._useItem();
				this.changeCycleMode(ExtraItemA16SCommandMode.USE);
			}
			else {
				this._itemSelectMenu.setMenuTarget(this.getCommandTarget());
				this.changeCycleMode(ExtraItemA16SCommandMode.TOP);
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveUse: function() {
		if (this._itemUse.moveUseCycle() !== MoveResult.CONTINUE) {
			this.endCommandAction();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_drawTop: function() {
		this._itemSelectMenu.drawWindowManager();
	},
	
	_drawSelection: function() {
		this._itemSelection.drawItemSelectionCycle();
	},
	
	_drawUse: function() {
		this._itemUse.drawUseCycle();
	},
	
	_useItem: function() {
		var itemTargetInfo;
		var item = this._itemSelectMenu.getSelectExtraItemA16S();
		
		this._itemUse = ItemPackageControl.getItemUseParent(item);
		itemTargetInfo = this._itemSelection.getResultItemTargetInfo();
		
		itemTargetInfo.unit = this.getCommandTarget();
		itemTargetInfo.item = item;
		itemTargetInfo.isPlayerSideCall = true;
		this._itemUse.enterUseCycle(itemTargetInfo);
	}
}
);


var ExtraItemA16SChecker = {
	isExtraItemA16SUsable: function(unit) {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(unit);
		
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null) {
				if (this.isExtraItemA16SUsableInternal(unit, item)) {
					return true;
				}
			}
		}
		
		return false;
	},
	
	isExtraItemA16SUsableInternal: function(unit, item) {
		var obj;
		
		if (this.isExtraItemA16S(item) == false) {
			return false;
		}
		
		if (!ItemControl.isItemUsable(unit, item)) {
			return false;
		}
		
		obj = ItemPackageControl.getItemAvailabilityObject(item);
		if (obj === null) {
			return false;
		}
		
		return obj.isItemAvailableCondition(unit, item);
	},

    isExtraItemA16S: function(item) {
		var isExtraItemA16S = item.getWeaponType().custom.isExtraItemA16S;

		if (typeof isExtraItemA16S === 'undefined' || isExtraItemA16S == false) {
			return false;
		}
		
		return isExtraItemA16S;
    },

    isUnitUsableTargetExtraItemA16S: function(unit, item) {
    var cls = unit.getClass();

    if(this.isExtraItemA16S(item) && cls.custom.UseExtraItemA16S){
        return true
    }

    return false;

    }
};

var ExtraItemA16SSelectMenu = defineObject(BaseWindowManager,
    {
        _unit: null,
        _itemListWindow: null,
        _itemInfoWindow: null,
        
        setMenuTarget: function(unit) {
            this._unit = unit;
            this._itemListWindow = createWindowObject(ItemListWindow, this);
            this._itemInfoWindow = createWindowObject(ItemInfoWindow, this); 
            
            this._setExtraItemA16SFormation();
            this._setExtraItemA16Sbar(unit);
            this._itemListWindow.setActive(true);
        },
        
        moveWindowManager: function() {
            var result = this._itemListWindow.moveWindow();
            
            if (this._itemListWindow.isIndexChanged()) {
                this._itemInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
            }
            
            this._itemInfoWindow.moveWindow();
            
            return result;
        },
        
        drawWindowManager: function() {
            var x = this.getPositionWindowX();
            var y = this.getPositionWindowY();
            var height = this._itemListWindow.getWindowHeight();
            
            this._itemListWindow.drawWindow(x, y);
            this._itemInfoWindow.drawWindow(x, y + height + this._getWindowInterval());
        },
        
        getTotalWindowWidth: function() {
            return this._itemInfoWindow.getWindowWidth();
        },
        
        getTotalWindowHeight: function() {
            return this._itemListWindow.getWindowHeight() + this._getWindowInterval() + this._itemInfoWindow.getWindowHeight();
        },
        
        getPositionWindowX: function() {
            var width = this.getTotalWindowWidth();
            return LayoutControl.getUnitBaseX(this._unit, width);
        },
        
        getPositionWindowY: function() {
            return LayoutControl.getCenterY(-1, 340);
        },
        
        getExtraItemA16SCount: function() {
            var i, item;
            var count = UnitItemControl.getPossessionItemCount(this._unit);
            var ExtraItemA16SCount = 0;
            
            for (i = 0; i < count; i++) {
                item = UnitItemControl.getItem(this._unit, i);
                if (this._isExtraItemA16SAllowed(this._unit, item)) {
                    ExtraItemA16SCount++;
                }
            }
            
            return ExtraItemA16SCount;
        },
        
        getSelectExtraItemA16S: function() {
            return this._itemListWindow.getCurrentItem();
        },
        
        _getWindowInterval: function() {
            return 10;
        },
        
        _setExtraItemA16SFormation: function() {
            var count = this.getExtraItemA16SCount();
            var visibleCount = 8;
            
            if (count > visibleCount) {
                count = visibleCount;
            }
            
            this._itemListWindow.setItemFormation(count);
        },
        
        _setExtraItemA16Sbar: function(unit) {
            var i, item;
            var count = UnitItemControl.getPossessionItemCount(unit);
            var scrollbar = this._itemListWindow.getItemScrollbar();
            
            scrollbar.resetScrollData();
            
            for (i = 0; i < count; i++) {
                item = UnitItemControl.getItem(unit, i);
                if (this._isExtraItemA16SAllowed(unit, item)) {
                    scrollbar.objectSet(item);
                }
            }
            
            scrollbar.objectSetEnd();
        },
        
        _isExtraItemA16SAllowed: function(unit, item) {
            return ExtraItemA16SChecker.isExtraItemA16SUsableInternal(unit, item);
        }
    }
    );

// Check if Ep is enough
ItemControl._isEpEnough= function(unit, item) {
		
    // true if no ep stats
    if( typeof ParamType.MEP === 'undefined' ) {
        return true;
    }
    
    // true if the item does not specify ep
    if( item.custom.OT_EP == null ) {
        return true;
    }
    
    var unitEp = 0;
    if (typeof unit.custom.tmpNowEp === 'number') {
        unitEp = parseInt(unit.custom.tmpNowEp)
    }
    
    var unitMaxEp = 0;
    if (typeof unit.custom.tmpMaxEp === 'number') {
        unitMaxEp = parseInt(unit.custom.tmpMaxEp);
    }
    
    // Calculate ep consumption of items
    var itemEp = this._getValueForExtraItemA16S( item.custom.OT_EP.Use, unitMaxEp );
    
    if(itemEp > 0) {
        if(typeof unit.custom.tmpMoveEP === 'number') {
            itemEp += unit.custom.tmpMoveEP;
        }
    }
    
    // The condition is that the ep of the unit exceeds the ep consumption of the item.
    return unitEp >= itemEp;
}


// Check if Fp is enough
ItemControl._isFpEnough= function(unit, item) {
    
    // true if there are no Fp stats
    if( typeof ParamType.MFP === 'undefined' ) {
        return true;
    }
    
    // true if the item does not specify fp
    if( item.custom.OT_FP == null ) {
        return true;
    }
    
    var unitFp = 0;
    if (typeof unit.custom.tmpNowFp === 'number') {
        unitFp = parseInt(unit.custom.tmpNowFp)
    }
    
    var unitMaxFp = 0;
    if (typeof unit.custom.tmpMaxFp === 'number') {
        unitMaxFp = parseInt(unit.custom.tmpMaxFp);
    }
    
    // Calculate item consumption fp
    var itemFp = this._getValueForExtraItemA16S( item.custom.OT_FP.Use, unitMaxFp );
    
    if(itemFp > 0) {
        if(typeof unit.custom.tmpMoveFP === 'number') {
            itemFp += unit.custom.tmpMoveFP;
        }
    }
    
    // The condition is that the unit's fp exceeds the item's consumption fp
    return unitFp >= itemFp;
}


// Get the normalized value of Epfp
ItemControl._getValueForExtraItemA16S = function(value, valueMax)
{
if( value == null ) {
    return 0;
}

if (typeof value === 'number') {
    return parseInt(value);
}

var regex = /^([\-]*[0-9]+)\%$/;
var regexNum = /^([\-]*[0-9]+)$/;

if(value.match(regex)) {
    var percent = parseInt(RegExp.$1);
    var num = Math.floor( valueMax * (percent / 100) );

    return parseInt(num);
}
else if( value.match(regexNum) ) {
    return parseInt(value);
}

return 0;
}

})();