JavaScript-String-Edit-Path
===========================

Calculates the optimal path to transform one string to another and applies it.

Simple :D

Usage
===========================

var diff = new Diff();

var changes = diff.getEditPath("cat", "bat");

var res = diff.applyChangesToString(changes, "cat");

//should be "bat"
