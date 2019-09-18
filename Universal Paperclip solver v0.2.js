const ACTIONS_PER_SECOND = 100;
const PROCESSORS = [6, 25,97, 110,1000,1500]
const MEMORY =     [47,97,110,150,250, 500]
const ALWAYS_DO = [
    3,  // creativity
    6,  // limerick
    11, // new slogan
    13, // lexical processing
    14, // combinatory harmonics
    15, // Hadwiger Problem
    17, // T\xF3th Sausage Conjecture
    16, // Hadwiger Clip Diagrams
    19, // donkey space
    50, // Quantum computing
    51, // Photonic chip
    215,216 // Disassemble
];
let ignore = [
    2,   // Beg for wires
    40,  // Bribe (ignored before money goal reached)
    118, // auto tourney
    119, // Theory of mind (ignored before momentum)
    120, // OODA loop
    128, // Strategic Attachment
    133, // Thenodies (ignored before Monument)
    134, // Glory
    147, // Accept the offer
    217  //Quantum reversion
];
let buttons;
let visibleText;
let data;
let scoreboard;
let stratList= ["RANDOM","A100","B100","GREEDY","GENEROUS","MINIMAX","TIT FOR TAT","BEAT LAST"];
let quantumOperational;
let actionsCounter = -1;
let startTime;

// Phase 1
const PRICE_REFRESH_CYCLE = 20;
const STOCK_CYCLE = 100;
const WIRE_TRESHOLD = 16;
const WIRE_BUFFER = 2500;
const WIRE_PROJECTED = 2;
const CHEAPEST_PRICE = 0.01
const INVESTMENT_RATIO_MINI = 0.05;
const INVESTMENT_RATIO = 0.5
const MAX_ENGINE = 7;
let Cmax;
let Cmin;
let marketingSavings = 0;
let fundsToTransfer = 0;
let creativityBreak = false;
let withdrawMoney = false;
let clipBuffer = 1000;
let minSavings = 26;
let recentPrices = [];
const priceFactor1 = Math.pow(0.07,1/2.15); //  Optimal values (for sim 1) based on
const priceFactor2 = Math.pow(7,1/1.15);    //  the game's code.

// Phase 2
const ACTIVATE_X10 = 9;
const ACTIVATE_ALL = 19;
const NEED_PRODUCTION = 500;
const PRODUCTION_BUFFER = 2000;
const PRODUCTION_FACTOR = 0.5;
const MEMORY_LEAVING_EARTH = 135;
const WIRE_BUFFER_2 = 100;
let think = 0;
let farmButtons = ["btnMakeFarm"]
let wireButtons = ["btnMakeWireDrone"]
let harvesterButtons = ["btnMakeHarvester"]
let storageButtons = ["btnBatteryx100","btnBatteryx10","btnMakeBattery"]
let rebuildFactories = false;
let defaultThink = true;

// Phase 3
const SPACE_PERIOD = 1000;
const BATTLE_CYCLE = 50;
const ENEMIES_ALLOWED = 5;
const TO_COMBAT = 8;
const TO_RESSOURCES = 1;
const TO_FACTORIES = 1;
const TO_HAZARDS = 5;
const TO_EXPLORE = 1;
const IGNORE_NEEDS = 12;
const FINAL_BOOST = 5
let maxProbeTrust = 20;
let extraTrust = 0;
let trustAvailable = 0;
let trustTypes = ["< > Speed:","< > Exploration:","< > Self-Replication:","< > Hazard Remediation:","< > Factory Production:","< > Harvester Drone Production:","< > Wire Drone Production:","< > Combat:"];
let trustButtons = ["Speed","Nav","Rep","Haz","Fac","Harv","Wire","Combat"]
let needs = ["exploration","ressources","factories"];
let trustPlan = {};
let needsEnd = {};
let fighters = {"allies":0,"enemies":0};
let battleCanvas = document.getElementById("canvas").getContext("2d");
const battleWidth = document.getElementById("canvas").width;
const battleHeight = document.getElementById("canvas").height;
const battleLength = battleWidth*battleHeight*4;
let finalBoost = 1;

