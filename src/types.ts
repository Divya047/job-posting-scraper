type Company = {
  Name: string;
  Url: string;
  ClassOfJobTitle: string;
  Postings: Array<string>;
};
type companyPosts = {
  [key: string]: Array<string>;
};

export { Company, companyPosts };
