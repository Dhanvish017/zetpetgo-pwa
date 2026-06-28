// ===============================
// Helper Function
// ===============================

const enhanceBreeds = (breeds) => {
    const extraOptions = [
        { label: "Indie (Desi)", value: "Indie (Desi)" },
        { label: "Mixed Breed", value: "Mixed Breed" },
        { label: "Other", value: "Other" },
    ];

    const sorted = breeds.sort((a, b) =>
        a.label.localeCompare(b.label)
    );

    return [...sorted, ...extraOptions];
};

// ===============================
// 🐶 DOG BREEDS (Expanded List)
// ===============================

const dogBreedsRaw = [
    "Affenpinscher",
    "Afghan Hound",
    "Airedale Terrier",
    "Akita",
    "Alaskan Malamute",
    "American Bulldog",
    "American Cocker Spaniel",
    "American Eskimo Dog",
    "American Pit Bull Terrier",
    "Australian Cattle Dog",
    "Australian Shepherd",
    "Basenji",
    "Basset Hound",
    "Beagle",
    "Belgian Malinois",
    "Bernese Mountain Dog",
    "Bichon Frise",
    "Border Collie",
    "Boston Terrier",
    "Boxer",
    "Bulldog",
    "Bullmastiff",
    "Cane Corso",
    "Cavalier King Charles Spaniel",
    "Chihuahua",
    "Chow Chow",
    "Cocker Spaniel",
    "Collie",
    "Dachshund",
    "Dalmatian",
    "Doberman",
    "Dogo Argentino",
    "English Setter",
    "English Springer Spaniel",
    "French Bulldog",
    "German Shepherd",
    "Golden Retriever",
    "Great Dane",
    "Great Pyrenees",
    "Greyhound",
    "Havanese",
    "Indian Pariah Dog",
    "Irish Setter",
    "Jack Russell Terrier",
    "Kangal",
    "Labrador Retriever",
    "Lhasa Apso",
    "Maltese",
    "Miniature Pinscher",
    "Newfoundland",
    "Pekingese",
    "Pit Bull",
    "Pomeranian",
    "Poodle",
    "Pug",
    "Rottweiler",
    "Saint Bernard",
    "Samoyed",
    "Shiba Inu",
    "Shih Tzu",
    "Siberian Husky",
    "Staffordshire Bull Terrier",
    "Weimaraner",
    "Whippet",
    "Yorkshire Terrier"
].map((breed) => ({
    label: breed,
    value: breed,
}));

// ===============================
// 🐱 CAT BREEDS (Expanded List)
// ===============================

const catBreedsRaw = [
    "Abyssinian",
    "American Bobtail",
    "American Curl",
    "American Shorthair",
    "American Wirehair",
    "Balinese",
    "Bengal",
    "Birman",
    "Bombay",
    "British Shorthair",
    "Burmese",
    "Chartreux",
    "Cornish Rex",
    "Devon Rex",
    "Egyptian Mau",
    "Exotic Shorthair",
    "Himalayan",
    "Japanese Bobtail",
    "Maine Coon",
    "Manx",
    "Norwegian Forest Cat",
    "Ocicat",
    "Oriental Shorthair",
    "Persian",
    "Ragdoll",
    "Russian Blue",
    "Scottish Fold",
    "Siamese",
    "Siberian",
    "Singapura",
    "Somali",
    "Sphynx",
    "Tonkinese",
    "Turkish Angora",
    "Turkish Van"
].map((breed) => ({
    label: breed,
    value: breed,
}));

// ===============================
// Final Exports
// ===============================

export const dogBreeds = enhanceBreeds(dogBreedsRaw);
export const catBreeds = enhanceBreeds(catBreedsRaw);

export const allBreeds = {
    Dog: dogBreeds,
    Cat: catBreeds,
};
