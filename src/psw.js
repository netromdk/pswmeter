/******************************************************************************
   Password strength analyzer

   Use analyze(text) to analyze and get a score of how strong, or
   unguessable, the password or passphrase is. A zero-length input
   will yield a score of 0, which is the worst, and the higher the
   score the stronger the password. In addition a word is also
   attributed including a color.

   It uses two metrics to calculate a score: Basic16 and Comprehensive8
   The one producing the largest score is the result.

   Basic16 yields 4 points for each of the first 7 characters after
   which 8 points are awarded subsequent characters. A score of 100 is
   awarded 16 characters, which is why it's called Basic16.

   Comprehensive8 yields 4 points for each character and an additional
   17 points for each uppercase character, digit or symbol. Inputting
   a second unique uppercase character, digit or symbol yields an
   additional 8 points, and a third adds extra 4 points. If no
   lowercse characters are found then 17 points are deducted, and if
   the text does not appear in the word list then 17 points are added.

   The word lists used were provided by Open Wall:
     http://download.openwall.net/pub/wordlists/passwords/

   Deps: jQuery, XRegExp
 ******************************************************************************/
"use strict";
function Psw(path) {
  this.loadPath = path || "wordlist.json";
  this.wordlist = [];
  this.wordObject = {};
  var self = this;

  if (localStorage["wordlist"] != null) {
     self.wordObject = JSON.parse(localStorage["wordlist"]);
     self.wordlist = self.wordObject.wordlist;
     console.log("Loaded wordlist from local storage!");
  } else {
     $.ajax({
       "type" : "GET", 
       "url" : self.loadPath,
       "success" : function(data, status, xhr) {
          console.log("Loaded wordlist from \"" + self.loadPath + "\"");
          localStorage["wordlist"] = JSON.stringify(data);
          self.wordObject = JSON.parse(localStorage["wordlist"]);
          self.wordlist = self.wordObject.wordlist;
         }, 
       "error" : function(xhr, status, error) {
          console.log("Error" + error);
       }
    });
 }
}
window["Psw"] = Psw;

Psw.prototype.analyze = function(text) {
  var score = this.calcScore(text);
  var meaning = this.scoreMeaning(score);
  return {
    "score": score,
    "meaning": meaning[0],
    "color": meaning[1]
  };
};
Psw.prototype["analyze"] = Psw.prototype.analyze;

/**************************************/

Psw.prototype.calcScore = function(text) {
  if (text == undefined || text.length == 0) {
    return 0;
  }
  return Math.max(this.calcBasic16(text), this.calcComp8(text));
};
Psw.prototype["calcScore"] = Psw.prototype.calcScore;

/**
 * 8 segments: dreadful (1-16), bad (17-33), poor (34-50), fair
 * (51-67), good (68-84), great (85-99), excellent (100-115), fantastic (116+)
 */
Psw.prototype.scoreMeaning = function(score) {
  if (score > 0 && score <= 16) {
    return ["Dreadful", "#FF0000"];
  }
  else if (score > 16 && score <= 33) {
    return ["Bad", "#FF6600"];
  }
  else if (score > 33 && score <= 50) {
    return ["Poor", "#FF9900"];
  }
  else if (score > 50 && score <= 67) {
    return ["Fair", "#FFCC00"];
  }
  else if (score > 67 && score <= 84) {
    return ["Good", "#FFFF00"];
  }
  else if (score > 84 && score <= 99) {
    return ["Great", "#CCFF00"];
  }
  else if (score > 99 && score <= 115) {
    return ["Excellent", "#99FF00"];
  }
  else if (score > 115) {
    return ["Fantastic", "#00FF00"];
  }
  else {
    return ["", ""];
  }
};
Psw.prototype["scoreMeaning"] = Psw.prototype.scoreMeaning;

Psw.prototype.calcBasic16 = function(text) {
  var score = 0, len = text.length;
  score = Math.min(len, 7) * 4;
  if (len > 7) {
    score += (len - 7) * 8;
  }
  return score;
};
Psw.prototype["calcBasic16"] = Psw.prototype.calcBasic16;

Psw.prototype.calcComp8 = function(text) {
  var score = 0, len = text.length;
  var upsq = this.countCmp(text, this.isUpper, true);
  var digsq = this.countCmp(text, this.isDigit, true);
  var symsq = this.countCmp(text, this.isSymbol, true);
  var los = this.countCmp(text, this.isLower);

  score = len * 4;

  function unqPoints(num) {
    return (num >= 1 ? 17 : 0) + (num >= 2 ? 8 : 0) + (num >= 3 ? 4 : 0);
  }
  score += unqPoints(upsq) + unqPoints(digsq) + unqPoints(symsq);

  if (los == 0) score -= 17;

  if (this.checkWordList(text)) {
    score += 17;
  }

  return score;
};
Psw.prototype["calcComp8"] = Psw.prototype.calcComp8;

/**
 * Note that XRegExp is used because we want to be able to check for
 * Unicode uppercase characters, not only ASCII, and toUpperCase() is
 * not useful since it lets non-uppercase characters pass through..
 */
Psw.prototype.isUpper = function(text) {
  return XRegExp("^\\p{Lu}$").test(text);
};
Psw.prototype["isUpper"] = Psw.prototype.isUpper;

Psw.prototype.isLower = function(text) {
  return XRegExp("^\\p{Ll}$").test(text);
};
Psw.prototype["isLower"] = Psw.prototype.isLower;

Psw.prototype.isDigit = function(text) {
  return /^\d$/.test(text);
};
Psw.prototype["isDigit"] = Psw.prototype.isDigit;

Psw.prototype.isSymbol = function(text) {
  return /^[!=\?\"\'#%\$§\/\\\(\)\[\]{}+\-\.,;:_<>\*`´\^~|]$/.test(text);
};
Psw.prototype["isSymbol"] = Psw.prototype.isSymbol;

Psw.prototype.countCmp = function(text, cmp, unique) {
  if (unique == undefined) {
    unique = false;
  }
  var cnt = 0;
  var txt = text.split("");
  if (unique) {
    txt = $.unique(txt.sort());
  }
  $.each(txt, function(index, value) {
    if (cmp(txt[index])) {
      cnt++;
    }
  });
  return cnt;
};
Psw.prototype["countCmp"] = Psw.prototype.countCmp;

/**
 * Returns false if found in the word list.
 */
Psw.prototype.checkWordList = function(text) {
  return this.wordlist.indexOf(text.toLowerCase()) == -1;
};
Psw.prototype["checkWordList"] = Psw.prototype.checkWordList
