  /* // assign infield/outfield for all innings
  for (let inning = 0; inning < numberOfInnings; inning++) {
    var playersAvailableThisInning = []
    for (let playerIndex = 0; playerIndex < team.length; playerIndex++) {
      if (lineup[inning][team[playerIndex]["name"]] != "Bench") {
        playersAvailableThisInning.push(team[playerIndex])
      }
    }
    // it is possible that for later innings, I may change the algorithm, and prioritize winning a bit higher
    for (let availablePlayerIndex = 0; availablePlayerIndex < playersAvailableThisInning.length; availablePlayerIndex++) {
      if ((isOdd(inning + availablePlayerIndex)) && (availablePlayerIndex <= 9)) { // two optional positions are both outfield
        lineup[inning][playersAvailableThisInning[availablePlayerIndex]["name"]] = "outfield"
      } else {
        lineup[inning][playersAvailableThisInning[availablePlayerIndex]["name"]] = "infield"
      }
    }
  }

  for (let inning = 0; inning < numberOfInnings; inning++) {
    var infieldPositions = positions.filter(position => position["class"] == "infield")
    var outfieldPositions = positions.filter(position => position["class"] == "outfield")

    for (let playerIndex = 0; playerIndex < team.length; playerIndex++) {
      if (lineup[inning][team[playerIndex]["name"]] != "Bench") {
        if (lineup[inning][team[playerIndex]["name"]] == "infield") {
          // make a local copy of the player positions map
          var playerPositions = infieldPositions.slice()
          // omit an infield position if it has been played too often
          for (let positionIndex = 0; positionIndex < playerPositions.length; positionIndex++) {
            var howManyTimesPlayedThisPosition = 0;
            for (let positionCheckInningsIndex = 0; positionCheckInningsIndex < inning; positionCheckInningsIndex++) {
              if (lineup[positionCheckInningsIndex][team[playerIndex]["name"]] == infieldPositions[positionIndex]["name"]) {
                howManyTimesPlayedThisPosition++;
              }
              if (howManyTimesPlayedThisPosition == 2) {
                playerPositions.splice(positionIndex, 1)
              }
            }

          }
          // assign least bad possible infield position
          var bestPosition = ""
          var bestPositionRating = -1000; // proxy for minInteger
          for (let positionIndex = 0; positionIndex < playerPositions.length; positionIndex++) {
            if ((team[playerIndex][playerPositions[positionIndex]["name"]] > bestPositionRating)) {
              bestPositionRating = team[playerIndex][playerPositions[positionIndex]["name"]]
              bestPosition = playerPositions[positionIndex]["name"];
            }
          }
          lineup[inning][team[playerIndex]["name"]] = bestPosition;
          // pop the assigned position off the list of available infield positions
          infieldPositions = infieldPositions.filter(position => position["name"] != bestPosition);
        } else { // player is in the outfield
          // make a local copy of the player positions map
          var playerPositions = outfieldPositions.slice()

          // omit an outfield position if it has been played too often
          for (let positionIndex = 0; positionIndex < playerPositions.length; positionIndex++) {
            var howManyTimesPlayedThisPosition = 0;
            for (let positionCheckInningsIndex = 0; positionCheckInningsIndex < inning; positionCheckInningsIndex++) {
              if (lineup[positionCheckInningsIndex][team[playerIndex]["name"]] == playerPositions[positionIndex]["name"]) {
                howManyTimesPlayedThisPosition++;
              }
              if ((howManyTimesPlayedThisPosition == 2) || ((howManyTimesPlayedThisPosition == 1) && (playerPositions[positionIndex]["name"] == "C"))) {
                playerPositions.splice(positionIndex, 1)
              }
            }
          }
          // assign least bad possible outfield position
          var bestPosition = ""
          var bestPositionRating = -1000; // proxy for minInteger
          for (let positionIndex = 0; positionIndex < playerPositions.length; positionIndex++) {
            if ((team[playerIndex][playerPositions[positionIndex]["name"]] > bestPositionRating)) {
              bestPositionRating = team[playerIndex][playerPositions[positionIndex]["name"]]
              bestPosition = playerPositions[positionIndex]["name"];
            }
          }

          if ((bestPosition == "C") && (bestPositionRating == -100)) {
            // we have a player with fear of ball assigned to catcher
            // find the right fielder, swap with them if they are not afraid of the ball
            var catcherSwapped = false;
            for (let pIndex = 0; pIndex < lineup.length; pIndex++) {
              if ((lineup[inning][team[pIndex]["name"]] == "RF") && team[pIndex]["afraid"] == 0) {
                lineup[inning][team[pIndex]["name"]] = "C"
                lineup[inning][team[playerIndex]["name"]] = "RF"
                catcherSwapped = true
              }
            }
            if (catcherSwapped == false) {
              for (let pIndex = 0; pIndex < lineup.length; pIndex++) {
                if ((lineup[inning][team[pIndex]["name"]] == "LF") && team[pIndex]["afraid"] == 0) {
                  lineup[inning][team[pIndex]["name"]] = "C"
                  lineup[inning][team[playerIndex]["name"]] = "LF"
                  catcherSwapped = true
                }
              }
            }
          } else {
            // we were ok, the catcher was not afraid of the ball
            lineup[inning][team[playerIndex]["name"]] = bestPosition;
          }
          // pop the assigned position off the list of available infield positions
          outfieldPositions = outfieldPositions.filter(position => position["name"] != bestPosition);
        }
      }
    }
  }



  // this is a ridiculous statement meant to duplicate the array.
  var positionsLeftThisInning = positions.filter(position => position["name"] != "XYZZY")

  for (let inning = 0; inning < numberOfInnings; inning++) {
    var thisInningsTeam = team.filter(player => lineup[inning][player["name"]] != "Bench")
    for (let playerIndex = 0; playerIndex < thisInningsTeam.length > 0; playerIndex--) {

      var playerEligiblePositions = calculateEligiblePositions(thisInningsTeam[playerIndex], positionsLeftThisInning)

      var leastBadPosition = ""
      var leastBadPositionRating = 1000
      for (let positionIndex = 0; positionIndex < playerEligiblePositions.length; positionIndex++) {
        if (team[playerIndex][playerEligiblePositions[positionIndex]] > leastBadPositionRating) {
          var leastBadPosition = playerEligiblePositions[positionIndex]["name"]
          var leastBadPositionRating = thisInningsTeam[playerIndex][playerEligiblePositions[positionIndex]]
        }
      }

      lineup[inning][thisInningsTeam[playerIndex]["name"]] = leastBadPosition
      // remove that player from the eligible list for this inning
      thisInningsTeam = thisInningsTeam.filter(player => player["name"] != thisInningsTeam[playerIndex]["name"])
      // remove that position from the positions left to populate
      positionsLeftThisInning = positionsLeftThisInning.filter(position => position["name"] != positionName)
    }
  }

  function calculateEligiblePositions(player, positions) {
    var eligiblePositions = positions.filter(position => player[position["name"]] > 0)
    return eligiblePositions
  }

  function comparePlayers(a, b) {
    const playerAValue = a["totalPlayerValue"];
    const playerBValue = b["totalPlayerValue"];

    let comparison = 0;
    if (playerAValue > playerBValue) {
      comparison = -1;
    } else if (playerAValue < playerBValue) {
      comparison = 1;
    }
    return comparison;
  }

  function comparePositions(a, b) {
    const positionAValue = a["positionFielding"] + a["positionThrowing"];
    const positionBValue = b["positionFielding"] + b["positionThrowing"];

    let comparison = 0;
    if (positionAValue > positionBValue) {
      comparison = -1;
    } else if (positionAValue < positionBValue) {
      comparison = 1;
    }
    return comparison;
  }
*/