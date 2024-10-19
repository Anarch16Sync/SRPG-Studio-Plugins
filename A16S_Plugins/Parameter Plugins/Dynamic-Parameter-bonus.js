/* 
Dynamic-Parameter-bonus
Author: Anarch16sync

This Plugin adds the ability to set dynamic parameter bonus on Skills, Weapons and Items.
these dynamic bonus is created by using a function(unit, obj) in the corresponding custom parameter object.
Also any skill can provide this custom stat bonus so numeric values are also valid.

Example:
Add this to any skill to add a +7 Luck passive bonus on top of their normal effect. 
{
    paramBonus:{
    luk: 7
    }
}

Add this function to any skill to returns one third (1/3) of the equipped weapon's weight as a Str bonus.

{
    paramBonus:{
	pow:function(unit, obj) {
            var weapon = ItemControl.getEquippedWeapon(unit);
            var weight = weapon.getWeight();

            return Math.floor(weight/3);},
	pow_desc:'+(Weight/3)'}
}

the pow_desc object is used to add text describing the bonus and is added for use in UI, it should always start with a + or - symbol.
Skills don't show stat bonus description by default, but items and weapons do.

By default this is the complete list of possible parameters to use, this are based on the getSignal string,
so any new parameter can be added by using their signal in the custom parameters


{
    paramBonus:{
    pow: ,
    mag: ,
    ski: ,
    spd: ,
    luk: ,
    def: ,
    mdf: ,
    mov: ,
    bld: ,
    pow_desc: ,
    mag_desc: ,
    ski_desc: ,
    spd_desc: ,
    luk_desc: ,
    def_desc: ,
    mdf_desc: ,
    mov_desc: ,
    bld_desc: 
    }
}

**NOTICE BE CAREFUL WITH YOUR FUNCTIONS**
There is a lot of things that can cause recursive errors and infinite loops,
this tend to crash with out of memory or out of stack errors.


2024-08-07 - Created
2024-10-04 - removed extra root.log and fixed comments
2024-10-19 - added check for cases where parameters don't define a getSignal function, mostly the case in other plugins.
 */

//Custom Function that is used to return the description of the bonus, returns a number or a string.
ParamGroup.getCustomBonusDesc = function(obj, i) {
    var customDesc = this._objectArray[i].getCustomBonusDesc(obj);
        if(customDesc == null){
            try{
                customDesc = this.getParameterBonus(obj, i);
            } catch (error){
                customDesc = null;
            }
        }
    return customDesc !== null ? customDesc : 0; 
}; 

//getUnitTotalParamBonus now calls for getCustomParameterBonus
BaseUnitParameter.getUnitTotalParamBonus = function(unit, weapon) {
    var i, count, skill, paramBonus;
    var d = 0;
    var arr = [];
    // Weapon parameter bonus
    if (weapon !== null) {
        d += this.getCustomParameterBonus(unit,weapon)
        if(d == 0){
            d += this.getParameterBonus(weapon);
        }
    }
    
    // Item parameter bonus
    d += this._getItemBonus(unit, true);
    
    // Check the skill of parameter bonus.
    arr = SkillControl.getSkillObjectArray(unit, weapon, -1, '', this._getParamBonusObjectFlag());
    count = arr.length;
    for (i = 0; i < count; i++) {
        skill = arr[i].skill;
        
        paramBonus = this.getCustomParameterBonus(unit,skill)

        if (paramBonus == 0 && skill.getSkillType() === SkillType.PARAMBONUS){
            paramBonus = this.getParameterBonus(skill);
        }
    
        d += paramBonus;
    }

    
    return d;
};

//New function that returns the value of for each parameter, is uses getSignal as the custom object names, so it should support custom parameters from other plugins.
BaseUnitParameter.getCustomParameterBonus = function(unit,obj){
    var paramBonus;
    var paramBonusArray = obj.custom.paramBonus;
    if (typeof paramBonusArray !== 'undefined' && typeof this.getSignal !== 'undefined'){
        paramBonus = paramBonusArray[this.getSignal()];
    }
    var paramBonusType = typeof paramBonus;
    if (paramBonusType == "number") {
        return paramBonus
    } else if (paramBonusType == "function") {
        return paramBonus(unit, obj);
    } else {
        return 0
    }
};

