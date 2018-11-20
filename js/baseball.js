/*
1. Account for no shows
2. If less than 10 players available, adjust positions available
3. Apply benching for inning
4. Generate all possible line ups using positions and available players (https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements)
5. Remove combinations with "fear of ball" playing catcher (filter)
6. Remove combinations with player playing position more than twice (filter)
7. Remove combinations with player not in infield by third inning (filter) [may adjust selection algorithm here a bit]
8. Remove combinations with player in infield more than 4 times (filter)
9. Score combinations, pick highest score (reduce)
*/



var team = [];
var valueGrid = [];
var numberOfInnings = 6;
var lineup = new Array();
for (let index = 0; index < numberOfInnings; index++) {
  lineup.push(new Object());
}
var positions = [{
    name: "SS",
    positionFielding: 6,
    positionThrowing: 5,
    class: "infield"
  },
  {
    name: "1B",
    positionFielding: 15,
    positionThrowing: 2,
    class: "infield"
  },
  {
    name: "2B",
    positionFielding: 7.5,
    positionThrowing: 4,
    class: "infield"
  },
  {
    name: "3B",
    positionFielding: 3.5,
    positionThrowing: 3.5,
    class: "infield"
  },
  {
    name: "P",
    positionFielding: 6.5,
    positionThrowing: 4,
    class: "infield"
  },
  {
    name: "C",
    positionFielding: 2.5,
    positionThrowing: 2,
    class: "outfield"
  },
  {
    name: "RF",
    positionFielding: 3.5,
    positionThrowing: 3,
    class: "outfield"
  },
  {
    name: "LF",
    positionFielding: 3.6,
    positionThrowing: 3,
    class: "outfield"
  },
  {
    name: "RCF",
    positionFielding: 4.5,
    positionThrowing: 4.5,
    class: "outfield"
  },
  {
    name: "LCF",
    positionFielding: 4.6,
    positionThrowing: 4.5,
    class: "outfield"
  },
]
// positions.sort(comparePositions)

function process() {
  readInValues()
  //enerateValueGrid()
  generateLineup()
  outputLineup()
}

function readInValues() {
  for (let index = 1; index <= 12; index++) {
    var player = {};
    player["name"] = $('#playerName' + index).val()
    player["fielding"] = parseFloat($('#fieldingRating' + index).val())
    player["throwing"] = parseFloat($('#throwingRating' + index).val())
    player["afraid"] = ($('#afraidOfBall' + index).is(":checked")) ? 1 : 0
    player["bench"] = ($('#benchPriority' + index).is(":checked")) ? 1 : 0
    player["noshow"] = ($('#noShow' + index).is(":checked")) ? 1 : 0
    team.push(player);
  }
}

function generateValueGrid() {
  for (let playerIndex = 0; playerIndex < team.length; playerIndex++) {
    var totalPlayerValue = 0;
    currentPlayer = team[playerIndex];
    for (let positionIndex = 0; positionIndex < positions.length; positionIndex++) {
      var positionValue = 0;
      positionValue = calculatePositionValue(playerIndex, positionIndex)
      currentPlayer[positions[positionIndex]["name"]] = positionValue;
      totalPlayerValue += positionValue;
    }
    currentPlayer["totalPlayerValue"] = totalPlayerValue;
  }
  // sort the players by total value to team
  //team.sort(comparePlayers)
}

function calculatePositionValue(playerIndex, positionIndex) {
  var positionValue = team[playerIndex]["fielding"] * positions[positionIndex]["positionFielding"];
  var positionValue = positionValue + team[playerIndex]["throwing"] * positions[positionIndex]["positionThrowing"];

  return positionValue;
}

function benchPlayers(numberOfPlayersToBench) {
  var benched = []
  var benchBestRemaining = false;
  // pick the top player and the bottom player who have not yet been benched to be benched
  benchEligible = team.filter(player => player["bench"] == 0);
  // if no one is benchable, it's time to start over
  if (benchEligible.length == 0) {
    team.map(player => player["bench"] = 0)
    benchEligible = team
  }
  if ((numberOfPlayersToBench > 1) || ((numberOfPlayersToBench = 1) && (benchBestRemaining))) {
    benched.push(benchEligible[0])
    // mark player as benched
    team.map(function (player) {
      if (player["name"] == benchEligible[0]["name"]) {
        player["bench"] = 1
      }
    })
  }
  if ((numberOfPlayersToBench > 1) || ((numberOfPlayersToBench = 1) && (!benchBestRemaining))) {
    benched.push(benchEligible[benchEligible.length - 1])
    team.map(function (player) {
      if (player["name"] == benchEligible[benchEligible.length - 1]["name"]) {
        player["bench"] = 1
      }
    })
    return benched;
  }
}

