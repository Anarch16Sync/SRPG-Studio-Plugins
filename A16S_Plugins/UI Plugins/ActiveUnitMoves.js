/* ActiveUnitMoves Plugin
this plugin changes the display of unit movement on the map so they keep playing their movement animation while the unit command is displayed.
It also makes unit go directly from movement to attack animation without going into a idle animation during easyBattle.

Author: Anarch16Sync

Changelog:
2024-04-23: Created
*/
(function() {
var aliasSEB = EasyMapUnit.setupEasyBattler;
EasyMapUnit.setupEasyBattler = function(unit, isSrc, easyBattle) {
    aliasSEB.call(this, unit, isSrc, easyBattle); 
    this._direction = unit.getDirection();
};

var aliasCMD = UnitWaitFlowEntry._completeMemberData; 
UnitWaitFlowEntry._completeMemberData = function(playerTurn) {
    // Unless it's unlimited action, then wait.
    var unit = playerTurn.getTurnTargetUnit();
    if (!Miscellaneous.isPlayerFreeAction(unit)) {
        //root.log('this is after unit set wait')
        unit.setDirection(DirectionType.NULL);
    }
    var result = aliasCMD.call(this,playerTurn)
    return result
};

SimulateMove._endMove = function(unit) {

    //root.log('this is Simulatemove._endMove')
    // Enable to draw the default because move ends.
    unit.setInvisible(false);
    
    this._isMoveFinal = true;
}

})();