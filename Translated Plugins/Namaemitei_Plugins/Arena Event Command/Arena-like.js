
/*--------------------------------------------------------------------------
The Arena-like.

■ Overview.
　By using Execute Script Event Command, after setting information in the specified variables in advance(*), with the type Call Event Command
　and Object Name: BattlingAttackCommand. Two specific units can engage in combat for a certain number of turns.

Command name: BattlingAttackCommand

If you want to temporarily change the combat turn in the arena from the settings in this source, in addition to the above commands, you can also
In the text box at the bottom, use the following format.
 {
    nowBattleTurn : XX 
 }
Where XX is  the number of battle turns in the arena.
Use this in exceptional cases when you want the player to fight with a different number of turns from the setting in this source

　(*) Information that must be set in variables.
　　　　1. Player unit's ID participating in the arena (BattlingUnit_ID)
　　　　2. Enemy unit's ID fighting in the arena (BattlingTarget_ID)
　　　　3. Variable to store the results of the arena (BattlingResult_ID) ← The results of the battle will be stored, so simply set the variable ID to be used in advance.

　　　　　Initially, the variable ID to be used is set as follows.
　　　　　var BattlingUnit_ID = 0; // Variable ID to store the ID of the own unit participating in the arena
　　　　　var BattlingTarget_ID = 1; // variable ID to store the enemy unit ID in the arena
　　　　　var BattlingResult_ID = 2; // variable ID to store the result of the arena
　　　　　(The variables used should have a minimum value of 0 and a maximum value of 9999999 in the variable settings. Otherwise it will not work properly)

　　　　　The variables are specified on page 6 (ID Variables).
　　　　　var Battling_ID_PAGE = Battling_VATablePAGE_ID; // page of variables to use (use the page for ID Variables)

■ Customisation.
　1. to change the number of combat turns in the arena
　　　Change the number of arena battle turns (var BattlingTurn = 5;) in the settings in this source.
　　　However, the value must not be less than 1.

　2. I want to make weapons break in the arena.
　　　Infinite weapons in the arena in the settings in this source? （Change true in (var isBattlingWeaponInfinity = true;) to false.

　3. To enable terrain effects in the arena
　　　Are there terrain effects in the arena in the settings in this source? (var isBattlingTerrainOn = false;) Change false to true.
　　　*Note that the squares where enemies are placed in the arena and your troops in the arena squares will be subject to evasion, defence and magic defence corrections due to terrain.

■Specifications.
　1. this script only performs the combat part.
　　　The setting of the own unit IDs and enemy unit IDs to variables that should be done in advance, and the
　　　The collection of money for participation and rewards after the defeat of an enemy (including processing on death or a draw) must be assembled by yourself, e.g. using the engine Place Events.

　　　In addition, the battle background in the arena will use the one set in the map chip, and the battle music will remain the same.
　　　(If you want to change the song, specify the song for the enemy unit during combat, for example.)

　2. In the arena, the compensation value due to support is ignored.

　　　Also, if isBattlingTerrainOn is false, terrain effects (modifications to evasion rate, defence and magic defence due to terrain) are ignored.
　　　(However, when terrain effects are ignored, HitCalculator.calculateHit() and DamageCalculator.calculateDamage() are not called in the arena.
　　　　If you have modified these two functions yourself, the hit and evade rates may not be calculated correctly in the arena.
　　　　(In this case, set isBattlingTerrainOn to true and make sure that the arena squares and the squares where you place enemies have no terrain effects at all.)

　　　In addition, triangle attack-like items are unchecked.
　　　If you introduce such a skill and then place your army units so that they surround the enemy in the arena, it will probably have an effect.

　3. own army units fight using their equipped weapons.
　　　Note that even if the durability of a weapon reaches 0 during the course of the battle, it will attack normally as it is, and will be broken at the end of the arena.
　　　(Weapons of enemy units are not broken.)

　4. attacks start from the own side.

　5. skills such as instant kill and must-hit are not currently prohibited, so they will be triggered normally.
　　　(Preemptive attacks should also be triggered if the enemy has them.)
　　　However, attack sealing is not performed. Or rather, if it is sealed, it will not be in the arena.

　6.If you defeat an enemy, you will gain experience. If you fail to defeat the enemy, you will not get it.

　7. If you press the Cancel key during a battle, a give-up confirmation screen will appear, and if you choose Yes, you can give up during the battle.
　　　(If give-up is selected, the attack at that point is carried out and then the player gives up.
　　　　(If your unit is about to die, give up early.)


■ Remarks.
　For detailed instructions on how to use the system, please check the settings in the included project.



Modifications
16/08/06 Newly created
16/08/07 1.087 support
16/08/09 Add give-up functionality
16/08/25 Modified description for linkage with location event_No waiting when entering arena without weapon.js
16/08/28 Added a process to remove all enemy states at the end of the arena, before enemy HP is recovered (to prevent some states remaining on the arena enemies).
16/09/04 Support for displaying suicide attacks with atackwindow_plus.js and attackwindow suicide attack display.js
17/03/05 Fixed a bug that caused an error drop when a variable was incorrectly set for arena participating unit IDs and for arena enemy unit IDs.
17/06/05 1.130 support
17/06/11 1.131 supported
17/10/08 1.157 support
17/11/03 Battle background changed to be obtained based on the attacker's position.
18/02/25 1.176 Supported
19/06/13 Support for use with plug-ins displaying advantage/disadvantage status
20/03/11 1.209 supported
20/09/11 Fixed a bug that sometimes caused an error when entering a battle in the arena due to insufficient setting parameters when used in conjunction with other plug-ins.


Version supported.
　SRPG Studio Version:1.217



■Terms and Conditions.
Use is limited to games that use SRPG Studio.
Commercial and non-commercial use is not required. Free of charge.
No problem with modification, etc. Please modify it as much as you like.
No credits OK.
Redistribution and reprinting OK
Wiki-Posting OK
The SRPG Studio Terms of Use must be observed.


--------------------------------------------------------------------------*/




//==================================
// Variables and defined values that are also used externally
//==================================

//----------------------------------
// Defined values for specifying variables to be used
//----------------------------------

//Defined value for the page reference of the variable
var Battling_VATablePAGE1 = 0; // defined value of variable page 1
var Battling_VATablePAGE2 = 1; // defined value of variable page 2
var Battling_VATablePAGE3 = 2; // defined value of variable page 3
var Battling_VATablePAGE4 = 3; // defined value of variable page 4
var Battling_VATablePAGE5 = 4; // defined value of variable page 5
var Battling_VATablePAGE_ID = 5; // defined value of variable page ID Variable


//----------------------------------
// Setting variables
//----------------------------------

var Battling_ID_PAGE = Battling_VATablePAGE_ID;	// Page of variables to use (use page 3).