// API
function isVisible(el) {
    // source:https://stackoverflow.com/questions/44612141/get-only-visible-element-using-pure-javascript
    while (el) {
        if (el === document) {
            return true;
        }
        var $style = window.getComputedStyle(el, null);
        if (!el) {
            return false;
        } else if (!$style) {
            return false;
        } else if ($style.display === 'none') {
            return false;
        } else if ($style.visibility === 'hidden') {
            return false;
        } else if (+$style.opacity === 0) {
            return false;
        } else if (($style.display === 'block' || $style.display === 'inline-block') &&
            $style.height === '0px' && $style.overflow === 'hidden') {
            return false;
        } else {
            return $style.position === 'fixed' || isVisible(el.parentNode);
        }
    }
}
function getVisibleText(element) {
    // source : https://stackoverflow.com/questions/1846177/how-do-i-get-just-the-visible-text-with-jquery-or-javascript
    window.getSelection().removeAllRanges();
    var range = document.createRange();
    range.selectNode(element);
    window.getSelection().addRange(range);
    var visibleText = window.getSelection().toString().trim();
    window.getSelection().removeAllRanges();
    return visibleText;
}
function getVisibleButtons(buttonsList){
    _buttons = {}
    for (i = 0; i < buttonsList.length;i++){
        if (isVisible(buttonsList[i])){
            _buttons[buttonsList[i].id] = buttonsList[i];
        }
    };
    _buttons.all = Object.keys(_buttons)
    return _buttons
}
function refreshData(){
    // The first number from each visible line on the page is stored. The key is all the text before the number, on the same line. 
    data = {};
    visibleText = getVisibleText(document.querySelector("body"));
    let regex = /^(([^\n\d]*?)?)([\d,.]*\d)/gm  
    let match = regex.exec(visibleText);
    while (match != null) {
        while (data[match[1].trim()] != null){
            // if two datapoints have the same key, we add a ' to one of them
            match[1] += "'";
        }
        data[match[1].trim()] = parseFloat(match[3].replace(/,/g, ''))
        match = regex.exec(visibleText);
    }
    // Finding buttons that can be clicked:
    buttons = getVisibleButtons(document.querySelectorAll("button:enabled"));
}
function clickButton(buttonId){
    // Allows clicking on buttons from the visible buttons list only
    if (buttons[buttonId]){
        buttons[buttonId].click();
        return true
    }
    return false
}
function clickButtons(buttonsIds){
    for (var i = 0; i < buttonsIds.length; i++) {
        if (clickButton(buttonsIds[i])){
            return true
        }
    }
    return false
}

