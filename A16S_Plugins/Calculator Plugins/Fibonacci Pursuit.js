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

    Calculator.calculateRoundCount = function(active, passive, weapon) {
            var rounds = alias001.call(this,active, passive, weapon)
            var value, index,b,c;
            var activeAgi = AbilityCalculator.getAgility(active, weapon) + this.getAgilityPlus(active, passive, weapon);
		    var passiveAgi = AbilityCalculator.getAgility(passive, ItemControl.getEquippedWeapon(passive));
            
            
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
        
            return rounds

        }
})();