//Variable ID to be used
var BattlingUnit_ID      = 0;		// Variable ID to store the ID of the own unit participating in the arena.
var BattlingTarget_ID    = 1;		// Variable ID for storing enemy unit IDs in the arena
var BattlingResult_ID    = 2;		// Variable ID to store arena results (0: no battle*, 1: Player wins, 2: enemy wins, 3: draw, 4: both dead, 5: give-up).
									// *Indicates that the combat did not occur, e.g. an attempt was made to fight with a unit that did not have a weapon.


// arena result (definition of the value set to the variable that stores the arena result after a BattlingAttackCommand call).
// Note: Changing this value will change the value of the result and the event side processing will also have to be changed. Try not to touch it.
var BattlingResult_NoBattle = 0; 		// Result of the arena: no battle
var BattlingResult_WinPlayer = 1; 		// arena result: player wins
var BattlingResult_WinEnemy = 2; 		// arena result: enemy win
var BattlingResult_Draw = 3; 			// Result of the arena: draw (both survived)
var BattlingResult_DoubleKO = 4; 		// arena result: both dead
var BattlingResult_GiveUp = 5; 			// arena result: give-up




//==================================
// Variables and defined values used internally.
//==================================
(function() {

//----------------------------------
// setup
//----------------------------------

var BattlingTurn             = 5;		// Number of combat turns in the arena (initially 5 turns)
var isBattlingWeaponInfinity = true;	// Infinite weapons in the arena? (true: infinite, false: not infinite)
var isBattlingTerrainOn      = false;	// Are there terrain effects in the arena? (true: terrain effect present, false: no terrain effect present)
var GiveUpText      = 'Do you want to quit?';	// Confirmation message text as to whether it is a give-up or not.




//----------------------------------
// Source below.
//----------------------------------


//-------------------------------------------
// HitCalculator class
//-------------------------------------------
// Hit rate calculation for the arena (called when isBattlingTerrainOn is false).
HitCalculator.calculateBattlingHit= function(active, passive, weapon, activeTotalStatus, passiveTotalStatus) {
		var hit, avoid, percent;
		
		if (root.isAbsoluteHit()) {
			if (passive.isImmortal()) {
				// If the opponent is immortal, the hit rate is not 100%.
				return 99;
			}
			return 100;
		}
		
		hit = this.calculateSingleHit(active, passive, weapon, activeTotalStatus);
		// Find the avoidance rate ignoring the avoidance rate modification due to terrain.
		avoid = this.calculateBattlingAvoid(active, passive, weapon, passiveTotalStatus);
		
		percent = hit - avoid;
		
		return this.validValue(active, passive, weapon, percent);
}



// Calculation of evasion values for the arena (ignoring evasion rate modifications due to terrain).
HitCalculator.calculateBattlingAvoid= function(active, passive, weapon, totalStatus) {
		var terrain;
		var avoid = AbilityCalculator.getAvoid(passive) + CompatibleCalculator.getAvoid(passive, active, ItemControl.getEquippedWeapon(passive)) + SupportCalculator.getAvoid(totalStatus);
		
		// Exclude corrections to evasion rate due to terrain effects
		if (passive.getClass().getClassType().isTerrainBonusEnabled()) {
			// If the attacker takes terrain effects into account, the terrain modifier to evasion rate is nullified (minus the already added amount to remove the effect).
			terrain = PosChecker.getTerrainFromPos(passive.getMapX(), passive.getMapY());
			if (terrain !== null) {
				avoid -= terrain.getAvoid();
			}
		}
		
		return avoid;
	},




//-------------------------------------------
// DamageCalculator class
//-------------------------------------------
// Damage calculation for the arena (called when isBattlingTerrainOn is false).
DamageCalculator.calculateBattlingDamage= function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
		var pow, def, damage;
		
		if (this.isHpMinimum(active, passive, weapon, isCritical, trueHitValue)) {
			return -1;
		}
		
		pow = this.calculateAttackPower(active, passive, weapon, isCritical, activeTotalStatus, trueHitValue);
		// Find defensive (magical) strength ignoring defensive (magical) strength modification due to terrain effects.
		def = this.calculateBattlingDefense(active, passive, weapon, isCritical, passiveTotalStatus, trueHitValue);
		
		damage = pow - def;
		if (this.isHalveAttack(active, passive, weapon, isCritical, trueHitValue)) {
			if (!this.isHalveAttackBreak(active, passive, weapon, isCritical, trueHitValue)) {
				damage = Math.floor(damage / 2);
			}
		}
		
		if (this.isCritical(active, passive, weapon, isCritical, trueHitValue)) {
			damage = Math.floor(damage * this.getCriticalFactor());
		}
		
		return this.validValue(active, passive, weapon, damage);
}


// Calculation of defences ignoring defences (magic defences) due to terrain effects.
DamageCalculator.calculateBattlingDefense= function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
		var def;
		
		if (this.isNoGuard(active, passive, weapon, isCritical, trueHitValue)) {
			return 0;
		}
		
		if (Miscellaneous.isPhysicsBattle(weapon)) {
			// Physical or projectile attacks
			def = ParamBonus.getDef(passive);	// Defensive strength of the unit (including bonuses). Does not take terrain into account.
		}
		else {
			// magical attack
			def = ParamBonus.getMdf(passive);	// Unit's magical defence strength (including bonuses). Does not take terrain into account.
		}
		
		def += CompatibleCalculator.getDefense(passive, active, ItemControl.getEquippedWeapon(passive)) + SupportCalculator.getDefense(totalStatus);
		
		return def;
}




//-------------------------------------------
// ScriptExecuteEventCommand class.
//-------------------------------------------
var alias1 = ScriptExecuteEventCommand._configureOriginalEventCommand;
ScriptExecuteEventCommand._configureOriginalEventCommand = function(groupArray) {
	alias1.call(this, groupArray);
	
	// Add BattlingAttackCommand.
	groupArray.appendObject(BattlingAttackCommand);
};




//-------------------------------------------
// VATableControlForBattling class
//-------------------------------------------
var VATableControlForBattling = {

	// Setting of designated variables
	setVATable: function(tablepage, tableid, value) {
		var table = root.getMetaSession().getVariableTable(tablepage);
		var index = table.getVariableIndexFromId(tableid);
		table.setVariable(index, value);
	},
	
	// Obtaining specified variables
	getVATable: function(tablepage, tableid) {
		var table = root.getMetaSession().getVariableTable(tablepage);
		var index = table.getVariableIndexFromId(tableid);
		return table.getVariable(index);
	}
};