//  Game agent
function useTrust(){
    if (creativityBreak & (data["Trust:"] < 10 + PROCESSORS[1])){return false}
    if ((!buttons["btnQcompute"]) & (data.Memory  == 10)){return false}
    for (i = 0; i < MEMORY.length;i++){
        if (data.Processors < PROCESSORS[i]){
            return clickButton("btnAddProc")
        } else if (data.Memory < MEMORY[i]){
            return clickButton("btnAddMem")
        }
    }
    return clickButton("btnAddProc")
}
function chooseProjects(projectId){
    return (ALWAYS_DO.includes(projectId)|quantumOperational) & !(ignore.includes(projectId))
}
function doProjects(){
    for (let i = 0; i < buttons.all.length;i++){
        let project = buttons.all[i].match(/projectButton(\d*)/)
        if (project){
            if (!chooseProjects(parseInt(project[1]))){
                continue
            }
            if (quantumOperational){
                if (data["Operations:"] < data.Memory*1000){
                    if (buttons[buttons.all[i]].innerText.match("ops")){
                        continue  // not spending ops on projects to gain creativity faster
                    }
                }
            }
            clickButton(buttons.all[i])
            console.log(buttons[buttons.all[i]].innerText);
            switch(parseInt(project[1])) {
                case 16:     // Hadwiger Clip Diagrams
                    creativityBreak = true
                    break;
                case 19:      // Donkey Space
                    creativityBreak = false
                    break;
                case 51:      // Photonic chip
                    if (!quantumOperational){
                        playTimer("Time to quantum: ");
                    }
                    break
                case 21:      // Trading
                    fundsToTransfer = data["Cost: $ ''"]*INVESTMENT_RATIO_MINI;
                    break
                case 37:      // Hostile takeover
                    withdrawMoney = false;
                    document.getElementById("investStrat").selectedIndex = 2;
                    fundsToTransfer = Math.max(fundsToTransfer, data["Cost: $ '''"]*INVESTMENT_RATIO)
                    break
                case 38:      // Full monopoly 
                    withdrawMoney = false;
                    document.getElementById("investStrat").selectedIndex = 2;
                    fundsToTransfer = Math.max(fundsToTransfer, data["Cost: $ '''"]*INVESTMENT_RATIO)
                    break
                case 35:  // hypnodrones
                    playTimer("Time to freedom: ");
                    break
                case 102: // self-correcting supply chain
                    think = 197;
                    defaultThink = false;
                    rebuildFactories = true
                    break
                case 125: // Momentum
                    ignore = ignore.filter(x => x!=119);
                    break;
                case 125: // swarm computing
                    defaultThink = true
                    break
                case 46:  // Space exploration
                    //save2();
                    playTimer("Time to space: ")
                    break
                case 132: // Monument
                    ignore = ignore.filter(x => (x!=128) && (x!=133));
                    break
                case 140: // Emperor
                    playTimer("Time to message:");
                    break
            }
            return true;
        }
    }
    return false;
}
function quantum(){
    if ([...document.querySelectorAll(".qChip")].map(x => parseFloat(x.style.opacity)).reduce((x,y)=>x+y) >0){
        return clickButton("btnQcompute");
    }
    return false
}
function play(){
    actionsCounter++;
    refreshData();
    quantumOperational = buttons["btnQcompute"] && (data["Photonic Chip ("] != 10);
    if (think){
        document.getElementById("slider").value = think;
    }
    if (useTrust()){
        return
    }
    if (doProjects()){
        return
    }
    if (clickButton("btnNewTournament")){
        scoreboard = {"RANDOM":0,"A100":0,"B100":0,"GREEDY":0,"GENEROUS":0,"MINIMAX":0,"TIT FOR TAT":0,"BEAT LAST":0}
        return
    }
    if (clickButtons(["btnRunTournament"])){
        return
    }
    if (data["Cost: $"]){
        if (phase_1()){return};
    } else if(data["Launched:"] == undefined){
        if (phase_2()){return};
    } else {
        if (phase_3()){return};
    }
    if(quantumOperational){
        if (quantum()){
            return
        }
    }
    clickButtons(["btnMakeProbe","btnMakePaperclip","btnBuyWire"])
}

