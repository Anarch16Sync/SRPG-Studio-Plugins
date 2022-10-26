
/*--------------------------------------------------------------------------
  
A script that switches the enemy to a weapon that can counterattack when your army attacks

■Overview
When your unit attacks an enemy, automatically select a weapon that can counterattack from the weapons possessed by the enemy.
(Uses the weapon that is detected first among the weapons that can counterattack. Currently, it is not considered whether the power or accuracy is optimal.)

■ Customization
1. I want allied units to automatically select weapons that can counterattack.
　　　→Rewrite false to true in "var IS_ATTACKABLE_ALLY_ENABLE = false;"

2. I want to automatically select a weapon that can counterattack only a part of the enemy (and allied units if IS_ATTACKABLE_ALLY_ENABLE=true)
　　　→Replace true in "var IS_ATTACKABLE_AUTO_ENABLE = true;" to false
On top of that, give the enemy (alliance) unit a custom skill with 'sokuou' as the keyword.
(Both class skills and unit skills are fine)

3. I want to change the custom skill keyword
　　　→Please change the sokuou part of "var ATTACKABLE_SKILL_KEYWORD = 'sokuou';" to a different keyword

4. When selecting a counterattack weapon, I want to select the weapon with the best score among those that can counterattack
　　　→Replace false in "var IS_CALCULATE_SCORE = false;" to true



16/11/06 New
16/11/07 added some settings
17/04/15 Added a setting to select the weapon with the best score among those that can counterattack when selecting a counterattack weapon (weapon with the best AIScorer.Weapon.getScore() value)
17/11/29 1.164 compatible
18/01/16 Fixed a bug that caused the effect of "Enemy counterattack weapon selection" to own units due to a description error.
          (If the enemy moves one step and attacks, it will occur if you are equipped with a sword and have a hand spear.)
19/04/05 Implementation of conflict measures with superbow1.2 modified .txt
19/10/29 Fixed not to select the counterattack weapon when in an incapacitated state


■ Correspondence version
　SRPG Studio Version: 1.206


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

// Do Allied Units Have Automatic Counterattack Weapon Selection?
var IS_ATTACKABLE_ALLY_ENABLE = false;		// true: Perform automatic counterattack weapon selection, false: Do not perform

// Enemy units (and allied units if IS_ATTACKABLE_ALLY_ENABLE=true) have automatic counterattack weapon selection without custom skills
var IS_ATTACKABLE_AUTO_ENABLE = true;		// true: automatic counterattack weapon can be selected without custom skill, false: automatic counterattack weapon cannot be selected without custom skill

// When selecting a counterattack weapon, whether to select the weapon with the best score among those that can counterattack
var IS_CALCULATE_SCORE 		  = false;		// true: select the one with the best score, false: select the top weapon that can counterattack

// Custom skill keywords
var ATTACKABLE_SKILL_KEYWORD  = 'sokuou';	// If IS_ATTACKABLE_AUTO_ENABLE = false, automatic counterattack weapon selection cannot be performed unless you have the custom skill for this keyword.




//-------------------------------------
// PosMenuクラス
//-------------------------------------
PosMenu.changePosTarget= function(targetUnit) {
		var targetItem, isLeft;
		
		if (this._unit === null || !this._isTargetAllowed(targetUnit)) {
			this._currentTarget = null;
			return;
		}
		
		this._currentTarget = targetUnit;

		// 攻撃対象がプレイヤーユニットでない場合は、反撃可能な武器を自動選択
		if( ItemControl.isAttackableWeapon(targetUnit) == true ) {
			targetItem = ItemControl.getAttackableWeapon(targetUnit, this._unit);

			if( targetItem != null  ) {
				ItemControl.setEquippedWeapon(targetUnit, targetItem);
			}
		}
		targetItem = ItemControl.getEquippedWeapon(targetUnit);
		
		// srcを常に左側に表示するものとする
		isLeft = Miscellaneous.isUnitSrcPriority(this._unit, targetUnit);
		
		// 自軍を左側に表示することを優先している(左側の方が見やすいと判断)
		// このため、自軍が仕掛けた場合は当然左側に表示されるが、
		// 自軍が仕掛けられた場合でも左側に表示される。
		// 両方、自軍である場合は仕掛けた方を左側に表示する。
		if (isLeft) {
			// 仕掛けたのは自軍であるため、これを_posWindowLeftに指定
			this._posWindowLeft.setPosTarget(this._unit, this._item, targetUnit, targetItem, true);
			this._posWindowRight.setPosTarget(targetUnit, targetItem, this._unit, this._item, false);
		}
		else {
			// 仕掛けたのは自軍ではない。
			// この場合、targetUnitが自軍であるため、これを_posWindowLeftに指定。
			this._posWindowLeft.setPosTarget(targetUnit, targetItem, this._unit, this._item, true);
			this._posWindowRight.setPosTarget(this._unit, this._item, targetUnit, targetItem, false);
		}
}




//-------------------------------------
// ItemControlクラス
//-------------------------------------
// 被攻撃側が、攻撃側に自動反撃可能かどうかの判定
ItemControl.isAttackableWeapon= function(unit) {
		// 自軍ユニットの場合は自動反撃武器選択は行わない
		if( unit.getUnitType() == UnitType.PLAYER ) {
			return false;
		}
		
		// 同盟ユニットの場合、IS_ATTACKABLE_ALLY_ENABLEがtrueでない場合は自動反撃武器選択は行わない
		if( unit.getUnitType() == UnitType.ALLY && IS_ATTACKABLE_ALLY_ENABLE == false ) {
			return false;
		}
		
		// 自動反撃武器選択フラグ（IS_ATTACKABLE_AUTO_ENABLE）がfalse、かつ、
		// キーワード（ATTACKABLE_SKILL_KEYWORD）のカスタムスキル未所持なら自動反撃武器選択は行わない
		if( IS_ATTACKABLE_AUTO_ENABLE == false && !SkillControl.getPossessionCustomSkill(unit, ATTACKABLE_SKILL_KEYWORD) ) {
			return false;
		}
		
		// 行動不能の場合はfalseを返す
		if (StateControl.isBadStateOption(unit, BadStateOption.NOACTION)) {
			return false;
		}
		
		// 自動反撃武器選択フラグ（IS_ATTACKABLE_AUTO_ENABLE）がtrue、または、
		// カスタムスキル名（ATTACKABLE_SKILL_NAME）のスキルを所持するユニットなら自動反撃武器選択を行う
		return true;
}


// 被攻撃側で、攻撃側に反撃可能な武器を探して取得する
// 反撃可能な一番上の武器を使用する場合
if( IS_CALCULATE_SCORE == false ) {
	ItemControl.getAttackableWeapon= function(targetUnit, unit) {
		var indexArray;
		var weapon;
		var count;
		var i;
		var targetweapon;
		var result;
		
		// 反撃が許可されていない場合は処理終了
		if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
			return null;
		}
		
		weapon = ItemControl.getEquippedWeapon(unit);
		if (weapon !== null && weapon.isOneSide()) {
			// 攻撃側が「一方向」の武器を装備している場合は、反撃出来ない為処理終了
			return null;
		}
		
		count = UnitItemControl.getPossessionItemCount(targetUnit);
		// 所持ている武器の中から、反撃可能な武器を探す
		for (i = 0; i < count; i++) {
			targetweapon = UnitItemControl.getItem(targetUnit, i);
			if (targetweapon !== null && this.isWeaponAvailable(targetUnit, targetweapon)) {
				// 「一方向」の武器は反撃できない
				if (targetweapon.isOneSide()) {
					continue;
				}
				
				// superbow1.2改.txtが無い場合はこちら
				if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
					indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon);
				}
				// superbow1.2改.txtが入っていれば強弓などを加味する
				else {
					skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
					skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
					indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon, skill_superbow, skill_proximity);
				}
				
				// 反撃側の武器で、攻撃側の座標を攻撃可能ならばその武器を返す
				// 一番最初に検出した反撃可能な武器を返している（最適な武器を取り出していない）
				result = IndexArray.findPos(indexArray, unit.getMapX(), unit.getMapY());
				if( result == true ) {
					return targetweapon;
				}
			}
		}
		
		return null;
	};
}
// スコアが一番良いものを使用する場合
else {
	ItemControl.getAttackableWeapon= function(targetUnit, unit) {
		var indexArray;
		var weapon;
		var count;
		var i;
		var targetweapon;
		var result;
		var skill_superbow;
		var skill_proximity;
		var maxWeapon = null;
		var max_score = 0;
		var score = 0;
		var combination = {};
		combination.targetUnit = unit;
		combination.plusScore  = 0;
		
		// 反撃が許可されていない場合は処理終了
		if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
			return null;
		}
		
		weapon = ItemControl.getEquippedWeapon(unit);
		if (weapon !== null && weapon.isOneSide()) {
			// 攻撃側が「一方向」の武器を装備している場合は、反撃出来ない為処理終了
			return null;
		}
		
		count = UnitItemControl.getPossessionItemCount(targetUnit);
		// 所持ている武器の中から、反撃可能な武器を探す
		for (i = 0; i < count; i++) {
			targetweapon = UnitItemControl.getItem(targetUnit, i);
			if (targetweapon !== null && this.isWeaponAvailable(targetUnit, targetweapon)) {
				// 「一方向」の武器は反撃できない
				if (targetweapon.isOneSide()) {
					continue;
				}
				
				// superbow1.2改.txtが無い場合はこちら
				if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
					indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon);
				}
				// superbow1.2改.txtが入っていれば強弓などを加味する
				else {
					skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
					skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
					indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon, skill_superbow, skill_proximity);
				}
				
				// 反撃側の武器で、攻撃側の座標を攻撃可能ならばその武器のスコアを算出し
				// 一番スコアがいい武器を返す
				result = IndexArray.findPos(indexArray, unit.getMapX(), unit.getMapY());
				if( result == true ) {
					combination.item = targetweapon;
					score = AIScorer.Weapon.getScore(targetUnit, combination);
// 反撃可能武器のスコア（デバッグ用）
//root.log(targetweapon.getName()+':'+score);
					if( score > max_score ) {
						max_score = score;
						maxWeapon = targetweapon;
					}
				}
			}
		}
		
// 選んだ反撃可能武器のスコア（デバッグ用）
//if( maxWeapon != null){
//	root.log('result '+maxWeapon.getName()+':'+max_score);
//}
//else{
//	root.log('result maxWeapon null');
//}
		return maxWeapon;
	};
}



//-------------------------------------
// AttackCheckerクラス
//-------------------------------------
// 反撃可能かのチェック（座標単位）※敵AIで、反撃のスコア算出時のみ呼び出されている関数に武器持ち替え処理を追加した
AttackChecker.isCounterattackPos= function(unit, targetUnit, x, y) {
		var indexArray;
		var weapon;
		
		// 敵、同盟ユニットが自動反撃可能ならば反撃可能な武器に持ち替える
		if( ItemControl.isAttackableWeapon(targetUnit) == true ) {
			weapon = ItemControl.getAttackableWeapon(targetUnit, unit);
			if (weapon === null) {
				return false;
			}
			ItemControl.setEquippedWeapon(targetUnit, weapon);
		}
		// 敵、同盟ユニットが自動反撃可能でなければ通常通り
		else {
			weapon = ItemControl.getEquippedWeapon(targetUnit);
			if (weapon === null) {
				return false;
			}
		}
		
		// superbow1.2改.txtが無い場合はこちら
		if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
			indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), weapon);
		}
		// superbow1.2改.txtが入っていれば強弓などを加味する
		else {
			var skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
			var skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
			indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), weapon, skill_superbow, skill_proximity);
		}
		
		return IndexArray.findPos(indexArray, x, y);
}


})();