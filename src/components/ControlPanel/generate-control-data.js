export default function generateControlData(settings = {}) {
  const controls = []
  const { module } = settings
  const exclude = settings.exclude || []

  if (module) {
    const props = settings.props || module.props

    if (!props) return controls

    Object.keys(props).forEach(key => {
      const propData = props[key]
      propData.$modv_variable = key
      propData.$modv_moduleName = module.meta.name

      if (typeof settings.group !== 'undefined') {
        propData.$modv_group = settings.group
      }

      if (settings.groupName) {
        propData.$modv_groupName = settings.groupName
      }

      const type = propData.type
      const control = propData.control

      if (control) {
        controls.push({
          component: control.type,
          meta: propData
        })
      }

      if (type === 'group' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'groupControl',
          meta: propData
        })
      }

      if (
        (type === 'int' && exclude.indexOf(type) < 0) ||
        (type === 'float' && exclude.indexOf(type) < 0)
      ) {
        controls.push({
          component: 'rangeControl',
          meta: propData
        })
      }

      if (type === 'bool' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'checkboxControl',
          meta: propData
        })
      }

      if (type === 'string' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'textControl',
          meta: propData
        })
      }

      if (type === 'vec2' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'twoDPointControl',
          meta: propData
        })
      }

      if (type === 'enum' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'selectControl',
          meta: propData
        })
      }

      if (type === 'color' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'colorControl',
          meta: propData
        })
      }

      if (type === 'texture' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'imageControl',
          meta: propData
        })
      }

      if (type === 'button' && exclude.indexOf(type) < 0) {
        controls.push({
          component: 'buttonControl',
          meta: propData
        })
      }
    })
  }

  return controls
}
