export default function assertAddRemoveProp (currentProps, prevProps, propName) {
  if (currentProps.hasOwnProperty(propName) !== prevProps.hasOwnProperty(propName)) {
    throw new Error(`[FractalField] you must not add/remove "${propName}" prop dynamically`);
  }
}
