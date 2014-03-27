function Diff(){

    /*getEditPath("cat", "rat") : the edit path in changes from the string 'from' resulting
    in the string 'to' */
    this.getEditPath = function (from, to) {
        if (to != from) {
            return this.levenshteinDistance(to, from);
        } else {
            return [];
        }
    }

    this.levenshteinDistance = function (str1, str2) {
        var endOffset = getEndOffset(str1, str2);
        str1 = str1.slice(0, str1.length - endOffset + 1);
        str2 = str2.slice(0, str2.length - endOffset + 1);

        var offset = getStartOffset(str1, str2);
        str1 = str1.slice(offset);
        str2 = str2.slice(offset);

        var s = str1.split(""), t = str2.split(""), start = new Date(),
        m = s.length, n = t.length, d = new Array(m);

        //clear d
        for (var i = 0; i <= m; i++) {
            d[i] = new Array(n);
            d[0][0] = 0;
        }

        for (var i = 1; i <= m; i++) {
            d[i][0] = i;
        }

        for (var i = 1; i <= n; i++) {
            d[0][i] = i;
        }

        for (var j = 1; j <= n; j++) {
            for (var i = 1; i <= m; i++) {
                if (s[i] === t[j]) {
                    d[i][j] = d[i - 1][j - 1];
                } else {
                    d[i][j] = Math.min(
                                d[i - 1][j] + 1,
                                d[i][j - 1] + 1,
                                d[i - 1][j - 1] + 1
                              );
                }
            }
        }
        var changes = [], i = m, j = n;
        changes = getShortestPath(changes, d, i, j, s, t, offset);
        return changes;
    }

    function getStartOffset(str1, str2){
                var offset = 0;
        for(var i = 0; i < str1.length; i++){
            if(str1[i] != str2[i]){
           
                return offset;
            }else{
                offset++;
            }
        }
        return offset;
    }

    function getEndOffset(str1, str2){
        var offset = 1;
        while(true){
            if(str1[str1.length - offset] != str2[str2.length - offset]
            && offset < str1.length + str2.length){
                return offset;
            }else{
                offset++;
            }
        }
        return offset;
    }

    function getShortestPath(changes, d, i, j, str1, str2, offset) {
        while (true) {
            var min = Math.min(
                                (d[i - 1] && d[i - 1][j] != undefined) ? d[i - 1][j] : Infinity, //ins
                                (d[i] && d[i][j - 1] != undefined) ? d[i][j - 1] : Infinity, //del
                                (d[i - 1] && d[i - 1][j - 1] != undefined) ? d[i - 1][j - 1] : Infinity//repl
                           );

            if (d[i - 1]
            && d[i - 1][j] != undefined
            && min === d[i - 1][j]) {
                //ins
                changes.splice(0, 0, new Change("i", str1[i - 1], j + offset));
                i--;
            } else if (d[i]
            && d[i][j - 1] != undefined
            && min === d[i][j - 1]) {
                //del
                changes.splice(0, 0, new Change("d", str2[j - 1], j - 1 + offset));
                j--;
            } else if (d[i - 1]
            && d[i - 1][j - 1] != undefined
            && min === d[i - 1][j - 1]) {
                //replace
                if (str1[i - 1] != str2[j - 1]) {//if there is actually change
                    changes.splice(0, 0, new Change("r", str1[i - 1], j - 1 + offset));
                }
                i--;j--;
            } else {//end condition
                return changes;
            }
        }
    }

    /*applyChangesTString(changes, "cat") : the string resulting from appling the list
    of 'changes' to the start string 'str' */
    this.applyChangesToString = function (changes, str) {
        return this.applyChanges(changes, str.split("")).join("");
    }

    /*applyChanges(changes, "cat".split("")) : the array of characters resulting from appling the list
    of 'changes' to the 'baseStrArray' */
    this.applyChanges = function (changes, baseStrArray) {
        var localChanges = changes.slice();
        for (var i = 0; i < localChanges.length; i++) {//replace first
            if (localChanges[i].type == "r") {
                baseStrArray[localChanges[i].pos] = localChanges[i].val;
                localChanges.splice(i, 1); //remove it
                i--;
            }
        }
        for (var i = 0; i < localChanges.length; i++) {//delete second
            if (localChanges[i].type == "d") {
                baseStrArray[localChanges[i].pos] = "";
                localChanges.splice(i, 1); //remove it
                i--;
            }
        }
        for (var i = localChanges.length - 1; i >= 0; i--) {//insert last and go backwards
            if (i == localChanges.length - 1
            && baseStrArray.length < localChanges[i].pos) {
                baseStrArray.length = localChanges[i].pos + 1;
            }
            if (localChanges[i].type == "i") {
                baseStrArray.splice(localChanges[i].pos, 0, localChanges[i].val);
            }
        }
        return baseStrArray;
    }
    /*mergeChanges(oldChanges, newChanges) : the combination of 'changes1' and 'changes2'.
    when applied this should result in a string resulting from both 'changes1' and 'changes2'*/
    this.mergeChanges = function(changes1, changes2) {
        var localChanges2 = changes2.slice();
        var merge = changes1.slice();
        for (var i = 0; i < merge.length; i++) {
            var j = 0;
            while (localChanges2.length > 0 && j < localChanges2.length) {
                if (localChanges2[j].pos <= merge[i].pos) {
                    var toInsert = new Array();
                    for (var k = j; k < localChanges2.length; k++) {
                        if (localChanges2[k].pos <= merge[i].pos) {
                            toInsert.push(localChanges2[k]);
                        } else {
                            break;
                        }
                    }
                    merge.splice.apply(merge, [i, 0].concat(toInsert));
      
                    localChanges2.splice(j, toInsert.length); //take it out
                } else {
                    j++;
                }
            }
        }
        if (localChanges2.length > 0) {
            merge = merge.concat(localChanges2);
        }
        return merge;
    }
}

function Change(type, val, pos) {
    this.type = type;
    this.val = val;
    this.pos = pos;
}
