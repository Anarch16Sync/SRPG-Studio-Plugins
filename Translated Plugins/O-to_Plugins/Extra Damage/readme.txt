-------------------------------------------------- ---------------------------------------
ÅyChange logÅz
  2017/07/03: New

-------------------------------------------------- ---------------------------------------
[Introduction method]
Put "OT_ExtraConfigDamage" in the Plugin folder.

-------------------------------------------------- ---------------------------------------
ÅyOverviewÅz
By introducing it, level difference correction and error will occur in damage.

-------------------------------------------------- ---------------------------------------
Åyhow to useÅz
OT_ExtraConfigDamage\DamageCorrection.js
By changing the value of the array described in , you can correct the correction value and the presence or absence of the correction to the final damage.
*Final damage includes skills, attack power, opponent's defense power, presence or absence of critical hits, etc.
Å@This is the damage value to the opponent's unit calculated after various calculations.

OT_DCLevel : Apply level correction to final damage
OT_DCTolerance: add error to final damage

If both corrections are enabled, the correction processing order is level difference correction Å® damage error.

Å° How to set
ÅEOT_DCLevel
Level correction is added to the final damage. For example setting below
When a Lv3 unit and a Lv1 unit battle,
The damage dealt by a Lv3 unit is (damage value x 110%)
The damage dealt by a Lv1 unit is (damage value x 90%).

OT_DCLevel = {
Enable : true // true: yes, false: no
, Value : 5 // Correction value for 1 level difference (%)
, Max : 50 // upper limit of correction value (%)
};

ÅEOT_DCTolerance
There will be an error in the final damage. For example setting below
If the damage dealt to the opponent is 10, the final damage dealt will be anywhere from 8 to 12.

OT_DCTolerance = {
Enable : true // true: yes, false: no
, Min : 80 // Minimum value (%)
, Max : 120 // Maximum value (%)
};