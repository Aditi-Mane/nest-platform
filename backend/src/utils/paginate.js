export const paginate = (query, queryParams) => {
  const page = Math.max(1, Number(queryParams.page) || 1);
  const limit = Math.max(1, Number(queryParams.limit) || 10);

  const skip = (page - 1) * limit;

  const paginatedQuery = query.skip(skip).limit(limit);

  return {
    query: paginatedQuery,
    page,
    limit,
    skip,
  };
};