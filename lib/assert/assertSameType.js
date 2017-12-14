const typeOf = (val) => Object.prototype.toString.call(val);



export default function assertSameType (name, value1, value2) {
  if (typeOf(value1) !== typeOf(value2)) {
    throw new TypeError(`"${name}" has not same type`);
  }
}
