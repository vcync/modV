#modV-dev

This is the dev branch for modV. Please note that by using this branch to use modV, you have no guarantee of anything working.  
If you are looking to use modV, please switch to the main branch.

## Current Aims

The current aim of the branch is to re-work how Modules are handled within modV.

Currently, if you want to add more than one instance of a Module to the active list, the Module's function is cloned.
This is bad for memory efficiency and general performance, especially when it comes to the experimental Module3D where all of THREE.js seems to be cloned (yes, I know...).

What I would like to achieve is a store of a Module's local variables and they are assigned (such as uniforms per program in WebGL) per Module call. Modules can then be effectively duplicated in the global active list and local 'state' variables assigned to the Module, therefore no functions will have to be cloned nor will any extra memory (apart from the stored variables) will be used.