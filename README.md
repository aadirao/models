# Heat Tracing — Complete Project

A minimal, full-screen 3D experience for touchscreens, tablets and trade-show displays. Tap the actual model to smoothly focus on a component; drag to orbit and pinch or scroll to zoom.

## Interactive display

Local kiosk address: `http://127.0.0.1:4173/?kiosk=1` after starting the server.

Kiosk mode starts a repeating 90-second tour through close-ups, assembly and heating. Touch takes control; after 75 seconds without interaction the kiosk returns to the tour. Fullscreen requires one tap on the fullscreen button. A supported screen wake lock is requested only while fullscreen. Hidden tabs pause. Devices requesting reduced motion start with manual controls.

## Run locally, including without internet

**Easiest:** double-click `Heat Tracing Simulator.html`. It opens in your browser with no server, no Node.js and no command window. The whole application and model are packed into that one file (about 19 MB), so it can also be copied to another computer on its own. Add `?kiosk=1` to the end of the address in the browser for the automatic loop.

**With Node.js:** double-click `START_SIMULATOR.cmd` on Windows; it starts the local server and opens the browser automatically (if Node.js is missing it opens the standalone file instead). On macOS/Linux run `node server.mjs 4173 --open`. Keep the server window open during use.

No package installation, account, runtime CDN, font service or external image service is needed. The local default address is `http://127.0.0.1:4173`; if occupied, the server tries the next port and prints the actual address. Do not double-click `dist/index.html` itself: browsers restrict local module and model loading, which is why the standalone file exists. The local server is confined to this computer. For access from tablets, publish the contents of `dist/` to a static HTTPS host. See `HOSTING.md`.

After changing anything in `dist/`, run `node build-standalone.mjs` to regenerate `Heat Tracing Simulator.html`.

## Controls

- **Explore:** tap a component to zoom in and read a short explanation; the tapped component flashes and keeps a soft warm glow while it is selected. Inside opens/closes the viewing cutaway. Parts lets you focus, hide or isolate components, and inspect a cross-section. Reset returns to the assembly. System view reveals the wider reference-inspired route.
- **Assemble:** play, pause, scrub or move between five installation stages. Tubing seats first, enhancer sections and the split valve jacket approach independently, bands wrap around the outside, and insulation and weather covers close radially. Play runs the full sequence in about 17 seconds with a cinematic camera that moves to each step as it is installed; dragging the view hands the camera back to you while the animation continues.
- **Heat:** tap Start heat. The simple sequence is **Tracer → Pipe → Air**. The single reading is the average temperature of the straight pipe wall. Stop heat lets it cool. Insulation can be toggled without resetting stored warmth.
- **Surroundings:** Plant, Winter and Coast presets, plus air-temperature and wind sliders. These alter the thermal boundary conditions, fog, light, ambient steam drift and moving-air cues. Changing weather preserves the pipe's existing temperature field.

Heat plays at 60× speed, or 120× during the automatic tour. Warm-air wisps and moving energy points are explanatory animation, not literal smoke, a leak or CFD. Background steam comes from an independent plant vent.

## Reference-led model

The valve and wider route follow the two supplied 12000 × 6750 EXR engineering renders and three JPEG references. The original reference files are included under `references/`. The main assembly includes a hollow process pipe, detailed flanges and fasteners, long-stem handwheel valve, bonnet and gland, split dark heating jacket with open connection ports and drilled mounting lugs, connected tracer jumpers, a hollow elbow with curved omega enhancer shoes, three straight enhancer sections, band buckles, insulation fibers and separate metal covers. Procedural surface detail and an outdoor process-plant setting are included in the web scene: jointed concrete paving, steel pipe supports, a two-tier pipe rack with insulated lines, storage tanks with ladders and cages, buildings, distant process units in atmospheric haze, a steam vent, and sun and sky lighting whose reflections match the surroundings.

**This is illustrative geometry, not manufacturer CAD.** Images establish appearance and proportions, not exact dimensions. Public-reference nominal dimensions used are 12.7 mm tracer OD, 50.8 mm straight enhancer width and 19.05 mm band width. The pipe OD/wall/length (168.3 / 7.1 / 1640 mm), exact proprietary profile, casting shape, jacket thickness, clearances, fittings, bend radius and full-system route dimensions are selected or estimated. The overview route has reduced detail. This is an independent presentation, not an official AMETEK CSI installation or product-sizing tool.

