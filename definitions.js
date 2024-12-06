export const wards = {
    'Lisa Meyer': 'Ward 2', 
    'Nick Foster': 'Ward 4', 
    'Valerie Carroll': 'Ward 1', 
    'Roy Lovelady': 'Ward 3', 
    'Donald Waterman': 'Ward 5',
    'Betsy Peters': 'Ward 6'
};

//Depricated rgba values. this format is how we would establish rgb valeus specific to each demographic
// export const RGBAValues = {
//     'Race': ['rgba(30,79,91,.8)', 'rgba(50,130,150,.8)', 'rgba(89,173,200,.8)', 'rgba(116,183,209,.8)', 'rgba(153,211,221,.8)', 'rgba(194,229,235,.8)'],
//     'Age': ['rgba(34,68,23,.8)', 'rgba(51,101,34,.8)', 'rgba(68,142,47,.8)', 'rgba(95,181,60,.8)', 'rgba(124,200,90,.8)', 'rgba(157,213,128,.8)'],
//     'Sex': ['rgba(76,31,25,.8)', 'rgba(110,44,37,.8)', 'rgba(158,60,53,.8)', 'rgba(194,77,72,.8)', 'rgba(212,128,126,.8)', 'rgba(226,176,167,.8)']
// };

export const RGBAValues = [
    'rgba(255, 0, 0, .7)',     
    'rgba(255, 77, 0, .7)',     
    'rgba(255, 127, 0, .7)',     
    'rgba(255, 153, 51, .7)',     
    'rgba(255, 178, 102, .7)',
    'rgba(255, 230, 204, .7)'
     ]

export const DemographicHierarchy = {
    'Black': 'Race',
    'White': 'Race',
    'American Indian and Alaska Native': 'Race',
    'Asian': 'Race',
    'Native Hawaiian and Other Pacific Islander': 'Race',
    'Some Other Race': 'Race',
    'Child': 'Age',
    'Adult': 'Age',
    'Male': 'Sex',
    'Female': 'Sex'
};

export const NAICS_Categories = {
    11: "Agriculture, Forestry, Fishing, and Hunting",
    21: "Mining",
    22: "Utilities",
    23: "Construction",
    31: "Manufacturing",
    32: "Manufacturing",
    33: "Manufacturing",
    42: "Wholesale Trade",
    44: "Retail Trade",
    45: "Retail Trade",
    48: "Transportation and Warehousing",
    49: "Transportation and Warehousing",
    51: "Information",
    52: "Finance and Insurance",
    53: "Real Estate Rental and Leasing",
    54: "Professional, Scientific, and Technical Services",
    55: "Management of Companies and Enterprises",
    56: "Administrative and Support and Waste Management and Remediation Services",
    61: "Educational Services",
    62: "Health Care and Social Assistance",
    71: "Arts, Entertainment, and Recreation",
    72: "Accommodation and Food Services",
    81: "Other Services (except Public Administration)",
    92: "Public Administration",
    0: "Not Classified"
};

export const ImageSources = {
    'race-controls': 'Race-Gradient.png',
    'age-controls': 'Age-Gradient.png',
    'sex-controls': 'Sex-Gradient.png'
}