//-------------------------------------------
// class
//-------------------------------------------
// Event command to invoke the arena process.
BattlingAttackCommand = defineObject(ForceBattleEventCommand,
{
	enterEventCommandCycle: function() {
		this._prepareEventCommandMemberData();
		
		if (!this._checkEventCommand()) {
			return EnterResult.NOTENTER;
		}
		
		return this._completeEventCommandMemberData();
	},
	
	moveEventCommandCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === ForceBattleMode.BATTLE) {
			result = this._moveBattle();
		}
		
		return result;
	},
	
	drawEventCommandCycle: function() {
		var mode = this.getCycleMode();
		
		if (mode === ForceBattleMode.BATTLE) {
			this._drawBattle();
		}
	},
	
	getEventCommandName: function() {
		return 'BattlingAttackCommand';
	},
	
	getEventCommmandName: function() {
		return 'BattlingAttackCommand';
	},
	
	_prepareEventCommandMemberData: function() {
		this._unitSrc = this._getBattlePlayer();
		this._unitDest = this._getBattleTarget();
		this._preAttack = createObject(BattlingPreAttack);
		this._lockonCursor = createObject(LockonCursor);
	},
	
	_checkEventCommand: function() {
		var attackParam, result;
		
		if (!this._isAttackAllowed(this._unitSrc, this._unitDest)) {

			// Hide the opponent in the arena (if you don't hide them, they will apparently remain where they appeared even if you erase them).
			if( this._unitSrc != null && this._unitSrc.getUnitType() == UnitType.ENEMY ) {
				this._unitSrc.setInvisible(true);
			}
			if( this._unitDest != null && this._unitDest.getUnitType() == UnitType.ENEMY ) {
				this._unitDest.setInvisible(true);
			}

			return false;
		}
		
		// Before entering combat, clear any messages that may already be displayed.
		EventCommandManager.eraseMessage(MessageEraseFlag.ALL);
		
		attackParam = this._createAttackParam();
		result = this._preAttack.enterPreAttackCycle(attackParam);
		if (result === EnterResult.NOTENTER) {
			// If pre-combat processing could not be set up, return false to avoid entering cycles.
			return false;
		}
		this._isBattleOnly = true;
		
		return true;
	},
	
	_createAttackParam: function() {
		var attackParam = StructureBuilder.buildBattlingAttackParam();
		
		attackParam.unit = this._unitSrc;
		attackParam.targetUnit = this._unitDest;
		attackParam.attackStartType = AttackStartType.NORMAL;

		attackParam.battleTurn = BattlingTurn;		// Number of combat turns in the arena (insert set value).
		
		// If {nowBattleTurn:XX} (XX: number) is present in JSON when the script is executed and is greater than 0, it is applied as the number of battle turns in this arena.
		var arg = root.getEventCommandObject().getEventCommandArgument();
		if (typeof arg.nowBattleTurn === 'number' && arg.nowBattleTurn > 0) {
			attackParam.battleTurn = arg.nowBattleTurn;
		}

		return attackParam;
	},
	
	_getBattlePlayer: function() {
		var unit;
		var i;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		var battling_unit_id = VATableControlForBattling.getVATable(Battling_ID_PAGE, BattlingUnit_ID);
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit.getId() == battling_unit_id) {
				return unit;
			}
		}
		
		return null;
	},
	
	_getBattleTarget: function() {
		var unit;
		var i;
		var list           = EnemyList.getMainList();
		var count          = list.getCount();
		var target_unit_id = VATableControlForBattling.getVATable(Battling_ID_PAGE, BattlingTarget_ID);
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit.getId() == target_unit_id) {
				return unit;
			}
		}
		
		return null;
	},
	
	_isAttackAllowed: function(unitSrc, unitDest) {
		if (unitSrc === null || unitDest === null) {
			if (unitSrc === null) {
				root.log('Error: Player unit is null. ID:'+VATableControlForBattling.getVATable(Battling_ID_PAGE, BattlingUnit_ID));
			}

			if (unitDest === null) {
				root.log('Error: Enemy Unit is null. ID:'+VATableControlForBattling.getVATable(Battling_ID_PAGE, BattlingTarget_ID));
			}
			// Arena results: set up no battles.
			VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_NoBattle);
			return false;
		}
		
		// If the attacker is not equipped with an item, he does not initiate combat.
		if (ItemControl.getEquippedWeapon(unitSrc) === null) {
			// Arena results: set up no battles.
			VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_NoBattle);
			return false;
		}
		
		// If the attacker and the attacked are identical, do not initiate combat.
		if (unitSrc === unitDest) {
			root.log('Error: same unit.');
			// Arena results: set up no battles.
			VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_NoBattle);
			return false;
		}
		
		// If a unit is dead, it does not initiate combat.
		if (unitSrc.getAliveState() !== AliveType.ALIVE || unitDest.getAliveState() !== AliveType.ALIVE) {
			root.log('Error: unit is dead.');
			// Arena results: set up no battles.
			VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_NoBattle);
			return false;
		}
		
		return true;
	}
}
);




//-------------------------------------------
// BattlingPreAttack class
//-------------------------------------------
// PreAttack for the arena.
var BattlingPreAttack = defineObject(PreAttack,
{
	_prepareMemberData: function(attackParam) {
		this._attackParam = attackParam;
		this._coreAttack = createObject(BattlingCoreAttack);
		this._startStraightFlow = createObject(StraightFlow);
		this._endStraightFlow = createObject(StraightFlow);
		
		AttackControl.setPreAttackObject(this);
		BattlerChecker.setUnit(attackParam.unit, attackParam.targetUnit);
	},
	
	_completeMemberData: function(attackParam) {
		this._doStartAction();
		
		this._startStraightFlow.enterStraightFlow();
		this.changeCycleMode(PreAttackMode.START);
		
		return EnterResult.OK;
	},
	
	_doEndAction: function() {
		if (this._attackParam.fusionAttackData !== null) {
			FusionControl.endFusionAttack(this._attackParam.unit);
		}
		
		// Full HP of enemies in the arena.
		var unit = this._attackParam.targetUnit;
		StateControl.arrangeState(unit, null, IncreaseType.ALLRELEASE);		// State Release.
		unit.setAliveState(AliveType.ALIVE);
		unit.setHp(ParamBonus.getMhp(this._attackParam.targetUnit));		// Full HP

		// Repair enemy weapons in the arena.
		var weapon = ItemControl.getEquippedWeapon(unit);
		weapon.setLimit(weapon.getLimitMax());

		AttackControl.setPreAttackObject(null);
	},
	
	_pushFlowEntriesEnd: function(straightFlow) {
		// LoserMessageFlowEntry checks for death events.
		// This check is also performed by CoreAttack's UnitDeathFlowEntry, but
		// CoreAttack's confirmation is skippable, and therefore
		// It can happen that a unit dies and nothing is displayed.
		// To prevent this, a LoserMessageFlowEntry is provided.
		straightFlow.pushFlowEntry(LoserMessageFlowEntry);
		
		// WeaponValidFlowEntry must precede DropFlowEntry.
		straightFlow.pushFlowEntry(BattlingWeaponValidFlowEntry);

		// No dropped goods or fusion attacks are allowed in the arena.
// straightFlow.pushFlowEntry(DropFlowEntry);
// straightFlow.pushFlowEntry(ImportantItemFlowEntry);
// straightFlow.pushFlowEntry(ReleaseFusionFlowEntry);
// straightFlow.pushFlowEntry(CatchFusionFlowEntry);
	}
}
);




