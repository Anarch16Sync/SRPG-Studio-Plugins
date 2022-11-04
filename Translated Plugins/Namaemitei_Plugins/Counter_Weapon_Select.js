
/*--------------------------------------------------------------------------
  
Script that allows weapon selection when counterattacking

■Overview
During the enemy turn, you will be able to select a weapon when counterattacking when attacked by an enemy.

If you set a custom skill with the keyword 'weapon_select' to the unit in question,
Only that unit will be able to select a weapon when counterattacking.
(In the initial state, only units with counterattack weapon selection skills can select weapons when counterattacking.)

However, in the following cases, the weapon selection window will not appear and processing will proceed as before.
1. It is set not to counterattack in the data setting
2. Don't have a weapon with a range that matches the enemy's weapon (including not having a weapon)
3. Enemy or yourself have a one-way weapon
4. You are in a bad state of incapacity/runaway/cannot use weapons

■ Customization
1. I want all my units to be able to select weapons when counterattacking.
　　　　The part of "var PlayrUnit_CounterWeaponSelectable = false;" in the settings
Please rewrite to "var PlayrUnit_CounterWeaponSelectable = true;".
*In this case, even if you do not have the custom skill described in the overview, your unit will be able to select a weapon when counterattacking.

2. I want to be able to choose not to fight back
If you set false to true for whether you can choose not to counterattack (var NoEquipWeaponEnable = false;) in the settings in this source,
　　When you are attacked by an enemy, the message "You can choose not to counterattack with the cancel key" will be displayed at the bottom of the weapon selection screen.

In that state, press the cancel key on the weapon selection screen → press the enter key on the battle result prediction screen.
"will not counterattack."
(If you don't counterattack, -- will be displayed on the battle result prediction screen for attacks and hits, so you'll know)



16/01/16 new
16/02/25 1.060 compatible
16/07/26 1.085 compatible
16/07/30 Added a setting that allows you to choose not to counterattack
16/10/21 Fixed a bug that caused an error when counterattacking if the enemy turn skip was performed.
17/11/29 1.164 compatible
17/12/05 Fixed an error that occurred when counterattacking due to a mistake in defining variables.
17/12/28 When setting the difficulty setting to disable counterattack and setting this plugin to allow weapon selection unconditionally
          Skill: Fixed a bug where units with counterattack could not select weapons
20/09/12 Corrected the description because the description was inconsistent even though the setting of this plug-in was "Possible if you have the counterattack weapon selection skill"


■ Correspondence version
　SRPG Studio Version: 1.164


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. It's free.
・There is no problem with processing. Please keep remodeling.
・ No credit stated OK
・ Redistribution, reprint OK
・Please comply with the SRPG Studio Terms of Use.
  
--------------------------------------------------------------------------*/


