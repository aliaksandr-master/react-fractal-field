export default function assertChangeProp (currentProps, prevProps, propName) {
  if (currentProps.share !== prevProps.share) {
    throw new Error(`you must not change "${propName}" prop`);
  }
}
