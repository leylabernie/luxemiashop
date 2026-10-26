// Explicit owner-approved reversible archives only; never a rolling age rule.
const handles = new Set(require('../data/reversiblyArchivedProductHandles.json'));
function isReversiblyArchivedProduct(handle) {
  return typeof handle === 'string' && handles.has(handle);
}
module.exports = { isReversiblyArchivedProduct };