//-------------------------------------------
// BatlingWeaponValidFlowEntry class
//-------------------------------------------
var BattlingWeaponValidFlowEntry = defineObject(WeaponValidFlowEntry,
{
	_checkDelete: function(unit) {
		// Weapons are not damaged if the enemy is in the arena.
		if( unit.getUnitType() === UnitType.ENEMY ) {
			return;
		}
		
		// WeaponValidFlowEntry._checkDelete() process thereafter.
		WeaponValidFlowEntry._checkDelete.call(this, unit);
	}
}
);




//-------------------------------------------
// BattlingCoreAttack class
//-------------------------------------------
// CoreAttack for the arena.
var BattlingCoreAttack = defineObject(CoreAttack,
{
	moveCoreAttackCycle: function() {
			return this._battleObject.moveBattleCycle();
	},
	
	backCoreAttackCycle: function() {
		if (root.getEventCommandType() !== EventCommandType.FORCEBATTLE) {
			this._createBattleObject();
			this._battleObject.backBattleCycle();
		}
	},
	
	isRealBattle: function() {
		return true;
	},
	
	_prepareMemberData: function(attackParam) {
		this._attackParam = attackParam;
		this._battleType = 0;
		this._isUnitLostEventShown = false;
		this._attackFlow = createObject(BattingAttackFlow);
		this._battleObject = null;
	},
	
	_completeMemberData: function(attackParam) {
		var result = EnterResult.CONTINUE;
		
		this._checkAttack(attackParam);
		
		this._playAttackStartSound();
		this._battleObject.openBattleCycle(this);
		
		return result;
	},
	
	_startNormalAttack: function() {
		var infoBuilder = createObject(BattlingAttackInfoBuilder);
		var orderBuilder = createObject(BattlingAttackOrderBuilder);
		var attackInfo = infoBuilder.createAttackInfo(this._attackParam);
		var attackOrder = orderBuilder.createAttackOrder(attackInfo);
		
		return this._startCommonAttack(attackInfo, attackOrder);
	},
	
	_setBattleTypeAndObject: function(attackInfo, attackOrder) {
		this._battleType = BattleType.REAL;
		this._createBattleObject();
	},
	
	// Generating objects for combat
	_createBattleObject: function() {
		// Generating objects for arena combat.
		if( this._battleObject == null ) {
			this._battleObject = createObject(BattlingBattle);
		}
	}
}
);




//-------------------------------------------
// BattlingAttackInfoBuilder class.
//-------------------------------------------
// AttackInfoBuilder for the arena.
var BattlingAttackInfoBuilder = defineObject(NormalAttackInfoBuilder,
{
	createAttackInfo: function(attackParam) {
		var attackInfo = NormalAttackInfoBuilder.createAttackInfo.call(this, attackParam);
		
		var battlingAttackInfo = StructureBuilder.buildBattlingAttackInfo();
		
		// In the arena, the terrain (and battle background) is obtained based on the position of the attacker's units
		var terrain = PosChecker.getTerrainFromPosEx(attackInfo.unitSrc.getMapX(), attackInfo.unitSrc.getMapY());
		var terrainLayer = PosChecker.getTerrainFromPos(attackInfo.unitSrc.getMapX(), attackInfo.unitSrc.getMapY());
		
		battlingAttackInfo.unitSrc             = attackInfo.unitSrc;
		battlingAttackInfo.unitDest            = attackInfo.unitDest;
		battlingAttackInfo.terrain             = terrain;
		battlingAttackInfo.terrainLayer        = terrainLayer;
//		battlingAttackInfo.battleType          = attackInfo.battleType;
//		battlingAttackInfo.attackStartType     = attackInfo.attackStartType;
		battlingAttackInfo.isExperienceEnabled = attackInfo.isExperienceEnabled;
		battlingAttackInfo.isDirectAttack      = true;
		battlingAttackInfo.isCounterattack     = true;
		battlingAttackInfo.isPosBaseAttack     = attackInfo.isPosBaseAttack;
		battlingAttackInfo.picBackground       = this._getBackgroundImage(attackParam, terrain, terrainLayer);

		this._setMagicWeaponAttackData(battlingAttackInfo);

		battlingAttackInfo.battleTurn          = attackParam.battleTurn;
		return battlingAttackInfo;
	}
}
);




//-------------------------------------------
// StructureBuilder class
//-------------------------------------------
StructureBuilder.buildBattlingAttackInfo= function() {
		return {
			unitSrc: null,
			unitDest: null,
			terrain: null,
			terrainLayer: null,
			battleType: BattleType.REAL,
			attackStartType: AttackStartType.NORMAL,
			isExperienceEnabled: false,
			isDirectAttack: false,
			isMagicWeaponAttackSrc: false,
			isMagicWeaponAttackDest: false,
			isCounterattack: false,
			isPosBaseAttack: false,
			picBackground: null,
			battleTurn: 1
		};
}


StructureBuilder.buildBattlingAttackParam= function() {
		return {
			unit: null,
			targetUnit: null,
			attackStartType: 0,
			forceBattleObject: null,
			fusionAttackData: null,
			battleTurn: 1
		};
}