// Phase 1
function findOptimalPrice(){
    //Keeps price as low as possible, as long as we can build enough paperclips to not run out
    updateC();
    let C = (Cmax+Cmin)/2;
    let extraClips = Math.max(data["Unsold Inventory:"]-clipBuffer,0);
    let clipsPerSecond = data["Clips per Second:"] + extraClips;
    if (clipsPerSecond<ACTIONS_PER_SECOND*.75){
        clipsPerSecond = ACTIONS_PER_SECOND
    }
    let bestPrice = Math.ceil(priceFactor1*C/Math.pow(clipsPerSecond,1/2.15)*100)/100;
    if (bestPrice < (C/100)){
        bestPrice = Math.ceil(priceFactor2*C/Math.pow(clipsPerSecond,1/1.15)*100)/100
    }
    return bestPrice
}
function updateC(){
    // Stable approximation of the real value of C, the constant demand*margin
    let _Cmax = data["lower raise Price per Clip: $"]*(data["Public Demand:"]+.4999999)/10
    if (_Cmax == Cmax){return} // no update needed
    let _Cmin = data["lower raise Price per Clip: $"]*(data["Public Demand:"]-.5)/10
    if ((_Cmin > Cmax)|(_Cmax < Cmax)){  // the value of C changed
        Cmin = _Cmin;
        Cmax = _Cmax;
        return
    }
    if (_Cmax < Cmax){
        Cmax = _Cmax;
    }
    if (_Cmin > Cmin){
        Cmin = _Cmin;
    }
}
function isMarketingNeeded(latestPrice){
    // Buy marketing when the price tends bellow 0.01
    recentPrices = recentPrices.length > 4 ? recentPrices.slice(1):recentPrices
    recentPrices.push(latestPrice  <= CHEAPEST_PRICE)
    return recentPrices.filter(x => x).length >= 4
}
function safeToSpend(amount){
    return data["Available Funds: $"] > minSavings + amount;
}
function buyRessources(){
    // Buy marketing
    minSavings = Math.max(data["Cost: $ '"] + WIRE_PROJECTED, minSavings);
    if (marketingSavings){
        if (safeToSpend(data["Cost: $"])){
            if (clickButton("btnExpandMarketing")){
                marketingSavings = 0;
                return true
            }
        }
    }
    // Buy clippers
    let stockSavings = Math.max(fundsToTransfer - data["Available Funds: $"],0)
    if (data["Cost: $ '''"] == undefined){
        if (safeToSpend(data["Cost: $ ''"] + marketingSavings + stockSavings)){
            if (clickButton("btnMakeClipper")){
                clipBuffer = data["Clips per Second:"]*2
                fundsToTransfer += data["Cost: $ ''"] * Boolean(data["Cash: $"]) * INVESTMENT_RATIO_MINI
                return true
            }
        }
    //Buy mega clippers
    } else if (safeToSpend(data["Cost: $ '''"] + marketingSavings + stockSavings)){
        if (clickButton("btnMakeMegaClipper")){
            fundsToTransfer +=  data["Cost: $ '''"]* INVESTMENT_RATIO;
            clipBuffer = data["Clips per Second:"]*2
            return true
        }

    }
}
function transferMoney(){
    let moneyGoal;
    let isFinalGoal = false;
    if (data["Hostile Takeover ($"]){
        moneyGoal = 1000000
    } else if (data["Full Monopoly ("]){
        moneyGoal = 10000000
    } else {
        moneyGoal = 500000*Math.pow(2,Math.min(100 - data["Trust:"],15))
        isFinalGoal = true;
    }
    if (data["Total: $"] + data["Available Funds: $"] > moneyGoal){
        if (clickButton("btnWithdraw")){
            withdrawMoney = true;
            document.getElementById("investStrat").selectedIndex = 0;
            if (isFinalGoal){
                ignore = ignore.filter(x => x!=40);
                // save1();
            }
            return true;
        }
    }
    if (fundsToTransfer & (data.Wire > 1000)){
        if (clickButton("btnInvest")){
            fundsToTransfer -= data["Available Funds: $"];
            return true;
        }
    }   
    return false
}
function phase_1(){
    // Actions executed on a cycle
    if (!(actionsCounter%PRICE_REFRESH_CYCLE)|actionsCounter<100){
        let priceWanted = findOptimalPrice();
        if (isMarketingNeeded(priceWanted)){
            marketingSavings = data["Cost: $"]
        }
        if (data["lower raise Price per Clip: $"] > priceWanted){
            clickButton("btnLowerPrice");
            return true
        }
        if (data["lower raise Price per Clip: $"] < priceWanted){
            clickButton("btnRaisePrice");
            return true
        }
    }
    if(!((actionsCounter+1)%STOCK_CYCLE)){
        if (data["Upgrade Investment Engine Level:"] > 0){
            if (transferMoney()){
                return true
            }
        }
    }
    // Actions executed in between cycles
    if (((data["Cost: $ '"] <= WIRE_TRESHOLD)&(data.Wire <WIRE_BUFFER))){
        //buying wires
        if(clickButton("btnBuyWire")){
            return true
        }
    }
    if (data["Upgrade Investment Engine Level:"] < MAX_ENGINE){
        if (clickButton("btnImproveInvestments")){
            if (data["Upgrade Investment Engine Level:"] == 1){
                document.getElementById("investStrat").selectedIndex = 2;
            }
            return true
        }
    }
    if (!withdrawMoney){
        if (buyRessources()){
            return true
        }
    }
}

