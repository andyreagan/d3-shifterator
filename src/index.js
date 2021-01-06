import * as d3 from 'd3';
import {
    stringwidth,
    splitarray,
    intStr0,
    intStr
} from './helpers.js';
import {
    urllib
} from './urllib.js';

export var functionThatDependsOnD3 = function() {
    console.log(d3.version);
}

export var shifterator = function() {
    // set a special variable to make sure all necessary things
    // have been set before shifting
    // (this is a double check on the page loading)
    var loadsremaining = 4;

    // will need a figure.
    // this needs to be set by setfigure() before plotting
    var figure = d3.select("body");

    const shiftselencoder = urllib.encoder().varname("wordtypes");
    const shiftseldecoder = urllib.decoder().varname("wordtypes").varresult("none");
    // initialize that we have't selected a shift
    var shiftTypeSelect = false;
    var shiftType = -1;

    // put the status of the viz into the bar
    const viz_type = urllib.encoder().varname("viz");
    const viz_type_decoder = urllib.decoder().varname("viz").varresult("wordshift");

    var viz_type_use_URL = false;
    var _viz_type_use_URL = function(_) {
        var that = this;
        if (!arguments.length) return viz_type_use_URL;
        viz_type_use_URL = _;
        return that;
    }

    var getfigure = function() {
        return figure;
    }
    var setfigure = function(_) {
        // pass in a string that can be selected from the DOM
        // e.g., if you webpage has
        //     <div id="putwordshifthere"></div>
        // you can call
        //     shifterator().setfigure("#putwordshifthere")
        var that = this;
        console.log("setting figure for wordshift");
        figure = d3.select(_);
        // wrap another relative parent div in there, for the overlay button to pad off of
        figure = figure.append("div")
            .attr("class", "outwrapper")
            .style("position", "relative");
        if (!widthsetexplicitly) {
            grabwidth();
        }
        return that;
    }

    var show_x_axis_bool = false;
    var show_x_axis = function(_) {
        var that = this;
        if (!arguments.length) return show_x_axis_bool;
        show_x_axis_bool = _;
        // give a litter extra space for it
        axeslabelmargin.bottom = axeslabelmargin.bottom + 10;
        return that;
    }

    // set the ones we can
    // since the height is fixed, do all that
    // but just initialize the width-related variables

    // full width and height. we'll draw the outer svg this big
    var fullwidth = 550;
    var fullheight = 650; // 650; // make sure to change num words too

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    // the width and height that we're going to use
    var boxwidth = fullwidth - margin.left - margin.right;
    var boxheight = fullheight - margin.top - margin.bottom;

    // margin inside
    var axeslabelmargin = {
        top: 0,
        right: 3,
        bottom: 25,
        left: 23
    };

    // inner width and height
    // used for the axes
    var figwidth = boxwidth - axeslabelmargin.left - axeslabelmargin.right;
    var figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom;
    var leftOffsetStatic = axeslabelmargin.left;

    // individual bar height, and number of words
    // need to be tuned to the height of the plot
    var iBarH = 11;
    var numWords = 37;
    // 37 with height 650 // 23 with height 500 // 28 with height 550
    // I should be able to compute this?

    // max length of words to plot
    var maxChars = 20;

    // all inside the axes
    var yHeight = (7 + 17 * 3 + 14 + 5 - 13); // 101
    // where to draw the line below the summary bars
    var barHeight = (7 + 17 * 3 + 15 - 13); // 95
    var figcenter = figwidth / 2;

    // pull the width, set the height fixed
    var grabwidth = function() {
        // console.log("setting width from figure");
        // console.log(parseInt(figure.style("width")));
        // use d3.min to set a max width of fullwidth
        fullwidth = d3.min([parseInt(figure.style("width")), fullwidth]);
        boxwidth = fullwidth - margin.left - margin.right;
        figwidth = boxwidth - axeslabelmargin.left - axeslabelmargin.right;
        figcenter = figwidth / 2;
    }

    var widthsetexplicitly = false;
    var setWidth = function(_) {
        if (!arguments.length) return fullwidth;
        widthsetexplicitly = true;
        fullwidth = _;
        boxwidth = fullwidth - margin.left - margin.right;
        figwidth = boxwidth - axeslabelmargin.left - axeslabelmargin.right;
        figcenter = figwidth / 2;
    }

    // pull the width, set the height fixed
    var setHeight = function(_) {
        var that = this;
        if (!arguments.length) return fullheight;
        fullheight = _;
        boxheight = fullheight - margin.top - margin.bottom;
        figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom;
        return that;
    }

    // will be set by setdata() or shift() functions
    var sortedMag;
    var sortedType;
    var sortedWords;
    var sortedWordsRaw;
    var sortedWordsEn;
    var sortedWordsRawEn;
    var sumTypes;
    var refH;
    var compH;

    var _sortedMag = function(_) {
        var that = this;
        if (!arguments.length) return sortedMag;
        sortedMag = _;
        return that;
    }
    var _sortedType = function(_) {
        var that = this;
        if (!arguments.length) return sortedType;
        sortedType = _;
        return that;
    }
    var _sortedWords = function(_) {
        var that = this;
        if (!arguments.length) return sortedWords;
        sortedWords = _;
        return that;
    }
    var _sortedWordsRaw = function(_) {
        var that = this;
        if (!arguments.length) return sortedWordsRaw;
        sortedWordsRaw = _;
        return that;
    }

    var xlabel_text = "Per word average happiness shift";
    var _xlabel_text = function(_) {
        var that = this;
        if (!arguments.length) return xlabel_text;
        xlabel_text = _;
        return that;
    }

    var ylabel_text = "Word Rank";
    var _ylabel_text = function(_) {
        var that = this;
        if (!arguments.length) return ylabel_text;
        ylabel_text = _;
        return that;
    }
    var _refH = function(_) {
        var that = this;
        if (!arguments.length) return refH;
        refH = _;
        return that;
    }
    var _compH = function(_) {
        var that = this;
        if (!arguments.length) return compH;
        compH = _;
        return that;
    }

    var reset = true;
    var _reset = function(_) {
        var that = this;
        if (!arguments.length) return reset;
        reset = _;
        return that;
    }

    var get_word_index = function(w) {
        var ind = -1;
        for (var i = 0; i < words.length; i++) {
            if (w === words[i]) {
                ind = i;
                break;
            }
        }
        return ind;
    }

    // let's make this just toggle the state
    // you can force it to turn on by setting the _reset function
    // to set the reset bool to be false, then calling toggle
    var resetbuttontoggle = function() {
        var that = this;
        reset = !reset;
        resetButton(reset);
        if (reset) {
            figure.select("g.help").style("visibility", "visible");
            figure.selectAll("text.credit").style("visibility", "visible");
        } else {
            figure.select("g.help").style("visibility", "hidden");
            figure.selectAll("text.credit").style("visibility", "hidden");
        }
        return that;
    }

    var setdata = function(a, b, c, d, e, f) {
        var that = this;
        // console.log("setting data");
        sortedMag = a;
        sortedType = b;
        sortedWords = c;
        sortedWordsRaw = c;
        sumTypes = d;
        refH = e;
        compH = f;
        loadsremaining = 0;
        return that;
    }

    // ******************************************************************************** //
    // all of this stuff deals with setting the top text                                //
    // which has become the most haphazard part so far                                  //
    // -AR 2015-07-28                                                                   //
    //
    // right now, we can just set the text ourselves completely, or have it set
    // automatically

    // have control over:
    // -number of bold lines (top N lines, default 1)
    // -each line's size
    // -each line's color (which, doesn't seem to have an effect)
    // -whether custom text is split or not

    // this variable controls whether the top strings are checked for length
    // and split, if necessary
    // - only used if compatison text is set explicitly
    var split_top_strings = true;
    var _split_top_strings = function(_) {
        var that = this;
        if (!arguments.length) return split_top_strings;
        split_top_strings = _;
        return that;
    }

    var numBoldLines = 1;
    var setTextBold = function(_) {
        var that = this;
        if (!arguments.length) return numBoldLines;
        numBoldLines = _;
        return that;
    }

    // only support up to 5 lines....
    var colorArray = ["#202020", "#D8D8D8", "#D8D8D8", "#D8D8D8", "#D8D8D8"];
    var topFontSizeArray = [16, 12, 12, 12, 12];
    // var topFontSizeArray = [20,16,16,16,16];

    var setTextColors = function(_) {
        var that = this;
        if (!arguments.length) return colorArray;
        colorArray = _;
        return that;
    }

    var setTopTextSizes = function(_) {
        var that = this;
        if (!arguments.length) return topFontSizeArray;
        topFontSizeArray = _;
        return that;
    }

    var comparisonText = [""];

    var setText = function(_) {
        var that = this;
        if (!arguments.length) return _;
        comparisonText = _;
        return that;
    }

    // end of the top text stuff                                                        //
    // ******************************************************************************** //

    var numwordstoplot = 200;

    var refF;
    var compF;
    var lens;
    var complens;
    var stoprange = [4, 6];
    var words;
    var words_en;
    var translate = false;

    var _stoprange = function(_) {
        var that = this;
        if (!arguments.length) return stoprange;
        stoprange = _;
        return that;
    }

    var _refF = function(_) {
        var that = this;
        if (!arguments.length) return refF;
        refF = _;
        // what better place to check for this
        // some datasets have less than 200 words
        numwordstoplot = d3.min([refF.length, numwordstoplot])
        loadsremaining--;
        return that;
    }

    var _compF = function(_) {
        var that = this;
        if (!arguments.length) return compF;
        compF = _;
        loadsremaining--;
        return that;
    }

    var _lens = function(_) {
        var that = this;
        if (!arguments.length) return lens;
        lens = _;
        loadsremaining--;
        return that;
    }

    var _complens = function(_) {
        var that = this;
        if (!arguments.length) return complens;
        complens = _;
        return that;
    }

    var _words = function(_) {
        var that = this;
        if (!arguments.length) return words;
        words = _;
        loadsremaining--;
        return that;
    }

    var _words_en = function(_) {
        var that = this;
        if (!arguments.length) return words_en;
        words_en = _;
        translate = true;
        return that;
    }

    var ignoreWords = ["nigga", "niggas", "niggaz", "nigger"];

    var ignore = function(_) {
        var that = this;
        if (!arguments.length) return ignoreWords;
        // refresh the list each time
        ignoreWords = ["nigga", "niggas", "niggaz", "nigger"];
        ignoreWords = ignoreWords.concat(_);
        // console.log(_);
        // console.log(ignoreWords);
        return that;
    }

    var stop = function() {
        var that = this;
        // first check if all the loads are done
        // WARNING
        // could not get this loop to stop!
        // even when the other variables are set
        // while (loadsremaining > 0) { console.log("waiting"); };
        for (var i = 0; i < lens.length; i++) {
            var include = true;
            // check if in removed word list
            for (var k = 0; k < ignoreWords.length; k++) {
                if (ignoreWords[k] == words[i]) {
                    include = false;
                }
            }
            // check if underneath lens cover
            if (lens[i] > stoprange[0] && lens[i] < stoprange[1]) {
                include = false;
            }
            // include it, or set to 0
            if (!include) {
                refF[i] = 0;
                compF[i] = 0;
            }
        }
        return that;
    }

    // stop an individual vector
    var istopper = function(fvec) {
        for (var i = 0; i < lens.length; i++) {
            var include = true;
            // check if in removed word list
            for (var k = 0; k < ignoreWords.length; k++) {
                if (ignoreWords[k] == words[i]) {
                    include = false;
                }
            }
            // check if underneath lens cover
            if (lens[i] > stoprange[0] && lens[i] < stoprange[1]) {
                include = false;
            }
            // include it, or set to 0
            if (!include) {
                fvec[i] = 0;
            }
        }
        return fvec;
    }

    var prefix = true;

    var concatter = function() {
        if (prefix) {
            // new method, with numbers prefixed
            // log everything
            // console.log(sortedMag);
            // console.log(sortedWords);
            // console.log(sortedWordsEn);
            // console.log(sortedType);
            // console.log(refF);
            // console.log(compF);
            // console.log(lens);
            // console.log(words);
            sortedWords = sortedWords.map(function(d, i) {
                if (sortedType[i] == 0) {
                    return ((i + 1) + ". ").concat(d.concat("-\u2193")); // down // increase in happs
                } else if (sortedType[i] == 1) {
                    return ((i + 1) + ". ").concat(d.concat("+\u2193")); // decrease in happs
                } else if (sortedType[i] == 2) {
                    return ((i + 1) + ". ").concat(d.concat("-\u2191")); // up
                } else {
                    return ((i + 1) + ". ").concat(d.concat("+\u2191"));
                }
            });
            if (translate) {
                sortedWordsEn = sortedWordsEn.map(function(d, i) {
                    if (sortedType[i] == 0) {
                        return ((i + 1) + ". ").concat(d.concat("-\u2193"));
                    } else if (sortedType[i] == 1) {
                        return ((i + 1) + ". ").concat(d.concat("+\u2193"));
                    } else if (sortedType[i] == 2) {
                        return ((i + 1) + ". ").concat(d.concat("-\u2191"));
                    } else {
                        return ((i + 1) + ". ").concat(d.concat("+\u2191"));
                    }
                });
            }
        } else {
            // old method, without numbers prefixed
            sortedWords = sortedWords.map(function(d, i) {
                // d = ((i+1)+". ").concat(d);
                if (sortedType[i] == 0) {
                    return ((i + 1) + ". ").concat(d.concat("-\u2193"));
                } else if (sortedType[i] == 1) {
                    return ((i + 1) + ". ").concat("\u2193+".concat(d));
                } else if (sortedType[i] == 2) {
                    return ((i + 1) + ". ").concat("\u2191-".concat(d));
                } else {
                    return ((i + 1) + ". ").concat(d.concat("+\u2191"));
                }
            });
        }
    }

    var shift = function(a, b, c, d) {
        var that = this;
        refF = a;
        compF = b;
        lens = c;
        words = d;
        loadsremaining = 0;
        shifter();
        return that;
    }

    var sortedMagFull;
    var sortedTypeFull;
    var distflag = false;
    var plotdist = function(_) {
        var that = this;
        if (!arguments.length) return distflag;
        distflag = _;
        return that;
    }

    var shiftMag;
    var shiftType;

    var _shiftMag = function(_) {
        var that = this;
        if (!arguments.length) return shiftMag;
        shiftMag = _;
        return that;
    }

    var _shiftType = function(_) {
        var that = this;
        if (!arguments.length) return shiftType;
        shiftType = _;
        return that;
    }

    var shifter = function() {
        // console.log("running the shifter");
        var that = this;
        /* shift two frequency vectors
           -assume they've been zero-ed for stop words
           -lens is of full length
           -words is a list of utf8 strings

           return an object with the sorted quantities for plotting the shift
        */

        //normalize frequencies
        var Nref = 0.0;
        var Ncomp = 0.0;
        var lensLength = d3.min([refF.length, compF.length, words.length, lens.length]);
        for (var i = 0; i < lensLength; i++) {
            Nref += parseFloat(refF[i]);
            Ncomp += parseFloat(compF[i]);
        }

        // for (var i=0; i<refF.length; i++) {
        //     refF[i] = parseFloat(refF[i])/Nref;
        //     compF[i] = parseFloat(compF[i])/Ncomp;
        // }

        // compute reference happiness
        refH = 0.0;
        for (var i = 0; i < lensLength; i++) {
            refH += refF[i] * parseFloat(lens[i]);
        }
        // normalize at the end to minimize floating point errors
        refH = refH / Nref;
        // console.log(refH);

        // compute reference variance
        // var refV = 0.0;
        // for (var i=0; i<refF.length; i++) {
        //     refV += refF[i]*Math.pow(parseFloat(lens[i])-refH,2);
        // }
        // refV = refV/Nref;
        // // console.log(refV);

        // compute comparison happiness
        compH = 0.0;
        for (var i = 0; i < lensLength; i++) {
            compH += compF[i] * parseFloat(lens[i]);
        }
        compH = compH / Ncomp;

        // do the shifting
        shiftMag = Array(lensLength);
        shiftType = Array(lensLength);
        var freqDiff = 0.0;
        for (var i = 0; i < lensLength; i++) {
            freqDiff = compF[i] / Ncomp - refF[i] / Nref;
            shiftMag[i] = (parseFloat(lens[i]) - refH) * freqDiff;
            if (freqDiff > 0) {
                shiftType[i] = 2;
            } else {
                shiftType[i] = 0
            }
            if (parseFloat(lens[i]) > refH) {
                shiftType[i] += 1;
            }
        }

        // +2 for frequency up
        // +1 for happier
        // =>
        // 0 sad, down
        // 1 happy, down
        // 2 sad, up
        // 3 happy, up

        // do the sorting
        var indices = Array(lensLength);
        for (var i = 0; i < lensLength; i++) {
            indices[i] = i;
        }
        indices.sort(function(a, b) {
            return Math.abs(shiftMag[a]) < Math.abs(shiftMag[b]) ? 1 : Math.abs(shiftMag[a]) > Math.abs(shiftMag[b]) ? -1 : 0;
        });

        sortedMag = Array(numwordstoplot);
        sortedType = Array(numwordstoplot);
        sortedWords = Array(numwordstoplot);

        // console.log(numwordstoplot);
        // console.log(indices);

        for (var i = 0; i < numwordstoplot; i++) {
            sortedMag[i] = shiftMag[indices[i]];
            sortedType[i] = shiftType[indices[i]]
            var tmpword = words[indices[i]];
            // add 1 to maxChars, because I'll add the ellipsis
            if (tmpword.length > maxChars + 2) {
                var shorterword = tmpword.slice(0, maxChars);
                // check that the last char isn't a space (if it is, delete it)
                if (shorterword[shorterword.length - 1] === " ") {
                    sortedWords[i] = shorterword.slice(0, shorterword.length - 1) + "\u2026";
                } else {
                    sortedWords[i] = shorterword + "\u2026";
                }
            } else {
                sortedWords[i] = tmpword;
            }
        }

        if (distflag) {
            // declare some new variables
            sortedMagFull = Array(lensLength);
            sortedTypeFull = Array(lensLength);
            for (var i = 0; i < lensLength; i++) {
                sortedMagFull[i] = shiftMag[indices[i]];
                sortedTypeFull[i] = shiftType[indices[i]];
            }
        }

        // compute the sum of contributions of different types
        sumTypes = [0.0, 0.0, 0.0, 0.0];
        for (var i = 0; i < lensLength; i++) {
            sumTypes[shiftType[i]] += shiftMag[i];
        }

        // slice them
        // sortedMag = sortedMag.slice(0,numwordstoplot);
        // sortedWords = sortedWords.slice(0,numwordstoplot);
        // sortedType = sortedType.slice(0,numwordstoplot);

        if (translate) {
            sortedWordsEn = Array(numwordstoplot);
            for (var i = 0; i < numwordstoplot; i++) {
                sortedWordsEn[i] = words_en[indices[i]];
            }
        }

        // // return as an object
        // return {
        //     sortedMag: sortedMag,
        //     sortedType: sortedType,
        //     sortedWords: sortedWords,
        //     sumTypes: sumTypes,
        //     refH: refH,
        //     compH: compH,
        // };

        sortedWordsRaw = sortedWords;
        sortedWordsRawEn = sortedWordsEn;
        concatter();

        // allow chaining here too
        return that;
    }


    var nbins = 100;
    var dist;
    var cdist;
    var ntypes = 4;
    var nwords;
    var computedistributions = function() {
        var that = this;
        // bin the distribution of words into a distribution
        // and cumulative
        // there are four types of contributions here (the way
        // the sum has been broken down), so do the distribution
        // for the total, and each of the four bins

        // nwords = sortedMagFull.length;
        // nwords = 2000;
        var a = 1;
        nwords = -1;
        while (a > Math.pow(10, -6)) {
            nwords++;
            a = Math.abs(sortedMagFull[nwords]);
        }
        // console.log(nwords);

        dist = Array(nbins);
        cdist = Array(nbins);

        // compute the size of each bin
        // should be a fast way to do this
        // when it doesn't round evenly
        var binsize = Math.floor(nwords / nbins);
        // console.log(binsize);

        // loop over each bin, initialize it to zero
        // then add each of the types to it
        for (var i = 0; i < nbins; i++) {
            dist[i] = Array(ntypes + 1);
            cdist[i] = Array(ntypes + 1);
            for (var j = 0; j < ntypes + 1; j++) {
                dist[i][j] = 0;
                cdist[i][j] = 0;
            }
            // fast, with the sum
            // console.log(i*binsize);
            // console.log((i+1)*binsize);
            dist[i][4] = d3.sum(sortedMagFull.slice(i * binsize, (i + 1) * binsize));
            // slower, by type
            for (var j = i * binsize; j < (i + 1) * binsize; j++) {
                dist[i][sortedTypeFull[j]] += sortedMagFull[j];
            }
        }

        // now get the cumulative
        for (var j = 0; j < ntypes + 1; j++) {
            cdist[0][j] = dist[0][j];
        }
        for (var i = 1; i < nbins; i++) {
            for (var j = 0; j < ntypes + 1; j++) {
                cdist[i][j] = cdist[i - 1][j] + dist[i][j];
            }
        }

        // console.log(dist);
        // console.log(cdist);
        // console.log(cdist[cdist.length-1]);
        return that;
    }

    // declare a boat load of private variables
    // to be accessed by the other methods
    var canvas;
    var maxWidth;
    var x;
    var y;
    var topScale;
    var bgrect;
    var xlabel;
    var topbgrect;
    var ylabel;
    var sepline;
    var zoom;
    var axes;
    var fontString = "Latex default, serif";
    var _fontString = function(_) {
        var that = this;
        if (!arguments.length) return fontString;
        fontString = _;
        return that;
    }
    // the inspector computed width of ∑+↓ rendering in latex default (cmr10)
    var sumTextWidth = 34.1562;
    // these are set explicitly on the elements
    var bigshifttextsize = 12;
    var xaxisfontsize = 12;
    var xylabelfontsize = 16;
    var wordfontsize = 12;
    var distlabeltext = 8;
    var creditfontsize = 8;
    var resetfontsize = 12;
    // [16,10,20,10,8,8,13];
    var setFontSizes = function(_) {
        var that = this;
        if (!arguments.length) return [bigshifttextsize, xaxisfontsize, xylabelfontsize, wordfontsize, distlabeltext, creditfontsize, resetfontsize];
        bigshifttextsize = _[0];
        xaxisfontsize = _[1];
        xylabelfontsize = _[2];
        wordfontsize = _[3];
        distlabeltext = _[4];
        creditfontsize = _[5];
        resetfontsize = _[6];
        return that;
    }
    var typeClass;
    var colorClass;
    var shiftrects;
    var shifttext;
    var flipVector;
    var maxShiftSum;
    var summaryArray;
    var toptext;
    var toptextheight;
    var credit;
    var help;
    // var credit_text_array = ["visualization by","@andyreagan","word shifts by","@hedonometer"]
    var credit_text_array = ["visualization by", "@andyreagan"]
    var _credit_text_array = function(_) {
        var that = this;
        if (!arguments.length) {
            return credit_text_array;
        } else {
            credit_text_array = _;
            return that;
        }
    }
    var xAxis;
    var distgroup;
    var my_shift_id = "shiftsvg";
    var _my_shift_id = function(_) {
        var that = this;
        if (!arguments.length) return my_shift_id;
        my_shift_id = _;
        return that;
    }



    // var bgcolor = "rgba(255,248,220,.2)";
    var bgcolor = "white";
    var setBgcolor = function(_) {
        var that = this;
        if (!arguments.length) return bgcolor;
        bgcolor = _;
        return that;
    }

    var logowidth = 0;

    var bottombgrect;
    var topbgrect2;
    var bgbgrect;
    var xpadding;
    var create_xAxis;

    var plot = function() {
        var that = this;
        /* plot the shift

           -take a d3 selection, and draw the shift SVG on it
           -requires sorted vectors of the shift magnitude, type and word
           for each word

        */
        // console.log("plotting shift");

        // first things first, plot the text on top
        // if there wasn't any text passed, make it
        if (comparisonText[0].length < 1) {
            if (compH >= refH) {
                var happysad = "happier";
            } else {
                var happysad = "less happy";
            }

            // console.log("generating text for wordshift");
            comparisonText = splitarray(
                ["Reference happiness: " + refH.toFixed(2), "Comparison happiness: " + compH.toFixed(2), "Why comparison is " + happysad + " than reference:"],
                boxwidth - 10 - logowidth,
                topFontSizeArray[topFontSizeArray.length - 1] + "px  " + fontString
            );

            // console.log(comparisonText);
        } else {
            if (split_top_strings) {
                comparisonText = splitarray(
                    comparisonText,
                    boxwidth - 10 - logowidth,
                    topFontSizeArray[topFontSizeArray.length - 1] + "px  " + fontString
                );
            }
            // console.log(comparisonText);
        }

        // this would put the text above the svg, in the figure div
        // figure.selectAll("p")
        //     .remove();
        // figure.selectAll("p")
        //     .data(comparisonText)
        //     .enter()
        //     .insert("p","svg")
        //     .attr("class","shifttitle")
        //     .html(function(d) { return d; });

        // made a new svg
        figure.selectAll("svg").remove();
        canvas = figure.append("svg")
            .attr("id", my_shift_id)
            .attr("width", function() {
                return boxwidth;
            })
            .attr("height", function() {
                return boxheight;
            });

        // this one will be white, and behind EVERYTHING
        bgbgrect = canvas.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", boxwidth)
            .attr("height", boxheight)
            .attr("class", "bgbg")
            .attr("fill", bgcolor);

        toptextheight = comparisonText.length * 17 + 13;
        // console.log(toptextheight);

        // reset this
        figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom - toptextheight;
        // console.log(figheight);
        // console.log(yHeight);

        // take the longest of the top five words
        // console.log("appending to sorted words");
        // console.log(sortedWords);

        maxWidth = d3.max(sortedWords.slice(0, 7).map(function(d) {
            return stringwidth(d, wordfontsize + "px  " + fontString);
        }));

        // a little extra padding for the words
        xpadding = 10;
        // linear scale function
        x = d3.scaleLinear()
            .domain([-Math.abs(sortedMag[0]), Math.abs(sortedMag[0])])
            .range([maxWidth + xpadding, figwidth - maxWidth - xpadding]);

        // linear scale function
        y = d3.scaleLinear()
            .domain([numWords + 1, 1])
            .range([figheight + 2, yHeight]);

        // zoom object for the axes
        zoom = d3.zoom()
            // .y(y) // pass linear scale function
            // .translate([10,10])
            // .scaleExtent([0,0])
            // .translateExtent([[Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY],[Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY]])
            .translateExtent([
                [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
                [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
            ])
            .on("zoom", zoomed);

        // create the axes themselves
        axes = canvas
            // not using the "svg inside svg" approach again
            // .append("svg")
            // .attr("width", figwidth)
            // .attr("height", figheight)
            // .attr("class", "shiftcanvas")
            .append("g")
            .attr("transform", "translate(" + (axeslabelmargin.left) + "," + (axeslabelmargin.top + toptextheight) + ")")
            .attr("width", figwidth)
            .attr("height", figheight)
            .attr("class", "main");

        // axes.call(zoom);
        // axes.call(drag);
        // var dispatch = d3.dispatch("wheel");
        axes.on("wheel.zoom", zoomed);

        // // don't need these
        // axes.on("wheel.zoom", null);
        // axes.on("mousewheel.zoom", null);
        // // can re-register them...
        // // axes.on("wheel",function(d) { console.log(d3.event); });
        // // axes.on("mousewheel",function(d) { console.log(d3.event); });
        // // now use them to translate (instead of zoom)
        // axes.on("wheel",function(d) { d3.event.preventDefault(); zoom.translate([0,zoom.translate()[1]+d3.event.wheelDeltaY/2]); zoom.event(axes); });
        // axes.on("mousewheel",function(d) { d3.event.preventDefault(); zoom.translate([0,zoom.translate()[1]+d3.event.wheelDeltaY/2]); zoom.event(axes); });

        // create the axes background
        bgrect = axes.append("rect")
            .attr("x", 0)
            .attr("y", 1)
            .attr("width", figwidth - 2)
            .attr("height", figheight - 2)
            .attr("class", "bg")
            .style("stroke-width", "0.5")
            .style("stroke", "rgb(0,0,0)")
            .style("fill", "#FCFCFC")
            .style("opacity", "0.96");

        if (show_x_axis_bool) {
            // axes creation functions
            create_xAxis = function() {
                return d3.axisBottom()
                    .ticks(4)
                    .scale(x);
            }

            xAxis = create_xAxis();
                // .innerTickSize(3)
                // .outerTickSize(0);

            canvas.append("g")
                .attr("class", "x axis ")
                .attr("font-size", xaxisfontsize)
                .attr("transform", "translate(" + (axeslabelmargin.left) + "," + (boxheight - axeslabelmargin.bottom) + ")")
                // .attr("transform", "translate(0," + (figheight) + ")")
                .call(xAxis);

            canvas.selectAll(".tick line").style(
                "stroke", "black"
            );
        }


        // figure.selectAll("p.sumtext.ref")
        //     .data([refH,])
        //     .html(function(d,i) {
        //         if (i===0) {
        //         return "Reference: happiness " + (d.toFixed(3));
        //         }
        //     });

        // figure.selectAll("p.sumtext.comp")
        //     .data([compH,])
        //     .html(function(d,i) {
        //         if (i===0) {
        //         return "Comparison: happiness " + (d.toFixed(3));
        //         }
        //     });

        // addthis_share.passthrough.twitter.text = "Why "+allData[shiftComp].name+" was "+happysad+" than "+allData[shiftRef].name+" in "+timeseldecoder().cached;

        // addthis_share.title = "Why "+allData[shiftComp].name+" was "+happysad+" than "+allData[shiftRef].name+" in "+timeseldecoder().cached;

        // addthis_share.url = document.URL;

        // d3.select("[id=fbtitle]").attr("content","Hedonometer Maps: Andy has been here");

        typeClass = ["negdown", "posdown", "negup", "posup"];
        colorClass = ["#b3b3ff", "#ffffb3", "#4c4cff", "#ffff4c", "#272727"];

        shiftrects = axes.selectAll("rect.shiftrect")
            .data(sortedMag)
            .enter()
            .append("rect")
            .attr("class", function(d, i) {
                return "shiftrect " + intStr0[sortedType[i]] + " " + typeClass[sortedType[i]];
            })
            // .attr("x", function(d,i) {
            //     if (d>0) { return figcenter; }
            //     else { return x(d)}
            // })
            // .attr("y", function(d,i) { return y(i+1); },
            .attr("id", function(d, i) {
                return "shiftrect" + i;
            })
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", function(d, i) {
                if (d > 0) {
                    return "translate(" + figcenter + "," + y(i + 1) + ")";
                } else {
                    return "translate(" + x(d) + "," + y(i + 1) + ")";
                }
            })
            .attr("height", function(d, i) {
                return iBarH;
            })
            .attr("width", function(d, i) {
                if ((d) > 0) {
                    return x(d) - x(0);
                } else {
                    return x(0) - x(d);
                }
            })
            .attr("opacity", "0.7")
            .attr("stroke-width", "1")
            .attr("stroke", "rgb(0,0,0)")
            .attr("fill", function(d, i) {
                return colorClass[sortedType[i]];
            })
        // .on("mouseover", function(d){
        //     var rectSelection = d3.select(this).style(  "1.0");
        // })
        // .on("mouseout", function(d){
        //     var rectSelection = d3.select(this).style("opacity", "0.7");
        // });


        shifttext = axes.selectAll("text.shifttext")
            .data(sortedMag)
            .enter()
            .append("text")
            .attr("class", function(d, i) {
                return "shifttext " + intStr0[sortedType[i]]
            })
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", function(d, i) {
                if (d > 0) {
                    return "translate(" + (x(d) + 2) + "," + (y(i + 1) + iBarH) + ")"
                } else {
                    return "translate(" + (x(d) - 2) + "," + (y(i + 1) + iBarH) + ")"
                }
            })
            // .attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } )
            // .attr("y",function(d,i) { return y(i+1)+iBarH; } )
            .style("text-anchor", function(d, i) {
                return ((d < 0) ? "end" : "start")
            })
            .style("font-size", wordfontsize)
            .text(function(d, i) {
                return sortedWords[i];
            });

        if (translate) {
            // it is one longer than the words, the last entry being what
            // everything will be set to on "translate all"
            flipVector = Array(sortedWords.length + 1);
            for (var i = 0; i < flipVector.length; i++) {
                flipVector[i] = 0;
            }
            flipVector[flipVector.length - 1] = 1;
            shifttext.on("click", function(d, i) {
                // goal is to toggle translation
                // need translation vector
                //console.log(flipVector[i]);
                if (flipVector[i]) {
                    d3.select(this).text(sortedWords[i]);
                    flipVector[i] = 0;
                } else {
                    d3.select(this).text(sortedWordsEn[i]);
                    flipVector[i] = 1;
                }
            });
        }

        // check if there is a word selection to apply
        if (shiftseldecoder().current === "posup") {
            shiftTypeSelect = true;
            shiftType = 3;
            resetButton(true);
            // ((d>0) ? 500 : -500)
            // ((d>0) ? figcenter : x(d))
            axes.selectAll("rect.shiftrect.zero").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.zero").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.one").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.one").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.two").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.two").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            // .attr("transform","translate(0,"+y(i+1)+")");
            // .attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
            axes.selectAll("rect.shiftrect.three").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.three").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
        } else if (shiftseldecoder().current === "negdown") {
            shiftTypeSelect = true;
            shiftType = 0;
            resetButton(true);
            axes.selectAll("rect.shiftrect.zero").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.zero").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.one").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.one").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.two").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.two").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.three").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.three").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
        } else if (shiftseldecoder().current === "posdown") {
            shiftTypeSelect = true;
            shiftType = 1;
            resetButton(true);
            axes.selectAll("rect.shiftrect.zero").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.zero").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.three").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.three").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.two").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.two").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.one").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.one").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
        } else if (shiftseldecoder().current === "negup") {
            shiftTypeSelect = true;
            shiftType = 2;
            resetButton(true);
            axes.selectAll("rect.shiftrect.zero").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.zero").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.one").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.one").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.two").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.two").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.three").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.three").attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
        }

        // draw a white rectangle to hide the shift bars behind the summary shifts
        // move x,y to 3 and width to -6 to give the bg a little space
        topbgrect = axes.append("rect").attr("x", 3).attr("y", 3).attr("width", figwidth - axeslabelmargin.left - 5).attr("height", 73 - 13).attr("fill", "white").style(
            "opacity", "1.0"
        );

        topbgrect2 = canvas.append("rect").attr("x", 0).attr("y", 0).attr("width", boxwidth).attr("height", toptextheight).attr("fill", bgcolor).style(
            "opacity", "1.0"
        );

        // draw the text on top of this rect
        toptext = canvas.selectAll("text.titletext")
            .data(comparisonText)
            .enter()
            .append("text")
            .attr("y", function(d, i) {
                return (i + 1) * 17;
            })
            .attr("x", 3)
            .attr("class", function(d, i) {
                return "titletext " + intStr[i];
            })
            // "font-family": "Helvetica Neue",
            .style("font-size", function(d, i) {
                return topFontSizeArray[i];
            })
            .style("line-height", "1.42857143")
            .style("color", function(d, i) {
                return colorArray[i];
            })
            // if there are 4 items...make the first two bold
            .style("font-weight", function(d, i) {
                // using this variable numBoldLines
                if (i < numBoldLines) {
                    return "bold";
                } else {
                    return "normal";
                }
                // if (comparisonText.length > 3) {
                //     if (i < (comparisonText.length - 2) ) {
                //      return "bold";
                //     }
                //     else {
                //      return "normal";
                //     }
                // }
                // else {
                //     return "normal";
                // }
            })
            .text(function(d, i) {
                return d;
            });

        bottombgrect = axes.append("rect")
            .attr("x", 3)
            .attr("y", fullheight - axeslabelmargin.bottom - toptextheight)
            .attr("width", figwidth - 2)
            .attr("height", axeslabelmargin.bottom)
            .attr("fill", bgcolor)
            .style(
                "opacity", "1.0"
            );

        // draw the summary things
        sepline = axes.append("line")
            .attr("x1", 0)
            .attr("x2", figwidth - 2)
            .attr("y1", barHeight)
            .attr("y2", barHeight)
            .style("stroke-width", "1")
            .style("stroke", "black")

        maxShiftSum = Math.max(Math.abs(sumTypes[1]), Math.abs(sumTypes[2]), sumTypes[0], sumTypes[3], d3.sum(sumTypes));

        topScale = d3.scaleLinear()
            .domain([-maxShiftSum, maxShiftSum])
            // .range([figwidth*.12,figwidth*.88]);
            .range([sumTextWidth, figwidth - sumTextWidth]);

        // define the RHS summary bars so I can add if needed
        // summaryArray = [sumTypes[3],sumTypes[0],sumTypes[3]+sumTypes[1],d3.sum(sumTypes)];
        summaryArray = [sumTypes[3], sumTypes[0], d3.sum(sumTypes)];

        typeClass = ["posup", "negdown", "sumgrey"];
        colorClass = ["#ffff4c", "#b3b3ff", "#272727"];

        axes.selectAll(".sumrectR")
            .data(summaryArray)
            .enter()
            .append("rect")
            .attr("class", function(d, i) {
                return "sumrectR " + intStr0[i] + " " + typeClass[i];
            })
            .attr("x", function(d, i) {
                if (d > 0) {
                    return figcenter;
                } else {
                    return topScale(d);
                }
            })
            .attr("y", function(d, i) {
                if (i < 3) {
                    return i * 17 + 7;
                } else {
                    return i * 17 + 7 - 2;
                }
            })
            .attr("height", function(d, i) {
                return 14;
            })
            .attr("width", function(d, i) {
                if (d > 0) {
                    return topScale(d) - figcenter;
                } else {
                    return figcenter - topScale(d);
                }
            })
            .attr("fill", function(d, i) {
                return colorClass[i];
            })
            .style(
                "opacity",
                function(d, i) {
                    var specificType = [3, 0, -1];
                    if ((shiftTypeSelect) && (shiftType !== specificType[i])) {
                        return "0.14";
                    } else {
                        return "0.7";
                    }
                })
            .style("stroke-width", "1")
            .style("stroke", "rgb(0,0,0)")
            .on("mouseover", function(d, i) {
                var specificType = [3, 0, -1];
                // if we're in a shift selection
                if (shiftTypeSelect) {
                    if (shiftType === specificType[i]) {
                        // console.log("in a shift type, and that specific type");
                        var rectSelection = d3.select(this).style(
                            "opacity", "0.7"
                        );
                    } else {
                        // console.log("in a shift type, but not that specific type");
                        var rectSelection = d3.select(this).style(
                            "opacity", "0.3"
                        );
                    }
                }
                // not in a shift selection
                else {
                    // console.log("not in a shift type");
                    var rectSelection = d3.select(this).style(
                        "opacity", "1.0"
                    );
                }
            })
            .on("mouseout", function(d, i) {
                var specificType = [3, 0, -1];
                if (shiftTypeSelect) {
                    if (shiftType === specificType[i]) {
                        // console.log("in a shift type, and that specific type");
                        var rectSelection = d3.select(this).style(
                            "opacity", "0.7"
                        );
                    } else {
                        // console.log("in a shift type, but not that specific type");
                        // console.log(shiftType);
                        // console.log(specificType);
                        // console.log(i);
                        // console.log(specificType[i]);
                        var rectSelection = d3.select(this).style(
                            "opacity", "0.14"
                        );
                    }
                } else {
                    // console.log("not in a shift type");
                    var rectSelection = d3.select(this).style(
                        "opacity", "0.7"
                    );
                }
            })
            .on("click", function(d, i) {
                var specificType = [3, 0, -1];
                figure.selectAll(".sumrectR,.sumrectL").style(
                    "opacity", "0.1"
                );
                var rectSelection = d3.select(this).style(
                    "opacity", "0.7"
                );
                if (i == 0) {
                    shiftTypeSelect = true;
                    shiftType = specificType[i];
                    resetButton(true);
                    shiftselencoder.varval("posup");
                    // shoot them all away
                    //d3.selectAll("rect.shiftrect, text.shifttext").transition().duration(1000).attr("transform",function(d,i) { if (d<0) { return "translate(-500,0)"; } else {return "translate(500,0)"; }});
                    // keep the ones with class "three"
                    //d3.selectAll("rect.shiftrect.three, text.shifttext.three").transition().duration(1000)
                    axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                    });
                } else if (i == 1) {
                    shiftTypeSelect = true;
                    shiftType = specificType[i];
                    resetButton(true);
                    shiftselencoder.varval("negdown");
                    axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                } else if (i == 2) {
                    // shiftTypeSelect = true;
                    // d3.selectAll(".sumrectR,.sumrectL").style( opacity:"0.7"});
                    resetfun();
                    // shiftselencoder.varval("negdown");
                }
            });

        axes.selectAll(".sumtextR")
            .data([sumTypes[3], sumTypes[0], d3.sum(sumTypes)])
            .enter()
            .append("text")
            .style("text-anchor", function(d, i) {
                return ((d > 0) ? "start" : "end");
            })
            .style("font-size", bigshifttextsize)
            //.attr("y",function(d,i) { if (i<2) {return i*17+17;} else if ((sumTypes[3]+sumTypes[1])*(sumTypes[0]+sumTypes[2])<0) {return i*17+33; } else {return i*17+33; } })
            // for only three days
            .attr("class", "sumtextR")
            .attr("id", function(d, i) {
                return "sumTextR" + i;
            })
            .attr("y", function(d, i) {
                return i * 17 + 17;
            })
            .attr("x", function(d, i) {
                return topScale(d) + 5 * d / Math.abs(d);
            })
            .text(function(d, i) {
                if (i == 0) {
                    return "\u2211+\u2191";
                }
                if (i == 1) {
                    return "\u2211-\u2193";
                } else {
                    return "\u2211";
                }
            });

        // summaryArray = [sumTypes[1],sumTypes[2],sumTypes[0]+sumTypes[2]];
        summaryArray = [sumTypes[1], sumTypes[2]];

        typeClass = ["posdown", "negup"];
        colorClass = ["#ffffb3", "#4c4cff"];

        axes.selectAll(".sumrectL")
            .data(summaryArray)
            .enter()
            .append("rect")
            .attr("class", function(d, i) {
                return "sumrectL " + intStr0[i] + " " + typeClass[i];
            })
            .attr("id", function(d, i) {
                return "sumTextL" + i;
            })
            .attr("x", function(d, i) {
                if (i < 2) {
                    return topScale(d);
                } else {
                    // place the sum of negatives bar
                    // if they are not opposing
                    if ((sumTypes[3] + sumTypes[1]) * (sumTypes[0] + sumTypes[2]) > 0) {
                        // if positive, place at end of other bar
                        if (d > 0) {
                            return topScale((sumTypes[3] + sumTypes[1]));
                        }
                        // if negative, place at left of other bar, minus length (+topScale(d))
                        else {
                            return topScale(d) - (figcenter - topScale((sumTypes[3] + sumTypes[1])));
                        }
                    } else {
                        if (d > 0) {
                            return figcenter
                        } else {
                            return topScale(d)
                        }
                    }
                }
            })
            .attr("y", function(d, i) {
                return i * 17 + 7;
            })
            .attr("height", function(d, i) {
                return 14;
            })
            .attr("width", function(d, i) {
                if (d > 0) {
                    return topScale(d) - figcenter;
                } else {
                    return figcenter - topScale(d);
                }
            })
            .attr("fill", function(d, i) {
                return colorClass[i];
            })
            .style("opacity", function(d, i) {
                var specificType = [1, 2];
                if ((shiftTypeSelect) && (shiftType !== specificType[i])) {
                    return "0.14";
                } else {
                    return "0.7";
                }
            })
            .style("stroke-width", "1")
            .style("stroke", "rgb(0,0,0)")
            .on("mouseover", function(d, i) {
                var specificType = [1, 2];
                // if we're in a shift selection
                if (shiftTypeSelect) {
                    if (shiftType === specificType[i]) {
                        // console.log("in a shift type, and that specific type");
                        var rectSelection = d3.select(this).style(
                            "opacity", "0.7"
                        );
                    } else {
                        // console.log("in a shift type, but not that specific type");
                        var rectSelection = d3.select(this).style(
                            "opacity", "0.3"
                        );
                    }
                }
                // not in a shift selection
                else {
                    // console.log("not in a shift type");
                    var rectSelection = d3.select(this).style(
                        "opacity", "1.0"
                    );
                }
            })
            .on("mouseout", function(d, i) {
                var specificType = [1, 2];
                if (shiftTypeSelect) {
                    if (shiftType === specificType[i]) {
                        // console.log("in a shift type, and that specific type");
                        var rectSelection = d3.select(this).style(
                            "opacity", "0.7"
                        );
                    } else {
                        // console.log("in a shift type, but not that specific type");
                        // console.log(shiftType);
                        // console.log(specificType);
                        // console.log(i);
                        // console.log(specificType[i]);
                        var rectSelection = d3.select(this).style(
                            "opacity", "0.14"
                        );
                    }
                } else {
                    // console.log("not in a shift type");
                    var rectSelection = d3.select(this).style(
                        "opacity", "0.7"
                    );
                }
            })
            .on("click", function(d, i) {
                var specificType = [1, 2];
                shiftTypeSelect = true;
                shiftType = specificType[i];
                figure.selectAll(".sumrectR,.sumrectL").style(
                    "opacity", "0.1"
                );
                var rectSelection = d3.select(this).style(
                    "opacity", "0.7"
                );
                resetButton(true);
                if (i == 0) {
                    shiftselencoder.varval("posdown");
                    // together
                    // axes.selectAll("rect.shiftrect.zero, text.shifttext.zero, rect.shiftrect.three, text.shifttext.three, rect.shiftrect.two, text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { if (d<0) { return "translate(-500,0)"; } else {return "translate(500,0)"; }});
                    // separate
                    axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                    });
                } else if (i == 1) {
                    shiftselencoder.varval("negup");
                    axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                    });
                    axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                    });
                    axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                        return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                    });
                }
            });

        axes.selectAll(".sumtextL")
            .data(summaryArray)
            .enter()
            .append("text")
            .style("text-anchor", "end")
            .style("font-size", bigshifttextsize)
            .attr("class", "sumtextL")
            .attr("y", function(d, i) {
                return i * 17 + 17;
            })
            .text(function(d, i) {
                if (i == 0) {
                    return "\u2211+\u2193";
                } else {
                    return "\u2211-\u2191";
                }
            })
            .attr("x", function(d, i) {
                return topScale(d) - 5;
            });

        // x label of shift, outside of the SVG
        xlabel = canvas.append("text")
            .text(xlabel_text)
            .attr("class", "axes-text")
            .attr("x", axeslabelmargin.left + figcenter) // 350-20-10 for svg width,
            .attr("y", boxheight - 7)
            .style("font-size", xylabelfontsize)
            .style("fill", "#000000")
            .style("text-anchor", "middle")

        ylabel = canvas.append("text")
            .text(ylabel_text)
            .attr("class", "axes-text")
            .attr("x", 18)
            .attr("y", figheight / 2 + 60 + toptextheight)
            .attr("font-size", xylabelfontsize)
            .attr("fill", "#000000")
            .attr("transform", "rotate(-90.0," + (18) + "," + (figheight / 2 + 60 + toptextheight) + ")");

        axes.property("__zoom", 0);

        function zoomed() {
            // console.log(d3.event);
            // console.log(this.__zoom);
            if ((this.__zoom <= 0) && (d3.event.deltaY < 0)) return;
            d3.event.preventDefault();
            // console.log(zoom);
            // console.log(axes);
            // console.log(this);
            // console.log(this.__zoom);
            // console.log(axes.__zoom);
            // console.log(axes.property("__zoom"));
            // axes.call(zoom.transform);
            // axes.property("__zoom",axes.property("__zoom")+d3.event.deltaY);
            this.__zoom += d3.event.deltaY / 2;
            // this prevents scrolling in the wrong direction
            // if (d3.event.transform.y > 0) {
            //     zoom.translate([0,0]).scale(1);
            // }
            var that = this;
            axes.selectAll("rect.shiftrect")
                .attr("y", function(d) {
                    return -that.__zoom;
                });
            axes.selectAll("text.shifttext")
                .attr("y", function(d) {
                    return -that.__zoom;
                });
            // .attr("y",d3.min([-d3.event.transform.y,0]));
            // axes.selectAll("text.shifttext")
            //     .attr("y",-d3.event.transform.y);
            if (distflag) {
                // console.log(d3.event.translate);
                // move scaled to the height of the window (23 words)
                var scaledMove = d3.event.translate.y / (figheight - yHeight);
                // console.log(scaledMove);
                // move relative to the height of the box and those 23 words
                var relMove = scaledMove * distgrouph * numWords / lens.length;
                // console.log(relMove);
                figure.select(".distwin").attr(
                    "y", d3.max([2, -relMove + 2]),
                );
            }
        }; // zoomed

        // // console.log(figheight);
        // // attach this guy. cleaner with the group
        // help = axes.append("g")
        //     .attr("class", "help")
        //        .attr("fill", "#B8B8B8")
        //        .attr("transform", "translate("+(5)+","+(figheight-16)+")")
        //     .on("click", function() {
        //     window.open("http://hedonometer.org/instructions.html#wordshifts","_blank");
        //     })
        //     .selectAll("text.help")
        //     .data(["click here","for instructions"])
        //     .enter()
        //     .append("text")
        //     .attr("class", "help")
        //        .attr("fill", "#B8B8B8")
        //        .attr("x", 0)
        //        .attr("y", function(d,i) { return i*10; })
        //        .attr("font-size", "8.0px")
        //     .style("text-anchor", "start")
        //     .text(function(d) { return d; });

        if (distflag) {
            computedistributions();

            // console.log(figheight);
            // console.log(yHeight);
            var distgrouph = 250;
            var distgroupw = 70;
            var dxspace = 1;
            var dyspace = 2;

            distgroup = axes.append("g")
                .attr("class", "dist")
                .attr("fill", "#B8B8B8")
                .attr("transform", "translate(" + (5) + "," + (figheight - 28 - distgrouph) + ")")

            distgroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", distgrouph)
                .attr("width", distgroupw)
                .attr("class", "distbg")
                .attr("stroke-width", "2")
                .attr("stroke", "rgb(150,150,150)")
                .attr("fill", "#FCFCFC")
                .attr("opacity", "0.96")

            var distx = d3.scaleLinear()
                .domain(d3.extent(dist.map(function(d) {
                    return d[4];
                })))
                .range([dxspace, distgroupw - 2 * dxspace]);

            var disty = d3.scaleLinear()
                .domain([0, nbins - 1])
                .range([dyspace, distgrouph - dyspace]);
            // .range([dyspace,distgrouph-2*dyspace]);

            var line = d3.line()
                .x(function(d, i) {
                    return distx(d);
                })
                .y(function(d, i) {
                    return disty(i);
                })
                .curve(d3.curveCardinal);
            // .interpolate("cardinal");

            // console.log(dist.map(function(d) { return d[4]; }));

            var distline = distgroup.append("path")
                .datum(dist.map(function(d) {
                    return d[4];
                }))
                .attr("class", "line")
                .attr("d", line)
                .attr("stroke", "red")
                .attr("stroke-width", 1.25)
                .attr("fill", "none");

            var cdistx = d3.scaleLinear()
                .domain(d3.extent(cdist.map(function(d) {
                    return d[4];
                })))
                .range([dxspace, distgroupw - 2 * dxspace]);

            var cline = d3.line()
                .x(function(d, i) {
                    return cdistx(d);
                })
                .y(function(d, i) {
                    return disty(i);
                })
                .curve(d3.curveCardinal);
            // .interpolate("cardinal");

            var cdistline = distgroup.append("path")
                .datum(cdist.map(function(d) {
                    return d[4];
                }))
                .attr("class", "line")
                .attr("d", cline)
                .attr("stroke", "blue")
                .attr("stroke-width", 1.25)
                .attr("fill", "none");

            // console.log(distgrouph*numWords/lens.length);
            // console.log(distgrouph*numWords/2000);

            var distwindowrect = distgroup.append("rect")
                .attr("x", 0)
                .attr("y", 2)
                .attr("height", distgrouph * numWords / nwords)
                .attr("width", distgroupw)
                .attr("class", "distwin")
                .attr("stroke-width", "0.75")
                .attr("stroke", "rgb(20,20,20)")
                .attr("fill", "#FCFCFC")
                .attr("opacity", "0.6")

            var nwordstext = distgroup.append("text")
                .attr("x", distgroupw + 2)
                .attr("y", distgrouph + 2)
                .attr("class", "nwordslabel")
                .style("fill", "#B8B8B8")
                .style("font-size", distlabeltext)
                .style("text-anchor", "start")
                .text(nwords);

            distgroup.append("text")
                .attr("x", distgroupw + 2)
                .attr("y", 2)
                .attr("class", "zerolabel")
                .style("fill", "#B8B8B8")
                .style("font-size", distlabeltext)
                .style("text-anchor", "start")
                .text("0");
        }

        credit = axes.selectAll("text.credit")
            .data(credit_text_array)
            .enter()
            .append("text")
            .attr("class", "credit")
            .attr("x", (figwidth - 5))
            .attr("y", function(d, i) {
                return figheight - 15 + i * 10;
            })
            .style("text-anchor", "end")
            .style("fill", "#B8B8B8")
            .style("font-size", creditfontsize)
            .text(function(d) {
                return d;
            });

        // get this inside of the plot...so that resizeshift won't get called
        // too early (before a shift has been plotted)
        if (!widthsetexplicitly) {
            d3.select(window).on("resize.shiftplot", resizeshift);
        }

        if (reset) {
            // call it
            resetButton(true);
        }

        if (translate) {
            console.log(translate);
            translateButton();
        }

        return that;

    }; // plot

    function resetButton(showb) {
        // console.log("resetbutton function");

        // console.log(showb);
        // showb = showb || true;
        // console.log("showing reset button?");
        // console.log(showb);
        figure.selectAll(".resetbutton").remove();

        if (showb) {

            var resetGroup = canvas.append("g")
                .attr("transform", "translate(" + (4) + "," + (56 + toptextheight) + ") rotate(-90)")
                .attr("class", "resetbutton");

            resetGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("width", 48)
                .attr("height", 17)
                .attr("fill", "#F0F0F0") //http://www.w3schools.com/html/html_colors.asp
                .style("stroke-width", "0.5")
                .style("stroke", "rgb(0,0,0)")

            resetGroup.append("text")
                .text("Reset")
                .attr("x", 6)
                .attr("y", 13)
                .attr("font-size", resetfontsize);

            resetGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("width", 48)
                .attr("height", 18)
                .attr("fill", "white") //http://www.w3schools.com/html/html_colors.asp
                .style("opacity", "0.0")
                .on("click", function() {
                    resetfun();
                });

        }

    }; // resetButton

    function resetfun() {
        // console.log("reset function");
        figure.selectAll(".sumrectR,.sumrectL").style(
            "opacity", "0.7"
        );
        shiftTypeSelect = false;
        shiftType = -1;
        figure.selectAll("rect.shiftrect").transition().duration(1000)
            .attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
        figure.selectAll("text.shifttext").transition().duration(1000)
            .attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
        // d3.selectAll(".resetbutton").remove();
        shiftselencoder.varval("none");
        shiftselencoder.destroy();
    } // resetfun

    var replot = function() {
        var that = this;

        // apply new data to the bars, transition everything
        // tricky to get the transition right
        var yHeight = (7 + 17 * 3 + 14 + 5 - 13); // 101

        // linear scale function
        y.range([figheight + 2, yHeight]);
        sepline.transition().duration(1000)
            .attr("y1", barHeight)
            .attr("y2", barHeight)

        if (viz_type_decoder().cached === "table") {
            // console.log("removing table stuff");
            newrank.remove();
            newfreq.remove();
            newtype.remove();
            newmag.remove();
            header.remove();
        }

        viz_type.varval("wordshift");
        // console.log("making a wordshift");

        // make sure to update this
        if (comparisonText[0].length < 1) {
            if (compH >= refH) {
                var happysad = "happier";
            } else {
                var happysad = "less happy";
            }

            // console.log("generating text for wordshift");
            comparisonText = splitarray(
                ["Reference happiness: " + refH.toFixed(2), "Comparison happiness: " + compH.toFixed(2), "Why comparison is " + happysad + " than reference:"],
                boxwidth - 10 - logowidth,
                "14px  " + fontString
            );
            // console.log(comparisonText);
        } else {
            if (split_top_strings) {
                comparisonText = splitarray(
                    comparisonText,
                    boxwidth - 10 - logowidth,
                    "14px  " + fontString
                );
            }
            // console.log(comparisonText);
        }

        // could set a cap to make sure no 0"s
        maxWidth = d3.max(sortedWords.slice(0, 5).map(function(d) {
            return stringwidth(d, wordfontsize + "px  " + fontString);
        }));

        var xpadding = 10;
        // linear scale function
        x.domain([-Math.abs(sortedMag[0]), Math.abs(sortedMag[0])])
            .range([maxWidth + xpadding, figwidth - maxWidth - xpadding]);

        if (show_x_axis_bool) {
            canvas.select(".x.axis")
                .call(xAxis);
        }

        // get the height again
        toptextheight = comparisonText.length * 17 + 13;
        // console.log(toptextheight);

        resetButton(true);

        // reset this
        figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom - toptextheight;

        // linear scale function
        y.range([figheight + 2, yHeight]);

        axes.attr("transform", "translate(" + (axeslabelmargin.left) + "," + (axeslabelmargin.top + toptextheight) + ")")
            .attr("height", figheight);

        bgrect.attr("height", figheight - 2).style(
                "stroke-width", 0.5)
            .style("stroke", "rgb(20,20,20)")

        topbgrect2.attr("height", toptextheight);

        // // console.log(figheight);
        // canvas.selectAll("g.help").remove();
        // help.remove();
        // help = axes.append("g")
        // .attr("class", "help")
        //  .attr("fill", "#B8B8B8")
        //  .attr("transform", "translate("+(5)+","+(figheight-16)+")")
        //     .on("click", function() {
        //     window.open("http://hedonometer.org/instructions.html#wordshifts","_blank");
        //     })
        //     .selectAll("text.help")
        //     .data(["click here","for instructions"])
        //     .enter()
        //     .append("text")
        //         .attr("class", "help")
        //    .attr("fill", "#B8B8B8")
        //    .attr("x", 0)
        //    .attr("y", function(d,i) { return i*10; })
        //    .attr("font-size", "8.0px")
        // .style("text-anchor", "start")
        //     .text(function(d) { return d; });


        // since I really want this on there (in safari)
        // go through the extra trouble of removing it first
        canvas.selectAll("text.credit").remove();
        credit.remove();
        credit = axes.selectAll("text.credit")
            .data(["visualization by", "@andyreagan"])
            .enter()
            .append("text")
            .attr("class", "credit")
            .attr("fill", "#B8B8B8")
            .attr("x", (figwidth - 5))
            .attr("y", (d, i) => figheight - 15 + i * 1)
            .attr("font-size", "8.0px")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });

        // console.log("the comparison text in replot is:");
        // console.log(comparisonText);
        // console.log(toptext);
        canvas.selectAll("text.titletext").remove();
        toptext.remove();
        toptext = canvas.selectAll("text.titletext")
            .data(comparisonText)
            .enter()
            .append("text")
            .attr("y", (d, i) => (i + 1) * 17)
            .attr("x", 3, )
            .attr("class", (d, i) => "titletext " + intStr[i])
            // .style("font-family", "Helvetica Neue")
            .style("font-size", (d, i) => topFontSizeArray[i])
            .style("line-height", "1.42857143", )
            .style("color", (d, i) => colorArray[i])
            // if there are 4 items...make the first two bold
            // using this variable numBoldLines
            .style("font-weight", (d, i) => (i < numBoldLines) ? "bold" : "normal")
            .text(function(d, i) {
                return d;
            });

        bottombgrect.attr("y", fullheight - axeslabelmargin.bottom - toptextheight);

        // both of these need their y height reset
        // resetButton(true);
        // if (translate) {
        //     translateButton();
        // }

        var newbars = axes.selectAll("rect.shiftrect").data(sortedMag);
        var newwords = axes.selectAll("text.shifttext").data(sortedMag);
        // console.log(sortedWords);
        // console.log(sortedMag);
        // console.log(compF);

        // if we haven't dont a subselection, apply with a transition
        var transition_duration = 0;
        if (shiftseldecoder().current === "none" || shiftseldecoder().current.length === 0) {
            transition_duration = 1500;
        }
        newbars.attr("class", (d, i) => "shiftrect " + intStr0[sortedType[i]])
            .transition().duration(transition_duration)
            .attr("fill", function(d, i) {
                if (sortedType[i] == 2) {
                    return "#4C4CFF";
                } else if (sortedType[i] == 3) {
                    return "#FFFF4C";
                } else if (sortedType[i] == 0) {
                    return "#B3B3FF";
                } else {
                    return "#FFFFB3";
                }
            })
            // .attr("x", d => (d>0) ? figcenter : x(d))
            // .attr("y", (d,i) => y(i+1))
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", function(d, i) {
                if (d > 0) {
                    return "translate(" + figcenter + "," + y(i + 1) + ")";
                } else {
                    return "translate(" + x(d) + "," + y(i + 1) + ")";
                }
            })
            .attr("height", (d, i) => iBarH)
            .attr("width", d => (d > 0) ? x(d) - x(0) : x(0) - x(d))

        newwords
            .attr("class", (d, i) => "shifttext " + intStr0[sortedType[i]])
            .transition().duration(transition_duration)
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", function(d, i) {
                if (d > 0) {
                    return "translate(" + (x(d) + 2) + "," + (y(i + 1) + iBarH) + ")";
                } else {
                    return "translate(" + (x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                }
            })
            // .attr("class", function(d,i) { return "shifttext "+intStr0[sortedType[i]]; })
            // .attr("transform", null)
            // .attr("y",function(d,i) { return y(i+1)+iBarH; })
            // .attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } )
            .style("text-anchor", (d, i) => (sortedMag[i] < 0) ? "end" : "start")
            .style("font-size", wordfontsize)
            .text((d, i) => sortedWords[i])

        // console.log(shiftseldecoder().current);
        if (shiftseldecoder().current === "posup") {
            axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
        } else if (shiftseldecoder().current === "negdown") {
            // console.log("moving the words to show only negdown");
            axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
        } else if (shiftseldecoder().current === "posdown") {
            axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
        } else if (shiftseldecoder().current === "negup") {
            axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
            });
            axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
            });
            axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
            });
        }

        maxShiftSum = Math.max(Math.abs(sumTypes[1]), Math.abs(sumTypes[2]), sumTypes[0], sumTypes[3]);

        topScale.domain([-maxShiftSum, maxShiftSum]);

        // define the RHS summary bars so I can add if needed
        // var summaryArray = [sumTypes[3],sumTypes[0],sumTypes[3]+sumTypes[1],d3.sum(sumTypes)];
        summaryArray = [sumTypes[3], sumTypes[0], d3.sum(sumTypes)];

        var newRtopbars = axes.selectAll(".sumrectR")
            .data(summaryArray);

        newRtopbars.transition().duration(1500)
            .attr("x", function(d, i) {
                if (d > 0) {
                    return figcenter;
                } else {
                    return topScale(d)
                }
            })
            .attr("width", function(d, i) {
                if (d > 0) {
                    return topScale(d) - figcenter;
                } else {
                    return figcenter - topScale(d);
                }
            });

        var newRtoptext = axes.selectAll(".sumtextR")
            .data([sumTypes[3], sumTypes[0], d3.sum(sumTypes)]);

        newRtoptext.transition().duration(1500).attr("class", "sumtextR")
            .style("text-anchor", function(d, i) {
                if (d > 0) {
                    return "start";
                } else {
                    return "end";
                }
            })
            .attr("x", function(d, i) {
                return topScale(d) + 5 * d / Math.abs(d);
            });

        summaryArray = [sumTypes[1], sumTypes[2], sumTypes[0] + sumTypes[2]];

        var newLtopbars = axes.selectAll(".sumrectL")
            .data(summaryArray);

        newLtopbars.transition().duration(1500).attr("fill", function(d, i) {
                if (i == 0) {
                    return "#FFFFB3";
                } else if (i == 1) {
                    return "#4C4CFF";
                } else {
                    // choose color based on whether increasing/decreasing wins
                    if (d > 0) {
                        return "#B3B3FF";
                    } else {
                        return "#4C4CFF";
                    }
                }
            })
            .attr("x", function(d, i) {
                if (i < 2) {
                    return topScale(d);
                } else {
                    // place the sum of negatives bar
                    // if they are not opposing
                    if ((sumTypes[3] + sumTypes[1]) * (sumTypes[0] + sumTypes[2]) > 0) {
                        // if positive, place at end of other bar
                        if (d > 0) {
                            return topScale((sumTypes[3] + sumTypes[1]));
                        }
                        // if negative, place at left of other bar, minus length (+topScale(d))
                        else {
                            return topScale(d) - (figcenter - topScale((sumTypes[3] + sumTypes[1])));
                        }
                    } else {
                        if (d > 0) {
                            return figcenter
                        } else {
                            return topScale(d)
                        }
                    }
                }
            })
            .attr("width", function(d, i) {
                if (d > 0) {
                    return topScale(d) - figcenter;
                } else {
                    return figcenter - topScale(d);
                }
            });

        var newLtoptext = axes.selectAll(".sumtextL")
            .data([sumTypes[1], sumTypes[2]]);

        newLtoptext.transition().duration(1500).attr("x", function(d, i) {
            return topScale(d) - 5;
        });

        return that;
    }; // hedotools.shifter.replot

    var shift = function(a, b, c, d) {
        // quick function for setting all four vectors and shifting, equivalent to
        //     my_shifter._refF(a);
        //     my_shifter._compF(b);
        //     my_shifter._lens(c);
        //     my_shifter._words(d);
        //     my_shifter.shifter();

        var that = this;
        refF = a;
        compF = b;
        lens = c;
        words = d;
        loadsremaining = 0;
        shifter();
        return that;
    }

    function translateButton() {
        console.log("adding the translate button");
        var translateGroup = canvas.append("g")
            .attr("class", "translatebutton")
            .attr("transform", "translate(" + (4) + "," + (136 + toptextheight) + ") rotate(-90)");

        translateGroup.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", 75)
            .attr("height", 17)
            .attr("fill", "#F0F0F0") //http://www.w3schools.com/html/html_colors.asp
            .style("stroke-width", "0.5")
            .style("stroke", "rgb(0,0,0)")

        translateGroup.append("text")
            .text("Translate All")
            .attr("x", 6)
            .attr("y", 13)
            .attr("font-size", "11.0px")

        translateGroup.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", 75)
            .attr("height", 18)
            .attr("fill", "white") //http://www.w3schools.com/html/html_colors.asp
            .style("opacity", "0.0")
            .on("click", function() {
                // console.log("clicked translate");
                // console.log(flipVector);
                for (var i = 0; i < flipVector.length - 1; i++) {
                    flipVector[i] = flipVector[flipVector.length - 1];
                }
                flipVector[flipVector.length - 1] = (flipVector[flipVector.length - 1] + 1) % 2;
                // console.log(flipVector);

                axes.selectAll("text.shifttext").transition().duration(1000)
                    // goal is to toggle translation
                    // need translation vector
                    .text((d, i) => flipVector[i] ? sortedWordsEn[i] : sortedWords[i])
            }); // on("click")
    }; // translateButton

    var logo = false;
    var drawlogo = function(logo_data, logo_href) {
        var that = this;
        logo = true;
        var logosize = d3.min([toptextheight - 10, 80]);
        logowidth = logosize + 40; // add some extra space
        // not working yet
        canvas.append("image")
            .attr("x", (boxwidth - logosize - 10))
            .attr("y", "0")
            .attr("width", logosize)
            .attr("height", logosize)
            .attr("xlink:href", logo_data)
            .on("click", function() {
                window.open(logo_href, "_blank");
            });
    }

    var resizeshift = function() {
        var that = this;
        console.log("not implemented");
        return that;
    }

    return {
        "shift": shift,
        "ignore": ignore,
        "stop": stop,
        "istopper": istopper,
        "setfigure": setfigure,
        "getfigure": getfigure,
        "setdata": setdata,
        "show_x_axis": show_x_axis,
        "_refF": _refF,
        "_compF": _compF,
        "_lens": _lens,
        "_words": _words,
        "_words_en": _words_en,
        "shifter": shifter,
        "setWidth": setWidth,
        "_compH": _compH,
        "_refH": _refH,
        "_reset": _reset,
        "_stoprange": _stoprange,
        "_complens": _complens,
        "setText": setText,
        "setTextBold": setTextBold,
        "setTopTextSizes": setTopTextSizes,
        "setTextColors": setTextColors,
        "setFontSizes": setFontSizes,
        "_fontString": _fontString,
        "setHeight": setHeight,
        "setBgcolor": setBgcolor,
        "_xlabel_text": _xlabel_text,
        "_ylabel_text": _ylabel_text,
        "resetbuttontoggle": resetbuttontoggle,
        "plotdist": plotdist,
        "plot": plot,
        "credit_text_array": _credit_text_array,
        "_shiftMag": _shiftMag,
        "_shiftType": _shiftType,
        "replot": replot,
        "_viz_type_use_URL": _viz_type_use_URL,
        "_my_shift_id": _my_shift_id,
        "_sortedMag": _sortedMag,
        "_sortedType": _sortedType,
        "_sortedWords": _sortedWords,
        "_sortedWordsRaw": _sortedWordsRaw,
        "get_word_index": get_word_index,
        "translateButton": translateButton,
        // export this on the object here for compatibility
        "splitstring": splitarray,
        "drawlogo": drawlogo,
        // not implemented yet
        "selfShifter": null,
        "dualShifter": null,
        "word_paragraph": null,
        "word_list": null,
        "add_help_button": null,
        "wordshift_tour": null,
        "cloud": null,
        "table": null,
        "resizeshift": resizeshift // just a warning right now
    }
}