//-------------------------------------------
// BattlingAttackOrderBuilder class
//-------------------------------------------
// AttackOrderBuilder for the arena.
var BattlingAttackOrderBuilder = defineObject(NormalAttackOrderBuilder,
{
	// Combat simulation for the arena.
	_startVirtualAttack: function() {
		var i, j, isFinal, attackCount, src, dest;
		var virtualActive, virtualPassive, isDefaultPriority;
		var unitSrc = this._attackInfo.unitSrc;
		var unitDest = this._attackInfo.unitDest;
		var turn_cnt;
		var battle_turn = this._attackInfo.battleTurn;
		
		// Repeat for the turn specified by battle_turn or until one of them dies.
		for (turn_cnt = 0;turn_cnt < battle_turn; turn_cnt++) {
			if( turn_cnt == 0 ) {
				src = VirtualAttackControl.createVirtualBattlingAttackUnit(unitSrc, unitDest, true, this._attackInfo);
				dest = VirtualAttackControl.createVirtualBattlingAttackUnit(unitDest, unitSrc, false, this._attackInfo);
			}
			else {
				VirtualAttackControl.updateVirtualBattlingAttackUnit(unitSrc, unitDest, src);
				VirtualAttackControl.updateVirtualBattlingAttackUnit(unitDest, unitSrc, dest);
			}
			
			src.isWeaponLimitless = DamageCalculator.isWeaponLimitless(unitSrc, unitDest, src.weapon);
			dest.isWeaponLimitless = DamageCalculator.isWeaponLimitless(unitDest, unitSrc, dest.weapon);

			// If the arena is set up to have unlimited weapons, weapons should not be reduced
			if( isBattlingWeaponInfinity == true ) {
				src.isWeaponLimitless  = true;
				dest.isWeaponLimitless = true;
			}
			
			isDefaultPriority = this._isDefaultPriority(src, dest);
			if (isDefaultPriority) {
				src.isInitiative = true;
			}
			else {
				dest.isInitiative = true;
			}
		
			for (i = 0;; i++) {
				// if and else statements are executed alternately.
				// This causes the order to change so that after we attack, the opponent attacks.
				if ((i % 2) === 0) {
					if (isDefaultPriority) {
						virtualActive = src;
						virtualPassive = dest;
					}
					else {
						virtualActive = dest;
						virtualPassive = src;
					}
				}
				else {
					if (isDefaultPriority) {
						virtualActive = dest;
						virtualPassive = src;
					}
					else {
						virtualActive = src;
						virtualPassive = dest;
					}
				}
				
				// Are there any action counts left?
				if (VirtualAttackControl.isRound(virtualActive)) {
					VirtualAttackControl.decreaseRoundCount(virtualActive);
					
					attackCount = this._getAttackCount(virtualActive, virtualPassive);
				
					// Loop treatment, as they may attack twice in a row.
					for (j = 0; j < attackCount; j++) {
						isFinal = this._setDamage(virtualActive, virtualPassive);
						if (isFinal) {
							// Unit has died and will not continue fighting any longer.
							virtualActive.roundCount = 0;
							virtualPassive.roundCount = 0;
							break;
						}
					}
				}
				
				if (virtualActive.roundCount === 0 && virtualPassive.roundCount === 0) {
					break;
				}
			}

			if (isFinal) {
				// Unit has died and will not continue fighting any longer.
				break;
			}
		}
		
		this._endVirtualAttack(src, dest);
	},
	
	_endVirtualAttack: function(virtualActive, virtualPassive) {
		var exp = this._calculateExperience(virtualActive, virtualPassive);
		var waitIdSrc = MotionIdControl.getWaitId(virtualActive.unitSelf, virtualActive.weapon);
		var waitIdDest = MotionIdControl.getWaitId(virtualPassive.unitSelf, virtualPassive.weapon);
		
		this._order.registerExp(exp);
		this._order.registerBaseInfo(this._attackInfo, waitIdSrc, waitIdDest);

		// Set combat results.
		this._setBattlingResult(virtualActive, virtualPassive);
	},
	
	_isAttackContinue: function(virtualActive, virtualPassive) {
		// Even if the weapon's durability reaches 0, it can still be attacked in the arena.
		// Nor can they seal the attack.
		return true;
	},
	
	_calculateExperience: function(virtualActive, virtualPassive) {
		var unitSrc = this._attackInfo.unitSrc;
		var unitDest = this._attackInfo.unitDest;
		var data = StructureBuilder.buildAttackExperience();
		
		// If the enemy is killed, you get experience from destroying the enemy. If the enemy is not defeated, no experience is gained.

		// Comparison of UnitType.PLAYER is essential, as it is the own forces that gain experience.
		// Sometimes their own forces are unitSrc and sometimes unitDest.
		if (unitSrc.getUnitType() === UnitType.PLAYER && virtualActive.hp > 0) {
			// Experience calculation if the attacker attacked his own troops, was not killed and killed the enemy.
			if ( virtualPassive.hp <= 0) {
				data.active = unitSrc;
				data.activeHp = virtualActive.hp;
				data.activeDamageTotal = virtualActive.damageTotal;
				data.passive = unitDest;
				data.passiveHp = virtualPassive.hp;
				data.passiveDamageTotal = virtualPassive.damageTotal;
			}
			else {
				// No experience gained.
				return -1; 
			}
		}
		else if (unitDest.getUnitType() === UnitType.PLAYER && virtualPassive.hp > 0) {
			// Experience is calculated if the attack was on your own troops, if you were not killed and if you killed the enemy.
			if ( virtualActive.hp <= 0) {
				data.active = unitDest;
				data.activeHp = virtualPassive.hp;
				data.activeDamageTotal = virtualPassive.damageTotal;
				data.passive = unitSrc;
				data.passiveHp = virtualActive.hp;
				data.passiveDamageTotal = virtualActive.damageTotal;
			}
			else {
				// No experience gained.
				return -1; 
			}
		}
		else {
			// No experience gained.
			return -1; 
		}
		
		return ExperienceCalculator.calculateExperience(data);
	},
	
	_setBattlingResult: function(virtualActive, virtualPassive) {
		var unitSrc = this._attackInfo.unitSrc;
		var unitDest = this._attackInfo.unitDest;
		
		// Comparison of UnitType.PLAYER is essential, as it is the own forces that gain experience.
		// Sometimes their own forces are unitSrc and sometimes unitDest.
		if (unitSrc.getUnitType() === UnitType.PLAYER && virtualActive.hp > 0) {
			if ( virtualPassive.hp <= 0) {
				// If the attacker attacked his own army, was not killed and killed the enemy, the "Result of the arena: player wins" set.
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_WinPlayer);
			}
			else {
				// If the attacker attacked his own troops and was not killed, and the enemy was not killed, the "Result of the arena: neither side fell" set.
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_Draw);
			}
		}
		else if (unitDest.getUnitType() === UnitType.PLAYER && virtualPassive.hp > 0) {
			if ( virtualActive.hp <= 0) {
				// If the attacker was attacked by his own troops and not killed, and the enemy is defeated, the "Result of the arena: player wins" set.
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_WinPlayer);
			}
			else {
				// If the attack was on your army and you were not killed and the enemy was not killed, the "Result of the arena: neither side fell" set.
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_Draw);
			}
		}
		else if (unitSrc.getUnitType() === UnitType.PLAYER && virtualActive.hp <= 0) {
			if ( virtualPassive.hp <= 0) {
				// If the attacker attacked and killed his own troops and the enemy was killed, the "Result of the arena: both dead" set.
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_DoubleKO);
			}
			else {
				// If the attacker is dead in his own army and the enemy is not dead, the "Result of the arena: enemy victory" set.
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_WinEnemy);
			}
		}
		else if (unitDest.getUnitType() === UnitType.PLAYER && virtualPassive.hp <= 0) {
			if ( virtualActive.hp <= 0) {
				// If the attack was on your army and you are both dead, and you have killed the enemy, the "arena result: both dead" set.
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_DoubleKO);
			}
			else {
				// If the attacker was attacked and killed by his own troops and the enemy is not dead, the "Result of the arena: enemy victory" set.
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_WinEnemy);
			}
		}
	},
	
	_configureEvaluator: function(groupArray) {
		groupArray.appendObject(BattlingEvaluator.HitCritical);
		groupArray.appendObject(BattlingEvaluator.ActiveAction);
		groupArray.appendObject(BattlingEvaluator.PassiveAction);
		
		groupArray.appendObject(BattlingEvaluator.TotalDamage);
		
		// AttackMotion and DamageMotion determine the motion to be used during real combat.
		// attackEntry.isCritical and attackEntry.isFinish must already be initialised.
		groupArray.appendObject(BattlingEvaluator.AttackMotion);
		groupArray.appendObject(BattlingEvaluator.DamageMotion);
	}
}
);




