
/*----------------------------------------------------------------------
  
  Mini dialogue will flow during battle.

  How to use:
  Add the folder OT_BattleTalk from the plugin folder into your project Plugin Folder.
  Add the folder OT_BattleTalk from the Material folder into your project Material Folder.
  
  Author:
  o-to
  
  Change log:
  2015/09/26: Create new
  2016/02/13: Corresponding to 1.058, an error occurs when activating the skill, so fix it
  
  2017/02/05:
  Fixed the place where the declaration of the variable used for the for loop was forgotten
  *If there is another script that forgets to declare in the same way, unintended behavior will occur.
  
  2017/05/29:
  Fixed a bug where characters who say victory lines and death lines are reversed when finishing off with an HP absorption attack.

  2018/03/05:
  Fixed the face image number 0 and hidden the message when setting the damage receiving motion.

----------------------------------------------------------------------*/
// Constant for each action
var OT_BattleTalkType = {
	  WAIT           : 'Wait'
	, CAUTION        : 'Caution'
	, DANGER         : 'Danger'
	, MOVE           : 'Move'
	, ATTACK         : 'Attack'
	, MAGIC          : 'Magic'
	, COUNTER        : 'Counter'
	, CRITICAL       : 'Critical'
	, ACTIVESKILL    : 'ActiveSkill'
	, PASSIVESKILL   : 'PassiveSkill'
	, DAMAGE         : 'Damage'
	, BLEEDDAMAGE    : 'BleedDamage'
	, DYINGDAMAGE    : 'DyingDamage'
	, NODAMAGE       : 'NoDamage'
	, AVOID          : 'Avoid'
	, DEAD           : 'Dead'
	, VICTORY        : 'Victory'
	, BOTHERVICTORY  : 'BotherVictory'
	, NARROWVICTORY  : 'NarrowVictory'
	, LEVELUPLOW     : 'LevelUpLow'
	, LEVELUP        : 'LevelUp'
	, LEVELUPHIGH    : 'LevelUpHigh'
	, LEVELUPTOPFORM : 'LevelUpTopForm'
	, LEVELUPMAX     : 'LevelUpMax'
};

