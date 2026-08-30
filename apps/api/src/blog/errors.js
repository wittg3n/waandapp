import { ApiError } from '../middleware/errors.js';

function validationDetails(issues, source) {
  const fields = {};

  for (const issue of issues) {
    const path = issue.path.join('.') || source;
    fields[path] ??= issue.message;
  }

  return { fields };
}

export function parseBlogInput(schema, input, source) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  throw new ApiError(400, 'BLOG_VALIDATION_ERROR', `The blog ${source} is invalid.`, {
    details: validationDetails(result.error.issues, source),
  });
}

export function blogPostNotFound() {
  return new ApiError(404, 'BLOG_POST_NOT_FOUND', 'The requested blog post was not found.');
}

export function blogCategoryNotFound() {
  return new ApiError(404, 'BLOG_CATEGORY_NOT_FOUND', 'The requested blog category was not found.');
}
