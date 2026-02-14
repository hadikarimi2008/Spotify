export const POPULAR_ARTISTS = {
  international: [
    "The Weeknd", "Billie Eilish", "Drake", "Taylor Swift", "Ed Sheeran",
    "Ariana Grande", "Post Malone", "Dua Lipa", "Justin Bieber", "The Weeknd",
    "Bad Bunny", "Travis Scott", "Eminem", "Kanye West", "Kendrick Lamar",
    "Bruno Mars", "Adele", "Rihanna", "Beyoncé", "Coldplay",
    "Imagine Dragons", "Maroon 5", "OneRepublic", "The Chainsmokers", "Calvin Harris",
    "David Guetta", "Martin Garrix", "Avicii", "Skrillex", "Deadmau5",
    "Daft Punk", "Swedish House Mafia", "Armin van Buuren", "Tiësto", "Hardwell",
    "Marshmello", "Alan Walker", "Kygo", "Zedd", "The Prodigy",
    "Linkin Park", "Green Day", "Red Hot Chili Peppers", "Foo Fighters", "Nirvana",
    "Metallica", "AC/DC", "Queen", "The Beatles", "Pink Floyd",
    "Led Zeppelin", "The Rolling Stones", "U2", "Radiohead", "Arctic Monkeys",
    "The Killers", "Muse", "Arcade Fire", "The Strokes", "Interpol",
    "Tame Impala", "Glass Animals", "Twenty One Pilots", "Panic! At The Disco", "Fall Out Boy",
    "My Chemical Romance", "Paramore", "Blink-182", "Sum 41", "Green Day",
    "System of a Down", "Rage Against the Machine", "Tool", "Deftones", "Slipknot",
    "Slayer", "Megadeth", "Iron Maiden", "Black Sabbath", "Judas Priest",
    "Motorhead", "Deep Purple", "Rainbow", "Dio", "Sabbath",
    "Ozzy Osbourne", "Ronnie James Dio", "Rob Halford", "Bruce Dickinson", "James Hetfield",
    "Lars Ulrich", "Kirk Hammett", "Robert Trujillo", "Cliff Burton", "Jason Newsted"
  ],
  iranian: [
    "Ebi", "Googoosh", "Hayedeh", "Moein", "Shadmehr Aghili",
    "Mohsen Yeganeh", "Reza Sadeghi", "Mohsen Chavoshi", "Farshid Amin", "Siavash Ghomayshi",
    "Andy Madadian", "Shahram Shabpareh", "Kourosh Yaghmaei", "Farhad Mehrad", "Fereydoun Farrokhzad",
    "Sattar", "Dariush", "Hassan Shamaizadeh", "Iraj", "Hedayat",
    "Mohammad Reza Shajarian", "Shahram Nazeri", "Hossein Alizadeh", "Kayhan Kalhor", "Ali Akbar Moradi",
    "Mohammad Reza Lotfi", "Parviz Meshkatian", "Jalal Zolfonun", "Hossein Omoumi", "Dariush Talai",
    "Reza Vali", "Hamid Motebassem", "Majid Derakhshani", "Kourosh Zolani", "Mohammad Reza Darvishi",
    "Behnam Bani", "Mohsen Namjoo", "Hamed Nikpay", "Siavash Ghomayshi", "Mohammad Esfahani",
    "Reza Bahram", "Saeed Mohammadi", "Hamed Behdad", "Amir Tataloo", "Reza Pishro",
    "Sogand", "Mohsen Ebrahimzadeh", "Hamed Homayoun", "Sirvan Khosravi", "Mehdi Yarrahi",
    "Reza Sadeghi", "Mohsen Chavoshi", "Farshid Amin", "Siavash Ghomayshi", "Andy Madadian",
    "Shahram Shabpareh", "Kourosh Yaghmaei", "Farhad Mehrad", "Fereydoun Farrokhzad", "Sattar",
    "Dariush", "Hassan Shamaizadeh", "Iraj", "Hedayat", "Mohammad Reza Shajarian",
    "Shahram Nazeri", "Hossein Alizadeh", "Kayhan Kalhor", "Ali Akbar Moradi", "Mohammad Reza Lotfi",
    "Parviz Meshkatian", "Jalal Zolfonun", "Hossein Omoumi", "Dariush Talai", "Reza Vali",
    "Hamid Motebassem", "Majid Derakhshani", "Kourosh Zolani", "Mohammad Reza Darvishi", "Behnam Bani",
    "Mohsen Namjoo", "Hamed Nikpay", "Siavash Ghomayshi", "Mohammad Esfahani", "Reza Bahram",
    "Saeed Mohammadi", "Hamed Behdad", "Amir Tataloo", "Reza Pishro", "Sogand",
    "Mohsen Ebrahimzadeh", "Hamed Homayoun", "Sirvan Khosravi", "Mehdi Yarrahi", "Reza Sadeghi"
  ]
};

export const getAllArtists = () => {
  return [...POPULAR_ARTISTS.international, ...POPULAR_ARTISTS.iranian].sort();
};