//New function to obtain the description from the custom.paramBonus, if the bonus is a number it returns the number, if the bonus is a fuction it returns the _desc object for that parameter signal.
BaseUnitParameter.getCustomBonusDesc = function(obj){
    var BonusDesc = null;
    var paramBonusArray = obj.custom.paramBonus;
    if (typeof paramBonusArray !== 'undefined' && typeof this.getSignal !== 'undefined'){
        var paramBonus = paramBonusArray[this.getSignal()];
        var typeBonus = typeof paramBonus;
        if(typeBonus == "number"){
            BonusDesc = paramBonus;
        } else if(typeof paramBonusArray[this.getSignal()+'_desc'] !== 'undefined') {
            BonusDesc = paramBonusArray[this.getSignal()+'_desc'];
        }
    }
    return BonusDesc;

};

//_getItemBonus not uses getCustomParameterBonus.
BaseUnitParameter._getItemBonus = function(unit, isParameter) {
    var i, item, n;
    var d = 0;
    var checkerArray = [];
    var count = UnitItemControl.getPossessionItemCount(unit);
    
    for (i = 0; i < count; i++) {
        item = UnitItemControl.getItem(unit, i);
        if (!ItemIdentityChecker.isItemReused(checkerArray, item)) {
            continue;
        }
        
        if (isParameter) {
            n = this.getCustomParameterBonus(unit,item)
            if(n == 0){
                n = this.getParameterBonus(item);
            }
        }
        else {
            n = this.getGrowthBonus(item);
        }
        
        // Correction is not added for the unit who cannot use the item.
        if (n !== 0 && ItemControl.isItemUsable(unit, item)) {
            d += n;
        }
    }
    
    return d;
},

//Changed getParameterBonus to getCustomBonusDesc
ItemSentence.Bonus.drawItemSentence = function(x, y, item) {
            var i, n;
            var count = ParamGroup.getParameterCount();
            
            for (i = 0; i < count; i++) {
                n = ParamGroup.getCustomBonusDesc(item, i);
                if (n !== 0 ) {
                    break;
                }
            }
            
            if (i === count) {
                return 0;
            }
            
            ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('support_capacity'));
            x += ItemInfoRenderer.getSpaceX();
            ItemInfoRenderer.drawDoping(x, y, item, true);
        }


//Changed getParameterBonus to getCustomBonusDesc        
ItemInfoRenderer.getDopingCount = function(item, isParameter) {
        var i;
        var n = 0;
		var count = ParamGroup.getParameterCount();
		var count2 = 0;

		
		for (i = 0; i < count; i++) {
			if (isParameter) {
				n = ParamGroup.getCustomBonusDesc(item, i);
			}
			else {
				n = ParamGroup.getDopingParameter(item, i);
			}
			
			if (n !== 0) {
				count2++;
			}
		}
		return count2;
},

//Changed getParameterBonus to getCustomBonusDesc and the drawing of the value to depend getCustomBonusDesc returns a number or a string.
ItemInfoRenderer.drawDoping = function(x, y, item, isParameter) {
    var i, text;
    var n = 0;
    var count = ParamGroup.getParameterCount();
    var count2 = 0;
    var xBase = x;
    var textui = this.getTextUI();
    var color = textui.getColor();
    var font = textui.getFont();
    
    for (i = 0; i < count; i++) {
        if (isParameter) {
            n = ParamGroup.getCustomBonusDesc(item, i);
        }
        else {
            n = ParamGroup.getDopingParameter(item, i);
        }
        
        if (n !== 0) {
            text = ParamGroup.getParameterName(i);
            TextRenderer.drawKeywordText(x, y, text, -1, color, font);
            
            x += TextRenderer.getTextWidth(text, font) + 5;
            if (typeof n == "number"){
                TextRenderer.drawSignText(x, y, n > 0 ? ' + ': ' - ');
                
                x += 10;
                x += DefineControl.getNumberSpace();
                
                if (n < 0) {
                    n *= -1;
                }
                NumberRenderer.drawRightNumber(x, y, n);
                x += 20;
                }

            if (typeof n == "string"){
                    TextRenderer.drawSignText(x, y, ' '+n.charAt(0));
                
                    x += 10;
                    x += DefineControl.getNumberSpace();
                    TextRenderer.drawKeywordText(x, y, n.substring(1), -1, color, font);
                }
            
            y += this.getSpaceY();
            
            count2++;
            x = xBase;
        }
    }
    
    return count2;
}