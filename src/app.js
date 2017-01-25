const modV = require('./modV');

require('./modV-addLayer.js')(modV);
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
require('./modV-mediaSelector.js')(modV);
require('./modV-messageHandler.js')(modV);
require('./modV-moveLayerToIndex.js')(modV);
require('./modV-mux.js')(modV);
require('./modV-removeLayer.js')(modV);
require('./modV-robot.js')(modV);
require('./modV-savePreset.js')(modV);
require('./modV-setModOrder.js')(modV);
require('./modV-shaderSetup.js')(modV);

require('./modV-ui-createActiveListItem.js')(modV);
require('./modV-ui-createControls.js')(modV);
require('./modV-ui-createGalleryItem.js')(modV);
require('./modV-ui-enumerateSourceSelects.js')(modV);
require('./modV-ui.js')(modV);
require('./modV-ui.MenuItem.js')(modV);
require('./modV-ui.TabController.js')(modV);

require('./modV-updateBPM.js')(modV);
require('./modV-updateLayerControls.js')(modV);
require('./modV-webSockets.js')(modV);
require('./modV-windowControl.js')(modV);
require('./modV.ButtonControl.js')(modV);
require('./modV.CheckboxControl.js')(modV);
require('./modV.ColorControl.js')(modV);
require('./modV.CompositeOperationControl.js')(modV);
require('./modV.CustomControl.js')(modV);
require('./modV.Group.js')(modV);
require('./modV.ImageControl.js')(modV);
require('./modV.Layer.js')(modV);
require('./modV.LFOController.js')(modV);
require('./modV.MIDI.js')(modV);
require('./modV.Module2D.js')(modV);
require('./modV.Module3D.js')(modV);
require('./modV.ModuleScript.js')(modV);
require('./modV.ModuleShader.js')(modV);
require('./modV.PaletteControl.js')(modV);
require('./modV.RangeControl.js')(modV);
require('./modV.register.js')(modV);
require('./modV.SelectControl.js')(modV);
require('./modV.TextControl.js')(modV);
require('./modV.VideoControl.js')(modV);

require('./modV.colourHelpers.js');
require('./util.awesomeText.js');
require('./util.stackTraceError');


var tapTempo = require('tap-tempo')();
window.tapTempo = tapTempo;
window.modV = modV;