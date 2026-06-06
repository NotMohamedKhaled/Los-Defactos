module.exports = function filterMiddleware(allowedFields = []) {
    return (req, res, next) => {
        const query = {};
        const operatorsMap = { gt: '$gt', gte: '$gte', lt: '$lt', lte: '$lte', in: '$in' };

        for (const key of Object.keys(req.query)) {
            if (!allowedFields.includes(key)) continue;

            // A field may appear multiple times (e.g. price=gte:100&price=lte:500)
            // Express parses that as an array
            const rawValues = req.query[key];
            const values = Array.isArray(rawValues) ? rawValues : [rawValues];

            for (const value of values) {
                if (typeof value !== 'string') continue;

                // Support in operator: category=in:a,b,c
                if (value.startsWith('in:')) {
                    query[key] = { $in: value.slice(3).split(',') };
                    continue;
                }

                // Support comparison operators: price=gte:100
                if (value.includes(':')) {
                    const [op, raw] = value.split(':');
                    const mongoOp = operatorsMap[op];
                    if (mongoOp) {
                        const numeric = Number(raw);
                        // Merge into existing object (allows gte + lte on same field)
                        query[key] = Object.assign(query[key] || {}, {
                            [mongoOp]: isNaN(numeric) ? raw : numeric
                        });
                        continue;
                    }
                }

                // Fallback: equality, coerce to number when possible
                const asNumber = Number(value);
                query[key] = isNaN(asNumber) ? value : asNumber;
            }
        }

        req.filters = query;
        next();
    }
}
