import {
  parseArchiveQuery,
  parsePostsQuery,
  parseSearchQuery,
  parseSlugParams,
} from './validation.js';

function send(response, data) {
  response.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  response.json({ data });
}

export function createBlogControllers(service) {
  return {
    async listPosts(request, response) {
      send(response, await service.listPosts(parsePostsQuery(request.query)));
    },
    async getPost(request, response) {
      send(response, await service.getPost(parseSlugParams(request.params).slug));
    },
    async listCategories(_request, response) {
      send(response, await service.listCategories());
    },
    async listTags(_request, response) {
      send(response, await service.listTags());
    },
    async listCategoryPosts(request, response) {
      send(
        response,
        await service.listCategoryPosts(
          parseSlugParams(request.params).slug,
          parseArchiveQuery(request.query),
        ),
      );
    },
    async listTagPosts(request, response) {
      send(
        response,
        await service.listTagPosts(
          parseSlugParams(request.params).slug,
          parseArchiveQuery(request.query),
        ),
      );
    },
    async listAuthorPosts(request, response) {
      send(
        response,
        await service.listAuthorPosts(
          parseSlugParams(request.params).slug,
          parseArchiveQuery(request.query),
        ),
      );
    },
    async search(request, response) {
      send(response, await service.search(parseSearchQuery(request.query)));
    },
  };
}
