import { Paginate } from '@/common/interfaces/pagination.interface';
export const getPagination = (req, res): Paginate => {
  const { size, page } = req.query;
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};
/**
 * @param  {} data
 * @param  {} page
 * @param  {} limit
 */
export const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, rows, totalPages, currentPage };
};