Public references:

- AMETEK CSI overview: https://www.csiheat.com/products/industrial-tracing-heating-solutions/traceboost
- Installation guide: https://www.csiheat.com/-/media/ametekcsiheat/documents/whatwedo/tracing-heating-systems/cs-ins-tblf-23r3.pdf
- Enhancer close-up: https://www.csiheat.com/-/media/ametekcsiheat/images/whatwedo/tubetracingcomparison/traceboost-callouts.png
- Representative insulation: https://www.rockwool.com/asia/products/prorox-wm-951-sa/
- NIST representative steel properties: https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=101567
- Cylinder crossflow correlations: https://www.sandia.gov/files/sierra/Aria_Users_5_20/simulation_setup/advanced_feat/correlation_heat_transfer_coeff_reference.html

## Thermal model and limits

`dist/thermal.js` conservatively solves the **empty straight steel pipe wall only**, using an 18 axial × 64 circumferential finite-volume grid, 0.2-second numerical substeps and geometry-derived mass (46.29 kg). Energy enters through the actual integrated 1.26 m enhancer footprint. Steam-film, stainless wall, aluminum, compound and contact resistances are in series. The source is held at 160°C when on; input is zero when off. Insulation provides cylindrical resistance. Outside convection follows the Churchill–Bernstein crossflow correlation with fixed representative air properties, cubically combined with an assumed natural-convection film of 8 W/(m²·K). A representative emissivity of 0.65 supplies approximate surface radiation. Insulated surface temperature is approximated from the resistance network.

Properties are representative and contact/source coefficients are uncalibrated. Valve, elbow, flowing contents, steam condensation details and background pipework have no solved temperature field. No pressure, stress or CFD result is claimed. The viewing cutaway does not remove insulation from the heat calculation. Installation follows authored constrained paths; it is not a general rigid-body or flexible-sheet contact solver.

## Blender and reusable geometry

- `dist/assets/trace_assembly.blend`: editable **static** inspection scene, materials and three cameras. The website contains the installation and heat simulations; this `.blend` has no native thermal or fluid solver.
- `dist/assets/thermal_assembly.glb`: assembled model with product and piece identifiers, used directly by the website.
- `dist/assets/build_simulator_model.py`: self-contained generator. Tested with Blender 5.2.2 LTS. Creates a new scene and needs no CAD, image texture, add-on or external library.

Rebuild:

```text
blender --background --factory-startup --python dist/assets/build_simulator_model.py -- --output-dir result --export-glb
```

Add `--render --resolution 1600 --samples 64` for native studio previews. The full system is available in the Blender collection `13 System`; it is hidden from native studio renders so those cameras focus on the main assembly.

## Verification

Run `node verify-v4.mjs` for the thermal, motion-envelope, asset and tour checks. The included reports record 24 passing checks, plus Blender geometry inspection. The baseline 20-minute heated-pipe average is 72.89°C at 20°C ambient with insulation; doubling grid density changes the average by 0.25°C. Energy closure is within numerical roundoff. Bare-pipe response after 30 minutes changes from 70.54°C in calm air to 53.80°C at 8 m/s. Tested environment extremes cover −5°C to 40°C and 0 to 8 m/s. These are model-consistency checks, not experimental validation.

Geometry checks sample band and enhancer approaches, radial insulation paths, tracer/flange clearance, and triangle intersections between the two jacket body halves and valve surfaces at multiple approach offsets. Clearance reports document their scope. Browser QA covers mobile portrait, phone landscape, tablet landscape, desktop and kiosk layouts, component selection/focus, heat start/stop, weather changes, cross-section and the tour. Physical kiosk/tablet hardware performance still depends on its browser and graphics support. A WebGL2-capable browser is required.

Third-party 3D runtime: Three.js, locally bundled under the MIT license in `dist/vendor/LICENSE`. Reference renders are stored separately from the runtime assets; the application does not transmit them.

## Included files

`dist/` contains the complete application, local 3D runtime, model and Blender generator. The root contains the local server, launcher, checks and reports. `references/` contains the supplied source renders. `Blender-preview.png` is the studio preview. No account, hosted service connection or publishing credential is included.
