import PrimitiveEE from '../utils/PrimitiveEE';
import EE from '../utils/EE';



export const submit$ = EE();
export const change$ = EE();
export const reset$ = EE();
export const initialize$ = EE();
export const error$ = PrimitiveEE();

export const reset = (id) => reset$.postMessage(id);
export const submit = (id) => submit$.postMessage(id);
export const change = (id, name, value) => change$.postMessage(id, name, value);
export const initialize = (id, obj) => initialize$.postMessage(id, obj);
export const onError = (listener) => error$.on(listener);
