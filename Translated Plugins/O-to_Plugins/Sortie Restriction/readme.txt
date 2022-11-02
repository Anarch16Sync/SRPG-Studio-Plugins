-------------------------------------------------- ---------------------------------------
【Change log】
  2015/09/06:
  Script creation of sortie prohibition setting
  
  2016/02/28:
  Fixed because it was an error due to official function deletion

-------------------------------------------------- ---------------------------------------
[Introduction method]
Put "OT_NGSortie" in the Plugin folder.

-------------------------------------------------- ---------------------------------------
【Overview】
By passing a custom parameter in the map settings, you will be able to set whether the unit can sortie.

Also from "Execute Code" in "Execute Script" of the event
You will be able to set a sortie prohibition flag for each unit.
Characters with the sortie prohibited flag will not be able to select a sortie during sortie preparation.
This is effective when you want to prohibit sorties during multiple maps.

The items that can be set for event sortie prohibition are as follows.

・Set the sortie prohibition flag individually SetNGSortieList( { unit ID:flag, … } );
・Sortie prohibited for all characters AllNGSortieList();
・Release all character sortie prohibition flag SetNGSortieList();
・Prohibit sorties only for sortied characters AddSortieNGSortieList();
・Prohibit characters that have not sortied from sortie AddNonSortieNGSortieList();

Units with a sortie prohibition flag set
You can only sortie on maps that are enabled for sortie in the map settings.

-------------------------------------------------- ---------------------------------------
[How to use (map settings)]
In custom parameter of map information
{ OT_NGSortie:{ unit ID: setting, unit ID: setting, … } }
and set.
the flag is
At 0, you can sortie regardless of the unit's sortie prohibition flag,
1 is prohibited from sortieing.

Units not set here can sortie
It is determined by the sortie prohibition flag set for each unit.

Example: Allow unit number 0 to sortie, and prohibit sortie to unit numbers 2 and 3
{
  OT_NGSortie: { 0:0, 2:1, 3:1 }
}

-------------------------------------------------- ---------------------------------------
[How to use (event)]
◆Sortie ban flag setting:
Check "Execute code" in "Execute script" of the event command,
in the text area
SetNGSortieList(
  { unit ID: flag, unit ID: flag, … }
);
Write like this:
The flag part is 1 to prohibit sortie, 0 to cancel sortie prohibition.

Example: Disable unit number 0, release ban on unit number 2
SetNGSortieList( { 0:1, 2:0 } );

ーーーーーーーーーー
Prohibition of sortie for all characters:
Check "Execute code" in "Execute script" of the event command,
Write AllNGSortieList(); in the text area.

If you want to allow only some characters to sortie (but not forcibly), in the text area
AllNGSortieList();
SetNGSortieList( {Unit ID:0, Unit ID:0, …} );
By writing, only the specified unit will be able to sortie.

Example: Allow only unit numbers 1, 2 and 3 to sortie
AllNGSortieList();
SetNGSortieList( { 1:0, 2:0, 3:0 } );

ーーーーーーーーーー
◆ Unlock all character sortie ban flag:
Check "Execute code" in "Execute script" of the event command,
Write SetNGSortieList(); in the text area.

ーーーーーーーーーー
◆ Prohibit sorties only for characters that have sortied:
Check "Execute code" in "Execute script" of the event command,
Write AddSortieNGSortieList(); in the text area.
It is used in situations such as dividing troops on multiple maps.
(If you want to use it, please use it before clearing the map)

ーーーーーーーーーー
◆ Prohibit characters that have not sortied:
Check "Execute code" in "Execute script" of the event command,
Write AddNonSortieNGSortieList(); in the text area.
When preparing for a sortie on a map with multiple configurations
Use this when you want to allow only characters that sortied on the previous map.
(If you want to use it, please use it before clearing the map)