/* 
Fibonacci Pursuit Plugin

This plugin makes it so that is possible to have more than 2 rounds of combat based on how much big is the Agility difference,
but each extra round of combat needs an agility increase that follows the Fibonacci sequence.

i.e with a pursuit value of 3 in the settings, the thresholds for rounds are like this:
Agility Diff    Rounds
    3           2       
    8           3
    16          4
    29          5

and so on and so on.

The pursuit value in the setting now determines in what value of the sequence the threshold starts

ie a pursuit value of 3, means that the agility difference starts at 3, but a persuit value of 5 means the difference needed starts at 8,
because 8 is the 5th value in the sequence.

Optional Settings:
This can be changed to required a special skill that allows to trigger the extra rounds, this allows it to coexist with the default pursuit
and to work when pursuit is disable in the diffulty settings.

To require the skill to trigger the extra rounds change REQUIRES_SKILL to true

Author: Anarch16sync
2024-10-05 Added Compatibility for Dynamic-Support-Expansion

*/

//-------------------------------
// settings
//-------------------------------
var REQUIRES_SKILL = false                      //false if no skill is required, true to require the skill to trigger extra rounds.
var SKILL_FIBONACCI_PURSUIT = 'fibosuit16'; 	// skill keyword



//------------------------------------------
//Code Stuff below
//------------------------------------------
Calculator.getDifference = function(index) {
    var fibo=[0,1,2,3,5,8,13,21];
    if (index == null) {
        index = DataConfig.getRoundDifference();
    }

    var a,b,c;

    if (index >= fibo.length) {
        var a = fibo[fibo.length-2];
        var b = fibo[fibo.length-1];

        for (var i = fibo.length; i <= index; i++) {
        c = a + b;
        a = b;
        b = c;
        }

        return b;
    }
    return fibo[index];
};

(function(){
    var alias001 = Calculator.calculateRoundCount;
    
    Calculator.calculateRoundCount = function(active, passive, weapon, activeTotalStatus,passiveTotalStatus) {
        if(typeof SupportSkillControl !== 'undefined'){
            var rounds = alias001.call(this,active, passive, weapon,activeTotalStatus,passiveTotalStatus)
        } else {
            var rounds = alias001.call(this,active, passive, weapon)
        }

        var skill = SkillControl.getPossessionCustomSkill(active, SKILL_FIBONACCI_PURSUIT);
		if( skill !== null || !REQUIRES_SKILL ){
            var value, index,b,c;

            if(typeof SupportSkillControl !== 'undefined'){
                activeAgi = AbilityCalculator.getAgility(active, weapon) + this.getAgilityPlus(active, passive, weapon, activeTotalStatus);
		        passiveAgi = AbilityCalculator.getAgility(passive, ItemControl.getEquippedWeapon(passive)) + this.getAgilityPlus(passive, active, ItemControl.getEquippedWeapon(passive), passiveTotalStatus);
            } else {
                var activeAgi = AbilityCalculator.getAgility(active, weapon) + this.getAgilityPlus(active, passive, weapon);
		        var passiveAgi = AbilityCalculator.getAgility(passive, ItemControl.getEquippedWeapon(passive));
            }

            index = DataConfig.getRoundDifference()+(rounds-1);
            value = this.getDifference(index);
            b=this.getDifference(index+1)
            var diff = (activeAgi-passiveAgi)-this.getDifference(index-1);
            
            while (diff >= value){
                    diff-=value;

                    c=b;
                    b+=value;
                    
                    value = c;
                    rounds++;
        
            }
        }
            return rounds

        }
})();