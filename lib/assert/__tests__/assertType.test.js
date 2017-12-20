/*eslint-env jest*/
import assertType from '../assertType';



describe('assertType', () => {
  it('object', () => {
    expect(() => {
      assertType('some', 'object', {});
    }).not.toThrow();

    expect(() => {
      assertType('some', 'object', []);
    }).toThrow();

    expect(() => {
      assertType('some', 'object', null);
    }).toThrow();

    expect(() => {
      assertType('some', 'object', undefined);
    }).toThrow();
  });

  it('number', () => {
    expect(() => {
      assertType('some', 'number', 1);
    }).not.toThrow();

    expect(() => {
      assertType('some', 'number', []);
    }).toThrow();

    expect(() => {
      assertType('some', 'number', null);
    }).toThrow();

    expect(() => {
      assertType('some', 'number', undefined);
    }).toThrow();
  });

  it('string', () => {
    expect(() => {
      assertType('some', 'string', '1');
    }).not.toThrow();

    expect(() => {
      assertType('some', 'string', []);
    }).toThrow();

    expect(() => {
      assertType('some', 'string', null);
    }).toThrow();

    expect(() => {
      assertType('some', 'string', undefined);
    }).toThrow();
  });

  it('array', () => {
    expect(() => {
      assertType('some', 'array', []);
    }).not.toThrow();

    expect(() => {
      assertType('some', 'array', {});
    }).toThrow();

    expect(() => {
      assertType('some', 'array', null);
    }).toThrow();

    expect(() => {
      assertType('some', 'array', undefined);
    }).toThrow();
  });

  it('boolean', () => {
    expect(() => {
      assertType('some', 'boolean', false);
    }).not.toThrow();

    expect(() => {
      assertType('some', 'boolean', {});
    }).toThrow();

    expect(() => {
      assertType('some', 'boolean', null);
    }).toThrow();

    expect(() => {
      assertType('some', 'boolean', undefined);
    }).toThrow();
  });

  it('must throw if type is invalid', () => {
    expect(() => {
      assertType('some', 'some', undefined);
    }).toThrow();
  });
});