function generateLineup() {
  /* ******************************************
  // 1. Account for no shows
  ****************************************** */

  // trim to the players present
  team = team.filter(player => player["noshow"] == 0);

  /* ******************************************
  // 2. If less than 10 players available, adjust positions available
  ****************************************** */

  // one time catcher exception if we only have 9
  if (team.length < 10) {
    positions = positions.filter(position => position["name"] != "C")
  }
  // one time RF exception if we only have 8
  if (team.length < 9) {
    positions = positions.filter(position => position["name"] != "RF")
  }

  /* ******************************************
  // 3. Apply benching for game
  ****************************************** */
  for (let inning = 0; inning < numberOfInnings; inning++) {
    var teamIndices = Array.from(new Array(team.length), (x, i) => i)
    var benchedPlayerIndexArray = []

    // bench players if enough showed up
    if (team.length > positions.length) {
      var benchedPlayers = benchPlayers(team.length - positions.length)
      for (let index = 0; index < benchedPlayers.length; index++) {
        lineup[inning][benchedPlayers[index]["name"]] = "Bench";
        benchedPlayerIndexArray.push(team.indexOf(benchedPlayers[index]));
      }
    }

    // sort the benched player indices from biggest to lowest
    benchedPlayerIndexArray.sort(function (a, b) {
      return b - a
    })
    for (let index = 0; index < benchedPlayerIndexArray.length; index++) {
      // then remove them from this inning's lineup
      teamIndices.splice(benchedPlayerIndexArray[index], 1);
    }

    /* ******************************************
    // 4. Generate all possible line ups using positions and available players
    ****************************************** */

    var possibilities = permutator(teamIndices)


    /* ******************************************
    // 5. Remove combinations with "fear of ball" playing catcher (filter)
    ****************************************** */

    // these position indices are hard coded in filterByFear for now
    // get index of position "C"
    //var c = findWithAttr(positions, "name", "C")
    // get index of position "1B"
    //var b = findWithAttr(positions, "name", "1B")

    // filter out all possible lineups that has an afraid kid at those two indices
    var filteredPossibilities = possibilities.filter(filterByFear)
    // 6. Remove combinations with player playing position more than twice (filter)
    var filteredPossibilities = filteredPossibilities.filter(filterByPosition)
    // 7. Remove combinations with player not in infield by third inning (filter) [may adjust selection algorithm here a bit]
    // 8. Remove combinations with player in infield more than 4 times (filter)

    // 9. Score combinations
    var scoredPossibilies = filteredPossibilities.map(function (currentLineup, lineUpIndex, array) {
      var totalScore = 0;
      for (let index = 0; index < currentLineup.length; index++) {
        totalScore = totalScore + calculatePositionValue(currentLineup[index], index)
      }
      return {
        "score": totalScore,
        "lineup": currentLineup
      }
    })

    // 10. Pick highest score (reduce)
    let maxScore = 0;
    var idealLineupIndex = 0;
    for (let index = 0; index < scoredPossibilies.length; index++) {
      if (scoredPossibilies[index]["score"] > maxScore) {
        maxScore = scoredPossibilies[index]["score"];
        idealLineupIndex = index;
      }
    }

    // 11. Store the assignments in the lineup
    for (let index = 0; index < scoredPossibilies[idealLineupIndex].lineup.length; index++) {
      lineup[inning][team[scoredPossibilies[idealLineupIndex]["lineup"][index]]["name"]] = positions[index]["name"];
    }
    console.log(lineup[inning])

  } // end inning loop


}

function isOdd(num) {
  return (num % 2) == 1;
}

function outputLineup() {
  for (let playerIndex = 0; playerIndex < team.length; playerIndex++) {
    $('#player' + (playerIndex + 1) + 'name').text(team[playerIndex]['name']);
    for (let inning = 0; inning < numberOfInnings; inning++) {
      $('#player' + (playerIndex + 1) + 'inning' + (inning + 1)).text(lineup[inning][team[playerIndex]['name']]);
    }
  }
}

function swap(chars, i, j) {
  var tmp = chars[i];
  chars[i] = chars[j];
  chars[j] = tmp;
}

const permutator = (inputArr) => {
  let result = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next))
      }
    }
  }

  permute(inputArr)

  return result;
}

function findWithAttr(array, attr, value) {
  for (var i = 0; i < array.length; i += 1) {
    if (array[i][attr] === value) {
      return i;
    }
  }
  return -1;
}

function filterByFear(item) {
  // these positions are hard coded for now
  if (team[item[5]]["afraid"] == 1) {
    return false;
  }
  if (team[item[1]]["afraid"] == 1) {
    return false;
  }
  return true;
}

function filterByPosition(item) {
  for (let index = 0; index < item.length; index++) {
    if (getIndicesOf(getPastPositions(item[index]), positions[index]["name"]).length > 1) {
      return false;
    }
  }
return true;
}

function getPastPositions(playerIndex) {
  var positionString = "";
  for (let index = 0; index < numberOfInnings; index++) {
    if (typeof lineup[index][team[playerIndex]] !== "undefined") {
    positionString = positionString + lineup[index][team[playerIndex]["name"]]
    }
  }
  return positionString;
}

function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0, index, indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}
