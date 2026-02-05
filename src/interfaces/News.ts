export interface INews {
  newsId: number;
  newsExternalId: string;
  newsSlug: string;
  newsTitle: string;
  newsDescription: string;
  newsPublishedAt: string;
  newsCreatedAt: string;
  newsKind: string;
  newsSentiment: "positive" | "negative";
}
