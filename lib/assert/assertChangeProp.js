export default function assertChangeProp (currentProps, prevProps, propName) {
  if (currentProps[propName] !== prevProps[propName]) {
    throw new Error(`[FractalField] you must not change "${propName}" prop`);
  }
}
