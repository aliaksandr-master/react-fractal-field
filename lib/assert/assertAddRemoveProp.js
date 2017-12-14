export default function assertAddRemoveProp (currentProps, prevProps, propName) {
  if (currentProps.hasOwnProperty(propName) !== prevProps.hasOwnProperty(propName)) {
    throw new Error(`you must not add/remove "${propName}" prop dynamically`);
  }
}