(function() {

//-----------------------------------
// setting
//-----------------------------------
// Can all my troops unconditionally select weapons when counterattacking? 
//(true: Weapon selection is possible unconditionally, false: Possible if you have counterattack weapon selection skill)
var PlayrUnit_CounterWeaponSelectable = true;

// Custom skill name for counterattack weapon selection
var WeaponSelectSkill = 'weapon_select';

// Can you choose not to fight back
// (true: you can choose not to fight back, false: impossible)
var NoEquipWeaponEnable = true;

//-----------------------------------




//-----------------------------------
// Below are definitions in the source code and code
//-----------------------------------
var WeaponAutoActionMode = {
	CURSORSHOW: 0,
	PREATTACK: 1,
	WEAPONSELECT: 3,
	DISPATTACKWINDOW: 4
};

var alias1 = WeaponAutoAction.setAutoActionInfo
WeaponAutoAction.setAutoActionInfo= function(unit, combination) {
		alias1.call(this, unit, combination);

		this._isNoEuipedWeapon = 0;

		this._weaponSelectMenu = createObject(EnemyTurnWeaponSelectMenu);
		this._posSelector = createObject(EnemyTurnPosSelector);

		// At the time the enemy attacks, the position coordinates of the enemy unit are not updated, and it is supposed to exist in the position before movement.
		// The enemy is actually at the point specified by combination.posIndex, so you need to get the X and Y coordinates with CurrentMap.getX(combination.posIndex) etc.
		this._enemyX = CurrentMap.getX(combination.posIndex);
		this._enemyY = CurrentMap.getY(combination.posIndex);

		if( this._isWeaponSelectable() ) {
			// Since it is processed by the enemy routine, this._targetUnit is the unit targeted by the enemy, unit is the enemy unit
			// this._enemyX, this._enemyY are actual enemy coordinates
			// this._weapon is the weapon used by the enemy (the enemy does not seem to be able to use UnitItemControl.getPossessionItemCount() or ItemControl.getEquippedWeapon())
			this._weaponSelectMenu.setMenuUnitAndTarget(this._targetUnit, unit, this._enemyX, this._enemyY, this._weapon );
		}
}


WeaponAutoAction.enterAutoAction= function() {
		var isSkipMode = this.isSkipMode();
		
		if (isSkipMode) {
			if( this._isWeaponSelectable() ) {
				this.changeCycleMode(WeaponAutoActionMode.WEAPONSELECT);
			}
			else {
				if (this._enterAttack() === EnterResult.NOTENTER) {
					return EnterResult.NOTENTER;
				}
				
				this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
			}
		}
		else {
			this._changeCursorShow();
			this.changeCycleMode(WeaponAutoActionMode.CURSORSHOW);
		}
		
		return EnterResult.OK;
}


var alias2 = WeaponAutoAction.moveAutoAction
WeaponAutoAction.moveAutoAction= function() {
		var result = MoveResult.CONTINUE;
		result = alias2.call(this);

		var mode = this.getCycleMode();
		if (mode === WeaponAutoActionMode.WEAPONSELECT) {
			result = this._moveWeaponSelect();
		}
		else if (mode === WeaponAutoActionMode.DISPATTACKWINDOW) {
			result = this._moveAttackWindow();
		}
		
		return result;
}


var alias3 = WeaponAutoAction.drawAutoAction
WeaponAutoAction.drawAutoAction= function() {
		alias3.call(this);

		var mode = this.getCycleMode();
		if (mode === WeaponAutoActionMode.WEAPONSELECT) {
			result = this._drawWeaponSelect();
		}
		else if (mode === WeaponAutoActionMode.DISPATTACKWINDOW) {
			result = this._drawAttackWindow();
		}
}


var alias4 = WeaponAutoAction.isSkipAllowed
WeaponAutoAction.isSkipAllowed= function() {
		if( alias4.call(this) === false ) {
			return false;
		}

		var mode = this.getCycleMode();
		if (mode === WeaponAutoActionMode.WEAPONSELECT) {
			return false;
		}
		else if (mode === WeaponAutoActionMode.DISPATTACKWINDOW) {
			return false;
		}
	
		return true;
}


WeaponAutoAction._moveCursorShow= function() {
		var isSkipMode = this.isSkipMode();
		
		if (isSkipMode || this._autoActionCursor.moveAutoActionCursor() !== MoveResult.CONTINUE) {
			if (isSkipMode) {
				this._autoActionCursor.endAutoActionCursor();
			}
			
			if (this._enterAttack() === EnterResult.NOTENTER) {
				return MoveResult.END;
			}
		
			if( this._isWeaponSelectable() ) {
				this.changeCycleMode(WeaponAutoActionMode.WEAPONSELECT);
			}
			else {
				this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
			}
		}
		
		return MoveResult.CONTINUE;
}


WeaponAutoAction._createAttackParam= function() {
		var attackParam = StructureBuilder.buildAttackParamFromCounterAttackSelect();
		
		attackParam.unit = this._unit;
		attackParam.targetUnit = this._targetUnit;
		attackParam.attackStartType = AttackStartType.NORMAL;

		attackParam.isNoEuipedWeapon = this._isNoEuipedWeapon;
		
		return attackParam;
}




//-------------------------------------
// BaseAttackInfoBuilder class
//-------------------------------------
var alias5 = BaseAttackInfoBuilder.createAttackInfo;
BaseAttackInfoBuilder.createAttackInfo= function(attackParam) {
		var attackInfo = alias5.call(this, attackParam);
		
		// Set to not counterattack
		if( typeof attackParam.isNoEuipedWeapon === 'number' && attackParam.isNoEuipedWeapon == 1 ) {
			attackInfo.isCounterattack = false;
		}
		return attackInfo;
}




//=====================================
// Additional functions from here
//=====================================

//-------------------------------------
// WeaponAutoAction class added function
//-------------------------------------

// Operations on the Weapon Selection Screen
WeaponAutoAction._moveWeaponSelect= function() {
		var weapon, filter, indexArray;
		var unit = this._targetUnit;
		var input = this._weaponSelectMenu.moveWindowManager();
		
		if (input === ScrollbarInput.SELECT) {
			weapon = this._weaponSelectMenu.getSelectWeapon();
			filter = FilterControl.getReverseFilter(this._targetUnit.getUnitType());
			
			// Equip selected item
			ItemControl.setEquippedWeapon(unit, weapon);
			
			indexArray = AttackChecker.getAttackIndexArray(unit, weapon, false);
			this._posSelector.setUnitOnly(unit, weapon, indexArray, PosMenuType.Attack, filter);
			this._posSelector._posMenu.changePosTarget(this._unit);
			
			// Since the weapon is selected, set the counterattack weapon available to the member variable
			this._isNoEuipedWeapon = 0;

			this.changeCycleMode(WeaponAutoActionMode.DISPATTACKWINDOW);
		}
		else if (NoEquipWeaponEnable == true && input === ScrollbarInput.CANCEL) {
			// We have not selected a weapon, so we set the weapon to null
			weapon = null;
			filter = FilterControl.getReverseFilter(this._targetUnit.getUnitType());
			
			indexArray = AttackChecker.getAttackIndexArray(unit, weapon, false);
			this._posSelector.setUnitOnly(unit, weapon, indexArray, PosMenuType.Attack, filter);
			this._posSelector._posMenu.changePosTarget(this._unit);
			
			// No weapon is selected, so no counterattack weapon is set as a member variable
			this._isNoEuipedWeapon = 1;

			this.changeCycleMode(WeaponAutoActionMode.DISPATTACKWINDOW);
		}
		
		return MoveResult.CONTINUE;
}


// Operation in the battle prediction display after weapon selection
WeaponAutoAction._moveAttackWindow= function() {
		var attackParam;
		var result = this._posSelector.movePosSelector();
		
		if (result === PosSelectorResult.SELECT) {
				this._posSelector.endPosSelector();
				
				attackParam = this._createAttackParam();
				
				this._preAttack = createObject(PreAttack);
				result = this._preAttack.enterPreAttackCycle(attackParam);
				if (result === EnterResult.NOTENTER) {
					return MoveResult.END;
				}
				
				this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
		}
		else if (result === PosSelectorResult.CANCEL) {
			this._posSelector.endPosSelector();
			this.changeCycleMode(WeaponAutoActionMode.WEAPONSELECT);
		}
		
		return MoveResult.CONTINUE;
}


// Weapon selection screen drawing process
WeaponAutoAction._drawWeaponSelect= function() {
		this._weaponSelectMenu.drawWindowManager();
}


// Drawing processing of battle prediction display after weapon decision
WeaponAutoAction._drawAttackWindow= function() {
		this._posSelector.drawPosSelector();
}


// Judgment of weapon selection when counterattacking
WeaponAutoAction._isWeaponSelectable= function() {

		// If the attacked unit is not your own army, you cannot select a weapon when counterattacking.
		if (this._targetUnit.getUnitType() !== UnitType.PLAYER) {
			return false;
		}
		// Counterattack weapon cannot be selected if the attacked unit is unable to act due to a bad state.
		if (StateControl.isBadStateOption(this._targetUnit, BadStateOption.NOACTION)) {
			return false;
		}

		// Counterattack weapon cannot be selected if the attacked unit is running out of control due to a bad state.
		if (StateControl.isBadStateOption(this._targetUnit, BadStateOption.BERSERK)) {
			return false;
		}

		// Is it possible to counterattack with the weapon of the attacked side? (No weapons, range does not match, enemy or attacked side is a one-way weapon, then counterattack is not possible)
		if (this._isCounterAttackable(this._targetUnit) === false) {
			return false;
		}

		// If it is not ``All of your troops can unconditionally select weapons when counterattacking'', you cannot counterattack unless you have the counterattack weapon selection skill.
		if( PlayrUnit_CounterWeaponSelectable === false ) {
			if( SkillControl.getPossessionCustomSkill(this._targetUnit, WeaponSelectSkill) === null ) {
				return false;
			}
		}

		return true;
}


// Determining whether the attacked side's weapon can counterattack
WeaponAutoAction._isCounterAttackable= function(targetUnit) {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(targetUnit);
		var weaponCount = 0;
		
		for (i = 0; i < count; i++) {
			item = targetUnit.getItem(i);
			// Returns true if the designated weapon possessed by the attacked side can counterattack.
			if (this._isWeaponAllowed(targetUnit, item)) {
				return true;
			}
		}
		
		return false;
}


// Determining whether the designated weapon possessed by the attacked side can counterattack
WeaponAutoAction._isWeaponAllowed= function(unit, item) {
		
		// If the attacked side cannot equip the designated weapon (if they have a weapon that cannot be equipped or cannot use the weapon due to the state), they cannot counterattack.
		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}
		
		// Check whether the range of the designated weapon matches, whether the enemy or the attacked side is a one-way weapon, etc.
		var result = AttackChecker.isCounterAttackableWeapon(this._weapon, this._enemyX, this._enemyY, unit, item, this._targetUnit);
		return result;
}




//-------------------------------------
// StructureBuilder (add new function)
//-------------------------------------
StructureBuilder.buildAttackParamFromCounterAttackSelect= function() {
		return {
			unit: null,
			targetUnit: null,
			attackStartType: 0,
			forceBattleObject: null,
			fusionAttackData: null,
			isNoEuipedWeapon: 0
		};
}




//-------------------------------------
// AttackChecker (new function added)
//-------------------------------------
// Check if counterUnit can counterattack with counterWeapon
// (enemyWeapon: enemy's weapon, unitx: enemy's X coordinate, unity: enemy's Y coordinate. Since the enemy's weapon and coordinates cannot be obtained from the enemy unit, they are handed over from above)
AttackChecker.isCounterAttackableWeapon= function(enemyWeapon, unitx, unity, counterUnit, counterWeapon, enemyUnit) {
		var indexArray;
		
		if (!Calculator.isCounterattackAllowed(enemyUnit, counterUnit)) {
			return false;
		}
		
		if (enemyWeapon !== null && enemyWeapon.isOneSide()) {
			// If the enemy is equipped with a "one-way" weapon, no counterattack will occur
			return false;
		}
		
		// If you do not have a counterattack weapon, you cannot counterattack.
		if (counterWeapon === null) {
			return false;
		}
		
		// "One-way" weapons cannot counterattack
		if (counterWeapon.isOneSide()) {
			return false;
		}
		
		indexArray = IndexArray.createIndexArray(counterUnit.getMapX(), counterUnit.getMapY(), counterWeapon);
		
		// Check if the attacking side's coordinates can be attacked with the counterattacking side's weapon.
		var result = IndexArray.findPos(indexArray, unitx, unity);
		return result;
};




//-------------------------------------
// EnemyTurnWeaponSelectMenu class
//-------------------------------------
var EnemyTurnWeaponSelectMenu = defineObject(WeaponSelectMenu,
{
	_enemyUnit: null,	// enemy unit
	_enemyX: 0,			// x coordinate of the enemy unit
	_enemyY: 0,			// y coordinate of the enemy unit
	_weapon:null,		// Enemy Unit Weapons
	_noEquipMessageWindow:null,	// Message display window (for messages that can choose no counterattack)

	setMenuUnitAndTarget: function(unit, enemyUnit, enemyX, enemyY, enemyWeapon) {
		this._enemyUnit = enemyUnit;
		this._enemyX = enemyX;
		this._enemyY = enemyY;
		this._weapon = enemyWeapon;
		this.setMenuTarget(unit);

		if( NoEquipWeaponEnable == true ) {
			this._noEquipMessageWindow = createWindowObject(NoEquipMessageWindow, this); 
		}
	},
	
	drawWindowManager: function() {
		WeaponSelectMenu.drawWindowManager.call(this);

		var x = this.getPositionWindowX();
		var y = this.getPositionWindowY();
		var height = this._itemListWindow.getWindowHeight() + this._itemInfoWindow.getWindowHeight();
		
		if( NoEquipWeaponEnable == true ) {
			this._noEquipMessageWindow.drawWindow(x, y + height + this._getWindowInterval() * 2);
		}
	},
	
	_isWeaponAllowed: function(unit, item) {
		
		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}
		
		var result = AttackChecker.isCounterAttackableWeapon(this._weapon, this._enemyX, this._enemyY, unit, item, this._enemyUnit);
		return result;
	}
}
);




