export default ({
  id,
  complexValueType = null,
  parentID = null,
  autoClean = false,
  shareMeta = true,
  shareValue = true,
  value = undefined,
  name = null
}) => ({
  // permanent
  id,
  parentID,
  autoClean,
  shareMeta,
  shareValue,
  complexValueType, // if not null component might have named children

  // free transform
  name,

  value,

  meta: {
    valid: true,
    touched: false,

    active: false,
    activated: false,

    submitted: false,
    submitting: false,
    submitFailed: false,
    submitSuccess: false,
    submittedTimes: 0,

    error: null,
    errorsIn: [],
    hasException: false,
    hasFormatException: false,
    hasNormalizeException: false,
    hasValidateException: false
  },

  children: [],
  version: 0,
  metaVersion: 0,
  valueVersion: 0
});
