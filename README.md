# d3-shifterator

Build interactive wordshift graphs on the web using D3.

## Installation

You load it via a script tag two different ways: (1) include `d3` first

    <script src="https://d3js.org/d3.v4.js"></script>
    <script src="shifterator.js"></script>

or (2) use the bundle which include the necessary `d3` dependencies:

    <script src="shifterator-bundle.js"></script>

If you're developing with ES6, you can also include the main function directly:

    import { shifterator } as shifterator from 'node_modules/d3-shifterator/index.js';

where I'm referencing it from the `node_modules` directory, assuming you got to code from `npm install d3-shifterator`.

## Usage

    shifterator.shifterator()
        .setfigure("#mydiv")
        ._refF(refF)
        ._compF(compF)
        ._lens(lens)
        ._words(words)
        // this has to be set before the shift operation
        .plotdist(true)
        .shifter()
        .setText(["Example shift", "Dist on", ""])
        .plot()

where the words, word scores, and reference/comparison frequencies are arrays:

    var lens = [8.50, 8.44, 8.42, 8.30, 8.26, 8.22, 8.20, 8.18, 8.18, 8.16];
    var words = ["laughter", "happiness", "love", "happy", "laughed", "laugh", "laughing", "excellent", "laughs", "joy"];
    var refF = [29, 174, 6331, 2196, 48, 277, 471, 47, 27, 58, 85];
    var compF = [15, 142, 5788, 1913, 56, 305, 362, 35, 31, 54];

An example trying some of the options is at test/include-expecting-global-d3.html.