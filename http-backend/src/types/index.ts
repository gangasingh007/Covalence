export interface regestraionSchema {
    firstName : string,
    lastName : string,
    password : string,
    email : string,
    course : courserType,
    semester : sectionType,
    section : semesterType    
}


enum courserType { 
    "Btech",
    "Mtech"
}

enum sectionType{
    "A",
    "B",
    "C",
    "CE"
}

enum semesterType{
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Eighth"  
}