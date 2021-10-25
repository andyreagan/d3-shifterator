// begin with some helper functions
// http://stackoverflow.com/a/1026087/3780153
export function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
export function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
	val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
}

export function splitWidth(s,w) {
    // s is the string
    // w is the width that we want to split it to
    var t = s.split(" ");
    var n = [t[0]];
    var i = 1;
    var j = 0;
    while (i<t.length) {
	if ((n[j]+t[i]).width() < w) {
	    n[j] += " "+t[i]
	}
	else {
	    j++;
	    n.push(t[i]);
	}
	i++;
    }
    return n;
}

export const intStr0 = ["zero","one","two","three","four","five","six","seven","eight","nine","then"];
export const intStr = intStr0.slice(1,100);

// Array.prototype.findIndexClosest = function(x) {
//     var result = 0;
//     var distance = Math.abs(x-this[0]);
//     for (var i=1; i<this.length; i++) {
//         if (distance > Math.abs(x-this[i])) {
//             result = i;
//             distance = Math.abs(x-this[i]);
//         }
//     }
//     return result;
// }

// this works really well, but it's deadly slow (working max 5 elements)
// and it's coupled to jquery
// http://stackoverflow.com/a/5047712/3780153
// string.prototype.width = function(font) {
//     var f = font || '12px arial',
//     o = $('<div>' + this + '</div>')
// 	.css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
// 	.appendto($('body')),
//     w = o.width();
//     o.remove();
//     return w;
// }
// dummy while I search for a replacement that doesn't need jquery
// export var stringwidth = function(string, font) {
//     return 4 * string.length;
// }
// here it is, from the same stack overflow question as the first one
export var stringwidth = function(pText, pFont) {
    const lDiv = document.createElement('div');

    document.body.appendChild(lDiv);

    lDiv.style.font = pFont;
    lDiv.style.position = "absolute";
    lDiv.style.left = -1000;
    lDiv.style.top = -1000;

    lDiv.textContent = pText;

    const lResult = {
        width: lDiv.clientWidth,
        height: lDiv.clientHeight
    };

    document.body.removeChild(lDiv);

    return lResult.width;
}

// string.prototype.safe = function() {
//     var tmp = this.split("/")
//     tmp[tmp.length-1] = escape(tmp[tmp.length-1])
//     return tmp.join("/");
// }

var splitstring = function(string_to_split, max_width, font) {
    if (stringwidth(string_to_split, font) < max_width) {
        return string_to_split;
    } else {
        var newar;
        var string_to_split_words = string_to_split.split(" ");
        // chop words off until it's long enough
        // this is better if we know that they're
        // not going to be way too long
        // right now a max of two lines

        // a more general approach would be to march forward...
        // but this could be a lot of .width() calculations
        // really need to keep those at a min
        var numi = 0;
        while (numi < 10) {
            if (stringwidth(string_to_split_words.slice(0, string_to_split_words.length - numi).join(" "), font) < max_width) {
                return [
                    string_to_split_words.slice(
                        0,
                        string_to_split_words.length - numi
                    ).join(" "),
                    string_to_split_words.slice(
                        string_to_split_words.length - numi,
                        string_to_split_words.length
                    ).join(" ")
                ];
            }
            numi++;
        }
        console.log("WARNING: hit max iterations splitting a string to be under max_width");
        console.log("string is: " + string_to_split);
        console.log("max_width is: " + max_width);
        return [string_to_split_words.slice(0, string_to_split_words.length - numi).join(" "), string_to_split_words.slice(string_to_split_words.length - numi, string_to_split_words.length).join(" ")];
    }
}

export var splitarray = function(array_to_split, max_width, font_spec) {
    return array_to_split.map(d => splitstring(d, max_width, font_spec))
}