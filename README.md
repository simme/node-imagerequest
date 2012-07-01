ImageRequest
------------

Image request handler for Node.js with on demand resizing using ImageMagick.

# Explanation

ImageRequest is a small module that you hook up to your Node.js HTTP server
to handle image requests. ImageRequest will then handle image delivery and
on demand resizing for you.

# Usage

To use ImageRequest with for example Express do something like this:

    var ir = require('imagerequest');
    app.get('photos/:size/:img', ir({
      src: __dirname + '/photos',
    }));

Then when someone requests for example *photos/small/picture.jpg* a resized
version of the original *picture.jpg* will be delivered. The resized version
is stored on disk an reused for subsequent requests.

# Installation

Install with `npm install imagerequest`

You will also need to have ImageMagick installed on your system.

# Note

This project is very new, and _very_ rough around the edges. It's probably not
very well coded at this moment. And a lot of functionality is only half assed
or not at all implemented even though the source suggestes otherwise.

Please try it out if you want to. As always, pull requests much appreciated.

## Currently unimplemented

* Real error reporting and error handling
* Blocking of upscaling
* Documentation
* Other stuff

# License

See LICENSE

