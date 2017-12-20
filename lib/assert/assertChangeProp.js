export default function assertChangeProp (currentProps, prevProps, propName) {
  if (currentProps[propName] !== prevProps[propName]) {
    throw new Error(`you must not change "${propName}" prop`);
  }
}
