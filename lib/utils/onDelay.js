import { once } from '../utils/lodash';



export default (func, delay = 0) => {
  const timer = setTimeout(func, delay);

  return once(() => {
    clearTimeout(timer);
  });
};
