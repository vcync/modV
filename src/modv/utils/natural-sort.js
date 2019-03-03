/**
 * Collator used for a natural sort
 */

export default new Intl.Collator('en', {
  numeric: false, // eh?
  sensitivity: 'base'
})