// Phase 2
function buildStorage(){
    // Building storage to leave phase 2
    if (data["Battery Tower"] < 1000) {
        clickButtons(storageButtons);
        return true
    } else if (data["Storage:"] < 10000000){
        clickButtons(farmButtons);
        return true
    }
}
function phase_2(){
    if (actionsCounter%2) {return false}
    // think more when there is a surplus of wires
    if (defaultThink){
        if (data["Wire:"] > WIRE_BUFFER_2){
            think = Math.min(think+1,199)
        } else {
            think = Math.max(think-1,1)
        }
    }
    // Disassemble and rebuild factories and drones after the self-assembly project 
    if (rebuildFactories){
        if (clickButtons(['btnFactoryReboot','btnHarvesterReboot','btnWireDroneReboot'])){
            return true
        }
        rebuildFactories = false;
        return false
    }
    // Phase 2 ending:
    if (data['Available Matter:'] > 100 && data['Available Matter:'] < 200 ){
        if (data.Memory < MEMORY_LEAVING_EARTH){
            think = 200;
            if (buildStorage()){
                return true
            }
        } else {
            think = 1;
        }
    }
    if ((data['Available Matter:'] == 0) && (data['Wire:'] == 0) && (data["Acquired Matter:"] == 0)){
        if (Math.floor(data["Unused Clips:"]) != 5){
            if (clickButtons(['btnFactoryReboot','btnHarvesterReboot','btnWireDroneReboot','btnFarmReboot'])){
                return true
            }
        } else if (buildStorage()){
            return true
        }
    }
    // Phase 2 normal:
    // Build solar farms:
    if (data["Consumption:"] < NEED_PRODUCTION){
        if (data["Production:"] <= data["Consumption:"]){
            return clickButtons(farmButtons)
        }
    } else if (data["Production:"] - data["Consumption:"] < Math.min(PRODUCTION_BUFFER,data["Consumption:"]*PRODUCTION_FACTOR)){
        return clickButtons(farmButtons)
    }
    // Make harvester drones:
    if ((!data["Acquired Matter:"]) && (data["Available Matter:"] != 0)){
        if (data["Harvester Drone"] / data["Wire Drone"] < 1.4){
            return clickButtons(harvesterButtons)
        } else {
            return clickButtons(wireButtons)
        }
    }
    // Make wire drones:
    if (((!data["Wire:"]) || (!data["('"])) && (data["Acquired Matter:"] != 0)){
        if (data["Wire Drone"] / data["Harvester Drone"] < 1.4){
            return clickButtons(wireButtons)
        } else {
            return clickButtons(harvesterButtons)
        }
    }
    // Make factories:
    if ((data["Wire:"]||data["('"]) && data["Wire Drone"]){
        if (isVisible(document.getElementById("projectButton102"))) {return false} // saving for self-correcting supply chain
        if (clickButton("btnMakeFactory")){
            if (data["Clip Factory"] == ACTIVATE_X10){
                farmButtons = ["btnFarmx10"].concat(farmButtons);
                wireButtons = ["btnWireDronex10"].concat(wireButtons);
                harvesterButtons =  ["btnHarvesterx10"].concat(harvesterButtons);
            } else if (data["Clip Factory"] == ACTIVATE_ALL) {
                farmButtons = ["btnFarmx100"].concat(farmButtons);
                wireButtons = ["btnWireDronex1000","btnWireDronex100"].concat(wireButtons);
                harvesterButtons =  ["btnHarvesterx1000","btnHarvesterx100"].concat(harvesterButtons);
            }
        return true
        }
    }
}

