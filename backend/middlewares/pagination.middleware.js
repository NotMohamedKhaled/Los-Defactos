function paginationMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * @param {number} defaultLimit
 * @param {number} maxLimit
 * @param {{ optional?: boolean }} options - optional: only paginate when page/limit query params are present
 */
module.exports = function paginationMiddleware(defaultLimit = 10, maxLimit = 50, options = {}) {
  const optional = options.optional === true;

  return (req, res, next) => {
    const hasPageParam = req.query.page !== undefined;
    const hasLimitParam = req.query.limit !== undefined;

    if (optional && !hasPageParam && !hasLimitParam) {
      req.pagination = null;
      return next();
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    let limit = Math.max(parseInt(req.query.limit || String(defaultLimit), 10), 1);
    if (limit > maxLimit) limit = maxLimit;
    const skip = (page - 1) * limit;
    req.pagination = { page, limit, skip };
    next();
  };
};

module.exports.paginationMeta = paginationMeta;
