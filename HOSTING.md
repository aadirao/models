# Hosting and local display

The application is a standalone static site. All runtime assets and libraries are included; it does not require a service account, analytics connection or proprietary hosting integration.

## Local kiosk

The simplest option is to double-click `Heat Tracing Simulator.html`, a single self-contained file that runs without a server or Node.js. Alternatively, with Node.js installed, double-click `START_SIMULATOR.cmd` on Windows (it opens the browser automatically) or run `node server.mjs 4173 --open` in a terminal. Add `?kiosk=1` for the automatic demonstration. Press the fullscreen button once to enter fullscreen. Keep the server window open during use.

The default port is 4173. If another program uses it, the server tries the next port and prints the actual address. `node server.mjs 4300` selects another starting port. The server binds only to the local computer.

## Tablets and hosted displays

Publish the **contents of `dist/`** to a static HTTPS web server. Keep every subfolder together. Configure `.js` as JavaScript, `.css` as CSS and `.glb` as `model/gltf-binary`. Relative asset paths support deployment under a subdirectory. Open that host address on the tablet; add `?kiosk=1` for the demonstration loop.

`references/`, Blender source files and the verification scripts are development resources. They are not needed to serve the interactive display. The application includes optional model download links; remove those links and their associated files from a public deployment if model downloads are unwanted.

## Requirements

A current WebGL2-capable browser is required. All runtime resources are local to the project. Fullscreen and the screen wake lock depend on browser support and require an initial user gesture. A static HTTPS host provides the most consistent tablet experience. Test the intended display hardware before an event.
