export const formatDate = (dateString?: string) => {
  const date = dateString || Date.now()
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "medium"
  }).format(new Date(date));
};