//-------------------------------------------
// VirtualAttackControl class
//-------------------------------------------
// createVirtualAttackUnit() for the arena.
VirtualAttackControl.createVirtualBattlingAttackUnit= function(unitSelf, targetUnit, isSrc, attackInfo) {
		// Data set by calling createVirtualAttackUnit (ExtraConfigSkill and others add parameters with this function, so call it).
		var virtualAttackUnit = VirtualAttackControl.createVirtualAttackUnit.call(this,unitSelf, targetUnit, isSrc, attackInfo);
		
		// Support effects do not add up in the arena.
		virtualAttackUnit.totalStatus = {};
		virtualAttackUnit.totalStatus.powerTotal = 0;
		virtualAttackUnit.totalStatus.defenseTotal = 0;
		virtualAttackUnit.totalStatus.hitTotal = 0;
		virtualAttackUnit.totalStatus.avoidTotal = 0;
		virtualAttackUnit.totalStatus.criticalTotal = 0;
		virtualAttackUnit.totalStatus.criticalAvoidTotal = 0;
		
		return virtualAttackUnit;
}


// Updating VirtualAttackUnit information (in the arena, some of the VirtualAttackUnit data needs to be initialised every turn).
VirtualAttackControl.updateVirtualBattlingAttackUnit= function(unitSelf, targetUnit, virtualAttackUnit) {
		var isAttack;
		
		// Re-assess whether an attack is possible
		if (virtualAttackUnit.isSrc) {
			// The attacker is deemed to be able to attack if equipped with a weapon.
			isAttack = virtualAttackUnit.weapon !== null;
		}
		else {
			// The attacker checks whether it is possible to fight back.
			isAttack = virtualAttackUnit.isCounterattack;
		}
		
		// Reset number of attacks.
		this._calculateAttackAndRoundCount(virtualAttackUnit, isAttack, targetUnit);

		// Reset counter for attack motions (used to determine which motion to draw).
		virtualAttackUnit.motionAttackCount = 0;
}




//-------------------------------------------
// BattlingBattle class
//-------------------------------------------
// RealBattle for the arena
var BattlingBattle = defineObject(RealBattle,
{
	_isGiveUpMode: false,		// Give-up screen display status flag.
	_giveUpManager: null,		// Give-up screen.

	moveBattleCycle: function() {
		var giveUpResult;
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		// Is a real combat screen displayed?
		if( this._isBattleLayoutVisible ) {
			// If the cancel key is pressed without the give-up screen being displayed, the give-up screen is displayed.
			if( this._isGiveUpMode == false && InputControl.isCancelAction() ) {
				this._isGiveUpMode = true;
				this._giveUpManager.setGiveUp();
			}
		}

		if( this._isGiveUpMode == true ) {
			// If the give-up screen is in the display state, the results of the operation on the give-up screen are acquired and judged.
			giveUpResult = this._giveUpManager.moveWindowManager();

			if (giveUpResult === GiveUpWindowResult.GIVEUP) {
				// In the event of a give-up
				this._isGiveUpMode = false;
				this._attackFlow.CancelAttackFlow();
			}
			else if (giveUpResult === GiveUpWindowResult.CANCEL) {
				// If you cancel the give-up (also click here if no).
				this._isGiveUpMode = false;
			}
		}
		else {
			// If the give-up screen is not in the display state, moveBattleCycle() of the real screen is performed.
			result = RealBattle.moveBattleCycle.call(this);
		}
		
		return result;
	},
	
	drawBattleCycle: function() {
		var mode = this.getCycleMode();
		
		if( this._isGiveUpMode == true ) {
			// If the give-up window is being displayed, draw the give-up window without displaying the butler
			// (Butler has no method to draw in the paused state, so drawing is removed)
			this._uiBattleLayout.drawBattleLayoutForGiveUp();
			this._giveUpManager.drawWindowManager();
		}
		else {
			// If the give-up window is non-displayed, the normal real combat screen drawing process is performed.
			RealBattle.drawBattleCycle.call(this);
		}
	},
	
	backBattleCycle: function() {
		// If the give-up window is hidden, the Butler's animation drawing process is performed.
		if( this._isGiveUpMode == false ) {
			if (this._parentCoreAttack !== null) {
				this._moveBattlerAnimation();
				this._moveAsyncEffect();
			}
		}
	},
	
	endBattle: function() {
		this._battleTable.endMusic();
		this._uiBattleLayout.endBattleLayout();

		// Preventing animation sounds from being played by backBattleCycle after a battle.
		this._parentCoreAttack = null;

		// Hide the opponent in the arena (if you don't hide them, they will apparently remain where they appeared even if you erase them).
		var active = this.getActiveBattler().getUnit();
		if( active.getUnitType() == UnitType.ENEMY ) {
			active.setInvisible(true);
		}
		var passive = this.getPassiveBattler().getUnit();
		if( passive.getUnitType() == UnitType.ENEMY ) {
			passive.setInvisible(true);
		}
	},
	
	_prepareBattleMemberData: function(coreAttack) {
		RealBattle._prepareBattleMemberData.call(this, coreAttack);

		// Generate UIBattleLayout for the arena.
		this._uiBattleLayout = createObject(UIBattlingLayout);

		// Generate give-up screen.
		this._giveUpManager  = createObject(GiveUpManager);
	}
}
);




