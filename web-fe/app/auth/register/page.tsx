"use client"

import { useState } from "react"

type RegisterType = {
    firstName: string
    lastName: string
    email: string
    password: string
    section: Section
    course: Course
    semester: Semester
}

enum Course {
    "Btech",
    "Mtech"
}

enum Semester {
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth"
}

enum Section {
  "A",
  "B",
  "C",
  "D",
  "CE",
}

function Register() {
    const [firstName, setfirstName] = useState<string>("")
    const [lastName, setlastName] = useState<string>("")
    const [email, setemail] = useState<string>("")
    const [password, setpassword] = useState<string>("")
    const [section, setsection] = useState<string>("")
    const [course, setcourse] = useState<string>("")
    const [semester, setsemester] = useState<string>("")
  return (
    <div className="flex justify-center items-center h-screen">
      User Register
    </div>
  )
}

export default Register