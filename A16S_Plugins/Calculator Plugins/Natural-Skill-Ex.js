/* Natural Skill Extension

Makes the Pursuit, Critical and Counter skill make the opposite of the difficulty settings
That means that is something is enabled by default the skill disables it, but if the option is disabled the skill enables it.

Author: Anarch16sync */


//When Counter is disallowed on difficulty settings, the counter skills enables them
//When Counter is allowed on difficulty settings, the counter skills disables them
Calculator.isCounterattackAllowed = function(active, passive) {
    var option = root.getMetaSession().getDifficulty().getDifficultyOption();
    var counterskillposes = (SkillControl.getBattleSkill(passive, active, SkillType.COUNTERATTACK) === null);

    if ((option & DifficultyFlag.COUNTERATTACK)) {
        return counterskillposes;
    } else {
        return !counterskillposes;
    }
};

//When Pursuit is disallowed on difficulty settings, the pursuit skills enables them
//When pursuit is allowed on difficulty settings, the pursuit skills disables them
Calculator.isRoundAttackAllowed = function(active, passive) {
    var option = root.getMetaSession().getDifficulty().getDifficultyOption();
    var roundattackskillposes = (SkillControl.getBattleSkill(active, passive, SkillType.ROUNDATTACK) === null);
    
    if ((option & DifficultyFlag.ROUNDATTACK)) {
        return roundattackskillposes;
    } else {
        return !roundattackskillposes;
    }

};

//When Critical is disallowed on difficulty settings, the Critical skills enables them
//When Critical is allowed on difficulty settings, the Critical skills disables them
Miscellaneous.isCriticalAllowed = function(active, passive) {
    var option = root.getMetaSession().getDifficulty().getDifficultyOption();
    var criticalskillposes = (SkillControl.getBattleSkill(active, passive, SkillType.CRITICAL) === null)

    if ((option & DifficultyFlag.CRITICAL)) {
        return criticalskillposes;
    } else {
        return !criticalskillposes;
    }

};