// Phase 3
function transferTrust(source,dest,amount){
    for (i = 0; i<amount;i++){
        if (trustPlan[source] && trustPlan[dest]+1<maxProbeTrust){
            trustPlan[source] -= 1;
            trustPlan[dest] += 1;
        }
    }
}
function countEnemies(battleImage){
    // Image analysis
    let fightersTotal = 0;
    let fightersAllies = 0;
    for (i = 0;i<battleLength/4;i++){
        fightersAllies += Boolean(battleImage[4*i]);
        fightersTotal += Boolean(battleImage[4*i +3]);
    }
    return {"allies":fightersAllies/9,"enemies":(fightersTotal - fightersAllies)/9};
}
function useProbeTrust(){
    for (i = 0; i<trustTypes.length;i++){
        trustPlan[trustTypes[i]] = 0;
    }
    if (!(actionsCounter%BATTLE_CYCLE) && data["Scale ="]){
        // On a cycle to not slow down the game.
        fighters = countEnemies(battleCanvas.getImageData(0,0,battleWidth,battleHeight).data);
    }
    trustAvailable = data["Trust:"] + extraTrust;
    trustPlan["< > Self-Replication:"] = trustAvailable;
    transferTrust("< > Self-Replication:","< > Hazard Remediation:",TO_HAZARDS);
    if (!isVisible(document.getElementById("victoryDiv"))){
        if ((fighters["enemies"] > ENEMIES_ALLOWED)&&(fighters["allies"] != 0)){
            transferTrust("< > Self-Replication:","< > Combat:",Math.min(TO_COMBAT,trustAvailable-10));
        }
    }
    if (data[""] > 1) {finalBoost = FINAL_BOOST; think = 1};
    if (needsEnd["exploration"] >= actionsCounter){
        transferTrust("< > Self-Replication:","< > Speed:",TO_EXPLORE*finalBoost);
        transferTrust("< > Self-Replication:","< > Exploration:",TO_EXPLORE*finalBoost);
    }
    if (needsEnd["factories"] >= actionsCounter){
        transferTrust("< > Self-Replication:","< > Factory Production:",TO_FACTORIES);
    }
    if (needsEnd["ressources"] >= actionsCounter){
        transferTrust("< > Self-Replication:","< > Wire Drone Production:",TO_RESSOURCES);
        transferTrust("< > Self-Replication:","< > Harvester Drone Production:",TO_RESSOURCES);
    }
    for (i = 0; i<trustTypes.length;i++){
        if (trustPlan[trustTypes[i]] - data[trustTypes[i]] < 0){
            if (clickButton("btnLowerProbe" + trustButtons[i])){
                extraTrust += 1;
                return true
            }
        }
        if (trustPlan[trustTypes[i]] - data[trustTypes[i]] > 0){
            if (clickButton("btnRaiseProbe" + trustButtons[i])){
                extraTrust -= 1;
                return true
            }
        }
    }
}
function phase_3(){
    think = 198;
    needsNow = {
        "exploration":data['Available Matter:'] == 0,
        "ressources":((data['Available Matter:'] != 0) && (data['Acquired Matter:'] == 0))||((data['Acquired Matter:'] != 0) && (data['Wire:'] == 0)),
        "factories":data['Wire:'] != 0
    }
    if (trustAvailable > IGNORE_NEEDS){
        for (i = 0; i < needs.length;i++){
            if(needsNow[needs[i]]){
                needsEnd[needs[i]] = actionsCounter + SPACE_PERIOD
            }
        }
    }
    if (clickButton("btnIncreaseProbeTrust")){
        extraTrust += 1;
        return true
    }
    if (clickButton("btnIncreaseMaxTrust")){
        maxProbeTrust += 10;
        return true
    }
    if (useProbeTrust()){
        return true;
    }
    return false
}

// Select a strategy for yomi tourneys:
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutationRecord) {
      let strat1 = document.getElementById("horizStrat").innerHTML;
      let strat2 = document.getElementById("vertStrat").innerHTML;
      let pointsGained = [...mutationRecord.target.children].map(x => parseInt(x.innerHTML));
      scoreboard[strat1] += pointsGained[0]
      scoreboard[strat2] += pointsGained[1]
      let highestScore = 0;
      let winnerIndex = 0;
      for (let i = 0;i < stratList.length;i++){
          if (scoreboard[stratList[i]] > highestScore){
              highestScore = scoreboard[stratList[i]];
              winnerIndex = i;
          }
      }
      document.getElementById("stratPicker").selectedIndex = winnerIndex + 1
  });
});
let allPayoffs = ["payoffCellAA","payoffCellAB","payoffCellBA","payoffCellBB"]
for (let i = 0; i< allPayoffs.length;i++){
  let target = document.getElementById(allPayoffs[i]);
  observer.observe(target, { attributes : true, attributeFilter : ['style'] });
}

// timer
function playTimer(message){
    let timeDiff = new Date() - startTime;
    hoursDiff = Math.floor(timeDiff/(3600*1000))
    minutesDiff = Math.floor((timeDiff - hoursDiff*(3600*1000))/(60*1000))
    secondsDiff =  Math.floor((timeDiff - hoursDiff*(3600*1000) - minutesDiff*(60*1000))/1000)
    minutesDiff = minutesDiff < 10? "0"+ minutesDiff : minutesDiff;
    secondsDiff = secondsDiff < 10? "0"+ secondsDiff : secondsDiff;
    console.log("%c" + message + hoursDiff + ":" + minutesDiff + ":" + secondsDiff,"color:blue")
}

function startPlay(){
    refreshData();
    Cmax = data["lower raise Price per Clip: $"]*(data["Public Demand:"]+.4999999)/10
    Cmin = data["lower raise Price per Clip: $"]*(data["Public Demand:"]-.5)/10
    if (isVisible(document.getElementById("slider"))){
        think = 1;
        defaultThink = true;
    }
    startTime = new Date();
    console.log("Game started");
    setInterval(play, Math.floor(1000/ACTIONS_PER_SECOND));
}

startPlay();