export const CreatorCategoryEnum = [
    "Art",
    "Music",
    "Cinema",
    "Fashion",
    "Sports",
    "Comedy",
    "Gaming",
    "Influencer",
    "other"
  ] as const
  
  export type CreatorCategory = (typeof CreatorCategoryEnum)[number]