//-------------------------------------------
// UIBattlingLayout class
//-------------------------------------------
var UIBattlingLayout = defineObject(UIBattleLayout,
{
	// Combat screen rendering during display of give-up screen.
	drawBattleLayoutForGiveUp: function() {
		this._battleContainer.pushBattleContainer();
		
		this._drawGiveUp();
		
		this._battleContainer.popBattleContainer();
	},
	
	// Drawing of the battle screen during display of the give-up screen (lower functions)
	_drawGiveUp: function() {
		// Animated motion does not have the ability to draw paused states, so that battlers and effects are not drawn.
		var rightUnit = this._battlerRight.getUnit();
		var leftUnit = this._battlerLeft.getUnit();
		var xScroll = this._realBattle.getAutoScroll().getScrollX();
		var yScroll = 0;
		
		this._drawBackground(xScroll, yScroll);
		
		this._drawColor(EffectRangeType.MAP);
		
		this._drawColor(EffectRangeType.ALL);
		
		this._drawFrame(true);
		this._drawFrame(false);
		
		this._drawNameArea(rightUnit, true);
		this._drawNameArea(leftUnit, false);
		
		this._drawWeaponArea(rightUnit, true);
		this._drawWeaponArea(leftUnit, false);
		
		this._drawFaceArea(rightUnit, true);
		this._drawFaceArea(leftUnit, false);
		
		this._drawInfoArea(rightUnit, true);
		this._drawInfoArea(leftUnit, false);
		
		this._drawHpArea(rightUnit, true);
		this._drawHpArea(leftUnit, false);
	},
	
	// Obtaining attack status (e.g. hit and damage) on the real combat screen.
	_getAttackStatus: function(unit, targetUnit, isSrc) {
		var arr, isCounterattack;
		
		if (isSrc) {
			arr = AttackChecker.getBattlingAttackStatusInternal(unit, BattlerChecker.getRealBattleWeapon(unit), targetUnit);
		}
		else {
			isCounterattack = this._realBattle.getAttackInfo().isCounterattack;
			if (isCounterattack) {
				arr = AttackChecker.getBattlingAttackStatusInternal(targetUnit, BattlerChecker.getRealBattleWeapon(targetUnit), unit);
			}
			else {
				arr = AttackChecker.getNonStatus();
			}
		}
		
		return arr;
	}
}
);




//-------------------------------------------
// AttackChecker class
//-------------------------------------------
// getAttackStatusInternal() for the arena.
AttackChecker.getBattlingAttackStatusInternal= function(unit, weapon, targetUnit) {
		var activeTotalStatus, passiveTotalStatus;
		var arr = [,,,,];
		
		if (weapon === null) {
			return this.getNonStatus();
		}
		
		// Supporting effects do not add up.
		activeTotalStatus  = {};
		activeTotalStatus.powerTotal = 0;
		activeTotalStatus.defenseTotal = 0;
		activeTotalStatus.hitTotal = 0;
		activeTotalStatus.avoidTotal = 0;
		activeTotalStatus.criticalTotal = 0;
		activeTotalStatus.criticalAvoidTotal = 0;

		passiveTotalStatus = {};
		passiveTotalStatus.powerTotal = 0;
		passiveTotalStatus.defenseTotal = 0;
		passiveTotalStatus.hitTotal = 0;
		passiveTotalStatus.avoidTotal = 0;
		passiveTotalStatus.criticalTotal = 0;
		passiveTotalStatus.criticalAvoidTotal = 0;
		
		if( isBattlingTerrainOn == true ) {
			// If there are terrain effects in the arena, treat as normal.
			arr[0] = DamageCalculator.calculateDamage(unit, targetUnit, weapon, false, activeTotalStatus, passiveTotalStatus, 0);
			arr[1] = HitCalculator.calculateHit(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);
		}
		else {
			// If there are no terrain effects in the arena, call up the damage and hit calculations for the arena.
			arr[0] = DamageCalculator.calculateBattlingDamage(unit, targetUnit, weapon, false, activeTotalStatus, passiveTotalStatus, 0);
			arr[1] = HitCalculator.calculateBattlingHit(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);
		}
		arr[2] = CriticalCalculator.calculateCritical(unit, targetUnit, weapon, activeTotalStatus, passiveTotalStatus);

		// Fifth: suicide attack or not (not directly indicated in the combat results).
		arr[4] = DamageCalculator.isEffective(unit, targetUnit, weapon, false, 0);

		// Sixth: compatibility: value of damage.
		if( typeof AttackChecker.getCompatiblePower === 'function' ){
			arr[5] = AttackChecker.getCompatiblePower(unit, targetUnit, weapon);
		}
		// Seventh: compatibility: value of hit.
		if( typeof AttackChecker.getCompatibleHit === 'function' ){
			arr[6] = AttackChecker.getCompatibleHit(unit, targetUnit, weapon);
		}
		// Eighth: compatibility: critical value.
		if( typeof AttackChecker.getCompatibleCritical === 'function' ){
			arr[7] = AttackChecker.getCompatibleCritical(unit, targetUnit, weapon);
		}

		return arr;
}




//-------------------------------------------
// BattlingEvaluator class
//-------------------------------------------
var BattlingEvaluator = {};

BattlingEvaluator.HitCritical = defineObject(AttackEvaluator.HitCritical,
{
	// Currently the same as AttackEvaluator.HitCritical().
	calculateHit: function(virtualActive, virtualPassive, attackEntry) {
		var percent;

		if( isBattlingTerrainOn == true ) {
			// If there are terrain effects in the arena, treat as normal.
			percent = HitCalculator.calculateHit(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, virtualActive.totalStatus, virtualPassive.totalStatus);
		}
		else {
			// If there are no terrain effects in the arena, call for a hit calculation for the arena.
			percent = HitCalculator.calculateBattlingHit(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, virtualActive.totalStatus, virtualPassive.totalStatus);
		}
		
		return Probability.getProbability(percent);
	},
	
	calculateDamage: function(virtualActive, virtualPassive, attackEntry) {
		var trueHitValue = 0;
		
		if (this._skill !== null) {
			trueHitValue = this._skill.getSkillValue();
		}
		
		if (DamageCalculator.isHpMinimum(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, attackEntry.isCritical, trueHitValue)) {
			// Current HP - 1 as damage, so that if the attack hits, the opponent's HP is reduced to 1.
			return virtualPassive.hp - 1;
		}
		
		if (DamageCalculator.isFinish(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, attackEntry.isCritical, trueHitValue)) {
			return virtualPassive.hp;
		}
		
		if( isBattlingTerrainOn == true ) {
			// If there are terrain effects in the arena, treat as normal.
			return DamageCalculator.calculateDamage(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, 
					attackEntry.isCritical, virtualActive.totalStatus, virtualPassive.totalStatus, trueHitValue);
		}
		else {
			// If there are no terrain effects in the arena, call up the damage calculation for the arena.

			// Damage calculation excludes corrections to defensive (magical) strength due to terrain effects.
			return DamageCalculator.calculateBattlingDamage(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, 
					attackEntry.isCritical, virtualActive.totalStatus, virtualPassive.totalStatus, trueHitValue);
		}
	}
}
);




BattlingEvaluator.ActiveAction = defineObject(AttackEvaluator.ActiveAction,
{
	// Currently the same as AttackEvaluator.ActiveAction().
}
);




BattlingEvaluator.PassiveAction = defineObject(AttackEvaluator.PassiveAction,
{
	// Currently the same as AttackEvaluator.PassiveAction().
}
);




BattlingEvaluator.TotalDamage = defineObject(AttackEvaluator.TotalDamage,
{
	// Currently the same as AttackEvaluator.TotalDamage().
}
);




