import { camelToSnake } from "../utils/helpers";

export const queryParser = (data: Record<string, any>) => {
  const columns = Object.keys(data).join(", ");
  const placeholders = Object.keys(data)
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  return { columns, placeholders, values: Object.values(data) };
};

export const updateParser = (data: Record<string, any>) => {
  const setClause = Object.keys(data)
    .map((key, index) => `${camelToSnake(key)}=$${index + 1}`)
    .join(", ");

  return { setClause, values: Object.values(data) };
};
