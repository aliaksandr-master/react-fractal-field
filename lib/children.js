

export default () => {
  let idByName = {};
  let objByID = {};
  let count = 0;

  const register = (fieldID, name) => {
    if (!idByName.hasOwnProperty(name)) {
      idByName[name] = [ fieldID ];
    } else {
      idByName[name] = [ ...idByName[name], fieldID ];
    }

    count++;
  };

  const unregister = (fieldID, name) => {
    if (!idByName.hasOwnProperty(name)) {
      return;
    }

    idByName[name] = idByName[name].filter((id) => fieldID !== id);

    if (!idByName[name].length) {
      delete idByName[name]; // eslint-disable-line fp/no-delete
    }

    count--;
  };

  return {
    hasChildren: false,

    nameWasMounted (name) {
      return idByName.hasOwnProperty(name);
    },

    destroy () {
      Object.keys(objByID).forEach((fieldID) => {
        this.unmount(fieldID);
      });

      objByID = {};
      idByName = {};
    },

    getNameById (fieldID) {
      if (!objByID.hasOwnProperty(fieldID)) {
        return null;
      }

      return objByID[fieldID].name;
    },

    rename (fieldID, newName) {
      const name = this.getNameById(fieldID);

      if (name === null) {
        return;
      }

      unregister(fieldID, name);
      register(fieldID, newName);

      objByID[fieldID] = { ...objByID[fieldID], name: newName };
    },

    mount (fieldID, name, ee) {
      if (process.env.NODE_ENV !== 'production') {
        if (objByID.hasOwnProperty(fieldID)) {
          throw new ReferenceError(`field "${fieldID}" has already mounted to ${name}`);
        }
      }

      register(fieldID, name);

      objByID[fieldID] = { fieldID, name, ee };

      this.hasChildren = Boolean(count);
    },

    unmount (fieldID) {
      if (!objByID.hasOwnProperty(fieldID)) {
        return;
      }

      const { name, ee } = objByID[fieldID];

      ee.destroy();

      delete objByID[fieldID]; // eslint-disable-line fp/no-delete

      unregister(fieldID, name);

      this.hasChildren = Boolean(count);
    },

    getChildren () {
      return Object.values(objByID);
    },

    getChildrenByName (name) {
      if (!name || !idByName.hasOwnProperty(name)) {
        return [];
      }

      return idByName[name].map((fieldID) => objByID[fieldID]);
    }
  };
};
