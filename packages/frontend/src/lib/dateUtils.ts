export const formatDate = (dateString?: string) => {
  if (!dateString) return 'No date available'
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "medium"
  }).format(new Date(dateString));
};