BattlingEvaluator.AttackMotion = defineObject(AttackEvaluator.AttackMotion,
{
	// Currently the same as AttackEvaluator.AttackMotion().
}
);




BattlingEvaluator.DamageMotion = defineObject(AttackEvaluator.DamageMotion,
{
	// Currently the same as AttackEvaluator.DamageMotion().
}
);




//-------------------------------------------
// BattingAttackFlow class
//-------------------------------------------
// AttackFlow for the arena.
var BattingAttackFlow = defineObject(AttackFlow,
{
	_isCancelAttackFlow: false,		// arena cancellation flag.
	
	checkNextAttack : function() {
		var result = AttackFlowResult.NONE;
		
		if (this.isBattleUnitLosted()) {
			this._changeLastMode();
			result = AttackFlowResult.DEATH;
		}
		else if (this._isBattleContinue()) {
			// If true is returned, it means that the AttackEntry still exists.
			// The caller detects this and continues fighting.
			result = AttackFlowResult.CONTINUE; 
		}
		else {
			if( this._isCancelAttackFlow == true ) {
				// If the arena cancellation flag is on and neither the enemy nor you are dead, the giveaway is
				VATableControlForBattling.setVATable(Battling_ID_PAGE, BattlingResult_ID, BattlingResult_GiveUp);

				// When giving up, the experience gained is also zero.
				this._order.registerExp(0);
			}

			// Executed if AttackEntry no longer exists and the battle is not settled.
			this._changeLastMode();
		}
		
		return result;
	},
	
	// Determining whether the arena cancellation flag is ON or not.
	isCancelAttackFlow: function() {
		return this._isCancelAttackFlow;
	}
	,
	
	// Turn on arena cancellation flag (called when arena is cancelled).
	CancelAttackFlow: function() {
		this._isCancelAttackFlow = true;
	}
	,
	
	// Perform attack actions (e.g. reduce unit HP, change state, reduce weapon endurance).
	_doAttackAction: function() {
		var i, count, turnState;
		var weapon;
		var order = this._order;
		var active = order.getActiveUnit();
		var passive = order.getPassiveUnit();
		var activeStateArray = order.getActiveStateArray();
		var passiveStateArray = order.getPassiveStateArray();
		var isItemDecrement = order.isCurrentItemDecrement();
		
		DamageControl.reduceHp(active, order.getActiveDamage());
		DamageControl.reduceHp(passive, order.getPassiveDamage());
		
		DamageControl.checkHp(active, passive);
		
		count = activeStateArray.length;
		for (i = 0; i < count; i++) {
			turnState = StateControl.arrangeState(active, activeStateArray[i], IncreaseType.INCREASE);
			if (turnState !== null) {
				turnState.setLocked(true);
			}
		}
		
		count = passiveStateArray.length;
		for (i = 0; i < count; i++) {
			turnState = StateControl.arrangeState(passive, passiveStateArray[i], IncreaseType.INCREASE);
			if (turnState !== null) {
				turnState.setLocked(true);
			}
		}
		
		if (isItemDecrement) {
			weapon = ItemControl.getEquippedWeapon(active);
			if( weapon.getLimit() > 0 ){
				// Reduce the attacker's weapon if the weapon's durability is 1 or more.
				// (In the arena, the weapon durability can be reduced to less than 0 if the durability is reduced as it is, because it is possible to attack even if the weapon durability reaches 0 in the middle of the arena).
				// Here, there is no such thing as an item being destroyed.
				ItemControl.decreaseLimit(active, weapon);
			}
		}
	},
	
	// Determination of the continuity of the arena.
	_isBattleContinue: function() {
		// If the arena is cancelled, the battle ends there.
		if( this._isCancelAttackFlow == true ) {
			return false;
		}

		// Otherwise, AttackFlow's _isBattleContinue().
		return AttackFlow._isBattleContinue.call(this);
	}
}
);




//---------------------------------------
// Give-up confirmation window related.
//---------------------------------------
var GiveUpWindowResult = {
	GIVEUP: 0,
	CANCEL: 1,
	NONE: 2
};

// Class for managing give-up confirmation windows.
var GiveUpManager = defineObject(BaseWindowManager,
{
	_questionWindow: null,
	
	// Data settings for give-up screen.
	setGiveUp: function() {
		this._questionWindow = createWindowObject(BattlingCancelQuestionWindow, this);
		this._questionWindow.setQuestionMessage(GiveUpText);
		
		this._questionWindow.setQuestionActive(true);
	},
	
	moveWindowManager: function() {
		var result = GiveUpWindowResult.NONE;
		
		result = this._moveGiveUp();
		
		return result;
	},
	
	drawWindowManager: function() {
		var x = LayoutControl.getCenterX(-1, this._questionWindow.getWindowWidth());
		var y = LayoutControl.getCenterY(-1, this._questionWindow.getWindowHeight());
		
		this._questionWindow.drawWindow(x, y);
	},
	
	_moveGiveUp: function() {
		var ans;
		var result = GiveUpWindowResult.NONE;
		
		if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
			ans = this._questionWindow.getQuestionAnswer();
			if (ans === QuestionAnswer.YES) {
				result = GiveUpWindowResult.GIVEUP;
			}
			else {
				result = GiveUpWindowResult.CANCEL;
			}
		}
		
		return result;
	}
}
);




var BattlingCancelQuestionWindow = defineObject(QuestionWindow,
{
	_cancelEnable: false,	// For checking whether the cancel key has been released once.
	
	setQuestionMessage: function(message) {
		this._message = message;
		
		this._createScrollbar();
		this._calculateWindowSize();
		this.setQuestionIndex(0);
		this._cancelEnable = false;
	},
	
	moveWindowContent: function() {
		var index;
		var input = this._scrollbar.moveInput();
		
		if (input === ScrollbarInput.SELECT) {
			// If the cancel key is released once, _cancelEnable is true.
			this._cancelEnable = true;

			index = this._scrollbar.getIndex();
			if (index === 0) {
				this._ans = QuestionAnswer.YES;
			}
			else {
				this._ans = QuestionAnswer.NO;
			}
			this.setQuestionIndex(0);
			return MoveResult.END;
		}
		else if (input === ScrollbarInput.CANCEL) {
			// Cancel key only works once it has been released
			// (The give-up window appears when the Cancel key is pressed. If the cancel key check is performed as it is.
			// The moment the window is opened, it is judged to be cancelled, so the Cancel key has to be released once for it to take effect).
			if( this._cancelEnable == true ) {
				this._ans = QuestionAnswer.NO;
				this.setQuestionIndex(0);
				return MoveResult.END;
			}
		}
		else {
			// _cancelEnable is true once the cancel key is released
			this._cancelEnable = true;
		}
		
		return MoveResult.CONTINUE;
	}
}
);


})();