//-------------------------------------
// EnemyTurnPosSelector class
//-------------------------------------
// PosSelector used in enemy turn
var EnemyTurnPosSelector = defineObject(PosSelector,
{
	// Since it is a weapon selection when counterattacking, chip lighting by cursor selection is not performed.
	setUnitOnly: function(unit, item, indexArray, type, filter) {
		this._unit = unit;
		this._indexArray = indexArray;
		this._filter = filter;
//		MapLayer.getMapChipLight().setIndexArray(indexArray);
		this._setPosMenu(unit, item, type);
		this._posCursor = createObject(this._getObjectFromType(this._selectorType));
		this._posCursor.setParentSelector(this);
	},
	
	// Since it is a weapon selection at the time of counterattack, the attack target has been confirmed. Therefore, I try not to call this.pos cursor.check cursor() inside the move pos selector.
	movePosSelector: function() {
		var result = PosSelectorResult.NONE;
		
		if (InputControl.isSelectAction()) {
			this._playSelectSound();
			result = PosSelectorResult.SELECT;
		}
		else if (InputControl.isCancelAction()) {
			this._playCancelSound();
			result = PosSelectorResult.CANCEL;
		}
//		else {
//			this._posCursor.checkCursor();
//		}
		
		return result;
	},
	
	// Weapon selection at the time of counterattack does not draw the cursor because there is no need to select a target.
	drawPosSelector: function() {
		if (this._posCursor === null) {
			return;
		}
		
//		this._posCursor.drawCursor();
		this._posMenu.drawWindowManager();
	}
}
);




//-------------------------------------
// NoEquipMessageWindow Class
//-------------------------------------
// "You can choose not to counterattack with the cancel key" display window
var NoEquipMessageWindow = defineObject(BaseWindow,
{
	drawWindowContent: function(x, y) {
		var font;
		var textui = this.getWindowTitleTextUI();

		if (textui === null) {
			return;
		}
		font = textui.getFont();

		TextRenderer.drawText(x, y,'Press Cancel to not attack the enemy', -1, ColorValue.DEFAULT, font);
	},
	
	getWindowTitleTextUI: function() {
		return root.queryTextUI('infowindow_title');
	},
	
	getWindowWidth: function() {
		return 280;
	},
	
	getWindowHeight: function() {
		return 46;
	}
}
);


})();