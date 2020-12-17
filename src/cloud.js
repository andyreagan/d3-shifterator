export function cloudSpriteSimple(my_canvas_context, d, size) {
    if (d.sprite) return;

    my_canvas_context.setTransform(1, 0, 0, 1, 0, 0);
    my_canvas_context.clearRect(0, 0, size[0], size[1]);
    my_canvas_context.save()

    // set the initial values
    var x = 0;
    var y = 0;
    var maxh = 0;

    my_canvas_context.font = d.fontString;
    my_canvas_context.textAlign = "center";
    my_canvas_context.textBaseline = "bottom";
    my_canvas_context.fillStyle = "red";
    my_canvas_context.strokeStyle = "red";
    my_canvas_context.textAlign = "center";
    my_canvas_context.lineWidth = 2 * d.padding;

    var w = my_canvas_context.measureText(d.text + "m").width,
        h = d.size;

    d.x0 = Math.floor(-w / 2);
    d.x1 = Math.ceil(w / 2);
    d.y0 = 0;
    d.y1 = Math.ceil(h);

    // translate such that the rotation actually works
    my_canvas_context.translate(size[0] / 2, size[1] / 2);

    my_canvas_context.rotate(d.rotate * cloudRadians);
    // put it in the center (with the translation)
    my_canvas_context.fillText(d.text, 0, 0);

    // test that we contain the text here
    // my_canvas_context.strokeRect(d.x0, d.y0-d.y1, w, h);

    my_canvas_context.strokeText(d.text, 0, 0);
    // var pixels = my_canvas_context.getImageData(0, 0, size[0], size[1]).data;
    // my_canvas_context.setTransform(1, 0, 0, 1, 0, 0);
    var pixels = my_canvas_context.getImageData(size[0] / 2 + d.x0, size[1] / 2 + d.y0 - d.y1, 2 * d.x1, d.y1).data;
    // now let's convert this raw RGBA 0-255 data into a monochrome
    d.sprite = monochrome(pixels);
    my_canvas_context.restore();
}

export function monochrome(pixels) {
    var a = Array(pixels.length / 4);
    for (var i = 0; i < a.length; i++) {
        // standard luminance scale
        // var L = (0.2126 * pixels[i*4] + 0.7152 * pixels[i*4+1] + 0.0722 * pixels[i*4+2]);
        // I set the canvas to only show red
        var L = pixels[i * 4]
        // don't multiply by the alpha, just make sure the luminance
        // is more than .1 percent
        if (L > (.1 * 256)) {
            a[i] = 1;
        } else {
            a[i] = 0;
        }
        // a[i] = (L/256 > 0.1) ? 1 : 0;
    }
    return a;
}

export function collideRects(a, b) {
    // a and b are both objects with x0,y0 and x1,y1 upper left and lower right points
    // not right && not left && not above && not below
    return b.x0 < a.x1 && b.x1 > a.x0 && b.y1 > a.y0 && b.y0 > a.y1;
    // note that this may need to more complicated if the object is rotated:
    // depends on the rotation
}

export const cloudRadians = Math.PI / 180;

export function indexer2d(a, w, i, ip, j, jp) {
    // get a[i:ip,j:jp], where a has width w
    // get the points ip and jp
    // i goes down, j goes across

    // initialize result
    var result = Array((ip - i + 1) * (jp - j + 1));

    // go down
    for (var ii = i; ii <= ip; ii++) {
        for (var jj = j; jj <= jp; jj++) {
            // var flat_index = w*ii+jj;
            // console.log(flat_index);
            // console.log(ii*(ip-i+1)+(jj-j))
            result[(ii - i) * (jp - j + 1) + (jj - j)] = a[w * ii + jj]
        }
    }
    return result;
}