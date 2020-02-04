const formatDates = list => {
  if (list === undefined) return [];
  const listWithUpdatedDates = list.map(article => {
    const freshArticle = { ...article };
    if (freshArticle.created_at) {
      freshArticle.created_at = new Date(freshArticle.created_at);
    }
    return freshArticle;
  });

  return listWithUpdatedDates;
};

const makeRefObj = list => {
  const refObj = {};
  if (!list) return refObj;
  list.forEach(article => {
    refObj[article["title"]] = article["article_id"];
  });

  return refObj;
};

const formatComments = (comments, articleRef) => {
  if (!comments) return [];

  let formattedCommentsArray = comments.map(comment => {
    const newComment = { ...comment };
    newComment.author = newComment.created_by;
    delete newComment.created_by;

    newComment.article_id = articleRef[newComment.belongs_to];
    delete newComment.belongs_to;
    return newComment;
  });

  formattedCommentsArray = formatDates(formattedCommentsArray);

  return formattedCommentsArray;
};

module.exports = { formatDates, makeRefObj, formatComments };
