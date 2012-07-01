//
// # Image Request
//
// Handles serving of images and resize on demand.
//

//
// ## Dependencies
//
var lib = {
  url: require('url'),
  exec: require('child_process').exec,
  fs: require('fs'),
  path: require('path'),
  util: require('util')
};

//
// ## Request callback
//
// Use as a callback to a request. Requires two parameters to be set.
//
//    var imagerequest = require('imagerequest');
//    app.get('images/:size/:img', imagerequest(options));
//
// **parameters**
//
// * options
//
// **returns**
//
// * function
//
//   Request handler.
//
module.exports = function (options) {
  options = options || {};

  /* Require source directory. */
  if (typeof options.src !== 'string') {
    throw new Error('ImageRequest requires a source directory.');
  }

  /* Default dest dir to source dir. */
  if (typeof options.dest !== 'string') {
    options.dest = options.src;
  }

  /* Set path to identify. */
  if (typeof options.identify !== 'string') {
    options.identify = 'identify';
  }

  /* Set path to identify. */
  if (typeof options.imagemagick !== 'string') {
    options.identify = 'identify';
  }

  /* Set path to convert. */
  if (typeof options.convert !== 'string') {
    options.convert = 'convert';
  }

  /* Default sizes. */
  if (typeof options.sizes === 'undefined') {
    options.sizes = {
      square: {
        width: 128,
        height: 128,
        maintainratio: false,
        allowupscale: false
      },
      small: {
        width: 180,
        height: 120,
        maintainratio: true,
        allowupscale: false
      },
      medium: {
        width: 640,
        height: 480,
        maintainratio: true,
        allowupscale: false
      },
      large: {
        width: 1024,
        height: 768,
        maintainratio: true,
        allowupscale: false
      }
    };
  }

  /* The actual request handler. */
  return function (req, res, next) {
    if (req.method !== 'GET' && req.method !== 'HEAD') { return next(); }

    var size = req.params.size;
    var img  = req.params.img;
    var org  = lib.path.join(options.src, img);
    var path = (size === 'original') ?
      lib.path.join(options.src, img) :
      lib.path.join(options.src, size, img);

    /* Send 404 message. */
    function err404(msg) {
      var err = new Error(msg);
      err.status = 404;
      next(err);
    }

    /* Check size */
    if (typeof options.sizes[size] === 'undefined' && size !== 'original') {
      return err404('Invalid image size.');
    }

    /* Check for existing size */
    if (lib.fs.existsSync(path)) {
      deliverImage(path, res);
      return;
    }
    else {
      options.size = options.sizes[size];
      options.size.name = size;
      options.path = path;
      options.img = img;
      options.org = org;
      resizeImage(options, function (err, path) {
        deliverImage(path, res);
        return;
      });
    }
  };
};

//
// ## Resize image
//
// Creates a resized derivative of the original image.
//
// **parameters**
//
// * options
//
//   Just passing along the options from the request handler.
//
// * callback
//
//   Called with any error and the new image's path.
//
//
//   @todo: implement upscale check.
//
function resizeImage(options, callback) {
  var size = options.size.width + 'x' + options.size.height;
  if (!options.size.maintainratio) {
    size += '\\!';
  }
  var command = [
    options.convert,
    options.org,
    '-adaptive-resize',
    options.size.width + 'x' + options.size.height,
    options.path
    ].join(' ');

  /* Create folder if we have to. */
  var dest = lib.path.join(options.dest, options.size.name);
  if (!lib.fs.existsSync(dest)) {
    lib.fs.mkdirSync(dest);
  }

  /* Create resize */
  lib.exec(command, function (err, stdout, stderr) {
    callback(err, options.path);
  });
}

//
// ## Deliver image
//
// Loads the given image and delivers it to the request.
//
// **parameters**
//
// * path
//
//   Path to the image.
//
// * res
//
//   The response object.
//
// **returns**
//
// * void
//
function deliverImage(path, res) {
  var stream = lib.fs.createReadStream(path);
  /* @todo: set headers 'n stuff */
  lib.util.pump(stream, res, function (err) {
    if (err) {
      /* @todo: handle errors. */
      console.log('errors', err);
    }
  });
}

