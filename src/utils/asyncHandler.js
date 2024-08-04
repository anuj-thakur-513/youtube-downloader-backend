function asyncHandler(asyncFunction) {
  return function (req, res, next) {
    asyncFunction(req, res, next).catch(next);
  };
}

export default asyncHandler;
