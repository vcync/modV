const tapTempo = require('tap-tempo')();
const modV = require('./modV');


require('./modV-ContainerGenerator.js')(modV);
require('./modV-createModule.js')(modV);
require('./modV-deleteActiveModule.js')(modV);
require('./modV-detectClonesOf.js')(modV);
require('./modV-detectInstancesOf.js')(modV);
require('./modV-draw.js')(modV);
require('./modV-factoryReset.js')(modV);
require('./modV-genBlendModeOps.js')(modV);
require('./modV-generateName.js')(modV);
require('./modV-generatePreset.js')(modV);
require('./modV-isControl.js')(modV);
require('./modV-loadPreset.js')(modV);
require('./modV-loop.js')(modV);
require('./MediaSelector.js')(modV);
require('./modV-messageHandler.js')(modV);
require('./modV-moveLayerToIndex.js')(modV);
require('./modV-mux.js')(modV);
require('./profile-selector.js')(modV);
require('./modV-removeLayer.js')(modV);
require('./modV-robot.js')(modV);
require('./modV-savePreset.js')(modV);
require('./modV-setModOrder.js')(modV);
require('./set-name.js')(modV);
require('./set-canvas.js')(modV);
require('./add-meyda-feature.js')(modV);
require('./start.js')(modV);
require('./main-window-resize')(modV);
require('./calculate-preview-canvas-values')(modV);
require('./rescan-media-stream-sources')(modV);
require('./set-media-source')(modV);

require('./LayerSelector.js')(modV);
require('./update-layer-selectors.js')(modV);

require('./modV-ui-createActiveListItem.js')(modV);
require('./modV-ui-createControls.js')(modV);
require('./modV-ui-createGalleryItem.js')(modV);
require('./modV-ui-enumerateSourceSelects.js')(modV);
require('./modV-ui-showContextMenu.js')(modV);
require('./modV-ui.js')(modV);
require('./modV-ui.MenuItem.js')(modV);
require('./modV-ui.TabController.js')(modV);

require('./modV-updateBPM.js')(modV);
require('./modV-updateLayerControls.js')(modV);
require('./modV-webSockets.js')(modV);
require('./modV-windowControl.js')(modV);

require('./modV.Group.js')(modV);
require('./modV.LFOController.js')(modV);

require('./control-types')(modV);
require('./module-types')(modV);

require('./modV.register.js')(modV);

require('./modV.colourHelpers.js');
require('./util.awesomeText.js');
require('./util.stackTraceError');

window.THREE = require('three'); //TODO: provide THREE as an argument to Module3D functions?
window.tapTempo = tapTempo;
window.modV = modV;