// Properties for in-battle mini-dialogs
// Declared outside the function for external reference such as EventTalkSet.js
var OT_BattleTalkData = {

	MessageColor:null,
	MessageFont :null,
	WindowPic   :null,
	
	FrameX:0,				// Frame horizontal coordinate adjustment
	FrameY:324,				// Frame ordinate adjustment
	FrameName:'window.png',	// filename of the frame image
	TalkWidth:7,			// length of frame

	isInit        :false,
	aryClassData  :null,
	aryUnitData   :null,
	aryCustomData :null,
	nowTalk       : {0:''   , 1:''  },
	nowFace       : {0:null , 1:null},
	nowAttackCount: {0:0    , 1:0   },
	nowIndex      : {0:''   , 1:''  },

	InitBattleTalkData: function() {
		this.MessageColor = 0xffffff;
		this.MessageFont  = root.getBaseData().getFontList().getData(0);
		this.WindowPic    = root.getMaterialManager().createImage('OT_BattleTalk', this.FrameName);

		this.InitClassData();
		this.InitUnitData();
		this.InitCustomData();
	},

	InitClassData: function() {
		this.aryClassData = {};

		var tmp = root.getMaterialManager().getText('OT_BattleTalk', 'Class.ini');
		if(tmp == "")
		{
			root.msg('\\Material\\OT_BattleTalk\\ does not have Class.ini or the file is empty.');
			return ;
		}
		
		this.aryClassData = this.GetIniData(tmp, 'class');
	},

	InitUnitData: function() {
		this.aryUnitData = {};

		var tmp = root.getMaterialManager().getText('OT_BattleTalk', 'Unit.ini');
		if(tmp == "")
		{
			root.msg('\\Material\\OT_BattleTalk\\ does not have Unit.ini or the file is empty.');
			return ;
		}
		
		this.aryUnitData = this.GetIniData(tmp, 'unit');
	},

	InitCustomData: function() {
		this.aryCustomData = {};

		var tmp = root.getMaterialManager().getText('OT_BattleTalk', 'Custom.ini');
		if(tmp == "")
		{
			root.msg('\\Material\\OT_BattleTalk\\ does not have Custom.ini or the file is empty.');
			return ;
		}
		
		this.aryCustomData = this.GetIniData(tmp, 'custom');
	},

	GetTest: function() {
		
	},

	// Get talk data
	GetTalkData: function(unit, index) {
		var classID = unit.getClass().getId();
		var unitID = unit.getId();
		var talkID = unit.custom.OT_BattleTalkID;
		var talk = "";

		if( index != null )
		{
			if( talkID != null && this.CheckCustomData(talkID) )
			{
				talk = this.GetCustomTalkData(talkID, index);
			}
			else if( this.CheckUnitData(unitID) )
			{
				talk = this.GetUnitTalkData(unitID, index);
			}
			else
			{
				talk = this.GetClassTalkData(classID, index);
			}
		}

		return talk;
	},

	// Get face data
	GetFaceData: function(unit, index) {
		var classID = unit.getClass().getId();
		var unitID = unit.getId();
		var talkID = unit.custom.OT_BattleTalkID;
		var face = null;

		if( index != null )
		{
			if( talkID != null && this.CheckCustomData(talkID) )
			{
				face = this.GetCustomFaceData(talkID, index);
			}
			else if( this.CheckUnitData(unitID) )
			{
				face = this.GetUnitFaceData(unitID, index);
			}
			else
			{
				talk = this.GetClassTalkData(classID, index);
			}
		}

		return face;
	},
	
	// Acquisition of talk data by class
	GetClassTalkData: function(Section, Key) {
		if( this.aryClassData[Section] != null && Key in this.aryClassData[Section] )
		{
			var count = (this.aryClassData[Section][Key]['TALK'].length);
			var no = root.getRandomNumber() % count;
			return this.aryClassData[Section][Key]['TALK'][no];
		}
		
		return '';
	},

	// Acquisition of talk data by unit
	GetUnitTalkData: function(Section, Key) {
		if( this.aryUnitData[Section] != null && Key in this.aryUnitData[Section] )
		{
			var count = (this.aryUnitData[Section][Key]['TALK'].length);
			var no = root.getRandomNumber() % count;
			return this.aryUnitData[Section][Key]['TALK'][no];
		}
		
		return '';
	},

	// Custom talk data acquisition
	GetCustomTalkData: function(Section, Key) {
		if( this.aryCustomData[Section] != null && Key in this.aryCustomData[Section] )
		{
			var count = (this.aryCustomData[Section][Key]['TALK'].length);
			var no = root.getRandomNumber() % count;
			return this.aryCustomData[Section][Key]['TALK'][no];
		}

		return '';
	},

	// Acquisition of facial expression data by class
	GetClassFaceData: function(Section, Key) {
		if( this.aryClassData[Section] != null && Key in this.aryClassData[Section] )
		{
			var count = (this.aryClassData[Section][Key]['FACE'].length);
			if( count <= 0 ) return null;

			var no = root.getRandomNumber() % count;
			return this.aryClassData[Section][Key]['FACE'][no];
		}
		
		return null;
	},

	// Acquisition of facial expression data by unit
	GetUnitFaceData: function(Section, Key) {
		if( this.aryUnitData[Section] != null && Key in this.aryUnitData[Section] )
		{
			var count = (this.aryUnitData[Section][Key]['FACE'].length);
			if( count <= 0 ) return null;

			var no = root.getRandomNumber() % count;
			return this.aryUnitData[Section][Key]['FACE'][no];
		}
		
		return null;
	},

	// Get custom facial expression data
	GetCustomFaceData: function(Section, Key) {
		if( this.aryCustomData[Section] != null && Key in this.aryCustomData[Section] )
		{
			var count = (this.aryCustomData[Section][Key]['FACE'].length);
			if( count <= 0 ) return null;

			var no = root.getRandomNumber() % count;
			return this.aryCustomData[Section][Key]['FACE'][no];
		}

		return null;
	},
	
	// Check if there is talk data for each unit
	CheckUnitData: function(Section) {
		if( this.aryUnitData[Section] != null )
		{
			return true;
		}
		return false;
	},

	// Check if special setting talk data exists
	CheckCustomData: function(Section) {
		if( this.aryCustomData[Section] != null )
		{
			return true;
		}
		return false;
	},

	// Dialogue setting
	SetTalk: function(unit, index, isRight) {
		isRight -= 0;
		var classID = unit.getClass().getId();
		var unitID = unit.getId();
		var talkID = unit.custom.OT_BattleTalkID;
		var talk = "";
		var face = null;

		if( index != null )
		{
			talk = this.GetTalkData(unit, index);
			face = this.GetFaceData(unit, index);
			this.nowTalk[isRight] = talk;
			this.nowFace[isRight] = face;
			this.nowIndex[isRight] = index;
		}

		return talk;
	},

	// Dialogue when waiting
	SetWaitTalk: function(unit, isRight) {
		isRight -= 0;
		var hp = unit.getHp();
		var Mhp = ParamBonus.getMhp(unit);
		var talk = "";

		if( hp <= ( Mhp / 4 ) )
		{
			talk = this.SetTalk(unit, OT_BattleTalkType.DANGER, isRight);
		}
		
		if( hp <= ( Mhp / 2 ) && talk == '')
		{
			talk = this.SetTalk(unit, OT_BattleTalkType.CAUTION, isRight);
		}
		
		if( talk == '' )
		{
			return this.SetTalk(unit, OT_BattleTalkType.WAIT, isRight);
		}

		if( this.nowFace[isRight] == null )
		{
			this.nowFace[isRight] = this.GetFaceData(unit, OT_BattleTalkType.WAIT);
		}
		
		return talk;
	},

	// words of attack
	SetAttackTalk: function(unit, isRight, isSrc, isCritical, motionType) {
		isRight -= 0;
		var hp = unit.getHp();
		var Mhp = ParamBonus.getMhp(unit);
		var talk = "";
		var type;

		if( motionType === MotionCategoryType.APPROACH )
		{
			type = OT_BattleTalkType.MOVE;
		}
		else
		{
			if( isCritical )
			{
				type = OT_BattleTalkType.CRITICAL;
			}
			else if( isSrc == false && this.nowAttackCount[isRight] == 0 )
			{
				type = OT_BattleTalkType.COUNTER;
			}
			else
			{
				if( motionType === MotionCategoryType.MAGIC )
				{
					type = OT_BattleTalkType.MAGIC;
				}
				else
				{
					type = OT_BattleTalkType.ATTACK;
				}
			}
		}
		this.nowAttackCount[isRight]++;

		talk = this.SetTalk(unit, type, isRight);
		
		if( talk == '' )
		{
			return this.SetTalk(unit, OT_BattleTalkType.ATTACK, isRight);
		}

		if( this.nowFace[isRight] == null )
		{
			this.nowFace[isRight] = this.GetFaceData(unit, OT_BattleTalkType.ATTACK);
		}
		
		return talk;
	},
	
	// Dialogue when receiving damage
	SetDamageTalk: function(unit, isRight, damage) {
		isRight -= 0;
		var hp = unit.getHp() - damage;
		var Mhp = ParamBonus.getMhp(unit);
		var talk = "";

		if( damage > 0 )
		{
			if( hp <= ( Mhp / 4 ) )
			{
				talk = this.SetTalk(unit, OT_BattleTalkType.DYINGDAMAGE, isRight);
			}
			
			if( hp <= ( Mhp / 2 ) && talk == '' )
			{
				talk = this.SetTalk(unit, OT_BattleTalkType.BLEEDDAMAGE, isRight);
			}
	
			if( talk == '' )
			{
				return this.SetTalk(unit, OT_BattleTalkType.DAMAGE, isRight);
			}

			if( this.nowFace[isRight] == null )
			{
				this.nowFace[isRight] = this.GetFaceData(unit, OT_BattleTalkType.DAMAGE);
			}

		}
		else if( damage == 0 )
		{
			return this.SetTalk( unit, OT_BattleTalkType.NODAMAGE, isRight );
		}

		return talk;
	},

	// words of victory
	SetVictoryTalk: function(unit, isRight) {
		isRight -= 0;
		var hp = unit.getHp();
		var Mhp = ParamBonus.getMhp(unit);
		var talk = "";

		if( hp <= ( Mhp / 4 ) )
		{
			talk = this.SetTalk(unit, OT_BattleTalkType.NARROWVICTORY, isRight);
		}
		
		if( hp <= ( Mhp / 2 ) && talk == '' )
		{
			talk = this.SetTalk(unit, OT_BattleTalkType.BOTHERVICTORY, isRight);
		}

		if( talk == '' )
		{
			return this.SetTalk(unit, OT_BattleTalkType.VICTORY, isRight);
		}

		if( this.nowFace[isRight] == null )
		{
			this.nowFace[isRight] = this.GetFaceData(unit, OT_BattleTalkType.VICTORY);
		}

		return talk;
	},

	// Dialogue when leveling up
	SetLevelUpTalk: function(unit, isRight, num, max) {
		isRight -= 0;
		var hp = unit.getHp();
		var Mhp = ParamBonus.getMhp(unit);
		var talk = "";

		if( num >= 6 && talk == '' )
		{
			talk = this.SetTalk(unit, OT_BattleTalkType.LEVELUPTOPFORM, isRight);
		}
		
		if( num >= 4 && talk == '' )
		{
			talk = this.SetTalk(unit, OT_BattleTalkType.LEVELUPHIGH, isRight);
		}
		
		if( num >= 2 && talk == '' )
		{
			talk = this.SetTalk(unit, OT_BattleTalkType.LEVELUP, isRight);
		}
		
		if( num <= 1 && talk == '' )
		{
			if( max < 6 )
			{
				talk = this.SetTalk(unit, OT_BattleTalkType.LEVELUPLOW, isRight);
			}
			else
			{
				talk = this.SetTalk(unit, OT_BattleTalkType.LEVELUPMAX, isRight);
			}
		}

		if( talk == '' )
		{
			return this.SetTalk(unit, OT_BattleTalkType.LEVELUP, isRight);
		}
		
		if( this.nowFace[isRight] == null )
		{
			this.nowFace[isRight] = this.GetFaceData(unit, OT_BattleTalkType.LEVELUP);
		}

		return talk;
	},
	
	GetTalk: function(unit, isRight) {
		isRight -= 0;
		return this.nowTalk[isRight];
	},

	GetFace: function(unit, isRight) {
		isRight -= 0;
		return this.nowFace[isRight];
	},

	ResetTalk: function() {
		this.nowTalk[0]        = '';
		this.nowTalk[1]        = '';
		this.nowFace[0]        = null;
		this.nowFace[1]        = null;
		this.nowAttackCount[0] = 0;
		this.nowAttackCount[1] = 0;
	},

	// Get data from ini file
	GetIniData: function(FileData, name) {
		var arytmpData = {};
		var data = FileData.split(/\r\n|\r|\n/);

		for( var i=0 ; i < data.length ; i++ )
		{
			var m;
			
			// Get uncommented strings
			if (!data[i].match(/^\s*;/))
			{
				if ( m = data[i].match(/^\s*\[([^\]]*)\]/) )
				{
					sec = m[1].replace(/^\s*|\s*$/g, "");
					arytmpData[sec] = new Array();
					
					//root.log(name + 'ID:' + sec + 'begin loading...');
				}
				else if( m = data[i].match(/^\s*(\*)(.*?)=(.*)$/) )
				{
					// ID setting for facial expression data
					if( sec == '' ) continue;
					
					// remove left and right whitespace
					var m1 = m[2].replace(/^\s*|\s*$/g, "");
					var m2 = m[3].replace(/^\s*|\s*$/g, "");

					var v = m2.replace(/^(["'])(.*)\1(.*)$/, "$2");
					
					if( arytmpData[sec][m1] == null )
					{
						arytmpData[sec][m1] = new Array();
						arytmpData[sec][m1]['TALK'] = [];
						arytmpData[sec][m1]['FACE'] = [];
					}
					arytmpData[sec][m1]['FACE'].push(v);
				}
				else if( m = data[i].match(/^\s*(.*?)=(.*)$/) )
				{
					// Dialogue settings for talk data
					if( sec == '' ) continue;
					
					// remove left and right whitespace
					var m1 = m[1].replace(/^\s*|\s*$/g, "");
					var m2 = m[2].replace(/^\s*|\s*$/g, "");

					var v = m2.replace(/^(["'])(.*)\1(.*)$/, "$2");
					
					if( arytmpData[sec][m1] == null )
					{
						arytmpData[sec][m1] = new Array();
						arytmpData[sec][m1]['TALK'] = [];
						arytmpData[sec][m1]['FACE'] = [];
					}
					arytmpData[sec][m1]['TALK'].push(v);
				}
			}
		}
		return arytmpData;
	}

};

(function() {

// Load data at game initialization
var alias0 = ScriptCall_Setup;
ScriptCall_Setup = function() {
	alias0.call(this);
	
	OT_BattleTalkData.InitBattleTalkData();
	//Root.log('initialization run');
};

var alias1 = UIBattleLayout._drawMain;
UIBattleLayout._drawMain = function() {
	alias1.call(this);
	
	var rightUnit = this._battlerRight.getUnit();
	var leftUnit = this._battlerLeft.getUnit();

	this.BT_BattleTalk(rightUnit, true);
	this.BT_BattleTalk(leftUnit, false);
};

// drawing a frame
var alias1_2 = UIBattleLayout._drawFrame;
UIBattleLayout._drawFrame = function(isTop) {
	if (!isTop) {
		var x, y;
		var dx = this._getIntervalX();
		var pic   = OT_BattleTalkData.WindowPic;
	
		var count = OT_BattleTalkData.TalkWidth;
		var width = TitleRenderer.getTitlePartsWidth();
		var height = TitleRenderer.getTitlePartsHeight();
		var picWidth = (width * count) + width * 2;
	
		y = OT_BattleTalkData.FrameY;

		x = 0 + dx + OT_BattleTalkData.FrameX;
		TitleRenderer.drawTitle(pic, x, y, width, height, count);
		x = 640 - picWidth + dx - OT_BattleTalkData.FrameX;
		TitleRenderer.drawTitle(pic, x, y, width, height, count);
	}

	alias1_2.call(this, isTop);
};
	
// Dialogue display
UIBattleLayout.BT_BattleTalk = function(unit, isRight) {
	var x, y;
	var dx = this._getIntervalX();
	var width = TitleRenderer.getTitlePartsWidth();
	var height = TitleRenderer.getTitlePartsHeight();

	var color = OT_BattleTalkData.MessageColor;
	var font  = OT_BattleTalkData.MessageFont;
	var text  = OT_BattleTalkData.GetTalk( unit, isRight );

	var count = OT_BattleTalkData.TalkWidth;
	var picWidth = (width * count) + width * 2;
	var textWidth = root.getGraphicsManager().getTextWidth(text, font);
	var areaWidth = width * count;
	
	if (isRight) {
		x = 640 - picWidth + dx - OT_BattleTalkData.FrameX;
	}
	else {
		x = 0 + dx + OT_BattleTalkData.FrameX;
	}

	y = OT_BattleTalkData.FrameY;

	//root.log('text width: ' + textWidth);
	//root.log('window width: ' + width *count);
	
	// If the text is more than one line, align it to the left
	if( textWidth > areaWidth )
	{
		TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.LEFT, null, count);
	}
	else
	{
		TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.CENTER, null, count);
	}
};

// Flag when setting motion
var alias2 = AnimeMotion.setMotionId;
AnimeMotion.setMotionId = function(motionId) {
	alias2.call(this, motionId);
	
	if( this._unit != null )
	{
		this._unit.custom.tmpBattleTalkInit = true;
	}
};

// Set dialogue when setting motion
var alias3 = BaseBattler.moveBattler;
BaseBattler.moveBattler = function() {
	var result = alias3.call(this);

	var order = this._realBattle.getAttackOrder();
	var motionType = this.getMotionCategoryType();
	var isRight = this._realBattle.getBattler(true) === this;

	// Set the dialogue according to the motion
	if(this._unit.custom.tmpBattleTalkInit != null)
	{
		delete this._unit.custom.tmpBattleTalkInit;
		var type = "";
		
		if (motionType === MotionCategoryType.NORMAL) {
			OT_BattleTalkData.SetWaitTalk( this._unit, isRight );
			return result;
		}
		else if 
		(
			   motionType === MotionCategoryType.ATTACK
			|| motionType === MotionCategoryType.THROW
			|| motionType === MotionCategoryType.SHOOT
			|| motionType === MotionCategoryType.MAGIC
			|| motionType === MotionCategoryType.APPROACH
		)
		{
			OT_BattleTalkData.SetAttackTalk(this._unit, isRight, this._isSrc, order.isCurrentCritical(), motionType);
			return result;
		}
		else if (motionType === MotionCategoryType.AVOID) {
			type = OT_BattleTalkType.AVOID;
		}
		
		if(type !== "") {
			OT_BattleTalkData.SetTalk( this._unit, type, isRight );
		}
	}
	
	return result;
};

// Set a line at the moment of receiving damage
var alias4 = RealBattle._checkDamage;
RealBattle._checkDamage = function(unit, damage, battler) {
	alias4.call(this, unit, damage, battler);
	
	var order = this._order;
	var isCritical = order.isCurrentCritical();
	var isFinish = order.isCurrentFinish();
	var passive = battler.getUnit();
	var isRight = battler === this.getBattler(true);
	var type = OT_BattleTalkType.DAMAGE;
	
	if(isFinish)
	{
		// In the HP absorption attack, this function is called twice, the first argument is the defending unit
		// The second time, the attacking unit is handed over and called.
		// Therefore, if you hit the end with HP absorption, at the time of the second function call
		// Because the character who says the victory line and the death line is reversed
		// Ignore dialogue processing if the first argument when the final blow occurs is the attacking unit
		if( order.getActiveUnit() !== unit )
		{
			return;
		}
		
		type = OT_BattleTalkType.DEAD;
		
		// Death line for those who died
		OT_BattleTalkData.SetTalk( passive, type, isRight );

		// The one who wins wins
		OT_BattleTalkData.SetVictoryTalk( unit, !isRight );
	}
	else 
	{
		// Damage dialogue
		OT_BattleTalkData.SetDamageTalk( passive, isRight, damage );
	}

};

// Reset lines at the start of battle
var alias5 = CoreAttack.enterCoreAttackCycle;
CoreAttack.enterCoreAttackCycle = function(attackParam) {
	alias5.call(this, attackParam);
	
	// serif set
	OT_BattleTalkData.ResetTalk( );
};

// Set a line when the skill is activated
var alias6 = SkillProjector.startProjector;
SkillProjector.startProjector = function(rightSkillArray, leftSkillArray, isRight) {
	alias6.call(this, rightSkillArray, leftSkillArray, isRight);
	
	var active, passive;

	if (this._flag & SkillProjectorFlag.TEXT) {
		var order = this._projectorText._battleObject.getAttackOrder();
	}
	
	if (this._flag & SkillProjectorFlag.ANIME) {
		var order = this._projectorAnime._battleObject.getAttackOrder();
	}

	active  = order.getActiveUnit();
	passive = order.getPassiveUnit();

	if (isRight) {
		if( rightSkillArray.length > 0 )
		{
			OT_BattleTalkData.SetTalk( active, OT_BattleTalkType.ACTIVESKILL, true );
		}
		if( leftSkillArray.length > 0 )
		{
			OT_BattleTalkData.SetTalk( passive, OT_BattleTalkType.PASSIVESKILL, false );
		}
	}
	else {
		if( rightSkillArray.length > 0 )
		{
			OT_BattleTalkData.SetTalk( passive, OT_BattleTalkType.PASSIVESKILL, true );
		}
		if( leftSkillArray.length > 0 )
		{
			OT_BattleTalkData.SetTalk( active, OT_BattleTalkType.ACTIVESKILL, false );
		}
	}
};

// Set lines when leveling up
var alias7 = LevelupView._moveAnime;
LevelupView._moveAnime = function() {
	var result = alias7.call(this);

	if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
		var count = this._growthArray.length;
		var num = 0;
		var max = 0;
		
		for (var i = 0; i < count; i++)
		{
			if( this._growthArray[i] > 0 ) num++;

			if( ParamGroup.getClassUnitValue(this._targetUnit, i) >= ParamGroup.getMaxValue(this._targetUnit, i) )
			{
				max++;
			}
		}
		
		OT_BattleTalkData.SetLevelUpTalk( this._targetUnit, true, num, max );
	}
	
	return result;
};

// Face-to-face relationship
var alias100 = UIBattleLayout._drawFaceArea;
UIBattleLayout._drawFaceArea = function(unit, isRight) {
	var FaceID = OT_BattleTalkData.GetFace(unit, isRight);
	
	if( FaceID == null) {
		alias100.call(this, unit, isRight);
	}
	else
	{
		var x, y;
		var dx = 20 + this._getIntervalX();
		var isReverse = false;
		
		if (isRight) {
			x = this._getBattleAreaWidth() - GraphicsFormat.FACE_WIDTH - dx;
		}
		else {
			x = 0 + dx;
			isReverse = true;
		}
		
		y = (0 + this._getBattleAreaHeight()) - GraphicsFormat.FACE_HEIGHT - 15;

		drawUnitFaceTalkCustom(x, y, unit, isReverse, 255, FaceID);
	}
};

drawUnitFaceTalkCustom = function(x, y, unit, isReverse, alpha, FaceID) {
	var handle = unit.getFaceResourceHandle();
	var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();
	
	graphicsRenderParam.alpha = alpha;
	graphicsRenderParam.isReverse = isReverse;
	GraphicsRenderer.drawImageParamTalkCustom(x, y, handle, GraphicsType.FACE, graphicsRenderParam, FaceID);
};

GraphicsRenderer.drawImageParamTalkCustom = function(xDest, yDest, handle, graphicsType, graphicsRenderParam, FaceID) {
	var pic = this.getGraphics(handle, graphicsType);
	var xSrc = handle.getSrcX();
	var ySrc = handle.getSrcY();
	var x = 0;

	if (FaceID !== null)
	{
		xSrc = Math.floor(FaceID % 6);
		ySrc = Math.floor(FaceID / 6);
	}

	var size = this.getGraphicsSize(graphicsType, pic);
	var destWidth = size.width;
	var destHeight = size.height;
	var srcWidth = destWidth;
	var srcHeight = destHeight;

	if (root.isLargeFaceUse() && pic.isLargeImage()) {
		srcWidth = root.getLargeFaceWidth();
		srcHeight = root.getLargeFaceHeight();
	}
	
	if (pic !== null) {
		if (graphicsRenderParam !== null) {
			if (graphicsRenderParam.alpha !== 255) {
				pic.setAlpha(graphicsRenderParam.alpha);
			}
			
			if (graphicsRenderParam.isReverse) {
				pic.setReverse(graphicsRenderParam.isReverse);
				//x = srcWidth - destWidth;
			}
			
			if (graphicsRenderParam.degree !== 0) {
				pic.setDegree(graphicsRenderParam.degree);
			}
		}

		xSrc *= srcWidth;
		ySrc *= srcHeight;
		pic.drawStretchParts(xDest - x, yDest, destWidth, destHeight, xSrc, ySrc, srcWidth, srcHeight);
	}
};

})();
