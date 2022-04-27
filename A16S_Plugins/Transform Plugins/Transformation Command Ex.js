/* Transformation Command EX

Author: Anarch16Sync

Overview: 
This plugin adds multiple features to the Transformation command from skills
* The Transformation Command doesn't appear if there aren't any valid transformation options
* The Cancel Transformation Command doesn't appear if the original class can't move on the current terrain
* Adds a Config option to allow for skipping the transformation select screen when there is only one possible transformation.

Custom Parameter:
Add {FastTransform: 1} on "DataBase -> Config -> Script ->Env Parameters".

Changelog:

ver 1.0 (27/04/2020)
Created


Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.
*/

/* ---------------------------------------
NEW FUNCTIONS
-------------------------------------------- */
//New function that returns the number of valid transformations from a list
MetamorphozeControl.MetamorphozeAllowedCount = function(unit, refList){
    var i, classEntry, metamorphozeData;
    var count = refList.getTypeCount();
	var classEntryCount = 0;

    for (i = 0; i < count; i++) {
        metamorphozeData = refList.getTypeData(i);
        classEntry = StructureBuilder.buildMultiClassEntry();
        classEntry.cls = metamorphozeData.getClass();
        classEntry.isChange = MetamorphozeControl.isMetamorphozeAllowed(unit, metamorphozeData);
        if (classEntry.isChange) {
            classEntryCount += 1;
        }
    }
    return classEntryCount
}

//New function that returns the index of the first valid transformation from a data list
MetamorphozeControl.getAllowedMetamorphozeIndex = function(unit, refList){
    var i, classEntry, metamorphozeData;
    var count = refList.getTypeCount();

    for (i = 0; i < count; i++) {
        metamorphozeData = refList.getTypeData(i);
        classEntry = StructureBuilder.buildMultiClassEntry();
        classEntry.cls = metamorphozeData.getClass();
        classEntry.isChange = MetamorphozeControl.isMetamorphozeAllowed(unit, metamorphozeData);
        if (classEntry.isChange) {
            return i;
        }
    }

}

//New function that determines if it's possible to cancel the transformation
MetamorphozeControl.isCancelAllowed = function(unit){
    //var SourceClass = unit.getUnitStyle().getSourceClass();
    virtualUnit= root.getObjectGenerator().generateUnitFromBaseUnit(unit)
    virtualUnit.setInvisible(true);
    MetamorphozeControl.clearMetamorphoze(virtualUnit)
    if (PosChecker.getMovePointFromUnit(unit.getMapX(),unit.getMapY(),virtualUnit) === 0 ){
        virtualUnit.setAliveState(AliveType.ERASE)
        return false
    }
    virtualUnit.setAliveState(AliveType.ERASE)
    return true
}

ConfigItem.FastTransformation = defineObject(BaseConfigtItem,
    {
        selectFlag: function(index) {
            root.getExternalData().env.FastTransform = index;;
        },
        
        getFlagValue: function() {
            if (typeof root.getExternalData().env.FastTransform !== 'number') {
                return 0;
            }
        
            return root.getExternalData().env.FastTransform;
        },
        
        getConfigItemTitle: function() {
            return 'Fast Transformation';
        },
        
        getConfigItemDescription: function() {
            return 'Skips the selection screen when only 1 transformation is possible';
        }
    }
    );

/* ---------------------------------------
ALIASED FUNCTIONS
-------------------------------------------- */

//Alis of the original function
var aliasConfigWindow1 = ConfigWindow._configureConfigItem;

ConfigWindow._configureConfigItem = function(groupArray) {
	aliasConfigWindow1.call(this, groupArray);

    groupArray.insertObject(ConfigItem.FastTransformation, 6);
};


//Alias of the original function
var aliasMetamorphozeCancelCommand001 = UnitCommand.MetamorphozeCancel.isCommandDisplayable;

UnitCommand.MetamorphozeCancel.isCommandDisplayable = function(){
    //We save the result of the original funtion
    var aliasReturn = aliasMetamorphozeCancelCommand001.call(this);

    //We add our new condition to the return value
    return aliasReturn && MetamorphozeControl.isCancelAllowed(this.getCommandTarget());

}

//Alias of the original function
var aliasMetamorphozeCommand001 = UnitCommand.Metamorphoze.isCommandDisplayable;

UnitCommand.Metamorphoze.isCommandDisplayable = function() {
    var unit = this.getCommandTarget();
    var refList = this._skill.getDataReferenceList()
    //We save the result of the original funtion
    var aliasReturn = aliasMetamorphozeCommand001.call(this)

    //We add our new condition to the return value
    return aliasReturn && (MetamorphozeControl.MetamorphozeAllowedCount(unit,refList)>0)

}

var aliasMetamorphozeCommand002 = UnitCommand.Metamorphoze._completeCommandMemberData

UnitCommand.Metamorphoze._completeCommandMemberData = function() {
    var isMetamorphozeSelectDisabled = false
    var index
    //Config flagValue is 0 because is an index for [ON,OFF] as shown in the config menu
    if (ConfigItem.FastTransformation.getFlagValue() === 0){
        if (MetamorphozeControl.MetamorphozeAllowedCount(this.getCommandTarget(),this._skill.getDataReferenceList())=== 1){
            isMetamorphozeSelectDisabled = true;
        }
    }
    if(isMetamorphozeSelectDisabled){
        index = MetamorphozeControl.getAllowedMetamorphozeIndex(this.getCommandTarget(),this._skill.getDataReferenceList())
        this._metamorphozeData = this._skill.getDataReferenceList().getTypeData(index)
        this._changeEvent()
    }else{
        aliasMetamorphozeCommand002.call(this)
    }
}